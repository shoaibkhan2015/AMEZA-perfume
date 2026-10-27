import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api.js';
import { useAuth } from '../lib/auth.jsx';
import { useCart } from '../lib/cart.jsx';
import { bottleUrl, money } from '../lib/format.js';
import { useTitle } from '../lib/hooks.js';

// New page (Shopify hosted checkout before). Cash on delivery. Prices are re-calculated on the server.
export default function Checkout() {
  useTitle('Checkout');
  const c = useCart(), { user, token } = useAuth(), nav = useNavigate();
  const [cfg, setCfg] = useState({ freeShippingOver: 5000, shippingFee: 250 });
  const [code, setCode] = useState(''), [applied, setApplied] = useState(null), [codeErr, setCodeErr] = useState('');
  const [busy, setBusy] = useState(false), [err, setErr] = useState('');

  useEffect(() => { api('/config').then(setCfg).catch(() => {}); c.refresh(); }, []); // eslint-disable-line

  const subtotal = c.total;
  const discount = applied ? Math.round((subtotal * applied.percent) / 100) : 0;
  const shipping = subtotal >= cfg.freeShippingOver ? 0 : cfg.shippingFee;
  const total = subtotal - discount + shipping;

  const apply = async () => {
    setCodeErr('');
    try { setApplied(await api('/discounts/check', { method: 'POST', body: { code, subtotal } })); }
    catch (e) { setApplied(null); setCodeErr(e.message); }
  };
  const submit = async e => {
    e.preventDefault(); setBusy(true); setErr('');
    const f = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const { order } = await api('/orders', { method: 'POST', token, body: {
        email: f.email, phone: f.phone, note: c.note, code: applied?.code,
        address: { firstName: f.firstName, lastName: f.lastName, address1: f.address1, city: f.city, zip: f.zip, country: 'Pakistan' },
        lines: c.lines.map(l => ({ variantId: l.variantId, quantity: l.quantity })),
      } });
      c.clear(); nav(`/order/${order.id}`, { replace: true });
    } catch (er) { setErr(er.message); setBusy(false); }
  };

  if (!c.count) return (
    <section className="am-sec"><div className="am-wrap"><div className="cp__empty"><p>Your cart is empty.</p><Link className="am-btn" to="/collections/all">Start shopping</Link></div></div></section>
  );
  return (
    <section className="am-sec"><div className="am-wrap">
      <div className="am-head" data-reveal><div><p className="am-eb">Secure checkout</p><h1 className="am-h">Checkout</h1></div><Link className="am-link" to="/cart">Back to cart</Link></div>
      <div className="cp">
        <form className="co__form" id="co" onSubmit={submit}>
          {err && <p className="am-err">{err}</p>}
          <h3>Contact</h3>
          <label>Email<input type="email" name="email" required autoComplete="email" defaultValue={user?.email || ''} /></label>
          <label>Phone<input name="phone" required autoComplete="tel" placeholder="03XX XXXXXXX" /></label>
          <h3>Delivery address</h3>
          <div className="co__row2">
            <label>First name<input name="firstName" required autoComplete="given-name" defaultValue={user?.user_metadata?.first_name || ''} /></label>
            <label>Last name<input name="lastName" autoComplete="family-name" defaultValue={user?.user_metadata?.last_name || ''} /></label>
          </div>
          <label>Address<input name="address1" required autoComplete="street-address" /></label>
          <div className="co__row2">
            <label>City<input name="city" required autoComplete="address-level2" /></label>
            <label>Postal code (optional)<input name="zip" autoComplete="postal-code" /></label>
          </div>
          <h3>Payment</h3>
          <div className="co__pay"><span>💵</span><div><b>Cash on delivery</b><br />Pay in cash when your parcel arrives.</div></div>
        </form>
        <aside className="cp__sum">
          <h3>Order summary</h3>
          <div className="co__lines">
            {c.lines.map(l => (
              <div className="cp__row" key={l.variantId}>
                <span className="cp__img">{l.image ? <img src={l.image} alt="" /> : <i style={{ '--bot': `url('${bottleUrl(l.handle)}')` }} />}</span>
                <div><span className="cp__t">{l.title}</span>{!l.hasOnlyDefaultVariant && <p className="cp__v">{l.variantTitle}</p>}<p className="cp__v">Qty {l.quantity}</p></div>
                <div className="cp__tot">{money(l.price * l.quantity)}</div>
              </div>
            ))}
          </div>
          <div className="co__code"><input placeholder="Discount code" value={code} onChange={e => setCode(e.target.value)} /><button type="button" onClick={apply}>Apply</button></div>
          {codeErr && <p className="am-msg err" style={{ marginTop: -6 }}>{codeErr}</p>}
          <div className="cp__line"><span>Subtotal</span><b>{money(subtotal)}</b></div>
          {applied && <div className="cp__line disc"><span>Discount ({applied.code})</span><b>−{money(discount)}</b></div>}
          <div className="cp__line"><span>Shipping</span><b>{shipping ? money(shipping) : 'Free'}</b></div>
          <div className="cp__line"><span><b>Total</b></span><b>{money(total)}</b></div>
          <button className="am-btn" type="submit" form="co" disabled={busy}>{busy ? 'Placing order…' : 'Place order'}</button>
          <div className="cp__trust"><span>💵 Pay on delivery</span><span>🔄 7-day easy returns</span><span>✅ 100% authentic</span></div>
        </aside>
      </div>
    </div></section>
  );
}
