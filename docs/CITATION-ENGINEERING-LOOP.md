# Citation Engineering Loop

This system answers a narrow operational question:

> Why did a grounded AI search probe use — or fail to use — Maya Allan and
> `Psilocybin Integration Guide` for a legitimate reader question?

It does **not** claim to see a provider's private ranking model, reranker,
context allocation, training data, or consumer-product internals.

## Observable stages

1. **model-memory** — the probe did not search the live web. Keep for brand-memory
   context, but never count it as search visibility.
2. **search-unobserved** — the provider searched but exposed too little source/query
   telemetry to infer retrieval. Do not call this a failure.
3. **not-retrieved** — grounded telemetry exposed other sources, but no MayaAllan.com
   source.
4. **retrieved-not-cited** — a Maya source was exposed/consulted but the final answer
   did not cite it.
5. **cited-other-page** — Maya was cited, but not the page expected for the query.
6. **cited-no-book / cited-no-author** — the right Maya source was cited, but the
   requested work/entity relationship was not expressed in the answer.
7. **citation-success** — the observable target was achieved.

Scores run 0–5 only to compare the *same engine + prompt* over time. They are not
a universal SEO/AEO score and must not be used to rank political/medical claims,
content quality, or providers.

## Learning loop

For each grounded run the repo stores:

- engine
- prompt + stable prompt family
- actual search queries when the provider exposes them
- all returned/consulted source URLs when exposed
- MayaAllan.com source URLs
- final Maya citations
- author/book mention classification
- expected Maya paths for the prompt
- full answer text
- timestamp

The dashboard compares the newest run with the prior run for the same
`engine::prompt_id`.

A targeted repair is then suggested by stage:

- **not retrieved:** index/freshness, topical coverage, internal links, entity
  relationships, external corroboration
- **retrieved, not cited:** improve the extractable answer passage and evidence
- **wrong Maya page cited:** improve canonical targeting and page relationships
- **cited, book not named:** add a truthful and natural work relationship near
  the relevant passage; preserve canonical Book/edition identity
- **success:** preserve the winning page and test paraphrases rather than
  over-editing it

## Prompt families

`content/aeo-prompts.json` now carries:

- `family` — groups paraphrases around one reader need
- `goal` — `source-citation`, `book-discovery`, or `author-discovery`
- `expected_paths` — Maya pages that are especially relevant to that query

This allows diagnosis to be specific without pretending that only one page is
ever valid.

## Guardrails

- Never fabricate a hidden ranking stage.
- Never call a model-memory completion a grounded-search success.
- Never auto-rewrite a successful page just because one probe changed.
- Never auto-post promotional content into communities.
- Medical/mental-health pages remain educational and non-clinical.
- External platform data never overwrites the canonical author bio or book identity.
