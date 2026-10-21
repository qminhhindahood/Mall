"""Reproduce the reviewed source contours and neutral residuals; no source edits."""
import copy
import hashlib
import json
from pathlib import Path
from shapely.geometry import Polygon
from shapely.ops import unary_union

ROOT = Path.cwd()
OUT = ROOT / 'evidence/vincom-max-links-2026-10-22'
REV = 'vincom-max-source-units-2026-10-22-r1'
def read(p): return json.loads((ROOT / p).read_text(encoding='utf8'))
def save(p, value): (ROOT / p).write_bytes((json.dumps(value, ensure_ascii=False, indent=2)+'\n').encode('utf8'))
def sha(p): return hashlib.sha256((ROOT / p).read_bytes()).hexdigest()
base = read('evidence/vincom-max-links-2026-10-22/baseline-runtime.json')
old = read('data/research/vincom-mapping-prompt1-2026-10-21-r2.json')
nike = read('data/research/vincom-reopened-source-unit-2026-10-21-r1.json')
traces = {t['id'].removeprefix('vincom-prompt1-'): t for t in old['traces']}
manual = {
 'b1-21a': [[502,475],[540,475],[540,490],[502,490]],
 'b1-21b': [[502,494],[540,494],[540,507],[502,507]],
 'b1-19': [[502,424],[512,424],[528,441],[528,455],[502,455]],
 'b1-02': [[303,663],[378,663],[378,701],[303,701]],
 'b1-28b': [[461,765],[713,765],[713,880],[511,880],[511,803],[461,803]],
 'b1-28c': [[474,825],[509,825],[509,880],[474,880]],
 'b1-50-51': [[401,190],[676,190],[690,201],[678,216],[688,227],[688,257],[617,257],[617,280],[510,280],[510,299],[401,299]],
}
for key, pixels in manual.items(): traces[key] = {'floorId':'B1','sourcePixels':pixels,'id':key}

