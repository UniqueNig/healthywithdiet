import Link from 'next/link';
import { Plus, FileText, Tags } from 'lucide-react';
import { desc, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { postCategories, posts } from '@/lib/db/schema';
import { PostRowActions } from './_components/post-row-actions';

export default async function PostsAdminPage() {
  const rows = await db
    .select({
      id: posts.id,
      slug: posts.slug,
      title: posts.title,
      excerpt: posts.excerpt,
      coverImageUrl: posts.coverImageUrl,
      isPublished: posts.isPublished,
      publishedAt: posts.publishedAt,
      createdAt: posts.createdAt,
      categoryName: postCategories.name,
    })
    .from(posts)
    .leftJoin(postCategories, eq(posts.categoryId, postCategories.id))
    .orderBy(desc(posts.createdAt));

  return (
    <div className="mx-auto w-full max-w-5xl">
      <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-fg">Posts</h2>
          <p className="mt-1 text-sm text-fg-muted">
            Write articles, recipes, and tips for your audience.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/posts/categories"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-fg transition hover:border-primary hover:text-primary"
          >
            <Tags size={16} />
            Categories
          </Link>
          <Link
            href="/admin/posts/new"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-fg transition hover:opacity-90"
          >
            <Plus size={16} strokeWidth={2.4} />
            New post
          </Link>
        </div>
      </header>

      {rows.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <ul className="divide-y divide-border">
            {rows.map((p) => (
              <li
                key={p.id}
                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4 sm:p-5"
              >
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-bg">
                  {p.coverImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.coverImageUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <FileText size={20} className="text-fg-muted" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate font-medium text-fg">{p.title}</h3>
                    {!p.isPublished && (
                      <span className="inline-flex items-center rounded-full bg-bg px-2 py-0.5 text-xs font-medium text-fg-muted">
                        Draft
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-xs text-fg-muted">
                    {p.categoryName ?? 'Uncategorised'} · {p.slug}
                  </p>
                </div>

                <div className="text-right text-xs text-fg-muted">
                  {p.publishedAt
                    ? `Published ${formatDate(p.publishedAt)}`
                    : `Draft saved ${formatDate(p.createdAt)}`}
                </div>

                <div className="flex items-center justify-end">
                  <PostRowActions
                    postId={p.id}
                    postTitle={p.title}
                    isPublished={p.isPublished}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-surface px-6 py-16 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
        <FileText size={22} />
      </div>
      <h3 className="mt-4 text-lg font-medium text-fg">No posts yet</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm text-fg-muted">
        Write your first article, recipe, or business guide.
      </p>
      <Link
        href="/admin/posts/new"
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-fg transition hover:opacity-90"
      >
        <Plus size={16} strokeWidth={2.4} />
        New post
      </Link>
    </div>
  );
}

function formatDate(d: Date) {
  return new Intl.DateTimeFormat('en-NG', {
    dateStyle: 'medium',
  }).format(d);
}
