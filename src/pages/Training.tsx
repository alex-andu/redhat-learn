import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { QUESTIONS } from '../data/questions';
import { LESSONS } from '../data/curriculum';
import type { Answer, Mode, Question } from '../lib/types';
import { QuestionCard } from '../components/QuestionCard';
import { Icon } from '../components/Icon';
import { api } from '../lib/api';
import { grade, isAnswered, shuffle } from '../lib/grade';
import { recordQuestionResult } from '../lib/srs';
import { useStore } from '../lib/store';
import { fmtDuration } from '../lib/day';

const MODES: { id: Mode; title: string; icon: string; desc: string; bullets: string[] }[] = [
  { id: 'sim', title: 'Simulare', icon: 'clock', desc: 'Răspunzi la tot, fără explicații până la final; scor AUTOMAT doar pentru întrebările din platformă.',
    bullets: ['configurabil: număr de întrebări, timp, topic-uri', 'opțional fără întoarcere la întrebările anterioare', 'raport final cu explicații complete'] },
  { id: 'train', title: 'Antrenament', icon: 'book', desc: 'Răspunzi în ritmul tău; buton „Arată răspunsul” oricând.',
    bullets: ['Verifică după fiecare întrebare', 'navigare liberă înainte/înapoi', 'explicații pentru toate variantele'] },
  { id: 'fast', title: 'Fast track', icon: 'bolt', desc: 'Alegi varianta și vezi imediat corect/greșit, apoi treci mai departe.',
    bullets: ['un click = răspuns + explicații', 'ideal pentru recapitulare rapidă', 'Enter / → pentru următoarea'] },
];
const TYPES: { id: Question['type']; label: string }[] = [
  { id: 'single', label: 'Single choice (incl. găsește greșeala / interpretează output-ul)' }, { id: 'multi', label: 'Multiple choice' }, { id: 'match', label: 'Potrivire' },
  { id: 'order', label: 'Ordonare pași' }, { id: 'cli', label: 'Completare de comandă' },
];

type Config = { mode: Mode; topics: string[]; types: Question['type'][]; count: number; minutes: number; noBack: boolean; onlyWrong: boolean; shuffle: boolean };