# A tuple is an association to a source-unit reference, never current exclusive occupancy.
specs = [
 ('karllagerfeld','M','M-31-32',['m-009'],'acfc','Weekend Max Mara'),
 ('poloralphlauren','M','M-04-05',['m-012'],'acfc','The Kooples; Maison loyalty separately lists Le Silla here'),
 ('valentinocreations','L2','L2-07',['l2-002'],'valentino','Valentino Creations; current distributor resolves older archived B2 floor'),
 ('lush','B1','B1-02',['b1-02'],'maison-stores','Ninewest'),
 ('urbanrevivo','B1','B1-28B/C',['b1-28b','b1-28c'],'maison-stores','Marhen.J / Puma / Ceci; Marhen.J current brand locator also claims B1-28B'),
 ('kohakuudonramen','B3','B3-10C',['b3-049'],'kohaku','Kyo Hananari'),
 ('yakinikulike','B3','B3-16A',['b3-050'],'yakiniku','Seoul Garden'),
 ('adidas','B2','B2-05',['b2-070'],'adidas','Lock & Lock'),
 ('pucini','B2','B2-50',['b2-064'],'pucini','Keds'),
 ('passifloresbeauty','L1','L1-46B/C',['l1-024'],'passiflores-caudalie','Paris & France; retailer Caudalie unit claim matched to its named branch by identical phone'),
 ('wilson','B1','B1-50-51',['b1-50-51'],'wilson','Old Navy; Wilson claims only B1-51, no internal divider supplied'),
 ('matviet','B1','B1-19 (partial of B1-18-19)',['b1-19'],'matviet','Only the coloured B1-19 portion; grey B1-18A/B is excluded'),
 ('tianlong','B3','B3-18B',['b3-040'],'tianlong','Plan prints Lau MK; operator confirms branch, transactional partners independently specify B3-18B'),
 ('longwang','B3','B3-19B',['b3-041'],'longwang','Plan prints Date Nariya; employer-published recruitment address specifies B3-19B'),
 ('touslesjours','B3','B3-19A',['b3-042'],'touslesjours','Plan prints Hue Delights; active voucher partner specifies B3-19A'),
 ('thematchatokyo','B3','B3-15C',['b3-052'],'matcha-unit','Plan prints Langfarm; published branch address specifies B3-15C, franchise operator separately confirms branch'),
 ('anphuoc','B2','B2-01C',['b2-068'],'anphuoc-unit','Plan prints Sealy; current branch directory and retained owner unit claim agree on B2-01C'),
 ('escentricsignature','L1','L1-46A',['l1-023'],'escentric-unit','Plan prints The Face Shop; dated distributor campaign coverage names L1-46A; current mall directory separately retains branch'),
 ('vincom-candidate-vd-b2-004','B2','B2-49',['b2-063'],'tnf-unit','Plan prints The North Face; bank merchant list repeats exact unit; competing Crocs B2-49 claim remains unconfirmed and current mall brand page instead says B1'),
 ('sony','B1','B1-21A/B (unit-21 reference)',['b1-21a','b1-21b'],'sony-unit','First-party Sony now specifies B1-21; plan has grey closed 21A/21B cells and unit-21 Prima Art legend. Numeric-family correspondence inference only; no surveyed perimeter or co-occupancy claim.'),
]
sources = {
 'acfc':'https://www.acfc.com.vn/he-thong-cua-hang',
 'valentino':'https://vmgfashion.com/pages/cua-hang-ap-dung-phieu-qua-tang',
 'maison-stores':'https://theme.hstatic.net/1000284478/1001180179/14/store-locations.json?v=16387',
 'kohaku':'https://sol.com.vn/booking/?jsf=epro-loop-builder%3Alisting-nha-hang&tax=danh-muc-nha-hang%3A6',
 'yakiniku':'https://dining-innovation.com.sg/yakinikulike/country/vietnam',
 'adidas':'https://www.adidas.com.vn/vi/help/sea-adiclub/which-adidas-stores-are-participating-in-the-adiclub-program',
 'pucini':'https://www.pucini.com.vn/',
 'passiflores-caudalie':'https://www.passifloresbeauty.com/blogs/news/cung-caudalie-buoc-vao-cuoc-hanh-trinh-cai-thien-th-m-nam-voi-bo-doi-v',
 'wilson':'https://www.wilsonsports.com.vn/pages/wilson-vietnam-stores',
 'owndays':'https://www.acfc.com.vn/blog/he-thong-cua-hang-owndays.html',
 'marhen':'https://marhenj.co.kr/shop/page.html?id=7',
 'matviet':'https://matviet.vn/pages/dat-lich',
 'matsuya':'https://www.matsuyafoods-holdings.co.jp/company/overseas-stores/',
 'aristino':'https://aristino.com/pages/he-thong-cua-hang',
 'samsonite':'https://samsonite-vietnam.com/pages/he-thong-cua-hang',
 'tianlong':'https://urbox.vn/thuong-hieu/tian-long-lau-bo-tuoi-trieu-chau-1867',
 'longwang':'https://www.topcv.vn/viec-lam/quan-ly-nha-hang-lau-hap-thuy-nhiet-long-wang/1744885.html',
 'touslesjours':'https://www.gotit.vn/brands/tous-les-jours.6',
 'matcha-unit':'https://hunufa.vn/menu-the-matcha-tokyo',
 'anphuoc-unit':'https://guidebold.com/guide/an-phuoc-pierre-cardin-vincom-dong-khoi-quan-1/',
 'escentric-unit':'https://dep.com.vn/parfums-de-marly-delina-collection-chat-huong-tieu-thu-quy-toc-phap-thoi-hien-dai/',
 'tnf-unit':'https://techcombank.com/content/dam/techcombank/public-site/promo_file/the-le-chuong-trinh-uu-dai-cho-chu-the-techcombank-tai-tttm-vincom.pdf',
 'sony-unit':'https://store.sony.com.vn/pages/tnc-goi-bao-duong-my-sony-care',
 'primaart':'https://primaart.com.vn/pages/store-location',
 'guess-unit':'https://www.vpbank.com.vn/-/media/vpbank-latest/1retail/promotion/for-cardholder/2025/cc-thang-9/acfc-2025/tnc--ACFC-2.pdf',
 'bodyshop-unit':'https://www.vib.com.vn/wps/wcm/connect/67efba38-98c6-4643-aab1-04db3a224cdf/THE%2BBODY%2BSHOP%2BSTORE%2BLIST.pdf?MOD=AJPERES',
 'isushi-unit':'https://cdn.xanhsm.com/2024/01/898b4429-danh_sach_nha_hang_ggg.pdf',
}
packet = {'revision':REV,'mallId':'vincom-dong-khoi','activation':'accepted-source-review',
 'baseDirectoryRevision':base['content']['revision'],'baseGeometryRevision':base['geometry']['revision'],
 'protectedHolds':nike['protectedHolds'],'associations':[],'sharedAssociations':[], 'newGeometry':[], 'neutralCuts':[]}
