import Link from 'next/link';
import { CheckCircle2, Download, Mail, Loader2 } from 'lucide-react';
import { eq, inArray } from 'drizzle-orm';
import { db } from '@/lib/db';
import { orders, orderItems, downloadTokens, products } from '@/lib/db/schema';
import { markOrderPaid } from '@/lib/orders';

export const dynamic = 'force-dynamic';

type SearchParams = Promise<{ ref?: string; reference?: string; trxref?: string }>;

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const reference = sp.ref ?? sp.reference ?? sp.trxref ?? null;

  if (!reference) {
    return <NoReference />;
  }

  let outcome: Awaited<ReturnType<typeof markOrderPaid>> = null;
  try {
    outcome = await markOrderPaid(reference);
  } catch (err) {
    console.error('Order success markOrderPaid failed:', err);
  }

  if (!outcome) {
    // Order might still be pending or unknown. Show a soft state.
    const rows = await db
      .select()
      .from(orders)
      .where(eq(orders.paymentReference, reference))
      .limit(1);
    const order = rows[0];

    return (
      <Container>
        <div className="grid h-12 w-12 place-items-center rounded-full bg-bg-alt text-fg-muted">
          <Loader2 size={22} className="animate-spin" />
        </div>
        <h1 className="mt-4 font-serif text-3xl text-fg sm:text-4xl">
          Hang tight, we are confirming your payment.
        </h1>
        <p className="mt-3 text-fg-muted">
          {order
            ? `Order ${reference.slice(0, 8)} is still being confirmed. This page will refresh in a few seconds.`
            : 'We do not see this transaction yet. If you just paid, refresh in a few seconds.'}
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wider text-primary hover:underline"
        >
          Back to shop
        </Link>
      </Container>
    );
  }

  const { order, tokens } = outcome;

  const productIds = tokens.map((t) => t.productId);
  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, order.id));
  const productRows = productIds.length
    ? await db
        .select({ id: products.id, title: products.title })
        .from(products)
        .where(inArray(products.id, productIds))
    : [];
  const titleById = new Map(productRows.map((p) => [p.id, p.title] as const));

  const downloads = tokens.map((t) => ({
    token: t.token,
    title: titleById.get(t.productId) ?? 'Your product',
  }));

  return (
    <Container>
      <div className="grid h-12 w-12 place-items-center rounded-full bg-primary/15 text-primary">
        <CheckCircle2 size={26} />
      </div>
      <h1 className="mt-4 font-serif text-3xl text-fg sm:text-4xl">
        Thank you, your order is confirmed.
      </h1>
      <p className="mt-3 max-w-xl text-fg-muted">
        We emailed your download link to{' '}
        <span className="font-medium text-fg">{order.customerEmail}</span>. You
        can also start your download right here.
      </p>

      <div className="mt-8 rounded-3xl border border-border bg-surface p-5">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-fg-muted">
          Your downloads
        </h2>
        <ul className="mt-3 divide-y divide-border">
          {downloads.map((d) => (
            <li
              key={d.token}
              className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <span className="font-serif text-lg text-fg">{d.title}</span>
              <Link
                href={`/api/download/${d.token}`}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold uppercase tracking-wider text-primary-fg transition hover:bg-primary-deep"
              >
                <Download size={14} />
                Download
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-fg-muted">
          Each link can be used up to 3 times and expires in 7 days. Lost it?
          Visit the lost-download page on the site and we will resend.
        </p>
      </div>

      <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-fg-muted">
        <Mail size={12} />
        Order reference: {order.paymentReference?.slice(0, 8) ?? reference.slice(0, 8)}
      </div>

      <p className="mt-8 text-sm">
        Did not get the email?{' '}
        <Link href={`/order/success?ref=${reference}`} className="text-primary hover:underline">
          Refresh this page
        </Link>{' '}
        — we will resend automatically. (Tokens shown above always work.)
      </p>
      {void items}
    </Container>
  );
}

function NoReference() {
  return (
    <Container>
      <h1 className="font-serif text-3xl text-fg sm:text-4xl">
        Order reference missing.
      </h1>
      <p className="mt-3 text-fg-muted">
        We need a payment reference to look up your order. If you paid recently,
        check your email for the confirmation, or contact us.
      </p>
      <Link
        href="/shop"
        className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wider text-primary hover:underline"
      >
        Back to shop
      </Link>
    </Container>
  );
}

function Container({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-16 sm:px-6 sm:py-20">
      {children}
    </div>
  );
}
