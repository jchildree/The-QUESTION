# The Board

The investigation board is the plugin's shared memory layer. `investigate`
and `investigative-report` pin findings to it automatically as they work —
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

**Case** (`Case: <title>.md`) — symptom, timeline/repro steps, status
(`Open` / `Closed`), wikilinks down to every Suspect or Source raised
during the investigation.

**Suspect** (one per hypothesis, written by `investigate`) — the
falsifiable prediction ("if X is the cause, then Y"), evidence gathered,
verdict (`Untested` → `Testing` → `Confirmed` / `Ruled Out`), wikilink
back to its Case.

**Source** (one per piece of evidence, written by `investigative-report`,
roadmap) — the claim, where it came from, confidence, wikilink back to
its Case.

**Investigation Board Index** — aggregates `[[wikilinks]]` to every Case,
same shape as `obsidian-vault`'s `Skills Index.md` pattern. Closed cases
stay linked, never deleted — the board accumulates.

## Why This Is the Corkboard, Not a Metaphor For It

Obsidian's native graph view renders wikilinks as a node-link graph
automatically. Cases and Suspects wikilinked together _are_ the crazy
wall — no custom rendering needed.

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
