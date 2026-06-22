<!-- DROP-IN for BOARD.md. Splice this section in; it carries operational rules only.
     Full rationale lives in docs/superpowers/specs/spiffe-provenance.md -->

## Node identity & provenance

Every node on this board is a note carrying the frontmatter below. No node without an
identity; no claim without provenance. The Question trusts nothing it cannot attribute.
_(Why, in full: `docs/superpowers/specs/spiffe-provenance.md`.)_

```yaml
id: spiffe://<project>/<case>/<kind>/<slug> # canonical URI; kind ∈ subject|finding|hypothesis|question|source|fix
asserted: "the claim, in one line"
source: code:<path:line> | web:<url> | user | inference | prior-case:<id>
method: observed | quoted | inferred | reproduced | tested
confidence: unverified | corroborated | verified
verify: "a re-runnable check that re-derives the claim"
seen: 2026-06-21 # web sources only; omit for code/user
```

**Rules**

- **Red string vs. identity.** Wikilinks — `[[null-deref on login]]` — are the human-facing
  red string. `id:` is canonical. A link resolves to the node whose `id` matches.
- **Green earns the pin.** Only `verified` findings get a permanent pin. `unverified` (red)
  and `corroborated` (amber) stay provisional and visually distinct. `verify` must pass to
  promote a node to green.
- **Federation keeps the source id.** A finding pulled from a closed case keeps its original
  `id:` (its case of origin) and is tagged `#federated`. You trust it because its `verify`
  travels with it.
- **Lazy backfill.** New nodes carry full provenance. Legacy nodes are backfilled the next
  time they're touched — never a big-bang migration pass.

**Graph colors:** `#unverified` red · `#corroborated` amber · `#verified` green.

### Worked example — `case-017/finding/null-deref-on-login.md`

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

Pinned — reproduced on a clean checkout. Red string up to [[session cookie middleware]]
(the upstream `source`) and across to [[case-012/finding/cookie-parsing-regression]]
(`#federated` — the prior case where this first surfaced).

verify last green: 2026-06-21
```
