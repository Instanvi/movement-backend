import { Request } from 'express';

/** Populated by `@thallesp/nestjs-better-auth` `AuthGuard` from `getSession().user`. */
export interface AuthUserPayload {
  id: string;
  email?: string;
  emailVerified?: boolean;
  name?: string;
  image?: string | null;
  firstName?: string;
  lastName?: string;
  country?: string;
}

/** `getSession()` result attached as `request.session` by `AuthGuard`. */
export interface BetterAuthSessionPayload {
  user: AuthUserPayload;
  session: Record<string, unknown>;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUserPayload | null;
  session?: BetterAuthSessionPayload | null;
  member?: unknown;
}
