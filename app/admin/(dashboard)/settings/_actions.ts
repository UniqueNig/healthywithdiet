'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { setSettings, SETTING_KEYS } from '@/lib/settings';

async function requireSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error('You must be signed in.');
  return session;
}

export type SettingsState = {
  ok: boolean;
  saved?: boolean;
  error?: string;
};

export async function saveSettings(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  try {
    await requireSession();

    const maxRaw = String(formData.get('downloadMaxPerToken') ?? '').trim();
    const daysRaw = String(formData.get('downloadExpiryDays') ?? '').trim();
    const tagline = String(formData.get('brandTagline') ?? '').trim();

    const maxN = Number(maxRaw);
    const daysN = Number(daysRaw);

    if (!Number.isFinite(maxN) || maxN < 1 || maxN > 100) {
      return {
        ok: false,
        error: 'Max downloads must be a number between 1 and 100.',
      };
    }
    if (!Number.isFinite(daysN) || daysN < 1 || daysN > 365) {
      return {
        ok: false,
        error: 'Token expiry must be a number between 1 and 365 days.',
      };
    }

    await setSettings({
      [SETTING_KEYS.downloadMaxPerToken]: String(Math.floor(maxN)),
      [SETTING_KEYS.downloadExpiryDays]: String(Math.floor(daysN)),
      [SETTING_KEYS.brandTagline]: tagline,
    });

    revalidatePath('/admin/settings');
    return { ok: true, saved: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Failed to save.',
    };
  }
}
