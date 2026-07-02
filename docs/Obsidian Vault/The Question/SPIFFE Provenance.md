# SPIFFE Provenance

confidence: HIGH
source: the-question-session-2026-06-21/docs/superpowers/specs/spiffe-provenance.md

The addressing and trust layer beneath the board's red string. Every subject and finding gets a canonical identity and a verifiable provenance record. The Question trusts nothing it cannot attribute.

Borrowed from SPIFFE: the data model (ID-as-URI, a verifiable document, trust domains, bundles, federation). Dropped: the cryptographic runtime (no SPIRE, no X.509/JWT, no mTLS). Verifiability here is evidentiary, not cryptographic.

## The ID (addressing)

```text
spiffe://<trust-domain>/<case>/<kind>/<slug>
```

- **trust-domain** - project/workspace (root of trust).
- **case** - the investigation (e.g. `case-017`); closed cases stay addressable.
- **kind** - one of: subject, finding, hypothesis, question, source, fix.
- **slug** - short kebab name.

The ID lives in node frontmatter (canonical, machine-readable). Red-string wikilinks stay human-facing (`[[null-deref on login]]`) and resolve to the ID.

## The SVID (provenance)

Subject-Verifiable Investigation Document. Least-common-denominator record, six fields:

- `id` - the spiffe:// URI
- `asserted` - the claim in plain text
- `source` - user | web:<url> | code:<path:line> | inference | prior-case:<id>
- `method` - observed | quoted | inferred | reproduced | tested
- `confidence` - unverified | corroborated | verified
- (sixth field per spec section 2)

## Related

[[The Question Index]] - [[Investigation Board]] - [[Citation Gate]] - [[Design Lineage]]
