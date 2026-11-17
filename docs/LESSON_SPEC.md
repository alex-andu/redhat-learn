# LESSON_SPEC — structura și bara de profunzime a unei lecții

Public: începător absolut în Linux, dar cu țintă practică EX200. Fără lecții superficiale sau simple liste de comenzi.

## 1. Structura obligatorie (în ordine)
1. **Pe scurt** — 2–3 rânduri.
2. **Ce este și de ce există** — ce problemă rezolvă, ce se întâmpla fără el.
3. **Cum funcționează intern** — pas cu pas (procese, fișiere, componente implicate).
4. **Cum interacționează cu alte componente Linux** — trimiteri către lecțiile/obiectivele legate.
5. **Când și de ce îl folosim** — situații reale de administrare.
6. **Comenzi și configurare** — fiecare comandă: sintaxă, **fiecare opțiune folosită**, efect; exemple practice; fișierele de configurare implicate, cu explicarea conținutului.
7. **Output-uri explicate** — fiecare bloc are eticheta „Reconstituit din documentație” sau „Ilustrativ” (vezi WORKFLOW §4); explicat câmp cu câmp/linie cu linie.
8. **Verificare** — ce comenzi confirmă rezultatul și ce rezultat indică succesul.
9. **Persistență** — ce trebuie să supraviețuiască reboot-ului, de ce, cum se confirmă manual.
10. **Troubleshooting** — simptom → cauză probabilă → diagnostic → remediere.
11. **Greșeli frecvente / capcane de examen.**
12. **Deep dive** (opțional, colapsabil) — mecanisme interne, istoric, cazuri limită.
13. **Mini-quiz** (2–4 întrebări din banca lecției) și trimitere către laboratoarele lecției.

Diagrame SVG originale numai acolo unde clarifică un mecanism; fără diagrame decorative. Fiecare concept se leagă de o situație reală de administrare. Termenii tehnici noi au intrare în glossary și tooltip la prima apariție.

## 2. Metadate (implementate ca `TopicModule` în `src/content/types.ts`: `id`, `subtitle`, `studyTime`, `sections`, `labs`, `sources`; D-015/D-016). Lista de mai jos rămâne cerința de conținut:
```yaml
id: L1.1                      # din lessons-map.json
title: "..."
chapter: C1
kind: official | support
objectives: [C1-1]            # exact ca în lessons-map.json
rhel: 10
prerequisites: [M0.3]
estimatedMinutes: 45
status: { researched: false, written: false, validated: false }   # review/publicare: doar proprietarul
sources:                      # cel puțin una per lecție
  - { kind: doc | man | upstream | rfc, ref: "URL sau man(1)", accessed: "AAAA-LL-ZZ" }
commands:                     # fiecare comandă din lecție, cu sursa
  - { cmd: "ls", evidence: doc | man | upstream, source: "..." }
outputs:                      # fiecare bloc de output etichetat
  - { id: out-1, label: reconstructed | illustrative | captured }
```
Valorile din frontmatter sunt în engleză; interfața afișează „Reconstituit din documentație”, „Ilustrativ”, „Capturat”. `captured` este acceptat doar dacă proprietarul a furnizat explicit outputul real.

## 3. Quiz (`src/data/questions/<lecție>.ts`; tipuri: single, multi, cli, order, match, + `snippet` find-error / interpret-output)
- Tipuri: single, multi, completare de comandă, ordonare de pași, potrivire, „găsește greșeala în configurație”, „interpretează output-ul”.
- **Fiecare variantă** (corectă sau greșită) are `why`. Validatorul blochează build-ul dacă lipsește.
- Etichete: obiective oficiale, dificultate 1–3. Diversitate de tipuri și de formulări; distractori plauzibili, nu absurzi.
- Numărul de întrebări per lecție se stabilește după pilot (D-011).
- Scorul quiz-urilor nu se amestecă cu autoevaluarea laboratoarelor.

## 4. Glossary
Intrare unică per termen: `id`, `term`, `ro` (explicație scurtă), `what` (ce face), `how` (cum funcționează), `where` (unde apare în administrare), comandă/fișier asociat, lecții legate. Un termen definit într-o lecție se referă, nu se redefinește.

## 5. Cheatsheets (planificate; neimplementate încă)
Generate din blocurile de comenzi marcate din lecții (sintaxă, opțiuni uzuale, verificare, persistență); printabile; per capitol și generale. Fără conținut care nu apare în lecții.

## 6. Reguli de limbă
Română, cu diacritice corecte; comenzi, opțiuni, servicii, fișiere și parametri în engleză, în `cod`. Explicații în fraze complete, didactice; analogii pentru concepte abstracte; tabele pentru comparații.
