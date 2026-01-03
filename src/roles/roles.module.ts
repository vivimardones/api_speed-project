import { Module } from '@nestjs/common';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';

@Module({
  controllers: [RolesController],
  providers: [RolesService],
  exports: [RolesService], // 👈 para usarlo en Auth o Usuarios
})
export class RolesModule {}
