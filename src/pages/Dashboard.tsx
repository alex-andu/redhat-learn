import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CHAPTERS, EXAM_VERSION, chapterColor, lessonById } from '../data/curriculum';
import { api, type Stats } from '../lib/api';
import { useStore } from '../lib/store';
import { topicProgress, TOPIC_SECTIONS, AVAILABLE, TOPICS } from '../content/registry';
import { Icon } from '../components/Icon';
import { useDueCount } from '../lib/useDue';
import { questionsForTopic } from '../data/questions';
import { localDay } from '../lib/day';

export function Dashboard() {
  const { progress, settings, statsVersion } = useStore();
  const [stats, setStats] = useState<Stats | null>(null);
  const due = useDueCount();
  useEffect(() => { api.stats().then(setStats).catch(() => {}); }, [statsVersion]);

  const goal = Number(settings.dailyGoal ?? 20);
  const todayQ = stats?.today?.questions ?? 0;
  const acc = stats && stats.totals.total ? Math.round((stats.totals.correct / stats.totals.total) * 100) : null;
  const minutesTotal = stats?.days.reduce((a, d) => a + d.minutes, 0) ?? 0;

  const chapterPct = (cid: string) => {
    const ls = CHAPTERS.find((x) => x.id === cid)!.lessons;
    return ls.reduce((a, l) => a + topicProgress(l.id, progress[l.id]), 0) / ls.length;
  };
  const cur = TOPICS.find((t) => topicProgress(t.id, progress[t.id]) < 1) ?? TOPICS[0];
  const curLesson = lessonById(cur.id)!;
  const curP = topicProgress(cur.id, progress[cur.id]);
  const next = TOPIC_SECTIONS[cur.id].find((x) => !progress[cur.id]?.has(x.id));

  // heatmap ultimele 84 de zile
  const byDay = new Map(stats?.days.map((d) => [d.day, d]) ?? []);
  const cells = Array.from({ length: 84 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (83 - i));
    const key = localDay(d); const v = byDay.get(key);
    const score = v ? v.questions + v.minutes : 0;
    const lvl = score === 0 ? 0 : score < 5 ? 1 : score < 15 ? 2 : score < 30 ? 3 : 4;
    return { key, lvl, v };
  });

  const perTopic = stats?.perTopic ?? [];
  return (
    <div className="page">
      <div className="row between" style={{ marginBottom: 20 }}>
        <div>
          <h1 style={{ marginBottom: 4 }}>Bine ai revenit 👋</h1>
          <div className="muted">Pregătire {EXAM_VERSION} · progres salvat local, în acest browser</div>
        </div>
        <Link to="/antrenament" className="btn primary"><Icon name="play" />Începe antrenamentul</Link>
      </div>

      <div className="grid c4" style={{ marginBottom: 16 }}>
        <div className="card kpi"><span className="l"><Icon name="flame" size={14} /> Streak</span><span className="v">{stats?.streak ?? 0} zile</span><span className="tiny muted">record: {stats?.bestStreak ?? 0}</span></div>
        <div className="card kpi"><span className="l"><Icon name="target" size={14} /> Obiectiv azi</span><span className="v">{todayQ}/{goal}</span>
          <div className="progress"><span style={{ width: `${Math.min(100, (todayQ / goal) * 100)}%` }} /></div></div>
        <div className="card kpi"><span className="l"><Icon name="check" size={14} /> Acuratețe totală</span><span className="v">{acc == null ? '—' : `${acc}%`}</span><span className="tiny muted">{stats?.totals.total ?? 0} răspunsuri</span></div>
        <div className="card kpi"><span className="l"><Icon name="clock" size={14} /> Timp de studiu</span><span className="v">{Math.floor(minutesTotal / 60)}h {minutesTotal % 60}m</span><span className="tiny muted">azi: {stats?.today?.minutes ?? 0} min</span></div>
      </div>

      <div className="grid c2" style={{ marginBottom: 16 }}>
        <div className="card">
          <div className="row between"><h3 style={{ margin: 0 }}>Continuă de unde ai rămas</h3><span className="badge accent">pilot C1</span></div>
          <p className="muted small" style={{ marginTop: 8 }}>{curLesson.id} — {curLesson.title}</p>
          <div className="progress" style={{ margin: '10px 0 8px' }}><span style={{ width: `${curP * 100}%` }} /></div>
          <div className="row between small"><span className="muted">{Math.round(curP * 100)}% parcurs</span>
            <Link className="btn sm primary" to={`/lectie/${cur.id}${next ? '#' + next.id : ''}`}>{next ? `Continuă: ${next.label}` : 'Recapitulează'} →</Link></div>
        </div>
        <div className="card">
          <div className="row between"><h3 style={{ margin: 0 }}>Repetare programată</h3><Icon name="repeat" /></div>
          <p className="muted small" style={{ marginTop: 8 }}>Întrebările greșite și flashcard-urile revin la intervale calculate de FSRS, exact înainte să le uiți.</p>
          <div className="row between"><span className="kpi"><span className="v">{due}</span><span className="l">carduri scadente acum</span></span>
            <Link className="btn sm" to="/repetare">Repetă acum →</Link></div>
        </div>
      </div>

      <div className="grid c2">
        <div className="card">
          <h3>Progres de lectură pe capitole</h3>
          <div className="stack">
            {CHAPTERS.map((c) => (
              <div key={c.id}>
                <div className="row between small"><span><b style={{ color: chapterColor(c.id) }}>{c.id}</b> {c.category?.title ?? c.title}</span><span className="muted">{Math.round(chapterPct(c.id) * 100)}%</span></div>
                <div className="progress" style={{ marginTop: 6 }}><span style={{ width: `${chapterPct(c.id) * 100}%`, background: chapterColor(c.id) }} /></div>
              </div>
            ))}
          </div>
          <p className="tiny muted" style={{ marginTop: 12 }}>Lecții cu conținut: {[...AVAILABLE].join(', ')} · restul se adaugă lecție cu lecție. Progresul măsoară secțiunile parcurse, nu abilitatea practică.</p>
        </div>
        <div className="stack">
          <div className="card">
            <h3>Activitate (ultimele 12 săptămâni)</h3>
            <div className="heat">{cells.map((c) => <i key={c.key} className={`l${c.lvl}`} title={`${c.key}: ${c.v?.questions ?? 0} întrebări, ${c.v?.minutes ?? 0} min`} />)}</div>
          </div>
          <div className="card">
            <h3>Quiz automat pe lecții</h3>
            {perTopic.length === 0 ? <p className="muted small">Încă nu ai răspuns la întrebări.</p> : perTopic.map((t) => {
              const pct = Math.round((t.correct / t.total) * 100);
              return (
                <div key={t.topicId} className="row between small" style={{ padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                  <span><b>{t.topicId}</b> <span className="muted">({questionsForTopic(t.topicId).length} în bancă)</span></span>
                  <span><span className={`badge ${pct >= 85 ? 'ok' : pct >= 65 ? 'warn' : 'bad'}`}>{pct}%</span> <span className="muted">{t.correct}/{t.total}</span></span>
                </div>
              );
            })}
            {stats?.exams.length ? (<>
              <h4>Ultimele sesiuni de simulare de întrebări</h4>
              {stats.exams.slice(0, 5).map((e) => (
                <div key={e.id} className="row between small" style={{ padding: '4px 0' }}>
                  <span className="muted">{new Date(e.ts).toLocaleString('ro-RO', { dateStyle: 'short', timeStyle: 'short' })}</span>
                  <span>{e.correct}/{e.total} · {Math.round((e.correct / e.total) * 100)}%</span>
                </div>
              ))}
            </>) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
