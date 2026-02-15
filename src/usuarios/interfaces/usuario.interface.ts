// Ruta: src/usuarios/interfaces/usuario.interface.ts

import { Timestamp } from 'firebase/firestore';

export type TipoIdentificador =
  | 'RUT'
  | 'PASAPORTE'
  | 'RUT_PROVISORIO'
  | 'IDENTIFICADOR_EXTRANJERO';

export type Sexo = 'femenino' | 'masculino';

export interface IUsuario {
  id: string;
  loginId: string | null; // null para menores de 10 años

  // Nombres
  primerNombre: string;
  segundoNombre?: string; // opcional
  tercerNombre?: string; // opcional
  apellidoPaterno: string;
  apellidoMaterno: string;

  sexo: Sexo;

  // Identificación
  tipoIdentificador: TipoIdentificador;
  numeroIdentificador: string; // único, sin formato

  // Contacto
  telefono: string; // formato +56912345678
  telefonoEmergencia?: string; // opcional

  // Metadata
  estado: 'activo' | 'inactivo';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
