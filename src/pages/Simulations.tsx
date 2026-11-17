import { useEffect, useRef, useState } from 'react';
import { SIMULATIONS } from '../content/simulations';
import { LABS } from '../content/labs';
import { questionById } from '../data/questions';
import { QuestionCard } from '../components/QuestionCard';
import { LabView } from '../components/LabView';
import { Rich } from '../components/Rich';
import { Callout } from '../components/Lesson';
import { Icon } from '../components/Icon';
import { api, type SimulationResult } from '../lib/api';
import { grade } from '../lib/grade';
import { fmtDuration } from '../lib/day';
import type { Answer, Question } from '../lib/types';
import type { Simulation } from '../lab/types';

/** Simulare de examen (Exam Simulation): task-uri practice independente + întrebări cu răspuns în platformă.
 *  Scorul AUTOMAT (întrebări) și AUTOEVALUAREA (task-uri practice) sunt afișate SEPARAT; niciun scor combinat. */
export function Simulations() {
  const [sim, setSim] = useState<Simulation | null>(null);
  const [history, setHistory] = useState<SimulationResult[]>([]);
  useEffect(() => { api.simulations().then(setHistory).catch(() => {}); }, [sim]);
  if (sim) return <Run sim={sim} onExit={() => setSim(null)} />;
  return (
    <div className="page narrow">
      <h1>Simulări de examen</h1>
      <Callout kind="info" title="Ce este și ce nu este o simulare aici">
        O simulare grupează mai multe task-uri practice independente (fără indicii și fără soluții până termini) și câteva întrebări cu răspuns în platformă.
        Task-urile practice le faci <b>pe propriul tău sistem Linux</b>; platforma nu se conectează la el și nu îl verifică. Rezultatele au două părți <b>separate</b>:
        scorul <b>automat</b> (doar întrebările) și <b>autoevaluarea</b> ta (criterii bifate). Nu sunt întrebări reale de examen, iar Red Hat nu publică durata sau pragul oficial pe pagina sursă.
      </Callout>
      <div className="stack">
        {SIMULATIONS.map((s) => (
          <div key={s.id} className="card">
            <h3 style={{ marginTop: 0 }}>{s.title}</h3>
            <p className="small muted">{s.description}</p>
            <div className="chip-row"><span className="badge">⏱ ≈{s.estimatedMinutes} min (estimat)</span><span className="badge">{s.tasks.length} task-uri practice (autoevaluare)</span><span className="badge">{s.autoQuestionIds.length} întrebări (scor automat)</span></div>
            <button className="btn primary" style={{ marginTop: 12 }} onClick={() => setSim(s)}><Icon name="play" />Începe simularea</button>
          </div>
        ))}
      </div>
      <h3>Istoric (local, în acest browser)</h3>
      {history.length === 0 ? <p className="muted small">Nicio simulare încheiată.</p> : history.slice(0, 10).map((h) => (
        <div key={h.id} className="row between small" style={{ padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
          <span>{new Date(h.ts).toLocaleString('ro-RO', { dateStyle: 'short', timeStyle: 'short' })} · {h.simId} · {fmtDuration(h.durationS)}</span>
          <span>scor automat: <b>{h.autoCorrect}/{h.autoTotal}</b> · autoevaluat (declarat): <b>{h.selfChecked}/{h.selfTotal}</b></span>
        </div>
      ))}
    </div>
  );
}

function Run({ sim, onExit }: { sim: Simulation; onExit: () => void }) {
  const [phase, setPhase] = useState<'run' | 'review'>('run');
  const [answers, setAnswers] = useState<Record<string, Answer | null>>({});
  const [elapsed, setElapsed] = useState(0);
  const [selfVersion, setSelfVersion] = useState(0);
  const [saved, setSaved] = useState(false);
  const start = useRef(Date.now());
  const qs = sim.autoQuestionIds.map((id) => questionById.get(id)).filter(Boolean) as Question[];
  const tasks = sim.tasks.map((t) => LABS.find((l) => l.id === t.labId)).filter(Boolean) as typeof LABS;
  const limit = sim.estimatedMinutes * 60;

  useEffect(() => {
    if (phase !== 'run') return;
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - start.current) / 1000)), 1000);
    return () => clearInterval(t);
  }, [phase]);

  const autoCorrect = qs.filter((q) => grade(q, answers[q.id] ?? null)).length;

  if (phase === 'run') {
    return (
      <div className="page narrow">
        <div className="row between" style={{ marginBottom: 12 }}>
          <h1 style={{ margin: 0 }}>{sim.title}</h1>
          <span className="timer" title="Durată estimată; nu este durata oficială a examenului.">{fmtDuration(elapsed)} / ≈{sim.estimatedMinutes} min</span>
        </div>
        <Callout kind="warn" title="Mod examen">Fără indicii și fără soluții până când termini. Fă task-urile pe sistemul tău Linux; întrebările de mai jos se notează automat.</Callout>
        <h2>Task-uri practice</h2>
        {tasks.map((lab, i) => (
          <div key={lab.id} className="lab-card" style={{ marginBottom: 12 }}>
            <div className="row" style={{ gap: 8 }}><span className="badge accent">Task {i + 1}</span>{lab.objectives.map((o) => <span key={o} className="badge">{o}</span>)}</div>
            <h3 style={{ marginTop: 8 }}>{lab.title}</h3>
            {lab.scenario.map((p, k) => <p key={k}><Rich text={p} /></p>)}
            <p className="small"><b>Condiții inițiale:</b></p><ul className="small">{lab.initialConditions.map((p) => <li key={p}><Rich text={p} /></li>)}</ul>
            <p className="small"><b>Criterii de acceptare:</b></p><ol className="small">{lab.criteria.map((c) => <li key={c.id}><Rich text={c.text} /></li>)}</ol>
          </div>
        ))}
        {qs.length > 0 && <h2>Întrebări (scor automat)</h2>}
        <div className="stack">
          {qs.map((q, i) => <QuestionCard key={q.id} q={q} mode="sim" index={i} total={qs.length} answer={answers[q.id] ?? null} onChange={(a) => setAnswers((x) => ({ ...x, [q.id]: a }))} />)}
        </div>
        <div className="row" style={{ marginTop: 18 }}>
          <button className="btn primary" onClick={() => setPhase('review')}>Termin — arată soluțiile și rezultatele</button>
          <button className="btn ghost" onClick={onExit}>Renunț</button>
          {limit > 0 && elapsed > limit && <span className="badge warn">peste durata estimată</span>}
        </div>
      </div>
    );
  }

  return (
    <ReviewPhase sim={sim} qs={qs} tasks={tasks} answers={answers} autoCorrect={autoCorrect} elapsed={elapsed} selfVersion={selfVersion}
      bump={() => setSelfVersion((v) => v + 1)} saved={saved}
      onSave={(selfChecked, selfTotal) => {
        api.saveSimulation({ simId: sim.id, autoCorrect, autoTotal: qs.length, selfChecked, selfTotal, durationS: elapsed }).then(() => setSaved(true));
      }} onExit={onExit} />
  );
}

