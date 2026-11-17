import { useEffect, useState } from 'react';
import type { Lab } from '../lab/types';
import { api } from '../lib/api';
import { CodeBlock } from './CodeBlock';
import { Rich } from './Rich';
import { Callout, Detailed, Reveal, Summary } from './Lesson';
import { SectionHead } from './SectionHead';
import { lessonById, objectiveById } from '../data/curriculum';

const DIFF = ['', 'ușor', 'mediu', 'greu'];

/** Lista criteriilor de acceptare, cu bife de AUTOEVALUARE. Platforma nu verifică nimic: bifa înseamnă „am verificat eu”. */
export function SelfAssessment({ lab, onChange }: { lab: Lab; onChange?: () => void }) {
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  useEffect(() => { api.labChecks().then((all) => setChecks(all[lab.id] ?? {})).catch(() => {}); }, [lab.id]);
  const toggle = (cid: string, v: boolean) => {
    setChecks((c) => ({ ...c, [cid]: v }));
    api.setLabCheck(lab.id, cid, v).then(() => onChange?.()).catch(() => {});
  };
  const n = lab.criteria.filter((c) => checks[c.id]).length;
  return (
    <div className="selfeval">
      <div className="row between">
        <span className="tag">Autoevaluare — declarată de tine</span>
        <span className="badge">{n} / {lab.criteria.length} declarate</span>
      </div>
      <p className="small muted" style={{ margin: '6px 0 8px' }}>
        Rulează comenzile de verificare <b>pe propriul tău sistem Linux</b>, apoi bifează. Platforma nu se conectează la niciun sistem și <b>nu verifică</b> starea lui;
        bifele sunt doar o evidență personală și nu se amestecă cu scorurile quiz-urilor.
      </p>
      {lab.criteria.map((c, i) => (
        <label key={c.id} className="ac-item">
          <input type="checkbox" checked={!!checks[c.id]} onChange={(e) => toggle(c.id, e.target.checked)} />
          <span>
            <b>{i + 1}.</b> <Rich text={c.text} />
            <span className="small muted" style={{ display: 'block' }}>Verificare manuală (o rulezi tu): <code>{c.manualCheck}</code></span>
          </span>
        </label>
      ))}
    </div>
  );
}

function Solution({ lab, guided }: { lab: Lab; guided: boolean }) {
  const [shown, setShown] = useState(guided ? 1 : lab.steps.length);
  useEffect(() => setShown(guided ? 1 : lab.steps.length), [guided, lab.id, lab.steps.length]);
  return (
    <>
      {lab.steps.slice(0, shown).map((s, i) => (
        <div key={i} className="lab-step">
          <div className="sn">{i + 1}</div>
          <div style={{ minWidth: 0 }}>
            <h4 style={{ marginTop: 0 }}>{s.title}</h4>
            {guided && s.hint && <Callout kind="tip" title="Indiciu"><Rich text={s.hint} /></Callout>}
            <p><b>Scop: </b><Rich text={s.purpose} /></p>
            <CodeBlock title="comenzi (le rulezi tu, manual)" code={s.commands} explain={s.explain.map(([c, e]) => [c, <Rich key={c} text={e} />])} />
            {s.output && (
              <>
                <CodeBlock title="output" kind="session" code={s.output.code} label={s.output.label} />
                <p className="small"><Rich text={s.output.explain} /></p>
              </>
            )}
            {guided && s.reflect && <Callout kind="info" title="Reflecție"><Rich text={s.reflect} /></Callout>}
          </div>
        </div>
      ))}
      {guided && shown < lab.steps.length && (
        <button className="btn primary" onClick={() => setShown(shown + 1)}>Arată pasul următor ({shown + 1} / {lab.steps.length})</button>
      )}
      {shown >= lab.steps.length && (
        <>
          <h4>Verificare manuală</h4>
          <ul>{lab.verification.map((v) => <li key={v.cmd}><code>{v.cmd}</code> — <Rich text={v.expected} /></li>)}</ul>
          <h4>Persistență după reboot</h4>
          <ul>{lab.persistence.map((p) => <li key={p}><Rich text={p} /></li>)}</ul>
          <h4>Greșeli frecvente</h4>
          <ul>{lab.mistakes.map((p) => <li key={p}><Rich text={p} /></li>)}</ul>
          <h4>Troubleshooting</h4>
          <div className="table-wrap"><table className="t">
            <thead><tr><th>Simptom</th><th>Cauză probabilă</th><th>Remediere</th></tr></thead>
            <tbody>{lab.troubleshooting.map((t) => <tr key={t.symptom}><td><Rich text={t.symptom} /></td><td><Rich text={t.cause} /></td><td><Rich text={t.fix} /></td></tr>)}</tbody>
          </table></div>
          {lab.alternatives.length > 0 && (<><h4>Alternative valide</h4><ul>{lab.alternatives.map((p) => <li key={p}><Rich text={p} /></li>)}</ul></>)}
        </>
      )}
    </>
  );
}

