import type { APIRoute } from 'astro';
import { Ratelimit } from '@upstash/ratelimit';
import { isValidSlug, redis, trendingKey, TRENDING_TTL_SECONDS } from '../../lib/trending';

export const prerender = false;

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, '60 s'),
  prefix: 'rl:share',
  analytics: false,
});

function getClientIp(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'anonymous'
  );
}

export const POST: APIRoute = async ({ request }) => {
  let slug: unknown;
  try {
    const body = await request.json();
    slug = body?.slug;
  } catch {
    return new Response(JSON.stringify({ error: 'invalid_json' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }

  if (!isValidSlug(slug)) {
    return new Response(JSON.stringify({ error: 'invalid_slug' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }

  const ip = getClientIp(request);
  const { success } = await ratelimit.limit(ip);
  if (!success) {
    return new Response(JSON.stringify({ error: 'rate_limited' }), {
      status: 429,
      headers: { 'content-type': 'application/json' },
    });
  }

  const key = trendingKey();
  const count = await redis.zincrby(key, 1, slug);
  await redis.expire(key, TRENDING_TTL_SECONDS);

  return new Response(JSON.stringify({ slug, count }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
};
