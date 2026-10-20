import json,pathlib,hashlib,re
p=pathlib.Path(__file__).resolve().parent
base=json.loads((p/'enrichment-records.json').read_text(encoding='utf-8'))['records'];new=json.loads((p/'enrichment-records-incremental.json').read_text(encoding='utf-8'))['records']
seen={(r['destinationId'],f['field']) for r in base for f in r['fields']}
for r in new:
 for f in r['fields']:
  key=(r['destinationId'],f['field']);assert key not in seen;seen.add(key)
  assert f['state']=='verified-agent' and f['approval']=='agent-accepted' and f['verification']=='source-checked'
  assert f['applicability']=='branch' and f['branchMallId']=='vincom-dong-khoi' and f['checkedAt']==f['reviewedAt']=='2026-10-19'
  assert f['sourceUrl'].startswith('https://') and all(f['value'][x] and f['uncertainty'][x] for x in ['vi','en'])
  if f['field']=='phone':assert re.fullmatch(r'\+?[0-9 ()-]{7,24}',f['value']['en']) and f['value']['vi']==f['value']['en']
out={'result':'pass','additionalRecords':len(new),'additionalFields':sum(len(r['fields']) for r in new),'duplicateBaseFieldSlots':0,'base148DraftSha256':hashlib.sha256((p/'enrichment-records.json').read_bytes()).hexdigest(),'incrementalSha256':hashlib.sha256((p/'enrichment-records-incremental.json').read_bytes()).hexdigest(),'sourceHashes':{x.name:hashlib.sha256(x.read_bytes()).hexdigest() for x in p.glob('incremental-*.txt')}}
(p/'validation-incremental.json').write_text(json.dumps(out,indent=2)+'\n',encoding='utf-8');print(json.dumps({k:v for k,v in out.items() if k!='sourceHashes'}))
