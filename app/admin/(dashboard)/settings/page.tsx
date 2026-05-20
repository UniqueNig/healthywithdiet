import { getAllSettings, SETTING_KEYS } from '@/lib/settings';
import { SettingsForm } from './_components/settings-form';

export default async function SettingsPage() {
  const current = await getAllSettings();

  return (
    <div className="mx-auto w-full max-w-3xl">
      <header className="mb-6">
        <h2 className="text-2xl font-semibold tracking-tight text-fg">
          Settings
        </h2>
        <p className="mt-1 text-sm text-fg-muted">
          Site-wide defaults you can change without touching the code.
        </p>
      </header>

      <SettingsForm
        defaults={{
          downloadMaxPerToken: current[SETTING_KEYS.downloadMaxPerToken],
          downloadExpiryDays: current[SETTING_KEYS.downloadExpiryDays],
          brandTagline: current[SETTING_KEYS.brandTagline],
        }}
      />
    </div>
  );
}
