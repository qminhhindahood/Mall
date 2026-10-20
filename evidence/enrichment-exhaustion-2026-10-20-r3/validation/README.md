# R3 validation — completed

Four builds and all 13 suites pass:180 browser cases / 2,520 assertions, 752 routes, 2,914 localized field checks, 4 isolation checks. See validation-summary.json. No final failures; runtime source 71e5def.

The following retained preparation instructions describe the one-time run; do not overwrite existing evidence or rerun without a diagnosed reason.

Run from `D:\Midterm\.scratch\combined-discovery-motion-2026-10-19` only after the root commits and freezes source. No build or browser acceptance is claimed by preparing this harness.

```powershell
$env:SOURCE_CHECKPOINT = git rev-parse HEAD
C:\node.exe evidence/enrichment-exhaustion-2026-10-20-r3/validation/prepare-final-run.mjs
C:\node.exe evidence/enrichment-exhaustion-2026-10-20-r3/validation/build-candidate.mjs
C:\node.exe evidence/enrichment-exhaustion-2026-10-20-r3/start-local-previews.mjs acceptance
C:\node.exe evidence/enrichment-exhaustion-2026-10-20-r3/validation/run-validation.mjs
C:\node.exe evidence/enrichment-exhaustion-2026-10-20-r3/validation/record-provenance.mjs
C:\node.exe evidence/enrichment-exhaustion-2026-10-20-r3/validation/verify-canonical.mjs after
C:\node.exe evidence/enrichment-exhaustion-2026-10-20-r3/validation/freeze-server-logs.mjs
C:\node.exe evidence/enrichment-exhaustion-2026-10-20-r3/validation/summarize.mjs
```

Check every command exit before continuing. The four sequential builds run fixture Saigon, fixture Vincom, public Saigon, public Vincom. Both asset manifests restore exact original bytes in finally. Repeated build attempts and repeated suite execution require explicit diagnosis; scripts refuse silent reruns. Ports 4431/4432 serve public and 4433/4434 serve fixtures; occupied ports abort without killing another process.

Preparation records canonical hashes/status and invokes the existing packager with `--record-inputs --snapshot evidence/enrichment-exhaustion-2026-10-20-r3/release/build-inputs.json`. Dynamic accepted record/field totals derive from the frozen JSON. Static checks require exactly twice the accepted field count (EN+VI), inspecting each field block for value/link/source/date/caveat. Source provenance compares the committed checkpoint and manifests; build pre/post checks compare every raw frozen input hash.

Retains 172 r2 browser cases and adds eight cases (both malls × EN/VI × hydrated/no-JS): accepted cuisine exact text and provenance, no duplicate baseline cuisine, shared static/Discovery detail consistency, listing overlay, baseline cuisine fallback, and non-Dining guard. Representatives are selected from final accepted/directory data. Requires accepted cuisine and untouched legacy Dining cuisine in each mall; if absent the suite fails explicitly, without fabricating data. Broad prior detail-parity suite separately checks map/Discovery consistency. No private helper assertions or unit suites added.

Future raw package creation must explicitly pass BOTH `--snapshot evidence/enrichment-exhaustion-2026-10-20-r3/release/build-inputs.json` AND `--out evidence/enrichment-exhaustion-2026-10-20-r3/release/package` to `scripts/package-local-release.mjs`; defaults target r2 and must not be used. Reserve 4441/4442 for later raw package verification. This harness neither starts those servers nor changes r2 package ports4411/4412 or evidence.

Limits: browser cases have not run; syntax checks alone establish no behavior. Existing installed Chrome/emulation is used. No physical-device, production, verified indoor walking topology, deployment or release acceptance claim. FaceShop/Clinique inherited Dining taxonomy remains an evidence hold; this harness does not alter taxonomy or invent cuisine. Parent owns tracker/evidence integration.

Launcher note: this host blocks .ps1 execution. Policy remains unchanged. The Node launcher provides the same port checks, hidden processes and per-process receipts without a PowerShell policy change; it refuses existing receipts or occupied ports. Existing acceptance servers were started with direct Start-Process commands, recorded in validation/server-launch-note.txt.
