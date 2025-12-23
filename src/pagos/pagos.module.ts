import { Module } from '@nestjs/common';
import { PagosService } from './pagos.service';

@Module({
  providers: [PagosService]
})
export class PagosModule {}
