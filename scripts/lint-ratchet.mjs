#!/usr/bin/env node
/**
 * ESLint warning ratchet keyed on warning identity, not on a total count.
 *
 * `eslint --max-warnings N` only bounds the total, so one old warning can be
 * traded for one new warning without CI noticing. This script gives every
 * warning ESLint reports a location-stable identity and compares
 * per-identity counts against the committed baseline in `lint-baseline.json`.
 *
 *   identity = path :: rule :: message :: scope :: node-path :: anchor :: line@offset
 *
 *   path      repo-relative POSIX path (never an absolute filesystem path)
 *   rule      ESLint ruleId (unused-disable directives → "unused-disable-directive")
 *   message   FIRST LINE of the ESLint message only — the React Compiler rules
 *             append an absolute path and a numbered code frame, which differ
 *             between machines and shift when code moves
 *   scope     named enclosing declarations from the TypeScript AST, outermost
 *             first (e.g. "AdminEditEventPage>handleSubmit"), "<module>" at top level
 *   node-path structural path from that scope down to the diagnosed node,
 *             `Kind[i]` per level with i the index among same-kind siblings
 *             (e.g. "Block[0]>TryStatement[1]>CatchClause[0]>..."). Two
 *             occurrences of the same warning text in one scope — even with
 *             identical neighbouring lines — are different nodes and so get
 *             different paths; comments and blank lines are not nodes
 *   anchor    `<hash>/<copies>`: 12-hex sha1 of the token stream of the
 *             innermost enclosing STATEMENT (direct child of a block/file/case
 *             clause) and the number of token-identical statements in the same
 *             statement list. Whitespace and comments between tokens (ESLint
 *             directives included) are not tokens; string, template and JSX
 *             text contents are preserved exactly. A node that inherits a
 *             deleted sibling's ordinal gets a different identity: either the
 *             hash differs, or — for token-identical copies — the copy count
 *             dropped. Token-identical copies cannot be told apart by content
 *             at all; what the identity tracks is which copy (ordinal) and how
 *             many exist
 *   line      the offending source line, trimmed, CR stripped, whitespace collapsed
 *   offset    the diagnostic column mapped onto that normalized line — so two
 *             findings on one physical line are distinct, independent of indentation
 *
 * Raw line numbers are never part of the identity: unchanged code moving to
 * another line — or a whole function moving elsewhere in the file — keeps its
 * identity. Inserting a same-kind sibling statement before a warning inside
 * its scope, or editing anything inside the statement that contains it,
 * does change its identity; the report flags such removed/new pairs with
 * matching warning text so they are reviewed as a relocation, and the
 * baseline is regenerated only after that review. The line/column are used
 * only to locate the node, anchor and offset, and — internally — to detect
 * collisions.
 *
 * IDENTITY COLLISIONS. Diagnostics at DIFFERENT source locations that still
 * produce the same identity are never silently aggregated: they fail both
 * check mode and baseline generation as an "identity collision". Only exact
 * duplicate diagnostics at the same line:column count together.
 *
 * The baseline tracks the CURRENTLY APPROVED warning population — exactly
 * the warnings that exist on main, no more and no fewer.
 *
 * Check mode (default, what CI runs — `pnpm lint:ratchet`) exits non-zero:
 *   - as an IDENTITY COLLISION (see above);
 *   - as a REGRESSION when ESLint reports any error (severity 2), an
 *     identity appears that is absent from the baseline, or the count of an
 *     existing identity increases. Fix the finding; do not regenerate the
 *     baseline to silence a newly introduced warning. (A warning whose
 *     structural position inside its scope changed shows up as a removed/new
 *     pair with matching warning text; the report points those out.)
 *   - as BASELINE TIGHTENING REQUIRED when an identity disappears or its
 *     count decreases. That is an improvement, not an error, but it must be
 *     recorded: a baseline that still allows a fixed warning would let it
 *     come back later. Run `pnpm lint:baseline` and commit the reduced
 *     baseline in the same change.
 *
 * Regenerating the baseline is a deliberate, manual step and is never run by
 * CI. Use it after a reviewed warning cleanup to lock the improvement in:
 *
 *     pnpm lint:baseline        # == node scripts/lint-ratchet.mjs --update
 *
 * The baseline records the commit it was generated from, the ESLint version,
 * the identity format, the number of exact-same-location duplicate
 * diagnostics, and a `total` equal to the sum of all identity counts.
 */
import { readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { execFileSync } from "node:child_process"
import { createHash } from "node:crypto"
import ts from "typescript"

export const BASELINE_FILE = "lint-baseline.json"
export const FINGERPRINT_FORMAT = "path :: rule :: message :: scope :: node-path :: anchor :: line@offset"
const SEP = " :: "

const repoRoot = () => fileURLToPath(new URL("..", import.meta.url))

export function shouldUpdate(argv) {
  return argv.includes("--update")
}

/** Repo-relative path with forward slashes on every platform. */
export function relativePosix(root, filePath) {
  return path.relative(root, filePath).split(path.sep).join("/")
}

export function normalizeLine(text) {
  return String(text ?? "")
    .replace(/\r/g, "")
    .trim()
    .replace(/\s+/g, " ")
}

/** Rule key for a message; unused-disable directives have no ruleId in ESLint. */
export function ruleKey(message) {
  if (message.ruleId) return message.ruleId
  if (/^Unused eslint-disable/.test(message.message ?? "")) return "unused-disable-directive"
  return "no-rule"
}

/** First line of the message only (see header: React Compiler code frames). */
export function normalizeMessage(text) {
  return normalizeLine(String(text ?? "").split(/\r?\n/)[0])
}

const splitLines = (source) => String(source ?? "").split(/\r?\n/)

export function offendingLine(source, line) {
  if (typeof source !== "string" || !Number.isInteger(line) || line < 1) return ""
  return normalizeLine(splitLines(source)[line - 1])
}

/**
 * The diagnostic column mapped onto the normalized line: leading whitespace
 * dropped, internal whitespace collapsed, CR ignored — so the same code
 * indented differently (or with CRLF) yields the same offset.
 */
export function offsetInNormalizedLine(lineText, column) {
  const prefix = String(lineText ?? "").slice(0, Math.max(0, (column ?? 1) - 1))
  return prefix.replace(/\r/g, "").replace(/^\s+/, "").replace(/\s+/g, " ").length
}

function scriptKindFor(fileName) {
  const ext = path.extname(fileName).toLowerCase()
  if (ext === ".tsx") return ts.ScriptKind.TSX
  if (ext === ".ts" || ext === ".mts" || ext === ".cts") return ts.ScriptKind.TS
  if (ext === ".jsx") return ts.ScriptKind.JSX
  return ts.ScriptKind.JS
}

const NAMED_INITIALIZERS = new Set([
  ts.SyntaxKind.ArrowFunction,
  ts.SyntaxKind.FunctionExpression,
  ts.SyntaxKind.ClassExpression,
  ts.SyntaxKind.ObjectLiteralExpression,
  ts.SyntaxKind.CallExpression,
])

function declaredName(node) {
  const modifiers = ts.canHaveModifiers(node) ? ts.getModifiers(node) ?? [] : []
  const isDefault = modifiers.some((m) => m.kind === ts.SyntaxKind.DefaultKeyword)
  const nameText = (n) => (n && (ts.isIdentifier(n) || ts.isStringLiteral(n) || ts.isNumericLiteral(n) || ts.isPrivateIdentifier(n)) ? n.text : n ? n.getText() : undefined)
  if (ts.isFunctionDeclaration(node) || ts.isClassDeclaration(node)) return nameText(node.name) ?? (isDefault ? "default" : undefined)
  if (ts.isMethodDeclaration(node) || ts.isGetAccessorDeclaration(node) || ts.isSetAccessorDeclaration(node)) return nameText(node.name)
  if (ts.isConstructorDeclaration(node)) return "constructor"
  if (ts.isPropertyDeclaration(node) && node.initializer && NAMED_INITIALIZERS.has(node.initializer.kind)) return nameText(node.name)
  if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer && NAMED_INITIALIZERS.has(node.initializer.kind)) return node.name.text
  if (ts.isPropertyAssignment(node) && node.initializer && NAMED_INITIALIZERS.has(node.initializer.kind)) return nameText(node.name)
  if (ts.isExportAssignment(node)) return "default"
  if (ts.isModuleDeclaration(node) || ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node) || ts.isEnumDeclaration(node)) return nameText(node.name)
  return undefined
}

