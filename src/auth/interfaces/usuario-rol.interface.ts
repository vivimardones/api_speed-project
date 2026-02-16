// Ruta: src/auth/interfaces/usuario-rol.interface.ts

import { Timestamp } from 'firebase/firestore';
import { Rol } from '../enums/rol.enum';

export interface IUsuarioRol {
  usuarioId: string;
  rol: Rol;
  activo: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
