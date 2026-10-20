# Independent indoor-guidance review

Reviewer: Codex delegated integration reviewer. Date: 2026-10-19 UTC.
Scope: IndoorGuidance.tsx, indoor-guidance.ts, indoor-guidance.css, the DestinationDetails integration and navigation evidence, continuing isolated candidate c5658d2. Read issue0023, canonical visitor specification, technology stack, domain glossary and accepted destination/mapped-area ADR. Existing Impeccable audit guidance informs this bounded technical review; no redesign or source edit by this reviewer.

## Current verdict

The floor-comparison approach is supported and appropriately avoids fabricated routing. Both bounded findings below are resolved in the source follow-up. Fresh continuation renders at 7ce14e2 passed four cases / 36 scoped checks, with all eight frames inspected. A separate inherited non-dining cuisine-label defect was found and source-repaired in 3e505fb; its final rebuilt confirmation is recorded in `final-rendered-audit.md`. No personal owner-review gate is introduced.

## Findings

### P2: Multi-floor wording must describe the selected destination floor

IndoorGuidance.tsx currently says "The destination is on a different floor" whenever the selected target floor differs from the manual start. For Takashimaya selected on L3 with manual current floor B2, Takashimaya also occupies B2. The comparison logic is correct for the selected target, but the message can suggest the visitor must change floors to find a destination already present on their current floor. The Vietnamese message has the same ambiguity.

Minimal repair: label the target as the selected destination floor and explicitly compare that selected floor in both relation messages. Alternatively, add a separately supported "also on your current floor" message using destination.floors. Do not infer entrances or cross-floor connectivity. Verify with an actual multi-floor browser flow.

### P2: Preserve the browser-only behavior-validation boundary

navigation/audit-and-assert.mjs imports destinationFloorGuidance directly and asserts invalid-input, same-floor, cross-floor and output-property behavior across4108 checks. These are runtime-helper tests, despite the README classifying them as a data/build prerequisite. The canonical specification expressly excludes helper/unit suites below the browser seam.

Keep the source hashes, inventory counts, geometry metadata and archived circulation extraction as a data audit. Exercise runtime comparisons through browser controls, including the multi-floor edge case, and report those assertions separately. Do not count helper behavior assertions as data validation or browser acceptance.

## Source findings without defects

- No adjacency, distance, time, nearest connector, GPS position or accessible-route claim is computed. The helper only validates the manually supplied floor and compares it with an existing destination floor.
- The topology audit recognizes real partial Saigon entrance/escalator/elevator evidence while documenting why it is insufficient for a verified walkable graph. It does not claim those facilities are absent. Vincom image provenance and the archived-map limitations remain explicit.
- The target is constrained to destination.floors, otherwise primaryFloor. Primary floor is not described as an entrance. The requested locale and supported target floor are preserved in ordinary map links.
- Mapped guidance requires both area-confirmed certainty and a nonempty area list; floor-only holds remain unmarked. No geometry, destination roster or display hold is changed by these new files.
- Unknown manual start is the SSR and hydration default. useEffect enables the select only in the hydrated component; static/noJS HTML retains a native disclosure, destination floor, useful instructions and map link without an inert control.
- Native summary/select controls have labels,16px text,44px minimum height and visible focus styles. The status message announces a comparison rather than moving focus or navigating on select change. The detailed limitation directs visitors to mall staff without claiming verified step-free access.
- Manual floor state was initially local to the component; the source follow-up below records subsequent explicit, per-tab manual-start persistence. Existing route parsing/history code is unchanged. The locale prop updates all copy; browser validation should confirm selected manual state remains coherent across live locale/floor changes.
- The feature sits inside the existing opaque, scrolling detail body with the fixed title/close header. The prior ResizeObserver can respond to disclosure expansion. Final phone/desktop overflow and reachability still require rendered confirmation.

## Evidence boundaries

The navigation audit is archived/local evidence, not fresh on-site verification. The inspected counts are368 approved destinations,375 floor locations,195 floor-only locations and four multi-floor destinations. Source review is not a completed browser, screen-reader, physical-device or production-host check. Final delivery remains local and unpublished.

## Resolution and rendered confirmation

Source follow-up complete; rendered inspection awaits the final build-ready signal. The reviewer will perform one bounded fresh desktop/phone inspection and record outcomes here.

### Source follow-up: both P2 findings resolved

The EN/VI target and relation copy now explicitly say selected destination floor versus selected starting floor. A multi-floor destination can remain present on another floor without the message suggesting it is absent there. No path or connectivity inference was added.

audit-and-assert.mjs was removed. Its4108 helper assertions are preserved only as superseded, not accepted validation. The replacement audit-topology.mjs imports no runtime helper and computes static counts, source hashes and archive feature inventory only. Runtime behavior remains assigned to browser checks.

The new sessionStorage behavior is bounded and coherent: keys include mallId; restored values are validated against the current mall's floor IDs; invalid values and the unknown selection are removed; all storage access is caught so blocked storage cannot break manual comparison. Initial SSR/first hydration state remains unknown, and effects restore a saved manual choice afterward. The copy calls this a starting-floor choice retained for the tab, tells visitors to update it when moving, and explicitly disclaims position detection. The choice is neither put into shareable URLs nor treated as live location. Browser follow-up should cover reload, locale, destination/history, invalid storage and unavailable storage. No significant defect was found in this source review.

Official fallback links use fixed per-mall resources, with the Saigon locale included in its floor-plan URL. Vincom is labeled visitor information rather than falsely called a floor plan. External links include noopener/noreferrer and an accessible new-tab notice. The parent's fresh source-check provenance is recorded in navigation/README.md; this reviewer did not independently repeat that web retrieval. Neither resource is promoted into routing topology.

DestinationDetails suppresses the legacy destination.website link only when an actual verified-agent website field is present. The verified field's validated URL remains rendered in the accepted-information section; destinations without an accepted replacement retain the safely validated legacy link. This avoids duplicate/conflicting official links without removing the sole link from other records. Fixture handling is unchanged.

| Reviewed source | SHA-256 |
| --- | --- |
| src/components/IndoorGuidance.tsx | 08AF0ED0A8CA48CCDC29302C84025FA45814059AE1617C7E7324751C84F4EA4C |
| src/data/indoor-guidance.ts | 65A64A6F01FAB208656B072D30DD98F7CB7AF64F75299BA08C2823B45DE14C9E |
| src/styles/indoor-guidance.css | 357153457EF725948F0BF8BCF12AC047949D6366076F1AA872270F3BA9ADD253 |
| src/components/DestinationDetails.tsx | B23C0C9A88B81410D40C19093A38A61440D156E294D310805D8F284CBF1AF0E4 |

Subsequent copy-only follow-up: both manual-start help strings now qualify tab persistence with browser-storage availability, matching the caught-storage failure behavior. No new source defect found. Updated IndoorGuidance.tsx SHA-256:764CE6EFAD2268417E088338F8A42E33D84580E04BC3EE824C295E31E083069F. Final rendered/browser review remains pending.
