import Link from 'next/link';
import { ArrowLeft, Tags } from 'lucide-react';
import { asc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { productCategories } from '@/lib/db/schema';
import { CreateCategoryForm } from './_components/create-category-form';
import { CategoryRowActions } from './_components/category-row-actions';

export default async function ProductCategoriesPage() {
  const rows = await db
    .select()
    .from(productCategories)
    .orderBy(asc(productCategories.name));

  return (
    <div className="mx-auto w-full max-w-3xl">
      <Link
        href="/admin/products"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-fg-muted hover:text-fg"
      >
        <ArrowLeft size={14} />
        Back to products
      </Link>

      <header className="mb-6">
        <h2 className="text-2xl font-semibold tracking-tight text-fg">
          Product categories
        </h2>
        <p className="mt-1 text-sm text-fg-muted">
          Group products into types so shoppers can browse them on the shop.
        </p>
      </header>

      <section className="mb-8 rounded-2xl border border-border bg-surface p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-fg-muted">
          Add a category
        </h3>
        <CreateCategoryForm />
      </section>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface px-6 py-16 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
            <Tags size={22} />
          </div>
          <h3 className="mt-4 text-lg font-medium text-fg">No categories yet</h3>
          <p className="mx-auto mt-2 max-w-sm text-sm text-fg-muted">
            Add one above to start organising the shop.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <ul className="divide-y divide-border">
            {rows.map((cat) => (
              <li
                key={cat.id}
                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4 sm:p-5"
              >
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Tags size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-medium text-fg">{cat.name}</h3>
                  <p className="mt-0.5 text-xs text-fg-muted">
                    /shop/category/{cat.slug}
                    {cat.description ? ` · ${cat.description}` : ''}
                  </p>
                </div>
                <CategoryRowActions
                  categoryId={cat.id}
                  categoryName={cat.name}
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
