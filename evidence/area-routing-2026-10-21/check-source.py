from pathlib import Path
from PIL import Image
import hashlib,json
root=Path('.')
rows=[]
for mall,name,orig in [('saigon-centre','saigon-L5.png','D:/Midterm/Takashimaya/Sơ đồ tầng/saigon-centre-so-do-tang-L5-2026-10-01.png'),('vincom-dong-khoi','vincom-B3.webp','D:/Midterm/Vincom đồng khởi/map/tang-b3.webp')]:
 p=root/'src/assets/routing'/name;b=p.read_bytes();built=root/'dist'/mall/'routing'/name
 rows.append({'mall':mall,'source':orig,'candidateAsset':str(p),'sha256':hashlib.sha256(b).hexdigest(),'pixels':Image.open(p).size,'sourceBytesExact':b==Path(orig).read_bytes(),'builtBytesExact':b==built.read_bytes(),'mallRoutingFiles':[x.name for x in built.parent.iterdir()]})
(root/'evidence/area-routing-2026-10-21/source-identity.json').write_text(json.dumps(rows,indent=2,ensure_ascii=False),encoding='utf-8')
print(json.dumps(rows,ensure_ascii=True))

