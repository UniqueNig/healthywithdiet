'use client';

import { useActionState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { saveSettings, type SettingsState } from '../_actions';

const initial: SettingsState = { ok: false };

const inputClass =
  'mt-1 block w-full rounded-lg border border-border bg-bg px-3 py-2 text-fg outline-none focus:border-primary focus:ring-2 focus:ring-primary/30';

export function SettingsForm({
  defaults,
}: {
  defaults: {
    downloadMaxPerToken: string;
    downloadExpiryDays: string;
    brandTagline: string;
  };
}) {
  const [state, action, pending] = useActionState(saveSettings, initial);

  return (
    <form action={action} className="space-y-6">
      <section className="rounded-2xl border border-border bg-surface p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-fg-muted">
          Downloads
        </h3>
        <p className="mt-1 text-xs text-fg-muted">
          These are the defaults used every time a fresh download link is
          created (after payment or via Lost-download).
        </p>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-fg">
              Max downloads per link
            </span>
            <input
              type="number"
              name="downloadMaxPerToken"
              min={1}
              max={100}
              step={1}
              required
              defaultValue={defaults.downloadMaxPerToken}
              className={inputClass}
            />
            <p className="mt-1 text-xs text-fg-muted">
              How many times a single download link can be used.
            </p>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-fg">
              Link expires after (days)
            </span>
            <input
              type="number"
              name="downloadExpiryDays"
              min={1}
              max={365}
              step={1}
              required
              defaultValue={defaults.downloadExpiryDays}
              className={inputClass}
            />
            <p className="mt-1 text-xs text-fg-muted">
              How long a link stays valid before customers need fresh ones.
            </p>
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-fg-muted">
          Brand
        </h3>
        <p className="mt-1 text-xs text-fg-muted">
          Small bits of copy used in the admin sidebar and mobile menu.
        </p>

        <div className="mt-5">
          <label className="block">
            <span className="text-sm font-medium text-fg">Tagline</span>
            <input
              type="text"
              name="brandTagline"
              defaultValue={defaults.brandTagline}
              placeholder="Food science · Nutrition · Education"
              className={inputClass}
            />
            <p className="mt-1 text-xs text-fg-muted">
              Shown below the brand name in the sidebar and mobile menu.
            </p>
          </label>
        </div>
      </section>

      {state.saved && (
        <p className="flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary">
          <CheckCircle2 size={14} />
          Settings saved. New defaults apply from now on.
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
          {pending ? 'Saving...' : 'Save settings'}
        </button>
      </div>
    </form>
  );
}
