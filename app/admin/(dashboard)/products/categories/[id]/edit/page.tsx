import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { productCategories } from '@/lib/db/schema';
import { EditCategoryForm } from './_components/edit-category-form';

export default async function EditProductCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const rows = await db
    .select()
    .from(productCategories)
    .where(eq(productCategories.id, id))
    .limit(1);
  const category = rows[0];

  if (!category) notFound();

  return (
    <div className="mx-auto w-full max-w-2xl">
      <Link
        href="/admin/products/categories"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-fg-muted hover:text-fg"
      >
        <ArrowLeft size={14} />
        Back to categories
      </Link>

      <header className="mb-6">
        <h2 className="text-2xl font-semibold tracking-tight text-fg">
          Edit category
        </h2>
        <p className="mt-1 text-sm text-fg-muted">
          Renaming a category updates it everywhere immediately.
        </p>
      </header>

      <EditCategoryForm
        categoryId={category.id}
        defaults={{
          name: category.name,
          slug: category.slug,
          description: category.description ?? '',
        }}
      />
    </div>
  );
}
