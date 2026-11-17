// SCHEME ZOD — scrise în Etapa 0, NEEXECUTATE (dependențele nu sunt instalate).
// Versiunea Zod se fixează și schemele se testează în Etapa 1. Orice modificare de schemă cere aprobare (WORKFLOW §7).
import { z } from 'zod';

/** ID intern de obiectiv: C<categorie>-<n>, ex. C5-4 (categorii 1–10, vezi objectives.json). */
export const objectiveId = z.string().regex(/^C(10|[1-9])-\d{1,2}$/, 'ID de obiectiv invalid');

/** ID de lecție: L<capitol>.<n> (ex. L1.1, L10.8) sau M0.<n>. */
export const lessonId = z.string().regex(/^(L(10|[1-9])\.\d{1,2}|M0\.[1-6])$/, 'ID de lecție invalid');

export const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

/** Sursă documentară; cel puțin una per lecție/lab. */
export const source = z.object({
  kind: z.enum(['doc', 'man', 'upstream', 'rfc']),
  ref: z.string().min(3),
  accessed: isoDate,
});

/**
 * Eticheta unui bloc de output (WORKFLOW §4, D-009).
 * 'captured' = doar dacă proprietarul a furnizat explicit un output real.
 */
export const outputLabel = z.enum(['reconstructed', 'illustrative', 'captured']);

export const outputRef = z.object({
  id: z.string().min(1),
  label: outputLabel,
});

/** O comandă folosită într-un conținut, cu dovada documentară (nu „executată de platformă”). */
export const commandRef = z.object({
  cmd: z.string().min(1),
  evidence: z.enum(['doc', 'man', 'upstream']),
  source: z.string().min(3),
});

export const difficulty = z.union([z.literal(1), z.literal(2), z.literal(3)]);

/** Textele interfeței nu au voie să pretindă verificarea unui sistem real (LAB_SPEC §3). */
export const FORBIDDEN_UI_CLAIMS = [/\bverificat de platform/i, /\bconfirmat de platform/i, /\bsistemul tău a fost verificat/i];
