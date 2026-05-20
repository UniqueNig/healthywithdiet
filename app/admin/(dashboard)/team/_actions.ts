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

export type InviteState = {
  ok: boolean;
  invited?: boolean;
  error?: string;
  createdEmail?: string;
};

export async function inviteAdmin(
  _prev: InviteState,
  formData: FormData,
): Promise<InviteState> {
  try {
    await requireSession();

    const name = String(formData.get('name') ?? '').trim();
    const email = String(formData.get('email') ?? '').trim().toLowerCase();
    const password = String(formData.get('password') ?? '');

    if (!name || name.length < 2) {
      return { ok: false, error: 'Name must be at least 2 characters.' };
    }
    if (!email || !/.+@.+\..+/.test(email)) {
      return { ok: false, error: 'Please enter a valid email address.' };
    }
    if (password.length < 10) {
      return {
        ok: false,
        error: 'Temporary password must be at least 10 characters.',
      };
    }

    await auth.api.signUpEmail({
      body: { email, password, name },
    });

    revalidatePath('/admin/team');
    return { ok: true, invited: true, createdEmail: email };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Failed to add admin.';
    if (/already exists|in use|unique/i.test(message)) {
      return {
        ok: false,
        error: 'An admin with that email already exists.',
      };
    }
    return { ok: false, error: message };
  }
}

export async function removeAdmin(adminId: string, _formData: FormData) {
  const session = await requireSession();

  if (adminId === session.user.id) {
    throw new Error('You cannot remove yourself.');
  }

  await db.delete(user).where(eq(user.id, adminId));
  revalidatePath('/admin/team');
}
