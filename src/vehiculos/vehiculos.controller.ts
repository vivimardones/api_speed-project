import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { VehiculosService } from './vehiculos.service';
import { CreateVehiculoDto } from './CreateVehiculoDto';

@Controller('vehiculos')
export class VehiculosController {
  constructor(private readonly vehiculosService: VehiculosService) {}

  @Get()
  findAll() {
    return this.vehiculosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vehiculosService.findOne(id);
  }

  @Post()
  create(@Body() vehiculo: CreateVehiculoDto) {
    return this.vehiculosService.create(vehiculo);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() vehiculo: Partial<CreateVehiculoDto>,
  ) {
    return this.vehiculosService.update(id, vehiculo);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.vehiculosService.remove(id);
  }

  // Relaciones según el diagrama MER
  @Get(':id/usuario')
  getUsuario(@Param('id') vehiculoId: string) {
    return this.vehiculosService.getUsuario(vehiculoId);
  }

  @Post(':id/usuario/:usuarioId')
  assignUsuario(
    @Param('id') vehiculoId: string,
    @Param('usuarioId') usuarioId: string,
  ) {
    return this.vehiculosService.assignUsuario(vehiculoId, usuarioId);
  }

  @Get(':id/deportista')
  getDeportista(@Param('id') vehiculoId: string) {
    return this.vehiculosService.getDeportista(vehiculoId);
  }

  @Post(':id/deportista/:deportistaId')
  assignDeportista(
    @Param('id') vehiculoId: string,
    @Param('deportistaId') deportistaId: string,
  ) {
    return this.vehiculosService.assignDeportista(vehiculoId, deportistaId);
  }

  @Get('usuario/:usuarioId')
  getVehiculosByUsuario(@Param('usuarioId') usuarioId: string) {
    return this.vehiculosService.getVehiculosByUsuario(usuarioId);
  }

  @Get('marca/:marca')
  getVehiculosByMarca(@Param('marca') marca: string) {
    return this.vehiculosService.getVehiculosByMarca(marca);
  }
}
