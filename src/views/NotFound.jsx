import { Link } from 'react-router-dom';
import { ProductRail } from '../components/sections.jsx';
import { useTitle } from '../lib/hooks.js';

// templates/404.json
export default function NotFound() {
  useTitle('404 Not Found');
  return (
    <>
      <section className="am-sec"><div className="am-wrap e404">
        <b>404</b><h1 className="am-h">This page drifted away</h1>
        <p style={{ opacity: 0.7, margin: '14px 0 26px' }}>The page you are looking for doesn't exist or has moved.</p>
        <Link className="am-btn" to="/collections/all">Continue shopping</Link>
      </div></section>
      <ProductRail eyebrow="Discover more" heading="You may also like" />
    </>
  );
}
