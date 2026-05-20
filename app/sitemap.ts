import type { MetadataRoute } from 'next';
import { desc, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { posts, products } from '@/lib/db/schema';

function baseUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ??
    'http://localhost:3000'
  );
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const url = baseUrl();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${url}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${url}/shop`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${url}/blog`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${url}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${url}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${url}/lost-download`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];

  const [publishedProducts, publishedPosts] = await Promise.all([
    db
      .select({ slug: products.slug, updatedAt: products.updatedAt })
      .from(products)
      .where(eq(products.isPublished, true))
      .orderBy(desc(products.updatedAt)),
    db
      .select({ slug: posts.slug, updatedAt: posts.updatedAt })
      .from(posts)
      .where(eq(posts.isPublished, true))
      .orderBy(desc(posts.updatedAt)),
  ]);

  const productRoutes: MetadataRoute.Sitemap = publishedProducts.map((p) => ({
    url: `${url}/shop/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const postRoutes: MetadataRoute.Sitemap = publishedPosts.map((p) => ({
    url: `${url}/blog/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [...staticRoutes, ...productRoutes, ...postRoutes];
}
