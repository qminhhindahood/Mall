"""Build a private, static owner review. Never writes application data or approvals."""
from pathlib import Path
import collections,csv,hashlib,json,re
H=Path(__file__).resolve().parent;APP=H.parents[2];ROOT=APP.parents[1]
def read(p):return json.loads(p.read_text(encoding='utf-8'))
def save(p,data):p.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
def norm(v):return re.sub('[^a-z0-9]','',str(v).lower())
roster=read(H/'roster.json');records=roster['records'];summary=read(H/'summary.json')
inventory=list(csv.DictReader((ROOT/'docs/evidence/unit-hover-coverage-2026-10-17/regions.csv').open(encoding='utf-8-sig')))
vincom=read(H/'vincom-research/discoveries.json');unit_review=[]
for finding in vincom['records']:
    if not finding['unitEvidence']:continue
    claims=[]
    for claim in finding['unitEvidence']:
        matches=[r for r in inventory if r['mall']=='vincom-dong-khoi' and r['floor']==finding['floor'] and norm(r['supported_source_code'])==norm(claim['unitClaim'])]
        status=claim.get('status','')
        claims.append({**claim,'sameFloorExactCodeRegions':list(dict.fromkeys(r['region_id'] for r in matches)),
          'decision':'historical-or-access-limited-evidence; current branch/unit verification required' if any(x in status for x in ['historical','403','promotion']) else 'source-floor/identity conflict must be resolved' if finding['conflicts'] else 'candidate code-to-region correspondence; occupancy and mapping review required' if matches else 'no exact full-code match in existing inventory; do not invent/split a region'})
    unit_review.append({'id':finding['previewId'],'name':finding['name'],'floor':finding['floor'],'conflicts':finding['conflicts'],'claims':claims,'newApprovedRegions':[],'approval':'pending'})
save(H/'vincom-unit-correspondence-review.json',unit_review)
official_review=read(H/'saigon-research/discoveries.json')
official_by_id={r['officialId']:r for r in official_review['currentOfficialMallRoster']}
display=[];decisions=[]
for item in records:
    missing=[f for f in item['floors'] if not item['locations'].get(f)]
    photo=[p for p in item['photos'] if p.get('kind')!='logo-or-graphic']
    extras=[]
    for entry in item['official']:
        raw=official_by_id.get(entry['id']) if item['mall']=='saigon-centre' else None
        if raw:extras.append({'sourceUrl':entry['url'],'viAvailable':bool(raw['descriptionEvidence']['vi']),'enAvailable':bool(raw['descriptionEvidence']['en'])})
    row={k:item.get(k) for k in ['id','mall','name','floors','categories','description','descriptionEn','copyState','locations','photos','issues','official','openingSoon']}
    row.update(missingFloors=missing,sourceBilingualEvidence=extras,unitEvidence=item.get('unitEvidence',[]),mappingEvidenceNotes=item.get('mappingEvidenceNotes',[]),ownerUnits=item['ownerUnits'])
    display.append(row)
    decisions.append({'id':item['id'],'mall':item['mall'],'name':item['name'],'floors':item['floors'],
      'rosterDecision':'retain-owner-candidate' if item['occurrences'] else 'review-supplier-addition' if item['sourceRecords'] else 'review-official-only-addition',
      'copyDecision':'review-both-language-drafts' if item['copyState']=='bilingual-supplied-draft' else 'replace-listing-placeholder-with-evidenced-introduction',
      'mappingDecision':'obtain-location-evidence-for-'+','.join(missing) if missing else 'review-source-association-and-coordinate-frame-before-import',
      'photoDecision':'review-image-type/branch-association/rights' if photo else 'obtain-a-store-linked-image-or-approve-no-photo-treatment',
      'issues':item['issues'],'ownerApproval':False,'ownerApprovedAt':None})
save(H/'decisions.json',decisions)
maps={'saigon-centre':read(H/'saigon-source-map.json')['floors']}
vin_geometry=read(APP/'data/malls/vincom-dong-khoi/floor-geometry.json')
# Display serialization only; preserved input geometry remains untouched and hashed below.
maps['vincom-dong-khoi']=[{'id':f['id'],'bounds':f['bounds'],'regions':[{'id':r['id'],'role':'reference-context','outer':[[round(v,3) for v in xy] for xy in r['outer']],'holes':[[[round(v,3) for v in xy] for xy in ring] for ring in r.get('holes',[])]} for r in f['regions']]} for f in vin_geometry['floors']]
saigon_schematic=read(APP/'data/malls/saigon-centre/floor-geometry.json')['floors']
summary.update(byMall={mall:{'identities':sum(r['mall']==mall for r in records),'floorLocations':sum(len(r['floors']) for r in records if r['mall']==mall),'preciseLocationPending':sum(len(r['missingFloors']) for r in display if r['mall']==mall),'mediaCandidateIdentities':sum(bool(r['photos']) for r in records if r['mall']==mall)} for mall in ['vincom-dong-khoi','saigon-centre']},
  vincomUnitEvidenceRows=len(unit_review),vincomUnitRowsWithExactCodeCandidate=sum(any(c['sameFloorExactCodeRegions'] for c in r['claims']) for r in unit_review),
  mediaCandidateAssets=sum(len(r['photos']) for r in records),approvedMediaAssets=0,approvedCandidateLocations=0,
  noMediaCandidateIdentities=sum(not r['photos'] for r in records),separateCounterCandidates=len(read(H/'takashimaya-counter-candidates.json')))
save(H/'summary.json',summary)
payload={'summary':summary,'records':display,'maps':maps,'saigonSchematic':saigon_schematic}
html=(H/'review-template.html').read_text(encoding='utf-8').replace('__DATA__',json.dumps(payload,ensure_ascii=False,separators=(',',':')).replace('<','\\u003c'))
(H/'review.html').write_text(html,encoding='utf-8')
checks={
 'ownerOccurrenceLineage':len(roster['lineage'])+len(roster['excludedOccurrences'])==383,
 'uniqueCandidateIds':len({r['id'] for r in records})==len(records),
 'floorTotal':sum(len(r['floors']) for r in records)==sum(summary['mappingStates'].values()),
 'original170':len(read(H/'original-170-gap-decisions.json'))==170,
 'noApprovalFabricated':all(r['ownerApproval'] is False for r in records),
 'allRowsReviewable':len(display)==len(records)==len(decisions),
 'mediaSchemas':all(isinstance(p,dict) and p.get('url','').startswith(('https://','http://')) and p.get('ownerApproval') is False for r in records for p in r['photos']),
 'locationRegionsExist':True,
}
map_ids={mall:{f['id']:{r['id'] for r in f['regions']} for f in floors} for mall,floors in maps.items()}
for f in saigon_schematic:map_ids['saigon-centre'][f['id']].update(r['id'] for r in f['regions'])
missing_region=[]
for r in records:
    for floor,links in r['locations'].items():
        for link in links:
            if link['region'] not in map_ids[r['mall']].get(floor,set()):missing_region.append({'id':r['id'],'floor':floor,'region':link['region']})
checks['locationRegionsExist']=not missing_region
save(H/'validation.json',{'checks':checks,'missingRegionReferences':missing_region,'limits':['Research review only. Source polygons remain unregistered to the exterior/existing schematic frame.','Source description translation and media provenance do not imply editorial/rights approval.']})
assert all(checks.values()),checks
manifest=[]
for p in H.rglob('*'):
    if p.is_file() and p.name!='manifest.json':manifest.append({'path':str(p.relative_to(H)).replace('\\','/'),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
save(H/'manifest.json',manifest)
print(json.dumps(summary))
