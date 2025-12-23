import { IsUUID, IsString } from 'class-validator';

export class CreateVehiculoDto {
  @IsString()
  idVehiculo: string; // Identificador único del vehículo

  @IsUUID('4')
  usuarioID: string; // Relación con el usuario dueño del vehículo

  @IsString()
  marca: string; // Marca del vehículo (ej: Toyota, Hyundai)

  @IsString()
  modelo: string; // Modelo del vehículo (ej: Accent, V16)

  @IsString()
  color: string; // Color del vehículo

  @IsString()
  patente: string; // Patente del vehículo

  @IsString()
  tipo: 'Automóvil' | 'Camioneta' | 'Moto' | 'Otro'; // Tipo de vehículo
}
