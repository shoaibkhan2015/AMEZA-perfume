// Browser-side settings. The old Vite names (VITE_*) still work, so existing .env files and
// Vercel environment variables don't need renaming.
const pub = name => process.env[`NEXT_PUBLIC_${name}`] || process.env[`VITE_${name}`] || '';

/** @type {import('next').NextConfig} */
export default {
  env: {
    NEXT_PUBLIC_SUPABASE_URL: pub('SUPABASE_URL'),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: pub('SUPABASE_ANON_KEY'),
    NEXT_PUBLIC_WHATSAPP_NUMBER: pub('WHATSAPP_NUMBER'),
  },
  // Local (no Supabase) mode reads data/seed.json at runtime, so ship it with the server functions.
  outputFileTracingIncludes: { '/**/*': ['./data/seed.json'] },
  allowedDevOrigins: ['come-barbed-imperfect.ngrok-free.dev'],
};
