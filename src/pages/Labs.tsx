import { Link } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { LABS } from '../content/labs';
import { LabView } from '../components/LabView';
import { Callout } from '../components/Lesson';

/** Indexul laboratoarelor + vizualizare individuală. Laboratoarele sunt conținut educațional, nu infrastructură (D-007). */
export function Labs() {
  const { labId } = useParams();
  const lab = labId ? LABS.find((l) => l.id === labId) : undefined;
  if (labId) {
    return (
      <div className="page narrow">
        <div className="crumbs"><Link to="/laboratoare">Laboratoare</Link><span>›</span><span>{labId}</span></div>
        {lab ? <LabView lab={lab} anchor={false} /> : <p>Laborator inexistent.</p>}
      </div>
    );
  }
  return (
    <div className="page narrow">
      <h1>Laboratoare</h1>
      <Callout kind="info" title="Laboratoare = conținut educațional">
        Fiecare laborator are un scenariu, criterii de acceptare și o soluție explicată. Le rulezi <b>tu, pe propriul sistem Linux</b>. Platforma nu pornește mașini virtuale, nu folosește SSH și nu verifică starea sistemului tău;
        bifele sunt <b>autoevaluare declarată de tine</b>. Moduri: <b>Guided Lab</b> (pași dezvăluiți progresiv, indicii, reflecție) și <b>Independent Lab</b> (doar scenariul; soluția la cerere). Simulările cu task-uri multiple sunt la <Link to="/simulari">Simulări</Link>.
      </Callout>
      {LABS.length === 0 ? <p className="muted">Încă niciun laborator.</p> : (
        <div className="stack">
          {LABS.map((l) => (
            <Link key={l.id} to={`/laboratoare/${l.id}`} className="card">
              <div className="row between"><b>{l.title}</b><span className="badge">≈{l.estimatedMinutes} min</span></div>
              <div className="chip-row" style={{ marginTop: 8 }}>
                <span className="badge">{l.lessonId}</span>
                {l.modes.map((m) => <span key={m} className="badge accent">{m === 'guided' ? 'Guided Lab' : 'Independent Lab'}</span>)}
                {l.objectives.map((o) => <span key={o} className="badge">{o}</span>)}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
