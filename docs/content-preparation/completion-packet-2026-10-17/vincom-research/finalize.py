import csv,json,re,unicodedata,pathlib,datetime,html,hashlib
P=pathlib.Path(__file__).parent; APP=P.parents[3]
NOW=datetime.datetime.now(datetime.timezone.utc).isoformat()
def norm(s):return re.sub('[^a-z0-9]','',unicodedata.normalize('NFKD',s.lower().replace('đ','d')))
records=json.loads((P/'official-stores.json').read_text(encoding='utf8'))['records']
by={x['normalizedName']:x for x in records}
alias={'cafecộng':'congcafe','cafecng':'congcafe','cafecong':'congcafe','somthai':'somtumthai','dookkidookki':'dookki','lukfookjewellery':'lukfookjewelry','dior':'christiandior','cledepeaubeaute':'cledepeau','mujosh tedbaker':'mujosh','mujoshtedbaker':'mujosh','tgnh thegioinuochoa':'thegioinuochoa','tg nhthegioinuochoa':'thegioinuochoa','tg nhthegiinuochoa':'thegioinuochoa','tgnhthegioinuochoa':'thegioinuochoa','viinriicnicheperfume':'viinriicniche','makeupforever':'makeupforever','lancome':'lancome'}
unit={}
acfc=json.loads((P/'acfc-vincom-stores.json').read_text(encoding='utf8'))
unitnames={'CK':'Calvin Klein','Gap':'GAP',"Levi's":'Levi’s','Nike':'Nike','Tommy Hilfiger':'Tommy Hilfiger','Cotton On':'Cotton On','Swarovski':'Swarovski','Karl Lagerfeld':'Karl Lagerfeld','Polo Ralph Lauren':'Polo Ralph Lauren','Mango':'Mango'}
for raw in acfc:
 for prefix,name in unitnames.items():
  if raw['storeName'].startswith(prefix+' '):
   claim=raw['address'].split(', Tầng')[0].split(', tầng')[0]
   unit[norm(name)]=[{'sourceUrl':raw['sourceUrl'],'unitClaim':claim,'address':raw['address'],'photoUrl':raw['photoUrl'],'rightsStatus':'unknown','evidenceFile':'acfc-locator.html','status':'first-party-claim-needs-geometry-correspondence'}];break
extras=[('Adidas','B2-05','https://www.adidas.com.vn/vi/help/sea-adiclub/which-adidas-stores-are-participating-in-the-adiclub-program','adidas-adiclub.html','search-index-only-direct-http403'),('Adidas Originals','B1-56','https://www.adidas.com.vn/vi/help/sea-adiclub/which-adidas-stores-are-participating-in-the-adiclub-program','adidas-adiclub.html','search-index-only-direct-http403'),('Samsonite','B2-55','https://samsonite-vietnam.com/pages/he-thong-cua-hang','samsonite-locator.html','first-party-claim-needs-geometry-correspondence'),('Lush','B1-02','https://www.maisononline.vn/blogs/news/maison-loyalty-quet-payme-qr-tich-diem-me-ly','maison-loyalty.html','first-party-promotion-list-claim-needs-currentness-check'),('MLB','B1-28D','https://www.maisononline.vn/blogs/news/maison-loyalty-quet-payme-qr-tich-diem-me-ly','maison-loyalty.html','first-party-promotion-list-claim-needs-currentness-check'),('Skechers','B1-28E','https://www.maisononline.vn/blogs/news/maison-loyalty-quet-payme-qr-tich-diem-me-ly','maison-loyalty.html','first-party-promotion-list-claim-needs-currentness-check'),('Urban Revivo','B1-28B','https://www.maisononline.vn/blogs/news/maison-loyalty-quet-payme-qr-tich-diem-me-ly','maison-loyalty.html','first-party-promotion-list-claim-needs-currentness-check'),('Charles & Keith','B1-03-04-05','https://www.maisononline.vn/blogs/store/b1-03-04-05-vincom-dong-khoi-72-le-thanh-ton-quan-1-tp-hcm','maison-charles.html','historical-2018-claim-body-shorthand-B1-03-05'),('Valentino Creations','L2-07','https://vincom.com.vn/store/valentino-creations-vincom-center-dong-khoi?center=vincom-center-dong-khoi','store-pages/valentino-creations-vincom-center-dong-khoi.html','first-party-mall-specific-description-claim'),('Hokkaido Sachi','B3-07','https://vincom.com.vn/trend/nha-hang-nhat-quan-1','vincom-japanese.html','historical-2022-mall-editorial-claim'),('Kohaku Udon Ramen','B3-10C','https://vincom.com.vn/trend/nha-hang-nhat-quan-1','vincom-japanese.html','historical-2022-name-Kohaku-Udon-and-Sushi-needs-identity-review')]
for name,code,url,file,status in extras:unit.setdefault(norm(name),[]).append({'unitClaim':code,'sourceUrl':url,'evidenceFile':file,'status':status})
rows=list(csv.DictReader((APP/'docs/content-preparation/discovery-integration-2026-10-17/floor-location-ledger.csv').open(encoding='utf-8-sig')))
out=[]
def floors(t):
 if t is None:return []
 # Official text can enumerate two floors; do not treat numbers in brand names as floors.
 b=re.findall(r'B[123]|L[123]|\bM\b',t)
 if b:return sorted(set(b))
 return ['L'+x for x in re.findall(r'(?:Tầng|tầng)\s*([123])\b',t)]
