import Link from 'next/link';
import {
  ArrowRight,
  Sparkles,
  Package,
  BookOpen,
  FlaskConical,
  ChefHat,
  Apple,
  Utensils,
  Briefcase,
  GraduationCap,
  Leaf,
  Newspaper,
} from 'lucide-react';
import { desc, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { postCategories, posts, productCategories, products } from '@/lib/db/schema';
import { formatNgn, formatUsd } from '@/lib/format';
import {
  LeafCluster,
  ScribbleUnderline,
  SectionDivider,
  DotGrid,
  PlateMark,
} from './_components/decorations';
import { Reveal } from './_components/reveal';
import { Marquee } from './_components/marquee';
import { NewsletterForm } from './_components/newsletter-form';

const TOPICS = [
  {
    icon: ChefHat,
    title: 'Recipes',
    description: 'Tested in real kitchens, written so you can follow them on a Tuesday night.',
  },
  {
    icon: Apple,
    title: 'Nutrition',
    description: 'Evidence-based, jargon-light. What to eat, what to skip, and why.',
  },
  {
    icon: Utensils,
    title: 'Catering',
    description: 'Costing, prep flow, and event tactics for small catering operations.',
  },
  {
    icon: FlaskConical,
    title: 'Food science',
    description: 'Why bread rises. Why your stew splits. The chemistry of everyday cooking.',
  },
  {
    icon: Briefcase,
    title: 'Food business',
    description: 'Selling, pricing, branding, and the long game of building a food brand.',
  },
  {
    icon: GraduationCap,
    title: 'Teaching',
    description: 'Lesson plans and frameworks for educators and culinary trainers.',
  },
];

export default async function HomePage() {
  const [featured, latestPosts] = await Promise.all([
    db
      .select({
        id: products.id,
        slug: products.slug,
        title: products.title,
        description: products.description,
        coverImageUrl: products.coverImageUrl,
        priceNgnKobo: products.priceNgnKobo,
        priceUsdCents: products.priceUsdCents,
        categoryName: productCategories.name,
      })
      .from(products)
      .leftJoin(productCategories, eq(products.categoryId, productCategories.id))
      .where(eq(products.isPublished, true))
      .orderBy(desc(products.createdAt))
      .limit(3),
    db
      .select({
        id: posts.id,
        slug: posts.slug,
        title: posts.title,
        excerpt: posts.excerpt,
        coverImageUrl: posts.coverImageUrl,
        publishedAt: posts.publishedAt,
        categoryName: postCategories.name,
      })
      .from(posts)
      .leftJoin(postCategories, eq(posts.categoryId, postCategories.id))
      .where(eq(posts.isPublished, true))
      .orderBy(desc(posts.publishedAt))
      .limit(3),
  ]);

  const hero = featured[0] ?? null;
  const rest = featured.slice(1);

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <DotGrid className="pointer-events-none absolute inset-0 text-primary/20" />
        <div
          className="pointer-events-none absolute -right-10 top-10 hidden h-[420px] w-[320px] text-primary/40 md:block"
          style={{ animation: 'float-slow 8s ease-in-out infinite' }}
        >
          <LeafCluster className="h-full w-full" />
        </div>
        <div
          className="pointer-events-none absolute -left-16 bottom-0 h-[200px] w-[200px] rotate-[170deg] text-accent/30"
          style={{ animation: 'float-slower 12s ease-in-out infinite' }}
        >
          <LeafCluster className="h-full w-full" />
        </div>
        <div
          className="pointer-events-none absolute right-1/4 top-8 hidden h-12 w-12 rotate-12 text-primary/30 lg:block"
          style={{ animation: 'float-slower 12s ease-in-out infinite' }}
        >
          <Leaf className="h-full w-full" strokeWidth={1.6} />
        </div>

        <div className="relative mx-auto w-full max-w-6xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24">
          <Reveal>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-surface/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary backdrop-blur">
              <Sparkles size={12} />
              Food science · Nutrition · Education
            </span>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="mt-6 max-w-3xl font-serif text-5xl font-medium leading-[1.05] tracking-tight text-fg sm:text-6xl md:text-7xl">
              Practical food science
              <br />
              for{' '}
              <span className="relative inline-block italic text-primary-deep">
                real Nigerian
                <ScribbleUnderline className="absolute -bottom-2 left-0 h-3 w-full text-accent" />
              </span>{' '}
              kitchens.
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-fg-muted">
              Recipes, nutrition guides, and business ebooks from a working
              food scientist. For home cooks, caterers, and food entrepreneurs
              who want what actually works.
            </p>
          </Reveal>

          <Reveal delay={220}>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/shop"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-wider text-primary-fg shadow-sm transition hover:bg-primary-deep hover:shadow-md"
              >
                Browse the shop
                <ArrowRight
                  size={16}
                  className="transition group-hover:translate-x-1"
                />
              </Link>
              <Link
                href="/blog"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-surface px-6 py-3 text-sm font-semibold uppercase tracking-wider text-fg transition hover:-translate-y-0.5 hover:border-primary hover:text-primary"
              >
                Read the blog
              </Link>
            </div>
          </Reveal>

          {/* Pillars */}
          <Reveal delay={300}>
            <div className="mt-16 grid grid-cols-1 gap-px overflow-hidden rounded-3xl border border-border bg-border sm:grid-cols-3">
              <Pillar
                icon={<FlaskConical size={18} />}
                title="Grounded in science"
                body="Every recipe and guide is tested through a food scientist's lens. No hype, no fads."
              />
              <Pillar
                icon={<Package size={18} />}
                title="Built for working kitchens"
                body="Local ingredients, real budgets, and timing that fits real life and real businesses."
              />
              <Pillar
                icon={<BookOpen size={18} />}
                title="Made to be taught"
                body="Educator-first format. Clear language, useful frameworks, downloadable forever."
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* MARQUEE */}
      <Marquee />

      {/* FEATURED PRODUCTS */}
      <section className="relative bg-bg-alt">
        <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
          <Reveal>
            <div className="flex items-end justify-between gap-6">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-fg-muted">
                  From the shop
                </span>
                <h2 className="mt-1 font-serif text-4xl font-medium tracking-tight text-fg sm:text-5xl">
                  Pick up a guide.
                </h2>
              </div>
              <Link
                href="/shop"
                className="group hidden items-center gap-1.5 text-sm font-semibold uppercase tracking-wider text-primary hover:underline sm:inline-flex"
              >
                See all
                <ArrowRight
                  size={14}
                  className="transition group-hover:translate-x-1"
                />
              </Link>
            </div>
          </Reveal>

          {hero === null ? (
            <Reveal delay={120}>
              <div className="mt-10 rounded-3xl border border-dashed border-border bg-surface px-6 py-20 text-center">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
                  <Package size={22} />
                </div>
                <p className="mt-4 font-serif text-xl text-fg">
                  New products are on the way.
                </p>
                <p className="mt-1 text-sm text-fg-muted">
                  Check back soon. Or join the list for the first look.
                </p>
              </div>
            </Reveal>
          ) : (
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              <Reveal className="md:col-span-2">
                <Link
                  href={`/shop/${hero.slug}`}
                  className="group relative block overflow-hidden rounded-3xl border border-border bg-surface transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="aspect-3/2 max-h-80 w-full overflow-hidden bg-bg">
                    {hero.coverImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={hero.coverImageUrl}
                        alt=""
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="relative grid h-full w-full place-items-center bg-linear-to-br from-primary/20 to-accent/10 text-primary">
                        <PlateMark className="h-24 w-24" />
                      </div>
                    )}
                  </div>
                  <div className="p-6 sm:p-8">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
                      Featured · {hero.categoryName ?? 'New release'}
                    </span>
                    <h3 className="mt-2 font-serif text-2xl font-medium text-fg sm:text-3xl">
                      {hero.title}
                    </h3>
                    {hero.description && (
                      <p className="mt-2 line-clamp-2 max-w-md text-sm text-fg-muted">
                        {hero.description}
                      </p>
                    )}
                    <div className="mt-5 flex items-end justify-between">
                      <div>
                        <p className="font-serif text-xl leading-none text-primary">
                          {formatNgn(hero.priceNgnKobo)}
                        </p>
                        <p className="mt-1 text-xs text-fg-muted">
                          or {formatUsd(hero.priceUsdCents)}
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary group-hover:underline">
                        Read more
                        <ArrowRight
                          size={14}
                          className="transition group-hover:translate-x-1"
                        />
                      </span>
                    </div>
                  </div>
                </Link>
              </Reveal>

              <Reveal delay={120}>
                <div className="flex flex-col gap-5">
                  {rest.length > 0 ? (
                    rest.map((p) => (
                      <Link
                        key={p.id}
                        href={`/shop/${p.slug}`}
                        className="group flex overflow-hidden rounded-3xl border border-border bg-surface transition hover:-translate-y-1 hover:shadow-md"
                      >
                        <div className="h-32 w-32 shrink-0 overflow-hidden bg-bg">
                          {p.coverImageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={p.coverImageUrl}
                              alt=""
                              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="grid h-full w-full place-items-center bg-linear-to-br from-primary/15 to-accent/10 text-primary">
                              <PlateMark className="h-12 w-12" />
                            </div>
                          )}
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col justify-center px-4 py-3">
                          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-fg-muted">
                            {p.categoryName ?? 'Product'}
                          </span>
                          <h4 className="mt-0.5 truncate font-serif text-lg text-fg">
                            {p.title}
                          </h4>
                          <p className="mt-1 text-sm font-semibold text-primary">
                            {formatNgn(p.priceNgnKobo)}
                          </p>
                          <p className="text-[11px] text-fg-muted">
                            or {formatUsd(p.priceUsdCents)}
                          </p>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="flex flex-1 items-center justify-center rounded-3xl border border-dashed border-border bg-surface/50 p-6 text-center text-sm text-fg-muted">
                      More products dropping soon.
                    </div>
                  )}
                </div>
              </Reveal>
            </div>
          )}
        </div>
      </section>

      {/* TOPICS */}
      <section className="relative">
        <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
          <Reveal>
            <div className="text-center">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-fg-muted">
                What I write about
              </span>
              <h2 className="mt-2 font-serif text-4xl font-medium tracking-tight text-fg sm:text-5xl">
                Six things I keep coming back to.
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-fg-muted">
                The full picture from raw ingredient to finished plate, from
                home kitchen to commercial operation.
              </p>
            </div>
          </Reveal>

          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {TOPICS.map((topic, idx) => {
              const Icon = topic.icon;
              return (
                <Reveal key={topic.title} delay={idx * 60}>
                  <div className="group relative h-full overflow-hidden rounded-3xl border border-border bg-surface p-6 transition hover:-translate-y-1 hover:border-primary hover:shadow-md">
                    <div className="absolute -right-6 -top-6 h-24 w-24 rotate-12 text-primary/10 transition-transform duration-500 group-hover:rotate-0 group-hover:scale-110">
                      <LeafCluster className="h-full w-full" />
                    </div>
                    <div className="relative">
                      <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-fg">
                        <Icon size={20} />
                      </div>
                      <h3 className="mt-4 font-serif text-xl font-medium text-fg">
                        {topic.title}
                      </h3>
                      <p className="mt-2 text-sm text-fg-muted">
                        {topic.description}
                      </p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <SectionDividerStrip />

      {/* FROM THE BLOG */}
      {latestPosts.length > 0 && (
        <section className="relative bg-bg-alt">
          <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
            <Reveal>
              <div className="flex items-end justify-between gap-6">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-fg-muted">
                    Field notes
                  </span>
                  <h2 className="mt-1 font-serif text-4xl font-medium tracking-tight text-fg sm:text-5xl">
                    From the blog.
                  </h2>
                </div>
                <Link
                  href="/blog"
                  className="group hidden items-center gap-1.5 text-sm font-semibold uppercase tracking-wider text-primary hover:underline sm:inline-flex"
                >
                  All articles
                  <ArrowRight
                    size={14}
                    className="transition group-hover:translate-x-1"
                  />
                </Link>
              </div>
            </Reveal>

            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {latestPosts.map((post, idx) => (
                <Reveal key={post.id} delay={idx * 80}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="group flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-surface transition hover:-translate-y-1 hover:border-primary"
                  >
                    <div className="aspect-4/3 w-full overflow-hidden bg-bg">
                      {post.coverImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={post.coverImageUrl}
                          alt=""
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="grid h-full w-full place-items-center bg-linear-to-br from-primary/15 to-accent/10 text-primary">
                          <Newspaper size={28} />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">
                        {post.categoryName ?? 'Article'}
                      </span>
                      <h3 className="mt-2 font-serif text-lg font-medium text-fg">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="mt-2 line-clamp-2 text-sm text-fg-muted">
                          {post.excerpt}
                        </p>
                      )}
                      <span className="mt-auto pt-4 text-xs text-fg-muted">
                        {post.publishedAt ? formatDate(post.publishedAt) : ''}
                      </span>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ABOUT */}
      <section className="relative">
        <div className="mx-auto grid w-full max-w-6xl gap-12 px-4 py-20 sm:px-6 sm:py-24 md:grid-cols-12 md:items-center">
          <Reveal className="md:col-span-5">
            <div className="relative">
              <div className="aspect-[4/5] w-full overflow-hidden rounded-3xl bg-linear-to-br from-primary/25 via-bg-alt to-accent/20">
                <div className="grid h-full w-full place-items-center text-primary-deep">
                  <div className="text-center">
                    <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-surface font-serif text-3xl text-primary shadow-sm">
                      J
                    </div>
                    <p className="mt-4 px-6 font-serif italic text-sm text-fg-muted">
                      Author photo goes here
                    </p>
                  </div>
                </div>
              </div>
              <div
                className="pointer-events-none absolute -bottom-6 -right-6 h-24 w-24 text-primary/40"
                style={{ animation: 'float-slow 8s ease-in-out infinite' }}
              >
                <LeafCluster className="h-full w-full rotate-12" />
              </div>
            </div>
          </Reveal>

          <Reveal delay={120} className="md:col-span-7">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-fg-muted">
              About
            </span>
            <h2 className="mt-1 font-serif text-4xl font-medium tracking-tight text-fg sm:text-5xl">
              Hi, I am{' '}
              <span className="italic text-primary-deep">Joy</span>.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-fg">
              I am a food scientist and educator. I write practical guides,
              share recipes that actually work, and help small food businesses
              level up.
            </p>
            <p className="mt-3 leading-relaxed text-fg-muted">
              Everything you find here comes from real kitchens and real
              classrooms. No fluff. No hype. Just food, made well.
            </p>
            <Link
              href="/about"
              className="group mt-6 inline-flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wider text-primary hover:underline"
            >
              More about me
              <ArrowRight
                size={14}
                className="transition group-hover:translate-x-1"
              />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* QUOTE */}
      <section className="relative overflow-hidden border-y border-border bg-bg-alt">
        <DotGrid className="pointer-events-none absolute inset-0 text-primary/15" />
        <div className="relative mx-auto w-full max-w-3xl px-4 py-20 text-center sm:px-6 sm:py-24">
          <Reveal>
            <span className="font-serif text-6xl leading-none text-primary/40">
              “
            </span>
            <p className="mt-2 font-serif text-2xl italic leading-snug text-fg sm:text-3xl">
              Food is the most accessible classroom there is. Teach it well,
              and you change a kitchen, a family, a business.
            </p>
            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-fg-muted">
              — Joy, Food Scientist &amp; Educator
            </p>
          </Reveal>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="relative overflow-hidden bg-primary-deep text-primary-fg">
        <div
          className="pointer-events-none absolute -right-10 top-0 h-64 w-64 text-primary-fg/10"
          style={{ animation: 'float-slow 8s ease-in-out infinite' }}
        >
          <LeafCluster className="h-full w-full" />
        </div>
        <div
          className="pointer-events-none absolute -left-10 bottom-0 h-48 w-48 rotate-[170deg] text-primary-fg/10"
          style={{ animation: 'float-slower 12s ease-in-out infinite' }}
        >
          <LeafCluster className="h-full w-full" />
        </div>

        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-8 px-4 py-16 sm:px-6 sm:py-20 md:grid-cols-2">
          <Reveal>
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-fg/70">
              The newsletter
            </span>
            <h2 className="mt-2 font-serif text-3xl font-medium leading-tight text-primary-fg sm:text-4xl">
              New recipes, nutrition tips, and the occasional rant.
            </h2>
            <p className="mt-3 text-primary-fg/80">
              One email, every other week. No spam, no nonsense, unsubscribe in
              two clicks.
            </p>
          </Reveal>
          <Reveal delay={120}>
            <NewsletterForm variant="dark" />
          </Reveal>
        </div>
      </section>
    </div>
  );
}

function Pillar({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="group bg-surface p-6 transition hover:bg-bg-alt sm:p-7">
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary transition group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-fg">
        {icon}
      </div>
      <h3 className="mt-4 font-serif text-lg font-medium text-fg">{title}</h3>
      <p className="mt-1 text-sm text-fg-muted">{body}</p>
    </div>
  );
}

function SectionDividerStrip() {
  return (
    <div className="mx-auto flex w-full max-w-6xl items-center justify-center py-6 text-primary">
      <SectionDivider className="h-4 w-24" />
    </div>
  );
}

function formatDate(d: Date) {
  return new Intl.DateTimeFormat('en-NG', { dateStyle: 'medium' }).format(d);
}
