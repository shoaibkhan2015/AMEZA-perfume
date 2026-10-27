const BASE = (import.meta.env.VITE_API_URL || '') + '/api';

export async function api(path, { method = 'GET', body, token } = {}) {
  const res = await fetch(BASE + path, {
    method,
    headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try { data = await res.json(); } catch { /* empty */ }
  if (!res.ok) { const e = new Error(data?.error || 'Something went wrong'); e.status = res.status; throw e; }
  return data;
}