export function Training() {
  const [params] = useSearchParams();
  const topicsWithQ = useMemo(() => [...new Set(QUESTIONS.map((q) => q.topicId))], []);
  const [cfg, setCfg] = useState<Config>({
    mode: 'train', topics: params.get('topic') ? [params.get('topic')!] : topicsWithQ, types: TYPES.map((t) => t.id),
    count: 20, minutes: 30, noBack: true, onlyWrong: false, shuffle: true,
  });
  const [session, setSession] = useState<{ cfg: Config; qs: Question[]; key: number } | null>(null);
  const [wrongIds, setWrongIds] = useState<Set<string>>(new Set());
  useEffect(() => { api.stats().then((s) => setWrongIds(new Set(s.perQuestion.filter((p) => !p.lastCorrect).map((p) => p.questionId)))).catch(() => {}); }, []);

  const pool = QUESTIONS.filter((q) => cfg.topics.includes(q.topicId) && cfg.types.includes(q.type) && (!cfg.onlyWrong || wrongIds.has(q.id)));
  const start = () => {
    const picked = (cfg.shuffle ? shuffle(pool) : pool).slice(0, Math.min(cfg.count, pool.length));
    setSession({ cfg, qs: picked, key: Date.now() });
  };

  if (session) return <Session key={session.key} cfg={session.cfg} qs={session.qs} onExit={() => setSession(null)} />;

  const objs = LESSONS;
  return (
    <div className="page">
      <h1>Mediu de antrenament</h1>
      <p className="muted">Alege modul, apoi configurează sesiunea. Indiferent de mod, vei vedea explicația pentru <b>fiecare variantă</b> — corectă, greșită și celelalte.</p>
      <div className="grid c3" style={{ margin: '18px 0' }}>
        {MODES.map((m) => (
          <button key={m.id} className={`card mode-card ${cfg.mode === m.id ? 'on' : ''}`} onClick={() => setCfg({ ...cfg, mode: m.id })} aria-pressed={cfg.mode === m.id}>
            <div className="mode-ico"><Icon name={m.icon} size={20} /></div>
            <h3 style={{ margin: '0 0 6px' }}>{m.title}</h3>
            <p className="small muted" style={{ margin: '0 0 8px' }}>{m.desc}</p>
            <ul className="small" style={{ margin: 0 }}>{m.bullets.map((b) => <li key={b}>{b}</li>)}</ul>
          </button>
        ))}
      </div>
      <div className="grid c2">
        <div className="card stack">
          <h3 style={{ margin: 0 }}>Conținut</h3>
          <div>
            <div className="small muted" style={{ marginBottom: 6 }}>Lecții (doar cele cu întrebări)</div>
            <div className="row">
              {topicsWithQ.map((t) => {
                const on = cfg.topics.includes(t); const o = objs.find((x) => x.id === t);
                return <button key={t} className={`btn sm ${on ? 'primary' : ''}`} title={o?.title} onClick={() => setCfg({ ...cfg, topics: on ? cfg.topics.filter((x) => x !== t) : [...cfg.topics, t] })}>{t} · {o?.title.slice(0, 32)}</button>;
              })}
            </div>
          </div>
          <div>
            <div className="small muted" style={{ marginBottom: 6 }}>Tipuri de întrebări</div>
            <div className="row">
              {TYPES.map((t) => {
                const on = cfg.types.includes(t.id);
                return <button key={t.id} className={`btn sm ${on ? 'primary' : ''}`} onClick={() => setCfg({ ...cfg, types: on ? cfg.types.filter((x) => x !== t.id) : [...cfg.types, t.id] })}>{t.label}</button>;
              })}
            </div>
          </div>
          <label className="check"><input type="checkbox" checked={cfg.onlyWrong} onChange={(e) => setCfg({ ...cfg, onlyWrong: e.target.checked })} />Doar întrebările greșite ultima dată ({wrongIds.size})</label>
          <label className="check"><input type="checkbox" checked={cfg.shuffle} onChange={(e) => setCfg({ ...cfg, shuffle: e.target.checked })} />Ordine aleatorie</label>
        </div>
        <div className="card stack">
          <h3 style={{ margin: 0 }}>Sesiune</h3>
          <label className="field">Număr de întrebări: <b style={{ color: 'var(--text)' }}>{Math.min(cfg.count, pool.length)}</b> (disponibile: {pool.length})
            <input type="range" min={5} max={Math.max(5, Math.min(120, pool.length))} value={Math.min(cfg.count, Math.max(5, pool.length))} onChange={(e) => setCfg({ ...cfg, count: +e.target.value })} style={{ accentColor: 'var(--accent)' }} />
          </label>
          {cfg.mode === 'sim' && (<>
            <label className="field">Timp limită: <b style={{ color: 'var(--text)' }}>{cfg.minutes === 0 ? 'fără limită' : `${cfg.minutes} min`}</b>
              <input type="range" min={0} max={120} step={5} value={cfg.minutes} onChange={(e) => setCfg({ ...cfg, minutes: +e.target.value })} style={{ accentColor: 'var(--accent)' }} />
            </label>
            <label className="check"><input type="checkbox" checked={cfg.noBack} onChange={(e) => setCfg({ ...cfg, noBack: e.target.checked })} />Fără întoarcere la întrebările anterioare</label>
            <p className="tiny muted" style={{ margin: 0 }}>EX200 este un examen practic. Un scor la întrebări nu măsoară abilitatea de a configura un sistem și nu se combină cu autoevaluarea laboratoarelor. Timpul de aici e ales de tine; Red Hat nu publică o durată pe pagina sursă.</p>
          </>)}
          <span className="spacer" />
          <button className="btn primary" disabled={pool.length === 0} onClick={start}><Icon name="play" />Pornește {MODES.find((m) => m.id === cfg.mode)!.title.toLowerCase()}</button>
        </div>
      </div>
    </div>
  );
}

/* ====================================================================== */

