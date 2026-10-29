import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { supabase } from '../lib/supabase.js';
import { useAuth } from '../lib/auth.jsx';
import { fmtDate, money } from '../lib/format.js';
import '../styles/admin.css';

const BUCKET = 'ameza-product-images';
const ORDER_STATUSES = ['unfulfilled', 'shipped', 'delivered', 'cancelled'];
const LOW_STOCK_LIMIT = 5;
const emptyForm = () => ({ title: '', price: '', description: '', category: '', stock: '0', images: [], published: true, variantId: '', collectionIds: [] });
const errorMessage = error => error?.message || 'Something went wrong. Please try again.';
const collectionLabel = collection => ({
  men: 'For Him',
  women: 'For Her',
  'gift-sets': 'Unisex',
}[collection.handle] || collection.title);

function productHandle(title) {
  return title.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `perfume-${Date.now()}`;
}

export default function Admin() {
  const { enabled, ready, user, signIn, signOut } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [collections, setCollections] = useState([]);
  const [collectionLinks, setCollectionLinks] = useState([]);
  const [section, setSection] = useState('products');
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [storeWarning, setStoreWarning] = useState('');

  const pendingOrders = orders.filter(order => order.confirmation_status === 'pending');
  const lowStockProducts = products.filter(product =>
    (product.product_variants || []).some(variant => variant.inventory_quantity <= LOW_STOCK_LIMIT));
  const outOfStockVariants = products.flatMap(product => product.product_variants || [])
    .filter(variant => variant.inventory_quantity <= 0).length;
  const salesSince = new Date();
  salesSince.setDate(salesSince.getDate() - 29);
  const periodOrders = orders.filter(order => new Date(order.created_at) >= salesSince);
  const confirmedPeriodOrders = periodOrders.filter(order =>
    order.confirmation_status === 'confirmed' && order.fulfillment_status !== 'cancelled');
  const periodSales = confirmedPeriodOrders.reduce((sum, order) => sum + Number(order.total || 0), 0);
  const cancelledPeriodOrders = periodOrders.filter(order =>
    order.confirmation_status === 'rejected' || order.fulfillment_status === 'cancelled');
  const fulfilledPeriodOrders = periodOrders.filter(order =>
    order.fulfillment_status === 'shipped' || order.fulfillment_status === 'delivered');
  const salesByDay = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (6 - index));
    const sales = confirmedPeriodOrders
      .filter(order => new Date(order.created_at).toDateString() === date.toDateString())
      .reduce((sum, order) => sum + Number(order.total || 0), 0);
    return { label: date.toLocaleDateString('en', { weekday: 'short' }), sales };
  });
  const maxDailySales = Math.max(...salesByDay.map(day => day.sales), 1);
  const topProducts = orders
    .filter(order => order.confirmation_status === 'confirmed' && order.fulfillment_status !== 'cancelled')
    .flatMap(order => order.order_items || [])
    .reduce((totals, item) => totals.set(item.title, (totals.get(item.title) || 0) + item.quantity), new Map());
  const bestSellers = [...topProducts].sort((a, b) => b[1] - a[1]).slice(0, 3);

  useEffect(() => {
    let active = true;
    async function loadDashboard() {
      if (!ready) return;
      if (!enabled || !user) {
        setAuthorized(false);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError('');
      try {
        const { data: isAdmin, error: accessError } = await supabase.rpc('is_admin');
        if (accessError) throw accessError;
        if (!active) return;
        setAuthorized(Boolean(isAdmin));
        if (!isAdmin) {
          setLoading(false);
          return;
        }
        try {
          const status = await api('/status');
          setStoreWarning(status.store === 'Supabase'
            ? ''
            : 'The storefront API is using local seed data, not Supabase. Products added here will not appear in the store until the backend is configured with the same SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY as the frontend Supabase project.');
        } catch (statusError) {
          setStoreWarning(`Could not verify the storefront catalogue source: ${errorMessage(statusError)}`);
        }
        const [productResult, orderResult, collectionResult, collectionLinkResult] = await Promise.all([
          supabase.from('products').select('*, product_variants(*)').order('created_at', { ascending: false }),
          supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false }).limit(100),
          supabase.from('collections').select('id, handle, title, sort_order').order('sort_order'),
          supabase.from('collection_products').select('collection_id, product_id'),
        ]);
        if (productResult.error) throw productResult.error;
        if (orderResult.error) throw orderResult.error;
        if (collectionResult.error) throw collectionResult.error;
        if (collectionLinkResult.error) throw collectionLinkResult.error;
        if (!active) return;
        setProducts(productResult.data || []);
        setOrders(orderResult.data || []);
        setCollections((collectionResult.data || []).filter(collection => collection.handle !== 'all'));
        setCollectionLinks(collectionLinkResult.data || []);
      } catch (loadError) {
        if (active) setError(errorMessage(loadError));
      } finally {
        if (active) setLoading(false);
      }
    }
    loadDashboard();
    return () => { active = false; };
  }, [ready, enabled, user]);

  function startNewProduct() {
    setSelected(null);
    setForm(emptyForm());
    setFiles([]);
    setError('');
    setNotice('');
  }

  function editProduct(product) {
    const variant = [...(product.product_variants || [])].sort((a, b) => a.position - b.position)[0];
    setSelected(product);
    setForm({
      title: product.title,
      price: variant ? String(variant.price) : '',
      description: product.description_html || '',
      category: product.product_type || '',
      stock: variant ? String(variant.inventory_quantity) : '0',
      images: product.images || [],
      published: product.published,
      variantId: variant?.id || '',
      collectionIds: collectionLinks.filter(link => link.product_id === product.id).map(link => link.collection_id),
    });
    setFiles([]);
    setError('');
    setNotice('');
  }

  async function uploadImages() {
    const uploaded = [];
    try {
      for (const file of files) {
        const safeName = file.name.replace(/[^\w.-]+/g, '-');
        const path = `${user.id}/${crypto.randomUUID()}-${safeName}`;
        const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type });
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
        uploaded.push(data.publicUrl);
      }
      return uploaded;
    } catch (uploadError) {
      const paths = uploaded.map(url => url.split(`/storage/v1/object/public/${BUCKET}/`)[1]).filter(Boolean);
      if (paths.length) {
        const { error: cleanupError } = await supabase.storage.from(BUCKET).remove(paths);
        if (cleanupError) throw new Error(`${errorMessage(uploadError)} Image cleanup failed: ${cleanupError.message}`);
      }
      throw uploadError;
    }
  }

  async function saveProduct(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setNotice('');
    let createdId = null;
    let productSaved = false;
    try {
      const price = Number(form.price);
      const stock = Number(form.stock);
      if (!form.title.trim() || !Number.isFinite(price) || price < 0 || !Number.isInteger(stock) || stock < 0) {
        throw new Error('Enter a product name, a valid non-negative PKR price, and a whole-number stock quantity.');
      }
      const uploaded = await uploadImages();
      const values = {
        title: form.title.trim(),
        description_html: form.description,
        product_type: form.category.trim(),
        images: [...form.images, ...uploaded],
        published: form.published,
      };
      let product = selected;
      if (selected) {
        const { data, error: updateError } = await supabase.from('products').update(values).eq('id', selected.id).select().single();
        if (updateError) throw updateError;
        product = data;
      } else {
        const { data, error: insertError } = await supabase.from('products').insert({
          ...values,
          handle: productHandle(values.title),
          vendor: 'Améza',
        }).select().single();
        if (insertError) throw insertError;
        product = data;
        createdId = data.id;
      }
      productSaved = true;

      const variants = [...(selected?.product_variants || [])].sort((a, b) => a.position - b.position);
      const variant = variants.find(item => item.id === form.variantId) || variants[0];
      const variantValues = { price, inventory_quantity: stock };
      const variantResult = variant
        ? await supabase.from('product_variants').update(variantValues).eq('id', variant.id)
        : await supabase.from('product_variants').insert({ ...variantValues, product_id: product.id, title: 'Default Title' });
      if (variantResult.error) {
        if (createdId) {
          const { error: rollbackError } = await supabase.from('products').delete().eq('id', createdId);
          if (rollbackError) throw new Error(`${variantResult.error.message} Product cleanup failed: ${rollbackError.message}`);
          productSaved = false;
        }
        throw variantResult.error;
      }
      const { error: collectionError } = await supabase.rpc('admin_set_product_collections', {
        p_product_id: product.id,
        p_collection_ids: form.collectionIds,
      });
      if (collectionError) throw new Error(`Product saved, but collection assignments could not be updated: ${collectionError.message}`);
      setNotice(selected ? 'Product updated.' : 'Product added.');
      setSelected(null);
      setForm(emptyForm());
      setFiles([]);
      const [productResult, linkResult] = await Promise.all([
        supabase.from('products').select('*, product_variants(*)').order('created_at', { ascending: false }),
        supabase.from('collection_products').select('collection_id, product_id'),
      ]);
      if (productResult.error) throw productResult.error;
      if (linkResult.error) throw linkResult.error;
      setProducts(productResult.data || []);
      setCollectionLinks(linkResult.data || []);
    } catch (saveError) {
      setError(productSaved
        ? `Product saved, but some updates failed: ${errorMessage(saveError)}`
        : errorMessage(saveError));
    } finally {
      setBusy(false);
    }
  }

  async function deleteProduct(product) {
    if (!window.confirm(`Delete "${product.title}"? This cannot be undone.`)) return;
    setError('');
    setNotice('');
    try {
      const { error: deleteError } = await supabase.from('products').delete().eq('id', product.id);
      if (deleteError) throw deleteError;
      setProducts(current => current.filter(item => item.id !== product.id));
      setCollectionLinks(current => current.filter(link => link.product_id !== product.id));
      if (selected?.id === product.id) startNewProduct();
      setNotice('Product deleted.');
    } catch (deleteError) {
      setError(errorMessage(deleteError));
    }
  }

  async function updateOrderStatus(orderId, fulfillment_status) {
    setError('');
    setNotice('');
    try {
      const { data, error: updateError } = await supabase.from('orders').update({ fulfillment_status }).eq('id', orderId).select().single();
      if (updateError) throw updateError;
      setOrders(current => current.map(order => order.id === orderId ? { ...order, ...data } : order));
      setNotice(`Order #${data.order_number} updated.`);
    } catch (updateError) {
      setError(errorMessage(updateError));
    }
  }

  async function decideOrder(order, decision) {
    setError('');
    setNotice('');
    try {
      const { data, error: decisionError } = await supabase.rpc('admin_set_order_confirmation', {
        p_order_id: order.id,
        p_decision: decision,
      });
      if (decisionError) throw decisionError;
      setOrders(current => current.map(item => item.id === order.id
        ? { ...item, confirmation_status: data }
        : item));
      if (decision === 'rejected') {
        const { data: refreshed, error: refreshError } = await supabase.from('products')
          .select('*, product_variants(*)').order('created_at', { ascending: false });
        if (refreshError) throw refreshError;
        setProducts(refreshed || []);
      }
      setNotice(`Order #${order.order_number} ${decision}.`);
    } catch (decisionError) {
      setError(errorMessage(decisionError));
    }
  }

  async function submitLogin(event) {
    event.preventDefault();
    setError('');
    try {
      await signIn(email, password);
    } catch (loginError) {
      setError(errorMessage(loginError));
    }
  }

  if (!enabled) {
    return <main className="admin-login"><h1>AMÉZA Admin</h1><p>Configure the Supabase URL and anon key to use the dashboard.</p></main>;
  }
  if (!ready || loading) return <main className="admin-login"><p>Loading admin dashboard…</p></main>;
  if (!user) {
    return (
      <main className="admin-login">
        <form className="admin-login__card" onSubmit={submitLogin}>
          <p className="admin-eyebrow">AMÉZA</p><h1>Admin sign in</h1>
          {error && <p className="admin-alert admin-alert--error" role="alert">{error}</p>}
          <label>Email<input type="email" autoComplete="username" required value={email} onChange={event => setEmail(event.target.value)} /></label>
          <label>Password<input type="password" autoComplete="current-password" required value={password} onChange={event => setPassword(event.target.value)} /></label>
          <button className="admin-button" type="submit">Sign in</button>
          <a href="/">Return to storefront</a>
        </form>
      </main>
    );
  }
  if (!authorized) {
    return (
      <main className="admin-login">
        <section className="admin-login__card">
          <p className="admin-eyebrow">AMÉZA</p><h1>Admin access required</h1>
          <p>This account is signed in, but is not authorized to manage the store.</p>
          {error && <p className="admin-alert admin-alert--error" role="alert">{error}</p>}
          <button className="admin-button" onClick={() => signOut().catch(signOutError => setError(errorMessage(signOutError)))}>Sign out</button>
        </section>
      </main>
    );
  }

  return (
    <main className="admin-page">
      <header className="admin-header">
        <div><p className="admin-eyebrow">AMÉZA</p><h1>Store dashboard</h1></div>
        <div className="admin-header__actions"><a href="/">View storefront</a><button className="admin-button admin-button--quiet" onClick={() => signOut().catch(signOutError => setError(errorMessage(signOutError)))}>Sign out</button></div>
      </header>
      <nav className="admin-tabs" aria-label="Dashboard sections">
        <button className={section === 'products' ? 'is-active' : ''} onClick={() => setSection('products')}>Perfumes <span>{products.length}</span></button>
        <button className={section === 'orders' ? 'is-active' : ''} onClick={() => setSection('orders')}>Orders <span>{orders.length}{pendingOrders.length > 0 ? ` · ${pendingOrders.length} pending` : ''}</span></button>
      </nav>
      <section className="admin-overview" aria-label="Store overview">
        <article className="admin-panel admin-metric"><p className="admin-eyebrow">Last 30 days</p><strong>{money(periodSales)}</strong><span>Confirmed sales · {confirmedPeriodOrders.length} orders</span></article>
        <article className="admin-panel admin-metric"><p className="admin-eyebrow">Needs attention</p><strong>{pendingOrders.length}</strong><span>Orders awaiting confirmation</span></article>
        <article className="admin-panel admin-metric"><p className="admin-eyebrow">Inventory</p><strong>{lowStockProducts.length}</strong><span>Low-stock products · {outOfStockVariants} variants out of stock</span></article>
        <article className="admin-panel admin-metric"><p className="admin-eyebrow">Top seller</p><strong>{bestSellers[0]?.[0] || '—'}</strong><span>{bestSellers[0] ? `${bestSellers[0][1]} units · latest ${orders.length} orders` : 'No confirmed sales yet'}</span></article>
        <article className="admin-panel admin-sales-chart">
          <div><p className="admin-eyebrow">Confirmed sales · last 7 days</p><div className="admin-sales-chart__bars">
            {salesByDay.map(day => <div className="admin-sales-chart__day" key={day.label}>
              <div className="admin-sales-chart__track" title={`${day.label}: ${money(day.sales)}`}>
                <span style={{ height: `${Math.max(day.sales ? 8 : 0, (day.sales / maxDailySales) * 100)}%` }} />
              </div>
              <small>{day.label}</small>
            </div>)}
          </div></div>
          <div className="admin-fulfillment-summary"><p className="admin-eyebrow">Last 30 days</p><b>{fulfilledPeriodOrders.length} fulfilled</b><span>{cancelledPeriodOrders.length} cancelled / rejected</span></div>
        </article>
      </section>
      {error && <p className="admin-alert admin-alert--error" role="alert">{error}</p>}
      {notice && <p className="admin-alert admin-alert--success" role="status">{notice}</p>}
      {storeWarning && <p className="admin-alert admin-alert--error" role="alert">{storeWarning}</p>}

      {section === 'products' ? (
        <div className="admin-products">
          <section className="admin-panel admin-product-form">
            <div className="admin-panel__heading"><div><p className="admin-eyebrow">{selected ? 'Edit listing' : 'Catalogue'}</p><h2>{selected ? 'Edit perfume' : 'Add a perfume'}</h2></div>
              {selected && <button className="admin-text-button" type="button" onClick={startNewProduct}>Cancel edit</button>}</div>
            <form onSubmit={saveProduct}>
              <label>Perfume name<input required maxLength="120" value={form.title} onChange={event => setForm({ ...form, title: event.target.value })} /></label>
              {selected?.product_variants?.length > 1 && <label>Variant price and stock<select value={form.variantId} onChange={event => {
                const variant = selected.product_variants.find(item => item.id === event.target.value);
                setForm({ ...form, variantId: variant.id, price: String(variant.price), stock: String(variant.inventory_quantity) });
              }}>
                {[...selected.product_variants].sort((a, b) => a.position - b.position).map(variant => <option key={variant.id} value={variant.id}>{variant.title}</option>)}
              </select></label>}
              <div className="admin-fields-row">
                <label>Price (PKR)<input required type="number" min="0" step="0.01" value={form.price} onChange={event => setForm({ ...form, price: event.target.value })} /></label>
                <label>Stock quantity<input required type="number" min="0" step="1" value={form.stock} onChange={event => setForm({ ...form, stock: event.target.value })} /></label>
              </div>
              <label>Category<input maxLength="80" value={form.category} onChange={event => setForm({ ...form, category: event.target.value })} placeholder="e.g. Women, Men, Oud" /></label>
              <fieldset className="admin-collection-picker">
                <legend>Collections</legend>
                <p className="admin-muted">Choose every collection where this perfume should appear.</p>
                {collections.length ? collections.map(collection => (
                  <label className="admin-checkbox" key={collection.id}>
                    <input
                      type="checkbox"
                      checked={form.collectionIds.includes(collection.id)}
                      onChange={event => setForm({
                        ...form,
                        collectionIds: event.target.checked
                          ? [...form.collectionIds, collection.id]
                          : form.collectionIds.filter(id => id !== collection.id),
                      })}
                    />
                    {collectionLabel(collection)}
                  </label>
                )) : <p className="admin-muted">No collections are configured yet.</p>}
              </fieldset>
              <label>Description<textarea rows="5" value={form.description} onChange={event => setForm({ ...form, description: event.target.value })} /></label>
              <label>Product images<input type="file" accept="image/*" multiple onChange={event => setFiles(Array.from(event.target.files || []))} /></label>
              {files.length > 0 && <p className="admin-muted">{files.length} image(s) ready to upload</p>}
              {form.images.length > 0 && (
                <div className="admin-image-list">{form.images.map(image => <div key={image}>
                  <img src={image} alt="" /><button type="button" aria-label="Remove image" onClick={() => setForm({ ...form, images: form.images.filter(item => item !== image) })}>×</button>
                </div>)}</div>
              )}
              <label className="admin-checkbox"><input type="checkbox" checked={form.published} onChange={event => setForm({ ...form, published: event.target.checked })} /> Published on storefront</label>
              <button className="admin-button" type="submit" disabled={busy}>{busy ? 'Saving…' : selected ? 'Save changes' : 'Add perfume'}</button>
            </form>
          </section>

          <section className="admin-panel">
            <div className="admin-panel__heading"><div><p className="admin-eyebrow">Catalogue</p><h2>Perfumes</h2></div><span className="admin-count">{products.length} total</span></div>
            {products.length ? <div className="admin-product-list">{products.map(product => {
              const variant = [...(product.product_variants || [])].sort((a, b) => a.position - b.position)[0];
              const assignedCollections = collectionLinks
                .filter(link => link.product_id === product.id)
                .map(link => collections.find(collection => collection.id === link.collection_id))
                .filter(Boolean)
                .map(collectionLabel);
              return <article className="admin-product-row" key={product.id}>
                <div className="admin-product-row__image">{product.images?.[0] && <img src={product.images[0]} alt="" />}</div>
                <div className="admin-product-row__info"><b>{product.title}</b><span>{product.product_type || 'Uncategorized'} · {money(variant?.price || 0)} · Stock {variant?.inventory_quantity ?? 0}</span><small>{product.published ? 'Published' : 'Draft'}</small><small>Collections: {assignedCollections.join(', ') || 'None'}</small></div>
                <div className="admin-row-actions"><button className="admin-text-button" onClick={() => editProduct(product)}>Edit</button><button className="admin-text-button admin-text-button--danger" onClick={() => deleteProduct(product)}>Delete</button></div>
              </article>;
            })}</div> : <p className="admin-empty">No perfumes yet. Add your first perfume using the form.</p>}
          </section>
        </div>
      ) : (
        <section className="admin-panel admin-orders">
          <div className="admin-panel__heading"><div><p className="admin-eyebrow">Sales</p><h2>Orders</h2></div><span className="admin-count">Latest {orders.length}</span></div>
          {lowStockProducts.length > 0 && <div className="admin-stock-alert">
            <b>Low stock</b>
            <span>{lowStockProducts.map(product => {
              const lowest = Math.min(...(product.product_variants || []).map(variant => variant.inventory_quantity));
              return `${product.title} (${lowest})`;
            }).join(' · ')}</span>
          </div>}
          {orders.length ? <div className="admin-table-scroll"><table>
            <thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Placed</th><th>Confirmation / fulfillment</th></tr></thead>
            <tbody>{orders.map(order => <tr key={order.id}>
              <td><b>#{order.order_number}</b><small>{order.confirmation_status || 'confirmed'} · {order.payment_status}</small></td>
              <td>{order.email}<small>{order.phone}</small></td>
              <td>{(order.order_items || []).map(item => `${item.title} × ${item.quantity}`).join(', ')}</td>
              <td>{money(order.total)}</td><td>{fmtDate(order.created_at)}</td>
              <td>
                {order.confirmation_status === 'pending' && <div className="admin-order-actions">
                  <button className="admin-button" onClick={() => decideOrder(order, 'confirmed')}>Confirm</button>
                  <button className="admin-button admin-button--quiet" onClick={() => {
                    if (window.confirm(`Reject order #${order.order_number}? Its reserved stock will be returned.`)) decideOrder(order, 'rejected');
                  }}>Reject</button>
                </div>}
                {order.confirmation_status !== 'pending' && <select aria-label={`Fulfillment status for order ${order.order_number}`} value={order.fulfillment_status} onChange={event => updateOrderStatus(order.id, event.target.value)}>
                  {ORDER_STATUSES.map(status => <option key={status} value={status}>{status[0].toUpperCase() + status.slice(1)}</option>)}
                </select>}
              </td>
            </tr>)}</tbody>
          </table></div> : <p className="admin-empty">No orders have been placed yet.</p>}
          {bestSellers.length > 0 && <div className="admin-best-sellers"><b>Best sellers in latest {orders.length} orders</b>{bestSellers.map(([title, quantity]) => <span key={title}>{title} <small>{quantity} sold</small></span>)}</div>}
        </section>
      )}
    </main>
  );
}
