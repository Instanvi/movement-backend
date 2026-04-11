import type { BetterAuthOptions } from 'better-auth';

/**
 * Extra `user` columns beyond Better Auth’s built-in model.
 * Keep in lockstep with {@link ../core/schema/user.schema.ts}.
 */
export const betterAuthUserAdditionalFields = {
  firstName: {
    type: 'string',
    required: true,
  },
  lastName: {
    type: 'string',
    required: true,
  },
  country: {
    type: 'string',
    required: true,
  },
  archivedAt: {
    type: 'date',
    required: false,
    input: false,
  },
} satisfies NonNullable<BetterAuthOptions['user']>['additionalFields'];

/** Shown on email sign-up and in patched OpenAPI docs (`archivedAt` is server-only). */
export const betterAuthSignupAdditionalFieldKeys = [
  'firstName',
  'lastName',
  'country',
] as const satisfies ReadonlyArray<keyof typeof betterAuthUserAdditionalFields>;
