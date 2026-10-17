"""Reconcile owner occurrences and primary-source candidates without granting approval."""
from pathlib import Path
import collections, copy, csv, hashlib, json, math, re, unicodedata
from urllib.parse import urljoin

HERE=Path(__file__).resolve().parent
APP=HERE.parents[2]
ROOT=APP.parents[1]
DATE='2026-10-17'
def read(path): return json.loads(path.read_text(encoding='utf-8'))
def save(path,value): path.write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

def media_items(value):
    if isinstance(value,dict):return [value] if value.get('url') else []
    if isinstance(value,list):return [x for x in value if isinstance(x,dict) and x.get('url')]
    return []
def norm(text):
    text=unicodedata.normalize('NFD',text).replace('đ','d').replace('Đ','D')
    return re.sub('[^a-z0-9]','', ''.join(c for c in text.lower() if not unicodedata.combining(c)))
def slug(text): return re.sub('[^a-z0-9]+','-',unicodedata.normalize('NFKD',text).encode('ascii','ignore').decode().lower()).strip('-')
def floors(text): return list(dict.fromkeys(re.findall(r'B[123]|L[1-6]|(?<![A-Z])M(?![A-Z])',text.upper())))
def linked_name(name):
    return {'bastahiroitalianrestaurant':'bastahiro','thehourglass':'thehourglass','dimtutacrestaurant':'dimtutac','genkisushi':'genkisushi','levisvietnam':'levis','pepperlunchvietnam':'pepperlunch','longjingrestaurant':'longjing','matinkimvietnam':'matinkim','thebodyshopvietnam':'thebodyshop','gyushigenguuphon':'gyushigeyakiniku','gongchavietnam':'gongcha','diamondworld':'thegioikimcuong','jindinrou':'jindinroutaiwaneserestaurant','oedoalleyjapanesefoodvillage':'oedoalley','asanohamodernjapanesehotpot':'asanoha','somthai':'somtamthai','tagheueropeningsoon':'tagheuer'}.get(norm(name),norm(name))

translations=read(HERE/'bilingual/translations.json')
if 'translations' in translations: translations=translations['translations']
csv_path=ROOT/'docs/research/all-record-map-comparison (1).csv'
occurrences=list(csv.DictReader(csv_path.open(encoding='utf-8-sig')))
regions=list(csv.DictReader((ROOT/'docs/evidence/unit-hover-coverage-2026-10-17/regions.csv').open(encoding='utf-8-sig')))
groups={};excluded=[];source_conflicts=[];lineage=[]
raw_by_mall={m:read(ROOT/f'docs/evidence/category-2026-10-17/store-data-{m}.json')['stores'] for m in ('vincom-dong-khoi','saigon-centre')}
old={m:read(APP/f'data/research/{m}.json') for m in raw_by_mall}
original_gap_ledger=list(csv.DictReader((APP/'docs/content-preparation/discovery-integration-2026-10-17/floor-location-ledger.csv').open(encoding='utf-8-sig')))

def group(mall,name,identifier):
    key=(mall,linked_name(name))
    if key not in groups:
        previous=next((r for r in old[mall]['records'] if linked_name(r['name'])==key[1]),None)
        groups[key]={'id':previous['id'] if previous else f"{mall.split('-')[0]}-candidate-{slug(identifier)}",'mall':mall,'name':name,'floors':[],'categories':list(previous['categories']) if previous else [],'description':previous.get('description','') if previous else '', 'locations':copy.deepcopy(previous.get('locations',{})) if previous else {},'occurrences':[],'ownerUnits':{},'sourceRecords':[],'official':[],'photos':[],'issues':[],'ownerApproval':False}
    return groups[key]

