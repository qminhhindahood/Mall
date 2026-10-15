"""Preserve the latest rebuilt owner CSV as an offline handoff; never publish."""
import csv
import hashlib
import json
import re
from collections import Counter, defaultdict
from pathlib import Path

workspace = Path('D:/Midterm')
here = Path(__file__).resolve().parent
source = workspace / 'all-record-map-comparison (1).csv'
raw = source.read_bytes()
rows = list(csv.DictReader(raw.decode('utf-8-sig').splitlines()))
assert len(rows) == len({r['candidate_ref'] for r in rows}) == 383
assert not (here / 'owner-source.csv').exists(), 'Preserve this revision; do not overwrite it.'
floors = {'saigon-centre': {'B2','B1','L1','L2','L3','L4','L5','L6'},
          'vincom-dong-khoi': {'B3','B2','B1','L1','M','L2','L3'}}
groups = defaultdict(list)
records, unknown, excluded = [], [], []
for index, r in enumerate(rows, 2):
    assert r['mall'] in floors and r['owner_correct_floor'] in floors[r['mall']], r['candidate_ref']
    assert r['owner_decision'].strip()
    removed = r['owner_correct_unit_or_area'].strip().upper() == 'REMOVED'
    unit = r['owner_correct_unit_or_area'].strip()
    uncertain = not unit or 'unknown' in unit.lower()
    record = {'sourceRef': r['candidate_ref'], 'sourceCsvLine': index, 'mallId': r['mall'],
              'name': r['name'], 'ownerFloor': r['owner_correct_floor'],
              'ownerUnitClaim': None if uncertain or removed else unit,
              'ownerDecision': r['owner_decision'], 'rawSource': r,
              'disposition': 'excluded-from-current-candidates' if removed else 'pending-basic-listing',
              'preciseMapping': 'withheld; no approved region IDs', 'areaIds': [],
              'approval': 'pending', 'reviewedAt': None, 'languages': {'vi': False,'en': False},
              'status': None, 'primaryFloor': None, 'editorialHighlights': []}
    records.append(record)
    if removed:
        excluded.append(record)
    elif uncertain:
        unknown.append(record)
    else:
        normal = unit.upper().replace(' ', '').replace('LÔ','')
        normal = re.sub(r'[,+&]', '-', normal)
        groups[(r['mall'], normal)].append(record)

def dump(name, value):
    (here / name).write_text(json.dumps(value, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')

(here / 'owner-source.csv').write_bytes(raw)
dump('records.json', {'revision': 'directory-preparation-final-2026-10-15-r1',
                      'format': 'offline-owner-handoff; not DirectorySnapshot',
                      'approval': 'pending', 'reviewedAt': None, 'highlights': [], 'records': records})
collisions = [{'mall': mall, 'normalizedUnit': unit, 'destinations': [r['name'] for r in rs]}
              for (mall, unit), rs in groups.items() if len(rs)>1]
dump('shared-unit-questions.json', collisions)
with (here / 'parked-locations.csv').open('w', encoding='utf-8-sig', newline='') as f:
    w=csv.writer(f); w.writerow(['source_ref','mall','name','owner_floor','unit','mapping','next_step'])
    for r in unknown:
        w.writerow([r['sourceRef'],r['mallId'],r['name'],r['ownerFloor'],'unknown',
                    'no precise marker','parked until owner location evidence / optional in-person visit'])
legacy = json.loads((workspace / 'store-data-vincom-dong-khoi.json').read_bytes())
legacy_by_id = {r['id']:r for r in legacy['stores']}
legacy_diff=[]
for r in records:
    if r['mallId']!='vincom-dong-khoi': continue
    match=re.search(r'(vd-(?:b[123]|l[123]|m|x)-\d+)$',r['sourceRef'])
    prior=legacy_by_id.get(match.group(1)) if match else None
    if not prior and r['sourceRef']=='vincom-dong-khoi-source-line-107':
        prior=next(s for s in legacy['stores'] if s['name']=='Crocs')
    if not prior: continue
    if (prior['name']!=r['name'] or prior['floor']!=r['ownerFloor'] or
        prior.get('unit')!=r['ownerUnitClaim'] or r['disposition']=='excluded-from-current-candidates'):
        legacy_diff.append({'sourceRef':r['sourceRef'],'name':r['name'],'legacyJson':prior,
                            'latestOwnerFloor':r['ownerFloor'],'latestOwnerUnit':r['ownerUnitClaim'],
                            'disposition':r['disposition']})
dump('legacy-json-differences.json',legacy_diff)
public_hashes={}
for mall in floors:
    p=workspace/'implementation/mall-visitor/data/malls'/mall/'directory.json'
    d=json.loads(p.read_bytes())
    assert d['approval']=='pending' and d['reviewedAt'] is None
    assert all(not d[k] for k in ['destinations','categories','areas','facilities','highlights'])
    public_hashes[mall]=hashlib.sha256(p.read_bytes()).hexdigest()
receipt={'revision':'directory-preparation-final-2026-10-15-r1','preparationStatus':'delivered',
         'publicationStatus':'pending; no approval inferred','sourceSha256':hashlib.sha256(raw).hexdigest(),
         'sourceRows':len(records),'sourceRowsByMall':dict(Counter(r['mallId'] for r in records)),
         'pendingActiveOccurrences':len(records)-len(excluded),'excludedOccurrences':len(excluded),
         'excludedNames':[r['name'] for r in excluded],'unknownUnitOccurrences':len(unknown),
         'sharedUnitGroups':len(collisions),'legacyJsonDifferenceRows':len(legacy_diff),
         'rowsWithOriginalLineField':sum(bool(r['source_line']) for r in rows),
         'publicHashes':public_hashes,
         'limits':['rebuilt IDs/metadata preserved; original source lineage not assumed',
                   'unit ranges/aliases may overlap beyond equal normalized strings',
                   'research statements are owner-supplied, not independently verified',
                   'source communication dates are not editorial approval dates']}
dump('validation.json',receipt)
print(json.dumps(receipt,ensure_ascii=True))
