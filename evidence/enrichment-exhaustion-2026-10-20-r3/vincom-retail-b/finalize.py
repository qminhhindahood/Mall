import json,pathlib,hashlib,collections,re,unicodedata,runpy
p=pathlib.Path(__file__).resolve().parent
runpy.run_path(str(p/'assemble.py'))
def read(f):return json.loads(f.read_text(encoding='utf-8'))
def save(f,o):f.write_text(json.dumps(o,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
def sha(f):return hashlib.sha256(f.read_bytes()).hexdigest()
q=read(p/'queue.json')['records'];by={r['destinationId']:r for r in q}
d=read(p/'decisions.json')['decisions'];records=read(p/'records.json')
rf={(r['destinationId'],f['field']):f for r in records['records'] for f in r['fields']}
def norm(x):return re.sub('[^a-z0-9]','',unicodedata.normalize('NFKD',x).encode('ascii','ignore').decode().lower())
queries=collections.defaultdict(list)
for f in sorted(p.glob('*search-*.json')):
 j=read(f)
 if not isinstance(j,dict):continue
 for n,x in enumerate(j.get('queries',[])):
  query=x.get('q') if isinstance(x,dict) else x
  brand=j.get('brands',[])
  for r in q:
   aliases=[r['name']['en'],r['name']['vi']]
   same=any(norm(a) in norm(query) for a in aliases if len(norm(a))>2)
   if brand and n<len(brand):same=same or any(norm(brand[n][0])==norm(a) for a in aliases)
   if same:queries[r['destinationId']].append({'query':query,'resultFile':f.name,'checkedAt':'2026-10-20','resultScope':'Official-only targeted search; raw returned results retained, snippets are leads and not promoted values.'})
r2=p.parent.parent/'continuation-2026-10-19-r2/research-vincom'
directory=read(r2/'directory-attempts.json');brands=read(r2/'brand-attempts.json')
if isinstance(brands,dict):brands=brands.get('attempts',brands.get('records',[]))
for x in d:
 r=by[x['destinationId']]; key=(x['destinationId'],x['field'])
 x['mallId']='vincom-dong-khoi';x['fieldRole']={'services':'Products/services: factual product ranges or explicit service information','catalog':'Actual product/category browsing action','phone':'Explicitly branch-associated telephone','hours':'Branch opening schedule','website':'Official brand or branch information action'}.get(x['field'],x['field'])
 x['attemptedQueries']=queries[x['destinationId']]
 x['inheritedFieldResearch']=r['fields'][x['field']]['researchObservations']
 inherited=[]
 for a in directory+(brands if isinstance(brands,list) else []):
  if a.get('destinationId')==x['destinationId'] or norm(a.get('name','')) in [norm(r['name']['en']),norm(r['name']['vi'])]:
   z=dict(a);z['packetRoot']='../../continuation-2026-10-19-r2/research-vincom';z['checkedAt']='2026-10-19';inherited.append(z)
 x['inheritedOfficialAttempts']=inherited
 files=list(dict.fromkeys(([x['sourceFile']] if x.get('sourceFile') else [])+x.get('sourceFiles',[])+x.get('supplementalSourceFiles',[])))
 x['evidenceFiles']=[]
 for name in files:
  f=(p/name).resolve()
  assert f.is_file(),(key,name)
  raw=f.read_text(encoding='utf-8');refs=list(dict.fromkeys(re.findall(r'turn\d+(?:view|search)\d+',raw)))
  x['evidenceFiles'].append({'path':name,'sha256':sha(f),'webReferences':refs,'section':'Source body/locator/product/category blocks and any exact failure text preserved in this immutable receipt; factual support and exclusions are stated in reason.'})
 x['attemptedPaths']=list(dict.fromkeys(([x['sourceUrl']] if x.get('sourceUrl') else [])+x.get('sources',[])+[a['url'] for a in inherited if a.get('url')]))
 if key in rf:
  f=rf[key];x['scope']=f['applicability'];x['sourceUrl']=f['sourceUrl'];x['value']=f.get('value');x['url']=f.get('url');x['caveats']=f['uncertainty'];x['proposedField']=f
 else:x['scope']='Branch association unresolved' if x['field'] in ['phone','hours'] else 'Official product/action applicability unresolved'
 assert x.get('reason') and x.get('nextAction') and x['evidenceFiles'],key
save(p/'decisions.json',{'checkedAt':'2026-10-20','decisions':d})
save(p/'per-field-decisions.json',{'checkedAt':'2026-10-20','decisions':d})
expected={(r['destinationId'],f) for r in q for f in r['fields']}; actual={(x['destinationId'],x['field']) for x in d}
assert expected==actual and len(d)==len(actual)==300
assert len(rf)==sum(len(r['fields']) for r in records['records'])
baseline=read(p.parent/'baseline-accepted.json');basekeys={(r['destinationId'],f['field']) for r in baseline['records'] for f in r['fields']}
assert not (basekeys & set(rf));assert len(basekeys)==658
workspace=p.parents[2]
runtime=read(workspace/'src/data/enrichment-accepted.json')
runtimefields={(r['destinationId'],f['field']):f for r in runtime['records'] for f in r['fields']}
assert all(runtimefields[k]==f for r in baseline['records'] for f in r['fields'] for k in [(r['destinationId'],f['field'])])
old={}
for name in ['chunk-01-records.json','chunk-02-records.json']:
 for r in read(p/name)['records']:
  for f in r['fields']:old[(r['destinationId'],f['field'])]=f
new=[];amend=[]
for r in records['records']:
 nf=[f for f in r['fields'] if (r['destinationId'],f['field']) not in old]
 af=[f for f in r['fields'] if (r['destinationId'],f['field']) in old and old[(r['destinationId'],f['field'])]!=f]
 if nf:new.append(dict(r,fields=nf))
 if af:amend.append(dict(r,fields=af))
save(p/'chunk-03-records.json',{'revision':'final-new-fields-2026-10-20-r3','records':new})
save(p/'final-amendments.json',{'reason':'Explicit consolidated replacements to previously submitted chunks; preserves original chunk bytes. Mango phone remains withdrawn by chunk-01-amendment.json. Product action targets and international caveats corrected after independent review.','replace':amend,'withdraw':read(p/'chunk-01-amendment.json')['withdraw']})
source=p/'source-text';source.mkdir(exist_ok=True)
receipts=[]
for f in sorted(p.glob('*.json')):
 if re.match(r'(search-|target-|service-search-|contact-search-|open-|locator-detail-|details-|follow-|last-locators-|final-research-|product-|mall-product-|matviet-service|dior-beauty)',f.name):receipts.append({'path':'../'+f.name,'sha256':sha(f)})
save(source/'index.json',{'checkedAt':'2026-10-20','receiptLocation':'Original raw source receipts remain in the lane root; this index provides immutable pointers instead of duplicating them.','receipts':receipts})
counts=dict(collections.Counter(x['decision'] for x in d))
progress={'destinations':74,'queuedFields':300,'completedDecisions':300,'unresearched':[],'counts':counts,'proposalFields':len(rf),'baselineFieldsPreservedExactly':658,'baselineFileSha256':sha(p.parent/'baseline-accepted.json'),'runtimeBaselineFieldsEqual':True,'scope':'Only this research lane was written. No source/build/tracker/canonical/publish/push/outreach operations.','remainingBlockers':'Per-key holds identify source-access/extraction failures, exact brand/branch identity, contact currentness, general-vs-branch phone, or conflicting official values. Holds are not unavailable findings.','newChunkFields':sum(len(r['fields']) for r in new),'amendedFields':sum(len(r['fields']) for r in amend)}
save(p/'progress.json',progress);save(source/'progress.json',progress)
manifest={f:sha(p/f) for f in ['records.json','decisions.json','per-field-decisions.json','progress.json','chunk-03-records.json','final-amendments.json','chunk-01-amendment.json','source-text/index.json','source-text/progress.json']}
save(p/'final-manifest.json',manifest)
print(json.dumps(progress));print(json.dumps(manifest))
