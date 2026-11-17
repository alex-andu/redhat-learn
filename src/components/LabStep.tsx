import { useState, type ReactNode } from 'react';

/** Cale de meniu în Packet Tracer, ex. <P>Config › Wireless</P> */
export const P = ({ children }: { children: ReactNode }) => <span className="pt-path">{children}</span>;

export function Step({ n, title, children, labKey }: { n: number; title: string; children: ReactNode; labKey: string }) {
  const k = `lab:${labKey}:${n}`;
  const [done, setDone] = useState(() => { try { return localStorage.getItem(k) === '1'; } catch { return false; } });
  const toggle = (v: boolean) => { setDone(v); try { localStorage.setItem(k, v ? '1' : '0'); } catch { /* ignoră */ } };
  return (
    <div className={`lab-step ${done ? 'done' : ''}`}>
      <div className="sn">{done ? '✓' : n}</div>
      <div>
        <h4>{title}</h4>
        {children}
        <label className="check no-print" style={{ marginTop: 8 }}><input type="checkbox" checked={done} onChange={(e) => toggle(e.target.checked)} />pas realizat</label>
      </div>
    </div>
  );
}

