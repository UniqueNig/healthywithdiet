import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, Clock, Newspaper } from 'lucide-react';
import { and, desc, eq, ne } from 'drizzle-orm';
import { db } from '@/lib/db';
import { postCategories, posts } from '@/lib/db/schema';
import { DotGrid, LeafCluster } from '../../_components/decorations';

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  const rows = await db
    .select({
      title: posts.title,
      excerpt: posts.excerpt,
      coverImageUrl: posts.coverImageUrl,
      publishedAt: posts.publishedAt,
    })
    .from(posts)
    .where(and(eq(posts.slug, slug), eq(posts.isPublished, true)))
    .limit(1);
  const p = rows[0];
  if (!p) return { title: 'Article not found' };
  return {
    title: p.title,
    description: p.excerpt ?? undefined,
    openGraph: {
      title: p.title,
      description: p.excerpt ?? undefined,
      type: 'article',
      publishedTime: p.publishedAt?.toISOString(),
      images: p.coverImageUrl ? [{ url: p.coverImageUrl }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: p.title,
      description: p.excerpt ?? undefined,
      images: p.coverImageUrl ? [p.coverImageUrl] : undefined,
    },
  };
}

function estimateReadingMinutes(html: string) {
  const text = html.replace(/<[^>]+>/g, ' ');
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export default async function ArticlePage({ params }: { params: Params }) {
  const { slug } = await params;

  const rows = await db
    .select({
      id: posts.id,
      slug: posts.slug,
      title: posts.title,
      excerpt: posts.excerpt,
      content: posts.content,
      coverImageUrl: posts.coverImageUrl,
      publishedAt: posts.publishedAt,
      categoryId: posts.categoryId,
      categoryName: postCategories.name,
      categorySlug: postCategories.slug,
    })
    .from(posts)
    .leftJoin(postCategories, eq(posts.categoryId, postCategories.id))
    .where(and(eq(posts.slug, slug), eq(posts.isPublished, true)))
    .limit(1);
  const post = rows[0];

  if (!post) notFound();

  const related = post.categoryId
    ? await db
        .select({
          id: posts.id,
          slug: posts.slug,
          title: posts.title,
          excerpt: posts.excerpt,
          coverImageUrl: posts.coverImageUrl,
          publishedAt: posts.publishedAt,
        })
        .from(posts)
        .where(
          and(
            eq(posts.isPublished, true),
            eq(posts.categoryId, post.categoryId),
            ne(posts.id, post.id),
          ),
        )
        .orderBy(desc(posts.publishedAt))
        .limit(3)
    : [];

  const readingMinutes = estimateReadingMinutes(post.content);

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ??
    'http://localhost:3000';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt ?? undefined,
    image: post.coverImageUrl ?? undefined,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.publishedAt?.toISOString(),
    author: { '@type': 'Person', name: 'Joy' },
    publisher: {
      '@type': 'Organization',
      name: 'Healthy with Diet',
      url: baseUrl,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${baseUrl}/blog/${post.slug}`,
    },
    articleSection: post.categoryName ?? undefined,
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="relative overflow-hidden border-b border-border">
        <DotGrid className="pointer-events-none absolute inset-0 text-primary/15" />
        <div className="pointer-events-none absolute -right-16 top-0 hidden h-72 w-72 text-primary/30 lg:block">
          <LeafCluster className="h-full w-full" />
        </div>

        <div className="relative mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wider text-fg-muted hover:text-primary"
          >
            <ArrowLeft size={14} />
            Back to blog
          </Link>

          <div className="mt-6 flex flex-wrap items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-fg-muted">
            {post.categoryName && post.categorySlug && (
              <Link
                href={`/blog?category=${post.categorySlug}`}
                className="text-accent hover:underline"
              >
                {post.categoryName}
              </Link>
            )}
            {post.publishedAt && (
              <>
                <span aria-hidden>·</span>
                <time dateTime={post.publishedAt.toISOString()}>
                  {formatDate(post.publishedAt)}
                </time>
              </>
            )}
            <span aria-hidden>·</span>
            <span className="inline-flex items-center gap-1">
              <Clock size={12} />
              {readingMinutes} min read
            </span>
          </div>

          <h1 className="mt-4 font-serif text-4xl font-medium leading-[1.1] tracking-tight text-fg sm:text-5xl md:text-6xl">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-fg-muted">
              {post.excerpt}
            </p>
          )}
        </div>
      </section>

      {post.coverImageUrl && (
        <section className="bg-bg-alt">
          <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
            <div className="aspect-4/3 max-h-[480px] w-full overflow-hidden rounded-3xl border border-border bg-surface">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.coverImageUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </section>
      )}

      <article className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
        <div
          className="prose-article"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>

      {related.length > 0 && (
        <section className="border-t border-border bg-bg-alt">
          <div className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
            <h2 className="font-serif text-3xl font-medium tracking-tight text-fg sm:text-4xl">
              More from{' '}
              <span className="italic text-primary-deep">
                {post.categoryName ?? 'the blog'}
              </span>
            </h2>
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <Link
                  key={p.id}
                  href={`/blog/${p.slug}`}
                  className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-surface transition hover:-translate-y-1 hover:border-primary"
                >
                  <div className="aspect-4/3 w-full overflow-hidden bg-bg">
                    {p.coverImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.coverImageUrl}
                        alt=""
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="grid h-full w-full place-items-center bg-linear-to-br from-primary/15 to-accent/10 text-primary">
                        <Newspaper size={28} />
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-serif text-lg font-medium text-fg">
                      {p.title}
                    </h3>
                    {p.excerpt && (
                      <p className="mt-2 line-clamp-2 text-sm text-fg-muted">
                        {p.excerpt}
                      </p>
                    )}
                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-primary">
                      Read
                      <ArrowRight size={12} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function formatDate(d: Date) {
  return new Intl.DateTimeFormat('en-NG', { dateStyle: 'long' }).format(d);
}
