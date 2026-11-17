# Raport de verificare — cele 62 de obiective EX200

Generat la **2026-11-15** (Etapa 0). Sursa: https://www.redhat.com/en/services/training/ex200-red-hat-certified-system-administrator-rhcsa-exam (secțiunea „Study points for the exam”).

## Metodă (verificare independentă, în două surse)
1. **Sursa A — HTML descărcat** (`curl`, f0a76d4bcc0fd3ee… SHA-256 al HTML-ului, 339.867 octeți): lista a fost extrasă determinist (script Node care parcurge `<ul>` imbricat din secțiunea „Study points for the exam”).
2. **Sursa B — pagina randată în browserul integrat:** aceeași listă extrasă din DOM-ul paginii deschise, apoi SHA-256 calculat în pagină.
3. **Rezultat:** cele două liste (10 titluri de categorie + 62 de obiective = 72 de linii) au **aceeași amprentă SHA-256**: `cbc033aedc90326eac058c5dd0d1b26fc5a9f7ef1bbaf7919425894b5418b770`. Amprenta e înregistrată în `objectives.json` și verificată la fiecare rulare a `scripts/check-matrix.mjs`.
4. O citire inițială (rezumat automat al paginii, folosită doar la planificare) a dat aceleași numere pe categorii; **nu** a fost folosită ca dovadă, deoarece rezumatul nu garantează citate exacte.

Definiția amprentei: SHA-256 al textului UTF-8 format din titlul fiecărei categorii urmat de obiectivele ei, o linie pe element, separate prin \n, fără \n final.

## Rezultate
| Cat. | Titlu oficial | Obiective |
|---|---|---|
| C1 | Understand and use essential tools | 11 |
| C2 | Manage software | 4 |
| C3 | Create simple shell scripts | 4 |
| C4 | Operate running systems | 10 |
| C5 | Configure local storage | 6 |
| C6 | Create and configure file systems | 5 |
| C7 | Deploy, configure, and maintain systems | 6 |
| C8 | Manage basic networking | 4 |
| C9 | Manage users and groups | 4 |
| C10 | Manage security | 8 |
| | **Total** | **62** |

Confirmat: 10 categorii, 62 de subobiective, ordinea și textul identice între cele două surse. Pagina nu numerotează obiectivele; ID-urile `C<cat>-<n>` sunt interne.

## Fapte despre examen, așa cum apar pe pagina sursă
- Examenul „se bazează pe Red Hat Enterprise Linux 10” (pagina nu specifică release-ul minor).
- Examen practic („hands-on”); accesul la internet nu este asigurat; materialele personale (notițe, cărți, documentație electronică sau tipărită) nu sunt permise.
- Pagina precizează că, pentru majoritatea examenelor, documentația livrată cu produsul este disponibilă în timpul examenului. (Consecință pentru curriculum: lecția 1.2 despre `man`, `info` și `/usr/share/doc` este esențială.)
- Configurațiile trebuie să persiste după reboot, fără intervenție.
- **Nepublicate pe pagina sursă și deci nesetate în proiect** (`null`): durata examenului, scorul de promovare, ponderile pe categorii.

## Lista completă (verbatim din `objectives.json`) și lecția „casă”

### C1 — Understand and use essential tools

| ID | Obiectiv oficial | Lecții |
|---|---|---|
| C1-1 | Access a shell prompt and issue commands with correct syntax | L1.1 |
| C1-2 | Use input-output redirection (>, >>, \|, 2>, etc.) | L1.5 |
| C1-3 | Use grep and regular expressions to analyze text | L1.6 |
| C1-4 | Access remote systems using SSH | L1.11 |
| C1-5 | Log in and switch users in multi-user targets | L1.10 |
| C1-6 | Archive, compress, unpack, and uncompress files using tar, gzip, and bzip2 | L1.9 |
| C1-7 | Create and edit text files | L1.4 |
| C1-8 | Create, delete, copy, and move files and directories | L1.3 |
| C1-9 | Create hard and soft links | L1.7 |
| C1-10 | List, set, and change standard ugo/rwx permissions | L1.8 |
| C1-11 | Locate, read, and use system documentation including man, info, and files in /usr/share/doc | L1.2 |

### C2 — Manage software

| ID | Obiectiv oficial | Lecții |
|---|---|---|
| C2-1 | Configure access to RPM repositories | L2.1 |
| C2-2 | Install and remove RPM software packages | L2.2 |
| C2-3 | Configure access to Flatpak repositories | L2.4 |
| C2-4 | Install and remove Flatpak software packages | L2.5 |

### C3 — Create simple shell scripts

| ID | Obiectiv oficial | Lecții |
|---|---|---|
| C3-1 | Conditionally execute code (use of: if, test, [], etc.) | L3.3 |
| C3-2 | Use Looping constructs (for, etc.) to process file, command line input | L3.4 |
| C3-3 | Process script inputs ($1, $2, etc.) | L3.2 |
| C3-4 | Processing output of shell commands within a script | L3.5 |

