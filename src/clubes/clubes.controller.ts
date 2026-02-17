import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Param,
  Body,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ClubesService } from './clubes.service';
import { ICreateClubDto } from './interfaces/club.interface';
import { IMulterFile } from './interfaces/multer.interface';
import { ImageFileValidator } from './validators/image-file.validator';

@Controller('clubes')
export class ClubesController {
  constructor(private readonly clubesService: ClubesService) {}

  @Get()
  findAll() {
    return this.clubesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clubesService.findOne(id);
  }

  @Post()
  create(@Body() clubData: ICreateClubDto) {
    return this.clubesService.create(clubData);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() clubData: Partial<ICreateClubDto>) {
    return this.clubesService.update(id, clubData);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.clubesService.remove(id);
  }

  @Post(':id/upload-image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @Param('id') clubId: string,
    @Body('type') type: 'escudo' | 'insignia',
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new ImageFileValidator(),
        ],
      }),
    )
    file: IMulterFile,
  ) {
    return this.clubesService.uploadImage(file, clubId, type);
  }

  @Delete(':id/delete-image/:type')
  deleteImage(
    @Param('id') clubId: string,
    @Param('type') type: 'escudo' | 'insignia',
  ) {
    return this.clubesService.deleteImage(clubId, type);
  }

  @Get(':id/usuarios')
  getUsuarios(@Param('id') clubId: string) {
    return this.clubesService.getUsuarios(clubId);
  }

  @Post(':id/usuarios/:usuarioId')
  addUsuario(
    @Param('id') clubId: string,
    @Param('usuarioId') usuarioId: string,
  ) {
    return this.clubesService.addUsuario(clubId, usuarioId);
  }

  @Get(':id/ramas-deportivas')
  getRamasDeportivas(@Param('id') clubId: string) {
    return this.clubesService.getRamasDeportivas(clubId);
  }

  @Post(':id/ramas-deportivas')
  createRamaDeportiva(@Param('id') clubId: string, @Body() ramaData: any) {
    return this.clubesService.createRamaDeportiva(clubId, ramaData);
  }

  @Get(':id/nominas')
  getNominas(@Param('id') clubId: string) {
    return this.clubesService.getNominas(clubId);
  }

  @Post(':id/nominas/:nominaId')
  addNomina(@Param('id') clubId: string, @Param('nominaId') nominaId: string) {
    return this.clubesService.addNomina(clubId, nominaId);
  }

  @Get('search/nombre/:nombre')
  findByNombre(@Param('nombre') nombre: string) {
    return this.clubesService.findByNombre(nombre);
  }

  @Get('search/rut/:rut')
  findByRut(@Param('rut') rut: string) {
    return this.clubesService.findByRut(rut);
  }

  @Get('vigentes/all')
  findVigentes() {
    return this.clubesService.findVigentes();
  }

  @Patch(':id/vigencia')
  updateVigencia(@Param('id') id: string, @Body('vigencia') vigencia: boolean) {
    return this.clubesService.updateVigencia(id, vigencia);
  }
}
