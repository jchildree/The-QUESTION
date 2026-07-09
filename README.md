<img width="1122" height="1402" alt="ChatGPT Image Jul 9, 2026, 12_47_47 AM" src="https://github.com/user-attachments/assets/af25d1ef-2013-46f7-b850-60730407446a" />


# The Question

> **Who are you to ask me a question? I'm THE QUESTION!!!**

A Claude Code plugin built around **DC Comics' Vic Sage** — a faceless investigator who treats the first answer as a starting point, not a conclusion. Investigate first, build second; trust nothing you cannot attribute.

---

## What This Is

**The Question** is a Claude Code plugin (not a standalone application) that implements a rigorous investigative discipline for debugging, root-cause analysis, and architectural decision-making. The plugin has no build, no test runner, no lint — only markdown and YAML frontmatter conventions that define six investigative skills and a shared memory layer.

### Core Principle

> Investigate first, build second. Attribute everything.

---

## Core Features

- **6 Investigative Skills**: Structured problem-solving workflows with provenance tracking
- **Investigation Board**: Obsidian vault-based shared memory with SPIFFE-inspired attestation
- **Persona Layer**: DC Comics' Vic Sage voice — faceless, relentless, evidence-driven
- **Provenance Frontmatter**: Every claim carries source, method, and confidence metadata
- **Zero Hard Dependencies**: Skip any layer and skills still work

---

## Installation

### GitHub Marketplace (Recommended)

```bash
claude plugin marketplace add jchildree/The-QUESTION
claude plugin install the-question@the-question
```

### Local Development

Clone the repo and load the plugin directory:

```bash
git clone https://github.com/jchildree/The-QUESTION.git
cd The-QUESTION
claude --plugin-dir ./the-question/the-question
```

**Important:** Do not edit the `main` branch directly. Create a feature branch first.

---

## Quick Start

1. **Install the plugin** (see above)
2. **Read** `QUESTION.md` — the persona/voice guide
3. **Read** `BOARD.md` — the investigation board conventions
4. **Invoke a skill** using a slash command (e.g., `/investigate`, `/interrogate-spec`)

---

## Skills (6)

All skills set `disable-model-invocation: true` — invoke them explicitly via slash command or by name. They never auto-fire.

| Skill | Purpose | Input | Output |
|-------|---------|-------|--------|
| **`interrogate-spec`** | Stress-test a plan/design by asking one decision-tree branch at a time | Plan or design doc | Board notes with user answers as sources |
| **`investigate`** | Six-phase root-cause discipline (reproduce → minimize → hypothesize → instrument → fix-gate → cleanup) | Bug report or incident | Pinned board findings with verified root cause |
| **`investigative-report`** | Turn findings into sourced written case; tiered citation gates | Board findings | Polished written report with attribution |
| **`faceless`** | Terse, compressed, low-token voice for tight contexts | Any conversation | Caveman-style ultra-compressed response |
| **`faceless-commit`** | Compressed Conventional Commit messages | Code diff | One-line commit message |
| **`faceless-review`** | Compressed one-line code-review findings | PR diff | Severity-tagged, one-line findings |

---

## Architecture (Layers)

The plugin is layered. Later layers depend on earlier conventions, so changing a lower layer revises shipped artifacts.

### Layer 0: Persona (`QUESTION.md`)

Shared voice doc every skill reads first. Defines the one mechanical rule: **one finding/question at a time; escalate to a single follow-up "why" only on vague or contradictory answers.**

Function over costume — if this file is missing, every skill still runs and just drops the flavor.

### Layer 1: Provenance (`docs/superpowers/specs/spiffe-provenance.md`)

A SPIFFE-inspired addressing plus trust layer:

- **ID**: `spiffe://<trust-domain>/<case>/<kind>/<slug>` where kind ∈ `{subject, finding, hypothesis, question, source, fix}`
- **SVID** (Subject-Verifiable Investigation Document): Six frontmatter fields
  - `id` — SPIFFE URI
  - `asserted` — who/when claimed it
  - `source` — how it came to be known
  - `method` — verification approach
  - `confidence` — unverified (red) → corroborated (amber) → verified (green)
  - `verify` — re-runnable check script

**Rule:** Only `verified` findings (green) earn a permanent board pin. No `verify` script = no green.

### Layer 2: Board (`BOARD.md`)

The shared memory layer. An Obsidian vault at `docs/Obsidian Vault/The Question/` built on the `obsidian-vault` skill.

**Conventions:**
- No folders
- Title Case filenames
- `[[wikilinks]]` at bottom of every note (the red string / crazy wall)
- Node types: Case, Suspect, Source, Investigation Board Index
- Closed cases persist and are never deleted (enables cross-case recall)
- Frontmatter schema from Layer 1

