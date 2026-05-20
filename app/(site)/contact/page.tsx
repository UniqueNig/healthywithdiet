import { Mail, Sparkles } from 'lucide-react';
import { InstagramIcon, YoutubeIcon } from '../_components/brand-icons';
import { DotGrid, LeafCluster } from '../_components/decorations';
import { ContactForm } from './_components/contact-form';

export const metadata = {
  title: 'Contact',
  description: 'Get in touch with Healthy with Diet.',
};

export default function ContactPage() {
  return (
    <div>
      <section className="relative overflow-hidden border-b border-border">
        <DotGrid className="pointer-events-none absolute inset-0 text-primary/15" />
        <div className="pointer-events-none absolute -right-16 top-0 hidden h-72 w-72 text-primary/30 md:block">
          <LeafCluster className="h-full w-full" />
        </div>

        <div className="relative mx-auto w-full max-w-4xl px-4 py-16 sm:px-6 sm:py-20">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-surface/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary backdrop-blur">
            <Sparkles size={12} />
            Contact
          </span>
          <h1 className="mt-6 max-w-3xl font-serif text-5xl font-medium leading-[1.05] tracking-tight text-fg sm:text-6xl">
            Let us{' '}
            <span className="italic text-primary-deep">talk.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-fg-muted">
            Questions, collaborations, or just want to say hello.
          </p>
        </div>
      </section>

      <section className="bg-bg-alt">
        <div className="mx-auto w-full max-w-4xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="grid gap-4 sm:grid-cols-3">
            <ChannelCard
              href="mailto:hello@healthywithdiet.com"
              icon={<Mail size={18} />}
              label="Email"
              value="hello@healthywithdiet.com"
            />
            <ChannelCard
              href="https://instagram.com"
              icon={<InstagramIcon size={18} />}
              label="Instagram"
              value="@healthywithdiet"
              external
            />
            <ChannelCard
              href="https://youtube.com"
              icon={<YoutubeIcon size={18} />}
              label="YouTube"
              value="Healthy with Diet"
              external
            />
          </div>

          <div className="mt-10">
            <ContactForm />
          </div>
        </div>
      </section>
    </div>
  );
}

function ChannelCard({
  href,
  icon,
  label,
  value,
  external,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  value: string;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className="group flex items-start gap-4 rounded-2xl border border-border bg-surface p-5 transition hover:border-primary"
    >
      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-fg">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-fg-muted">
          {label}
        </p>
        <p className="mt-0.5 truncate font-serif text-base text-fg">{value}</p>
      </div>
    </a>
  );
}
