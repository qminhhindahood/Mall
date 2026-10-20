import pathlib,json,re,collections,sys
p=pathlib.Path(__file__).parent
root=p.parents[1];lane=root/'vincom-retail-a'
ds=json.loads((lane/'decisions.json').read_text(encoding='utf8'))['decisions']
prior=json.loads((root/'content-audit/reviewed-chunks/vincom-retail-a-01.json').read_text(encoding='utf8'))['decisions']
excluded={(x['mallId'],x['destinationId'],x['field']) for x in prior}
ds=[x for x in ds if (x['mallId'],x['destinationId'],x['field']) not in excluded]
cache={}
def raw(path):
 path=(lane/path).resolve()
 if path not in cache:
  text=path.read_text(encoding='utf8')
  if path.suffix=='.json':
   data=json.loads(text)
   text=data if isinstance(data,str) else json.dumps(data,ensure_ascii=False)
  cache[path]=text
 return cache[path]
def body(src):
 text=raw(src['evidenceFile']);ref=src.get('reference')
 blocks=re.split(r'-{20,}',text)
 blocks=[b for b in blocks if ref and ref in b]
 if not blocks:return ''
 return max(blocks,key=len)
def clean(t):
 t=re.sub(r'\ue200cite\ue202\d+†([^\ue201]*)\ue201',r'\1',t)
 t=re.sub(r'L\d+:\s*','',t)
 return re.sub(r'\s+',' ',t)
groups=collections.defaultdict(list)
for d in ds:groups[d['destinationId']].append(d)
start=int(sys.argv[1]) if len(sys.argv)>1 else 0
end=int(sys.argv[2]) if len(sys.argv)>2 else len(groups)
for identity,arr in list(groups.items())[start:end]:
 print(json.dumps({'id':identity,'name':arr[0]['name']['en'],'fields':[(d['field'],d['outcome'],d.get('proposedField',{}).get('value'),d.get('proposedField',{}).get('applicability')) for d in arr]},ensure_ascii=True))
 printed=set()
 for d in arr:
  if d['outcome']!='proposal':continue
  for src in d['sources']:
   text=clean(body(src));ref=src.get('reference');f=d['field']
   if f in ['phone','hours']:
    val=d['proposedField']['value']['en'];digits=re.sub(r'\D','',val)
    # Select source paragraphs around exact practical block markers.
    terms=[digits[-7:]] if f=='phone' else ['Dong Khoi','DONG KHOI','Đồng Khởi','ĐỒNG KHỞI','10:00','09:30']
    windows=[]
    if f=='phone':
     numpat=r'\D*'.join(digits[-7:]);m=re.search(numpat,text)
     if m:windows.append(text[max(0,m.start()-180):m.end()+180])
    else:
     for term in terms:
      pos=text.find(term)
      if pos>=0:windows.append(text[max(0,pos-100):pos+500])
    print(json.dumps({'f':f,'src':src,'proof':windows[:3] or [text[-900:]]},ensure_ascii=True))
   elif (src['evidenceFile'],ref) not in printed:
    printed.add((src['evidenceFile'],ref))
    # Main listing product windows, preserving references for full inspection.
    pats=[r'(?:\d[.,]\d{3}[.,]?\d*\s*(?:đ|₫|VND)|[₫$€]\s*\d|Add to (?:Cart|Bag)|Bán chạy|Best Seller)']
    matches=list(re.finditer(pats[0],text,re.I))
    windows=[]
    for m in matches:
     part=text[max(0,m.start()-120):m.start()+230]
     if not any(part[:80] in z for z in windows):windows.append(part)
     if len(windows)==4:break
    print(json.dumps({'f':f,'src':src,'proof':windows or [text[:900],text[-900:]],'length':len(text)},ensure_ascii=True))
