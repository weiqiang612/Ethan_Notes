param(
    [string]$TaskName = "CodexResidualNodeMonitor"
)

$ErrorActionPreference = "Stop"

if (Get-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run" -Name $TaskName -ErrorAction SilentlyContinue) {
    Remove-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run" -Name $TaskName
    Get-CimInstance Win32_Process -ErrorAction SilentlyContinue |
        Where-Object { $_.CommandLine -like '*CodexResidualMonitor.ps1*' } |
        ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
    Write-Host "Autorun removed and monitor stopped: $TaskName"
} else {
    Write-Host "Autorun entry not found: $TaskName"
}
