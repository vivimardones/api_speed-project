import { IsUUID, IsBoolean, IsDateString } from 'class-validator';

export class CreateAsistenciaDto {
  @IsUUID('4')
  usuarioId: string; // ID del usuario que registra asistencia

  @IsBoolean()
  presente: boolean; // true si asistió, false si faltó

  @IsDateString()
  fecha: string; // Fecha de la asistencia en formato ISO (YYYY-MM-DD)
}
