'use client';

import { useActionState, useRef, useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { changePassword, type PasswordState } from '../_actions';

const initial: PasswordState = { ok: false };

const inputClass =
  'mt-1 block w-full rounded-lg border border-border bg-bg px-3 py-2 text-fg outline-none focus:border-primary focus:ring-2 focus:ring-primary/30';

export function PasswordForm() {
  const [state, action, pending] = useActionState(changePassword, initial);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.saved) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={action} className="space-y-4">
      <label className="block">
        <span className="text-sm font-medium text-fg">Current password</span>
        <input
          type="password"
          name="currentPassword"
          required
          autoComplete="current-password"
          className={inputClass}
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-fg">New password</span>
        <input
          type="password"
          name="newPassword"
          required
          minLength={10}
          autoComplete="new-password"
          className={inputClass}
        />
        <p className="mt-1 text-xs text-fg-muted">
          At least 10 characters. Use a mix of letters, numbers, and symbols.
        </p>
      </label>

      <label className="block">
        <span className="text-sm font-medium text-fg">
          Confirm new password
        </span>
        <input
          type="password"
          name="confirm"
          required
          minLength={10}
          autoComplete="new-password"
          className={inputClass}
        />
      </label>

      {state.saved && (
        <p className="flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary">
          <CheckCircle2 size={14} />
          Password updated. Other sessions have been signed out.
        </p>
      )}
      {state.error && (
        <p className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-fg transition hover:opacity-90 disabled:opacity-50"
        >
          {pending ? 'Updating...' : 'Change password'}
        </button>
      </div>
    </form>
  );
}
