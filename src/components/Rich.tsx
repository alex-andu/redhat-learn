import { Fragment, type ReactNode } from 'react';
import { Term } from './Term';
import { glossaryById } from '../data/glossary';

/** Mini-markup pentru texte din date: [[id]] sau [[id|text]] → tooltip glosar, **bold**, `code`. */
export function Rich({ text }: { text: string }) {
  return <>{parse(text)}</>;
}

export function parse(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /\[\[([a-z0-9-]+)(?:\|([^\]]+))?\]\]|\*\*([^*]+)\*\*|`([^`]+)`/g;
  let last = 0; let m: RegExpExecArray | null; let k = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(<Fragment key={k++}>{text.slice(last, m.index)}</Fragment>);
    if (m[1]) out.push(<Term key={k++} id={m[1]}>{m[2]}</Term>);
    else if (m[3]) out.push(<b key={k++}>{parse(m[3])}</b>);
    else if (m[4]) out.push(<code key={k++}>{m[4]}</code>);
    last = re.lastIndex;
  }
  if (last < text.length) out.push(<Fragment key={k++}>{text.slice(last)}</Fragment>);
  return out;
}

export const plain = (text: string) => text.replace(/\[\[[a-z0-9-]+\|([^\]]+)\]\]/g, '$1').replace(/\[\[([a-z0-9-]+)\]\]/g, (_, id) => glossaryById(id)?.abbr ?? id).replace(/\*\*|`/g, '');
