# REUSE_ANALYSIS — CCNA Learn → RHCSA Learn (2026-11-15)

CCNA Learn (read-only): monorepo npm (`web/` Vite+React 19+TS, `server/` Fastify 5 + SQLite, `deploy/`), conținut ca TSX + date TS per topic, ~3,2k linii de infrastructură UI. Starea lui nu a fost modificată; `web/` conținea schimbări locale necomise ale proprietarului în conținut/diagrame (nu au fost atinse). Nu s-a rulat build-ul CCNA; funcționalitatea a fost evaluată din cod.

| Componentă CCNA | Decizie | Adaptare RHCSA |
|---|---|---|
| Vite + React + TS + router, `index.html`, `main.tsx` | **reutilizat** | PWA scos (dependență evitată) |
| `styles/app.css` (design system, dark/light, componente) | **reutilizat** | clase noi: etichete output, autoevaluare, lab-card |
| `App.tsx` (layout, sidebar, drawer, bottom nav) | **adaptat** | brand RHCSA, navigare nouă (Harta obiectivelor, Laboratoare, Simulări, Căutare) |
| `Lesson.tsx` (Summary/Detailed/DeepDive/Traps/Callout/Analogy/Table/Reveal) | **reutilizat** | `Photo` scos; adăugat `OutputBadge`, `Sec` |
| `CodeBlock`, `Rich`, `Term`, `SectionHead`, `Icon`, `NotesPanel` | **reutilizat** | prompturi bash/RHEL; etichetă de output pe blocuri |
| `QuestionCard`, `grade`, `InlineQuiz`, `TopicQuestions` (single, multi, match, order, cli) | **reutilizat + extins** | `snippet` pe întrebări de alegere ⇒ find-error și interpret-output; `topicId` = ID lecție |
| `srs.ts` (FSRS), Review, Flashcards, Glossary, Notes, Dashboard, Training, Curriculum, TopicPage | **adaptat** | date din curriculum RHCSA; fără ponderi; sim de întrebări marcat „scor automat” |
| `lib/api.ts` + `server/` (Fastify+SQLite, backup, systemd/Caddy) | **înlocuit** | `api.ts` pe localStorage cu aceeași interfață; serverul nu se copiază (D-016) |
| `data/curriculum.ts` (Cisco) | **înlocuit** | citește `objectives.json` și `lessons-map.json` |
| Subnetting, CheatSheets, diagrame RF/WLAN, foto Wikimedia, `data/facts` | **nu se reutilizează** | specifice CCNA; cheatsheets RHCSA = planificate |
| Conținut, întrebări, glosar, topicuri CCNA | **nu se reutilizează** | — |
| **Nou RHCSA** | | model Lab (Guided/Independent), autoevaluare declarată, simulări cu scoruri separate, harta obiectivelor, căutare locală, teste Vitest |

**Riscuri/compatibilități:** (1) `check-content.mjs` din CCNA nu a fost portat; echivalentul este `tests/content.test.ts`. (2) CCNA nu are teste; cele RHCSA sunt noi. (3) Datele din localStorage se pierd dacă browserul curăță site-ul: export/import JSON. (4) Căutarea este locală simplă (fără Pagefind). (5) Dependențele sunt preluate cu intervale `^`; versiunile efective sunt fixate de `package-lock.json`.
