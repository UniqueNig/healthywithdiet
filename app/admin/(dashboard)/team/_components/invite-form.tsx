'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { Plus, CheckCircle2, Copy } from 'lucide-react';
import { inviteAdmin, type InviteState } from '../_actions';

const initial: InviteState = { ok: false };

const inputClass =
  'mt-1 block w-full rounded-lg border border-border bg-bg px-3 py-2 text-fg outline-none focus:border-primary focus:ring-2 focus:ring-primary/30';

function generateTempPassword() {
  const alphabet =
    'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let out = '';
  for (let i = 0; i < 14; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

export function InviteAdminForm() {
  const [state, action, pending] = useActionState(inviteAdmin, initial);
  const [tempPassword, setTempPassword] = useState(() => generateTempPassword());
  const [copied, setCopied] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.invited) {
      formRef.current?.reset();
      setTempPassword(generateTempPassword());
    }
  }, [state]);

  function copyPassword() {
    navigator.clipboard.writeText(tempPassword).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (state.invited) {
    return (
      <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5">
        <p className="flex items-center gap-1.5 text-sm font-semibold text-primary">
          <CheckCircle2 size={16} />
          Admin added: {state.createdEmail}
        </p>
        <p className="mt-2 text-sm text-fg-muted">
          They can log in at <span className="font-mono text-fg">/admin/login</span>{' '}
          with the password you set. Ask them to change it under{' '}
          <span className="font-mono text-fg">/admin/profile</span> after first
          login.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-fg transition hover:opacity-90"
        >
          <Plus size={14} />
          Add another
        </button>
      </div>
    );
  }

  return (
    <form ref={formRef} action={action} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-fg">Name</span>
          <input
            name="name"
            required
            minLength={2}
            placeholder="Joy Faniyi"
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-fg">Email</span>
          <input
            type="email"
            name="email"
            required
            placeholder="newadmin@example.com"
            className={inputClass}
          />
        </label>
      </div>

      <div>
        <label className="block">
          <span className="text-sm font-medium text-fg">
            Temporary password
          </span>
          <div className="mt-1 flex gap-2">
            <input
              type="text"
              name="password"
              value={tempPassword}
              onChange={(e) => setTempPassword(e.target.value)}
              required
              minLength={10}
              className="block w-full rounded-lg border border-border bg-bg px-3 py-2 font-mono text-sm text-fg outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
            />
            <button
              type="button"
              onClick={copyPassword}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-surface px-3 text-sm text-fg-muted transition hover:border-primary hover:text-primary"
              title="Copy password"
            >
              <Copy size={14} />
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button
              type="button"
              onClick={() => setTempPassword(generateTempPassword())}
              className="inline-flex shrink-0 items-center rounded-lg border border-border bg-surface px-3 text-sm text-fg-muted transition hover:border-primary hover:text-primary"
              title="Regenerate"
            >
              New
            </button>
          </div>
        </label>
        <p className="mt-1 text-xs text-fg-muted">
          Copy this and send it to the new admin securely (e.g. via WhatsApp).
          They should change it after first login.
        </p>
      </div>

      {state.error && (
        <p className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-fg transition hover:opacity-90 disabled:opacity-50"
        >
          <Plus size={14} />
          {pending ? 'Adding...' : 'Add admin'}
        </button>
      </div>
    </form>
  );
}
