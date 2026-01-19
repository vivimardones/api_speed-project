export class CreateCategoriaDto {
  nombre: string;
  descripcion?: string;
  edadMinima?: number;
  edadMaxima?: number;
  serieId?: string;
  estado?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
