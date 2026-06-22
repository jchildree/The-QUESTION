# The Question — Session Bundle (2026-06-21)

Case-file index for this session's work. Everything here is **staged** for the plugin repo;
nothing has been pushed. Drop each piece at the path shown — the bundle already mirrors those
paths, except the `BOARD.md` patch (a splice, not a drop).

## Where it goes

| Bundle path                                      | Repo destination       | What it is                                                              |
| ------------------------------------------------ | ---------------------- | ----------------------------------------------------------------------- |
| `docs/origins/the-question-original-concept.md`  | same                   | **Case zero** — your founding note, transcribed with resolutions pinned |
| `docs/superpowers/specs/spiffe-provenance.md`    | same                   | Provenance layer spec — identity + SVID + emission contract             |
| `docs/superpowers/specs/investigative-report.md` | same                   | Layer 3 spec                                                            |
| `docs/superpowers/specs/faceless.md`             | same                   | Layer 4 spec                                                            |
| `skills/investigative-report/SKILL.md`           | same                   | Layer 3 skill (built)                                                   |
| `skills/faceless/SKILL.md`                       | same                   | Layer 4 core mode (built)                                               |
| `skills/faceless-commit/SKILL.md`                | same                   | built                                                                   |
| `skills/faceless-review/SKILL.md`                | same                   | built                                                                   |
| `patches/board-provenance-section.md`            | splice into `BOARD.md` | Node identity + provenance convention                                   |

## Decided this session

- **Ralph** → design lineage only — fresh-context, disk-as-memory, one-task philosophy. Not a literal runner.
- **SPIFFE** → identity framework, two levels deep: `spiffe://project/case/kind/slug` IDs + SVID-style provenance. No SPIRE, no crypto.
- **Citation gate** → tiered: hard for findings (must be `verified`), soft for color (flagged).
- **Report shape** → argument by default, narrative beats optional.
- **faceless** → re-voice (carries the rules; caveman prompt-skills retire). Engine untouched.

## Still owed (needs the live repo)

1. Splice the emission contract into `investigate` and `interrogate-spec` (provenance spec §6).
2. Apply the provenance section to `BOARD.md` — or paste it and I'll return a line-exact diff.
3. Verify the faceless mode-tracker handshake against `hooks/caveman-mode-tracker.js`.
4. Per `writing-skills` TDD: a RED baseline + REFACTOR pass on each new skill before retiring
   `grill-me`, `diagnose`, `caveman`, `caveman-commit`, `caveman-review`.

## Retirement gate (unchanged)

Old skills are deleted only after their replacements pass `--plugin-dir` testing. Until then,
every original stays live.
