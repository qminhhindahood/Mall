# First bounded shared routing migration

Data-only migration; UI integration and network expansion are separate. New source files:

- `src/data/routing/contracts.ts`: endpoint, source-frame, directed-arc, anchor, floor-leg, localized/manual-step and result contracts.
- `graph.ts`: source/structure/association validation, generic directed BFS, anchor references and source-pixel→SVG coordinates.
- `reviewed-network.ts`: adapter from frozen reviewed fixtures to the shared schema.
- `reviewed-fixtures.ts`: explicit snapshot of the existing same-floor graph and separately authored CK/MLB directions/translations. No new instruction or reverse direction inferred.
- `coverage.ts`: per-location coverage plus derived ordered reachability for every eligible origin/target.
- `scripts/audit-shared-routing.mjs`: explicitly requested authoring guard, fixture-parity and exhaustive coverage checks. It transpiles only data modules into a temporary directory; it does not build or change Astro output.

Existing `area-routing.ts`, `plan-routes.ts`, `JourneyAtlas.tsx`, `site.ts`, geometry, directory and source assets were not modified by this migration owner. Other concurrent lanes own site/geometry/UI changes. All runtime source writes paused before the parent's build start.

## API for integration

```ts
const graph = createReviewedRoutingNetwork(site);
const result = planSharedRoute(graph, {from, to});
const coverage = routingCoverage(site, graph);
```

`createReviewedRoutingNetwork` needs the full source-bearing geometry, not `clientSite`'s stripped geometry. It validates the compiled reviewed data against active mall/floor/source hash/dimensions/transform and active destination area associations. Build/construct once from trusted reviewed data before serialization to React. Catch source drift at the integration boundary to retain the ordinary guide with unavailable guidance. The generic `planSharedRoute` expects a validated trusted network; it does not authenticate arbitrary user-supplied graph data. `validateRoutingNetwork(graph, site)` provides source and active-area validation; omitting `site` performs structural validation only.

Endpoint references are explicit:

```ts
// Reviewed destination approach; no approachId means resolve exactly one or fail closed.
{kind:'destination', mallId:'saigon-centre', floorId:'L2', destinationId:'saigon-prototype-calvinklein'}
// Landmark IDs include their floor to avoid accidental cross-floor merges.
{kind:'landmark', mallId:'saigon-centre', floorId:'L5', endpointId:'landmark:zone-a@L5'}
// Vincom: endpointId:'landmark:escalator@B3'
```

Legacy Atlas `landmark:zone-a` / `landmark:escalator` choices need an integration adapter adding their explicit floor. Existing destination/floor handoffs remain usable. `from:null` returns `origin-required`. Unknown/mall/floor/ambiguous/unreviewed/disconnected endpoints return a typed unavailable result; there is no nearest-node, alternate-floor or default-origin fallback.

Ready results contain ordered `arcs`, `legs` (`floorId`, `sourceId`, source-pixel `points`, arc IDs), and localized `steps` (`floorId`, `instruction`, optional `transferTo`, arc ID). Paint each leg through `routePointToMap`; advance floors only after explicit manual confirmation of transfer steps. Existing public-area, doorway/metric/live-location and lift-operation limitations remain. No entrance anchor is included in this first dataset.

## Evidence

`node scripts/audit-shared-routing.mjs` passes **48 checks** after the independent-review guard repair. `checks.json` preserves the receipt; `coverage.json` contains all368 destination rows and their locations, approaches, directed connectivity and plan-based availability. Exhaustive queries include every listing-floor as both candidate origin and target, plus the permitted landmarks: **71,300 requests** (Saigon29,070; Vincom42,230).

The exact reachable ordered pair set remains nine, not merely a matching total: Saigon landmark→three L5 areas and separately authored CK L2↔MLB L3; Vincom landmark→Siam Sugar, Chang Kang Kung, Chilli Thai and Highlands B3. All other listing queries remain unavailable. Public-entrance nodes remain zero. Coverage uses current active content/derived-directory readers, so newer non-routing location associations do not become routes.

Checks preserve exact same-floor localized instructions and cross-floor source points, floor legs, both direction-specific instruction sequences and manual transfer targets. Negative cases reject mall/floor/source hash/transform drift, missing nodes/endpoints and unreviewed entrances. Removing one transfer arc removes its journey while preserving the independently authored reverse. Scoped TypeScript diagnostics for the new routing modules: **zero**. No full build or browser acceptance of the new API is claimed here; parent owns integration/build/browser checks. Independent source review requested after this freeze.

Expansion requires a separately reviewed data revision, explicit outbound approach permissions and independently authored reverse arcs/text. This first adapter does not activate the newer B3 extension packet or infer any public entrance. Exact doorway/current operation/accessibility/distance/time and whole-mall route completeness remain unestablished.

Independent review reproduced the first40-check receipt and found that CK/MLB only required some mapped area on the correct floor. The repair now binds CK to `research-l2-l2-02-03` and MLB to `research-l3-l3-31`. Another legitimate same-floor area invalidates the existing graph and cannot retain either cross-floor route through the factory. Added explicit connector registry records: mall, review identity, reviewed landings and separately accepted directed transfer tuples. Nodes, anchors, walks and transfers must reference their source/connector review identities consistently. Eight additional rejection checks cover these guards. The registry and source review declarations remain trusted compiled review data, not authentication of arbitrary user-supplied graphs. Source writes paused again before parent rebuild; independent retest requested.
