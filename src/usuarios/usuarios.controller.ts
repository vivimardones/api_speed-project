import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  BadRequestException,
} from '@nestjs/common';
import { CreateUsuarioDto } from './CreateUsuarioDto';
import { UsuariosService } from './usuarios.service';
import { RegisterUserDto } from '../auth/registerUserDto';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  // Endpoint especial para crear el primer ADMIN sin autenticación (bootstrap)
  // DEBE estar ANTES de @Post() para que NestJS lo capture
  @Post('bootstrap/admin')
  async createFirstAdmin(@Body() adminData: RegisterUserDto) {
    try {
      // Verificar que no hay admins en el sistema
      const admins = (await this.usuariosService.findByRole(
        'admin',
      )) as unknown as CreateUsuarioDto[];
      if (admins.length > 0) {
        throw new BadRequestException(
          'Ya existe un administrador en el sistema. No se puede crear otro.',
        );
      }

      // Crear el usuario admin con perfil y contraseña
      const nuevoAdmin = await this.usuariosService.createAdminWithProfile({
        nombre: adminData.nombre,
        email: adminData.email,
        password: adminData.password,
        fechaNacimiento: adminData.fechaNacimiento,
        idRol: 'admin',
      });

      return {
        success: true,
        message: 'Administrador creado exitosamente',
        data: nuevoAdmin,
      };
    } catch (error: unknown) {
      console.error('Error al crear admin:', error);
      let message = 'Unknown error';
      if (error instanceof Error) {
        message = error.message;
      } else if (typeof error === 'string') {
        message = error;
      }
      throw new BadRequestException(message);
    }
  }

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
