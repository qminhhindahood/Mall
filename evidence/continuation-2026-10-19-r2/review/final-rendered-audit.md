# Bounded technical and rendered audit

Implementation integrity: pass. Coherent mall-specific system, with the one P2 content-label defect found in the fresh render batch now repaired and confirmed against rebuilt source 3e505fb. No remaining material review finding, redesign or further polish recommendation.

Reviewed source: 7ce14e29b48f451515792d28e4583ec387d9f986. Fresh capture began 2026-10-19T23:54:33.772Z in installed Chrome 149.0.7827.198, headless, reduced motion. Evidence: `rendered-review-results.json`, `capture-final-review.mjs`, and eight PNGs in `frames/`. These are continuation captures, not the earlier integration frames.

| Dimension | Score | Evidence and limits |
| --- | --- | --- |
| Accessibility | 3/4 | Native disclosure opens with keyboard; select is labeled, 16px, at least 44px high, with visible focus. Fixed close control remains hit-testable while expanded content scrolls. This is not a full WCAG or screen-reader certification. |
| Performance | 3/4 | New guidance performs bounded floor comparisons and storage reads; no routing engine or heavy dependency added. No device performance profile was collected. |
| Theming | 3/4 | Existing Porcelain surfaces, typography, borders and focus treatment retained. No new theme or dark-mode scope introduced. |
| Responsive design | 3/4 | Both malls at 1280px EN and 390px VI; long five-field records and expanded guidance retain usable scroll, close and final actions without page overflow. Emulated viewports; physical touch and arbitrary text scaling remain untested in this batch. |
| Implementation integrity | 4/4 | Truthful manually selected floor comparison, explicit topology/position limits, scoped evidence and source attribution. Inherited non-dining cuisine label repaired and confirmed. |
| Total | 16/20 | Good; bounded repair confirmed. |

The parent's once-run detector result in `impeccable-detector.json` is empty. It does not detect semantic content mistakes, so the manual rendered finding below remains significant. No detector rerun was necessary.

## Verified finding

P2 — Non-dining destinations display cuisine metadata. In `src/components/DestinationDetails.tsx`, Shiseido (Beauty/category-8) displayed “Cuisine: Japanese” / “Ẩm thực: Nhật Bản” from legacy directory metadata. `src/components/Discovery.tsx` also preferred that metadata over the actual category. This misdescribes a cosmetics shop. Fresh evidence: `frames/vincom-dong-khoi-en-1280-guidance.png` and `frames/vincom-dong-khoi-vi-390-guidance.png`.

Minimal repair applied by the parent in 3e505fb: both rendering sites now use cuisine only for category-1 (Dining in both malls), preserving source data and showing the true category for other records. The reviewer inspected both guards. Final rebuilt check must confirm Shiseido has no cuisine label and a dining record still has cuisine. This is a bounded content-clarity repair; no styling changes are needed.

Resolved: `confirm-cuisine.mjs` ran against the freshly rebuilt public output at 2026-10-20T00:01:29.803Z, Chrome 149.0.7827.198, source 3e505fb. All four checks passed: Shiseido omits cuisine and Gogi House retains it, in English desktop and Vietnamese phone layouts. The Vietnamese label uses the actual Unicode text. Receipt: `cuisine-confirmation.json`; two confirmation frames: `frames/vincom-en-1280-cuisine-confirmed.png` and `frames/vincom-vi-390-cuisine-confirmed.png`, both visually inspected. This was the sole repair confirmation pass; no further polish loop.

## Rendered outcomes

All four cases / 36 targeted checks passed. The reviewer visually inspected every fresh frame, including both malls' guidance and five-field accepted-information records. Long English/Vietnamese services, provenance and uncertainty text remain readable. The phone sheet shows a portion of long content at a time but scrolling reaches official information and final actions while the opaque heading/close control remains fixed. No additional material visual defect was found.

Manual-start guidance is clearly distinguished from detected position. Same-floor comparison is scoped to the selected target, and no route, turn, distance, timing or accessible-connector promise is shown. Official fallback resources remain reachable. Existing field scope and uncertainty remain visible rather than replaced with unsupported branch certainty.

Source review and release-script findings are recorded separately in `indoor-guidance-review.md` and `release-source-review.md`. Broader no-JS, blocked-storage, locale/history and multi-floor browser acceptance belongs to the validation agent's final results; this 36-check visual batch does not substitute for that matrix. Delivery remains local and unpublished.
