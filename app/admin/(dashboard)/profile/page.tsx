import Link from 'next/link';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { Users, User as UserIcon } from 'lucide-react';
import { auth } from '@/lib/auth';
import { ProfileForm } from './_components/profile-form';
import { PasswordForm } from './_components/password-form';

export default async function ProfilePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect('/admin/login');

  return (
    <div className="mx-auto w-full max-w-2xl">
      <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-fg">
            My profile
          </h2>
          <p className="mt-1 text-sm text-fg-muted">
            Update your details and password.
          </p>
        </div>
        <Link
          href="/admin/team"
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-fg transition hover:border-primary hover:text-primary"
        >
          <Users size={16} />
          Manage team
        </Link>
      </header>

      <section className="mb-6 rounded-2xl border border-border bg-surface p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/15 text-primary">
            <UserIcon size={16} />
          </div>
          <div>
            <h3 className="font-semibold text-fg">Personal details</h3>
            <p className="text-xs text-fg-muted">Name shown in the dashboard.</p>
          </div>
        </div>
        <ProfileForm
          defaults={{
            name: session.user.name,
            email: session.user.email,
          }}
        />
      </section>

      <section className="rounded-2xl border border-border bg-surface p-6">
        <div className="mb-5">
          <h3 className="font-semibold text-fg">Change password</h3>
          <p className="mt-1 text-xs text-fg-muted">
            For security, changing your password signs out all other sessions.
          </p>
        </div>
        <PasswordForm />
      </section>
    </div>
  );
}
