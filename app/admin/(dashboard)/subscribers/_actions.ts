'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { newsletterSubscribers } from '@/lib/db/schema';

async function requireSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error('Unauthorized.');
  return session;
}

export async function setSubscriberStatus(
  subscriberId: string,
  nextStatus: 'active' | 'unsubscribed',
  _formData: FormData,
) {
  await requireSession();
  await db
    .update(newsletterSubscribers)
    .set({
      status: nextStatus,
      unsubscribedAt: nextStatus === 'unsubscribed' ? new Date() : null,
    })
    .where(eq(newsletterSubscribers.id, subscriberId));
  revalidatePath('/admin/subscribers');
}

export async function deleteSubscriber(
  subscriberId: string,
  _formData: FormData,
) {
  await requireSession();
  await db
    .delete(newsletterSubscribers)
    .where(eq(newsletterSubscribers.id, subscriberId));
  revalidatePath('/admin/subscribers');
}
