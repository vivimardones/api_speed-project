export interface RegisterResponse {
  success: boolean;
  message: string;
  usuarioId?: string;
  loginId?: string;
  firebaseUid?: string;
  edad?: number;
  verificacionEnviada?: boolean;
  roles?: string[];
}
