import 'server-only';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Supabase env vars are missing (URL or SERVICE_ROLE_KEY).');
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

export const PRODUCT_BUCKET = 'product-files';
export const PUBLIC_IMAGE_BUCKET = 'public-images';

function sanitizeFileName(name: string) {
  const dot = name.lastIndexOf('.');
  const base = dot === -1 ? name : name.slice(0, dot);
  const ext = dot === -1 ? '' : name.slice(dot);
  const safeBase = base
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return `${safeBase}${ext.toLowerCase()}`;
}

function buildKey(originalName: string) {
  return `${crypto.randomUUID()}-${sanitizeFileName(originalName)}`;
}

export async function uploadProductFile(file: File | Blob, originalName: string) {
  const key = buildKey(originalName);
  const { error } = await supabaseAdmin.storage
    .from(PRODUCT_BUCKET)
    .upload(key, file, { upsert: false });
  if (error) throw error;
  return key;
}

export async function getProductDownloadUrl(
  fileKey: string,
  expiresInSeconds = 60 * 60 * 24,
) {
  const { data, error } = await supabaseAdmin.storage
    .from(PRODUCT_BUCKET)
    .createSignedUrl(fileKey, expiresInSeconds);
  if (error) throw error;
  return data.signedUrl;
}

export async function uploadPublicImage(file: File | Blob, originalName: string) {
  const key = buildKey(originalName);
  const { error } = await supabaseAdmin.storage
    .from(PUBLIC_IMAGE_BUCKET)
    .upload(key, file, { upsert: false });
  if (error) throw error;

  const { data } = supabaseAdmin.storage.from(PUBLIC_IMAGE_BUCKET).getPublicUrl(key);
  return { key, url: data.publicUrl };
}

export async function deleteFile(
  bucket: typeof PRODUCT_BUCKET | typeof PUBLIC_IMAGE_BUCKET,
  key: string,
) {
  const { error } = await supabaseAdmin.storage.from(bucket).remove([key]);
  if (error) throw error;
}