for x in rows:
 if x['mall']!='vincom-dong-khoi' or x['state']!='precise-location-pending':continue
 key=norm(x['name']); match=by.get(alias.get(key,key));claims=unit.get(key,[]);conflicts=[]
 if match:
  fs=floors(match['floorClaim'])
  if fs and x['floor'] not in fs:conflicts.append({'kind':'preview-floor-vs-live-directory','preview':x['floor'],'official':match['floorClaim']})
 if x['name']=='Mujosh & Ted Baker':conflicts.append({'kind':'combined-preview-identity','official':'Mujosh only; Ted Baker association not established'})
 if x['name']=='The New Playground':conflicts.append({'kind':'multi-floor-expansion','officialIntro':'B1 and B2 mentioned; preview has B1 only'})
 out.append({**x,'normalizedName':key,'retrievedAt':NOW,'officialMatch':({'name':match['name'],'sourceUrl':match['sourceUrl'],'floorClaim':match['floorClaim'],'logoUrl':match['logoUrl'],'evidenceFile':match['evidenceFile'],'photoCandidates':match['photoCandidates']} if match else None),'unitEvidence':claims,'photoCandidates':[{'url':a['photoUrl'],'sourceUrl':a['sourceUrl'],'association':'locator explicitly names this branch','rightsStatus':'unknown','visualReview':'pending'} for a in claims if a.get('photoUrl')],'rightsStatus':'unknown','finalMappingStatus':'pending-no-verified-unit-to-polygon-correspondence','finalRegionIds':[],'ownerApproval':'pending','conflicts':conflicts})
summary={'retrievedAt':NOW,'pendingRowsInvestigated':len(out),'matchedOfficialDirectoryRows':sum(bool(x['officialMatch']) for x in out),'pendingRowsWithUnitEvidence':sum(bool(x['unitEvidence']) for x in out),'pendingRowsWithBranchLinkedPhotoCandidates':sum(bool(x['photoCandidates']) for x in out),'pendingRowsWithFloorConflicts':sum(bool(x['conflicts']) for x in out),'finalMappedRows':0,'photoReuseGrantsFound':0,'officialDirectoryCards':len(records),'officialBackOfHouseCards':sum('(kho)' in x['name'] for x in records),'officialVisitorFacingCards':sum('(kho)' not in x['name'] for x in records),'officialStoreDetailHttp200':sum(x.get('httpStatus')==200 for x in records),'officialDescriptionSourceRecords':sum(bool(x.get('descriptionSourceVi')) for x in records),'officialContentImageRecords':sum(bool(x.get('photoCandidates')) for x in records)}
(P/'discoveries.json').write_text(json.dumps({'summary':summary,'records':out,'additionalUnitClaims':unit,'officialRemovalConflicts':['HLA','Boost Juice','Letitia'],'note':'Research candidates only. Neither owner approval nor final geometry mapping. A directory listing is not independent status verification.'},ensure_ascii=False,indent=2),encoding='utf8')
manifest=[]
for file in P.rglob('*'):
 if file.is_file() and file.suffix in ['.html','.json'] and file.name!='evidence-manifest.json':manifest.append({'file':str(file.relative_to(P)).replace('\\','/'),'bytes':file.stat().st_size,'sha256':hashlib.sha256(file.read_bytes()).hexdigest()})
(P/'evidence-manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf8')
print(json.dumps(summary,indent=2))
print('unmatched',[(x['name'],x['floor']) for x in out if not x['officialMatch']])
print('conflicts',[(x['name'],x['conflicts']) for x in out if x['conflicts']])
