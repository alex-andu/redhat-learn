import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { LESSONS, OBJECTIVES } from '../data/curriculum';
import { GLOSSARY } from '../data/glossary';
import { LABS } from '../content/labs';
import { QUESTIONS } from '../data/questions';
import { plain } from '../components/Rich';

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

/** Căutare locală (fără index extern) în lecții, obiective, glosar, laboratoare și întrebări. */
export function Search() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const hits = useMemo(() => {
    const s = norm(q.trim());
    if (s.length < 2) return null;
    const has = (...x: (string | undefined)[]) => x.some((v) => v && norm(v).includes(s));
    return {
      lessons: LESSONS.filter((l) => has(l.id, l.title)),
      objectives: OBJECTIVES.filter((o) => has(o.id, o.text)),
      terms: GLOSSARY.filter((g) => has(g.abbr, g.full, g.ro, g.what, ...(g.aliases ?? []))),
      labs: LABS.filter((l) => has(l.title, ...l.scenario)),
      questions: QUESTIONS.filter((x) => has(plain(x.stem))).slice(0, 15),
    };
  }, [q]);
  return (
    <div className="page narrow">
      <h1>Căutare</h1>
      <input className="input" autoFocus placeholder="Caută: redirect, man, grep, C1-2…" value={q} onChange={(e) => setParams(e.target.value ? { q: e.target.value } : {})} />
      {!hits && <p className="muted small" style={{ marginTop: 12 }}>Scrie cel puțin 2 caractere. Căutarea rulează local, în browser, în lecții, obiective, glosar, laboratoare și întrebări.</p>}
      {hits && (
        <div className="stack" style={{ marginTop: 14 }}>
          {hits.lessons.length > 0 && <Group title="Lecții">{hits.lessons.map((l) => <Link key={l.id} className="search-hit" to={`/lectie/${l.id}`}><b className="mono">{l.id}</b> {l.title}</Link>)}</Group>}
          {hits.objectives.length > 0 && <Group title="Obiective oficiale">{hits.objectives.map((o) => <Link key={o.id} className="search-hit" to={`/obiective#${o.id}`}><b className="mono">{o.id}</b> {o.text}</Link>)}</Group>}
          {hits.terms.length > 0 && <Group title="Glosar">{hits.terms.map((g) => <Link key={g.id} className="search-hit" to={`/glosar#${g.id}`}><b>{g.abbr}</b> — {g.ro ?? g.what}</Link>)}</Group>}
          {hits.labs.length > 0 && <Group title="Laboratoare">{hits.labs.map((l) => <Link key={l.id} className="search-hit" to={`/laboratoare/${l.id}`}>{l.title}</Link>)}</Group>}
          {hits.questions.length > 0 && <Group title="Întrebări">{hits.questions.map((x) => <Link key={x.id} className="search-hit" to={`/lectie/${x.topicId}#questions`}><b className="mono">{x.topicId}</b> {plain(x.stem).slice(0, 140)}</Link>)}</Group>}
          {Object.values(hits).every((a) => a.length === 0) && <p className="muted">Niciun rezultat.</p>}
        </div>
      )}
    </div>
  );
}
function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return <div><h3 style={{ marginTop: 0 }}>{title}</h3><div className="stack" style={{ gap: 6 }}>{children}</div></div>;
}
