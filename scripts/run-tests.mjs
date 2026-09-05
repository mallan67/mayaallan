// scripts/run-tests.mjs — the one canonical test command (`pnpm test`).
//
//   1. Node version guard: the suite imports TypeScript source directly and
//      relies on Node's built-in type stripping (>= 22.18; CI pins 24 via
//      .node-version). On an older Node, fail with a clear message instead of
//      the runner's misleading "Could not find tests/**/*.test.mjs".
//   2. Unit + contract suite: node --test with the `@/` alias hook
//      (tests/setup/resolve-alias.mjs) so source modules resolve as in the app.
//   3. Crisis-detection checks (scripts/test-crisis-detection.mjs) — the
//      dependency-free assertions that also gate `pnpm build`.
//
// Exit code is non-zero if any stage fails. Uses only Node built-ins.
import { spawnSync } from "node:child_process"
import { MIN_NODE } from "../tests/setup/alias-hooks.mjs"

const [major, minor] = process.versions.node.split(".").map(Number)
if (major < MIN_NODE.major || (major === MIN_NODE.major && minor < MIN_NODE.minor)) {
  console.error(
    `[tests] Node ${process.versions.node} cannot run this suite: TypeScript type stripping needs ` +
      `Node >= ${MIN_NODE.major}.${MIN_NODE.minor} (CI uses .node-version = 24).\n` +
      `[tests] Switch to Node 24, or run once with: npx -y node@24 scripts/run-tests.mjs`,
  )
  process.exit(1)
}

const stages = [
  {
    name: "unit + contract suite",
    args: ["--import", "./tests/setup/resolve-alias.mjs", "--test", "tests/**/*.test.mjs"],
  },
  {
    name: "crisis-detection checks",
    args: ["scripts/test-crisis-detection.mjs"],
  },
]

for (const stage of stages) {
  console.log(`\n[tests] ${stage.name}: node ${stage.args.join(" ")}`)
  const { status, error } = spawnSync(process.execPath, stage.args, { stdio: "inherit" })
  if (error) {
    console.error(`[tests] ${stage.name} could not start:`, error.message)
    process.exit(1)
  }
  if (status !== 0) {
    console.error(`[tests] ${stage.name} FAILED (exit ${status})`)
    process.exit(status ?? 1)
  }
}
console.log("\n[tests] all stages passed")
