---
name: investigate
version: "1.0"
category: engineering
execution_speed: medium
token_efficiency: medium
triggers:
  - "diagnose this"
  - "debug this"
  - "investigate this"
  - "bug"
  - "broken"
  - "performance regression"
cache_key: "investigate-1.0"
dependencies: []
disable-model-invocation: true
description: Disciplined root-cause investigation for hard bugs and performance regressions, with findings pinned to the case board. Use when user reports a bug, says something is broken/throwing/failing, describes a performance regression, or asks to diagnose/debug/investigate something.
---

# Investigate

Replaces `diagnose`. Reads `${CLAUDE_PLUGIN_ROOT}/QUESTION.md` for voice
and `${CLAUDE_PLUGIN_ROOT}/BOARD.md` for board conventions before
starting.

**Scope:** application-layer bugs. For environment, config, or
infrastructure issues, use `/systematic-debugging` instead.

A discipline for hard bugs. Skip phases only when explicitly justified.
On start, open or create the Case note on the board.

## Phase 1 — Build a feedback loop

This is the skill; everything else is mechanical. Construct a fast,
deterministic, agent-runnable pass/fail signal for the bug — failing
test, curl/HTTP script, CLI fixture diff, headless browser script,
replayed trace, throwaway harness, fuzz loop, bisection harness,
differential loop, or (last resort) a scripted human-in-the-loop pass.
Iterate on the loop itself: faster, sharper signal, more deterministic.
For non-deterministic bugs, raise the reproduction rate rather than
chasing a clean repro. If you genuinely cannot build a loop, stop and say
so — list what was tried, ask for environment access, a captured
artifact, or permission to add temporary production instrumentation. Do
not proceed without a loop you believe in.

## Phase 2 — Reproduce

Run the loop. Confirm it produces the symptom the user described (not a
different nearby failure), confirm it reproduces reliably (or at a
debuggable rate), and capture the exact symptom for later verification.

## Phase 3 — Hypothesise (board-aware)

Before generating new hypotheses, search the board for Suspect notes from
past Cases matching the current symptom — surface matches as candidate
hypotheses alongside fresh ones. Generate 3–5 ranked, falsifiable
hypotheses ("if X is the cause, then changing Y will make the bug
disappear"). Pin each as a Suspect note, wikilinked to the Case, before
testing begins. Show the ranked list to the user before testing — cheap
checkpoint, don't block if they're AFK.

## Phase 4 — Instrument (evidence pinned live)

Each probe maps to a specific Suspect's prediction; change one variable
at a time. Prefer debugger/REPL inspection over logs; tag any debug logs
with a unique prefix for cleanup. For performance regressions, measure
first (baseline + bisection) rather than logging. As results come in, log
them onto the corresponding Suspect note and update its verdict
(`Untested` → `Testing` → `Confirmed` / `Ruled Out`) live, not just at the
end.

## Gate — stop on Confirmed

The moment a Suspect's verdict flips to `Confirmed`, stop. Present the
verdict and the recommended fix. Wait for explicit user go-ahead before
writing any fix. This gate always waits — it guards consent for code
changes, not just hypothesis ranking.

## Phase 5 — Fix + regression test

Write the regression test before the fix, but only at a correct seam —
one that exercises the real bug pattern at the call site. If no correct
seam exists, that itself is the finding; note it and flag for cleanup.
If a seam exists: write the failing test, watch it fail, apply the fix,
watch it pass, re-run the Phase 1 loop against the original scenario.

## Phase 6 — Cleanup + post-mortem

Confirm: original repro no longer reproduces, regression test passes (or
seam absence is documented), all tagged debug instrumentation removed,
throwaway prototypes deleted. State the confirmed hypothesis in the
commit/PR message. Close the Case note with a link to the fix. Ask what
would have prevented this bug — if the answer is architectural, hand off
to `/improve-codebase-architecture` with specifics.

## Error Handling

If the board is unreachable, pinning is best-effort: run the full
six-phase discipline anyway and say explicitly that the board was
skipped. If Phase 3's board search turns up nothing relevant, proceed
exactly as without it — no behavior change.
