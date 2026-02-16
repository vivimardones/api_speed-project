// Ruta: src/auth/auth.controller.ts

import {
  Controller,
  Post,
  Body,
  Get,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterAdultoDto, RegisterAdolescenteDto, LoginDto } from './dto';
import { JwtAuthGuard, RolesGuard } from './guards';
import { Roles } from './decorators/roles.decorator';
import { GetUser, UserFromToken } from './decorators/get-user.decorator';
import { Rol } from './enums/rol.enum';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /auth/register-adulto
   * Registrar un adulto (>= 18 años) con login obligatorio
   */
  @Post('register-adulto')
  @HttpCode(HttpStatus.CREATED)
  registerAdulto(@Body() registerAdultoDto: RegisterAdultoDto) {
    return this.authService.registerAdulto(registerAdultoDto);
  }

  /**
   * POST /auth/register-adolescente
   * Registrar un adolescente (10-17 años) con login opcional
   */
  @Post('register-adolescente')
  @HttpCode(HttpStatus.CREATED)
  registerAdolescente(@Body() registerAdolescenteDto: RegisterAdolescenteDto) {
    return this.authService.registerAdolescente(registerAdolescenteDto);
  }

  /**
   * POST /auth/login
   * Iniciar sesión
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  // ==========================================
  // ENDPOINTS PROTEGIDOS (con guards)
  // ==========================================

  /**
   * TEST 1: Solo autenticación - Cualquier usuario con token válido
   */
  @Get('profile')
  @UseGuards(JwtAuthGuard) // ← SOLO JwtAuthGuard
  getProfile(@GetUser() user: UserFromToken) {
    console.log('Endpoint profile: Usuario recibido:', user);
    return {
      success: true,
      message: 'Perfil obtenido exitosamente',
      user: {
        firebaseUid: user.firebaseUid,
        email: user.email,
        emailVerified: user.emailVerified,
      },
    };
  }

  /**
   * TEST 2: Solo para DEPORTISTAS
   */
  @Get('deportista/dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Rol.DEPORTISTA)
  getDeportistaDashboard(@GetUser() user: UserFromToken) {
    return {
      success: true,
      message: 'Dashboard de deportista',
      data: {
        usuarioId: user.usuarioId,
        roles: user.roles,
        email: user.email,
      },
    };
  }

  /**
   * TEST 3: Solo para APODERADOS
   */
  @Get('apoderado/dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Rol.APODERADO)
  getApoderadoDashboard(@GetUser() user: UserFromToken) {
    return {
      success: true,
      message: 'Dashboard de apoderado',
      data: {
        usuarioId: user.usuarioId,
        roles: user.roles,
        email: user.email,
        mensaje: 'Aquí verías la lista de tus hijos deportistas',
      },
    };
  }

  /**
   * TEST 4: Solo para ADMINISTRADORES
   */
  @Get('admin/users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Rol.ADMINISTRADOR)
  getAdminUsers(@GetUser() user: UserFromToken) {
    return {
      success: true,
      message: 'Lista de usuarios (solo admin)',
      data: {
        usuarioId: user.usuarioId,
        roles: user.roles,
        mensaje: 'Solo administradores pueden ver esto',
      },
    };
  }

  /**
   * TEST 5: ADMINISTRADORES O DIRIGENTES
   */
  @Get('admin/reports')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Rol.ADMINISTRADOR, Rol.DIRIGENTE)
  getReports(@GetUser() user: UserFromToken) {
    return {
      success: true,
      message: 'Reportes del club',
      data: {
        usuarioId: user.usuarioId,
        roles: user.roles,
        mensaje: 'Administradores y dirigentes pueden ver reportes',
      },
    };
  }

  /**
   * TEST 6: DEPORTISTA O APODERADO (para usuarios comunes)
   */
  @Get('my-data')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Rol.DEPORTISTA, Rol.APODERADO)
  getMyData(@GetUser() user: UserFromToken) {
    return {
      success: true,
      message: 'Mis datos',
      data: {
        usuarioId: user.usuarioId,
        email: user.email,
        roles: user.roles,
        mensaje: 'Tus datos personales',
      },
    };
  }

  /**
   * TEST 7: Obtener solo el usuarioId usando el decorador
   */
  @Get('my-id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Rol.DEPORTISTA, Rol.APODERADO)
  getMyId(@GetUser('usuarioId') usuarioId: string) {
    return {
      success: true,
      usuarioId: usuarioId,
    };
  }

  /**
   * TEST 8: Obtener solo los roles
   */
  @Get('my-roles')
  @UseGuards(JwtAuthGuard)
  getMyRoles(@GetUser('roles') roles: Rol[] | undefined) {
    return {
      success: true,
      roles: roles || [],
    };
  }
  @Get('test')
  getTest() {
    return {
      success: true,
      message: 'Servidor funcionando correctamente',
      timestamp: new Date().toISOString(),
    };
  }
}
