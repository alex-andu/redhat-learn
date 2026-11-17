import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CHAPTERS, LESSONS, OBJECTIVES, EXAM_VERSION, chapterColor } from '../data/curriculum';
import { useStore } from '../lib/store';
import { AVAILABLE, topicProgress } from '../content/registry';
import { Icon } from '../components/Icon';

export function Curriculum() {
  const { progress, bookmarks } = useStore();
  const [open, setOpen] = useState<Set<string>>(new Set(['C1']));
  const toggle = (id: string) => setOpen((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const official = LESSONS.filter((l) => l.kind === 'official').length;
  return (
    <div className="page narrow">
      <h1>Curriculum RHCSA</h1>
      <p className="muted">
        Obiectivele oficiale <b>{EXAM_VERSION}</b>: {OBJECTIVES.length} obiective în {CHAPTERS.filter((c) => c.kind === 'official').length} categorii (text verbatim de pe pagina Red Hat),
        acoperite de {official} lecții oficiale. Lecțiile marcate <span className="badge support-tag">suport</span> nu sunt obiective de examen. Ordinea capitolelor este ordinea de predare; numerotarea urmează categoriile oficiale.
        Red Hat nu publică ponderi, durată sau prag de promovare pe pagina sursă, deci platforma nu le afișează.
      </p>
      <div className="row" style={{ margin: '10px 0 18px' }}>
        <button className="btn sm" onClick={() => setOpen(new Set(CHAPTERS.map((c) => c.id)))}>Deschide tot</button>
        <button className="btn sm ghost" onClick={() => setOpen(new Set())}>Închide tot</button>
        <Link className="btn sm" to="/obiective">Harta obiectivelor →</Link>
      </div>
      <div className="stack">
        {CHAPTERS.map((c) => (
          <div key={c.id} className="domain">
            <div className="domain-h" role="button" tabIndex={0} aria-expanded={open.has(c.id)} onClick={() => toggle(c.id)} onKeyDown={(e) => e.key === 'Enter' && toggle(c.id)}>
              <span className="num" style={{ background: `color-mix(in srgb, ${chapterColor(c.id)} 15%, transparent)`, color: chapterColor(c.id) }}>{c.id}</span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 650 }}>{c.title}</div>
                <div className="small muted">{c.kind === 'support' ? 'material de suport, nu obiectiv oficial' : `categorie oficială · ${c.category?.objectives.length ?? 0} obiective`} · {c.lessons.length} lecții</div>
              </div>
              <span className="spacer" />
              <Icon name="chevron" className={`chev ${open.has(c.id) ? 'open' : ''}`} />
            </div>
            {open.has(c.id) && (
              <div className="domain-b">
                {c.lessons.map((l) => {
                  const avail = AVAILABLE.has(l.id);
                  const pct = Math.round(topicProgress(l.id, progress[l.id]) * 100);
                  return (
                    <Link key={l.id} to={`/lectie/${l.id}`} className={`obj ${avail ? 'avail' : 'locked'}`}>
                      <span className="mono">{l.id}</span>
                      <span>{l.title}</span>
                      <span className="row" style={{ gap: 6 }}>
                        {bookmarks.has(l.id) && <Icon name="bookmark" size={14} />}
                        {l.kind === 'support' && <span className="badge support-tag">suport</span>}
                        {avail ? <span className="badge accent">{pct}%</span> : <span className="badge">în pregătire</span>}
                      </span>
                      {(l.objectives.length > 0 || l.refs.length > 0) && (
                        <span className="subs">{[...l.objectives, ...l.refs].map((id) => <span key={id} className="badge" title={OBJECTIVES.find((o) => o.id === id)?.text}>{id}</span>)}</span>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
