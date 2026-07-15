#!/usr/bin/env bash
# =============================================================================
# OPERATOR SCRIPT — live, NON-DESTRUCTIVE validation of the supabase/cutover
# migration. YOU run this in YOUR shell on YOUR private machine.
# =============================================================================
# CREDENTIAL HANDLING — HONEST DESCRIPTION (this script is NOT "credential-free"):
#   * It reads the admin connection ONLY from the environment variable
#     SUPABASE_ADMIN_DATABASE_URL (admin, NON-POOLING / direct 5432).
#   * It passes that value to `psql` as a QUOTED CONNECTION ARGUMENT. While a
#     psql process runs, that argument (which embeds the password) is briefly
#     visible in the LOCAL process list (ps / Task Manager / Process Explorer).
#     For this one-time validation on Maya's private computer that transient,
#     local-only exposure is ACCEPTED. Do NOT run this on a shared machine.
#   * The URL is NEVER printed, echoed, serialized, written to a temp file, or
#     written to the transcript. Raw psql/harness output is captured to PRIVATE
#     temporary logs only (0600, outside the repo) and is NEVER surfaced to the
#     terminal or the transcript, so a connection error cannot leak host/db/user.
#
# WHAT IT DOES — all inside transactions that are ALWAYS rolled back:
#   1. precondition gate: var set; the four migration files match pinned SHA-256;
#      this operator script is a tracked, unmodified file (self-authentication);
#      public has 15 tables; app_private absent;
#   2. NEGATIVE test against a TEMPORARY injected copy of cutover.sql (tracked
#      file untouched) — proving a failed assertion cannot be masked;
#   3. the real cutover -> rollback round trip via validate.sh;
#   4. prepare-runtime-role.sql inside an always-rolled-back transaction.
#
# Sanitized results -> supabase/cutover/validation-transcript-current.txt.
# It does NOT commit, push, deploy, create/modify the real runtime role, run the
# permanent cutover, or change Supabase "Exposed schemas".
#
# Run:  bash supabase/cutover/run-live-validation.sh
# =============================================================================
set -euo pipefail
# Disable any inherited xtrace BEFORE the credential is ever referenced, so the
# URL can never be echoed by a trace stream.
set +x
unset BASH_XTRACEFD 2>/dev/null || true
umask 077

# --- pinned SHA-256 of the migration files this validation drives -------------
# (authenticates the exact SQL content; these are the committed files at the
# reviewed commit. This operator script authenticates ITSELF via git tracking +
# a clean working tree, and prints its own sha256 below for GitHub comparison.)
EXPECTED_CUTOVER_SHA256="19a967f4537b77c81374f50916265877d1b6f635a2bf219fa286f10ead28b6c0"
EXPECTED_ROLLBACK_SHA256="b9e6e4c3dfaeb19f3e0eae3053621e08a717122adbfd2a650c34e3223be82450"
EXPECTED_PREPARE_SHA256="2d6cbb2090c1f32e297071d58836b852f6771e49d046e9a82e50a2748c347b22"
EXPECTED_VALIDATE_SHA256="6bd4d9f839dad3b0d672eb8e275d2e64f61a6f930ba1a47754380ef096f550f8"

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "${DIR}/../.." && pwd)"
TRANSCRIPT="${DIR}/validation-transcript-current.txt"
SELF_REL="supabase/cutover/run-live-validation.sh"

# --- temp workspace + full signal-aware cleanup (all temp SQL/logs OUTSIDE repo)
TMP_ROOT="$(mktemp -d)"
NEGDIR="${TMP_ROOT}/neg"
LOG_NEG="${TMP_ROOT}/neg.log"
LOG_POS="${TMP_ROOT}/pos.log"
PREP_BUNDLE="${TMP_ROOT}/prepare-bundle.sql"
LOG_PREP="${TMP_ROOT}/prepare.log"
cleanup() {
  local status=$?
  trap - EXIT INT TERM
  rm -rf -- "${TMP_ROOT:-}"
  exit "$status"
}
trap cleanup EXIT INT TERM

