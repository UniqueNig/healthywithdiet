'use server';

import { sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { newsletterSubscribers } from '@/lib/db/schema';
import { sendWelcomeEmail } from '@/lib/email';

export type NewsletterState = {
  ok: boolean;
  subscribed?: boolean;
  error?: string;
};

export async function subscribeNewsletter(
  _prev: NewsletterState,
  formData: FormData,
): Promise<NewsletterState> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  if (!email || !/.+@.+\..+/.test(email)) {
    return { ok: false, error: 'Please enter a valid email address.' };
  }

  try {
    const inserted = await db
      .insert(newsletterSubscribers)
      .values({ email, status: 'active' })
      .onConflictDoUpdate({
        target: newsletterSubscribers.email,
        set: {
          status: 'active',
          subscribedAt: sql`COALESCE(${newsletterSubscribers.subscribedAt}, now())`,
          unsubscribedAt: null,
        },
      })
      .returning({
        id: newsletterSubscribers.id,
        subscribedAt: newsletterSubscribers.subscribedAt,
      });

    // Send welcome email only on first-time subscribe (not on re-activate).
    // We detect "first time" by checking if the row's subscribedAt is very
    // recent (within last 5 seconds), which only happens on insert.
    const isNew =
      inserted[0] &&
      Date.now() - new Date(inserted[0].subscribedAt).getTime() < 5000;

    if (isNew) {
      try {
        await sendWelcomeEmail({ to: email });
      } catch (mailErr) {
        // Don't fail the subscription if the welcome email fails.
        console.error('Welcome email failed:', mailErr);
      }
    }

    return { ok: true, subscribed: true };
  } catch (err) {
    console.error('Newsletter subscribe failed:', err);
    return {
      ok: false,
      error: 'Something went wrong. Please try again.',
    };
  }
}
