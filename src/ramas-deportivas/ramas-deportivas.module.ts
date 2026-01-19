import { Module } from '@nestjs/common';
import { RamasDeportivasService } from './ramas-deportivas.service';
import { RamasDeportivasController } from './ramas-deportivas.controller';

@Module({
  controllers: [RamasDeportivasController],
  providers: [RamasDeportivasService],
  exports: [RamasDeportivasService],
})
export class RamasDeportivasModule {}
