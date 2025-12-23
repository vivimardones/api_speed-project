import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { CreatePagosDto } from './CreatePagosDto';
import { PagosService } from './pagos.service';

@Controller('pagos')
export class PagosController {
  constructor(private readonly pagosService: PagosService) {}

  @Get()
  findAll() {
    return this.pagosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pagosService.findOne(id);
  }

  @Post()
  create(@Body() pago: CreatePagosDto) {
    return this.pagosService.create(pago);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() pago: CreatePagosDto) {
    return this.pagosService.update(id, pago);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return { mensaje: `Pago con id ${id} eliminado` };
  }
}
