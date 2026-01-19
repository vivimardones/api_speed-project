import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { EntrenamientosService } from './entrenamientos.service';

@Controller('entrenamientos')
export class EntrenamientosController {
  constructor(private readonly entrenamientosService: EntrenamientosService) {}

  @Get()
  findAll() {
    return this.entrenamientosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.entrenamientosService.findOne(id);
  }

  @Post()
  create(@Body() entrenamientoData: any) {
    return this.entrenamientosService.create(entrenamientoData);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() entrenamientoData: any) {
    return this.entrenamientosService.update(id, entrenamientoData);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.entrenamientosService.remove(id);
  }

  // Relaciones según el diagrama MER
  @Get(':id/asistencias')
  getAsistencias(@Param('id') entrenamientoId: string) {
    return this.entrenamientosService.getAsistencias(entrenamientoId);
  }

  @Post(':id/asistencias/:asistenciaId')
  addAsistencia(
    @Param('id') entrenamientoId: string,
    @Param('asistenciaId') asistenciaId: string,
  ) {
    return this.entrenamientosService.addAsistencia(
      entrenamientoId,
      asistenciaId,
    );
  }

  @Get('fecha/:fecha')
  getEntrenamientosByFecha(@Param('fecha') fecha: string) {
    return this.entrenamientosService.getEntrenamientosByFecha(fecha);
  }

  @Get('rango-fecha/:fechaInicio/:fechaFin')
  getEntrenamientosByFechaRango(
    @Param('fechaInicio') fechaInicio: string,
    @Param('fechaFin') fechaFin: string,
  ) {
    return this.entrenamientosService.getEntrenamientosByFechaRango(
      fechaInicio,
      fechaFin,
    );
  }
}
