import { useEffect, useState } from 'react';
import { Link, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { Icon } from './components/Icon';
import { useStore } from './lib/store';
import { Dashboard } from './pages/Dashboard';
import { Curriculum } from './pages/Curriculum';
import { TopicPage } from './pages/TopicPage';
import { Training } from './pages/Training';
import { Review } from './pages/Review';
import { Flashcards } from './pages/Flashcards';
import { Glossary } from './pages/Glossary';
import { Objectives } from './pages/Objectives';
import { Labs } from './pages/Labs';
import { Simulations } from './pages/Simulations';
import { Search } from './pages/Search';
import { Notes } from './pages/Notes';
import { Settings } from './pages/Settings';
import { useDueCount } from './lib/useDue';

const NAV = [
  { group: 'Învățare', items: [
    { to: '/', icon: 'home', label: 'Panou' },
    { to: '/curriculum', icon: 'tree', label: 'Curriculum RHCSA' },
    { to: '/obiective', icon: 'target', label: 'Harta obiectivelor' },
    { to: '/glosar', icon: 'glossary', label: 'Glosar' },
    { to: '/cautare', icon: 'book', label: 'Căutare' },
  ] },
  { group: 'Antrenament', items: [
    { to: '/antrenament', icon: 'target', label: 'Întrebări (scor automat)' },
    { to: '/laboratoare', icon: 'gear', label: 'Laboratoare (autoevaluare)' },
    { to: '/simulari', icon: 'clock', label: 'Simulări de examen' },
    { to: '/repetare', icon: 'repeat', label: 'Repetare (FSRS)', due: true },
    { to: '/flashcards', icon: 'cards', label: 'Flashcards' },
  ] },
  { group: 'Unelte', items: [
    { to: '/notite', icon: 'note', label: 'Notițe & bookmark-uri' },
    { to: '/setari', icon: 'gear', label: 'Setări & backup' },
  ] },
];

function NavList({ due, onNav }: { due: number; onNav?: () => void }) {
  return (
    <nav className="nav">
      {NAV.map((g) => (
        <div key={g.group}>
          <div className="nav-group">{g.group}</div>
          {g.items.map((it) => (
            <NavLink key={it.to} to={it.to} end={it.to === '/'} onClick={onNav}>
              <Icon name={it.icon} />{it.label}
              {'due' in it && it.due && due > 0 && <span className="count">{due}</span>}
            </NavLink>
          ))}
        </div>
      ))}
    </nav>
  );
}

function Brand() {
  return (
    <Link to="/" className="brand">
      <span className="brand-badge"><Icon name="terminal" size={18} className="" /></span>
      <span>RHCSA Learn<small>EX200 · RHEL 10</small></span>
    </Link>
  );
}

export function App() {
  const { theme, setTheme } = useStore();
  const [drawer, setDrawer] = useState(false);
  const loc = useLocation();
  const due = useDueCount();
  useEffect(() => { if (!loc.hash) window.scrollTo(0, 0); }, [loc.pathname]);
  const ThemeBtn = (
    <button className="icon-btn" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label="Schimbă tema" title="Schimbă tema">
      <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
    </button>
  );
  return (
    <div className="app">
      <aside className="sidebar">
        <Brand />
        <NavList due={due} />
        <div className="sidebar-foot">{ThemeBtn}</div>
      </aside>
      <div className="main">
        <header className="topbar">
          <button className="icon-btn" onClick={() => setDrawer(true)} aria-label="Meniu"><Icon name="menu" /></button>
          <Brand />
          <span className="spacer" />
          {ThemeBtn}
        </header>
        {drawer && (
          <>
            <div className="drawer-backdrop" onClick={() => setDrawer(false)} />
            <div className="drawer fade-up"><Brand /><NavList due={due} onNav={() => setDrawer(false)} /></div>
          </>
        )}
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/curriculum" element={<Curriculum />} />
          <Route path="/lectie/:topicId" element={<TopicPage />} />
          <Route path="/obiective" element={<Objectives />} />
          <Route path="/laboratoare" element={<Labs />} />
          <Route path="/laboratoare/:labId" element={<Labs />} />
          <Route path="/simulari" element={<Simulations />} />
          <Route path="/cautare" element={<Search />} />
          <Route path="/antrenament" element={<Training />} />
          <Route path="/repetare" element={<Review />} />
          <Route path="/flashcards" element={<Flashcards />} />
          <Route path="/glosar" element={<Glossary />} />
          <Route path="/notite" element={<Notes />} />
          <Route path="/setari" element={<Settings />} />
          <Route path="*" element={<div className="page"><h1>Pagina nu există</h1><Link to="/">Înapoi la panou</Link></div>} />
        </Routes>
      </div>
      <nav className="bottomnav">
        {[['/', 'home', 'Panou'], ['/curriculum', 'tree', 'Curs'], ['/antrenament', 'target', 'Antrenament'], ['/repetare', 'repeat', 'Repetare'], ['/laboratoare', 'gear', 'Lab']].map(([to, ic, l]) => (
          <NavLink key={to} to={to} end={to === '/'}><Icon name={ic} />{l}{to === '/repetare' && due > 0 ? ` (${due})` : ''}</NavLink>
        ))}
      </nav>
    </div>
  );
}
