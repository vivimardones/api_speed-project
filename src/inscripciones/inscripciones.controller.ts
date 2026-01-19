import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { CreateInscripcionDto } from './create-incripciones.dto';
import { InscripcionesService } from './inscripciones.service';

@Controller('inscripciones')
export class InscripcionesController {
  constructor(private readonly inscripcionesService: InscripcionesService) {}

  @Get()
  async findAll() {
    return await this.inscripcionesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.inscripcionesService.findOne(id);
  }

  @Post()
  async create(@Body() inscripcion: CreateInscripcionDto) {
    return await this.inscripcionesService.create(inscripcion);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() inscripcion: CreateInscripcionDto,
  ) {
    return await this.inscripcionesService.update(id, inscripcion);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.inscripcionesService.remove(id);
  }

  // Relaciones según el diagrama MER
  @Get(':id/deportista')
  async getDeportista(@Param('id') inscripcionId: string) {
    return await this.inscripcionesService.getDeportista(inscripcionId);
  }

  @Post(':id/deportista/:deportistaId')
  async assignDeportista(
    @Param('id') inscripcionId: string,
    @Param('deportistaId') deportistaId: string,
  ) {
    return await this.inscripcionesService.assignDeportista(
      inscripcionId,
      deportistaId,
    );
  }

  @Get(':id/campeonato')
  async getCampeonato(@Param('id') inscripcionId: string) {
    return await this.inscripcionesService.getCampeonato(inscripcionId);
  }

  @Post(':id/campeonato/:campeonatoId')
  async assignCampeonato(
    @Param('id') inscripcionId: string,
    @Param('campeonatoId') campeonatoId: string,
  ) {
    return await this.inscripcionesService.assignCampeonato(
      inscripcionId,
      campeonatoId,
    );
  }

  @Get('campeonato/:campeonatoId')
  async getInscripcionesByCampeonato(
    @Param('campeonatoId') campeonatoId: string,
  ) {
    return await this.inscripcionesService.getInscripcionesByCampeonato(
      campeonatoId,
    );
  }

  @Get('deportista/:deportistaId')
  async getInscripcionesByDeportista(
    @Param('deportistaId') deportistaId: string,
  ) {
    return await this.inscripcionesService.getInscripcionesByDeportista(
      deportistaId,
    );
  }
}
