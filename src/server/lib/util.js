export const FREE_SHIPPING_OVER = Number(process.env.FREE_SHIPPING_OVER ?? 5000);
export const SHIPPING_FEE = Number(process.env.SHIPPING_FEE ?? 250);

export const isEmail = s => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s || '').trim());
export const clean = (s, max = 200) => String(s ?? '').trim().slice(0, max);

// very small in-memory rate limiter (per IP) for public POST endpoints
const hits = new Map();
export function rateLimit(max = 20, windowMs = 60_000) {
  return (req, res, next) => {
    const key = req.ip + req.path;
    const now = Date.now();
    const arr = (hits.get(key) || []).filter(t => now - t < windowMs);
    if (arr.length >= max) return res.status(429).json({ error: 'Too many requests, please try again in a minute.' });
    arr.push(now); hits.set(key, arr); next();
  };
}
