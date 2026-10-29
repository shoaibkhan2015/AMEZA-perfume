import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Announcement } from './Header.jsx';
import Header from './Header.jsx';
import Footer from './Footer.jsx';
import Extras from './Extras.jsx';
import { initEffects } from '../lib/effects.js';

// Body class used to be "am-body template-<name>" in layout/theme.liquid
const templateName = p => {
  if (p === '/') return 'index';
  const [a, b] = p.split('/').filter(Boolean);
  return { products: 'product', collections: b ? 'collection' : 'list-collections', pages: 'page', blogs: 'blog', cart: 'cart', search: 'search', account: 'customers-account' }[a] || a;
};

export default function Layout() {
  const { pathname } = useLocation();
  useEffect(() => initEffects(), []);
  useEffect(() => { document.body.className = 'am-body template-' + templateName(pathname); }, [pathname]);
  // new page → start at the top (but let #anchor links work)
  useEffect(() => { if (!window.location.hash) window.scrollTo(0, 0); }, [pathname]);
  return (
    <>
      <a href="#MainContent" style={{ position: 'absolute', left: -9999 }}>Skip to content</a>
      <Announcement />
      <Header />
      <main id="MainContent" role="main"><Outlet /></main>
      <Footer />
      <Extras />
    </>
  );
}
