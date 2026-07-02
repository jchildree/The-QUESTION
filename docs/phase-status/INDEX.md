# Phase Registry

Single source of truth for phase status. All other documents defer to this table on conflict.
Update this table first; prose follows.

Project: The Question (Claude Code plugin). Phases mirror the layered architecture in
`CLAUDE.md` plus the staged-merge work owed by `the-question-session-2026-06-21/README.md`.
No ADRs exist yet, so the gating column is empty for every phase.

| Phase | Title                                                | Status   | Gating ADRs | Source             |
| ----- | ---------------------------------------------------- | -------- | ----------- | ------------------ |
| 01    | Persona Layer (QUESTION.md)                          | COMPLETE | --          | Architecture L0    |
| 02    | Provenance Spec (SPIFFE-inspired)                    | COMPLETE | --          | Architecture L1    |
| 03    | Board Layer (BOARD.md + Obsidian vault)              | COMPLETE | --          | Architecture L2    |
| 04    | Investigative Skills (investigate, interrogate-spec) | COMPLETE | --          | Architecture L3    |
| 05    | Investigative-Report Skill (staged)                  | COMPLETE | --          | Session 2026-06-21 |
| 06    | Faceless Layer (staged)                              | COMPLETE | --          | Session 2026-06-21 |
| 07    | Integration and Retirement                           | COMPLETE | --          | Session 2026-06-21 |
| 08    | Dogfood (investigate end-to-end)                     | FOCUS    | --          | Plan 2026-07-02    |

## Phase Notes

- **01-04 COMPLETE** -- built and live in `the-question/the-question/`. Locked against regression.
- **05 Investigative-Report (COMPLETE)** -- skill merged into the live tree
  (`the-question/the-question/skills/investigative-report/`) and passed `--plugin-dir` testing.
- **06 Faceless (COMPLETE)** -- three wrappers merged into the live tree; mode-tracker
  handshake verified via `.claude/hooks/faceless-mode-tracker.js` bridge (engine untouched).
- **07 Integration and Retirement (COMPLETE)** -- all five exit criteria pass. Collected the
  four still-owed tasks from the session README:
  1. Splice the emission contract into `investigate` and `interrogate-spec` (provenance spec section 6).
  2. Apply the provenance section to `BOARD.md` (`patches/board-provenance-section.md` is a splice, not a drop-in).
  3. Verify the faceless mode-tracker handshake.
  4. RED baseline + REFACTOR pass per `writing-skills` TDD on each new skill before retiring
     `grill-me`, `diagnose`, `caveman`, `caveman-commit`, `caveman-review`.
     Retirement gate: a legacy skill is deleted only after its replacement passes `--plugin-dir` testing.

## Exit Criteria -- Phase 07 (closed 2026-07-02, FOCUS -> COMPLETE)

| Criterion | Description                                                       | Pass / Open |
| --------- | ----------------------------------------------------------------- | ----------- |
| C07-01    | Emission contract spliced into `investigate` + `interrogate-spec` | Pass        |
| C07-02    | Provenance section applied to `BOARD.md`                          | Pass        |
| C07-03    | Faceless mode-tracker handshake verified                          | Pass        |
| C07-04    | TDD RED + REFACTOR pass on each staged skill                      | Pass        |
| C07-05    | Legacy skills retired after replacements pass `--plugin-dir`      | Pass        |

### C07-04 evidence (headless `--plugin-dir`, 2026-07-02)

- RED: without the plugin, all four staged skills report ABSENT via the Skill tool.
- REFACTOR: added `cache_key` + `disable-model-invocation: true` to the four merged skills;
  normalized encoding; fixed `plugin.json` (empty `author.name` silently disables the whole
  plugin -- root cause found by bisect against a minimal control plugin).
- GREEN: all four skills invoke and behave (faceless compresses at default `full`,
  faceless-commit emits Conventional Commits, faceless-review emits one-line findings,
  investigative-report states the tiered citation gate). Shipped skills `investigate` and
  `interrogate-spec` still invoke (regression pass).
- Harness caveat: headless print mode cannot user-invoke skills, so GREEN ran on a temp copy
  of the plugin with `disable-model-invocation` stripped; the shipped tree is otherwise
  identical.

### C07-05 evidence

- Retired from `.claude/skills/`: `grill-me`, `diagnose`, `caveman`, `caveman-commit`,
  `caveman-review` (git rm, 2026-07-02). Kept: `caveman-compress`, `caveman-help`,
  `caveman-stats` (not in the retirement list; `compress` mode still depends on its skill).
- Engine intact post-retirement: `caveman-activate.js` falls back to its hardcoded ruleset;
  `caveman-mode-tracker.js` reinforcement unchanged (both re-run and verified).

## Exit Criteria -- Phase 08 (FOCUS -> COMPLETE)

| Criterion | Description                                                       | Pass / Open |
| --------- | ----------------------------------------------------------------- | ----------- |
| C08-01    | Fixture bug reproduces deterministically (`node test.js` exits 1) | Open        |
| C08-02    | Headless investigate run emits board nodes into the fixture vault | Open        |
| C08-03    | `verify-board.js` passes: SVID schema, spiffe IDs, ladder, gate   | Open        |
