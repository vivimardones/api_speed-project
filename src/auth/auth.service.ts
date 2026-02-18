// Ruta: src/auth/auth.service.ts

import {
  Injectable,
  BadRequestException,
  ConflictException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { Rol } from './enums';
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  Timestamp,
  getDoc,
} from 'firebase/firestore';
import { db, clientAuth } from '../firebase.config';
import { LoginDto, RegisterDto } from './dto';
import { LoginResponse } from './interfaces/auth-response.interface';
import { RegisterResponse } from './interfaces/register-response.interface';
import { EdadService } from '../shared/edad.service';
import { RutService } from '../shared/rut.service';
import { TipoIdentificador } from '../usuarios/dto';

@Injectable()
export class AuthService {
  private readonly loginsCollection = 'logins';
  private readonly usuariosCollection = 'usuarios';
  private readonly usuarioRolesCollection = 'usuario_roles';

  constructor(
    private readonly edadService: EdadService,
    private readonly rutService: RutService,
  ) {}

  async register(registerDto: RegisterDto): Promise<RegisterResponse> {
    // 1. Validar fecha de nacimiento
    if (!this.edadService.esFechaValida(registerDto.fechaNacimiento)) {
      throw new BadRequestException('La fecha de nacimiento no es válida');
    }

    // 2. Calcular edad
    const edad = this.edadService.calcularEdad(registerDto.fechaNacimiento);

    // 3. Validar edad mínima
    if (edad < 10) {
      throw new BadRequestException(
        'Los menores de 10 años deben ser inscritos por su apoderado.',
      );
    }

    // 4. Validar identificador (RUT/cédula) si aplica
    if (
      registerDto.tipoIdentificador === TipoIdentificador.RUT ||
      registerDto.tipoIdentificador === TipoIdentificador.RUT_PROVISORIO
    ) {
      const rutCompleto = registerDto.numeroIdentificador;

      if (!this.rutService.validarRut(rutCompleto)) {
        throw new BadRequestException(
          'El RUT ingresado no es válido. Verifica el número y el dígito verificador.',
        );
      }
      registerDto.numeroIdentificador = this.rutService.limpiarRut(rutCompleto);
    }

    // 5. Validar formato de identificador
    if (
      !this.rutService.esIdentificadorValido(
        registerDto.tipoIdentificador,
        registerDto.numeroIdentificador,
      )
    ) {
      throw new BadRequestException(
        `El formato del identificador no es válido para el tipo ${registerDto.tipoIdentificador}`,
      );
    }

    // 6. Verificar que el correo no exista
    await this.verificarCorreoUnico(registerDto.correo);

    // 7. Verificar identificador único
    await this.verificarIdentificadorUnico(
      registerDto.tipoIdentificador,
      registerDto.numeroIdentificador,
    );

    try {
      // 9. Crear usuario en Firebase Auth
      const firebaseUser = await createUserWithEmailAndPassword(
        clientAuth,
        registerDto.correo,
        registerDto.password,
      );

      // 10. Enviar correo de verificación
      await sendEmailVerification(firebaseUser.user);

      // 11. Crear documento en logins
      const loginDocRef = await addDoc(collection(db, this.loginsCollection), {
        firebaseUid: firebaseUser.user.uid,
        correo: registerDto.correo,
        usuarioId: null, // Se actualizará después
        ultimoAcceso: null,
        intentosFallidos: 0,
        bloqueado: false,
        verificado: false,
        tokenRecuperacion: null,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      // 12. Crear documento en usuarios (rol SIEMPRE USUARIO)
      const usuarioDocRef = await addDoc(
        collection(db, this.usuariosCollection),
        {
          loginId: loginDocRef.id,
          primerNombre: registerDto.primerNombre,
          segundoNombre: registerDto.segundoNombre || null,
          tercerNombre: registerDto.tercerNombre || null,
          apellidoPaterno: registerDto.apellidoPaterno,
          apellidoMaterno: registerDto.apellidoMaterno,
          fechaNacimiento: registerDto.fechaNacimiento,
          sexo: registerDto.sexo,
          tipoIdentificador: registerDto.tipoIdentificador,
          numeroIdentificador: registerDto.numeroIdentificador,
          telefono: registerDto.telefono,
          telefonoEmergencia: registerDto.telefonoEmergencia || null,
          estado: 'activo',
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        },
      );

      // 13. Si se creó login, actualizar con usuarioId
      await updateDoc(doc(db, this.loginsCollection, loginDocRef.id), {
        usuarioId: usuarioDocRef.id,
        updatedAt: Timestamp.now(),
      });

      // 14. Rol inicial: USUARIO
      await this.asignarRoles(usuarioDocRef.id, [Rol.USUARIO]);

      // 15. Retornar respuesta estándar (ajusta el response si quieres devolver más datos)
      return {
        success: true,
        message:
          'Usuario registrado correctamente. Por favor verifica tu correo electrónico.',
        usuarioId: usuarioDocRef.id,
        loginId: loginDocRef.id,
        firebaseUid: firebaseUser.user.uid,
        edad: edad,
        verificacionEnviada: true,
        roles: [Rol.USUARIO],
      };
    } catch (error: unknown) {
      if (error instanceof FirebaseError) {
        if (error.code === 'auth/email-already-in-use') {
          throw new ConflictException('El correo ya está registrado');
        }
        if (error.code === 'auth/weak-password') {
          throw new BadRequestException('La contraseña es muy débil');
        }
        if (error.code === 'auth/invalid-email') {
          throw new BadRequestException('El formato del correo no es válido');
        }
      }
      throw new InternalServerErrorException(
        'Error al registrar el usuario: ' + this.getErrorMessage(error),
      );
    }
  }

  /**
   * Asignar roles a un usuario
   */
  private async asignarRoles(usuarioId: string, roles: Rol[]): Promise<void> {
    const rolesPromises = roles.map((rol) =>
      addDoc(collection(db, this.usuarioRolesCollection), {
        usuarioId: usuarioId,
        rol: rol,
        activo: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      }),
    );

    await Promise.all(rolesPromises);
  }

  /**
   * Obtener roles de un usuario
   */
  private async obtenerRoles(usuarioId: string): Promise<Rol[]> {
    const rolesRef = collection(db, this.usuarioRolesCollection);
    const q = query(
      rolesRef,
      where('usuarioId', '==', usuarioId),
      where('activo', '==', true),
    );
    const rolesSnapshot = await getDocs(q);

    return rolesSnapshot.docs.map((doc) => doc.data()['rol'] as Rol);
  }

  /**
   * Asignar rol de apoderado a un usuario si no lo tiene
   */
  private async asignarRolApoderado(apoderadoId: string): Promise<void> {
    // Verificar si ya tiene el rol de apoderado
    const rolesRef = collection(db, this.usuarioRolesCollection);
    const q = query(
      rolesRef,
      where('usuarioId', '==', apoderadoId),
      where('rol', '==', Rol.APODERADO),
      where('activo', '==', true),
    );
    const rolesSnapshot = await getDocs(q);

    // Si no tiene el rol, asignarlo
    if (rolesSnapshot.empty) {
      await addDoc(collection(db, this.usuarioRolesCollection), {
        usuarioId: apoderadoId,
        rol: Rol.APODERADO,
        activo: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    }
  }

  /**
   * Obtener mensaje de error de forma segura
   */
  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    return 'Error desconocido';
  }

  /**
   * Iniciar sesión
   */
  async login(loginDto: LoginDto): Promise<LoginResponse> {
    try {
      // 1. Autenticar con Firebase
      const userCredential = await signInWithEmailAndPassword(
        clientAuth,
        loginDto.correo,
        loginDto.password,
      );

      // 2. Buscar el login en la base de datos
      const loginsRef = collection(db, this.loginsCollection);
      const q = query(
        loginsRef,
        where('firebaseUid', '==', userCredential.user.uid),
      );
      const loginSnapshot = await getDocs(q);

      if (loginSnapshot.empty) {
        throw new UnauthorizedException(
          'No se encontró el usuario en el sistema',
        );
      }

      const loginDoc = loginSnapshot.docs[0];
      const loginData = loginDoc.data() as {
        firebaseUid: string;
        correo: string;
        usuarioId: string;
        ultimoAcceso: Timestamp | null;
        intentosFallidos: number;
        bloqueado: boolean;
        verificado: boolean;
        tokenRecuperacion: string | null;
        createdAt: Timestamp;
        updatedAt: Timestamp;
      };

      // 3. Verificar si está bloqueado
      if (loginData.bloqueado) {
        throw new UnauthorizedException(
          'Esta cuenta ha sido bloqueada. Contacte al administrador.',
        );
      }

      // 4. Actualizar último acceso y resetear intentos fallidos
      await updateDoc(doc(db, this.loginsCollection, loginDoc.id), {
        ultimoAcceso: Timestamp.now(),
        intentosFallidos: 0,
        updatedAt: Timestamp.now(),
      });

      // 5. Obtener datos del usuario
      const usuarioDoc = await getDoc(
        doc(db, this.usuariosCollection, loginData.usuarioId),
      );

      if (!usuarioDoc.exists()) {
        throw new UnauthorizedException('Usuario no encontrado');
      }

      const usuarioData = usuarioDoc.data() as {
        loginId: string | null;
        primerNombre: string;
        segundoNombre: string | null;
        tercerNombre: string | null;
        apellidoPaterno: string;
        apellidoMaterno: string;
        fechaNacimiento: string;
        sexo: string;
        tipoIdentificador: string;
        numeroIdentificador: string;
        telefono: string;
        telefonoEmergencia: string | null;
        estado: string;
        createdAt: Timestamp;
        updatedAt: Timestamp;
      };

      // 6. Obtener roles del usuario
      const roles = await this.obtenerRoles(loginData.usuarioId);

      // 7. Obtener token de Firebase
      const token = await userCredential.user.getIdToken();

      return {
        success: true,
        message: 'Inicio de sesión exitoso',
        token: token,
        usuario: {
          id: usuarioDoc.id,
          loginId: loginDoc.id,
          correo: loginData.correo,
          primerNombre: usuarioData.primerNombre,
          apellidoPaterno: usuarioData.apellidoPaterno,
          verificado: loginData.verificado,
          roles: roles, // ← AGREGAR
        },
      };
    } catch (error: unknown) {
      if (error instanceof FirebaseError) {
        if (
          error.code === 'auth/user-not-found' ||
          error.code === 'auth/wrong-password' ||
          error.code === 'auth/invalid-credential'
        ) {
          throw new UnauthorizedException('Correo o contraseña incorrectos');
        }
      }

      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Error al iniciar sesión: ' + this.getErrorMessage(error),
      );
    }
  }

  // ========== MÉTODOS AUXILIARES ==========

  /**
   * Verificar que el correo no exista
   */
  private async verificarCorreoUnico(correo: string): Promise<void> {
    const loginsRef = collection(db, this.loginsCollection);
    const q = query(loginsRef, where('correo', '==', correo));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      throw new ConflictException('El correo ya está registrado');
    }
  }

  /**
   * Verificar que el identificador no exista
   */
  private async verificarIdentificadorUnico(
    tipoIdentificador: string,
    numeroIdentificador: string,
  ): Promise<void> {
    const usuariosRef = collection(db, this.usuariosCollection);
    const q = query(
      usuariosRef,
      where('tipoIdentificador', '==', tipoIdentificador),
      where('numeroIdentificador', '==', numeroIdentificador),
    );
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      throw new ConflictException(
        `Ya existe un usuario con el ${tipoIdentificador}: ${numeroIdentificador}`,
      );
    }
  }

  /**
   * Verificar que el apoderado existe y es mayor de 18 años
   */
  private async verificarApoderadoValido(apoderadoId: string): Promise<void> {
    const apoderadoDoc = await getDoc(
      doc(db, this.usuariosCollection, apoderadoId),
    );

    if (!apoderadoDoc.exists()) {
      throw new BadRequestException(
        'El apoderado especificado no existe en el sistema',
      );
    }

    const apoderadoData = apoderadoDoc.data();
    // Validar que tenga fecha de nacimiento
    if (!apoderadoData || !apoderadoData['fechaNacimiento']) {
      throw new BadRequestException(
        'El apoderado no tiene fecha de nacimiento registrada',
      );
    }
    const fechaNacimiento = String(apoderadoData['fechaNacimiento']);
    const edadApoderado = this.edadService.calcularEdad(fechaNacimiento);

    if (edadApoderado < 18) {
      throw new BadRequestException('El apoderado debe ser mayor de 18 años');
    }
  }
}