/** Un laborator în modurile Guided Lab / Independent Lab (aceeași sursă de conținut). */
export function LabView({ lab, anchor = true, onSelfChange }: { lab: Lab; anchor?: boolean; onSelfChange?: () => void }) {
  const [mode, setMode] = useState<'guided' | 'independent'>(lab.modes[0]);
  return (
    <section id={anchor ? `lab-${lab.id}` : undefined} className="section">
      {anchor && <SectionHead id={`lab-${lab.id}`} code="LAB" title={lab.title} />}
      <div className="chip-row" style={{ marginBottom: 12 }}>
        <span className="badge">{lab.lessonId}</span>
        <span className="badge">⏱ ≈{lab.estimatedMinutes} min</span>
        <span className="badge">{DIFF[lab.difficulty]}</span>
        {lab.objectives.map((o) => <span key={o} className="badge accent" title={objectiveById(o)?.text}>{o}</span>)}
      </div>
      <div className="segmented" style={{ width: 'fit-content', marginBottom: 12 }} role="tablist" aria-label="Mod laborator">
        {lab.modes.includes('guided') && <button className={mode === 'guided' ? 'on' : ''} onClick={() => setMode('guided')}>Guided Lab</button>}
        {lab.modes.includes('independent') && <button className={mode === 'independent' ? 'on' : ''} onClick={() => setMode('independent')}>Independent Lab</button>}
      </div>
      <Callout kind="info" title="Cum se folosește">
        Laboratorul este un exercițiu pe care îl faci <b>tu, pe propriul sistem RHEL 10</b> (sau compatibil). Această platformă nu pornește mașini virtuale, nu se conectează prin SSH și nu verifică sistemul tău;
        comenzile de mai jos le rulezi manual.
      </Callout>
      <Summary>
        <p><b>Scenariu.</b></p>
        {lab.scenario.map((p, i) => <p key={i}><Rich text={p} /></p>)}
        <p><b>Condiții inițiale</b> (descrise; nu sunt create de platformă):</p>
        <ul>{lab.initialConditions.map((p) => <li key={p}><Rich text={p} /></li>)}</ul>
        <p><b>Starea finală așteptată:</b></p>
        <ul>{lab.finalState.map((p) => <li key={p}><Rich text={p} /></li>)}</ul>
      </Summary>
      <SelfAssessment lab={lab} onChange={onSelfChange} />
      {mode === 'guided' ? (
        <Detailed title="Soluție ghidată — pas cu pas"><Solution lab={lab} guided /></Detailed>
      ) : (
        <Reveal label="Arată soluția completă (încearcă întâi singur)"><Solution lab={lab} guided={false} /></Reveal>
      )}
      <p className="small muted">Lecția: {lessonById(lab.lessonId)?.title}</p>
    </section>
  );
}
