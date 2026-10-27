import { Link, useParams } from 'react-router-dom';
import NotFound from './NotFound.jsx';
import { useApi, useTitle } from '../lib/hooks.js';
import { fmtDate } from '../lib/format.js';

const strip = h => String(h || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const cut = (s, n) => (s.length > n ? s.slice(0, n - 3).trimEnd() + '...' : s);

// templates/blog.json
export function Blog() {
  const { blog: handle } = useParams();
  const { data, error } = useApi(`/blogs/${handle}`);
  useTitle(data?.blog.title);
  if (error?.status === 404) return <NotFound />;
  if (!data) return <section className="am-sec" style={{ minHeight: '60vh' }} />;
  const b = data.blog;
  return (
    <section className="am-sec"><div className="am-wrap">
      <div className="am-head" data-reveal><div><p className="am-eb">Journal</p><h1 className="am-h">{b.title}</h1></div></div>
      <div className="am-grid" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))' }}>
        {b.articles.map(a => (
          <Link key={a.handle} className="bl" to={`/blogs/${b.handle}/${a.handle}`} data-reveal>
            {a.image && <img src={a.image} alt={a.title} loading="lazy" />}
            <div><small>{fmtDate(a.publishedAt)}</small><h3>{a.title}</h3><p>{cut(strip(a.excerpt || a.contentHtml), 120)}</p></div>
          </Link>
        ))}
      </div>
    </div></section>
  );
}

// templates/article.json
export function Article() {
  const { blog: bh, article: ah } = useParams();
  const { data, error } = useApi(`/blogs/${bh}`, [bh]);
  const b = data?.blog, a = b?.articles.find(x => x.handle === ah);
  useTitle(a?.title);
  if (error?.status === 404 || (b && !a)) return <NotFound />;
  if (!a) return <section className="am-sec" style={{ minHeight: '60vh' }} />;
  return (
    <article className="am-sec"><div className="am-wrap art">
      <p className="am-eb">{fmtDate(a.publishedAt)}{a.author && ` · ${a.author}`}</p>
      <h1 className="am-h">{a.title}</h1>
      {a.image && <img src={a.image} alt={a.title} />}
      <div className="art__c" dangerouslySetInnerHTML={{ __html: a.contentHtml }} />
      <p style={{ marginTop: 30 }}><Link className="am-link" to={`/blogs/${b.handle}`}>← Back to {b.title}</Link></p>
    </div></article>
  );
}
