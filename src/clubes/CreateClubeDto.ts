import {
  IsString,
  IsOptional,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class DirigenteDto {
  @IsOptional()
  @IsString()
  presidente?: string;

  @IsOptional()
  @IsString()
  secretario?: string;

  @IsOptional()
  @IsString()
  tesorero?: string;

  @IsOptional()
  @IsString()
  director?: string;
}

class ColoresDto {
  @IsOptional()
  @IsString()
  primario?: string; // Hex color

  @IsOptional()
  @IsString()
  secundario?: string;

  @IsOptional()
  @IsString()
  terciario?: string;
}

class DireccionDto {
  @IsOptional()
  @IsString()
  calle?: string;

  @IsOptional()
  @IsString()
  numero?: string;

  @IsOptional()
  @IsString()
  comuna?: string;

  @IsOptional()
  @IsString()
  ciudad?: string;

  @IsOptional()
  @IsString()
  region?: string;
}

export class CreateClubeDto {
  // Obligatorios
  @IsString()
  nombreFantasia!: string;

  @IsString()
  nombreReal!: string;

  @IsDateString()
  fechaIniciacion!: string; // ISO 8601

  // Optativos temporales
  @IsOptional()
  @IsString()
  rut?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => DirigenteDto)
  dirigentes?: DirigenteDto;

  @IsOptional()
  @IsDateString()
  fechaVencimientoVigencia?: string;

  // Colores
  @IsOptional()
  @ValidateNested()
  @Type(() => ColoresDto)
  colores?: ColoresDto;

  // Dirección
  @IsOptional()
  @ValidateNested()
  @Type(() => DireccionDto)
  direccionSede?: DireccionDto;

  // Imágenes
  @IsOptional()
  @IsUrl()
  escudo?: string; // URL de la imagen

  @IsOptional()
  @IsUrl()
  insignia?: string;

  // Vigencia
  @IsOptional()
  @IsBoolean()
  vigencia?: boolean;

  // Contacto
  @IsOptional()
  @IsEmail()
  correo?: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsUrl()
  sitioWeb?: string;

  // Metadata
  @IsOptional()
  @IsString()
  descripcion?: string;
}