for index,row in enumerate(occurrences,2):
    if 'REMOVED from site data' in row['owner_decision']:
        excluded.append({'csvLine':index,**row});continue
    mall=row['mall'];identifier=row['candidate_ref'].split(mall+'-')[-1]
    matches=[r for r in raw_by_mall[mall] if r['id']==identifier and linked_name(r['name'])==linked_name(row['name'])]
    if not matches: matches=[r for r in raw_by_mall[mall] if linked_name(r['name'])==linked_name(row['name'])]
    item=group(mall,row['name'],identifier)
    item['occurrences'].append({'csvLine':index,'sourceRef':row['candidate_ref'],'sourcePath':row['source_path'],'decision':row['owner_decision']})
    for floor in floors(row['owner_correct_floor'] or row['latest_list_floors']):
        if floor not in item['floors']:item['floors'].append(floor)
        item['ownerUnits'].setdefault(floor,[])
        unit=row['owner_correct_unit_or_area'].strip()
        if unit and unit not in item['ownerUnits'][floor]:item['ownerUnits'][floor].append(unit)
        for region in regions:
            if region['mall']==mall and region['floor']==floor and row['candidate_ref'] in region['owner_candidate_refs'].split(';') and region['supported_source_code']:
                item['locations'].setdefault(floor,[]).append({'region':region['region_id'],'code':region['supported_source_code']})
    for raw in matches:
        if raw not in item['sourceRecords']:item['sourceRecords'].append(raw)
    lineage.append({'csvLine':index,'sourceRef':row['candidate_ref'],'destinationId':item['id'],'mall':mall,'disposition':'candidate'})

# Preserve JSON-only named additions even when their supplier IDs collide with another name.
for mall,records in raw_by_mall.items():
    for raw in records:
        if any(linked_name(x['name'])==linked_name(raw['name']) and x['mall']==mall for x in excluded):continue
        item=group(mall,raw['name'],raw['id']+'-'+raw['name'])
        if raw not in item['sourceRecords']:item['sourceRecords'].append(raw)
        if not item['occurrences']:
            item['issues'].append('JSON-only named addition; owner roster decision pending')
            for floor in floors(raw.get('floor','')):
                if floor not in item['floors']:item['floors'].append(floor)

source_to_candidates={}
official_path=HERE/'saigon-research/official-directory-en.json'
official=read(official_path)['items'] if official_path.exists() else []
counters_path=HERE/'saigon-research/official-storeInfoTaka-en.json'
counters=read(counters_path)['items'] if counters_path.exists() else []

def official_maps(record):
    raw=record['properties'].get('mapData')
    if not raw:return []
    data=json.loads(raw) if isinstance(raw,str) else raw
    return [(f['floorId'],f['geometry']) for f in data.get('floor',[]) if isinstance(f.get('geometry'),dict) and f['geometry'].get('type') in ('Polygon','MultiPolygon')]

for record in official:
    props=record['properties']; name=props.get('storeName') or record['name']; key=('saigon-centre',linked_name(name))
    item=group('saigon-centre',name,record['id'])
    url='https://shopping.saigoncentre.com.vn/en'+record['slug']
    item['official'].append({'id':record['id'],'url':url,'floor':props.get('floorLocation',[]),'unit':props.get('storeLocationDetail'),'status':props.get('storeStatus'),'retrievedAt':DATE})
    item['officialCategoryLabels']=[c['name'] for c in props.get('storeCategory') or []]
    if not item['floors']:item['floors']=list(props.get('floorLocation',[]));item['issues'].append('Official-directory addition; owner roster review pending')
    source_to_candidates[record['id']]=item
    for floor,geometry in official_maps(record):
        if floor not in item['floors']:item['issues'].append(f'Official map floor {floor} differs from owner roster');continue
        # Store UUID, not printed unit, identifies area: shared text codes can have distinct polygons.
        item['locations'][floor]=[{'region':f"official-{record['id']}-{floor.lower()}",'code':props.get('storeLocationDetail') or name,'areaKey':record['id']}]
    for image in media_items(props.get('storeBanner')) or media_items(props.get('storeThumbnail')):
        item['photos'].append({'url':urljoin('https://shopping.saigoncentre.com.vn',image['url']),'sourceUrl':url,'association':'official store media field; branch appearance needs visual review','kind':'logo-or-graphic' if 'logo' in (image.get('name') or '').lower() else 'unreviewed-store-associated-image','visualReview':'pending','rights':'not independently established','ownerApproval':False,'width':image.get('width'),'height':image.get('height')})
    if item['ownerUnits'] and props.get('storeLocationDetail') and all(norm(props['storeLocationDetail'])!=norm(u) for values in item['ownerUnits'].values() for u in values):item['issues'].append('Official unit text differs from owner claim; retain both')

