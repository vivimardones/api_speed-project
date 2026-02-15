import { Controller, Post, Body } from '@nestjs/common';
import { logToFile } from '../utils/logger';
import { AuthService } from './auth.service';
import { LoginDto } from './loginDto';
import { RegisterUserDto } from './registerUserDto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() dto: LoginDto) {
    logToFile('POST /auth/login llamado');
    return this.authService.login(dto);
  }

  @Post('register')
  async register(@Body() dto: RegisterUserDto) {
    logToFile('POST /auth/register llamado');
    return await this.authService.register(dto);
  }
}
