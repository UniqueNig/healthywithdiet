'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { postCategories } from '@/lib/db/schema';

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

async function requireSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error('You must be signed in.');
  return session;
}

export type CategoryState = {
  ok: boolean;
  error?: string;
};

export async function createPostCategory(
  _prev: CategoryState,
  formData: FormData,
): Promise<CategoryState> {
  try {
    await requireSession();

    const name = String(formData.get('name') ?? '').trim();
    if (!name) return { ok: false, error: 'Name is required.' };

    const slugInput = String(formData.get('slug') ?? '').trim();
    const slug = slugify(slugInput || name);
    if (!slug) return { ok: false, error: 'Slug could not be generated.' };

    const description =
      String(formData.get('description') ?? '').trim() || null;

    await db.insert(postCategories).values({ slug, name, description });
    revalidatePath('/admin/posts/categories');
    return { ok: true };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Failed to create category.';
    if (message.includes('unique')) {
      return { ok: false, error: 'A category with that slug already exists.' };
    }
    return { ok: false, error: message };
  }
}

export async function updatePostCategory(
  categoryId: string,
  _prev: CategoryState,
  formData: FormData,
): Promise<CategoryState> {
  let success = false;
  try {
    await requireSession();

    const name = String(formData.get('name') ?? '').trim();
    if (!name) return { ok: false, error: 'Name is required.' };

    const slugInput = String(formData.get('slug') ?? '').trim();
    const slug = slugify(slugInput || name);
    if (!slug) return { ok: false, error: 'Slug could not be generated.' };

    const description =
      String(formData.get('description') ?? '').trim() || null;

    await db
      .update(postCategories)
      .set({ slug, name, description })
      .where(eq(postCategories.id, categoryId));

    success = true;
    revalidatePath('/admin/posts/categories');
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Failed to update category.';
    if (message.includes('unique')) {
      return { ok: false, error: 'A category with that slug already exists.' };
    }
    return { ok: false, error: message };
  }

  if (success) redirect('/admin/posts/categories');
  return { ok: true };
}

export async function deletePostCategory(
  categoryId: string,
  _formData: FormData,
) {
  await requireSession();
  await db.delete(postCategories).where(eq(postCategories.id, categoryId));
  revalidatePath('/admin/posts/categories');
  revalidatePath('/admin/posts');
}
