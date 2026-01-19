import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsuariosModule } from './usuarios/usuarios.module';
import { CampeonatosModule } from './campeonatos/campeonatos.module';
import { InscripcionesModule } from './inscripciones/inscripciones.module';
import { AsistenciaModule } from './asistencia/asistencia.module';
import { PagosModule } from './pagos/pagos.module';
import { NoticiasModule } from './noticias/noticias.module';
import { VehiculosModule } from './vehiculos/vehiculos.module';
import { AuthModule } from './auth/auth.module';
import { DeportistasModule } from './deportistas/deportistas.module';
import { ClubesModule } from './clubes/clubes.module';
import { CategoriasModule } from './categorias/categorias.module';
import { SeriesModule } from './series/series.module';
import { NominasModule } from './nominas/nominas.module';
import { RamasDeportivasModule } from './ramas-deportivas/ramas-deportivas.module';
import { EntrenamientosModule } from './entrenamientos/entrenamientos.module';

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
    AuthModule,
    DeportistasModule,
    ClubesModule,
    CategoriasModule,
    SeriesModule,
    NominasModule,
    RamasDeportivasModule,
    EntrenamientosModule,
  ],
})
export class AppModule {}
