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
  findAll() {
    return this.noticiasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.noticiasService.findOne(id);
  }

  @Post()
  create(@Body() noticia: CreateNoticiaDto) {
    return this.noticiasService.create(noticia);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() noticia: CreateNoticiaDto) {
    return this.noticiasService.update(id, noticia);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.noticiasService.remove(id);
  }
}
