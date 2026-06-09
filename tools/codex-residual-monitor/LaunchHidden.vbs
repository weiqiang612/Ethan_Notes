Set shell = CreateObject("WScript.Shell")
shell.Run """C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe"" -NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File ""C:\scripts\codex-residual-monitor\CodexResidualMonitor.ps1"" -ConfigPath ""C:\scripts\codex-residual-monitor\config.psd1""", 0, False
