# Multi-stage arrival: actual-model verification

21 October 2026; isolated redesign candidate after `1e1020d`. Parent owns build/revision identity and tracker updates. Assets remain `photo-polish-2026-10-12-delivery-r2`.

`check-arrival.mjs` tests the actual built models at Saigon `4490/en` and Vincom `4491/en`, normal and reduced motion, 1280×800 Chrome with software WebGL. **4 cases / 34 assertions pass**, recorded in `results.json`.

| Normal-motion sample | Saigon | Vincom |
| --- | ---: | ---: |
| First prepared stage metadata after navigation | 2234 ms | 832 ms |
| First visible playing sample after navigation | 5222 ms | 1922 ms |
| Playing-to-complete duration | 5502.5 ms | 5512.7 ms |
| Maximum progress while controls were not ready | 0 | 0 |
| Minimum camera distance / fitted sphere radius | 2.370 | 2.614 |

The first `data-arrival-stage` is written while the complete exterior prepares offscreen. That does **not** start the motion clock. `data-arrival="playing"` is the correct start marker. The sampled animation begins with the ready presentation; preparation remains at zero progress.

Both normal-motion cases observe `establish → facade → settle → complete`. The façade phase approaches the model materially and changes target/bearing, followed by a return to the exact registered neutral camera. The camera remains outside the rotated fitted sphere with more than the required 25% margin. Stage screenshots show a purposeful closer façade/podium composition with upper-building cropping; they do not show model penetration.

Normal motion finishes visually still. Keyboard input during the façade phase freezes progress, distance and target; two visible exterior screenshots remain byte-identical 300 ms apart. Manual zoom and reset work from that cancelled pose. Reduced motion prepares directly at the neutral complete stage and remains visually static. No page errors were observed.

Files: `*-establish.png`, `*-facade.png`, `*-settle.png`, `*-complete.png`, and `*-reduced.png` accompany the detailed traces. These checks do not establish physical-device or native performance acceptance. Timing values are observed local runs, not a model-loading benchmark.

After this build, the parent requested a small runtime background correction to match the new shell: Saigon `#f7f6ef`, Vincom `#f5f6f8`. That change is in source; these screenshots precede its rebuild. No model/assets, manual-control component, routing data, build output or Git commit was changed by this lane.
