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
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { UsuariosService } from '../usuarios/usuarios.service';
import { db } from '../firebase.config';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly usuariosService: UsuariosService) {}

  async login(dto: LoginDto) {
    // Buscar usuario en colección login por email
    const loginCollection = collection(db, 'login');
    const q = query(loginCollection, where('email', '==', dto.email));
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

    // Retornar datos del usuario autenticado
    return {
      id: loginDoc.id,
      nombre: loginData.nombre,
      email: loginData.email,
      fechaNacimiento: loginData.fechaNacimiento,
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
