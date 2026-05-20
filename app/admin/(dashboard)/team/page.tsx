import Link from 'next/link';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { ArrowLeft, User as UserIcon, Shield } from 'lucide-react';
import { asc } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { user } from '@/lib/db/schema';
import { InviteAdminForm } from './_components/invite-form';
import { AdminRowActions } from './_components/admin-row-actions';

export default async function TeamPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect('/admin/login');

  const admins = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    })
    .from(user)
    .orderBy(asc(user.createdAt));

  return (
    <div className="mx-auto w-full max-w-3xl">
      <Link
        href="/admin/profile"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-fg-muted hover:text-fg"
      >
        <ArrowLeft size={14} />
        Back to my profile
      </Link>

      <header className="mb-6">
        <h2 className="text-2xl font-semibold tracking-tight text-fg">
          Team
        </h2>
        <p className="mt-1 text-sm text-fg-muted">
          Everyone listed here can sign in to the admin and manage the site.
          Add admins carefully.
        </p>
      </header>

      <section className="mb-8 rounded-2xl border border-border bg-surface p-5">
        <div className="mb-2 flex items-center gap-2">
          <Shield size={16} className="text-primary" />
          <h3 className="text-sm font-semibold uppercase tracking-wide text-fg-muted">
            Add an admin
          </h3>
        </div>
        <p className="mb-4 text-xs text-fg-muted">
          We generate a strong temporary password for you to share with them.
          They should change it after their first login.
        </p>
        <InviteAdminForm />
      </section>

      <section className="overflow-hidden rounded-2xl border border-border bg-surface">
        <header className="border-b border-border bg-bg-alt px-5 py-3 text-sm font-semibold uppercase tracking-wide text-fg-muted">
          Current admins ({admins.length})
        </header>
        <ul className="divide-y divide-border">
          {admins.map((a) => (
            <li
              key={a.id}
              className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4 sm:p-5"
            >
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
                <UserIcon size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-fg">{a.name}</p>
                <p className="mt-0.5 truncate text-xs text-fg-muted">
                  {a.email} · added {formatDate(a.createdAt)}
                </p>
              </div>
              <AdminRowActions
                adminId={a.id}
                adminEmail={a.email}
                isSelf={a.id === session.user.id}
              />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function formatDate(d: Date) {
  return new Intl.DateTimeFormat('en-NG', {
    dateStyle: 'medium',
  }).format(d);
}
