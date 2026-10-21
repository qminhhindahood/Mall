from pathlib import Path
import json,hashlib
root=Path.cwd();read=lambda p:json.loads((root/p).read_text(encoding='utf-8-sig'))
revision='saigon-department-partials-2026-10-21-r12'
out=root/'evidence/saigon-last-two-r12'
d=read('data/malls/saigon-centre/directory.json');g=read('data/malls/saigon-centre/floor-geometry.json')
target=next(d for d in d['destinations'] if d['id']=='saigon-prototype-takashimaya')
candidates=read('evidence/saigon-last-two-r12/counter-candidates.json')
choices=[('B2','B2-region-030','Marou Station','Marou Station'),('B1','B1-region-018','Rập','Rập'),('L1','L1-region-030','Polo Ralph Lauren','Polo Ralph Lauren'),('L2','L2-region-050','TWG Tea Salon','TWG Tea Salon'),('L3','L3-region-054','Wilson','Wilson')]
rows=[];decisions=[];evidence=[]
for floor,rid,counter,vi in choices:
 f=next(f for f in g['floors'] if f['id']==floor);region=next(r for r in f['regions'] if r['id']==rid);source=f['sources'][0]
 candidate=next(r for r in candidates if r['floor']==floor and r['regionId']==rid and r['name']==counter)
 en=f'Only the named {counter} counter area within Takashimaya is highlighted on {floor}. This is a partial department reference, not the department-store perimeter, entrance or complete floor. Other counter areas are not included; current occupancy and walking connections are unverified.'
 vn=f'Chỉ tô vùng quầy {vi} thuộc Takashimaya trên tầng {floor}. Đây là phần tham chiếu của cửa hàng bách hóa, không phải toàn bộ ranh giới, cửa vào hay toàn bộ tầng. Không bao gồm các quầy khác; chưa xác minh tình trạng hoạt động và lối đi hiện tại.'
 decisions.append(dict(destinationId=target['id'],floor=floor,regionIds=[rid],printedUnits='No department unit or perimeter claimed; named '+counter+' counter only',reviewDecision='accept-partial-area-only'))
 rows.append(dict(destinationId=target['id'],floorId=floor,areaId='saigon-r12-takashimaya-counter-'+floor.lower(),printedUnits=decisions[-1]['printedUnits'],regionIds=[rid],originalLocations=target['locations'],source={k:source[k] for k in ['sha256','transform','path']},geometryRegions=[region],associationDetail=dict(kind='partial-source-layout',note=dict(en=en,vi=vn)),review=dict(status='accepted',reviewedBy='Codex GPT-6.1 Sol; original raster and archived official Takashimaya-counter identity reviewed',reviewedAt='2026-10-21',decision='accept-partial-area-only')))
 evidence.append(dict(**candidate,decision='accepted-partial-counter-area-only',basis='Named label lies inside this exact unchanged raster contour. Archived official Takashimaya counter directory establishes department membership; affine overlap is corroboration only, never whole-department boundary proof.',wholeDepartmentBoundaryEstablished=False))
review=dict(reviewedAt='2026-10-21',reviewedBy='Codex GPT-6.1 Sol source review',decisions=decisions,evidence=evidence,
 sourceHashes={p:hashlib.sha256((root/p).read_bytes()).hexdigest() for p in ['docs/content-preparation/completion-packet-2026-10-17/saigon-research/official-source-map.json','docs/content-preparation/completion-packet-2026-10-17/saigon-source-map.json','docs/content-preparation/record-review-2026-10-18/registration.json']},
 supersession='Supersedes Takashimaya floor-only treatment only for five named counter-reference areas. Counters are not unioned into a department perimeter. Immutable earlier holds and source bytes remain preserved.',
 matinKim=dict(outcome='still-floor-only',reason='Opening Soon unit claim L3-12 conflicts with Miana; original raster and official geometry identify Miana. Brand store locator lists only Hanoi in accessible current source. No branch-specific replacement geometry or relocation evidence found.',requiredInput='Mall-issued or brand-issued Saigon Centre L3 plan/boundary identifying Matin Kim and dated clarification of Miana/L3-12. A unit number alone does not resolve competing occupancy.'))
reviewPath='evidence/saigon-last-two-r12/source-review.json'
(root/reviewPath).write_text(json.dumps(review,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
base=read('data/research/saigon-asian-band-2026-10-21-r11.json')
packet=dict(revision=revision,mallId='saigon-centre',baseDirectoryRevision=base['baseDirectoryRevision']+'+'+base['revision'],activation='accepted-source-review',reviewEvidence=dict(path=reviewPath,sha256=hashlib.sha256((root/reviewPath).read_bytes()).hexdigest()),protectedHolds=[dict(destinationId='saigon-prototype-matinkimvietnam',floorId='L3',regionIds=[])],associations=rows)
(root/('data/research/'+revision+'.json')).write_text(json.dumps(packet,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'partialLocations':5,'destination':'Takashimaya','remainingFloorOnly':'Matin Kim','reviewSha256':packet['reviewEvidence']['sha256']}))

