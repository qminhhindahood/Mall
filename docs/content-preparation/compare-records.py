"""Export the all-record visual comparison receipt and owner location checklist."""
import csv
import json
from pathlib import Path

p = Path(__file__).resolve().parent
data = json.loads((p / 'floor-claims.json').read_text(encoding='utf-8'))
drafts = {mall: json.loads((p / f'{mall}.draft.json').read_text(encoding='utf-8'))
          for mall in ['saigon-centre', 'vincom-dong-khoi']}
source_rows = {r['candidateRef']: r for d in drafts.values() for r in d['destinations']}
# Explicit observations from visual inspection, not approved locations.
special = {
    42: ('not-found-on-reference-map', '', '', 'List introduction says B3; new unit/shape not supplied.'),
    107: ('different-floor', 'B1', 'B1-17A-B', 'Latest Markdown says B2; new B2 unit needed.'),
    108: ('different-floor', 'B1', 'B1-49', 'Latest Markdown says B2; new B2 unit needed.'),
    109: ('different-floor', 'L2', 'L2-07', 'Latest Markdown says B2; new B2 unit needed.'),
    235: ('unit-occupancy-unresolved', 'M', 'M-07 labels Studio 77', 'Sony claims floor M, lot 7; Studio 77 remains in latest list too.'),
    64: ('missing-list-floor', 'B3', 'B3-20', 'Map groups Boat Noodle & BKK Street Dessert; confirm current shared occupancy.'),
    192: ('missing-list-floor', 'L1; M', 'M-06; L1 large ZARA area', 'Map labels ZARA on both floors; latest list separately has ZARA M-06.'),
    193: ('missing-list-floor', 'L1', 'large Massimo Dutti area', 'Map-only floor reference; approve current floor and unit.'),
    110: ('missing-list-floor-and-identity-unresolved', 'possible B1', 'possible B1-56', 'Adidas Original/Home of Sport may differ from Adidas Originals row 163; do not merge automatically.'),
    168: ('missing-list-floor-and-identity-unresolved', 'possible B1', 'possible B1-54', 'Calvin Klein may differ from CK Jeans row 161; do not merge automatically.'),
}
audit = []
for r in data['records']:
    src = source_rows[r['candidateRef']]
    line = r['source']['line']
    if r['mallId'] == 'saigon-centre':
        status, observed, unit, note = ('floor-reference-agrees-unit-unverified', '; '.join(r['claimedFloors']),
                                       '', 'Image labels agree at floor level; image has no printed unit-code legend.')
        if r['name'] == 'Takashimaya':
            note = 'Anchor labels present on B2/B1/L1/L2/L3; range is one repeated destination, not five approvals.'
        if line == 55:
            status = 'floor-agrees-status-annotation-differs'
            note = 'B1 map says Winkperry Opening Soon; latest list has no opening-soon qualifier. Do not infer open status.'
    elif line in special:
        status, observed, unit, note = special[line]
    elif not r['claimedFloors']:
        status, observed, unit, note = ('missing-list-floor-not-found-on-reference-map', '', '',
                                       'No explicit floor/unit in latest list and no confidently corresponding reference label identified.')
    else:
        status, observed, unit, note = ('floor-and-legend-unit-reference-agree', '; '.join(r['claimedFloors']),
                                       r['claimedUnitOrRange'] or '', 'Visual legend agrees; not current area/geometry approval.')
        if line == 31:
            note = 'Map legend also names BKK Street Dessert in B3-20; keep independent destination identity.'
        if line == 43:
            note = 'Map spelling Siam Suger versus list Siam Sugar; floor/unit agree, official spelling needs review.'
        if line == 92:
            note = 'Map Copenhagen versus list Copenhaghen; floor/unit agree, official spelling needs review.'
    audit.append({'candidate_ref': r['candidateRef'], 'mall': r['mallId'], 'name': r['name'],
                  'source_path': r['source']['path'], 'source_line': line,
                  'latest_list_floors': '; '.join(r['claimedFloors']),
                  'latest_list_unit_claim': r['claimedUnitOrRange'] or '',
                  'observed_map_floors': observed, 'observed_map_unit_or_label': unit,
                  'comparison': status, 'note': note, 'owner_correct_floor': '',
                  'owner_correct_unit_or_area': '', 'owner_decision': ''})
