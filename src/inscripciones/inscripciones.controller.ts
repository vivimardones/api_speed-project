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
  constructor(private readonly InscripcionesService: InscripcionesService) {}

  @Get()
  findAll() {
    return this.InscripcionesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.InscripcionesService.findOne(id);
  }

  @Post()
  create(@Body() inscripcion: CreateInscripcionDto) {
    return this.InscripcionesService.create(inscripcion);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() inscripcion: CreateInscripcionDto) {
    return this.InscripcionesService.update(id, inscripcion);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.InscripcionesService.remove(id);
  }
}
