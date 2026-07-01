import type { APIRoute } from 'astro';
import { redis, trendingKey } from '../../lib/trending';

export const prerender = false;

const LIMIT = 10;

export const GET: APIRoute = async () => {
  // Top N entries: slug + score, highest first.
  const result = (await redis.zrange(trendingKey(), 0, LIMIT - 1, {
    rev: true,
    withScores: true,
  })) as (string | number)[];

  const items: { slug: string; count: number }[] = [];
  for (let i = 0; i < result.length; i += 2) {
    const slug = String(result[i]);
    const count = Number(result[i + 1]) || 0;
    items.push({ slug, count });
  }

  return new Response(JSON.stringify({ items }), {
    status: 200,
    headers: {
      'content-type': 'application/json',
      // Cached 30s on the CDN; stale-while-revalidate keeps it fresh-ish without spamming Redis.
      'cache-control': 'public, max-age=0, s-maxage=30, stale-while-revalidate=300',
    },
  });
};
