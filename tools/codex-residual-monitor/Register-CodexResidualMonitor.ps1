param(
    [string]$TaskName = "CodexResidualNodeMonitor"
)

$ErrorActionPreference = "Stop"

$runKeyPath = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run"
$valueName = $TaskName
$launcherPath = "C:\scripts\codex-residual-monitor\LaunchHidden.vbs"

if (Get-ItemProperty -Path $runKeyPath -Name $valueName -ErrorAction SilentlyContinue) {
    Set-ItemProperty -Path $runKeyPath -Name $valueName -Value "`"$launcherPath`""
} else {
    New-ItemProperty -Path $runKeyPath -Name $valueName -Value "`"$launcherPath`"" -PropertyType String | Out-Null
}

Start-Process -WindowStyle Hidden -FilePath "C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe" -ArgumentList "-NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File `"C:\scripts\codex-residual-monitor\CodexResidualMonitor.ps1`" -ConfigPath `"C:\scripts\codex-residual-monitor\config.psd1`""

Write-Host "Autorun registered and monitor started: $TaskName"