// Stable SyntaxKind names: skip the First*/Last* range aliases that share numeric values.
const KIND_NAME = (() => {
  const m = new Map()
  for (const [name, value] of Object.entries(ts.SyntaxKind)) {
    if (typeof value === "number" && !/^(First|Last)/.test(name) && !m.has(value)) m.set(value, name)
  }
  return m
})()

/**
 * Walk the AST from the file root to the innermost node containing
 * (line, column). Returns
 *   scope    named enclosing declarations, outermost first ("<module>" if none)
 *   nodePath structural path from the innermost named scope down to the
 *            diagnosed node: `Kind[i]` per level, i = index among siblings of
 *            the same kind (comments and blank lines are not nodes, so they
 *            never shift a path; moving a whole scope keeps every path in it)
 */
/**
 * Leaf tokens of a node, in source order. Whitespace and comments between
 * tokens are trivia and never contribute; token contents — string and
 * template literals, and JSX text, whose whitespace can be significant
 * (e.g. `whitespace-pre`) — are preserved exactly, CR stripped only.
 */
function leafTokens(node, sf, out) {
  if (ts.isJSDoc(node)) return out
  const children = node.getChildren(sf)
  if (children.length === 0) {
    const text = node.getText(sf).replace(/\r/g, "")
    if (text) out.push(text)
    return out
  }
  for (const c of children) leafTokens(c, sf, out)
  return out
}

function hashTokens(tokens) {
  return createHash("sha1").update(tokens.join(""), "utf8").digest("hex").slice(0, 12)
}

/** Content anchor of a code snippet: hash of its token stream (see leafTokens). */
export function anchorOf(text, fileName = "anchor.tsx") {
  const sf = ts.createSourceFile(fileName, String(text ?? ""), ts.ScriptTarget.Latest, true, scriptKindFor(fileName))
  return hashTokens(leafTokens(sf, sf, []).filter((t) => t !== ""))
}

// Statement-list containers: a direct child of one of these is a "statement" for anchoring.
const STATEMENT_CONTAINERS = new Set([ts.SyntaxKind.SourceFile, ts.SyntaxKind.Block, ts.SyntaxKind.ModuleBlock, ts.SyntaxKind.CaseClause, ts.SyntaxKind.DefaultClause])

/**
 * Walk the AST from the file root to the innermost node containing
 * (line, column). Returns
 *   scope    named enclosing declarations, outermost first ("<module>" if none)
 *   nodePath structural path from the innermost named scope down to the
 *            diagnosed node: `Kind[i]` per level, i = index among siblings of
 *            the same kind (comments and blank lines are not nodes, so they
 *            never shift a path; moving a whole scope keeps every path in it)
 *   anchor   `<hash>/<copies>`: hash of the TOKEN STREAM of the innermost
 *            enclosing STATEMENT (a direct child of a block / file / case
 *            clause) plus the number of token-identical statements in the
 *            same statement list — so an ordinal inherited after a sibling
 *            deletion never reproduces the identity: a different statement
 *            has a different hash, and a deleted identical copy changes the
 *            count. Whitespace and comments between tokens (including ESLint
 *            directives) are not tokens; token contents (strings, templates,
 *            JSX text) are preserved exactly
 */
