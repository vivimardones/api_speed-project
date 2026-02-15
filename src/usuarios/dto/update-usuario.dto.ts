// Ruta: src/usuarios/dto/update-usuario.dto.ts

import { PartialType } from '@nestjs/mapped-types';
import { CreateUsuarioDto } from './create-usuario.dto';
import { IsOptional, IsIn } from 'class-validator';

export class UpdateUsuarioDto extends PartialType(CreateUsuarioDto) {
  // Permite actualizar el estado
  @IsOptional()
  @IsIn(['activo', 'inactivo'], {
    message: 'El estado debe ser activo o inactivo',
  })
  estado?: 'activo' | 'inactivo';
}
