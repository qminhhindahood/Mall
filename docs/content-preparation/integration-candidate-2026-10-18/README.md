# Private effective integration candidate — 18 October 2026

Revision **integration-candidate-2026-10-18-r1** assembles the latest evidence into two mall-specific private review records. It closes the tooling gap between the separate geometry, copy return and copy amendment packets. Neither output is an importable directory snapshot. Both public directories remain empty/pending at `directory-pending-2026-10-14-r1`; application content and floor assets are unchanged.

The 371 identities retain the expanded roster lineage, independent VI/EN review state and media findings. Exactly 42 original missing-location occurrences now refer to the technically reviewed `saigon-42-polygons-2026-10-18-r4` geometry (seven existing-region reuses and 35 new candidates), all pending owner geometry approval. Original floor metadata and regions are checked against the live unchanged schematic. Shared/parent relationships are preserved. The other 128 original occurrences have null region IDs, exact missing evidence and floor/list-only access proposals. The expanded **191 pending locations** is retained as a historical baseline with its separate denominator; this packet does not infer a new expanded coverage count.

Copy precedence is explicit: baseline record review → 20-record returned copy → three-record evidence-hold amendment. Cara, Lizd Namat and Mujosh & Ted Baker have null effective VI/EN proposals and no decision readiness. Only Meat & Meet retains its narrowly scoped conversational copy acceptance; its unspecified personal reviewer identity/date remains as reported. Every record has `publicationApproval: false`. The 27 neutral summaries in the parallel [evidence follow-up](../evidence-follow-up-2026-10-18-r1/README.md) are attached separately as `additionalUnapprovedCopyProposal`, without replacing effective holds or claiming approval. Evidence paths preserve their original packet bases explicitly.

Each identity lists remaining decisions. No media rights, branch association, current occupancy, owner geometry decision, rendered journey acceptance or release approval is inferred from technical checks. A future approved import still needs the public directory contract and explicit owner decisions.

Run from the application checkout:

```powershell
python docs/content-preparation/integration-candidate-2026-10-18/prepare.py
```

[Source hashes](source-hashes.json) bind exact input ledgers, public pending snapshots, the live schematic and all r4 artifacts (including close-up exception evidence). [Manifest](manifest.json) binds output and generator bytes; [integrity receipt](integrity.json) records assembly invariants. Rebuilding unchanged sources reproduces every JSON output byte-for-byte. Once generated, changed source hashes fail closed with an instruction to create a new versioned candidate, preserving this delivery. File paths in source hashes are relative to the project root.

The application TypeScript scope was also corrected in `tsconfig.json`: generated Astro declarations, `src/**/*` and `astro.config.mjs` are checked, while archived review JavaScript stays outside application diagnostics. `npm run check` now completes with **27 files, zero errors/warnings/hints**, without increasing Node memory. This retains normal TypeScript checking of application imports. Both public and isolated fixture builds and final browser journey validation are recorded separately in the handoff acceptance receipt; no browser behavior was changed by this packet.
