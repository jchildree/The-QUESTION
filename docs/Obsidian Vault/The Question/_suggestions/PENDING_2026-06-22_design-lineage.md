---
confidence: MEDIUM
source: the-question-session-2026-06-21/README.md
suggested: 2026-06-22
topic: patterns/design-lineage
---

# Suggestion: Design Lineage (Ralph and SPIFFE)

Two external ideas shaped the design without being adopted literally.

- **Ralph** -- design lineage only: fresh-context, disk-as-memory, one-task philosophy. Not a literal runner. The board (disk-as-memory) and the one-finding-at-a-time rule trace here.
- **SPIFFE** -- identity framework borrowed two levels deep: `spiffe://project/case/kind/slug` IDs plus SVID-style provenance. No SPIRE, no crypto.

## Why

From the README "Decided this session" log. Records why the codebase carries SPIFFE-shaped IDs and a disk-backed board without pulling in SPIRE or a Ralph-style runner. MEDIUM: stated once in a session log, not yet reflected in a spec section beyond the provenance doc. Verify against the live specs before treating as settled.
