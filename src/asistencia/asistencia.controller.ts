/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { CreateAsistenciaDto } from './CreateAsistenciaDto';
import { AsistenciaService } from './asistencia.service';

@Controller('asistencia')
export class AsistenciaController {
  constructor(private readonly asistenciaService: AsistenciaService) {}

  @Get()
  async findAll() {
    return await this.asistenciaService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.asistenciaService.findOne(id);
  }

  @Post()
  async create(@Body() asistencia: CreateAsistenciaDto) {
    return await this.asistenciaService.create(asistencia);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() asistencia: CreateAsistenciaDto,
  ) {
    return await this.asistenciaService.update(id, asistencia);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.asistenciaService.remove(id);
  }

  // Relaciones según el diagrama MER
  @Get(':id/deportista')
  async getDeportista(@Param('id') asistenciaId: string) {
    return await this.asistenciaService.getDeportista(asistenciaId);
  }

  @Post(':id/deportista/:deportistaId')
  async assignDeportista(
    @Param('id') asistenciaId: string,
    @Param('deportistaId') deportistaId: string,
  ) {
    return await this.asistenciaService.assignDeportista(
      asistenciaId,
      deportistaId,
    );
  }

  @Get(':id/entrenamientos')
  async getEntrenamientos(@Param('id') asistenciaId: string) {
    return await this.asistenciaService.getEntrenamientos(asistenciaId);
  }

  @Post(':id/entrenamientos/:entrenamientoId')
  async addEntrenamiento(
    @Param('id') asistenciaId: string,
    @Param('entrenamientoId') entrenamientoId: string,
  ) {
    return await this.asistenciaService.addEntrenamiento(
      asistenciaId,
      entrenamientoId,
    );
  }

  @Get('deportista/:deportistaId')
  async getAsistenciaByDeportista(@Param('deportistaId') deportistaId: string) {
    return await this.asistenciaService.getAsistenciaByDeportista(deportistaId);
  }

  @Get('deportista/:deportistaId/fecha/:fecha')
  async getAsistenciaByDeportistaAndFecha(
    @Param('deportistaId') deportistaId: string,
    @Param('fecha') fecha: string,
  ) {
    return await this.asistenciaService.getAsistenciaByDeportistaAndFecha(
      deportistaId,
      fecha,
    );
  }
}
