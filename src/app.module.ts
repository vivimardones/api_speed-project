import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsuariosModule } from './usuarios/usuarios.module';
import { AsistenciaController } from './asistencia/asistencia.controller';
import { InscripcionesController } from './inscripciones/inscripciones.controller';
import { PagosController } from './pagos/pagos.controller';
import { NoticiasController } from './noticias/noticias.controller';
import { CampeonatosModule } from './campeonatos/campeonatos.module';
import { InscripcionesModule } from './inscripciones/inscripciones.module';
import { AsistenciaModule } from './asistencia/asistencia.module';
import { PagosModule } from './pagos/pagos.module';
import { NoticiasModule } from './noticias/noticias.module';
import { VehiculosController } from './vehiculos/vehiculos.controller';
import { VehiculosModule } from './vehiculos/vehiculos.module';
import { RolesController } from './roles/roles.controller';
import { RolesService } from './roles/roles.service';
import { RolesModule } from './roles/roles.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    UsuariosModule,
    CampeonatosModule,
    InscripcionesModule,
    AsistenciaModule,
    PagosModule,
    NoticiasModule,
    VehiculosModule,
    RolesModule,
  ],
  controllers: [
    AsistenciaController,
    InscripcionesController,
    PagosController,
    NoticiasController,
    VehiculosController,
    RolesController,
  ],
  providers: [RolesService],
})
export class AppModule {}
