import { useState } from 'react';
import { questionsForTopic } from '../data/questions';
import { QuestionCard } from './QuestionCard';
import { api } from '../lib/api';
import { recordQuestionResult } from '../lib/srs';
import { useStore } from '../lib/store';
import { Link } from 'react-router-dom';

/** Toate întrebările unei lecții, în modul antrenament. Scor AUTOMAT (doar pentru întrebările din platformă). */
export function TopicQuestions({ topicId }: { topicId: string }) {
  const list = questionsForTopic(topicId);
  const [i, setI] = useState(0);
  const [results, setResults] = useState<Record<string, boolean>>({});
  const { bumpStats } = useStore();
  const q = list[Math.min(i, list.length - 1)];
  return (
    <div>
      <div className="row" style={{ marginBottom: 14 }}>
        <span className="badge">{list.length} întrebări în bancă</span>
        <span className="spacer" />
        <Link className="btn sm" to={`/antrenament?topic=${topicId}`}>Deschide în Antrenament →</Link>
      </div>
      <div className="dots-nav" style={{ marginBottom: 14 }}>
        {list.map((x, k) => (
          <button key={x.id} className={`${k === i ? 'cur' : ''} ${results[x.id] === true ? 'ok' : results[x.id] === false ? 'bad' : ''}`} onClick={() => setI(k)} aria-label={`Întrebarea ${k + 1}`}>{k + 1}</button>
        ))}
      </div>
      {q && (
        <QuestionCard key={q.id} q={q} mode="train" index={i} total={list.length}
          onGraded={(ok, a, onlyReveal) => {
            setResults((r) => ({ ...r, [q.id]: ok }));
            api.attempt({ questionId: q.id, topicId, mode: 'train', correct: ok, answer: onlyReveal ? { revealed: true } : a }).then(bumpStats).catch(() => {});
            recordQuestionResult(q.id, ok).catch(() => {});
          }}
          onNext={i < list.length - 1 ? () => setI(i + 1) : undefined} />
      )}
      <div className="row muted small" style={{ marginTop: 10 }}>
        Răspunse: {Object.keys(results).length} · corecte: {Object.values(results).filter(Boolean).length}
      </div>
    </div>
  );
}
