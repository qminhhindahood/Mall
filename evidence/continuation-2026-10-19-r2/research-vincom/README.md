# Vincom official-source continuation — 19 October 2026

Research-only return for independent parent review and integration. No application, tracker, roster, description, location, asset or Git commit changes were made by this lane.

## Deliverables

- `enrichment-records.json`: 148 newly verified field candidates across114 unchanged listing IDs, using the existing verified-agent/agent-accepted schema. Parent review is still required before merge.108 website links,24 catalog links,5 phones,5 hours,4 menus and2 services.
- `decisions.json`: accepted field reasoning,209 directory attempts including62 canonical-URL follow-ups,68 existing official brand-site attempts,2 retained CGV holds and929 explicitly unresolved remaining field tasks. Zero fields labeled unavailable after research.
- `directory-reconciliation.json`: all203 frozen Vincom identities reconciled against the current accessible index. This records first-pass index correspondence, not current occupancy approval or source-floor corrections.
- `directory-attempts.json` / `brand-attempts.json`: machine-readable source outcomes. Raw tool-response text is retained in the named `.txt` files. Some batch responses expose only page metadata after their response budget; metadata supports the website link only, with no invented contact/hours.
- `validation.json`: passing identity/schema/duplicate/frozen-field checks and source-data/evidence hashes. `assemble.py` and `validate.py` reproduce the return locally.

## Coverage and limits

The official directory exposes153 linked entries. Every147 retail entry was attempted. Six support/warehouse entries (Dyson, Highlands Coffee, CGV, Hachiban, Runam Boutique and Tian Long warehouses) are outside retail enrichment and remain unmodified. Seven current-index names did not map to a frozen listing: HLA, Boost Juice, Lizd Namat, Mujosh, Cara, Titan-Fossil-Daniel Wellington and Letitia. No listing was created, removed or merged. Absence from the current index does not establish closure.

115 directory responses succeeded across the first pass and canonical follow-ups. Individual failures remain fetch errors or unresolved work; a successful directory/homepage retrieval does not exhaust every field-specific official source. Existing official brand sites were checked across all68 non-Facebook URLs supplied by the frozen directory. Brand-wide catalogs and menus explicitly retain branch-availability uncertainty. Store-policy claims, general corporate phones, mall-default hours, prices and occupancy were not copied into branch facts.

The seven earlier held slots were revisited. Timezone now has a directly retrieved official venue page plus phone/hours. Crocs and WinMart have retrieved branch mall pages. OVS uses the verified official Italian homepage/catalog with explicit international brand-wide scope; the earlier `/en/` URL remains inaccessible. Dyson's official store finder and catalog retrieve successfully. CGV phone/programme stay held: indexed official text is preserved as a lead, but multiple direct EN/VI branch/contact attempts failed or timed out.19006017 is not promoted as a branch-direct phone, and no unusable programme action is accepted.

Timezone's VI venue page has an unrelated Ha Dong FAQ; only its correct Dong Khoi heading/contact block and matching EN page were used. Watsons prints the unusual phone string`+84-0971088853`; that exact source form is preserved without silently normalizing it. Som Thai lists two branch phones; the first is used and the second is documented in evidence. No holiday-hour inference was made from Crocs's dated Tet2026 schedule.

The shell's initial direct HTTP attempt was blocked by the network sandbox; an approved public-directory fetch then returned HTTP403. Web-tool retrieval provided the evidence and the lane continued. No permission action remains pending and no external communication occurred.929 field tasks remain unresolved; this is broader source research, not exhaustive completion of every enrichment field.

## Separate incremental return during independent audit

`enrichment-records-incremental.json` adds9 fields across5 identities without changing the frozen148-field draft: ECCO phone; LYN phone/hours; Matsumoto Kiyoshi phone/hours; Shiseido phone/hours/Beauty Center; Thế Giới Nước Hoa phone. Exact direct official locator blocks are retained in `incremental-direct.txt`, `incremental-direct2.txt` and `incremental-beauty-detail.txt`. `validation-incremental.json` passes schema and duplicate checks and hashes the unchanged draft plus additions.

`decisions-incremental.json` records follow-through on13 brand targets (San Fu Lou, Morico, Hokkaido Sachi, Chang Kang Kung, ECCO, LYN, GiGi, Havaianas, PRIMA, Matsukiyo, Lancôme, TGNH and Shiseido). It contains2 strictly bounded unavailable-hour findings: ECCO and TGNH have no branch hours in the checked official mall page, brand home and store locator. This does not claim global absence.9 additions and2 bounded findings would leave918 original field tasks if accepted; the independent reviewer may alter decisions/counts.

San Fu Lou's indexed branch contact and menu page are useful leads, but direct requests returned403. PRIMA's locator names an M-floor jewellery counter and cannot establish applicability to frozen Prima Art B1. These stay held. GiGi/Havaianas/Lancôme branch contacts remain unresolved; Morico/Hokkaido Sachi/Chang Kang Kung home failures plus empty site-restricted searches remain retrieval limitations, not global unavailability.

The independent audit identified possible ChillThai/ChilliThai brand confusion in the inherited website. Recommend rejecting that original draft menu field. The148-field draft stays frozen so the parent can record the audited rejection. Watsons's malformed international source string can be normalized to exact domestic digits0971088853 under the parent's explicit audit decision. No source file was modified in this research lane.
