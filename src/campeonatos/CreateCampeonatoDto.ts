import { IsString, IsDateString } from 'class-validator';

export class CreateCampeonatoDto {
  @IsString()
  nombre: string; // Nombre del campeonato

  @IsDateString()
  fecha: string; // Fecha del campeonato en formato ISO (YYYY-MM-DD)

  @IsString()
  lugar: string; // Lugar donde se realizará el campeonato
}
