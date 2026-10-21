# Journey Atlas: selected B, real interactive maps, liquid-glass route card

21 October 2026. Isolated branch `prototype/journey-atlas-interactive-2026-10-21`, based on prior area-routing candidate `4f68946`. User selected B and asked for combined aligned From/To controls beside the existing maps, then requested floating liquid-glass styling. This is an English local design/integration candidate, not approval of completed mall navigation.

## Working previews

- Saigon Centre: http://127.0.0.1:4473/en/prototype/directions
- Vincom Đồng Khởi: http://127.0.0.1:4474/en/prototype/directions

The built previews run with `C:\node.exe scripts/serve-static.mjs --mall saigon-centre --port 4473` and the corresponding Vincom command using `vincom-dong-khoi` / `4474`. Build each with `MALL_ID` set and `C:\node.exe node_modules/astro/bin/astro.mjs build`. Dependencies are an existing local junction; no installation. The prototype's Back to Discovery links return to prior full previews 4461/4462. This candidate does not replace those previews or package their exterior assets.

## Actual reuse, not screenshots

- The existing `FloorMap.tsx` renders the SVG regions, slab presentation, keyboard/click area selection and numbered map bindings. Only an optional React children slot was added to place overlays in that same SVG coordinate frame; existing callers are unaffected.
- `site.ts` supplies approved geometry overlays, original directory IDs and floor associations for both malls. `discoveryAreaNumbers` and `areaLabelPoint` are reused. No static raster image is rendered in the new route.
- From search offers all mapped open shop locations (157 Saigon; 23 Vincom) plus the existing reviewed public-area start. Destination search includes all open directory locations, keeping floor-only destinations honest. Several shops may share a mapped area.
- Real map selection opens a compact Start here / Go here chooser. Floor buttons, zoom/reset and scrollable zoomed SVG work. A/B pins label areas, not doors. Plan-a-visit and inside modes retain one coherent route card.
- Glass effects are limited to controls, with opaque base styles, `@supports` enhancement and reduced-transparency fallback. Map content is not blurred. Phone details expand in normal flow, never over the map; the combined inputs stay together.

## Routing coverage — intentionally unchanged

Only prior directed, reviewed graph segments are used. The existing `areaPath` / `supportedNetwork` gate remains intact. Three Saigon L5 destination areas and three Vincom B3 areas remain reachable from their respective reviewed public-area start. Raster route node coordinates are converted through each source's recorded affine transform and source-size ratio into the existing interactive map frame; no centroid-to-centroid route inference.

Mapped-shop origins do not gain invented walking paths: unsupported pairs show the specific hold and floor previews, with route start disabled. Cross-floor pairs show separate start/destination floor previews but no connector or continuous path. Missing evidence is paired public connector landings, served floors/direction, and verified corridor links into the same-floor graph. Entrance routing also remains unverified. There are no simulated routes, GPS, distances, times, exact doors or accessibility claims.

## Review and limits

Inspected desktop 1440×1000 and phone 390×844 for both malls. First batch identified phone map displacement; one repair shortened truthful landmark labels and compacted the route card. Confirmation captures are adjacent. `browser-review.json` records search, real selection, zoom/reset, manual steps, floor changes, unsupported mapped-origin/cross-floor states and keyboard map-area activation. No page errors or horizontal overflow observed. `review-atlas.mjs` reproduces this bounded review.

Both static builds completed (353 Saigon / 427 Vincom pages). Astro check: 36 files, zero errors/warnings/hints. Impeccable layout detector: `[]`. Build warnings include incumbent large chunks and missing original-page font assets because this isolated UI candidate does not run the full original-site asset packaging; the new route uses no font/image requests. Do not treat those broader built pages as a complete deployable release.

The initial dev-server dependency optimization exceeded a 30-second navigation timeout; final verification uses stable built previews instead. No remaining preview blocker. No physical walking, touch-device, broad localization or production validation claimed. The six-route pilot is not accepted as a complete directions product; this delivers the revised UI/map reuse while preserving the exact unresolved connectivity gaps.

Canonical application branches, previous tested candidate, source maps and approvals remain unchanged. Prototype A/B on 4470 is preserved separately. No deployment, public push or external communications.
