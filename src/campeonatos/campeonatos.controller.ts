/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { CreateCampeonatoDto } from './CreateCampeonatoDto';
import { CampeonatosService } from './campeonatos.service';

@Controller('campeonatos')
export class CampeonatosController {
  constructor(private readonly campeonatosService: CampeonatosService) {}

  @Get()
  findAll() {
    return this.campeonatosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.campeonatosService.findOne(id);
  }

  @Post()
  create(@Body() campeonato: CreateCampeonatoDto) {
    return this.campeonatosService.create(campeonato);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() campeonato: CreateCampeonatoDto) {
    return this.campeonatosService.update(id, campeonato);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.campeonatosService.remove(id);
  }

  // Relaciones según el diagrama MER
  @Get(':id/nominas')
  getNominas(@Param('id') campeonatoId: string) {
    return this.campeonatosService.getNominasCampeonato(campeonatoId);
  }

  @Post(':id/nominas/:nominaId')
  addNomina(
    @Param('id') campeonatoId: string,
    @Param('nominaId') nominaId: string,
  ) {
    return this.campeonatosService.addNomina(campeonatoId, nominaId);
  }

  @Get(':id/inscripciones')
  getInscripciones(@Param('id') campeonatoId: string) {
    return this.campeonatosService.getInscripcionesCampeonato(campeonatoId);
  }

  @Get(':id/series')
  getSeries(@Param('id') campeonatoId: string) {
    return this.campeonatosService.getSeriesCampeonato(campeonatoId);
  }

  @Post(':id/series')
  createSerie(@Param('id') campeonatoId: string, @Body() serieData: any) {
    return this.campeonatosService.createSerie(campeonatoId, serieData);
  }

  @Get(':id/categorias')
  getCategorias(@Param('id') campeonatoId: string) {
    return this.campeonatosService.getCategoriasCampeonato(campeonatoId);
  }

  @Post(':id/categorias')
  createCategoria(
    @Param('id') campeonatoId: string,
    @Body() categoriaData: any,
  ) {
    return this.campeonatosService.createCategoria(campeonatoId, categoriaData);
  }
}
