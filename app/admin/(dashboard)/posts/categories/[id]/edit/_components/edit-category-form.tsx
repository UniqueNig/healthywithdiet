'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { updatePostCategory, type CategoryState } from '../../../_actions';

const initial: CategoryState = { ok: false };

const inputClass =
  'block w-full rounded-lg border border-border bg-surface px-3 py-2 text-fg outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30';

export function EditPostCategoryForm({
  categoryId,
  defaults,
}: {
  categoryId: string;
  defaults: { name: string; slug: string; description: string };
}) {
  const action = updatePostCategory.bind(null, categoryId);
  const [state, formAction, pending] = useActionState(action, initial);
  const [name, setName] = useState(defaults.name);
  const [slug, setSlug] = useState(defaults.slug);

  return (
    <form action={formAction} className="space-y-4 rounded-2xl border border-border bg-surface p-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-fg">Name</span>
          <input
            name="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`mt-1 ${inputClass}`}
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-fg">Slug</span>
          <input
            name="slug"
            required
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className={`mt-1 ${inputClass}`}
          />
        </label>
      </div>
      <label className="block">
        <span className="text-sm font-medium text-fg">Description (optional)</span>
        <input
          name="description"
          defaultValue={defaults.description}
          className={`mt-1 ${inputClass}`}
        />
      </label>

      {state.error && (
        <p className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href="/admin/posts/categories"
          className="inline-flex items-center justify-center rounded-lg border border-border bg-bg px-4 py-2 text-sm font-medium text-fg transition hover:border-primary"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-fg transition hover:opacity-90 disabled:opacity-50"
        >
          {pending ? 'Saving...' : 'Save changes'}
        </button>
      </div>
    </form>
  );
}
