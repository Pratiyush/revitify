/**
 * Edge-confidence vocabulary, ported from graphify (symbol_resolution.py / extract.py):
 * EXTRACTED = structurally certain (AST said so), INFERRED = unique cross-file resolution,
 * AMBIGUOUS = multiple candidates, deterministic pick. Const object, not a TS enum — erasable.
 * Tagging starts in Phase 1b; the vocabulary is part of the model from day one.
 */
export const Confidence = {
  EXTRACTED: "EXTRACTED",
  INFERRED: "INFERRED",
  AMBIGUOUS: "AMBIGUOUS",
} as const;

export type Confidence = (typeof Confidence)[keyof typeof Confidence];
