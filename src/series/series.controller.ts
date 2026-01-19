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
import { SeriesService } from './series.service';

@Controller('series')
export class SeriesController {
  constructor(private readonly seriesService: SeriesService) {}

  @Get()
  async findAll() {
    return await this.seriesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.seriesService.findOne(id);
  }

  @Post()
  async create(@Body() serieData: any) {
    return await this.seriesService.create(serieData);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() serieData: any) {
    return await this.seriesService.update(id, serieData);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.seriesService.remove(id);
  }

  // Relaciones según el diagrama MER
  @Get(':id/nomina')
  async getNomina(@Param('id') serieId: string) {
    return await this.seriesService.getNomina(serieId);
  }

  @Post(':id/nomina/:nominaId')
  async assignNomina(
    @Param('id') serieId: string,
    @Param('nominaId') nominaId: string,
  ) {
    return await this.seriesService.assignNomina(serieId, nominaId);
  }

  @Get(':id/categorias')
  async getCategorias(@Param('id') serieId: string) {
    return await this.seriesService.getCategorias(serieId);
  }

  @Post(':id/categorias')
  async createCategoria(@Param('id') serieId: string, @Body() categoriaData: any) {
    return await this.seriesService.createCategoria(serieId, categoriaData);
  }

  @Get('nomina/:nominaId')
  async getSeriesByNomina(@Param('nominaId') nominaId: string) {
    return await this.seriesService.getSeriesByNomina(nominaId);
  }

  @Get('nombre/:nombre')
  async getSeriesByNombre(@Param('nombre') nombre: string) {
    return await this.seriesService.getSeriesByNombre(nombre);
  }
}
