$ErrorActionPreference = 'Stop'
$database = Join-Path $env:APPDATA 'io.github.veerendranadhreddy11.cybergo\cybergo.db'

function Invoke-InstalledSmoke($package, $product, $databaseVersion) {
    $installer = Start-Process -FilePath $package -ArgumentList '/S' -Wait -PassThru
    if ($installer.ExitCode -ne 0) { throw "$product installer exited with $($installer.ExitCode)" }
    $program = @(
        "$env:LOCALAPPDATA\$product\$product.exe",
        "$env:LOCALAPPDATA\$product\cybergo.exe",
        "$env:LOCALAPPDATA\Programs\$product\$product.exe"
    ) | Where-Object { Test-Path $_ } | Select-Object -First 1
    if (!$program) { throw "Could not find the installed $product executable" }
    $process = Start-Process -FilePath $program -PassThru
    try {
        $deadline = (Get-Date).AddSeconds(90)
        $ready = $false
        do {
            Start-Sleep 1
            $process.Refresh()
            if ($process.HasExited) { throw "$product exited with $($process.ExitCode)" }
            if ((Test-Path $database) -and $process.MainWindowHandle -ne 0) {
                $version = python -c 'import sqlite3,sys;print(sqlite3.connect(sys.argv[1]).execute("PRAGMA user_version").fetchone()[0])' $database
                $ready = ($version -eq "$databaseVersion")
            }
        } until ($ready -or ((Get-Date) -ge $deadline))
        if (!$ready) { throw "$product did not open its window and reach SQLite schema $databaseVersion" }
    } finally {
        Stop-Process -Id $process.Id -ErrorAction SilentlyContinue
        Wait-Process -Id $process.Id -ErrorAction SilentlyContinue
    }
}

$oldInstaller = Join-Path $env:RUNNER_TEMP 'CyberNex-Setup-Windows-x64.exe'
curl.exe --fail --location --retry 2 "https://github.com/$env:GITHUB_REPOSITORY/releases/download/v2.1.0/CyberNex-Setup-Windows-x64.exe" --output $oldInstaller
if ($LASTEXITCODE) { throw 'Could not download the prior CyberNex installer' }
Invoke-InstalledSmoke $oldInstaller CyberNex 2
python scripts/upgrade-fixture.py seed $database
if ($LASTEXITCODE) { throw 'Could not seed the upgrade fixture' }
Invoke-InstalledSmoke (Resolve-Path 'release/CyberNex-Setup-Windows-x64.exe') CyberNex 2
python scripts/upgrade-fixture.py verify $database
if ($LASTEXITCODE) { throw 'CyberNex data failed post-upgrade verification' }
