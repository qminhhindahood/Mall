# Motion and Highlights · 19 October 2026, r1

[Owner review](review.html) · [Highlights proposal](highlights-proposal.md) · [machine-readable ledger](highlights-proposal.json) · [source/site receipt](source-propagation.json)

## Result and exact candidate

Bounded Handoff 2 review of application **46f162a70da3fc7d4f6b632db7816e7801c790c9**, branch `integration/continuous-visitor-journey`. No reproducible application pacing, layout or interaction defect was found in this review, so no production code, directory, geometry or assets were changed. No speculative repair was applied to accepted behavior. The delivery consists of fresh evidence, a concrete owner decision surface and six proposed Highlights.

The handoff's old ports 4355/4356 are a superseded private 306-record candidate. Current public-format local outputs are **Saigon 4363 / Vincom 4364**, with both `/en` and `/vi`. They contain the later owner-approved 368 listings / 361 descriptions, seven offering-description holds and three excluded identity holds. The portable content packet from Handoff 1 does not reset that later approval.

The source receipt matches ten previously frozen source hashes and all **1,679 files across six existing public/research/fixture builds**, plus four live bilingual home responses against built HTML. Six scoped source/data files match both site worktrees exactly: Vincom **ff822020dc715954ae2adfc098557f1c3f9eb4ae**, Saigon **cb6516df7a79a1ce727d2492b803ca0329003f2d**. No propagation was needed because no application files changed. Earlier six successful build receipts remain valid for those exact bytes; they were not rerun or relabeled as new builds.

## Fresh validation

`npm run check`: 27 files, zero errors/warnings/hints. Existing browser suites were copied into this evidence directory so historical results stay frozen. Journey coverage was expanded to both motion preferences for **each** locale, instead of treating English as normal and Vietnamese as reduced.

| Receipt | Fresh result |
| --- | --- |
| `journey/browser-results.json` | 16 cases / 448 assertions; both malls × EN/VI × 1440×900 or 390×844 × normal/reduced. Centered stack, hover/rail, floor selection, retained map, invitation, Discovery, pointer/focus, reverse selection. |
| `interaction/browser-results.json` | 8 cases / 192 assertions; accepted r9 owner sequence: shop, zoom/angle/reset, Expand/collapse, repeated hit-tested polygon clicks, stable scroll/floor, Escape/focus, outside dismissal. |
| `approved-results.json` | 8 cases / 136 browser assertions plus 752 shipped-route checks, exact approved descriptions, holds, locations, no-photo/no-marker, categories and empty Highlights. |
| `area-history-results.json` | 4 cases / 20 assertions; direct-area Discovery, controls, Escape, history and language. |
| `fallback-results.json` | 16 cases / 126 assertions; no-JS, reduced/live preference, import failure and context loss. |
| `fixture-results.json` | 4 cases / 20 assertions; isolated fixture identities, shared areas and multi-floor behavior. |
| `reversal-results.json` | 8 normal-motion cases / 88 assertions; both malls/locales at 1280×800 and 390×844. Intermediate approach, rapid map/invitation/Discovery reversals; desktop keyboard and synthesized phone taps, zoom and Escape/focus. |
| `transition-results.json` | 16 cases / 512 forward/reverse intermediate samples; both malls/locales/sizes/preferences. No old-rail overlap, premature map reveal or visible-map clipping. |
| `pacing-results.json` | 8 normal-motion cases / 32 saved compositions; invitation entry/center, Discovery entry/settled, control hiding/return. |
| `paced-recording-results.json` | Four slower EN desktop/phone review captures / 44 confirmation assertions; both malls. Original rapid recordings/results retained separately. |

The main fresh suite totals **64 cases / 1,030 assertions**, all passing, plus the separately counted route, transition, pacing and paced-recording evidence. No test pass is an owner acceptance.

### Failures retained

The first fixture run could not connect to stopped ports 4337/4338. `fixture-results-servers-stopped.json` and `fixtures-servers-stopped.log` preserve all four failures. Started the existing exact `dist/fixtures/<mall>` outputs with `serve-static.mjs --acceptance`, then reran only the fixture suite: 4/20 pass. No source repair was required.

