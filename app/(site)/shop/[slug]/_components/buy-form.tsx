'use client';

import { useActionState } from 'react';
import { ArrowRight } from 'lucide-react';
import { createOrder, type CheckoutState } from '../_actions';
import { formatNgn, formatUsd } from '@/lib/format';

const initial: CheckoutState = { ok: false };

const inputClass =
  'block w-full rounded-lg border border-border bg-bg px-3 py-2 text-fg outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30';

export function BuyForm({
  productId,
  priceNgnKobo,
  priceUsdCents,
}: {
  productId: string;
  priceNgnKobo: number;
  priceUsdCents: number;
}) {
  const action = createOrder.bind(null, productId);
  const [state, formAction, pending] = useActionState(action, initial);

  return (
    <form action={formAction} className="mt-8 space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-fg">Your name</span>
          <input
            name="name"
            placeholder="Joy"
            className={`mt-1 ${inputClass}`}
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-fg">Email</span>
          <input
            type="email"
            name="email"
            required
            placeholder="you@example.com"
            className={`mt-1 ${inputClass}`}
          />
        </label>
      </div>

      <fieldset>
        <legend className="text-sm font-medium text-fg">Pay in</legend>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <label className="relative flex cursor-pointer items-center justify-between rounded-lg border border-border bg-bg px-3 py-2.5 transition has-[input:checked]:border-primary has-[input:checked]:bg-primary/5">
            <span className="flex items-center gap-2">
              <input
                type="radio"
                name="currency"
                value="NGN"
                defaultChecked
                className="h-4 w-4 accent-primary"
              />
              <span className="text-sm font-medium text-fg">Naira</span>
            </span>
            <span className="font-serif text-sm text-primary">
              {formatNgn(priceNgnKobo)}
            </span>
          </label>
          <label className="relative flex cursor-not-allowed items-center justify-between rounded-lg border border-border bg-bg/50 px-3 py-2.5 opacity-60">
            <span className="flex items-center gap-2">
              <input
                type="radio"
                name="currency"
                value="USD"
                disabled
                className="h-4 w-4 accent-primary"
              />
              <span className="text-sm font-medium text-fg">USD</span>
            </span>
            <span className="text-sm text-fg-muted">
              {formatUsd(priceUsdCents)}
            </span>
          </label>
        </div>
        <p className="mt-1.5 text-xs text-fg-muted">
          USD checkout is coming next. NGN is live via Paystack.
        </p>
      </fieldset>

      {state.error && (
        <div className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold uppercase tracking-wider text-primary-fg transition hover:bg-primary-deep disabled:opacity-60 sm:w-auto"
      >
        {pending ? 'Redirecting to Paystack...' : 'Buy now'}
        <ArrowRight
          size={16}
          className="transition group-hover:translate-x-1"
        />
      </button>
      <p className="text-xs text-fg-muted">
        Secure checkout via Paystack. You will be redirected to complete
        payment.
      </p>
    </form>
  );
}
