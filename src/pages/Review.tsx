import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, type SrsRow } from '../lib/api';
import { gradeCard, Rating } from '../lib/srs';
import { questionById } from '../data/questions';
import { QuestionCard } from '../components/QuestionCard';
import { useStore } from '../lib/store';
import { Icon } from '../components/Icon';

export function Review() {
  const { bumpStats } = useStore();
  const [rows, setRows] = useState<SrsRow[] | null>(null);
  const [i, setI] = useState(0);
  const [done, setDone] = useState(0);
  useEffect(() => { api.srsCards().then(setRows).catch(() => setRows([])); }, []);
  if (!rows) return <div className="page narrow"><p className="muted">Se încarcă…</p></div>;
  const now = new Date();
  const dueQ = rows.filter((r) => r.kind === 'question' && new Date(r.card.due) <= now && questionById.has(r.ref))
    .sort((a, b) => +new Date(a.card.due) - +new Date(b.card.due));
  const dueF = rows.filter((r) => r.kind === 'flash' && new Date(r.card.due) <= now).length;
  const upcoming = rows.filter((r) => new Date(r.card.due) > now).sort((a, b) => +new Date(a.card.due) - +new Date(b.card.due)).slice(0, 1)[0];
  const cur = dueQ[i];
  return (
    <div className="page narrow">
      <h1>Repetare programată</h1>
      <p className="muted">Algoritmul <b>FSRS</b> calculează pentru fiecare întrebare greșită momentul optim în care să revină (retenție-țintă 90%). Răspunzi corect → intervalul crește; greșești → revine curând.</p>
      <div className="grid c3" style={{ margin: '16px 0' }}>
        <div className="card kpi"><span className="l">Întrebări scadente</span><span className="v">{Math.max(0, dueQ.length - i)}</span></div>
        <div className="card kpi"><span className="l">Flashcards scadente</span><span className="v">{dueF}</span><Link to="/flashcards" className="small">deschide →</Link></div>
        <div className="card kpi"><span className="l">În sistem</span><span className="v">{rows.length}</span><span className="tiny muted">{upcoming ? `următorul: ${new Date(upcoming.card.due).toLocaleString('ro-RO', { dateStyle: 'short', timeStyle: 'short' })}` : ''}</span></div>
      </div>
      {cur ? (
        <QuestionCard key={cur.id + i} q={questionById.get(cur.ref)!} mode="train" index={i} total={dueQ.length}
          onGraded={(ok, a, onlyReveal) => {
            api.attempt({ questionId: cur.ref, topicId: questionById.get(cur.ref)!.topicId, mode: 'review', correct: ok, answer: onlyReveal ? { revealed: true } : a }).catch(() => {});
            gradeCard(cur.id, 'question', cur.ref, cur.card, ok ? Rating.Good : Rating.Again).then(bumpStats).catch(() => {});
            setDone((d) => d + 1);
          }}
          onNext={() => setI(i + 1)} />
      ) : (
        <div className="card center">
          <Icon name="check" size={28} />
          <h3>{done ? `Gata! Ai repetat ${done} întrebări.` : 'Nimic de repetat acum.'}</h3>
          <p className="muted">Întrebările greșite din lecții și din antrenament apar aici automat la momentul potrivit.</p>
          <div className="row" style={{ justifyContent: 'center' }}><Link className="btn primary" to="/antrenament">Mergi la antrenament</Link><Link className="btn" to="/flashcards">Flashcards</Link></div>
        </div>
      )}
    </div>
  );
}
