---
name: interrogate-spec
version: "1.0"
category: planning
execution_speed: fast
token_efficiency: high
triggers:
  - "grill me"
  - "stress-test plan"
  - "stress test design"
  - "interview relentlessly"
cache_key: "interrogate-spec-1.0"
dependencies: []
disable-model-invocation: true
description: Use when the user wants a plan or design stress-tested before implementation, or asks to be grilled, interviewed, or interrogated about a decision tree.
---

# Interrogate Spec

Replaces `grill-me`. Reads `${CLAUDE_PLUGIN_ROOT}/QUESTION.md` for voice
before starting -- see that file for tone; everything below is mechanics.

## Loop

1. Interview one branch of the decision tree at a time.
2. Attach a recommended answer to every question.
3. Stop and wait for the user's response before continuing.
4. Prefer exploring the codebase over asking, whenever a question can be
   answered that way instead.

## Emission (provenance)

Emit nodes per `${CLAUDE_PLUGIN_ROOT}/BOARD.md`:

- **User answer** lands as a node with `source: user`, `method: observed`,
  `confidence: unverified`. Intent is authoritative; a factual claim from
  the user is still unchecked.
- **Spec decision locked** is emitted `method: quoted`, cross-checked
  against the domain model / prior cases, `confidence: corroborated`.

Function over costume: if the board or provenance layer is unreachable, run
the loop anyway and say the emission was skipped.

## Precision-Triggered Depth

Default behavior is the loop above -- one question, one recommendation,
move on. When an answer is vague, hand-waved, or contradicts a decision
already resolved earlier in the same session, chain exactly **one**
follow-up "why" before accepting it and moving to the next branch.

Never chain more than one follow-up. Never escalate on an answer that's
already specific and consistent -- that's interrogation theater, not
precision.

## Error Handling

If `QUESTION.md` is missing or unreadable, run the loop above anyway.
Function over costume -- this skill works with or without the voice doc.
