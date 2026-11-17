import type { GlossaryEntry } from '../../lib/types';

export const TERMS: GlossaryEntry[] = [
  {
    id: 'lvcreate', abbr: 'lvcreate', ro: 'comanda care taie un volum logic dintr-un grup de volume',
    what: 'Creează un LV cu nume și dimensiune dată, din spațiul liber al unui VG; rezultatul este un block device nou, gata de formatat.',
    how: 'Alocă extents din VG (-L = dimensiune, -l = număr de extents sau procent), apoi device-mapper creează /dev/VG/LV și /dev/mapper/VG-LV.',
    where: 'lvcreate -n data -L 500M datavg; apoi mkfs și mount.',
    topics: ['L5.4'], aliases: ['lvremove', 'lvs'],
  },
  {
    id: 'lv-path', abbr: '/dev/VG/LV', ro: 'calea unui volum logic (cu legătura echivalentă /dev/mapper/VG-LV)',
    what: 'Fiecare LV activ are două nume care duc la același dispozitiv: /dev/NUME_VG/NUME_LV și /dev/mapper/NUME_VG-NUME_LV.',
    how: 'Kernelul creează dispozitivul în /dev/mapper (cratimele din nume se dublează); udev adaugă legătura /dev/VG/LV.',
    where: 'Comenzile mkfs, mount, lvextend și intrările din /etc/fstab folosesc una din aceste căi.',
    topics: ['L5.4'], aliases: ['/dev/mapper', 'dev-mapper'],
  },
];
