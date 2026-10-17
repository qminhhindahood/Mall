# Integrated Discovery — 17 October 2026

Revision `discovery-integration-2026-10-17-r1`; application commits `a4dc9b9`, `aa38848`, from baseline `6072493` on `integration/continuous-visitor-journey`. Implements the owner's chosen A list/map structure in the shared Astro/React application: optional visible-by-default categories, complete floor-grouped collections, search/floor filters, persistent map, numbered source-supported regions and floating glass details. Selection preserves Discovery; close restores browsing context/focus/scroll; locale switches preserve selected details. Multi-floor links and shared-area chooser reuse the common selection state. Map zoom/expand remains available. Missing descriptions, photos and precise locations are not fabricated.

Research inputs are explicitly opt-in: `INCLUDE_TEST_FIXTURES=research MALL_ID=vincom-dong-khoi npm run build` (or `saigon-centre`; use PowerShell environment assignments on Windows). Preview outputs are `dist/research/{mall}`; serve with `node scripts/serve-static.mjs --mall {mall} --dir dist/research/{mall} --port 4333 --acceptance` (Saigon port4334). Public build omits the fixture variable. Both public release manifests remain `directoryApproval:pending`, `releaseApproved:false`. See [input reconciliation](../../docs/content-preparation/discovery-integration-2026-10-17/README.md).

## Validation

- TDD public browser seam: before integration the complete-collection selector was absent (red). `tests/browser-discovery-checks.js` now passes complete collection, visible/default category toggle, floating card, persistent map, pointer language switch retaining selected identity, close retaining language/restoring focus, and horizontal overflow checks. Regression coverage added for the independent review's language findings.
- `npm run check`: 0 errors, 0 warnings, 6 inherited hints in earlier evidence scripts.
- Six builds passed: both malls × research / synthetic fixture / public. After the locale/direct-entry fixes, research and public builds passed again for both malls. Synthetic builds refer to `a4dc9b9`; research/public refer to `aa38848`.
- T3 collaborative browser only, tab `tab_h_a8132feb-a38e-4995-a781-2bb53b08770e`: Vincom desktop1280×800 VI→EN with deliberate import failure and EN→VI with normal3D; Saigon phone390×844 EN→VI with deliberate import failure and VI→EN with normal3D. Complete Dining counts42/49, respectively. Default categories, hide/reopen, selection/card, map retention, locale/close/focus and overflow checks pass in all four cases. Direct `?view=discovery` entry preserves section after preparation/failure.
- Normal3D ready checks pass with complete-frame evidence: Vincom `discovery:B3`, frame54; Saigon `discovery:L5`, frame56. These are functional samples, not performance/whole-journey acceptance.
- Saigon phone source-region click highlights the selected map area, opens Dim Tu Tac details, retains the same SVG and fits the card inside390×844 (height371.36px). Empty search serializes `collectionQ=zzzz-no-match`; Back restores the collection. No horizontal overflow.
- All12Vincom categories checked at1280px: distinct identity counts35,42,2,1,3,3,8,15,27,2,1,4; no six-item truncation/overflow. Fashion has37floor rows representing35identities.
- [Static output check](static-output-check.json) verifies both-language generated destination HTML for all143Vincom/163Saigon preview identities without executing JavaScript, useful public SVG/links, fixture isolation and pending/unapproved public manifests. Reproduce with `python evidence/discovery-integration-2026-10-17/verify-outputs.py` after builds.
- `git diff --check` passes. Logs are local transient evidence, excluded from commits.

T3 reports the tab as visible:false while page `document.visibilityState` is visible; normal ready assertions use the document state. Snapshot capture timed out after15000ms; no screenshot-based visual acceptance is claimed. No standalone Chrome/Playwright was used. Earlier bootstrap browser helpers have stale selectors and are not claimed as passing current-journey acceptance. Native scrolling/performance, full browser range and owner rendered acceptance retain their existing0013/0014/0017 gates.

## Standards

Independent source review of `6072493...a4dc9b9` found one P2: closing details restored the old locale, violating the stack's preservation requirement. Fixed in `aa38848` by retaining the current locale while restoring collection context; browser regression passes.

## Spec

Independent source review of the same range found two P2s: outside pointer dismissal closed details before a locale click; restoring the pre-open selection reverted the current language. Both violate canonical locale/destination context preservation. Fixed by exempting locale links from outside dismissal and retaining current locale on close; browser regression passes. No public content-gate violation found. Missing reviewed copy/photos/final mappings remain acknowledged release blockers.

Review totals: Standards1 finding (P2, fixed); Spec2 findings (P2, fixed). Owner-confirmed missing materials are not approvals. Exterior `photo-polish-2026-10-12-delivery-r2`, geometry `source-palette-schematic-2026-10-13-r2` and public `directory-pending-2026-10-14-r1` are unchanged. No deployment or push; full ticket/release remains open.
