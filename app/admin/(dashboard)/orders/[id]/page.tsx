import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Receipt, Package } from 'lucide-react';
import { eq, inArray } from 'drizzle-orm';
import { db } from '@/lib/db';
import {
  orders,
  orderItems,
  downloadTokens,
  products,
} from '@/lib/db/schema';
import { formatNgn, formatUsd } from '@/lib/format';
import { OrderActions } from './_components/order-actions';

type Params = Promise<{ id: string }>;

export default async function OrderDetailPage({ params }: { params: Params }) {
  const { id } = await params;

  const orderRows = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  const order = orderRows[0];
  if (!order) notFound();

  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, order.id));

  const tokens = await db
    .select()
    .from(downloadTokens)
    .where(eq(downloadTokens.orderId, order.id));

  const productIds = items.map((i) => i.productId);
  const productRows =
    productIds.length > 0
      ? await db
          .select({ id: products.id, title: products.title, slug: products.slug })
          .from(products)
          .where(inArray(products.id, productIds))
      : [];
  const productMap = new Map(productRows.map((p) => [p.id, p] as const));

  const tokensByProduct = new Map(tokens.map((t) => [t.productId, t] as const));

  const fmt = order.currency === 'NGN' ? formatNgn : formatUsd;

  return (
    <div className="mx-auto w-full max-w-3xl">
      <Link
        href="/admin/orders"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-fg-muted hover:text-fg"
      >
        <ArrowLeft size={14} />
        Back to orders
      </Link>

      <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-fg-muted">
            Order
          </p>
          <h2 className="mt-1 font-serif text-2xl text-fg">
            {(order.paymentReference ?? order.id).slice(0, 8)}
          </h2>
          <p className="mt-1 text-xs text-fg-muted">
            {new Intl.DateTimeFormat('en-NG', {
              dateStyle: 'full',
              timeStyle: 'short',
            }).format(order.createdAt)}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </header>

      <Section title="Customer">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Name" value={order.customerName ?? '—'} />
          <Field label="Email" value={order.customerEmail} />
          <Field label="Provider" value={order.paymentProvider} />
          <Field
            label="Reference"
            value={order.paymentReference ?? order.id}
            mono
          />
        </div>
      </Section>

      <Section title="Items">
        <ul className="divide-y divide-border">
          {items.map((item) => {
            const product = productMap.get(item.productId);
            const token = tokensByProduct.get(item.productId);
            return (
              <li
                key={item.id}
                className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-fg">
                    {item.productTitle}
                  </p>
                  {product && (
                    <p className="text-xs text-fg-muted">/shop/{product.slug}</p>
                  )}
                  {token && (
                    <p className="mt-1 text-xs text-fg-muted">
                      Downloads used:{' '}
                      <span className="font-medium text-fg">
                        {token.downloadsUsed} / {token.maxDownloads}
                      </span>
                      {' · '}
                      Expires {new Intl.DateTimeFormat('en-NG', {
                        dateStyle: 'medium',
                      }).format(token.expiresAt)}
                    </p>
                  )}
                </div>
                <div className="text-right font-serif text-base text-fg">
                  {fmt(item.unitPrice)}
                </div>
              </li>
            );
          })}
        </ul>
        <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
          <span className="text-sm font-semibold uppercase tracking-wider text-fg-muted">
            Total
          </span>
          <span className="font-serif text-xl text-primary">
            {fmt(order.totalAmount)}
          </span>
        </div>
      </Section>

      <Section title="Actions">
        {order.status === 'paid' ? (
          <OrderActions orderId={order.id} />
        ) : (
          <div className="flex items-center gap-2 text-sm text-fg-muted">
            <Receipt size={16} />
            Resend and generate-links are only available for paid orders.
          </div>
        )}
      </Section>

      {tokens.length === 0 && order.status === 'paid' && (
        <p className="mt-4 flex items-center gap-2 text-xs text-fg-muted">
          <Package size={14} />
          This order is paid but has no download tokens. Click "Generate new
          links" to create them.
        </p>
      )}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-5 rounded-2xl border border-border bg-surface p-5">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-fg-muted">
        {title}
      </h3>
      {children}
    </section>
  );
}

function Field({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-fg-muted">
        {label}
      </p>
      <p className={['mt-1 break-all text-sm text-fg', mono ? 'font-mono' : ''].join(' ')}>
        {value}
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
        'inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider',
        cls,
      ].join(' ')}
    >
      {status}
    </span>
  );
}
