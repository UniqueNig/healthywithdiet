import { createHmac, timingSafeEqual } from 'crypto';

function secret() {
  const s = process.env.BETTER_AUTH_SECRET;
  if (!s) throw new Error('BETTER_AUTH_SECRET is not set.');
  return s;
}

export function unsubscribeToken(email: string): string {
  return createHmac('sha256', secret())
    .update(email.toLowerCase())
    .digest('hex')
    .slice(0, 24);
}

export function verifyUnsubscribeToken(email: string, token: string): boolean {
  const expected = unsubscribeToken(email);
  if (expected.length !== token.length) return false;
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(token));
  } catch {
    return false;
  }
}

export function unsubscribeUrl(email: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const e = encodeURIComponent(email.toLowerCase());
  const t = unsubscribeToken(email);
  return `${base}/unsubscribe?email=${e}&token=${t}`;
}
