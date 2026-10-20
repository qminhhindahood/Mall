# Continuation validation — final local pass

Source **3e505fb**, 20 October 2026. Four sequential builds passed. The final run completed **172 browser cases / 2,428 assertions**, **752 static route checks**, **1,316 exact localized accepted-field checks**, and **four public/fixture isolation checks**, with zero final failures. It captured **124 fresh screenshots**. [Machine summary](validation-summary.json), [execution receipts](suite-execution.json), [source/output hashes](provenance.json), [builds](builds.json).

Frozen packaging inputs: 91 files, digest `0762d9f65cdfaf6f2b1f5c7e8f9c21016379dd5cc9348d95a128d4d7703a3aae`, copied in [frozen-build-inputs.json](frozen-build-inputs.json). All 63 tracked application/data/build source files match the source checkpoint after CRLF normalization; raw and normalized hashes are retained. Accepted payload: **658 fields / 281 records**, SHA-256 `25ac0766a17bb0f05af40967136f43c7bab737201f7b8ddbb0fe80c11832de94`. Both build-mutated asset manifests were restored byte-for-byte; asset revision remains **photo-polish-2026-10-12-delivery-r2**.

| Browser suite | Cases | Assertions |
| --- | ---: | ---: |
| Discovery/search/categories/details | 60 | 524 |
| Indoor guidance | 36 | 728 |
| Cuisine and website precedence | 4 | 70 |
| Map pointers/controls | 8 | 192 |
| Fixtures | 4 | 32 |
| Essential detail parity | 4 | 64 |
| Responsive search review | 8 | 92 |
| Entry controls | 4 | 44 |
| Area/history | 4 | 20 |
| Fallback/loading | 16 | 126 |
| Full journey | 16 | 448 |
| Rapid reversals | 8 | 88 |
| **Total** | **172** | **2,428** |

Both malls, EN/VI, desktop/390px, normal/reduced motion, search/category/floor context, direct destinations, map controls, history, loading/import/context failures, and native no-JavaScript fallbacks are covered by the existing browser harnesses. Guidance adds manual same/cross selected-floor comparison, multi-floor target scope, floor-only holds, keyboard disclosure/select, session persistence across locale/destination/history, per-mall isolation, invalid saved IDs, Unknown clearing and unavailable-storage fallback. Original detail text parity stays exact outside the new guidance subtree; static guidance target/limits/official fallback receive separate checks. See [harness adaptations and preserved failures](harness-notes.md).

## Fresh rendered evidence

- [Saigon EN accepted details](frames/saigon-centre-en-approved-menu.png) and [VI phone](frames/saigon-centre-vi-approved-menu.png).
- [Vincom EN accepted details](frames/vincom-dong-khoi-en-approved-menu.png) and [VI phone](frames/vincom-dong-khoi-vi-approved-menu.png).
- Guidance frames are in [guidance-frames](guidance-frames/); journey frames in [journey/frames](journey/frames/). Only files written after the final execution started are counted as fresh.

## Preserved failures and provenance

The complete earlier 7ce14e2 run state is archived under [superseded-7ce14e2](superseded-7ce14e2/). Its 36 guidance cases/728 assertions passed; broad coverage was incomplete. Its 66 stale static assertions required legacy website URLs despite accepted replacement fields. The final harness retains exact accepted value/action/source/date/caveat checks, requires legacy website fallback only without an accepted replacement, and adds live replacement action/scope/source/caveat/duplicate checks. Saigon has no legacy-only website representative; Vincom Manwah exercises that fallback.

Independent review found a real inherited P2: non-dining cuisine metadata. Source 3e505fb restricts cuisine to Dining in both details and Discovery. The four final repair cases confirm non-dining absence and dining presence in hydrated/static details and Discovery metadata. The prior run was stopped using a verified runner path/start and its owned process tree; [stop receipt](stopped-first-run-processes.json) records 19 stopped processes and zero remaining, without stopping preview servers. No failure was silently discarded or counted as a final pass.

[Canonical verification](canonical-after.json) confirms all three canonical HEADs, tracked runtime file hashes and status remain unchanged. Existing delivered previews 4401/4402 serve preserved 370be91 snapshots; all four bilingual page hashes remain exact in [preview verification](delivered-preview-after-restart.json). Current public acceptance ports are 4421/4422; fixture ports are 4423/4424. Acceptance helpers are intentionally injected there. Raw package previews 4411/4412 belong to the separate release lane.

Open server logs are excluded by exact filename in `.gitignore`; [frozen log hashes](server-log-freeze.json) preserve twelve immutable receipt copies without restarting servers. Other test/build logs remain ordinary evidence.

## Raw package follow-up

After local packaging, a separate bounded smoke on actual raw previews **4411/4412** passed **four cases / 52 assertions**: both malls, EN desktop and VI phone, direct Meat & Meet destinations. Exact localized details, keyboard guidance disclosure, manual starting-floor selection/session persistence, unchanged destination URL, official fallback/route limits, overflow and uncaught errors all passed. Both raw HTML and browser network/DOM checks confirm no acceptance helper was injected, loaded or requested. [Raw package receipt](raw-package-browser-smoke.json), [purpose-built harness](check-raw-package.mjs), and four fresh frames in [raw-package-frames](raw-package-frames/). This is separate from the 172-case acceptance-server regression above; it required no source or build change.

## Limits

These results use local installed Chrome with software rendering and viewport/reduced-motion emulation. They do not establish physical-device, native lifecycle, production performance or release acceptance. Walking corridors/connections, position detection and accessible routes remain unverified and are explicitly withheld. Prior r1 512 transition samples/32 pacing compositions remain historical evidence, not fresh r2 counts. No unit/private-helper assertions are counted. No push, deployment, canonical propagation, source commit or tracker edit was performed by this validation lane. Packaging remains the parent's next step; no validation blocker remains.
