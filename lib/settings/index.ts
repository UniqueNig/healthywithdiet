import 'server-only';
import { inArray } from 'drizzle-orm';
import { db } from '@/lib/db';
import { settings } from '@/lib/db/schema';

export const SETTING_KEYS = {
  downloadMaxPerToken: 'download_max_per_token',
  downloadExpiryDays: 'download_expiry_days',
  contactEmailTo: 'contact_email_to',
  brandTagline: 'brand_tagline',
} as const;

export const SETTING_DEFAULTS = {
  [SETTING_KEYS.downloadMaxPerToken]: '3',
  [SETTING_KEYS.downloadExpiryDays]: '7',
  [SETTING_KEYS.contactEmailTo]: '',
  [SETTING_KEYS.brandTagline]: 'Food science · Nutrition · Education',
} as const;

const ALL_KEYS = Object.values(SETTING_KEYS);

export async function getAllSettings(): Promise<Record<string, string>> {
  const rows = await db
    .select()
    .from(settings)
    .where(inArray(settings.key, ALL_KEYS));

  const result: Record<string, string> = { ...SETTING_DEFAULTS };
  for (const row of rows) {
    result[row.key] = row.value;
  }
  return result;
}

export async function getSettingNumber(
  key: string,
  fallback: number,
): Promise<number> {
  const all = await getAllSettings();
  const raw = all[key];
  if (!raw) return fallback;
  const num = Number(raw);
  return Number.isFinite(num) ? num : fallback;
}

export async function getSettingString(
  key: string,
  fallback: string,
): Promise<string> {
  const all = await getAllSettings();
  return all[key] ?? fallback;
}

export async function setSettings(
  updates: Record<string, string>,
): Promise<void> {
  const now = new Date();
  for (const [key, value] of Object.entries(updates)) {
    await db
      .insert(settings)
      .values({ key, value, updatedAt: now })
      .onConflictDoUpdate({
        target: settings.key,
        set: { value, updatedAt: now },
      });
  }
}

export async function getDownloadDefaults() {
  const all = await getAllSettings();
  const max = Number(all[SETTING_KEYS.downloadMaxPerToken]) || 3;
  const days = Number(all[SETTING_KEYS.downloadExpiryDays]) || 7;
  return { maxDownloads: max, expiryHours: days * 24 };
}
