import 'server-only';
import { randomUUID } from 'crypto';
import { eq, inArray } from 'drizzle-orm';
import { db } from '@/lib/db';
import {
  orders,
  orderItems,
  downloadTokens,
  products,
} from '@/lib/db/schema';
import { verifyTransaction } from '@/lib/payments/paystack';
import { sendDownloadEmail } from '@/lib/email';
import { getDownloadDefaults } from '@/lib/settings';

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
}

/**
 * Marks an order as paid, creates download tokens, and emails the buyer.
 * Idempotent: calling again on an already-paid order returns the existing tokens
 * without duplicating work.
 */
export async function markOrderPaid(reference: string) {
  const orderRows = await db
    .select()
    .from(orders)
    .where(eq(orders.paymentReference, reference))
    .limit(1);
  const order = orderRows[0];
  if (!order) return null;

  if (order.status === 'paid') {
    const existing = await db
      .select()
      .from(downloadTokens)
      .where(eq(downloadTokens.orderId, order.id));
    return { order, tokens: existing };
  }

  if (order.paymentProvider === 'paystack') {
    const verification = await verifyTransaction(reference);
    if (verification.status !== 'success') return null;
    if (verification.amount !== order.totalAmount) return null;
  }

  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, order.id));

  const now = new Date();
  const { maxDownloads, expiryHours } = await getDownloadDefaults();
  const expiresAt = new Date(now.getTime() + expiryHours * 60 * 60 * 1000);

  const tokensToInsert = items.map((item) => ({
    orderId: order.id,
    productId: item.productId,
    token: randomUUID(),
    downloadsUsed: 0,
    maxDownloads,
    expiresAt,
  }));

  await db.transaction(async (tx) => {
    await tx
      .update(orders)
      .set({ status: 'paid', updatedAt: now })
      .where(eq(orders.id, order.id));

    if (tokensToInsert.length > 0) {
      await tx.insert(downloadTokens).values(tokensToInsert);
    }
  });

  const freshTokens = await db
    .select()
    .from(downloadTokens)
    .where(eq(downloadTokens.orderId, order.id));

  const productIds = freshTokens.map((t) => t.productId);
  const productRows =
    productIds.length === 0
      ? []
      : await db
          .select({ id: products.id, title: products.title })
          .from(products)
          .where(inArray(products.id, productIds));

  const productTitleById = new Map(
    productRows.map((p) => [p.id, p.title] as const),
  );

  const emailItems = freshTokens.map((t) => ({
    title: productTitleById.get(t.productId) ?? 'Your product',
    downloadUrl: `${appUrl()}/api/download/${t.token}`,
  }));

  try {
    await sendDownloadEmail({
      to: order.customerEmail,
      customerName: order.customerName,
      orderReference: order.paymentReference ?? order.id,
      items: emailItems,
    });
  } catch (err) {
    console.error('Failed to send download email:', err);
  }

  return {
    order: { ...order, status: 'paid' as const },
    tokens: freshTokens,
  };
}
