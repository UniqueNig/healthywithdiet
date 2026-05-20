import type { MetadataRoute } from 'next';

function baseUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ??
    'http://localhost:3000'
  );
}

export default function robots(): MetadataRoute.Robots {
  const url = baseUrl();
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/shop', '/blog', '/about', '/contact'],
        disallow: [
          '/admin',
          '/admin/',
          '/api',
          '/api/',
          '/order/success',
          '/lost-download',
          '/unsubscribe',
          '/download/error',
        ],
      },
    ],
    sitemap: `${url}/sitemap.xml`,
    host: url,
  };
}
