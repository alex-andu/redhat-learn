import { useState, type ReactNode } from 'react';
import { Icon } from './Icon';
import type { OutputLabel } from '../lib/types';
import { SectionHead } from './SectionHead';

export function Summary({ children }: { children: ReactNode }) {
  return <div className="layer summary"><div className="layer-h"><span className="dot" />Pe scurt</div><div className="layer-b">{children}</div></div>;
}
export function Detailed({ children, title = 'Explicația detaliată' }: { children: ReactNode; title?: string }) {
  return <div className="layer"><div className="layer-h"><span className="dot" />{title}</div><div className="layer-b">{children}</div></div>;
}
export function DeepDive({ children, title = 'Deep dive (opțional)' }: { children: ReactNode; title?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="layer deep">
      <div className="layer-h" role="button" tabIndex={0} aria-expanded={open} onClick={() => setOpen(!open)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(!open); } }}>
        <span className="dot" />{title}<span className="muted small" style={{ fontWeight: 500 }}>— mecanisme interne, peste nivelul minim de examen</span>
        <Icon name="chevron" className={`chev ${open ? 'open' : ''}`} />
      </div>
      {open && <div className="layer-b fade-up">{children}</div>}
    </div>
  );
}
export function Traps({ items }: { items: ReactNode[] }) {
  return (
    <div className="layer traps"><div className="layer-h"><span className="dot" />Capcane de examen</div>
      <div className="layer-b"><ul>{items.map((t, i) => <li key={i}>{t}</li>)}</ul></div></div>
  );
}

const CALLOUT_ICON = { info: 'info', tip: 'bulb', warn: 'alert', exam: 'flag' } as const;
export function Callout({ kind = 'info', title, children }: { kind?: keyof typeof CALLOUT_ICON; title?: string; children: ReactNode }) {
  return (
    <div className={`callout ${kind}`}>
      <Icon name={CALLOUT_ICON[kind]} className="ci" size={22} />
      <div>{title && <b style={{ display: 'block', marginBottom: 4 }}>{title}</b>}{children}</div>
    </div>
  );
}
export function Analogy({ children }: { children: ReactNode }) {
  return <div className="analogy"><b>Analogie: </b>{children}</div>;
}

export function Figure({ children, caption }: { children: ReactNode; caption?: ReactNode }) {
  return <figure className="figure">{children}{caption && <figcaption>{caption}</figcaption>}</figure>;
}

export const OUTPUT_LABEL: Record<OutputLabel, string> = {
  reconstructed: 'Reconstituit din documentație',
  illustrative: 'Ilustrativ',
  captured: 'Capturat',
};
/** Eticheta obligatorie a unui output (D-009). „Capturat” doar dacă proprietarul a furnizat output real. */
export function OutputBadge({ label }: { label: OutputLabel }) {
  return <span className={`badge out-${label}`} title={label === 'illustrative' ? 'Exemplu construit pentru explicație; valorile pe sistemul tău pot diferi.' : label === 'reconstructed' ? 'Derivat din documentație/man page, nu rulat pe un sistem real.' : 'Output real furnizat de proprietar.'}>{OUTPUT_LABEL[label]}</span>;
}

export function Reveal({ label, children, defaultOpen = false }: { label: ReactNode; children: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="reveal">
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open}>
        <Icon name={open ? 'eye' : 'lock'} />{label}<Icon name="chevron" className={`chev ${open ? 'open' : ''}`} />
      </button>
      {open && <div className="fade-up">{children}</div>}
    </div>
  );
}

export function Table({ head, rows, hlCol }: { head: ReactNode[]; rows: ReactNode[][]; hlCol?: number }) {
  return (
    <div className="table-wrap"><table className="t">
      <thead><tr>{head.map((h, i) => <th key={i}>{h}</th>)}</tr></thead>
      <tbody>{rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j} className={j === hlCol ? 'hl' : undefined}>{c}</td>)}</tr>)}</tbody>
    </table></div>
  );
}

/** Secțiune de lecție cu titlu, cod (nr. secțiune LESSON_SPEC) și bifa „parcurs”. */
export function Sec({ id, code, title, children }: { id: string; code: string; title: string; children: ReactNode }) {
  return <section id={id} className="section"><SectionHead id={id} code={code} title={title} />{children}</section>;
}
