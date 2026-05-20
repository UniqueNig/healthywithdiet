import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { asc, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { productCategories, products } from '@/lib/db/schema';
import { ProductForm } from '../../_components/product-form';
import { updateProduct } from '../../_actions';

function getFileLabel(fileKey: string): string {
  const idx = fileKey.indexOf('-');
  if (idx === -1) return fileKey;
  return fileKey.slice(idx + 1);
}

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [rows, categories] = await Promise.all([
    db.select().from(products).where(eq(products.id, id)).limit(1),
    db.select().from(productCategories).orderBy(asc(productCategories.name)),
  ]);
  const product = rows[0];

  if (!product) {
    notFound();
  }

  const boundAction = updateProduct.bind(null, product.id);

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
          Edit product
        </h2>
        <p className="mt-1 text-sm text-fg-muted">
          Update the details, prices, or files for{' '}
          <span className="font-medium text-fg">{product.title}</span>.
        </p>
      </header>

      <ProductForm
        action={boundAction}
        submitLabel="Save changes"
        mode="edit"
        categories={categories}
        defaults={{
          title: product.title,
          slug: product.slug,
          description: product.description ?? '',
          categoryId: product.categoryId ?? '',
          priceNgnNaira: (product.priceNgnKobo / 100).toString(),
          priceUsdDollars: (product.priceUsdCents / 100).toFixed(2),
          isPublished: product.isPublished,
          coverImageUrl: product.coverImageUrl,
          fileLabel: getFileLabel(product.fileKey),
        }}
      />
    </div>
  );
}
