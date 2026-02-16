// Ruta: src/auth/decorators/get-user.decorator.ts

import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Rol } from '../enums/rol.enum';

export interface UserFromToken {
  firebaseUid: string;
  email: string;
  emailVerified: boolean;
  usuarioId?: string;
  roles?: Rol[];
}

export const GetUser = createParamDecorator(
  (
    data: keyof UserFromToken | undefined,
    ctx: ExecutionContext,
  ): UserFromToken | string | boolean | Rol[] | undefined => {
    const request = ctx.switchToHttp().getRequest<{ user: UserFromToken }>();
    const user = request.user;

    // Si se especifica un campo, retornar solo ese campo
    if (data && user) {
      return user[data];
    }

    // Retornar todo el objeto user
    return user;
  },
);
