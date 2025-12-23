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
}
