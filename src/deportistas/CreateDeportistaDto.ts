export class CreateDeportistaDto {
  nombre: string;
  apellido: string;
  email?: string;
  telefono?: string;
  fechaNacimiento?: Date;
  cedula?: string;
  categorialId?: string;
  usuarioId?: string;
  vehiculoId?: string;
  estado?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
