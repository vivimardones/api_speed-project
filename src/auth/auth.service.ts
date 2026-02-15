/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { LoginDto } from './loginDto';
import { RegisterUserDto } from './registerUserDto';
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';
import { UsuariosService } from '../usuarios/usuarios.service';
import { db } from '../firebase.config';
import { EdadService } from '../shared/edad.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly edadService: EdadService, // ← NUEVO
  ) {}

  /**
   * Iniciar sesión
   */
  async login(dto: LoginDto) {
    // Buscar usuario en colección login por correo
    const loginCollection = collection(db, 'login');
    const q = query(loginCollection, where('correo', '==', dto.correo));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    const loginDoc = snapshot.docs[0];
    const loginData: any = loginDoc.data();

    // Validar contraseña
    const isPasswordValid = await bcrypt.compare(
      dto.password,
      loginData.password as string,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Contraseña incorrecta');
    }

    // Validar estado
    if (loginData.estado === 'inactivo') {
      throw new UnauthorizedException(
        'Tu cuenta está inactiva. Por favor contacta al dirigente.',
      );
    }

    // Calcular edad actual
    const edad = this.edadService.calcularEdad(loginData.fechaNacimiento);

    // Verificar si cumplió 18 años y liberar apoderado
    if (edad >= 18 && loginData.requiereApoderado) {
      // TODO: Aquí se ejecutará la liberación automática
      // Por ahora solo devolvemos info
    }

    // Retornar datos del usuario autenticado
    return {
      id: loginDoc.id,
      correo: loginData.correo,
      fechaNacimiento: loginData.fechaNacimiento,
      rol: loginData.rol,
      edad: edad,
      requiereApoderado: edad < 18,
      timestamp: new Date(),
    };
  }

  /**
   * Registrar un nuevo login (solo mayores de 10 años)
   */
  async register(dto: RegisterUserDto) {
    // Validar que los campos estén completos
    if (!dto.correo || !dto.password || !dto.fechaNacimiento) {
      throw new BadRequestException('Todos los campos son obligatorios');
    }

    // Validar formato de fecha
    if (!this.edadService.esFechaValida(dto.fechaNacimiento)) {
      throw new BadRequestException('La fecha de nacimiento no es válida');
    }

    // Calcular edad
    const edad = this.edadService.calcularEdad(dto.fechaNacimiento);

    // REGLA: Menores de 10 años NO pueden crear login
    if (edad < 10) {
      throw new BadRequestException(
        'Los menores de 10 años no pueden crear un login. Deben ser registrados por su apoderado.',
      );
    }

    // Verificar correo único en la colección login
    const loginCollection = collection(db, 'login');
    const q = query(loginCollection, where('correo', '==', dto.correo));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      throw new BadRequestException('El correo ya está registrado');
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Crear login con rol 'standard' por defecto
    const nuevoLogin = {
      correo: dto.correo,
      password: hashedPassword,
      fechaNacimiento: dto.fechaNacimiento,
      rol: 'standard', // ← Se asigna automáticamente
      estado: 'activo', // ← Por defecto activo
      createdAt: Timestamp.now(), // ← Servidor genera fecha
      updatedAt: Timestamp.now(), // ← Servidor genera fecha
    };

    const loginCreado = await addDoc(loginCollection, nuevoLogin);

    // Retornar información del login creado
    return {
      success: true,
      message: 'Login creado exitosamente',
      loginId: loginCreado.id,
      correo: dto.correo,
      edad: edad,
      requiereApoderado: edad < 18,
      requiereUsuario: true, // Debe completar datos en /usuarios
      mensaje:
        edad < 18
          ? 'Login creado. Debes completar tus datos personales y asignar un apoderado.'
          : 'Login creado. Debes completar tus datos personales.',
    };
  }
}
