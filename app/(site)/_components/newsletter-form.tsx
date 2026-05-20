'use client';

import { useActionState } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { subscribeNewsletter, type NewsletterState } from '../_actions';

const initial: NewsletterState = { ok: false };

type Variant = 'light' | 'dark';

export function NewsletterForm({
  variant = 'light',
  buttonLabel = 'Subscribe',
}: {
  variant?: Variant;
  buttonLabel?: string;
}) {
  const [state, action, pending] = useActionState(subscribeNewsletter, initial);

  const isDark = variant === 'dark';

  if (state.subscribed) {
    return (
      <div
        className={[
          'flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm',
          isDark
            ? 'border-primary-fg/30 bg-primary-fg/10 text-primary-fg'
            : 'border-primary/30 bg-primary/10 text-primary',
        ].join(' ')}
      >
        <CheckCircle2 size={16} />
        You are subscribed. Check your inbox.
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-2 sm:flex-row sm:gap-3">
      <input
        type="email"
        name="email"
        required
        placeholder="you@example.com"
        aria-label="Email address"
        className={
          isDark
            ? 'block w-full rounded-full border border-primary-fg/20 bg-primary-fg/10 px-5 py-3 text-primary-fg placeholder-primary-fg/50 outline-none transition focus:border-primary-fg focus:ring-2 focus:ring-primary-fg/30'
            : 'block w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-fg outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30'
        }
      />
      <button
        type="submit"
        disabled={pending}
        className={
          isDark
            ? 'group inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full bg-primary-fg px-6 py-3 text-sm font-semibold uppercase tracking-wider text-primary-deep transition hover:bg-primary-fg/90 disabled:opacity-60'
            : 'group inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-fg transition hover:bg-primary-deep disabled:opacity-60'
        }
      >
        {pending ? 'Joining...' : buttonLabel}
        {!pending && (
          <ArrowRight
            size={14}
            className="transition group-hover:translate-x-0.5"
          />
        )}
      </button>
      {state.error && (
        <p
          className={[
            'col-span-full text-xs',
            isDark ? 'text-primary-fg/80' : 'text-red-700',
          ].join(' ')}
        >
          {state.error}
        </p>
      )}
    </form>
  );
}
