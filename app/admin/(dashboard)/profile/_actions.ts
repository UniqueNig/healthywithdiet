'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { user } from '@/lib/db/schema';

async function requireSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error('You must be signed in.');
  return session;
}

export type ProfileState = {
  ok: boolean;
  saved?: boolean;
  error?: string;
};

export async function updateProfile(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  try {
    const session = await requireSession();

    const name = String(formData.get('name') ?? '').trim();
    if (!name || name.length < 2) {
      return { ok: false, error: 'Name must be at least 2 characters.' };
    }

    await db
      .update(user)
      .set({ name, updatedAt: new Date() })
      .where(eq(user.id, session.user.id));

    revalidatePath('/admin/profile');
    revalidatePath('/admin');
    return { ok: true, saved: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Failed to update profile.',
    };
  }
}

export type PasswordState = {
  ok: boolean;
  saved?: boolean;
  error?: string;
};

export async function changePassword(
  _prev: PasswordState,
  formData: FormData,
): Promise<PasswordState> {
  try {
    await requireSession();

    const currentPassword = String(formData.get('currentPassword') ?? '');
    const newPassword = String(formData.get('newPassword') ?? '');
    const confirm = String(formData.get('confirm') ?? '');

    if (!currentPassword) {
      return { ok: false, error: 'Enter your current password.' };
    }
    if (newPassword.length < 10) {
      return {
        ok: false,
        error: 'New password must be at least 10 characters.',
      };
    }
    if (newPassword !== confirm) {
      return { ok: false, error: 'The two new passwords do not match.' };
    }

    await auth.api.changePassword({
      body: {
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      },
      headers: await headers(),
    });

    return { ok: true, saved: true };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Failed to change password.';
    if (/incorrect|invalid/i.test(message)) {
      return { ok: false, error: 'Current password is incorrect.' };
    }
    return { ok: false, error: message };
  }
}
