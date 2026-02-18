// Ruta: src/usuarios/usuarios.controller.ts

import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto, UpdateUsuarioDto } from './dto';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  /**
   * POST /usuarios
   * Crear un nuevo usuario
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuariosService.create(createUsuarioDto);
  }

  /**
   * PUT /usuarios/:id
   * Actualizar completamente un usuario por ID
   */
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  updatePut(
    @Param('id') id: string,
    @Body() updateUsuarioDto: UpdateUsuarioDto,
  ) {
    return this.usuariosService.update(id, updateUsuarioDto);
  }

  /**
   * GET /usuarios
   * Obtener todos los usuarios
   */
  @Get()
  findAll() {
    return this.usuariosService.findAll();
  }

  /**
   * GET /usuarios/:id
   * Obtener un usuario por ID
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usuariosService.findOne(id);
  }

  /**
   * GET /usuarios/login/:loginId
   * Buscar usuario por loginId
   */
  @Get('login/:loginId')
  findByLoginId(@Param('loginId') loginId: string) {
    return this.usuariosService.findByLoginId(loginId);
  }

  /**
   * GET /usuarios/identificador/:numero
   * Buscar usuario por número de identificador
   */
  @Get('identificador/:numero')
  findByIdentificador(@Param('numero') numero: string) {
    return this.usuariosService.findByIdentificador(numero);
  }

  /**
   * PATCH /usuarios/:id
   * Actualizar un usuario
   */
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUsuarioDto: UpdateUsuarioDto) {
    return this.usuariosService.update(id, updateUsuarioDto);
  }

  /**
   * DELETE /usuarios/:id
   * Desactivar un usuario (soft delete)
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.usuariosService.remove(id);
  }

  /**
   * DELETE /usuarios/:id/permanent
   * Eliminar permanentemente un usuario
   */
  @Delete(':id/permanent')
  @HttpCode(HttpStatus.OK)
  removePermanently(@Param('id') id: string) {
    return this.usuariosService.removePermanently(id);
  }
}
