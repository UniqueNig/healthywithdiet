import Link from 'next/link';
import { Sparkles, Newspaper, ArrowRight } from 'lucide-react';
import { and, asc, desc, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { postCategories, posts } from '@/lib/db/schema';
import { DotGrid, LeafCluster } from '../_components/decorations';

export const metadata = {
  title: 'Blog',
  description: 'Recipes, nutrition tips, and food business articles.',
};

type SearchParams = Promise<{ category?: string }>;

export default async function BlogPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const activeCategory = sp.category ?? null;

  const [allCategories, articles] = await Promise.all([
    db
      .select()
      .from(postCategories)
      .orderBy(asc(postCategories.name)),
    db
      .select({
        id: posts.id,
        slug: posts.slug,
        title: posts.title,
        excerpt: posts.excerpt,
        coverImageUrl: posts.coverImageUrl,
        publishedAt: posts.publishedAt,
        categoryName: postCategories.name,
        categorySlug: postCategories.slug,
      })
      .from(posts)
      .leftJoin(postCategories, eq(posts.categoryId, postCategories.id))
      .where(
        activeCategory
          ? and(
              eq(posts.isPublished, true),
              eq(postCategories.slug, activeCategory),
            )
          : eq(posts.isPublished, true),
      )
      .orderBy(desc(posts.publishedAt)),
  ]);

  return (
    <div>
      <section className="relative overflow-hidden border-b border-border">
        <DotGrid className="pointer-events-none absolute inset-0 text-primary/15" />
        <div className="pointer-events-none absolute -right-16 top-0 hidden h-72 w-72 text-primary/30 md:block">
          <LeafCluster className="h-full w-full" />
        </div>

        <div className="relative mx-auto w-full max-w-5xl px-4 py-20 sm:px-6 sm:py-24">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-surface/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary backdrop-blur">
            <Sparkles size={12} />
            Field notes
          </span>
          <h1 className="mt-6 max-w-3xl font-serif text-5xl font-medium leading-[1.05] tracking-tight text-fg sm:text-6xl md:text-7xl">
            Recipes, nutrition,{' '}
            <span className="italic text-primary-deep">food business.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-fg-muted">
            Long-form articles on cooking, nutrition science, and building a
            food brand from a Nigerian kitchen.
          </p>
        </div>
      </section>

      <section className="bg-bg-alt">
        <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
          {allCategories.length > 0 && (
            <nav
              aria-label="Categories"
              className="mb-10 flex flex-wrap gap-2"
            >
              <CategoryPill
                href="/blog"
                active={!activeCategory}
                label="All"
              />
              {allCategories.map((cat) => (
                <CategoryPill
                  key={cat.id}
                  href={`/blog?category=${cat.slug}`}
                  active={activeCategory === cat.slug}
                  label={cat.name}
                />
              ))}
            </nav>
          )}

          {articles.length === 0 ? (
            <EmptyState filtered={Boolean(activeCategory)} />
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-surface transition hover:-translate-y-1 hover:border-primary hover:shadow-sm"
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
                  <div className="flex flex-1 flex-col p-6">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">
                      {post.categoryName ?? 'Article'}
                    </span>
                    <h3 className="mt-2 font-serif text-xl font-medium leading-snug text-fg">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="mt-2 line-clamp-3 text-sm text-fg-muted">
                        {post.excerpt}
                      </p>
                    )}
                    <div className="mt-auto flex items-center justify-between pt-5">
                      <span className="text-xs text-fg-muted">
                        {post.publishedAt
                          ? formatDate(post.publishedAt)
                          : ''}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary group-hover:underline">
                        Read
                        <ArrowRight
                          size={12}
                          className="transition group-hover:translate-x-0.5"
                        />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function CategoryPill({
  href,
  active,
  label,
}: {
  href: string;
  active: boolean;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={[
        'rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider transition',
        active
          ? 'border-primary bg-primary/10 text-primary'
          : 'border-border bg-surface text-fg-muted hover:border-primary hover:text-fg',
      ].join(' ')}
    >
      {label}
    </Link>
  );
}

function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <div className="mx-auto max-w-lg rounded-3xl border border-dashed border-border bg-surface px-6 py-20 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
        <Newspaper size={22} />
      </div>
      <h2 className="mt-4 font-serif text-2xl text-fg">
        {filtered ? 'Nothing in this category yet' : 'Articles coming soon'}
      </h2>
      <p className="mx-auto mt-2 max-w-sm text-sm text-fg-muted">
        {filtered
          ? 'Try a different category, or check back later.'
          : 'The first wave of articles will land here shortly.'}
      </p>
    </div>
  );
}

function formatDate(d: Date) {
  return new Intl.DateTimeFormat('en-NG', { dateStyle: 'medium' }).format(d);
}
