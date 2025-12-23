import { Module } from '@nestjs/common';
import { VehiculosService } from './vehiculos.service';

@Module({
  providers: [VehiculosService]
})
export class VehiculosModule {}
