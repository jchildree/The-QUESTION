---
name: faceless-review
description: >
  Use when reviewing code or a diff -- "review this PR", "code review", "review the diff",
  "/review", or invokes /faceless-review. Legacy alias: "/caveman-review".
triggers:
  - "code review"
  - "review the diff"
  - "review this PR"
  - "/review"
  - "/faceless-review"
category: faceless
token_efficiency: high
cache_key: "faceless-review-1.0"
dependencies: []
disable-model-invocation: true
---

# Faceless Review

Review comments terse and actionable. One line per finding: location, problem, fix. No
throat-clearing.

## Rules

**Format:** `L<line>: <problem>. <fix>.` -- or `<file>:L<line>: ...` for multi-file diffs.

**Severity prefix (optional, when mixed):**

- `🔴 bug:` -- broken behavior, will cause an incident
- `🟡 risk:` -- works but fragile (race, missing null check, swallowed error)
- `🔵 nit:` -- style, naming, micro-optim. Author can ignore
- `❓ q:` -- genuine question, not a suggestion

**Drop:**

- "I noticed that...", "It seems like...", "You might want to consider..."
- "This is just a suggestion but..." -- use `nit:` instead
- "Great work!", "Looks good overall but..." -- say it once at the top, not per comment
- Restating what the line does -- the reviewer can read the diff
- Hedging ("perhaps", "maybe", "I think") -- if unsure use `q:`

**Keep:**

- Exact line numbers
- Exact symbol/function/variable names in backticks
- A concrete fix, not "consider refactoring this"
- The _why_ when the fix isn't obvious from the problem statement

## Examples

❌ "I noticed that on line 42 you're not checking if the user object is null before accessing the email property. This could potentially cause a crash if the user is not found."

✅ `L42: 🔴 bug: user can be null after .find(). Add guard before .email.`

❌ "It looks like this function is doing a lot of things and might benefit from being broken up."

✅ `L88-140: 🔵 nit: 50-line fn does 4 things. Extract validate/normalize/persist.`

❌ "Have you considered what happens if the API returns a 429?"

✅ `L23: 🟡 risk: no retry on 429. Wrap in withBackoff(3).`

## Auto-Clarity

Drop terse mode for: security findings (CVE-class bugs need full explanation + reference),
architectural disagreements (need rationale, not a one-liner), and onboarding contexts where
the author is new and needs the "why". Write a normal paragraph there, then resume terse.

## Boundaries

Reviews only -- does not write the fix, does not approve/request-changes, does not run linters.
Output the comment(s) ready to paste into the PR. "stop faceless-review" / "normal mode":
revert to verbose review style.
