import json,pathlib,re,unicodedata,collections
p=pathlib.Path(__file__).parent
ds=json.loads((p/'decisions.json').read_text(encoding='utf8'))['decisions']
ss=json.loads((p/'source-index.json').read_text(encoding='utf8'))
summaries={x.split('|')[0]:' '.join(x.split('|')[1:]) for x in (p/'product-summaries.tsv').read_text(encoding='utf8').splitlines()}
def clean(t):
 t=re.sub(r'\ue200cite\ue202\d+†([^\ue201]*)\ue201',r'\1',t)
 t=re.sub(r'L\d+:\s*','',t)
 return re.sub(r'\s+',' ',t).strip()
def norm(t):return unicodedata.normalize('NFKD',t).encode('ascii','ignore').decode().lower()
stop=set('the and with for from this that store brand fashion products product services offering of in on to a an are is as or by at thuong hieu san pham cua va cac voi cho tai mot duoc thoi trang official new home shop all view price'.split())
def tokens(t):return {x.rstrip('s') for x in re.findall(r'[a-z0-9]+',norm(t)) if len(x)>2 and x not in stop}
used={};fields=[]
for d in ds:
 if d['outcome']!='proposal':continue
 f=d['proposedField'];url=f['sourceUrl'];k=d['destinationId'].replace('saigon-prototype-','')
 goal=(summaries.get(k,'') if d['field']!='phone' else '')+' '+str(f.get('value',''))
 ts=tokens(goal)
 candidates=[s for s in ss if s['url']==url and not s['error'] and s['length']>200]
 if not candidates:
  # Reused r2 evidence: actual saved primary blocks, not the acceptance summary.
  for raw in (p.parents[1]/'continuation-2026-10-19-r2'/'research-vincom').glob('*.txt'):
   text=raw.read_text(encoding='utf8')
   for block in re.split(r'-{20,}',text):
    if url in block[:1000]:
     ref=re.search(r'turn\w+(?:view|search)\d+',block)
     actual=re.search(r'L0:',block)
     if not actual:continue
     candidates.append({'url':url,'body':block[actual.end():] if actual else block,'evidenceFile':'../../continuation-2026-10-19-r2/research-vincom/'+raw.name,'reference':ref.group(0) if ref else None,'length':len(block)})
 if url not in used:
  scored=[]
  for s in candidates:
   body=clean(s['body']);words=body.split()
   for i in range(max(1,len(words)-23)):
    part=' '.join(words[i:i+24]); pt=tokens(part)
    score=len(pt&ts)*3
    if d['field']=='catalog':
     score+=10*bool(re.search(r'\d[.,]?\d*\s*(?:₫|đ|USD|VND|THB|HKD|SGD|¥|\$)|[₫¥$]\s*\d',part,re.I))
     score+=8*bool(re.search(r'add to (?:cart|bag)|quick (?:view|shop)|sold out|in stock',part,re.I))
    else:score+=2*bool(re.search(r'offers?|including|speciali[sz]|provides?|known for|sells?|is a|là|cung cấp|bao gồm',part,re.I))
    if d['field']=='catalog':score-=15*bool(re.search(r'free shipping|freeship|when you spend|mua sam va doi tra|\[wordlim|Content type|Crawled:',part,re.I))
    score-=len(pt&{'input','button','iframe','termsfeed','generator','googletagmanager','office','login','password','navigation'})*2
    score-=len(pt&{'privacy','cookie','newsletter','password','login','policy','copyright','marketing'})*3
    scored.append((score,s,part))
  if scored:
   _,s,excerpt=max(scored,key=lambda x:x[0])
   used[url]={'sourceUrl':url,'evidenceFile':s['evidenceFile'],'reference':s['reference'],'exactExcerpt':excerpt,'wordCount':len(excerpt.split()),'selection':'Relevant exact text window from saved primary receipt; read full referenced body for all listed categories and market context.'}
  else:used[url]={'sourceUrl':url,'evidenceFile':d['sources'][0]['evidenceFile'],'reference':d['sources'][0]['reference'],'exactExcerpt':None,'note':'Audited r2 source reuse; source evidence binding in decisions.json. No raw text excerpt invented.'}
 fields.append({'mallId':d['mallId'],'destinationId':d['destinationId'],'name':d['name'],'field':d['field'],'sourceUrl':url,'scope':f['applicability'],'value':f.get('value'),'actionUrl':f.get('url'),'sourceExcerptKey':url,'supplementarySourceBindings':d['sources'][1:]})
overrides={
 'https://www.hugoboss.com/vn/en/home':'NEW: BOSS BY BECKHAM Shop now',
 'https://shopping.saigoncentre.com.vn/en/store-directory/annam-gourmet':'we have been providing the best in gourmet products for over 15 years.',
 'https://www.rimowa.com/us/en/all-luggage/':'114 products Showing 114 Results',
 'https://www.aesop.com/':'Antithesis Intense Body Cleanser Solais Replenishing Hand Serum Resolute Facial Concentrate',
}
for url,text in overrides.items():
 if url in used:
  used[url]['exactExcerpt']=text;used[url]['wordCount']=len(text.split());used[url]['selection']='Manually selected brief product/collection or offering phrase(s) from the saved primary source; full context remains in the receipt.'
out={'revision':'saigon-retail-r3-support-excerpts-v2','method':'One <=24-word exact excerpt per source URL, shared by field bindings to avoid repeated source quotations. Saved official reader/indexed text only. Supporting source bodies remain authoritative for the complete claim. Six reused r2 catalogue URLs have no raw body in the saved old receipt; these explicitly expose no invented excerpt and retain independently audited reuse bindings.','sourceExcerpts':list(used.values()),'fieldBindings':fields}
(p/'field-support-excerpts.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(json.dumps({'fields':len(fields),'sources':len(used),'noExcerpt':[u for u,v in used.items() if not v.get('exactExcerpt')]}))
(p/'excerpt-review.tsv').write_text('\n'.join(k+'\t'+(v.get('exactExcerpt') or 'MISSING') for k,v in used.items()),encoding='utf8')
