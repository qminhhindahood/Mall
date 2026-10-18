# Discovery handoff — 18 October 2026, r5

The owner's new screenshot exposed an intermediate transition bug missed by r4's endpoint checks. At 2000×792, when Discovery's top was about 696.955px (0.88 viewport height), the old full-size map remained at opacity 0.160008 and the old floor rail at 0.839992. This was reproduced in the shared T3 preview before changing source.

Explorer now completes the map's relocation and resizing while hidden. A separate reveal starts only after the old rail has cleared and the Discovery composition has settled. Reduced motion uses the same ordered states directly; the initial effect also reconciles the current scroll position. Reverse scrolling retains the same floor and reverses the handoff. Only src/components/Explorer.tsx changes.

## Verification

- All six public, fixture and research builds pass (builds.json and build logs).
- Existing bilingual journey matrix: 8 cases, 224 checks pass (browser-results.json).
- New intermediate regression: 8 cases, 256 sampled positions, zero findings (transition-results.json). Both malls, exact 2000×792 and 390×844 CSS viewports, normal/reduced motion, forward/reverse scrolling. Checks cover incoming heading overlap, old rail presence, premature map reveal and preview clipping. Representative frames are in frames/.
- Shared T3 preview: 32 forward/reverse samples in each locale at actual 2000×792 pass (shared-saigon-wide-final.json and shared-saigon-wide-vi-final.json). Programmatic scrolling explicitly dispatches scroll events to flush the scroll-driven state. This is sampled layout evidence, not native smoothness acceptance.
- T3 phone resize accepted 390×844 settings twice but evaluation still reported 2000×792. Repository Chrome/Playwright checks above verify the actual phone viewport instead. Chrome uses headless SwiftShader; no physical-phone or production-host claim.

before.json, shared-saigon-wide.json and shared-unflushed-attempt.json preserve preliminary attempts without reliable scroll-event flushing. Their stale states are not counted as final results. detector.json is diagnostic material. The valid pre-fix reproduction is the measured single point above. Native shared-preview stability and owner visual acceptance remain open.

## Boundaries

This supersedes r4's Discovery handoff timing only. Existing disputed-location holds, Highlights UI and pending real recommendation nominations remain. Source plans, geometry, exterior assets, public directory snapshots and content approvals are unchanged. Six built-output hashes and tested source hashes are in provenance.json. Local branch propagation is recorded in propagation.json. No push or deployment.
