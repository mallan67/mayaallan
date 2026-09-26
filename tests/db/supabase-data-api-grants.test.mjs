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

function createdPublicTables(sql) {
  const tables = []
  const re = /create\s+table\s+(?:if\s+not\s+exists\s+)?(?:public\.)?("?[_a-zA-Z][_a-zA-Z0-9]*"?)/gi
  for (const match of sql.matchAll(re)) {
    tables.push(match[1].replaceAll('"', "").toLowerCase())
  }
  return [...new Set(tables)]
}

function serviceRoleGrantedTables(sql) {
  const granted = new Set()
  const re = /grant\s+[\s\S]*?\s+on\s+table\s+([\s\S]*?)\s+to\s+service_role\s*;/gi
  for (const match of sql.matchAll(re)) {
    for (const raw of match[1].split(",")) {
      const name = raw.trim().replace(/^public\./i, "").replaceAll('"', "").toLowerCase()
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
