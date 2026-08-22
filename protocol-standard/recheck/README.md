# 5am re-check (local scheduled task)

A one-time Windows Scheduled Task that, at the next 5:00 AM (machine local time), runs Claude
Code headless to re-check this project against the Todo, list what's left / what to optimize,
reference the GitHub projects, and prepend its findings to `docs/STATUS.md`.

Why local (not cloud): a cloud routine cannot see this local repo (`D:\...`), there is no
Google Drive connector attached, and the project is not a git repo — so the check must run
locally.

## Install (run once)

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File "D:\大学\暑研\7-31 protocol library\protocol-standard\recheck\install-5am-task.ps1"
```

No admin needed (registers under the current user). Requires the `claude` CLI on PATH.

## Files
- `recheck-prompt.txt` — the instructions given to the 5am run (safe under acceptEdits: only Read/Write/Edit, no shell/web).
- `run-recheck.ps1` — the runner the task invokes; logs to `last-run.log`.
- `install-5am-task.ps1` — registers the task at the next 5:00 AM.

## Check / run now / remove

```powershell
Get-ScheduledTask -TaskName 'LabRecordProtocol5amRecheck'        # verify it exists
Start-ScheduledTask -TaskName 'LabRecordProtocol5amRecheck'      # test it immediately
Unregister-ScheduledTask -TaskName 'LabRecordProtocol5amRecheck' -Confirm:$false   # remove
```

## Notes / caveats
- The run uses `--permission-mode acceptEdits`, so it will Read files and Write/Edit `docs/STATUS.md`
  without prompting, but will NOT run shell (`node validate.mjs`) or web tools. To let it run those
  too, change `acceptEdits` to `bypassPermissions` in `run-recheck.ps1` (less safe — full autonomy).
- It fires once. To make it recurring, re-run the installer (or switch the trigger to `-Daily`).
- Output/errors are captured in `protocol-standard/recheck/last-run.log`.
