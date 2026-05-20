import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { asc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { postCategories } from '@/lib/db/schema';
import { PostForm } from '../_components/post-form';
import { createPost } from '../_actions';

export default async function NewPostPage() {
  const categories = await db
    .select({ id: postCategories.id, name: postCategories.name })
    .from(postCategories)
    .orderBy(asc(postCategories.name));

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
          New post
        </h2>
        <p className="mt-1 text-sm text-fg-muted">
          Write an article, recipe, or guide. You can save as a draft and
          publish later.
        </p>
      </header>

      <PostForm
        action={createPost}
        submitLabel="Save post"
        mode="create"
        categories={categories}
      />
    </div>
  );
}
