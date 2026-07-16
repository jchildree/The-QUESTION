# The Question

A Claude Code plugin and desktop console built around DC Comics' Vic Sage: a faceless investigator who treats the first answer as a starting point, not a conclusion. Investigate first, build second; trust nothing you cannot attribute.

This repo ships two things:

- **The Question plugin** (`the-question/the-question/`) - six Claude Code skills for disciplined investigation
- **The Question Console** (`console/`) - an Electron desktop app that visualizes the investigation board

## Plugin

### Install from marketplace

```text
claude plugin marketplace add jchildree/The-QUESTION
claude plugin install the-question@the-question
```

### Local development

```text
claude --plugin-dir ./the-question/the-question
```

### Skills

| Skill                  | What it does                                                                  |
| ---------------------- | ----------------------------------------------------------------------------- |
| `interrogate-spec`     | Stress-test a plan one decision-tree branch at a time                         |
| `investigate`          | Six-phase root-cause discipline; findings pinned to the board with provenance |
| `investigative-report` | Turn findings into a sourced written case; tiered citation gate               |
| `faceless`             | Terse, compressed, low-token voice                                            |
| `faceless-commit`      | Compressed commit messages (Conventional Commits)                             |
| `faceless-review`      | Compressed one-line code-review findings                                      |

All skills use `disable-model-invocation: true` -- invoke them explicitly by slash command or name; they never auto-fire.

## Console

A desktop app that reads and writes the investigation board vault (`.md` files with SPIFFE provenance frontmatter), visualizes confidence as card colors, and lets you interrogate with Vic Sage via the Claude API.

### Download

Download the latest `The.Question.Console-Setup.exe` from [Releases](https://github.com/jchildree/The-QUESTION/releases).

Run the installer. On first launch the console copies the plugin to `~/.claude/plugins/the-question/` automatically (Windows only).

### Build from source

Requires Node.js 18+ and a Claude API key.

```text
git clone https://github.com/jchildree/The-QUESTION.git
cd The-QUESTION/console
npm install
npm run dev
```

To build the NSIS installer:

```text
npm run dist
```

Output lands in `console/release/`.

### Usage

1. Launch the app and click **Open Vault** to point it at an Obsidian vault that contains The Question board files (`.md` files with SPIFFE frontmatter).
2. Enter your Claude API key via the key icon in the header.
3. **Crazy Board** - drag cards, draw yarn strings between nodes, add post-its.
4. **Editor** - select a card from the sidebar to read or edit its markdown.
5. **Terminal** - ask Vic Sage to investigate; new files written by Claude appear on the board automatically.

Yarn strings are auto-derived from `[[wikilinks]]` in vault files. Drawing a manual yarn string writes the wikilink back to the source file.

### Confidence colors

Board card borders reflect the SPIFFE `confidence` frontmatter field:

| Color | Confidence     |
| ----- | -------------- |
| Red   | `unverified`   |
| Amber | `corroborated` |
| Green | `verified`     |

## Investigation model

`QUESTION.md` is the voice doc every skill reads first. `BOARD.md` is the board memory layer (an Obsidian vault inside the investigated project) with SPIFFE-inspired provenance frontmatter: every claim carries an `id`, a `source`, and a `confidence` that climbs `unverified` -> `corroborated` -> `verified` only by rule. No `verify`, no green, no fix.

All layers are enhancements, never hard dependencies -- if one is unreachable, every skill still runs the full discipline and says what was skipped.
