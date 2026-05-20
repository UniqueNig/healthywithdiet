'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { Plus } from 'lucide-react';
import { createPostCategory, type CategoryState } from '../_actions';

const initial: CategoryState = { ok: false };

const inputClass =
  'block w-full rounded-lg border border-border bg-bg px-3 py-2 text-fg outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30';

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export function CreatePostCategoryForm() {
  const [state, action, pending] = useActionState(createPostCategory, initial);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
      setName('');
      setSlug('');
      setSlugTouched(false);
    }
  }, [state]);

  function onNameChange(value: string) {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  function onSlugChange(value: string) {
    setSlugTouched(true);
    setSlug(value);
  }

  return (
    <form ref={formRef} action={action} className="mt-4 space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-fg">Name</span>
          <input
            name="name"
            required
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Nutrition"
            className={`mt-1 ${inputClass}`}
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-fg">Slug</span>
          <input
            name="slug"
            required
            value={slug}
            onChange={(e) => onSlugChange(e.target.value)}
            placeholder="nutrition"
            className={`mt-1 ${inputClass}`}
          />
        </label>
      </div>
      <label className="block">
        <span className="text-sm font-medium text-fg">Description (optional)</span>
        <input
          name="description"
          placeholder="A brief description, useful for you"
          className={`mt-1 ${inputClass}`}
        />
      </label>

      {state.error && (
        <p className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-fg transition hover:opacity-90 disabled:opacity-50"
        >
          <Plus size={14} />
          {pending ? 'Adding...' : 'Add category'}
        </button>
      </div>
    </form>
  );
}
