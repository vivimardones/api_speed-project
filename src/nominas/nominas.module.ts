import { Module } from '@nestjs/common';
import { NominasService } from './nominas.service';
import { NominasController } from './nominas.controller';

@Module({
  controllers: [NominasController],
  providers: [NominasService],
  exports: [NominasService],
})
export class NominasModule {}
