import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import { type Request } from 'express';

export interface AuthenticatedUser {
  id: string;
  email: string;
  username: string | null;
  name: string | null;
  role: string;
  isActive: boolean;
  isEmailVerified: boolean;
}

export const CurrentUser = createParamDecorator(
  (data: keyof AuthenticatedUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request & { user?: AuthenticatedUser }>();
    const user = request.user;
    if (!user) return null;
    return data ? user[data] : user;
  },
);
