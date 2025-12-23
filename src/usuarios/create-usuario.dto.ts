import {
  IsString,
  IsEmail,
  IsDateString,
  IsOptional,
  IsUrl,
} from 'class-validator';

export class CreateUsuarioDto {
  @IsString()
  idUsuario: string; // Identificador único

  @IsString()
  rut: string; // Rut del usuario

  @IsString()
  nombreCompleto: string; // Nombre completo del usuario

  @IsEmail()
  correo: string; // Correo electrónico

  @IsString()
  contraseña: string; // Contraseña

  @IsString()
  rol: 'admin' | 'socio' | 'deportista'; // Rol dentro del sistema

  @IsDateString()
  fechaNacimiento: string; // Fecha de nacimiento

  @IsString()
  sexo: 'Masculino' | 'Femenino'; // Sexo del usuario

  @IsDateString()
  fechaRegistro: string; // Fecha de registro en el sistema

  // Campos opcionales según Excel
  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsString()
  direccion?: string;

  @IsOptional()
  @IsString()
  comuna?: string;

  @IsOptional()
  @IsString()
  planSalud?: string;

  @IsOptional()
  @IsString()
  seguroComplementario?: string;

  @IsOptional()
  @IsString()
  centroSalud?: string;

  @IsOptional()
  @IsString()
  apoderado?: string; // Nombre completo del apoderado

  // 📌 Nuevo campo para la foto
  @IsOptional()
  @IsUrl()
  foto?: string; // URL de la foto del deportista
}
