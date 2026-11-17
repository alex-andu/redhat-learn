import type { GlossaryEntry } from '../../lib/types';

export const TERMS: GlossaryEntry[] = [
  {
    id: 'flatpak', abbr: 'Flatpak', ro: 'sistem de distribuire a aplicațiilor în mediu izolat',
    what: 'Format și unealtă pentru aplicații independente de distribuție, care rulează într-un sandbox și își cer runtime-urile separat.',
    how: 'Aplicațiile vin dintr-un remote; flatpak le instalează în instalarea de sistem sau de utilizator, împreună cu runtime-urile necesare.',
    where: 'flatpak remote-add, flatpak install, flatpak list, flatpak run.',
    topics: ['L2.4', 'L2.5'],
  },
  {
    id: 'flatpak-remote', abbr: 'remote Flatpak', ro: 'depozit de aplicații Flatpak',
    what: 'Un depozit cu nume local și URL din care Flatpak caută și instalează aplicații și runtime-uri.',
    how: 'Se adaugă cu flatpak remote-add NUME URL (de regulă un fișier .flatpakrepo) și se vede cu flatpak remotes.',
    where: 'Prima configurare înainte de orice instalare Flatpak.',
    topics: ['L2.4', 'L2.5'],
  },
  {
    id: 'flatpak-installation', abbr: 'instalare system/user', ro: 'nivelul la care se aplică o operație Flatpak',
    what: 'Flatpak are o instalare de sistem (toți utilizatorii, implicit) și una de utilizator (--user, doar contul curent).',
    how: 'Remote-urile și aplicațiile sunt separate între cele două instalări; --system și --user aleg instalarea.',
    where: 'flatpak remotes --user, flatpak install --user.',
    topics: ['L2.4', 'L2.5'],
  },
  {
    id: 'flatpak-runtime', abbr: 'runtime Flatpak', ro: 'set de biblioteci cerut de aplicații',
    what: 'Pachet separat cu bibliotecile pe care le folosesc aplicațiile Flatpak.',
    how: 'Se instalează automat (cu confirmare) la prima aplicație care îl cere și poate fi partajat între aplicații.',
    where: 'flatpak list --runtime; flatpak uninstall --unused.',
    topics: ['L2.4', 'L2.5'],
  },
];