function Session({ cfg, qs, onExit }: { cfg: Config; qs: Question[]; onExit: () => void }) {
  const { bumpStats } = useStore();
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Answer | null>>({});
  const [graded, setGraded] = useState<Record<string, boolean>>({});
  const [finished, setFinished] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const startTs = useRef(Date.now());
  const limit = cfg.mode === 'sim' && cfg.minutes > 0 ? cfg.minutes * 60 : 0;

  useEffect(() => {
    if (finished) return;
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - startTs.current) / 1000)), 1000);
    return () => clearInterval(t);
  }, [finished]);
  useEffect(() => { if (limit && elapsed >= limit && !finished) finishSim(); }, [elapsed]);

  // tastatură în fast track: Enter / → = următoarea
  useEffect(() => {
    if (cfg.mode !== 'fast') return;
    const h = (e: KeyboardEvent) => {
      if ((e.key === 'Enter' || e.key === 'ArrowRight') && graded[qs[i]?.id] !== undefined && (e.target as HTMLElement)?.tagName !== 'INPUT') next();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  });

  const record = (q: Question, ok: boolean, a: Answer | null, onlyReveal = false) => {
    api.attempt({ questionId: q.id, topicId: q.topicId, mode: cfg.mode, correct: ok, answer: onlyReveal ? { revealed: true } : a }).catch(() => {});
    recordQuestionResult(q.id, ok).catch(() => {});
  };

  const finishSim = () => {
    const res: Record<string, boolean> = {};
    for (const q of qs) { const a = answers[q.id] ?? null; const ok = grade(q, a); res[q.id] = ok; record(q, ok, a); }
    setGraded(res);
    const correct = Object.values(res).filter(Boolean).length;
    api.saveExam({ config: { count: qs.length, minutes: cfg.minutes, topics: cfg.topics, noBack: cfg.noBack }, total: qs.length, correct, durationS: elapsed,
      details: qs.map((q) => ({ id: q.id, ok: res[q.id] })) }).then(bumpStats).catch(() => {});
    setFinished(true);
  };

  const next = () => { if (i < qs.length - 1) setI(i + 1); else if (cfg.mode === 'sim') finishSim(); else { setFinished(true); bumpStats(); } };
  const q = qs[i];
  const correctCount = Object.values(graded).filter(Boolean).length;

  if (finished) return <Results cfg={cfg} qs={qs} answers={answers} graded={graded} elapsed={elapsed} onExit={onExit} />;

  const remaining = limit ? Math.max(0, limit - elapsed) : 0;
  return (
    <div className="page narrow">
      <div className="session-bar">
        <button className="btn sm ghost" onClick={() => { if (confirm('Ieși din sesiune? Progresul sesiunii curente se pierde.')) onExit(); }}><Icon name="arrowL" />Ieși</button>
        <span className="badge accent">{MODES.find((m) => m.id === cfg.mode)!.title}</span>
        <span className="spacer" />
        {cfg.mode !== 'sim' && <span className="small muted">corecte: <b style={{ color: 'var(--ok)' }}>{correctCount}</b> / {Object.keys(graded).length}</span>}
        <span className={`timer ${limit && remaining < 300 ? 'low' : ''}`}>{limit ? `⏳ ${fmtDuration(remaining)}` : `⏱ ${fmtDuration(elapsed)}`}</span>
      </div>
      <div className="progress" style={{ marginBottom: 16 }}><span style={{ width: `${((i + 1) / qs.length) * 100}%` }} /></div>
      {(cfg.mode !== 'sim' || !cfg.noBack) && (
        <div className="dots-nav" style={{ marginBottom: 14 }}>
          {qs.map((x, k) => {
            const st = cfg.mode === 'sim' ? (isAnswered(x, answers[x.id] ?? null) ? 'ans' : '') : graded[x.id] === true ? 'ok' : graded[x.id] === false ? 'bad' : '';
            return <button key={x.id} className={`${k === i ? 'cur' : ''} ${st}`} onClick={() => setI(k)}>{k + 1}</button>;
          })}
        </div>
      )}
      <QuestionCard key={q.id} q={q} mode={cfg.mode !== 'sim' && graded[q.id] !== undefined ? 'review' : cfg.mode} index={i} total={qs.length}
        answer={answers[q.id]} seed={undefined}
        onChange={(a) => setAnswers((s) => ({ ...s, [q.id]: a }))}
        onGraded={(ok, a, onlyReveal) => { setGraded((g) => ({ ...g, [q.id]: ok })); setAnswers((s) => ({ ...s, [q.id]: a })); record(q, ok, a, onlyReveal); }}
        onNext={next}
        nextLabel={i === qs.length - 1 ? (cfg.mode === 'sim' ? 'Finalizează simularea' : 'Termină') : 'Următoarea'} />
      {cfg.mode === 'sim' && (
        <div className="row" style={{ marginTop: 12 }}>
          {!cfg.noBack && i > 0 && <button className="btn sm" onClick={() => setI(i - 1)}><Icon name="arrowL" />Anterioara</button>}
          <span className="spacer" />
          <span className="small muted">răspunse: {qs.filter((x) => isAnswered(x, answers[x.id] ?? null)).length}/{qs.length}</span>
          <button className="btn sm" onClick={() => { if (confirm('Finalizezi simularea acum?')) finishSim(); }}>Finalizează acum</button>
        </div>
      )}
      {cfg.mode === 'train' && i > 0 && <div className="row" style={{ marginTop: 12 }}><button className="btn sm" onClick={() => setI(i - 1)}><Icon name="arrowL" />Anterioara</button></div>}
    </div>
  );
}

