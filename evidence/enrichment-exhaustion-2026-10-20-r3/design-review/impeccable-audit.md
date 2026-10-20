# Bounded Impeccable r3 technical audit

Date: 20 October 2026 UTC. Source: **71e5def12a781513efd115045ba4f2f3a4cbaa3c**, compared with **281f8d2**. Reviewer: delegated Codex `/root/r3_impeccable_review`. Scope: existing unpublished combined mall visitor candidate; no runtime, data, asset, canonical, tracker or frozen-packet edits. Asset revision remains **photo-polish-2026-10-12-delivery-r2**.

Guidance read: `C:/Users/PC/.agents/skills/impeccable/SKILL.md`, `reference/audit.md`, incumbent `DESIGN.md`, canonical visitor experience specification and technology-stack documentation, issue0023, and `evidence/combined-local-2026-10-19-r1/impeccable-audit.md`. The session's existing Impeccable context was reused; context/init and redesign were not run. The earlier typography repair remains in place.

## Implementation integrity verdict

**Pass. No significant scoped findings.** The reviewed source delta preserves the Porcelain/lacquer system, shared destination-detail body, opaque reading surfaces, source links and branch/brand-wide uncertainty. Cuisine additions use the same accepted/review gates as other fields and restrict cuisine to Dining. Menu and booking labels no longer promise that every destination action leads directly to an official transactional menu/booking endpoint. This audit verifies presentation and implementation boundaries; the independent content audit owns factual source acceptance.

The bundled detector was run once on `DestinationDetails.tsx`, `Discovery.tsx`, `IndoorGuidance.tsx`, `destination-details.css` and `indoor-guidance.css`: **zero findings**, recorded in [detector.json](detector.json). Existing wider CSS was reviewed in context; this result does not claim every source file was rescanned. No detector false-positive reconciliation is necessary.

## Audit health

Scores characterize this bounded implementation slice, using the prior audit's conservative scale. They are **not WCAG certification, complete product accessibility acceptance, a performance benchmark or release approval**.

| Dimension | Score | Verified evidence and limit |
| --- | --- | --- |
| Accessibility | 3/4 | Sampled factual copy, source notes, links and guidance controls compute to at least16px; persistent close is44×44px and remains hit-testable after long-content scrolling. Expanded native guidance, visible select focus, same/different-floor feedback and Escape dismissal work. Sampled opaque-panel contrast is6.79:1 or higher. Complete assistive-technology, keyboard-order and all-state contrast certification was not performed. |
| Performance | 3/4 | No new dependency, image, scene asset or layout-animation path in the five-file source delta; lazy scene import remains. New cuisine lookup is bounded by local directory size. No page errors in the eight browser cases. Existing scene/scroll work and raw data growth require broader runtime evidence; this is not native GPU/CWV certification. |
| Theming | 3/4 | Shared paper/ink/action roles and distinct red/brown mall accents remain consistent with DESIGN.md. The detail surface is opaque `rgb(255,253,250)`, not backdrop glass. Existing component literals remain. Dark mode is outside the selected product scope and is not reported as a defect. |
| Responsive design | 3/4 | Both malls, both languages,1280×844 and390×844: sixteen long-detail samples remain within viewport without document/panel horizontal overflow; scrollable body, readable hierarchy and reachable header/close persist. Tests use Chrome emulation with mobile/touch capability flags on390px; no physical-touch or synthesized swipe/drag claim, full text-zoom matrix or all-width certification. |
| Implementation integrity | 4/4 | Source gates, Dining-only cuisine, truthful floor-only/no-walking-route wording, source dates and scope disclosures remain coherent; detector empty. No introduced shortcut, invented route or product-system drift was verified. |
| **Total** | **16/20 — Good** | **P0=0, P1=0, P2=0, P3=0 in this scope.** |

## Fresh browser evidence

Run `C:/node.exe evidence/enrichment-exhaustion-2026-10-20-r3/design-review/capture-review.mjs` from the candidate root with fresh final public builds on Saigon4431 and Vincom4432. Uses installed Playwright from `file:///D:/Midterm/.scratch/impeccable-browser/node_modules/playwright/index.mjs` and local Chrome `C:/Program Files/Google/Chrome/Application/chrome.exe`, headless with SwiftShader enabled and reduced motion requested. There are **8 cases /160 passing checks,16 long-record samples,48 frames and zero page errors** in [results.json](results.json). No new dependencies or external browsing were needed.

