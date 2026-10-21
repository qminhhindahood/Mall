# CALVIN KLEIN L2 ↔ MLB L3: plan-based cross-floor repair

21 October 2026. The owner reported the selected journey as unusable because the prior preview only reported unavailable cross-floor routing. This isolated candidate preserves B / liquid-glass layout and existing interactive map components. It adds the bounded source-supported journey rather than presenting another cosmetic refinement.

- Saigon: http://127.0.0.1:4476/en/prototype/directions — opens the reported CK → MLB pair.
- Vincom: http://127.0.0.1:4477/en/prototype/directions — existing reviewed routes plus pre-selection availability labels; no new Vincom cross-floor pairing asserted.
- All documented preview inventory: http://127.0.0.1:4475/

## Why the previous hold changed

Independent Astra-medium visual review inspected the original L2 and L3 plans. Both explicitly label **Zone A** beside a lift pictogram in the same central-atrium context. Each plan shows a continuous public aisle between its relevant shop frontage and that named landing. Pairing is semantic and plan-based; coordinate alignment between floors remains uncalibrated. Exact doorway surveying is unnecessary for this area-level schematic. Prior blanket rejection of every cross-floor trip was too restrictive for this bounded case.

The route has no simulated geometry. It uses manually selected public-aisle waypoints from the supplied plans. It does not establish lift operation, exact door positions, accessibility, travel distance/time or live indoor localization. At the transfer the visitor must confirm the requested floor is served; if unavailable, ask mall staff. Each floor is rendered separately and progression is explicit: **I'm on L3/L2**. Never draw a line through space between floors.

## Exact source and mapping

| Floor | Original source / dimensions | SHA-256 | Approved area |
|---|---|---|---|
| L2 | `Takashimaya/Sơ đồ tầng/saigon-centre-so-do-tang-L2-2026-10-01.png`, 4608×5082 | `4749dd738ea148407c334396183ef917711f4ff10fbfaa796a7ff6f31ede4fd5` | CK `research-l2-l2-02-03`, `L2-region-004` |
| L3 | `Takashimaya/Sơ đồ tầng/saigon-centre-so-do-tang-L3-2026-10-01.png`, 4712×5142 | `905e5de4c90debbabddd8a7fadf9e47b5084bf6b01703ba5450b9e8603763ab8` | MLB `research-l3-l3-31`, `L3-region-005` |

Connector identifier: `saigon-zone-a-l2-l3`. Destination IDs: `saigon-prototype-calvinklein`, `saigon-prototype-mlb`.

L2 source-pixel path (top-left origin): CK frontage `[2813,1220]` → `[2954,1530]` → `[3076,1851]` → `[3205,2192]` → `[3235,2348]` → `[3027,2431]` → `[2518,2578]` → Zone A public landing `[2457,2510]`.

L3 source-pixel path: Zone A public landing `[2619,2573]` → `[2688,2610]` → MLB frontage `[3008,2526]`.

Preserve bends around LYN / Weekend by Max Mara on L2 and below the service rectangle on L3. A direct diagonal would be unsupported. Each leg passes through its own source affine transform into the existing SVG frame. Matching geometry source hashes gate activation. Reverse reverses leg and waypoint order, with separately worded instructions.

Official [CALVIN KLEIN page](https://shopping.saigoncentre.com.vn/en/store-directory/calvin-klein) confirms L2-02/03. Search retrieval of the official [MLB page](https://shopping.saigoncentre.com.vn/en/store-directory/mlb) confirms L3-31, consistent with the approved local record. Direct follow-up opens of MLB/floorplan returned HTTP 403, so no fresh operational or connector information is claimed from them.

## Review and verification

Independent final read-only review found no significant defect: polylines match source-reviewed waypoints; transforms/hash checks are per floor; no inter-floor line; reversal and manual transfer are correct; desktop captures align.

`review-crossfloor.mjs` and `browser-review.json` verify forward/reverse on desktop 1440×1000 and phone 390×844, manual transfer before map-floor switch, source route overlays, unsupported choices labelled **Map only** before selection, disabled unsupported trips with no path, and existing Vincom route availability. No page errors/horizontal overflow. A phone refinement keeps only the active instruction visible while the full list is expandable. Both mall static builds complete; Astro check reports 37 files and no errors/warnings/hints.

Two early test-script issues were corrected: Vincom MLB was queried in mapped-origin search despite being floor-only, and an interaction ran before React hydration. Final checks query the destination and wait for the hydrated island; these were verification-script errors, not invented evidence of product success.

## Exact limits / blockers

This is one bidirectional cross-floor pair plus the existing six area-route destinations, not complete mall navigation. Other shops/floors need reviewed public-frontage links and named connector pairings. The selection list now exposes this before committing a choice.

The supplied screenshot `libfile_c41250a9dab88191bd5e6cf7154b18f6` was resolved, but the official materialization helper returned `library file transfer failed: download failed`; no local pixels were produced. Library image read returned metadata/OCR and a non-renderable asset pointer. The parent inspected the original pixels; this review also reproduced the exact CK/MLB state locally and inspected local screenshots. Do not claim successful local inspection of the supplied original screenshot.

Windows `Get-NetTCPConnection -State Listen` returned **Access denied** and was not retried. Preview inventory uses documented URLs plus direct HTTP/browser checks, not complete OS listener enumeration. No server was restarted solely to revive an archived link.

Canonical application branches, old 4473/4474 candidate, 4470 concepts, tested combined package, original map files and approvals are preserved. No installation, deployment or public push.
