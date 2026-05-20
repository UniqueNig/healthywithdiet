'use client';

import Link from 'next/link';
import { Eye, EyeOff, Pencil, Trash2 } from 'lucide-react';
import { deleteProduct, togglePublish } from '../_actions';

const iconButton =
  'grid h-8 w-8 place-items-center rounded-md text-fg-muted transition-colors hover:bg-bg hover:text-fg';

export function ProductRowActions({
  productId,
  productTitle,
  isPublished,
}: {
  productId: string;
  productTitle: string;
  isPublished: boolean;
}) {
  return (
    <div className="flex items-center gap-1">
      <form action={togglePublish.bind(null, productId)}>
        <button
          type="submit"
          aria-label={isPublished ? 'Unpublish' : 'Publish'}
          title={isPublished ? 'Unpublish' : 'Publish'}
          className={iconButton}
        >
          {isPublished ? <Eye size={16} /> : <EyeOff size={16} />}
        </button>
      </form>

      <Link
        href={`/admin/products/${productId}/edit`}
        aria-label="Edit"
        title="Edit"
        className={iconButton}
      >
        <Pencil size={16} />
      </Link>

      <form
        action={deleteProduct.bind(null, productId)}
        onSubmit={(e) => {
          if (
            !window.confirm(
              `Delete "${productTitle}"? The file in storage will also be removed. This cannot be undone.`,
            )
          ) {
            e.preventDefault();
          }
        }}
      >
        <button
          type="submit"
          aria-label="Delete"
          title="Delete"
          className="grid h-8 w-8 place-items-center rounded-md text-fg-muted transition-colors hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 size={16} />
        </button>
      </form>
    </div>
  );
}