# Attach the independent Vincom research without reinstating owner removals or inventing polygons.
vincom_findings=read(HERE/'vincom-research/discoveries.json')
vincom_records=read(HERE/'vincom-research/official-stores.json')['records']
vincom_aliases={'cottonon':'cottonon','cafecong':'congcafe','somtamthai':'somtumthai','dookkidookki':'dookki','lukfookjewellery':'lukfookjewelry','dior':'christiandior','cledepeaubeaute':'cledepeau','mujoshtedbaker':'mujosh','tgnhthegioinuochoa':'thegioinuochoa','viinriicnicheperfume':'viinriicniche','tuyetkieu':'vangtuyetkieu','tgkcthegioikimcuong':'thegioikimcuong'}
vincom_index={norm(r['name']):r for r in vincom_records if '(kho)' not in r['name']}
for (mall,key),item in groups.items():
    if mall!='vincom-dong-khoi':continue
    candidate=vincom_index.get(vincom_aliases.get(key,key))
    pending=[r for r in vincom_findings['records'] if r['previewId']==item['id']]
    item['unitEvidence']=vincom_findings['additionalUnitClaims'].get(norm(item['name']),[])
    item['mappingEvidenceNotes']=[]
    if candidate:
        claim=candidate.get('floorClaim') or ''
        claim_floors=floors(claim)
        if not claim_floors:claim_floors=['L'+v for v in re.findall(r'[Tt]ầng\s*([1-3])\b',claim)]
        item['official'].append({'id':candidate.get('normalizedName'),'url':candidate['sourceUrl'],'floor':claim_floors,'floorText':claim,'unit':None,'status':'listed; not independently occupancy verified','retrievedAt':DATE})
        if claim_floors and any(f not in claim_floors for f in item['floors']):item['issues'].append('Official floor listing differs from one or more owner/source floor claims; retain both')
        if 'tedbaker' in key:item['issues'].append('Combined identity: official record establishes Mujosh, not the Ted Baker association')
        for image in candidate.get('photoCandidates',[]):
            item['photos'].append({'url':image['url'],'sourceUrl':candidate['sourceUrl'],'association':'official brand detail image; this branch appearance unverified','kind':'unreviewed-brand-detail-image','visualReview':'pending','rights':'not independently established','ownerApproval':False})
    for finding in pending:
        item['mappingEvidenceNotes'].extend(finding.get('conflicts',[]))
        for image in finding.get('photoCandidates',[]):
            item['photos'].append({'url':image['url'],'sourceUrl':image['sourceUrl'],'association':image.get('association'),'kind':'unreviewed-branch-locator-image','visualReview':'pending','rights':'not independently established','ownerApproval':False})
    if not candidate:item['issues'].append('No safe current mall-directory identity match; retain owner roster candidate for decision')

# Preserve department-store counters as a separate inventory, never merge identical brands across contexts.
counter_rows=[]
for record in counters:
    props=record['properties']
    counter_rows.append({'id':record['id'],'name':props.get('storeName') or record['name'],'parent':'Takashimaya','floors':props.get('floorLocation',[]),'sourceUrl':'https://shopping.saigoncentre.com.vn/en'+record['slug'],'maps':[{'floor':f,'geometry':g} for f,g in official_maps(record)],'description':props.get('description'),'approval':'pending','issues':['Floor outside owner-confirmed B2–L3 scope'] if any(f not in ['B2','B1','L1','L2','L3'] for f in props.get('floorLocation',[])) else []})
