import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { CATEGORIES, CHAPTERS, LESSONS, OBJECTIVES, lessonsForObjective } from '../src/data/curriculum';
import { QUESTIONS } from '../src/data/questions';
import { GLOSSARY } from '../src/data/glossary';
import { TOPICS } from '../src/content/registry';
import { LABS } from '../src/content/labs';
import { SIMULATIONS } from '../src/content/simulations';
import { grade } from '../src/lib/grade';
import type { Question } from '../src/lib/types';

// Formulări interzise în textul interfeței: platforma nu verifică sisteme (D-007, D-008).
const FORBIDDEN_UI = /(verificat de platform|confirmat de platform|am verificat sistemul|verificare automat)/i;

describe('curriculum', () => {
  it('are 10 categorii și 62 de obiective oficiale', () => {
    expect(CATEGORIES).toHaveLength(10);
    expect(OBJECTIVES).toHaveLength(62);
  });
  it('are 68 de lecții (59 oficiale + 9 suport) și 11 capitole', () => {
    expect(LESSONS).toHaveLength(68);
    expect(LESSONS.filter((l) => l.kind === 'official')).toHaveLength(59);
    expect(LESSONS.filter((l) => l.kind === 'support')).toHaveLength(9);
    expect(CHAPTERS).toHaveLength(11);
  });
  it('fiecare obiectiv are cel puțin o lecție „casă”', () => {
    for (const o of OBJECTIVES) expect(lessonsForObjective(o.id).home.length, o.id).toBeGreaterThanOrEqual(1);
  });
  it('lecțiile de suport nu au obiective oficiale', () => {
    for (const l of LESSONS.filter((x) => x.kind === 'support')) expect(l.objectives).toEqual([]);
  });
  it('lecțiile pilot există în hartă', () => {
    for (const id of ['L1.1', 'L1.2', 'L1.3', 'L1.5']) expect(LESSONS.some((l) => l.id === id)).toBe(true);
  });
});

describe('quiz', () => {
  const all = QUESTIONS;
  it('ID-uri unice, lecție existentă, obiective ⊆ obiectivele lecției', () => {
    const ids = new Set<string>();
    for (const q of all) {
      expect(ids.has(q.id), q.id).toBe(false); ids.add(q.id);
      const l = LESSONS.find((x) => x.id === q.topicId);
      expect(l, q.id).toBeDefined();
      for (const o of q.objectives) expect([...l!.objectives, ...l!.refs], q.id).toContain(o);
      expect(q.explanation.length, q.id).toBeGreaterThan(10);
    }
  });
  it('fiecare variantă are explicație (why)', () => {
    for (const q of all) {
      if (q.type === 'single' || q.type === 'multi') for (const o of q.options) expect(o.why?.length, `${q.id}/${o.id}`).toBeGreaterThan(8);
      if (q.type === 'match') {
        for (const p of q.pairs) expect(p.why?.length, q.id).toBeGreaterThan(5);
        for (const d of q.distractors ?? []) expect(d.why.length, q.id).toBeGreaterThan(5);
      }
      if (q.type === 'order') for (const i of q.items) expect(i.why?.length, q.id).toBeGreaterThan(5);
      if (q.type === 'cli') { expect(q.wrong.length, q.id).toBeGreaterThan(0); for (const w of q.wrong) expect(w.why.length, q.id).toBeGreaterThan(5); }
    }
  });
  it('single are exact o variantă corectă; multi cel puțin două', () => {
    for (const q of all) {
      if (q.type === 'single') expect(q.options.filter((o) => o.correct), q.id).toHaveLength(1);
      if (q.type === 'multi') expect(q.options.filter((o) => o.correct).length, q.id).toBeGreaterThanOrEqual(2);
    }
  });
  it('snippet-urile de output au etichetă; „captured” nu apare fără output furnizat de proprietar', () => {
    for (const q of all) {
      if ('snippet' in q && q.snippet?.kind === 'interpret-output') expect(q.snippet.label, q.id).toBeDefined();
      if ('snippet' in q && q.snippet) expect(q.snippet.label, q.id).not.toBe('captured');
    }
  });
  it('fiecare lecție pilot are cel puțin 6 întrebări și toate tipurile cerute', () => {
    for (const t of TOPICS) {
      const qs = all.filter((q) => q.topicId === t.id);
      expect(qs.length, t.id).toBeGreaterThanOrEqual(6);
      const kinds = new Set(qs.map((q) => q.type));
      for (const k of ['single', 'multi', 'cli', 'order', 'match']) expect(kinds.has(k as Question['type']), `${t.id} ${k}`).toBe(true);
      expect(qs.some((q) => 'snippet' in q && q.snippet?.kind === 'find-error'), `${t.id} find-error`).toBe(true);
      expect(qs.some((q) => 'snippet' in q && q.snippet?.kind === 'interpret-output'), `${t.id} interpret-output`).toBe(true);
    }
  });
  it('gradare cli: răspunsul canonic este acceptat, cele „wrong” nu', () => {
    for (const q of all) {
      if (q.type !== 'cli') continue;
      expect(grade(q, { type: 'cli', text: q.canonical }), q.id).toBe(true);
      for (const w of q.wrong) expect(grade(q, { type: 'cli', text: w.text }), `${q.id}: ${w.text}`).toBe(false);
    }
  });
  it('gradare single/multi/order', () => {
    for (const q of all) {
      if (q.type === 'single' || q.type === 'multi') {
        const right = q.options.filter((o) => o.correct).map((o) => o.id);
        expect(grade(q, { type: q.type, selected: right }), q.id).toBe(true);
        expect(grade(q, { type: q.type, selected: [] }), q.id).toBe(false);
      }
      if (q.type === 'order') expect(grade(q, { type: 'order', order: q.items.map((_, i) => i) }), q.id).toBe(true);
    }
  });
});

