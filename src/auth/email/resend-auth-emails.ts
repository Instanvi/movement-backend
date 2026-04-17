import { Logger } from '@nestjs/common';
import { Resend } from 'resend';
import {
  passwordResetEmailHtml,
  passwordResetEmailText,
  verificationEmailHtml,
  verificationEmailText,
} from './transactional-templates';

const log = new Logger('ResendAuthMail');

const config = {
  getApiKey: () => process.env.RESEND_API_KEY?.trim(),
  getFromEmail: () =>
    process.env.RESEND_FROM_EMAIL?.trim() || 'Auth <onboarding@resend.dev>',
  getReplyTo: () => process.env.RESEND_REPLY_TO_EMAIL?.trim() || null,
  getAppName: () => process.env.AUTH_EMAIL_APP_NAME?.trim() || 'auth-config',
  getFrontendUrl: () => process.env.FRONTEND_URL?.trim() || null,
  isProduction: () => process.env.NODE_ENV === 'production',
};

let resendClient: Resend | null = null;

function getClient(): Resend | null {
  if (!resendClient && config.getApiKey()) {
    resendClient = new Resend(config.getApiKey());
  }
  return resendClient;
}

function ensureClientAvailable(): void {
  if (config.isProduction() && !config.getApiKey()) {
    throw new Error(
      'RESEND_API_KEY is required in production to send verification and password emails',
    );
  }
}

// ============================================================================
// Utilities
// ============================================================================

type User = { name?: string | null; firstName?: string | null; email: string };

function getGreeting(user: User): string {
  if (user.firstName?.trim()) return user.firstName.trim();
  if (user.name?.trim()) return user.name.trim();
  return user.email.split('@')[0] || 'there';
}

function transformUrl(originalUrl: string): string {
  const frontendUrl = config.getFrontendUrl();
  if (!frontendUrl) return originalUrl;

  try {
    const urlObj = new URL(originalUrl);
    const frontend = new URL(frontendUrl);

    // Better Auth encodes the verification/reset token in the auth route's
    // query string. Preserve the original pathname so `/api/auth/...` keeps
    // receiving the token exactly as Better Auth generated it.
    urlObj.protocol = frontend.protocol;
    urlObj.host = frontend.host;

    // Note: urlObj.search (query params like ?token=...) is preserved automatically
    return urlObj.toString();
  } catch (err) {
    log.error(`Failed to transform auth URL: ${originalUrl}`, err);
    return originalUrl;
  }
}

// ============================================================================
// Generic Email Sender
// ============================================================================

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
}

async function sendEmail(options: EmailOptions): Promise<void> {
  const client = getClient();

  if (!client) {
    log.warn(
      `RESEND_API_KEY not set; skipping email to ${options.to}: ${options.subject}`,
    );
    return;
  }

  const sendOptions: Parameters<typeof client.emails.send>[0] = {
    from: config.getFromEmail(),
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
  };

  const replyTo = config.getReplyTo();
  if (replyTo) {
    sendOptions.replyTo = replyTo;
  }

  const { data, error } = await client.emails.send(sendOptions);

  if (error) {
    log.error(`Resend error: ${error.message}`);
    throw new Error(error.message);
  }

  log.log(`Email sent (${data?.id || 'no id'})`);
}

export async function sendVerificationEmail(params: {
  user: User;
  url: string;
}): Promise<void> {
  ensureClientAvailable();

  const greeting = getGreeting(params.user);
  const finalUrl = transformUrl(params.url);
  const appName = config.getAppName();

  await sendEmail({
    to: params.user.email,
    subject: `Confirm your email — ${appName}`,
    html: verificationEmailHtml({
      appName,
      greetingName: greeting,
      verificationUrl: finalUrl,
    }),
    text: verificationEmailText({
      appName,
      greetingName: greeting,
      verificationUrl: finalUrl,
    }),
  });
}

export async function sendPasswordResetEmail(params: {
  user: User;
  url: string;
}): Promise<void> {
  ensureClientAvailable();

  const greeting = getGreeting(params.user);
  const finalUrl = transformUrl(params.url);
  const appName = config.getAppName();

  await sendEmail({
    to: params.user.email,
    subject: `Reset your password — ${appName}`,
    html: passwordResetEmailHtml({
      appName,
      greetingName: greeting,
      resetUrl: finalUrl,
    }),
    text: passwordResetEmailText({
      appName,
      greetingName: greeting,
      resetUrl: finalUrl,
    }),
  });
}

// Backward compatibility
export const sendVerificationEmailResend = sendVerificationEmail;
export const sendPasswordResetEmailResend = sendPasswordResetEmail;
