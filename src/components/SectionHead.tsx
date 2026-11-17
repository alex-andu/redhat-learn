import { useParams } from 'react-router-dom';
import { useStore } from '../lib/store';

export function SectionHead({ id, code, title }: { id: string; code: string; title: string }) {
  const { topicId = '1.11' } = useParams();
  const { isDone, setDone } = useStore();
  const done = isDone(topicId, id);
  return (
    <div className="section-head">
      <span className="section-code">{code}</span>
      <h2>{title}</h2>
      <span className="spacer" />
      <label className="check no-print">
        <input type="checkbox" checked={done} onChange={(e) => setDone(topicId, id, e.target.checked)} />
        {done ? 'parcurs ✓' : 'marchează ca parcurs'}
      </label>
    </div>
  );
}
