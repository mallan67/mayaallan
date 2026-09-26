# mayaallan — ops session bootstrap (canonical; read LIVE at the start of every session)

Scope: **mayaallan.com only** — GitHub `mallan67/mayaallan`; Vercel project `mayaallan`
(`prj_CkwsvLxnWkKGJlyAA93lRVxAOQ9Y`, team `team_kZQh5NYLyrOKqffK0r9EXf4E`). Not Mallan.
The local folder `%USERPROFILE%\mayaallan-ops` only points here; it holds no project data.

## 1. Read live, in this order — report each item with its source and UTC read time
1. `gh api repos/mallan67/mayaallan/git/ref/heads/main` → current main SHA.
2. The continuous handoff `docs/operations/MAYAALLAN-CONTINUOUS-HANDOFF.md` — from `main` if present;
   otherwise from the head branch of the open PR titled `docs(ops): continuous handoff…`
   (`gh api "repos/mallan67/mayaallan/pulls?state=open"`). The handoff holds the current goals,
   priorities, confirmed facts, in-progress work, the Not-done list and the log.
3. Open PRs (age, `mergeable_state`, checks) and open issues.
4. Latest GitHub Actions runs (Health check, Quality gates, Deploy notify, and the site doctor once it exists).
5. Vercel: latest production deployment and state; runtime errors (last 24 h); Web Analytics status.
6. Live site: `GET https://www.mayaallan.com/api/health` (shallow).

Only after reporting these may work begin. Priorities come from the live handoff — never from this file,
a local file, an old handoff or memory.

## 2. Rules
- **Live sources only.** Anything not re-read live is UNVERIFIED. Never fill gaps from memory or files.
- **No local state.** Nothing is written to or read from local folders, scratch or temp files. No `git clone`,
  no `git init`, no worktrees. (Note: `jq` is not installed; use `node` for JSON in pipes.)
- **Changes go through GitHub:** fetch the live file at push time → edit in memory → Git Data API commit on a
  work branch → non-force ref update (branch-SHA guard; retry on race) → live compare shows only the intended
  paths → PR → the owner merges.
- **Continuous handoff:** every milestone updates the handoff on GitHub (Last updated, Confirmed live,
  In progress, Not done, append-only Log).
- **Read-only against the live site** unless the owner approves the specific action (form submissions,
  purchases, AI-tool use, Vercel settings, merges).
- Every report names the live source and when it was read, and lists what is not done.

## 3. Where things live (git)
| What | Path |
|---|---|
| Continuous handoff | `docs/operations/MAYAALLAN-CONTINUOUS-HANDOFF.md` |
| Live audit evidence | `docs/operations/evidence/<date>/` |
| Growth research, lead plan, pioneer playbook | `docs/operations/growth/<date>/` |
| Always-on ops + analytics blueprint | `docs/operations/monitoring/<date>/` |
| This bootstrap | `docs/operations/OPS-SESSION-BOOTSTRAP.md` |
| Local ops folder setup (run by the owner) | `docs/operations/setup-mayaallan-ops.ps1` |
