import PerfumeScroll from '../components/PerfumeScroll.jsx';
import MoodPicker from '../components/MoodPicker.jsx';
import { Faq, Newsletter, Offer, ProductRail, Reviews, Tiles, Trust, Video } from '../components/sections.jsx';
import { useTitle } from '../lib/hooks.js';
import { SHOP_NAME } from '../lib/format.js';

// templates/index.json
export default function Home() {
  useTitle(SHOP_NAME);
  return (
    <>
      <PerfumeScroll />
      <Trust />
      <Tiles />
      <MoodPicker />
      <ProductRail eyebrow="Bestsellers" heading="The Signature Range" layout="standard" />
      <Offer />
      <Video />
      <ProductRail eyebrow="Just dropped" heading="New Arrivals" layout="tall" />
      <Reviews />
      <Faq />
      <Newsletter />
    </>
  );
}
