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
 * with pre-existing ERRORS are set to `warn` here and the `lint` script
 * enforces `--max-warnings` at the count measured on that day. Any new
 * finding fails CI; lowering the ceiling as findings are fixed is the
 * intended follow-up. Do not raise the ceiling.
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
