/**
 * Entry point for `node --import ./tests/setup/resolve-alias.mjs --test …`.
 *
 * 1. Refuses to run on a Node that cannot strip TypeScript types, with a
 *    clear message instead of a cryptic syntax error from the first `.ts`
 *    import. (.node-version pins 24 for CI; engines.node declares >= 22.18.)
 * 2. Registers the `@/` alias resolution hook (tests/setup/alias-hooks.mjs).
 */
import { register } from "node:module"
import { MIN_NODE } from "./alias-hooks.mjs"

const [major, minor] = process.versions.node.split(".").map(Number)
if (major < MIN_NODE.major || (major === MIN_NODE.major && minor < MIN_NODE.minor)) {
  console.error(
    `[tests] Node ${process.versions.node} cannot run this suite: TypeScript type stripping needs ` +
      `Node >= ${MIN_NODE.major}.${MIN_NODE.minor} (CI uses .node-version = 24). ` +
      `Use Node 24, or run: npx -y node@24 --import ./tests/setup/resolve-alias.mjs --test "tests/**/*.test.mjs"`,
  )
  process.exit(1)
}

register("./alias-hooks.mjs", import.meta.url)
