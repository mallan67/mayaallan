import { defineConfig, globalIgnores } from "eslint/config"
import nextVitals from "eslint-config-next/core-web-vitals"
import nextTs from "eslint-config-next/typescript"

/**
 * ESLint replaces the removed `next lint` (Next.js 16). Presets are the ones
 * Next recommends: core-web-vitals + typescript.
 *
 * Ratchet, not rewrite: when this config was introduced (2026-09-05) the
 * codebase carried 172 pre-existing findings — 103 `no-explicit-any`, 25
 * unused vars, 19 React-Compiler hook rules, 10 html-link-for-pages, 4
 * unescaped entities, and a handful of singles. Rewriting those is not a
 * quality-gate concern and would touch a hundred call sites, so the rules
 * with pre-existing ERRORS are set to `warn` here.
 *
 * Two gates enforce the ratchet (2026-09-06):
 *   - `pnpm lint:ratchet` (scripts/lint-ratchet.mjs) is the primary gate. It
 *     gives every warning a location-stable identity (file, rule, message,
 *     enclosing scope, structural path to the node, a token-stream hash of
 *     the enclosing statement, offending source line and position — never a raw
 *     line number or absolute path) and compares counts
 *     against the committed lint-baseline.json, which tracks the currently
 *     approved warning population. An identity missing from the baseline, a
 *     count increase, or any ESLint error fails as a regression — so an old
 *     warning cannot be swapped for a new one, not even the same warning text
 *     at another place in the same file. Two locations that still produce one
 *     identity fail as an identity collision rather than being aggregated. A
 *     warning moving lines passes. A warning disappearing or a count
 *     decreasing is reported as "baseline tightening required": run
 *     `pnpm lint:baseline` after the reviewed cleanup and commit the reduced
 *     baseline, so the fixed warning cannot come back. Normal CI never
 *     regenerates the baseline, and it must not be regenerated to silence a
 *     newly introduced warning.
 *   - `pnpm lint` keeps `--max-warnings` at the count measured on 2026-09-05
 *     as a secondary ceiling only. Do not raise it.
 */
export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/static-components": "warn",
      "react-hooks/immutability": "warn",
      "@next/next/no-html-link-for-pages": "warn",
      "react/no-unescaped-entities": "warn",
      "prefer-const": "warn",
    },
  },
  {
    // Metadata image routes render <img> inside next/og ImageResponse, where
    // next/image cannot be used. eslint-plugin-next already exempts these
    // files, but its path match fails on Windows paths, which made the lint
    // count differ between a Windows checkout and Linux CI. Turning the rule
    // off here by glob makes the gate deterministic on both.
    files: ["src/app/**/opengraph-image.tsx", "src/app/**/twitter-image.tsx"],
    rules: { "@next/next/no-img-element": "off" },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", ".worktrees/**"]),
])
