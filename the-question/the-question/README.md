# The Question

A Claude Code plugin built around DC Comics' Vic Sage (the Question): a
faceless investigator who treats the first answer as a starting point,
not a conclusion. Investigate first, build second; trust nothing you
cannot attribute.

## Install

From the GitHub marketplace:

```text
claude plugin marketplace add jchildree/The-QUESTION
claude plugin install the-question@the-question
```

Local development (from a clone, repo root):

```text
claude --plugin-dir ./the-question/the-question
```

## Skills

| Skill                  | What it does                                                                  |
| ---------------------- | ----------------------------------------------------------------------------- |
| `interrogate-spec`     | Stress-test a plan one decision-tree branch at a time                         |
| `investigate`          | Six-phase root-cause discipline; findings pinned to the board with provenance |
| `investigative-report` | Turn findings into a sourced written case; tiered citation gate               |
| `faceless`             | Terse, compressed, low-token voice                                            |
| `faceless-commit`      | Compressed commit messages (Conventional Commits)                             |
| `faceless-review`      | Compressed one-line code-review findings                                      |

All skills set `disable-model-invocation: true`: invoke them explicitly
(slash command or by asking for the skill by name), they never auto-fire.

## Shared layers

`QUESTION.md` is the voice doc every skill reads first. `BOARD.md` is the
investigation-board memory layer (an Obsidian vault inside the
investigated project) with SPIFFE-inspired provenance frontmatter: every
claim carries an `id`, a `source`, and a `confidence` that climbs
unverified -> corroborated -> verified only by rule. No `verify`, no
green, no fix.

All three layers are enhancements, never hard dependencies: if one is
unreachable, every skill still runs the full discipline and says what was
skipped.
