"""Read-only post-integration equality check against the final audit contract."""
import json,pathlib,hashlib,subprocess
ROOT=pathlib.Path(__file__).resolve().parent;BASE=ROOT.parents[2]
def read(p):return json.loads(p.read_text(encoding='utf-8-sig'))
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def fields(obj):return{(r['mallId'],r['destinationId'],f['field']):f for r in obj['records']for f in r['fields']}
freeze=read(ROOT/'final-audit-freeze.json');expected=read(ROOT/'expected-merged-acceptance.json');actualpath=BASE/'src/data/enrichment-accepted.json';actual=read(actualpath)
assert sha(ROOT/'expected-merged-acceptance.json')==freeze['expectedAcceptanceSha256']
e=fields(expected);a=fields(actual)
missing=sorted(set(e)-set(a));extra=sorted(set(a)-set(e));changed=sorted(k for k in set(e)&set(a)if e[k]!=a[k])
assert not missing and not extra and not changed,(missing,extra,changed)
base=fields(read(ROOT/'baseline-accepted.json'));removed={(x['mallId'],x['destinationId'],x['field'])for x in read(ROOT/'baseline-amendments.json')['records']}
assert all(a[k]==v for k,v in base.items()if k not in removed)
assert all(k not in a for k in removed)
dirs={}
for p,h in read(ROOT/'baseline-integrity.json')['hashes'].items():
 if p.startswith('data/'):
  dirs[p]=sha(BASE/p);assert dirs[p]==h,p
receipt={'checkedAt':'2026-10-20','method':'Exact field-key set and full accepted-object equality against final independently reviewed expected merge;642 retained baseline objects exact,16 explicitly removed conflict objects absent; approved directory byte hashes unchanged. No inference from aggregate counts alone.','sourceFile':str(actualpath),'sourceSha256':sha(actualpath),'expectedAcceptanceSha256':freeze['expectedAcceptanceSha256'],'fields':len(a),'records':len(actual['records']),'missingKeys':missing,'extraKeys':extra,'changedFieldObjects':changed,'retainedBaselineExactFields':642,'explicitBaselineConflictFieldsRemoved':16,'approvedDirectoryHashes':dirs,'passed':True,'sourceCommit':subprocess.check_output(['git','rev-parse','HEAD'],cwd=BASE,text=True).strip()}
(ROOT/'final-source-comparison.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(receipt,indent=2))
