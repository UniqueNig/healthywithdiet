import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { asc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { productCategories } from '@/lib/db/schema';
import { ProductForm } from '../_components/product-form';
import { createProduct } from '../_actions';

export default async function NewProductPage() {
  const categories = await db
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
          New product
        </h2>
        <p className="mt-1 text-sm text-fg-muted">
          Add an ebook, template, or guide. You can save as a draft and publish
          later.
        </p>
      </header>

      <ProductForm
        action={createProduct}
        submitLabel="Save product"
        mode="create"
        categories={categories}
      />
    </div>
  );
}
