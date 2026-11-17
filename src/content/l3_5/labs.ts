import type { Lab } from '../../lab/types';

export const LAB_L3_5: Lab = {
  id: 'lab-l3-5-output-comenzi',
  lessonId: 'L3.5',
  title: 'Procesarea output-ului comenzilor într-un script',
  modes: ['guided', 'independent'],
  objectives: ['C3-4'],
  difficulty: 2,
  estimatedMinutes: 45,
  scenario: [
    'Scrie `~/raport.sh`, care creează fișierul `~/raport-AAAA-LL-ZZ.txt` (data zilei în nume) cu trei informații: numele gazdei, numărul de utilizatori din `/etc/passwd` și numărul celor cu shell `/bin/bash`.',
    'Scrie `~/bash-users.sh`, care afișează pentru fiecare utilizator cu shell `/bin/bash` linia `UTILIZATOR -> HOME` și, la final, `Total: N`.',
    'Scrie `~/exista.sh`, care primește un nume de utilizator și afișează `EXISTĂ` sau `LIPSEȘTE`, fără alt output, folosind codul de ieșire al unei comenzi.',
  ],
  initialConditions: [
    'Sistem RHEL 10 (sau compatibil), shell bash.',
    'Scripturile și raportul nu există.',
  ],
  finalState: [
    '`~/raport.sh`, `~/bash-users.sh` și `~/exista.sh` sunt executabile și funcționează conform scenariului; raportul datat există.',
  ],
  criteria: [
    { id: 'ac1', text: 'Fișierul `~/raport-AAAA-LL-ZZ.txt` există și are numele zilei curente.', manualCheck: 'ls ~/raport-$(date +%F).txt' },
    { id: 'ac2', text: 'Raportul conține cele trei informații.', manualCheck: 'cat ~/raport-$(date +%F).txt' },
    { id: 'ac3', text: 'Numărul din raport pentru utilizatori coincide cu `wc -l < /etc/passwd`.', manualCheck: 'wc -l < /etc/passwd' },
    { id: 'ac4', text: '`bash-users.sh` afișează doar utilizatorii cu `/bin/bash` și totalul corect.', manualCheck: "~/bash-users.sh; grep -c '/bin/bash$' /etc/passwd" },
    { id: 'ac5', text: '`exista.sh root` afișează EXISTĂ, iar un nume inexistent afișează LIPSEȘTE.', manualCheck: '~/exista.sh root; ~/exista.sh nimeni-nu' },
  ],
  steps: [
    {
      title: 'Scrie raport.sh',
      purpose: 'Captezi output-ul comenzilor în variabile și îl scrii într-un fișier.',
      hint: 'Folosește `$(date +%F)` în numele fișierului; `wc -l < fișier` pentru număr curat.',
      commands: 'nano ~/raport.sh\nchmod +x ~/raport.sh\n~/raport.sh\ncat ~/raport-$(date +%F).txt',
      explain: [
        ['nano ~/raport.sh', 'conținutul de mai jos.'],
        ['cat ~/raport-$(date +%F).txt', 'afișează raportul; $(date +%F) este înlocuit cu data zilei, deci numele coincide cu cel din script.'],
      ],
      output: { label: 'illustrative', code: '#!/bin/bash\nfisier="$HOME/raport-$(date +%F).txt"\ntotal=$(wc -l < /etc/passwd)\nbash_nr=$(grep -c \'/bin/bash$\' /etc/passwd)\n{\n  echo "Gazda: $(hostname)"\n  echo "Utilizatori: $total"\n  echo "Cu shell bash: $bash_nr"\n} > "$fisier"\necho "Raport scris în $fisier"', explain: 'Conținutul scriptului. Variabilele captează numerele; acoladele grupează comenzile ca ieșirea lor să meargă într-un singur fișier; `$HOME` este directorul tău personal.' },
    },
    {
      title: 'Scrie bash-users.sh',
      purpose: 'Citești /etc/passwd rând cu rând și filtrezi.',
      hint: '`IFS=: read -r` cu șapte variabile; `done < /etc/passwd`.',
      commands: 'nano ~/bash-users.sh\nchmod +x ~/bash-users.sh\n~/bash-users.sh',
      explain: [
        ['~/bash-users.sh', 'afișează utilizatorii cu shell /bin/bash și totalul.'],
      ],
      output: { label: 'illustrative', code: '#!/bin/bash\ncount=0\nwhile IFS=: read -r user x uid gid desc home shell; do\n  if [ "$shell" = "/bin/bash" ]; then\n    echo "$user -> $home"\n    count=$((count + 1))\n  fi\ndone < /etc/passwd\necho "Total: $count"', explain: 'Conținutul scriptului. Cele șapte variabile corespund celor șapte câmpuri din `/etc/passwd`.' },
      reflect: 'De ce `count` păstrează valoarea după buclă? Ce s-ar întâmpla cu `cat /etc/passwd | while …`?',
    },
    {
      title: 'Scrie exista.sh',
      purpose: 'Folosești codul de ieșire, nu output-ul.',
      hint: '`id nume` are cod 0 dacă utilizatorul există; aruncă output-ul.',
      commands: 'nano ~/exista.sh\nchmod +x ~/exista.sh\n~/exista.sh root\n~/exista.sh nimeni-nu',
      explain: [
        ['~/exista.sh root', 'trebuie să afișeze EXISTĂ.'],
        ['~/exista.sh nimeni-nu', 'trebuie să afișeze LIPSEȘTE.'],
      ],
      output: { label: 'illustrative', code: '#!/bin/bash\nif id "$1" > /dev/null 2>&1; then\n  echo "EXISTĂ"\nelse\n  echo "LIPSEȘTE"\nfi', explain: 'Conținutul scriptului. `if` testează direct codul comenzii `id`; redirecționările elimină mesajul de eroare.' },
    },
    {
      title: 'Verifică cifrele independent',
      purpose: 'Compari rezultatul scriptului cu o metodă diferită.',
      hint: 'Dacă cifrele diferă, `echo "[$var]"` arată spații sau text în plus.',
      commands: "wc -l < /etc/passwd\ngrep -c '/bin/bash$' /etc/passwd\nawk -F: '$7 == \"/bin/bash\" {print $1}' /etc/passwd",
      explain: [
        ['wc -l < /etc/passwd', 'numărul total de linii.'],
        ["grep -c '/bin/bash$'", 'numărul de linii cu shell bash.'],
        ["awk -F: '$7 == \"/bin/bash\" {print $1}'", 'awk: dacă al 7-lea câmp este /bin/bash, afișează utilizatorul. Alternativă la bucla while.'],
      ],
    },
  ],
  verification: [
    { cmd: 'cat ~/raport-$(date +%F).txt', expected: 'trei linii: Gazda, Utilizatori, Cu shell bash' },
    { cmd: '~/bash-users.sh | tail -1', expected: 'Total: N, cu N egal cu rezultatul lui `grep -c` de mai sus' },
    { cmd: '~/exista.sh root; ~/exista.sh nimeni-nu', expected: 'EXISTĂ, apoi LIPSEȘTE' },
  ],
  persistence: [
    'Scripturile și raportul persistă după reboot; variabilele nu.',
    'Dacă raportul era în `/tmp`, poate fi curățat; aici este în directorul personal.',
    'Confirmare manuală după reboot: `ls ~/raport-*.txt` și rularea scripturilor.',
  ],
  mistakes: [
    'Spații în jurul `=` la atribuiri.',
    '`wc -l fișier` în loc de `wc -l < fișier` (numele fișierului ajunge în variabilă).',
    'Pipe în `while` și pierderea contorului.',
    'Fără ghilimele pe variabile cu spații.',
  ],
  troubleshooting: [
    { symptom: 'Variabila conține „42 /etc/passwd”', cause: '`wc -l fișier` afișează și numele', fix: 'folosește `wc -l < fișier`.' },
    { symptom: '`integer expression expected`', cause: 'variabila conține text', fix: '`echo "[$var]"` și corectează comanda.' },
    { symptom: 'Contorul afișează 0', cause: 'bucla rulează într-un subshell (pipe)', fix: 'folosește `done < fișier`.' },
  ],
  alternatives: [
    'Poți număra cu `grep -c` în loc de buclă, sau folosi `awk -F: \'$7=="/bin/bash"\' /etc/passwd | wc -l`.',
    'Pentru `exista.sh` poți folosi `getent passwd "$1" > /dev/null`.',
    'Pentru data din nume poți folosi `date +%Y-%m-%d`, echivalent cu `%F`.',
  ],
};
