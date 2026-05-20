import { createHmac, timingSafeEqual } from 'crypto';

const LS_BASE_URL = 'https://api.lemonsqueezy.com/v1';

function apiKey() {
  const key = process.env.LEMONSQUEEZY_API_KEY;
  if (!key) {
    throw new Error('LEMONSQUEEZY_API_KEY is not set.');
  }
  return key;
}

function storeId() {
  const id = process.env.LEMONSQUEEZY_STORE_ID;
  if (!id) {
    throw new Error('LEMONSQUEEZY_STORE_ID is not set.');
  }
  return id;
}

function variantId() {
  const id = process.env.LEMONSQUEEZY_VARIANT_ID;
  if (!id) {
    throw new Error('LEMONSQUEEZY_VARIANT_ID is not set.');
  }
  return id;
}

function webhookSecret() {
  const s = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!s) {
    throw new Error('LEMONSQUEEZY_WEBHOOK_SECRET is not set.');
  }
  return s;
}

const JSON_HEADERS = {
  Accept: 'application/vnd.api+json',
  'Content-Type': 'application/vnd.api+json',
};

export type CheckoutArgs = {
  email: string;
  customerName: string | null;
  amountCents: number;
  productName: string;
  reference: string;
  redirectUrl: string;
};

export type CheckoutResult = {
  checkoutUrl: string;
  lemonId: string;
};

export async function createCheckout(args: CheckoutArgs): Promise<CheckoutResult> {
  const body = {
    data: {
      type: 'checkouts',
      attributes: {
        checkout_data: {
          email: args.email,
          name: args.customerName ?? undefined,
          custom: {
            reference: args.reference,
          },
        },
        checkout_options: {
          embed: false,
          media: false,
        },
        product_options: {
          name: args.productName,
          redirect_url: args.redirectUrl,
          receipt_button_text: 'Open download',
          receipt_link_url: args.redirectUrl,
          receipt_thank_you_note: 'Thank you for your order.',
          enabled_variants: [Number(variantId())],
        },
        custom_price: args.amountCents,
      },
      relationships: {
        store: { data: { type: 'stores', id: storeId() } },
        variant: { data: { type: 'variants', id: variantId() } },
      },
    },
  };

  const res = await fetch(`${LS_BASE_URL}/checkouts`, {
    method: 'POST',
    headers: {
      ...JSON_HEADERS,
      Authorization: `Bearer ${apiKey()}`,
    },
    body: JSON.stringify(body),
  });

  const json = (await res.json()) as {
    data?: {
      id: string;
      attributes: { url: string };
    };
    errors?: Array<{ detail?: string; title?: string }>;
  };

  if (!res.ok || !json.data) {
    const detail =
      json.errors?.[0]?.detail ??
      json.errors?.[0]?.title ??
      `HTTP ${res.status}`;
    throw new Error(`Lemon Squeezy checkout failed: ${detail}`);
  }

  return {
    checkoutUrl: json.data.attributes.url,
    lemonId: json.data.id,
  };
}

export function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
): boolean {
  if (!signatureHeader) return false;
  const expected = createHmac('sha256', webhookSecret())
    .update(rawBody)
    .digest('hex');
  const a = Buffer.from(expected);
  const b = Buffer.from(signatureHeader);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export type LemonOrderEvent = {
  meta?: {
    event_name?: string;
    custom_data?: {
      reference?: string;
    };
  };
  data?: {
    id: string;
    attributes: {
      status: string;
      total: number;
      currency: string;
      user_email: string;
    };
  };
};
