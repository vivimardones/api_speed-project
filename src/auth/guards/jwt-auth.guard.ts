// Ruta: src/auth/guards/jwt-auth.guard.ts

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { auth } from '../../firebase.config';

// Extender el tipo Request para incluir user
interface RequestWithUser extends Request {
  user?: {
    firebaseUid: string;
    email: string;
    emailVerified: boolean;
  };
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'No se proporcionó token de autenticación',
      );
    }

    const token = authHeader.split('Bearer ')[1];

    if (!token) {
      throw new UnauthorizedException('Token inválido');
    }

    try {
      // Verificar el token con Firebase Admin
      const decodedToken = await auth.verifyIdToken(token);

      // Validar que el token tenga uid y email
      if (!decodedToken.uid || !decodedToken.email) {
        throw new UnauthorizedException('Token inválido: falta uid o email');
      }

      // Adjuntar la información del usuario al request
      request.user = {
        firebaseUid: decodedToken.uid,
        email: decodedToken.email,
        emailVerified: decodedToken.email_verified || false,
      };

      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Token inválido o expirado';
      throw new UnauthorizedException(errorMessage);
    }
  }
}
