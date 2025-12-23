import { Module } from '@nestjs/common';
import { CampeonatosService } from './campeonatos.service';
import { CampeonatosController } from './campeonatos.controller';

@Module({
  providers: [CampeonatosService],
  controllers: [CampeonatosController]
})
export class CampeonatosModule {}
