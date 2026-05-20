import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { postCategories } from '@/lib/db/schema';
import { EditPostCategoryForm } from './_components/edit-category-form';

export default async function EditPostCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const rows = await db
    .select()
    .from(postCategories)
    .where(eq(postCategories.id, id))
    .limit(1);
  const category = rows[0];

  if (!category) notFound();

  return (
    <div className="mx-auto w-full max-w-2xl">
      <Link
        href="/admin/posts/categories"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-fg-muted hover:text-fg"
      >
        <ArrowLeft size={14} />
        Back to categories
      </Link>

      <header className="mb-6">
        <h2 className="text-2xl font-semibold tracking-tight text-fg">
          Edit category
        </h2>
      </header>

      <EditPostCategoryForm
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
