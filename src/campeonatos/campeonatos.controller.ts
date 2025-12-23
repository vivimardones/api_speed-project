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
}
