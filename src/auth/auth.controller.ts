// Ruta: src/auth/auth.controller.ts

import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterAdultoDto, RegisterAdolescenteDto, LoginDto } from './dto';

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
}
