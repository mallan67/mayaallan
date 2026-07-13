/**
 * Safety layer for the AI chat tools — a thin typed barrel over the pure,
 * dependency-free classifier core in `crisis-classifier.mjs`.
 *
 * The core (tiered classifier + conversation-size caps) is kept in plain
 * `.mjs` so it can be unit-tested from a dependency-free Node script without a
 * TypeScript loader (scripts/test-crisis-detection.mjs, `pnpm test:crisis`,
 * which is gated into `pnpm build`). App code imports from here as before.
 *
 * Why deterministic: the LLM (the cheapest model in the family) is not a
 * reliable place for the only line of safety defense, so explicit-danger
 * routing is done deterministically and streamed without an LLM call.
 */

export * from "./crisis-classifier.mjs"
