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
| 05    | Investigative-Report Skill (staged)                  | ACTIVE   | --          | Session 2026-06-21 |
| 06    | Faceless Layer (staged)                              | ACTIVE   | --          | Session 2026-06-21 |
| 07    | Integration and Retirement                           | FOCUS    | --          | Session 2026-06-21 |

## Phase Notes

- **01-04 COMPLETE** -- built and live in `the-question/the-question/`. Locked against regression.
- **05 Investigative-Report (ACTIVE)** -- skill is built but staged in the session bundle;
  not yet spliced into the live tree.
- **06 Faceless (ACTIVE)** -- three wrappers built and staged; faceless mode-tracker handshake
  against `hooks/caveman-mode-tracker.js` is still unverified.
- **07 Integration and Retirement (FOCUS)** -- the current control point. Collects the four
  still-owed tasks from the session README:
  1. Splice the emission contract into `investigate` and `interrogate-spec` (provenance spec section 6).
  2. Apply the provenance section to `BOARD.md` (`patches/board-provenance-section.md` is a splice, not a drop-in).
  3. Verify the faceless mode-tracker handshake.
  4. RED baseline + REFACTOR pass per `writing-skills` TDD on each new skill before retiring
     `grill-me`, `diagnose`, `caveman`, `caveman-commit`, `caveman-review`.
     Retirement gate: a legacy skill is deleted only after its replacement passes `--plugin-dir` testing.

## Exit Criteria -- Phase 07 (FOCUS -> COMPLETE)

| Criterion | Description                                                       | Pass / Open |
| --------- | ----------------------------------------------------------------- | ----------- |
| C07-01    | Emission contract spliced into `investigate` + `interrogate-spec` | Pass        |
| C07-02    | Provenance section applied to `BOARD.md`                          | Pass        |
| C07-03    | Faceless mode-tracker handshake verified                          | Open        |
| C07-04    | TDD RED + REFACTOR pass on each staged skill                      | Open        |
| C07-05    | Legacy skills retired after replacements pass `--plugin-dir`      | Open        |
