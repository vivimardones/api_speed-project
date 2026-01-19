/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './loginDto';
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
}
