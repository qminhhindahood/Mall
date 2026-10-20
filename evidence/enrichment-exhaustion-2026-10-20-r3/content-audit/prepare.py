import json,pathlib,hashlib,collections,shutil
ROOT=pathlib.Path(__file__).resolve().parent;PACKET=ROOT.parent;BASE=ROOT.parents[2]
def read(p):return json.loads(p.read_text(encoding='utf-8-sig'))
def write(n,o):(ROOT/n).write_text(json.dumps(o,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
lanes=['saigon-dining','saigon-retail','vincom-dining','vincom-retail-a','vincom-retail-b','holds']
expected={};counts={};hashes={}
baseline=read(PACKET/'baseline-accepted.json')
basefields={(r['mallId'],r['destinationId'],f['field']):f for r in baseline['records']for f in r['fields']}
if len(basefields)!=658:raise ValueError('baseline must preserve658fields')
coverage=read(PACKET/'baseline-coverage.json')
cover={(r['mallId'],r['destinationId'],field):data['state']for r in coverage['records']for field,data in r['fields'].items()}
for lane in lanes:
 p=PACKET/lane/'queue.json';queue=read(p);hashes[lane+'/queue.json']=sha(p);count=0
 for r in queue['records']:
  for field,data in r['fields'].items():
   key=(r['mallId'],r['destinationId'],field)
   if key in expected or key in basefields:raise ValueError('duplicate/baseline key '+str(key))
   if cover.get(key)not in['unresearched','evidence-conflict-hold']:raise ValueError('unexpected coverage key '+str(key))
   expected[key]={'mallId':key[0],'destinationId':key[1],'field':key[2],'lane':lane,'priorState':cover[key],'auditDecision':'pending'};count+=1
 counts[lane]=count
if len(expected)!=1315:raise ValueError('expected1315queued fields')
unresolved={k for k,v in cover.items()if v in['unresearched','evidence-conflict-hold']}
if unresolved!=set(expected):raise ValueError('coverage mismatch')
for name in ['baseline-accepted.json','baseline-coverage.json']:
 p=PACKET/name;hashes[name]=sha(p);dest=ROOT/name
 if dest.exists()and sha(dest)!=sha(p):raise ValueError('frozen audit baseline changed')
 if not dest.exists():shutil.copyfile(p,dest)
for mall in ['saigon-centre','vincom-dong-khoi']:hashes[f'data/malls/{mall}/directory.json']=sha(BASE/f'data/malls/{mall}/directory.json')
write('expected-keys.json',{'revision':'r3-independent-audit-expected-keys','records':list(expected.values())})
write('baseline-integrity.json',{'checkedAt':'2026-10-20','expectedFields':1315,'priorUnresearched':1272,'priorHolds':43,'baselineAcceptedFields':658,'lanes':counts,'hashes':hashes,'exactQueueCoverage':True})
(ROOT/'reviewed-chunks').mkdir(exist_ok=True)
print(json.dumps({'queued':len(expected),'baseline':len(basefields),'counts':counts,'exactQueueCoverage':True},indent=2))
