from pathlib import Path
import json
from shapely.geometry import Polygon
from shapely.affinity import affine_transform
from PIL import Image,ImageDraw,ImageFont
root=Path.cwd()
read=lambda p:json.loads((root/p).read_text(encoding='utf-8-sig'))
g=read('data/malls/saigon-centre/floor-geometry.json')
src=read('docs/content-preparation/completion-packet-2026-10-17/saigon-source-map.json')
official=read('docs/content-preparation/completion-packet-2026-10-17/saigon-research/official-source-map.json')
reg=read('docs/content-preparation/record-review-2026-10-18/registration.json')
d=read('data/malls/saigon-centre/directory.json')
occupied={(a['floorId'],rid) for a in d['areas'] for rid in a['regionIds']}
out=root/'evidence/saigon-last-two-r12';out.mkdir(exist_ok=True)
rows=[]
for floor in ['B2','B1','L1','L2','L3']:
 f=next(f for f in g['floors'] if f['id']==floor)
 sf=next(f for f in src['floors'] if f['id']==floor)
 transform=f['sources'][0]['transform']
 for c in official['takashimayaCounters']:
  cr=next((r for r in sf['regions'] if c['officialId'] in r['id']),None)
  if not cr:continue
  cp=affine_transform(Polygon(cr['outer'],cr.get('holes',[])).buffer(0),reg[floor]['shapelyAffine'])
  matches=[]
  for r in f['regions']:
   if (floor,r['id']) in occupied:continue
   p=Polygon(r['outer'],r.get('holes',[])).buffer(0)
   if not p.intersects(cp):continue
   iou=p.intersection(cp).area/p.union(cp).area
   matches.append((iou,r,p))
  if not matches:continue
  iou,r,p=max(matches,key=lambda x:x[0])
  if iou<.5:continue
  rows.append(dict(floor=floor,name=c['name'],counterId=c['officialId'],regionId=r['id'],iou=round(iou,5),officialSource=c['sourceUrl'],bounds=list(p.bounds)))
 # top six candidates, no acceptance yet
 best=sorted([r for r in rows if r['floor']==floor],key=lambda r:r['iou'],reverse=True)[:6]
 print(floor,json.dumps(best,ensure_ascii=True))
 for i,row in enumerate(best):
  region=next(r for r in f['regions'] if r['id']==row['regionId'])
  xy=[((x-transform[4])/transform[0],(y-transform[5])/transform[3]) for x,y in region['outer']]
  x0,y0,x1,y1=min(x for x,y in xy)-100,min(y for x,y in xy)-90,max(x for x,y in xy)+100,max(y for x,y in xy)+90
  im=Image.open(root/f'assets/saigon-centre/maps/{floor}.png').convert('RGB').crop((int(x0),int(y0),int(x1),int(y1)))
  ImageDraw.Draw(im).line([(x-x0,y-y0) for x,y in xy]+[(xy[0][0]-x0,xy[0][1]-y0)],fill='#dc1744',width=6)
  im.thumbnail((700,550)); im.save(out/f'{floor}-{i}-{row["regionId"]}.png')
(out/'counter-candidates.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf-8')


