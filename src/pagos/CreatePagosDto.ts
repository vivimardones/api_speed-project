import { IsUUID, IsNumber, IsDateString, IsString } from 'class-validator';

export class CreatePagosDto {
  @IsUUID('4')
  usuarioID: string; // ID del usuario que realiza el pago

  @IsNumber()
  monto: number; // Monto del pago

  @IsString()
  estado: 'pendiente' | 'pagado' | 'rechazado'; // Estado del pago

  @IsDateString()
  fecha: string; // Fecha del pago en formato ISO
}
