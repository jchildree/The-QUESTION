# Dogfood + Publish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prove the `investigate` skill's emission contract end-to-end against a seeded-bug fixture (Phase 08), then publish the plugin as an installable marketplace (Phase 09).

**Architecture:** Phase 08 adds a `dogfood/` harness at the repo root: a tiny Node fixture with a known off-by-one bug, a headless `claude --plugin-dir` run that invokes `investigate` and stops at the fix-gate, and a `verify-board.js` script that asserts the emitted Obsidian board nodes carry valid SVID provenance frontmatter. Phase 09 adds a root `.claude-plugin/marketplace.json` pointing at the existing plugin tree, rewrites the stale README, bumps the version to 1.0.0, and tags a GitHub release.

**Tech Stack:** Node (no new dependencies), Claude Code CLI headless mode, GitHub CLI. Repo is markdown/JS-hooks only; there is no build or test framework -- verification is running scripts and reading their output.

---

## Context an executor must know (read before Task 1)

- Repo root: `C:\Users\GreenSide\repos\The Question`. Default branch `main` is protected by convention -- never commit to it directly; each phase gets its own branch and PR.
- Live plugin root: `the-question/the-question/` (the directory containing `.claude-plugin/plugin.json`). All six skills live under its `skills/`.
- Every skill sets `disable-model-invocation: true`, which hides it from the Skill tool. Headless print mode (`claude -p`) cannot user-invoke skills either. So headless testing ALWAYS uses a temp copy of the plugin with that flag stripped. This is established practice in this repo (see `docs/phase-status/INDEX.md`, C07-04 harness caveat).
- Windows Git Bash gotchas (all previously hit in this repo):
  - Pass Windows-style paths (`C:/...`) to `--plugin-dir`. `/tmp/...` resolves to a nonexistent `C:\tmp` inside the Windows node binary and fails silently.
  - Git Bash mangles leading-slash prompt args; do not use `-p "/skill-name"` prompts, use "Use the Skill tool to invoke <name>" phrasing.
  - Append `< /dev/null` to headless `claude -p` calls to skip the stdin wait.
- Encoding rules (enforced by a PostToolUse hook that scans the WHOLE file): no em-dashes, en-dashes, or smart quotes in any file. ASCII `--` and straight quotes only. The hook blocks the edit if any banned char is present anywhere in the file.
- lint-staged + prettier run on every commit and may reformat markdown; re-check committed artifacts after commit if exactness matters.
- The emission contract under test (from `the-question/the-question/skills/investigate/SKILL.md`):
  - Phase 3: each Suspect pinned as a `hypothesis` node, `confidence: unverified`, `verify:` set to the confirming experiment.
  - Phase 4: two or more agreeing probes promote to `confidence: corroborated`.
  - Gate: `verify` passing promotes to `confidence: verified` (green); the fix-gate requires green PLUS user consent. No verify, no green.
  - Board vault lands inside the INVESTIGATED project at `docs/Obsidian Vault/The Question/`, per `${CLAUDE_PLUGIN_ROOT}/BOARD.md`.
- SVID frontmatter fields (from `BOARD.md`, "Node identity & provenance"): `id` (a `spiffe://<trust-domain>/<case>/<kind>/<slug>` URI), `asserted`, `source`, `method`, `confidence`, `verify`.

---

## Phase 08 -- Dogfood investigate end-to-end

### Task 1: Branch and phase registry entry

**Files:**

- Modify: `docs/phase-status/INDEX.md`

- [ ] **Step 1: Create the branch**

```bash
cd "/c/Users/GreenSide/repos/The Question" && git checkout main && git pull && git checkout -b feat/phase-08-dogfood
```

- [ ] **Step 2: Add Phase 08 to the registry table**

In `docs/phase-status/INDEX.md`, append this row to the Phase Registry table (after the Phase 07 row):

```markdown
| 08 | Dogfood (investigate end-to-end) | FOCUS | -- | Plan 2026-07-02 |
```

- [ ] **Step 3: Add the Phase 08 exit criteria section**

Append to the end of `docs/phase-status/INDEX.md`:

```markdown
## Exit Criteria -- Phase 08 (FOCUS -> COMPLETE)

| Criterion | Description                                                       | Pass / Open |
| --------- | ----------------------------------------------------------------- | ----------- |
| C08-01    | Fixture bug reproduces deterministically (`node test.js` exits 1) | Open        |
| C08-02    | Headless investigate run emits board nodes into the fixture vault | Open        |
| C08-03    | `verify-board.js` passes: SVID schema, spiffe IDs, ladder, gate   | Open        |
```

