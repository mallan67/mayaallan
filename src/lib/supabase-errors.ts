/**
 * PostgREST error classification shared by pages that look a row up with
 * `.single()`. PGRST116 means "zero (or multiple) rows" — for a slug lookup
 * that is a normal 404, not a database failure, and must not be logged as an
 * application error. Dependency-free.
 */
export function isNoRowsError(error: { code?: string | null } | null | undefined): boolean {
  return error?.code === "PGRST116"
}
