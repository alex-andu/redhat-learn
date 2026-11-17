import { useEffect, useMemo, useState } from 'react';
import type { Answer, Question } from '../lib/types';
import { grade, hashSeed, isAnswered, normCli, shuffle } from '../lib/grade';
import { Rich } from './Rich';
import { Icon } from './Icon';
import { CodeBlock } from './CodeBlock';
import { OutputBadge } from './Lesson';

export type QMode = 'sim' | 'train' | 'fast' | 'review' | 'inline';
const TYPE_LABEL: Record<Question['type'], string> = {
  single: 'Un singur răspuns', multi: 'Mai multe răspunsuri', match: 'Potrivire', order: 'Ordonare pași', cli: 'Completează comanda',
};
const DIFF = ['', 'ușor', 'mediu', 'greu'];
const LETTERS = 'ABCDEFGH';

type Props = {
  q: Question;
  mode: QMode;
  index?: number;
  total?: number;
  /** pentru 'review' (răspuns dat anterior) sau pentru a păstra răspunsul în simulare */
  answer?: Answer | null;
  onChange?: (a: Answer) => void;
  /** apelat o singură dată când răspunsul e evaluat (train/fast/inline) */
  onGraded?: (correct: boolean, a: Answer | null, revealedOnly: boolean) => void;
  onNext?: () => void;
  nextLabel?: string;
  seed?: number;
};

