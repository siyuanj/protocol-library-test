# Runs the 5am LabRecord Protocol Library re-check via Claude Code (headless, acceptEdits).
# Invoked by the scheduled task created by install-5am-task.ps1.
$ErrorActionPreference = 'Continue'
$proj = 'D:\大学\暑研\7-31 protocol library'
Set-Location $proj
$promptPath = Join-Path $proj 'protocol-standard\recheck\recheck-prompt.txt'
$log        = Join-Path $proj 'protocol-standard\recheck\last-run.log'
$prompt = Get-Content -Raw -Encoding UTF8 $promptPath

"[recheck start $(Get-Date -Format o)]" | Out-File -FilePath $log -Encoding utf8

# Requires the `claude` CLI on PATH for the user running the task.
# acceptEdits lets it Read/Write/Edit files without prompting; it will not run shell/web tools.
claude -p --permission-mode acceptEdits $prompt *>&1 | Tee-Object -FilePath $log -Append

"[recheck end $(Get-Date -Format o)]" | Out-File -FilePath $log -Append -Encoding utf8