function ReviewPhase({ sim, qs, tasks, answers, autoCorrect, elapsed, selfVersion, bump, saved, onSave, onExit }: {
  sim: Simulation; qs: Question[]; tasks: typeof LABS; answers: Record<string, Answer | null>; autoCorrect: number; elapsed: number;
  selfVersion: number; bump: () => void; saved: boolean; onSave: (c: number, t: number) => void; onExit: () => void;
}) {
  const [checks, setChecks] = useState<Record<string, Record<string, boolean>>>({});
  useEffect(() => { api.labChecks().then(setChecks).catch(() => {}); }, [selfVersion]);
  const selfTotal = tasks.reduce((a, l) => a + l.criteria.length, 0);
  const selfChecked = tasks.reduce((a, l) => a + l.criteria.filter((c) => checks[l.id]?.[c.id]).length, 0);
  return (
    <div className="page narrow">
      <h1>{sim.title} — rezultate</h1>
      <div className="grid c2" style={{ marginBottom: 16 }}>
        <div className="card kpi"><span className="l">Scor AUTOMAT (întrebări)</span><span className="v">{autoCorrect} / {qs.length}</span><span className="tiny muted">notat de platformă, doar pentru întrebările cu răspuns în platformă</span></div>
        <div className="card kpi"><span className="l">AUTOEVALUARE declarată (task-uri practice)</span><span className="v">{selfChecked} / {selfTotal}</span><span className="tiny muted">bife puse de tine; nu sunt verificate de platformă</span></div>
      </div>
      <p className="small muted">Cele două rezultate nu se adună și nu formează un scor general: un scor la întrebări nu dovedește că un sistem a fost configurat corect.</p>
      <div className="row" style={{ marginBottom: 16 }}>
        <span className="badge">durată: {fmtDuration(elapsed)}</span>
        <button className="btn primary" disabled={saved} onClick={() => onSave(selfChecked, selfTotal)}>{saved ? 'Salvat local ✓' : 'Salvează rezultatul (local)'}</button>
        <button className="btn ghost" onClick={onExit}>Închide</button>
      </div>
      <h2>Task-uri practice — soluții și autoevaluare</h2>
      {tasks.map((lab) => (
        <div key={lab.id} style={{ marginBottom: 20 }}>
          <LabView lab={lab} anchor={false} onSelfChange={bump} />
        </div>
      ))}
      {qs.length > 0 && <h2>Întrebări — explicații</h2>}
      <div className="stack">{qs.map((q, i) => <QuestionCard key={q.id} q={q} mode="review" index={i} total={qs.length} answer={answers[q.id] ?? null} />)}</div>
    </div>
  );
}
