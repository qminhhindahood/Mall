# Replayable before-and-after motion comparison

Working local URL: **http://127.0.0.1:4450/review.html**. Choose a mall and recorded viewport, then **Replay both from the beginning**. **Freeze at the shopping podium** displays exact captured PNG frames, making the framing difference immediately visible. Playback is normal 1× by default; half-speed, pause, stage jumps, native video controls and optional loop replay are available. No app or OS preference changes are required.

## What visibly changed

1. **Saigon: lower podium focus.** The camera gives more attention to the retail base after the tall opening silhouette.
2. **Saigon: gentler zoom.** The final podium frame retains the right-hand shopfront and entrance where the previous camera crops them.
3. **Vincom: wider framing.** More frontage and the complete name/entrance remain visible before the floor reveal.
4. **Vincom: restrained lateral approach.** The final camera moves toward a broader front view instead of the old tighter oblique view.

These are targeted camera refinements. The architectural models, shared exterior fade and floor-reveal order remain familiar. The clips include floor selection, Discovery and the return for context; they do not present those as newly redesigned animation. The separate sticky-floor travel repair is recorded in prior source/regression evidence; this comparison's most obvious visual changes are the introduction cameras.

## Accurate sources

- **Before:** frozen pre-refinement source **19a9e34e7bec399f165ab704bcb0af803fab486e**. All 841 files across the two baseline outputs match the original motion delivery's hash manifests.
- **After:** final tested source **71e5def12a781513efd115045ba4f2f3a4cbaa3c**, final r3 evidence **8a21e16**. All 845 package files match their frozen output manifests; current runtime Git objects match tested source.
- [Provenance](provenance.json) binds the original receipt and directories. [Served-source checks](entry-conditions.json) additionally verify exact raw HTML bytes for both versions/malls. Fresh baseline servers 4451/4452 have no acceptance injection; final raw servers 4441/4442 were reused.
- The old reader 4385 compared intermediate motion-only candidate 51b690d. Existing recordings were inspected for sequence/provenance, but this new page uses **eight fresh recordings of the baseline and integrated final build**.

## Recordings and verification

Both malls × 1280×800 desktop / 390×844 phone × before/after, English, DPR1, normal motion. Each fresh browser context starts from the introduction with a controlled Pause choice; a public Resume action enables automatic rotation. The same timed native-scroll sequence follows. A temporary pre-roll marker is removed before the replay and used to trim browser-recording startup precisely. MP4 encoding preserves viewport dimensions. Raw WebM takes remain locally in `raw/`, Git-ignored; replay MP4s and capture receipts are retained. [Capture receipts](capture-results.json).

Final [viewer verification](viewer-results.json): **8 cases / 96 checks**, all 8 MP4 HTTP range responses, actual decoded-video frame/time advancement, pause/replay, chapter jumps, exact-frame freeze, half-speed controls, unchanged browser preferences/storage and responsive overflow checks pass. [Loop replay](loop-result.json) also passes. Tests cover 1440px and 390px review browsers, both malls and both recorded viewports, including browser-requested reduced motion.

[Entry checks](entry-conditions.json): six cases confirm saved Pause suppresses automatic rotation and Resume restores it; a reduced-motion request disables presentation; a direct Discovery URL starts past the introduction. These are isolated browser tests, not a diagnosis of the owner's actual OS setting. The viewer reports its current browser preference and plays only after an explicit action. Its own recordings/replay state are independent of app storage and route history.

Personally inspected source-resolution Saigon and Vincom podium pairs, selected-floor frames, and final desktop/phone viewer captures under `viewer-frames/`. The frame freeze uses exact PNG captures because a paused video can briefly show its prior decoded frame immediately after a seek. This is a review-artifact correction; no application fix was made.

## Preserved attempts and limits

The first full baseline take hit an over-strict recording-harness document-bounds assertion before encoding. That take/script/receipt remain in local `attempt-1-baseline-bounds/`; final captures log document bounds as observations. Historical baseline layout is not required to pass a new product test to be shown honestly. The first functional viewer batch passed, then visual inspection caught the stale paused-frame presentation. `initial-viewer/` preserves that batch. One new freeze assertion initially ran before image decoding completed; the harness now waits for the visible decoded images. Final confirmation passes all eight cases. No hidden or overwritten source failures are counted as product acceptance.

Measured renderer in captures: Chrome 149, ANGLE NVIDIA RTX 5060 D3D11. Clips are approximately 19–20 seconds each and 25fps browser recordings. They show composition and behavior, not native smoothness, 60fps, physical-phone, production or performance-budget acceptance. Start and stage-jump synchronization does not make differing render/load waits frame-locked. Reduced-motion and saved-pause handling of the application remains intact. Application/assets/config source, canonical checkouts and frozen older evidence remain unchanged. Local/unpublished; no dependency install, upload or deployment. **No remaining blocker.**

## Restart only the review server

From `D:/Midterm/.scratch/combined-discovery-motion-2026-10-19`:

```powershell
C:\node.exe evidence/motion-comparison-2026-10-20-r1/serve-review.mjs
```

Current process is recorded in [review-server.json](review-server.json). Check the existing 4450 listener before starting another process. The finished replay page needs only this packet's HTML/CSS/JS, JSON index, `videos/` and `frames/`; live baseline/final app servers are not required to replay it. Preparation/capture scripts are frozen one-time commands; do not rerun into this delivery. [Machine-readable delivery](delivery-summary.json).
