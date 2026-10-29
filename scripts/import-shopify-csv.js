// Turns a Shopify "products_export.csv" into backend/data/seed.json products.
//   node scripts/import-shopify-csv.js path/to/products_export.csv
// Then run `npm run seed` to push them to Supabase (or just start the API in local mode).
// Collections: a product joins the "men" / "women" / "gift-sets" collection when it has that tag
// (Shopify's product export has no collection column). Everything is in "all" automatically.
import fs from 'node:fs';
import { parse } from 'csv-parse/sync';

const file = process.argv[2];
if (!file) { console.error('Usage: node scripts/import-shopify-csv.js products_export.csv'); process.exit(1); }

const rows = parse(fs.readFileSync(file, 'utf8'), { columns: true, skip_empty_lines: true, bom: true });
const seedPath = new URL('../data/seed.json', import.meta.url);
const seed = JSON.parse(fs.readFileSync(seedPath, 'utf8'));

const products = new Map();
for (const r of rows) {
  const handle = r['Handle']; if (!handle) continue;
  let p = products.get(handle);
  if (!p) {
    p = { handle, title: r['Title'] || handle, description_html: r['Body (HTML)'] || '', vendor: r['Vendor'] || 'Améza',
      product_type: r['Type'] || '', tags: (r['Tags'] || '').split(',').map(t => t.trim().toLowerCase()).filter(Boolean),
      images: [], published: String(r['Published']).toLowerCase() !== 'false', sort_order: products.size + 1, best_selling: 0, variants: [] };
    products.set(handle, p);
  }
  if (r['Image Src'] && !p.images.includes(r['Image Src'])) p.images.push(r['Image Src']);
  if (r['Variant Price'] !== undefined && r['Variant Price'] !== '') {
    p.variants.push({ title: r['Option1 Value'] || 'Default Title', option_name: r['Option1 Name'] || 'Title',
      price: Number(r['Variant Price']), compare_at_price: r['Variant Compare At Price'] ? Number(r['Variant Compare At Price']) : null,
      sku: r['Variant SKU'] || '', inventory_quantity: Number(r['Variant Inventory Qty'] || 0), position: p.variants.length + 1 });
  }
}
const list = [...products.values()].filter(p => p.variants.length);

const COLS = ['men', 'women', 'gift-sets'];
for (const c of seed.collections) if (COLS.includes(c.handle)) c.products = list.filter(p => p.tags.includes(c.handle)).map(p => p.handle);

seed.products = list;
fs.writeFileSync(seedPath, JSON.stringify(seed, null, 1));
console.log(`Imported ${list.length} products into data/seed.json. Next: npm run seed (Supabase) or restart the API.`);
