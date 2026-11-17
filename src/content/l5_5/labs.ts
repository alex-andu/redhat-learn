import type { Lab } from '../../lab/types';

export const LAB_L5_5: Lab = {
  id: 'lab-l5-5-fstab-uuid-label',
  lessonId: 'L5.5',
  title: 'Montare persistentă după UUID și după label',
  modes: ['guided', 'independent'],
  objectives: ['C5-5'],
  difficulty: 2,
  estimatedMinutes: 35,
  scenario: [
    'Pe discul de test ai două partiții (`/dev/vdb1`, `/dev/vdb2`, ≈1 GiB, GPT). Formatează vdb1 XFS și montează-l pe `/data1` persistent, după UUID. Formatează vdb2 XFS cu label `archive` și montează-l pe `/data2` persistent, după label.',
    'Testează intrările cu `mount -a` înainte de reboot. Nu edita liniile sistemului (/, /boot).',
  ],
  initialConditions: [
    'Sistem RHEL 10 (sau compatibil) de test, `sudo`.',
    'Două partiții goale `/dev/vdb1` și `/dev/vdb2` (L5.1); datele de pe ele se pierd.',
    'Un editor de text cunoscut (vim sau nano, L1.4).',
  ],
  finalState: [
    '/data1 și /data2 sunt montate și au linii în /etc/fstab, una cu UUID și una cu LABEL.',
  ],
  criteria: [
    { id: 'ac1', text: 'vdb1 are XFS și /etc/fstab conține o linie UUID=… /data1.', manualCheck: 'grep data1 /etc/fstab; blkid /dev/vdb1' },
    { id: 'ac2', text: 'vdb2 are XFS cu label archive și fstab conține LABEL=archive /data2.', manualCheck: 'grep data2 /etc/fstab; blkid /dev/vdb2' },
    { id: 'ac3', text: 'mount -a a rulat fără erori și ambele sunt montate.', manualCheck: 'findmnt /data1; findmnt /data2' },
    { id: 'ac4', text: 'findmnt --verify nu raportează erori pentru liniile tale.', manualCheck: 'findmnt --verify' },
  ],
  steps: [
    {
      title: 'Formatează partițiile',
      purpose: 'Un UUID și un label apar numai după formatare.',
      hint: 'La mkfs.xfs, -L setează label-ul. Alt label decât cel dorit se poate schimba mai târziu cu xfs_admin.',
      commands: 'sudo mkfs.xfs /dev/vdb1\nsudo mkfs.xfs -L archive /dev/vdb2\nsudo blkid /dev/vdb1 /dev/vdb2',
      explain: [
        ['mkfs.xfs /dev/vdb1', 'creează XFS; scrie un UUID nou (C6).'],
        ['-L archive', 'setează label-ul „archive” (max. 12 caractere).'],
        ['blkid', 'afișează UUID, TYPE, LABEL pentru ambele dispozitive.'],
      ],
      output: { label: 'illustrative', code: '[student@server1 ~]$ sudo blkid /dev/vdb1 /dev/vdb2\n/dev/vdb1: UUID="3b1e9f0a-1c2d-4e5f-8a6b-7c8d9e0f1a2b" TYPE="xfs" PARTLABEL="data1" PARTUUID="a1b2c3d4-01"\n/dev/vdb2: LABEL="archive" UUID="9d8c7b6a-5f4e-4d3c-b2a1-0f9e8d7c6b5a" TYPE="xfs" PARTLABEL="data2" PARTUUID="a1b2c3d4-02"', explain: 'UUID = identificatorul sistemului de fișiere. PARTUUID/PARTLABEL aparțin partiției, nu sistemului de fișiere. Valorile sunt fictive.' },
    },
    {
      title: 'Creează punctele de montare',
      purpose: 'Directoarele trebuie să existe.',
      hint: 'Folosești directoare noi, goale.',
      commands: 'sudo mkdir /data1 /data2\nls -ld /data1 /data2',
      explain: [
        ['mkdir /data1 /data2', 'creează cele două directoare.'],
        ['ls -ld', '-l format lung, -d arată directorul, nu conținutul.'],
      ],
    },
    {
      title: 'Adaugă liniile în /etc/fstab',
      purpose: 'Montarea persistentă se definește în fstab.',
      hint: 'Pentru UUID copiezi valoarea din blkid. Fă o copie de rezervă înainte: `sudo cp /etc/fstab /etc/fstab.bak`.',
      commands: 'sudo cp /etc/fstab /etc/fstab.bak\nsudo vim /etc/fstab\n# adaugă la sfârșit (cu UUID-ul tău):\nUUID=3b1e9f0a-1c2d-4e5f-8a6b-7c8d9e0f1a2b  /data1  xfs  defaults  0 0\nLABEL=archive                               /data2  xfs  defaults  0 0',
      explain: [
        ['cp /etc/fstab /etc/fstab.bak', 'copie de rezervă pentru revenire rapidă.'],
        ['UUID=… /data1 xfs defaults 0 0', 'câmpuri: sursă, punct de montare, tip, opțiuni, dump, fsck.'],
        ['LABEL=archive', 'sursa prin label.'],
        ['defaults', 'rw, suid, dev, exec, auto, nouser, async (setul standard de opțiuni).'],
        ['0 0', 'dump dezactivat; fsck nu rulează pentru XFS (XFS nu folosește fsck la boot).'],
      ],
    },
    {
      title: 'Testează fără reboot',
      purpose: 'Greșelile din fstab pot bloca boot-ul; testezi înainte.',
      hint: 'Dacă mount -a dă eroare, corectează linia înainte de orice reboot.',
      commands: 'sudo systemctl daemon-reload\nsudo findmnt --verify\nsudo mount -a\nfindmnt /data1\nfindmnt /data2\ndf -h /data1 /data2',
      explain: [
        ['systemctl daemon-reload', 'cere systemd să regenereze unitățile .mount din fstab.'],
        ['findmnt --verify', 'verifică sintaxa și existența surselor din fstab, fără a monta.'],
        ['mount -a', 'montează toate intrările din fstab care nu sunt încă montate.'],
        ['findmnt', 'afișează sursa, destinația, tipul și opțiunile unei montări.'],
      ],
      output: { label: 'illustrative', code: '[student@server1 ~]$ findmnt /data1\nTARGET SOURCE    FSTYPE OPTIONS\n/data1 /dev/vdb1 xfs    rw,relatime,seclabel,attr2,inode64,logbufs=8,logbsize=32k,noquota', explain: 'SOURCE arată dispozitivul curent, chiar dacă fstab folosește UUID. Opțiunile exacte variază.' },
      reflect: 'Ce s-ar întâmpla dacă discul ar apărea ca /dev/vdc după un reboot?',
    },
  ],
  verification: [
    { cmd: 'grep -E "data1|data2" /etc/fstab', expected: 'două linii: UUID=… /data1 și LABEL=archive /data2' },
    { cmd: 'findmnt /data1 /data2', expected: 'ambele montate, tip xfs' },
    { cmd: 'sudo findmnt --verify', expected: 'fără erori pentru liniile tale' },
  ],
  persistence: [
    'Persistența vine din liniile din /etc/fstab, nu din comanda mount.',
    'Confirmare după reboot (doar în mediu de test): `findmnt /data1 /data2`.',
    'Dacă UUID/label se schimbă (reformatare), liniile trebuie actualizate.',
  ],
  mistakes: [
    'Copierea greșită a UUID-ului (un caracter lipsă).',
    'Uitarea mkdir pentru punctul de montare.',
    'Reboot fără test cu mount -a: poate duce în emergency mode.',
    'Confuzia UUID (sistem de fișiere) cu PARTUUID (partiție).',
    'Label duplicat pe două sisteme de fișiere.',
  ],
  troubleshooting: [
    { symptom: '`mount: /data1: can\'t find UUID=…`', cause: 'UUID greșit sau sistem de fișiere neformatat', fix: 'compară cu `blkid`; corectează.' },
    { symptom: '`mount point does not exist`', cause: 'directorul lipsește', fix: '`mkdir`.' },
    { symptom: 'boot în emergency mode', cause: 'linie greșită în fstab', fix: 'din emergency shell (parola root): editează /etc/fstab, comentează linia, `systemctl daemon-reload`, `reboot`.' },
  ],
  alternatives: [
    'Poți monta un LV prin cale: `/dev/datavg/data /data1 xfs defaults 0 0`.',
    'Adaugă `nofail` la opțiuni pentru discuri neesențiale, ca boot-ul să nu se blocheze dacă lipsesc.',
    '`xfs_admin -L nume /dev/vdb1` setează label-ul unui XFS demontat.',
  ],
};
