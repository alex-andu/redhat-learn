# DECISIONS — decizii stabilite cu proprietarul (nu se reiau)

Înregistrări numerotate, imuabile; o decizie nouă o înlocuiește explicit pe cea veche.

| ID | Decizie | Stabilită |
|---|---|---|
| D-001 | **Proiect independent** `rhcsa-learn` în `C:\Projects\rhcsa-learn`, propriul repo, cod, documentație și workflow. Nu se reutilizează sau integrează nimic din proiecte RHCSA anterioare (inclusiv InfraForge RHCSA și simulatoare anterioare). | 2026-11-15 |
| D-002 | **CCNA Learn = doar referință educațională și vizuală**, read-only: structură, UX, prezentarea teoriei, quiz-uri, glossary, progres, principii pedagogice. Nu se copiază cod și nu se modifică. | 2026-11-15 |
| D-003 | **Curriculum:** exclusiv obiectivele oficiale EX200 (RHEL 10) din pagina Red Hat: 10 categorii, 62 de obiective, verificate la 2026-11-15. Fără ponderi, durată sau scor de promovare nepublicate. Podman, Stratis, VDO și ACL = în afara v1; SUID/SGID/sticky bit doar unde sunt necesare pentru obiectivele oficiale. | 2026-11-15 |
| D-004 | **M0** = modul introductiv separat, marcat „material de suport, nu obiectiv oficial”. M0.2 = „Cum folosești laboratoarele”. | 2026-11-15 |
| D-005 | **Limbă:** română; comenzi, opțiuni, nume de servicii/fișiere/parametri și terminologia consacrată rămân în engleză. | 2026-11-15 |
| D-006 | **Stack:** Astro + MDX + React islands, TypeScript, Zod, Pagefind; static, fără backend în v1; progres local-first (IndexedDB) cu export/import JSON. | 2026-11-15 |
| D-007 | **Fără infrastructură de laborator.** Platforma nu are integrare cu VM-uri sau hypervisoare, SSH/terminale remote, setup/reset automat, inspecție sau verificare a stării unui sistem, scripturi care modifică sau inspectează mediul utilizatorului. Nu există `rhcsa-lab`, `lab.yaml` executabil sau gradare pe stare reală. Platforma doar predă, demonstrează și explică. | 2026-11-15 |
| D-008 | **Laboratoare:** Scenario + Solution; moduri Guided Lab, Independent Lab, Exam Simulation. Autoevaluare prin bife manuale, salvate local, niciodată prezentate ca verificări ale platformei și niciodată amestecate cu scorurile quiz-urilor. | 2026-11-15 |
| D-009 | **Output-uri:** eticheta „Reconstituit din documentație”; „Ilustrativ” explicit; „Capturat” doar la output real furnizat de proprietar. Nu se inventează output-uri. | 2026-11-15 |
| D-010 | **Exam Simulation:** scorurile automate (întrebări în platformă) și cele autoevaluate (task-uri practice) se afișează separat; niciun scor general care sugerează verificarea execuției practice. | 2026-11-15 |
| D-011 | **Quiz-uri:** numărul per lecție se stabilește după evaluarea pilotului. Obligatorii: calitate, diversitate, explicație pentru fiecare variantă. | 2026-11-15 |
| D-012 | **Pilot:** lecțiile 1.1, 1.2, 1.3 și 1.5 (C1). Restul capitolului după review-ul și aprobarea proprietarului. | 2026-11-15 |
| D-013 | **Workflow:** o lecție principală per sesiune, documentație concisă, cercetare indexată, validare automată, fără subagenți în fluxul implicit; profunzimea nu se reduce. Fără commit/push fără aprobare explicită. | 2026-11-15 |
| D-014 | **Ordinea de predare:** M0 → C1 → C9 → C2 → C3 → C4 → C7 → C8 → C5 → C6 → C10 → recapitulare. Capitolele păstrează numerotarea categoriilor oficiale. Obiectivele duplicate au o singură lecție „casă”. | 2026-11-15 |
| D-015 | **Fundația aplicației = arhitectura CCNA Learn** (Vite + React 19 + TS, design system, motor de quiz, glosar, FSRS), reutilizată direct în `rhcsa-learn`; CCNA rămâne read-only, fără conținut CCNA. Înlocuiește D-006 (Astro + MDX + Zod + Pagefind) și partea „nu se copiază cod” din D-002. Propunerea Astro este arhivată în `docs/archive/`. | 2026-11-15 |
| D-016 | **Fără backend; persistență în localStorage** (cheie `rhcsa-learn:v1`) cu export/import JSON; interfața `api.ts` păstrată din CCNA. Înlocuiește IndexedDB din D-006. Conținut ca date TS/TSX validate cu Vitest (în loc de MDX/YAML + Zod). | 2026-11-15 |
| D-017 | **Pilot livrat ca „Scris”, nu „Publicat”:** L1.1, L1.2, L1.3, L1.5 au 8–9 întrebări fiecare (toate tipurile), un laborator Guided/Independent și o simulare C1; numărul de întrebări per lecție rămâne de stabilit după review (D-011). Lecțiile sunt înregistrate în `registry.ts` pentru ca aplicația să le afișeze; revizuirea didactică și publicarea rămân ale proprietarului. | 2026-11-15 |
