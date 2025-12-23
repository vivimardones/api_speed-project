import { IsString, IsUUID, IsDateString } from 'class-validator';

export class CreateInscripcionDto {
  @IsUUID('4')
  usuarioId: string; // ID del usuario inscrito

  @IsUUID('4')
  campeonatoId: string; // ID del campeonato al que se inscribe

  @IsDateString()
  fechaInscripcion: string; // Fecha de la inscripción en formato ISO (YYYY-MM-DD)

  @IsString()
  estado: 'pendiente' | 'confirmada' | 'cancelada'; // Estado de la inscripción
}