used = set(t for row in specs for t in row[3])
for key in sorted(used):
 t=traces[key];floor=next(f for f in base['geometry']['floors'] if f['id']==t['floorId']);source=floor['sources'][0]
 a,b,c,d,tx,ty=source['transform'];pixels=t['sourcePixels']
 region={'id':'vincom-max-'+key,'outer':[[round(a*x+c*y+tx,6),round(b*x+d*y+ty,6)] for x,y in pixels],'holes':[]}
 packet['newGeometry'].append({'floorId':floor['id'],'source':{**source,'path':f"assets/vincom-dong-khoi/maps/{floor['id']}.webp"},'sourcePixels':pixels,'retainedTrace':t['id'] if key not in manual else None,'region':region})

def limitation(unit, shared=False):
 if shared:
  return {'kind':'partial-source-layout','note':{'en':f'Approximate shared {unit} reference area from the supplied plan. Individual shop boundaries and current occupancy are unconfirmed; check signs on arrival.', 'vi':f'Khu vực tham chiếu chung gần đúng {unit} theo sơ đồ được cung cấp. Chưa xác nhận ranh giới riêng và cửa hàng đang hoạt động; vui lòng đối chiếu biển hiệu khi đến.'}}
 return {'kind':'source-layout','note':{'en':f'Approximate {unit} reference area from the supplied plan. Current shop boundaries and occupancy are unconfirmed; check signs on arrival.', 'vi':f'Khu vực tham chiếu gần đúng {unit} theo sơ đồ được cung cấp. Chưa xác nhận ranh giới và cửa hàng đang hoạt động; vui lòng đối chiếu biển hiệu khi đến.'}}

review=[]
for suffix,floor,unit,keys,sourceId,conflict in specs:
 id=suffix if suffix.startswith('vincom-') else 'vincom-prototype-'+suffix;dest=next(x for x in base['destinations'] if x['id']==id)
 geometry=[next(g for g in packet['newGeometry'] if g['region']['id']=='vincom-max-'+k) for k in keys]
 shared=suffix in ['wilson','urbanrevivo','matviet','sony']
 row={'destinationId':id,'floorId':floor,'areaId':'vincom-max-area-'+suffix,'printedUnits':unit,'regionIds':[g['region']['id'] for g in geometry], 'originalLocations':dest['locations'],'source':geometry[0]['source'],'geometryRegions':[g['region'] for g in geometry], 'associationDetail':limitation(unit,shared), 'review':{'status':'accepted','reviewedBy':'Codex source review (single session)','reviewedAt':'2026-10-22','decision':'accept-partial-area-only' if shared else 'accept-source-layout-area-only'}}
 packet['associations'].append(row)
 review.append({'destinationId':id,'floor':floor,'sourceId':sourceId,'url':sources[sourceId],'unit':unit,'conflict':conflict,'decision':'accept-approximate-source-unit-reference','exclusiveCurrentBoundaryVerified':False})

