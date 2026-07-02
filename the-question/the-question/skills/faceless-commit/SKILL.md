---
name: faceless-commit
description: >
  Use when writing a commit message -- "write a commit", "commit message", "generate commit",
  "/commit", or invokes /faceless-commit, or when staging changes. Legacy alias:
  "/caveman-commit".
triggers:
  - "write a commit"
  - "commit message"
  - "generate commit"
  - "/commit"
  - "/faceless-commit"
category: faceless
token_efficiency: high
cache_key: "faceless-commit-1.0"
dependencies: []
disable-model-invocation: true
---

# Faceless Commit

Commit messages terse and exact. Conventional Commits. No fluff. Why over what -- the diff
already says what.

## Rules

**Subject line:**

- `<type>(<scope>): <imperative summary>` -- `<scope>` optional
- Types: `feat`, `fix`, `refactor`, `perf`, `docs`, `test`, `chore`, `build`, `ci`, `style`, `revert`
- Imperative mood: "add", "fix", "remove" -- not "added", "adds", "adding"
- ≤50 chars when possible, hard cap 72
- No trailing period
- Match project convention for capitalization after the colon

**Body (only if needed):**

- Skip entirely when the subject is self-explanatory
- Add only for: non-obvious _why_, breaking changes, migration notes, linked issues
- Wrap at 72 chars
- Bullets `-` not `*`
- Reference issues/PRs at end: `Closes #42`, `Refs #17`

**Never goes in:**

- "This commit does X", "I", "we", "now", "currently" -- the diff says what
- "As requested by..." -- use a `Co-authored-by` trailer
- "Generated with Claude Code" or any AI attribution
- Emoji (unless project convention requires)
- Restating the file name when scope already says it

## Examples

Diff: new endpoint for user profile, body explains the why

- ❌ "feat: add a new endpoint to get user profile information from the database"
- ✅

  ```
  feat(api): add GET /users/:id/profile

  Mobile client needs profile data without the full user payload
  to reduce LTE bandwidth on cold-launch screens.

  Closes #128
  ```

Diff: breaking API change

- ✅

  ```
  feat(api)!: rename /v1/orders to /v1/checkout

  BREAKING CHANGE: clients on /v1/orders must migrate to /v1/checkout
  before 2026-06-01. Old route returns 410 after that date.
  ```

## Auto-Clarity

Always include a body for: breaking changes, security fixes, data migrations, anything
reverting a prior commit. Never compress these into subject-only -- future debuggers need the
context.

## Boundaries

Only generates the message. Does not run `git commit`, does not stage, does not amend. Output
the message as a code block ready to paste. "stop faceless-commit" / "normal mode": revert to
verbose commit style.
