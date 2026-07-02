# Wiki Schema

Schema for The Question LLM wiki. The LLM reads this first when operating on the wiki.

## Layers

- `raw/` -- human-curated source docs. LLM reads only, never modifies.
- `wiki/` -- LLM-generated pages. Everything below is LLM-owned.
- This file -- the schema. Co-evolved by human + LLM.

## Structure

```text
wiki/
  raw/                source documents (read-only to LLM)
  wiki/
    index.md          content catalog -- read first on every query
    log.md            append-only operation record
    entities/         pages for named entities (people, orgs, tools)
    concepts/         pages for ideas and themes
    sources/          one summary page per ingested source
```

## Conventions

- Title Case filenames. No folders beyond the four above.
- `[[wikilinks]]` for all cross-references, listed at the bottom of each page.
- Frontmatter on every wiki page: `title`, `type` (entity | concept | source), `created` (YYYY-MM-DD), `sources` (list of source page links).
- No folders for organization -- link via index and wikilinks.

## Ingest workflow

1. Read source in `raw/`.
2. Discuss key takeaways with the human.
3. Write summary page in `wiki/sources/`.
4. Update `index.md`.
5. Update affected `entities/` and `concepts/` pages; create missing ones.
6. Append entry to `log.md`: `## [YYYY-MM-DD] ingest | <title>`.

## Query workflow

1. Read `index.md` to locate relevant pages.
2. Read those pages, synthesize, cite source pages.
3. File good answers back as new `concepts/` pages.

## Lint checklist

- Contradictions between pages.
- Stale claims superseded by newer sources.
- Orphan pages with no inbound links.
- Missing cross-references.
- Data gaps fillable by web search.

## Related

- Vault root index: [[The Question Index]]
- Seed material: [[Memory Outline]]
