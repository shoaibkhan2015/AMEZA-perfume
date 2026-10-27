import { Router } from 'express';
import { store, storeName } from '../store/index.js';
import { catalog, SORTS, sortProducts, searchProducts } from '../lib/catalog.js';
import { sendNewOrderNotification } from '../lib/order-notification.js';
import { FREE_SHIPPING_OVER, SHIPPING_FEE, isEmail, clean, rateLimit } from '../lib/util.js';

export const api = Router();
const wrap = fn => (req, res, next) => fn(req, res, next).catch(next);
const storedCollectionHandle = handle => handle === 'unisex' ? 'gift-sets' : handle;
const publicCollectionHandle = handle => handle === 'gift-sets' ? 'unisex' : handle;
const publicCollectionTitle = collection => collection.handle === 'gift-sets' ? 'Unisex' : collection.title;

async function auth(req, _res, next) {
  const m = /^Bearer (.+)$/.exec(req.headers.authorization || '');
  req.user = m ? await store.verifyUser(m[1]).catch(() => null) : null;
  next();
}
const needUser = (req, res, next) => (req.user ? next() : res.status(401).json({ error: 'Please log in.' }));
api.use(wrap(auth));

// ---------------------------------------------------------------- config
api.get('/config', (_req, res) => res.json({ freeShippingOver: FREE_SHIPPING_OVER, shippingFee: SHIPPING_FEE, currency: 'PKR' }));
api.get('/status', (_req, res) => res.json({ store: storeName }));

// ---------------------------------------------------------------- products
api.get('/products', wrap(async (req, res) => {
  const { products, collections } = await catalog();
  const c = collections.find(x => x.handle === storedCollectionHandle(req.query.collection || 'all'));
  let list = c ? c.productHandles.map(h => products.find(p => p.handle === h)).filter(Boolean) : [];
  const limit = Math.min(Number(req.query.limit) || 50, 100);
  res.json({ products: list.slice(0, limit) });
}));

api.get('/products/:handle', wrap(async (req, res) => {
  const { byHandle } = await catalog();
  const p = byHandle.get(req.params.handle);
  p ? res.json({ product: p }) : res.status(404).json({ error: 'Product not found' });
}));

// ---------------------------------------------------------------- collections
api.get('/collections', wrap(async (_req, res) => {
  const { collections } = await catalog();
  res.json({ collections: collections.map(c => ({ handle: publicCollectionHandle(c.handle), title: publicCollectionTitle(c), description: c.description, image: c.image, productsCount: c.productHandles.length })) });
}));

api.get('/collections/:handle', wrap(async (req, res) => {
  const { products, collections } = await catalog();
  const c = collections.find(x => x.handle === storedCollectionHandle(req.params.handle));
  if (!c) return res.status(404).json({ error: 'Collection not found' });

  const q = req.query;
  const sortBy = SORTS.some(s => s[0] === q.sort_by) ? q.sort_by : 'manual';
  const perPage = Math.min(Math.max(Number(q.per_page) || 12, 4), 48);
  const page = Math.max(Number(q.page) || 1, 1);
  const base = c.productHandles.map(h => products.find(p => p.handle === h)).filter(Boolean);

  const gte = q['filter.v.price.gte'] !== undefined && q['filter.v.price.gte'] !== '' ? Number(q['filter.v.price.gte']) : null;
  const lte = q['filter.v.price.lte'] !== undefined && q['filter.v.price.lte'] !== '' ? Number(q['filter.v.price.lte']) : null;
  const avail = [].concat(q['filter.v.availability'] ?? []).map(String);

  const byPrice = base.filter(p => (gte == null || p.price >= gte) && (lte == null || p.price <= lte));
  const filtered = byPrice.filter(p => !avail.length || avail.includes(p.available ? '1' : '0'));
  const sorted = sortProducts(filtered, sortBy);
  const pages = Math.max(1, Math.ceil(sorted.length / perPage));

  res.json({
    collection: { handle: publicCollectionHandle(c.handle), title: publicCollectionTitle(c), description: c.description, image: c.image, productsCount: sorted.length },
    products: sorted.slice((page - 1) * perPage, page * perPage),
    total: sorted.length, page, pages, perPage, sortBy,
    sortOptions: SORTS.map(([value, name]) => ({ value, name })),
    filters: {
      availability: { in: byPrice.filter(p => p.available).length, out: byPrice.filter(p => !p.available).length },
      priceMax: base.reduce((m, p) => Math.max(m, p.price), 0),
    },
  });
}));

