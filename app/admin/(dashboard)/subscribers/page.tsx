import Link from 'next/link';
import { Mail, Download } from 'lucide-react';
import { desc, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { newsletterSubscribers } from '@/lib/db/schema';
import { SubscriberRowActions } from './_components/subscriber-row-actions';

type SearchParams = Promise<{ status?: string }>;

const STATUS_FILTERS = [
  { value: '', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'unsubscribed', label: 'Unsubscribed' },
] as const;

function isValidStatus(s: string): s is 'active' | 'unsubscribed' {
  return s === 'active' || s === 'unsubscribed';
}

export default async function SubscribersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const activeStatus = sp.status ?? '';

  const rows = isValidStatus(activeStatus)
    ? await db
        .select()
        .from(newsletterSubscribers)
        .where(eq(newsletterSubscribers.status, activeStatus))
        .orderBy(desc(newsletterSubscribers.subscribedAt))
    : await db
        .select()
        .from(newsletterSubscribers)
        .orderBy(desc(newsletterSubscribers.subscribedAt));

  const activeCount = rows.filter((r) => r.status === 'active').length;

  return (
    <div className="mx-auto w-full max-w-5xl">
      <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-fg">
            Subscribers
          </h2>
          <p className="mt-1 text-sm text-fg-muted">
            {rows.length} total · {activeCount} active
          </p>
        </div>
        <Link
          href="/admin/subscribers/export"
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-fg transition hover:border-primary hover:text-primary"
        >
          <Download size={16} />
          Export CSV
        </Link>
      </header>

      <div className="mb-5 flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => {
          const active = f.value === activeStatus;
          const href = f.value
            ? `/admin/subscribers?status=${f.value}`
            : '/admin/subscribers';
          return (
            <Link
              key={f.label}
              href={href}
              className={[
                'rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider transition',
                active
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-surface text-fg-muted hover:border-primary hover:text-fg',
              ].join(' ')}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      {rows.length === 0 ? (
        <EmptyState filtered={Boolean(activeStatus)} />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <ul className="divide-y divide-border">
            {rows.map((sub) => (
              <li
                key={sub.id}
                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4 sm:p-5"
              >
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                  <Mail size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-medium text-fg">
                      {sub.email}
                    </p>
                    {sub.status === 'unsubscribed' && (
                      <span className="inline-flex items-center rounded-full bg-bg-alt px-2 py-0.5 text-xs font-medium text-fg-muted">
                        Unsubscribed
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-fg-muted">
                    {sub.status === 'active'
                      ? `Subscribed ${formatDate(sub.subscribedAt)}`
                      : sub.unsubscribedAt
                        ? `Unsubscribed ${formatDate(sub.unsubscribedAt)}`
                        : `Joined ${formatDate(sub.subscribedAt)}`}
                  </p>
                </div>
                <SubscriberRowActions
                  subscriberId={sub.id}
                  email={sub.email}
                  status={sub.status as 'active' | 'unsubscribed'}
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-surface px-6 py-16 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
        <Mail size={22} />
      </div>
      <h3 className="mt-4 text-lg font-medium text-fg">
        {filtered ? 'No subscribers match this filter' : 'No subscribers yet'}
      </h3>
      <p className="mx-auto mt-2 max-w-sm text-sm text-fg-muted">
        {filtered
          ? 'Try a different filter.'
          : 'When people sign up via the newsletter form, they will appear here.'}
      </p>
    </div>
  );
}

function formatDate(d: Date) {
  return new Intl.DateTimeFormat('en-NG', {
    dateStyle: 'medium',
  }).format(d);
}