function Results({ cfg, qs, answers, graded, elapsed, onExit }: { cfg: Config; qs: Question[]; answers: Record<string, Answer | null>; graded: Record<string, boolean>; elapsed: number; onExit: () => void }) {
  const [filter, setFilter] = useState<'all' | 'wrong'>('wrong');
  const correct = qs.filter((q) => graded[q.id]).length;
  const pct = qs.length ? Math.round((correct / qs.length) * 100) : 0;
  const bySub = new Map<string, { t: number; c: number }>();
  for (const q of qs) { const k = q.topicId; const v = bySub.get(k) ?? { t: 0, c: 0 }; v.t++; if (graded[q.id]) v.c++; bySub.set(k, v); }
  const list = filter === 'all' ? qs : qs.filter((q) => !graded[q.id]);
  return (
    <div className="page narrow">
      <div className="card" style={{ textAlign: 'center', marginBottom: 16 }}>
        <div className="small muted">{MODES.find((m) => m.id === cfg.mode)!.title} · {fmtDuration(elapsed)}</div>
        <div style={{ fontSize: '3rem', fontWeight: 800, letterSpacing: '-0.03em', color: pct >= 85 ? 'var(--ok)' : pct >= 65 ? 'var(--warn)' : 'var(--bad)' }}>{pct}%</div>
        <div>{correct} corecte din {qs.length}</div>
        <p className="small muted" style={{ maxWidth: 520, margin: '10px auto 0' }}>Scor AUTOMAT, doar pentru întrebările de mai sus. Nu este o probabilitate de promovare: examenul EX200 este practic, iar Red Hat nu publică un prag pe pagina sursă. Practica se exersează în laboratoare (autoevaluare, separat).</p>
        <div className="row" style={{ justifyContent: 'center', marginTop: 14 }}>
          <button className="btn primary" onClick={onExit}>Sesiune nouă</button>
        </div>
      </div>
      <div className="card" style={{ marginBottom: 16 }}>
        <h3>Pe lecții</h3>
        {[...bySub.entries()].sort().map(([k, v]) => (
          <div key={k} style={{ marginBottom: 10 }}>
            <div className="row between small"><span className="mono">{k}</span><span>{v.c}/{v.t}</span></div>
            <div className="progress" style={{ marginTop: 4 }}><span style={{ width: `${(v.c / v.t) * 100}%` }} /></div>
          </div>
        ))}
      </div>
      <div className="row" style={{ marginBottom: 12 }}>
        <h3 style={{ margin: 0 }}>Revizuire cu explicații</h3><span className="spacer" />
        <div className="segmented"><button className={filter === 'wrong' ? 'on' : ''} onClick={() => setFilter('wrong')}>Doar greșite ({qs.length - correct})</button><button className={filter === 'all' ? 'on' : ''} onClick={() => setFilter('all')}>Toate</button></div>
      </div>
      <div className="stack">
        {list.map((q) => <QuestionCard key={q.id} q={q} mode="review" index={qs.indexOf(q)} total={qs.length} answer={answers[q.id] ?? null} />)}
        {list.length === 0 && <div className="card center muted">Nicio greșeală — excelent!</div>}
      </div>
    </div>
  );
}
