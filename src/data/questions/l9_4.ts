import type { Question } from '../../lib/types';

const T = 'L9.4';
const O = ['C9-4'];

export const Q_L9_4: Question[] = [
  {
    id: 'L9.4-001', topicId: T, objectives: O, difficulty: 1, type: 'single',
    stem: 'Care este cea mai simplă metodă de a da unui utilizator acces administrativ complet pe RHEL?',
    explanation: 'Grupul wheel are regulă implicită în sudoers; adaugi utilizatorul în grup.',
    options: [
      { id: 'a', text: 'Îl adaugi în grupul `wheel` (`usermod -aG wheel NUME`).', correct: true, why: 'Regula %wheel ALL=(ALL) ALL din sudoers îi dă acces (de confirmat activ pe RHEL 10).' },
      { id: 'b', text: 'Îi dai parola root.', correct: false, why: 'Pierzi auditul individual și trebuie schimbată la plecare.' },
      { id: 'c', text: 'Îi setezi UID 0.', correct: false, why: 'UID 0 înseamnă un al doilea root, practică periculoasă.' },
      { id: 'd', text: 'Îl muți în grupul `users`.', correct: false, why: '„users” nu are drepturi sudo.' },
    ],
  },
  {
    id: 'L9.4-002', topicId: T, objectives: O, difficulty: 1, type: 'cli',
    stem: 'Deschide pentru editare, cu verificare de sintaxă, fișierul de politică `/etc/sudoers`.',
    prompt: '[student@server1 ~]$',
    answers: ['sudo visudo'],
    canonical: 'sudo visudo',
    explanation: 'visudo blochează fișierul și verifică sintaxa la salvare.',
    wrong: [
      { text: 'sudo vi /etc/sudoers', why: 'Editarea directă nu verifică sintaxa; o greșeală poate bloca sudo.' },
      { text: 'sudo nano /etc/sudoers', why: 'Aceeași problemă: fără verificare de sintaxă.' },
      { text: 'visudo', why: 'Fără sudo (ca utilizator obișnuit) nu poți edita fișierul.' },
    ],
  },
  {
    id: 'L9.4-003', topicId: T, objectives: O, difficulty: 2, type: 'cli',
    stem: 'Creează/editează fișierul `/etc/sudoers.d/alice` cu verificare de sintaxă.',
    prompt: '[student@server1 ~]$',
    answers: ['sudo visudo -f /etc/sudoers.d/alice'],
    canonical: 'sudo visudo -f /etc/sudoers.d/alice',
    explanation: '`-f` indică fișierul alternativ; visudo îl verifică la salvare.',
    wrong: [
      { text: 'sudo vi /etc/sudoers.d/alice', why: 'Fără verificare de sintaxă.' },
      { text: 'sudo visudo -c /etc/sudoers.d/alice', why: '-c doar verifică sintaxa unui fișier existent; nu îl deschide pentru editare.' },
      { text: 'echo "alice ALL=(ALL) ALL" > /etc/sudoers.d/alice', why: 'Fără sudo pentru redirecționare și fără verificare de sintaxă.' },
    ],
  },
  {
    id: 'L9.4-004', topicId: T, objectives: O, difficulty: 2, type: 'cli',
    stem: 'Verifică sintaxa tuturor fișierelor de politică sudo, fără a edita.',
    prompt: '[student@server1 ~]$',
    answers: ['sudo visudo -c', 'sudo visudo --check'],
    canonical: 'sudo visudo -c',
    explanation: '`-c` = check: cod 0 dacă sintaxa este validă.',
    wrong: [
      { text: 'sudo visudo -s', why: '-s = strict (alias-uri nedefinite = eroare); deschide editorul, nu doar verifică.' },
      { text: 'sudo sudo -c', why: 'Nu este o comandă validă.' },
      { text: 'sudo -l', why: 'Listează privilegiile, nu verifică sintaxa.' },
    ],
  },
  {
    id: 'L9.4-005', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Ce înseamnă regula `%devs ALL=(root) NOPASSWD: /usr/bin/journalctl`?',
    explanation: '%grup, orice gazdă, ca root, fără parolă, doar această comandă.',
    snippet: { kind: 'find-error', title: '/etc/sudoers.d/devs', code: '%devs ALL=(root) NOPASSWD: /usr/bin/journalctl' },
    options: [
      { id: 'a', text: 'Membrii grupului `devs` pot rula `/usr/bin/journalctl` ca root, fără parolă; nimic altceva.', correct: true, why: '% = grup; NOPASSWD: elimină parola pentru comenzile de după.' },
      { id: 'b', text: 'Utilizatorul numit „devs” poate rula orice comandă.', correct: false, why: 'Fără % ar fi un utilizator; aici prefixul % indică un grup.' },
      { id: 'c', text: 'Membrii devs pot rula orice comandă fără parolă.', correct: false, why: 'Regula conține o singură comandă, nu ALL.' },
      { id: 'd', text: 'Regula interzice journalctl.', correct: false, why: 'Interdicția s-ar scrie cu ! înaintea comenzii.' },
    ],
  },
  {
    id: 'L9.4-006', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Ai creat `/etc/sudoers.d/bob.conf` cu regula corectă, dar `sudo -l -U bob` arată că nu are drepturi. Care este cauza?',
    explanation: 'Fișierele din sudoers.d al căror nume conține un punct (sau se termină cu ~) sunt ignorate.',
    options: [
      { id: 'a', text: 'Numele conține un punct: fișierul este ignorat; redenumește-l în `bob`.', correct: true, why: 'sudoers(5): fișierele cu . sau ~ sunt sărite de @includedir.' },
      { id: 'b', text: 'sudoers.d poate conține doar un fișier.', correct: false, why: 'Poate conține oricâte.' },
      { id: 'c', text: 'Regula trebuie scrisă în MAJUSCULE.', correct: false, why: 'Numele alias-urilor sunt cu majuscule, dar nu regulile.' },
      { id: 'd', text: 'Trebuie repornit serviciul sudo.', correct: false, why: 'sudo nu este un serviciu; citește politica la fiecare rulare.' },
    ],
  },
  {
    id: 'L9.4-007', topicId: T, objectives: O, difficulty: 2, type: 'multi',
    stem: 'Care dintre afirmațiile despre `sudo` sunt corecte?',
    explanation: 'sudo cere parola utilizatorului, jurnalizează și poate restricționa comenzile.',
    options: [
      { id: 'a', text: 'Implicit cere parola utilizatorului care îl rulează, nu a lui root.', correct: true, why: 'Comportament standard (poate fi schimbat prin flagurile rootpw/targetpw).' },
      { id: 'b', text: 'Fiecare comandă rulată cu sudo este înregistrată în jurnal.', correct: true, why: 'Rândurile conțin utilizator, TTY, PWD, USER și COMMAND.' },
      { id: 'c', text: 'Poate permite doar anumite comenzi unui utilizator.', correct: true, why: 'Prin liste de comenzi și Cmnd_Alias.' },
      { id: 'd', text: 'Necesită ca toți utilizatorii să cunoască parola root.', correct: false, why: 'Tocmai evită partajarea parolei root.' },
    ],
  },
  {
    id: 'L9.4-008', topicId: T, objectives: O, difficulty: 2, type: 'single',
    stem: 'Două reguli din sudoers se potrivesc aceleiași comenzi, una cu `NOPASSWD`, una (ulterioară) fără. Care se aplică?',
    explanation: 'Ultima potrivire câștigă, nu cea mai specifică.',
    options: [
      { id: 'a', text: 'Cea citită ultima.', correct: true, why: 'sudoers(5): last match wins.' },
      { id: 'b', text: 'Cea mai specifică.', correct: false, why: 'sudoers nu folosește specificitatea.' },
      { id: 'c', text: 'Cea cu NOPASSWD, întotdeauna.', correct: false, why: 'Tag-ul se aplică doar dacă regula respectivă este ultima potrivită.' },
      { id: 'd', text: 'Se cere parola de două ori.', correct: false, why: 'Nu există un astfel de comportament.' },
    ],
  },
  {
    id: 'L9.4-009', topicId: T, objectives: O, difficulty: 3, type: 'single',
    stem: 'Rulezi `sudo visudo -f /etc/sudoers.d/x` și vezi mesajul de eroare de mai jos. Ce alegi la „What now?”, ca să nu strici sudo?',
    explanation: '`e` = editezi din nou; `x` = ieși fără a salva; `Q` salvează cu eroare (periculos).',
    snippet: { kind: 'interpret-output', label: 'illustrative', title: 'visudo', code: '>>> /etc/sudoers.d/x: syntax error near line 1 <<<\nWhat now?' },
    options: [
      { id: 'a', text: '`e` (corectezi) sau `x` (ieși fără salvare); niciodată `Q`.', correct: true, why: 'Q salvează fișierul stricat, ceea ce poate face sudo inutilizabil.' },
      { id: 'b', text: '`Q`, ca să salvezi oricum.', correct: false, why: 'Fișierul cu eroare poate bloca sudo.' },
      { id: 'c', text: 'Închizi terminalul.', correct: false, why: 'Lasă blocarea și fișierul într-o stare neclară.' },
      { id: 'd', text: '`Ctrl+C` și apoi copiezi fișierul manual.', correct: false, why: 'Ocolești verificarea pe care o oferă visudo.' },
    ],
  },
  {
    id: 'L9.4-010', topicId: T, objectives: O, difficulty: 2, type: 'cli',
    stem: 'Ca administrator, afișează privilegiile sudo ale utilizatorului `bob`.',
    prompt: '[student@server1 ~]$',
    answers: ['sudo -l -U bob', 'sudo -lU bob', 'sudo -U bob -l'],
    canonical: 'sudo -l -U bob',
    explanation: '`-l` listează, `-U` indică utilizatorul.',
    wrong: [
      { text: 'sudo -l bob', why: 'Fără -U, „bob” ar fi interpretat ca o comandă de verificat, nu ca utilizator țintă al listării.' },
      { text: 'sudo list bob', why: 'Nu este sintaxă validă.' },
      { text: 'id bob', why: 'Arată grupurile, nu regulile sudo.' },
    ],
  },
  {
    id: 'L9.4-011', topicId: T, objectives: O, difficulty: 3, type: 'order',
    stem: 'Ordonează pașii pentru: „grupul `ops` poate reporni `chronyd` ca root, fără parolă, și nimic altceva”.',
    explanation: 'Verifici calea, scrii regula cu visudo, validezi, testezi.',
    items: [
      { text: '`which systemctl` — afli calea completă', why: 'sudoers cere căi absolute.' },
      { text: '`sudo visudo -f /etc/sudoers.d/ops` — creezi fișierul cu verificare', why: 'Protecție la sintaxă.' },
      { text: 'Scrii: `%ops ALL=(root) NOPASSWD: /usr/bin/systemctl restart chronyd`', why: '% pentru grup, comanda exactă.' },
      { text: '`sudo visudo -c` — validezi tot', why: 'Confirmi „parsed OK”.' },
      { text: '`sudo -l -U UTILIZATOR_DIN_OPS` — verifici regula efectivă', why: 'Arată ce primește de fapt un membru.' },
    ],
  },
  {
    id: 'L9.4-012', topicId: T, objectives: O, difficulty: 3, type: 'match',
    stem: 'Potrivește elementul sudoers cu rolul lui.',
    explanation: 'Gramatica sudoers are părți distincte.',
    leftLabel: 'Element', rightLabel: 'Rol',
    pairs: [
      { left: '`%wheel`', right: 'grupul wheel (prefix % = grup)', why: 'Fără % ar fi un utilizator.' },
      { left: '`(root)`', right: 'ca ce utilizator se rulează comanda (runas)', why: 'Între paranteze, după =.' },
      { left: '`NOPASSWD:`', right: 'tag: nu cere parola pentru comenzile următoare', why: 'Opusul este PASSWD:.' },
      { left: '`Cmnd_Alias`', right: 'nume cu majuscule pentru o listă de comenzi', why: 'Evită repetarea.' },
    ],
    distractors: [{ text: 'adresa gazdei care se conectează prin SSH', why: 'Câmpul GAZDĂ al sudoers este altceva și nu are legătură cu sesiunea SSH.' }],
  },
];
