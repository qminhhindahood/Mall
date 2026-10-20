# r3 independent field audit contract

Scope: all1,315queued keys (1,272prior-unresearched +43prior-holds), preserving658accepted field objects exactly. Roster, accepted descriptions, floor/geometry/location/media decisions and assets are frozen. Cuisine proposals are reviewed as bilingual evidence only; coordinator owns any runtime schema extension. No personal-owner approval is required or fabricated.

Send completed chunks when ready, with their exact filenames/hashes and key counts. Continue the rest of the assigned queue; a chunk is an audited milestone, not a quota or completion claim. Avoid repeatedly rewriting reviewed chunks; issue an explicit replacement/amendment if needed.

For **every assigned mallId/destinationId/field**, provide one final research outcome:

- `proposal`: an exact bilingual value or actual action URL, field role, official sourceUrl, actual checkedAt date, applicability (`branch` with branchMallId, or `brand-wide`), evidence path/reference and short factual support. Preserve VI/EN scope/caveats. Existing658fields need no new proposal and must not change silently.
- `unavailable-after-research`: bounded negative finding. List the exact checked official sources, targeted field/name/branch search queries and results; identify the inspected source sections and what was absent. Explain why additional obvious official paths do not remain uninspected. This is never a global claim that no information exists. Retrieval failure, snippets, one homepage, no outgoing mall link or an unsearched locator alone do not qualify.
- `hold`: exact source-access, authority, identity, conflicting-value, unavailable-action or incomplete-retrieval blocker, with attempted URLs/queries/results, candidate values if any, and the specific remaining resolution action. Do not collapse untouched independent brand research into a blocker. If research is still open, say so and continue.

Suggested per-field JSON (equivalent existing structures accepted):

```json
{
  "mallId": "saigon-centre",
  "destinationId": "frozen-id",
  "field": "hours",
  "outcome": "proposal",
  "proposedField": {},
  "sources": [{"url":"https://official.example/path","evidenceFile":"source.txt","reference":"web-reference","section":"branch row","result":"retrieved","support":"short factual extract"}],
  "searches": [{"query":"exact official branch field query","result":"finding or no result"}],
  "reason": "Evidence-to-value reasoning and bounded scope.",
  "remainingAction": null
}
```

`proposedField` may use current EnrichmentField metadata; values for cuisine may use the same bilingual envelope pending coordinator extension. Final independent audit outcomes are `accept`, `hold`, or `unavailable-after-research`, with reviewer/date, exact reason, input hash and evidence bindings.

## Review checks

Exact frozen identity and source ownership; actual menu/catalogue/programme/booking role; branch versus brand scope; useful VI/EN equivalence; date/schema; phone normalization without inventing digits; nonempty uncertainty; conflicts versus other checked official sources. A mall Phone block containing a general1800/1900contact does not establish a dedicated branch line. Actual product/category content supports catalogues; navigation-only shells do not establish readable menus. Booking links must expose an actual form/action; never submit. Unavailable/held fields expose no runtime action/value.

The runtime `services` field is labelled **Products / services / Sản phẩm / dịch vụ**. Specific sourced product offerings qualify; operational service claims such as catering or delivery are not mandatory. Review usefulness and accurate bilingual wording without inventing narrower acceptance requirements. A product summary does not establish an actual menu/catalogue URL, inventory, policy or unmentioned operational service.

Carry explicit international-market, branch-stock, price/availability and source-error caveats. Source snapshots do not establish phone connectivity, physical occupancy, holiday hours or on-site service. Bounded unavailable or exact hold requires specific evidence; no arbitrary remainder, assumed exhaustive search or automatic acceptance from a matching URL.

Reuse already-audited r2official evidence where it supports the same exact brand-wide role/identity, citing its receipt; independent fresh reads focus on new practical values, conflicts, ambiguous identity and representative bindings. Do not redundantly refetch658baseline fields.
