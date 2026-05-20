import { createHmac, timingSafeEqual } from 'crypto';

const PAYSTACK_BASE_URL = 'https://api.paystack.co';

function secretKey() {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) {
    throw new Error('PAYSTACK_SECRET_KEY is not set.');
  }
  return key;
}

export type PaystackInitArgs = {
  email: string;
  amountKobo: number;
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
};

export type PaystackInitResult = {
  authorizationUrl: string;
  accessCode: string;
  reference: string;
};

export async function initializeTransaction(
  args: PaystackInitArgs,
): Promise<PaystackInitResult> {
  const res = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: args.email,
      amount: args.amountKobo,
      reference: args.reference,
      callback_url: args.callbackUrl,
      currency: 'NGN',
      metadata: args.metadata,
    }),
  });

  const json = (await res.json()) as {
    status: boolean;
    message: string;
    data?: {
      authorization_url: string;
      access_code: string;
      reference: string;
    };
  };

  if (!res.ok || !json.status || !json.data) {
    throw new Error(`Paystack init failed: ${json.message || res.statusText}`);
  }

  return {
    authorizationUrl: json.data.authorization_url,
    accessCode: json.data.access_code,
    reference: json.data.reference,
  };
}

export type PaystackVerification = {
  status: 'success' | 'failed' | 'abandoned' | string;
  reference: string;
  amount: number;
  currency: string;
  customerEmail: string;
  paidAt: string | null;
};

export async function verifyTransaction(
  reference: string,
): Promise<PaystackVerification> {
  const res = await fetch(
    `${PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: { Authorization: `Bearer ${secretKey()}` },
      cache: 'no-store',
    },
  );

  const json = (await res.json()) as {
    status: boolean;
    message: string;
    data?: {
      status: string;
      reference: string;
      amount: number;
      currency: string;
      paid_at: string | null;
      customer: { email: string };
    };
  };

  if (!res.ok || !json.status || !json.data) {
    throw new Error(
      `Paystack verify failed: ${json.message || res.statusText}`,
    );
  }

  return {
    status: json.data.status,
    reference: json.data.reference,
    amount: json.data.amount,
    currency: json.data.currency,
    customerEmail: json.data.customer.email,
    paidAt: json.data.paid_at,
  };
}

export function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
): boolean {
  if (!signatureHeader) return false;
  const expected = createHmac('sha512', secretKey()).update(rawBody).digest('hex');
  const a = Buffer.from(expected);
  const b = Buffer.from(signatureHeader);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
