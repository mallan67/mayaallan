/**
 * Tests for scripts/lint-ratchet.mjs — the per-warning-identity lint ratchet.
 *
 * `eslint --max-warnings 172` only bounds the total: remove one old warning,
 * add one new one, and CI stays green. The ratchet instead gives every
 * warning a location-stable identity
 *
 *   path :: rule :: message-first-line :: enclosing scope :: node-path :: anchor :: line@offset
 *
 * and compares counts per identity against a committed baseline generated
 * from ESLint output. New identities, count increases and ESLint errors fail
 * as regressions; line movement passes; a warning disappearing or a count
 * decreasing is reported as "baseline tightening required" (non-zero) until
 * the reduced baseline is regenerated and committed, so a fixed warning can
 * never silently come back. Two diagnostics at different source locations
 * that still produce one identity are an identity collision and fail rather
 * than being aggregated. Regenerating the baseline is an explicit manual
 * command, never normal CI behavior.
 */
import { test } from "node:test"
import assert from "node:assert/strict"
import { spawnSync } from "node:child_process"
import { readFileSync, existsSync } from "node:fs"
import { fileURLToPath } from "node:url"
import {
  fingerprint,
  scopeChainAt,
  nodePathAt,
  anchorAt,
  anchorOf,
  offsetInNormalizedLine,
  summarizeResults,
  compareToBaseline,
  buildBaseline,
  outcome,
  shouldUpdate,
  BASELINE_FILE,
  FINGERPRINT_FORMAT,
} from "../../scripts/lint-ratchet.mjs"

const p = (rel) => fileURLToPath(new URL(rel, import.meta.url))
const root = p("../..")
const pkg = JSON.parse(readFileSync(p("../../package.json"), "utf8"))
const workflow = readFileSync(p("../../.github/workflows/quality-gates.yml"), "utf8")

