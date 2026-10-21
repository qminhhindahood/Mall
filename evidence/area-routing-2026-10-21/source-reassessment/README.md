# Source reassessment — 21 October 2026

User-specified inputs were checked directly, not requested again:

- `D:\Midterm\Takashimaya\Sơ đồ tầng`: eight original PNGs.
- `D:\Midterm\Vincom đồng khởi\map`: seven original WEBPs.
- All three official page URLs supplied by the user.

[Inventory and hashes](inventory/README.md): all fifteen files match the candidate geometry source records and 17 October inventory. Vincom copies are byte-identical to the previous route audit. Saigon originals have approximately 2.8–3.1 times the linear resolution of previously inspected JPEG derivatives, with the same artwork. These are sharper source pixels, not new geometry or a new revision.

[Official-page read](official/README.md): Takashimaya's website provides five floor maps. Its archived B2 image also depicts surrounding Saigon Centre units separately from department-store counters; the two businesses must not be conflated. It does not provide the L5 plan used by this candidate. Vincom's current directory corroborates selected brand floors but not exact geometry. Direct local downloading was denied by socket restrictions; successful web reads are recorded separately, with no claim of fresh image byte equivalence.

## Why the result can differ from the earlier exact-door audit

The later authorized product is explicitly area-level: a route may end in the public aisle beside a clearly labelled destination area. The source need not mark an exact doorway for that narrower claim. Visually continuous public circulation can support schematic connections without a named centreline, metric survey or GPS.

The isolated implementation candidate is `.scratch/area-routing-2026-10-21`, branched from tested4549695. It evaluates three accepted L5 areas in Saigon (Chang Kang Kung, LONGJING, Dim Tu Tac) and three accepted B3 areas in Vincom (Siam Sugar, Chang Kang Kung, Chilli Thai). Root independently checked all six active directory IDs, open status, exact area IDs and floor associations. Directory approvals and held records are not promoted or altered.

Route overlays use the source plan coordinate frame rather than assuming alignment with the schematic 3D map. Starts are in public circulation beside identifiable facilities; they are not invented lift thresholds or escalator landings. Cross-floor routing, exact door endpoints, distances, times and accessibility remain unsupported. Candidate implementation/build/browser review results are recorded in its own evidence packet; this source inventory alone is not a passing runtime test.

## Coordinator verification

Runtime source is committed in the isolated candidate as `b690041`. Coordinator directly inspected rendered Saigon Chang Kang Kung phone directions, Vincom Chilli Thai phone overlay, and the corrected Saigon Dim Tu Tac phone map crop. These views show source-plan overlays in public circulation with explicit area-frontage wording; the corrected Saigon crop includes destination names. Final matrix and independent review counts remain owned by the candidate evidence receipts.

Preservation readback: tested checkout `4549695f3b58f7df162acee475f0ccb516efeb99`, canonical app `19a9e34e7bec399f165ab704bcb0af803fab486e`, Vincom `ff822020dc715954ae2adfc098557f1c3f9eb4ae`, Saigon `cb6516df7a79a1ce727d2492b803ca0329003f2d`; all unchanged.
