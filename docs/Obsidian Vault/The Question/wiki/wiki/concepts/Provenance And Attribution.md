---
title: Provenance And Attribution
type: concept
created: 2026-06-21
sources:
  - "[[The Question Original Concept]]"
---

# Provenance And Attribution

The Question trusts nothing it cannot attribute. Every subject/finding carries a `spiffe://`-style ID and SVID-style provenance. Attributed or untrusted.

## From case zero

- "SPIFFE format" line resolved to [[SPIFFE]] (CNCF), two levels deep: a `spiffe://` ID plus SVID-style provenance metadata (source, assertion, verifiability).
- Lightweight metadata only -- no SPIRE, no crypto.

## Model

- ID: `spiffe://<trust-domain>/<case>/<kind>/<slug>`, `kind` in `subject | finding | hypothesis | question | source | fix`.
- SVID (Subject-Verifiable Investigation Document): six frontmatter fields -- `id`, `asserted`, `source`, `method`, `confidence`, `verify`.
- Verifiability is evidentiary, not cryptographic: a claim is verifiable iff it carries a re-runnable `verify` check.
- Confidence ladder: `unverified` (red) -> `corroborated` (amber) -> `verified` (green). Only `verified` earns a permanent board pin.

## Retroactive impact

The layer lands on `BOARD.md` (already built), so the board's node model gains an ID + provenance field -- a revision to a shipped artifact.

## Related

- [[SPIFFE]]
- [[Investigation Board]]
- [[Interrogate-First Discipline]]
- [[The Question Original Concept]]
- [[index]]
