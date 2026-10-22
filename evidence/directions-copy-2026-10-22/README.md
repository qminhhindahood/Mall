# Directions label cleanup —22 October 2026

Owner supplied a screenshot of generic approximate-area and estimated-route labels in the place chooser and requested verification and removal. Routing behaviour was checked in bb6385c: both builds,21 floor pairs,40 sampled Vincom pairs, five Saigon scenarios and ten focused bilingual desktop/phone cases passed. These are software checks, not physical validation of doorways or lift service.

The shared Directions component now omits generic approximate-area and estimated-route labels from chooser options and the immediate journey card. The estimate basis remains under Show journey details, alongside the full association/source notes. Specific partial-area, Opening Soon and source-plan-only restrictions remain visible. No route graph, estimated engine, mapping or source asset changed; the17 historical source-plan-only identities remain unavailable for walking routes.

Both builds pass (Vincom431 pages, Saigon357 pages). All10 focused browser cases pass. Validation for this copy-only delivery is recorded in browser-results.json and build logs: eight EN/VI390/1280px cases verify the chooser omits the generic lines, an estimated route remains enabled, the estimate basis is available on expanding details, and selecting a step switches to the expected floor. Two further cases preserve source-plan-only route blocking. The complete route suite from bb6385c is not repeated because routing inputs and algorithms are unchanged.

Asset revision **photo-polish-2026-10-12-delivery-r2** unchanged. Local previews4621/4622 are refreshed; no publication or physical/complete-routing acceptance is claimed. Build logs are saved with terminal colour and trailing whitespace removed.
