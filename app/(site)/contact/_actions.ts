'use server';

import { Resend } from 'resend';

export type ContactState = {
  ok: boolean;
  sent?: boolean;
  error?: string;
};

function escape(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function sendContactMessage(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const name = String(formData.get('name') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const phone = String(formData.get('phone') ?? '').trim();
  const message = String(formData.get('message') ?? '').trim();

  if (!name) return { ok: false, error: 'Please tell us your name.' };
  if (!email || !/.+@.+\..+/.test(email)) {
    return { ok: false, error: 'Please enter a valid email address.' };
  }
  if (!phone || phone.replace(/\D/g, '').length < 7) {
    return { ok: false, error: 'Please enter a valid phone number.' };
  }
  if (!message || message.length < 5) {
    return { ok: false, error: 'Message is too short.' };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_FORM_TO;
  const from = process.env.EMAIL_FROM ?? 'Healthy with Diet <onboarding@resend.dev>';

  if (!apiKey || !to) {
    console.error('Contact form misconfigured: missing RESEND_API_KEY or CONTACT_FORM_TO');
    return {
      ok: false,
      error: 'Email is not configured yet. Please try again later.',
    };
  }

  const html = `<!DOCTYPE html>
<html><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a1f15;padding:24px;background:#faf8f1;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e5e1d4;border-radius:16px;padding:24px;">
    <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#5c6358;font-weight:600;">Contact form</p>
    <h2 style="margin:0 0 16px;font-size:22px;color:#1a1f15;">New message from ${escape(name)}</h2>
    <p style="margin:0 0 4px;font-size:13px;color:#5c6358;">Email: <a href="mailto:${escape(email)}" style="color:#507d2a;">${escape(email)}</a></p>
    <p style="margin:0 0 4px;font-size:13px;color:#5c6358;">Phone: <a href="tel:${escape(phone)}" style="color:#507d2a;">${escape(phone)}</a></p>
    <div style="margin-top:16px;padding:16px;background:#faf8f1;border-radius:12px;white-space:pre-line;line-height:1.6;">${escape(message)}</div>
  </div>
</body></html>`;

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from,
      to,
      replyTo: email,
      subject: `Contact form: ${name}`,
      html,
      text: `From: ${name} <${email}>\nPhone: ${phone}\n\n${message}`,
    });

    return { ok: true, sent: true };
  } catch (err) {
    console.error('Contact form send failed:', err);
    return {
      ok: false,
      error: 'Could not send the message. Please email us directly.',
    };
  }
}
