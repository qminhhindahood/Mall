import json, urllib.request, hashlib, concurrent.futures
from pathlib import Path
p=Path(__file__).parent
rows=json.loads((p/'rendering-recovery.json').read_text(encoding='utf-8'))
todo=[]
for r in rows:
 if r['id'] in ['uniqlo','onitsuka','saigon-prototype-botejyuokonomiyaki','saigon-prototype-miyamamoderntokyorestaurantcafe']:continue
 imgs=[i for i in r.get('images',[]) if i.get('src') and any(ext in i['src'].lower() for ext in ['.jpeg','.jpg','.png']) and 'logo' not in i['src'].lower()]
 for index,i in enumerate(imgs[:3] if r['id'] in ['miana','saigon-prototype-bastahiroitalianrestaurant'] else imgs[:1]):todo.append({'id':r['id'],'sourcePage':r['url'],'url':i['src'],'file':r['id']+'-proof-'+str(index)+'.jpg'})
todo.append({'id':'miyama','sourcePage':'https://miyamacafe.com/menu/','url':'https://miyamacafe.com/wp-content/uploads/2026/07/MIYAMA_MENU-10-NAM.pdf','file':'miyama-menu.pdf'})
def fetch(r):
 try:
  req=urllib.request.Request(r['url'],headers={'User-Agent':'Mozilla/5.0'})
  with urllib.request.urlopen(req,timeout=25) as response:data=response.read();r['status']=response.status
  (p/r['file']).write_bytes(data);r.update(bytes=len(data),sha256=hashlib.sha256(data).hexdigest())
 except Exception as e:r['error']=str(e)
 return r
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:out=list(pool.map(fetch,todo))
(p/'rendered-media-receipts.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(out,ensure_ascii=False))
