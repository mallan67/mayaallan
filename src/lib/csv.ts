/**
 * RFC 4180 CSV escaping.
 *
 * A value must be wrapped in double-quotes when it contains:
 *   - a comma
 *   - a double-quote (which then doubles to "")
 *   - a CR or LF
 *
 * Anything else can be emitted as-is. nulls / undefined render as empty.
 *
 * Used by:
 *   /api/admin/analytics/events    (event export)
 *   /api/admin/crm/subscribers     (subscriber export)
 */

export function csvEscapeField(value: unknown): string {
  if (value === null || value === undefined) return ""
  let s: string
  if (value instanceof Date) {
    s = value.toISOString()
  } else if (typeof value === "object") {
    try {
      s = JSON.stringify(value)
    } catch {
      s = String(value)
    }
  } else {
    s = String(value)
  }
  if (/[",\r\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

export function csvRow(values: unknown[]): string {
  return values.map(csvEscapeField).join(",")
}

/** Build a complete CSV body with header + rows. Ends with a trailing newline. */
export function buildCsv(header: string[], rows: unknown[][]): string {
  const parts: string[] = [csvRow(header)]
  for (const row of rows) parts.push(csvRow(row))
  return parts.join("\r\n") + "\r\n"
}
