import Link from 'next/link';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { desc, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { orders } from '@/lib/db/schema';
import { formatNgn, formatUsd } from '@/lib/format';

type SearchParams = Promise<{ status?: string }>;

const STATUS_FILTERS = [
  { value: '', label: 'All' },
  { value: 'paid', label: 'Paid' },
  { value: 'pending', label: 'Pending' },
  { value: 'failed', label: 'Failed' },
  { value: 'refunded', label: 'Refunded' },
] as const;

type StatusValue = 'paid' | 'pending' | 'failed' | 'refunded';

function isValidStatus(s: string): s is StatusValue {
  return s === 'paid' || s === 'pending' || s === 'failed' || s === 'refunded';
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const activeStatus = sp.status ?? '';

  const base = db.select().from(orders).orderBy(desc(orders.createdAt));
  const rows = isValidStatus(activeStatus)
    ? await db
        .select()
        .from(orders)
        .where(eq(orders.status, activeStatus))
        .orderBy(desc(orders.createdAt))
    : await base;

  return (
    <div className="mx-auto w-full max-w-5xl">
      <header className="mb-6">
        <h2 className="text-2xl font-semibold tracking-tight text-fg">Orders</h2>
        <p className="mt-1 text-sm text-fg-muted">
          See who bought what, resend download links, mark refunds.
        </p>
      </header>

      <div className="mb-5 flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => {
          const active = f.value === activeStatus;
          const href = f.value ? `/admin/orders?status=${f.value}` : '/admin/orders';
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
            {rows.map((o) => (
              <li key={o.id}>
                <Link
                  href={`/admin/orders/${o.id}`}
                  className="group flex items-center gap-4 p-4 transition hover:bg-bg-alt sm:p-5"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-medium text-fg">
                        {o.customerName ? o.customerName : o.customerEmail}
                      </p>
                      <StatusBadge status={o.status} />
                    </div>
                    <p className="mt-0.5 truncate text-xs text-fg-muted">
                      {o.customerName ? o.customerEmail + ' · ' : ''}
                      ref {(o.paymentReference ?? o.id).slice(0, 8)} ·{' '}
                      {o.paymentProvider} · {formatDate(o.createdAt)}
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-serif text-base text-fg">
                      {o.currency === 'NGN'
                        ? formatNgn(o.totalAmount)
                        : formatUsd(o.totalAmount)}
                    </p>
                    <p className="text-xs text-fg-muted">{o.currency}</p>
                  </div>
                  <ArrowRight
                    size={16}
                    className="hidden text-fg-muted transition group-hover:translate-x-1 group-hover:text-primary sm:block"
                  />
                </Link>
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
        <ShoppingBag size={22} />
      </div>
      <h3 className="mt-4 text-lg font-medium text-fg">
        {filtered ? 'No orders match this filter' : 'No orders yet'}
      </h3>
      <p className="mx-auto mt-2 max-w-sm text-sm text-fg-muted">
        {filtered
          ? 'Try a different filter.'
          : 'When customers buy products, they will appear here.'}
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    paid: 'bg-primary/10 text-primary',
    pending: 'bg-gold/15 text-gold',
    failed: 'bg-red-100 text-red-700',
    refunded: 'bg-bg-alt text-fg-muted',
  };
  const cls = styles[status] ?? styles.pending;
  return (
    <span
      className={[
        'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
        cls,
      ].join(' ')}
    >
      {status}
    </span>
  );
}

function formatDate(d: Date) {
  return new Intl.DateTimeFormat('en-NG', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(d);
}
