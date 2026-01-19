import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { RamasDeportivasService } from './ramas-deportivas.service';

@Controller('ramas-deportivas')
export class RamasDeportivasController {
  constructor(
    private readonly ramasDeportivasService: RamasDeportivasService,
  ) {}

  @Get()
  findAll() {
    return this.ramasDeportivasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ramasDeportivasService.findOne(id);
  }

  @Post()
  create(@Body() ramaData: any) {
    return this.ramasDeportivasService.create(ramaData);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() ramaData: any) {
    return this.ramasDeportivasService.update(id, ramaData);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ramasDeportivasService.remove(id);
  }

  // Relaciones según el diagrama MER
  @Get(':id/club')
  getClub(@Param('id') ramaId: string) {
    return this.ramasDeportivasService.getClub(ramaId);
  }

  @Post(':id/club/:clubId')
  assignClub(@Param('id') ramaId: string, @Param('clubId') clubId: string) {
    return this.ramasDeportivasService.assignClub(ramaId, clubId);
  }

  @Get(':id/noticias')
  getNoticias(@Param('id') ramaId: string) {
    return this.ramasDeportivasService.getNoticias(ramaId);
  }

  @Post(':id/noticias/:noticiaId')
  addNoticia(
    @Param('id') ramaId: string,
    @Param('noticiaId') noticiaId: string,
  ) {
    return this.ramasDeportivasService.addNoticia(ramaId, noticiaId);
  }

  @Get('club/:clubId')
  getRamasByClub(@Param('clubId') clubId: string) {
    return this.ramasDeportivasService.getRamasByClub(clubId);
  }

  @Get('nombre/:nombre')
  getRamasByNombre(@Param('nombre') nombre: string) {
    return this.ramasDeportivasService.getRamasByNombre(nombre);
  }
}
