"""Validate frozen r11 scope and identity guards without loading/building the app."""
import hashlib
import json
from pathlib import Path

APP = Path(__file__).resolve().parents[2]
OUT = Path(__file__).resolve().parent
def read(p): return json.loads((APP/p).read_text(encoding='utf-8'))
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
checks = []
def check(name, ok):
    assert ok, name
    checks.append(dict(name=name, passed=True))
p = read('data/research/saigon-source-associations-2026-10-21-r11.json')
r = read(p['reviewEvidence']['path'])
g = read('data/malls/saigon-centre/floor-geometry.json')
d = read('data/malls/saigon-centre/directory.json')
r10 = read('data/research/saigon-source-associations-2026-10-21-r10.json')
check('review SHA-256', sha(APP/p['reviewEvidence']['path']) == p['reviewEvidence']['sha256'])
check('exact r10 directory chain', p['baseDirectoryRevision'] == d['revision']+'+'+r10['revision'])
check('three accepted partial scopes', len(p['associations']) == 3 and all(x['associationDetail']['kind']=='partial-source-layout' for x in p['associations']))
check('no new geometry', all(x['geometryChanged'] is False for x in r['acceptedScopes']))
check('seven bounded record outcomes', len(r['decisions'])+len(r['remaining']) == 7)
check('remaining split: three evidence, one implementation', [x['status'] for x in r['remaining']].count('evidence-blocked')==3 and [x['status'] for x in r['remaining']].count('implementation-pending')==1)
check('all immutable archive/source inputs unchanged', all(sha(APP/k)==v for k,v in r['immutableInputSha256'].items()))
for row in p['associations']:
    name = row['destinationId']
    floor = next(x for x in g['floors'] if x['id']==row['floorId'])
    destination = next(x for x in d['destinations'] if x['id']==name)
    check(name+': exact original floor-only locations', row['originalLocations']==destination['locations'] and all(l['certainty']=='floor-confirmed' and not l['areaIds'] for l in destination['locations']))
    check(name+': exact source contour, no occupied/r10 region', row['geometryRegions']==[x for x in floor['regions'] if x['id'] in row['regionIds']] and not any(a['floorId']==row['floorId'] and set(a['regionIds']) & set(row['regionIds']) for a in d['areas']+r10['associations']))
    check(name+': raster hash and transform', any(x['sha256']==row['source']['sha256'] and x['transform']==row['source']['transform'] and sha(Path('D:/Midterm')/x['path'])==x['sha256'] for x in floor['sources']))
    check(name+': exact review, bilingual limitations, no accepted unit', sum(x['destinationId']==name and x['floor']==row['floorId'] and x['regionIds']==row['regionIds'] and x['reviewDecision']==row['review']['decision'] for x in r['decisions'])==1 and all(row['associationDetail']['note'][l].strip() for l in ['vi','en']) and row['printedUnits']=='No unit code printed; named raster area only')
check('Yakiniku supersession explicitly retains unit hold', 'L5-05' in p['associations'][2]['associationDetail']['note']['en'] and 'remains unverified' in p['associations'][2]['associationDetail']['note']['en'])
check('Asian Corner broad parent stays protected', any(x['destinationId']=='saigon-prototype-asiancorner' for x in p['protectedHolds']))
check('Oedo shared parent stays unactivated', read('evidence/saigon-remaining-r11/oedo-shared-candidate.json')['activation']=='not-activated' and not any(x['destinationId']=='saigon-prototype-oedoalley' for x in p['associations']))
result=dict(passed=True, checks=checks, total=len(checks), applicationBuildRun=False, browserRun=False)
(OUT/'validation.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8')
print(json.dumps(dict(passed=True,total=len(checks),build='parent-owned',browser='parent-owned')))
