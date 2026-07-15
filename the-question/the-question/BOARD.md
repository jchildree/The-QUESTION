# The Board

The investigation board is the plugin's shared memory layer. `investigate`
and `investigative-report` pin findings to it automatically as they work --
nothing here is optional ceremony, every pin is meant to be searched
against later.

Built on the existing `obsidian-vault` skill for file mechanics (search,
create, wikilink). This file defines Question-specific conventions on top
of it: no folders, Title Case filenames, `[[wikilinks]]` at the bottom of
every note, index notes are lists of links.

## Vault Location

`docs/Obsidian Vault/The Question/` inside whatever project the
investigation happens in, per `obsidian-vault`'s existing rule (repo has a
`/docs` folder → use the project-scoped vault path).

## Note Types

**Case** (`Case- <title>.md`) -- symptom, timeline/repro steps, status
(`Open` / `Closed`), wikilinks down to every Suspect or Source raised
during the investigation.

**Suspect** (one per hypothesis, written by `investigate`) -- the
falsifiable prediction ("if X is the cause, then Y"), evidence gathered,
verdict (`Untested` → `Testing` → `Confirmed` / `Ruled Out`), wikilink
back to its Case.

**Source** (one per piece of evidence, written by `investigative-report`,
roadmap) -- the claim, where it came from, confidence, wikilink back to
its Case.

**Investigation Board Index** -- aggregates `[[wikilinks]]` to every Case,
same shape as `obsidian-vault`'s `Skills Index.md` pattern. Closed cases
stay linked, never deleted -- the board accumulates.

## Node identity & provenance

Every node on this board is a note carrying the frontmatter below. No node without an
identity; no claim without provenance. The Question trusts nothing it cannot attribute.
_(Why, in full: `docs/superpowers/specs/spiffe-provenance.md`.)_

```yaml
id: spiffe://<project>/<case>/<kind>/<slug> # canonical URI; kind in subject|finding|hypothesis|question|source|fix
asserted: "the claim, in one line"
source: code:<path:line> | web:<url> | user | inference | prior-case:<id>
method: observed | quoted | inferred | reproduced | tested
confidence: unverified | corroborated | verified
verify: "a re-runnable check that re-derives the claim"
seen: 2026-06-21 # web sources only; omit for code/user
```

**Rules**

- **Red string vs. identity.** Wikilinks -- `[[null-deref on login]]` -- are the human-facing
  red string. `id:` is canonical. A link resolves to the node whose `id` matches.
- **Green earns the pin.** Only `verified` findings get a permanent pin. `unverified` (red)
  and `corroborated` (amber) stay provisional and visually distinct. `verify` must pass to
  promote a node to green.
- **Federation keeps the source id.** A finding pulled from a closed case keeps its original
  `id:` (its case of origin) and is tagged `#federated`. You trust it because its `verify`
  travels with it.
- **Lazy backfill.** New nodes carry full provenance. Legacy nodes are backfilled the next
  time they're touched -- never a big-bang migration pass.

**Graph colors:** `#unverified` red, `#corroborated` amber, `#verified` green.

### Worked example -- `case-017/finding/null-deref-on-login.md`

```markdown
---
id: spiffe://acme-eqms/case-017/finding/null-deref-on-login
asserted: "Login throws NPE when the session cookie is absent"
source: code:auth/login.py:42
method: reproduced
confidence: verified
verify: "pytest tests/test_login.py::test_null_session -q"
---

# Null deref on login

Pinned -- reproduced on a clean checkout. Red string up to [[session cookie middleware]]
(the upstream `source`) and across to [[case-012/finding/cookie-parsing-regression]]
(`#federated` -- the prior case where this first surfaced).

verify last green: 2026-06-21
```

## Why This Is the Corkboard, Not a Metaphor For It

Obsidian's native graph view renders wikilinks as a node-link graph
automatically. Cases and Suspects wikilinked together _are_ the crazy
wall -- no custom rendering needed.

## Cross-Case Recall

Because closed Cases persist, `investigate`'s hypothesis phase searches
the board for Suspect notes matching the current symptom before
generating fresh ones. A previously-confirmed cause for a similar failure
surfaces as a ranked candidate, not just flavor text.

## Function Over Costume

If the vault isn't set up or is unreachable, pinning is best-effort: the
skill that called this file still runs its full discipline, it just skips
the board and says so explicitly. The board is an enhancement, never a
hard dependency.
