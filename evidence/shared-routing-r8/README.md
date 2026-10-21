# Bounded shared planner / B3 integration — r8

Built on isolated 3888690; source frozen for coordinator builds and browser checks. No commit, upload, dependency change, asset/source-raster revision or canonical checkout change by this lane.

Atlas now receives a graph constructed and validated against full source-bearing geometry before serialization, through src/data/atlas-routing.ts. Source validation failure returns null guidance while leaving the map/directory usable; no legacy planner fallback. The public EN/VI and prototype directions pages pass the same trusted graph. Search availability, route steps and floor overlays use the shared planner and source-specific transforms. Legacy landmark URL IDs remain supported. Manual cross-floor confirmation and bilingual handoff behavior are preserved for coordinator verification.

## Exact coverage

The authoring audit verifies 41 ordered visitor-selectable journeys: Saigon 5 unchanged; Vincom 36. All nine prior directed journeys retain exact localized steps, and CK/MLB retains exact floor legs and explicit transfer targets.

The 32 new Vincom journeys comprise four landmark-to-new-area journeys, twelve ordered pairs among GoGi House / Manwah / San Fu Lou / Kichi-Kichi, and sixteen journeys from those four origins to the four existing B3 destination approaches. There are thirteen destination approaches total (Saigon five, Vincom eight). This is not all-store routing.

The four new anchors bind exactly to derived-r7-gogihouse-area, derived-r7-manwah-area, derived-r7-sanfulou-area and derived-r7-kichikichi-area. The accepted r7 packet supplies 18 explicit directional instructions. Seventeen new arcs are added: E1 forward reuses its existing reviewed arc/text to preserve legacy guidance; its alternative accepted r7 text is retained in the fixture provenance. Other 17 arc instructions match the acceptance receipt byte-for-text. No unreviewed reverse arc is synthesized.

Siam Sugar remains destination-only; its outbound anchor permission is not promoted. Existing southbound shops remain destination-only. The landmark remains origin-only, so shop-to-landmark potential in the source proposal is not included in visitor counts. Three Saigon public entrance markers remain selectable but unconnected; zero public-entrance routes. Other unsupported shop/floor requests remain unavailable. Store mapping coverage stays 191/368 area-linked, 177 floor-only, zero exact doors.

## Authoring evidence

Run node scripts/audit-shared-routing-r8.mjs from the candidate. checks.json and coverage.json record 55 passing checks over 71,300 origin/destination listing-floor requests, covering all 368 listings. Checks include exact ordered pair sets, preserved legacy text/legs, source hash/transform/mall/node guards, exact four area bindings, connector direction/review guards, explicit B3 instructions, and unsupported entrances/origins. Scoped TypeScript diagnostics for changed Atlas/routing modules: zero.

Builds and browser validation belong to the coordinator and were not run by this lane. No new browser screenshots/JSON were attempted; the earlier denied read-only reviewer artifact operation was not retried. Broader routing is handed off after this bounded batch; no further network expansion is included.

## Changed files

- src/components/JourneyAtlas.tsx
- src/data/atlas-routing.ts
- src/data/routing/reviewed-network.ts
- src/data/routing/reviewed-b3-extension.ts
- src/pages/en/directions.astro
- src/pages/vi/chi-duong.astro
- src/pages/en/prototype/directions.astro
- scripts/audit-shared-routing-r8.mjs
- evidence/shared-routing-r8/README.md, checks.json, coverage.json

## Coordinator verification

Both builds pass (Saigon 355 pages, Vincom 429 pages; zero Astro errors), with logs alongside this file. Console-only browser checks pass for eighteen new route cases (EN desktop / VI phone), covering all four landmark approaches, representative shop-to-shop pairs in both directions and a new-origin-to-Highlands connection. Two reverse Highlands-to-new-shop requests remain unavailable, as required by the directed graph. All fourteen existing same-floor bilingual desktop/phone cases pass. CK/MLB and reverse pass on desktop/phone, including explicit manual transfer, correct floor switching and distinct floor overlays. Two entrance-origin cases remain disabled with no route line. No page errors or horizontal overflow observed. The first cross-floor test used a straight apostrophe against the UI's curly apostrophe; inspecting the step sequence showed correct behavior, and matching the actual transfer-floor label passed. No product repair was needed.

In-memory phone and desktop screenshots were visually inspected: source-frontage paths remain outside the tenant shapes, map labels remain crisp, and controls do not overlay the route. On phones the route card precedes the map and adds vertical scrolling; no claim of full-map first-viewport fit while instructions are expanded. No new screenshot artifact was saved and the earlier denied review-artifact operation was not retried.

This is the last bounded local routing integration before handoff. Local work continues on UI/UX and store-location mapping only; further graph expansion, entrance connections and route coverage belong to the assigned recipient. Location coverage remains 191/368;13 reviewed approaches and41 directed journeys do not imply 41 additional mapped stores or complete navigation.

Final unchanged rapid language/history harness also passes all four mall/viewport cases with no errors, preserving destination and Discovery search through language and Back. It was executed inline with artifact writing removed; no extra settling delays were added.
