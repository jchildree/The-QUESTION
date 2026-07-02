# Spec -- the `faceless` layer (Layer 4)

> Three thin persona wrappers -- `faceless` / `faceless-commit` / `faceless-review` -- wearing
> the Question's clipped, faceless terseness over the **untouched caveman engine**. Re-voice
> the rules, retire the caveman prompt-skills, never touch the hooks.
>
> **Honest scope:** the compression mechanics are already persona-neutral and near-optimal.
> This layer changes the _face_ and the _name_, not the technique. Its value is thematic
> coherence (one persona across the plugin) plus consolidation, not new behavior.

---

## What it replaces -- and what it must not

- **Retired after verification (prompt-skills):** `caveman`, `caveman-commit`, `caveman-review`.
- **Untouched (the engine):** `hooks/caveman-mode-tracker.js`, `hooks/caveman-stats.js`, the
  Python package, the external GitHub dependency.
- **Out of scope -- stay caveman-native for now:** `caveman-stats`, `caveman-help`,
  `caveman-compress`, `cavecrew`. (No pre-building for undesigned components.)

---

## The engine boundary (verified against the files)

- The three target skills are **pure prompt** -- their SKILL.md bodies are just the rules;
  `dependencies: []`.
- The executable backing is the hooks: `caveman-mode-tracker.js` watches the session log for
  the **active mode**; `caveman-stats.js` returns formatted savings (hook-delivered,
  `user-invocable: false` -- the model computes nothing).
- ⚠ **The handshake:** the tracker is keyed on _caveman mode_. `faceless` may wear the
  Question's face to the user, but under the hood it must still register as caveman-mode, or
  the stats hook goes blind. **The exact marker must be verified against
  `caveman-mode-tracker.js` (not on disk) before build.**

---

## 1. `faceless` (replaces `caveman`)

- **Voice:** the faceless investigator -- clipped, no ornament, evidence only. _(Was: smart
  caveman grunt. Same teeth, colder face.)_
- **Mechanics unchanged:** drop articles, filler, hedging, pleasantries; fragments fine;
  technical terms exact; code blocks and error strings verbatim.
- **Levels:** keep the engine's vocabulary **exactly** -- `lite` / `full` / `ultra` /
  `wenyan-*` -- re-voicing only the prose. The hook handshake depends on these names.
- **Auto-clarity unchanged:** drop terse mode for security warnings, irreversible-action
  confirmations, and anywhere compression breeds ambiguity. Resume after.

## 2. `faceless-commit` (replaces `caveman-commit`)

Near-identical -- `caveman-commit` is _already_ faceless: no `I`/`we`, no AI attribution, the
diff speaks. Conventional Commits, subject ≤50 chars, why-over-what. The re-voice is the
rename and the trigger.

## 3. `faceless-review` (replaces `caveman-review`)

Near-identical -- already terse and impersonal. One line per finding: location, problem, fix;
severity prefixes. The re-voice is the rename and the trigger.

---

## Boundaries (independence)

`faceless` is **voice, not investigation.** No coupling to the provenance / board layer. A
review finding that deserves a pin is `investigate`'s job -- not `faceless-review`'s. The
wrappers carry prompt only; the engine carries code.

---

## Retirement

Per the repo rule: `caveman` / `caveman-commit` / `caveman-review` are deleted from
`/mnt/skills/user/` **only after** the `faceless*` skills pass `--plugin-dir` testing. The
engine and the four out-of-scope satellites stay live throughout.

---

## Worked example -- same answer, two faces

_"Why does my React component re-render?"_ -- `full` level:

- **caveman:** `New object ref each render. Inline object prop = new ref = re-render. Wrap in useMemo.`
- **faceless:** `Inline obj prop → new ref every render → re-render. Wrap useMemo.`

Same compression, colder register. The mechanics didn't move; the persona did.

---

## Open calls (flagged for J)

1. **`wenyan-*` levels** -- keep them under `faceless` (engine capability, distinctive) or drop
   them in the re-voice as off-theme for a faceless investigator?
2. **Triggers** -- `faceless`-native triggers (`/faceless`) mapping to caveman-mode internally;
   keep the old `caveman` triggers as aliases during the transition, or cut them?
3. **Level labels** -- keep `lite`/`full`/`ultra` user-facing, or re-label for the Question
   while preserving the engine names internally?