export function locate(source, fileName, line, column) {
  let sf
  let pos
  try {
    sf = ts.createSourceFile(fileName, String(source ?? ""), ts.ScriptTarget.Latest, true, scriptKindFor(fileName))
    pos = sf.getPositionOfLineAndCharacter(Math.max(0, line - 1), Math.max(0, (column ?? 1) - 1))
  } catch {
    return { scope: "<module>", nodePath: "", anchor: hashTokens([]) }
  }
  const chain = []
  let steps = []
  let node = sf
  let statement
  let statementSiblings = []
  for (;;) {
    const children = []
    ts.forEachChild(node, (c) => {
      children.push(c)
    })
    const child = children.find((c) => c.pos <= pos && pos < c.end)
    if (!child) break
    if (STATEMENT_CONTAINERS.has(node.kind)) {
      statement = child
      statementSiblings = children
    }
    const name = declaredName(child)
    if (name !== undefined) {
      chain.push(name)
      steps = [] // paths are relative to the innermost named scope
    } else {
      const index = children.filter((c) => c.kind === child.kind).indexOf(child)
      steps.push(`${KIND_NAME.get(child.kind) ?? String(child.kind)}[${index}]`)
    }
    node = child
  }
  const hash = hashTokens(statement ? leafTokens(statement, sf, []) : [])
  // Token-identical statements in the same statement list are indistinguishable by
  // content; recording how many exist makes "delete one copy, warn on the other"
  // a different identity (the count drops), so it cannot pass as unchanged.
  const copies = statement ? statementSiblings.filter((s) => hashTokens(leafTokens(s, sf, [])) === hash).length : 1
  return { scope: chain.length ? chain.join(">") : "<module>", nodePath: steps.join(">"), anchor: `${hash}/${copies}` }
}

/** Chain of named enclosing declarations at (line, column), outermost first; "<module>" at top level. */
export function scopeChainAt(source, fileName, line, column) {
  return locate(source, fileName, line, column).scope
}

/** Structural path from the innermost named scope to the diagnosed node. */
export function nodePathAt(source, fileName, line, column) {
  return locate(source, fileName, line, column).nodePath
}

/** Content anchor `<token hash>/<copies>` of the innermost enclosing statement at (line, column). */
export function anchorAt(source, fileName, line, column) {
  return locate(source, fileName, line, column).anchor
}

export function fingerprint(relPath, message, source) {
  const lines = splitLines(source)
  const raw = lines[(message.line ?? 0) - 1] ?? ""
  const { scope, nodePath, anchor } = locate(source, relPath, message.line ?? 1, message.column ?? 1)
  return [relPath, ruleKey(message), normalizeMessage(message.message), scope, nodePath, anchor, `${normalizeLine(raw)}@${offsetInNormalizedLine(raw, message.column)}`].join(SEP)
}

/**
 * Turn ESLint results into
 *   { warnings: {identity: count}, errors: [string], collisions: [{fingerprint, locations}], duplicateDiagnostics }
 * Keys are sorted so the output is deterministic. `collisions` lists identities
 * produced by diagnostics at more than one distinct line:column.
 */
export function summarizeResults(results, root) {
  const buckets = new Map()
  const errors = []
  for (const result of results) {
    const rel = relativePosix(root, result.filePath)
    for (const message of result.messages ?? []) {
      if (message.severity === 2) {
        errors.push(`${rel}:${message.line ?? 0}:${message.column ?? 0} ${message.ruleId ?? "fatal"} ${message.message}`)
        continue
      }
      if (message.severity !== 1) continue
      const fp = fingerprint(rel, message, result.source)
      const loc = `${message.line ?? 0}:${message.column ?? 0}`
      const b = buckets.get(fp) ?? { count: 0, locations: new Set() }
      b.count += 1
      b.locations.add(loc)
      buckets.set(fp, b)
    }
  }
  const warnings = {}
  const collisions = []
  let duplicateDiagnostics = 0
  for (const key of [...buckets.keys()].sort()) {
    const b = buckets.get(key)
    warnings[key] = b.count
    duplicateDiagnostics += b.count - b.locations.size
    if (b.locations.size > 1) {
      const locations = [...b.locations].sort((x, y) => x.split(":").map(Number)[0] - y.split(":").map(Number)[0] || x.split(":").map(Number)[1] - y.split(":").map(Number)[1])
      collisions.push({ fingerprint: key, locations })
    }
  }
  return { warnings, errors: errors.sort(), collisions, duplicateDiagnostics }
}

