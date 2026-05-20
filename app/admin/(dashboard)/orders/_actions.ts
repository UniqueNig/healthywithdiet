'use server';

import { randomUUID } from 'crypto';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { eq, inArray } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import {
  orders,
  orderItems,
  downloadTokens,
  products,
} from '@/lib/db/schema';
import { sendDownloadEmail } from '@/lib/email';
import { getDownloadDefaults } from '@/lib/settings';

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
}

async function requireSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error('You must be signed in.');
  return session;
}

async function buildEmailItems(orderId: string) {
  const tokens = await db
    .select()
    .from(downloadTokens)
    .where(eq(downloadTokens.orderId, orderId));
  if (tokens.length === 0) return [];

  const productIds = tokens.map((t) => t.productId);
  const rows = await db
    .select({ id: products.id, title: products.title })
    .from(products)
    .where(inArray(products.id, productIds));
  const titleById = new Map(rows.map((r) => [r.id, r.title] as const));

  return tokens.map((t) => ({
    title: titleById.get(t.productId) ?? 'Your product',
    downloadUrl: `${appUrl()}/api/download/${t.token}`,
  }));
}

export async function resendDownloadEmail(orderId: string, _formData: FormData) {
  await requireSession();

  const rows = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);
  const order = rows[0];
  if (!order) return;

  const items = await buildEmailItems(orderId);
  if (items.length === 0) return;

  await sendDownloadEmail({
    to: order.customerEmail,
    customerName: order.customerName,
    orderReference: order.paymentReference ?? order.id,
    items,
  });

  revalidatePath(`/admin/orders/${orderId}`);
}

export async function regenerateDownloadTokens(
  orderId: string,
  _formData: FormData,
) {
  await requireSession();

  const orderRows = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);
  const order = orderRows[0];
  if (!order || order.status !== 'paid') return;

  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId));

  const now = new Date();
  const { maxDownloads, expiryHours } = await getDownloadDefaults();
  const expiresAt = new Date(now.getTime() + expiryHours * 60 * 60 * 1000);

  await db.transaction(async (tx) => {
    await tx
      .delete(downloadTokens)
      .where(eq(downloadTokens.orderId, orderId));

    if (items.length > 0) {
      await tx.insert(downloadTokens).values(
        items.map((item) => ({
          orderId,
          productId: item.productId,
          token: randomUUID(),
          downloadsUsed: 0,
          maxDownloads,
          expiresAt,
        })),
      );
    }
  });

  const emailItems = await buildEmailItems(orderId);
  if (emailItems.length > 0) {
    await sendDownloadEmail({
      to: order.customerEmail,
      customerName: order.customerName,
      orderReference: order.paymentReference ?? order.id,
      items: emailItems,
    });
  }

  revalidatePath(`/admin/orders/${orderId}`);
}

export async function markRefunded(orderId: string, _formData: FormData) {
  await requireSession();
  await db
    .update(orders)
    .set({ status: 'refunded', updatedAt: new Date() })
    .where(eq(orders.id, orderId));
  revalidatePath('/admin/orders');
  revalidatePath(`/admin/orders/${orderId}`);
}
