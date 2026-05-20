'use client';

import { Mail, RefreshCw, AlertOctagon } from 'lucide-react';
import {
  resendDownloadEmail,
  regenerateDownloadTokens,
  markRefunded,
} from '../../_actions';

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

      <form
        action={regenerateDownloadTokens.bind(null, orderId)}
        onSubmit={(e) => {
          if (
            !window.confirm(
              'Generate fresh download links and email them? Old links will stop working.',
            )
          ) {
            e.preventDefault();
          }
        }}
      >
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-fg transition hover:border-primary hover:text-primary"
        >
          <RefreshCw size={14} />
          Generate new links
        </button>
      </form>

      <form
        action={markRefunded.bind(null, orderId)}
        onSubmit={(e) => {
          if (
            !window.confirm(
              'Mark this order as refunded? You must process the refund manually in Paystack first.',
            )
          ) {
            e.preventDefault();
          }
        }}
      >
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-surface px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50"
        >
          <AlertOctagon size={14} />
          Mark refunded
        </button>
      </form>
    </div>
  );
}
