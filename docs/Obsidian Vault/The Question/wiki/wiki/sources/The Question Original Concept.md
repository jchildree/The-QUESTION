---
title: The Question Original Concept
type: source
created: 2026-06-21
sources: []
---

# The Question Original Concept

Case zero. J's founding note, transcribed from a handwritten notebook page (`4258.jpg`), then distilled into canonical design intent. Predates any design or build.

## What it establishes

- **Persona**: DC's the Question (Vic Sage) -- faceless, relentless, root-cause-obsessed, distrusts its own conclusions. See [[The Question Persona]].
- **Behavioral contract** (nine points). Core: [[Interrogate-First Discipline]] -- ask many granular questions before acting; build second.
- **Output form**: findings on an [[Investigation Board]], nodes joined by red string (wikilinks), unlimited rabbit holes the tool sorts itself.
- **Trust rule**: [[Provenance And Attribution]] -- every subject/finding carries a `spiffe://` ID + SVID-style provenance. Trusts nothing it cannot attribute.
- **Self-review**: never assumes the investigation complete; re-reviews and surfaces what was missed.
- **Organization**: consolidate to least common denominator repo/folder structure.
- **User tracking**: tastes, style, preferences persist across cases.
- **Full agent**: despite the costume, still builds, researches, ships.

## Resolved ambiguities

- **"like Ralph?"** -> [[Ralph Agentic Loop]] (Geoffrey Huntley, July 2025). Verdict: lineage/inspiration only -- borrows fresh-context, disk-as-memory, one-task philosophy; not a literal loop runner.
- **"SPIFFE format"** -> [[SPIFFE]] (CNCF). The "IBM & Red Hat" parenthetical was a mis-association. Verdict: `spiffe://` IDs + SVID-style provenance, no SPIRE, no crypto.

## Maps to what was built

| Note line                           | Realized as                                     |
| ----------------------------------- | ----------------------------------------------- |
| Asks Q's, snippy, infers + confirms | `interrogate-spec` (replaces `grill-me`)        |
| Paranoid, re-reviews, fix-gate      | `investigate` (replaces `diagnose`)             |
| Board, strings, rabbit holes        | `BOARD.md` (Obsidian)                           |
| Faceless persona/voice              | `QUESTION.md`                                   |
| Greedy 1st, build 2nd               | gating discipline across both skills            |
| "SPIFFE format"                     | cross-cutting `spiffe://` ID + provenance layer |

Still open from the note: the writing pipeline (`investigative-report`) and the `faceless` layer.

## Retroactive touch

The SPIFFE provenance layer lands on `BOARD.md` (already built), so its node model needs an ID + provenance field -- a revision to a shipped artifact, not just a new-layer concern.

## Related

- [[The Question Persona]]
- [[Ralph Agentic Loop]]
- [[SPIFFE]]
- [[Interrogate-First Discipline]]
- [[Investigation Board]]
- [[Provenance And Attribution]]
- [[index]]
