import { Link, useParams } from 'react-router-dom';
import NotFound from './NotFound.jsx';
import { useApi, useTitle } from '../lib/hooks.js';
import { fmtDate, money } from '../lib/format.js';
import { whatsappNumber } from '../data/siteContent.js';

const label = s => ({ pending: 'Pending', paid: 'Paid', refunded: 'Refunded', unfulfilled: 'Unfulfilled', shipped: 'Shipped', delivered: 'Delivered', cancelled: 'Cancelled' }[s] || s);

// Order page — used both as the "thank you" page and as the account order detail (templates/customers/order.liquid)
export default function Order({ thanks }) {
  const { id } = useParams();
  const { data, error } = useApi(`/orders/${id}`);
  const o = data?.order;
  useTitle(o ? `Order #${o.orderNumber}` : 'Order');
  if (error) return <NotFound />;
  if (!o) return <section className="am-sec" style={{ minHeight: '60vh' }} />;
  const a = o.shippingAddress || {};
  const confirmation = o.confirmationStatus || 'confirmed';
  const whatsappMessage = [
    `Hi Améza, I placed order #${o.orderNumber} and would like to confirm it.`,
    ...o.items.map(item => `${item.title} × ${item.quantity}`),
    `Total: ${money(o.total)}`,
  ].join('\n');
  const whatsappUrl = whatsappNumber.length >= 10 && whatsappNumber.length <= 15
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`
    : null;
  return (
    <section className="am-sec"><div className="am-wrap acct acct__w">
      {thanks && <p className="am-eb">Thank you</p>}
      <h1>{thanks ? confirmation === 'pending' ? 'Order received — awaiting confirmation' : confirmation === 'rejected' ? 'Order not confirmed' : 'Your order is confirmed' : `Order #${o.orderNumber}`}</h1>
      <p>{thanks && <>Order <b>#{o.orderNumber}</b> · </>}Placed on {fmtDate(o.createdAt)} · {label(o.paymentStatus)} · {confirmation === 'pending' ? 'Awaiting confirmation' : confirmation === 'rejected' ? 'Not confirmed' : label(o.fulfillmentStatus)}</p>
      {thanks && confirmation === 'pending' && <p>Your cash-on-delivery order is waiting for the store to confirm. You can message us on WhatsApp to request confirmation.</p>}
      {thanks && confirmation === 'confirmed' && <p>Your order is confirmed. Please keep <b>{money(o.total)}</b> ready in cash when it arrives.</p>}
      {thanks && confirmation === 'rejected' && <p>This order was not confirmed. Please contact us if you think this is a mistake.</p>}
      {thanks && confirmation === 'pending' && whatsappUrl && <p><a className="am-btn" href={whatsappUrl} target="_blank" rel="noreferrer">Message us on WhatsApp</a></p>}
      <table>
        <thead><tr><th>Product</th><th>Qty</th><th>Total</th></tr></thead>
        <tbody>
          {o.items.map((i, k) => <tr key={k}><td><Link to={`/products/${i.handle}`}>{i.title}{i.variantTitle && i.variantTitle !== 'Default Title' ? ` — ${i.variantTitle}` : ''}</Link></td><td>{i.quantity}</td><td>{money(i.price * i.quantity)}</td></tr>)}
          <tr><td colSpan="2">Subtotal</td><td>{money(o.subtotal)}</td></tr>
          {o.discount > 0 && <tr><td colSpan="2">Discount ({o.discountCode})</td><td>−{money(o.discount)}</td></tr>}
          <tr><td colSpan="2">Shipping</td><td>{o.shipping ? money(o.shipping) : 'Free'}</td></tr>
          <tr><td colSpan="2"><b>Total</b></td><td><b>{money(o.total)}</b></td></tr>
        </tbody>
      </table>
      <p style={{ marginTop: 20 }}><b>Shipping address</b><br />{a.firstName} {a.lastName}<br />{a.address1}<br />{a.city}{a.zip && ` ${a.zip}`}<br />{a.country}<br />{o.phone}</p>
      <p>{thanks ? <Link className="am-btn" to="/collections/all">Continue shopping</Link> : <Link to="/account">← Back to account</Link>}</p>
    </div></section>
  );
}
