$ErrorActionPreference='Stop'
$evidence='evidence/combined-local-2026-10-19-r1'
$previous=Get-Content -Raw "$evidence/stage-two-execution.json" | ConvertFrom-Json
if(-not ($previous | Where-Object { $_.check -eq 'transition' })) { throw 'Prior motion suite has not finished' }
foreach($file in @('builds.json','build-fixture-saigon.log','build-fixture-vincom.log','build-public-saigon.log','build-public-vincom.log','provenance.json','provenance.log','validation-summary.json','review-results.json','review.log','detail-parity-results.json','detail-parity.log')) {
  Copy-Item -LiteralPath "$evidence/$file" -Destination "$evidence/pre-css/$file"
}
Get-ChildItem -LiteralPath $evidence -Filter '*.png' -File | Copy-Item -Destination "$evidence/pre-css/frames"
Get-ChildItem -LiteralPath "$evidence/frames" -Filter '*approved-menu.png' -File | Copy-Item -Destination "$evidence/pre-css/frames"
$runs=@()
foreach($target in @(@{name='builds';script='build-candidate.mjs'},@{name='review';script='check-review.mjs'},@{name='parity';script='check-detail-parity.mjs'},@{name='type-measurement';script='measure-final-type.mjs'})) {
  $started=(Get-Date).ToUniversalTime().ToString('o')
  & C:/node.exe "$evidence/$($target.script)" *> "$evidence/final-$($target.name)-execution.log"
  $row=[pscustomobject]@{name=$target.name;exitCode=$LASTEXITCODE;started=$started;finished=(Get-Date).ToUniversalTime().ToString('o')}
  $runs+=$row
  [pscustomobject]@{sourceCheckpoint='370be91';broadBehaviorCheckpoint='b114498';runs=$runs} | ConvertTo-Json -Depth 5 | Set-Content -Encoding utf8 "$evidence/final-css-execution.json"
  $row|ConvertTo-Json -Compress
  if($target.name -eq 'builds' -and $row.exitCode -ne 0) { throw 'Final builds failed; focused tests were not started' }
}
foreach($mall in @('saigon-centre','vincom-dong-khoi')) {
  Copy-Item -LiteralPath "data/malls/$mall/asset-manifest.json" -Destination "$evidence/generated-$mall-asset-manifest.json"
  Copy-Item -LiteralPath "$evidence/baseline-$mall-asset-manifest.json" -Destination "data/malls/$mall/asset-manifest.json"
  if((Get-FileHash -LiteralPath "data/malls/$mall/asset-manifest.json").Hash -ne (Get-FileHash -LiteralPath "$evidence/baseline-$mall-asset-manifest.json").Hash) { throw "Manifest restore failed: $mall" }
}
$env:SOURCE_CHECKPOINT='370be91'
& C:/node.exe "$evidence/provenance.mjs" *> "$evidence/provenance.log"
Remove-Item Env:SOURCE_CHECKPOINT
& C:/node.exe "$evidence/summarize.mjs"
