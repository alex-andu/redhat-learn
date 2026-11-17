import { useEffect, useMemo, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { GLOSSARY } from '../data/glossary';

export function Glossary() {
  const [q, setQ] = useState('');
  const loc = useLocation();
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return [...GLOSSARY].sort((a, b) => a.abbr.localeCompare(b.abbr, 'ro'))
      .filter((g) => !s || [g.abbr, g.full, g.ro, g.what, ...(g.aliases ?? [])].some((x) => x?.toLowerCase().includes(s)));
  }, [q]);
  useEffect(() => {
    if (loc.hash) setTimeout(() => {
      const el = document.getElementById('g-' + loc.hash.slice(1));
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' }); el?.animate([{ boxShadow: '0 0 0 3px var(--accent)' }, { boxShadow: '0 0 0 0 transparent' }], { duration: 1600 });
    }, 50);
  }, [loc.hash]);
  return (
    <div className="page narrow">
      <h1>Glosar</h1>
      <p className="muted">Fiecare termen, comandă sau concept explicat pe trei straturi: <b>ce face</b>, <b>cum lucrează</b> și <b>unde se folosește</b>. Aceleași explicații apar în tooltip-urile din lecții.</p>
      <input className="input" placeholder="Caută: shell, stdout, pipe, man…" value={q} onChange={(e) => setQ(e.target.value)} style={{ margin: '10px 0 18px' }} autoFocus />
      <div className="small muted" style={{ marginBottom: 10 }}>{list.length} termeni</div>
      <div className="stack">
        {list.map((g) => (
          <div key={g.id} id={'g-' + g.id} className="card" style={{ scrollMarginTop: 90 }}>
            <div className="row" style={{ gap: 8 }}>
              <h3 style={{ margin: 0, color: 'var(--accent)' }}>{g.abbr}</h3>
              {g.layer && <span className="badge">{g.layer}</span>}{g.std && <span className="badge">{g.std}</span>}
              <span className="spacer" />
              {g.topics?.map((t) => <Link key={t} to={`/lectie/${t}`} className="badge accent">{t}</Link>)}
            </div>
            {(g.full || g.ro) && <div className="small muted" style={{ margin: '4px 0 12px' }}>{g.full}{g.full && g.ro ? ' — ' : ''}{g.ro}</div>}
            <div className="grid c3" style={{ gap: 14 }}>
              <div><div className="tiny muted" style={{ textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 650 }}>Ce face</div><div className="small">{g.what}</div></div>
              <div><div className="tiny muted" style={{ textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 650 }}>Cum lucrează</div><div className="small">{g.how}</div></div>
              <div><div className="tiny muted" style={{ textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 650 }}>Unde se folosește</div><div className="small">{g.where}</div></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
