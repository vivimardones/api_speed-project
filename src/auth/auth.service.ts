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
import { db, auth } from '../firebase.config';
import { RegisterAdultoDto, RegisterAdolescenteDto, LoginDto } from './dto';
import {
  RegisterAdultoResponse,
  RegisterAdolescenteResponse,
  LoginResponse,
} from './interfaces';
import { EdadService } from '../shared/edad.service';
import { RutService } from '../shared/rut.service';
import { TipoIdentificador } from '../usuarios/dto';

@Injectable()
export class AuthService {
  private readonly loginsCollection = 'logins';
  private readonly usuariosCollection = 'usuarios';
  private readonly apoderadosDeportistasCollection = 'apoderados_deportistas';

  constructor(
    private readonly edadService: EdadService,
    private readonly rutService: RutService,
  ) {}

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
   * Registrar un adulto (>= 18 años)
   */
  async registerAdulto(
    registerAdultoDto: RegisterAdultoDto,
  ): Promise<RegisterAdultoResponse> {
    // 1. Validar fecha de nacimiento
    if (!this.edadService.esFechaValida(registerAdultoDto.fechaNacimiento)) {
      throw new BadRequestException('La fecha de nacimiento no es válida');
    }

    // 2. Calcular edad
    const edad = this.edadService.calcularEdad(
      registerAdultoDto.fechaNacimiento,
    );

    // 3. Validar que sea mayor de 18 años
    if (edad < 18) {
      throw new BadRequestException(
        'Debe ser mayor de 18 años para registrarse como adulto. Use el endpoint /auth/register-adolescente',
      );
    }

    // 4. Validar RUT si aplica
    if (
      registerAdultoDto.tipoIdentificador === TipoIdentificador.RUT ||
      registerAdultoDto.tipoIdentificador === TipoIdentificador.RUT_PROVISORIO
    ) {
      const rutCompleto = registerAdultoDto.numeroIdentificador;

      if (!this.rutService.validarRut(rutCompleto)) {
        throw new BadRequestException(
          'El RUT ingresado no es válido. Verifica el número y el dígito verificador.',
        );
      }

      registerAdultoDto.numeroIdentificador =
        this.rutService.limpiarRut(rutCompleto);
    }

    // 5. Validar formato de identificador
    if (
      !this.rutService.esIdentificadorValido(
        registerAdultoDto.tipoIdentificador,
        registerAdultoDto.numeroIdentificador,
      )
    ) {
      throw new BadRequestException(
        `El formato del identificador no es válido para el tipo ${registerAdultoDto.tipoIdentificador}`,
      );
    }

    // 6. Verificar que el correo no exista
    await this.verificarCorreoUnico(registerAdultoDto.correo);

    // 7. Verificar que el identificador no exista
    await this.verificarIdentificadorUnico(
      registerAdultoDto.tipoIdentificador,
      registerAdultoDto.numeroIdentificador,
    );

    // 8. Verificar que el teléfono no exista
    await this.verificarTelefonoUnico(registerAdultoDto.telefono);

    try {
      // 9. Crear usuario en Firebase Auth
      const firebaseUser = await createUserWithEmailAndPassword(
        auth,
        registerAdultoDto.correo,
        registerAdultoDto.password,
      );

      // 10. Enviar correo de verificación
      await sendEmailVerification(firebaseUser.user);

      // 11. Crear documento en logins
      const loginDocRef = await addDoc(collection(db, this.loginsCollection), {
        firebaseUid: firebaseUser.user.uid,
        correo: registerAdultoDto.correo,
        usuarioId: null, // Se actualizará después
        ultimoAcceso: null,
        intentosFallidos: 0,
        bloqueado: false,
        verificado: false,
        tokenRecuperacion: null,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      // 12. Crear documento en usuarios
      const usuarioDocRef = await addDoc(
        collection(db, this.usuariosCollection),
        {
          loginId: loginDocRef.id,
          primerNombre: registerAdultoDto.primerNombre,
          segundoNombre: registerAdultoDto.segundoNombre || null,
          tercerNombre: registerAdultoDto.tercerNombre || null,
          apellidoPaterno: registerAdultoDto.apellidoPaterno,
          apellidoMaterno: registerAdultoDto.apellidoMaterno,
          fechaNacimiento: registerAdultoDto.fechaNacimiento,
          sexo: registerAdultoDto.sexo,
          tipoIdentificador: registerAdultoDto.tipoIdentificador,
          numeroIdentificador: registerAdultoDto.numeroIdentificador,
          telefono: registerAdultoDto.telefono,
          telefonoEmergencia: registerAdultoDto.telefonoEmergencia || null,
          estado: 'activo',
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        },
      );

      // 13. Actualizar login con usuarioId
      await updateDoc(doc(db, this.loginsCollection, loginDocRef.id), {
        usuarioId: usuarioDocRef.id,
        updatedAt: Timestamp.now(),
      });

      return {
        success: true,
        message:
          'Adulto registrado exitosamente. Por favor verifica tu correo electrónico.',
        usuarioId: usuarioDocRef.id,
        loginId: loginDocRef.id,
        firebaseUid: firebaseUser.user.uid,
        edad: edad,
        verificacionEnviada: true,
      };
    } catch (error: unknown) {
      // Manejar errores de Firebase Auth
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
   * Registrar un adolescente (10-17 años)
   */
  async registerAdolescente(
    registerAdolescenteDto: RegisterAdolescenteDto,
  ): Promise<RegisterAdolescenteResponse> {
    // 1. Validar fecha de nacimiento
    if (
      !this.edadService.esFechaValida(registerAdolescenteDto.fechaNacimiento)
    ) {
      throw new BadRequestException('La fecha de nacimiento no es válida');
    }

    // 2. Calcular edad
    const edad = this.edadService.calcularEdad(
      registerAdolescenteDto.fechaNacimiento,
    );

    // 3. Validar que tenga entre 10 y 17 años
    if (edad < 10) {
      throw new BadRequestException(
        'Los menores de 10 años deben ser registrados por su apoderado usando el endpoint /usuarios',
      );
    }

    if (edad >= 18) {
      throw new BadRequestException(
        'Debe ser menor de 18 años para usar este endpoint. Use /auth/register-adulto',
      );
    }

    // 4. Validar RUT si aplica
    if (
      registerAdolescenteDto.tipoIdentificador === TipoIdentificador.RUT ||
      registerAdolescenteDto.tipoIdentificador ===
        TipoIdentificador.RUT_PROVISORIO
    ) {
      const rutCompleto = registerAdolescenteDto.numeroIdentificador;

      if (!this.rutService.validarRut(rutCompleto)) {
        throw new BadRequestException(
          'El RUT ingresado no es válido. Verifica el número y el dígito verificador.',
        );
      }

      registerAdolescenteDto.numeroIdentificador =
        this.rutService.limpiarRut(rutCompleto);
    }

    // 5. Validar formato de identificador
    if (
      !this.rutService.esIdentificadorValido(
        registerAdolescenteDto.tipoIdentificador,
        registerAdolescenteDto.numeroIdentificador,
      )
    ) {
      throw new BadRequestException(
        `El formato del identificador no es válido para el tipo ${registerAdolescenteDto.tipoIdentificador}`,
      );
    }

    // 6. Verificar que el identificador no exista
    await this.verificarIdentificadorUnico(
      registerAdolescenteDto.tipoIdentificador,
      registerAdolescenteDto.numeroIdentificador,
    );

    // 7. Verificar que el teléfono no exista
    await this.verificarTelefonoUnico(registerAdolescenteDto.telefono);

    // 8. Si tiene correo/password, validar ambos
    const tieneCredenciales =
      registerAdolescenteDto.correo && registerAdolescenteDto.password;

    if (registerAdolescenteDto.correo && !registerAdolescenteDto.password) {
      throw new BadRequestException(
        'Si proporciona un correo, debe proporcionar también una contraseña',
      );
    }

    if (registerAdolescenteDto.password && !registerAdolescenteDto.correo) {
      throw new BadRequestException(
        'Si proporciona una contraseña, debe proporcionar también un correo',
      );
    }

    // 9. Si tiene correo, verificar que no exista
    if (tieneCredenciales) {
      await this.verificarCorreoUnico(registerAdolescenteDto.correo!);
    }

    // 10. Si tiene apoderado, verificar que exista
    if (registerAdolescenteDto.apoderadoId) {
      await this.verificarApoderadoValido(registerAdolescenteDto.apoderadoId);
    }

    try {
      let loginId: string | null = null;
      let firebaseUid: string | null = null;

      // 11. Si tiene correo/password, crear en Firebase Auth y logins
      if (tieneCredenciales) {
        const firebaseUser = await createUserWithEmailAndPassword(
          auth,
          registerAdolescenteDto.correo!,
          registerAdolescenteDto.password!,
        );

        await sendEmailVerification(firebaseUser.user);

        const loginDocRef = await addDoc(
          collection(db, this.loginsCollection),
          {
            firebaseUid: firebaseUser.user.uid,
            correo: registerAdolescenteDto.correo,
            usuarioId: null,
            ultimoAcceso: null,
            intentosFallidos: 0,
            bloqueado: false,
            verificado: false,
            tokenRecuperacion: null,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          },
        );

        loginId = loginDocRef.id;
        firebaseUid = firebaseUser.user.uid;
      }

      // 12. Crear documento en usuarios
      const usuarioDocRef = await addDoc(
        collection(db, this.usuariosCollection),
        {
          loginId: loginId,
          primerNombre: registerAdolescenteDto.primerNombre,
          segundoNombre: registerAdolescenteDto.segundoNombre || null,
          tercerNombre: registerAdolescenteDto.tercerNombre || null,
          apellidoPaterno: registerAdolescenteDto.apellidoPaterno,
          apellidoMaterno: registerAdolescenteDto.apellidoMaterno,
          fechaNacimiento: registerAdolescenteDto.fechaNacimiento,
          sexo: registerAdolescenteDto.sexo,
          tipoIdentificador: registerAdolescenteDto.tipoIdentificador,
          numeroIdentificador: registerAdolescenteDto.numeroIdentificador,
          telefono: registerAdolescenteDto.telefono,
          telefonoEmergencia: registerAdolescenteDto.telefonoEmergencia || null,
          estado: 'activo',
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        },
      );

      // 13. Si se creó login, actualizar con usuarioId
      if (loginId) {
        await updateDoc(doc(db, this.loginsCollection, loginId), {
          usuarioId: usuarioDocRef.id,
          updatedAt: Timestamp.now(),
        });
      }

      // 14. Si tiene apoderado, crear relación
      if (registerAdolescenteDto.apoderadoId) {
        await addDoc(collection(db, this.apoderadosDeportistasCollection), {
          apoderadoId: registerAdolescenteDto.apoderadoId,
          deportistaId: usuarioDocRef.id,
          createdAt: Timestamp.now(),
        });
      }

      // 15. Construir respuesta
      const response: RegisterAdolescenteResponse = {
        success: true,
        message: 'Adolescente registrado exitosamente.',
        usuarioId: usuarioDocRef.id,
        edad: edad,
        tieneLogin: !!loginId,
        tieneApoderado: !!registerAdolescenteDto.apoderadoId,
      };

      if (loginId) {
        response.loginId = loginId;
        response.firebaseUid = firebaseUid ?? undefined;
        response.verificacionEnviada = true;
        response.message += ' Por favor verifica tu correo electrónico.';
      }

      if (!registerAdolescenteDto.apoderadoId) {
        response.advertencia =
          'Este usuario es menor de edad y debería tener un apoderado asignado.';
      }

      return response;
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
        'Error al registrar el adolescente: ' + this.getErrorMessage(error),
      );
    }
  }

  /**
   * Iniciar sesión
   */
  async login(loginDto: LoginDto): Promise<LoginResponse> {
    try {
      // 1. Autenticar con Firebase
      const userCredential = await signInWithEmailAndPassword(
        auth,
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

      // 6. Obtener token de Firebase
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
   * Verificar que el teléfono no exista
   */
  private async verificarTelefonoUnico(telefono: string): Promise<void> {
    const usuariosRef = collection(db, this.usuariosCollection);
    const q = query(usuariosRef, where('telefono', '==', telefono));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      throw new ConflictException('El teléfono ya está registrado');
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