// ---------------------------------------------------------------- search
api.get('/search', wrap(async (req, res) => {
  const { products } = await catalog();
  const q = clean(req.query.q, 100);
  const found = searchProducts(products, q);
  const perPage = 12, page = Math.max(Number(req.query.page) || 1, 1);
  res.json({ q, performed: !!q, total: found.length, page, pages: Math.max(1, Math.ceil(found.length / perPage)),
    products: found.slice((page - 1) * perPage, page * perPage) });
}));

// ---------------------------------------------------------------- content
api.get('/pages/:handle', wrap(async (req, res) => {
  const p = await store.getPage(req.params.handle);
  p ? res.json({ page: p }) : res.status(404).json({ error: 'Page not found' });
}));
api.get('/blogs/:handle', wrap(async (req, res) => {
  const b = await store.getBlog(req.params.handle);
  b ? res.json({ blog: b }) : res.status(404).json({ error: 'Blog not found' });
}));

// ---------------------------------------------------------------- cart helpers
// Re-price whatever is in the browser's cart using the real database prices.
async function priceLines(lines) {
  const { products } = await catalog();
  const out = [];
  for (const l of lines.slice(0, 50)) {
    const qty = Math.floor(Number(l.quantity));
    if (!l.variantId || !(qty > 0)) continue;
    for (const p of products) {
      const v = p.variants.find(x => x.id === l.variantId);
      if (v) { out.push({ product: p, variant: v, quantity: Math.min(qty, 99) }); break; }
    }
  }
  return out;
}
const shape = ({ product: p, variant: v, quantity }) => ({
  variantId: v.id, productId: p.id, handle: p.handle, title: p.title, variantTitle: v.title,
  hasOnlyDefaultVariant: p.hasOnlyDefaultVariant, price: v.price, compareAtPrice: v.compareAtPrice,
  image: p.featuredImage, quantity, available: v.available, inventory: v.inventory,
});

api.post('/cart/validate', wrap(async (req, res) => {
  const lines = await priceLines(Array.isArray(req.body.lines) ? req.body.lines : []);
  res.json({ lines: lines.map(shape) });
}));

api.post('/discounts/check', rateLimit(30), wrap(async (req, res) => {
  const d = await store.getDiscount(clean(req.body.code, 40));
  const subtotal = Number(req.body.subtotal) || 0;
  const bad = !d || !d.active || (d.expiresAt && new Date(d.expiresAt) < new Date()) || subtotal < d.minSubtotal;
  if (bad) return res.status(400).json({ error: d && subtotal < d.minSubtotal ? `Spend Rs ${d.minSubtotal} to use this code.` : 'This code is not valid.' });
  res.json({ code: d.code, percent: d.percent });
}));

