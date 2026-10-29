// All the text/settings that used to live in Shopify's theme editor
// (templates/*.json + the defaults in each section's {% schema %}).
// Edit here to change copy on the site.

export const FREE_DELIVERY_OVER = 5000; // Rs — the server uses FREE_SHIPPING_OVER in backend/.env

function normalizeWhatsappNumber(value) {
  const raw = String(value || '').trim();
  const digits = raw.replace(/\D/g, '');
  if (raw.startsWith('+')) return digits;
  if (digits.startsWith('00')) return digits.slice(2);
  if (digits.startsWith('0')) return `92${digits.slice(1)}`;
  if (digits.length === 10 && digits.startsWith('3')) return `92${digits}`;
  return digits;
}

export const whatsappNumber = normalizeWhatsappNumber(import.meta.env.VITE_WHATSAPP_NUMBER);

export const site = {
  brand: 'AMÉZA',
  tagline: 'Parfums',
  whatsapp: whatsappNumber,
  phone: '+92 300 0000000',
  email: 'hello@ameza.pk',
  address: 'Pakistan',
};

export const announcement = { text: '10.10 Sale', end: '', endText: 'Is Live Now!' };

// Shopify "main-menu" and "footer" menus
export const mainMenu = [
  { title: 'Home', url: '/' },
  { title: 'Shop', url: '/collections/all', children: [
    { title: 'For Him', url: '/collections/men' },
    { title: 'For Her', url: '/collections/women' },
    { title: 'Unisex', url: '/collections/unisex' },
  ] },
  { title: 'About', url: '/pages/about' },
  { title: 'Contact', url: '/pages/contact' },
];
export const footerMenu = [
  { title: 'Search', url: '/search' },
  { title: 'Shipping policy', url: '/pages/shipping-policy' },
  { title: 'Refund policy', url: '/pages/refund-policy' },
  { title: 'Privacy policy', url: '/pages/privacy-policy' },
  { title: 'Terms of service', url: '/pages/terms-of-service' },
];

export const footer = {
  about: 'Long-lasting eau de parfum, blended for our climate and made to be remembered. Crafted in small batches in Pakistan.',
  title1: 'Shop', title2: 'Help',
  nlText: 'Get 10% off your first order and early access to new drops.',
  social: [
    { platform: 'instagram', url: 'https://instagram.com/' },
    { platform: 'facebook', url: 'https://facebook.com/' },
    { platform: 'tiktok', url: 'https://tiktok.com/' },
    { platform: 'youtube', url: 'https://youtube.com/' },
    { platform: 'whatsapp', url: whatsappNumber ? `https://wa.me/${whatsappNumber}` : '' },
  ],
};

export const extras = {
  sticky: false, stickyText: 'Drift — Rs 2,490 only', stickyButton: 'Buy now', stickyLink: '/products/drift',
  proofList: 'Ali|Karachi|Drift;Sara|Lahore|Velvet Rose;Bilal|Islamabad|Ember Oud;Hira|Rawalpindi|Aqua Veil;Zain|Peshawar|Drift',
};

export const hero = {
  tag: 'AMÉZA · Eau de Parfum · For Men', heading: 'Drift', cta: 'Shop Drift', ctaLink: '/products/drift',
  len: 900, stageH: 84, topOff: 84,
  sideL: 'AMÉZA · EST. 2026 · FRAGRANCE HOUSE', sideR: 'CRAFTED IN PAKISTAN · EAU DE PARFUM',
  wordL: 'Fresh.\nAquatic.\nWoody.', wordR: 'Bold.\nCalm.\nTimeless.',
  brand: 'AMÉZA', brandSub: 'Parfums · Est. 2026',
  lead: 'Long-lasting eau de parfum, blended for our climate. Scroll to discover the ten notes inside every bottle.',
  cta2: 'View all fragrances', cta2Link: '#shop', rating: '4.9', ratingText: '· 2,300+ happy customers',
  bottleAspect: 0.549,
  ingredients: [
    { name: 'Grapefruit', key: 'grapefruit', color: '#b8472f', group: 'Top Notes', note: 'Bright, zesty grapefruit opens Drift with a juicy sparkle.' },
    { name: 'Lemon', key: 'lemon', color: '#a38a12', group: 'Top Notes', note: 'Sharp sun-ripened lemon adds a clean, energising lift.' },
    { name: 'Mint', key: 'mint', color: '#1f7a58', group: 'Top Notes', note: 'Cool fresh mint for an icy, invigorating first impression.' },
    { name: 'Marine Accord', key: 'marine', color: '#1d5f9a', group: 'Middle Notes', note: 'Salty sea breeze and ocean air at the heart of the scent.' },
    { name: 'Lavender', key: 'lavender', color: '#5b4a9e', group: 'Middle Notes', note: 'Calming aromatic lavender that smooths the heart notes.' },
    { name: 'Ginger', key: 'ginger', color: '#9a5a22', group: 'Middle Notes', note: 'Warm spicy ginger adds a subtle, lively kick.' },
    { name: 'Guaiac Wood', key: 'guaiac', color: '#6b4630', group: 'Base Notes', note: 'Smoky, creamy guaiac wood gives depth and character.' },
    { name: 'Cedarwood', key: 'cedar', color: '#3d5a34', group: 'Base Notes', note: 'Dry, elegant cedarwood anchors the fragrance.' },
    { name: 'Musk', key: 'musk', color: '#7c6a8e', group: 'Base Notes', note: 'Soft clean musk leaves a skin-like, lasting trail.' },
    { name: 'Amber', key: 'amber', color: '#b0701c', group: 'Base Notes', note: 'Golden amber seals everything with warm, lasting richness.' },
  ],
};

