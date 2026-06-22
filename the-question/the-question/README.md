# The Question

A Claude Code plugin built around the DC Comics character Vic Sage: a
faceless investigator who treats the first answer as a starting point,
not a conclusion.

## Install (local dev)

```
claude --plugin-dir ./the-question
```

## Skills

| Skill                  | Replaces                                                              | Status                     |
| ---------------------- | --------------------------------------------------------------------- | -------------------------- |
| `interrogate-spec`     | `grill-me`                                                            | Built                      |
| `investigate`          | `diagnose`                                                            | Built                      |
| `investigative-report` | `writing-fragments`, `writing-shape`, `writing-beats`, `edit-article` | Roadmap — not yet designed |
| `faceless`             | `caveman` + 6 satellite skills                                        | Roadmap — not yet designed |

`QUESTION.md` is the shared voice doc every skill reads. `BOARD.md` is
the shared investigation-board memory layer that `investigate` and
`investigative-report` pin findings to.

## Retirement plan

Each replaced skill is deleted from `/mnt/skills/user/` only after its
replacement is verified working under `--plugin-dir` testing. `grill-me`
and `diagnose` are still live pending that verification.
