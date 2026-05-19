#!/usr/bin/env node
// =============================================================================
// scripts/check-translations.mjs
// =============================================================================
// Walks src/lib/i18n/dictionaries/*.json and reports any keys present in the
// English baseline but missing or empty in other locales. Run this:
//
//   node scripts/check-translations.mjs
//
// Exits non-zero on missing keys so it's safe to wire into CI / pre-commit.
//
// Pass --strict to also flag keys that are identical to English in non-en
// dictionaries (a heuristic for "this was never translated"). Useful but
// noisy — some short words like CTAs may legitimately be the same across
// languages (e.g., "Contact" in en/fr).
// =============================================================================

import fs from "node:fs/promises"
import path from "node:path"

const DICT_DIR = path.join(process.cwd(), "src", "lib", "i18n", "dictionaries")
const BASELINE = "en"
const STRICT = process.argv.includes("--strict")

/** Flatten { a: { b: "v" } } → { "a.b": "v" } for path-based comparison */
function flatten(obj, prefix = "") {
  const out = {}
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      Object.assign(out, flatten(value, path))
    } else if (Array.isArray(value)) {
      // Arrays of strings (e.g., about.body) — flatten by index so we catch
      // arrays where one locale has 3 paragraphs and another has 2.
      value.forEach((v, i) => {
        if (typeof v === "string") {
          out[`${path}[${i}]`] = v
        } else {
          Object.assign(out, flatten(v, `${path}[${i}]`))
        }
      })
    } else {
      out[path] = value
    }
  }
  return out
}

async function loadDict(locale) {
  const filePath = path.join(DICT_DIR, `${locale}.json`)
  const raw = await fs.readFile(filePath, "utf8")
  return JSON.parse(raw)
}

async function main() {
  const files = await fs.readdir(DICT_DIR)
  const locales = files
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(".json", ""))

  if (!locales.includes(BASELINE)) {
    console.error(`Baseline ${BASELINE}.json not found in ${DICT_DIR}`)
    process.exit(2)
  }

  const baseline = flatten(await loadDict(BASELINE))
  const baselineKeys = Object.keys(baseline)
  console.log(`Baseline (${BASELINE}): ${baselineKeys.length} keys`)
  console.log("")

  let totalIssues = 0
  for (const locale of locales) {
    if (locale === BASELINE) continue
    const dict = flatten(await loadDict(locale))
    const issues = []

    for (const key of baselineKeys) {
      const value = dict[key]
      if (value === undefined) {
        issues.push({ kind: "missing", key, sample: baseline[key] })
      } else if (typeof value === "string" && value.trim() === "") {
        issues.push({ kind: "empty", key, sample: baseline[key] })
      } else if (STRICT && typeof value === "string" && value === baseline[key]) {
        // Skip very short strings (1-3 chars) and obvious cognates from this check
        if (value.length > 3) {
          issues.push({ kind: "untranslated", key, sample: value })
        }
      }
    }

    // Also surface keys present in this locale but NOT in baseline (drift the
    // other way — usually means baseline forgot to add a key).
    const extraKeys = Object.keys(dict).filter((k) => !(k in baseline))
    for (const key of extraKeys) {
      issues.push({ kind: "extra", key, sample: dict[key] })
    }

    if (issues.length === 0) {
      console.log(`✓ ${locale}: complete`)
    } else {
      console.log(`✗ ${locale}: ${issues.length} issue(s)`)
      for (const { kind, key, sample } of issues) {
        const preview = typeof sample === "string" ? sample.slice(0, 70) : JSON.stringify(sample).slice(0, 70)
        console.log(`    [${kind}] ${key}${kind === "missing" || kind === "empty" ? `  (en: "${preview}")` : `  ("${preview}")`}`)
      }
      totalIssues += issues.length
    }
    console.log("")
  }

  if (totalIssues > 0) {
    console.error(`Found ${totalIssues} translation issue(s) across locales.`)
    process.exit(1)
  }
  console.log("All translations complete ✓")
}

main().catch((err) => {
  console.error("Translation check failed:", err)
  process.exit(2)
})
