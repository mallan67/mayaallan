/**
 * Node module-resolution hooks for the test runner.
 *
 * The app resolves `@/…` through tsconfig `paths` (`@/*` → `./src/*`), which
 * Next/Turbopack honour but plain `node --test` does not. Any test that
 * imports a module which itself imports `@/lib/…` therefore failed with
 * ERR_MODULE_NOT_FOUND (the long-standing tests/lib/rate-limit failure).
 *
 * This hook maps the alias onto src/ so the same source modules run under
 * Node with its built-in TypeScript type stripping (Node >= 22.18 / 24).
 * Registered via tests/setup/resolve-alias.mjs; see the `test` script.
 *
 * `mapAliasSpecifier` is exported (and unit-tested) separately from the hook.
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

/** Minimum Node that strips TypeScript types without flags. */
export const MIN_NODE = { major: 22, minor: 18 }

const ALIAS_PREFIX = "@/"
const SRC_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "src")
const EXTENSIONS = [".ts", ".tsx", ".mts", ".mjs", ".js"]

function isFile(p) {
  try {
    return fs.statSync(p).isFile()
  } catch {
    return false
  }
}

/**
 * Map an `@/…` specifier to a file:// URL under `srcDir`, trying the bare
 * path, the known extensions, then a directory index. Returns null when the
 * specifier is not the alias (including scoped npm packages such as
 * `@upstash/redis`) or when nothing exists at the target.
 */
export function mapAliasSpecifier(specifier, srcDir = SRC_DIR) {
  if (!specifier.startsWith(ALIAS_PREFIX)) return null
  const base = path.join(srcDir, specifier.slice(ALIAS_PREFIX.length))
  const candidates = [base, ...EXTENSIONS.map((ext) => base + ext), ...EXTENSIONS.map((ext) => path.join(base, "index" + ext))]
  for (const candidate of candidates) {
    if (isFile(candidate)) return pathToFileURL(candidate).href
  }
  return null
}

export async function resolve(specifier, context, nextResolve) {
  const mapped = mapAliasSpecifier(specifier)
  if (mapped) return nextResolve(mapped, context)
  return nextResolve(specifier, context)
}
