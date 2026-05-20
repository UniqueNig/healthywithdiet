import Link from 'next/link';
import { CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { newsletterSubscribers } from '@/lib/db/schema';
import { verifyUnsubscribeToken } from '@/lib/newsletter/tokens';
import { DotGrid, LeafCluster } from '../_components/decorations';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Unsubscribe',
  description: 'Stop receiving emails from Healthy with Diet.',
};

type SearchParams = Promise<{ email?: string; token?: string }>;

type Result =
  | { ok: true; email: string }
  | { ok: false; reason: 'missing' | 'invalid' };

async function processUnsubscribe(
  email: string | undefined,
  token: string | undefined,
): Promise<Result> {
  if (!email || !token) {
    return { ok: false, reason: 'missing' };
  }
  const normalized = email.toLowerCase();
  if (!verifyUnsubscribeToken(normalized, token)) {
    return { ok: false, reason: 'invalid' };
  }
  await db
    .update(newsletterSubscribers)
    .set({ status: 'unsubscribed', unsubscribedAt: new Date() })
    .where(eq(newsletterSubscribers.email, normalized));
  return { ok: true, email: normalized };
}

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const result = await processUnsubscribe(sp.email, sp.token);

  return (
    <div>
      <section className="relative overflow-hidden border-b border-border">
        <DotGrid className="pointer-events-none absolute inset-0 text-primary/15" />
        <div className="pointer-events-none absolute -right-16 top-0 hidden h-72 w-72 text-primary/30 md:block">
          <LeafCluster className="h-full w-full" />
        </div>

        <div className="relative mx-auto w-full max-w-2xl px-4 py-20 sm:px-6 sm:py-24">
          {result.ok ? (
            <>
              <div className="grid h-12 w-12 place-items-center rounded-full bg-primary/15 text-primary">
                <CheckCircle2 size={24} />
              </div>
              <h1 className="mt-6 max-w-2xl font-serif text-5xl font-medium leading-[1.05] tracking-tight text-fg sm:text-6xl">
                You are{' '}
                <span className="italic text-primary-deep">unsubscribed.</span>
              </h1>
              <p className="mt-5 max-w-xl text-lg text-fg-muted">
                <span className="font-medium text-fg">{result.email}</span> will
                not receive newsletter emails from us anymore. Anything you
                already purchased stays accessible via your download links.
              </p>
              <p className="mt-3 max-w-xl text-sm text-fg-muted">
                Changed your mind? Just{' '}
                <Link href="/" className="text-primary hover:underline">
                  re-subscribe on the homepage
                </Link>{' '}
                any time.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/"
                  className="group inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-wider text-primary-fg transition hover:bg-primary-deep"
                >
                  Back to home
                  <ArrowRight
                    size={14}
                    className="transition group-hover:translate-x-1"
                  />
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="grid h-12 w-12 place-items-center rounded-full bg-accent/15 text-accent">
                <AlertCircle size={24} />
              </div>
              <h1 className="mt-6 max-w-2xl font-serif text-5xl font-medium leading-[1.05] tracking-tight text-fg sm:text-6xl">
                {result.reason === 'missing'
                  ? 'This unsubscribe link is incomplete.'
                  : 'This unsubscribe link is not valid.'}
              </h1>
              <p className="mt-5 max-w-xl text-lg text-fg-muted">
                The link might have been mistyped or truncated by your email
                client. The easiest fix: open the original email and click the
                unsubscribe button again, or reply asking us to remove you and
                a human will sort it.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-wider text-primary-fg transition hover:bg-primary-deep"
                >
                  Contact us
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-surface px-6 py-3 text-sm font-semibold uppercase tracking-wider text-fg transition hover:border-primary hover:text-primary"
                >
                  Back to home
                </Link>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
