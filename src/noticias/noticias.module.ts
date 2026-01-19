import { Module } from '@nestjs/common';
import { NoticiasService } from './noticias.service';

@Module({
  providers: [NoticiasService],
})
export class NoticiasModule {}
