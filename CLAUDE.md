# CLAUDE.md — RHCSA Learn

Răspunde în **română**. Comenzile Linux, opțiunile, numele serviciilor, fișierelor și parametrilor, terminologia tehnică consacrată rămân în **engleză**.

Platformă educațională (SPA Vite + React 19 + TS, statică, fără backend; D-015/D-016) pentru **Red Hat EX200 / RHEL 10**, pentru începători absoluți. Proiect **independent**: nu reutiliza și nu integra nimic din alte proiecte RHCSA. CCNA Learn (`C:\Projects\ccna-learn`) = fundația tehnică reutilizată (D-015), **strict read-only**: nu o modifica, nu reutiliza conținut CCNA.

## Ce citești și când
- **Mereu la început:** `docs/CURRENT_STATE.md`.
- **La scris/revizuit o lecție sau un lab:** `docs/WORKFLOW.md`, apoi `docs/LESSON_SPEC.md` sau `docs/LAB_SPEC.md`; modelul pilotului: `src/content/l1_3/`.
- **Doar la nevoie:** `docs/DECISIONS.md`, `docs/ARCHITECTURE.md`, `docs/REUSE_ANALYSIS.md`.
- **Cercetare:** `research/INDEX.md`, apoi doar nota lecției (`research/notes/<lecție>.md`). Nu citi integral `research/`.
- **Curriculum:** `content/curriculum/objectives.json` (62 obiective oficiale, verbatim) și `lessons-map.json`.

## Reguli ne-negociabile
1. **Doar obiectivele oficiale EX200 (RHEL 10).** Fără ponderi, durată sau scor de promovare nepublicate de Red Hat. Material suplimentar = marcat „suport / neoficial”. Podman, Stratis, VDO, ACL = în afara v1.
2. **Platforma nu execută și nu inspectează nimic pe sisteme externe** (fără VM, SSH, scripturi de setup/verify/reset, terminal). Autoevaluarea e declarată de cel care învață și etichetată ca atare; nu se amestecă cu scorurile quiz-urilor. Nu se pretinde niciodată verificarea unui sistem.
3. **Nu inventa output-uri.** Output-urile de comenzi sunt etichetate „Reconstituit din documentație” sau „Ilustrativ”; „Capturat” doar dacă proprietarul a furnizat explicit un output real.
4. **Profunzimea educațională nu se reduce pentru economie de tokeni.** Se optimizează selecția contextului și fluxul de lucru.
5. Fiecare variantă de răspuns din quiz are explicație (`why`). Fiecare comandă e explicată, cu opțiunile folosite.
6. Fiecare afirmație tehnică are sursă (documentație RHEL 10, man page, upstream); nesigur ⇒ se omite sau se marchează.
7. Lucrează secvențial, **o lecție sau un subiect principal pe sesiune**; fără subagenți dacă nu se cere. Citire selectivă.
8. **Aprobare explicită** necesară pentru: publicarea unei lecții și înregistrarea ei în `src/content/registry.ts`, schimbări de tipuri comune/dependențe/decizii, `git commit`/`push`. Nu face commit sau push fără cerere.
9. Stări (nu se confundă): Cercetată · Scrisă · Validată automat · Review didactic (doar proprietarul) · Publicată (doar proprietarul). Vezi WORKFLOW §3.

## Comenzi
```bash
npm install
npm run dev                     # http://localhost:5173
npm run verify                  # tsc --noEmit + vitest + vite build + check-matrix
node scripts/check-matrix.mjs   # validează matricea obiectivelor și harta lecțiilor (fără dependențe)
```
