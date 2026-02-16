// Ruta: src/auth/interfaces/login.interface.ts

import { Timestamp } from 'firebase/firestore';

export interface ILogin {
  id: string;
  firebaseUid: string; // UID de Firebase Auth
  correo: string; // Email del usuario
  usuarioId: string; // Referencia al documento en usuarios
  ultimoAcceso: Timestamp | null;
  intentosFallidos: number;
  bloqueado: boolean;
  verificado: boolean;
  tokenRecuperacion: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
