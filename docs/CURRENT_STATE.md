# CURRENT STATE

Actualizat: 2026-11-17 · **Aplicația există (fundație CCNA Learn adaptată) + capitolele C1 (11/11), C2 (5/5), C3 (5/5) C4 (10/10 lecții), C5 (6/6 lecții), C6 (5/5 lecții), C7 (4/4 lecții noi: L7.1–L7.4; L2.3, L4.2 și L4.9 acoperă restul obiectivelor C7) C8 (4/4 lecții: L8.1 suport, L8.2–L8.4; C8-3 e acoperit de L4.9) C9 (4/4 lecții: L9.1–L9.4) și C10 (8/8 lecții: L10.1–L10.8; C10-1 este acoperit de L8.4) și capitolul de suport M0 (4/6: M0.1, M0.3, M0.4, M0.5) scrise, în așteptarea review-ului proprietarului.** Nimic nu este comis (repo local, fără commit, fără remote).

## Ce există și e verificat (rulat efectiv)
- Aplicație SPA Vite + React 19 + TS (D-015/D-016). `npm run verify`: typecheck ✓, Vitest 20/20 ✓ (re-rulat după M0), build ✓, `check-matrix` ✓.
- Curriculum integrat din `content/curriculum/*.json`: 10 categorii, 62 obiective, 68 lecții (59 oficiale, 9 suport), 11 capitole; pagini: Curriculum, Harta obiectivelor (`/obiective`, 62/62 cu lecție „casă”).
- Funcționalități: lecții, quiz (single, multi, match, order, completare de comandă, găsește greșeala, interpretează output-ul; `why` pe fiecare variantă), glosar cu tooltip, căutare locală, FSRS (Repetare + Flashcards), notițe/bookmark, progres, laboratoare Guided/Independent cu autoevaluare declarată, simulare de examen cu scoruri separate (automat vs autoevaluat), export/import JSON.
- Verificat manual în browser (dev server): lecție, răspuns la quiz cu explicații, persistență după reload, bifă de autoevaluare, simulare + salvare, tooltip glosar, căutare, layout mobil 375 px fără overflow orizontal, zero erori de consolă.

