import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { NominasService } from './nominas.service';

@Controller('nominas')
export class NominasController {
  constructor(private readonly nominasService: NominasService) {}

  @Get()
  findAll() {
    return this.nominasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.nominasService.findOne(id);
  }

  @Post()
  create(@Body() nominaData: any) {
    return this.nominasService.create(nominaData);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() nominaData: any) {
    return this.nominasService.update(id, nominaData);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.nominasService.remove(id);
  }

  // Relaciones según el diagrama MER
  @Get(':id/club')
  getClub(@Param('id') nominaId: string) {
    return this.nominasService.getClub(nominaId);
  }

  @Post(':id/club/:clubId')
  assignClub(@Param('id') nominaId: string, @Param('clubId') clubId: string) {
    return this.nominasService.assignClub(nominaId, clubId);
  }

  @Get(':id/campeonatos')
  getCampeonatos(@Param('id') nominaId: string) {
    return this.nominasService.getCampeonatos(nominaId);
  }

  @Post(':id/campeonatos/:campeonatoId')
  addCampeonato(
    @Param('id') nominaId: string,
    @Param('campeonatoId') campeonatoId: string,
  ) {
    return this.nominasService.addCampeonato(nominaId, campeonatoId);
  }

  @Get(':id/series')
  getSeries(@Param('id') nominaId: string) {
    return this.nominasService.getSeries(nominaId);
  }

  @Get('club/:clubId')
  getNominasByClub(@Param('clubId') clubId: string) {
    return this.nominasService.getNominasByClub(clubId);
  }
}
