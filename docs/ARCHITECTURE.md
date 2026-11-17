# ARCHITECTURE — RHCSA Learn (arhitectura adoptată, D-015)

Fundația aplicației este arhitectura CCNA Learn (proiect propriu al proprietarului, citit doar pentru referință; nimic nu s-a modificat acolo): **SPA Vite + React 19 + TypeScript + react-router**, design system propriu în CSS cu variabile (dark/light), motor de quiz, glosar cu tooltip, FSRS pentru repetare. Propunerea anterioară (Astro + MDX + Zod + Pagefind + IndexedDB) este **înlocuită**; fișierele ei sunt păstrate în `docs/archive/` doar ca istoric.

## Principii
- **Static, fără backend.** `vite build` produce fișiere statice; orice server de fișiere le poate servi. CCNA Learn avea server Fastify + SQLite; aici nu există (D-007, D-016).
- **Platforma nu atinge sisteme externe**: fără cod de execuție, conectare, VM, SSH sau verificare a unui sistem Linux.
- **Conținut = date TypeScript + componente TSX** (ca în CCNA), validate de teste Vitest la fiecare rulare.
- Un singur mod de a face fiecare lucru; fără arhitecturi paralele.

## Stack și dependențe
Runtime: `react`, `react-dom`, `react-router-dom`, `ts-fsrs`, `@fontsource-variable/{inter,jetbrains-mono}`. Dev: `vite`, `@vitejs/plugin-react`, `typescript`, `vitest`, `@types/*`. Fără server, PWA, Zod, MDX sau biblioteci UI.

## Structura
```
index.html  vite.config.ts  vitest.config.ts  tsconfig.json  package.json
content/curriculum/   objectives.json (62, verbatim, SHA-256) · lessons-map.json (68 lecții)   ← sursa de adevăr
src/
  data/curriculum.ts        indexează JSON-urile (capitole, lecții, obiective, lecție „casă”)
  data/questions/lX_Y.ts    întrebări per lecție (single, multi, match, order, cli, + snippet: find-error / interpret-output)
  data/terms/lX_Y.ts        glosar per lecție (ce face / cum lucrează / unde se folosește)
  content/lX_Y/{index.tsx,labs.ts}   lecția (TopicModule) și laboratoarele ei (date)
  content/{registry,labs,simulations}.ts   înregistrarea lecțiilor (necesită aprobare), laboratoare, simulări
  lab/types.ts              modelul Lab / Simulation
  components/               Lesson (Summary/Detailed/DeepDive/Traps/…, OutputBadge), CodeBlock, QuestionCard, LabView, Term, …
  pages/                    Dashboard, Curriculum, Objectives, TopicPage, Training, Labs, Simulations, Review, Flashcards, Glossary, Search, Notes, Settings
  lib/                      api.ts (persistență locală), store, grade, srs (FSRS), types
  styles/app.css            design system
tests/content.test.ts       validări de conținut și identitate
scripts/check-matrix.mjs    validatorul matricei (fără dependențe)
research/ docs/             cercetare și specificații
```

## Persistență
`src/lib/api.ts` păstrează interfața async din CCNA, dar scrie în `localStorage` (cheia `rhcsa-learn:v1`): progres pe secțiuni, încercări de quiz, carduri FSRS, notițe, bookmark-uri, setări, **bifele de autoevaluare ale laboratoarelor** și rezultatele simulărilor. Export/import JSON din Setări. Datele rămân în browser; fără sincronizare.

## Evaluare — trei surse, afișate separat
1. **Quiz** (scor automat; doar întrebările cu răspuns în platformă).
2. **Laboratoare** (autoevaluare declarată de cel care învață; etichetă „declarată de tine”).
3. **Simulări de examen** (task-uri practice autoevaluate + întrebări cu scor automat, două rezultate distincte; fără scor combinat).
Harta obiectivelor (`/obiective`) arată pentru fiecare dintre cele 62 de obiective lecția, numărul de întrebări/rezultatul quiz și criteriile de laborator declarate, fără procent unic și fără „probabilitate de promovare”.

## Validări
`npm run verify` = `tsc --noEmit` + `vitest run` + `vite build` + `node scripts/check-matrix.mjs`. Testele verifică: 10 categorii / 62 obiective / 68 lecții, fiecare obiectiv are lecție, `why` pe fiecare variantă, tipurile de întrebări cerute, etichete pe output-uri (fără „Capturat” nefurnizat), criterii/soluții/persistență în laboratoare, simulări valide, lipsa urmelor CCNA în UI și a dependențelor de VM/SSH.

## Deployment
`npm run build` → `dist/` (zeci de MB cel mult, majoritatea fonturi). Servit de orice server static, cu fallback la `index.html` pentru rutele SPA.
