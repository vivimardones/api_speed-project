// Ruta: src/auth/dto/register-adolescente.dto.ts

import {
  IsEmail,
  IsString,
  MinLength,
  Matches,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  MaxLength,
  IsDateString,
} from 'class-validator';
import { TipoIdentificador } from '../../usuarios/dto';

enum SexoEnum {
  FEMENINO = 'femenino',
  MASCULINO = 'masculino',
}

export class RegisterAdolescenteDto {
  // ========== DATOS DE AUTENTICACIÓN (OPCIONALES) ==========
  @IsOptional()
  @IsEmail({}, { message: 'El correo debe ser válido' })
  correo?: string;

  @IsOptional()
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message:
      'La contraseña debe contener al menos una mayúscula, una minúscula y un número',
  })
  password?: string;

  // ========== DATOS DEL USUARIO ==========
  @IsNotEmpty({ message: 'El primer nombre es obligatorio' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  primerNombre: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  segundoNombre?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  tercerNombre?: string;

  @IsNotEmpty({ message: 'El apellido paterno es obligatorio' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  apellidoPaterno: string;

  @IsNotEmpty({ message: 'El apellido materno es obligatorio' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  apellidoMaterno: string;

  @IsNotEmpty({ message: 'La fecha de nacimiento es obligatoria' })
  @IsDateString(
    {},
    { message: 'La fecha de nacimiento debe tener formato YYYY-MM-DD' },
  )
  fechaNacimiento: string;

  @IsNotEmpty({ message: 'El sexo es obligatorio' })
  @IsEnum(SexoEnum, { message: 'El sexo debe ser femenino o masculino' })
  sexo: string;

  @IsNotEmpty({ message: 'El tipo de identificador es obligatorio' })
  @IsEnum(TipoIdentificador)
  tipoIdentificador: TipoIdentificador;

  @IsNotEmpty({ message: 'El número de identificador es obligatorio' })
  @IsString()
  numeroIdentificador: string;

  @IsNotEmpty({ message: 'El teléfono es obligatorio' })
  @IsString()
  @Matches(/^\+56[0-9]{9}$/, {
    message: 'El teléfono debe tener formato +56912345678',
  })
  telefono: string;

  @IsOptional()
  @IsString()
  @Matches(/^\+56[0-9]{9}$/, {
    message: 'El teléfono de emergencia debe tener formato +56912345678',
  })
  telefonoEmergencia?: string;

  // ========== APODERADO (OPCIONAL) ==========
  @IsOptional()
  @IsString()
  apoderadoId?: string;
}
