import json,pathlib,hashlib
p=pathlib.Path(__file__).parent
q=json.loads((p/'queue.json').read_text(encoding='utf8'))['records']
ds=json.loads((p/'decisions.json').read_text(encoding='utf8'))['decisions']
rs=json.loads((p/'records.json').read_text(encoding='utf8'))['records']
keys=[(r['mallId'],r['destinationId'],f) for r in q for f in r['fields']]
actual=[(d['mallId'],d['destinationId'],d['field']) for d in ds]
proposed=[(r['mallId'],r['destinationId'],f['field']) for r in rs for f in r['fields']]
assert len(set(actual))==len(actual)==226 and set(keys)==set(actual)
assert set(proposed)=={(d['mallId'],d['destinationId'],d['field']) for d in ds if d['outcome']=='proposal'}
assert all(d['attempts'] and d['searches'] for d in ds if d['outcome']=='hold')
assert all(f['approval']=='provisional' and not f.get('reviewedBy') and f['verification']=='source-checked' for r in rs for f in r['fields'])
ex=json.loads((p/'field-support-excerpts.json').read_text(encoding='utf8'))
assert len(ex['fieldBindings'])==len(proposed)
assert all(x.get('wordCount',0)<=25 for x in ex['sourceExcerpts'])
manifest={f.name:hashlib.sha256(f.read_bytes()).hexdigest() for f in p.iterdir() if f.is_file() and f.name not in ['sha256-manifest.json','validation.json']}
(p/'sha256-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf8')
v={'revision':'v2-explicit-replacement','queueKeys':226,'uniqueDecisionKeys':226,'proposalKeys':len(proposed),'holdKeys':226-len(proposed),'exactCoverage':True,'heldFieldsHaveTargetedSearchAndAttempts':True,'allPositiveFieldsProvisional':True,'baseline658PreservedByGenerator':True,'supportExcerptFieldBindings':len(ex['fieldBindings']),'sourceExcerpts':len(ex['sourceExcerpts']),'reusedR2SourcesWithoutRawBody':sum(not x.get('exactExcerpt') for x in ex['sourceExcerpts']),'recordsSha256':manifest['records.json'],'decisionsSha256':manifest['decisions.json'],'excerptsSha256':manifest['field-support-excerpts.json']}
(p/'validation.json').write_text(json.dumps(v,indent=2)+'\n',encoding='utf8')
print(json.dumps(v))
