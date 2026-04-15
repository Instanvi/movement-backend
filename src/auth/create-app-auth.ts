import { betterAuth, type Auth } from 'better-auth';
import { APIError } from 'better-auth/api';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { openAPI } from 'better-auth/plugins';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as appSchema from '../core/schema';
import { betterAuthUserAdditionalFields } from './better-auth-user-fields';

import {
  sendPasswordResetEmailResend,
  sendVerificationEmailResend,
} from './email/resend-auth-emails';

type AppDatabase = NodePgDatabase<typeof appSchema>;

/**
 * Nest's AuthModule registers two async providers that both invoke `useFactory`.
 * Better Auth must be a single instance, so we cache it here (DB provider is a singleton).
 */
let authSingleton: Auth | undefined;

function resolveSecret(): string {
  const fromEnv = process.env.BETTER_AUTH_SECRET;
  if (fromEnv) {
    return fromEnv;
  }
  if (process.env.NODE_ENV === 'production') {
    throw new Error('BETTER_AUTH_SECRET is required in production');
  }
  return 'dev-only-secret-min-32-characters-long!!';
}

function parseTrustedOrigins(): string[] {
  const raw = process.env.BETTER_AUTH_TRUSTED_ORIGINS;
  if (raw?.trim()) {
    return raw.split(',').map((o) => o.trim());
  }
  return ['http://localhost:5550', 'http://localhost:3000'];
}

function signupStringField(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

/**
 * Better Auth for Nest: email/password, verification, and password-reset routes.
 * HTTP handler is mounted at `/api/auth/*` by `@mguay/nestjs-better-auth` (keep `basePath` in sync).
 *
 * Sign-up body: `name` (Better Auth default), `email`, `password`, plus `firstName`, `lastName`,
 * `country` (see `betterAuthUserAdditionalFields`). `name` is set from first + last before insert.
 */
export function createAppAuth(database: AppDatabase) {
  if (!authSingleton) {
    const baseURL = process.env.BETTER_AUTH_URL ?? 'http://localhost:5550';

    authSingleton = betterAuth({
      appName: process.env.AUTH_EMAIL_APP_NAME?.trim() || 'auth-config',
      secret: resolveSecret(),
      baseURL,
      basePath: '/api/auth',
      trustedOrigins: parseTrustedOrigins(),
      database: drizzleAdapter(database, { provider: 'pg' }),
      user: {
        additionalFields: betterAuthUserAdditionalFields,
      },
      session: {
        deferSessionRefresh: true,
      },
      databaseHooks: {
        user: {
          create: {
            before: (data) => {
              const firstName = signupStringField(data.firstName);
              const lastName = signupStringField(data.lastName);
              const country = signupStringField(data.country);
              if (!firstName || !lastName || !country) {
                throw new APIError('BAD_REQUEST', {
                  message:
                    'firstName, lastName, and country are required and cannot be blank',
                });
              }
              const nameFromParts = `${firstName} ${lastName}`.trim();
              const name =
                nameFromParts ||
                (typeof data.name === 'string' ? data.name.trim() : '');
              return Promise.resolve({
                data: {
                  ...data,
                  firstName,
                  lastName,
                  country,
                  name,
                },
              });
            },
          },
        },
      },
      emailAndPassword: {
        enabled: true,
        requireEmailVerification:
          process.env.AUTH_REQUIRE_EMAIL_VERIFICATION === 'true',
        sendResetPassword: async ({ user, url }) => {
          await sendPasswordResetEmailResend({ user, url });
        },
      },
      emailVerification: {
        sendVerificationEmail: async ({ user, url }) => {
          await sendVerificationEmailResend({ user, url });
        },
        sendOnSignUp: true,
        sendOnSignIn: false,
        autoSignInAfterVerification: true,
      },
      plugins: [openAPI()],
      advanced: {
        database: {
          generateId: 'uuid',
        },
      },
    }) as unknown as Auth;
  }

  return {
    auth: authSingleton,
    options: { disableTrustedOriginsCors: true } as const,
  };
}
