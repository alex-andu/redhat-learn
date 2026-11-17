# WORKFLOW — scrierea unei lecții sau a unui laborator

Procedura unică. Standardul educațional nu se negociază; ce se optimizează e contextul citit, nu materialul.

## 1. Precedență documente
`CLAUDE.md` → `docs/WORKFLOW.md` → `docs/LESSON_SPEC.md` / `docs/LAB_SPEC.md` → `docs/CURRENT_STATE.md` → `docs/DECISIONS.md` → `research/INDEX.md`.

## 2. Pașii pentru o lecție (în ordine, o lecție per sesiune)
1. **Pregătire:** `CURRENT_STATE.md`; intrarea lecției din `lessons-map.json`; textul obiectivelor din `objectives.json`.
2. **Cercetare** (înainte de scris): creează `research/notes/<lecție>.md` cu: obiective oficiale acoperite, surse (URL + dată accesare), afirmații-cheie, comenzi și opțiuni verificate în sursă, diferențe față de RHEL 8/9, nesigurante. Adaugă lecția în `research/INDEX.md`. Sursele, în ordine: documentația RHEL 10 (docs.redhat.com), man pages, documentația upstream (systemd, LVM, XFS, SELinux, NetworkManager, firewalld), RFC-uri. Nu amesteca obiective din versiuni vechi ale examenului.
3. **Scriere** conform `LESSON_SPEC.md` (teorie, comenzi explicate, diagrame, troubleshooting, quiz, glossary, cheatsheet) și `LAB_SPEC.md` (laboratoare). Public: începător absolut; nu presupune concepte neintroduse.
4. **Validare automată:** `npm run verify` (typecheck + Vitest + build + `check-matrix`).
5. **Raport** scurt: ce s-a scris, surse, ce e incert, ce lipsește.
6. **Review didactic și publicare:** doar proprietarul.

## 3. Stări (independente)
| Stare | Cine o declară |
|---|---|
| Cercetată (notă de cercetare completă, fără nesigurante nerezolvate) | agentul |
| Scrisă (toate componentele lecției există) | agentul |
| Validată automat (validările aplicabile au rulat efectiv și au trecut) | agentul, cu dovadă |
| Review didactic | **doar proprietarul** |
| Publicată | **doar proprietarul** |
| „Testată de proprietar pe RHEL 10” (opțional) | **doar proprietarul** |
Existența unui fișier nu înseamnă stare. Validare neefectuată ⇒ nu se acordă „Validată automat”.

## 4. Dovezi și etichetarea output-urilor
Agentul nu poate rula RHEL 10; platforma nu execută nimic. Prin urmare:
- Fiecare comandă din lecții/laboratoare are în frontmatter sursa documentară (`doc`, `man`, `upstream`) cu URL.
- Fiecare bloc de output are o etichetă vizibilă: **Reconstituit din documentație** (derivat din documentație/man, nu capturat), **Ilustrativ** (exemplu construit pentru explicație; valorile pot diferi) sau **Capturat** (doar dacă proprietarul a furnizat explicit un output real).
- Nu se inventează versiuni, valori implicite, mesaje de eroare sau cifre; nesigur ⇒ formulare prudentă sau omitere + notă în raport.

## 5. Autoevaluare și scoruri
- Quiz-urile se notează automat; laboratoarele și task-urile practice se **autoevaluează** (bife manuale, salvate local). Cele două surse se afișează **separat**; niciun scor general nu sugerează verificarea execuției practice.
- Interfața folosește formulări de tipul „declarat de tine”, „autoevaluare”; niciodată „verificat”, „confirmat de platformă”.

## 6. Eficiența contextului
- Un subiect principal per sesiune; citire selectivă (`offset`/`limit`, `grep` după titluri); nu reciti ce a fost deja validat.
- Fără reanalizarea întregului repo; fără subagenți în fluxul implicit.
- Stare și matrice generate de scripturi (din Etapa 1), nu întreținute de mână.
- Documente de proces scurte: WORKFLOW ≤ ~8 KB, CLAUDE.md ≤ ~60 de rânduri, ARCHITECTURE ≤ ~6 KB.

## 7. Aprobări
Aprobare explicită a proprietarului pentru: publicare, modificarea schemelor, adăugarea de dependențe, schimbarea deciziilor din `DECISIONS.md`, commit/push. O aprobare nu se extinde la alt caz.
