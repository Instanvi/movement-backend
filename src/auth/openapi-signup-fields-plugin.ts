import type { BetterAuthPlugin } from 'better-auth';
import { betterAuthSignupAdditionalFieldKeys } from './better-auth-user-fields';

function openApiPropertyForSignupField(
  key: (typeof betterAuthSignupAdditionalFieldKeys)[number],
): Record<string, unknown> {
  return {
    type: 'string',
    description:
      key === 'firstName'
        ? 'Given name'
        : key === 'lastName'
          ? 'Family name'
          : 'Country code or name (e.g. US, NG)',
  };
}

function patchSignUpEmailRequest(doc: Record<string, unknown>): void {
  const post = (
    (doc.paths as Record<string, unknown> | undefined)?.['/sign-up/email'] as
      | Record<string, unknown>
      | undefined
  )?.post as Record<string, unknown> | undefined;
  const schema = (
    (
      (post?.requestBody as Record<string, unknown> | undefined)?.[
        'content'
      ] as Record<string, unknown> | undefined
    )?.['application/json'] as Record<string, unknown> | undefined
  )?.schema as Record<string, unknown> | undefined;
  if (!schema || schema.type !== 'object') return;
  const props = (schema.properties as Record<string, unknown>) ?? {};
  for (const key of betterAuthSignupAdditionalFieldKeys) {
    props[key] = openApiPropertyForSignupField(key);
  }
  schema.properties = props;
  const required = new Set<string>(
    Array.isArray(schema.required) ? (schema.required as string[]) : [],
  );
  for (const key of betterAuthSignupAdditionalFieldKeys) {
    required.add(key);
  }
  schema.required = [...required];
}

function patchSignUpEmailResponseUser(doc: Record<string, unknown>): void {
  const post = (
    (doc.paths as Record<string, unknown> | undefined)?.['/sign-up/email'] as
      | Record<string, unknown>
      | undefined
  )?.post as Record<string, unknown> | undefined;
  const root200 = (
    (
      (post?.responses as Record<string, unknown> | undefined)?.['200'] as
        | Record<string, unknown>
        | undefined
    )?.content as Record<string, unknown> | undefined
  )?.['application/json'] as Record<string, unknown> | undefined;
  const rootSchema = root200?.schema as Record<string, unknown> | undefined;
  const userSchema = (
    rootSchema?.properties as Record<string, unknown> | undefined
  )?.['user'] as Record<string, unknown> | undefined;
  if (!userSchema || userSchema.type !== 'object') return;
  const props = (userSchema.properties as Record<string, unknown>) ?? {};
  for (const key of betterAuthSignupAdditionalFieldKeys) {
    props[key] = openApiPropertyForSignupField(key);
  }
  userSchema.properties = props;
  const required = new Set<string>(
    Array.isArray(userSchema.required) ? (userSchema.required as string[]) : [],
  );
  for (const key of betterAuthSignupAdditionalFieldKeys) {
    required.add(key);
  }
  userSchema.required = [...required];
}

/**
 * Better Auth’s bundled OpenAPI metadata for `POST /sign-up/email` does not list
 * `user.additionalFields`. This plugin rewrites the `/open-api/generate-schema` JSON
 * so Scalar shows the same fields you require at sign-up.
 *
 * Register **after** `openAPI()` (first `onResponse` return wins in Better Auth).
 */
export function openApiSignupFieldsDocPlugin(): BetterAuthPlugin {
  return {
    id: 'open-api-signup-fields-doc',
    async onResponse(response) {
      const ct = response.headers.get('content-type') ?? '';
      if (response.status !== 200 || !ct.includes('application/json')) {
        return;
      }
      let doc: Record<string, unknown>;
      try {
        doc = (await response.clone().json()) as Record<string, unknown>;
      } catch {
        return;
      }
      if (doc.openapi == null || doc.paths == null) {
        return;
      }
      patchSignUpEmailRequest(doc);
      patchSignUpEmailResponseUser(doc);
      const headers = new Headers(response.headers);
      headers.delete('content-length');
      headers.delete('content-encoding');
      return {
        response: new Response(JSON.stringify(doc), {
          status: response.status,
          statusText: response.statusText,
          headers,
        }),
      };
    },
  };
}
