'use client';

import { useActionState } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { sendContactMessage, type ContactState } from '../_actions';

const initial: ContactState = { ok: false };

const inputClass =
  'mt-1 block w-full rounded-lg border border-border bg-bg px-3 py-2 text-fg outline-none focus:border-primary focus:ring-2 focus:ring-primary/30';

export function ContactForm() {
  const [state, action, pending] = useActionState(sendContactMessage, initial);

  if (state.sent) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-8 text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary/15 text-primary">
          <CheckCircle2 size={24} />
        </div>
        <h3 className="mt-4 font-serif text-2xl text-fg">
          Message received.
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-fg-muted">
          We will reply within 48 hours. Check your inbox (and spam folder) for
          the response.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="border-b border-border bg-bg-alt px-6 py-4">
        <h2 className="font-serif text-xl text-fg">Send a message</h2>
        <p className="mt-1 text-sm text-fg-muted">
          I read everything that comes in. Replies usually within 48 hours.
        </p>
      </div>
      <div className="space-y-5 p-6 sm:p-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-fg">Your name</span>
            <input
              type="text"
              name="name"
              required
              minLength={2}
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-fg">Email</span>
            <input
              type="email"
              name="email"
              required
              className={inputClass}
            />
          </label>
        </div>
        <label className="block">
          <span className="text-sm font-medium text-fg">Phone number</span>
          <input
            type="tel"
            name="phone"
            required
            inputMode="tel"
            placeholder="+234 803 123 4567"
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-fg">Message</span>
          <textarea
            name="message"
            rows={5}
            required
            minLength={5}
            className={inputClass}
          />
        </label>

        {state.error && (
          <p className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="group inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-wider text-primary-fg transition hover:bg-primary-deep disabled:opacity-60"
        >
          {pending ? 'Sending...' : 'Send message'}
          {!pending && (
            <ArrowRight
              size={14}
              className="transition group-hover:translate-x-1"
            />
          )}
        </button>
      </div>
    </form>
  );
}
