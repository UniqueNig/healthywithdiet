'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { posts } from '@/lib/db/schema';
import { uploadPublicImage, deleteFile, PUBLIC_IMAGE_BUCKET } from '@/lib/storage';

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function extractCoverKey(url: string | null): string | null {
  if (!url) return null;
  const marker = `/${PUBLIC_IMAGE_BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return url.slice(idx + marker.length);
}

async function requireSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error('You must be signed in.');
  return session;
}

export type PostState = {
  ok: boolean;
  error?: string;
};

function pickCategoryId(raw: string): string | null {
  const trimmed = raw.trim();
  return trimmed || null;
}

export async function createPost(
  _prev: PostState,
  formData: FormData,
): Promise<PostState> {
  let success = false;

  try {
    await requireSession();

    const title = String(formData.get('title') ?? '').trim();
    if (!title) return { ok: false, error: 'Title is required.' };

    const slugInput = String(formData.get('slug') ?? '').trim();
    const slug = slugify(slugInput || title);
    if (!slug) return { ok: false, error: 'Slug could not be generated.' };

    const excerpt = String(formData.get('excerpt') ?? '').trim() || null;
    const content = String(formData.get('content') ?? '').trim();
    if (!content || content === '<p></p>') {
      return { ok: false, error: 'Body content is required.' };
    }

    const categoryId = pickCategoryId(String(formData.get('categoryId') ?? ''));
    const isPublished = formData.get('isPublished') === 'on';
    const publishedAt = isPublished ? new Date() : null;

    let coverImageUrl: string | null = null;
    const cover = formData.get('cover');
    if (cover instanceof File && cover.size > 0) {
      const uploaded = await uploadPublicImage(cover, cover.name);
      coverImageUrl = uploaded.url;
    }

    await db.insert(posts).values({
      slug,
      title,
      excerpt,
      content,
      coverImageUrl,
      categoryId,
      isPublished,
      publishedAt,
    });

    success = true;
    revalidatePath('/admin/posts');
    revalidatePath('/blog');
    revalidatePath('/');
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Failed to create post.';
    if (message.includes('unique')) {
      return { ok: false, error: 'A post with that slug already exists.' };
    }
    return { ok: false, error: message };
  }

  if (success) redirect('/admin/posts');
  return { ok: true };
}

export async function updatePost(
  postId: string,
  _prev: PostState,
  formData: FormData,
): Promise<PostState> {
  let success = false;

  try {
    await requireSession();

    const existing = await db
      .select()
      .from(posts)
      .where(eq(posts.id, postId))
      .limit(1);
    if (!existing[0]) return { ok: false, error: 'Post not found.' };

    const title = String(formData.get('title') ?? '').trim();
    if (!title) return { ok: false, error: 'Title is required.' };

    const slugInput = String(formData.get('slug') ?? '').trim();
    const slug = slugify(slugInput || title);
    if (!slug) return { ok: false, error: 'Slug could not be generated.' };

    const excerpt = String(formData.get('excerpt') ?? '').trim() || null;
    const content = String(formData.get('content') ?? '').trim();
    if (!content || content === '<p></p>') {
      return { ok: false, error: 'Body content is required.' };
    }

    const categoryId = pickCategoryId(String(formData.get('categoryId') ?? ''));
    const isPublished = formData.get('isPublished') === 'on';
    const publishedAt = isPublished
      ? existing[0].publishedAt ?? new Date()
      : null;

    let coverImageUrl = existing[0].coverImageUrl;
    const cover = formData.get('cover');
    if (cover instanceof File && cover.size > 0) {
      const uploaded = await uploadPublicImage(cover, cover.name);
      coverImageUrl = uploaded.url;
    }

    await db
      .update(posts)
      .set({
        slug,
        title,
        excerpt,
        content,
        coverImageUrl,
        categoryId,
        isPublished,
        publishedAt,
        updatedAt: new Date(),
      })
      .where(eq(posts.id, postId));

    success = true;
    revalidatePath('/admin/posts');
    revalidatePath(`/admin/posts/${postId}/edit`);
    revalidatePath('/blog');
    revalidatePath(`/blog/${slug}`);
    revalidatePath('/');
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Failed to update post.';
    if (message.includes('unique')) {
      return { ok: false, error: 'A post with that slug already exists.' };
    }
    return { ok: false, error: message };
  }

  if (success) redirect('/admin/posts');
  return { ok: true };
}

export async function togglePublish(postId: string, _formData: FormData) {
  await requireSession();

  const existing = await db
    .select({
      isPublished: posts.isPublished,
      publishedAt: posts.publishedAt,
      slug: posts.slug,
    })
    .from(posts)
    .where(eq(posts.id, postId))
    .limit(1);

  if (!existing[0]) return;

  const nowPublished = !existing[0].isPublished;
  await db
    .update(posts)
    .set({
      isPublished: nowPublished,
      publishedAt: nowPublished
        ? existing[0].publishedAt ?? new Date()
        : null,
      updatedAt: new Date(),
    })
    .where(eq(posts.id, postId));

  revalidatePath('/admin/posts');
  revalidatePath('/blog');
  revalidatePath(`/blog/${existing[0].slug}`);
  revalidatePath('/');
}

export async function uploadInlineImage(
  formData: FormData,
): Promise<{ url?: string; error?: string }> {
  try {
    await requireSession();
    const file = formData.get('image');
    if (!(file instanceof File) || file.size === 0) {
      return { error: 'No file selected.' };
    }
    const result = await uploadPublicImage(file, file.name);
    return { url: result.url };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : 'Upload failed.',
    };
  }
}

export async function deletePost(postId: string, _formData: FormData) {
  await requireSession();

  const existing = await db
    .select()
    .from(posts)
    .where(eq(posts.id, postId))
    .limit(1);

  if (!existing[0]) return;

  await db.delete(posts).where(eq(posts.id, postId));

  const coverKey = extractCoverKey(existing[0].coverImageUrl);
  if (coverKey) {
    await deleteFile(PUBLIC_IMAGE_BUCKET, coverKey).catch(() => {});
  }

  revalidatePath('/admin/posts');
  revalidatePath('/blog');
  revalidatePath(`/blog/${existing[0].slug}`);
  revalidatePath('/');
}
