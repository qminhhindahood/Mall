"""Apply the explicit Adidas correction and preserve owner decisions offline.

Run once; refuses to overwrite a prepared packet. Never writes runtime data.
"""
import argparse
import copy
import csv
import hashlib
import io
import json
from collections import Counter
from pathlib import Path

parser = argparse.ArgumentParser()
parser.add_argument('--workspace', required=True, type=Path)
args = parser.parse_args()
workspace = args.workspace.resolve()
here = Path(__file__).resolve().parent
packet = here.parent
revision = 'directory-owner-update-2026-10-15-r1'
assert not (here / 'review-cards.json').exists(), 'Preserve existing packet; use a new revision for another import.'

def digest(data):
    return hashlib.sha256(data).hexdigest()

def save(name, value):
    (here / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

csv_path = workspace / 'all-record-map-comparison (1).csv'
json_path = workspace / 'store-data-vincom-dong-khoi.json'
csv_before, json_bytes = csv_path.read_bytes(), json_path.read_bytes()
reader = csv.DictReader(io.StringIO(csv_before.decode('utf-8-sig')))
fields = reader.fieldnames
rows = list(reader)
baseline = {r['candidate_ref']: r for r in csv.DictReader((packet / 'all-record-map-comparison.csv').open(encoding='utf-8-sig', newline=''))}
assert len(rows) == len(baseline) == len({r['candidate_ref'] for r in rows}) == 383
for row in rows:
    assert row['candidate_ref'] in baseline
    for key in fields:
        if not key.startswith('owner_'):
            assert row[key] == baseline[row['candidate_ref']][key], (row['candidate_ref'], key)
stores_data = json.loads(json_bytes)
stores = stores_data['stores']
vincom_rows = [r for r in rows if r['mall'] == 'vincom-dong-khoi']
assert len(stores) == len(vincom_rows) == len({s['id'] for s in stores}) == 217
for row, store in zip(vincom_rows, stores):
    assert row['name'].replace('\\', '') == store['name'].split(' (')[0].replace('\\', ''), row['candidate_ref']
    assert store['mall'] == 'vincom-dong-khoi'

# The owner explicitly resolved this conflict on 15 October: use JSON floor B2.
adidas = next(r for r in rows if r['candidate_ref'] == 'vincom-dong-khoi-source-line-110')
adidas_json = next(s for r, s in zip(vincom_rows, stores) if r is adidas)
assert adidas_json['floor'] == adidas_json['zone'] == 'B2'
assert adidas['owner_correct_floor'] in ['B1', 'B2']
adidas['owner_correct_floor'] = 'B2'
adidas['owner_correct_unit_or_area'] = 'not published'
adidas['owner_decision'] = 'owner confirmed 2026-10-15: Adidas Original / Home of Sport at B2 per supplied JSON; keep independent from Adidas Originals row 163; unit unresolved; old B1 map clue is not its current location'

inputs = here / 'inputs'
inputs.mkdir(exist_ok=True)
(inputs / 'all-record-map-comparison.received.csv').write_bytes(csv_before)
(inputs / 'store-data-vincom-dong-khoi.json').write_bytes(json_bytes)
out = io.StringIO(newline='')
writer = csv.DictWriter(out, fieldnames=fields, lineterminator='\r\n')
writer.writeheader()
writer.writerows(rows)
csv_after = out.getvalue().encode('utf-8-sig')
csv_path.write_bytes(csv_after)
(inputs / 'all-record-map-comparison.corrected.csv').write_bytes(csv_after)

previous = json.loads((packet / 'continuation-2026-10-14/review-cards.json').read_text(encoding='utf-8'))
previous_by_ref = {r['candidateRef']: r for r in previous['records']}
json_by_ref = {r['candidate_ref']: s for r, s in zip(vincom_rows, stores)}
floor_sets = {'saigon-centre': {'B2','B1','L1','L2','L3','L4','L5','L6'},
              'vincom-dong-khoi': {'B3','B2','B1','L1','M','L2','L3'}}
cards, unit_queue, observations = [], [], []
for row in rows:
    ref = row['candidate_ref']
    floors = [f.strip() for f in row['owner_correct_floor'].split(';') if f.strip()]
    assert floors and len(floors) == len(set(floors)) and set(floors) <= floor_sets[row['mall']], ref
    card = copy.deepcopy(previous_by_ref[ref])
    store = json_by_ref.get(ref)
    if store:
        assert store['floor'] in floors, (ref, store['floor'], floors)
        # ZARA L1 record plus M record is compatible with the CSV brand-level floor union.
    unit = row['owner_correct_unit_or_area'].strip()
    unresolved_unit = not unit or any(t in unit.lower() for t in ['unknown', 'not published', 'unverified', 'possible', 'large area'])
    flags = []
    if ref == 'saigon-centre-source-line-143':
        flags.append('cross-mall-note: structured floor L3 retained; decision prose describes Vincom B2 move, not Saigon evidence')
    if ref in ['vincom-dong-khoi-source-line-85', 'vincom-dong-khoi-source-line-108']:
        flags.append('shared-unit-unresolved: Sealy and An Phuoc both claim B2-01C; no replacement/coexistence inferred')
    if ref in ['vincom-dong-khoi-source-line-225', 'vincom-dong-khoi-source-line-235']:
        flags.append('Sony/Studio77 independent per owner; lot designation is not an approved shared polygon')
    if ref in ['vincom-dong-khoi-source-line-192', 'vincom-dong-khoi-source-line-224']:
        flags.append('ZARA brand-level floor union agrees with JSON separate L1/M records; identity merge remains pending')
    card['ownerUpdate'] = {
        'source': 'inputs/all-record-map-comparison.corrected.csv',
        'ownerReportedFloors': floors, 'ownerUnitClaim': unit or None,
        'ownerDecision': row['owner_decision'],
        'floorDecision': 'supplied by owner; publication approvals separate',
        'candidateLocations': [{'floorId': f, 'certainty': 'floor-confirmed', 'areaIds': [],
                               'source': f'owner CSV {ref}'} for f in floors],
        'preciseLocation': 'unresolved' if unresolved_unit else 'unit claim supplied; geometry link unreviewed',
        'mappingStatus': 'no approved region/marker; in-person check if current evidence unavailable',
        'flags': flags,
        'sourceJsonRecord': store,
        'jsonHighlightsMeaning': 'supplied descriptive visit-purpose copy; never an editorial Highlight' if store else None,
        'categorySuggestionApproval': 'pending' if store else None,
    }
    assert card['basicListingProposal']['verifiedFloors'] == []
    assert card['basicListingProposal']['locations'] == []
    cards.append(card)
    if unresolved_unit or flags:
        unit_queue.append({'candidate_ref': ref, 'mall': row['mall'], 'name': row['name'],
                           'owner_floors': '; '.join(floors), 'owner_unit_claim': unit,
                           'mapping': 'unresolved; no marker', 'flags': '; '.join(flags),
                           'next_evidence': 'owner-marked current location or in-person check if unavailable',
                           'site_visit': 'not performed; not scheduled'})
    observations.extend({'candidateRef': ref, 'flag': flag} for flag in flags)

save('review-cards.json', {'revision': revision, 'format': 'offline-owner-decisions; not DirectorySnapshot',
                         'approval': 'pending', 'reviewedAt': None, 'highlights': [], 'records': cards})
with (here / 'remaining-location-queue.csv').open('w', encoding='utf-8-sig', newline='') as f:
    w = csv.DictWriter(f, fieldnames=list(unit_queue[0]))
    w.writeheader()
    w.writerows(unit_queue)
save('consistency-notes.json', observations)
public = {}
for mall in floor_sets:
    path = workspace / 'implementation/mall-visitor/data/malls' / mall / 'directory.json'
    snapshot = json.loads(path.read_bytes())
    assert snapshot['approval'] == 'pending' and snapshot['reviewedAt'] is None
    assert all(not snapshot[k] for k in ['destinations','categories','areas','facilities','highlights'])
    public[mall] = digest(path.read_bytes())
receipt = {'revision': revision, 'receivedOn': '2026-10-15', 'editorialReviewedAt': None,
           'sourceHashes': {'csvReceived': digest(csv_before), 'csvCorrected': digest(csv_after), 'vincomJson': digest(json_bytes)},
           'records': len(cards), 'ownerFloorDecisions': len(cards), 'vincomJsonStores': len(stores),
           'jsonMissingUnits': sum(not s.get('unit') for s in stores), 'locationQueueRows': len(unit_queue),
           'unknownToOwnerRows': [r['candidate_ref'] for r in rows if 'unknown to owner' in r['owner_correct_unit_or_area'].lower()],
           'csvCorrection': {'candidateRef': adidas['candidate_ref'], 'floor': 'B2', 'unit': 'unresolved', 'authority': 'explicit owner message 2026-10-15'},
           'jsonFloorCompatibility': 'PASS; each JSON floor belongs to matching CSV owner floor set',
           'inputMetadataLimits': ['JSON version v0-draft and generated 2026-10-12 retained as supplied, not approval',
                                   'meta.needsFloorVerification=84 is stale; actual stores all have floors',
                                   'JSON highlights is descriptive prose; editorial Highlights remain empty',
                                   'keyword categories/cuisine remain suggestions, not reviewed taxonomy',
                                   'source URLs/research claims in owner prose were not independently rechecked'],
           'actualCategoryCounts': dict(Counter(s['category'] for s in stores)),
           'publicSnapshotHashes': public,
           'checks': ['383 unique source refs and immutable source columns match baseline',
                      '217 JSON stores align by sequence plus checked names; CK Jeans alias retained',
                      'all owner floors valid and nonempty; JSON floors compatible after explicit Adidas correction',
                      'pending language/status/taxonomy approvals preserved; no area IDs or editorial Highlights']}
save('validation.json', receipt)
print(json.dumps({k: receipt[k] for k in ['records','ownerFloorDecisions','vincomJsonStores','jsonMissingUnits','locationQueueRows','jsonFloorCompatibility']}, ensure_ascii=True))
