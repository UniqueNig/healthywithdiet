'use server';

import { randomUUID } from 'crypto';
import { redirect } from 'next/navigation';
import { eq, and } from 'drizzle-orm';
import { db } from '@/lib/db';
import { orders, orderItems, products } from '@/lib/db/schema';
import { initializeTransaction } from '@/lib/payments/paystack';

export type CheckoutState = {
  ok: boolean;
  error?: string;
};

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
}

export async function createOrder(
  productId: string,
  _prev: CheckoutState,
  formData: FormData,
): Promise<CheckoutState> {
  let checkoutUrl: string | null = null;

  try {
    const email = String(formData.get('email') ?? '').trim().toLowerCase();
    const name = String(formData.get('name') ?? '').trim() || null;
    const currency = String(formData.get('currency') ?? 'NGN');

    if (!email || !/.+@.+\..+/.test(email)) {
      return { ok: false, error: 'A valid email is required.' };
    }
    if (currency !== 'NGN') {
      return {
        ok: false,
        error: 'USD checkout is being wired up. Please choose NGN for now.',
      };
    }

    const rows = await db
      .select()
      .from(products)
      .where(and(eq(products.id, productId), eq(products.isPublished, true)))
      .limit(1);
    const product = rows[0];
    if (!product) return { ok: false, error: 'Product not found.' };

    const reference = randomUUID();

    await db.transaction(async (tx) => {
      await tx.insert(orders).values({
        id: reference,
        customerEmail: email,
        customerName: name,
        currency: 'NGN',
        totalAmount: product.priceNgnKobo,
        paymentProvider: 'paystack',
        paymentReference: reference,
        status: 'pending',
      });

      await tx.insert(orderItems).values({
        orderId: reference,
        productId: product.id,
        productTitle: product.title,
        unitPrice: product.priceNgnKobo,
      });
    });

    const init = await initializeTransaction({
      email,
      amountKobo: product.priceNgnKobo,
      reference,
      callbackUrl: `${appUrl()}/order/success?ref=${reference}`,
      metadata: {
        product_id: product.id,
        product_slug: product.slug,
      },
    });

    checkoutUrl = init.authorizationUrl;
  } catch (err: unknown) {
    return {
      ok: false,
      error:
        err instanceof Error ? err.message : 'Failed to start checkout.',
    };
  }

  if (checkoutUrl) redirect(checkoutUrl);
  return { ok: true };
}