## Lecții — stări (WORKFLOW §3)
| Lecție | Cercetată | Scrisă | Validată automat | Review didactic | Publicată |
|---|---|---|---|---|---|
| L1.1 Shell | parțial¹ | da | da² | — | — |
| L1.2 man/info | parțial¹ | da | da² | — | — |
| L1.3 Fișiere/directoare | parțial¹ | da | da² | — | — |
| L1.5 Redirecționare/pipe | parțial¹ | da | da² | — | — |
| L1.4 Fișiere text / editoare | parțial¹ | da | da² | — | — |
| L1.6 grep și regex | parțial¹ | da | da² | — | — |
| L1.7 Link-uri hard/soft | parțial¹ | da | da² | — | — |
| L1.8 Permisiuni ugo/rwx | parțial¹ | da | da² | — | — |
| L1.9 tar/gzip/bzip2 | parțial¹ | da | da² | — | — |
| L1.10 Login și schimbarea utilizatorului | parțial¹ | da | da² | — | — |
| L1.11 SSH | parțial¹ | da | da² | — | — |
| L2.1 RPM și repository-uri | parțial³ | da | da² | — | — |
| L2.2 Instalare/ștergere RPM | parțial³ | da | da² | — | — |
| L2.3 Instalare/actualizare: CDN, remote, local (C7-5) | parțial³ | da | da² | — | — |
| L2.4 Repository-uri Flatpak | parțial³ | da | da² | — | — |
| L2.5 Instalare/ștergere Flatpak | parțial³ | da | da² | — | — |
| L3.1 Structura unui script (suport) | parțial⁴ | da | da² | — | — |
| L3.2 Parametrii scriptului $1, $2 | parțial⁴ | da | da² | — | — |
| L3.3 if, test, [ ] | parțial⁴ | da | da² | — | — |
| L3.4 Bucle for | parțial⁴ | da | da² | — | — |
| L3.5 Procesarea output-ului în script | parțial⁴ | da | da² | — | — |
| L4.1 Boot, reboot, shutdown | parțial⁵ | da | da² | — | — |
| L4.2 Targets systemd | parțial⁵ | da | da² | — | — |
| L4.3 Întreruperea boot-ului (rd.break) | parțial⁵ | da | da² | — | — |
| L4.4 Procese: ps, top, kill | parțial⁵ | da | da² | — | — |
| L4.5 nice / renice | parțial⁵ | da | da² | — | — |
| L4.6 tuned | parțial⁵ | da | da² | — | — |
| L4.7 Log-uri și journal | parțial⁵ | da | da² | — | — |
| L4.8 Journal persistent | parțial⁵ | da | da² | — | — |
| L4.9 Servicii systemd | parțial⁵ | da | da² | — | — |
| L4.10 scp, sftp, rsync | parțial⁵ | da | da² | — | — |
| L5.1 Discuri și partiții GPT | parțial⁶ | da | da² | — | — |
| L5.2 LVM: PV | parțial⁶ | da | da² | — | — |
| L5.3 Grupuri de volume (VG) | parțial⁶ | da | da² | — | — |
| L5.4 Volume logice (LV) | parțial⁶ | da | da² | — | — |
| L5.5 Montare persistentă UUID/label | parțial⁶ | da | da² | — | — |
| L5.6 Swap și adăugare non-distructivă | parțial⁶ | da | da² | — | — |
| L6.1 VFAT, ext4, XFS | parțial⁷ | da | da² | — | — |
| L6.2 Extinderea LV și a sistemelor de fișiere | parțial⁷ | da | da² | — | — |
| L6.3 NFS: montare/demontare | parțial⁷ | da | da² | — | — |
| L6.4 autofs | parțial⁷ | da | da² | — | — |
| L6.5 Diagnosticarea permisiunilor | parțial⁷ | da | da² | — | — |
| L7.1 at și cron | parțial⁸ | da | da² | — | — |
| L7.2 systemd timers | parțial⁸ | da | da² | — | — |
| L7.3 chrony | parțial⁸ | da | da² | — | — |
| L7.4 Bootloader (GRUB) | parțial⁸ | da | da² | — | — |
| L8.1 Concepte IPv4 și IPv6 (suport) | parțial⁹ | da | da² | — | — |
| L8.2 Adrese IPv4/IPv6 cu NetworkManager | parțial⁹ | da | da² | — | — |
| L8.3 Hostname și rezoluția numelor | parțial⁹ | da | da² | — | — |
| L8.4 firewalld și firewall-cmd | parțial⁹ | da | da² | — | — |
| L9.1 Conturi locale de utilizator | parțial¹⁰ | da | da² | — | — |
| L9.2 Parole și password aging | parțial¹⁰ | da | da² | — | — |
| L9.3 Grupuri și apartenența la grupuri | parțial¹⁰ | da | da² | — | — |
| L9.4 Acces privilegiat: sudo | parțial¹⁰ | da | da² | — | — |
| L10.1 Permisiuni implicite (umask) | parțial¹¹ | da | da² | — | — |
| L10.2 Autentificare SSH cu chei | parțial¹¹ | da | da² | — | — |
| L10.3 SELinux: model și moduri | parțial¹¹ | da | da² | — | — |
| L10.4 Contexte SELinux fișiere/procese | parțial¹¹ | da | da² | — | — |
| L10.5 Restaurarea contextelor implicite | parțial¹¹ | da | da² | — | — |
| L10.6 Port labels SELinux | parțial¹¹ | da | da² | — | — |
| L10.7 Boolean-uri SELinux | parțial¹¹ | da | da² | — | — |
| L10.8 Troubleshooting SELinux (suport) | parțial¹¹ | da | da² | — | — |
| M0.1 Linux, RHEL și subscripțiile Red Hat (suport) | parțial¹² | da | da² | — | — |
| M0.3 Shell-ul și anatomia unei comenzi (suport) | parțial¹² | da | da² | — | — |
| M0.4 Ierarhia sistemului de fișiere (suport) | parțial¹² | da | da² | — | — |
| M0.5 Harta sistemului (suport) | parțial¹² | da | da² | — | — |
Celelalte 2 lecții (M0.2 Cum folosești laboratoarele, M0.6 Cum se învață și se susține un examen practic; suport): nescrise (pagină „în pregătire”).
¹ Fără acces la RHEL 10; în sesiunea C1 sursele online nu au fost consultate (L1.4, L1.6–L1.11: doar man pages/upstream, din cunoștințe; URL-urile RHEL 10 nu au fost redeschise); surse = man pages/GNU; secțiunea „nesigurante” din `research/notes/<lecție>.md` listează ce rămâne de confirmat.
³ C2: paginile docs.redhat.com (RHEL 10) au răspuns HTTP 403 și NU au fost citite; surse folosite: referința DNF upstream (citită), flatpak docs (citit doar `flatpak info`), man pages/cunoștințe. De confirmat: versiunea DNF din RHEL 10 și sintaxa `dnf config-manager`, URL-ul/autentificarea remote-ului Flatpak Red Hat, `rhc` vs `subscription-manager`, ID-urile repo Red Hat. Exemplele (pachete, versiuni, ID-uri Flatpak, URL-uri) sunt fictive/Ilustrative.
⁴ C3: citit efectiv (2026-11-16) doar GNU Bash Manual „Looping Constructs” și „Bash Conditional Expressions”; celelalte pagini gnu.org au dat HTTP 429, docs.redhat.com nu a fost reaccesat (403 în C2). Restul: bash(1), man pages, cunoștințe. Toate output-urile sunt „Ilustrativ”; nimic rulat pe RHEL 10. Versiunea bash din RHEL 10 și mesajele exacte de eroare de confirmat. L3.1 este lecție de suport: laboratorul ei nu are obiectiv oficial asociat.
⁵ C4: docs.redhat.com (RHEL 10) → HTTP 403, NU a fost citit; citit efectiv (2026-11-16) doar freedesktop.org `systemd.special` (target-uri). Restul: man pages și cunoștințe, nerecitite în sesiune. Procedura `rd.break` (L4.3) provine din practica RHEL 8/9, de confirmat pe RHEL 10. De confirmat: stocarea implicită a jurnalului și existența rsyslog/`/var/log/messages` pe RHEL 10 (L4.7–L4.8), lista profilurilor tuned (L4.6), numele liniei kernelului din GRUB (`linux`), versiunea OpenSSH/rsync. Toate output-urile sunt „Ilustrativ”; nimic rulat pe RHEL 10. Laboratoarele L4.1–L4.3 și L4.9 implică reboot sau oprirea de servicii: se fac doar pe o mașină proprie de test.
⁶ C5: docs.redhat.com (RHEL 10) necitit (403 anterior; neîncercat din nou); surse: man pages și cunoștințe. De confirmat: fișierul de dispozitive LVM pe RHEL 10, recomandările de dimensionare swap, mesajele exacte ale `findmnt --verify`/`lvextend`. Output-uri toate „Ilustrativ”. Laboratoarele scriu pe disc: doar pe un disc de test gol; L5.6 menționează și fișier swap.
⁷ C6: docs.redhat.com (RHEL 10) → HTTP 403 la 2026-11-16, NECITIT. Citite efectiv (man7.org, 2026-11-16): `mkfs.xfs`, `mkfs.fat`, `mke2fs`, `mount` (primele ~100 000 caractere), `umount`, `resize2fs`, `xfs_growfs`, `lvextend`, `nfs(5)`, `exports(5)`, `showmount`, `autofs(5)`, `auto.master(5)`, `automount(8)`, `chmod`, `namei`. Restul (opțiunile `xfs_admin`, `tune2fs`, `fsadm`, `nfsstat`, `ausearch`, sintaxa `--timeout=` în master map, reload vs restart autofs, `umask` implicit, pachete preinstalate) din cunoștințe, de confirmat pe RHEL 10. Output-urile sunt toate „Ilustrativ”; nimic rulat pe RHEL 10. Laboratoarele L6.1–L6.2 scriu pe disc (doar disc de test); L6.3–L6.4 cer un server NFS propriu al celui care învață (platforma nu oferă și nu verifică niciunul); L6.5 creează utilizatori de test. În C6 s-a mărit adâncimea (≈20–30 KB/lecție, 11–12 întrebări, note de research detaliate).
⁸ C7: docs.redhat.com (RHEL 10) → HTTP 403 la 2026-11-16, NECITIT. Citite efectiv (2026-11-16): crontab(5), crontab(1) (man7), at(1), at.allow(5), cron(8), anacrontab(5) (man.archlinux.org), systemd.timer(5), systemd.time(7) (man7), chrony.conf și chronyc 4.6.1 (chrony-project.org; chrony.conf parțial, ~100 000 din ~150 000 caractere), chronyd(8), timedatectl(1), GNU GRUB manual „Simple configuration”, grubby(8) (pagină veche die.net). Restul din cunoștințe, de confirmat pe RHEL 10: conținutul implicit al `/etc/chrony.conf`, calea `grub.cfg` (BIOS/UEFI), interacțiunea `/etc/default/grub` ↔ intrările BLS existente, `grubby --default-index`, `WantedBy=timers.target`, `systemd-run --on-active`, `PATH` implicit din cron, `/etc/cron.deny` implicit. Output-urile sunt toate „Ilustrativ”; nimic rulat pe RHEL 10. Laboratoarele L7.1–L7.3 rulează job-uri/servicii pe o mașină de test; L7.3 cere acces la un server NTP (nu îl oferă platforma); L7.4 modifică bootloader-ul și cere reboot: doar pe VM de test, cu instantaneu. În C7 s-a mărit teoria (secțiuni „concepte de la zero”, tabele comparative, 12 întrebări/lecție, 5 laboratoare: 2 la L7.1).
⁹ C8: docs.redhat.com (RHEL 10) → HTTP 403 la 2026-11-16, NECITIT. Citite efectiv (2026-11-16): nmcli (referința NetworkManager „latest”) și nm-settings-nmcli (networkmanager.dev; ~200 000 din ~208 500 caractere), hostnamectl(1), hosts(5), nsswitch.conf(5), resolv.conf(5) (man7.org), firewall-cmd(1) și „Predefined zones” (firewalld.org). Necitite: nmcli(1) pe man7 (404), firewalld.richlanguage(5) (404), RFC-urile din L8.1 (din cunoștințe). De confirmat pe RHEL 10: sintaxa `hostnamectl hostname` vs `set-hostname`, formatul keyfile și absența `ifcfg`, numele implicit al profilurilor, serviciile implicite din zona `public` (inclusiv `cockpit`), sintaxa rich rules, linia `hosts:` din nsswitch.conf, pachetul `bind-utils`, `connection.zone`. Output-urile sunt toate „Ilustrativ”; nimic rulat pe RHEL 10. Laboratoarele L8.2–L8.4 modifică rețeaua/firewall-ul: doar pe o mașină de test, cu acces la consolă (risc de pierdere a SSH); L8.1 doar citește. Adresele din exemple sunt din intervale de documentație (192.0.2.0/24, 2001:db8::/32).
¹⁰ C9: docs.redhat.com (RHEL 10) → HTTP 403 la 2026-11-17, NECITIT (inclusiv „Managing sudo access”). Citite efectiv (2026-11-17, man7.org): useradd(8), usermod(8), userdel(8), groupadd(8), groupmod(8), groupdel(8), gpasswd(1), passwd(1), chage(1), shadow(5), login.defs(5), id(1), visudo(8), sudo(8), sudoers(5) (doar primele ~100 000 din ~235 700 caractere). Necitite: passwd(5), group(5), gshadow(5), newgrp(1), chpasswd(8), pwquality.conf(5), nologin(8). De confirmat pe RHEL 10: valorile din `/etc/login.defs` și `/etc/default/useradd` (CREATE_HOME, USERGROUPS_ENAB, PASS_*, SYS_UID_*), conținutul `/etc/sudoers` (regula `%wheel`, directiva include) și permisiunile 0440 din sudoers.d, formatul ieșirii `chage -l` și `passwd -S` (L/LK, PS), algoritmul de hash implicit, `passwd --stdin`, `groupmod -aU`, calea `nologin`. Output-urile sunt toate „Ilustrativ”; nimic rulat pe RHEL 10. Laboratoarele modifică conturi, grupuri și politica sudo: doar pe o mașină de test (VM cu instantaneu și o cale de rezervă spre root la L9.4). În C9 s-a mărit adâncimea (≈30–40 KB/lecție, 13 întrebări, 2 laboratoare/lecție).
¹¹ C10: docs.redhat.com (RHEL 10) → HTTP 403 la 2026-11-17, NECITIT (inclusiv „Using SELinux” și „Securing network access”). Citite efectiv (2026-11-17, man7.org): ssh-keygen(1), sshd(8), sshd_config(5), ssh-copy-id(1), ssh-add(1), ssh(1) (prin extragere), umask(1p), login.defs(5), pam_umask(8), systemd.exec (UMask=, primele 100 000 din ~245 000 caractere), selinux(8), selinux_config(5), setenforce(8), sestatus(8), ausearch(8), semanage-fcontext(8), semanage-port(8), semanage-boolean(8), restorecon(8), matchpathcon(8), setsebool(8), getsebool(8). Necitite (404/429/necitite): chcon(1), audit2why(8), getenforce(8), ls/ps/id/stat `-Z`/`%C`, sealert, ssh-agent(1), fixfiles(8). De confirmat pe RHEL 10: umask implicit și locul unde se setează (/etc/profile, /etc/bashrc, pam_umask), comportamentul `SELINUX=disabled` pe kernelul nou (sursa spune doar „depreciat”, metoda este `selinux=0`), conținutul /etc/sshd_config și permisiunile setate de `ssh-copy-id`, locația fișierelor file_contexts, pachetul `policycoreutils-python-utils` (semanage) și `setroubleshoot-server`, lista tipurilor de port http_port_t, lista/valorile implicite ale boolean-urilor, formatul `getsebool -a`/`semanage boolean -l`. Output-urile sunt toate „Ilustrativ”; nimic rulat pe RHEL 10. Laboratoarele C10 modifică securitatea sistemului (SELinux, SSH, sudo-like): doar pe VM de test cu instantaneu și cu acces la consolă; L10.2B, L10.3B, L10.6B, L10.7B, L10.8 cer reboot sau servicii (httpd). În C10 s-a mărit adâncimea (≈25–40 KB/lecție, 12–13 întrebări, 2 laboratoare/lecție, note de research detaliate). L10.8 este lecție de suport (fără obiectiv propriu); C10-1 (firewall-cmd) rămâne acoperit de L8.4 (nemodificat).
¹² M0 (suport, fără obiectiv oficial; întrebările au `objectives: []`): docs.redhat.com (RHEL 10) → HTTP 403 la 2026-11-17, NECITIT (release notes 10.0, „Considerations in adopting RHEL 10”); FHS 3.0 (Anubis „Access Denied”) și freedesktop „usr merge” (403) necitite. Citite efectiv (2026-11-17): pagina Red Hat „RHEL Life Cycle” (5+5 ani, Extended Life 4 ani din diagramă, ELCP 10.2/10.4/10.6/10.8/10.10), hier(7), path_resolution(7), os-release(5), GNU Bash Manual „Definitions”, developers.redhat.com (nu confirmă condițiile abonamentului gratuit); căutare web: nucleu 6.12, OpenSSH 9.9 în 10.0. Pagina examenului EX200 → 404; durata/regulile examenului NU sunt afirmate. De confirmat pe RHEL 10: starea /usr/sbin (legătură sau director), /tmp tmpfs sau pe disc, ID-urile repository (`rhel-10-for-…`), `rhc`, `ID_LIKE`/„Coughlan” din os-release, versiunea bash, alias-urile implicite și PS1, formatul `systemctl status`/`ss`/`ps`. Toate output-urile sunt „Ilustrativ”; nimic rulat pe RHEL 10. Laboratoarele M0 doar citesc, cu excepția creării de fișiere în `~/m03`, `~/m04`, `~/bin-test` și a unui alias în `~/.bashrc` (M0.3B); M0.1B cere ca cel care învață să-și pregătească singur VM-ul (platforma nu îl creează). În M0 s-a mărit adâncimea (≈35–50 KB/lecție, 12 întrebări, 2 laboratoare/lecție, 11–15 termeni noi de glosar/lecție). Fișierele de întrebări M0 se numesc `lm0_*.ts` ca să fie prinse de glob-ul `./l*.ts` din `questions/index.ts` (fără a modifica codul comun).
² Validare = typecheck + teste de conținut + build; nu include testare pe un sistem RHEL 10. Review și publicare: doar proprietarul.

