# Plugin Architecture

confidence: HIGH
source: CLAUDE.md, the-question-session-2026-06-21/README.md

The Question is a Claude Code plugin, not an application. No build, no test runner, no compiled code. The deliverable is prompt-skills (SKILL.md + YAML frontmatter) plus shared persona/board/provenance docs. "Code" means markdown and frontmatter conventions.

## Two trees, one product

- **`the-question/the-question/`** - the live plugin root (`${CLAUDE_PLUGIN_ROOT}`). Holds `.claude-plugin/plugin.json`, shared docs (`QUESTION.md`, `BOARD.md`), and built skills (`interrogate-spec`, `investigate`).
- **`the-question-session-2026-06-21/`** - a staged session bundle: work mirrored at its eventual repo paths but not yet spliced into the live tree. Carries the not-yet-merged skills (`investigative-report`, `faceless`, `faceless-commit`, `faceless-review`), the specs under `docs/superpowers/specs/`, and the `BOARD.md` provenance patch. Its `README.md` is the authoritative destination map.

The `.zip` files at the root are snapshots; edit the unpacked directories, not the archives.

## Retirement gate

Each replaced legacy skill (`grill-me`, `diagnose`, `caveman*`) is deleted only after its replacement passes `--plugin-dir` testing. Until then the original stays live. Never delete a legacy skill preemptively.

## Shared docs by absolute plugin path

Skills reference `${CLAUDE_PLUGIN_ROOT}/QUESTION.md` and `${CLAUDE_PLUGIN_ROOT}/BOARD.md`.

## Related

[[The Question Index]] - [[Skills Index]] - [[Faceless Mode]] - [[Roadmap Still Owed]]
