# R3 raw package — completed

Frozen package created;57 HTTP checks and 4 browser cases / 144 assertions pass. Source 71e5def; raw previews 4441/4442. See package/COMPLETE.json and raw receipt JSONs.

The following retained preparation instructions describe the one-time run; do not overwrite existing evidence or rerun without a diagnosed reason.

After the root freezes source and all four builds and acceptance checks pass, run from the combined worktree. Stop on any nonzero exit. The packager must receive both r3 arguments: its defaults target r2.

```powershell
C:\node.exe scripts/package-local-release.mjs --snapshot evidence/enrichment-exhaustion-2026-10-20-r3/release/build-inputs.json --out evidence/enrichment-exhaustion-2026-10-20-r3/release/package
C:\node.exe evidence/enrichment-exhaustion-2026-10-20-r3/start-local-previews.mjs raw
C:\node.exe evidence/enrichment-exhaustion-2026-10-20-r3/release/check-raw-previews.mjs
C:\node.exe evidence/enrichment-exhaustion-2026-10-20-r3/release/check-raw-browser.mjs
```

The input snapshot is created by the validation preparation command BEFORE builds. Do not re-record it after builds. Raw servers use packaged directories on 4441/4442 without `--acceptance`; no r2 files or ports4411/4412 are touched. Servers launch hidden; occupied ports abort without killing processes. Startup PID receipts are written after each start so partial startup can be inspected.

HTTP checks compare local response bytes and SHA-256 with packaged disk files: localized home, floor/store deep links, exact 404, no injected acceptance helper, no helper endpoint, identity assets, Brotli compressed and decompressed bytes, Vary, and conditional304. Package completion/provenance digest is checked.

Four browser cases cover EN/VI in both malls, desktop/mobile viewport, an accepted cuisine destination, exact localized accepted field values/actions/source/date/caveats, no duplicate cuisine, listing cuisine, keyboard guidance disclosure/manual floor choice/session retention, limitations/fallback, no acceptance requests, overflow, and uncaught errors. Screenshots and raw receipts stay in this release folder. Source data used for expected values must still match the frozen snapshot; script checks those hashes before launching Chrome.

Prepared only: no package creation, servers, HTTP checks, browser checks, or builds were run in this task. Real devices, production hosting and deployment acceptance remain unverified.

Launcher note: this host blocks .ps1 execution. Policy remains unchanged. The Node launcher provides the same port checks, hidden processes and per-process receipts without a PowerShell policy change; it refuses existing receipts or occupied ports. Existing acceptance servers were started with direct Start-Process commands, recorded in validation/server-launch-note.txt.
