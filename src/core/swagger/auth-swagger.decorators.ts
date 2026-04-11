import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

/**
 * Standard OpenAPI hints for routes protected by Better Auth + church `RolesGuard`.
 */
export function ApiChurchRouteAuth() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiUnauthorizedResponse({
      description:
        'Missing or invalid Better Auth session. Authenticate via `/api/auth/*` on the same origin.',
    }),
    ApiForbiddenResponse({
      description:
        'Church context is missing, the user is not a member of this church (or branch), or the member role is not allowed for this action.',
    }),
  );
}

/**
 * Routes that require a session but do not use `RolesGuard` (e.g. onboarding).
 */
export function ApiBearerSession() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiUnauthorizedResponse({
      description: 'Missing or invalid Better Auth session.',
    }),
  );
}