describe('glosar', () => {
  it('ID-uri unice și straturi complete', () => {
    const ids = new Set<string>();
    for (const g of GLOSSARY) {
      expect(ids.has(g.id), g.id).toBe(false); ids.add(g.id);
      for (const f of ['what', 'how', 'where'] as const) expect(g[f].length, `${g.id}.${f}`).toBeGreaterThan(10);
    }
  });
  it('markup-ul [[id]] din întrebări se referă la termeni existenți', () => {
    const ids = new Set(GLOSSARY.map((g) => g.id));
    const re = /\[\[([a-z0-9-]+)(?:\|[^\]]+)?\]\]/g;
    for (const q of QUESTIONS) {
      const s = JSON.stringify(q);
      let m: RegExpExecArray | null;
      while ((m = re.exec(s))) expect(ids.has(m[1]), `${q.id} → ${m[1]}`).toBe(true);
    }
  });
});

describe('laboratoare și simulări', () => {
  it('fiecare lab are scenariu, criterii cu ID unic și verificare manuală, pași, persistență, troubleshooting', () => {
    const ids = new Set<string>();
    for (const l of LABS) {
      expect(ids.has(l.id), l.id).toBe(false); ids.add(l.id);
      expect(l.scenario.length, l.id).toBeGreaterThan(0);
      expect(l.initialConditions.length, l.id).toBeGreaterThan(0);
      expect(l.finalState.length, l.id).toBeGreaterThan(0);
      expect(l.steps.length, l.id).toBeGreaterThan(0);
      expect(l.verification.length, l.id).toBeGreaterThan(0);
      expect(l.persistence.length, l.id).toBeGreaterThan(0);
      expect(l.troubleshooting.length, l.id).toBeGreaterThan(0);
      const cids = new Set<string>();
      for (const c of l.criteria) { expect(cids.has(c.id), `${l.id}/${c.id}`).toBe(false); cids.add(c.id); expect(c.manualCheck.length).toBeGreaterThan(2); }
      for (const o of l.objectives) expect(OBJECTIVES.some((x) => x.id === o), `${l.id} ${o}`).toBe(true);
      for (const s of l.steps) {
        expect(s.explain.length, `${l.id}: ${s.title}`).toBeGreaterThan(0);
        if (s.output) { expect(s.output.label).toBeDefined(); expect(s.output.label).not.toBe('captured'); }
      }
    }
  });
  it('textele nu pretind verificare de către platformă', () => {
    expect(FORBIDDEN_UI.test(JSON.stringify(LABS) + JSON.stringify(SIMULATIONS))).toBe(false);
  });
  it('simulările referă laboratoare și întrebări existente', () => {
    for (const s of SIMULATIONS) {
      for (const t of s.tasks) expect(LABS.some((l) => l.id === t.labId), t.labId).toBe(true);
      for (const id of s.autoQuestionIds) expect(QUESTIONS.some((q) => q.id === id), id).toBe(true);
    }
  });
});

describe('lecții și identitate', () => {
  it('lecțiile din registru există în hartă, au surse și secțiunile „questions” și „labs”', () => {
    for (const t of TOPICS) {
      expect(LESSONS.some((l) => l.id === t.id), t.id).toBe(true);
      expect(t.sources.length, t.id).toBeGreaterThan(0);
      expect(t.sections.map((s) => s.id), t.id).toEqual(expect.arrayContaining(['questions', 'labs']));
      expect(t.labs.length, t.id).toBeGreaterThan(0);
    }
  });
  it('fără conținut CCNA/Cisco în aplicație', () => {
    const files = ['src/App.tsx', 'src/pages/Dashboard.tsx', 'src/pages/Settings.tsx', 'src/pages/Curriculum.tsx', 'index.html'];
    for (const f of files) {
      const s = readFileSync(f, 'utf8');
      expect(/cisco|packet tracer|\bCCNA\b/i.test(s), f).toBe(false);
    }
  });
  it('fără integrare cu VM/SSH/terminal remote în dependențe', () => {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
    const deps = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies }).join(' ');
    expect(/ssh|xterm|node-pty|vagrant|libvirt|virtualbox|proxmox|websocket/i.test(deps)).toBe(false);
  });
});
