$ErrorActionPreference='Stop'
$root='D:\Midterm\.scratch\combined-discovery-motion-2026-10-19'
$evidence=Join-Path $root 'evidence\enrichment-exhaustion-2026-10-20-r3\validation'
$targets=@(
  @{mall='saigon-centre';port=4431;directory='dist/saigon-centre'},
  @{mall='vincom-dong-khoi';port=4432;directory='dist/vincom-dong-khoi'},
  @{mall='saigon-centre';port=4433;directory='dist/fixtures/saigon-centre'},
  @{mall='vincom-dong-khoi';port=4434;directory='dist/fixtures/vincom-dong-khoi'}
)
$listeners=netstat -ano -p tcp
if($listeners | Where-Object {$_ -match '^\s*TCP\s+\S+:(4431|4432|4433|4434)\s+\S+\s+LISTENING\s+\d+\s*$'}){throw 'A reserved acceptance port is occupied'}
$rows=foreach($target in $targets){
 $process=Start-Process -FilePath 'C:\node.exe' -ArgumentList @('scripts/serve-static.mjs','--mall',$target.mall,'--port',$target.port,'--dir',$target.directory,'--acceptance') -WorkingDirectory $root -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $evidence "server-$($target.port).log") -RedirectStandardError (Join-Path $evidence "server-$($target.port)-error.log")
 [pscustomobject]@{mall=$target.mall;port=$target.port;directory=$target.directory;acceptance=$true;pid=$process.Id;startedAt=(Get-Date).ToUniversalTime().ToString('o')}
}
$rows|ConvertTo-Json -Depth 4|Set-Content -Encoding utf8 (Join-Path $evidence 'server-processes.json')
$rows|ConvertTo-Json -Depth 4
