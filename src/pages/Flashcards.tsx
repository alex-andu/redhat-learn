import { useEffect, useMemo, useState } from 'react';
import { FLASHCARDS, type Flashcard } from '../data/flashcards';
import { api, type SrsRow } from '../lib/api';
import { gradeCard, previewIntervals, Rating } from '../lib/srs';
import { useStore } from '../lib/store';
import { shuffle } from '../lib/grade';
import { Rich } from '../components/Rich';

export function Flashcards() {
  const { bumpStats, settings } = useStore();
  const [rows, setRows] = useState<Map<string, SrsRow> | null>(null);
  const [deck, setDeck] = useState<'all' | 'fact' | 'term'>('all');
  const [queue, setQueue] = useState<Flashcard[] | null>(null);
  const [flip, setFlip] = useState(false);
  const [reviewed, setReviewed] = useState(0);
  const newLimit = Number(settings.newCardsPerDay ?? 20);

  useEffect(() => { api.srsCards('flash').then((r) => setRows(new Map(r.map((x) => [x.ref, x])))).catch(() => setRows(new Map())); }, []);

  const stats = useMemo(() => {
    if (!rows) return { due: 0, fresh: 0, learned: 0 };
    const cards = FLASHCARDS.filter((c) => deck === 'all' || c.kind === deck);
    const now = new Date();
    return {
      due: cards.filter((c) => rows.has(c.id) && new Date(rows.get(c.id)!.card.due) <= now).length,
      fresh: cards.filter((c) => !rows.has(c.id)).length,
      learned: cards.filter((c) => rows.has(c.id)).length,
    };
  }, [rows, deck]);

  const start = () => {
    if (!rows) return;
    const now = new Date();
    const cards = FLASHCARDS.filter((c) => deck === 'all' || c.kind === deck);
    const due = cards.filter((c) => rows.has(c.id) && new Date(rows.get(c.id)!.card.due) <= now);
    const fresh = shuffle(cards.filter((c) => !rows.has(c.id))).slice(0, newLimit);
    setQueue([...shuffle(due), ...fresh]); setFlip(false); setReviewed(0);
  };

  if (!rows) return <div className="page narrow"><p className="muted">Se încarcă…</p></div>;
  const card = queue?.[0];
  const existing = card ? rows.get(card.id)?.card ?? null : null;
  const iv = card ? previewIntervals(existing) : null;

  const grade = async (g: Rating.Again | Rating.Hard | Rating.Good | Rating.Easy) => {
    if (!card) return;
    const next = await gradeCard(`f:${card.id}`, 'flash', card.id, existing, g).catch(() => null);
    if (next) setRows((m) => new Map(m!).set(card.id, { id: `f:${card.id}`, kind: 'flash', ref: card.id, card: next, due: String(next.due), updated: '' }));
    setReviewed((r) => r + 1); bumpStats();
    setQueue((q) => { const rest = q!.slice(1); return g === Rating.Again ? [...rest, card] : rest; });
    setFlip(false);
  };

  return (
    <div className="page narrow">
      <h1>Flashcards</h1>
      <p className="muted">Termeni și concepte de reținut. Programate cu FSRS: le vezi exact când sunt pe cale să fie uitate.</p>
      {!queue || !card ? (
        <div className="card stack">
          <div className="segmented">
            {([['all', 'Toate'], ['term', 'Termeni']] as const).map(([k, l]) => <button key={k} className={deck === k ? 'on' : ''} onClick={() => setDeck(k)}>{l}</button>)}
          </div>
          <div className="grid c3">
            <div className="kpi"><span className="v">{stats.due}</span><span className="l">scadente</span></div>
            <div className="kpi"><span className="v">{Math.min(stats.fresh, newLimit)}</span><span className="l">noi azi (din {stats.fresh})</span></div>
            <div className="kpi"><span className="v">{stats.learned}</span><span className="l">în învățare</span></div>
          </div>
          {queue && !card && <div className="callout tip"><div>Sesiune terminată: {reviewed} carduri repetate.</div></div>}
          <button className="btn primary" onClick={start} disabled={stats.due + stats.fresh === 0}>Începe sesiunea</button>
        </div>
      ) : (
        <>
          <div className="row between small muted" style={{ marginBottom: 10 }}><span>rămase: {queue.length}</span><span>repetate: {reviewed}</span></div>
          <div className="flash" onClick={() => setFlip(!flip)}>
            <div className={`flash-inner ${flip ? 'flipped' : ''}`}>
              <div className="flash-face"><span className="badge" style={{ marginBottom: 14 }}>{card.kind === 'fact' ? 'fapt' : 'termen'} · {card.topicId}</span><div className="big">{card.front}</div><div className="small muted" style={{ marginTop: 16 }}>atinge pentru a întoarce</div></div>
              <div className="flash-face back"><div className="big" style={{ fontSize: '1.3rem' }}>{card.back}</div>{card.detail && <div className="small muted" style={{ marginTop: 12, maxWidth: 520 }}><Rich text={card.detail} /></div>}</div>
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            {flip ? (
              <div className="grade-row">
                <button className="btn" onClick={() => grade(Rating.Again)} style={{ color: 'var(--bad)' }}>Din nou<small>{iv![Rating.Again]}</small></button>
                <button className="btn" onClick={() => grade(Rating.Hard)}>Greu<small>{iv![Rating.Hard]}</small></button>
                <button className="btn" onClick={() => grade(Rating.Good)} style={{ color: 'var(--ok)' }}>Bine<small>{iv![Rating.Good]}</small></button>
                <button className="btn" onClick={() => grade(Rating.Easy)} style={{ color: 'var(--accent)' }}>Ușor<small>{iv![Rating.Easy]}</small></button>
              </div>
            ) : <button className="btn primary" style={{ width: '100%' }} onClick={() => setFlip(true)}>Arată răspunsul</button>}
          </div>
        </>
      )}
    </div>
  );
}