// ---------------------------------------------------------------- checkout (Cash on Delivery)
api.post('/orders', rateLimit(10), wrap(async (req, res) => {
  const b = req.body || {};
  const lines = await priceLines(Array.isArray(b.lines) ? b.lines : []);
  if (!lines.length) return res.status(400).json({ error: 'Your cart is empty.' });

  const a = b.address || {};
  const address = {
    firstName: clean(a.firstName, 60), lastName: clean(a.lastName, 60), address1: clean(a.address1, 200),
    city: clean(a.city, 80), country: clean(a.country || 'Pakistan', 60), zip: clean(a.zip, 20),
  };
  const email = clean(b.email, 120).toLowerCase();
  const phone = clean(b.phone, 30);
  if (!isEmail(email)) return res.status(400).json({ error: 'Please enter a valid email address.' });
  if (!address.firstName || !address.address1 || !address.city)
    return res.status(400).json({ error: 'Please fill in your first name, address and city.' });
  if (phone.replace(/\D/g, '').length < 10)
    return res.status(400).json({ error: 'Please enter a valid phone number with at least 10 digits.' });

  for (const l of lines) {
    if (!l.variant.available) return res.status(409).json({ error: `${l.product.title} is sold out.` });
    if (l.quantity > l.variant.inventory) return res.status(409).json({ error: `Only ${l.variant.inventory} of ${l.product.title} left.` });
  }

  const subtotal = lines.reduce((s, l) => s + l.variant.price * l.quantity, 0);
  let discount = 0, discountCode = null;
  if (b.code) {
    const d = await store.getDiscount(clean(b.code, 40));
    const ok = d && d.active && !(d.expiresAt && new Date(d.expiresAt) < new Date()) && subtotal >= d.minSubtotal;
    if (!ok) return res.status(400).json({ error: 'That discount code is not valid.' });
    discount = Math.round((subtotal * d.percent) / 100); discountCode = d.code;
  }
  const shipping = subtotal >= FREE_SHIPPING_OVER ? 0 : SHIPPING_FEE;
  const total = subtotal - discount + shipping;

  const order = await store.createOrder({
    userId: req.user?.id || null, email, phone, shippingAddress: address, subtotal, shipping, discount, discountCode,
    total, paymentMethod: 'cod', note: clean(b.note, 500),
    items: lines.map(l => ({ productId: l.product.id, variantId: l.variant.id, handle: l.product.handle, title: l.product.title,
      variantTitle: l.variant.title, price: l.variant.price, quantity: l.quantity, image: l.product.featuredImage })),
  });
  try {
    await sendNewOrderNotification(order);
  } catch (notificationError) {
    console.error(`[order-email] Failed to notify admin for order ${order.id}:`, notificationError);
  }
  res.status(201).json({ order });
}));

// guest "thank you" page: the order id is an unguessable UUID
api.get('/orders/:id', wrap(async (req, res) => {
  const o = await store.getOrder(req.params.id);
  if (!o) return res.status(404).json({ error: 'Order not found' });
  res.json({ order: o });
}));
api.get('/account/orders', needUser, wrap(async (req, res) => res.json({ orders: await store.listOrders(req.user.id) })));

// ---------------------------------------------------------------- addresses
api.get('/account/addresses', needUser, wrap(async (req, res) => res.json({ addresses: await store.listAddresses(req.user.id) })));
api.post('/account/addresses', needUser, wrap(async (req, res) => {
  const a = req.body || {};
  if (!clean(a.first_name) || !clean(a.address1) || !clean(a.city)) return res.status(400).json({ error: 'First name, address and city are required.' });
  const row = await store.addAddress(req.user.id, { first_name: clean(a.first_name, 60), last_name: clean(a.last_name, 60), address1: clean(a.address1),
    city: clean(a.city, 80), country: clean(a.country || 'Pakistan', 60), zip: clean(a.zip, 20), phone: clean(a.phone, 30) });
  res.status(201).json({ address: row });
}));
api.delete('/account/addresses/:id', needUser, wrap(async (req, res) => { await store.deleteAddress(req.user.id, req.params.id); res.json({ ok: true }); }));

// ---------------------------------------------------------------- forms
api.post('/newsletter', rateLimit(10), wrap(async (req, res) => {
  const email = clean(req.body.email, 120).toLowerCase();
  if (!isEmail(email)) return res.status(400).json({ error: 'Please enter a valid email address.' });
  await store.addSubscriber(email); res.json({ ok: true });
}));
api.post('/contact', rateLimit(5), wrap(async (req, res) => {
  const b = req.body || {};
  if (!isEmail(b.email) || !clean(b.body)) return res.status(400).json({ error: 'Please add your email and a message.' });
  await store.addMessage({ name: clean(b.name, 80), email: clean(b.email, 120), phone: clean(b.phone, 30), body: clean(b.body, 2000) });
  res.json({ ok: true });
}));
