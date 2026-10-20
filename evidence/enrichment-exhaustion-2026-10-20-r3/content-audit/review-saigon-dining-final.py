import pathlib,json,hashlib,copy,os
R=pathlib.Path('evidence/enrichment-exhaustion-2026-10-20-r3/content-audit');P=R.parent;L=P/'saigon-dining'
def read(p):return json.loads(p.read_text(encoding='utf-8-sig'))
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def key(d):return d['destinationId'],d['field']
old={key(x)for x in read(R/'reviewed-chunks/saigon-dining-03.json')['decisions']};ds=read(L/'decisions-complete.json')['decisions'];inputs={L/'decisions-complete.json',L/'records-complete.json'};out=[]
fresh={'saigon-prototype-beardpapas':'turn795view0','saigon-prototype-yakinikulike':'turn795view1/turn795view2/turn799view0','saigon-prototype-mcdonalds':'turn795view3/turn796view1','saigon-prototype-irvins':'turn799view1'}
resolved={'saigon-prototype-lusine':('https://lusinespace.com/view/Main-Menu.pdf','Official brand menu PDF retrieved locally: three pages, first page independently rendered and visually inspected with L\u2019Usine branding and named rice/noodle dishes and drinks. Reader-size limitation is superseded; current Saigon assortment/prices not claimed.',['content-audit/lusine-visual/Main-Menu.pdf','content-audit/lusine-visual/proof-1.png']), 'saigon-prototype-kichikichi':('https://kichi.com.vn/thuc-don','Official brand HCM menu selected in saved browser receipt; actual branded image independently visually inspected, with beef cuts, seafood, tofu and handmade items. No price or live branch availability claim.',['vincom-dining/browser-menu-last.json','vincom-dining/kichi-menu.png']), 'saigon-prototype-manwahtaiwanesehotpot':('https://manwah.com.vn/thuc-don','Official brand HCM menu selected in saved browser receipt; actual image independently visually inspected with named pork/offal, egg and noodle dishes. No price or live branch availability claim.',['vincom-dining/browser-close.json','vincom-dining/manwah-menu-dishes.jpg'])}
for d in ds:
 if key(d)in old:continue
 b=[]
 for s in d['sources']:
  if 'evidenceFile'in s:
   p=(L/s['evidenceFile']).resolve()
   if p.exists():inputs.add(p);b.append({**s,'file':os.path.relpath(p,P).replace('\\','/')})
 if not b:raise ValueError(key(d))
 o={k:d[k]for k in ['mallId','destinationId','field','reason']};o.update(evidenceBindings=b,reviewedBy='Codex independent content auditor (AI)',reviewedAt='2026-10-20')
 if d['outcome']=='proposal' or (d['field']=='menu'and d['destinationId']in resolved):
  if d['outcome']=='proposal':f=copy.deepcopy(d['proposedField'])
  else:
   u,reason,files=resolved[d['destinationId']];o['reason']=reason
   f={'field':'menu','sourceUrl':u,'url':u,'checkedAt':'2026-10-20','applicability':'brand-wide','verification':'source-checked','evidence':reason,'uncertainty':{'vi':'Th\u1ef1c \u0111\u01a1n chung c\u1ee7a th\u01b0\u01a1ng hi\u1ec7u; vui l\u00f2ng x\u00e1c nh\u1eadn m\u00f3n v\u00e0 gi\u00e1 t\u1ea1i Saigon Centre.','en':'Brand-wide menu reference; confirm dishes and prices at Saigon Centre.'}}
   for file in files:inputs.add(P/file);b.append({'file':file,'sourceUrl':u,'result':'Independent visual/source-chain inspection'})
  f.update(state='verified-agent',approval='agent-accepted',verification='source-checked',reviewedBy='Codex independent content auditor (delegated AI review)',reviewedAt='2026-10-20')
  if d['destinationId']in fresh:b.append({'sourceUrl':f['sourceUrl'],'freshWebReference':fresh[d['destinationId']]})
  if d['destinationId']=='saigon-prototype-yakinikulike':f['evidence']=f['evidence'].replace('Saigon Centre L509\u2013510','Saigon Centre at reader lines509\u2013510');o['reason']=f['evidence']
  if d['destinationId']=='saigon-prototype-genkisushi':
   for n in ['page-1.png','page-2.png']:inputs.add(R/'genki-visual'/n);b.append({'file':'content-audit/genki-visual/'+n,'result':'Both pages independently visually inspected; actual HK-market menu, no VN price/stock claim'})
  o.update(auditDecision='accept',acceptedField=f,originalProposal=d.get('proposedField'))
 elif d['outcome']=='bounded-unavailable':o.update(auditDecision='unavailable-after-research',boundedScope=d['scope'],negativeCoverage={'officialSources':d['sources'],'targetedSearches':d['searches'],'finding':d['reason'],'limits':'Only named inspected public sources; no universal booking absence claim.'})
 else:o.update(auditDecision='hold',remainingAction=d['remainingAction']);o['reason']=o['reason'].replace('were denied with 403','returned HTTP403').replace('No denied retry.','No repeated inaccessible route used as proof of absence.')
 out.append(o)
for p in [L/'targeted-searches.json',L/'booking-searches.json',L/'source-followthrough.json']:
 if p.exists():inputs.add(p)
obj={'revision':'independent-saigon-dining-final63-with-three-cross-lane-visual-recoveries','method':'All remaining candidate value/source bindings and outcome reasons reviewed; saved official evidence reused, independent fresh reads for four new source roles and representative booking negatives; PDF/images independently visually inspected. Holds retain exact actionable authority/rendering/market limits.','inputs':[{'file':os.path.relpath(p,P).replace('\\','/'),'sha256':sha(p)}for p in sorted(inputs)],'decisions':out}
(R/'reviewed-chunks/saigon-dining-final63.json').write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');print(len(out),{v:sum(x['auditDecision']==v for x in out)for v in ['accept','hold','unavailable-after-research']})
