export class CreateEntrenamientoDto {
  titulo: string;
  descripcion?: string;
  fecha: Date;
  hora: string;
  duracion?: number;
  ubicacion?: string;
  estado?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