/** The ratchet rule. `baseline.fingerprints` is {identity: count}. */
export function compareToBaseline(baseline, current) {
  const base = baseline?.fingerprints ?? {}
  const added = []
  const increased = []
  const removed = []
  const decreased = []
  for (const [fp, count] of Object.entries(current.warnings)) {
    if (!(fp in base)) added.push({ fingerprint: fp, count })
    else if (count > base[fp]) increased.push({ fingerprint: fp, baseline: base[fp], count })
    else if (count < base[fp]) decreased.push({ fingerprint: fp, baseline: base[fp], count })
  }
  for (const [fp, count] of Object.entries(base)) {
    if (!(fp in current.warnings)) removed.push({ fingerprint: fp, count })
  }
  const errors = [...current.errors]
  const collisions = [...(current.collisions ?? [])]
  // Regression: anything the approved population does not allow.
  const regressed = errors.length > 0 || added.length > 0 || increased.length > 0
  // Improvement not yet recorded: the baseline still allows warnings that no
  // longer exist, so a later reintroduction would slip through. Non-zero
  // until `pnpm lint:baseline` locks the reduced population in.
  const tightenRequired = removed.length > 0 || decreased.length > 0
  const ok = collisions.length === 0 && !regressed && !tightenRequired
  return { ok, regressed, tightenRequired, errors, collisions, added, increased, removed, decreased }
}

export function totalOf(counts) {
  return Object.values(counts).reduce((a, n) => a + n, 0)
}

export function buildBaseline(current, { generatedFrom, eslintVersion }) {
  return {
    $comment:
      "Generated by `pnpm lint:baseline` from ESLint output; it tracks the currently approved warning population. Do not edit by hand. " +
      "Each key is a location-stable warning identity (see `format`; no line numbers, no absolute paths) and each value its count. " +
      "CI (`pnpm lint:ratchet`) fails on any identity not listed here, any count increase, any ESLint error, or any identity collision, and requires this file " +
      "to be regenerated when a warning disappears or a count decreases, so a fixed warning cannot return. Regenerate only after a reviewed " +
      "warning cleanup, never to silence a newly introduced warning; normal CI never regenerates it.",
    generatedFrom,
    eslint: eslintVersion,
    format: FINGERPRINT_FORMAT,
    total: totalOf(current.warnings),
    duplicateDiagnostics: current.duplicateDiagnostics ?? 0,
    fingerprints: current.warnings,
  }
}

/** Identity minus scope/path/anchor/offset: used only to hint at moved warnings in reports. */
const textKey = (fp) => {
  const parts = fp.split(SEP)
  return [parts[0], parts[1], parts[2], (parts[6] ?? "").replace(/@\d+$/, "")].join(SEP)
}

/**
 * Map a comparison to an exit code and message.
 *   ok         → 0
 *   collision  → 1, "IDENTITY COLLISION": the identity scheme cannot separate two locations
 *   regression → 1, "FAIL": fix the finding, never regenerate to silence it
 *   tighten    → 1, "BASELINE TIGHTENING REQUIRED": run `pnpm lint:baseline`
 */
export function outcome(cmp, { total = 0, baseline = {} } = {}) {
  const ctx = `(current ${total}, baseline ${baseline.total ?? "?"} from ${baseline.generatedFrom ?? "?"})`
  if (cmp.ok) {
    return { code: 0, kind: "ok", message: `lint-ratchet: OK — ${total} warnings, 0 errors, 0 identity collisions ${ctx}` }
  }
  if (cmp.collisions.length > 0) {
    return {
      code: 1,
      kind: "collision",
      message:
        `lint-ratchet: IDENTITY COLLISION — ${cmp.collisions.length} identity collision${cmp.collisions.length === 1 ? "" : "s"}: the same identity is produced by diagnostics at different source locations ${ctx}.\n` +
        "Distinct locations are never aggregated into one count. The identity scheme in scripts/lint-ratchet.mjs needs more context for these cases; do not work around this by regenerating the baseline.",
    }
  }
  if (cmp.regressed) {
    const removedText = new Set(cmp.removed.map((r) => textKey(r.fingerprint)))
    const moved = cmp.added.filter((a) => removedText.has(textKey(a.fingerprint)))
    return {
      code: 1,
      kind: "regression",
      message:
        `lint-ratchet: FAIL — ${cmp.errors.length} errors, ${cmp.added.length} new identities, ${cmp.increased.length} increased counts ${ctx}.\n` +
        "Fix the finding. Do not regenerate the baseline to silence a newly introduced warning." +
        (moved.length
          ? `\nnote: ${moved.length} new identit${moved.length === 1 ? "y has" : "ies have"} the same file/rule/message/source text as a removed one — a warning whose structural position or enclosing statement changed, or a genuine relocation of the same warning. Review it as a new warning.`
          : ""),
    }
  }
  return {
    code: 1,
    kind: "tighten",
    message:
      `lint-ratchet: BASELINE TIGHTENING REQUIRED — ${cmp.removed.length} identities removed, ${cmp.decreased.length} counts decreased ${ctx}. No regression.\n` +
      "Record the improvement so it cannot come back: run `pnpm lint:baseline` and commit the regenerated lint-baseline.json in this change.",
  }
}

