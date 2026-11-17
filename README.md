# RHCSA Learn

Platformă educațională în limba română pentru certificarea **Red Hat Certified System Administrator (RHCSA) – EX200**, bazată pe **Red Hat Enterprise Linux 10**, pentru începători absoluți în Linux.

- **Ce este:** lecții detaliate, quiz-uri cu explicații pe fiecare variantă, glosar cu tooltip, căutare, repetare FSRS, laboratoare (scenariu + soluție explicată) și simulări de examen.
- **Ce NU este:** o platformă de gestionare a laboratoarelor sau de automatizare a VM-urilor. Nu se conectează la sisteme Linux, nu rulează comenzi și nu verifică starea unui sistem. Autoevaluarea este declarată de cel care învață și este etichetată ca atare, separat de scorurile quiz-urilor.
- **Proiect independent.** Fundația tehnică (Vite + React, design system, motor de quiz) provine din proiectul propriu CCNA Learn; conținutul este exclusiv RHCSA.
- **Curriculum:** exclusiv cele 62 de obiective oficiale EX200 publicate de Red Hat (`content/curriculum/objectives.json`), în 68 de lecții (`lessons-map.json`). Ponderile, durata și scorul de promovare nu sunt publicate pe pagina oficială și nu sunt afirmate aici.
- **Notă:** proiect neafiliat Red Hat. „Red Hat”, „RHEL”, „RHCSA” sunt mărci ale Red Hat, Inc.

## Stare
Aplicația funcționează; pilotul C1 (L1.1, L1.2, L1.3, L1.5) este scris și așteaptă review-ul proprietarului. Vezi `docs/CURRENT_STATE.md`.

## Rulare locală (Node 22+)
```bash
npm install
npm run dev        # http://localhost:5173
npm run verify     # typecheck + teste + build + validarea matricei
npm run build && npm run preview   # versiunea de producție
```
