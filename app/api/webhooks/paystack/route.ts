import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyWebhookSignature } from '@/lib/payments/paystack';
import { markOrderPaid } from '@/lib/orders';

export const runtime = 'nodejs';

type PaystackEvent = {
  event: string;
  data?: {
    reference?: string;
    status?: string;
  };
};

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get('x-paystack-signature');

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 401 });
  }

  let payload: PaystackEvent;
  try {
    payload = JSON.parse(rawBody) as PaystackEvent;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 });
  }

  if (payload.event === 'charge.success' && payload.data?.reference) {
    try {
      await markOrderPaid(payload.data.reference);
    } catch (err) {
      console.error('Paystack webhook handler failed:', err);
      // Return 200 anyway so Paystack does not retry forever; we already
      // logged the error. A retry would not help if our DB is down.
    }
  }

  return NextResponse.json({ received: true });
}
