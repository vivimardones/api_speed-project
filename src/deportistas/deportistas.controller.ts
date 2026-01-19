import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { DeportistasService } from './deportistas.service';

@Controller('deportistas')
export class DeportistasController {
  constructor(private readonly deportistasService: DeportistasService) {}

  @Get()
  findAll() {
    return this.deportistasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.deportistasService.findOne(id);
  }

  @Post()
  create(@Body() deportistaData: any) {
    return this.deportistasService.create(deportistaData);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() deportistaData: any) {
    return this.deportistasService.update(id, deportistaData);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.deportistasService.remove(id);
  }

  // Relaciones según el diagrama MER
  @Get(':id/usuario')
  getUsuario(@Param('id') deportistaId: string) {
    return this.deportistasService.getUsuario(deportistaId);
  }

  @Post(':id/usuario/:usuarioId')
  assignUsuario(
    @Param('id') deportistaId: string,
    @Param('usuarioId') usuarioId: string,
  ) {
    return this.deportistasService.assignUsuario(deportistaId, usuarioId);
  }

  @Get(':id/vehiculo')
  getVehiculo(@Param('id') deportistaId: string) {
    return this.deportistasService.getVehiculo(deportistaId);
  }

  @Post(':id/vehiculo/:vehiculoId')
  assignVehiculo(
    @Param('id') deportistaId: string,
    @Param('vehiculoId') vehiculoId: string,
  ) {
    return this.deportistasService.assignVehiculo(deportistaId, vehiculoId);
  }

  @Get(':id/inscripciones')
  getInscripciones(@Param('id') deportistaId: string) {
    return this.deportistasService.getInscripciones(deportistaId);
  }

  @Get(':id/asistencias')
  getAsistencias(@Param('id') deportistaId: string) {
    return this.deportistasService.getAsistencias(deportistaId);
  }

  @Get(':id/pagos')
  getPagos(@Param('id') deportistaId: string) {
    return this.deportistasService.getPagos(deportistaId);
  }

  @Get('categoria/:categoriaId')
  getDeportistasByCategoria(@Param('categoriaId') categoriaId: string) {
    return this.deportistasService.getDeportistasByCategoria(categoriaId);
  }
}
