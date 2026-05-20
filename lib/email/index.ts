import 'server-only';
import { Resend } from 'resend';
import { unsubscribeUrl } from '@/lib/newsletter/tokens';

function client() {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    throw new Error('RESEND_API_KEY is not set.');
  }
  return new Resend(key);
}

function fromAddress() {
  return (
    process.env.EMAIL_FROM ?? 'Healthy with Diet <onboarding@resend.dev>'
  );
}

export type DownloadEmailArgs = {
  to: string;
  customerName: string | null;
  orderReference: string;
  items: Array<{
    title: string;
    downloadUrl: string;
  }>;
};

export async function sendDownloadEmail(args: DownloadEmailArgs) {
  const { html, text } = renderDownloadEmail(args);

  return client().emails.send({
    from: fromAddress(),
    to: args.to,
    subject: `Your download is ready · Order ${args.orderReference}`,
    html,
    text,
  });
}

export type WelcomeEmailArgs = {
  to: string;
};

export async function sendWelcomeEmail(args: WelcomeEmailArgs) {
  const unsubUrl = unsubscribeUrl(args.to);
  const html = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Welcome to Healthy with Diet</title>
  </head>
  <body style="margin:0;padding:0;background:#faf8f1;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a1f15;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#faf8f1;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e5e1d4;border-radius:16px;overflow:hidden;">
            <tr>
              <td style="padding:28px 28px 0;">
                <p style="margin:0;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#5c6358;font-weight:600;">Healthy with Diet</p>
                <h1 style="margin:8px 0 0;font-size:24px;color:#1a1f15;font-weight:600;">You are in. Welcome.</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 28px 0;color:#1a1f15;font-size:15px;line-height:1.55;">
                <p style="margin:0 0 12px;">Hi there,</p>
                <p style="margin:0 0 12px;">Thanks for joining the Healthy with Diet list. Every other week I send a short email with a new recipe, a nutrition tip, or a useful idea for your food business. No spam, no nonsense.</p>
                <p style="margin:0 0 12px;">In the meantime, you might enjoy:</p>
                <p style="margin:0 0 6px;"><a href="${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/shop" style="color:#507d2a;text-decoration:none;font-weight:600;">→ Browse the shop</a></p>
                <p style="margin:0 0 12px;"><a href="${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/blog" style="color:#507d2a;text-decoration:none;font-weight:600;">→ Read the blog</a></p>
                <p style="margin:18px 0 0;">— Joy</p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 28px 28px;color:#5c6358;font-size:12px;line-height:1.55;">
                <p style="margin:0 0 6px;">You are receiving this because you signed up at the site.</p>
                <p style="margin:0;"><a href="${unsubUrl}" style="color:#5c6358;text-decoration:underline;">Unsubscribe in one click</a></p>
              </td>
            </tr>
          </table>
          <p style="margin:18px 0 0;font-size:11px;color:#5c6358;">© ${new Date().getFullYear()} Healthy with Diet</p>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const text = `Hi there,

Thanks for joining the Healthy with Diet list. Every other week I send a short email with a new recipe, a nutrition tip, or a useful idea for your food business. No spam, no nonsense.

In the meantime, you might enjoy:
  Shop: ${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/shop
  Blog: ${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/blog

— Joy

You are receiving this because you signed up at the site.
Unsubscribe in one click: ${unsubUrl}`;

  return client().emails.send({
    from: fromAddress(),
    to: args.to,
    subject: 'Welcome to Healthy with Diet',
    html,
    text,
  });
}

export type RecoveryEmailArgs = {
  to: string;
  customerName: string | null;
  items: Array<{
    title: string;
    downloadUrl: string;
  }>;
};

export async function sendRecoveryEmail(args: RecoveryEmailArgs) {
  const { html, text } = renderRecoveryEmail(args);

  return client().emails.send({
    from: fromAddress(),
    to: args.to,
    subject: 'Your download links · Healthy with Diet',
    html,
    text,
  });
}

