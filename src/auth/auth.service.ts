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
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { UsuariosService } from '../usuarios/usuarios.service';
import { db } from '../firebase.config';
import { doc, getDoc } from 'firebase/firestore';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly usuariosService: UsuariosService) {}

  async login(dto: LoginDto) {
    // Buscar usuario
    const usuario: any = await this.usuariosService.findOne(dto.idUsuario);
    if (!usuario) throw new UnauthorizedException('Usuario no encontrado');

    // Buscar perfil asociado si existe perfilId
    let perfil: any = null;
    if (usuario.perfilId) {
      try {
        const perfilRef = doc(db, 'perfil', usuario.perfilId);
        const perfilSnap = await getDoc(perfilRef);

        if (!perfilSnap.exists()) {
          throw new UnauthorizedException('Perfil no encontrado');
        }

        perfil = perfilSnap.data();

        // Validar contraseña del perfil
        const isPasswordValid = await bcrypt.compare(
          dto.password,
          perfil.password,
        );
        if (!isPasswordValid)
          throw new UnauthorizedException('Contraseña incorrecta');

        // Validar fechas del perfil
        const now = new Date();
        if (perfil.fechaActivacion && now < new Date(perfil.fechaActivacion)) {
          throw new UnauthorizedException('Cuenta aún no está activa');
        }
        if (perfil.fechaExpiracion && now > new Date(perfil.fechaExpiracion)) {
          throw new UnauthorizedException('Cuenta expirada');
        }
      } catch (error: any) {
        if (
          error.message === 'Perfil no encontrado' ||
          error.message === 'Contraseña incorrecta' ||
          error.message === 'Cuenta aún no está activa' ||
          error.message === 'Cuenta expirada'
        ) {
          throw error;
        }
        throw new UnauthorizedException('Error al validar perfil');
      }
    }

    // Retornar datos básicos (más adelante puedes agregar JWT)
    return {
      id: usuario.id,
      idUsuario: usuario.idUsuario || usuario.id,
      nombre: usuario.nombreCompleto || usuario.nombre,
      correo: usuario.correo || usuario.email,
      perfil: perfil?.nombre || 'usuario',
      timestamp: new Date(),
    };
  }
  async register(dto: RegisterUserDto) {
    // Validar campos
    if (!dto.nombre || !dto.email || !dto.password || !dto.fechaNacimiento) {
      throw new BadRequestException('Todos los campos son obligatorios');
    }

    // Verificar email único en la colección login
    const loginCollection = collection(db, 'login');
    const snapshot = await getDocs(loginCollection);
    const existe = snapshot.docs.find((doc) => {
      const data = doc.data();
      return data.email === dto.email;
    });
    if (existe) {
      throw new BadRequestException('El email ya está registrado');
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Crear login
    const nuevoLogin: any = {
      nombre: dto.nombre,
      email: dto.email,
      password: hashedPassword,
      fechaNacimiento: dto.fechaNacimiento,
      fechaRegistro: new Date().toISOString(),
    };
    const loginCreado = await addDoc(loginCollection, nuevoLogin);

    return {
      message: 'Usuario de login registrado exitosamente',
      usuario: {
        id: loginCreado.id,
        nombre: nuevoLogin.nombre,
        email: nuevoLogin.email,
        fechaNacimiento: nuevoLogin.fechaNacimiento,
      },
    };
  }
}
