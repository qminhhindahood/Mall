"""One-time central import of a complete independently reviewed packet."""
import collections, hashlib, json
from pathlib import Path

packet=Path(__file__).resolve().parent
root=packet.parents[1]
audit=packet/'content-audit'
read=lambda p:json.loads(p.read_text(encoding='utf-8-sig'))
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
summary=read(audit/'audit-summary.json')
assert summary['expectedKeys']==1315 and summary['reviewedKeys']==1315
assert summary['pendingAuditKeys']==0 and summary['allQueuedFieldsReviewed']
assert summary['fieldStates'].get('unresearched',0)==0
assert not read(audit/'coordinator-only-proposals.json')['records'], 'Directory edits require separate reconciliation'
baseline=read(audit/'baseline-accepted.json')
target=root/'src/data/enrichment-accepted.json'
assert read(target)==baseline, 'Source must still equal the frozen r2 baseline before this one-time import'
candidate=audit/'expected-merged-acceptance.json'
merged=read(candidate)
flatten=lambda d:{(r['mallId'],r['destinationId'],f['field']):f for r in d['records'] for f in r['fields']}
before=flatten(baseline);after=flatten(merged)
assert len(before)==658
removed={(r['mallId'],r['destinationId'],r['field']) for r in read(audit/'baseline-amendments.json')['records']}
assert set(before)-set(after)==removed
assert all(after[k]==v for k,v in before.items() if k not in removed)
assert len(after)==summary['activeExpectedAcceptedFields']==sum(len(r['fields'])for r in merged['records'])
preserved=[]
for folder in ['assets','data/malls']:
 for p in sorted((root/folder).rglob('*')):
  if p.is_file():preserved.append({'path':p.relative_to(root).as_posix(),'sha256':sha(p)})
receipt={'revision':'r3-central-import','originalQueuedKeys':1315,'reviewedKeys':1315,'baselineAcceptedFields':658,'retainedExactBaselineFields':658-len(removed),'explicitBaselineHolds':len(removed),'acceptedFields':len(after),'acceptedDestinations':len(merged['records']),'newAcceptedFields':len(set(after)-set(before)),'byMall':dict(collections.Counter(k[0]for k in after)),'byField':dict(collections.Counter(k[2]for k in after)),'importSource':candidate.relative_to(root).as_posix(),'importSha256':sha(candidate),'auditSummarySha256':sha(audit/'audit-summary.json'),'baselineSourceSha256':sha(target),'frozenAssetAndDirectoryFiles':preserved,'limits':'Unpublished isolated import; source-checked facts only. Exact holds remain excluded, no roster/description/location/asset changes.'}
assert not (packet/'integration-receipt.json').exists(), 'Refuse to overwrite import receipt'
receipt['reviewedPacketSha256']=receipt.pop('importSha256')
target.write_bytes(candidate.read_bytes().replace(b'\r\n',b'\n'))
assert read(target)==merged
receipt['importSha256']=sha(target)
receipt['lineEndingPolicy']='Reviewed evidence bytes preserved; imported source uses LF to match its Git blob. JSON objects are identical.'
(packet/'integration-receipt.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({k:v for k,v in receipt.items() if k!='frozenAssetAndDirectoryFiles'},ensure_ascii=False))
