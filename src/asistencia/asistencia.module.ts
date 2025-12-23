import { Module } from '@nestjs/common';
import { AsistenciaService } from './asistencia.service';

@Module({
  providers: [AsistenciaService]
})
export class AsistenciaModule {}
