'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { products } from '@/lib/db/schema';
import {
  uploadProductFile,
  uploadPublicImage,
  deleteFile,
  PRODUCT_BUCKET,
  PUBLIC_IMAGE_BUCKET,
} from '@/lib/storage';

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function parseMoney(raw: FormDataEntryValue | null, label: string): number {
  if (raw === null || raw === '') {
    throw new Error(`${label} is required.`);
  }
  const num = Number(raw);
  if (!Number.isFinite(num) || num < 0) {
    throw new Error(`${label} must be a positive number.`);
  }
  return Math.round(num * 100);
}

function pickCategoryId(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  return trimmed;
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

export type CreateProductState = {
  ok: boolean;
  error?: string;
};

export async function createProduct(
  _prev: CreateProductState,
  formData: FormData,
): Promise<CreateProductState> {
  try {
    await requireSession();
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Unauthorized.' };
  }

  let success = false;

  try {
    const title = String(formData.get('title') ?? '').trim();
    if (!title) return { ok: false, error: 'Title is required.' };

    const description =
      String(formData.get('description') ?? '').trim() || null;

    const slugInput = String(formData.get('slug') ?? '').trim();
    const slug = slugify(slugInput || title);
    if (!slug) return { ok: false, error: 'Slug could not be generated.' };

    const categoryId = pickCategoryId(String(formData.get('categoryId') ?? ''));
    const priceNgnKobo = parseMoney(formData.get('priceNgn'), 'NGN price');
    const priceUsdCents = parseMoney(formData.get('priceUsd'), 'USD price');
    const isPublished = formData.get('isPublished') === 'on';

    const file = formData.get('file');
    if (!(file instanceof File) || file.size === 0) {
      return { ok: false, error: 'A product file (PDF or zip) is required.' };
    }

    const cover = formData.get('cover');
    let coverImageUrl: string | null = null;
    if (cover instanceof File && cover.size > 0) {
      const uploaded = await uploadPublicImage(cover, cover.name);
      coverImageUrl = uploaded.url;
    }

    const fileKey = await uploadProductFile(file, file.name);

    await db.insert(products).values({
      slug,
      title,
      description,
      coverImageUrl,
      fileKey,
      categoryId,
      priceNgnKobo,
      priceUsdCents,
      isPublished,
    });

    success = true;
    revalidatePath('/admin/products');
  } catch (err: unknown) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Failed to create product.',
    };
  }

  if (success) redirect('/admin/products');
  return { ok: true };
}

export async function updateProduct(
  productId: string,
  _prev: CreateProductState,
  formData: FormData,
): Promise<CreateProductState> {
  try {
    await requireSession();
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Unauthorized.' };
  }

  let success = false;

  try {
    const existing = await db
      .select()
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);
    if (!existing[0]) return { ok: false, error: 'Product not found.' };

    const title = String(formData.get('title') ?? '').trim();
    if (!title) return { ok: false, error: 'Title is required.' };

    const description =
      String(formData.get('description') ?? '').trim() || null;

    const slugInput = String(formData.get('slug') ?? '').trim();
    const slug = slugify(slugInput || title);
    if (!slug) return { ok: false, error: 'Slug could not be generated.' };

    const categoryId = pickCategoryId(String(formData.get('categoryId') ?? ''));
    const priceNgnKobo = parseMoney(formData.get('priceNgn'), 'NGN price');
    const priceUsdCents = parseMoney(formData.get('priceUsd'), 'USD price');
    const isPublished = formData.get('isPublished') === 'on';

    let fileKey = existing[0].fileKey;
    const file = formData.get('file');
    if (file instanceof File && file.size > 0) {
      fileKey = await uploadProductFile(file, file.name);
    }

    let coverImageUrl = existing[0].coverImageUrl;
    const cover = formData.get('cover');
    if (cover instanceof File && cover.size > 0) {
      const uploaded = await uploadPublicImage(cover, cover.name);
      coverImageUrl = uploaded.url;
    }

    await db
      .update(products)
      .set({
        slug,
        title,
        description,
        coverImageUrl,
        fileKey,
        categoryId,
        priceNgnKobo,
        priceUsdCents,
        isPublished,
        updatedAt: new Date(),
      })
      .where(eq(products.id, productId));

    success = true;
    revalidatePath('/admin/products');
    revalidatePath(`/admin/products/${productId}/edit`);
  } catch (err: unknown) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Failed to update product.',
    };
  }

  if (success) redirect('/admin/products');
  return { ok: true };
}

export async function togglePublish(productId: string, _formData: FormData) {
  await requireSession();

  const existing = await db
    .select({ isPublished: products.isPublished })
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);

  if (!existing[0]) return;

  await db
    .update(products)
    .set({
      isPublished: !existing[0].isPublished,
      updatedAt: new Date(),
    })
    .where(eq(products.id, productId));

  revalidatePath('/admin/products');
}

export async function deleteProduct(productId: string, _formData: FormData) {
  await requireSession();

  const existing = await db
    .select()
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);

  if (!existing[0]) return;

  await db.delete(products).where(eq(products.id, productId));

  const coverKey = extractCoverKey(existing[0].coverImageUrl);
  await deleteFile(PRODUCT_BUCKET, existing[0].fileKey).catch(() => {});
  if (coverKey) {
    await deleteFile(PUBLIC_IMAGE_BUCKET, coverKey).catch(() => {});
  }

  revalidatePath('/admin/products');
}