save(HERE/'takashimaya-counter-candidates.json',counter_rows)

source_category={'restaurant':1,'cafe':1,'supermarket':10,'fashion':0,'beauty':8,'electronics':5,'entertainment':2}
saigon_category={'restaurant':1,'cafe':1,'supermarket':5,'fashion':2,'beauty':3,'electronics':8}
for item in groups.values():
    for raw in item['sourceRecords']:
        if not item['description']:item['description']=raw.get('highlights','')
        if not item.get('website') and raw.get('website'):item['website']=raw['website']
        if not item.get('cuisine') and raw.get('cuisine'):item['cuisine']=raw['cuisine']
    text=item['description']; english=translations.get(text,'')
    if isinstance(english,dict):english=english.get('en','')
    item['descriptionEn']=english
    item['copyState']='bilingual-supplied-draft' if text and english else 'introduction-missing'
    if not item['sourceRecords'] and item['official']:
        label=item['name'];floor='/'.join(item['floors'])
        item['description']=f'{label} được danh mục Saigon Centre liệt kê tại tầng {floor}. Thông tin giới thiệu cửa hàng đang được xác minh.'
        item['descriptionEn']=f'{label} is listed in the Saigon Centre directory on level {floor}. The store introduction is being verified.'
        item['copyState']='bilingual-source-listing-placeholder'
    if not item['categories']:
        category=next((r.get('category') for r in item['sourceRecords'] if r.get('category')),None)
        mapping=source_category if item['mall']=='vincom-dong-khoi' else saigon_category
        item['categories']=[f'category-{mapping[category]}'] if category in mapping else ['category-pending']
        item['issues'].append('Category assignment proposed from source taxonomy; owner review pending')
    if not text:item['issues'].append('No supplied description; editorial draft required')
    if not item['photos']:item['issues'].append('No store-linked photo candidate yet')
    item['photos']=list({(p['url'],p['sourceUrl']):p for p in item['photos']}.values())
    item['floors']=list(dict.fromkeys(item['floors']))
    item['openingSoon']=any(r.get('status') in ('opening-soon','opening_soon') for r in item['sourceRecords']) or any((r.get('status') or '').lower()=='opening soon' for r in item['official'])
    for floor,links in item['locations'].items():
        item['locations'][floor]=list({(x['region'],x['code']):x for x in links}.values())

records=list(groups.values())
assert len({r['id'] for r in records})==len(records),'Candidate IDs collide'
save(HERE/'roster.json',{'revision':'completion-candidates-2026-10-17-r1','approval':'pending','ownerApprovedAt':None,'records':records,'excludedOccurrences':excluded,'lineage':lineage})

