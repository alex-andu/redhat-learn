import { useState, type ReactNode } from 'react';
import type { OutputLabel } from '../lib/types';
import { OutputBadge } from './Lesson';

// Prompturi recunoscute: [user@host dir]$ , [root@host dir]# și $ simplu. (# la început de linie, fără paranteze = comentariu.)
const PROMPT = /^(\[[\w.\-]+@[\w.\-]+ [^\]]+\][$#]|\$)\s?/;

function hl(line: string, kind: 'config' | 'session') {
  if (/^\s*#/.test(line) && !PROMPT.test(line)) return <span className="tok-cmt">{line}</span>;
  const m = line.match(PROMPT);
  if (m) return <><span className="tok-prompt">{m[0]}</span>{cmd(line.slice(m[0].length))}</>;
  if (kind === 'session') return <span className="tok-out">{line}</span>;
  return cmd(line);
}
function cmd(s: string) {
  const lead = s.match(/^\s*/)?.[0] ?? '';
  const rest = s.slice(lead.length);
  const [first, ...others] = rest.split(' ');
  return <>{lead}<span className="tok-kw">{first}</span>{others.length ? ' ' : ''}{others.map((w, i) =>
    <span key={i} className={/^(\d[\d./:]*|".*"|'.*'|-{1,2}[\w-]+)$/.test(w) ? 'tok-val' : undefined}>{w}{i < others.length - 1 ? ' ' : ''}</span>)}</>;
}

/** Bloc de cod CLI cu highlight, buton de copiere și (opțional) explicație pe fiecare comandă. */
export function CodeBlock({ title, code, kind = 'config', explain, label }: {
  title?: string; code: string; kind?: 'config' | 'session'; explain?: [string, ReactNode][];
  /** Obligatoriu pentru blocurile cu output: Reconstituit din documentație / Ilustrativ / Capturat (D-009). */
  label?: OutputLabel;
}) {
  const [copied, setCopied] = useState(false);
  const lines = code.replace(/\n$/, '').split('\n');
  const copy = () => {
    const text = lines.filter((l) => kind === 'config' || PROMPT.test(l)).map((l) => l.replace(PROMPT, '')).join('\n');
    navigator.clipboard?.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }).catch(() => {});
  };
  return (
    <div className="code">
      <div className="code-h"><span className="dots"><i /><i /><i /></span><span>{title ?? (kind === 'config' ? 'configurare' : 'sesiune')}</span>{label && <OutputBadge label={label} />}
        <button className="copy" type="button" onClick={copy}>{copied ? 'copiat ✓' : 'copiază'}</button></div>
      <pre><code>{lines.map((l, i) => <div key={i}>{hl(l, kind) }{l === '' ? '\u00a0' : null}</div>)}</code></pre>
      {explain && <ul className="code-explain">{explain.map(([c, e], i) => <li key={i}><code>{c}</code><span>{e}</span></li>)}</ul>}
    </div>
  );
}
