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
import { logToFile } from '../utils/logger';
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

    // Buscar el perfil del usuario
    const perfilesCollection = collection(db, 'perfiles');
    const perfilQuery = query(
      perfilesCollection,
      where('correo', '==', dto.email),
    );
    const perfilSnapshot = await getDocs(perfilQuery);

    let perfil: any = null;
    if (!perfilSnapshot.empty) {
      const perfilDoc = perfilSnapshot.docs[0];
      perfil = {
        id: perfilDoc.id,
        ...perfilDoc.data(),
      };
      // No incluir password en la respuesta
      delete perfil.password;
    }

    // Retornar datos del usuario autenticado con perfil
    return {
      id: loginDoc.id,
      nombre: loginData.nombre,
      email: loginData.email,
      fechaNacimiento: loginData.fechaNacimiento,
      idRol: loginData.idRol,
      timestamp: new Date(),
      deportista: loginData.deportista || null,
      perfil: perfil,
    };
  }
  async register(dto: RegisterUserDto) {
    if (!dto.correo || !dto.password || !dto.fechaNacimiento) {
      throw new BadRequestException('Todos los campos son obligatorios');
    }

    // Verificar email único en la colección login
    const loginCollection = collection(db, 'login');
    const snapshot = await getDocs(loginCollection);
    const existe = snapshot.docs.find((doc) => {
      const data = doc.data();
      return data.email === dto.correo;
    });
    if (existe) {
      throw new BadRequestException('El email ya está registrado');
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Crear login
    const nuevoLogin: any = {
      email: dto.correo,
      password: hashedPassword,
      fechaNacimiento: dto.fechaNacimiento,
      fechaRegistro: new Date().toISOString(),
    };
    const loginCreado = await addDoc(loginCollection, nuevoLogin);

    // Crear perfil de usuario en colección 'perfiles'
    try {
      const perfilesCollection = collection(db, 'perfiles');
      const createdAt = new Date();
      // Expiración fija a 1 año para usuarios estándar
      const exp = new Date(createdAt);
      exp.setFullYear(exp.getFullYear() + 1);
      const expiresAt = exp.toISOString();

      const nuevoPerfil: any = {
        correo: dto.correo,
        idClub: null,
        createdAt: createdAt.toISOString(),
        expiresAt: expiresAt,
        loginId: loginCreado.id,
        rol: 'standard', // Rol inicial según reglas de negocio
      };
      const perfilCreado = await addDoc(perfilesCollection, nuevoPerfil);

      return {
        message: 'Usuario de login y perfil registrados exitosamente.',
        usuario: {
          id: loginCreado.id,
          nombre: nuevoLogin.nombre,
          email: nuevoLogin.email,
          fechaNacimiento: nuevoLogin.fechaNacimiento,
          idRol: nuevoLogin.idRol,
        },
        perfil: { id: perfilCreado.id, ...nuevoPerfil },
      };
    } catch (err) {
      // En caso de fallo al crear perfil, devolver igualmente el login creado
      return {
        message:
          'Usuario registrado en login, pero falló la creación del perfil',
        usuario: {
          id: loginCreado.id,
          nombre: nuevoLogin.nombre,
          email: nuevoLogin.email,
          fechaNacimiento: nuevoLogin.fechaNacimiento,
          idRol: nuevoLogin.idRol,
        },
        perfilError: String(err),
      };
    }
  }

  /* eslint-disable @typescript-eslint/no-unsafe-return */
  async getAllLogins() {
    logToFile('Llamada a getAllLogins iniciada');
    try {
      const loginCollection = collection(db, 'login');
      const snapshot = await getDocs(loginCollection);

      const logins = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const data = doc.data();
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { password, ...resto } = data as any;

          // Buscar el perfil asociado a este login
          const perfilesCollection = collection(db, 'perfiles');
          const perfilQuery = query(
            perfilesCollection,
            where('correo', '==', (data as any).email),
          );
          const perfilSnapshot = await getDocs(perfilQuery);

          let perfil: any = null;
          if (!perfilSnapshot.empty) {
            const perfilDoc = perfilSnapshot.docs[0];
            perfil = {
              id: perfilDoc.id,
              ...perfilDoc.data(),
            };
            // No incluir password si existe
            delete perfil.password;
          }

          return {
            id: doc.id,
            ...resto,
            perfil: perfil,
          };
        }),
      );
      logToFile(`getAllLogins completado. Total usuarios: ${logins.length}`);
      return logins;
    } catch (error) {
      logToFile(
        `Error en getAllLogins: ${error instanceof Error ? error.stack : error}`,
      );
      throw error;
    }
  }
  /* eslint-enable @typescript-eslint/no-unsafe-return */
}
