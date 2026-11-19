$ErrorActionPreference = 'Stop'
$package = Resolve-Path 'release/CyberGo-Setup-Windows-x64.exe'
$installer = Start-Process -FilePath $package -ArgumentList '/S' -Wait -PassThru
if ($installer.ExitCode -ne 0) { throw "Installer exited with $($installer.ExitCode)" }

$program = @(
    "$env:LOCALAPPDATA\CyberGo\CyberGo.exe",
    "$env:LOCALAPPDATA\CyberGo\cybergo.exe",
    "$env:LOCALAPPDATA\Programs\CyberGo\CyberGo.exe"
) | Where-Object { Test-Path $_ } | Select-Object -First 1
if (!$program) { throw 'Could not find the installed CyberGo executable' }

$database = Join-Path $env:APPDATA 'io.github.veerendranadhreddy11.cybergo\cybergo.db'
$process = Start-Process -FilePath $program -PassThru
try {
    $deadline = (Get-Date).AddSeconds(60)
    do {
        Start-Sleep 1
        $process.Refresh()
        if ($process.HasExited) { throw "Installed app exited with $($process.ExitCode)" }
    } until (((Test-Path $database) -and $process.MainWindowHandle -ne 0) -or ((Get-Date) -ge $deadline))
    if (!(Test-Path $database) -or $process.MainWindowHandle -eq 0) { throw 'CyberGo did not show a window and create a database' }
} finally {
    Stop-Process -Id $process.Id -ErrorAction SilentlyContinue
}
