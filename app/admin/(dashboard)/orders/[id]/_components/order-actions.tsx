'use client';

import { Mail, RefreshCw, AlertOctagon } from 'lucide-react';
import {
  resendDownloadEmail,
  regenerateDownloadTokens,
  markRefunded,
} from '../../_actions';
import { ConfirmAction } from '../../../_components/confirm-action';

export function OrderActions({ orderId }: { orderId: string }) {
  return (
    <div className="flex flex-wrap gap-3">
      <form action={resendDownloadEmail.bind(null, orderId)}>
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-fg transition hover:border-primary hover:text-primary"
        >
          <Mail size={14} />
          Resend email
        </button>
      </form>

      <ConfirmAction
        action={regenerateDownloadTokens.bind(null, orderId)}
        title="Generate fresh download links?"
        description="The customer will receive an email with brand-new links. Any link they currently have will stop working."
        confirmLabel="Generate new links"
        triggerClassName="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-fg transition hover:border-primary hover:text-primary"
      >
        <RefreshCw size={14} />
        Generate new links
      </ConfirmAction>

      <ConfirmAction
        action={markRefunded.bind(null, orderId)}
        title="Mark this order as refunded?"
        description="This only updates the status flag here. You still need to process the actual refund in Paystack first."
        confirmLabel="Mark refunded"
        destructive
        triggerClassName="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-surface px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50"
      >
        <AlertOctagon size={14} />
        Mark refunded
      </ConfirmAction>
    </div>
  );
}
