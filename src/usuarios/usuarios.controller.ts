import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { CreateUsuarioDto } from './CreateUsuarioDto';
import { UsuariosService } from './usuarios.service';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get()
  findAll() {
    return this.usuariosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usuariosService.findOne(id);
  }

  @Post()
  create(@Body() usuario: CreateUsuarioDto) {
    return this.usuariosService.create(usuario);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() usuario: Partial<CreateUsuarioDto>) {
    return this.usuariosService.update(id, usuario);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usuariosService.remove(id);
  }

  // Relaciones según el diagrama MER
  @Get(':id/perfil')
  getPerfil(@Param('id') usuarioId: string) {
    return this.usuariosService.getPerfilUsuario(usuarioId);
  }

  @Post(':id/perfil')
  createPerfil(@Param('id') usuarioId: string, @Body() perfilData: any) {
    return this.usuariosService.createPerfilUsuario(usuarioId, perfilData);
  }

  @Get(':id/vehiculos')
  getVehiculos(@Param('id') usuarioId: string) {
    return this.usuariosService.getVehiculosUsuario(usuarioId);
  }

  @Post(':id/vehiculos/:vehiculoId')
  addVehiculo(
    @Param('id') usuarioId: string,
    @Param('vehiculoId') vehiculoId: string,
  ) {
    return this.usuariosService.addVehiculo(usuarioId, vehiculoId);
  }

  @Get(':id/salud')
  getSalud(@Param('id') usuarioId: string) {
    return this.usuariosService.getSaludUsuario(usuarioId);
  }

  @Post(':id/salud')
  createSalud(@Param('id') usuarioId: string, @Body() saludData: any) {
    return this.usuariosService.createSaludUsuario(usuarioId, saludData);
  }

  @Get(':id/clubs')
  getClubs(@Param('id') usuarioId: string) {
    return this.usuariosService.getClubsUsuario(usuarioId);
  }

  @Post(':id/clubs/:clubId')
  addClub(@Param('id') usuarioId: string, @Param('clubId') clubId: string) {
    return this.usuariosService.addClub(usuarioId, clubId);
  }

  @Get(':id/aportados')
  getAportados(@Param('id') usuarioId: string) {
    return this.usuariosService.getAportadosUsuario(usuarioId);
  }

  @Post(':id/aportados')
  createAportado(@Param('id') usuarioId: string, @Body() aportadoData: any) {
    return this.usuariosService.createAportado(usuarioId, aportadoData);
  }
}
