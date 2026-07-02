# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

"The Question" is a Claude Code plugin (not an application). It has no build, no test
runner, no lint, no compiled code. The deliverable is a set of prompt-skills (`SKILL.md`
markdown with YAML frontmatter) plus shared persona/board/provenance documents. "Code"
here means markdown and frontmatter conventions.

The persona is DC Comics' Vic Sage (the Question): a faceless investigator who treats the
first answer as a starting point, not a conclusion. Investigate first, build second; trust
nothing you cannot attribute.

The repo lives at `github.com/jchildree/The-QUESTION` (default branch `main`; do not edit
it directly, branch first). The founding intent is in `the-question-original-concept.md`
(case zero) and, expanded, in `the-question/the-question/docs/origins/`. Phase status is
tracked in `docs/phase-status/INDEX.md`; phases 01-07 (build through integration and
retirement) are COMPLETE.

## Repository layout

- `the-question/the-question/` is the live plugin root (`${CLAUDE_PLUGIN_ROOT}`).
  Contains `.claude-plugin/plugin.json`, the shared docs (`QUESTION.md`, `BOARD.md`),
  the specs under `docs/superpowers/specs/`, and all six skills: `interrogate-spec`,
  `investigate`, `investigative-report`, `faceless`, `faceless-commit`, `faceless-review`.
- The 2026-06-21 session bundle and the root `.zip` snapshots were fully merged into the
  live tree and deleted; git history preserves them.

## Run / test the plugin

Local dev install (from the repo root; the flag needs the directory that contains
`.claude-plugin/`):

```text
claude --plugin-dir ./the-question/the-question
```

Manifest gotcha: an empty `author.name` in `.claude-plugin/plugin.json` silently disables
the whole plugin -- no error, skills never register. Keep it non-empty.

Headless testing (`claude -p`) cannot user-invoke skills, and
`disable-model-invocation: true` hides them from the Skill tool; test on a temp copy of the
plugin with that flag stripped, or test interactively.

There is no automated test suite. "Testing" a skill means invoking it under `--plugin-dir`
and confirming it behaves. Per `writing-skills` TDD, a new skill gets a RED baseline plus
REFACTOR pass before it is allowed to retire the skill it replaces.

## Architecture (read these together)

The plugin is layered; later layers depend on earlier conventions, so changing a lower
layer is a revision to shipped artifacts, not an isolated edit.

### Layer 0 - Persona (`QUESTION.md`)

Shared voice doc every skill reads first via `${CLAUDE_PLUGIN_ROOT}/QUESTION.md`. Defines
the one mechanical rule (one finding/question at a time; escalate to a single follow-up
"why" only on a vague or contradictory answer). Function over costume: if this file is
missing, every skill still runs and just drops the flavor. Never make the persona a hard
dependency.

### Layer 1 - Provenance (`the-question/the-question/docs/superpowers/specs/spiffe-provenance.md`)

A SPIFFE-inspired addressing plus trust layer. Borrows SPIFFE's data model only
(ID-as-URI, a verifiable document, trust domains, federation); drops the crypto runtime (no
SPIRE, no X.509/JWT). Two parts:

- ID: `spiffe://<trust-domain>/<case>/<kind>/<slug>` where `kind` is one of
  `subject | finding | hypothesis | question | source | fix`. Lives in node frontmatter.
- SVID (Subject-Verifiable Investigation Document): six frontmatter fields - `id`,
  `asserted`, `source`, `method`, `confidence`, `verify`.

Verifiability is evidentiary, not cryptographic: a claim is verifiable iff it carries a
re-runnable `verify` check. Confidence ladder is `unverified` (red) to `corroborated`
(amber) to `verified` (green). Only `verified` earns a permanent board pin.

### Layer 2 - Board (`BOARD.md`)

The shared memory layer. An Obsidian vault at `docs/Obsidian Vault/The Question/` inside
the investigated project, built on the `obsidian-vault` skill for file mechanics.
Conventions: no folders, Title Case filenames, `[[wikilinks]]` at the bottom of every note
(the wikilinks ARE the red string / crazy wall; Obsidian's graph view renders them). Node
types: Case, Suspect, Source, Investigation Board Index. Closed cases persist and are never
deleted, which is what enables cross-case recall (skills search prior Suspects before
generating new hypotheses). The provenance frontmatter from Layer 1 is the node schema (the
"Node identity & provenance" section of `BOARD.md`).

### Layer 3 - Investigative skills

The skills that emit board nodes:

- `interrogate-spec` - stress-test a plan/design by interviewing one decision-tree branch
  at a time, each with a recommended answer, waiting for the user between questions. User
  answers land as `source: user`.
- `investigate` - six-phase root-cause discipline (build a feedback loop, reproduce,
  hypothesis board-aware, instrument, fix-gate, cleanup). Findings are pinned to the board
  live with provenance; the fix-gate forbids applying a fix until the root-cause finding is
  `verified` (green) AND the user consents.
- `investigative-report` - turns findings into a sourced written case; tiered
  citation gate (hard for findings: must be `verified`; soft for color).

### Layer 4 - Faceless (voice only)

Three thin persona wrappers (`faceless`, `faceless-commit`, `faceless-review`) that
re-voice the existing caveman compression engine - colder face, same mechanics. Critical
constraint: the engine (`hooks/caveman-mode-tracker.js`, `hooks/caveman-stats.js`, the
Python package) is untouched, and `faceless` must still register as caveman mode internally
or the stats hook goes blind (the bridge is `.claude/hooks/faceless-mode-tracker.js`,
registered before the caveman tracker in `UserPromptSubmit`). Keep the engine's level
vocabulary exactly (`lite`/`full`/`ultra`/`wenyan-*`). This layer is voice, not
investigation - no coupling to the board/provenance layers.

## The emission contract (the cross-cutting rule)

Board nodes are written only through the provenance emission contract
(`spiffe-provenance.md` section 6), and `confidence` is set by how the claim was
established - it climbs by rule and is never hand-waved upward. No `verify`, no green, ever.
When editing `investigate` or `interrogate-spec`, preserve their per-phase emission points;
the splice is one emit-per-contract line at each named phase.

## Conventions to preserve

- Function over costume appears in every skill: the persona, the board, and the provenance
  are enhancements, never hard dependencies. If a layer is unreachable, run the full
  discipline anyway and say explicitly that it was skipped. Keep this property when editing
  any skill.
- Skill frontmatter: every `SKILL.md` carries `name`, `description` (with explicit
  natural-language triggers - this is how the skill is matched), `category`, and
  `dependencies: []`. Built skills also set `disable-model-invocation: true` and a
  `cache_key`. Match the existing shape when adding a skill.
- Retirement gate (satisfied 2026-07-02, keep for future replacements): a legacy skill is
  deleted only after its replacement passes `--plugin-dir` testing. `grill-me`, `diagnose`,
  `caveman`, `caveman-commit`, `caveman-review` are retired from `.claude/skills/`;
  `caveman-compress`, `caveman-help`, `caveman-stats` stay (`compress` mode depends on its
  skill file, and the engine hooks remain live).
- Skills reference shared docs by absolute plugin path: `${CLAUDE_PLUGIN_ROOT}/QUESTION.md`,
  `${CLAUDE_PLUGIN_ROOT}/BOARD.md`.

## Agent skills

### Issue tracker

Local markdown -- issues and PRDs live as files under `.scratch/<feature>/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Five canonical roles using default label strings (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context -- one `CONTEXT.md` plus `docs/adr/` at the repo root. See `docs/agents/domain.md`.
