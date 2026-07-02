# Spec -- SPIFFE Provenance Layer

> The addressing + trust layer beneath the board's red string. Every subject and finding
> gets a canonical identity and a verifiable provenance record. The Question trusts
> nothing it cannot attribute.
>
> **What we borrow from SPIFFE:** the _data model_ -- ID-as-URI, a verifiable document,
> trust domains, bundles, federation. **What we drop:** the cryptographic runtime --
> no SPIRE, no X.509/JWT, no mTLS. Verifiability here is **evidentiary, not cryptographic.**

---

## 1. The ID (addressing)

A board node's canonical identity is a SPIFFE-style URI:

```
spiffe://<trust-domain>/<case>/<kind>/<slug>
```

- **trust-domain** -- the project / workspace (root of trust). Slug by default; anchor on
  a domain you own if collisions across repos matter (SPIFFE's own collision guidance).
- **case** -- the investigation (e.g. `case-017`). Closed cases stay addressable.
- **kind** -- one of: `subject` · `finding` · `hypothesis` · `question` · `source` · `fix`.
- **slug** -- short kebab name.

```
spiffe://acme-eqms/case-017/finding/null-deref-on-login
```

The ID lives in node frontmatter (machine-readable, canonical). The **red-string wikilinks
stay human-facing** -- `[[null-deref on login]]` -- and resolve to the ID. Precision in the
metadata, readability on the board.

---

## 2. The SVID (provenance)

SPIFFE's SVID is a _verifiable identity document_. Ours is the **Subject-Verifiable
Investigation Document** -- same initials, redefined for the case file. _(Reframe, not the
real cryptographic SVID -- flag if the backronym is too cute.)_

The least-common-denominator record -- six fields:

```yaml
id: spiffe://acme-eqms/case-017/finding/null-deref-on-login
asserted: "Login throws NPE when the session cookie is absent"
source: code:auth/login.py:42 # user | web:<url> | code:<path:line> | inference | prior-case:<id>
method: reproduced # observed | quoted | inferred | reproduced | tested
confidence: verified # unverified | corroborated | verified
verify: "pytest tests/test_login.py::test_null_session -q"
```

**`verify` is the keystone.** With no crypto, a claim is "verifiable" iff it carries a
_re-runnable check_ that independently re-derives it -- a command, a URL + assertion, or a
reproduction question. Verifiability = reproducibility. Anyone can re-run `verify` and land
on the same result, or watch the claim fall.

**Confidence ladder** (the Question's self-distrust dial, traffic-lit):

| Rung           | Meaning                      | Tag       |
| -------------- | ---------------------------- | --------- |
| `unverified`   | asserted, not yet checked    | red       |
| `corroborated` | ≥2 independent sources agree | amber     |
| `verified`     | `verify` passed / reproduced | **green** |

Red string links the nodes; the green tag is what earns a finding its place on the board.

---

## 3. SPIFFE → Question mapping

| SPIFFE                        | The Question                                                                   |
| ----------------------------- | ------------------------------------------------------------------------------ |
| SPIFFE ID (`spiffe://…`)      | canonical node URI                                                             |
| SVID (verifiable doc)         | the provenance record (§2)                                                     |
| Trust domain (root of trust)  | the project (or case)                                                          |
| Trust bundle / validation     | the `verify` re-check -- nothing trusted unverified                            |
| SVID expiry / TTL             | source staleness -- web claims carry `seen:<date>`; code/user don't expire     |
| Federation (exchange bundles) | cross-case recall -- importing a closed case's finding carries its SVID intact |

---

## 4. Storage

YAML frontmatter on each board note (Obsidian-native; surfaces in Properties and the graph).
No separate registry to drift out of sync -- the node _is_ its own identity document.

---

## 5. Touchpoints

- **`BOARD.md` (already shipped → revision):** adopt the frontmatter schema as the node
  convention. New nodes carry full provenance; legacy nodes are backfilled lazily on touch.
- **`investigate`:** emits provenance when pinning a finding; promotes `unverified →
verified` only when `verify` passes (this dovetails with the existing fix-gate).
- **`interrogate-spec`:** user answers land as `source: user`, `method: observed`.
- **`investigative-report` (Layer 3, unbuilt):** consumes provenance -- every claim in a
  report renders with its source and confidence; `verify` becomes the citation.

---

## 6. Emission contract

One contract, hooked by both skills -- no emission logic duplicated into either. A node is
written _only_ through these hooks, and `confidence` is set by **how the claim was
established**. It climbs by the rules below and is never hand-waved upward. No `verify`, no
green -- ever.

**`investigate` (by phase):**

| Phase                                                     | Emits                                                                                                                        | confidence         |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| Hypothesis raised                                         | node + `verify:` = the experiment that would confirm it                                                                      | `unverified`       |
| Corroboration -- ≥2 independent sources/instruments agree | update                                                                                                                       | `corroborated`     |
| Reproduced / `verify` passes                              | update                                                                                                                       | `verified` (green) |
| **Fix-gate**                                              | _no fix applied until the root-cause finding is green_ -- provenance is the gate's precondition, user consent is its trigger | --                 |
| Cross-case recall                                         | imported finding keeps its `id:`, adds `#federated`; confidence **inherited**, not re-derived                                | --                 |

**`interrogate-spec`:**

| Moment               | Emits                                                                                                               | confidence     |
| -------------------- | ------------------------------------------------------------------------------------------------------------------- | -------------- |
| User answer          | `source: user`, `method: observed` -- intent is authoritative, but a factual claim from the user is still unchecked | `unverified`   |
| Spec decision locked | `method: quoted`, cross-checked against the domain model / prior cases                                              | `corroborated` |

The actual splice into each `SKILL.md` is mechanical -- one emit-per-contract line at each
phase named above. (Paste the live skill files and I'll return exact patches.)

---

the root of trust; the case is the first path segment. FQDN-anchoring stays available if
cross-repo collisions ever bite. 2. **TTL** -- optional. Web sources carry `seen:<date>`; code and user facts don't expire. 3. **Naming** -- `SVID` = Subject-Verifiable Investigation Document. Kept.
