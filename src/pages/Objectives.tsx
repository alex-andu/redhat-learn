import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CATEGORIES, LESSONS, lessonsForObjective, chapterColor } from '../data/curriculum';
import { AVAILABLE } from '../content/registry';
import { questionsForTopic } from '../data/questions';
import { api, type LabChecks, type Stats } from '../lib/api';
import { LABS } from '../content/labs';
import { useStore } from '../lib/store';

/** Harta de acoperire a celor 62 de obiective. Trei surse, afișate SEPARAT: lecție, quiz (automat), laborator (autoevaluare). Fără procent unic. */
export function Objectives() {
  const { statsVersion } = useStore();
  const loc = useLocation();
  const [stats, setStats] = useState<Stats | null>(null);
  const [checks, setChecks] = useState<LabChecks>({});
  useEffect(() => { api.stats().then(setStats).catch(() => {}); api.labChecks().then(setChecks).catch(() => {}); }, [statsVersion]);
  useEffect(() => {
    if (loc.hash) setTimeout(() => document.getElementById(loc.hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 60);
  }, [loc.hash]);

  const total = CATEGORIES.reduce((a, c) => a + c.objectives.length, 0);
  const withLesson = CATEGORIES.flatMap((c) => c.objectives).filter((o) => lessonsForObjective(o.id).home.some((l) => AVAILABLE.has(l.id))).length;

  return (
    <div className="page narrow">
      <h1>Harta obiectivelor EX200</h1>
      <p className="muted">
        {total} obiective oficiale, fiecare legată de lecția „casă”. Pentru fiecare obiectiv vezi, <b>separat</b>: dacă lecția e scrisă, câte întrebări automate există și câte criterii de laborator ai <b>declarat</b> tu.
        Nu există un procent unic și nicio „probabilitate de promovare”: examenul este practic, iar platforma nu verifică niciun sistem.
      </p>
      <p className="small"><b>{withLesson}</b> din {total} obiective au deja lecția scrisă (pilot în lucru; restul se adaugă lecție cu lecție).</p>
      <div className="stack">
        {CATEGORIES.map((c) => (
          <div key={c.id} className="card">
            <h3 style={{ marginTop: 0, color: chapterColor(c.id) }}>{c.id} · {c.title}</h3>
            {c.objectives.map((o) => {
              const { home, refs } = lessonsForObjective(o.id);
              const lessons = [...home, ...refs];
              const nq = home.reduce((a, l) => a + questionsForTopic(l.id).length, 0);
              const attempted = home.reduce((a, l) => a + (stats?.perTopic.find((t) => t.topicId === l.id)?.total ?? 0), 0);
              const correct = home.reduce((a, l) => a + (stats?.perTopic.find((t) => t.topicId === l.id)?.correct ?? 0), 0);
              const labs = LABS.filter((lb) => lb.objectives.includes(o.id));
              const crit = labs.reduce((a, lb) => a + lb.criteria.length, 0);
              const done = labs.reduce((a, lb) => a + lb.criteria.filter((x) => checks[lb.id]?.[x.id]).length, 0);
              return (
                <div key={o.id} id={o.id} style={{ padding: '10px 0', borderTop: '1px solid var(--border)', scrollMarginTop: 90 }}>
                  <div className="row" style={{ gap: 10, alignItems: 'baseline' }}><span className="mono" style={{ color: 'var(--accent)' }}>{o.id}</span><span>{o.text}</span></div>
                  <div className="chip-row" style={{ marginTop: 6 }}>
                    {lessons.map((l) => (
                      <Link key={l.id} to={`/lectie/${l.id}`} className={`badge ${AVAILABLE.has(l.id) ? 'accent' : ''}`} title={l.title}>
                        {l.id}{home.includes(l) ? '' : ' (trimitere)'}{AVAILABLE.has(l.id) ? '' : ' · în pregătire'}
                      </Link>
                    ))}
                    {lessons.length === 0 && <span className="badge bad">fără lecție în hartă</span>}
                    <span className="badge">quiz automat: {nq ? `${nq} întrebări${attempted ? ` · ${correct}/${attempted} corecte` : ''}` : '—'}</span>
                    <span className="badge">autoevaluare lab: {crit ? `${done}/${crit} declarate` : '—'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <p className="tiny muted" style={{ marginTop: 14 }}>Lecții în hartă: {LESSONS.length}. ID-urile Cn-m sunt interne proiectului; pagina Red Hat nu numerotează obiectivele.</p>
    </div>
  );
}
