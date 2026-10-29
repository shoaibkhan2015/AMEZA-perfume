// Page-wide behaviours ported 1:1 from assets/ameza-store.js:
//  - scroll-reveal ([data-reveal] gets class "in")
//  - animated count-up for the scent percentage bars ([data-pct])
//  - click-to-copy discount codes ([data-copy])
//  - "someone just bought" social-proof toast
//  - optional sticky buy bar
// Everything interactive that needs React state (cart, drawer, gallery, qty…) lives in components instead.

export function initEffects() {
  const $ = (s, r) => [].slice.call((r || document).querySelectorAll(s));
  const cleanups = [];

  // ---- reveal + count-up
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      if (e.target.querySelector('[data-pct]')) count(e.target);
      io.unobserve(e.target);
    }
  }), { threshold: 0.12 });
  function count(root) {
    [].forEach.call(root.querySelectorAll('[data-pct]'), (el, i) => {
      const to = +el.dataset.pct, t0 = performance.now() + i * 110;
      (function f(n) {
        const k = Math.max(0, Math.min(1, (n - t0) / 1300));
        el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3)));
        if (k < 1) requestAnimationFrame(f);
      })(performance.now());
    });
  }
  const reveal = () => $('[data-reveal]:not(.in)').forEach(e => io.observe(e));
  reveal();
  let raf = 0;
  const mo = new MutationObserver(() => { cancelAnimationFrame(raf); raf = requestAnimationFrame(reveal); });
  mo.observe(document.body, { childList: true, subtree: true });
  cleanups.push(() => { io.disconnect(); mo.disconnect(); cancelAnimationFrame(raf); });

  // ---- copy code
  const onCopy = e => {
    const c = e.target.closest('[data-copy]'); if (!c) return;
    try { navigator.clipboard.writeText(c.dataset.copy); } catch { /* ignore */ }
    const o = c.textContent; c.textContent = 'Copied ✓'; setTimeout(() => { c.textContent = o; }, 1600);
  };
  document.addEventListener('click', onCopy);
  cleanups.push(() => document.removeEventListener('click', onCopy));

  // ---- social proof toast
  const el = $('[data-am-proof]')[0];
  if (el) {
    const L = (el.dataset.list || '').split(/\n|;/).filter(Boolean).map(x => x.split('|'));
    if (L.length) {
      const t = document.createElement('div'); t.className = 'am-toast'; document.body.appendChild(t);
      let i = 0, iv, off;
      const go = () => {
        const a = L[i++ % L.length], m = 2 + Math.floor(Math.random() * 40);
        t.innerHTML = '<i>🛍️</i><div><b>' + a[0] + '</b> from ' + a[1] + '<br>bought <b>' + a[2] + '</b> · ' + m + ' min ago</div>';
        t.classList.add('on'); off = setTimeout(() => t.classList.remove('on'), 5000);
      };
      const st = setTimeout(() => { go(); iv = setInterval(go, 16000); }, 6000);
      cleanups.push(() => { clearTimeout(st); clearInterval(iv); clearTimeout(off); t.remove(); });
    }
  }

  // ---- sticky buy bar (only when enabled in siteContent.extras.sticky)
  const onScroll = () => {
    const sb = $('.am-sticky')[0]; if (!sb) return;
    const h = $('.ps')[0];
    const on = h ? h.getBoundingClientRect().bottom < innerHeight * 0.6 : scrollY > innerHeight * 0.8;
    sb.classList.toggle('on', on);
    document.documentElement.style.setProperty('--sb', on ? '74px' : '0px');
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  cleanups.push(() => removeEventListener('scroll', onScroll));

  return () => cleanups.forEach(f => f());
}
