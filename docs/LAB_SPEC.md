# LAB_SPEC — modelul de conținut al laboratoarelor și simulărilor

**Principiu (D-007):** laboratoarele sunt **conținut educațional**: scenarii practice și soluții explicate. Cel care învață rulează comenzile manual, pe propriul mediu Linux, dacă dorește. Platforma nu rulează comenzi, nu se conectează la niciun sistem, nu configurează și nu inspectează mediul utilizatorului și **nu afirmă niciodată că a verificat o stare reală**. Nu există infrastructură de laborator (VM, hypervisor, SSH, setup/reset, gradare automată).

## 1. Unitatea de bază: Task
Un laborator este alcătuit din unul sau mai multe task-uri. Fiecare task are:

### 1.1 Scenariu
- Sarcină realistă de administrare, formulată în stil examen.
- **Condiții inițiale** (descrise, nu create de platformă).
- **Starea finală așteptată.**
- **Obiective EX200 asociate** (ID-uri interne, din `objectives.json`).
- **Criterii de acceptare** clare, numerotate, cu `id` unic; fiecare cu o comandă de verificare manuală sugerată.

### 1.2 Soluție
- Pași în ordine; pentru fiecare: scop, comenzi complete, explicația fiecărei opțiuni relevante.
- Fișiere de configurare implicate și explicarea conținutului lor.
- Output-uri reprezentative, explicate, cu eticheta obligatorie (**Reconstituit din documentație** / **Ilustrativ** / **Capturat** doar dacă proprietarul a furnizat outputul real).
- **Verificare manuală:** comenzi și rezultatul așteptat.
- **Persistență:** ce trebuie să supraviețuiască reboot-ului, de ce, cum se confirmă manual.
- Greșeli frecvente și troubleshooting.
- **Soluții alternative valide**, unde există.

## 2. Moduri de prezentare (aceeași sursă de conținut)
| Mod | Prezentare |
|---|---|
| **Guided Lab** | scenariul, apoi pașii soluției dezvăluiți progresiv, cu explicații, indicii și întrebări de reflecție |
| **Independent Lab** | doar scenariul și criteriile; soluția e ascunsă și se dezvăluie la cerere |
| **Exam Simulation** | mai multe task-uri independente, fără indicii sau soluții până când cel care învață termină |

## 3. Autoevaluare (singura „evaluare” a laboratoarelor)
- Fiecare criteriu de acceptare are o bifă manuală „Am verificat eu că…”, salvată local (localStorage, D-016), cu export/import JSON.
- Textul din interfață: „declarat de tine”, „autoevaluare”. Interzis: „verificat”, „confirmat”, „corect” aplicat unei stări reale.
- Bifele nu se amestecă cu scorurile quiz-urilor și nu produc un scor „de execuție verificată”.

## 4. Exam Simulation
- Set de task-uri independente (fără indicii), cronometru în browser, durată configurabilă și etichetată „estimat” (durata oficială nu e publicată pe pagina sursă).
- La final: soluțiile se dezvăluie; cel care învață parcurge criteriile și le bifează.
- Scoruri **separate**: (a) **scor automat** — doar pentru părțile cu răspuns în platformă (completare de comandă, interpretare de output, găsește greșeala, alegeri); (b) **scor autoevaluat** — task-uri practice, pe baza bifelor. Niciun scor general combinat care sugerează verificarea execuției practice.
- Raport pe categorie și obiectiv, cu trimiteri la lecții.
- Nu se pretinde că task-urile sunt întrebări reale de examen; ponderile nu se afișează.

## 5. Schema (implementată ca tip TypeScript `Lab` în `src/lab/types.ts`; validată de `tests/content.test.ts`; în loc de frontmatter MDX, D-015/D-016)
```yaml
id: lab-c05-lvm-extend
chapter: C5
modes: [guided, independent]          # exam-simulation: tasks în exams/
objectives: [C5-3, C5-4, C6-4]
difficulty: 1 | 2 | 3
estimatedMinutes: 25
initialConditions: ["..."]            # descrise, nu create de platformă
finalState: ["..."]
acceptanceCriteria:
  - { id: ac1, text: "...", manualCheck: "lvs; df -h /mnt/data" }
persistence: ["..."]                  # cerințe de persistență descrise
sources: [{ kind: doc, ref: "...", accessed: "AAAA-LL-ZZ" }]
outputs: [{ id: out-1, label: reconstructed | illustrative | captured }]   # UI: Reconstituit din documentație / Ilustrativ / Capturat
```
Corpul MDX conține secțiunile `Scenariu` și `Soluție` (pași cu `Explicație`, `Verificare manuală`, `Persistență`, `Greșeli frecvente`, `Alternative`).

## 6. Validări (din Etapa 1)
Scenariu complet (condiții, stare finală, obiective, criterii); soluție cu pași, comenzi explicate, verificare manuală și persistență; `id` unice pentru criterii; fiecare obiectiv are cel puțin un lab; etichete pe toate output-urile; fără termeni interzisi în textul interfeței (vezi §3).
