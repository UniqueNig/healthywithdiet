import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getSettingString, SETTING_KEYS, SETTING_DEFAULTS } from '@/lib/settings';
import { AdminShell } from './_components/admin-shell';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, tagline] = await Promise.all([
    auth.api.getSession({ headers: await headers() }),
    getSettingString(
      SETTING_KEYS.brandTagline,
      SETTING_DEFAULTS[SETTING_KEYS.brandTagline],
    ),
  ]);

  if (!session) {
    redirect('/admin/login');
  }

  return (
    <AdminShell
      user={{
        name: session.user.name,
        email: session.user.email,
      }}
      tagline={tagline}
    >
      {children}
    </AdminShell>
  );
}
