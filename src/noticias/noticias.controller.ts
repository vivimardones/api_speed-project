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
import { CreateNoticiaDto } from './createNoticiaDto';
import { NoticiasService } from './noticias.service';

@Controller('noticias')
export class NoticiasController {
  constructor(private readonly noticiasService: NoticiasService) {}

  @Get()
  async findAll() {
    return await this.noticiasService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.noticiasService.findOne(id);
  }

  @Post()
  async create(@Body() noticia: CreateNoticiaDto) {
    return await this.noticiasService.create(noticia);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() noticia: CreateNoticiaDto) {
    return await this.noticiasService.update(id, noticia);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.noticiasService.remove(id);
  }

  // Relaciones según el diagrama MER
  @Get(':id/rama-deportiva')
  async getRamaDeportiva(@Param('id') noticiaId: string) {
    return await this.noticiasService.getRamaDeportiva(noticiaId);
  }

  @Post(':id/rama-deportiva/:ramaDeportivaId')
  async assignRamaDeportiva(
    @Param('id') noticiaId: string,
    @Param('ramaDeportivaId') ramaDeportivaId: string,
  ) {
    return await this.noticiasService.assignRamaDeportiva(
      noticiaId,
      ramaDeportivaId,
    );
  }

  @Get('rama-deportiva/:ramaDeportivaId')
  async getNoticiasByRamaDeportiva(
    @Param('ramaDeportivaId') ramaDeportivaId: string,
  ) {
    return await this.noticiasService.getNoticiasByRamaDeportiva(
      ramaDeportivaId,
    );
  }

  @Get('categoria/:categoria')
  async getNoticiasByCategoria(@Param('categoria') categoria: string) {
    return await this.noticiasService.getNoticiasByCategoria(categoria);
  }
}
