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
    console.log('🔒 JwtAuthGuard: Verificando autenticación...');

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const authHeader = request.headers.authorization;

    console.log(
      '📋 Authorization header:',
      authHeader ? '✅ Presente' : '❌ Falta',
    );

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ JwtAuthGuard: No hay token Bearer');
      throw new UnauthorizedException(
        'No se proporcionó token de autenticación',
      );
    }

    const token = authHeader.split('Bearer ')[1];

    if (!token) {
      console.log('❌ JwtAuthGuard: Token vacío');
      throw new UnauthorizedException('Token inválido');
    }

    console.log(
      '🔑 Token presente (primeros 20 chars):',
      token.substring(0, 20) + '...',
    );

    try {
      // Verificar el token con Firebase Admin
      console.log('🔍 Verificando token con Firebase Admin...');
      const decodedToken = await auth.verifyIdToken(token);

      console.log('✅ Token verificado:', {
        uid: decodedToken.uid,
        email: decodedToken.email,
      });

      // Validar que el token tenga uid y email
      if (!decodedToken.uid || !decodedToken.email) {
        console.log('❌ Token sin uid o email');
        throw new UnauthorizedException('Token inválido: falta uid o email');
      }

      // Adjuntar la información del usuario al request
      request.user = {
        firebaseUid: decodedToken.uid,
        email: decodedToken.email,
        emailVerified: decodedToken.email_verified || false,
      };

      console.log('✅ JwtAuthGuard: Usuario adjuntado al request');
      return true;
    } catch (error) {
      console.log('❌ Error al verificar token:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Token inválido o expirado';
      throw new UnauthorizedException(errorMessage);
    }
  }
}
