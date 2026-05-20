import { NextResponse } from 'next/server';
import { eq, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { downloadTokens, products } from '@/lib/db/schema';
import { getProductDownloadUrl } from '@/lib/storage';

export const runtime = 'nodejs';

type Params = Promise<{ token: string }>;

function errorRedirect(request: Request, reason: string) {
  const url = new URL('/download/error', request.url);
  url.searchParams.set('reason', reason);
  return NextResponse.redirect(url, 302);
}

export async function GET(request: Request, { params }: { params: Params }) {
  const { token } = await params;

  const rows = await db
    .select({
      tokenId: downloadTokens.id,
      token: downloadTokens.token,
      downloadsUsed: downloadTokens.downloadsUsed,
      maxDownloads: downloadTokens.maxDownloads,
      expiresAt: downloadTokens.expiresAt,
      fileKey: products.fileKey,
    })
    .from(downloadTokens)
    .innerJoin(products, eq(products.id, downloadTokens.productId))
    .where(eq(downloadTokens.token, token))
    .limit(1);

  const row = rows[0];
  if (!row) return errorRedirect(request, 'not-found');

  if (row.expiresAt < new Date()) {
    return errorRedirect(request, 'expired');
  }

  if (row.downloadsUsed >= row.maxDownloads) {
    return errorRedirect(request, 'exhausted');
  }

  await db
    .update(downloadTokens)
    .set({ downloadsUsed: sql`${downloadTokens.downloadsUsed} + 1` })
    .where(eq(downloadTokens.id, row.tokenId));

  const signedUrl = await getProductDownloadUrl(row.fileKey, 60 * 5);
  return NextResponse.redirect(signedUrl, 302);
}
