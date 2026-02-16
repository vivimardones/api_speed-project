// Ruta: src/auth/guards/roles.guard.ts

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Rol } from '../enums/rol.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase.config';

// Extender el tipo Request para incluir user con roles
interface RequestWithUser extends Request {
  user?: {
    firebaseUid: string;
    email: string;
    emailVerified: boolean;
    usuarioId?: string;
    roles?: Rol[];
  };
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Obtener los roles requeridos del decorador @Roles()
    const requiredRoles = this.reflector.getAllAndOverride<Rol[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Si no hay roles requeridos, permitir acceso
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Obtener el usuario del request (adjuntado por JwtAuthGuard)
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user || !user.firebaseUid) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    try {
      // Obtener el usuarioId desde la colección logins usando firebaseUid
      const usuarioId = await this.obtenerUsuarioIdPorFirebaseUid(
        user.firebaseUid,
      );

      if (!usuarioId) {
        throw new ForbiddenException('Usuario no encontrado en el sistema');
      }

      // Obtener los roles del usuario desde Firestore
      const userRoles = await this.obtenerRolesDeUsuario(usuarioId);

      // Adjuntar usuarioId y roles al request para uso posterior
      user.usuarioId = usuarioId;
      user.roles = userRoles;

      // Verificar si el usuario tiene al menos uno de los roles requeridos
      const hasRole = requiredRoles.some((role) => userRoles.includes(role));

      if (!hasRole) {
        throw new ForbiddenException(
          `Acceso denegado. Se requiere uno de los siguientes roles: ${requiredRoles.join(', ')}`,
        );
      }

      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new ForbiddenException('Error al verificar roles');
    }
  }

  /**
   * Obtener usuarioId desde firebaseUid
   */
  private async obtenerUsuarioIdPorFirebaseUid(
    firebaseUid: string,
  ): Promise<string | null> {
    const loginsRef = collection(db, 'logins');
    const q = query(loginsRef, where('firebaseUid', '==', firebaseUid));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    const loginData = snapshot.docs[0].data();
    return (loginData['usuarioId'] as string) || null;
  }

  /**
   * Obtener roles del usuario desde Firestore
   */
  private async obtenerRolesDeUsuario(usuarioId: string): Promise<Rol[]> {
    const rolesRef = collection(db, 'usuario_roles');
    const q = query(
      rolesRef,
      where('usuarioId', '==', usuarioId),
      where('activo', '==', true),
    );
    const rolesSnapshot = await getDocs(q);

    return rolesSnapshot.docs.map((doc) => {
      return doc.data()['rol'] as Rol;
    });
  }
}
