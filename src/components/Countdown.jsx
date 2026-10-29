import { Fragment, useEffect, useState } from 'react';

const p2 = x => (x < 10 ? '0' : '') + x;

// Ported from cd() in ameza-store.js: counts down to `end`, or to midnight tonight when `end` is empty/past.
export default function Countdown({ end = '', as: Tag = 'span', className = 'am-cd' }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const i = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(i); }, []);
  let t = Date.parse(end);
  if (!(t > now)) { const d = new Date(now); d.setHours(23, 59, 59, 999); t = d.getTime(); }
  const s = Math.max(0, Math.floor((t - now) / 1000));
  const v = [Math.floor(s / 86400), Math.floor((s % 86400) / 3600), Math.floor((s % 3600) / 60), s % 60];
  return (
    <Tag className={className}>
      {v.map((x, i) => <Fragment key={i}><b>{p2(x)}</b>{i < 3 && <i>:</i>}</Fragment>)}
    </Tag>
  );
}
