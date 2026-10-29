export const FREE_SHIPPING_OVER = Number(process.env.FREE_SHIPPING_OVER ?? 5000);
export const SHIPPING_FEE = Number(process.env.SHIPPING_FEE ?? 250);

export const isEmail = s => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s || '').trim());
export const clean = (s, max = 200) => String(s ?? '').trim().slice(0, max);

// very small in-memory rate limiter (per IP) for public POST endpoints; true = over the limit
const hits = new Map();
export function rateLimited(req, max = 20, windowMs = 60_000) {
  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'local';
  const key = ip + new URL(req.url).pathname;
  const now = Date.now();
  const arr = (hits.get(key) || []).filter(t => now - t < windowMs);
  if (arr.length >= max) return true;
  arr.push(now); hits.set(key, arr); return false;
}