assert len(audit) == 383 and len({r['candidate_ref'] for r in audit}) == 383
with (p / 'all-record-map-comparison.csv').open('w', encoding='utf-8-sig', newline='') as f:
    w = csv.DictWriter(f, fieldnames=list(audit[0]))
    w.writeheader()
    w.writerows(audit)

lines = ['# Owner location check — all supplied records', '',
         'Revision **directory-map-reconciliation-2026-10-14-r2**. The owner states the Markdown files are authoritative and the maps are outdated. Highlights will come later. Nothing in this checklist approves current geometry or publishes records.', '',
         'The [all-record spreadsheet](all-record-map-comparison.csv) covers **all 383 supplied table occurrences** (166 Saigon Centre, 217 Vincom), including matching rows, unresolved rows, source lines and blank owner-resolution columns. The tables below list every row without an explicit list floor and the observed direct conflicts. Missing map labels are recorded as **not identified**, not proof of absence/closure.', '',
         '## Vincom — direct relocation and occupancy checks', '',
         '| Destination | Latest Markdown | Outdated map | What to provide |',
         '| --- | --- | --- | --- |',
         '| Crocs | B2 (intro line 9; row 107) | B1-17A-B | Current B2 unit/shape |',
         '| An Phước | B2 (intro line 9; row 108) | B1-49 | Current B2 unit/shape |',
         '| Valentino Creations | B2 (intro line 9; row 109) | L2-07 | Current B2 unit/shape |',
         '| Sony | M, lot 7 (row 235) | M-07 labels Studio 77 | Does Sony replace/share Studio 77, or is lot 7 a different designation? |',
         '| Yamazaki | B3 (intro line 9; row 42) | No confidently corresponding label identified | Current B3 unit/shape |', '',
         '## Vincom — old map labels excluded by the latest Markdown', '',
         '| Old map destination | Old reference location | Decision needed |',
         '| --- | --- | --- |',
         '| BreadTalk | B3-15A | Clear old tenant label; identify current occupant/shape if any |',
         '| TiNiWorld | B2-18A | Identify replacement/current area use |',
         '| Pablo | B2-17 | Identify replacement/current area use |',
         '| King BBQ Buffet | L3-02-03-04 | Identify replacement/current area use; keep distinct from King BBQ B3-10B retained in list |',
         '| Xing Fu Tang | L3-K2 | Identify current kiosk/area use |',
         '| Elite Fitness | L3-10 | Identify replacement/current area use |', '',
         'These six labels contradict the latest supplied directory baseline. Removing a stale label does not prove a closure date or establish a replacement tenant.', '',
         '## Vincom — every table row without an explicit list floor', '',
         '**67 rows** need an explicit floor decision; some have an old-map clue below. Do not infer floors from table grouping. Names and source lines are preserved for your edits.', '',
         '| Source line | Destination | Old-map clue / location to check |',
         '| --- | --- | --- |']
for r in audit:
    if r['mall'] == 'vincom-dong-khoi' and not r['latest_list_floors']:
        clue = (r['observed_map_floors'] + ': ' + r['observed_map_unit_or_label']) if r['observed_map_floors'] else 'Provide floor and unit/area; no confident reference label identified'
        lines.append(f"| {r['source_line']} | {r['name']} | {clue} |")
