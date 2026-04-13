/**
 * Transactional auth email delivery via Resend.
 *
 * Env: `RESEND_API_KEY` (required in production), `RESEND_FROM` (default
 * `Auth <onboarding@resend.dev>`), optional `RESEND_REPLY_TO`,
 * `AUTH_EMAIL_APP_NAME` (matches Better Auth `appName`), `AUTH_REQUIRE_EMAIL_VERIFICATION`.
 */
import { Logger } from '@nestjs/common';
import { Resend } from 'resend';
import {
  passwordResetEmailHtml,
  passwordResetEmailText,
  verificationEmailHtml,
  verificationEmailText,
} from './transactional-templates';

const log = new Logger('ResendAuthMail');

function resolveAppName(): string {
  return process.env.AUTH_EMAIL_APP_NAME?.trim() || 'auth-config';
}

function resolveFrom(): string {
  return process.env.RESEND_FROM?.trim() || 'Auth <onboarding@resend.dev>';
}

function greetingFromUser(user: {
  name?: string | null;
  firstName?: string | null;
  email: string;
}): string {
  const first = user.firstName?.trim();
  if (first) {
    return first;
  }
  const n = user.name?.trim();
  if (n) {
    return n;
  }
  const local = user.email.split('@')[0];
  return local || 'there';
}

function getResendApiKey(): string | undefined {
  return process.env.RESEND_API_KEY?.trim() || undefined;
}

function getClient(): Resend | null {
  const key = getResendApiKey();
  return key ? new Resend(key) : null;
}

function requireResendInProduction(): void {
  if (process.env.NODE_ENV === 'production' && !getResendApiKey()) {
    throw new Error(
      'RESEND_API_KEY is required in production to send verification and password emails',
    );
  }
}

export async function sendVerificationEmailResend(params: {
  user: { name?: string | null; email: string };
  url: string;
}): Promise<void> {
  requireResendInProduction();
  const client = getClient();
  const appName = resolveAppName();
  const greeting = greetingFromUser(params.user);

  if (!client) {
    log.warn(
      `RESEND_API_KEY not set; not sending. Verification for ${params.user.email}: ${params.url}`,
    );
    return;
  }

  const { data, error } = await client.emails.send({
    from: resolveFrom(),
    to: params.user.email,
    subject: `Confirm your email — ${appName}`,
    html: verificationEmailHtml({
      appName,
      greetingName: greeting,
      verificationUrl: params.url,
    }),
    text: verificationEmailText({
      appName,
      greetingName: greeting,
      verificationUrl: params.url,
    }),
    ...(process.env.RESEND_REPLY_TO?.trim()
      ? { replyTo: process.env.RESEND_REPLY_TO.trim() }
      : {}),
  });

  if (error) {
    log.error(`Resend verification error: ${error.message}`);
    throw new Error(error.message);
  }
  log.log(`Verification email queued (${data?.id ?? 'no id'})`);
}

export async function sendPasswordResetEmailResend(params: {
  user: { name?: string | null; email: string };
  url: string;
}): Promise<void> {
  requireResendInProduction();
  const client = getClient();
  const appName = resolveAppName();
  const greeting = greetingFromUser(params.user);

  if (!client) {
    log.warn(
      `RESEND_API_KEY not set; not sending. Password reset for ${params.user.email}: ${params.url}`,
    );
    return;
  }

  const { data, error } = await client.emails.send({
    from: resolveFrom(),
    to: params.user.email,
    subject: `Reset your password — ${appName}`,
    html: passwordResetEmailHtml({
      appName,
      greetingName: greeting,
      resetUrl: params.url,
    }),
    text: passwordResetEmailText({
      appName,
      greetingName: greeting,
      resetUrl: params.url,
    }),
    ...(process.env.RESEND_REPLY_TO?.trim()
      ? { replyTo: process.env.RESEND_REPLY_TO.trim() }
      : {}),
  });

  if (error) {
    log.error(`Resend password reset error: ${error.message}`);
    throw new Error(error.message);
  }
  log.log(`Password reset email queued (${data?.id ?? 'no id'})`);
}
