'use client';

import { useActionState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { updateProfile, type ProfileState } from '../_actions';

const initial: ProfileState = { ok: false };

const inputClass =
  'mt-1 block w-full rounded-lg border border-border bg-bg px-3 py-2 text-fg outline-none focus:border-primary focus:ring-2 focus:ring-primary/30';

export function ProfileForm({
  defaults,
}: {
  defaults: { name: string; email: string };
}) {
  const [state, action, pending] = useActionState(updateProfile, initial);

  return (
    <form action={action} className="space-y-4">
      <label className="block">
        <span className="text-sm font-medium text-fg">Name</span>
        <input
          name="name"
          defaultValue={defaults.name}
          required
          minLength={2}
          className={inputClass}
        />
      </label>

      <div>
        <span className="text-sm font-medium text-fg">Email</span>
        <input
          value={defaults.email}
          disabled
          className="mt-1 block w-full cursor-not-allowed rounded-lg border border-border bg-bg-alt px-3 py-2 text-fg-muted"
        />
        <p className="mt-1 text-xs text-fg-muted">
          Email cannot be changed here. Contact your developer to migrate it.
        </p>
      </div>

      {state.saved && (
        <p className="flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary">
          <CheckCircle2 size={14} />
          Profile saved.
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
          {pending ? 'Saving...' : 'Save profile'}
        </button>
      </div>
    </form>
  );
}