die() { echo "ABORT: $*" >&2; exit 2; }
sha256_of() { sha256sum "$1" | cut -d' ' -f1; }
verify_sha() {
  local path="$1" expected="$2" actual
  actual="$(sha256_of "${path}")"
  [ "${actual}" = "${expected}" ] \
    || die "SHA-256 mismatch for ${path}: got ${actual}, expected ${expected}."
}

# psql helper — the URL is ONLY ever the first quoted argument, never printed.
psql_scalar() { psql "${SUPABASE_ADMIN_DATABASE_URL}" -tAqc "$1"; }

# --- 1) PRECONDITION GATE -----------------------------------------------------
[ -n "${SUPABASE_ADMIN_DATABASE_URL:-}" ] || die "SUPABASE_ADMIN_DATABASE_URL is not set or empty."
export PGCONNECT_TIMEOUT=20

# Authenticate the migration files this run drives (exact content pin).
verify_sha "${DIR}/cutover.sql"              "${EXPECTED_CUTOVER_SHA256}"
verify_sha "${DIR}/rollback.sql"             "${EXPECTED_ROLLBACK_SHA256}"
verify_sha "${DIR}/prepare-runtime-role.sql" "${EXPECTED_PREPARE_SHA256}"
verify_sha "${DIR}/validate.sh"              "${EXPECTED_VALIDATE_SHA256}"

# Authenticate THIS operator script: it must be tracked with NO working-tree
# modification, so the running copy is exactly the committed / reviewed one.
git -C "${ROOT}" ls-files --error-unmatch "${SELF_REL}" >/dev/null 2>&1 \
  || die "operator script is not tracked in git — commit it first so it can be authenticated."
[ -z "$(git -C "${ROOT}" status --porcelain --untracked-files=no)" ] \
  || die "tracked files are modified — refuse to run with an unverified working tree."
SELF_SHA="$(sha256_of "${BASH_SOURCE[0]}")"
HEAD_SHA="$(git -C "${ROOT}" rev-parse HEAD)"
BRANCH="$(git -C "${ROOT}" rev-parse --abbrev-ref HEAD)"

BEFORE_TABLES="$(psql_scalar "select count(*) from pg_tables where schemaname='public'")"
BEFORE_APP="$(psql_scalar "select exists(select 1 from information_schema.schemata where schema_name='app_private')")"
[ "${BEFORE_APP}" = "f" ] || die "app_private already exists before validation (=${BEFORE_APP})."
[ "${BEFORE_TABLES}" = "15" ] || die "expected exactly 15 public tables before validation, found ${BEFORE_TABLES}."

STAMP="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo "operator script sha256: ${SELF_SHA}  (match this against the file on GitHub)"
echo "HEAD ${HEAD_SHA} on ${BRANCH}; migration SHA-256 verified; public=15; app_private absent."
echo "Running validation (all work is rolled back; production is never modified)..."

# --- 2) NEGATIVE TEST — temporary injected copy of cutover.sql ----------------
# Isolated harness dir: real validate.sh + rollback.sql + an injected cutover.sql
# that raises before its success NOTICE. The tracked file is NOT modified.
mkdir -p "${NEGDIR}"
cp "${DIR}/validate.sh"   "${NEGDIR}/validate.sh"
cp "${DIR}/rollback.sql"  "${NEGDIR}/rollback.sql"
sed "s|raise notice 'CUTOVER FINAL ASSERTIONS: ALL PASSED';|raise exception 'INTENTIONAL NEGATIVE TEST — harness self-check'; raise notice 'CUTOVER FINAL ASSERTIONS: ALL PASSED';|" \
  "${DIR}/cutover.sql" > "${NEGDIR}/cutover.sql"
grep -q 'INTENTIONAL NEGATIVE TEST' "${NEGDIR}/cutover.sql" \
  || die "negative injection did not apply (cutover success-marker text drifted) — refusing a meaningless negative test."

set +e
bash "${NEGDIR}/validate.sh" >"${LOG_NEG}" 2>&1
NEG_HARNESS_EXIT=$?
set -e
NEG_PSQL_EXIT="$( { grep -oE 'psql_exit=[0-9]+' "${LOG_NEG}" || true; } | head -1 | cut -d= -f2)"
NEG_PSQL_EXIT="${NEG_PSQL_EXIT:-<none>}"
NEG_CUT_MARKER="$(grep -c 'CUTOVER FINAL ASSERTIONS: ALL PASSED' "${LOG_NEG}" || true)"