## Nu există încă
Cheatsheets, diagrame SVG, lecțiile M0.2 și M0.6, simulări de examen care să includă laboratoarele noi din C1 (simularea `sim-c1-pilot` nu a fost modificată; nu există simulare pentru C2–C5).

## Limite cunoscute
- Output-urile sunt toate „Ilustrativ” sau „Reconstituit din documentație”; nimic „Capturat”.
- Persistența e doar în browser (localStorage); fără sincronizare.
- Căutarea este simplă (potrivire de text), fără index.
- `check-content` din CCNA nu a fost portat; echivalentul e `tests/content.test.ts`.

## Pași următori (decide proprietarul)
1. Review didactic al lecțiilor C1 (L1.1–L1.11: conținut, adâncime, număr de întrebări — D-011) și decizia de publicare; în special punctele din secțiunea „Nesigurante” a fiecărei note `research/notes/L1.x.md` (editoare/pachete implicite pe RHEL 10, umask implicit, comportament `wheel`/`sudo`, versiunea grep, `scp`).
2. Opțional: output-uri reale (RHEL 10) pentru etichetarea „Capturat”; decizie dacă simularea C1 se extinde la lecțiile noi.
3. Review didactic C4 (L4.1–L4.10) și decizia de publicare; înregistrarea în `registry.ts` a fost făcută la cererea explicită a proprietarului (aprobare pentru implementarea integrală a capitolului).
4. Review didactic C5 (L5.1–L5.6); înregistrat în `registry.ts` la cererea explicită a proprietarului.
5. Review didactic C6 (L6.1–L6.5); înregistrat în `registry.ts` la cererea explicită a proprietarului. Puncte de confirmat: fmask/dmask VFAT, reload autofs, versiunile NFS pe RHEL 10.
6. Review didactic C7 (L7.1–L7.4); înregistrat în `registry.ts` la cererea explicită a proprietarului. Puncte de confirmat: vezi nota ⁸ și secțiunile „Nesigurante” din `research/notes/L7.x.md`. Obiectivele C7-2, C7-3, C7-5 rămân acoperite de L4.9, L4.2, L2.3 (nemodificate).
7. Review didactic C8 (L8.1–L8.4); înregistrat în `registry.ts` la cererea explicită a proprietarului. Puncte de confirmat: vezi nota ⁹ și secțiunile „Nesigurante” din `research/notes/L8.x.md`. Obiectivul C8-3 rămâne acoperit de L4.9 (nemodificat).
8. Review didactic C9 (L9.1–L9.4); înregistrat în `registry.ts` la cererea explicită a proprietarului. Puncte de confirmat: vezi nota ¹⁰ și secțiunile „Nesigurante” din `research/notes/L9.x.md`. Regula de gradare `cli` ignoră majusculele (`normCli`), deci răspunsurile greșite din întrebările C9 evită opțiuni care diferă doar prin majusculă (-m/-M, -g/-G).
9. Review didactic C10 (L10.1–L10.8); înregistrat în `registry.ts` la cererea explicită a proprietarului. Puncte de confirmat: vezi nota ¹¹ și secțiunile „Nesigurante” din `research/notes/L10.x.md`. Regula de gradare `cli` ignoră majusculele (`normCli`): întrebările C10 evită variante greșite care diferă doar prin majusculă (-z/-Z, -p/-P).
10. Review didactic M0 (M0.1, M0.3, M0.4, M0.5); înregistrat în `registry.ts` la cererea explicită a proprietarului. Puncte de confirmat: vezi nota ¹² și `research/notes/M0.x.md`. Lipsesc M0.2 și M0.6.
11. Următorul: se alege de proprietar (M0.2/M0.6 sau alt capitol), o lecție/capitol per sesiune.
