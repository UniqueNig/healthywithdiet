import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import {
  DotGrid,
  LeafCluster,
  SectionDivider,
} from '../_components/decorations';

export const metadata = {
  title: 'About',
  description:
    'A food scientist and educator helping kitchens and food businesses level up.',
};

export default function AboutPage() {
  return (
    <div>
      <section className="relative overflow-hidden border-b border-border">
        <DotGrid className="pointer-events-none absolute inset-0 text-primary/15" />
        <div className="pointer-events-none absolute -right-16 top-0 hidden h-80 w-80 text-primary/30 md:block">
          <LeafCluster className="h-full w-full" />
        </div>

        <div className="relative mx-auto w-full max-w-5xl px-4 py-20 sm:px-6 sm:py-24">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-surface/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary backdrop-blur">
            <Sparkles size={12} />
            About
          </span>
          <h1 className="mt-6 max-w-3xl font-serif text-5xl font-medium leading-[1.05] tracking-tight text-fg sm:text-6xl md:text-7xl">
            Hi, I am{' '}
            <span className="italic text-primary-deep">Joy</span>.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-fg-muted">
            Food scientist. Educator. Quiet rebel against bad recipes.
          </p>
        </div>
      </section>

      <section className="bg-bg-alt">
        <div className="mx-auto grid w-full max-w-5xl gap-12 px-4 py-20 sm:px-6 sm:py-24 md:grid-cols-12 md:items-start">
          <div className="md:col-span-5">
            <div className="sticky top-24">
              <div className="relative">
                <div className="aspect-[4/5] w-full overflow-hidden rounded-3xl bg-linear-to-br from-primary/25 via-bg to-accent/20">
                  <div className="grid h-full w-full place-items-center">
                    <div className="grid h-24 w-24 place-items-center rounded-full bg-surface font-serif text-4xl text-primary shadow-sm">
                      J
                    </div>
                  </div>
                </div>
                <div className="pointer-events-none absolute -bottom-6 -right-6 h-24 w-24 rotate-12 text-primary/40">
                  <LeafCluster className="h-full w-full" />
                </div>
              </div>
              <p className="mt-4 text-center text-xs italic text-fg-muted">
                Author photo coming soon
              </p>
            </div>
          </div>

          <div className="md:col-span-7">
            <div className="space-y-5 text-lg leading-relaxed text-fg">
              <p className="first-letter:float-left first-letter:mr-2 first-letter:font-serif first-letter:text-6xl first-letter:font-medium first-letter:leading-[0.9] first-letter:text-primary-deep">
                I am a food scientist and educator with years of hands-on
                experience in nutrition, recipe development, and the food
                business landscape in Nigeria.
              </p>
              <p className="text-fg-muted">
                Healthy with Diet is where I share what I have learned.
                Practical guides, recipes that actually work, and ebooks
                designed for home cooks, caterers, and anyone running a food
                business.
              </p>
              <p className="text-fg-muted">
                My north star is simple. If something has not worked in a real
                kitchen, it does not belong on this site.
              </p>
            </div>

            <div className="mt-10 flex items-center text-primary">
              <SectionDivider className="h-4 w-24" />
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <FactCard label="Background" value="Food Science" />
              <FactCard label="Based in" value="Nigeria" />
              <FactCard label="Teaching" value="Nutrition & Catering" />
              <FactCard label="Writing for" value="Home cooks · Food entrepreneurs" />
            </div>

            <Link
              href="/contact"
              className="mt-10 inline-flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wider text-primary hover:underline"
            >
              Get in touch
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function FactCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-fg-muted">
        {label}
      </p>
      <p className="mt-2 font-serif text-lg text-fg">{value}</p>
    </div>
  );
}