# production must be untouched by the (rolled-back) negative run
NEG_AFTER_TABLES="$(psql_scalar "select count(*) from pg_tables where schemaname='public'")"
NEG_AFTER_APP="$(psql_scalar "select exists(select 1 from information_schema.schemata where schema_name='app_private')")"

NEG_OK="no"
if [ "${NEG_HARNESS_EXIT}" = "1" ] && [ "${NEG_PSQL_EXIT}" != "0" ] && [ "${NEG_PSQL_EXIT}" != "<none>" ] \
   && [ "${NEG_CUT_MARKER}" = "0" ] \
   && [ "${NEG_AFTER_TABLES}" = "${BEFORE_TABLES}" ] && [ "${NEG_AFTER_APP}" = "${BEFORE_APP}" ]; then
  NEG_OK="yes"
fi

# --- 3) POSITIVE ROUND TRIP — real validate.sh (tracked cutover + rollback) ---
set +e
bash "${DIR}/validate.sh" >"${LOG_POS}" 2>&1
POS_HARNESS_EXIT=$?
set -e
POS_PSQL_EXIT="$( { grep -oE 'psql_exit=[0-9]+' "${LOG_POS}" || true; } | head -1 | cut -d= -f2)"
POS_PSQL_EXIT="${POS_PSQL_EXIT:-<none>}"
POS_CUT_MARKER="$(grep -c 'CUTOVER FINAL ASSERTIONS: ALL PASSED' "${LOG_POS}" || true)"
POS_RB_MARKER="$(grep -c 'ROLLBACK FINAL ASSERTIONS: ALL PASSED' "${LOG_POS}" || true)"

POS_AFTER_TABLES="$(psql_scalar "select count(*) from pg_tables where schemaname='public'")"
POS_AFTER_APP="$(psql_scalar "select exists(select 1 from information_schema.schemata where schema_name='app_private')")"

POS_OK="no"
if [ "${POS_HARNESS_EXIT}" = "0" ] && [ "${POS_PSQL_EXIT}" = "0" ] \
   && [ "${POS_CUT_MARKER}" = "1" ] && [ "${POS_RB_MARKER}" = "1" ] \
   && [ "${POS_AFTER_TABLES}" = "15" ] && [ "${POS_AFTER_APP}" = "f" ]; then
  POS_OK="yes"
fi

# --- 4) prepare-runtime-role.sql inside an always-rolled-back transaction -----
# Wrap prepare's body (boundaries stripped) in begin;...rollback;. Create a
# throwaway least-privileged mayaallan_app ONLY if the role does not already
# exist; the rollback discards it (and every grant) so nothing persists.
{
  echo "begin;"
  echo "do \$do\$ begin if not exists (select 1 from pg_roles where rolname='mayaallan_app') then create role mayaallan_app login; end if; end \$do\$;"
  sed '/^begin;$/d; /^commit;$/d' "${DIR}/prepare-runtime-role.sql"
  echo "rollback;"
} > "${PREP_BUNDLE}"

ROLE_BEFORE="$(psql_scalar "select exists(select 1 from pg_roles where rolname='mayaallan_app')")"
set +e
psql "${SUPABASE_ADMIN_DATABASE_URL}" -v ON_ERROR_STOP=1 -f "${PREP_BUNDLE}" >"${LOG_PREP}" 2>&1
PREP_PSQL_EXIT=$?
set -e
PREP_MARKER="$(
  grep -c 'PREPARE-RUNTIME-ROLE FINAL ASSERTIONS: ALL PASSED' \
    "${LOG_PREP}" || true
)"
ROLE_AFTER="$(psql_scalar "select exists(select 1 from pg_roles where rolname='mayaallan_app')")"
PREP_AFTER_TABLES="$(psql_scalar "select count(*) from pg_tables where schemaname='public'")"
PREP_AFTER_APP="$(psql_scalar "select exists(select 1 from information_schema.schemata where schema_name='app_private')")"

PREP_OK="no"
if [ "${PREP_PSQL_EXIT}" = "0" ] && [ "${PREP_MARKER}" = "1" ] \
   && [ "${ROLE_AFTER}" = "${ROLE_BEFORE}" ] \
   && [ "${PREP_AFTER_TABLES}" = "15" ] && [ "${PREP_AFTER_APP}" = "f" ]; then
  PREP_OK="yes"
