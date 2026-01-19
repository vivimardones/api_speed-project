import { Module } from '@nestjs/common';
import { EntrenamientosService } from './entrenamientos.service';
import { EntrenamientosController } from './entrenamientos.controller';

@Module({
  controllers: [EntrenamientosController],
  providers: [EntrenamientosService],
  exports: [EntrenamientosService],
})
export class EntrenamientosModule {}
