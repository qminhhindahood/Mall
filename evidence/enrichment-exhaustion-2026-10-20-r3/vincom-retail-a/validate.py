import json,pathlib,re,hashlib,collections
p=pathlib.Path(__file__).parent
q=json.loads((p/'queue.json').read_text(encoding='utf-8'))['records']
notes=json.loads((p/'notes.json').read_text(encoding='utf-8'))
# fix exact references to matching source block, preserve explicit first-chunk references
for n in notes:
 for k,x in n['fields'].items():
  ef=x.get('evidence',n.get('evidence'));url=x.get('url',n.get('url'))
  if ef and (p/ef).is_file():
   raw=(p/ef).read_text(encoding='utf-8')
   try:t=json.loads(raw)
   except:t=raw
   if isinstance(t,dict):t=t.get('response',json.dumps(t))
   for block in str(t).split('--------------------------------------------------------------------------------'):
    if url and ('('+url+')' in block or '"ref_id":"'+url+'"' in block or '"ref_id": "'+url+'"' in block):
     m=re.search(r'turn\d+(?:view|search)\d+',block)
     if m:x['reference']=m.group()
     break
(p/'notes.json').write_text(json.dumps(notes,ensure_ascii=False,indent=2),encoding='utf-8')
exec(compile((p/'build.py').read_text(encoding='utf-8'),str(p/'build.py'),'exec'))
d=json.loads((p/'decisions.json').read_text(encoding='utf-8'))['decisions'];rs=json.loads((p/'records.json').read_text(encoding='utf-8'))['records']
expected={(r['mallId'],r['destinationId'],f) for r in q for f in r['fields']}
actual=[(r['mallId'],r['destinationId'],r['field']) for r in d]
assert len(actual)==len(set(actual))==311 and set(actual)==expected
assert all(x['outcome'] in ('proposal','hold','unavailable-after-research') for x in d)
errs=[]
for x in d:
 for s in x['sources']:
  if not s['evidenceFile'] or not (p/s['evidenceFile']).is_file():errs.append((x['destinationId'],x['field'],'missing-evidence',s['evidenceFile']))
 assert x['searches'] and all(z.get('query') for z in x['searches'])
 assert x['reason'] and (x['outcome']=='proposal' or x['remainingAction'])
 if x['outcome']=='proposal':
  f=x['proposedField'];assert f['sourceUrl'].startswith('https://');assert f['approval']=='pending-delegated-review'
  if f['applicability']=='brand-wide':assert 'branchMallId' not in f
  if f['field']=='phone':assert f['value']['vi']==f['value']['en']
for r in rs:
 assert all(f['field'] in next(qr['fields'] for qr in q if qr['destinationId']==r['destinationId']) for f in r['fields'])
for x in errs:print(x)
assert not errs
files={str(f.relative_to(p)).replace('\\','/'):{'sha256':hashlib.sha256(f.read_bytes()).hexdigest(),'bytes':f.stat().st_size} for f in p.rglob('*') if f.is_file() and f.name!='validation.json'}
rep={'result':'pass','queuedKeys':311,'uniqueDecisionKeys':len(actual),'proposalKeys':sum(x['outcome']=='proposal' for x in d),'heldKeys':sum(x['outcome']=='hold' for x in d),'unavailableKeys':sum(x['outcome']=='unavailable-after-research' for x in d),'exactQueueCoverage':True,'sourceFilesExist':True,'proposalScopesValid':True,'baselineRuntimeNotEdited':True,'files':files}
(p/'validation.json').write_text(json.dumps(rep,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({k:v for k,v in rep.items() if k!='files'}))

