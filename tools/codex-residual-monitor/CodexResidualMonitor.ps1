param(
    [string]$ConfigPath = "C:\scripts\codex-residual-monitor\config.psd1"
)

$ErrorActionPreference = "Stop"
$mutexName = "Local\CodexResidualNodeMonitor"
$createdNew = $false
$mutex = New-Object System.Threading.Mutex($true, $mutexName, [ref]$createdNew)

if (-not $createdNew) {
    exit 0
}

function Write-MonitorLog {
    param(
        [string]$Message
    )

    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Add-Content -LiteralPath $script:LogPath -Value "[$timestamp] $Message"
}

function Get-NodeProcessParentMap {
    $instances = (Get-Counter '\Process(node*)\ID Process').CounterSamples |
        Select-Object InstanceName, CookedValue
    $parents = (Get-Counter '\Process(node*)\Creating Process ID').CounterSamples |
        Select-Object InstanceName, CookedValue

    $processById = @{}
    Get-Process | ForEach-Object { $processById[$_.Id] = $_ }

    foreach ($instance in $instances) {
        $parent = $parents | Where-Object InstanceName -eq $instance.InstanceName | Select-Object -First 1
        if (-not $parent) {
            continue
        }

        $processId = [int]$instance.CookedValue
        $process = $processById[$processId]
        if (-not $process) {
            continue
        }

        [pscustomobject]@{
            Instance     = [string]$instance.InstanceName
            Pid          = $processId
            ParentPid    = [int]$parent.CookedValue
            ParentName   = [string]$processById[[int]$parent.CookedValue].ProcessName
            StartTime    = $process.StartTime
            WorkingSetMB = [math]::Round($process.WorkingSet64 / 1MB, 2)
        }
    }
}

function Get-ResidualCandidates {
    param(
        [hashtable]$Config
    )

    $cutoff = (Get-Date).AddSeconds(-1 * [int]$Config.MinProcessAgeSeconds)

    $candidates = Get-NodeProcessParentMap | Where-Object {
        $_.ParentName -in $Config.ParentNames -and
        $_.StartTime -lt $cutoff -and
        (
            $_.Instance -eq "node" -or
            ($Config.IncludeNodeRepl -and $_.Instance -eq "node_repl")
        )
    }

    return @($candidates)
}

function Get-CurrentNodeSummary {
    $nodes = @(Get-Process node -ErrorAction SilentlyContinue)
    [pscustomobject]@{
        Count = $nodes.Count
        WorkingSetMB = if ($nodes.Count -gt 0) {
            [math]::Round((($nodes | Measure-Object WorkingSet64 -Sum).Sum / 1MB), 2)
        } else {
            0
        }
    }
}

if (-not (Test-Path -LiteralPath $ConfigPath)) {
    throw "Config file not found: $ConfigPath"
}

$config = Import-PowerShellDataFile -LiteralPath $ConfigPath

$logDirectory = [string]$config.LogDirectory
if (-not (Test-Path -LiteralPath $logDirectory)) {
    New-Item -ItemType Directory -Path $logDirectory -Force | Out-Null
}

$script:LogPath = Join-Path $logDirectory "codex-residual-monitor.log"
Write-MonitorLog "Monitor started. PollInterval=$($config.PollIntervalSeconds)s ParentNames=$($config.ParentNames -join ',')"

while ($true) {
    try {
        $candidates = Get-ResidualCandidates -Config $config
        $count = $candidates.Count
        $totalWorkingSetMB = if ($count -gt 0) {
            [math]::Round((($candidates | Measure-Object WorkingSetMB -Sum).Sum), 2)
        } else {
            0
        }

        $shouldCleanup = $count -ge [int]$config.MinResidualCount -or
            $totalWorkingSetMB -ge [double]$config.MinTotalWorkingSetMB

        if ($shouldCleanup -and $count -gt 0) {
            $targetPids = $candidates | Select-Object -ExpandProperty Pid
            $beforeSummary = Get-CurrentNodeSummary
            Write-MonitorLog "Cleanup triggered. Count=$count WorkingSetMB=$totalWorkingSetMB PIDs=$($targetPids -join ',')"
            Stop-Process -Id $targetPids -Force -ErrorAction SilentlyContinue
            Start-Sleep -Seconds 2
            $afterSummary = Get-CurrentNodeSummary
            $freedWorkingSetMB = [math]::Round(($beforeSummary.WorkingSetMB - $afterSummary.WorkingSetMB), 2)
            $removedCount = $beforeSummary.Count - $afterSummary.Count
            Write-MonitorLog "Cleanup complete. RemovedCount=$removedCount RemainingCount=$($afterSummary.Count) FreedWorkingSetMB=$freedWorkingSetMB RemainingWorkingSetMB=$($afterSummary.WorkingSetMB)"
        }
    } catch {
        Write-MonitorLog "Monitor loop error: $($_.Exception.Message)"
    }

    Start-Sleep -Seconds ([int]$config.PollIntervalSeconds)
}
