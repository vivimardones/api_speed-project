import { IsString } from 'class-validator';

export class LoginDto {
  @IsString()
  idUsuario: string; // Identificador único del usuario

  @IsString()
  password: string; // Contraseña en texto plano (se validará contra la encriptada en Rol)
}
