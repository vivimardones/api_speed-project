import { IsString, IsDateString } from 'class-validator';

export class CreateNoticiaDto {
  @IsString()
  titulo: string; // Título de la noticia

  @IsString()
  contenido: string; // Contenido principal de la noticia

  @IsDateString()
  fechaPublicacion: string; // Fecha de publicación en formato ISO (YYYY-MM-DD)
}
