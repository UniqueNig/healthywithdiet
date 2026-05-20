import { Sparkles } from 'lucide-react';
import { DotGrid, LeafCluster } from '../_components/decorations';
import { RecoveryForm } from './_components/recovery-form';

export const metadata = {
  title: 'Lost your download?',
  description:
    'Enter the email you used at checkout to receive a fresh set of download links.',
};

export default function LostDownloadPage() {
  return (
    <div>
      <section className="relative overflow-hidden border-b border-border">
        <DotGrid className="pointer-events-none absolute inset-0 text-primary/15" />
        <div className="pointer-events-none absolute -right-16 top-0 hidden h-72 w-72 text-primary/30 md:block">
          <LeafCluster className="h-full w-full" />
        </div>

        <div className="relative mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-surface/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary backdrop-blur">
            <Sparkles size={12} />
            Lost your download?
          </span>
          <h1 className="mt-6 max-w-2xl font-serif text-5xl font-medium leading-[1.05] tracking-tight text-fg sm:text-6xl">
            We will{' '}
            <span className="italic text-primary-deep">send fresh links.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-fg-muted">
            Lost the email, link expired, or just bought a new device? Enter the
            email you used at checkout and we will send a brand-new set of
            download links.
          </p>
        </div>
      </section>

      <section className="bg-bg-alt">
        <div className="mx-auto w-full max-w-2xl px-4 py-16 sm:px-6 sm:py-20">
          <RecoveryForm />
        </div>
      </section>
    </div>
  );
}
