import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { asc, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { postCategories, posts } from '@/lib/db/schema';
import { PostForm } from '../../_components/post-form';
import { updatePost } from '../../_actions';

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [rows, categories] = await Promise.all([
    db.select().from(posts).where(eq(posts.id, id)).limit(1),
    db
      .select({ id: postCategories.id, name: postCategories.name })
      .from(postCategories)
      .orderBy(asc(postCategories.name)),
  ]);

  const post = rows[0];
  if (!post) notFound();

  const boundAction = updatePost.bind(null, post.id);

  return (
    <div className="mx-auto w-full max-w-3xl">
      <Link
        href="/admin/posts"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-fg-muted hover:text-fg"
      >
        <ArrowLeft size={14} />
        Back to posts
      </Link>

      <header className="mb-6">
        <h2 className="text-2xl font-semibold tracking-tight text-fg">
          Edit post
        </h2>
        <p className="mt-1 text-sm text-fg-muted">
          Update{' '}
          <span className="font-medium text-fg">{post.title}</span>.
        </p>
      </header>

      <PostForm
        action={boundAction}
        submitLabel="Save changes"
        mode="edit"
        categories={categories}
        defaults={{
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt ?? '',
          content: post.content,
          categoryId: post.categoryId ?? '',
          isPublished: post.isPublished,
          coverImageUrl: post.coverImageUrl,
        }}
      />
    </div>
  );
}
