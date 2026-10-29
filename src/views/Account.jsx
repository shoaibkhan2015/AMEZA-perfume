import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { api } from '../lib/api.js';
import { useAuth } from '../lib/auth.jsx';
import { fmtDate, money } from '../lib/format.js';
import { useTitle } from '../lib/hooks.js';

const Wrap = ({ title, children, wide }) => (
  <section className="am-sec"><div className={'am-wrap acct' + (wide ? ' acct__w' : '')}><h1>{title}</h1>{children}</div></section>
);
const NoAuth = ({ title }) => (
  <Wrap title={title}><p>Customer accounts will be available once Supabase is connected (see README → "Customer accounts").</p>
    <Link className="am-btn" to="/collections/all">Continue shopping</Link></Wrap>
);
const Err = ({ e }) => (e ? <p className="am-err">{e}</p> : null);
const label = s => ({ pending: 'Pending', paid: 'Paid', refunded: 'Refunded', unfulfilled: 'Unfulfilled', shipped: 'Shipped', delivered: 'Delivered', cancelled: 'Cancelled' }[s] || s);

// templates/customers/login.liquid
export function Login() {
  useTitle('Account');
  const a = useAuth(), nav = useNavigate();
  const [err, setErr] = useState(''), [rec, setRec] = useState(false), [sent, setSent] = useState(false);
  if (!a.enabled) return <NoAuth title="Login" />;
  if (a.user) return <Navigate to="/account/orders" replace />;
  const login = async e => {
    e.preventDefault(); setErr(''); const f = new FormData(e.currentTarget);
    try { await a.signIn(f.get('email'), f.get('password')); nav('/account/orders'); } catch (x) { setErr(x.message); }
  };
  const reset = async e => {
    e.preventDefault(); setErr('');
    try { await a.sendReset(new FormData(e.currentTarget).get('email')); setSent(true); } catch (x) { setErr(x.message); }
  };
  return (
    <Wrap title="Login">
      <form onSubmit={login}>
        <Err e={err} />
        <label>Email<input type="email" name="email" autoComplete="email" required /></label>
        <label>Password<input type="password" name="password" autoComplete="current-password" required /></label>
        <a href="#recover" onClick={e => { e.preventDefault(); setRec(r => !r); }}>Forgot your password?</a>
        <button className="am-btn" type="submit">Sign in</button>
      </form>
      <p style={{ marginTop: 18 }}>New here? <Link to="/account/register"><b>Create account</b></Link></p>
      <div id="recover" hidden={!rec}>
        <form onSubmit={reset}>
          {sent && <p>We've sent you an email with a link to reset your password.</p>}
          <label>Email<input type="email" name="email" required /></label>
          <button className="am-btn" type="submit">Reset password</button>
        </form>
      </div>
    </Wrap>
  );
}

// templates/customers/register.liquid
export function Register() {
  useTitle('Create Account');
  const a = useAuth(), nav = useNavigate();
  const [err, setErr] = useState(''), [done, setDone] = useState(false);
  if (!a.enabled) return <NoAuth title="Create account" />;
  if (a.user) return <Navigate to="/account/orders" replace />;
  const submit = async e => {
    e.preventDefault(); setErr(''); const f = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const d = await a.signUp({ email: f.email, password: f.password, firstName: f.firstName, lastName: f.lastName });
      d.session ? nav('/account/orders') : setDone(true);   // no session = Supabase wants the email confirmed first
    } catch (x) { setErr(x.message); }
  };
  return (
    <Wrap title="Create account">
      {done ? <p>Almost done — we've emailed you a link to confirm your address. Click it, then <Link to="/account/login"><b>log in</b></Link>.</p> : (
        <form onSubmit={submit}>
          <Err e={err} />
          <label>First name<input name="firstName" autoComplete="given-name" /></label>
          <label>Last name<input name="lastName" autoComplete="family-name" /></label>
          <label>Email<input type="email" name="email" autoComplete="email" required /></label>
          <label>Password<input type="password" name="password" autoComplete="new-password" minLength="6" required /></label>
          <button className="am-btn" type="submit">Create</button>
        </form>
      )}
      <p style={{ marginTop: 18 }}>Already registered? <Link to="/account/login"><b>Login</b></Link></p>
    </Wrap>
  );
}

