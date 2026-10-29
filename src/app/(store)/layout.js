import Layout from '@/components/Layout.jsx';

// Header, footer and site effects for every storefront page (everything except /admin)
export default function StoreLayout({ children }) {
  return <Layout>{children}</Layout>;
}
