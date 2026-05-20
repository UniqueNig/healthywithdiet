'use client';

import Link from 'next/link';
import { Eye, EyeOff, Pencil, Trash2 } from 'lucide-react';
import { deleteProduct, togglePublish } from '../_actions';
import { ConfirmAction } from '../../_components/confirm-action';

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

      <ConfirmAction
        action={deleteProduct.bind(null, productId)}
        title={`Delete "${productTitle}"?`}
        description="The file in storage will also be removed. This cannot be undone."
        confirmLabel="Delete"
        destructive
        triggerAriaLabel="Delete"
        triggerTitle="Delete"
        triggerClassName="grid h-8 w-8 place-items-center rounded-md text-fg-muted transition-colors hover:bg-red-50 hover:text-red-600"
      >
        <Trash2 size={16} />
      </ConfirmAction>
    </div>
  );
}
