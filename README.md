# AMEZA-perfume — Améza Parfums Vercel-ready

React (Vite) frontend + Express API (Supabase), deployed together on Vercel.
The API runs as a serverless function (`api/index.js` → `backend/src/server.js`), the site is served from `frontend/dist`.

## Deploy
1. Push this folder to GitHub → Vercel → **Add New Project** (root directory = this folder, framework "Other").
2. Configure the environment variables (Project → Settings → Environment Variables).
   - Set frontend `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` for the admin panel.
   - Set backend `SUPABASE_URL` to the **same project URL** and `SUPABASE_SERVICE_ROLE_KEY` for the storefront API. The service-role key is secret: set it only in Vercel, never commit it.
   - If both backend Supabase settings are unset, the API uses local seed data; admin-created products then will not appear in the storefront. If only one is set, startup fails with a configuration error.
   - For admin new-order emails, configure `RESEND_API_KEY`, `ORDER_NOTIFICATION_EMAIL`, and `EMAIL_FROM`. Verify the sender domain in Resend before using it. If these are missing or the provider is unavailable, the order still completes and the backend logs the notification issue.
3. Deploy. Admin panel: `/admin`. Health check: `/health`.

## Store features
`frontend/src/components/MoodPicker.jsx` + `frontend/src/styles/mood-picker.css`, shown on the home page under the category tiles.
Each mood loads the matching real product (name, price, bottle image, Add to cart) and plays its own animation.
To change which perfume belongs to a mood, edit `handle` in the `MOODS` list.

## Run locally
Use Node.js 22.12 or newer. Install dependencies from the project root:
```sh
npm ci
npm ci --prefix backend
npm ci --prefix frontend
```

Keep local environment variables in separate files:
- `frontend/.env`: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and optionally `VITE_WHATSAPP_NUMBER`.
- `backend/.env`: `SUPABASE_URL` (the same project URL), `SUPABASE_SERVICE_ROLE_KEY`, and optional shipping/email settings.
These local `.env` files are excluded from Git; do not commit the backend service-role key.

Run the API and frontend in separate terminals:
```sh
npm run dev:api
npm run dev:web
```
If both backend Supabase settings are unset, the API uses local seed data. If you set one, set both; the API now reports a configuration error instead of silently falling back to seed data.

## Deploy to Vercel
Import the project with the repository root as the Vercel Root Directory. Vercel uses the root `package.json` build script, which installs the frontend from its lockfile and creates `frontend/dist`; the API is served by `api/index.js`.

Add the environment variables from `.env.example` in **Project → Settings → Environment Variables**. `VITE_` variables are embedded at build time, so redeploy after changing them. Set `SUPABASE_URL` and `VITE_SUPABASE_URL` to the same project URL. Keep `SUPABASE_SERVICE_ROLE_KEY` server-side only.

## Troubleshooting
- **`[unused_function] The pattern "api/index.js" ... doesn't match any Serverless Functions`** → the `api` folder did not reach GitHub. On GitHub the repo root must contain: `api/index.js`, `backend/`, `frontend/`, `package.json`, `vercel.json`. If `api/index.js` is missing: GitHub → Add file → Create new file → name it `api/index.js` and paste:
  ```js
  import app from '../backend/src/server.js';
  export default app;
  ```
- If the site opens but products are empty, `/health` returns 404 → same cause (missing `api/index.js`).
- Vercel Root Directory must be the folder that directly contains `package.json` and `vercel.json`.
- Easiest upload: GitHub Desktop / `git push`, or run `npx vercel --prod` inside this folder.
