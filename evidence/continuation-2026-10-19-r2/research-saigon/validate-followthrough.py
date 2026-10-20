import json,pathlib,re,hashlib,collections
p=pathlib.Path(__file__).resolve().parent
base=json.loads((p/'enrichment-records.json').read_text(encoding='utf-8'))
added=json.loads((p/'enrichment-additional-records.json').read_text(encoding='utf-8'))
ledger=json.loads((p/'followthrough-decisions.json').read_text(encoding='utf-8'))
seen={(r['destinationId'],f['field']) for r in base['records'] for f in r['fields']}
fields=collections.Counter()
for r in added['records']:
 for f in r['fields']:
  k=(r['destinationId'],f['field'])
  assert k not in seen
  seen.add(k)
  assert f['state']=='verified-agent' and f['approval']=='agent-accepted'
  assert f['checkedAt']==f['reviewedAt']=='2026-10-19'
  assert f['sourceUrl'].startswith('https://')
  assert f['uncertainty']['vi'] and f['uncertainty']['en']
  assert (f.get('branchMallId')=='saigon-centre')==(f['applicability']=='branch')
  if f['field'] in ['menu','catalog','booking','website']:
   assert f['url'].startswith('https://')
  else:
   assert f['value']['vi'] and f['value']['en']
  if f['field']=='phone': assert re.fullmatch(r'\+?[0-9 ()-]{7,24}',f['value']['en'])
  fields[f['field']]+=1
sha=hashlib.sha256((p/'enrichment-records.json').read_bytes()).hexdigest()
assert sha==ledger['frozenDraftSha256']
links=json.loads((p/'outbound-link-audit.json').read_text(encoding='utf-8'))
assert len(links['records'])==165 and all(x['complete'] and not x['externalLinks'] for x in links['records'])
assert len(ledger['diningMenuSearches'])==44
out={'result':'pass','additionalFields':sum(fields.values()),'fieldCounts':dict(fields),'frozen463DraftUnchanged':True,'draftSha256':sha,'completeMallOutboundAudits':165,'diningMenuSearches':44,'mandatoryMergeOverrides':ledger['overrides'],'files':{}}
for n in ['enrichment-additional-records.json','followthrough-decisions.json','outbound-link-audit.json']:out['files'][n]=hashlib.sha256((p/n).read_bytes()).hexdigest()
(p/'followthrough-validation.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({k:v for k,v in out.items() if k not in ['mandatoryMergeOverrides']},ensure_ascii=False))