# All coordinates below come from the official same-frame map, never inferred store pins.
layouts_path=HERE/'saigon-research/official-floorPlanMap-en.json'
if layouts_path.exists():
    origin=[106.7008,10.7731]; meters=111319.49079327358
    def project(point):return [round((point[0]-origin[0])*math.cos(math.radians(origin[1]))*meters,6),round(-(point[1]-origin[1])*meters,6)]
    def polygons(geometry):
        if geometry.get('type')=='Polygon':return [geometry['coordinates']]
        if geometry.get('type')=='MultiPolygon':return geometry['coordinates']
        return []
    source_map={'revision':'saigon-official-source-map-2026-10-17-r1','frame':{'version':'official-geographic-source-v1','units':'local planar meters','scaleStatus':'equirectangular projection of official coordinates; not survey verified','orientationStatus':'north up; not registered to exterior/schematic'},'floors':[]}
    layouts=read(layouts_path)['items']
    for order,floor in enumerate(['B2','B1','L1','L2','L3','L4','L5','L6']):
        regions_out=[]
        def add(geometry,identifier,role):
            for number,poly in enumerate(polygons(geometry)):
                if not poly or len(poly[0])<4:continue
                regions_out.append({'id':identifier if number==0 else identifier+f'-part-{number}','outer':[project(p) for p in poly[0]],'holes':[[project(p) for p in ring] for ring in poly[1:]],'role':role,'certainty':'official-source geometry; owner review pending'})
        for layout in layouts:
            if floor not in layout['properties'].get('floor',[]):continue
            for n,feature in enumerate(json.loads(layout['properties']['layout'])['features']):
                if feature.get('geometry'):add(feature['geometry'],f'context-{floor.lower()}-{n}','reference-context')
        for record in official:
            for f,geometry in official_maps(record):
                if f==floor:add(geometry,f"official-{record['id']}-{floor.lower()}",'official-store-source')
        # Counters are not yet selectable without a completed parent/identity review.
        for record in counters:
            for f,geometry in official_maps(record):
                if f==floor:add(geometry,f"counter-{record['id']}-{floor.lower()}",'official-counter-source')
        points=[p for region in regions_out for p in region['outer']]
        bounds=[min(p[0] for p in points)-2,min(p[1] for p in points)-2,max(p[0] for p in points)+2,max(p[1] for p in points)+2]
        source_map['floors'].append({'id':floor,'label':floor,'order':order,'elevation':order*5,'bounds':bounds,'regions':regions_out,'sources':[{'path':'https://shopping.saigoncentre.com.vn/api/content?contentType=floorPlanMap&locale=en&take=500','sha256':hashlib.sha256(layouts_path.read_bytes()).hexdigest(),'width':0,'height':0,'transform':[],'certainty':'official-coordinate source; independent of existing schematic'}],'preview':None})
    save(HERE/'saigon-source-map.json',source_map)

mapping_rows=[]
for item in records:
    for floor in item['floors']:
        links=item['locations'].get(floor,[])
        mapping_rows.append({'mall':item['mall'],'id':item['id'],'name':item['name'],'floor':floor,'state':'official-source-polygon' if any(x['region'].startswith('official-') for x in links) else 'source-schematic-association' if links else 'precise-location-pending','units':';'.join(item['ownerUnits'].get(floor,[])),'regions':';'.join(x['region'] for x in links),'issues':'; '.join(item['issues'])})
with (HERE/'mapping-review.csv').open('w',encoding='utf-8-sig',newline='') as f:
    writer=csv.DictWriter(f,fieldnames=mapping_rows[0].keys());writer.writeheader();writer.writerows(mapping_rows)
original=[]
for row in original_gap_ledger:
    if row['state']!='precise-location-pending':continue
    current=next((r for r in mapping_rows if r['mall']==row['mall'] and linked_name(r['name'])==linked_name(row['name']) and r['floor']==row['floor']),None)
    original.append({**row,'newState':current['state'] if current else 'identity-reconciliation-pending','newRegions':current['regions'] if current else ''})
save(HERE/'original-170-gap-decisions.json',original)
summary={'revision':'completion-packet-2026-10-17-r1','approval':'pending','ownerApprovedAt':None,'sourceCsvOccurrences':len(occurrences),'excludedOwnerOccurrences':len(excluded),'candidateIdentities':len(records),'candidateFloorLocations':len(mapping_rows),'mappingStates':dict(collections.Counter(r['state'] for r in mapping_rows)),'original170States':dict(collections.Counter(r['newState'] for r in original)),'bilingualSuppliedCandidates':sum(r['copyState']=='bilingual-supplied-draft' for r in records),'bilingualListingPlaceholders':sum(r['copyState']=='bilingual-source-listing-placeholder' for r in records),'photoCandidateDestinations':sum(bool(r['photos']) for r in records),'officialMallDirectoryRecords':len(official),'separateTakashimayaCounterCandidates':len(counter_rows),'counterScopeConflicts':sum(bool(r['issues']) for r in counter_rows)}
save(HERE/'summary.json',summary)
print(json.dumps(summary))
