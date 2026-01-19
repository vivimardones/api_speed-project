import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { CategoriasService } from './categorias.service';

@Controller('categorias')
export class CategoriasController {
  constructor(private readonly categoriasService: CategoriasService) {}

  @Get()
  findAll() {
    return this.categoriasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriasService.findOne(id);
  }

  @Post()
  create(@Body() categoriaData: any) {
    return this.categoriasService.create(categoriaData);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() categoriaData: any) {
    return this.categoriasService.update(id, categoriaData);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoriasService.remove(id);
  }

  // Relaciones según el diagrama MER
  @Get(':id/serie')
  getSerie(@Param('id') categoriaId: string) {
    return this.categoriasService.getSerie(categoriaId);
  }

  @Post(':id/serie/:serieId')
  assignSerie(
    @Param('id') categoriaId: string,
    @Param('serieId') serieId: string,
  ) {
    return this.categoriasService.assignSerie(categoriaId, serieId);
  }

  @Get(':id/deportistas')
  getDeportistas(@Param('id') categoriaId: string) {
    return this.categoriasService.getDeportistas(categoriaId);
  }

  @Get('serie/:serieId')
  getCategoriasBySerie(@Param('serieId') serieId: string) {
    return this.categoriasService.getCategoriasBySerie(serieId);
  }

  @Get('nombre/:nombre')
  getCategoriasByNombre(@Param('nombre') nombre: string) {
    return this.categoriasService.getCategoriasByNombre(nombre);
  }
}
