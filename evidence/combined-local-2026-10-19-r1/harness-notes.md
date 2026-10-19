# Prepared combined browser validation

Execution is complete. No historical result files are copied as fresh results. `validation-summary.json` is the final receipt: 132 distinct browser cases / 1,626 assertions, 752 shipped-route checks, four output-isolation checks, 512 transition samples and 32 pacing compositions pass.

The broad behavior/motion suite was run against b114498. After the twelve-line typography override in 370be91, all four outputs were rebuilt and twelve focused responsive/detail cases / 152 assertions passed; two computed-style pages also completed. The pre-CSS builds, output hashes and receipts remain frozen under pre-css/. Source/output SHA-256s for final 370be91 are in provenance.json; source comparisons retain raw hashes and normalize Windows CRLF to Git LF for code equivalence. Both asset manifests remain byte-identical to base 19a9e34.

Two initial Vietnamese parity assertion failures and two phone area-history timeouts came from inherited harness assumptions. Their exact initial logs/results remain preserved, with successful targeted VI retries. No application failure remains. Screenshot locale names were normalized after the inherited review harness's locale-switch step; screenshot-label-correction.json records the mapping and hashes. The final reusable harness now names captures by the rendered locale.

Existing harnesses are copied from the Discovery final review and motion refinement evidence. Output paths and preview ports are changed to this evidence revision and ports 4401–4404. Public and fixture builds explicitly clear `PUBLIC_DISCOVERY_REVIEW`.

The copied motion assertions are adapted for the rich Discovery phone behavior: the collapsed map summary has a reachable expansion control, and map controls are exercised after expansion. The transition sampler applies map clipping checks only to a rendered SVG with nonzero height. Desktop expectations remain unchanged.

Detail parity additionally checks View on map → browser Back restoration and exact static destination description after forced 3D import failure. The travel capture records the layer, target and source rectangles and journey progress. Accepted enrichment has no provisional owner warning; public output includes its official menu action while fixture HTML and JS exclude that value.

These are browser journey checks and static/build prerequisites. They do not establish physical-device, native background/return, production, deployment or release acceptance.
