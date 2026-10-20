import json,re,pathlib
p=pathlib.Path(__file__).parent
out=[]
for f in sorted(p.glob('source-*.txt')):
 t=f.read_text(encoding='utf-8')
 if t.startswith('{'): t=t.split('\n',1)[1]
 for b in re.split(r'-{20,}',t):
  b=b.strip()
  if not b:continue
  urls=re.findall(r'https?://[^\s"<>\)]+',b)
  ref=re.search(r'turn\w+(?:search|view)\d+',b)
  # First URL in title is canonical reader URL; fallback is attempted URL on errors.
  url=urls[0] if urls else None
  lines=b.splitlines()
  body='\n'.join(lines[2:])
  body=re.sub(r'^L\d+:\s*','',body,flags=re.M)
  out.append(dict(evidenceFile=f.name,url=url,reference=ref.group(0) if ref else None,title=lines[0],body=body,error=('Internal Error' in b[:100]),length=len(body)))
(p/'source-index.json').write_text(json.dumps(out,ensure_ascii=False,indent=2),encoding='utf-8')
cats=json.loads((p/'catalog-plan.json').read_text())
for id,url in cats.items():
 hits=[b for b in out if b['url']==url and not b['error']]
 best=max(hits,key=lambda b:b['length'],default={})
 print(id, best.get('length',0),best.get('evidenceFile','NONE'),url)