- [ ] **Step 4: Commit**

```bash
git add docs/phase-status/INDEX.md && git commit -m "docs: open Phase 08 (dogfood investigate end-to-end)"
```

### Task 2: Seeded-bug fixture

**Files:**

- Create: `dogfood/fixture/stats.js`
- Create: `dogfood/fixture/test.js`
- Modify: `.gitignore`

- [ ] **Step 1: Write the buggy module**

Create `dogfood/fixture/stats.js`:

```js
function average(values) {
  let sum = 0;
  for (const v of values) sum += v;
  return sum / (values.length + 1);
}

module.exports = { average };
```

The seeded bug is the `+ 1` in the divisor. Do not fix it; the fixture exists to stay broken.

- [ ] **Step 2: Write the failing test (the fixture's feedback loop)**

Create `dogfood/fixture/test.js`:

```js
const assert = require("assert");
const { average } = require("./stats");

assert.strictEqual(
  average([2, 4, 6]),
  4,
  "average([2,4,6]) should be 4, got " + average([2, 4, 6])
);
console.log("OK");
```

- [ ] **Step 3: Run the test to verify it fails (C08-01)**

```bash
cd "/c/Users/GreenSide/repos/The Question/dogfood/fixture" && node test.js; echo "exit: $?"
```

Expected: `AssertionError ... average([2,4,6]) should be 4, got 3` and `exit: 1`.

- [ ] **Step 4: Ignore the generated board vault**

Append to `.gitignore` (repo root):

```text
# Dogfood: board vault is generated per run, reset before each run
dogfood/fixture/docs/
```

- [ ] **Step 5: Commit**

```bash
cd "/c/Users/GreenSide/repos/The Question" && git add dogfood/fixture/stats.js dogfood/fixture/test.js .gitignore && git commit -m "feat: seeded-bug fixture for investigate dogfood (C08-01)"
```

### Task 3: Board verifier

**Files:**

- Create: `dogfood/verify-board.js`

- [ ] **Step 1: Write the verifier**

Create `dogfood/verify-board.js`:

```js
#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const vaultDir = path.join(
  __dirname,
  "fixture",
  "docs",
  "Obsidian Vault",
  "The Question"
);

function fail(msg) {
  console.error("FAIL: " + msg);
  process.exit(1);
}

if (!fs.existsSync(vaultDir)) fail("vault dir missing: " + vaultDir);
const files = fs.readdirSync(vaultDir).filter((f) => f.endsWith(".md"));
if (files.length === 0) fail("no board notes in " + vaultDir);

function frontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;
  const fields = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z][\w-]*):\s*(.*)$/);
    if (kv) fields[kv[1]] = kv[2].trim().replace(/^['"]|['"]$/g, "");
  }
  return fields;
}

const LADDER = ["unverified", "corroborated", "verified"];
let hypotheses = 0;
let verified = 0;

for (const f of files) {
  const fm = frontmatter(fs.readFileSync(path.join(vaultDir, f), "utf8"));
  if (!fm || !fm.id) continue;
  if (!/^spiffe:\/\/[^/]+\/[^/]+\/[^/]+\/.+$/.test(fm.id))
    fail(
      f + ": id is not a spiffe://<domain>/<case>/<kind>/<slug> URI: " + fm.id
    );
  if (fm.confidence && !LADDER.includes(fm.confidence))
    fail(f + ": confidence not on the ladder: " + fm.confidence);
  if (/\/hypothesis\//.test(fm.id)) hypotheses += 1;
  if (fm.confidence === "verified") {
    if (!fm.verify)
      fail(f + ": verified node without verify (no verify, no green)");
    verified += 1;
  }
}

if (hypotheses === 0)
  fail("no hypothesis nodes emitted (Phase 3 emit missing)");
if (verified === 0) fail("no verified green node (Gate emit missing)");
console.log(
  "PASS: " +
    files.length +
    " notes, " +
    hypotheses +
    " hypotheses, " +
    verified +
    " verified"
);
```

Notes on intent: nodes without an `id` (the Case note or index may not carry SVID) are skipped rather than failed; the hard assertions are the spiffe URI shape, the confidence ladder vocabulary, at least one Phase 3 hypothesis emit, at least one Gate green emit, and the no-verify-no-green rule.

- [ ] **Step 2: Run the verifier to verify it fails RED (no vault yet)**

```bash
cd "/c/Users/GreenSide/repos/The Question" && node dogfood/verify-board.js; echo "exit: $?"
```

Expected: `FAIL: vault dir missing: ...` and `exit: 1`.

- [ ] **Step 3: Commit**

```bash
git add dogfood/verify-board.js && git commit -m "feat: board provenance verifier for dogfood (C08-03 harness)"
```

### Task 4: Headless investigate run (C08-02) and verification (C08-03)

**Files:**

- No repo files change in this task except `docs/phase-status/INDEX.md` in Task 5. The run writes only into `dogfood/fixture/docs/` (gitignored) and a temp plugin copy outside the repo.

- [ ] **Step 1: Build the temp plugin copy with model invocation enabled**

```bash
rm -rf /c/Users/GreenSide/AppData/Local/Temp/tq-dogfood && cp -r "/c/Users/GreenSide/repos/The Question/the-question/the-question" /c/Users/GreenSide/AppData/Local/Temp/tq-dogfood && sed -i '/^disable-model-invocation: true$/d' /c/Users/GreenSide/AppData/Local/Temp/tq-dogfood/skills/*/SKILL.md && grep -L "disable-model-invocation" /c/Users/GreenSide/AppData/Local/Temp/tq-dogfood/skills/*/SKILL.md | wc -l
```

Expected: `6` (all six SKILL.md files no longer contain the flag).

- [ ] **Step 2: Reset the fixture vault**

```bash
rm -rf "/c/Users/GreenSide/repos/The Question/dogfood/fixture/docs"
```

- [ ] **Step 3: Run investigate headlessly against the fixture**

```bash
cd "/c/Users/GreenSide/repos/The Question/dogfood/fixture" && claude --plugin-dir "C:/Users/GreenSide/AppData/Local/Temp/tq-dogfood" --model sonnet --max-turns 50 --allowedTools "Skill,Read,Write,Edit,Glob,Grep,Bash(node:*),Bash(ls:*),Bash(mkdir:*)" -p "Use the Skill tool to invoke the skill named investigate, then follow its discipline for this bug report: running 'node test.js' in the current directory fails with an assertion error; average([2,4,6]) returns the wrong value. Requirements: follow the skill's board emission contract exactly (pin Suspects as hypothesis nodes with SVID frontmatter, promote confidence only by rule); the board vault goes in docs/Obsidian Vault/The Question/ inside the current directory. STOP at the Gate: report the confirmed root cause and the recommended fix, but do NOT modify stats.js or apply any fix -- there is no user present to consent." < /dev/null 2>&1 | tail -20
```

Expected: final output names the root cause (the `+ 1` in the divisor of `average`, `stats.js` line 4), states the recommended fix, and states it is stopping at the gate. Timebox: this run can take several minutes; use a 600000 ms timeout.

- [ ] **Step 4: Confirm the gate held (fixture still broken, no fix applied)**

```bash
cd "/c/Users/GreenSide/repos/The Question/dogfood/fixture" && node test.js; echo "exit: $?"; git status --short .
```

Expected: assertion still fails with `exit: 1`, and `git status` shows NO modifications to `stats.js` or `test.js` (the only new content is the gitignored `docs/` vault, which does not appear).

- [ ] **Step 5: Run the board verifier (C08-03)**

```bash
cd "/c/Users/GreenSide/repos/The Question" && node dogfood/verify-board.js; echo "exit: $?"
```

Expected: `PASS: <n> notes, <h> hypotheses, <v> verified` with `exit: 0`.

Failure handling (do not loop): if the model skipped board emission or wrote malformed frontmatter, re-run Steps 2-5 ONCE. If it fails twice, that is itself the dogfood finding -- the emission contract is not strong enough for the model to follow unaided. Stop, record the exact failure output in the Phase 08 evidence section of the registry, mark C08-02/C08-03 Open with a note, and surface to the user. Do not hand-edit board nodes to force a pass.

- [ ] **Step 6: Clean up the temp plugin copy**

```bash
rm -rf /c/Users/GreenSide/AppData/Local/Temp/tq-dogfood
```

### Task 5: Close Phase 08

**Files:**

- Modify: `docs/phase-status/INDEX.md`

- [ ] **Step 1: Record evidence and flip criteria to Pass**

In `docs/phase-status/INDEX.md`: change the Phase 08 row status from `FOCUS` to `COMPLETE`, change all three C08 criteria to `Pass`, and append under the C08 table:

```markdown
### C08 evidence (headless dogfood run, YYYY-MM-DD)

- C08-01: `node dogfood/fixture/test.js` fails deterministically (off-by-one divisor).
- C08-02: headless `investigate` run under `--plugin-dir` emitted board nodes into
  `dogfood/fixture/docs/Obsidian Vault/The Question/`.
- C08-03: `node dogfood/verify-board.js` -> PASS (<paste the actual PASS line>). Gate held:
  fixture test still fails, `stats.js` unmodified.
- Harness: temp plugin copy with `disable-model-invocation` stripped (same caveat as C07-04).
```

Replace `YYYY-MM-DD` with the run date and paste the real PASS line.

- [ ] **Step 2: Commit, push, PR, merge**

```bash
cd "/c/Users/GreenSide/repos/The Question" && git add docs/phase-status/INDEX.md && git commit -m "feat: close Phase 08 -- investigate dogfooded end-to-end" && git push -u origin feat/phase-08-dogfood && gh pr create --fill && gh pr merge --merge --delete-branch
```

If the post-merge checkout of `main` fails because live Obsidian config files changed underneath (known behavior), run `git fetch origin main:main && git checkout main && git branch -d feat/phase-08-dogfood`.

---

## Phase 09 -- Publish via marketplace.json

### Task 6: Branch and phase registry entry

**Files:**

- Modify: `docs/phase-status/INDEX.md`

- [ ] **Step 1: Create the branch**

```bash
cd "/c/Users/GreenSide/repos/The Question" && git checkout main && git pull && git checkout -b feat/phase-09-publish
```

- [ ] **Step 2: Add Phase 09 to the registry**

Append to the Phase Registry table:

```markdown
| 09 | Publish (marketplace + 1.0.0 release) | FOCUS | -- | Plan 2026-07-02 |
```

And append the criteria section at the end of the file:

```markdown
## Exit Criteria -- Phase 09 (FOCUS -> COMPLETE)

| Criterion | Description                                                        | Pass / Open |
| --------- | ------------------------------------------------------------------ | ----------- |
| C09-01    | Root marketplace.json validates: local add + install + skills load | Open        |
| C09-02    | README rewritten: marketplace install, six live skills, no stale   | Open        |
| C09-03    | plugin.json at 1.0.0; v1.0.0 tag and GitHub release published      | Open        |
```

- [ ] **Step 3: Commit**

```bash
git add docs/phase-status/INDEX.md && git commit -m "docs: open Phase 09 (publish)"
```

### Task 7: Marketplace manifest

**Files:**

- Create: `.claude-plugin/marketplace.json` (repo root)
- Modify: `the-question/the-question/.claude-plugin/plugin.json`

- [ ] **Step 1: Write the marketplace manifest**

Create `.claude-plugin/marketplace.json` at the REPO ROOT (not inside the plugin tree). The `source` path points at the plugin root relative to the repo root:

```json
{
  "$schema": "https://anthropic.com/claude-code/marketplace.schema.json",
  "name": "the-question",
  "description": "Root-truth investigation, spec interrogation, and evidence-backed writing -- faceless, relentless, precise.",
  "owner": {
    "name": "Scythe",
    "url": "https://github.com/jchildree"
  },
  "plugins": [
    {
      "name": "the-question",
      "description": "Vic Sage investigation discipline: interrogate specs, investigate root causes with a provenance-backed case board, write sourced reports, faceless voice.",
      "source": "./the-question/the-question",
      "category": "engineering"
    }
  ]
}
```

Known constraint: `author.name` (and by extension `owner.name`) must be non-empty -- an empty name silently disables the plugin with no error.

- [ ] **Step 2: Bump the plugin version**

In `the-question/the-question/.claude-plugin/plugin.json`, change:

```json
  "version": "0.1.0",
```

to:

```json
  "version": "1.0.0",
```

- [ ] **Step 3: Validate locally -- add the marketplace from the repo path (C09-01)**

```bash
claude plugin marketplace add "C:/Users/GreenSide/repos/The Question" 2>&1 | tail -3 && claude plugin install the-question@the-question 2>&1 | tail -3
```

Expected: both commands succeed. If `claude plugin` subcommands are unavailable in the installed CLI version, fall back to two checks: the manifest parses (`node -e "JSON.parse(require('fs').readFileSync('.claude-plugin/marketplace.json','utf8')); console.log('parses OK')"`), and a headless smoke run on a temp flag-stripped plugin copy built exactly as in Task 4 Step 1 confirms the skills still invoke. Record which validation path was used in the C09 evidence.

- [ ] **Step 4: Confirm installed plugin loads, then uninstall the local test install**

```bash
claude --model haiku -p "Try to invoke the skill named investigate via the Skill tool. Output exactly: investigate: OK or investigate: ABSENT." < /dev/null 2>&1 | tail -1; claude plugin uninstall the-question 2>&1 | tail -1; claude plugin marketplace remove the-question 2>&1 | tail -1
```

Expected: `investigate: ABSENT` is the EXPECTED output when the shipped flag `disable-model-invocation: true` is present -- the load check here is that the install/uninstall commands succeed without error. If the CLI prints an error on install, C09-01 fails; stop and diagnose before continuing.

- [ ] **Step 5: Commit**

```bash
cd "/c/Users/GreenSide/repos/The Question" && git add .claude-plugin/marketplace.json the-question/the-question/.claude-plugin/plugin.json && git commit -m "feat: marketplace manifest and 1.0.0 version bump"
```

### Task 8: README rewrite

**Files:**

- Modify: `the-question/the-question/README.md` (full replacement -- current content is stale: lists two skills as roadmap, cites a dead `/mnt/skills/user/` retirement path)

- [ ] **Step 1: Replace README.md content**

````markdown
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
````

- [ ] **Step 2: Verify encoding passes the hook**

```bash
cd "/c/Users/GreenSide/repos/The Question" && node -e "const{checkEncoding}=require('./.claude/hooks/check-encoding.js');const r=checkEncoding(require('fs').readFileSync('the-question/the-question/README.md'));console.log(r&&r.length?'DIRTY':'CLEAN')"
```

Expected: `CLEAN`.

- [ ] **Step 3: Commit**

```bash
git add the-question/the-question/README.md && git commit -m "docs: rewrite plugin README for 1.0.0 (marketplace install, six skills)"
```

### Task 9: Release and close Phase 09

**Files:**

- Modify: `docs/phase-status/INDEX.md`

- [ ] **Step 1: Record evidence and flip criteria**

In `docs/phase-status/INDEX.md`: Phase 09 row `FOCUS` -> `COMPLETE`, C09-01..03 -> `Pass`, and append:

```markdown
### C09 evidence (YYYY-MM-DD)

- C09-01: <which validation path ran and its output line>
- C09-02: README rewritten; encoding hook CLEAN.
- C09-03: plugin.json 1.0.0; tag v1.0.0 and GitHub release published.
```

- [ ] **Step 2: Commit, push, PR, merge**

```bash
cd "/c/Users/GreenSide/repos/The Question" && git add docs/phase-status/INDEX.md && git commit -m "feat: close Phase 09 -- published 1.0.0" && git push -u origin feat/phase-09-publish && gh pr create --fill && gh pr merge --merge --delete-branch
```

Same post-merge checkout fallback as Task 5 Step 2 if Obsidian config churn blocks the branch switch.

- [ ] **Step 3: Tag and release (C09-03) -- AFTER the merge, on main**

```bash
cd "/c/Users/GreenSide/repos/The Question" && git checkout main && git pull && git tag v1.0.0 && git push origin v1.0.0 && gh release create v1.0.0 --title "The Question 1.0.0" --notes "First public release. Six skills (interrogate-spec, investigate, investigative-report, faceless, faceless-commit, faceless-review), SPIFFE-inspired provenance board, marketplace install: claude plugin marketplace add jchildree/The-QUESTION"
```

Expected: release URL printed. Tagging happens after merge so the tag lands on the merge commit that actually contains the manifest.

- [ ] **Step 4: Post-release install check from GitHub (final C09-01 confirmation)**

```bash
claude plugin marketplace add jchildree/The-QUESTION 2>&1 | tail -2 && claude plugin install the-question@the-question 2>&1 | tail -2 && claude plugin uninstall the-question 2>&1 | tail -1 && claude plugin marketplace remove the-question 2>&1 | tail -1
```

Expected: add + install succeed from the public repo; uninstall/remove clean up. If `claude plugin` subcommands are unavailable, skip this step and note in the registry evidence that validation was local-only.