function headSha(root) {
  return execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim()
}

async function lintRepo(root) {
  const { ESLint } = await import("eslint")
  const eslint = new ESLint({ cwd: root })
  const results = await eslint.lintFiles(["."])
  return { results, version: ESLint.version }
}

function printList(label, items, fmt) {
  if (items.length === 0) return
  console.log(`\n${label} (${items.length}):`)
  for (const item of items) console.log("  " + fmt(item))
}

const fmtCollision = (c) => `${c.fingerprint}  at ${c.locations.join(", ")}`

async function main(argv) {
  const root = repoRoot()
  const baselinePath = path.join(root, BASELINE_FILE)
  const { results, version } = await lintRepo(root)
  const current = summarizeResults(results, root)

  if (shouldUpdate(argv)) {
    printList("ESLint errors — fix these before regenerating the baseline", current.errors, (e) => e)
    printList("Identity collisions — the identity scheme must be fixed before regenerating the baseline", current.collisions, fmtCollision)
    if (current.errors.length > 0 || current.collisions.length > 0) return 1
    const baseline = buildBaseline(current, { generatedFrom: headSha(root), eslintVersion: version })
    writeFileSync(baselinePath, JSON.stringify(baseline, null, 2) + "\n")
    console.log(
      `lint-ratchet: wrote ${BASELINE_FILE} — ${baseline.total} warnings, ${Object.keys(baseline.fingerprints).length} identities, ` +
        `${baseline.duplicateDiagnostics} same-location duplicate diagnostics, 0 identity collisions, from ${baseline.generatedFrom} (eslint ${version})`,
    )
    return 0
  }

  let baseline
  try {
    baseline = JSON.parse(readFileSync(baselinePath, "utf8"))
  } catch (err) {
    console.error(`lint-ratchet: cannot read ${BASELINE_FILE}: ${err.message}`)
    return 1
  }
  const cmp = compareToBaseline(baseline, current)
  const total = totalOf(current.warnings)

  printList("ESLint errors", cmp.errors, (e) => e)
  printList("Identity collisions (same identity at different locations)", cmp.collisions, fmtCollision)
  printList("New warnings not in baseline", cmp.added, (a) => `${a.fingerprint}  (x${a.count})`)
  printList("Warnings whose count increased", cmp.increased, (i) => `${i.fingerprint}  (${i.baseline} -> ${i.count})`)
  printList("Warnings no longer present (baseline still allows them)", cmp.removed, (r) => `${r.fingerprint}  (x${r.count})`)
  printList("Warnings whose count decreased (baseline still allows the old count)", cmp.decreased, (d) => `${d.fingerprint}  (${d.baseline} -> ${d.count})`)
  if (version !== baseline.eslint) console.log(`\nnote: baseline generated with eslint ${baseline.eslint}, running ${version}`)
  if (baseline.format !== FINGERPRINT_FORMAT) console.log(`\nnote: baseline format "${baseline.format}" differs from "${FINGERPRINT_FORMAT}"; regenerate with pnpm lint:baseline after review`)

  const verdict = outcome(cmp, { total, baseline })
  console.log("\n" + verdict.message)
  return verdict.code
}

const invokedDirectly = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (invokedDirectly) {
  main(process.argv.slice(2)).then(
    (code) => process.exit(code),
    (err) => {
      console.error(err)
      process.exit(1)
    },
  )
}
