# Citation Gate

confidence: HIGH
source: the-question-session-2026-06-21/README.md, spiffe-provenance.md

Tiered rule for what may enter a report or finding:

- **Hard gate for findings** - a finding must be `verified` (provenance `confidence: verified`) to stand. Unverified findings do not ship.
- **Soft gate for color** - narrative or flavor material is allowed but flagged, not blocked.

Pairs with the SVID provenance record: the `confidence` field (unverified | corroborated | verified) is what the gate reads.

## Related

[[The Question Index]] - [[SPIFFE Provenance]] - [[Investigation Board]] - [[The Question Persona]]
