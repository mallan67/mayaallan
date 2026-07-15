#!/usr/bin/env bash
# =============================================================================
# Reproducible, NON-DESTRUCTIVE validation of cutover.sql + rollback.sql.
# =============================================================================
# Both SQL files contain their own BEGIN/COMMIT. This harness NEUTRALIZES those
# embedded boundaries (strips the outer `begin;`/`commit;` lines) and applies the
# cutover body then the rollback body inside ONE outer transaction that is ALWAYS
# rolled back — no intermediate state is ever committed.
#
# Failure handling (must not be maskable):
#   * psql runs with ON_ERROR_STOP=1, stdout+stderr captured to a log file, and
#     its EXACT exit status recorded. NO `|| true` on the psql execution path.
#   * A nonzero psql exit prints the log and fails immediately.
#   * Only after psql succeeds is the log filtered, and success additionally
#     REQUIRES exactly one "CUTOVER FINAL ASSERTIONS: ALL PASSED" and exactly one
#     "ROLLBACK FINAL ASSERTIONS: ALL PASSED", plus production unchanged.
#
# Connection: uses an ADMIN-ONLY string (must be able to CREATE ROLE + move
# schemas). It deliberately does NOT read the least-privileged runtime
# SUPABASE_DATABASE_URL. Provide via SUPABASE_ADMIN_DATABASE_URL or arg 1. The
# value is read at runtime and never stored in this file.
# =============================================================================
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PGURL="${1:-${SUPABASE_ADMIN_DATABASE_URL:-}}"
if [ -z "${PGURL}" ]; then
  echo "ERROR: provide an ADMIN connection via SUPABASE_ADMIN_DATABASE_URL or arg 1" >&2
  echo "       (NOT the least-privileged runtime SUPABASE_DATABASE_URL)." >&2
  exit 2
fi
export PGCONNECT_TIMEOUT=20

BEFORE="$(psql "${PGURL}" -tAc "select count(*) from pg_tables where schemaname='public'")"
BEFORE_APP="$(psql "${PGURL}" -tAc "select exists(select 1 from information_schema.schemata where schema_name='app_private')")"

# Refuse to run if app_private already exists — the round trip drops it at
# rollback, so a pre-existing schema could be deleted and the harness could still
# report "unchanged". Require a clean starting state (BEFORE_APP = f).
if [ "${BEFORE_APP}" != "f" ]; then
  echo "REFUSING: app_private already exists. Run this harness only against a database with NO app_private schema." >&2
  exit 2
fi

TMP="$(mktemp)"; LOG="$(mktemp)"
trap 'rm -f "${TMP}" "${LOG}"' EXIT
{
  echo "begin;"
  # Throwaway least-privileged runtime role so the cutover precondition passes;
  # LOGIN, no attributes, no password. Rolled back with everything else.
  echo "do \$do\$ begin if not exists (select 1 from pg_roles where rolname='mayaallan_app') then create role mayaallan_app login; end if; end \$do\$;"
  echo "\\echo === applying cutover.sql (transaction boundaries stripped) ==="
  sed '/^begin;$/d; /^commit;$/d' "${DIR}/cutover.sql"
  echo "\\echo === applying rollback.sql (transaction boundaries stripped) ==="
  sed '/^begin;$/d; /^commit;$/d' "${DIR}/rollback.sql"
  echo "\\echo === discarding the entire outer transaction ==="
  echo "rollback;"
} > "${TMP}"

echo "=== running cutover + rollback inside one rolled-back transaction ==="
# Capture exit status separately; NO '|| true' here.
set +e
psql "${PGURL}" -v ON_ERROR_STOP=1 -f "${TMP}" > "${LOG}" 2>&1
PSQL_EXIT=$?
set -e

echo "psql_exit=${PSQL_EXIT}"
if [ "${PSQL_EXIT}" -ne 0 ]; then
  echo "VALIDATION FAILED: psql exited ${PSQL_EXIT}. Full log below:" >&2
  cat "${LOG}" >&2
  exit 1
fi

# psql succeeded — filter the log (|| true here is on grep, not the psql path).
CUT_OK="$(grep -c 'CUTOVER FINAL ASSERTIONS: ALL PASSED' "${LOG}" || true)"
RB_OK="$(grep -c 'ROLLBACK FINAL ASSERTIONS: ALL PASSED' "${LOG}" || true)"
grep -iE "PASSED|ROLLBACK|NOTICE" "${LOG}" || true

AFTER="$(psql "${PGURL}" -tAc "select count(*) from pg_tables where schemaname='public'")"
AFTER_APP="$(psql "${PGURL}" -tAc "select exists(select 1 from information_schema.schemata where schema_name='app_private')")"
echo "markers: cutover_passed=${CUT_OK} rollback_passed=${RB_OK}"
echo "production: public_tables before=${BEFORE} after=${AFTER}; app_private before=${BEFORE_APP} after=${AFTER_APP}"

if [ "${CUT_OK}" = "1" ] && [ "${RB_OK}" = "1" ] \
   && [ "${BEFORE}" = "${AFTER}" ] && [ "${AFTER_APP}" = "${BEFORE_APP}" ] \
   && [ "${AFTER}" = "15" ] && [ "${AFTER_APP}" = "f" ]; then
  echo "VALIDATION OK: psql_exit=0, exactly one CUTOVER + one ROLLBACK marker, production UNCHANGED."
  exit 0
else
  echo "VALIDATION FAILED: markers or production state not as expected." >&2
  cat "${LOG}" >&2
  exit 1
fi
