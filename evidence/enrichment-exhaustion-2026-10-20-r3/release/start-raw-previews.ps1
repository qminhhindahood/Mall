$ErrorActionPreference='Stop'
$root='D:\Midterm\.scratch\combined-discovery-motion-2026-10-19'
$evidence=Join-Path $root 'evidence\enrichment-exhaustion-2026-10-20-r3\release'
$package=Join-Path $evidence 'package'
if(!(Test-Path -LiteralPath (Join-Path $package 'COMPLETE.json'))){throw 'Complete r3 package is required before starting previews'}
if(Test-Path -LiteralPath (Join-Path $evidence 'raw-preview-startup.json')){throw 'Startup already recorded; inspect existing process state before retrying'}
$targets=@(
 @{mall='saigon-centre';port=4441},
 @{mall='vincom-dong-khoi';port=4442}
)
$listeners=netstat -ano -p tcp
if($listeners | Where-Object {$_ -match '^\s*TCP\s+\S+:(4441|4442)\s+\S+\s+LISTENING\s+\d+\s*$'}){throw 'Raw r3 port 4441 or 4442 is occupied; no process stopped'}
$rows=@()
foreach($target in $targets){
 $directory='evidence/enrichment-exhaustion-2026-10-20-r3/release/package/'+$target.mall
 $process=Start-Process -FilePath 'C:\node.exe' -ArgumentList @('scripts/serve-static.mjs','--mall',$target.mall,'--port',$target.port,'--dir',$directory) -WorkingDirectory $root -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $evidence "server-$($target.port).log") -RedirectStandardError (Join-Path $evidence "server-$($target.port)-error.log")
 $rows+= [pscustomobject]@{mall=$target.mall;port=$target.port;directory=$directory;acceptance=$false;pid=$process.Id;startedAt=(Get-Date).ToUniversalTime().ToString('o')}
 $rows|ConvertTo-Json -Depth 4|Set-Content -Encoding utf8 (Join-Path $evidence 'raw-preview-startup.json')
}
$rows|ConvertTo-Json -Depth 4
