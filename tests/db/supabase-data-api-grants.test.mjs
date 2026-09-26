import assert from "node:assert/strict"
import { test } from "node:test"
import { readdir, readFile } from "node:fs/promises"
import path from "node:path"

const ROOT = path.resolve("supabase")

async function sqlFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const out = []
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...(await sqlFiles(full)))
    else if (entry.isFile() && entry.name.endsWith(".sql")) out.push(full)
  }
  return out
}

function normalizeIdentifier(value) {
  return value.trim().replace(/^public\./i, "").replaceAll('"', "").toLowerCase()
}

function createdPublicTables(sql) {
  const tables = []
  const re = /create\s+table\s+(?:if\s+not\s+exists\s+)?(?:public\.)?("?[_a-zA-Z][_a-zA-Z0-9]*"?)/gi
  for (const match of sql.matchAll(re)) {
    tables.push(normalizeIdentifier(match[1]))
  }
  return [...new Set(tables)]
}

function createdSerialSequences(sql) {
  const sequences = []
  const tableRe = /create\s+table\s+(?:if\s+not\s+exists\s+)?(?:public\.)?("?[_a-zA-Z][_a-zA-Z0-9]*"?)\s*\(([\s\S]*?)\);/gi

  for (const tableMatch of sql.matchAll(tableRe)) {
    const table = normalizeIdentifier(tableMatch[1])
    const body = tableMatch[2]
    const columnRe = /(?:^|,)\s*("?[_a-zA-Z][_a-zA-Z0-9]*"?)\s+(?:bigserial|serial|smallserial)\b/gi

    for (const columnMatch of body.matchAll(columnRe)) {
      const column = normalizeIdentifier(columnMatch[1])
      sequences.push(`${table}_${column}_seq`)
    }
  }

  return [...new Set(sequences)]
}

function serviceRoleGrantedTables(sql) {
  const granted = new Set()
  const re = /grant\s+[\s\S]*?\s+on\s+table\s+([\s\S]*?)\s+to\s+service_role\s*;/gi
  for (const match of sql.matchAll(re)) {
    for (const raw of match[1].split(",")) {
      const name = normalizeIdentifier(raw)
      if (/^[_a-z][_a-z0-9]*$/i.test(name)) granted.add(name)
    }
  }
  return granted
}

function serviceRoleUsageGrantedSequences(sql) {
  const granted = new Set()
  const re = /grant\s+([\s\S]*?)\s+on\s+sequence\s+([\s\S]*?)\s+to\s+service_role\s*;/gi
  for (const match of sql.matchAll(re)) {
    const privileges = match[1]
      .split(",")
      .map((value) => value.trim().toLowerCase())
    if (!privileges.includes("usage")) continue

    for (const raw of match[2].split(",")) {
      const name = normalizeIdentifier(raw)
      if (/^[_a-z][_a-z0-9]*$/i.test(name)) granted.add(name)
    }
  }
  return granted
}

test("every SQL file that creates a table grants Data API access explicitly to service_role", async () => {
  const failures = []
  for (const file of await sqlFiles(ROOT)) {
    const sql = await readFile(file, "utf8")
    const created = createdPublicTables(sql)
    if (created.length === 0) continue
    const granted = serviceRoleGrantedTables(sql)
    const missing = created.filter((table) => !granted.has(table))
    if (missing.length) failures.push(`${path.relative(process.cwd(), file)}: ${missing.join(", ")}`)
  }

  assert.deepEqual(
    failures,
    [],
    [
      "Supabase stops auto-granting Data API access to new public tables on 2026-10-30.",
      "Every migration/schema file that creates a table must GRANT the app's required role in the same file.",
      ...failures,
    ].join("\n"),
  )
})

test("every serial column created in SQL grants its generated sequence to service_role", async () => {
  const failures = []

  for (const file of await sqlFiles(ROOT)) {
    const sql = await readFile(file, "utf8")
    const createdSequences = createdSerialSequences(sql)
    if (createdSequences.length === 0) continue

    const grantedSequences = serviceRoleUsageGrantedSequences(sql)
    const missing = createdSequences.filter((sequence) => !grantedSequences.has(sequence))
    if (missing.length) failures.push(`${path.relative(process.cwd(), file)}: ${missing.join(", ")}`)
  }

  assert.deepEqual(
    failures,
    [],
    [
      "SERIAL/BIGSERIAL table grants are insufficient by themselves.",
      "The generated sequence must explicitly grant USAGE to service_role or nextval() inserts can fail.",
      ...failures,
    ].join("\n"),
  )
})
