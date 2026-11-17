import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { lessonById, chapterOf, objectiveById, chapterColor } from '../data/curriculum';
import { TOPIC_MODULES, TOPIC_SECTIONS, topicProgress } from '../content/registry';
import { useStore } from '../lib/store';
import { Icon } from '../components/Icon';
import { TopicQuestions } from '../components/TopicQuestions';
import { SectionHead } from '../components/SectionHead';
import { NotesPanel } from '../components/NotesPanel';
import { LabView } from '../components/LabView';
import { questionsForTopic } from '../data/questions';

function useScrollSpy(ids: string[]) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (vis[0]) setActive(vis[0].target.id);
    }, { rootMargin: '-80px 0px -60% 0px' });
    ids.forEach((id) => { const el = document.getElementById(id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, [ids.join()]);
  return active;
}

function ObjectiveList({ ids }: { ids: string[] }) {
  if (!ids.length) return <p className="small muted" style={{ margin: '10px 0 0' }}>Material de suport — nu acoperă un obiectiv oficial EX200.</p>;
  return (
    <ul className="objective-list">
      {ids.map((id) => <li key={id}><Link className="mono" to={`/obiective#${id}`}>{id}</Link>{objectiveById(id)?.text}</li>)}
    </ul>
  );
}

export function TopicPage() {
  const { topicId = '' } = useParams();
  const lesson = lessonById(topicId);
  const loc = useLocation();
  const { progress, bookmarks, toggleBookmark } = useStore();
  const mod = TOPIC_MODULES[topicId];
  const sections = TOPIC_SECTIONS[topicId] ?? [];
  const active = useScrollSpy(sections.map((s) => s.id));

  useEffect(() => {
    if (!loc.hash) return;
    const t = setTimeout(() => document.getElementById(loc.hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
    return () => clearTimeout(t);
  }, [loc.hash, topicId]);

  if (!lesson) return <div className="page"><h1>Lecție inexistentă</h1><Link to="/curriculum">Înapoi la curriculum</Link></div>;
  const ch = chapterOf(topicId)!;
  const crumbs = (
    <div className="crumbs"><Link to="/curriculum">Curriculum</Link><span>›</span><span>{ch.id} · {ch.category?.title ?? ch.title}</span><span>›</span><span>{lesson.id}</span></div>
  );
  const supportBadge = lesson.kind === 'support'
    ? <span className="badge support-tag">suport / neoficial — nu e obiectiv de examen</span>
    : <span className="badge ok">oficial EX200</span>;

  if (!mod) {
    return (
      <div className="page narrow">
        {crumbs}
        <div className="topic-hero">
          <div className="hero-code" style={{ color: chapterColor(ch.id) }}>{lesson.id}</div>
          <h1 style={{ margin: '6px 0 4px' }}>{lesson.title}</h1>
          <div className="row" style={{ gap: 8 }}>{supportBadge}</div>
          <ObjectiveList ids={[...lesson.objectives, ...lesson.refs]} />
        </div>
        <div className="card center">
          <Icon name="lock" size={28} />
          <h3>Conținut în pregătire</h3>
          <p className="muted">Lecția este în harta curriculumului, dar nu este încă scrisă. Lecțiile se scriu pe rând (o lecție pe sesiune) și se publică doar după review-ul proprietarului. Între timp îți poți lua notițe.</p>
        </div>
        <h3>Notițele mele</h3>
        <NotesPanel topicId={topicId} />
      </div>
    );
  }

  const pct = Math.round(topicProgress(topicId, progress[topicId]) * 100);
  const nq = questionsForTopic(topicId).length;
  return (
    <div className="page">
      <div className="lesson-layout">
        <div style={{ minWidth: 0 }}>
          {crumbs}
          <div className="topic-hero">
            <div className="row between">
              <span className="hero-code" style={{ color: chapterColor(ch.id) }}>{lesson.id} · {ch.id} {ch.category?.title ?? ch.title}</span>
              <button className={`btn sm ${bookmarks.has(topicId) ? 'primary' : ''}`} onClick={() => toggleBookmark(topicId)}>
                <Icon name="bookmark" size={15} />{bookmarks.has(topicId) ? 'Salvat' : 'Bookmark'}
              </button>
            </div>
            <h1 style={{ margin: '8px 0 6px' }}>{lesson.title}</h1>
            <div className="muted">{mod.subtitle}</div>
            <div className="row" style={{ gap: 8, marginTop: 10 }}>{supportBadge}</div>
            <ObjectiveList ids={[...lesson.objectives, ...lesson.refs]} />
            <div className="row" style={{ marginTop: 16, gap: 14 }}>
              <span className="badge">⏱ {mod.studyTime}</span>
              <span className="badge">{nq} întrebări</span>
              <span className="badge">{mod.labs.length} {mod.labs.length === 1 ? 'laborator' : 'laboratoare'}</span>
              <span className="badge accent">{pct}% parcurs</span>
            </div>
            <div className="progress" style={{ marginTop: 12 }}><span style={{ width: `${pct}%` }} /></div>
            <p className="small muted" style={{ marginTop: 12, marginBottom: 0 }}>
              Treci cu mouse-ul peste (sau atinge) orice termen <span className="term" style={{ cursor: 'default' }}>subliniat punctat</span> ca să vezi <b>ce face, cum lucrează și unde se folosește</b>.
              Comenzile de pe pagină sunt explicate, dar <b>nu sunt rulate de platformă</b>: le exersezi tu, pe propriul sistem Linux. Fiecare output are eticheta lui (Reconstituit din documentație / Ilustrativ / Capturat).
            </p>
          </div>

          <mod.Body />
          <section id="questions" className="section">
            <SectionHead id="questions" code={topicId} title="Întrebări — banca lecției" />
            <p className="muted">Mod antrenament: răspunde, apoi <b>Verifică</b>, sau apasă <b>Arată răspunsul</b>. Fiecare variantă are explicație. Greșelile intră automat în Repetare (FSRS). Scorul acestor întrebări este automat și separat de autoevaluarea laboratoarelor.</p>
            <TopicQuestions topicId={topicId} />
          </section>
          <section id="labs" className="section">
            <SectionHead id="labs" code="LAB" title="Laboratoare (autoevaluare declarată)" />
            {mod.labs.map((lab) => <LabView key={lab.id} lab={lab} anchor={false} />)}
          </section>
          <section id="sources" className="section">
            <div className="section-head"><span className="section-code">§</span><h2>Surse</h2></div>
            <ul className="small">{mod.sources.map((x) => <li key={x.ref}><span className="badge">{x.kind}</span> {x.ref}</li>)}</ul>
            <p className="tiny muted">Cercetarea lecției: <code>research/notes/{topicId}.md</code>. Starea lecției e descrisă în <code>docs/CURRENT_STATE.md</code>; review-ul didactic și publicarea aparțin proprietarului.</p>
          </section>
          <section id="notes" className="section">
            <div className="section-head"><span className="section-code">✎</span><h2>Notițele mele</h2></div>
            <NotesPanel topicId={topicId} />
          </section>
        </div>
        <aside className="toc no-print">
          <div className="tiny muted" style={{ textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px 10px' }}>Pe această pagină</div>
          {sections.map((s) => (
            <a key={s.id} href={`#${s.id}`} className={active === s.id ? 'on' : ''}
              onClick={(e) => { e.preventDefault(); document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth' }); history.replaceState(null, '', `#${s.id}`); }}>
              {progress[topicId]?.has(s.id) ? '✓ ' : ''}{s.code ? <span className="mono" style={{ fontSize: '0.72rem', marginRight: 6 }}>{s.code}</span> : null}{s.label}
            </a>
          ))}
          <a href="#notes" onClick={(e) => { e.preventDefault(); document.getElementById('notes')?.scrollIntoView({ behavior: 'smooth' }); }}>Notițe</a>
        </aside>
      </div>
    </div>
  );
}
