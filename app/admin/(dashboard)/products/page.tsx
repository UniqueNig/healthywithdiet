import Link from 'next/link';
import { Plus, Package, Tags } from 'lucide-react';
import { desc, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { productCategories, products } from '@/lib/db/schema';
import { formatNgn, formatUsd } from '@/lib/format';
import { ProductRowActions } from './_components/product-row-actions';

export default async function ProductsPage() {
  const rows = await db
    .select({
      id: products.id,
      slug: products.slug,
      title: products.title,
      coverImageUrl: products.coverImageUrl,
      isPublished: products.isPublished,
      priceNgnKobo: products.priceNgnKobo,
      priceUsdCents: products.priceUsdCents,
      categoryName: productCategories.name,
    })
    .from(products)
    .leftJoin(productCategories, eq(products.categoryId, productCategories.id))
    .orderBy(desc(products.createdAt));

  return (
    <div className="mx-auto w-full max-w-5xl">
      <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-fg">
            Products
          </h2>
          <p className="mt-1 text-sm text-fg-muted">
            Ebooks, templates, and guides for sale.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/products/categories"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-fg transition hover:border-primary hover:text-primary"
          >
            <Tags size={16} />
            Categories
          </Link>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-fg transition hover:opacity-90"
          >
            <Plus size={16} strokeWidth={2.4} />
            New product
          </Link>
        </div>
      </header>

      {rows.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <ul className="divide-y divide-border">
            {rows.map((p) => (
              <li
                key={p.id}
                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4 sm:p-5"
              >
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-bg">
                  {p.coverImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.coverImageUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Package size={20} className="text-fg-muted" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate font-medium text-fg">{p.title}</h3>
                    {!p.isPublished && (
                      <span className="inline-flex items-center rounded-full bg-bg px-2 py-0.5 text-xs font-medium text-fg-muted">
                        Draft
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-fg-muted">
                    {p.categoryName ?? 'Uncategorised'} · {p.slug}
                  </p>
                </div>

                <div className="text-sm text-fg sm:text-right">
                  <div>{formatNgn(p.priceNgnKobo)}</div>
                  <div className="text-fg-muted">{formatUsd(p.priceUsdCents)}</div>
                </div>

                <div className="flex items-center justify-end">
                  <ProductRowActions
                    productId={p.id}
                    productTitle={p.title}
                    isPublished={p.isPublished}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-surface px-6 py-16 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
        <Package size={22} />
      </div>
      <h3 className="mt-4 text-lg font-medium text-fg">No products yet</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm text-fg-muted">
        Add your first ebook, template, or guide. You can keep it as a draft
        until you are ready to publish.
      </p>
      <Link
        href="/admin/products/new"
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-fg transition hover:opacity-90"
      >
        <Plus size={16} strokeWidth={2.4} />
        New product
      </Link>
    </div>
  );
}
