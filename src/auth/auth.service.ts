import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './loginDto';
import { UsuariosService } from '../usuarios/usuarios.service';
import { RolesService } from '../roles/roles.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly rolesService: RolesService,
  ) {}

  async login(dto: LoginDto) {
    // Buscar usuario
    const usuario = await this.usuariosService.findOne(dto.idUsuario);
    if (!usuario) throw new UnauthorizedException('Usuario no encontrado');

    // Buscar rol asociado
    const rol = await this.rolesService.findOne(usuario.idRol);
    if (!rol) throw new UnauthorizedException('Rol no encontrado');

    // Validar contraseña
    const isPasswordValid = await bcrypt.compare(dto.password, rol.password);
    if (!isPasswordValid) throw new UnauthorizedException('Contraseña incorrecta');

    // Validar fechas
    const now = new Date();
    if (rol.fechaActivacion && now < new Date(rol.fechaActivacion)) {
      throw new UnauthorizedException('Cuenta aún no está activa');
    }
    if (rol.fechaExpiracion && now > new Date(rol.fechaExpiracion)) {
      throw new UnauthorizedException('Cuenta expirada');
    }

    // Retornar datos básicos (más adelante puedes agregar JWT)
    return {
      idUsuario: usuario.idUsuario,
      nombre: usuario.nombreCompleto,
      rol: rol.nombre,
    };
  }
}
