# Motion pacing — 18 October 2026, r7

Impeccable animation refinement of the existing Porcelain journey, following the owner's request to fix all findings in the focused r6 review. No subagents. The accepted motion-off transition remains the baseline.

## Delivered behavior

Normal motion uses a shorter map hold (120svh), an 80svh invitation and 8svh separation. The presentation map now fades in response to the actual invitation heading, rather than the earlier container boundary. It remains visible as the heading arrives and clears before the centered invitation. This removes the measured empty-screen pause. The invitation surface is transparent only during normal motion so it cannot prematurely cover the fading map.

The hidden map still finishes resizing before Discovery entry. The Discovery scene is selected before the reveal starts; the reveal now spans 0.75 viewport height down to the settled desktop top, with a separate phone endpoint at0.4 viewport height. At800px tall, the desktop reveal spans416px rather than176px; at844px tall, phone reveal spans295.4px rather than40px. Map controls hide while the map fades and restore at full presence, keeping them clear of the invitation headline. Reverse scroll follows the same geometry without timers or input capture. No new dependency, automatic loop, blur animation or geometry change.

Reduced motion retains the previous CSS dimensions/margins, invitation container-based exit and original scene/reveal thresholds. The control-hiding flag is false for reduced motion. Public no-JS defaults remain visible.

## Verification and bounded visual work

The first batched desktop/phone inspection found the initial exit still too early. The correction aligns it with the heading. Confirmation caught the persistent control bar intersecting that heading; its visibility was corrected and checked explicitly in the final targeted regression. This is a concrete defect correction, not another design direction. No further aesthetic iteration was performed.

Final six builds pass: public, fixture and research for both malls. Final journey matrix:8 bilingual desktop/phone cases,224 checks. Final transition matrix:8 cases,256 forward/reverse sampled positions at2000×792 and390×844 in normal/reduced motion. Final pacing inspection:4 cases/16 recorded compositions, actual1280×800 and390×844 on both malls, checks for retained map on invitation arrival, hidden map at centered invitation, progressive Discovery return, and control visibility/restoration. See builds.json, browser-results.json, transition-results.json and pacing-results.json. Final rendered frames are in frames/.

first-pass/ records exploratory results, not final-revision proof. Detector-final.json contains18 preexisting advisory palette/type findings and zero non-advisory findings; none is on newly added CSS. This scan does not establish visual quality by itself.

T3 preview was checked and used for the live baseline; its prior phone resize mismatch is documented in r5. The repository's existing Chrome/Playwright workflow supplies exact phone/desktop final frames and regression sampling (Chrome149, headless SwiftShader, CSS viewports). These are not physical-device, native smoothness, production-host or owner motion-on acceptance. Scoped source checks and final normal/reduced matrices preserve the accepted motion-off behavior; no full-product acceptance claim.

## Revisions and boundaries

Only src/components/Explorer.tsx and src/styles/journey.css change. provenance.json records tested source and all six output hashes; propagation.json records exact byte copies to both primary site branches. Existing location holds and Highlights eligibility/empty states remain. Real recommended-place nominations remain pending. Source geometry, exterior assets, frozen acceptance packets, public directory snapshots and approval states are unchanged. No push or deployment.
