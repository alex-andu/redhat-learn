import { useRef, useState } from 'react';
import { useStore } from '../lib/store';
import { api } from '../lib/api';
import { Icon } from '../components/Icon';

export function Settings() {
  const { theme, setTheme, settings, saveSettings } = useStore();
  const file = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState('');
  const doImport = async (f: File) => {
    try {
      const data = JSON.parse(await f.text());
      if (!confirm('Importul ÎNLOCUIEȘTE toate datele actuale (progres, scoruri, bifele de autoevaluare, notițe). Continui?')) return;
      await api.importBackup(data); setMsg('Import reușit — se reîncarcă…'); setTimeout(() => location.reload(), 800);
    } catch { setMsg('Fișier invalid sau eroare la import.'); }
  };
  const doExport = () => {
    const blob = new Blob([api.exportAll()], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `rhcsa-learn-backup-${new Date().toISOString().slice(0, 10)}.json`; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  };
  return (
    <div className="page narrow">
      <h1>Setări & backup</h1>
      <div className="stack">
        <div className="card stack">
          <h3 style={{ margin: 0 }}>Aspect</h3>
          <div className="segmented" style={{ width: 'fit-content' }}>
            <button className={theme === 'dark' ? 'on' : ''} onClick={() => setTheme('dark')}><Icon name="moon" size={14} /> Dark</button>
            <button className={theme === 'light' ? 'on' : ''} onClick={() => setTheme('light')}><Icon name="sun" size={14} /> Light</button>
          </div>
        </div>
        <div className="card stack">
          <h3 style={{ margin: 0 }}>Obiective de studiu</h3>
          <label className="field">Întrebări pe zi: <b style={{ color: 'var(--text)' }}>{settings.dailyGoal ?? 20}</b>
            <input type="range" min={5} max={100} step={5} value={settings.dailyGoal ?? 20} onChange={(e) => saveSettings({ dailyGoal: +e.target.value })} style={{ accentColor: 'var(--accent)' }} /></label>
          <label className="field">Flashcards noi pe zi: <b style={{ color: 'var(--text)' }}>{settings.newCardsPerDay ?? 20}</b>
            <input type="range" min={5} max={60} step={5} value={settings.newCardsPerDay ?? 20} onChange={(e) => saveSettings({ newCardsPerDay: +e.target.value })} style={{ accentColor: 'var(--accent)' }} /></label>
        </div>
        <div className="card stack">
          <h3 style={{ margin: 0 }}>Date și backup</h3>
          <p className="small muted" style={{ margin: 0 }}>
            Platforma nu are server. Progresul, scorurile quiz, bifele de autoevaluare din laboratoare și notițele sunt salvate <b>doar în acest browser</b> (localStorage). Dacă ștergi datele site-ului, dispar:
            exportă periodic un fișier JSON și poți să-l imporți pe alt dispozitiv.
          </p>
          <div className="row">
            <button className="btn" onClick={doExport}><Icon name="download" />Exportă JSON</button>
            <button className="btn" onClick={() => file.current?.click()}><Icon name="upload" />Importă JSON</button>
            <input ref={file} type="file" accept="application/json" hidden onChange={(e) => e.target.files?.[0] && doImport(e.target.files[0])} />
          </div>
          {msg && <div className="small">{msg}</div>}
        </div>
        <div className="card">
          <h3>Surse și licențe</h3>
          <ul className="small">
            <li>Obiectivele: pagina oficială Red Hat EX200 (RHEL 10), text verbatim, verificat la data din <code>research/objectives/ex200-verification.md</code>. Platforma este independentă și nu este afiliată Red Hat.</li>
            <li>Platforma nu execută comenzi și nu inspectează sisteme: laboratoarele sunt conținut educațional, iar bifele sunt autoevaluare declarată de tine.</li>
            <li>Spaced repetition: <a href="https://github.com/open-spaced-repetition/ts-fsrs" target="_blank" rel="noreferrer">ts-fsrs</a> (MIT).</li>
            <li>Fonturi: Inter, JetBrains Mono (SIL OFL), incluse local.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
