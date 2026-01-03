import { Injectable } from '@nestjs/common';
import { CreateRolDto } from './CreateRolDto';

@Injectable()
export class RolesService {
  private roles: CreateRolDto[] = []; // 👈 simulación en memoria, luego lo conectas a DB

  create(dto: CreateRolDto) {
    const rol = { ...dto };
    this.roles.push(rol);
    return rol;
  }

  findAll() {
    return this.roles;
  }

  findOne(nombre: string) {
    return this.roles.find((r) => r.nombre === nombre);
  }
}
