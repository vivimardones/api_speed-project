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
  segundoNombre?: string;
  tercerNombre?: string;
  apellidoPaterno: string;
  apellidoMaterno: string;

  // Datos personales
  fechaNacimiento: string; // ← SIN el signo ? (ahora es obligatorio)
  sexo: Sexo;

  // Identificación
  tipoIdentificador: TipoIdentificador;
  numeroIdentificador: string;

  // Contacto
  telefono: string;
  telefonoEmergencia?: string;

  // Metadata
  estado: 'activo' | 'inactivo';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