Two preparation commands failed before validation: an initial script-generation command used the root-relative path while already inside the app; a provenance script referenced nonexistent `FloorOverview.tsx`. Corrected the working path and used the actual `OverviewStack.tsx`; neither failure altered product files or produced a false pass. Final scripts and receipts are included.

## Visual observations and limits

Reviewed fresh desktop/phone frames for centered overview, hover isolation, quiet map, invitation entry and Discovery return. Labels and slabs remain paired; the old rail clears before Discovery; the map remains as the invitation arrives, clears at its center, and returns progressively. Both locales fit the tested viewports. No further aesthetic loop or unrequested redesign.

T3 preview opened the current Saigon page and returned a semantic snapshot. A requested 390×844 resize measured 390×844 via `innerWidth/innerHeight`, while tool metadata still reported a 1280×800 screenshot and `visible:false`. A later snapshot also showed a 375px content area. This inconsistent shared-preview presentation is not owner-visible or physical-phone acceptance. The repository's documented installed-Chrome workflow supplies exact viewport evidence. Chrome 149 / SwiftShader, mouse, keyboard and synthesized touch are explicit; native background return and production behavior remain not-run.

Rapid-pass frame diagnostics record zero loading-overlay frames **after readiness**, but Saigon p95 frame intervals were about 70–75 ms with maxima up to 180 ms during automation/software rendering. Vincom timings differed greatly. These are not trustworthy native smoothness benchmarks; no 60-fps or smoothness acceptance is claimed. Recordings include initial genuine preparation before the diagnostic window. Owner native appearance/performance review remains required; these measurements alone do not identify an application defect suitable for repair.

Sampled recording frames and original rapid videos are retained. The owner reader uses the slower four recordings in `recordings/paced/`. It identifies the exact source, malls, locale coverage and viewport scope, and asks separately for normal-motion appearance and Highlights selection/copy decisions.

## Highlights and integration-lane receipt

Propose **SC1 Dim Tu Tac L5**, **SC2 Phuong Nam Bookstore L4**, **SC3 Annam Gourmet B2**; **VC1 Chilli Thai B3**, **VC2 Runam Boutique B2**, **VC3 Pull & Bear L2**. The ledger includes each stable destination/category ID, supported individual area/floor, factual rationale, VI/EN recommendation text, hash-bound supplied evidence, identity/eligibility caveats and false approval flags. All are approved open basic listings with accepted descriptions, not unresolved/removed identities. Existing archived descriptive `highlights` fields are not used as endorsement approval.

**Selected IDs: none. Recommendation-copy approvals: none.** Integration must await the owner's actual response, retain stable IDs and all location/media holds, and revalidate against the then-current directory. Current runtime Highlight records have no recommendation-copy field; displaying approved recommendation text requires an explicit schema/rendering change in the integration lane, not a silent extra JSON property. Publication/deployment remains that lane's separate authorized work.

Issue 0020 is already closed for its factual inventory; it must not be treated as an unresolved coverage-decision blocker. Issue 0021's full brief still needs the remaining owner composition/appearance exchange under 0019. This delivery does not resolve or close 0021 or conduct its required grilling/domain-modeling exchange.

Accepted r9 click interaction and motion-off decisions remain intact. Exterior **photo-polish-2026-10-12-delivery-r2**, source floors **source-palette-schematic-2026-10-13-r2**, accepted r4 geometry and all five later display holds remain unchanged. No public-data mutation, push, deployment, release approval, issue closure or completion-percentage increase.

## Reproduce

From the app root, run `npm run check`; then `node evidence/motion-highlights-2026-10-19-r1/<script>.mjs` for the named check scripts. Public servers must serve frozen outputs on 4363/4364, and fixture servers on 4337/4338. `provenance.mjs` checks exact existing source/build/site bytes without rebuilding. `prepare-proposal.py` and `prepare-review.py` regenerate review-only artifacts from the accepted local packet. Do not edit frozen upstream approval inputs to make a proposal pass.
