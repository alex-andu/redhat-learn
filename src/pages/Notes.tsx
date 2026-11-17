import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { lessonById } from '../data/curriculum';
import { useStore } from '../lib/store';

export function Notes() {
  const [notes, setNotes] = useState<{ topicId: string; body: string; updated: string }[]>([]);
  const { bookmarks } = useStore();
  useEffect(() => { api.notes().then(setNotes).catch(() => {}); }, []);
  return (
    <div className="page narrow">
      <h1>Notițe & bookmark-uri</h1>
      <h3>Bookmark-uri</h3>
      {bookmarks.size === 0 ? <p className="muted small">Niciun bookmark. Folosește butonul „Bookmark” din pagina unei lecții.</p> : (
        <div className="stack">{[...bookmarks].map((t) => <Link key={t} className="card" to={`/lectie/${t}`}><b className="mono" style={{ color: 'var(--accent)' }}>{t}</b> {lessonById(t)?.title}</Link>)}</div>
      )}
      <h3>Notițe</h3>
      {notes.length === 0 ? <p className="muted small">Nicio notiță încă. Le scrii la finalul fiecărui topic.</p> : (
        <div className="stack">{notes.map((n) => (
          <div key={n.topicId} className="card">
            <div className="row between"><Link to={`/lectie/${n.topicId}#notes`}><b className="mono">{n.topicId}</b> {lessonById(n.topicId)?.title}</Link>
              <span className="tiny muted">{new Date(n.updated).toLocaleString('ro-RO', { dateStyle: 'short', timeStyle: 'short' })}</span></div>
            <p className="small" style={{ whiteSpace: 'pre-wrap', marginTop: 10, marginBottom: 0 }}>{n.body}</p>
          </div>
        ))}</div>
      )}
    </div>
  );
}