### Layer 3: Investigative Skills

The skills that emit board nodes and implement the investigative discipline.

---

## Repository Layout

```
The-QUESTION/
├── the-question/the-question/        ← Live plugin root (${CLAUDE_PLUGIN_ROOT})
│   ├── .claude-plugin/
│   │   └── plugin.json
│   ├── QUESTION.md                   ← Voice doc (shared by all skills)
│   ├── BOARD.md                      ← Board conventions
│   ├── README.md                     ← Plugin README
│   ├── docs/
│   │   ├── origins/                  ← Founding intent (case zero)
│   │   ├── superpowers/
│   │   │   └── specs/
│   │   │       └── spiffe-provenance.md  ← Provenance layer spec
│   │   └── phase-status/
│   │       └── INDEX.md              ← Phase 01-07 completion status
│   └── [SKILL_1]/
│   └── [SKILL_2]/
│   └── ...
├── docs/Obsidian Vault/The Question/  ← Investigation board (shared memory)
├── CLAUDE.md                           ← Guidance for Claude Code on this repo
└── README.md                           ← This file
```

**Manifest Gotcha:** An empty `author.name` in `.claude-plugin/plugin.json` silently disables the whole plugin with no error. Keep it non-empty.

---

## Development & Testing

### Local Test (Interactive)

```bash
cd /path/to/The-QUESTION
claude --plugin-dir ./the-question/the-question
```

Then invoke skills via slash command (e.g., `/investigate`).

### Headless Test Limitation

`claude -p` (headless) cannot user-invoke skills, and `disable-model-invocation: true` hides them from the Skill tool. To headless-test:

1. Make a temp copy of the plugin
2. Strip `disable-model-invocation: true`
3. Test on the copy
4. Restore the flag before committing

### TDD Discipline

Per `writing-skills`, a new skill gets:

1. **RED** baseline (skill invoked, reproduces the problem)
2. **REFACTOR** pass (improve, optimize, clarify)
3. Only then retire the skill it replaces

There is no automated test suite. "Testing" means invoking under `--plugin-dir` and confirming behavior.

---

## Language Composition

| Language | Percent |
|----------|---------|
| JavaScript | 58.6% |
| Python | 16.3% |
| Shell | 9.6% |
| PowerShell | 6.6% |
| HTML | 5.4% |
| TypeScript | 3.5% |

The plugin uses JavaScript for skill logic and shell/PowerShell for installation and hooks.

---

## Related Projects in This Repo

- **Claude-ITect-Skill** — A separate 54-skill pack for Claude Code (in `Claud-itect-Skill-main/`). Provides workflow orchestration, engineering disciplines, and token compression. Can coexist with The Question plugin.

---

## Key Docs to Read

1. **`QUESTION.md`** — Voice, persona, mechanical rules
2. **`BOARD.md`** — Investigation board conventions and node schema
3. **`CLAUDE.md`** — Guidance on working in this repo (in root)
4. **`docs/origins/`** — Founding intent and case zero
5. **`docs/phase-status/INDEX.md`** — Phase 01-07 completion status

---

## Workflow Example: Debugging a Bug

```
User: "I'm getting a 500 error when creating a new user"
      ↓
Invoke /investigate
      ↓
Skill: Reproduce the error
      ↓
User: "Here's the reproduction case..."
      ↓
Skill: Minimize, isolate, hypothesis
      ↓
User: Answers hypothesis questions (pinned to board as "source: user")
      ↓
Skill: Instrument and trace
      ↓
Skill: Root-cause finding → board, confidence: corroborated
      ↓
User: Provides verify check (e.g., test that catches it)
      ↓
Skill: Confidence escalates to verified (green)
      ↓
Fix-gate enforces: no merge without verified root cause
      ↓
User: Applies fix, runs regression tests, cleanup
      ↓
Closed case pinned to board (persists for cross-case recall)
```

---

## Contributing

- **Do not edit `main` directly.** Create a feature branch.
- New skills follow TDD: RED → REFACTOR → retire old skill
- Every claim must carry `verify` to earn green (verified) confidence
- Board notes use `[[wikilinks]]` for navigation
- Update `docs/phase-status/INDEX.md` when phases complete

---

## Phases (All Complete)

- ✅ Phase 01-07: Build, validate, integrate, retire (see `docs/phase-status/INDEX.md`)

---

## Attribution & License

Inspired by **DC Comics' Vic Sage** (the Question): a faceless investigator who trusts nothing without evidence.

Plugin authored by **@jchildree**.

---

## Questions?

Open an issue or pull request on GitHub.

For deeper guidance on working in this repo, see `CLAUDE.md` in the root.
