import type { Lab } from '../../lab/types';

export const LAB_L2_5: Lab = {
  id: 'lab-l2-5-instaleaza-sterge-flatpak',
  lessonId: 'L2.5',
  title: 'Instalează, inspectează și șterge o aplicație Flatpak',
  modes: ['guided', 'independent'],
  objectives: ['C2-4'],
  difficulty: 1,
  estimatedMinutes: 30,
  scenario: [
    'Remote-ul Flatpak al organizației este configurat (L2.4; în exemple: `exemplu`, fictiv). Ți se cere să instalezi o aplicație din el pentru un singur utilizator, să dovedești unde este instalată și de unde provine, apoi să o elimini complet, inclusiv runtime-urile rămase fără utilizare.',
    'Sarcini: (1) alege o aplicație mică din remote (în exemple: `org.exemplu.Calculator`, fictiv); (2) instalează-o cu `--user`; (3) confirmă prin `flatpak list` și `flatpak info`; (4) elimin-o; (5) curăță runtime-urile nefolosite; (6) confirmă starea finală.',
  ],
  initialConditions: [
    'Sistem RHEL 10 (sau compatibil) cu `flatpak` instalat și un remote Flatpak definit în instalarea de utilizator (`flatpak remote-add --user ...`, L2.4).',
    'Aplicația aleasă nu este instalată.',
    'Pașii care pornesc aplicația cer o sesiune grafică; fără ea, sari peste `flatpak run`.',
  ],
  finalState: [
    'Aplicația nu mai este instalată; runtime-urile nefolosite au fost eliminate.',
    'Remote-ul rămâne configurat.',
  ],
  criteria: [
    { id: 'ac1', text: 'Ai găsit Application ID-ul exact al aplicației în remote.', manualCheck: 'flatpak remote-ls exemplu --app --user | grep -i calc' },
    { id: 'ac2', text: 'Aplicația a fost instalată în instalarea de utilizator.', manualCheck: 'flatpak list --app --user' },
    { id: 'ac3', text: 'Ai aflat remote-ul sursă al aplicației.', manualCheck: 'flatpak info --show-origin org.exemplu.Calculator' },
    { id: 'ac4', text: 'Aplicația nu mai apare după ștergere.', manualCheck: 'flatpak list --app' },
    { id: 'ac5', text: 'Runtime-urile nefolosite au fost eliminate.', manualCheck: 'flatpak list --runtime --user' },
  ],
  steps: [
    {
      title: 'Caută aplicația și află ID-ul',
      purpose: 'Instalarea cere Application ID-ul exact.',
      hint: 'Poți filtra lista cu grep -i.',
      commands: 'flatpak remotes --user -d\nflatpak remote-ls exemplu --app --user | grep -i calc\nflatpak search calculator',
      explain: [
        ['remotes --user -d', 'confirmă numele remote-ului din instalarea de utilizator.'],
        ['remote-ls exemplu --app --user', 'aplicațiile remote-ului; --user alege instalarea.'],
        ['| grep -i calc', 'filtrează (L1.6).'],
        ['flatpak search', 'caută în remote-urile configurate.'],
      ],
      output: { label: 'illustrative', code: 'Calculator  org.exemplu.Calculator  1.2  stable', explain: 'A doua coloană este Application ID-ul de folosit la instalare. Valorile sunt fictive.' },
    },
    {
      title: 'Instalează pentru utilizatorul curent',
      purpose: 'Instalare fără privilegii.',
      hint: '`--user`, apoi numele remote-ului și ID-ul.',
      commands: 'flatpak install --user exemplu org.exemplu.Calculator\nflatpak list --app',
      explain: [
        ['install --user', 'instalare de utilizator, fără sudo.'],
        ['exemplu', 'numele remote-ului.'],
        ['org.exemplu.Calculator', 'Application ID. Răspunde la prompturile de confirmare (inclusiv pentru runtime).'],
        ['list --app', 'aplicația apare cu Installation = user.'],
      ],
      output: { label: 'illustrative', code: 'Name        Application ID            Version  Branch  Installation\nCalculator  org.exemplu.Calculator    1.2      stable  user', explain: 'Coloana Installation confirmă instalarea de utilizator.' },
    },
    {
      title: 'Inspectează',
      purpose: 'Afli sursa și detaliile.',
      hint: '`--show-origin`.',
      commands: 'flatpak info org.exemplu.Calculator\nflatpak info --show-origin org.exemplu.Calculator\nflatpak list --runtime',
      explain: [
        ['flatpak info ID', 'detalii: versiune, ramură, instalare.'],
        ['--show-origin', 'afișează remote-ul de pe care a fost instalată.'],
        ['list --runtime', 'runtime-urile aduse împreună cu aplicația.'],
      ],
      reflect: 'De ce există în listă un runtime pe care nu l-ai cerut explicit?',
    },
    {
      title: 'Șterge aplicația',
      purpose: 'Elimini aplicația, apoi curăți ce a rămas.',
      hint: 'Șterge din aceeași instalare în care ai instalat.',
      commands: 'flatpak uninstall --user org.exemplu.Calculator\nflatpak list --app\nflatpak uninstall --user --unused\nflatpak list --runtime',
      explain: [
        ['uninstall --user ID', 'șterge aplicația din instalarea de utilizator.'],
        ['uninstall --unused', 'șterge runtime-urile rămase fără nicio aplicație.'],
        ['list', 'confirmările.'],
      ],
      output: { label: 'illustrative', code: ' 1. [-] org.exemplu.Platform 1.0 r\n\nUninstall complete.', explain: '`r` = remove: runtime-ul nefolosit este eliminat. Format ilustrativ.' },
    },
  ],
  verification: [
    { cmd: 'flatpak list --app', expected: 'aplicația nu mai apare' },
    { cmd: 'flatpak list --runtime --user', expected: 'runtime-ul aplicației nu mai apare (dacă nu îl folosește altă aplicație)' },
    { cmd: 'flatpak remotes --user', expected: 'remote-ul rămâne definit' },
  ],
  persistence: [
    'Aplicațiile Flatpak instalate/șterse persistă după reboot în instalarea respectivă.',
    'Confirmare manuală după reboot: `flatpak list --app`.',
    'Datele utilizatorului ale aplicației rămân după `uninstall`, dacă nu ai folosit `--delete-data`.',
  ],
  mistakes: [
    'Folosești numele prietenos în loc de Application ID.',
    'Instalezi cu `sudo` dintr-un remote definit cu `--user`.',
    'Ștergi aplicația și uiți `--unused`.',
    'Crezi că `dnf remove` șterge o aplicație Flatpak.',
  ],
  troubleshooting: [
    { symptom: 'remote-ul nu este găsit', cause: 'instalare diferită (user/system)', fix: '`flatpak remotes -d`; folosește aceeași opțiune ca la `remote-add`.' },
    { symptom: 'aplicația nu este găsită', cause: 'ID greșit', fix: '`flatpak remote-ls NUME --app`; copiază ID-ul exact.' },
    { symptom: '`flatpak run` nu pornește', cause: 'lipsa sesiunii grafice', fix: 'verifică instalarea cu `flatpak list`/`info`; rulează într-o sesiune grafică.' },
  ],
  alternatives: [
    'Instalare de sistem: `sudo flatpak install exemplu ID` (cu remote de sistem), ștergere `sudo flatpak uninstall ID`.',
    '`flatpak uninstall --delete-data ID` pentru a șterge și datele utilizatorului.',
  ],
};
