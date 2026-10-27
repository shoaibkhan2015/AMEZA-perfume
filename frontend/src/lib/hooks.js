import { useEffect, useState } from 'react';
import { api } from './api.js';
import { SHOP_NAME } from './format.js';

// Loads data from the API: { data, error, loading }
export function useApi(path, deps = [path]) {
  const [s, set] = useState({ data: null, error: null, loading: true });
  useEffect(() => {
    let live = true;
    set(p => ({ ...p, loading: true, error: null }));
    api(path).then(data => live && set({ data, error: null, loading: false }),
                   error => live && set({ data: null, error, loading: false }));
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return s;
}

// <title> + optional meta description (replaces Shopify's page_title / page_description)
export function useTitle(title, description) {
  useEffect(() => {
    document.title = title && title !== SHOP_NAME ? `${title} – ${SHOP_NAME}` : SHOP_NAME;
    let m = document.querySelector('meta[name="description"]');
    if (description) {
      if (!m) { m = document.createElement('meta'); m.name = 'description'; document.head.appendChild(m); }
      m.content = description;
    } else if (m) m.remove();
  }, [title, description]);
}
