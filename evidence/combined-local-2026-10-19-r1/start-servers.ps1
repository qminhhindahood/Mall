$ErrorActionPreference = 'Stop'
$projectRoot = 'D:\Midterm\.scratch\combined-discovery-motion-2026-10-19'
$evidenceRoot = Join-Path $projectRoot 'evidence\combined-local-2026-10-19-r1'
$targets = @(
  @{ mall='saigon-centre'; port=4401; dir='dist/saigon-centre' },
  @{ mall='vincom-dong-khoi'; port=4402; dir='dist/vincom-dong-khoi' },
  @{ mall='saigon-centre'; port=4403; dir='dist/fixtures/saigon-centre' },
  @{ mall='vincom-dong-khoi'; port=4404; dir='dist/fixtures/vincom-dong-khoi' }
)
$occupied = Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | Where-Object { $_.LocalPort -in $targets.port }
if ($occupied) { throw 'One or more reserved ports are already occupied' }
$receipts = foreach ($target in $targets) {
  $process = Start-Process -FilePath 'C:\node.exe' -ArgumentList @('scripts/serve-static.mjs','--mall',$target.mall,'--port',$target.port,'--dir',$target.dir) -WorkingDirectory $projectRoot -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $evidenceRoot "server-$($target.port).log") -RedirectStandardError (Join-Path $evidenceRoot "server-$($target.port)-error.log")
  [pscustomobject]@{ mall=$target.mall; port=$target.port; directory=$target.dir; pid=$process.Id; startedAt=(Get-Date).ToUniversalTime().ToString('o') }
}
$receipts | ConvertTo-Json | Set-Content -Encoding utf8 (Join-Path $evidenceRoot 'server-processes.json')
$receipts | ConvertTo-Json
