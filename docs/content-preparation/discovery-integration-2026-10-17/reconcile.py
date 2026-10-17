"""Read source/research inputs and report unlike count domains without approving them."""
from pathlib import Path
import csv,json,hashlib,collections
H=Path(__file__).resolve().parent;APP=H.parents[2];ROOT=APP.parents[1]
source=ROOT/'docs/research/all-record-map-comparison (1).csv'
rows=list(csv.DictReader(source.open(encoding='utf-8-sig')))
report={'revision':'discovery-input-reconciliation-2026-10-17-r1','sourceCsv':{'path':str(source.relative_to(ROOT)),'sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'occurrences':len(rows),'nonemptyOwnerFloorClaims':sum(bool(r['owner_correct_floor'].strip()) for r in rows)},'scope':'Source occurrences, normalized preview identities, floor-locations and source-layout associations are different counts. None is a current approved directory.','malls':{}}
ledger=[]
for key,stem in [('vincom','vincom-dong-khoi'),('saigon','saigon-centre')]:
 research=json.loads((APP/f'data/research/{stem}.json').read_text(encoding='utf-8'))
 raw=json.loads((ROOT/f'docs/evidence/category-2026-10-17/store-data-{stem}.json').read_text(encoding='utf-8'))
 public=json.loads((APP/f'data/malls/{stem}/directory.json').read_text(encoding='utf-8'))
 floorloc=associated=0
 for record in research['records']:
  for floor in record['floors']:
   links=record['locations'].get(floor,[]);floorloc+=1;associated+=bool(links)
   ledger.append({'mall':stem,'previewId':record['id'],'name':record['name'],'floor':floor,'state':'source-layout-associated' if links else 'precise-location-pending','code':';'.join(sorted({x['code'] for x in links})),'regions':';'.join(x['region'] for x in links)})
 report['malls'][stem]={'sourceCsvOccurrences':sum(r['mall']==stem for r in rows),'suppliedJsonOccurrences':len(raw['stores']),'normalizedPreviewIdentities':len(research['records']),'previewFloorLocations':floorloc,'sourceAssociatedFloorLocations':associated,'pendingPreviewFloorLocations':floorloc-associated,'identitiesWithAnyAssociation':sum(bool(r['locations']) for r in research['records']),'publicApproval':public['approval'],'publicDestinations':len(public['destinations']),'publicReviewedAt':public['reviewedAt']}
assert len({(r['mall'],r['previewId'],r['floor']) for r in ledger})==len(ledger)
with (H/'floor-location-ledger.csv').open('w',encoding='utf-8-sig',newline='') as file:
 writer=csv.DictWriter(file,fieldnames=ledger[0].keys());writer.writeheader();writer.writerows(ledger)
report['previewTotals']={'identities':sum(m['normalizedPreviewIdentities'] for m in report['malls'].values()),'floorLocations':len(ledger),'pendingPreciseFloorLocations':sum(r['state']=='precise-location-pending' for r in ledger)}
(H/'counts.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(report['previewTotals']))
