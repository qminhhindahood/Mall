# Vincom retail A — official-source research r3

Date: 20 October 2026. Scope: the exclusive `queue.json`, 74 frozen destinations and 311 fields. This lane writes evidence and candidate proposals only. It does not approve personal owner decisions, edit runtime data, publish, change the roster, or change location/asset decisions.

## Outcome

- 311 unique queued field keys reviewed: **161 proposals, 150 explicit holds, zero unresearched reclassifications and zero global-unavailable claims**.
- `records.json` contains candidate fields with `pending-delegated-review`; `decisions.json` has one outcome for every queued key, exact target, source/receipt bindings, the actual targeted search query, reasoning and remaining resolution action.
- `validation.json` verifies exact queue coverage, uniqueness, source-file existence, proposal scope and numeric bilingual phone equivalence.
- `baseline-preservation.json` verifies all **658 accepted baseline field objects unchanged**, with identical baseline/current file SHA-256 `25ac0766a17bb0f05af40967136f43c7bab737201f7b8ddbb0fe80c11832de94` at the read-only check.

## Review packets and precedence

1. `chunk-01-records.json` / `chunk-01-decisions.json`: immutable first 20 keys.
2. `amendment-01-phones.json`: replaces three initial phone holds with explicit brand/distributor support contacts.
3. `chunk-02-records.json` / `chunk-02-decisions.json`: immutable remaining 291 keys.
4. `amendment-02-new-phone-catalog.json`: replaces the Vincy phone and Daniel Wellington catalogue holds after further actual-source inspection.
5. Current aggregate `records.json` / `decisions.json` apply these amendments and supplemental locator-attempt evidence. Archive-reused catalogue/offer sources retain 19 October source-check dates with 20 October review dates.

Independent reviewer: `/root/content_audit_r2`. No proposal is self-promoted to agent-accepted. Immutable review chunks are retained even when the aggregate incorporates an explicit amendment or corrects metadata.

## Source evidence and bounds

`source-text/` preserves raw web tool responses as JSON strings, plus structured `targeted-*.json` search receipts containing the exact targets, actual queries and full returned response. Initial official identity/mall/brand searches precede direct category, catalogue, locator and contact reads. Existing r2 Vincom receipts, content audit and the shared accepted-source index were inspected before new research; same-brand catalogue reuse is scoped to brand-wide roles and never transplants another mall's practical values.

Specific product offerings support the runtime **Products / services** summary. A readable product catalogue supports the catalogue action; generic article/homepage/locator titles and dynamic navigation shells do not automatically establish that role. International source ranges retain international-market caveats. Phone proposals distinguish dedicated branch blocks from clearly labelled national/distributor support contacts; support opening times are never converted to shop hours.

Holds record precise identity, authority, contradictory/index-only values, unavailable actions or incomplete actual-source retrieval. Examples include unrelated `gnc.com.vn` fertilizer identity; RHYTHM versus UNI.WATCH counter applicability; PANTIO's actual official February 2025 relocation notice; Seha's mall shell without concrete offerings; mixed Photo Time/Koala/Photo Objet/Photo Easel promotions; HTTP 401/403/502/503/timeouts; and dynamic locator payloads absent from readable responses. These are retained as holds with next actions, **not declarations that no information exists anywhere**. No denied URL was repeatedly fetched without a different official endpoint or material new source evidence.

Branch phone connectivity, current physical occupancy, holiday schedules, branch inventory and actual appointment/game availability are not established by these web records. Root-held description/website keys, the B lane, dining and holds folders were not edited.

## Reproduction

Run `python evidence/enrichment-exhaustion-2026-10-20-r3/vincom-retail-a/validate.py` from the isolated worktree. `notes.json` is the reviewed research input; `build.py` assembles the current aggregate. Do not rerun the one-time append scripts against an already assembled notes file. Original chunks, queue and source receipts remain separate from generated aggregates.

Amendment03 upgrades Aqua Mineral identity/products/support, Face Wash Fox actual service catalogue/contact, Polo exact historical branch contact/offering, and Fred Perry actual US product catalogue. Latest aggregate:161 proposals/150 precise holds; all311 reviewed. Prior immutable packets remain superseded by amendments in numeric order.
