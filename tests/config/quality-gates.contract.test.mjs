/**
 * Contract for the project's quality gates: the scripts in package.json, the
 * ESLint configuration, the pinned Node version, and the CI workflow that
 * runs them. Guards against the two regressions this PR fixes — a `lint`
 * script that invokes the removed `next lint`, and a test runner that cannot
 * resolve the `@/` alias — and against CI silently not running the gates.
 */
import { test } from "node:test"
import assert from "node:assert/strict"
import { existsSync, readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"

const p = (rel) => fileURLToPath(new URL(rel, import.meta.url))
const pkg = JSON.parse(readFileSync(p("../../package.json"), "utf8"))

test("lint runs ESLint directly, never the removed `next lint`", () => {
  assert.ok(pkg.scripts.lint, "lint script exists")
  assert.doesNotMatch(pkg.scripts.lint, /next lint/)
  assert.match(pkg.scripts.lint, /^eslint\b/)
  assert.match(pkg.scripts.lint, /--max-warnings(=| )\d+/, "warning ceiling (ratchet) is enforced")
})

test("ESLint flat config exists and extends the Next.js presets", () => {
  assert.ok(existsSync(p("../../eslint.config.mjs")))
  const cfg = readFileSync(p("../../eslint.config.mjs"), "utf8")
  assert.match(cfg, /eslint-config-next\/core-web-vitals/)
  assert.match(cfg, /eslint-config-next\/typescript/)
  assert.ok(pkg.devDependencies.eslint, "eslint is a devDependency")
  assert.ok(pkg.devDependencies["eslint-config-next"], "eslint-config-next is a devDependency")
})

test("one canonical `test` script: a runner that guards the Node version, runs the suite with the alias loader, then the crisis checks", () => {
  assert.equal(pkg.scripts.test, "node scripts/run-tests.mjs")
  const runner = readFileSync(p("../../scripts/run-tests.mjs"), "utf8")
  assert.match(runner, /MIN_NODE/, "Node version guard present")
  assert.match(runner, /"--import",\s*"\.\/tests\/setup\/resolve-alias\.mjs"/)
  assert.match(runner, /"--test",\s*"tests\/\*\*\/\*\.test\.mjs"/)
  assert.match(runner, /scripts\/test-crisis-detection\.mjs/)
})

test("typecheck script exists", () => {
  assert.match(pkg.scripts.typecheck ?? "", /tsc --noEmit/)
})

test("Node version is pinned for CI and declared in engines", () => {
  assert.ok(existsSync(p("../../.node-version")), ".node-version exists")
  assert.match(readFileSync(p("../../.node-version"), "utf8").trim(), /^24(\.\d+)*$/)
  assert.match(pkg.engines?.node ?? "", />=22\.18/)
  assert.match(pkg.packageManager ?? "", /^pnpm@10\./)
})

test("CI workflow runs typecheck, lint and test on pull requests and main", () => {
  const wfPath = p("../../.github/workflows/quality-gates.yml")
  assert.ok(existsSync(wfPath), "quality-gates workflow exists")
  const wf = readFileSync(wfPath, "utf8")
  assert.match(wf, /pull_request/)
  assert.match(wf, /push:\s*\n\s*branches:\s*\[?\s*main/)
  assert.match(wf, /pnpm install --frozen-lockfile/)
  assert.match(wf, /pnpm typecheck/)
  assert.match(wf, /pnpm lint/)
  assert.match(wf, /pnpm test\b/)
  assert.match(wf, /node-version-file:\s*\.node-version/)
  // The rate-limit tests exercise the in-memory fallback and refuse to run
  // against a live Upstash counter: CI must not inject those variables
  // (as an `env:` key or a `${{ secrets.… }}` reference).
  assert.doesNotMatch(wf, /UPSTASH_REDIS_REST_(URL|TOKEN)\s*:/)
  assert.doesNotMatch(wf, /secrets\.UPSTASH/)
})

test("the existing monitors are untouched (cheap health URL, deploy-notify)", () => {
  const hc = readFileSync(p("../../.github/workflows/health-check.yml"), "utf8")
  assert.match(hc, /HEALTH_URL:\s*https:\/\/www\.mayaallan\.com\/api\/health\s*$/m)
  assert.ok(existsSync(p("../../.github/workflows/deploy-notify.yml")))
})
