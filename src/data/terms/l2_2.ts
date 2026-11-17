import type { GlossaryEntry } from '../../lib/types';

export const TERMS: GlossaryEntry[] = [
  {
    id: 'package-dependency', abbr: 'dependență', ro: 'pachet de care altul are nevoie',
    what: 'Un pachet declară ce alte pachete (biblioteci, programe) îi trebuie ca să funcționeze.',
    how: 'dnf calculează lista completă la instalare și o afișează înainte de confirmare; la ștergere, elimină și pachetele care depind de cel șters. rpm -i nu aduce dependențe.',
    where: 'Eroarea „Failed dependencies”; rpm -qR pachet listează cerințele; dnf autoremove curăță dependențele orfane.',
    topics: ['L2.2'],
  },
  {
    id: 'dnf-transaction', abbr: 'tranzacție dnf', ro: 'o operațiune de instalare/ștergere înregistrată',
    what: 'Fiecare instalare, ștergere sau actualizare primește un ID în istoric.',
    how: 'dnf history list arată tranzacțiile; history info ID le detaliază; history undo ID încearcă inversarea.',
    where: 'Audit „cine a instalat ce” și recuperare după o ștergere greșită.',
    topics: ['L2.2'],
  },
  {
    id: 'rpm-query', abbr: 'rpm -q', ro: 'interogarea bazei RPM',
    what: 'Familie de opțiuni care întreabă baza locală: -q (instalat?), -qa (toate), -qi (info), -ql (fișiere), -qf (proprietar), -qp (fișier .rpm).',
    how: 'Citește baza de date RPM de pe disc; nu are nevoie de rețea sau de repository-uri.',
    where: 'Verificarea unei instalări/ștergeri, aflarea pachetului unui fișier.',
    topics: ['L2.2'],
  },
  {
    id: 'package-group', abbr: 'grup de pachete', ro: 'set de pachete cu un scop',
    what: 'O colecție numită de pachete (de exemplu „Development Tools”) instalată dintr-o singură comandă.',
    how: 'dnf group list arată grupurile; dnf group install "Nume" instalează pachetele obligatorii și implicite ale grupului.',
    where: 'Pregătirea rapidă a unui sistem pentru un rol.',
    topics: ['L2.2'],
  },
];
