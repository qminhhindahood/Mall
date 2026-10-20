$ErrorActionPreference='Stop'
$root='D:\Midterm\.scratch\combined-discovery-motion-2026-10-19'
$evidence=Join-Path $root 'evidence\continuation-2026-10-19-r2\validation'
$snapshot=Get-Content -Raw (Join-Path $evidence 'delivered-preview-snapshot.json') | ConvertFrom-Json
$listeners=netstat -ano -p tcp
$receipts=@()
foreach($row in $snapshot.rows){
  $listener=$listeners | Where-Object { $_ -match ('^\s*TCP\s+127\.0\.0\.1:'+$row.port+'\s+\S+\s+LISTENING\s+'+$row.previousPid+'\s*$') }
  if(-not $listener){throw "Recorded PID is not listening on expected port $($row.port)"}
  $prior=Get-Process -Id $row.previousPid
  if($prior.ProcessName -ne 'node' -or $prior.Path -ne 'C:\node.exe'){throw 'Recorded process identity differs'}
  $receipts+=[pscustomobject]@{port=$row.port;previousPid=$row.previousPid;verifiedListener=$listener.Trim();processPath=$prior.Path;startTimeUtc=$prior.StartTime.ToUniversalTime().ToString('o');snapshot=$row.snapshot}
}
foreach($row in $snapshot.rows){
  Stop-Process -Id $row.previousPid
  $process=Start-Process -FilePath 'C:\node.exe' -ArgumentList @('scripts/serve-static.mjs','--mall',$row.mall,'--port',$row.port,'--dir',('"'+$row.snapshot+'"'),'--acceptance') -WorkingDirectory $root -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $evidence "delivered-server-$($row.port).log") -RedirectStandardError (Join-Path $evidence "delivered-server-$($row.port)-error.log")
  ($receipts | Where-Object {$_.port -eq $row.port}) | Add-Member -NotePropertyName newPid -NotePropertyValue $process.Id
}
$receipts | ConvertTo-Json -Depth 5 | Set-Content -Encoding utf8 (Join-Path $evidence 'delivered-preview-server-restart.json')
$receipts | ConvertTo-Json -Depth 5
