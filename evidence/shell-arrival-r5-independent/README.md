# Independent shell, arrival composition and precision-hold review

Reviewed locally on 21 October 2026 in the isolated redesign candidate. No source edits, builds, installs, canonical ownership exceptions or public writes performed by this review.

## Browser composition and navigation

The parent signalled both r5 preview builds ready before browser execution. Previews: `http://127.0.0.1:4490` and `http://127.0.0.1:4491`. Installed headless Chrome with CSS viewport emulation (1280×900 desktop / 390×844 phone), SwiftShader for actual-model cases. This is not physical-device, native-window, screen-reader or production acceptance.

`receipt.json` records **12 cases / 68 passing checks**:

- Eight mall × locale × viewport cases with WebGL unavailable and reduced motion: five navigation targets; Home, Discovery, Map and Visit navigation; language switch preserving Home; public Directions requiring an explicit start; no horizontal overflow.
- Four actual-model cases: both malls and viewports; task hierarchy, visible first-viewport model, reachable exterior controls and panel horizontal containment. Desktop uses English, phone uses Vietnamese. Detailed motion stages are covered by the separate parent's motion review, not this receipt.

All eight fallback/navigation cases recorded no page errors. The actual-model cases did not install page-error collection. Screenshots were visually inspected for both phone home views, Vincom desktop home, Saigon desktop Discovery, Vincom phone Discovery and Saigon phone Map. Header labels and task actions remain readable. Complete actual models fit their first phone viewport and map controls do not hide floor geometry in the inspected Map view.

One actionable, nonblocking finding was reported immediately: the fixed shell obscured the explanatory text of the WebGL failure alert, leaving Retry 3D visible. Actual-model screenshots also show the old canvas background contrasting with the new mall paper. These original captures are pre-repair evidence; the final focused receipt below verifies the repairs. No additional blocking finding was observed.

Files ending `home-fallback.png`, `discovery.png`, `map.png`, `actual-home.png` and `actual-controls.png` are the original captures; no screenshot edits were made. `review.mjs` is the reproducible local harness. Its first launch failed because a Windows absolute ESM import lacked a `file:///` prefix; the harness was corrected before any browser case ran.

## Final rebuilt-preview confirmation

After the parent signalled the final rebuild complete, `final-focus.mjs` ran only the affected checks: **four cases / sixteen passing checks**, zero page errors. `final-focus.json` and four `final-*.png` captures preserve the result.

- Saigon desktop and Vincom phone WebGL failures: the complete explanation sits below the fixed header and within the viewport (paragraph top 131 vs header bottom 88 on desktop; 147 vs 112 on phone).
- Saigon phone and Vincom desktop actual models: complete frames render, and personally inspected final screenshots show the canvas backdrop matching each mall's paper surface. Phone tasks and complete exterior remain visible together.
- All four cases: exterior presentation controls have computed `visibility: hidden` in Map and Discovery, preserving the practical map surface. This focused receipt does not independently exercise the intermediate overview transition; the separate motion review owns that stage.

The previously reported fallback-obscuration and canvas-palette findings are resolved in the final rebuilt previews. No remaining blocking usability finding in this review's scope.

## Five Vincom precision holds: source safety review

Scope excludes the thirteen proposed additions. Read the reconciliation `report.json`, personally inspected `B2-overlay.png` and `L1-overlay.png`, and independently read `docs/content-preparation/completion-packet-2026-10-17/vincom-research/official-stores.json`.

| Existing listing | Existing association | Supplied plan identity |
|---|---|---|
| Scentuals | B2-12 / B2-region-023 | Himalaya |
| Li-Ning | B2-46B / B2-region-025 | OVS |
| Messyweekend | B2-16 / B2-region-033 | Rhythm |
| Beauty Box | B2-17 / B2-region-007 | Pablo |
| Lacoste | L1-06A / L1-region-001 | Vinfast |

All five archived official records were retrieved at `2026-10-17T15:15:35.328698+00:00`, provide the retained floor (`B2`, or `L1` for Lacoste), and have `unitTokens: []`. The reconciliation's derived `officialReferences` correctly express absent unit evidence as `unit: null`. The supplied plans have no established publication date. Neither source establishes newest unit occupancy, replacement tenants or shared tenancy.

Reviewed `src/data/precision-holds.ts`, its application in `src/data/site.ts`, and `data/research/vincom-precision-holds-2026-10-21-r1.json`. The implementation reduces only five specified approved Vincom floor locations to floor-confirmed with empty area IDs, clones affected data, preserves existing listing/floor/editorial content, and retains original associations in the named evidence layer. It removes only unreferenced held selection areas, never polygons. Directory revision and original location equality guard against stale application. Saigon and non-approved fixtures bypass the layer. No replacement tenant or route edge is introduced.

**Safety outcome: no blocking finding.** The evidence supports withholding disputed display precision. Runtime count and browser verification of the applied holds remain the mapping agent/parent's final-build responsibility; expected aggregate is 174 area-associated / 194 floor-only listings.
