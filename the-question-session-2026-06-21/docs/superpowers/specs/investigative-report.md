# Spec — `investigative-report` (Layer 3)

> The Question writes up the case. One disciplined skill replacing the four-skill writing
> pipeline. Every claim is provenance-backed, and the citation gate is **tiered**: hard for
> findings, soft for color. The report is the investigation board, rendered linearly.

**Replaces:** `writing-fragments` → `writing-shape` → `writing-beats` → `edit-article`.

---

## 1. The five phases

| #   | Phase                    | From                | Does                                                                                                                                                               |
| --- | ------------------------ | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | **Gather** (legwork)     | `writing-fragments` | Mine the user first (greedy for knowledge), then web-research to corroborate and extend. Every fragment lands as a provenance-bearing node — never flattened.      |
| 2   | **Shape** (the angle)    | `writing-shape`     | Find the through-line; state it back; revise on response. The thesis may rest **only on hard-tier findings**.                                                      |
| 3   | **Structure** (the case) | `writing-beats`     | Default: marshal the findings into an argument for the thesis — red string as the logical spine. Optional **beats mode**: assemble as a narrative journey instead. |
| 4   | **Edit** (polish)        | `edit-article`      | Tighten, restructure, cut.                                                                                                                                         |
| 5   | **Cite** (the byline)    | _new_               | Classify every claim by tier, enforce the gate, render provenance. This phase is the soul of the rename.                                                           |

---

## 2. The gather fork — resolved

The old blocker: user-interview fragments and live web research merged into one
undifferentiated pile, and you couldn't pool them without losing what came from where —
fatal for an investigative report. The provenance layer dissolves it: fragments still pool
into **one board**, but each is a node carrying its own `source`. One pile, full attribution.

---

## 3. The tiered citation gate (the soul)

- **Hard tier — findings.** Load-bearing factual claims, the report's spine. Must be
  `verified` (green). A would-be finding that isn't green is **demoted** (re-cast as a
  hedged color statement) or **cut** — never stated as fact. The thesis stands only on these.
- **Soft tier — color.** Vignettes, anecdotes, atmosphere, hypotheses, open questions.
  Stated freely, but **always carrying a visible confidence flag**. Color is allowed to be
  impressionistic; it is never disguised as fact.

**Tier follows `kind`, enforced at the Cite phase:**

| `kind`                            | Tier | Gate                              |
| --------------------------------- | ---- | --------------------------------- |
| `finding`                         | hard | must be `verified` or demoted/cut |
| `hypothesis` · `question`         | soft | rendered with confidence flag     |
| user vignette / `inference` color | soft | rendered with confidence flag     |

---

## 4. Render convention

One uniform provenance tag on every claim — `^[<source> · <confidence>]`, with `verify` as
the expandable citation. The gate, not the syntax, enforces the tier:

- **Hard** reads clean, because the gate guarantees its confidence is always `verified`.
- **Soft** shows `corroborated` (amber) or `unverified` (red) — the reader is warned in-line.
- Standalone color goes in a `> field note` blockquote, confidence-tagged.

Same citation mechanism everywhere; the gate decides what's _allowed_ where.

---

## 5. Consumes the provenance layer

`verify` → the citation. `confidence` → tier eligibility. `source` → attribution. The report
is the board rendered linearly: pinned green findings form the spine; provisional threads
appear as flagged color. Nothing in the report that isn't already a node on the board.

---

## 6. Boundaries (skill independence)

Independent skill. It **shares the interrogation discipline** with `interrogate-spec`, not its
code; it reads the board and provenance via docs (`BOARD.md`, `spiffe-provenance.md`), not via
coupling. No shared engine.

---

## Worked example — excerpt

```markdown
The regression entered with the v3 cookie refactor.^[code:auth/login.py:42 · verified]
The null-session path was never covered by a test until the crash forced one.^[code:tests/ · verified]

> **Field note.** One engineer recalled the refactor "felt rushed under the release
> freeze" — uncorroborated, offered as color, not cause.^[user · unverified]
```

The two facts are green findings, cited. The recollection is color — flagged red, walled off
in a field note, never load-bearing.

---

## Decided

1. **Tier assignment** — automatic, by `kind`.
2. **Render convention** — trailing `^[source · confidence]` tag, `verify` as the expandable
   citation.
3. **Report shape** — **argument by default** (build toward the verified conclusion);
   narrative **beats** available as an optional mode. The report makes a case.
