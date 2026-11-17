import { useEffect, useRef, useState } from 'react';
import { api } from '../lib/api';

export function NotesPanel({ topicId }: { topicId: string }) {
  const [body, setBody] = useState('');
  const [state, setState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const loaded = useRef(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => { api.note(topicId).then((n) => { setBody(n.body); loaded.current = true; }).catch(() => { loaded.current = true; }); }, [topicId]);
  const onChange = (v: string) => {
    setBody(v); setState('saving');
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => api.saveNote(topicId, v).then(() => setState('saved')).catch(() => setState('error')), 700);
  };
  return (
    <div className="notes-panel">
      <textarea className="input" value={body} onChange={(e) => onChange(e.target.value)} placeholder="Notițele tale pentru acest topic (se salvează automat, local în browser)…" />
      <div className="tiny muted" style={{ marginTop: 6 }}>{state === 'saving' ? 'se salvează…' : state === 'saved' ? 'salvat ✓' : state === 'error' ? 'eroare la salvare (stocare locală indisponibilă?)' : ''}</div>
    </div>
  );
}
