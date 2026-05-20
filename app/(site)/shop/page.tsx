import Link from 'next/link';
import { Package, ArrowRight } from 'lucide-react';
import { desc, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { productCategories, products } from '@/lib/db/schema';
import { formatNgn, formatUsd } from '@/lib/format';
import {
  DotGrid,
  LeafCluster,
  PlateMark,
} from '../_components/decorations';

export const metadata = {
  title: 'Shop',
  description: 'Ebooks, templates, and guides for food businesses and home cooks.',
};

export default async function ShopPage() {
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
    .where(eq(products.isPublished, true))
    .orderBy(desc(products.createdAt));

  return (
    <div>
      <section className="relative overflow-hidden border-b border-border">
        <DotGrid className="pointer-events-none absolute inset-0 text-primary/15" />
        <div className="pointer-events-none absolute -right-16 top-0 hidden h-72 w-72 text-primary/30 md:block">
          <LeafCluster className="h-full w-full" />
        </div>

        <div className="relative mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
            Shop
          </span>
          <h1 className="mt-2 max-w-3xl font-serif text-5xl font-medium leading-[1.05] tracking-tight text-fg sm:text-6xl">
            Practical guides,{' '}
            <span className="italic text-primary-deep">delivered instantly.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-fg-muted">
            Ebooks, templates, and workbooks for your kitchen or food business.
            Pay once, download forever.
          </p>
        </div>
      </section>

      <section className="bg-bg-alt">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          {rows.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {rows.map((p) => (
                <Link
                  key={p.id}
                  href={`/shop/${p.slug}`}
                  className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-surface transition hover:border-primary hover:shadow-sm"
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
                  <div className="flex flex-1 flex-col p-6">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">
                      {p.categoryName ?? 'Product'}
                    </span>
                    <h3 className="mt-2 font-serif text-xl font-medium text-fg">
                      {p.title}
                    </h3>
                    {p.description && (
                      <p className="mt-2 line-clamp-2 text-sm text-fg-muted">
                        {p.description}
                      </p>
                    )}
                    <div className="mt-auto flex items-end justify-between pt-5">
                      <div>
                        <p className="font-serif text-lg text-primary">
                          {formatNgn(p.priceNgnKobo)}
                        </p>
                        <p className="text-xs text-fg-muted">
                          or {formatUsd(p.priceUsdCents)}
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary group-hover:underline">
                        View
                        <ArrowRight size={12} className="transition group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mx-auto max-w-lg rounded-3xl border border-dashed border-border bg-surface px-6 py-20 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
        <Package size={22} />
      </div>
      <h2 className="mt-4 font-serif text-2xl text-fg">
        Nothing in the shop yet
      </h2>
      <p className="mx-auto mt-2 max-w-sm text-sm text-fg-muted">
        New products are on the way. Check back soon, or sign up for the
        newsletter for the first look.
      </p>
    </div>
  );
}
