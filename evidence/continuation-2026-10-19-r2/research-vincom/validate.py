import json,pathlib,hashlib,collections
p=pathlib.Path(__file__).resolve().parent;b=p.parents[2]
new=json.loads((p/'enrichment-records.json').read_text(encoding='utf-8'))['records']
old=json.loads((b/'src/data/enrichment-accepted.json').read_text(encoding='utf-8'))['records']
directory=json.loads((b/'data/malls/vincom-dong-khoi/directory.json').read_text(encoding='utf-8'))
ids={x['id'] for x in directory['destinations']}; frozen={(r['destinationId'],f['field']) for r in old for f in r['fields']}
seen=set();n=0
for r in new:
 assert r['mallId']=='vincom-dong-khoi' and r['destinationId'] in ids and r['destinationId'] not in seen
 seen.add(r['destinationId']);fields=set()
 for f in r['fields']:
  n+=1;assert f['field'] not in fields and (r['destinationId'],f['field']) not in frozen;fields.add(f['field'])
  assert f['state']=='verified-agent' and f['approval']=='agent-accepted' and f['verification']=='source-checked'
  assert f['checkedAt']==f['reviewedAt']=='2026-10-19' and f['reviewedBy'] and f['evidence']
  assert f['sourceUrl'].startswith('https://') and all(f['uncertainty'].get(x) for x in ['vi','en'])
  assert f['applicability'] in ['branch','brand-wide']
  assert (f.get('branchMallId')=='vincom-dong-khoi') if f['applicability']=='branch' else 'branchMallId' not in f
  if f['field'] in ['website','catalog','menu','programme','booking']:assert f['url'].startswith('https://')
  else: assert all(f['value'].get(x) for x in ['vi','en'])
  if f['field']=='phone': assert f['value']['vi']==f['value']['en']
attempts=json.loads((p/'directory-attempts.json').read_text(encoding='utf-8'))
assert len({a['indexLinkId'] for a in attempts})==147
reconcile=json.loads((p/'directory-reconciliation.json').read_text(encoding='utf-8'));assert len(reconcile)==len(ids)==203
hashes={str(x.relative_to(b)).replace('\\','/'):hashlib.sha256(x.read_bytes()).hexdigest() for x in [b/'src/data/enrichment-accepted.json',b/'src/data/enrichment-proposals.json',b/'data/malls/vincom-dong-khoi/directory.json',b/'data/malls/saigon-centre/directory.json']}
out={'result':'pass','records':len(new),'fields':n,'rosterIdentities':len(ids),'retailIndexLinkIdsAttempted':147,'duplicateFields':0,'frozenFieldOverwrites':0,'baselineHashes':hashes,'evidenceHashes':{x.name:hashlib.sha256(x.read_bytes()).hexdigest() for x in p.glob('*.txt')},'limit':'Schema/identity/evidence artifact checks; independent content review and integration belong to parent.'}
(p/'validation.json').write_text(json.dumps(out,indent=2)+'\n',encoding='utf-8');print(json.dumps(out))
