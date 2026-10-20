# Indoor guidance delivery and topology audit

Isolated candidate: `D:/Midterm/.scratch/combined-discovery-motion-2026-10-19`, starting HEAD `c5658d2` (runtime source `370be91`). Scope: local floor guidance for both malls and languages. Assets, approved directory, enrichment data, geometry and canonical branches are unchanged by this lane.

## Decision

Implement manual current-floor comparison with the selected destination's supported floor. Do not implement a walking route or overlay. This is the useful deliverable supported by the available evidence, not a completed indoor routing engine.

The underlying consolidated specification excludes walking routes; issue0023 records the later authorization to investigate and implement only evidence-supported guidance. Its fallback is now implemented. No personal owner review or fictional approval is recorded.

## Evidence audited

- `data/malls/{saigon-centre,vincom-dong-khoi}/directory.json`: 368 approved destinations, 375 floor locations, **zero published facilities**. 195 locations remain floor-only (13 Saigon /182 Vincom). Four destinations span multiple floors. All continue to use their existing locations without promotion to precise markers.
- Both `floor-geometry.json` datasets: schematic local units, nonmetric scale, unverified north/exterior alignment, estimated cross-floor registration. Source regions are reference geometry, not walkable areas. Tenant boundaries and empty space between them cannot establish corridors, storefront entrances or accessible travel.
- Saigon archived official `official-floorPlanMap-en.json` in `docs/content-preparation/completion-packet-2026-10-17/saigon-research/`: eight floors contain entrance, escalator, elevator-zone, emergency-exit and line/arrow candidates. `topology-audit.json` retains 115 candidate records and source hash. L1 has four door features; L2/L5 have some escalator destination-floor labels. This is real partial evidence, **not an absence of all circulation information**.
- The archive has repeated/missing feature IDs, general zone polygons and decorative line/arrow geometry. Examples: L5 uses ID `30` for two differently named escalators; B1 contains exits labeled B2; B2 contains “Escalator to Level B2.” These do not establish consistently paired connector endpoints. No reviewed corridor graph, door-to-corridor adjacency, usable connector access, travel direction, accessibility, opening restrictions or step-free continuity was established.
- Vincom source images are recorded per floor with SHA-256 in the audit. The existing `map-reconciliation.md` documents the owner's outdated-map warning and 15-map visual sweep. `map-only-annotations.md` explicitly leaves entrances/elevators/escalators for separate facility review. No machine-readable verified Vincom connector or corridor topology is present in the published data.
- Runtime `Facility` is only a reviewed name/floor/optional area, and `FloorRegion` is geometry without adjacency. The synthetic `test-lift` in fixtures is not evidence for either mall.

The topology audit is a local archived-evidence review, not an on-site, access or operational-currentness inspection. It does not claim the malls lack these facilities.

Fresh official-page check, 19 October 2026, performed by the parent integration lane: `https://shopping.saigoncentre.com.vn/en/floorplan` and `/vi/floorplan` expose an interactive floor plan, floor selector and facilities; `https://vincom.com.vn/vincom-center-dong-khoi` provides official mall visitor information, not a floor plan. The guidance links to these respective resources, with localized labels and accessible new-tab notice. Readable web text did not establish a verified corridor graph. This check does not establish equivalence between current official geometry and the archived geometry, and the topology hold remains unchanged.

## Implementation

- `src/data/indoor-guidance.ts`: resolves a valid requested destination floor (otherwise its primary floor), validates a manual start against the mall's floors and compares equality. It uses no elevations, polygon distances or inferred connectivity.
- `src/components/IndoorGuidance.tsx`: bilingual native disclosure in destination details. Unknown start is the default. Manual start appears after hydration and explains that position is not detected. Same-floor and different-floor messages stay at floor precision. The selected destination and existing multi-floor controls supply the destination selection. The map link retains the exact supported destination floor and locale. Floor-only locations get an explicit no-exact-storefront message.
- `src/styles/indoor-guidance.css`: existing Porcelain tokens/type, solid inherited reading surface, native disclosure/select, 44px controls, visible keyboard focus. No new motion, imagery or design system.
- `src/components/DestinationDetails.tsx`: import and render only, sharing the feature across Discovery, map detail and static/noJS destination HTML.

NoJS: the disclosure, selected destination floor, comparison instruction, map/floor link, floor-only statement and route limitation remain useful. The manual select is omitted until hydrated, avoiding an inert control. Starting-floor selection is explicitly a manual choice, not a live position. It persists in sessionStorage for the current tab, keyed by mall, through destination/locale/history changes; stored IDs are validated against that mall's current floors. Choosing the unknown option clears storage. Storage read/write failure is caught and the mounted control still works without persistence. Copy asks visitors to update their choice if they move. No GPS or position assertion is stored in a shareable URL; existing destination/floor/locale/history routing is unchanged. Same/different messaging explicitly compares the selected destination floor, so multi-floor destinations are not falsely described as absent from another floor.

## Validation and handoff

Run `node evidence/continuation-2026-10-19-r2/navigation/audit-topology.mjs` from the candidate root. It inventories static data counts, hashes, precision classifications and archived source features only; it imports no runtime helper and asserts no helper behavior. `data-inventory.json` records counts; `topology-audit.json` records input hashes and extracted source evidence. The earlier 4,108 helper-level assertions violated the selected browser-only behavioral test seam: their result is preserved in `superseded-helper-assertions.json` as **not accepted validation**, and the executable helper assertions were removed. Browser behavior acceptance belongs to the validation lane.

Main/validation lane owns fresh builds, browser interaction, noJS, keyboard, desktop/phone, VI/EN and visual review against the combined source. No builds ran in this lane to avoid concurrent output mutation. Source hooks: `details[data-indoor-guidance]`, its native `summary`, hydrated `select`, and `p[data-floor-relation="unknown|same-floor|different-floor"]`.

Representative multi-floor targets: `saigon-prototype-adidas` (L3/L4), `saigon-prototype-takashimaya` (B2/B1/L1/L2/L3); `vincom-prototype-zara` (L1/M), `vincom-prototype-hm` (M/L2). Use existing held-location destinations for no-marker coverage, not fixture lift data.

## Remaining route evidence

Walking routes remain withheld until reviewed walkable corridors, exact entrance/storefront access points, paired cross-floor connector endpoints and usable directions are available in a consistent map frame. Step-free paths additionally need verified accessibility and continuous access across every segment. No GPS, duration, distance, nearest-connector recommendation, invented line overlay or emergency routing is implemented.

Ask Matt routing, existing domain/stack/ADRs, issue0016/spec and issue0023 were read. Impeccable context had already run in the parent session; new-work's established-world rule, Operate guidance and craft-floor were read, and the incumbent mobile screenshot/CSS inspected before editing. Main owns bounded combined visual/review completion. No tracker changes, commits, canonical propagation, installs, external communications, push or deployment were performed by this lane.
