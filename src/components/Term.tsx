import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { glossaryById } from '../data/glossary';

const CLOSE_ALL = 'term:close-all';

/** Termen din glosar cu popover: ce face / cum lucrează / unde se folosește. Hover pe desktop, tap pe mobil. */
export function Term({ id, children }: { id: string; children?: ReactNode }) {
  const entry = glossaryById(id);
  const btn = useRef<HTMLButtonElement>(null);
  const pop = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const hoverTimer = useRef<number | undefined>(undefined);
  const pinned = useRef(false);

  useEffect(() => {
    const closeAll = (e: Event) => { if ((e as CustomEvent).detail !== id + ':' + uid.current) { setOpen(false); pinned.current = false; } };
    window.addEventListener(CLOSE_ALL, closeAll);
    return () => window.removeEventListener(CLOSE_ALL, closeAll);
  }, [id]);
  const uid = useRef(Math.random().toString(36).slice(2));

  useLayoutEffect(() => {
    if (!open || !btn.current) return;
    const place = () => {
      const r = btn.current!.getBoundingClientRect();
      const w = Math.min(380, window.innerWidth - 24);
      const h = pop.current?.offsetHeight ?? 260;
      let left = Math.min(Math.max(12, r.left + r.width / 2 - w / 2), window.innerWidth - w - 12);
      let top = r.bottom + 8;
      if (top + h > window.innerHeight - 12 && r.top - h - 8 > 12) top = r.top - h - 8;
      setPos({ top, left });
    };
    place();
    const onScroll = () => { if (!pinned.current) setOpen(false); else place(); };
    const onDoc = (e: MouseEvent) => {
      if (pop.current?.contains(e.target as Node) || btn.current?.contains(e.target as Node)) return;
      setOpen(false); pinned.current = false;
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setOpen(false); pinned.current = false; btn.current?.focus(); } };
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', place);
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', place);
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!entry) return <>{children ?? id}</>;
  const show = () => { window.dispatchEvent(new CustomEvent(CLOSE_ALL, { detail: id + ':' + uid.current })); setOpen(true); };
  const canHover = typeof window !== 'undefined' && window.matchMedia?.('(hover: hover)').matches;

  return (
    <>
      <button
        ref={btn} type="button" className="term" aria-expanded={open} aria-haspopup="dialog"
        onClick={(e) => { e.stopPropagation(); if (open && pinned.current) { setOpen(false); pinned.current = false; } else { pinned.current = true; show(); } }}
        onMouseEnter={() => { if (!canHover) return; window.clearTimeout(hoverTimer.current); hoverTimer.current = window.setTimeout(show, 250); }}
        onMouseLeave={() => { if (!canHover) return; window.clearTimeout(hoverTimer.current); hoverTimer.current = window.setTimeout(() => { if (!pinned.current) setOpen(false); }, 200); }}
      >
        {children ?? entry.abbr}
      </button>
      {open && createPortal(
        <div ref={pop} className="popover fade-up" role="dialog" aria-label={entry.abbr} style={{ top: pos.top, left: pos.left }}
          onMouseEnter={() => window.clearTimeout(hoverTimer.current)}
          onMouseLeave={() => { if (canHover && !pinned.current) hoverTimer.current = window.setTimeout(() => setOpen(false), 200); }}>
          <div className="pt"><b>{entry.abbr}</b>{entry.layer && <span className="badge">{entry.layer}</span>}{entry.std && <span className="badge">{entry.std}</span>}</div>
          {(entry.full || entry.ro) && <div className="pf">{entry.full}{entry.full && entry.ro ? ' — ' : ''}{entry.ro}</div>}
          <dl>
            <div><dt>Ce face</dt><dd>{entry.what}</dd></div>
            <div><dt>Cum lucrează</dt><dd>{entry.how}</dd></div>
            <div><dt>Unde se folosește</dt><dd>{entry.where}</dd></div>
          </dl>
          <div className="pfoot">
            <span>{entry.topics?.length ? `Topic: ${entry.topics.join(', ')}` : ''}</span>
            <Link to={`/glosar#${entry.id}`} onClick={() => setOpen(false)}>Glosar →</Link>
          </div>
        </div>, document.body)}
    </>
  );
}
