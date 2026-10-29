import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard.jsx';
import { Pagination } from './Collection.jsx';
import { useApi, useTitle } from '../lib/hooks.js';

// templates/search.json  (sections/am-search.liquid)
export default function Search() {
  const [sp] = useSearchParams();
  const nav = useNavigate();
  const q = sp.get('q') || '', page = sp.get('page') || 1;
  const { data } = useApi(`/search?q=${encodeURIComponent(q)}&page=${page}`, [q, page]);
  useTitle(q ? `Search: ${q}` : 'Search');
  const performed = !!q;
  return (
    <section className="am-sec"><div className="am-wrap">
      <div className="am-head" data-reveal><div><p className="am-eb">Search</p>
        <h1 className="am-h">{performed ? `${data?.total ?? 0} results for “${q}”` : 'Search our store'}</h1></div></div>
      <form className="srch" key={q} onSubmit={e => { e.preventDefault(); nav('/search?q=' + encodeURIComponent(new FormData(e.currentTarget).get('q'))); }}>
        <input type="search" name="q" defaultValue={q} placeholder="Search perfumes…" />
        <button className="am-btn">Search</button>
      </form>
      {performed && data && (data.total > 0 ? (
        <>
          <div className="am-grid">{data.products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}</div>
          <Pagination page={data.page} pages={data.pages} hrefFor={n => `/search?q=${encodeURIComponent(q)}&page=${n}`} />
        </>
      ) : <p className="plp-empty">No results found. Try another word.</p>)}
    </div></section>
  );
}
