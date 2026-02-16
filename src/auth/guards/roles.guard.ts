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
    console.log('🔐 RolesGuard: Verificando roles...');

    // Obtener los roles requeridos del decorador @Roles()
    const requiredRoles = this.reflector.getAllAndOverride<Rol[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    console.log('📋 Roles requeridos:', requiredRoles);

    // Si no hay roles requeridos, permitir acceso
    if (!requiredRoles || requiredRoles.length === 0) {
      console.log('✅ RolesGuard: No hay roles requeridos, acceso permitido');
      return true;
    }

    // Obtener el usuario del request (adjuntado por JwtAuthGuard)
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    console.log('👤 Usuario del request:', user);

    if (!user || !user.firebaseUid) {
      console.log('❌ RolesGuard: Usuario no autenticado');
      throw new ForbiddenException('Usuario no autenticado');
    }

    try {
      // Obtener el usuarioId desde la colección logins usando firebaseUid
      console.log('🔍 Buscando usuarioId en Firestore...');
      const usuarioId = await this.obtenerUsuarioIdPorFirebaseUid(
        user.firebaseUid,
      );

      console.log('🆔 Usuario ID encontrado:', usuarioId);

      if (!usuarioId) {
        console.log('❌ Usuario no encontrado en Firestore');
        throw new ForbiddenException('Usuario no encontrado en el sistema');
      }

      // Obtener los roles del usuario desde Firestore
      console.log('🔍 Buscando roles del usuario...');
      const userRoles = await this.obtenerRolesDeUsuario(usuarioId);

      console.log('🎭 Roles del usuario:', userRoles);

      // Adjuntar usuarioId y roles al request para uso posterior
      user.usuarioId = usuarioId;
      user.roles = userRoles;

      // Verificar si el usuario tiene al menos uno de los roles requeridos
      const hasRole = requiredRoles.some((role) => userRoles.includes(role));

      console.log('✅ ¿Tiene rol requerido?', hasRole);

      if (!hasRole) {
        console.log('❌ RolesGuard: Acceso denegado');
        throw new ForbiddenException(
          `Acceso denegado. Se requiere uno de los siguientes roles: ${requiredRoles.join(', ')}`,
        );
      }

      console.log('✅ RolesGuard: Acceso permitido');
      return true;
    } catch (error) {
      console.log('❌ Error en RolesGuard:', error);
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
    try {
      const loginsRef = collection(db, 'logins');
      const q = query(loginsRef, where('firebaseUid', '==', firebaseUid));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        console.log('⚠️ No se encontró login para firebaseUid:', firebaseUid);
        return null;
      }

      const loginData = snapshot.docs[0].data();
      console.log('📄 Login data:', loginData);
      return (loginData['usuarioId'] as string) || null;
    } catch (error) {
      console.log('❌ Error al obtener usuarioId:', error);
      throw error;
    }
  }

  /**
   * Obtener roles del usuario desde Firestore
   */
  private async obtenerRolesDeUsuario(usuarioId: string): Promise<Rol[]> {
    try {
      const rolesRef = collection(db, 'usuario_roles');
      const q = query(
        rolesRef,
        where('usuarioId', '==', usuarioId),
        where('activo', '==', true),
      );
      const rolesSnapshot = await getDocs(q);

      console.log('📊 Documentos de roles encontrados:', rolesSnapshot.size);

      return rolesSnapshot.docs.map((doc) => {
        console.log('📄 Rol doc:', doc.data());
        return doc.data()['rol'] as Rol;
      });
    } catch (error) {
      console.log('❌ Error al obtener roles:', error);
      throw error;
    }
  }
}
