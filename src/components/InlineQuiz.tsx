import { useState } from 'react';
import { questionById } from '../data/questions';
import { QuestionCard } from './QuestionCard';
import { api } from '../lib/api';
import { recordQuestionResult } from '../lib/srs';
import { useStore } from '../lib/store';

/** Mini-test la finalul unei secțiuni teoretice (mod antrenament: Verifică / Arată răspunsul). */
export function InlineQuiz({ ids, title = 'Verifică-te' }: { ids: string[]; title?: string }) {
  const [i, setI] = useState(0);
  const [score, setScore] = useState<boolean[]>([]);
  const { bumpStats } = useStore();
  const qs = ids.map((id) => questionById.get(id)).filter(Boolean) as NonNullable<ReturnType<typeof questionById.get>>[];
  if (!qs.length) return null;
  const done = i >= qs.length;
  return (
    <div className="card no-print" style={{ marginTop: 22, background: 'var(--surface)' }}>
      <div className="row between" style={{ marginBottom: 12 }}>
        <h3 style={{ margin: 0 }}>{title}</h3>
        <span className="badge accent">{Math.min(i + 1, qs.length)} / {qs.length}</span>
      </div>
      {!done ? (
        <QuestionCard key={qs[i].id} q={qs[i]} mode="train" index={i} total={qs.length}
          nextLabel={i === qs.length - 1 ? 'Termină' : 'Următoarea'}
          onGraded={(ok, a, onlyReveal) => {
            setScore((s) => [...s, ok]);
            api.attempt({ questionId: qs[i].id, topicId: qs[i].topicId, mode: 'inline', correct: ok, answer: onlyReveal ? { revealed: true } : a }).then(bumpStats).catch(() => {});
            recordQuestionResult(qs[i].id, ok).catch(() => {});
          }}
          onNext={() => setI(i + 1)} />
      ) : (
        <div className="row between">
          <span><b>{score.filter(Boolean).length} / {qs.length}</b> corecte. {score.every(Boolean) ? 'Excelent — poți merge mai departe.' : 'Întrebările greșite revin automat la Repetare.'}</span>
          <button className="btn sm" onClick={() => { setI(0); setScore([]); }}>Reia</button>
        </div>
      )}
    </div>
  );
}
