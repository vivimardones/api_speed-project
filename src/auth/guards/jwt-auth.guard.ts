// Ruta: src/auth/guards/jwt-auth.guard.ts

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { auth } from '../../firebase.config';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Usar tipo Request de express directamente para evitar error de tipado
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader =
      request.headers['authorization'] || request.headers['Authorization'];

    if (
      !authHeader ||
      typeof authHeader !== 'string' ||
      !authHeader.startsWith('Bearer ')
    ) {
      throw new UnauthorizedException(
        'No se proporcionó token de autenticación',
      );
    }

    const token = authHeader.slice(7).trim(); // Quita 'Bearer '

    if (!token) {
      throw new UnauthorizedException('Token inválido');
    }

    try {
      const decodedToken = await auth.verifyIdToken(token);
      if (!decodedToken.uid || !decodedToken.email) {
        throw new UnauthorizedException('Token inválido: falta uid o email');
      }
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
