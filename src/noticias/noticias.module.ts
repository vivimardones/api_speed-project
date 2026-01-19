import { Module } from '@nestjs/common';
import { NoticiasService } from './noticias.service';
import { NoticiasController } from './noticias.controller';

@Module({
  controllers: [NoticiasController],
  providers: [NoticiasService],
})
export class NoticiasModule {}
