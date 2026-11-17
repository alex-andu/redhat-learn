// Validator fără dependențe pentru matricea obiectivelor EX200 și harta lecțiilor.
// Rulează pe Windows, macOS și Linux:  node scripts/check-matrix.mjs
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const err = (m) => errors.push(m);
const load = (rel) => JSON.parse(readFileSync(join(root, rel), 'utf8'));

const obj = load('content/curriculum/objectives.json');
const map = load('content/curriculum/lessons-map.json');

// --- objectives.json ---------------------------------------------------
const EXPECTED_COUNTS = [11, 4, 4, 10, 6, 5, 6, 4, 4, 8]; // pagina oficială, la 2026-11-15
if (obj.categories.length !== 10) err(`categorii: ${obj.categories.length}, așteptat 10`);
const objIds = new Set();
let total = 0;
obj.categories.forEach((c, ci) => {
  if (c.id !== `C${ci + 1}` || c.order !== ci + 1) err(`categoria #${ci + 1} are id/order incorect (${c.id}/${c.order})`);
  if (!c.title) err(`categoria ${c.id} fără titlu`);
  if (c.objectives.length !== EXPECTED_COUNTS[ci]) err(`${c.id}: ${c.objectives.length} obiective, așteptat ${EXPECTED_COUNTS[ci]}`);
  c.objectives.forEach((o, oi) => {
    if (o.id !== `${c.id}-${oi + 1}`) err(`ID neconsecutiv: ${o.id} (așteptat ${c.id}-${oi + 1})`);
    if (objIds.has(o.id)) err(`ID duplicat: ${o.id}`);
    if (!o.text || o.text !== o.text.trim()) err(`${o.id}: text gol sau cu spații la capete`);
    objIds.add(o.id);
    total++;
  });
});
if (total !== 62) err(`total obiective: ${total}, așteptat 62`);

// Amprenta textului oficial (detectează orice modificare accidentală a textului verbatim)
const lines = obj.categories.flatMap((c) => [c.title, ...c.objectives.map((o) => o.text)]);
const sha = createHash('sha256').update(lines.join('\n')).digest('hex');
if (sha !== obj.source.listSha256) err(`listSha256 nu corespunde: calculat ${sha}, înregistrat ${obj.source.listSha256}`);

// Câmpuri neafirmate (nu trebuie completate fără sursă Red Hat)
for (const k of ['durationOfficial', 'passingScoreOfficial', 'weightsOfficial']) {
  if (obj.exam[k] !== null) err(`exam.${k} trebuie să rămână null până la confirmarea dintr-o sursă Red Hat (acum: ${JSON.stringify(obj.exam[k])})`);
}

// --- lessons-map.json --------------------------------------------------
const chapterIds = new Set(map.chapters.map((c) => c.id));
if (new Set(map.studyOrder).size !== map.studyOrder.length) err('studyOrder conține duplicate');
for (const id of chapterIds) if (!map.studyOrder.includes(id)) err(`capitol lipsă din studyOrder: ${id}`);
for (const id of map.studyOrder) if (!chapterIds.has(id)) err(`studyOrder referă capitol inexistent: ${id}`);

const lessonIds = new Set();
const covered = new Map(); // objId -> [lessonId]
let official = 0, support = 0;
for (const l of map.lessons) {
  if (lessonIds.has(l.id)) err(`lecție duplicată: ${l.id}`);
  lessonIds.add(l.id);
  if (!chapterIds.has(l.chapter)) err(`${l.id}: capitol inexistent ${l.chapter}`);
  if (!l.title) err(`${l.id}: fără titlu`);
  if (l.kind !== 'official' && l.kind !== 'support') err(`${l.id}: kind invalid (${l.kind})`);
  if (l.kind === 'support' && l.objectives.length) err(`${l.id}: lecție de suport nu poate avea obiective oficiale`);
  if (l.kind === 'official' && !l.objectives.length) err(`${l.id}: lecție oficială fără obiective`);
  if (l.kind === 'official') official++; else support++;
  const chapter = map.chapters.find((c) => c.id === l.chapter);
  if (chapter?.kind === 'support' && l.kind !== 'support') err(`${l.id}: lecție oficială într-un capitol de suport`);
  for (const o of l.objectives) {
    if (!objIds.has(o)) err(`${l.id}: obiectiv inexistent ${o}`);
    if (!covered.has(o)) covered.set(o, []);
    covered.get(o).push(l.id);
  }
}
for (const o of objIds) if (!covered.has(o)) err(`obiectiv fără lecție: ${o}`);

// Lecțiile pilot aprobate: 1.1, 1.2, 1.3, 1.5
const pilot = map.lessons.filter((l) => l.pilot).map((l) => l.id).sort();
const wantPilot = ['L1.1', 'L1.2', 'L1.3', 'L1.5'].sort();
if (JSON.stringify(pilot) !== JSON.stringify(wantPilot)) err(`lecții pilot: ${pilot.join(',')} (așteptat ${wantPilot.join(',')})`);

// --- raport --------------------------------------------------------------
const shared = [...covered.entries()].filter(([, v]) => v.length > 1).map(([k, v]) => `${k}: ${v.join(', ')}`);
console.log(`Categorii: ${obj.categories.length} · obiective: ${total} · lecții: ${map.lessons.length} (oficiale ${official}, suport ${support})`);
console.log(`Obiective acoperite: ${covered.size}/${objIds.size} · amprentă listă: ${sha.slice(0, 12)}…`);
if (shared.length) console.log(`Obiective cu mai multe lecții: ${shared.join(' | ')}`);
if (errors.length) {
  console.error(`\n✗ ${errors.length} eroare/erori:`);
  for (const e of errors) console.error(' - ' + e);
  process.exit(1);
}
console.log('✓ matrice OK');
