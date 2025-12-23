import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { CreateAsistenciaDto } from './CreateAsistenciaDto';
import { AsistenciaService } from './asistencia.service';

@Controller('asistencia')
export class AsistenciaController {
  constructor(private readonly asistenciaService: AsistenciaService) {}

  @Get()
  findAll() {
    return this.asistenciaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.asistenciaService.findOne(id);
  }

  @Post()
  create(@Body() asistencia: CreateAsistenciaDto) {
    return this.asistenciaService.create(asistencia);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() asistencia: CreateAsistenciaDto) {
    return this.asistenciaService.update(id, asistencia);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.asistenciaService.remove(id);
  }
}