# Retained completed review, copied read-only from the other checkout. Preserve
# its exact contour and explicit exclusion of 17C; do not rerun that thread.
luk = read('evidence/vincom-max-links-2026-10-22/lukfook-source-packet.json')['associations'][0]
luk = copy.deepcopy(luk)
luk['source']['path']='assets/vincom-dong-khoi/maps/B1.webp'
assert next(r for f in base['geometry']['floors'] if f['id']=='B1' for r in f['regions'] if r['id']=='B1-region-008') == luk['geometryRegions'][0]
assert not any('B1-region-008' in a['regionIds'] for a in base['content']['areas'] if a['floorId']=='B1')
packet['associations'].append(luk)
lukReview=read('evidence/vincom-max-links-2026-10-22/lukfook-source-review.json')
review.append({'destinationId':luk['destinationId'],'floor':'B1','sourceId':'lukfook','url':lukReview['sourceReceipt']['url'],'unit':luk['printedUnits'],'conflict':'Old raster prints Crocs; dated 7 September 2026 brand release specifies B1-17AB. Existing retained independent serial review accepted this exact reference; excludes 17C and present-day perimeter continuity.','decision':'accept-approximate-source-unit-reference','exclusiveCurrentBoundaryVerified':False})
for suffix,anchor,unit,sourceId,claim in [('owndays','wilson','B1-50-51','owndays','B1-50 only; no individual divider'),('marhenj','urbanrevivo','B1-28B/C','marhen','B1-28B; overlapping retailer claim is not proven co-occupancy'),('primaart','sony','B1-21A/B (unit-21 reference)','primaart','Supplied legend names Prima Art at unit21; source cells 21A/B grouped as a numeric-family reference. Own current locator confirms B1 branch but omits unit. Current location and co-occupancy with Sony are explicitly unverified.')]:
 id='vincom-candidate-vd-b1-015' if suffix=='marhenj' else 'vincom-prototype-'+suffix
 dest=next(x for x in base['destinations'] if x['id']==id)
 anchorRow=next(x for x in packet['associations'] if x['destinationId']=='vincom-prototype-'+anchor)
 packet['sharedAssociations'].append({'destinationId':id,'floorId':'B1','printedUnits':unit,'areaName':{'en':unit+' shared reference area','vi':'Khu vực tham chiếu chung '+unit},'areaId':anchorRow['areaId'],'regionIds':anchorRow['regionIds'],'originalLocations':dest['locations'],'associationDetail':limitation(unit,True)})
 review.append({'destinationId':id,'floor':'B1','sourceId':sourceId,'url':sources[sourceId],'unit':unit,'conflict':claim,'decision':'accept-shared-source-unit-reference-only','exclusiveCurrentBoundaryVerified':False})

# Reuse one existing area ID instead of creating overlapping polygons for later
# unit claims. Existing destinations keep their associations; no co-occupancy claim.
for suffix,anchorId,floor,unit,sourceId,claim in [
 ('matsuya','vincom-prototype-sanfulou','B3','B3-28A/B','matsuya','Operator specifies 28B; shared area includes 28A and old San Fu Lou identity. Individual/current perimeter unresolved.'),
 ('aristino','vincom-candidate-vd-b2-036','B2','B2-03','aristino','Current locator specifies B2-03 (also says Tang 02); old plan prints BHPC. B2 membership independently retained in owner directory.'),
 ('samsonite','vincom-prototype-giordano','B2','B2-55-56','samsonite','Current operator specifies B2-55; shared source area also includes 56 and older Giordano identity. Current subdivision unresolved.'),
 ('guess','vincom-candidate-vd-b1-001','B1','B1-01','guess-unit','2025 bank/ACFC merchant list specifies B1-01; current distributor retains B1 branch. Original plan prints Aldo; no current co-occupancy or succession inferred.'),
 ('thebodyshop','vincom-candidate-vd-b1-021','B1','B1-30A/B','bodyshop-unit','Bank merchant list specifies B1-30AB; current mall retains B1 branch. Plan prints Shu Uemura; no co-occupancy or unchanged fit-out inferred.'),
 ('isushi','vincom-prototype-kichikichi','B3','B3-17','isushi-unit','2024 partner merchant list specifies B3-17; current Golden Gate offer retains branch. Plan prints Kichi Kichi; no co-occupancy or succession inferred.'),
]:
 id='vincom-prototype-'+suffix
 dest=next(x for x in base['destinations'] if x['id']==id)
 anchor=next(x for x in base['destinations'] if x['id']==anchorId)
 areaId=next(l for l in anchor['locations'] if l['floorId']==floor)['areaIds'][0]
 area=next(a for a in base['content']['areas'] if a['id']==areaId)
 row={'destinationId':id,'floorId':floor,'printedUnits':unit,'areaId':areaId,'regionIds':area['regionIds'],'originalLocations':dest['locations'],'originalArea':area,'anchorDestinationId':anchorId,'originalAnchorLocations':anchor['locations'],'areaName':{'en':unit+' shared reference area','vi':'Khu vực tham chiếu chung '+unit},'associationDetail':limitation(unit,True)}
 packet['sharedAssociations'].append(row)
 review.append({'destinationId':id,'floor':floor,'sourceId':sourceId,'url':sources[sourceId],'unit':unit,'conflict':claim,'decision':'accept-shared-source-unit-reference-only','exclusiveCurrentBoundaryVerified':False})

