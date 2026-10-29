import { notFound } from 'next/navigation';

// Unknown URLs: show the store's 404 page (with header/footer) and a real 404 status
export default function Missing() {
  notFound();
}
