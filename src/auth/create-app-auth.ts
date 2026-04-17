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

/**
 * Hosts allowed for `callbackURL` / redirects (see origin checks on routes like `/verify-email`).
 * Per Better Auth, include every origin you pass as `callbackURL` (e.g. your real frontend).
 * @see https://better-auth.com/docs/concepts/email
 */
function parseTrustedOrigins(): string[] {
  const raw = process.env.BETTER_AUTH_TRUSTED_ORIGINS;
  const origins = raw?.trim()
    ? raw
        .split(',')
        .map((o) => o.trim())
        .filter(Boolean)
    : ['http://localhost:5550', 'http://localhost:3000'];

  const merged = new Set(origins);

  const addOrigin = (urlString: string | undefined) => {
    if (!urlString?.trim()) return;
    try {
      const u = new URL(urlString.trim());
      merged.add(`${u.protocol}//${u.host}`);
    } catch {
      /* ignore invalid URL */
    }
  };

  addOrigin(process.env.BETTER_AUTH_URL);
  addOrigin(process.env.FRONTEND_URL);

  return [...merged];
}

function signupStringField(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

/**
 * Better Auth for Nest: email/password, verification, and password-reset routes.
 * HTTP handler is mounted at `/api/auth/*` by `@thallesp/nestjs-better-auth` (keep `basePath` in sync).
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
        // Docs: ({ user, url, token }, request). Return Promise<void> without awaiting Resend (fire-and-forget + log).
        sendResetPassword: ({ user, url }) =>
          Promise.resolve().then(() => {
            void sendPasswordResetEmailResend({ user, url }).catch((err) => {
              console.error('[BetterAuth] sendResetPassword email failed', err);
            });
          }),
      },
      emailVerification: {
        sendVerificationEmail: ({ user, url }) =>
          Promise.resolve().then(() => {
            void sendVerificationEmailResend({ user, url }).catch((err) => {
              console.error('[BetterAuth] sendVerificationEmail failed', err);
            });
          }),
        sendOnSignUp: true,
        // When `emailAndPassword.requireEmailVerification` is true, sign-in with a valid
        // password but unverified email sends another verification email, then returns
        // EMAIL_NOT_VERIFIED (see better-auth sign-in flow).
        sendOnSignIn: process.env.AUTH_SEND_VERIFICATION_ON_SIGNIN !== 'false',
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

  return authSingleton;
}