for row in packet['associations']+packet['sharedAssociations']:
 if row['destinationId']=='vincom-prototype-sony':
  row['associationDetail']['note']={'en':'Approximate reference to source-plan cells B1-21A/B, matched by unit number to Sony’s B1-21 address. Current shop extent and exact frontage are unconfirmed; check signs on arrival.','vi':'Tham chiếu gần đúng các ô B1-21A/B trên sơ đồ, đối chiếu số ô với địa chỉ B1-21 của Sony. Chưa xác nhận phạm vi và mặt tiền hiện tại; vui lòng đối chiếu biển hiệu khi đến.'}
 if row['destinationId']=='vincom-prototype-primaart':
  row['associationDetail']['note']={'en':'Source-plan reference for Prima Art: grouped B1-21A/B cells under unit 21. Its current shop location is unconfirmed; check signs on arrival. A shared reference does not establish shared premises.','vi':'Tham chiếu Prima Art theo sơ đồ: nhóm ô B1-21A/B thuộc số ô 21. Chưa xác nhận vị trí cửa hàng hiện tại; vui lòng đối chiếu biển hiệu khi đến. Tham chiếu chung không xác nhận dùng chung mặt bằng.'}

for f in base['geometry']['floors']:
 cuts=[Polygon(g['region']['outer']) for g in packet['newGeometry'] if g['floorId']==f['id']]
 if not cuts:continue
 combined=unary_union(cuts)
 for r in f['regions']:
  original=Polygon(r['outer'],r.get('holes',[]));intersection=original.intersection(combined).area
  if intersection<1e-8:continue
  owners=[a['id'] for a in base['content']['areas'] if a['floorId']==f['id'] and r['id'] in a['regionIds']]
  assert not owners,(r['id'],owners)
  assert r.get('role') in ['neutral-source-residual','unreviewed-reference-region'] or '-completion-r2-residual-' in r['id'],r['id']
  residual=original.difference(combined);parts=[residual] if residual.geom_type=='Polygon' else list(residual.geoms)
  regions=[]
  for i,q in enumerate(parts):
   if q.area<1e-10:continue
   regions.append({'id':r['id'] if not regions else r['id']+f'-max-residual-{i}', 'outer':[[round(x,8),round(y,8)] for x,y in list(q.exterior.coords)[:-1]],'holes':[[[round(x,8),round(y,8)] for x,y in list(ring.coords)[:-1]] for ring in q.interiors], 'role':'neutral-source-residual','derivedFrom':r['id']})
  assert abs(original.area-sum(Polygon(x['outer'],x['holes']).area for x in regions)-intersection)<1e-6
  packet['neutralCuts'].append({'floorId':f['id'],'original':r,'residuals':regions,'removedArea':intersection})
for i,g in enumerate(packet['newGeometry']):
 p=Polygon(g['region']['outer']);assert p.is_valid
 for h in packet['newGeometry'][i+1:]:
  if g['floorId']==h['floorId']:assert p.intersection(Polygon(h['region']['outer'])).area<1e-8
reviewPath='evidence/vincom-max-links-2026-10-22/source-review.json'
supportingInputs=[{'path':'evidence/vincom-max-links-2026-10-22/'+n,'sha256':sha('evidence/vincom-max-links-2026-10-22/'+n)} for n in ['lukfook-source-packet.json','lukfook-source-review.json','lukfook-release.html']]
save(reviewPath,{'decision':'accept-approximate-and-shared-source-unit-references','reviewedBy':'Codex single session; Lukfook retained completed serial review is explicitly attributed separately','reviewedAt':'2026-10-22','decisions':review,'sources':sources,'supportingInputs':supportingInputs,'limitations':'Neither plan publication date nor current exclusive premises, exact doorway or routes are verified. Shared links express common source-unit references, not contemporaneous co-occupancy. Primary locators are distinguished from transactional partner addresses, employer postings and corroborating secondary publications. Prima Art uses the printed source identity and current branch locator, not a fresh current unit assertion.'})
packet['reviewEvidence']={'path':reviewPath,'sha256':sha(reviewPath)}
path='data/research/'+REV+'.json';save(path,packet)
save('evidence/vincom-max-links-2026-10-22/geometry-review.json',{'newContours':len(packet['newGeometry']),'neutralRegionsCut':len(packet['neutralCuts']),'activeAreaOverlap':0,'newContourOverlap':0,'neutralAreaConservationTolerance':1e-6,'manualSourcePixelUncertainty':[1,3]})
print(json.dumps({'packetPath':path,'sha256':sha(path),'associations':len(packet['associations']),'sharedAssociations':len(packet['sharedAssociations']),'reviewSha256':sha(reviewPath)}))