export function QuestionCard({ q, mode, index, total, answer: given, onChange, onGraded, onNext, nextLabel = 'Următoarea', seed }: Props) {
  const s = seed ?? hashSeed(q.id);
  const [answer, setAnswer] = useState<Answer | null>(given ?? initial(q, s));
  const [revealed, setRevealed] = useState(mode === 'review');
  const [revealedOnly, setRevealedOnly] = useState(false);

  useEffect(() => { setAnswer(given ?? initial(q, s)); setRevealed(mode === 'review'); setRevealedOnly(false); /* eslint-disable-next-line */ }, [q.id, mode]);

  const correct = useMemo(() => grade(q, answer), [q, answer]);
  const canInteract = !revealed && mode !== 'review';

  const update = (a: Answer, autoSubmit = false) => {
    setAnswer(a); onChange?.(a);
    if (autoSubmit) submit(a);
  };
  const submit = (a: Answer | null = answer, onlyReveal = false) => {
    if (revealed) return;
    setRevealed(true); setRevealedOnly(onlyReveal);
    onGraded?.(onlyReveal ? false : grade(q, a), a, onlyReveal);
  };

  const fast = mode === 'fast';
  const showActions = mode !== 'review' || !!onNext;

  return (
    <div className="q fade-up">
      <div className="q-meta">
        {index != null && <span className="badge accent">{total ? `${index + 1} / ${total}` : `#${index + 1}`}</span>}
        <span className="badge">{TYPE_LABEL[q.type]}</span>
        <span className="badge">{q.topicId}</span>
        <span className="badge">{DIFF[q.difficulty]}</span>
      </div>
      <div className="q-stem"><Rich text={q.stem} /></div>
      {(q.type === 'single' || q.type === 'multi') && q.snippet && (
        <div style={{ margin: '0 0 14px' }}>
          <div className="row" style={{ gap: 8, marginBottom: 6 }}>
            <span className="badge">{q.snippet.kind === 'find-error' ? 'Găsește greșeala' : 'Interpretează output-ul'}</span>
            {q.snippet.label && <OutputBadge label={q.snippet.label} />}
          </div>
          <CodeBlock title={q.snippet.title} code={q.snippet.code} kind={q.snippet.kind === 'find-error' ? 'config' : 'session'} />
        </div>
      )}

      {(q.type === 'single' || q.type === 'multi') && (
        <Choice q={q} seed={s} answer={answer as any} revealed={revealed} canInteract={canInteract}
          onPick={(id) => {
            const cur = (answer as any)?.selected ?? [];
            if (q.type === 'single') update({ type: 'single', selected: [id] }, fast);
            else {
              const next = cur.includes(id) ? cur.filter((x: string) => x !== id) : [...cur, id];
              const need = q.options.filter((o) => o.correct).length;
              update({ type: 'multi', selected: next }, fast && next.length === need);
            }
          }} />
      )}
      {q.type === 'match' && <Match q={q} seed={s} answer={answer as any} revealed={revealed} canInteract={canInteract} onChange={(a) => update(a)} />}
      {q.type === 'order' && <Order q={q} answer={answer as any} revealed={revealed} canInteract={canInteract} onChange={(a) => update(a)} />}
      {q.type === 'cli' && <Cli q={q} answer={answer as any} revealed={revealed} canInteract={canInteract}
        onChange={(a) => update(a)} onEnter={() => mode !== 'sim' && isAnswered(q, answer) && submit()} />}

      {revealed && mode !== 'sim' && (
        <>
          <div className={`q-verdict ${correct && !revealedOnly ? 'ok' : 'bad'}`}>
            <Icon name={correct && !revealedOnly ? 'check' : 'x'} />
            {revealedOnly ? 'Răspuns afișat (se reia la repetare)' : correct ? 'Corect!' : isAnswered(q, answer) ? 'Greșit' : 'Fără răspuns'}
          </div>
          <div className="q-explain"><b>De ce: </b><Rich text={q.explanation} /></div>
        </>
      )}

      {showActions && (
        <div className="q-actions">
          {mode !== 'sim' && !revealed && (q.type !== 'single' || !fast) && (
            <button className="btn primary" disabled={!isAnswered(q, answer)} onClick={() => submit()}>
              <Icon name="check" />Verifică
            </button>
          )}
          {mode === 'train' && !revealed && (
            <button className="btn" onClick={() => submit(answer, true)}><Icon name="eye" />Arată răspunsul</button>
          )}
          <span className="spacer" />
          {onNext && (mode === 'sim' || revealed) && (
            <button className="btn primary" onClick={onNext}>
              {nextLabel}<Icon name="arrowR" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function initial(q: Question, seed: number): Answer | null {
  if (q.type === 'single' || q.type === 'multi') return { type: q.type, selected: [] };
  if (q.type === 'match') return { type: 'match', placement: {} };
  if (q.type === 'order') {
    let order = shuffle(q.items.map((_, i) => i), seed);
    if (order.every((v, i) => v === i)) order = [...order.slice(1), order[0]];
    return { type: 'order', order };
  }
  return { type: 'cli', text: '' };
}

// ---------- single / multi ----------
function Choice({ q, seed, answer, revealed, canInteract, onPick }: {
  q: Extract<Question, { type: 'single' | 'multi' }>; seed: number; answer: { selected: string[] } | null; revealed: boolean; canInteract: boolean; onPick: (id: string) => void;
}) {
  const opts = useMemo(() => shuffle(q.options, seed), [q.id, seed]);
  const sel = answer?.selected ?? [];
  const need = q.options.filter((o) => o.correct).length;
  return (
    <>
      {q.type === 'multi' && <div className="q-hint">Alege {need} răspunsuri.</div>}
      <div className="opts" role={q.type === 'single' ? 'radiogroup' : 'group'}>
        {opts.map((o, i) => {
          const isSel = sel.includes(o.id);
          const cls = revealed ? (o.correct ? 'right' : isSel ? 'wrong' : '') : isSel ? 'sel' : '';
          return (
            <div key={o.id} className={`opt ${cls}`} aria-disabled={!canInteract} tabIndex={canInteract ? 0 : -1}
              onClick={() => canInteract && onPick(o.id)}
              onKeyDown={(e) => { if (canInteract && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onPick(o.id); } }}
              role={q.type === 'single' ? 'radio' : 'checkbox'} aria-checked={isSel}>
              <span className="letter">{revealed ? (o.correct ? '✓' : isSel ? '✕' : LETTERS[i]) : LETTERS[i]}</span>
              <span><Rich text={o.text} /></span>
              {revealed && (
                <span className="why">
                  {o.correct ? <b className="okc">Corect — </b> : isSel ? <b className="badc">Greșit (ai ales-o) — </b> : <b className="neu">De ce nu — </b>}
                  <Rich text={o.why} />
                </span>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

// ---------- match (drag & drop + tap) ----------
function Match({ q, seed, answer, revealed, canInteract, onChange }: {
  q: Extract<Question, { type: 'match' }>; seed: number; answer: { placement: Record<number, string | null> } | null; revealed: boolean; canInteract: boolean; onChange: (a: Answer) => void;
}) {
  const placement = answer?.placement ?? {};
  const all = useMemo(() => shuffle([...q.pairs.map((p) => p.right), ...(q.distractors ?? []).map((d) => d.text)], seed + 7), [q.id, seed]);
  const used = new Set(Object.values(placement).filter(Boolean) as string[]);
  const pool = all.filter((x) => !used.has(x));
  const [picked, setPicked] = useState<string | null>(null);
  const [over, setOver] = useState<number | null>(null);

  const place = (slot: number, item: string | null) => {
    const next: Record<number, string | null> = { ...placement };
    for (const k of Object.keys(next)) if (next[+k] === item) next[+k] = null;
    next[slot] = item;
    onChange({ type: 'match', placement: next });
    setPicked(null);
  };

  return (
    <>
      <div className="q-hint">Trage fiecare element în căsuța potrivită (sau atinge elementul, apoi căsuța). {q.distractors?.length ? 'Atenție: unele elemente nu se potrivesc nicăieri.' : ''}</div>
      {canInteract && (
        <div className="dnd-pool" onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { const it = e.dataTransfer.getData('text/plain'); const k = Object.keys(placement).find((s) => placement[+s] === it); if (k != null) place(+k, null); }}>
          {pool.length === 0 && <span className="muted small">Toate elementele au fost plasate.</span>}
          {pool.map((it) => (
            <button key={it} type="button" draggable className={`chip ${picked === it ? 'picked' : ''}`}
              onDragStart={(e) => e.dataTransfer.setData('text/plain', it)} onClick={() => setPicked(picked === it ? null : it)}>
              <Rich text={it} />
            </button>
          ))}
        </div>
      )}
      <div className="dnd-rows">
        {(q.leftLabel || q.rightLabel) && <div className="dnd-row tiny muted"><span>{q.leftLabel}</span><span>{q.rightLabel}</span></div>}
        {q.pairs.map((p, i) => {
          const cur = placement[i] ?? null;
          const st = revealed ? (cur === p.right ? 'right' : 'wrong') : over === i ? 'over' : '';
          return (
            <div className="dnd-row" key={i}>
              <div className="dnd-left"><Rich text={p.left} /></div>
              <div className={`dnd-slot ${st}`}
                onDragOver={(e) => { if (!canInteract) return; e.preventDefault(); setOver(i); }}
                onDragLeave={() => setOver(null)}
                onDrop={(e) => { e.preventDefault(); setOver(null); if (canInteract) place(i, e.dataTransfer.getData('text/plain')); }}
                onClick={() => { if (!canInteract) return; if (picked) place(i, picked); else if (cur) place(i, null); }}>
                {cur ? <span className="chip" draggable={canInteract} onDragStart={(e) => e.dataTransfer.setData('text/plain', cur)}><Rich text={cur} /></span>
                  : <span className="muted tiny">{canInteract ? (picked ? 'atinge pentru a plasa' : 'gol') : '—'}</span>}
              </div>
              {revealed && (
                <div className="dnd-why">
                  {cur === p.right ? <b style={{ color: 'var(--ok)' }}>Corect — </b> : <b style={{ color: 'var(--bad)' }}>Corect era „<Rich text={p.right} />” — </b>}
                  <Rich text={p.why} />
                </div>
              )}
            </div>
          );
        })}
      </div>
      {revealed && q.distractors?.length ? (
        <div className="q-explain small">
          <b>Elementele care nu se potriveau nicăieri:</b>
          <ul style={{ marginTop: 6, marginBottom: 0 }}>{q.distractors.map((d) => <li key={d.text}><b><Rich text={d.text} /></b> — <Rich text={d.why} /></li>)}</ul>
        </div>
      ) : null}
    </>
  );
}

// ---------- order ----------
function Order({ q, answer, revealed, canInteract, onChange }: {
  q: Extract<Question, { type: 'order' }>; answer: { order: number[] } | null; revealed: boolean; canInteract: boolean; onChange: (a: Answer) => void;
}) {
  const order = answer?.order ?? q.items.map((_, i) => i);
  const [drag, setDrag] = useState<number | null>(null);
  const move = (from: number, to: number) => {
    if (to < 0 || to >= order.length || from === to) return;
    const next = [...order]; const [x] = next.splice(from, 1); next.splice(to, 0, x);
    onChange({ type: 'order', order: next });
  };
  return (
    <>
      <div className="q-hint">Pune pașii în ordinea corectă (trage sau folosește săgețile).</div>
      <div className="order-list">
        {order.map((itemIdx, pos) => {
          const it = q.items[itemIdx];
          const st = revealed ? (itemIdx === pos ? 'right' : 'wrong') : '';
          return (
            <div key={itemIdx} className={`order-item ${st}`} draggable={canInteract}
              onDragStart={() => setDrag(pos)} onDragOver={(e) => e.preventDefault()}
              onDrop={() => { if (drag != null) move(drag, pos); setDrag(null); }}>
              <span className="n">{pos + 1}</span>
              <span><Rich text={it.text} /></span>
              {canInteract ? (
                <span className="row" style={{ gap: 4 }}>
                  <button type="button" className="icon-btn" aria-label="Mută sus" onClick={() => move(pos, pos - 1)} disabled={pos === 0}>↑</button>
                  <button type="button" className="icon-btn" aria-label="Mută jos" onClick={() => move(pos, pos + 1)} disabled={pos === order.length - 1}>↓</button>
                </span>
              ) : revealed ? <span className="badge">{itemIdx === pos ? '✓' : `corect: ${itemIdx + 1}`}</span> : <span />}
              {revealed && <span className="why"><Rich text={it.why} /></span>}
            </div>
          );
        })}
      </div>
    </>
  );
}

// ---------- cli ----------
function Cli({ q, answer, revealed, canInteract, onChange, onEnter }: {
  q: Extract<Question, { type: 'cli' }>; answer: { text: string } | null; revealed: boolean; canInteract: boolean; onChange: (a: Answer) => void; onEnter: () => void;
}) {
  const text = answer?.text ?? '';
  const matchedWrong = q.wrong.find((w) => normCli(w.text) === normCli(text));
  return (
    <>
      {q.hint && !revealed && <div className="q-hint">Indiciu: {q.hint}</div>}
      <div className="cli-input">
        <span>{q.prompt}</span>
        <input value={text} disabled={!canInteract} spellCheck={false} autoCapitalize="off" autoCorrect="off" autoComplete="off"
          placeholder="scrie comanda…" aria-label="Comanda"
          onChange={(e) => onChange({ type: 'cli', text: e.target.value })}
          onKeyDown={(e) => { if (e.key === 'Enter') onEnter(); }} />
      </div>
      {revealed && (
        <div className="q-explain small">
          <div><b style={{ color: 'var(--ok)' }}>Răspuns corect: </b><code>{q.canonical}</code></div>
          {q.answers.length > 1 && <div className="muted" style={{ marginTop: 4 }}>Acceptate și: {q.answers.filter((a) => a !== q.canonical).map((a) => <code key={a} style={{ marginRight: 6 }}>{a}</code>)}</div>}
          {matchedWrong && <div style={{ marginTop: 8 }}><b style={{ color: 'var(--bad)' }}>Ce ai scris tu (<code>{text}</code>): </b><Rich text={matchedWrong.why} /></div>}
          <div style={{ marginTop: 10 }}><b>Greșeli frecvente și de ce nu sunt corecte:</b>
            <ul style={{ marginTop: 6, marginBottom: 0 }}>{q.wrong.map((w) => <li key={w.text}><code>{w.text}</code> — <Rich text={w.why} /></li>)}</ul>
          </div>
        </div>
      )}
    </>
  );
}
