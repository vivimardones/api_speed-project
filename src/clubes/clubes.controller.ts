import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { ClubesService } from './clubes.service';

@Controller('clubes')
export class ClubesController {
  constructor(private readonly clubesService: ClubesService) {}

  @Get()
  findAll() {
    return this.clubesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clubesService.findOne(id);
  }

  @Post()
  create(@Body() clubData: any) {
    return this.clubesService.create(clubData);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() clubData: any) {
    return this.clubesService.update(id, clubData);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.clubesService.remove(id);
  }

  // Relaciones según el diagrama MER
  @Get(':id/usuarios')
  getUsuarios(@Param('id') clubId: string) {
    return this.clubesService.getUsuarios(clubId);
  }

  @Post(':id/usuarios/:usuarioId')
  addUsuario(
    @Param('id') clubId: string,
    @Param('usuarioId') usuarioId: string,
  ) {
    return this.clubesService.addUsuario(clubId, usuarioId);
  }

  @Get(':id/ramas-deportivas')
  getRamasDeportivas(@Param('id') clubId: string) {
    return this.clubesService.getRamasDeportivas(clubId);
  }

  @Post(':id/ramas-deportivas')
  createRamaDeportiva(@Param('id') clubId: string, @Body() ramaData: any) {
    return this.clubesService.createRamaDeportiva(clubId, ramaData);
  }

  @Get(':id/nominas')
  getNominas(@Param('id') clubId: string) {
    return this.clubesService.getNominas(clubId);
  }

  @Post(':id/nominas/:nominaId')
  addNomina(@Param('id') clubId: string, @Param('nominaId') nominaId: string) {
    return this.clubesService.addNomina(clubId, nominaId);
  }
}
