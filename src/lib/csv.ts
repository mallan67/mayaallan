/**
 * RFC 4180 CSV escaping (with optional spreadsheet-formula safety).
 *
 * Used by:
 *   /api/admin/analytics/events    (event export, formula-safe = true)
 *   /api/admin/crm/subscribers     (subscriber export, formula-safe = true)
 *
 * RFC 4180:
 *   A value must be wrapped in double-quotes when it contains a comma,
 *   double-quote (which then doubles to ""), or CR/LF.
 *
 * Formula-safe (when the export is destined for Excel / Google Sheets /
 * Numbers and the values can be attacker-controlled, like a UTM string
 * or a subscriber's name):
 *   If a string value starts with `=`, `+`, `-`, `@`, or a tab/CR/LF,
 *   spreadsheet apps may evaluate it as a formula. For example a UTM
 *   campaign of `=HYPERLINK("https://evil.example", "Click")` becomes
 *   an executable link cell on import. Prefixing with a single quote
 *   is the standard mitigation — spreadsheets treat the value as a
 *   literal string and don't render the quote.
 *
 * Caller chooses per-export via the `formulaSafe` flag on buildCsv /
 * csvRow / csvEscapeField. Non-admin exports default to formulaSafe=false
 * (RFC 4180 only).
 */

const FORMULA_LEAD_CHARS = ["=", "+", "-", "@", "\t", "\r", "\n"] as const

function startsWithFormulaLead(s: string): boolean {
  if (s.length === 0) return false
  return (FORMULA_LEAD_CHARS as readonly string[]).includes(s[0])
}

export function csvEscapeField(value: unknown, opts: { formulaSafe?: boolean } = {}): string {
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

  // Formula-safe prefix BEFORE RFC 4180 quoting so the quote ends up inside
  // the wrapped field. Spreadsheets strip the leading single quote on import.
  if (opts.formulaSafe && startsWithFormulaLead(s)) {
    s = "'" + s
  }

  if (/[",\r\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

export function csvRow(values: unknown[], opts: { formulaSafe?: boolean } = {}): string {
  return values.map((v) => csvEscapeField(v, opts)).join(",")
}

/**
 * Build a complete CSV body with header + rows. Ends with a trailing newline.
 *
 * Set `formulaSafe: true` for any export whose values can be attacker-
 * controlled and is intended for Excel / Sheets / Numbers consumption.
 */
export function buildCsv(
  header: string[],
  rows: unknown[][],
  opts: { formulaSafe?: boolean } = {},
): string {
  const parts: string[] = [csvRow(header, opts)]
  for (const row of rows) parts.push(csvRow(row, opts))
  return parts.join("\r\n") + "\r\n"
}
