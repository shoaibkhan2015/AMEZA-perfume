// Loads backend/data/seed.json into Supabase. Safe to run again (updates by handle).
import fs from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) { console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in backend/.env first.'); process.exit(1); }
const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const seed = JSON.parse(fs.readFileSync(new URL('../data/seed.json', import.meta.url), 'utf8'));
const ok = ({ data, error }) => { if (error) { console.error(error.message); process.exit(1); } return data; };

const idByHandle = {};
for (const p of seed.products) {
  const { variants, ...row } = p;
  const saved = ok(await sb.from('products').upsert(row, { onConflict: 'handle' }).select().single());
  idByHandle[p.handle] = saved.id;
  ok(await sb.from('product_variants').delete().eq('product_id', saved.id));
  ok(await sb.from('product_variants').insert(variants.map(v => ({ ...v, product_id: saved.id }))));
}
for (const c of seed.collections) {
  const { products = [], auto, ...row } = c;
  const saved = ok(await sb.from('collections').upsert(row, { onConflict: 'handle' }).select().single());
  ok(await sb.from('collection_products').delete().eq('collection_id', saved.id));
  const handles = auto === 'all' ? [] : products; // the "all" collection is automatic
  if (handles.length) ok(await sb.from('collection_products').insert(handles.map((h, i) => ({ collection_id: saved.id, product_id: idByHandle[h], position: i }))));
}
if (seed.pages?.length) ok(await sb.from('pages').upsert(seed.pages, { onConflict: 'handle' }));
for (const b of seed.blogs || []) ok(await sb.from('blogs').upsert({ handle: b.handle, title: b.title }, { onConflict: 'handle' }));
if (seed.discount_codes?.length) ok(await sb.from('discount_codes').upsert(seed.discount_codes, { onConflict: 'code' }));
console.log('Seed complete.');