### C4 — Operate running systems

| ID | Obiectiv oficial | Lecții |
|---|---|---|
| C4-1 | Boot, reboot, and shut down a system normally | L4.1 |
| C4-2 | Boot systems into different targets manually | L4.2 |
| C4-3 | Interrupt the boot process in order to gain access to a system | L4.3 |
| C4-4 | Identify CPU/memory intensive processes and kill processes | L4.4 |
| C4-5 | Adjust process scheduling | L4.5 |
| C4-6 | Manage tuning profiles | L4.6 |
| C4-7 | Locate and interpret system log files and journals | L4.7 |
| C4-8 | Preserve system journals | L4.8 |
| C4-9 | Start, stop, and check the status of network services | L4.9 |
| C4-10 | Securely transfer files between systems | L4.10 |

### C5 — Configure local storage

| ID | Obiectiv oficial | Lecții |
|---|---|---|
| C5-1 | List, create, and delete partitions on GPT disks | L5.1 |
| C5-2 | Create and remove physical volumes | L5.2 |
| C5-3 | Assign physical volumes to volume groups | L5.3 |
| C5-4 | Create and delete logical volumes | L5.4 |
| C5-5 | Configure systems to mount file systems at boot by universally unique ID (UUID) or label | L5.5 |
| C5-6 | Add new partitions and logical volumes, and swap to a system non-destructively | L5.6 |

### C6 — Create and configure file systems

| ID | Obiectiv oficial | Lecții |
|---|---|---|
| C6-1 | Create, mount, unmount, and use VFAT, ext4, and XFS file systems | L6.1 |
| C6-2 | Mount and unmount network file systems using NFS | L6.3 |
| C6-3 | Configure autofs | L6.4 |
| C6-4 | Extend existing logical volumes | L6.2 |
| C6-5 | Diagnose and correct file permission problems | L6.5 |

### C7 — Deploy, configure, and maintain systems

| ID | Obiectiv oficial | Lecții |
|---|---|---|
| C7-1 | Schedule tasks using at, cron and systemd timer units | L7.1, L7.2 |
| C7-2 | Start and stop services and configure services to start automatically at boot | L4.9 |
| C7-3 | Configure systems to boot into a specific target automatically | L4.2 |
| C7-4 | Configure time service clients | L7.3 |
| C7-5 | Install and update software packages from Red Hat Content Delivery Network, a remote repository, or from the local file system | L2.3 |
| C7-6 | Modify the system bootloader | L7.4 |

### C8 — Manage basic networking

| ID | Obiectiv oficial | Lecții |
|---|---|---|
| C8-1 | Configure IPv4 and IPv6 addresses | L8.2 |
| C8-2 | Configure hostname resolution | L8.3 |
| C8-3 | Configure network services to start automatically at boot | L4.9 |
| C8-4 | Restrict network access using firewalld and firewall-cmd | L8.4 |

### C9 — Manage users and groups

| ID | Obiectiv oficial | Lecții |
|---|---|---|
| C9-1 | Create, delete, and modify local user accounts | L9.1 |
| C9-2 | Change passwords and adjust password aging for local user accounts | L9.2 |
| C9-3 | Create, delete, and modify local groups and group memberships | L9.3 |
| C9-4 | Configure privileged access | L9.4 |

### C10 — Manage security

| ID | Obiectiv oficial | Lecții |
|---|---|---|
| C10-1 | Configure firewall settings using firewall-cmd/firewalld | L8.4 |
| C10-2 | Manage default file permissions | L10.1 |
| C10-3 | Configure key-based authentication for SSH | L10.2 |
| C10-4 | Set enforcing and permissive modes for SELinux | L10.3 |
| C10-5 | List and identify SELinux file and process context | L10.4 |
| C10-6 | Restore default file contexts | L10.5 |
| C10-7 | Manage SELinux port labels | L10.6 |
| C10-8 | Use Boolean settings to modify system SELinux settings | L10.7 |

## Observații
- **C7-1** are două lecții (L7.1 at/cron, L7.2 systemd timers); toate celelalte obiective au exact o lecție „casă”. Obiectivele care apar în mai multe categorii (firewall, instalare de pachete, servicii, targets) au o singură lecție comună, listată la ambele obiective: L8.4 (C8-4, C10-1), L2.3 (C7-5), L4.2 (C4-2, C7-3), L4.9 (C4-9, C7-2, C8-3).
- Nu există obiective oficiale pentru Podman, Stratis, VDO sau ACL; rămân în afara v1 (D-003).
- Verificarea e valabilă la data obținerii; la fiecare jalon major (Etapele 2, 5, 9) pagina se reverifică.
