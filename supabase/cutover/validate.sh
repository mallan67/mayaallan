#!/usr/bin/env bash
# =============================================================================
# Reproducible, NON-DESTRUCTIVE validation of cutover.sql + rollback.sql.
# =============================================================================
# Both SQL files contain their own BEGIN/COMMIT. This harness NEUTRALIZES those
# embedded transaction boundaries (strips the outer `begin;` / `commit;` lines),
# then applies the cutover body followed by the rollback body inside ONE outer
# transaction that is ALWAYS rolled back. No intermediate state is ever
# committed. It then re-reads the live catalog to prove production is unchanged.
#
# A throwaway least-privileged `mayaallan_app` role (LOGIN, no attributes, no
# password) is created inside the same rolled-back transaction so the cutover's
# runtime-role precondition passes; it vanishes on rollback.
#
# Usage:
#   SUPABASE_DATABASE_URL='postgres://...' ./supabase/cutover/validate.sh
#   ./supabase/cutover/validate.sh 'postgres://...'
# The connection string is read from the environment/argument at runtime and is
# NEVER stored in this file. Use a privileged connection (able to CREATE ROLE and
# ALTER schemas) — e.g. the direct (non-pooling) session string.
# =============================================================================
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PGURL="${1:-${SUPABASE_DATABASE_URL:-${POSTGRES_URL_NON_POOLING:-}}}"
if [ -z "${PGURL}" ]; then
  echo "ERROR: provide the connection string via SUPABASE_DATABASE_URL, POSTGRES_URL_NON_POOLING, or arg 1" >&2
  exit 2
fi
export PGCONNECT_TIMEOUT=20

BEFORE="$(psql "${PGURL}" -tAc "select count(*) from pg_tables where schemaname='public'")"
BEFORE_APP="$(psql "${PGURL}" -tAc "select exists(select 1 from information_schema.schemata where schema_name='app_private')")"

# Build one script: outer begin; throwaway role; cutover body; rollback body;
# rollback. Written to a temp file (NOT a heredoc) so the $$ / $function$ dollar
# quoting in the SQL bodies is passed through verbatim.
TMP="$(mktemp)"
trap 'rm -f "${TMP}"' EXIT
{
  echo "begin;"
  echo "do \$do\$ begin if not exists (select 1 from pg_roles where rolname='mayaallan_app') then create role mayaallan_app login; end if; end \$do\$;"
  echo "\\echo === applying cutover.sql (transaction boundaries stripped) ==="
  sed '/^begin;$/d; /^commit;$/d' "${DIR}/cutover.sql"
  echo "\\echo === applying rollback.sql (transaction boundaries stripped) ==="
  sed '/^begin;$/d; /^commit;$/d' "${DIR}/rollback.sql"
  echo "\\echo === discarding the entire outer transaction ==="
  echo "rollback;"
} > "${TMP}"

echo "=== running cutover + rollback inside one rolled-back transaction ==="
psql "${PGURL}" -v ON_ERROR_STOP=1 -f "${TMP}" \
  | grep -iE "PASSED|NOTICE|ROLLBACK|ERROR|exception" || true

AFTER="$(psql "${PGURL}" -tAc "select count(*) from pg_tables where schemaname='public'")"
AFTER_APP="$(psql "${PGURL}" -tAc "select exists(select 1 from information_schema.schemata where schema_name='app_private')")"

echo "=== production state: public tables before=${BEFORE} after=${AFTER}; app_private before=${BEFORE_APP} after=${AFTER_APP} ==="
if [ "${BEFORE}" = "${AFTER}" ] && [ "${AFTER}" = "15" ] && [ "${AFTER_APP}" = "f" ]; then
  echo "VALIDATION OK: cutover + rollback assertions passed; production UNCHANGED (15 tables in public, app_private absent)."
else
  echo "VALIDATION FAILED: production state changed unexpectedly!" >&2
  exit 1
fi
