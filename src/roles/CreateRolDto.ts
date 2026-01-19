import { IsString, IsDateString } from 'class-validator';

export class CreateRolDto {
  @IsString()
  idRol: string; // Identificador único del rol

  @IsString()
  nombre: 'admin' | 'socio' | 'deportista'; // Nombre del rol

  @IsString()
  password: string; // Contraseña encriptada

  @IsDateString()
  fechaActivacion: string; // Fecha en que se activa la cuenta

  @IsDateString()
  fechaExpiracion: string; // Fecha en que expira la cuenta
}