// Synthetic ESLint results (shape of ESLint.lintFiles output).
const abs = (rel) => (process.platform === "win32" ? "C:\\repo\\" + rel.replace(/\//g, "\\") : "/repo/" + rel)
const result = (rel, source, messages) => ({ filePath: abs(rel), source, messages })
const warn = (ruleId, message, line, column = 1) => ({ ruleId, message, severity: 1, line, column })
const RROOT = process.platform === "win32" ? "C:\\repo" : "/repo"
const UNUSED = "'error' is defined but never used."
const UV = "@typescript-eslint/no-unused-vars"

// Two unrelated `} catch (error) {` warnings in one file, in two functions (the shape found in the committed baseline).
const TWO_CATCHES = [
  "export default function Page() {",
  "  async function load() {",
  "    try {",
  "      await fetchEvent()",
  "    } catch (error) {",
  "      setStatus('failed')",
  "    }",
  "  }",
  "  async function save() {",
  "    try {",
  "      await saveEvent()",
  "    } catch (error) {",
  "      setStatus('failed')",
  "    }",
  "  }",
  "}",
  "",
].join("\n")

// Two textually identical contexts inside ONE function: same offending line, same neighbours.
const ONE_SCOPE_TWO_TRIES = (firstCatch = "    } catch (error) {") =>
  [
    "export async function handler() {",
    "  try {",
    "    await step()",
    firstCatch,
    "    log('failed')",
    "  }",
    "  try {",
    "    await step()",
    "  } catch (error) {",
    "    log('failed')",
    "  }",
    "}",
    "",
  ].join("\n")

// ---------------------------------------------------------------------------
// Identity parts
// ---------------------------------------------------------------------------

test("identity format is documented and has no raw line number, absolute path or full multiline message", () => {
  assert.equal(FINGERPRINT_FORMAT, "path :: rule :: message :: scope :: node-path :: anchor :: line@offset")
  const src = "const a = 1\n\n   const x: any = 1   \n"
  const fp3 = fingerprint("src/a.ts", warn("@typescript-eslint/no-explicit-any", "Unexpected any. Specify a different type.", 3, 13), src)
  assert.equal(
    fp3,
    "src/a.ts :: @typescript-eslint/no-explicit-any :: Unexpected any. Specify a different type. :: <module> :: VariableStatement[1]>VariableDeclarationList[0]>VariableDeclaration[0]>AnyKeyword[0] :: " +
      anchorOf("const x: any = 1") +
      "/1 :: const x: any = 1@9",
  )
  assert.match(anchorOf("const x: any = 1"), /^[0-9a-f]{12}$/)
  const srcMoved = "// added comment\nconst a = 1\n\n\n\n   const x: any = 1\n"
  const fp6 = fingerprint("src/a.ts", warn("@typescript-eslint/no-explicit-any", "Unexpected any. Specify a different type.", 6, 13), srcMoved)
  assert.equal(fp6, fp3, "same code at a different line number → same identity")
})

test("scopeChainAt names the nearest enclosing function/method/class/export/declaration, innermost last", () => {
  const src = [
    "export default function Page() {",
    "  const handlers = {",
    "    onSave: async () => {",
    "      let x: any",
    "    },",
    "  }",
    "  class Box { render() { let y: any } }",
    "  return null",
    "}",
    "export const load = async () => { let z: any }",
    "function plain() {}",
    "let top: any",
  ].join("\n")
  assert.equal(scopeChainAt(src, "a.tsx", 4, 7), "Page>handlers>onSave")
  assert.equal(scopeChainAt(src, "a.tsx", 7, 26), "Page>Box>render")
  assert.equal(scopeChainAt(src, "a.tsx", 10, 40), "load")
  assert.equal(scopeChainAt(src, "a.tsx", 12, 1), "<module>")
})

test("nodePathAt is the structural path from the enclosing scope to the diagnosed node, indexed among same-kind siblings", () => {
  const src = ONE_SCOPE_TWO_TRIES()
  const first = nodePathAt(src, "h.ts", 4, 15)
  const second = nodePathAt(src, "h.ts", 9, 13)
  assert.equal(first, "Block[0]>TryStatement[0]>CatchClause[0]>VariableDeclaration[0]>Identifier[0]")
  assert.equal(second, "Block[0]>TryStatement[1]>CatchClause[0]>VariableDeclaration[0]>Identifier[0]")
  // Comments and blank lines are not nodes: they never change a path.
  const commented = src.replace("  try {\n    await step()\n  } catch (error) {", "  // note\n\n  try {\n    await step()\n  } catch (error) {")
  assert.equal(nodePathAt(commented, "h.ts", 11, 13), second)
  // A sibling of a different kind inserted before the node does not shift its same-kind index.
  const withConst = src.replace("  try {\n    await step()\n  } catch (error) {", "  const n = 1\n  try {\n    await step()\n  } catch (error) {")
  assert.equal(nodePathAt(withConst, "h.ts", 10, 13), second)
})

test("anchorAt is <token hash>/<copies>: hash of the enclosing statement's token stream plus how many token-identical statements share its statement list", () => {
  const src = ONE_SCOPE_TWO_TRIES()
  const a1 = anchorAt(src, "h.ts", 4, 15)
  const a2 = anchorAt(src, "h.ts", 9, 13)
  assert.equal(a1, anchorOf("try {\n    await step()\n  } catch (error) {\n    log('failed')\n  }") + "/2", "two token-identical try statements in the block → copies 2")
  assert.equal(a1, a2, "these two try statements are token-identical copies → same anchor (their paths still differ)")
  assert.equal(anchorAt(src.replace(/\n/g, "\r\n"), "h.ts", 4, 15), a1, "CRLF-independent")
  assert.equal(anchorAt(ONE_SCOPE_TWO_TRIES("    } catch {"), "h.ts", 9, 13), anchorOf("try {\n    await step()\n  } catch (error) {\n    log('failed')\n  }") + "/1", "once the copies differ, copies 1")
  assert.equal(anchorOf("  a   +\r\n b "), anchorOf("a + b"), "whitespace between tokens is not significant")
  assert.equal(anchorOf("f(/* why */ x) // note"), anchorOf("f(x)"), "comments are not tokens")
  // Whitespace INSIDE string and template literals is part of the token and must be preserved.
  assert.notEqual(anchorOf('step("a  b")'), anchorOf('step("a b")'))
  assert.notEqual(anchorOf("tag`a  b`"), anchorOf("tag`a b`"))
  assert.notEqual(anchorOf("step('a\\tb')"), anchorOf("step('a b')"))
  // A JSX element inside a return statement anchors to the whole return statement. JSX text is a token whose
  // whitespace can be significant (e.g. `whitespace-pre`), so it is preserved exactly (CR stripped only).
  const jsx = "function C() {\n  return (\n    <div>\n      <a href=\"/x\">x</a>\n    </div>\n  )\n}\n"
  assert.equal(anchorAt(jsx, "c.tsx", 4, 7), anchorOf('return (\n    <div>\n      <a href="/x">x</a>\n    </div>\n  )', "c.tsx") + "/1")
  assert.equal(anchorAt(jsx.replace(/\n/g, "\r\n"), "c.tsx", 4, 7), anchorAt(jsx, "c.tsx", 4, 7), "CRLF-independent in JSX too")
  assert.notEqual(anchorOf('return <span className="whitespace-pre">a  b</span>', "c.tsx"), anchorOf('return <span className="whitespace-pre">a b</span>', "c.tsx"))
  // Whitespace-only JSX text containing a newline is not a JSX child at all (the parser drops it, as JSX semantics do),
  // so pure layout between elements does not change the anchor; text with content is compared exactly.
  assert.equal(anchorOf("return (<div><a>x</a></div>)", "c.tsx"), anchorOf('return (<div>\n  <a>x</a>\n</div>)', "c.tsx"))
  assert.notEqual(anchorOf("return (<div>x y</div>)", "c.tsx"), anchorOf("return (<div>x  y</div>)", "c.tsx"), "JSX text with content is not collapsed")
  // Top level: the statement itself.
  assert.equal(anchorAt("let top: any\n", "t.ts", 1, 10), anchorOf("let top: any") + "/1")
})

test("SUPPRESSED-COPY SWAP FAILS: delete the warning-bearing statement and un-suppress its token-identical sibling (directives are trivia)", () => {
  const ANY = "@typescript-eslint/no-explicit-any"
  const M = "Unexpected any. Specify a different type."
  const baselineSrc = [
    "function C(x: unknown) {",
    "  f(x as any)",
    "  // eslint-disable-next-line @typescript-eslint/no-explicit-any",
    "  f(x as any)",
    "}",
    "",
  ].join("\n")
  const revisionSrc = ["function C(x: unknown) {", "  f(x as any)", "}", ""].join("\n")
  // Baseline: only the first statement warns (the second is suppressed). Revision: first deleted, survivor un-suppressed.
  const before = summarizeResults([result("src/c.ts", baselineSrc, [warn(ANY, M, 2, 10)])], RROOT)
  const after = summarizeResults([result("src/c.ts", revisionSrc, [warn(ANY, M, 2, 10)])], RROOT)
  assert.equal(nodePathAt(baselineSrc, "c.ts", 2, 10), nodePathAt(revisionSrc, "c.ts", 2, 10), "survivor inherits the ordinal")
  assert.equal(anchorOf("f(x as any)"), anchorAt(baselineSrc, "c.ts", 2, 10).split("/")[0], "token hashes are identical (the directive is trivia)")
  assert.equal(anchorAt(baselineSrc, "c.ts", 2, 10), anchorOf("f(x as any)") + "/2")
  assert.equal(anchorAt(revisionSrc, "c.ts", 2, 10), anchorOf("f(x as any)") + "/1")
  const c = compareToBaseline({ fingerprints: before.warnings }, after)
  assert.equal(c.ok, false)
  assert.equal(c.regressed, true)
  assert.equal(c.added.length, 1)
  assert.equal(c.removed.length, 1)
})

test("JSX-TEXT-WHITESPACE SWAP FAILS: statements differing only inside JSX text keep distinct anchors across an ordinal shift", () => {
  const baselineSrc = [
    "function C() {",
    "  if (a) {",
    '    return <span className="whitespace-pre"><a href="/x">a  b</a></span>',
    "  }",
    "  if (b) {",
    '    return <span className="whitespace-pre"><a href="/x">a b</a></span>',
    "  }",
    "}",
    "",
  ].join("\n")
  const revisionSrc = [
    "function C() {",
    "  if (b) {",
    '    return <span className="whitespace-pre"><a href="/x">a b</a></span>',
    "  }",
    "}",
    "",
  ].join("\n")
  const LINK = "@next/next/no-html-link-for-pages"
  const before = summarizeResults([result("src/c.tsx", baselineSrc, [warn(LINK, "Do not use an `<a>` element", 3, 46)])], RROOT)
  const after = summarizeResults([result("src/c.tsx", revisionSrc, [warn(LINK, "Do not use an `<a>` element", 3, 46)])], RROOT)
  assert.equal(nodePathAt(baselineSrc, "c.tsx", 3, 46), nodePathAt(revisionSrc, "c.tsx", 3, 46))
  const c = compareToBaseline({ fingerprints: before.warnings }, after)
  assert.equal(c.ok, false)
  assert.equal(c.regressed, true)
  assert.equal(c.added.length, 1)
  assert.equal(c.removed.length, 1)
})

test("LITERAL-WHITESPACE SWAP FAILS: statements differing only inside a string literal keep distinct anchors across an ordinal shift", () => {
  const baselineSrc = [
    "export async function handler() {",
    "  try {",
    '    await step("a  b")',
    "  } catch (error) {",
    "    log('failed')",
    "  }",
    "  try {",
    '    await step("a b")',
    "  } catch {",
    "    log('failed')",
    "  }",
    "}",
    "",
  ].join("\n")
  const revisionSrc = [
    "export async function handler() {",
    "  try {",
    '    await step("a b")',
    "  } catch (error) {",
    "    log('failed')",
    "  }",
    "}",
    "",
  ].join("\n")
  const before = summarizeResults([result("src/h.ts", baselineSrc, [warn(UV, UNUSED, 4, 13)])], RROOT)
  const after = summarizeResults([result("src/h.ts", revisionSrc, [warn(UV, UNUSED, 4, 13)])], RROOT)
  assert.equal(nodePathAt(baselineSrc, "h.ts", 4, 13), nodePathAt(revisionSrc, "h.ts", 4, 13))
  const c = compareToBaseline({ fingerprints: before.warnings }, after)
  assert.equal(c.ok, false)
  assert.equal(c.regressed, true)
  assert.equal(c.added.length, 1)
  assert.equal(c.removed.length, 1)
})

test("ORDINAL-SHIFT SWAP FAILS: delete the first statement, introduce the identical warning in the formerly second statement", () => {
  const baselineSrc = [
    "export async function handler() {",
    "  try {",
    "    await step()",
    "  } catch (error) {",
    "    log('failed')",
    "  }",
    "  try {",
    "    await other()",
    "  } catch {",
    "    log('failed')",
    "  }",
    "}",
    "",
  ].join("\n")
  const revisionSrc = [
    "export async function handler() {",
    "  try {",
    "    await other()",
    "  } catch (error) {",
    "    log('failed')",
    "  }",
    "}",
    "",
  ].join("\n")
  const before = summarizeResults([result("src/h.ts", baselineSrc, [warn(UV, UNUSED, 4, 13)])], RROOT)
  const after = summarizeResults([result("src/h.ts", revisionSrc, [warn(UV, UNUSED, 4, 13)])], RROOT)
  // Same scope, same node path (the survivor is now TryStatement[0]), same line and offset — only the statement content differs.
  assert.equal(nodePathAt(baselineSrc, "h.ts", 4, 13), nodePathAt(revisionSrc, "h.ts", 4, 13))
  const c = compareToBaseline({ fingerprints: before.warnings }, after)
  assert.equal(c.ok, false)
  assert.equal(c.regressed, true)
  assert.equal(c.added.length, 1)
  assert.equal(c.removed.length, 1)
})

test("offsetInNormalizedLine is the diagnostic column mapped onto the normalized line (machine- and indentation-independent)", () => {
  // `any` starts at index 9 of the normalized line "foo(a as any, ...)" in every case below.
  assert.equal(offsetInNormalizedLine("    foo(a as any, b as any)", 14), 9)
  assert.equal(offsetInNormalizedLine("foo(a as any, b as any)", 10), 9)
  assert.equal(offsetInNormalizedLine("\t\tfoo(a   as any)", 14), 9)
  assert.equal(offsetInNormalizedLine("   x", 1), 0, "column inside leading whitespace → 0")
})

test("fingerprint normalizes CRLF, indentation and internal whitespace, and gives unused-disable directives a stable rule key", () => {
  const msg = "Unused eslint-disable directive (no problems were reported from 'no-console')."
  const a = fingerprint("src/b.ts", warn(null, msg, 2, 3), "function log() {\r\n  // eslint-disable-next-line   no-console\r\n  console.log(1)\r\n}\r\n")
  const b = fingerprint("src/b.ts", warn(null, msg, 2, 1), "function log() {\n// eslint-disable-next-line no-console\nconsole.log(1)\n}\n")
  assert.equal(a, b)
  assert.match(a, /:: unused-disable-directive ::/)
  assert.match(a, /:: log :: /)
})

test("fingerprint drops machine- and line-specific detail that React Compiler rules embed in the message (absolute path + code frame)", () => {
  const reason = "Error: Calling setState synchronously within an effect can trigger cascading renders"
  const body = "\n\nEffects are intended to synchronize state. (https://react.dev/learn/you-might-not-need-an-effect).\n\n"
  const winMsg = reason + body + "C:\\Users\\x\\repo\\src\\a.tsx:128:5\n  126 |   useEffect(() => {\n> 128 |     setSlug(s)\n      |     ^^^^^^^ Avoid calling setState() directly within an effect\n"
  const linuxMsg = reason + body + "/home/runner/work/repo/repo/src/a.tsx:140:5\n  138 |   useEffect(() => {\n> 140 |     setSlug(s)\n      |     ^^^^^^^ Avoid calling setState() directly within an effect\n"
  const src = "function Page() {\n  useEffect(() => {\n    setSlug(s)\n  }, [s])\n}\n"
  const a = fingerprint("src/a.tsx", warn("react-hooks/set-state-in-effect", winMsg, 3, 5), src)
  const b = fingerprint("src/a.tsx", warn("react-hooks/set-state-in-effect", linuxMsg, 3, 5), src)
  assert.equal(a, b, "same warning on two machines / line offsets → same identity")
  assert.match(a, new RegExp("^src/a\\.tsx :: react-hooks/set-state-in-effect :: " + reason.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + " :: Page :: Block\\[0\\]>[A-Za-z0-9\\[\\]>]+ :: [0-9a-f]{12}/1 :: setSlug\\(s\\)@0$"))
})

// ---------------------------------------------------------------------------
// Distinct locations get distinct identities; substitution across locations fails
// ---------------------------------------------------------------------------

test("two separate `} catch (error) {` warnings in one file, same rule and message, get distinct identities", () => {
  const a = fingerprint("src/p.tsx", warn(UV, UNUSED, 5, 15), TWO_CATCHES)
  const b = fingerprint("src/p.tsx", warn(UV, UNUSED, 12, 15), TWO_CATCHES)
  assert.notEqual(a, b)
  assert.match(a, /:: Page>load :: /)
  assert.match(b, /:: Page>save :: /)
})

test("two textually identical catch contexts inside ONE function are distinct identities (structural position, not neighbours)", () => {
  const src = ONE_SCOPE_TWO_TRIES()
  const a = fingerprint("src/h.ts", warn(UV, UNUSED, 4, 15), src)
  const b = fingerprint("src/h.ts", warn(UV, UNUSED, 9, 13), src)
  assert.notEqual(a, b)
  assert.match(a, /:: handler :: Block\[0\]>TryStatement\[0\]>/)
  assert.match(b, /:: handler :: Block\[0\]>TryStatement\[1\]>/)
})

test("CROSS-REVISION SWAP FAILS: fix the baseline occurrence, introduce the same warning at the identical context in the same scope → removed + new", () => {
  // Baseline revision: only the first try has the warning.
  const before = summarizeResults([result("src/h.ts", ONE_SCOPE_TWO_TRIES(), [warn(UV, UNUSED, 4, 15)])], RROOT)
  // Next revision: the first catch is fixed (`catch {`), the second one now warns. One location, no in-tree collision.
  const after = summarizeResults([result("src/h.ts", ONE_SCOPE_TWO_TRIES("    } catch {"), [warn(UV, UNUSED, 9, 13)])], RROOT)
  assert.equal(after.collisions.length, 0)
  assert.equal(Object.keys(after.warnings).length, 1)
  const c = compareToBaseline({ fingerprints: before.warnings }, after)
  assert.equal(c.ok, false)
  assert.equal(c.regressed, true)
  assert.equal(c.added.length, 1)
  assert.equal(c.removed.length, 1)
})

test("removing the first catch warning and introducing the same warning in another function is removed + new → FAIL", () => {
  const before = summarizeResults([result("src/p.tsx", TWO_CATCHES, [warn(UV, UNUSED, 5, 15)])], RROOT)
  const after = summarizeResults([result("src/p.tsx", TWO_CATCHES, [warn(UV, UNUSED, 12, 15)])], RROOT)
  const c = compareToBaseline({ fingerprints: before.warnings }, after)
  assert.equal(c.ok, false)
  assert.equal(c.regressed, true)
  assert.equal(c.added.length, 1)
  assert.equal(c.removed.length, 1)
})

test("moving warnings together with their structural context to other line numbers still passes", () => {
  const moved = "// header comment\n// another\n\n" + TWO_CATCHES
  const before = summarizeResults([result("src/p.tsx", TWO_CATCHES, [warn(UV, UNUSED, 5, 15), warn(UV, UNUSED, 12, 15)])], RROOT)
  const after = summarizeResults([result("src/p.tsx", moved, [warn(UV, UNUSED, 8, 15), warn(UV, UNUSED, 15, 15)])], RROOT)
  assert.deepEqual(after.warnings, before.warnings)
  assert.equal(compareToBaseline({ fingerprints: before.warnings }, after).ok, true)
  // Moving a whole function (its scope) elsewhere in the file keeps every identity inside it: save now comes first.
  const reordered = [
    "export default function Page() {",
    "  async function save() {",
    "    try {",
    "      await saveEvent()",
    "    } catch (error) {",
    "      setStatus('failed')",
    "    }",
    "  }",
    "  async function load() {",
    "    try {",
    "      await fetchEvent()",
    "    } catch (error) {",
    "      setStatus('failed')",
    "    }",
    "  }",
    "}",
    "",
  ].join("\n")
  const after2 = summarizeResults([result("src/p.tsx", reordered, [warn(UV, UNUSED, 5, 15), warn(UV, UNUSED, 12, 15)])], RROOT)
  assert.deepEqual(after2.warnings, before.warnings)
})

test("two warnings on one physical line at different diagnostic positions are distinct identities", () => {
  const src = "const d = body && Array.isArray((body as any).details) ? (body as any).details : []\n"
  const m = "Unexpected any. Specify a different type."
  const s = summarizeResults([result("src/r.ts", src, [warn("@typescript-eslint/no-explicit-any", m, 1, 41), warn("@typescript-eslint/no-explicit-any", m, 1, 67)])], RROOT)
  assert.equal(Object.keys(s.warnings).length, 2)
  assert.deepEqual(Object.values(s.warnings), [1, 1])
  assert.equal(s.collisions.length, 0)
})

test("exact duplicate diagnostics at the same line and column are counted together, not a collision", () => {
  const src = "let v: any\n"
  const m = "Unexpected any. Specify a different type."
  const s = summarizeResults([result("src/d.ts", src, [warn("r", m, 1, 8), warn("r", m, 1, 8)])], RROOT)
  assert.deepEqual(Object.values(s.warnings), [2])
  assert.equal(s.collisions.length, 0)
  assert.equal(s.duplicateDiagnostics, 1)
})

test("a constructed identity collision across two different locations fails as `identity collision`, not aggregated", () => {
  // Two identical lines inside ONE node (a template literal): same scope, same path, same text and offset at two locations.
  const src = "const t = `\nsame\nsame\n`\n"
  const s = summarizeResults([result("src/c.ts", src, [warn("r", "m", 2, 1), warn("r", "m", 3, 1)])], RROOT)
  assert.equal(s.collisions.length, 1)
  assert.deepEqual(s.collisions[0].locations, ["2:1", "3:1"])
  assert.equal(Object.keys(s.warnings).length, 1, "the identity is still reported once")
  const c = compareToBaseline({ fingerprints: { ...s.warnings } }, s)
  assert.equal(c.ok, false)
  assert.equal(c.collisions.length, 1)
  const v = outcome(c)
  assert.equal(v.code, 1)
  assert.equal(v.kind, "collision")
  assert.match(v.message, /identity collision/)
})

// ---------------------------------------------------------------------------
// Summarize: counts per identity, errors surfaced separately
// ---------------------------------------------------------------------------

test("summarizeResults counts per identity and collects errors separately", () => {
  const src = "let x: any\nlet y: any\n"
  const s = summarizeResults(
    [
      result("src/a.ts", src, [warn("r", "m", 1, 8), warn("r", "m", 2, 8)]),
      result("src/c.ts", "bad(\n", [{ ruleId: "no-undef", message: "x is not defined", severity: 2, line: 1, column: 1 }]),
      result("src/clean.ts", "", []),
    ],
    RROOT,
  )
  assert.equal(Object.keys(s.warnings).length, 2)
  assert.deepEqual(Object.values(s.warnings), [1, 1])
  assert.equal(s.errors.length, 1)
  assert.match(s.errors[0], /src\/c\.ts:1:1 no-undef x is not defined/)
  assert.equal(s.collisions.length, 0)
})

// ---------------------------------------------------------------------------
// Compare: the ratchet rules (identities abbreviated; only the map matters here)
// ---------------------------------------------------------------------------

const A = "src/a.ts :: r :: m :: f :: Block[0]>X[0] :: 000000000001 :: old()@0"
const KEEP = "src/b.ts :: r :: m :: g :: Block[0]>X[0] :: 000000000002 :: keep()@0"
const DUP = "src/d.ts :: r :: m :: h :: Block[0]>X[0] :: 000000000003 :: dup()@0"
const base = { [A]: 1, [KEEP]: 1, [DUP]: 2 }
const cur = (warnings) => ({ warnings, errors: [], collisions: [] })

test("identical warnings → ok, no regression, no tightening required", () => {
  const c = compareToBaseline({ fingerprints: base }, cur({ ...base }))
  assert.equal(c.ok, true)
  assert.equal(c.regressed, false)
  assert.equal(c.tightenRequired, false)
  assert.deepEqual([c.added, c.increased, c.removed, c.decreased], [[], [], [], []])
})

test("SUBSTITUTION FAILS: one old warning removed and one new warning added, total unchanged", () => {
  const NEW = "src/new.ts :: r :: m :: k :: Block[0]>X[0] :: 000000000004 :: fresh()@0"
  const current = { [KEEP]: 1, [DUP]: 2, [NEW]: 1 }
  assert.equal(Object.values(current).reduce((a, b) => a + b, 0), Object.values(base).reduce((a, b) => a + b, 0), "totals equal by construction")
  const c = compareToBaseline({ fingerprints: base }, cur(current))
  assert.equal(c.ok, false)
  assert.equal(c.regressed, true, "the new identity is a regression regardless of the removal")
  assert.deepEqual(c.added, [{ fingerprint: NEW, count: 1 }])
  assert.deepEqual(c.removed, [{ fingerprint: A, count: 1 }])
})

test("an existing warning disappearing is not a regression but requires baseline tightening (non-zero until recorded)", () => {
  const c = compareToBaseline({ fingerprints: base }, cur({ [KEEP]: 1, [DUP]: 2 }))
  assert.equal(c.ok, false)
  assert.equal(c.regressed, false, "not a regression")
  assert.equal(c.tightenRequired, true, "baseline must be regenerated to lock the improvement")
  assert.deepEqual(c.removed, [{ fingerprint: A, count: 1 }])
})

test("LIFECYCLE: fixed warning is locked out — remove A → tighten → regenerated baseline omits A → reintroducing A fails as new", () => {
  assert.ok(A in base)
  const withoutA = cur({ [KEEP]: 1, [DUP]: 2 })
  const stale = compareToBaseline({ fingerprints: base }, withoutA)
  assert.equal(stale.ok, false)
  assert.equal(stale.tightenRequired, true)
  assert.equal(stale.regressed, false)
  const tightened = buildBaseline(withoutA, { generatedFrom: "0".repeat(40), eslintVersion: "9.0.0" })
  assert.ok(!(A in tightened.fingerprints))
  assert.equal(tightened.total, 3)
  const afterTighten = compareToBaseline(tightened, withoutA)
  assert.equal(afterTighten.ok, true)
  assert.equal(afterTighten.tightenRequired, false)
  const reintroduced = compareToBaseline(tightened, cur({ ...withoutA.warnings, [A]: 1 }))
  assert.equal(reintroduced.ok, false)
  assert.equal(reintroduced.regressed, true)
  assert.deepEqual(reintroduced.added, [{ fingerprint: A, count: 1 }])
})

test("an existing warning moving to another line with the same source passes end to end", () => {
  const before = summarizeResults([result("src/m.ts", "a()\nlet v: any\nb()\n", [warn("r", "m", 2, 8)])], RROOT)
  const after = summarizeResults([result("src/m.ts", "// new\n// lines\na()\nlet v: any\nb()\n", [warn("r", "m", 4, 8)])], RROOT)
  assert.equal(compareToBaseline({ fingerprints: before.warnings }, after).ok, true)
})

test("duplicate identity count increasing fails as a regression; decreasing requires baseline tightening, then passes once recorded", () => {
  const up = compareToBaseline({ fingerprints: base }, cur({ ...base, [DUP]: 3 }))
  assert.equal(up.ok, false)
  assert.equal(up.regressed, true)
  assert.deepEqual(up.increased, [{ fingerprint: DUP, baseline: 2, count: 3 }])
  const reduced = cur({ ...base, [DUP]: 1 })
  const down = compareToBaseline({ fingerprints: base }, reduced)
  assert.equal(down.ok, false)
  assert.equal(down.regressed, false)
  assert.equal(down.tightenRequired, true)
  assert.deepEqual(down.decreased, [{ fingerprint: DUP, baseline: 2, count: 1 }])
  const tightened = buildBaseline(reduced, { generatedFrom: "0".repeat(40), eslintVersion: "9.0.0" })
  assert.equal(tightened.fingerprints[DUP], 1)
  assert.equal(compareToBaseline(tightened, reduced).ok, true)
  const back = compareToBaseline(tightened, cur({ ...base, [DUP]: 2 }))
  assert.equal(back.ok, false)
  assert.equal(back.regressed, true)
})

test("exit status: ok → 0; regression → 1 with 'FAIL'; tightening → 1 telling the developer to run pnpm lint:baseline", () => {
  const ok = outcome(compareToBaseline({ fingerprints: base }, cur({ ...base })))
  assert.deepEqual([ok.code, ok.kind], [0, "ok"])
  const reg = outcome(compareToBaseline({ fingerprints: base }, cur({ ...base, "src/z.ts :: r :: m :: z :: Block[0]>X[0] :: 000000000005 :: z()@0": 1 })))
  assert.equal(reg.code, 1)
  assert.equal(reg.kind, "regression")
  assert.match(reg.message, /FAIL/)
  assert.doesNotMatch(reg.message, /pnpm lint:baseline/, "a regression must not be answered by regenerating the baseline")
  const tight = outcome(compareToBaseline({ fingerprints: base }, cur({ [KEEP]: 1, [DUP]: 2 })))
  assert.equal(tight.code, 1)
  assert.equal(tight.kind, "tighten")
  assert.match(tight.message, /BASELINE TIGHTENING REQUIRED/)
  assert.match(tight.message, /pnpm lint:baseline/)
})

test("any ESLint error fails, even with identical warnings", () => {
  const c = compareToBaseline({ fingerprints: base }, { warnings: { ...base }, errors: ["src/x.ts:1:1 no-undef y is not defined"], collisions: [] })
  assert.equal(c.ok, false)
  assert.equal(c.regressed, true)
  assert.equal(c.errors.length, 1)
})

// ---------------------------------------------------------------------------
// Baseline regeneration is explicit and manual
// ---------------------------------------------------------------------------

test("the baseline is only written with an explicit --update flag", () => {
  assert.equal(shouldUpdate([]), false)
  assert.equal(shouldUpdate(["--check"]), false)
  assert.equal(shouldUpdate(["--update"]), true)
})

test("scripts and CI: lint:ratchet is the new-warning guard, lint:baseline is the manual regeneration, CI never regenerates", () => {
  assert.equal(pkg.scripts["lint:ratchet"], "node scripts/lint-ratchet.mjs")
  assert.equal(pkg.scripts["lint:baseline"], "node scripts/lint-ratchet.mjs --update")
  assert.match(workflow, /pnpm lint:ratchet/, "Quality gates run the ratchet")
  assert.doesNotMatch(workflow, /lint:baseline|--update/, "CI never regenerates the baseline")
  // The numeric ceiling may remain as a secondary safety net only.
  assert.match(pkg.scripts.lint, /^eslint\b/)
})

// ---------------------------------------------------------------------------
// The committed baseline: generated from ESLint output on a specific commit
// ---------------------------------------------------------------------------

test("committed baseline is well-formed, portable, records its source commit, ESLint version and format, and totals exactly 172", () => {
  assert.ok(existsSync(p("../../" + BASELINE_FILE)), BASELINE_FILE + " exists")
  const b = JSON.parse(readFileSync(p("../../" + BASELINE_FILE), "utf8"))
  assert.match(b.generatedFrom, /^[0-9a-f]{40}$/)
  assert.match(b.eslint, /^\d+\.\d+\.\d+/)
  assert.equal(b.format, FINGERPRINT_FORMAT)
  const sum = Object.values(b.fingerprints).reduce((a, n) => a + n, 0)
  assert.equal(b.total, sum)
  // The approved population. Lower this together with a reviewed baseline tightening; never raise it.
  // 2026-09-06: 172. 2026-09-07: 171 — ConsentBanner's privacy link became a next/link <Link>.
  assert.equal(b.total, 171)
  assert.ok(Number.isInteger(b.duplicateDiagnostics) && b.duplicateDiagnostics >= 0)
  for (const [fp, n] of Object.entries(b.fingerprints)) {
    assert.equal(fp.split(" :: ").length, 7, "identity has the 7 documented parts: " + fp)
    assert.match(fp.split(" :: ")[5], /^[0-9a-f]{12}\/[1-9]\d*$/, "anchor is a 12-hex token hash plus copy count: " + fp)
    assert.ok(Number.isInteger(n) && n >= 1)
    // Portable: no absolute paths, code frames or line:col positions may leak into an identity.
    assert.doesNotMatch(fp, /[A-Za-z]:\\|\/home\/|\/Users\/|\n|:\d+:\d+\b|\|\s*\^/, "identity is machine- and line-independent: " + fp)
  }
  assert.deepEqual(Object.keys(b.fingerprints), [...Object.keys(b.fingerprints)].sort(), "identities sorted for deterministic diffs")
})

test("current tree passes the ratchet against the committed baseline with zero identity collisions (runs ESLint)", () => {
  const r = spawnSync(process.execPath, ["scripts/lint-ratchet.mjs"], { cwd: root, encoding: "utf8" })
  assert.equal(r.status, 0, `ratchet exit ${r.status}\n${r.stdout}\n${r.stderr}`)
  assert.match(r.stdout, /lint-ratchet: OK — 171 warnings, 0 errors, 0 identity collisions/)
})