function renderDownloadEmail(args: DownloadEmailArgs) {
  const greeting = args.customerName ? `Hi ${args.customerName},` : 'Hi there,';

  const itemsHtml = args.items
    .map(
      (item) => `
        <tr>
          <td style="padding:14px 0;border-bottom:1px solid #e5e1d4;">
            <p style="margin:0 0 6px;font-size:15px;color:#1a1f15;font-weight:600;">${escape(item.title)}</p>
            <a href="${escape(item.downloadUrl)}" style="display:inline-block;background:#507d2a;color:#ffffff;text-decoration:none;padding:10px 18px;border-radius:9999px;font-size:13px;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;">Download</a>
          </td>
        </tr>
      `,
    )
    .join('');

  const itemsText = args.items
    .map((item) => `• ${item.title}\n  ${item.downloadUrl}`)
    .join('\n\n');

  const html = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Your download is ready</title>
  </head>
  <body style="margin:0;padding:0;background:#faf8f1;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a1f15;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#faf8f1;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e5e1d4;border-radius:16px;overflow:hidden;">
            <tr>
              <td style="padding:28px 28px 0;">
                <p style="margin:0;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#5c6358;font-weight:600;">Healthy with Diet</p>
                <h1 style="margin:8px 0 0;font-size:24px;color:#1a1f15;font-weight:600;">Thank you for your order.</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 28px 0;color:#1a1f15;font-size:15px;line-height:1.55;">
                <p style="margin:0 0 12px;">${escape(greeting)}</p>
                <p style="margin:0 0 12px;">Your payment for order <strong>${escape(args.orderReference)}</strong> has been confirmed. Your download links are ready below.</p>
                <p style="margin:0;color:#5c6358;font-size:13px;">For your security, each link expires in 7 days. If you lose it, visit the lost-download page on the site and we will resend.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:12px 28px 8px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  ${itemsHtml}
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 28px 28px;color:#5c6358;font-size:12px;line-height:1.55;">
                <p style="margin:0;">Need help? Reply to this email and a human will get back to you.</p>
              </td>
            </tr>
          </table>
          <p style="margin:18px 0 0;font-size:11px;color:#5c6358;">© ${new Date().getFullYear()} Healthy with Diet</p>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const text = `${greeting}

Your payment for order ${args.orderReference} has been confirmed.

Your downloads:

${itemsText}

Each link expires in 7 days. If you lose them, visit the lost-download page on the site.

Healthy with Diet`;

  return { html, text };
}

function renderRecoveryEmail(args: RecoveryEmailArgs) {
  const greeting = args.customerName ? `Hi ${args.customerName},` : 'Hi there,';

  const itemsHtml = args.items
    .map(
      (item) => `
        <tr>
          <td style="padding:14px 0;border-bottom:1px solid #e5e1d4;">
            <p style="margin:0 0 6px;font-size:15px;color:#1a1f15;font-weight:600;">${escape(item.title)}</p>
            <a href="${escape(item.downloadUrl)}" style="display:inline-block;background:#507d2a;color:#ffffff;text-decoration:none;padding:10px 18px;border-radius:9999px;font-size:13px;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;">Download</a>
          </td>
        </tr>
      `,
    )
    .join('');

  const itemsText = args.items
    .map((item) => `• ${item.title}\n  ${item.downloadUrl}`)
    .join('\n\n');

  const html = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Your download links</title>
  </head>
  <body style="margin:0;padding:0;background:#faf8f1;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a1f15;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#faf8f1;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e5e1d4;border-radius:16px;overflow:hidden;">
            <tr>
              <td style="padding:28px 28px 0;">
                <p style="margin:0;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#5c6358;font-weight:600;">Healthy with Diet</p>
                <h1 style="margin:8px 0 0;font-size:24px;color:#1a1f15;font-weight:600;">Your download links.</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 28px 0;color:#1a1f15;font-size:15px;line-height:1.55;">
                <p style="margin:0 0 12px;">${escape(greeting)}</p>
                <p style="margin:0 0 12px;">As requested, here are the download links for everything you have purchased.</p>
                <p style="margin:0;color:#5c6358;font-size:13px;">Each link expires in 7 days and can be used up to 3 times. If you need them again later, you can request a fresh set any time.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:12px 28px 8px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  ${itemsHtml}
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 28px 28px;color:#5c6358;font-size:12px;line-height:1.55;">
                <p style="margin:0;">Did not request this? You can ignore this email and nothing changes.</p>
              </td>
            </tr>
          </table>
          <p style="margin:18px 0 0;font-size:11px;color:#5c6358;">© ${new Date().getFullYear()} Healthy with Diet</p>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const text = `${greeting}

As requested, here are the download links for everything you have purchased.

${itemsText}

Each link expires in 7 days and can be used up to 3 times.

Healthy with Diet`;

  return { html, text };
}

function escape(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
