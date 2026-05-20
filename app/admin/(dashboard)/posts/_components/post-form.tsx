'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { Image as ImageIcon, Tags } from 'lucide-react';
import type { PostState } from '../_actions';
import { TiptapEditor } from './tiptap-editor';

const initial: PostState = { ok: false };

const inputClass =
  'block w-full rounded-lg border border-border bg-surface px-3 py-2 text-fg outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30';

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export type PostCategoryOption = {
  id: string;
  name: string;
};

export type PostFormDefaults = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  categoryId: string;
  isPublished: boolean;
  coverImageUrl: string | null;
};

export function PostForm({
  action,
  defaults,
  submitLabel,
  mode,
  categories,
}: {
  action: (prev: PostState, formData: FormData) => Promise<PostState>;
  defaults?: Partial<PostFormDefaults>;
  submitLabel: string;
  mode: 'create' | 'edit';
  categories: PostCategoryOption[];
}) {
  const [state, formAction, pending] = useActionState(action, initial);

  const [title, setTitle] = useState(defaults?.title ?? '');
  const [slug, setSlug] = useState(
    defaults?.slug ?? (defaults?.title ? slugify(defaults.title) : ''),
  );
  const [slugTouched, setSlugTouched] = useState(Boolean(defaults?.slug));
  const [coverName, setCoverName] = useState<string | null>(null);

  function onTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  function onSlugChange(value: string) {
    setSlugTouched(true);
    setSlug(value);
  }

  const isEdit = mode === 'edit';

  return (
    <form action={formAction} className="space-y-5">
      <Section title="Basics">
        <Field label="Title" required>
          <input
            name="title"
            required
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="How to start a catering business in Nigeria"
            className={inputClass}
          />
        </Field>

        <Field
          label="Slug"
          hint="The post's URL. Auto-generated from the title, but you can edit it."
          required
        >
          <input
            name="slug"
            required
            value={slug}
            onChange={(e) => onSlugChange(e.target.value)}
            placeholder="how-to-start-a-catering-business-in-nigeria"
            className={inputClass}
          />
        </Field>

        <Field
          label="Excerpt"
          hint="A one or two sentence preview shown on the blog index."
        >
          <textarea
            name="excerpt"
            rows={2}
            defaultValue={defaults?.excerpt ?? ''}
            placeholder="What this article is about, in one sentence..."
            className={inputClass}
          />
        </Field>

        <Field
          label="Category"
          hint={
            categories.length === 0
              ? 'No categories yet. Create some first.'
              : undefined
          }
        >
          <div className="flex gap-2">
            <select
              name="categoryId"
              defaultValue={defaults?.categoryId ?? ''}
              className={inputClass}
              disabled={categories.length === 0}
            >
              <option value="">No category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <Link
              href="/admin/posts/categories"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-surface px-3 text-sm text-fg-muted transition hover:border-primary hover:text-primary"
              title="Manage categories"
            >
              <Tags size={14} />
              Manage
            </Link>
          </div>
        </Field>
      </Section>

      <Section title="Body">
        <p className="-mt-2 mb-3 text-xs text-fg-muted">
          Use the toolbar to add headings, lists, quotes, and links.
        </p>
        <TiptapEditor
          name="content"
          defaultValue={defaults?.content ?? ''}
          placeholder="Start typing the article..."
        />
      </Section>

      <Section title="Cover image">
        {isEdit && defaults?.coverImageUrl && (
          <div className="flex items-center gap-3 rounded-lg border border-border bg-bg p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={defaults.coverImageUrl}
              alt=""
              className="h-16 w-24 rounded object-cover"
            />
            <span className="text-sm text-fg-muted">Current cover</span>
          </div>
        )}

        <CoverField
          selectedName={coverName}
          onSelect={setCoverName}
          hint={
            isEdit
              ? 'Optional. Leave blank to keep the current cover. Recommended: 1600×1200 (4:3), subject in the middle.'
              : 'Optional. PNG, JPG, or WebP. Recommended: 1600×1200 (4:3), subject in the middle.'
          }
        />
      </Section>

      <Section title="Visibility">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            name="isPublished"
            defaultChecked={defaults?.isPublished ?? false}
            className="mt-0.5 h-4 w-4 accent-primary"
          />
          <span>
            <span className="block text-sm font-medium text-fg">
              Publish to the blog
            </span>
            <span className="block text-xs text-fg-muted">
              If unchecked, the post is saved as a draft and hidden from
              visitors.
            </span>
          </span>
        </label>
      </Section>

      {state.error && (
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href="/admin/posts"
          className="inline-flex items-center justify-center rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-fg transition hover:bg-bg"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-fg transition hover:opacity-90 disabled:opacity-50"
        >
          {pending ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-fg-muted">
        {title}
      </h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 inline-flex items-center gap-1 text-sm font-medium text-fg">
        {label}
        {required && <span className="text-primary">*</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-fg-muted">{hint}</span>}
    </label>
  );
}

function CoverField({
  selectedName,
  onSelect,
  hint,
}: {
  selectedName: string | null;
  onSelect: (name: string | null) => void;
  hint?: string;
}) {
  return (
    <div>
      <label className="mt-1 flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-border bg-bg px-3 py-3 transition hover:border-primary">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-surface">
          <ImageIcon size={18} className="text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-fg">
            {selectedName ?? 'Click to choose a cover image'}
          </p>
          <p className="text-xs text-fg-muted">{hint}</p>
        </div>
        <input
          type="file"
          name="cover"
          accept="image/*"
          onChange={(e) => onSelect(e.target.files?.[0]?.name ?? null)}
          className="sr-only"
        />
      </label>
    </div>
  );
}
