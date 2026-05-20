'use client';

import Link from 'next/link';
import { Pencil, Trash2 } from 'lucide-react';
import { deleteCategory } from '../_actions';

const iconButton =
  'grid h-8 w-8 place-items-center rounded-md text-fg-muted transition-colors hover:bg-bg hover:text-fg';

export function CategoryRowActions({
  categoryId,
  categoryName,
}: {
  categoryId: string;
  categoryName: string;
}) {
  return (
    <div className="flex items-center gap-1">
      <Link
        href={`/admin/products/categories/${categoryId}/edit`}
        aria-label="Edit"
        title="Edit"
        className={iconButton}
      >
        <Pencil size={16} />
      </Link>

      <form
        action={deleteCategory.bind(null, categoryId)}
        onSubmit={(e) => {
          if (
            !window.confirm(
              `Delete "${categoryName}"? Products in this category will become uncategorised.`,
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
