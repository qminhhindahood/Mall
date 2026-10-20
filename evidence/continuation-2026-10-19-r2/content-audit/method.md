# Independent core content audit

Reviewer: Codex independent content auditor (AI), actual review date 2026-10-19. Delegated local unpublished review; no personal owner or publication acceptance.

**611 proposed fields reviewed; 598 accepted, 13 held.** Saigon:451/463 accepted; Vincom:147/148 accepted. Three accepted values corrected: Watsons domestic phone normalization and two missing English spaces. Existing32fields are frozen byte-for-byte in baseline-accepted.json; merging these incremental fields yields630accepted fields before supplemental research. No original acceptance is silently superseded.

## Evidence method and limits

- Read schema in src/data/enrichment.ts, prior decisions and complete coverage summary; reviewed frozen directory identity/name mappings.
- Every Saigon website/phone/hour proposed field binds to a complete saved official branch read in research-saigon/source-blocks.json. Deterministic comparisons check phone numeric containment (one supported number may be selected from two) and hours numeric equivalence; every proposed value matched its complete source block. Incomplete chronological reads do not overwrite complete reads. Source names/URLs and frozen destination mapping were reviewed. The independent audit did **not** independently refetch all165Saigon pages.
- Every Vincom field binds to actual saved official response text, using exact header/source/action URLs rather than substring matching; all108website mappings were inspected against official response titles and frozen names. All five new Vincom phone/hour branch blocks were independently fetched and read, plus Watsons services and Dyson brand-wide service scope. Branch identity is supported without importing floors, prices, occupancy freshness or generic mall policies.
- Independently fetched all eleven Saigon menu/catalogue links and all24Vincom catalogue links (Dyson catalogue also has researcher source plus fresh official Dyson store/product navigation read). Confirmed product/menu category role; brand-wide caveats remain explicit. International OVS/Swarovski links are brand-wide and do not assert Vietnam stock. Cộng and Wrap&Roll menus independently read. ChilliThai menu was rejected on brand identity despite inherited frozen URL.
- Fresh representative Saigon branch reads include beauty/luxury, jewelry, services, lifestyle and dining; uncertain TAGHeuer/Chlo.D/Kenneth direct reads failed but official-domain search recovered matching identity/contact/hour representations. Existing saved complete reads remain supporting evidence. Fresh Vincom branch representatives included Adidas; direct Himalaya/Sony reads failed and do not nullify earlier saved official evidence. Such failures are access limitations, not proof of unavailable content or closure.
- All accepted VI/EN values and uncertainty are nonempty, phone values equal across languages, branchMallId matches mall; brand-wide entries have no branchMallId. General brand catalogues/menus retain explicit local availability/price caveats. Nine1800/1900contacts are withheld because branch-specific applicability is unresolved under the coordinator scope.

Researcher saved source blocks and text files were the evidence base; independent fresh reads targeted all new actionable menus/catalogues, Vincom practical values, ambiguity and conflicts. Neither cached web reads nor a matching title establish physical/current occupancy, telephone connectivity or on-site hours. No calls or external messages were sent. No source/tracker/asset/geometry/roster edits or commits occurred in this lane.

## Corrections and holds

- Basta Hiro Saigon: mall09:30–21:30 versus official brand10:30–22:00, last order21:30. Held. (The earlier coordinator alert misstated mall start as10:00; this ledger records the actual fresh mall value09:30.)
- Som Tam Thai Saigon: mall10:00–22:00 versus official brand10:30–22:00, last order21:30. Held.
- Nespresso Saigon: mall flat09:30–21:30 versus brand Friday–Sunday closing22:00. Held.
- Chilli Thai Vincom menu: chillthai.vn shows a different similarly named three-branch restaurant; official Vincom names Chilli Thai and a different branch contact. Held. Researcher agrees inherited URL does not establish identity.
- Nine general Saigon contacts beginning1800/1900: held as branch telephone values. Their presence in mall Phone blocks is retained as evidence, without asserting dedicated branch lines.
- Watsons: exact source prints+84-0971088853; accepted domestic0971088853 corrects malformed country/trunk prefix while preserving original source text in evidence.
- Basta Hiro/Som Thai Vincom: factual values retained; English spacing repaired to“last order at 21:30.”

## Deliverables

audited-incremental-records.json contains only accepted new fields, ready for coordinator merge by mall/destination/field. decisions.json includes all611per-field original proposals, decisions, reasons and source bindings. held-fields.json lists13withheld fields and reasons. summary.json binds the frozen inputs by SHA-256. audit.py reproduces accounting and applies explicit reviewer decisions; it is a data/evidence accounting aid, not runtime behavior testing or an automated truth detector. Supplemental proposals are outside this core receipt and require separate audit.
