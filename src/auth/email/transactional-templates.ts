import { escapeHtml } from './escape-html';

const fontStack =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

function layout(params: {
  preheader: string;
  title: string;
  lead: string;
  ctaLabel: string;
  actionUrl: string;
  footerNote: string;
  appName: string;
}): string {
  const { preheader, title, lead, ctaLabel, actionUrl, footerNote, appName } =
    params;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background:#eef2ff;">
  <span style="display:none!important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;">${escapeHtml(preheader)}</span>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#eef2ff;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 40px rgba(79,70,229,0.12);" cellspacing="0" cellpadding="0">
          <tr>
            <td style="height:4px;background:linear-gradient(90deg,#4f46e5,#7c3aed,#4f46e5);"></td>
          </tr>
          <tr>
            <td style="padding:36px 32px 28px;font-family:${fontStack};">
              <p style="margin:0 0 8px;font-size:13px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:#6366f1;">${escapeHtml(appName)}</p>
              <h1 style="margin:0 0 16px;font-size:24px;font-weight:700;line-height:1.25;color:#0f172a;">${escapeHtml(title)}</h1>
              <p style="margin:0 0 28px;font-size:16px;line-height:1.6;color:#475569;">${lead}</p>
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 28px;">
                <tr>
                  <td style="border-radius:10px;background:#4f46e5;">
                    <a href="${actionUrl}" style="display:inline-block;padding:14px 28px;font-family:${fontStack};font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:10px;">${escapeHtml(ctaLabel)}</a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 8px;font-size:12px;line-height:1.5;color:#94a3b8;word-break:break-all;">${escapeHtml(actionUrl)}</p>
              <p style="margin:24px 0 0;font-size:13px;line-height:1.55;color:#64748b;border-top:1px solid #e2e8f0;padding-top:20px;">${footerNote}</p>
            </td>
          </tr>
        </table>
        <p style="margin:24px 0 0;font-family:${fontStack};font-size:12px;color:#94a3b8;">Sent by ${escapeHtml(appName)}</p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function verificationEmailHtml(params: {
  appName: string;
  greetingName: string;
  verificationUrl: string;
}): string {
  const { appName, greetingName, verificationUrl } = params;
  const safeGreeting = escapeHtml(greetingName);
  return layout({
    preheader: `Confirm your email to continue with ${appName}.`,
    title: 'Confirm your email',
    lead: `Hi ${safeGreeting},<br /><br />Use the button below to verify your address and finish setting up your account.`,
    ctaLabel: 'Verify email',
    actionUrl: verificationUrl,
    footerNote:
      "If you didn't create an account, you can safely ignore this message.",
    appName,
  });
}

export function verificationEmailText(params: {
  appName: string;
  greetingName: string;
  verificationUrl: string;
}): string {
  const { appName, greetingName, verificationUrl } = params;
  return [
    `${appName} — confirm your email`,
    '',
    `Hi ${greetingName},`,
    '',
    'Open this link to verify your email:',
    verificationUrl,
    '',
    "If you didn't create an account, ignore this email.",
  ].join('\n');
}

export function passwordResetEmailHtml(params: {
  appName: string;
  greetingName: string;
  resetUrl: string;
}): string {
  const { appName, greetingName, resetUrl } = params;
  const safeGreeting = escapeHtml(greetingName);
  return layout({
    preheader: `Reset your ${appName} password.`,
    title: 'Reset your password',
    lead: `Hi ${safeGreeting},<br /><br />We received a request to reset your password. Click the button to choose a new one.`,
    ctaLabel: 'Reset password',
    actionUrl: resetUrl,
    footerNote:
      "If you didn't ask for a reset, you can ignore this email — your password won't change.",
    appName,
  });
}

export function passwordResetEmailText(params: {
  appName: string;
  greetingName: string;
  resetUrl: string;
}): string {
  const { appName, greetingName, resetUrl } = params;
  return [
    `${appName} — password reset`,
    '',
    `Hi ${greetingName},`,
    '',
    'Reset your password using this link:',
    resetUrl,
    '',
    "If you didn't request this, ignore this email.",
  ].join('\n');
}
