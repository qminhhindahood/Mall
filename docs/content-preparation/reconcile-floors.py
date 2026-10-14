"""Prepare source-floor claims and a map review queue; never approve locations."""
import csv
import hashlib
import json
import re
from pathlib import Path
import argparse

parser = argparse.ArgumentParser()
parser.add_argument('--workspace', required=True, type=Path)
args = parser.parse_args()
workspace = args.workspace.resolve()
packet = Path(__file__).resolve().parent
inventory = json.loads((packet / 'supplied-reference-inventory.json').read_text(encoding='utf-8'))
floor_pattern = re.compile(r'(?<![A-Za-z0-9])(?:B[123]|L[1-6]|M)(?![A-Za-z0-9])')
records = []
crosswalk = []

for mall in ['saigon-centre', 'vincom-dong-khoi']:
    draft = json.loads((packet / f'{mall}.draft.json').read_text(encoding='utf-8'))
    geometry = json.loads((workspace / 'implementation/mall-visitor/data/malls' / mall / 'floor-geometry.json').read_text(encoding='utf-8'))
    floor_ids = [f['id'] for f in geometry['floors']]
    maps = {}
    for floor in floor_ids:
        path = (f'Takashimaya/Sơ đồ tầng/saigon-centre-so-do-tang-{floor}-2026-10-01.png'
                if mall == 'saigon-centre' else f'Vincom đồng khởi/map/tang-{floor.lower()}.webp')
        digest = hashlib.sha256((workspace / path).read_bytes()).hexdigest()
        assert any(i['path'] == path and i['sha256'] == digest for i in inventory), path
        maps[floor] = path
        crosswalk.append({'mallId': mall, 'floorId': floor, 'mapPath': path,
                          'sha256': digest, 'geometryRevision': geometry['revision']})
    source_lines = (workspace / draft['suppliedSource']).read_text(encoding='utf-8-sig').splitlines()
    for d in draft['destinations']:
        assert source_lines[d['source']['line'] - 1] == d['suppliedClaims']['rawRow']
        claims = []
        for origin, text in [('label', d['suppliedClaims']['label']),
                             ('section', d['suppliedClaims']['section'] or '')]:
            # Only parenthesized location text counts in labels (H&M is not floor M).
            location_text = ' '.join(re.findall(r'\(([^)]*)\)', text)) if origin == 'label' else text
            floors = floor_pattern.findall(location_text)
            # The explicit Takashimaya range is a source claim, never location approval.
            if 'B2–L3' in text:
                floors = floor_ids[floor_ids.index('B2'):floor_ids.index('L3') + 1]
            if floors:
                claims.append({'origin': origin, 'text': text, 'floorIds': list(dict.fromkeys(floors)),
                               'source': d['source']})
        # Descriptive prose can name a floor even when the label has no unit.
        match = re.search(r'Tầng\s+(B[123]|L[1-6]|M)\b', d['description']['vi'], re.I)
        if match:
            claims.append({'origin': 'description', 'text': d['description']['vi'],
                           'floorIds': [match.group(1).upper()], 'source': d['source']})
        # Explicit named move/opening claims from the supplied introduction, not table grouping.
        if mall == 'vincom-dong-khoi':
            note_floor = {'Yamazaki': 'B3', 'Crocs': 'B2', 'An Phước': 'B2',
                          'Valentino Creations': 'B2'}.get(d['name']['vi'])
            if note_floor:
                assert d['name']['vi'] in source_lines[8]
                claims.append({'origin': 'source-note', 'text': source_lines[8],
                               'floorIds': [note_floor], 'source': {'path': draft['suppliedSource'], 'line': 9}})
        claimed = list(dict.fromkeys(f for c in claims for f in c['floorIds']))
        assert all(f in maps for f in claimed), d['candidateRef']
        unit_claims = [v for v in re.findall(r'\(([^)]*)\)', d['suppliedClaims']['label']) if floor_pattern.search(v)]
        records.append({'candidateRef': d['candidateRef'], 'mallId': mall, 'name': d['name']['vi'],
                        'source': d['source'], 'claimedFloors': claimed, 'floorClaimEvidence': claims,
                        'claimedUnitOrRange': '; '.join(unit_claims) or None,
                        'referenceMaps': [maps[f] for f in claimed],
                        'reconciliationStatus': 'needs-map-comparison' if claimed else 'needs-explicit-list-floor',
                        'verifiedFloors': [], 'approvedAreaIds': [], 'editorialReviewedAt': None})

(packet / 'floor-claims.json').write_text(json.dumps({
    'revision': 'directory-map-reconciliation-2026-10-14-r2',
    'format': 'offline-floor-claims; not approved content',
    'highlightsDecision': 'deferred; owner will supply later',
    'mapCrosswalk': crosswalk, 'records': records}, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
with (packet / 'floor-review-queue.csv').open('w', encoding='utf-8-sig', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(['candidate_ref', 'mall', 'name', 'source_line', 'claimed_floors', 'unit_or_range',
                     'reference_maps', 'queue_status', 'reviewer_map_observation', 'resolution', 'approved_area_ids'])
    for r in records:
        writer.writerow([r['candidateRef'], r['mallId'], r['name'], r['source']['line'],
                         '; '.join(r['claimedFloors']), r['claimedUnitOrRange'],
                         '; '.join(r['referenceMaps']), r['reconciliationStatus'], '', '', ''])
for mall in ['saigon-centre', 'vincom-dong-khoi']:
    rows = [r for r in records if r['mallId'] == mall]
    unresolved = sum(not r['claimedFloors'] for r in rows)
    print(f'{mall}: {len(rows)} occurrences; {len(rows)-unresolved} explicit floor claims; {unresolved} without explicit floor claim')
print(f'{len(crosswalk)} map hashes match the existing reference inventory; no area IDs or approvals assigned')
