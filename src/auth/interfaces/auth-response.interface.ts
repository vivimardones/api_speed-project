// Ruta: src/auth/interfaces/auth-response.interface.ts

import { Rol } from '../enums/rol.enum';

export interface RegisterAdultoResponse {
  success: boolean;
  message: string;
  usuarioId: string;
  loginId: string;
  firebaseUid: string;
  edad: number;
  verificacionEnviada: boolean;
  roles: Rol[];
}

export interface RegisterAdolescenteResponse {
  success: boolean;
  message: string;
  usuarioId: string;
  edad: number;
  tieneLogin: boolean;
  tieneApoderado: boolean;
  loginId?: string;
  firebaseUid?: string;
  verificacionEnviada?: boolean;
  advertencia?: string;
  roles?: Rol[];
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  usuario: {
    id: string;
    loginId: string;
    correo: string;
    primerNombre: string;
    apellidoPaterno: string;
    verificado: boolean;
    roles: Rol[];
  };
}