export const trust = [
  { icon: '🚚', text: 'Free delivery over Rs 5,000' }, { icon: '💵', text: 'Cash on delivery' },
  { icon: '🔄', text: '7-day easy returns' }, { icon: '✅', text: '100% authentic' },
  { icon: '⚡', text: 'Ships in 24 hours' }, { icon: '🎁', text: 'Free gift wrap' },
];

export const tiles = {
  eyebrow: 'Explore', heading: 'Find your signature',
  items: [
    { title: 'For Him', color: '#1d3f8a', link: '/collections/men' },
    { title: 'For Her', color: '#8e2a58', link: '/collections/women' },
    { title: 'Unisex', color: '#9a6a1c', link: '/collections/unisex' },
  ],
};

export const offer = {
  eyebrow: 'Limited time', heading: 'Buy 2, save 15% — today only',
  text: 'Apna jodi perfume chunein. Code checkout par lagayein aur 15% off payen. Free delivery Rs 5,000 se upar.',
  code: 'AMEZA15', end: '', button: 'Claim the offer', link: '/collections/all',
};

export const reviews = {
  score: '4.9', count: '2,300+',
  items: [
    { name: 'Ahmed R.', city: 'Lahore', text: 'Drift ki projection kamaal hai — office mein 3 logon ne poocha konsa perfume hai!' },
    { name: 'Sana K.', city: 'Karachi', text: 'Packaging bilkul luxury brand jaisi. Fragrance 9-10 ghante chali, 100% recommend.' },
    { name: 'Hamza S.', city: 'Islamabad', text: 'Delivery 2 din mein aa gayi aur bottle bilkul original. Gift ke liye perfect.' },
    { name: 'Maryam A.', city: 'Faisalabad', text: 'Velvet Rose ne to dil jeet liya. Price ke hisaab se best quality.' },
    { name: 'Usman T.', city: 'Multan', text: 'Pehli baar online perfume mangwaya, COD ki wajah se bharosa hua. Ab repeat customer hoon.' },
  ],
};

export const faq = [
  { q: 'Kya perfumes original aur long-lasting hain?', a: 'Ji haan. Har bottle 100% authentic hai aur Eau de Parfum concentration ki wajah se 8-10 ghante tak chalti hai.' },
  { q: 'Delivery mein kitna time lagta hai?', a: 'Major cities mein 2-3 din, baaqi Pakistan mein 3-5 din. Rs 5,000 se upar order par delivery free hai.' },
  { q: 'Cash on delivery available hai?', a: 'Bilkul. Aap parcel dekh kar payment kar sakte hain.' },
  { q: 'Agar pasand na aaye to?', a: '7 din ke andar easy return/exchange. Bas humein WhatsApp karein.' },
];

export const newsletter = {
  eyebrow: 'Members only', heading: 'Get 10% off your first order',
  text: 'Join the Améza circle for early access to drops and private offers.',
};

export const video = {
  eyebrow: 'AMÉZA · Brand film', heading: 'Experience Drift', caption: 'Drift by Améza',
  videoUrl: '', // optional YouTube/Vimeo URL — leave empty to use the built-in Drift reel
  lt: 'Crafted with care', ltx: 'Small batches, deep sapphire glass and gold detailing — every bottle is finished by hand.',
  rt: 'Made to be remembered', rtx: 'Eight to ten hours of calm, confident freshness from the first spray to the last.',
};

