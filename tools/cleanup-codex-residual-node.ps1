param(
    [string[]]$ParentNames = @("cmd"),
    [switch]$IncludeNodeRepl,
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"

function Get-NodeProcessParentMap {
    $instances = (Get-Counter '\Process(node*)\ID Process').CounterSamples |
        Select-Object InstanceName, CookedValue
    $parents = (Get-Counter '\Process(node*)\Creating Process ID').CounterSamples |
        Select-Object InstanceName, CookedValue

    $procMap = @{}
    Get-Process | ForEach-Object { $procMap[$_.Id] = $_.ProcessName }

    foreach ($instance in $instances) {
        $parent = $parents | Where-Object InstanceName -eq $instance.InstanceName | Select-Object -First 1
        if (-not $parent) {
            continue
        }

        [pscustomobject]@{
            Instance   = [string]$instance.InstanceName
            Pid        = [int]$instance.CookedValue
            ParentPid  = [int]$parent.CookedValue
            ParentName = [string]$procMap[[int]$parent.CookedValue]
        }
    }
}

$targets = Get-NodeProcessParentMap | Where-Object {
    $_.Instance -eq "node" -and
    $ParentNames -contains $_.ParentName
}

if ($IncludeNodeRepl) {
    $targets += Get-NodeProcessParentMap | Where-Object {
        $_.Instance -eq "node_repl" -and
        $ParentNames -contains $_.ParentName
    }
}

$targets = $targets | Sort-Object Instance, ParentName, ParentPid, Pid -Unique

if (-not $targets) {
    Write-Host "No matching residual Codex node processes found."
    exit 0
}

Write-Host "Matched process candidates:"
$targets | Format-Table Instance, Pid, ParentPid, ParentName -AutoSize

if ($DryRun) {
    Write-Host ""
    Write-Host "Dry run only. No processes were terminated."
    exit 0
}

$nodePids = $targets | Select-Object -ExpandProperty Pid
Stop-Process -Id $nodePids -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

$remaining = Get-Process node -ErrorAction SilentlyContinue
$remainingCount = @($remaining).Count
$remainingWsMb = if ($remaining) {
    [math]::Round((($remaining | Measure-Object WorkingSet64 -Sum).Sum / 1MB), 2)
} else {
    0
}

Write-Host ""
Write-Host "Cleanup complete."
Write-Host "Remaining node.exe count: $remainingCount"
Write-Host "Remaining node.exe working set MB: $remainingWsMb"
