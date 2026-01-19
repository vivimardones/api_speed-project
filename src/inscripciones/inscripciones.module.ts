import { Module } from '@nestjs/common';
import { InscripcionesService } from './inscripciones.service';

@Module({
  providers: [InscripcionesService],
})
export class InscripcionesModule {}
