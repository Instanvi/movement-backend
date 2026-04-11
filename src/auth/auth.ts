import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import * as schema from '../core/schema/auth-schema';
import { betterAuthUserAdditionalFields } from './better-auth-user-fields';

/**
 * Standalone Better Auth instance (e.g. CLI / scripts). Nest uses {@link createAppAuth} instead.
 * `user.additionalFields` must match the `user` table in Drizzle — see `betterAuthUserAdditionalFields`.
 */
export const auth = betterAuth({
  database: drizzleAdapter(schema, {
    provider: 'pg',
  }),
  user: {
    additionalFields: betterAuthUserAdditionalFields,
  },
  advanced: {
    database: {
      generateId: 'uuid',
    },
  },
});
