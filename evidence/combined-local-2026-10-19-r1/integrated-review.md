# Independent combined source and rendered review

Reviewer: Codex delegated integration reviewer. Date: 2026-10-19 UTC.
Scope: local unpublished combined candidate based on 19a9e34, Discovery source 5e00d65 and motion source 51b690d, plus the bounded repairs and delegated enrichment acceptance below. The user delegated local review judgment; this report does not invent a personal owner decision or publication authorization.

## Verdict

No remaining blocking finding in the reviewed source and eight fresh frames. Local rendered appearance is accepted for this scope under delegated judgment. This is not physical-device, native-GPU performance, production-host, or release acceptance.

## Findings resolved

- Selected-floor travel: the earlier Saigon 1920px frame placed the floor partly below the viewport with a mostly empty screen. JourneyMotion interpolated toward the destination map's off-screen top. The repair targets the settled sticky content position, accounting for dynamic sticky top, child offset and padding; non-sticky layouts retain their actual position. Fresh midpoint frames for both malls at 1920px EN and 390px VI show the complete slab within the viewport, clear of the header, without a duplicate rail. At Saigon desktop progress 0.5, the travelling layer bounds are top 260.08px and height 431.43px in a 1080px viewport, even while the actual target is at 1226px. See entry-controls-results.json.
- Static fallback description: Explorer now updates only the direct-child static-guide disclosure. It no longer overwrites the first destination description before a failed 3D load exposes the static guide. Targeted browser checks confirm the exact description survives.
- Fixture isolation: both accepted and provisional enrichment imports now exclude fixture builds at compile time. The provisional import also requires the explicit review flag. The earlier dual-flag loophole is resolved in source.

## Source and information review

The collection scope is parsed and serialized consistently through URL, locale, history and detail navigation. Shared scene/canvas ownership is unchanged. The accepted enrichment file contains 32 fields: 30 unchanged accept decisions plus PNJ and Watsons replacement links, matching content-decisions.json. Rejected original values are not promoted into normal output. Branch-specific versus brand-wide applicability and source uncertainty remain explicit. The UI does not claim personal owner approval.

The shared detail body remains present in Discovery, map details and static/no-JavaScript HTML. The ordinary View on map link preserves destination identity; the targeted browser check confirms Back restores the Discovery detail URL and body.

## Frames personally inspected

- frames/saigon-en-1920-selected-floor-travel.png
- frames/saigon-vi-390-selected-floor-travel.png
- frames/vincom-en-1920-selected-floor-travel.png
- frames/vincom-vi-390-selected-floor-travel.png
- frames/saigon-centre-en-approved-menu.png
- frames/vincom-dong-khoi-en-approved-menu.png
- frames/saigon-centre-vi-approved-menu.png
- frames/vincom-dong-khoi-vi-approved-menu.png

Desktop detail cards retain a legible fixed identity/close header and opaque scrolling content alongside the map. Phone sheets retain readable Vietnamese text and a reachable close control; the collapsed map context and expansion action remain above the sheet. Partial lines at the scrolling content edges are expected clipping inside the reading viewport, not lost content. No visual repair is required in these frames.

## Supporting checks inspected

- builds.json: four public/fixture mall builds exit 0.
- entry-controls-results.json: four cases / 44 passing checks, including intermediate floor visibility and direct-entry/history behavior.
- detail-parity-results.json: four cases / 58 passing checks, including no-JavaScript parity, exact fallback descriptions, View on map / Back, long descriptions and reachable share controls. The initial VI assertion failure and its harness-only correction remain in detail-parity-initial-results.json and related logs; it was not an application repair.

Broader runtime suites are owned by the validation agent and are not independently re-executed or claimed complete in this report. Static frames establish composition, not animation smoothness. No code was changed by this reviewer; only this report was added.

## Reviewed source SHA-256

| File | SHA-256 |
| --- | --- |
| src/components/JourneyMotion.tsx | 78589FF57D6821045BEA5330147C212A01911223E2A7D97AB4F7488970512B92 |
| src/components/Explorer.tsx | 8E9BAD31ECDE8ADA082F3B6B88F732C9FC8729CB2D313E907B32380BBD4898B8 |
| src/components/DestinationDetails.tsx | DC996761432C21BD2954A7550AE2C9B7A6132E6EE877309446C267419506D44F |
| src/data/enrichment.ts | 5CC419EE3E0F242D109FA43E93C8AA5F6618FEEEBFB2FC17086E3D6AA6628B2A |
| src/data/enrichment-accepted.json | 22D73276C8AE529536665B2C54EC06236F088FD8ADA80A07D57CB7D72C839B69 |
| astro.config.mjs | 22B00C813001A83E91B03A0F10CAF704E30743165378CF5A316CC9EF4DE2D69A |

## Subsequent scoped typography confirmation

Source370be91 adds only the bounded Discovery text-size correction reviewed in impeccable-audit.md. The final confirmation inspected both mall outputs at1280px EN and390px VI:28 sampled text values compute to16px, no document overflow, and no significant layout regression in four new frames. Discovery CSS SHA-256: A9BEE3EBB73A7E65A4A2C9768A2886C5EA7E4908D3154F35DF34CDAA7BA73A1A. Earlier source hashes and eight-frame observations above remain valid historical evidence; the separate audit records this subsequent change and closes its P2. No additional redesign or publication authority is implied.