lines += ['', '## Shared or overlapping location claims to clarify', '',
          'These are ambiguous area relationships, not necessarily incorrect floors. Keep independent destinations. The images show spatial labels but do not prove shared occupancy or current boundaries.', '',
          '| Mall / claimed location | Destinations | Needed decision |',
          '| --- | --- | --- |',
          '| Saigon B2-K5 | Irvins; llaollao | Map labels are at separate positions. Confirm individual kiosk units/shapes or a deliberately shared area. |',
          '| Saigon L1-10 | CARTIER; GRAND SEIKO; HUBLOT; The Hour Glass; TUDOR; ZENITH | Confirm retailer/counter identities and area grouping; watch labels and Cartier appear at different map positions. |',
          '| Saigon L2-17 | Label Lab; Moschino | Separate map label positions; confirm unit identifiers and shapes. |',
          '| Saigon L5-08 | Asian Corner; GoGi House; Kichi - Kichi; Lách Ca Lách Cách; Manwah | Labels occupy different map positions; confirm whether 08 denotes a larger shared area or individual units need correction. |',
          '| Saigon L5-09 | Asanoha; Botejyu Okonomiyaki; Oedo Alley; Ramen Ichibanken; Sundubu | Cluster has overlapping/grouped labels plus separate shapes; confirm shared hall versus individual units. |',
          '| Saigon L4 | UNIQLO 12–22,26–36; Phuong Nam 20; POP MART 19A; Qhome 19B; Phúc Long 21/22/35/36 | Claimed UNIQLO range overlaps other codes; map has separate labels. Confirm range semantics before assigning regions. |',
          '| Vincom B1-28B-C | Marhen.J; Puma; Ceci | Both list/map legend group these brands. Confirm independent records and current shared-area/counter relationship. |',
          '| Vincom B1-07 / B1-09 | Mujosh & Ted Baker (combined row 134) | Confirm independent brand/counter identities instead of one combined public destination by default. |',
          '| Vincom B3-20 | Boat Noodle; BKK Street Dessert | Map combines names; list has separate records and BKK has no explicit floor. Confirm same-area relationship. |', '',
          '## Saigon — floor agreement with remaining location questions', '',
          'No different-floor conflict was identified among the **166 supplied table occurrences** during the visual comparison. This is floor-reference agreement, not a precise-location signoff: **the Saigon images do not print the list’s unit numbers**, so every supplied unit-to-polygon link remains unverified.', '',
          '- Winkperry B1-4A: map says Opening Soon, latest row does not. Confirm current operation; keep list floor B1.',
          '- LONG JING: mentioned in latest introduction as announced/not in directory, but map labels LONGJING on L5. Confirm intended roster entry, floor and operation before adding it.',
          '- Marc Jacobs: latest note places it within Takashimaya L2 and map label agrees. Provide its independent counter record and precise location.',
          '- adidas: listed on both L3 and L4 and labels appear on both. Confirm one multi-floor identity versus independently named branches.',
          '- Takashimaya: five repeated B2–L3 entries should become one multi-floor destination; individual brands/counters must remain independent.',
          '- L6: map has Rooftop Garden and Under Renovation Work. Latest document has no tenant rows there; confirm public access/amenities separately, without inventing tenant records.', '',
          '## Map-only department-store and other annotations', '',
          'Saigon maps include many labels not represented by independent table rows. The supplied list explicitly omits department-store counters. This is a **coverage gap**, not proof those counters closed; do not delete the department-store roster merely because it was omitted. See [map-only annotation checklist](map-only-annotations.md) for the readable label groups to reconcile. Dense/overlapping labels still require the owner’s authoritative counter roster.', '',
          '## Map reconstruction handoff', '',
          '1. Treat latest Markdown names/floors and owner resolutions as the content baseline. Clear stale tenant annotations; retain original source images unchanged as historical evidence.',
          '2. Rebuild the tenant label/occupancy layer first. Relabel/reassign existing shapes only when a current unit-to-shape relationship is supported. Floor-confirmed destinations can ship after content approval without a fabricated precise marker.',
          '3. New/moved shops need unit or marked-up reference locations. A split/merged/expanded unit requires current boundary evidence before editing geometry. An outdated tenant label alone does not establish that walls/outlines changed.',
          '4. Keep map imagery, semantic tenant occupancy and schematic geometry as separate revisioned evidence. Presentation/runtime agents own rebuilt map files and runtime region mappings; this delivery supplies their content/review queue.',
          '5. Highlights remain deferred. No new location, approval date, current tenant inferred from map-only labels, or unapproved public record is created by this checklist.', '']
(p / 'owner-location-checklist.md').write_text('\n'.join(lines), encoding='utf-8')
print(f'All-record comparison: {len(audit)} source occurrences; owner checklist generated')
