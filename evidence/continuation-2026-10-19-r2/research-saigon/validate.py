import json, pathlib, re, collections, hashlib
root=pathlib.Path(__file__).resolve().parent
candidate=root.parents[2]
packet=json.loads((root/'enrichment-records.json').read_text(encoding='utf-8'))
decisions=json.loads((root/'decisions.json').read_text(encoding='utf-8'))
accepted=json.loads((candidate/'src/data/enrichment-accepted.json').read_text(encoding='utf-8'))
directory=json.loads((candidate/'data/malls/saigon-centre/directory.json').read_text(encoding='utf-8'))
existing={(r['destinationId'],f['field']) for r in accepted['records'] for f in r['fields']}
ids={r['id'] for r in directory['destinations']}
seen=set(); fields=collections.Counter(); checks=0
for r in packet['records']:
 assert r['mallId']=='saigon-centre' and r['destinationId'] in ids
 for f in r['fields']:
  key=(r['destinationId'],f['field'])
  assert key not in seen and key not in existing
  seen.add(key)
  assert f['state']=='verified-agent' and f['approval']=='agent-accepted'
  assert f['checkedAt']==f['reviewedAt']=='2026-10-19' and f['reviewedBy'].strip()
  assert f['sourceUrl'].startswith('https://') and f['evidence'].strip()
  assert f['uncertainty']['vi'].strip() and f['uncertainty']['en'].strip()
  assert f['applicability'] in ['branch','brand-wide']
  assert (f.get('branchMallId')=='saigon-centre')==(f['applicability']=='branch')
  if f['field'] in ['website','menu','catalog','programme','booking']:
   assert f['url'].startswith('https://')
  else:
   assert f['value']['vi'].strip() and f['value']['en'].strip()
  if f['field']=='phone':
   assert f['value']['vi']==f['value']['en']
   assert re.fullmatch(r'\+?[0-9 ()-]{7,24}',f['value']['en']), key
  fields[f['field']]+=1; checks+=1
assert len(ids)==165
assert {r['destinationId'] for r in decisions['records']}==ids
assert sum(x['outcome']=='accepted' for x in decisions['records'])==len(seen)
assert decisions['boundedUnavailable']==0
out={'result':'pass','records':len(packet['records']),'newFields':checks,'fieldCounts':dict(fields),'frozenSaigonIdentities':len(ids),'existingAcceptedFieldsPreserved':sum(len(r['fields']) for r in accepted['records']),'noDuplicateOrExistingFieldReplacement':True,'decisionOutcomes':decisions['counts'],'files':{}}
for name in ['enrichment-records.json','decisions.json','source-blocks.json']:
 out['files'][name]=hashlib.sha256((root/name).read_bytes()).hexdigest()
(root/'validation.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(out,ensure_ascii=False))

