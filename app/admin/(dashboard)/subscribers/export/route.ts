import { headers } from 'next/headers';
import { desc } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { newsletterSubscribers } from '@/lib/db/schema';

export const runtime = 'nodejs';

function csvEscape(value: string) {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function toIsoOrEmpty(d: Date | null) {
  if (!d) return '';
  return d.toISOString();
}

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  const rows = await db
    .select()
    .from(newsletterSubscribers)
    .orderBy(desc(newsletterSubscribers.subscribedAt));

  const header = ['email', 'status', 'subscribed_at', 'unsubscribed_at'];
  const lines = [header.join(',')];
  for (const r of rows) {
    lines.push(
      [
        csvEscape(r.email),
        csvEscape(r.status),
        csvEscape(toIsoOrEmpty(r.subscribedAt)),
        csvEscape(toIsoOrEmpty(r.unsubscribedAt)),
      ].join(','),
    );
  }

  const csv = lines.join('\n') + '\n';
  const stamp = new Date().toISOString().slice(0, 10);

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="subscribers-${stamp}.csv"`,
    },
  });
}