export const about = {
  eyebrow: 'About us', heading: 'The house of Améza',
  text: "Améza began with a simple idea: premium fragrance that suits our climate, our culture and our budget.\nEvery blend is created in small batches, tested on real skin through real summers, and bottled in deep sapphire glass with gold detailing.\nNo shortcuts, no dilution — just scent worth remembering.",
  stats: [['2026', 'Founded'], ['8–10h', 'Longevity'], ['100%', 'Authentic']],
  cta: 'Shop the collection',
};
export const values = {
  eyebrow: 'Our promise', heading: 'What we stand for',
  items: [
    { icon: '🧪', title: 'Small-batch crafted', text: 'Every batch is blended, rested and quality-checked by hand before it is bottled.' },
    { icon: '🌿', title: 'Honest ingredients', text: 'Quality oils and aroma materials. No fillers, no shortcuts.' },
    { icon: '☀️', title: 'Made for our climate', text: 'Tested through hot summers so your fragrance lasts when it matters.' },
    { icon: '✅', title: '100% authentic', text: 'Direct from our house to you, with easy 7-day returns.' },
  ],
};

export const contact = {
  heading: "We'd love to hear from you", whatsapp: whatsappNumber, whatsappLabel: 'Chat with us',
  email: 'hello@ameza.pk', phone: '+923000000000', hours: 'Mon–Sat, 10am – 8pm',
};

// ---- product page ----------------------------------------------------------
export const pdp = {
  score: '4.9', count: '126', longevity: 90, projection: 80, freshness: 88,
  howto: 'Spray 2-3 times on pulse points — neck, wrists and behind the ears — from 15 cm away. Do not rub. For longer wear, apply on moisturised skin.',
  shipping: 'Free delivery on orders above Rs 5,000. Standard delivery 2-4 working days. Cash on delivery available. Easy 7-day return or exchange on unopened items.',
  // notes shown for products without their own profile below (e.g. Drift)
  notes: [
    { name: 'Grapefruit', key: 'grapefruit', group: 'Top Notes', pct: 85 },
    { name: 'Lemon', key: 'lemon', group: 'Top Notes', pct: 70 },
    { name: 'Marine Accord', key: 'marine', group: 'Middle Notes', pct: 90 },
    { name: 'Lavender', key: 'lavender', group: 'Middle Notes', pct: 65 },
    { name: 'Cedarwood', key: 'cedar', group: 'Base Notes', pct: 70 },
    { name: 'Amber', key: 'amber', group: 'Base Notes', pct: 75 },
  ],
};

