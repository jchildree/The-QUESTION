---
name: investigative-report
description: >
  Use when turning raw material — research, notes, interview answers, fragments, or
  investigation findings — into a sourced written report or article, or when shaping,
  drafting, restructuring, or tightening such a draft. Triggers: "write up the findings",
  "investigative report", "turn these notes into an article", "draft the report", "shape
  this into an article", "edit the article", "help me write this up".
triggers:
  - "investigative report"
  - "write up the findings"
  - "turn these notes into an article"
  - "draft the report"
  - "shape this into an article"
  - "edit the article"
category: writing
token_efficiency: high
dependencies: []
---

# Investigative Report

## Overview

Turn gathered material into a written **case**. Every claim is provenance-backed, and the
citation gate is **tiered** — hard for findings, soft for color. The report is the
investigation board, rendered linearly. One disciplined pass replaces the old
fragments → shape → beats → edit pipeline.

## When to use

- Raw input (notes, interview answers, research, findings) must become a report or article.
- A draft needs shaping, structuring, or tightening.
- Claims must be sourced and attributable — not a casual prose dump.

**Not for:** throwaway writing with no sourcing needs, or a single quick paragraph.

## The five phases

1. **Gather** — mine the user first, then web-research to corroborate and extend. Every
   fragment becomes a board node carrying `source` / `method` / `confidence` / `verify`.
   _Never flatten user input and web research into one undifferentiated pile_ — each keeps
   its origin.
2. **Shape** — find the through-line; state it back; revise on the user's response. The
   thesis may rest **only on hard-tier (verified) findings**.
3. **Structure** — default: marshal the findings into an **argument** for the thesis (red
   string = the logical spine). Optional **beats mode**: assemble as a narrative journey.
4. **Edit** — tighten, restructure, cut.
5. **Cite** — classify every claim by tier, enforce the gate, render provenance.

## The citation gate

| `kind`                         | Tier | Gate                                            |
| ------------------------------ | ---- | ----------------------------------------------- |
| `finding`                      | hard | must be `verified`, else demote to color or cut |
| `hypothesis` · `question`      | soft | render with confidence flag                     |
| color / vignette / `inference` | soft | render with confidence flag                     |

The thesis rests **only** on hard-tier findings. A would-be finding that isn't `verified`
is demoted to a hedged color statement or cut — **never stated as fact**.

## Render convention

Every claim ends with `^[<source> · <confidence>]`; `verify` is the expandable citation.
Hard reads clean (gate guarantees `verified`). Soft shows `corroborated` (amber) or
`unverified` (red). Standalone color goes in a `> field note` blockquote, confidence-tagged.

## Provenance

Reads the board and the provenance record (`BOARD.md`, `spiffe-provenance.md`):
`verify` → citation, `confidence` → tier eligibility, `source` → attribution. Nothing
appears in the report that isn't already a node on the board.

## Boundaries

Independent skill. It does not investigate (that's `investigate`) and does not interrogate
specs (`interrogate-spec`). It produces **writing** only. The `QUESTION.md` voice is
flavor, never a hard dependency — the skill works without it.

## Red flags — STOP

- About to state an `unverified` claim as fact → demote to color or cut.
- "This color is basically a finding" → if it isn't `verified`, it's color.
- "The thesis is close enough on corroborated evidence" → the thesis needs verified findings.
- Merging user and web fragments "for flow" → each fragment keeps its `source`.

**All of these mean: respect the tier.** The gate is the difference between a report and an
opinion piece.
