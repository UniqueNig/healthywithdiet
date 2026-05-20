'use client';

import { Trash2 } from 'lucide-react';
import { removeAdmin } from '../_actions';

export function AdminRowActions({
  adminId,
  adminEmail,
  isSelf,
}: {
  adminId: string;
  adminEmail: string;
  isSelf: boolean;
}) {
  if (isSelf) {
    return (
      <span className="text-[10px] font-semibold uppercase tracking-wider text-fg-muted">
        You
      </span>
    );
  }

  return (
    <form
      action={removeAdmin.bind(null, adminId)}
      onSubmit={(e) => {
        if (
          !window.confirm(
            `Remove ${adminEmail} as an admin? They will lose all access immediately.`,
          )
        ) {
          e.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        aria-label="Remove admin"
        title="Remove admin"
        className="grid h-8 w-8 place-items-center rounded-md text-fg-muted transition-colors hover:bg-red-50 hover:text-red-600"
      >
        <Trash2 size={15} />
      </button>
    </form>
  );
}
