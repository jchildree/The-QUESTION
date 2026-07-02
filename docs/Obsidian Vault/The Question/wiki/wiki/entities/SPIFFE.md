---
title: SPIFFE
type: entity
created: 2026-06-21
sources:
  - "[[The Question Original Concept]]"
---

# SPIFFE

Secure Production Identity Framework For Everyone (CNCF). In case zero the "SPIFFE format (IBM & Red Hat)" line resolved to this; the "IBM & Red Hat" parenthetical was a mis-association -- the real anchor is CNCF/SPIFFE.

## How The Question uses it

Borrows the data model only, two levels deep:

1. A `spiffe://<trust-domain>/<case>/<kind>/<slug>` ID for every tracked subject/finding, where `kind` is one of `subject | finding | hypothesis | question | source | fix`.
2. SVID-style provenance metadata on each node (source, assertion, verifiability).

Drops the crypto runtime: no SPIRE, no X.509/JWT. Lightweight, least-common-denominator provenance -- the addressing + trust layer beneath the board's red string. See [[Provenance And Attribution]].

## Related

- [[The Question Original Concept]]
- [[Provenance And Attribution]]
- [[Investigation Board]]
- [[index]]