// Per-fragrance profile (from sections/am-pdp-main.liquid + am-pdp-story.liquid), keyed by handle fragment
const n = (g, name, key, pct) => ({ group: g, name, key, pct });
export const profiles = {
  obsidian: { perf: [92, 85, 70], notes: [n('Top Notes', 'Ginger', 'ginger', 80), n('Top Notes', 'Lemon', 'lemon', 60), n('Middle Notes', 'Lavender', 'lavender', 70), n('Middle Notes', 'Guaiac Wood', 'guaiac', 85), n('Base Notes', 'Oud', 'oud', 90), n('Base Notes', 'Amber', 'amber', 75), n('Base Notes', 'Musk', 'musk', 60)],
    story: { h: 'Dark, warm, unhurried.', t: 'Obsidian was made for the hours after sunset — spiced ginger opening onto smoky guaiac wood and a deep, resinous oud.||A masculine fragrance with weight and quiet authority, it settles into skin and stays for the whole evening.||Blended in small batches and finished in deep glass with gold detailing.', q: 'Confidence needs no volume.' } },
  'velvet-rose': { perf: [85, 70, 55], notes: [n('Top Notes', 'Pink Grapefruit', 'grapefruit', 65), n('Middle Notes', 'Damask Rose', 'rose', 95), n('Middle Notes', 'Jasmine', 'jasmine', 75), n('Base Notes', 'Vanilla', 'vanilla', 80), n('Base Notes', 'White Musk', 'musk', 70), n('Base Notes', 'Amber', 'amber', 55)],
    story: { h: 'A rose, softened with vanilla.', t: 'Velvet Rose opens with a flash of pink grapefruit before the damask rose and jasmine bloom at its heart.||Vanilla, white musk and amber give it a warm, powdery dry-down that feels like silk against the skin.||A romantic, modern floral made for those who like to be remembered.', q: 'Soft on purpose. Unforgettable by design.' } },
  moonpetal: { perf: [78, 65, 75], notes: [n('Top Notes', 'Lemon', 'lemon', 60), n('Top Notes', 'Mint', 'mint', 45), n('Middle Notes', 'Jasmine', 'jasmine', 95), n('Middle Notes', 'Lavender', 'lavender', 60), n('Base Notes', 'White Musk', 'musk', 85), n('Base Notes', 'Vanilla', 'vanilla', 60)],
    story: { h: 'White flowers by moonlight.', t: 'Moonpetal is a luminous jasmine, brightened with lemon and cool mint and calmed by lavender.||White musk and a thread of vanilla keep it clean, airy and close to the skin.||An easy, elegant everyday fragrance for day into evening.', q: 'Light that lingers.' } },
  'amber-dusk': { perf: [95, 90, 35], notes: [n('Top Notes', 'Ginger', 'ginger', 75), n('Middle Notes', 'Rose', 'rose', 55), n('Middle Notes', 'Guaiac Wood', 'guaiac', 70), n('Base Notes', 'Amber', 'amber', 95), n('Base Notes', 'Oud', 'oud', 75), n('Base Notes', 'Vanilla', 'vanilla', 70)],
    story: { h: 'The last warm hour of the day.', t: 'Amber Dusk wraps golden amber and oud in vanilla, with a spark of ginger and a whisper of rose.||Rich, glowing and balanced, it is made to be worn by anyone who loves a fragrance with depth.||Blended in small batches for long, slow wear.', q: 'Made for everyone who likes it warm.' } },
  'citrus-mist': { perf: [72, 65, 96], notes: [n('Top Notes', 'Grapefruit', 'grapefruit', 90), n('Top Notes', 'Lemon', 'lemon', 85), n('Top Notes', 'Mint', 'mint', 70), n('Middle Notes', 'Marine Accord', 'marine', 75), n('Middle Notes', 'Jasmine', 'jasmine', 50), n('Base Notes', 'Cedarwood', 'cedar', 60), n('Base Notes', 'White Musk', 'musk', 65)],
    story: { h: 'Cold citrus, clear skies.', t: 'Citrus Mist is built around sparkling grapefruit and lemon, cooled with mint and a clean marine accord.||Cedarwood and white musk hold the freshness on skin through the day.||A bright, effortless fragrance for any season and any wearer.', q: 'Fresh air, bottled.' } },
};
export const profileFor = handle => {
  const k = Object.keys(profiles).find(k => String(handle).includes(k));
  return k ? profiles[k] : null;
};

export const pdpStory = {
  eyebrow: 'Our story', heading: 'Born from the sea breeze.',
  text: "Drift was imagined on a late-night drive along the Karachi coast — salt in the air, citrus on the breeze, the city lights fading behind.||We wanted a fragrance that moves with you: fresh at first, calm at heart, and quietly confident long after you've left the room.||Every bottle is blended in small batches and finished in deep sapphire glass with gold detailing.",
  quote: "A fragrance should feel like a memory you haven't made yet.",
  stats: [['8–10h', 'Longevity'], ['50 ml', 'Eau de Parfum'], ['Small', 'Batch crafted']],
};

export const pdpReviews = {
  score: '4.9', count: '126', p5: 86, p4: 10, p3: 3, p2: 1, p1: 0,
  items: [
    { name: 'Ahmed R.', city: 'Lahore', title: 'Unreal projection', date: '12 Oct 2026', text: 'Drift ki projection kamaal hai — office mein 3 logon ne poocha konsa perfume hai!' },
    { name: 'Sana K.', city: 'Karachi', title: 'Luxury packaging', date: '5 Oct 2026', text: 'Packaging bilkul luxury brand jaisi. Fragrance 9-10 ghante chali, 100% recommend.' },
    { name: 'Hamza S.', city: 'Islamabad', title: 'Worth every rupee', date: '29 Sep 2026', text: 'Delivery 2 din mein aa gayi aur bottle bilkul original. Gift ke liye perfect.' },
    { name: 'Maryam A.', city: 'Faisalabad', title: 'Compliment magnet', date: '21 Sep 2026', text: 'Velvet Rose ne to dil jeet liya. Price ke hisaab se best quality.' },
    { name: 'Usman T.', city: 'Multan', title: 'Fresh all day', date: '14 Sep 2026', text: 'Pehli baar online perfume mangwaya, COD ki wajah se bharosa hua. Ab repeat customer hoon.' },
  ],
};
