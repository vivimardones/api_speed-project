// Ruta: src/usuarios/dto/create-usuario.dto.ts

import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  MinLength,
  MaxLength,
  Matches,
  IsDateString,
  ValidateIf,
} from 'class-validator';

export enum TipoIdentificador {
  RUT = 'RUT',
  PASAPORTE = 'PASAPORTE',
  RUT_PROVISORIO = 'RUT_PROVISORIO',
  IDENTIFICADOR_EXTRANJERO = 'IDENTIFICADOR_EXTRANJERO',
}

export enum SexoEnum {
  FEMENINO = 'femenino',
  MASCULINO = 'masculino',
}

export class CreateUsuarioDto {
  // loginId se asigna después del registro
  // Solo si edad >= 10 años
  @IsOptional()
  @IsString()
  loginId?: string | null;

  // Nombres
  @IsNotEmpty({ message: 'El primer nombre es obligatorio' })
  @IsString()
  @MinLength(2, {
    message: 'El primer nombre debe tener al menos 2 caracteres',
  })
  @MaxLength(50, { message: 'El primer nombre no puede superar 50 caracteres' })
  primerNombre!: string;

  @IsOptional()
  @IsString()
  @MaxLength(50, {
    message: 'El segundo nombre no puede superar 50 caracteres',
  })
  segundoNombre?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'El tercer nombre no puede superar 50 caracteres' })
  tercerNombre?: string;

  @IsNotEmpty({ message: 'El apellido paterno es obligatorio' })
  @IsString()
  @MinLength(2, {
    message: 'El apellido paterno debe tener al menos 2 caracteres',
  })
  @MaxLength(50, {
    message: 'El apellido paterno no puede superar 50 caracteres',
  })
  apellidoPaterno!: string;

  @IsNotEmpty({ message: 'El apellido materno es obligatorio' })
  @IsString()
  @MinLength(2, {
    message: 'El apellido materno debe tener al menos 2 caracteres',
  })
  @MaxLength(50, {
    message: 'El apellido materno no puede superar 50 caracteres',
  })
  apellidoMaterno!: string;

  // ← AGREGAR FECHA DE NACIMIENTO AQUÍ
  @IsNotEmpty({ message: 'La fecha de nacimiento es obligatoria' })
  @IsDateString(
    {},
    { message: 'La fecha de nacimiento debe tener formato YYYY-MM-DD' },
  )
  fechaNacimiento!: string;

  // Sexo
  @IsNotEmpty({ message: 'El sexo es obligatorio' })
  @IsEnum(SexoEnum, { message: 'El sexo debe ser femenino o masculino' })
  sexo!: SexoEnum;

  // Identificación
  @IsNotEmpty({ message: 'El tipo de identificador es obligatorio' })
  @IsEnum(TipoIdentificador, {
    message:
      'El tipo de identificador debe ser RUT, PASAPORTE, RUT_PROVISORIO o IDENTIFICADOR_EXTRANJERO',
  })
  tipoIdentificador!: TipoIdentificador;

  @IsNotEmpty({ message: 'El número de identificador es obligatorio' })
  @IsString()
  numeroIdentificador!: string;
  // Contacto
  @IsNotEmpty({ message: 'El teléfono es obligatorio' })
  @IsString()
  @Matches(/^\+56[0-9]{9}$/, {
    message: 'El teléfono debe tener formato +56912345678',
  })
  telefono!: string;

  @IsOptional()
  @IsString()
  @ValidateIf((o: CreateUsuarioDto) => o.telefonoEmergencia !== '')
  @Matches(/^\+56[0-9]{9}$/, {
    message: 'El teléfono de emergencia debe tener formato +56912345678',
  })
  telefonoEmergencia?: string;

  @IsOptional()
  @IsString()
  apoderadoId?: string; // ID del usuario que actúa como apoderado

  @IsOptional()
  @IsString()
  clubId?: string; // ID del club al que pertenece el usuario
}