Each case opens both a long Dining record with menu and a long retail record with catalogue, captures initial identity, expanded guidance and lower content, chooses same then different starting floors, measures scroll/header/text bounds, verifies accepted menu/catalogue action presence and dismisses with Escape. Representatives were selected deterministically by serialized enrichment length among menu/catalogue records, not as a claim of exhaustive longest rendered content:

| Mall | Representative ID | Enrichment fields | Purpose |
| --- | --- | --- | --- |
| Saigon Centre | `saigon-prototype-lusine` |7 | Long Dining details, contact/source/scope information, brand-wide menu and guidance |
| Saigon Centre | `saigon-prototype-newbalance` |5 | Long retail, catalogue/scope notes and products/services |
| Vincom Đồng Khởi | `vincom-prototype-bastahiro` |6 | Long Dining/source information, menu, floor-only guidance |
| Vincom Đồng Khởi | `vincom-prototype-bathbodyworks` |5 | Long retail, catalogue/scope information and floor-only guidance |

Personally inspected fresh source-resolution frames include:

- [Saigon EN phone guidance](frames/saigon-centre-en-390-dining-guidance.png), [Saigon EN desktop menu and notes](frames/saigon-centre-en-1280-dining-bottom.png), [Saigon EN desktop retail lower content](frames/saigon-centre-en-1280-retail-bottom.png).
- [Saigon VI desktop guidance](frames/saigon-centre-vi-1280-dining-guidance.png), [Saigon VI phone retail](frames/saigon-centre-vi-390-retail-bottom.png).
- [Vincom EN desktop initial detail](frames/vincom-dong-khoi-en-1280-dining-top.png), [Vincom EN phone retail](frames/vincom-dong-khoi-en-390-retail-bottom.png).
- [Vincom VI desktop retail initial detail](frames/vincom-dong-khoi-vi-1280-retail-top.png), [Vincom VI desktop guidance](frames/vincom-dong-khoi-vi-1280-retail-guidance.png), [Vincom VI phone guidance](frames/vincom-dong-khoi-vi-390-retail-guidance.png), [Vincom VI phone Dining lower content](frames/vincom-dong-khoi-vi-390-dining-bottom.png).

All other captured frame paths are indexed in results.json; they were generated and structurally checked, not individually claimed as personally inspected images.

One initial desktop guidance capture appeared to omit the leading B in Bath & Body Works. A single narrowly targeted reproduction was warranted by that observed anomaly: [verification script](verify-capture.mjs), [DOM measurements](capture-verification.json), [verification frame](frames/vincom-vi-1280-retail-guidance-verification.png). The complete title and paragraph render in the reproduction; the first-letter ranges hit their own text elements, document scrollX and panel scrollLeft are0 and document width equals1280. **No reproducible clipping defect established.** The original frame is preserved, not overwritten; no source fix or open-ended polish cycle followed.

## Contrast and motion

[sampled-contrast.json](sampled-contrast.json), reproducible with [calculate-contrast.mjs](calculate-contrast.mjs), calculates WCAG relative luminance from the saved live computed styles on the opaque detail surface. Ink16.55:1, muted6.79:1, Saigon action7.20:1, Vincom action7.90:1. These exceed4.5:1 for the sampled normal text. This calculation does not certify glass backdrops, all interaction states, map labels or every page element.

Reduced motion is intentional in incumbent source: `Explorer.tsx` reads the preference, disables motion Resume, passes the preference into runtime/journey logic and uses direct state transitions; journey/guide/introduction CSS remove specific transforms/transitions/cue animations while retaining the presentation and feedback. No global0.01ms animation kill is used in the reviewed styles. The fresh reduced-motion cases preserve detail, guidance and close state changes. Normal-motion composition is outside the changed UI delta and remains covered by historical motion evidence plus the parent's broader final regression; this reviewer did not claim a new normal-motion/GPU timing test.

## Positive findings, limits and next action

Long factual/source content uses a solid reading surface and a scrollable body under a fixed identity/close header. VI text retains its readable rhythm and wraps within the phone sheet. Native disclosure/select semantics, explanatory manual-location copy and explicit absence of verified walking routes preserve truthful guidance. Catalogue/menu scope notes stay adjacent to their actions, and the same shared body remains used for practical detail delivery.

No repeated/systemic implementation defect was verified. No remedial Impeccable command, redesign or further polish/retest is recommended. The bounded audit is complete. Parent-owned broader regression, noJS/static parity, all-record content acceptance and packaging receipts are separate evidence; this report does not replace them. Physical devices, real assistive technology, production hosting/native lifecycle and on-site topology remain untested limits, not owner-QA prerequisites for the authorized unpublished local completion. **No blocker remains for this audit.**
