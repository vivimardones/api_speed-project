// Ruta: src/shared/shared.module.ts

import { Module, Global } from '@nestjs/common';
import { EdadService } from './edad.service';
import { RutService } from './rut.service';

/**
 * Módulo compartido con servicios reutilizables
 * @Global permite que sus providers estén disponibles en toda la app
 * sin necesidad de importar el módulo en cada lugar
 */
@Global()
@Module({
  providers: [EdadService, RutService],
  exports: [EdadService, RutService],
})
export class SharedModule {}
