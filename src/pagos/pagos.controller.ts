/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
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
    return this.pagosService.remove(id);
  }

  // Relaciones según el diagrama MER
  @Get(':id/deportista')
  getDeportista(@Param('id') pagoId: string) {
    return this.pagosService.getDeportista(pagoId);
  }

  @Post(':id/deportista/:deportistaId')
  assignDeportista(
    @Param('id') pagoId: string,
    @Param('deportistaId') deportistaId: string,
  ) {
    return this.pagosService.assignDeportista(pagoId, deportistaId);
  }

  @Get('deportista/:deportistaId')
  getPagosByDeportista(@Param('deportistaId') deportistaId: string) {
    return this.pagosService.getPagosByDeportista(deportistaId);
  }

  @Get('estado/:estado')
  getPagosByEstado(@Param('estado') estado: string) {
    return this.pagosService.getPagosByEstado(estado);
  }

  @Get('rango-fecha/:fechaInicio/:fechaFin')
  getPagosByFecha(
    @Param('fechaInicio') fechaInicio: string,
    @Param('fechaFin') fechaFin: string,
  ) {
    return this.pagosService.getPagosByFecha(fechaInicio, fechaFin);
  }
}
