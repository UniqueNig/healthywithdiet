import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  Check,
  Package,
  ShieldCheck,
  Download,
} from 'lucide-react';
import { BuyForm } from './_components/buy-form';
import { and, desc, eq, ne } from 'drizzle-orm';
import { db } from '@/lib/db';
import { productCategories, products } from '@/lib/db/schema';
import { formatNgn, formatUsd } from '@/lib/format';
import {
  DotGrid,
  LeafCluster,
  PlateMark,
} from '../../_components/decorations';

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  const rows = await db
    .select({
      title: products.title,
      description: products.description,
      coverImageUrl: products.coverImageUrl,
    })
    .from(products)
    .where(and(eq(products.slug, slug), eq(products.isPublished, true)))
    .limit(1);
  const p = rows[0];
  if (!p) return { title: 'Product not found' };
  return {
    title: p.title,
    description: p.description ?? undefined,
    openGraph: {
      title: p.title,
      description: p.description ?? undefined,
      type: 'website',
      images: p.coverImageUrl ? [{ url: p.coverImageUrl }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: p.title,
      description: p.description ?? undefined,
      images: p.coverImageUrl ? [p.coverImageUrl] : undefined,
    },
  };
}

export default async function ProductDetailPage({ params }: { params: Params }) {
  const { slug } = await params;

  const rows = await db
    .select({
      id: products.id,
      slug: products.slug,
      title: products.title,
      description: products.description,
      coverImageUrl: products.coverImageUrl,
      priceNgnKobo: products.priceNgnKobo,
      priceUsdCents: products.priceUsdCents,
      categoryName: productCategories.name,
    })
    .from(products)
    .leftJoin(productCategories, eq(products.categoryId, productCategories.id))
    .where(and(eq(products.slug, slug), eq(products.isPublished, true)))
    .limit(1);
  const product = rows[0];

  if (!product) {
    notFound();
  }

  const related = await db
    .select({
      id: products.id,
      slug: products.slug,
      title: products.title,
      coverImageUrl: products.coverImageUrl,
      priceNgnKobo: products.priceNgnKobo,
    })
    .from(products)
    .where(and(eq(products.isPublished, true), ne(products.id, product.id)))
    .orderBy(desc(products.createdAt))
    .limit(3);

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ?? 'http://localhost:3000';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description ?? undefined,
    image: product.coverImageUrl ?? undefined,
    category: product.categoryName ?? undefined,
    brand: { '@type': 'Brand', name: 'Healthy with Diet' },
    offers: [
      {
        '@type': 'Offer',
        priceCurrency: 'NGN',
        price: (product.priceNgnKobo / 100).toFixed(0),
        availability: 'https://schema.org/InStock',
        url: `${baseUrl}/shop/${product.slug}`,
      },
      {
        '@type': 'Offer',
        priceCurrency: 'USD',
        price: (product.priceUsdCents / 100).toFixed(2),
        availability: 'https://schema.org/InStock',
        url: `${baseUrl}/shop/${product.slug}`,
      },
    ],
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="relative overflow-hidden">
        <DotGrid className="pointer-events-none absolute inset-0 text-primary/15" />
        <div className="pointer-events-none absolute -right-20 bottom-0 hidden h-72 w-72 text-primary/30 lg:block">
          <LeafCluster className="h-full w-full" />
        </div>

        <div className="relative mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wider text-fg-muted hover:text-primary"
          >
            <ArrowLeft size={14} />
            Back to shop
          </Link>

          <div className="mt-8 grid gap-10 md:grid-cols-12 md:gap-12">
            {/* Image */}
            <div className="md:col-span-7">
              <div className="relative">
                <div className="absolute -left-3 -top-3 h-full w-full rounded-3xl border border-primary/40" />
                <div className="relative aspect-4/3 w-full overflow-hidden rounded-3xl border border-border bg-surface">
                  {product.coverImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.coverImageUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center bg-linear-to-br from-primary/20 to-accent/10 text-primary">
                      <PlateMark className="h-32 w-32" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="md:col-span-5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
                {product.categoryName ?? 'Product'}
              </span>
              <h1 className="mt-2 font-serif text-4xl font-medium leading-tight tracking-tight text-fg sm:text-5xl">
                {product.title}
              </h1>

              <div className="mt-6 flex items-baseline gap-3">
                <span className="font-serif text-4xl text-primary">
                  {formatNgn(product.priceNgnKobo)}
                </span>
                <span className="text-sm text-fg-muted">
                  or {formatUsd(product.priceUsdCents)}
                </span>
              </div>

              <div className="mt-6 h-px w-12 bg-primary/40" />

              {product.description && (
                <p className="mt-6 whitespace-pre-line leading-relaxed text-fg">
                  {product.description}
                </p>
              )}

              <BuyForm
                productId={product.id}
                priceNgnKobo={product.priceNgnKobo}
                priceUsdCents={product.priceUsdCents}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Trust band */}
      <section className="border-y border-border bg-bg-alt">
        <div className="mx-auto grid w-full max-w-6xl gap-px overflow-hidden bg-border px-0 sm:grid-cols-3">
          <TrustItem
            icon={<Download size={18} />}
            title="Instant download"
            body="Get the file the moment payment clears."
          />
          <TrustItem
            icon={<ShieldCheck size={18} />}
            title="Secure delivery"
            body="Private expiring links, not shared URLs."
          />
          <TrustItem
            icon={<Check size={18} />}
            title="Naira or USD"
            body="Paystack for NGN, international card for USD."
          />
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
          <div className="mb-8">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-fg-muted">
              You may also like
            </span>
            <h2 className="mt-1 font-serif text-3xl font-medium tracking-tight text-fg sm:text-4xl">
              More from the shop
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <Link
                key={p.id}
                href={`/shop/${p.slug}`}
                className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-surface transition hover:border-primary"
              >
                <div className="aspect-4/3 w-full overflow-hidden bg-bg">
                  {p.coverImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.coverImageUrl}
                      alt=""
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center bg-linear-to-br from-primary/20 to-accent/10 text-primary">
                      <PlateMark className="h-20 w-20" />
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-serif text-lg font-medium text-fg">
                    {p.title}
                  </h3>
                  <p className="mt-2 text-sm font-semibold text-primary">
                    {formatNgn(p.priceNgnKobo)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function TrustItem({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="bg-surface p-6 sm:p-7">
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="mt-3 font-serif text-base font-medium text-fg">{title}</h3>
      <p className="mt-1 text-sm text-fg-muted">{body}</p>
    </div>
  );
}
