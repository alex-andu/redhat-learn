// Formulări care ar sugera că PLATFORMA a verificat un sistem real. Folosite de scanul de build
// (scripts/check-build.mjs) și de tests/claims.test.ts. Fișier fără importuri, ca să poată fi încărcat și de Node direct.
// Textele care spun că platforma NU verifică nimic nu se potrivesc cu aceste tipare (de ex. „platforma nu a verificat”).
export const FORBIDDEN_UI_PATTERNS: readonly RegExp[] = [
  /verificat\s+de\s+platform/i,
  /confirmat\s+de\s+platform/i,
  /platforma\s+a\s+(verificat|confirmat|validat)/i,
  /platforma\s+a\s+detectat/i,
  /sistemul\s+t[ăa]u\s+a\s+fost\s+(verificat|validat|confirmat)/i,
  /(verificare|validare)\s+automat[ăa]\s+a\s+(sistemului|vm|ma[șs]inii)/i,
  /verified\s+by\s+the\s+platform/i,
  /platform\s+(has\s+)?verified/i,
  /your\s+system\s+(has\s+been|was)\s+verified/i,
];
