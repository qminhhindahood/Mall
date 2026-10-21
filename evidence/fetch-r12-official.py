from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import requests,json,hashlib,datetime
out=Path('evidence/saigon-last-two-r12/fresh');out.mkdir(parents=True,exist_ok=True)
urls={'matin':'https://shopping.saigoncentre.com.vn/en/store-directory/matin-kim','miana':'https://shopping.saigoncentre.com.vn/en/store-directory/miana','brand-stores':'https://matinkim.vn/pages/he-thong-cua-hang'}
def fetch(item):
 name,url=item
 row={'name':name,'url':url,'retrievedAt':datetime.datetime.now(datetime.timezone.utc).isoformat()}
 try:
  r=requests.get(url,timeout=25,headers={'User-Agent':'Mozilla/5.0'})
  row.update(status=r.status_code,finalUrl=r.url,sha256=hashlib.sha256(r.content).hexdigest(),bytes=len(r.content))
  (out/(name+'.html')).write_bytes(r.content)
 except requests.RequestException as e:row['error']=str(e)
 return row
rows=list(ThreadPoolExecutor(max_workers=3).map(fetch,urls.items()))
(out/'receipt.json').write_text(json.dumps(rows,indent=2),encoding='utf-8')
print(json.dumps(rows))

