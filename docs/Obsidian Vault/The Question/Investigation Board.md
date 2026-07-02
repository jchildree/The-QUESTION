# Investigation Board

confidence: HIGH
source: the-question/the-question/BOARD.md

The board is the plugin's shared memory layer. `investigate` and `investigative-report` pin findings to it automatically. Built on the `obsidian-vault` skill for file mechanics, with Question-specific conventions: no folders, Title Case filenames, `[[wikilinks]]` at the bottom of every note, index notes are lists of links.

## Vault Location

`docs/Obsidian Vault/The Question/` inside whatever project the investigation happens in.

## Note Types

- **Case** (`Case: <title>.md`) - symptom, timeline/repro, status (`Open`/`Closed`), wikilinks down to every Suspect or Source.
- **Suspect** (one per hypothesis, written by `investigate`) - falsifiable prediction ("if X is the cause, then Y"), evidence, verdict (`Untested` -> `Testing` -> `Confirmed`/`Ruled Out`), wikilink back to Case.
- **Source** (one per piece of evidence, written by `investigative-report`, roadmap) - claim, origin, confidence, wikilink back to Case.
- **Investigation Board Index** - aggregates `[[wikilinks]]` to every Case. Closed cases stay linked, never deleted; the board accumulates.

## Cross-Case Recall

Because closed Cases persist, `investigate`'s hypothesis phase searches the board for Suspect notes matching the current symptom before generating fresh ones. A previously-confirmed cause surfaces as a ranked candidate.

## Why This Is the Corkboard, Not a Metaphor

Obsidian's native graph view renders wikilinks as a node-link graph. Cases and Suspects wikilinked together are the crazy wall; no custom rendering needed.

## Function Over Costume

If the vault is unreachable, pinning is best-effort: the calling skill still runs its full discipline, skips the board, and says so explicitly.

## Related

[[The Question Index]] - [[The Question Persona]] - [[SPIFFE Provenance]] - [[Citation Gate]]