fi

# --- overall verdict ----------------------------------------------------------
OVERALL="FAILED"
if [ "${NEG_OK}" = "yes" ] && [ "${POS_OK}" = "yes" ] && [ "${PREP_OK}" = "yes" ]; then
  OVERALL="PASSED"
fi

# --- 5) SANITIZED TRANSCRIPT (no URL / user / password / host / port / db) ----
# Only computed scalars, marker COUNTS, and fixed strings are written below.
# No raw psql output or connection string is ever emitted here.
{
  echo "LIVE VALIDATION TRANSCRIPT — supabase/cutover (non-destructive, rolled back)"
  echo "Result:            ${OVERALL}"
  echo "Branch:            ${BRANCH}"
  echo "HEAD at run:       ${HEAD_SHA}"
  echo "Operator sha256:   ${SELF_SHA}"
  echo "UTC time:          ${STAMP}"
  echo "Command:           SUPABASE_ADMIN_DATABASE_URL=<admin connection> bash supabase/cutover/run-live-validation.sh"
  echo "Credential note:   URL read from environment ONLY and passed only as a quoted psql"
  echo "                   argument (transient local process-list exposure accepted for a"
  echo "                   private machine). Never printed, logged, or stored. This transcript"
  echo "                   contains no URL, username, password, hostname, port, database name,"
  echo "                   project reference, or connection parameters."
  echo "Migration SHA-256: cutover/rollback/prepare/validate verified against pinned values."
  echo ""
  echo "Production baseline (before any step): public_tables=${BEFORE_TABLES}, app_private_exists=${BEFORE_APP}"
  echo ""
  echo "--- (2) NEGATIVE TEST — injected temporary cutover copy (tracked file untouched) ---"
  echo "outcome:            ${NEG_OK}"
  echo "harness_exit:       ${NEG_HARNESS_EXIT}    (require 1)"
  echo "psql_exit:          ${NEG_PSQL_EXIT}    (require nonzero)"
  echo "cutover_marker:     ${NEG_CUT_MARKER}    (require 0 — success marker must NOT be accepted)"
  echo "production after:   public_tables=${NEG_AFTER_TABLES}, app_private_exists=${NEG_AFTER_APP}  (require unchanged)"
  echo ""
  echo "--- (3) SUCCESSFUL cutover -> rollback round trip (validate.sh) ---"
  echo "outcome:            ${POS_OK}"
  echo "harness_exit:       ${POS_HARNESS_EXIT}    (require 0)"
  echo "psql_exit:          ${POS_PSQL_EXIT}    (require 0)"
  echo "cutover_marker:     ${POS_CUT_MARKER}    (require exactly 1)"
  echo "rollback_marker:    ${POS_RB_MARKER}    (require exactly 1)"
  echo "production after:   public_tables=${POS_AFTER_TABLES}, app_private_exists=${POS_AFTER_APP}  (require 15 / f)"
  echo ""
  echo "--- (4) prepare-runtime-role.sql inside an always-rolled-back transaction ---"
  echo "outcome:            ${PREP_OK}"
  echo "psql_exit:          ${PREP_PSQL_EXIT}    (require 0)"
  echo "prepare_marker:     ${PREP_MARKER}    (require exactly 1)"
  echo "role existed before/after: ${ROLE_BEFORE}/${ROLE_AFTER}  (require unchanged — no residual role)"
  echo "production after:   public_tables=${PREP_AFTER_TABLES}, app_private_exists=${PREP_AFTER_APP}  (require 15 / f)"
  echo ""
  echo "All work ran inside transactions that were ALWAYS rolled back; production was"
  echo "never modified. No commit, push, deploy, real-role change, permanent cutover,"
  echo "or Exposed-schemas change was performed."
} > "${TRANSCRIPT}"

echo "Wrote sanitized transcript: ${TRANSCRIPT}"
echo "OVERALL: ${OVERALL}  (negative=${NEG_OK} positive=${POS_OK} prepare=${PREP_OK})"
[ "${OVERALL}" = "PASSED" ] && exit 0 || exit 1