// templates/customers/reset_password.liquid
export function ResetPassword() {
  useTitle('Reset Password');
  const a = useAuth(), nav = useNavigate();
  const [err, setErr] = useState('');
  if (!a.enabled) return <NoAuth title="Reset password" />;
  const submit = async e => {
    e.preventDefault(); setErr(''); const f = new FormData(e.currentTarget);
    if (f.get('password') !== f.get('confirm')) return setErr('Passwords do not match.');
    try { await a.setPassword(f.get('password')); nav('/account/orders'); } catch (x) { setErr(x.message); }
  };
  return (
    <Wrap title="Reset password">
      <form onSubmit={submit}>
        <Err e={err} />
        <label>New password<input type="password" name="password" minLength="6" required /></label>
        <label>Confirm password<input type="password" name="confirm" required /></label>
        <button className="am-btn" type="submit">Reset</button>
      </form>
    </Wrap>
  );
}

// templates/customers/account.liquid (orders list)
export function Account() {
  useTitle('Account');
  const a = useAuth();
  const [orders, setOrders] = useState(null);
  useEffect(() => { if (a.token) api('/account/orders', { token: a.token }).then(d => setOrders(d.orders)).catch(() => setOrders([])); }, [a.token]);
  if (!a.enabled) return <NoAuth title="My account" />;
  if (!a.ready) return <section className="am-sec" style={{ minHeight: '60vh' }} />;
  if (!a.user) return <Navigate to="/account/login" replace />;
  const name = a.user.user_metadata?.first_name || a.user.email;
  return (
    <Wrap title="My account" wide>
      <p>Hello {name} · <button className="am-link-btn" onClick={a.signOut}><b>Log out</b></button> · <Link to="/account/addresses"><b>Addresses</b></Link></p>
      {orders?.length ? (
        <table>
          <thead><tr><th>Order</th><th>Date</th><th>Payment</th><th>Fulfillment</th><th>Total</th></tr></thead>
          <tbody>{orders.map(o => (
            <tr key={o.id}><td><Link to={`/account/orders/${o.id}`}><b>#{o.orderNumber}</b></Link></td><td>{fmtDate(o.createdAt)}</td><td>{label(o.paymentStatus)}</td><td>{label(o.fulfillmentStatus)}</td><td>{money(o.total)}</td></tr>
          ))}</tbody>
        </table>
      ) : orders && <><p>You haven't placed any orders yet.</p><Link className="am-btn" to="/collections/all">Start shopping</Link></>}
    </Wrap>
  );
}

// templates/customers/addresses.liquid
export function Addresses() {
  useTitle('Addresses');
  const a = useAuth();
  const [list, setList] = useState(null), [err, setErr] = useState('');
  const load = () => api('/account/addresses', { token: a.token }).then(d => setList(d.addresses)).catch(e => setErr(e.message));
  useEffect(() => { if (a.token) load(); }, [a.token]); // eslint-disable-line
  if (!a.enabled) return <NoAuth title="Addresses" />;
  if (!a.ready) return <section className="am-sec" style={{ minHeight: '60vh' }} />;
  if (!a.user) return <Navigate to="/account/login" replace />;
  const add = async e => {
    e.preventDefault(); setErr(''); const f = Object.fromEntries(new FormData(e.currentTarget));
    try { await api('/account/addresses', { method: 'POST', token: a.token, body: { first_name: f.first_name, last_name: f.last_name, address1: f.address1, city: f.city, country: f.country, zip: f.zip, phone: f.phone } }); e.target.reset(); load(); }
    catch (x) { setErr(x.message); }
  };
  const del = async id => { await api(`/account/addresses/${id}`, { method: 'DELETE', token: a.token }); load(); };
  return (
    <Wrap title="Addresses" wide>
      <p><Link to="/account">← Back to account</Link></p>
      {(list || []).map(x => (
        <div key={x.id} style={{ background: '#fff', border: '1px solid rgba(184,134,43,.25)', borderRadius: 16, padding: 16, marginBottom: 12 }}>
          {x.first_name} {x.last_name}<br />{x.address1}<br />{x.city} {x.zip}<br />{x.country}{x.phone && <><br />{x.phone}</>}
          <div style={{ paddingTop: 8 }}><button className="plp-chip" type="button" onClick={() => del(x.id)}>Delete</button></div>
        </div>
      ))}
      <h3>Add a new address</h3>
      <form onSubmit={add}>
        <Err e={err} />
        <label>First name<input name="first_name" required /></label>
        <label>Last name<input name="last_name" /></label>
        <label>Address<input name="address1" required /></label>
        <label>City<input name="city" required /></label>
        <label>Country<input name="country" defaultValue="Pakistan" /></label>
        <label>Postal code<input name="zip" /></label>
        <label>Phone<input name="phone" /></label>
        <button className="am-btn" type="submit">Add address</button>
      </form>
    </Wrap>
  );
}
