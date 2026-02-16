// Ruta: src/usuarios/interfaces/usuario-response.interface.ts

import { Timestamp } from 'firebase/firestore';

export interface CreateUsuarioResponse {
  success: boolean;
  message: string;
  id: string;
  edad: number;
  requiereApoderado: boolean;
  tieneLogin: boolean;
  tieneApoderado: boolean;
  advertencia?: string; // Opcional
  usuario: {
    id: string;
    primerNombre: string;
    segundoNombre: string | null;
    tercerNombre: string | null;
    apellidoPaterno: string;
    apellidoMaterno: string;
    fechaNacimiento: string;
    sexo: string;
    tipoIdentificador: string;
    numeroIdentificador: string;
    telefono: string;
    telefonoEmergencia: string | null;
    loginId: string | null;
    estado: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
  };
}

export interface UpdateUsuarioResponse {
  success: boolean;
  message: string;
  id: string;
}

export interface DeleteUsuarioResponse {
  success: boolean;
  message: string;
  id: string;
}
