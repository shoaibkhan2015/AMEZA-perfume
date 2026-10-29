import { useParams } from 'react-router-dom';
import { PdpMain, PdpReviews, PdpStory } from '../components/Pdp.jsx';
import { ProductRail, Video } from '../components/sections.jsx';
import NotFound from './NotFound.jsx';
import { useApi, useTitle } from '../lib/hooks.js';

// templates/product.json
export default function Product() {
  const { handle } = useParams();
  const { data, error, loading } = useApi(`/products/${handle}`);
  const p = data?.product;
  useTitle(p?.title, p?.descriptionHtml?.replace(/<[^>]+>/g, ' ').trim().slice(0, 160));
  if (error?.status === 404) return <NotFound />;
  if (loading || !p) return <section className="am-sec" style={{ minHeight: '70vh' }} />;
  return (
    <>
      <PdpMain key={p.id} product={p} />
      <PdpStory product={p} />
      <Video />
      <PdpReviews />
      <ProductRail eyebrow="Complete the collection" heading="You may also like" />
    </>
  );
}
