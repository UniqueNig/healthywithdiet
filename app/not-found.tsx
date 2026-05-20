import Link from 'next/link';
import { ArrowRight, Home, ShoppingBag, Newspaper, Mail } from 'lucide-react';
import { SiteHeader } from './(site)/_components/site-header';
import { SiteFooter } from './(site)/_components/site-footer';
import {
  DotGrid,
  LeafCluster,
} from './(site)/_components/decorations';

const SUGGESTIONS = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/shop', icon: ShoppingBag, label: 'Shop' },
  { href: '/blog', icon: Newspaper, label: 'Blog' },
  { href: '/contact', icon: Mail, label: 'Contact' },
];

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="relative overflow-hidden">
          <DotGrid className="pointer-events-none absolute inset-0 text-primary/15" />
          <div className="pointer-events-none absolute -right-16 top-0 hidden h-80 w-80 text-primary/30 md:block">
            <LeafCluster className="h-full w-full" />
          </div>
          <div className="pointer-events-none absolute -left-16 bottom-0 h-48 w-48 rotate-[170deg] text-accent/20">
            <LeafCluster className="h-full w-full" />
          </div>

          <div className="relative mx-auto w-full max-w-3xl px-4 py-20 sm:px-6 sm:py-28">
            <span className="font-serif text-9xl italic leading-none text-primary-deep">
              404
            </span>
            <h1 className="mt-6 max-w-2xl font-serif text-4xl font-medium leading-[1.1] tracking-tight text-fg sm:text-5xl">
              We could not find{' '}
              <span className="italic text-primary-deep">that page.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-fg-muted">
              The link might be old, mistyped, or removed. Try one of these
              instead.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {SUGGESTIONS.map((s) => {
                const Icon = s.icon;
                return (
                  <Link
                    key={s.href}
                    href={s.href}
                    className="group flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 transition hover:-translate-y-0.5 hover:border-primary"
                  >
                    <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
                      <Icon size={16} />
                    </div>
                    <span className="font-medium text-fg">{s.label}</span>
                  </Link>
                );
              })}
            </div>

            <Link
              href="/"
              className="group mt-10 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-primary hover:underline"
            >
              Back to home
              <ArrowRight
                size={14}
                className="transition group-hover:translate-x-1"
              />
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
