# Interactive map/detail stability — r9

Scope: repair the owner-reported shop/map click blocker on both malls, preserving the accepted motion-off journey, geometry, disputed-location holds, assets and public content gates.

## Reproduced failures

`node evidence/interaction-stability-2026-10-18-r9/check-controls.mjs` went red in all four both-mall desktop/phone cases before editing. Saigon: select Annam Café from the collection (B2), then click Zoom in. The outside-pointer handler dismissed its detail and changed the map from B2 to the previous collection floor L5. Vincom likewise lost its shop/card. `controls-before.json` records the exact states. This is an actual pointer click, rather than the prior keyboard-only focus check.

The rendered before frames also show underlying list names, lines and buttons through long detail text, especially on the phone. The card reads as overlapping UI. Phone Expand was beneath the bottom sheet.

Ranked hypotheses after reproduction: (1) map controls excluded from the detail interaction region, predicting dismissal and floor restoration on pointerdown; (2) translucent reading surface, predicting text bleed even without a state change; (3) focus/placement side effects, predicting scroll/position movement when selecting areas or resizing cards. Code and browser state confirmed (1) and the rendered frames confirmed (2); (3) is hardened by non-scrolling SVG focus and remeasurement of committed card dimensions.

## Result

The complete persistent map is now part of the selected detail's interaction region. Zoom, angle, reset and expand retain the shop, floor and card; deliberate outside clicks and Escape still dismiss. Long detail content uses the existing opaque Porcelain reading surface, retaining glass on compact controls. Phone Expand is above the map art, within reach while a sheet is open. Card height changes trigger placement measurement; SVG pointer focus cannot scroll the document. Explicit section/floor navigation clears an old shared-area selection.

No region associations or source geometry changed. No claims of corrected physical shop locations, owner acceptance, publication or deployment.

## Verification

Six final public/research/fixture builds pass (`builds.json`). `provenance.json` binds four source SHA-256 values and the generated output hashes; its HEAD is the pre-commit baseline plus those explicit tested source hashes.

`check-interaction.mjs` exercises both malls at exact1280×800 and390×844, English normal motion and Vietnamese reduced motion. Each case opens a shop with a real pointer click, operates five map controls, expands/collapses the map, confirms opaque reading, closes with Escape/restores focus, selects three hit-tested SVG polygons, checks highlight/card/scroll stability, and deliberately dismisses outside. `browser-results.json` is the final receipt. Final desktop/phone frames were inspected together.

`first-pass-results.json` preserves an initial harness target failure: a phone collection heading was beneath the sticky map/sheet and could not receive a click. The final outside-dismissal test clicks a visible blank page gutter; no forced click or application relaxation. Earlier build attempts were interrupted before the final batch (one command had a Windows Python encoding error); final logs/builds.json supersede their incomplete output.

T3 own-tab snapshots failed twice with `Preview automation snapshot timed out after 15000ms.` The documented repository Chrome/Playwright workflow supplied the exact viewport/pointer evidence. These checks do not establish physical-device behavior, native screenshot fidelity, final owner appearance approval or production-host performance. See the separate finish-readiness receipt for the final broader runtime/release checks.

Final pointer matrix: eight cases / 192 checks pass, no findings. Accepted motion-off CSS/timing remain unchanged. Source files are explicitly identified in provenance.json; generated source manifests were restored from byte-equivalent public output after verifying JSON equality to HEAD.


## Delivery synchronization

Implementation/evidence commit a40c24aeae85ccc621a6201e29658f26ac20b14e. Four tested source files were SHA-256 verified against provenance before copying. Both site branches were clean first, then committed: Vincom 325d62389174c2832c54b799d0476381f3cce1d1; Saigon/Takashimaya d46447ec0cec43eb45d6404f983334f19ce4fbff. All four bytes match on both branches; see propagation.json. No content docs, assets or geometry copied. Root progress index and0016/0017/0019 receive the scoped delivery record while owner review remains pending; preexisting dirty root work is preserved.

Current review links: http://localhost:4355/en?review=interaction-r9 and http://localhost:4356/en?review=interaction-r9.


## Scoped owner acceptance — 18 October 2026

The owner explicitly answered **“The interaction blocker is resolved”** for the current repaired click behavior, in thread `a3ced64f-6d28-4cf6-ae29-1c22a669bcc1`. [Decision receipt](owner-decision.json) binds that scoped acceptance to the source/site revisions above. Earlier pending wording in this receipt is historical and superseded only for this click interaction. Motion-off acceptance remains separately recorded; no blanket whole-journey, content or release acceptance is inferred.

The owner rejected the proposed description style and requests informative overall detail in one or two sentences. The separate content lane is revising the proposal; roster/copy/Highlights decisions remain pending. This acceptance record changes no source, build output, geometry, public snapshot or site files.
