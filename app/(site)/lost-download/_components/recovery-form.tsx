'use client';

import { useActionState } from 'react';
import { CheckCircle2, ArrowRight, Mail } from 'lucide-react';
import { requestDownloadLinks, type RecoveryState } from '../_actions';

const initial: RecoveryState = { ok: false };

const inputClass =
  'block w-full rounded-lg border border-border bg-bg px-3 py-3 text-fg outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30';

export function RecoveryForm() {
  const [state, action, pending] = useActionState(
    requestDownloadLinks,
    initial,
  );

  if (state.sent) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-6 text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary/15 text-primary">
          <CheckCircle2 size={24} />
        </div>
        <h3 className="mt-4 font-serif text-2xl text-fg">Check your inbox.</h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-fg-muted">
          If you have purchases on this email, fresh download links are on
          their way. Allow a minute, then check your spam folder if you don't
          see it.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="rounded-2xl border border-border bg-surface p-6">
      <label className="block">
        <span className="text-sm font-medium text-fg">
          The email you used to buy
        </span>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <input
            type="email"
            name="email"
            required
            placeholder="you@example.com"
            className={inputClass}
          />
          <button
            type="submit"
            disabled={pending}
            className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-wider text-primary-fg transition hover:bg-primary-deep disabled:opacity-60"
          >
            <Mail size={14} />
            {pending ? 'Sending...' : 'Resend links'}
            {!pending && (
              <ArrowRight
                size={14}
                className="transition group-hover:translate-x-1"
              />
            )}
          </button>
        </div>
      </label>

      {state.error && (
        <p className="mt-3 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <p className="mt-4 text-xs text-fg-muted">
        For your privacy, this page never tells you whether the email matched
        a purchase. If you used a different email at checkout, try that one.
      </p>
    </form>
  );
}
