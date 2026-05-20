'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { FileText, Image as ImageIcon, Tags } from 'lucide-react';
import type { CreateProductState } from '../_actions';

export type ProductCategoryOption = {
  id: string;
  name: string;
  slug: string;
};

const initial: CreateProductState = { ok: false };

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

export type ProductFormDefaults = {
  title: string;
  slug: string;
  description: string;
  categoryId: string;
  priceNgnNaira: string;
  priceUsdDollars: string;
  isPublished: boolean;
  coverImageUrl: string | null;
  fileLabel: string | null;
};

export function ProductForm({
  action,
  defaults,
  submitLabel,
  mode,
  categories,
}: {
  action: (
    prev: CreateProductState,
    formData: FormData,
  ) => Promise<CreateProductState>;
  defaults?: Partial<ProductFormDefaults>;
  submitLabel: string;
  mode: 'create' | 'edit';
  categories: ProductCategoryOption[];
}) {
  const [state, formAction, pending] = useActionState(action, initial);

  const [title, setTitle] = useState(defaults?.title ?? '');
  const [slug, setSlug] = useState(
    defaults?.slug ?? (defaults?.title ? slugify(defaults.title) : ''),
  );
  const [slugTouched, setSlugTouched] = useState(Boolean(defaults?.slug));
  const [fileName, setFileName] = useState<string | null>(null);
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
            placeholder="Nigerian Catering Starter Guide"
            className={inputClass}
          />
        </Field>

        <Field
          label="Slug"
          hint="The product's URL. Auto-generated from the title, but you can edit it."
          required
        >
          <input
            name="slug"
            required
            value={slug}
            onChange={(e) => onSlugChange(e.target.value)}
            placeholder="nigerian-catering-starter-guide"
            className={inputClass}
          />
        </Field>

        <Field label="Description" hint="Sales copy shown on the product page.">
          <textarea
            name="description"
            rows={4}
            defaultValue={defaults?.description ?? ''}
            placeholder="What the buyer will learn..."
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
              href="/admin/products/categories"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-surface px-3 text-sm text-fg-muted transition hover:border-primary hover:text-primary"
              title="Manage categories"
            >
              <Tags size={14} />
              Manage
            </Link>
          </div>
        </Field>
      </Section>

      <Section title="Pricing">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="NGN price" hint="In naira, e.g. 4999" required>
            <input
              name="priceNgn"
              type="number"
              step="1"
              min="0"
              required
              defaultValue={defaults?.priceNgnNaira ?? ''}
              placeholder="4999"
              className={inputClass}
            />
          </Field>
          <Field label="USD price" hint="In dollars, e.g. 9.99" required>
            <input
              name="priceUsd"
              type="number"
              step="0.01"
              min="0"
              required
              defaultValue={defaults?.priceUsdDollars ?? ''}
              placeholder="9.99"
              className={inputClass}
            />
          </Field>
        </div>
      </Section>

      <Section title="Files">
        {isEdit && defaults?.fileLabel && (
          <div className="rounded-lg border border-border bg-bg px-3 py-2 text-sm text-fg-muted">
            Current product file:{' '}
            <span className="font-medium text-fg">{defaults.fileLabel}</span>
          </div>
        )}
        <FileField
          name="file"
          label={isEdit ? 'Replace product file' : 'Product file'}
          hint={
            isEdit
              ? 'Optional. Leave blank to keep the current file.'
              : 'PDF or zip. This is what buyers download after paying.'
          }
          accept="application/pdf,application/zip"
          icon={<FileText size={18} className="text-primary" />}
          selectedName={fileName}
          onSelect={setFileName}
          required={!isEdit}
        />

        {isEdit && defaults?.coverImageUrl && (
          <div className="flex items-center gap-3 rounded-lg border border-border bg-bg p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={defaults.coverImageUrl}
              alt=""
              className="h-12 w-12 rounded object-cover"
            />
            <span className="text-sm text-fg-muted">Current cover image</span>
          </div>
        )}
        <FileField
          name="cover"
          label={isEdit ? 'Replace cover image' : 'Cover image'}
          hint={
            isEdit
              ? 'Optional. Leave blank to keep the current cover. Recommended: 1600×1200 (4:3), subject in the middle.'
              : 'Optional. PNG, JPG, or WebP. Recommended: 1600×1200 (4:3), subject in the middle.'
          }
          accept="image/*"
          icon={<ImageIcon size={18} className="text-primary" />}
          selectedName={coverName}
          onSelect={setCoverName}
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
              Publish to the shop
            </span>
            <span className="block text-xs text-fg-muted">
              If unchecked, the product stays as a draft and is hidden from
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
          href="/admin/products"
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

function FileField({
  name,
  label,
  hint,
  accept,
  icon,
  selectedName,
  onSelect,
  required,
}: {
  name: string;
  label: string;
  hint?: string;
  accept: string;
  icon: React.ReactNode;
  selectedName: string | null;
  onSelect: (name: string | null) => void;
  required?: boolean;
}) {
  return (
    <div>
      <span className="mb-1 inline-flex items-center gap-1 text-sm font-medium text-fg">
        {label}
        {required && <span className="text-primary">*</span>}
      </span>
      <label className="mt-1 flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-border bg-bg px-3 py-3 transition hover:border-primary">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-surface">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-fg">
            {selectedName ?? 'Click to choose a file'}
          </p>
          <p className="text-xs text-fg-muted">{hint}</p>
        </div>
        <input
          type="file"
          name={name}
          accept={accept}
          required={required}
          onChange={(e) => onSelect(e.target.files?.[0]?.name ?? null)}
          className="sr-only"
        />
      </label>
    </div>
  );
}
