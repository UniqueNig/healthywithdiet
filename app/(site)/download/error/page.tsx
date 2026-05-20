import Link from 'next/link';
import { AlertCircle, Clock, RefreshCw, Mail, ArrowRight } from 'lucide-react';
import { DotGrid, LeafCluster } from '../../_components/decorations';

export const metadata = {
  title: 'Download link unavailable',
};

type SearchParams = Promise<{ reason?: string }>;

const REASONS: Record<
  string,
  {
    icon: typeof Clock;
    title: string;
    body: string;
  }
> = {
  expired: {
    icon: Clock,
    title: 'This link has expired.',
    body: 'For your security, download links only work for 7 days after they are issued. The good news: you can request a fresh set in seconds.',
  },
  exhausted: {
    icon: RefreshCw,
    title: 'This link reached its download limit.',
    body: 'Each link can be used up to 3 times. You may have hit the limit or shared it with others. Request fresh links and you are good to go.',
  },
  'not-found': {
    icon: AlertCircle,
    title: 'We could not find this link.',
    body: 'It may have been mistyped or never existed. If you genuinely bought from us, request a fresh set of links using the email you used at checkout.',
  },
};

export default async function DownloadErrorPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const reason = sp.reason ?? 'not-found';
  const info = REASONS[reason] ?? REASONS['not-found'];
  const Icon = info.icon;

  return (
    <div>
      <section className="relative overflow-hidden border-b border-border">
        <DotGrid className="pointer-events-none absolute inset-0 text-primary/15" />
        <div className="pointer-events-none absolute -right-16 top-0 hidden h-72 w-72 text-primary/30 md:block">
          <LeafCluster className="h-full w-full" />
        </div>

        <div className="relative mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-accent/15 text-accent">
            <Icon size={22} />
          </div>
          <h1 className="mt-6 max-w-2xl font-serif text-5xl font-medium leading-[1.05] tracking-tight text-fg sm:text-6xl">
            {info.title}
          </h1>
          <p className="mt-5 max-w-xl text-lg text-fg-muted">{info.body}</p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/lost-download"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-wider text-primary-fg transition hover:bg-primary-deep"
            >
              <Mail size={14} />
              Request fresh links
              <ArrowRight size={14} className="transition group-hover:translate-x-1" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-surface px-6 py-3 text-sm font-semibold uppercase tracking-wider text-fg transition hover:border-primary hover:text-primary"
            >
              Need help? Contact us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
