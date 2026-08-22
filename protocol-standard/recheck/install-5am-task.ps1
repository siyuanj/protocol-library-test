# Installs a one-time Windows Scheduled Task that runs the 5am re-check at the NEXT 5:00 AM
# (machine local time). Runs as the current user — no admin required. Run this ONCE:
#   powershell -NoProfile -ExecutionPolicy Bypass -File "D:\大学\暑研\7-31 protocol library\protocol-standard\recheck\install-5am-task.ps1"
$proj = 'D:\大学\暑研\7-31 protocol library'
$ps1  = Join-Path $proj 'protocol-standard\recheck\run-recheck.ps1'

$action = New-ScheduledTaskAction -Execute 'powershell.exe' `
  -Argument ('-NoProfile -ExecutionPolicy Bypass -File "{0}"' -f $ps1)

# Next 5:00 AM (today if still in the future, otherwise tomorrow).
$at = (Get-Date).Date.AddHours(5)
if ($at -le (Get-Date)) { $at = $at.AddDays(1) }
$trigger = New-ScheduledTaskTrigger -Once -At $at

$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -WakeToRun

Register-ScheduledTask -TaskName 'LabRecordProtocol5amRecheck' `
  -Action $action -Trigger $trigger -Settings $settings `
  -Description 'One-time 5am re-check of the LabRecord Protocol Library' -Force

Write-Host ("Scheduled 'LabRecordProtocol5amRecheck' for {0}" -f $at)
Write-Host "Remove later with:  Unregister-ScheduledTask -TaskName 'LabRecordProtocol5amRecheck' -Confirm:`$false"
