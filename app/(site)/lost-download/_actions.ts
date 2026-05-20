'use server';

import { randomUUID } from 'crypto';
import { and, eq, inArray } from 'drizzle-orm';
import { db } from '@/lib/db';
import {
  orders,
  orderItems,
  downloadTokens,
  products,
} from '@/lib/db/schema';
import { sendRecoveryEmail } from '@/lib/email';
import { getDownloadDefaults } from '@/lib/settings';

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
}

export type RecoveryState = {
  ok: boolean;
  sent?: boolean;
  error?: string;
};

export async function requestDownloadLinks(
  _prev: RecoveryState,
  formData: FormData,
): Promise<RecoveryState> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  if (!email || !/.+@.+\..+/.test(email)) {
    return { ok: false, error: 'Please enter a valid email address.' };
  }

  try {
    const paidOrders = await db
      .select()
      .from(orders)
      .where(
        and(eq(orders.customerEmail, email), eq(orders.status, 'paid')),
      );

    // Always behave the same way whether or not we have orders. We do not
    // want to leak whether an email is on file (email-enumeration is a
    // common low-effort attack).
    if (paidOrders.length === 0) {
      return { ok: true, sent: true };
    }

    const now = new Date();
    const { maxDownloads, expiryHours } = await getDownloadDefaults();
    const expiresAt = new Date(now.getTime() + expiryHours * 60 * 60 * 1000);

    for (const order of paidOrders) {
      const existing = await db
        .select()
        .from(downloadTokens)
        .where(eq(downloadTokens.orderId, order.id));

      const stillUsable = existing.some(
        (t) => t.expiresAt > now && t.downloadsUsed < t.maxDownloads,
      );

      if (!stillUsable) {
        const items = await db
          .select()
          .from(orderItems)
          .where(eq(orderItems.orderId, order.id));

        await db.transaction(async (tx) => {
          await tx
            .delete(downloadTokens)
            .where(eq(downloadTokens.orderId, order.id));

          if (items.length > 0) {
            await tx.insert(downloadTokens).values(
              items.map((item) => ({
                orderId: order.id,
                productId: item.productId,
                token: randomUUID(),
                downloadsUsed: 0,
                maxDownloads,
                expiresAt,
              })),
            );
          }
        });
      }
    }

    const orderIds = paidOrders.map((o) => o.id);
    const allTokens = await db
      .select()
      .from(downloadTokens)
      .where(inArray(downloadTokens.orderId, orderIds));

    if (allTokens.length === 0) {
      return { ok: true, sent: true };
    }

    const productIds = Array.from(
      new Set(allTokens.map((t) => t.productId)),
    );
    const productRows = await db
      .select({ id: products.id, title: products.title })
      .from(products)
      .where(inArray(products.id, productIds));
    const titleById = new Map(
      productRows.map((p) => [p.id, p.title] as const),
    );

    const items = allTokens.map((t) => ({
      title: titleById.get(t.productId) ?? 'Your product',
      downloadUrl: `${appUrl()}/api/download/${t.token}`,
    }));

    await sendRecoveryEmail({
      to: email,
      customerName: paidOrders[0].customerName,
      items,
    });

    return { ok: true, sent: true };
  } catch (err) {
    console.error('Lost-download request failed:', err);
    return {
      ok: false,
      error: 'Something went wrong on our side. Try again in a moment.',
    };
  }
}
