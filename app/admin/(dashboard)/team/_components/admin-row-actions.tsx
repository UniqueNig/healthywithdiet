'use client';

import { Trash2 } from 'lucide-react';
import { removeAdmin } from '../_actions';
import { ConfirmAction } from '../../_components/confirm-action';

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
    <ConfirmAction
      action={removeAdmin.bind(null, adminId)}
      title={`Remove ${adminEmail}?`}
      description="They will lose all admin access immediately. You can re-invite them later if needed."
      confirmLabel="Remove admin"
      destructive
      triggerAriaLabel="Remove admin"
      triggerTitle="Remove admin"
      triggerClassName="grid h-8 w-8 place-items-center rounded-md text-fg-muted transition-colors hover:bg-red-50 hover:text-red-600"
    >
      <Trash2 size={15} />
    </ConfirmAction>
  );
}
