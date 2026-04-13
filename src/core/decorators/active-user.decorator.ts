import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Custom decorator to extract the active user from the BetterAuth session.
 * BetterAuth attaches the session (including the user) to the request object.
 */
export const ActiveUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    // In nestjs-better-auth, the guard usually populates req.user with the session user
    const user = request.user;

    return data ? user?.[data] : user;
  },
);

export class ActiveUserEntity {
  id: string;
  email: string;
  emailVerified: boolean;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  image?: string;
  firstName: string;
  lastName: string;
  country: string;
}
