# setup-mayaallan-ops.ps1
# Creates the live-only ops folder for mayaallan.com and PowerShell shortcuts.
# Run it yourself in PowerShell after reviewing it on GitHub. Safe to re-run (idempotent).
#   - Creates  $HOME\mayaallan-ops  (NOT a git repo) with a CLAUDE.md that only points to the live
#     bootstrap on GitHub. No project data is stored locally.
#   - Adds a marked block to your PowerShell profile:
#       * a new PowerShell window that opens in your home folder lands in mayaallan-ops automatically
#       * "mayaallan" jumps to mayaallan-ops, "mallan" jumps to mallan-ops
#     Windows opened in a specific folder (for example VS Code terminals) stay where they are.
#   - Removes the old local checkout Desktopmayaallan, only if every local commit is already on GitHub.
#     Run this AFTER closing any Claude Code / VS Code session that is using that folder.
#   - Changes nothing else. Delete the profile block between the markers to undo it.

$ErrorActionPreference = "Stop"
$Ops = Join-Path $HOME "mayaallan-ops"
New-Item -ItemType Directory -Force -Path $Ops | Out-Null

$ClaudeMd = @"
# mayaallan-ops - live-only operating folder (mayaallan.com)

This folder is NOT a repository and holds NO project data. Nothing in it is a source of truth.

At the start of EVERY session, before any other work:
1. Read the canonical operating instructions LIVE from GitHub and follow them:
   gh api "repos/mallan67/mayaallan/contents/docs/operations/OPS-SESSION-BOOTSTRAP.md" -H "Accept: application/vnd.github.raw"
   If that returns 404 (not merged to main yet), read it from the open handoff PR branch:
   gh api "repos/mallan67/mayaallan/contents/docs/operations/OPS-SESSION-BOOTSTRAP.md?ref=work/site-visibility" -H "Accept: application/vnd.github.raw"
2. Report what you read (source + UTC time) before doing anything else.

Never clone, git-init or create worktrees here. Never treat local files, scratch files, old handoffs or memory as truth.
"@
Set-Content -Path (Join-Path $Ops "CLAUDE.md") -Value $ClaudeMd -Encoding UTF8

$Begin = "# >>> mayaallan-ops >>>"
$End   = "# <<< mayaallan-ops <<<"
$Lines = @(
  $Begin,
  '$MayaAllanOps = Join-Path $HOME "mayaallan-ops"',
  '$MallanOps    = Join-Path $HOME "mallan-ops"',
  'function mayaallan { Set-Location $MayaAllanOps }',
  'function mallan    { if (Test-Path $MallanOps) { Set-Location $MallanOps } else { Write-Warning "Not found: $MallanOps" } }',
  'if ((Get-Location).Path -eq $HOME -and (Test-Path $MayaAllanOps)) {',
  '    Set-Location $MayaAllanOps',
  '    Write-Host "mayaallan-ops (live-only). Type: claude   |   mallan = Mallan ops" -ForegroundColor Cyan',
  '}',
  $End
)
$Block = $Lines -join "`r`n"

if (-not (Test-Path $PROFILE)) { New-Item -ItemType File -Force -Path $PROFILE | Out-Null }
$Current = Get-Content -Raw -Path $PROFILE -ErrorAction SilentlyContinue
if ($null -eq $Current) { $Current = "" }
$Pattern = [regex]::Escape($Begin) + "[\s\S]*?" + [regex]::Escape($End)
if ($Current -match $Pattern) {
    $New = [regex]::Replace($Current, $Pattern, [System.Text.RegularExpressions.MatchEvaluator] { param($m) $Block })
} else {
    $New = ($Current.TrimEnd() + "`r`n`r`n" + $Block + "`r`n").TrimStart()
}
Set-Content -Path $PROFILE -Value $New -Encoding UTF8

# --- Remove the old local checkout (owner request 2026-09-24): everything is read directly from the repo ---
$OldCheckout = Join-Path $HOME "Desktop\mayaallan"
if (Test-Path $OldCheckout) {
    if ((Get-Location).Path -like "$OldCheckout*") { Set-Location $HOME }
    $Unpushed = $null
    if (Test-Path (Join-Path $OldCheckout ".git")) {
        git -C $OldCheckout fetch --quiet origin 2>$null
        $Unpushed = git -C $OldCheckout log --branches --not --remotes --oneline 2>$null
    }
    if ($Unpushed) {
        Write-Warning "NOT removing $OldCheckout - these local commits are not on GitHub:"
        $Unpushed | ForEach-Object { Write-Warning "  $_" }
    } else {
        try {
            Remove-Item -Recurse -Force $OldCheckout -ErrorAction Stop
            Write-Host "Removed old local checkout: $OldCheckout" -ForegroundColor Green
        } catch {
            Write-Warning "Could not remove $OldCheckout (a program is still using it). Close Claude Code, VS Code and any terminal opened there, then run this script again."
        }
    }
}
$Policy = Get-ExecutionPolicy
Write-Host "Ops folder : $Ops"
Write-Host "Profile    : $PROFILE"
if ($Policy -in @("Restricted", "AllSigned")) {
    Write-Warning "Execution policy is $Policy, so PowerShell will not load your profile. To allow it for your user only, run:  Set-ExecutionPolicy -Scope CurrentUser RemoteSigned"
}
Write-Host "Done. Open a NEW PowerShell window to use it." -ForegroundColor Green