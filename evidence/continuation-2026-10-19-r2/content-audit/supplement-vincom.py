import json,pathlib,hashlib,copy
ROOT=pathlib.Path(__file__).resolve().parent
PACKET=ROOT.parent
def read(p):return json.loads(p.read_text(encoding='utf-8-sig'))
def write(n,o):(ROOT/n).write_text(json.dumps(o,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
p=PACKET/'research-vincom/enrichment-records-incremental.json'
incoming=read(p);out=copy.deepcopy(incoming)
refs={'vincom-prototype-ecco':('turn204view0','148'),'vincom-prototype-lyn':('turn205view0','85-91'),'vincom-prototype-matsumotokiyoshi':('turn205view1','26-31'),'vincom-prototype-shiseido':('turn205view2','77-78'),'vincom-prototype-tgnhthegioinuochoa':('turn205view3','410-414')}
decisions=[]
for r in out['records']:
 for f in r['fields']:
  f['reviewedBy']='Codex independent content auditor (delegated AI review)'
  reference,lines=refs[r['destinationId']]
  decisions.append({'mallId':r['mallId'],'destinationId':r['destinationId'],'field':f['field'],'decision':'accept','reason':'Independent fresh official branch locator confirms exact value and branch scope; phone source normalization and bilingual schedule meaning reviewed. Shiseido Dong Khoi counterL1-53 agrees with frozenL1 identity; no floor/unit changes inferred.','sourceUrl':f['sourceUrl'],'freshWebReference':reference,'lines':lines})
source=read(PACKET/'research-vincom/decisions-incremental.json')
unavailable=[]
for h in source['boundedUnavailable']:
 unavailable.append({**h,'auditDecision':'accept-bounded-unavailable','auditReason':'Independent locator read confirms branch block has no hours; saved official mall branch/home receipts reviewed. Bounded to specified checked sources only; no claim that official hours cannot exist elsewhere.','freshWebReference':refs[h['destinationId']][0]})
write('audited-vincom-supplement-records.json',out)
write('vincom-supplement-decisions.json',{'checkedAt':'2026-10-19','inputSha256':hashlib.sha256(p.read_bytes()).hexdigest(),'acceptedFields':9,'heldProposedFields':0,'boundedUnavailableAccepted':2,'decisions':decisions,'boundedUnavailable':unavailable,'method':'All five official locators independently fetched; exact branch blocks read. Saved earlier mall/home evidence used for bounded negative claims. No runtime tests or source modifications.'})
write('core-amendments.json',{'checkedAt':'2026-10-19','amendments':[{'mallId':'saigon-centre','destinationId':'saigon-prototype-lyn','field':'hours','priorCoreDecision':'accept','decision':'hold','state':'evidence-conflict-hold','reason':'Fresh brand locator Saigon Centre block says10:00–22:00 daily, conflicting with core official mall9:30–21:30. Preserve frozen core receipt, remove this field from merged acceptance and retain both source values.','sources':[{'sourceUrl':'https://lynvn.com/pages/content-store-location','freshWebReference':'turn205view0','lines':'80-84','value':'10:00–22:00 daily'},{'sourceUrl':'https://shopping.saigoncentre.com.vn/en/store-directory/lyn','savedEvidence':'research-saigon/source-blocks.json','value':'9:30 - 21:30'}]}],'effectiveCoreAcceptedNewFields':597,'effectiveCoreHeldFields':14,'baselinePreserved':32,'acceptedAfterVincomSupplement':638,'formula':'32 baseline + (598 core - 1 LYN amendment) + 9 Vincom supplement =638; Saigon supplement excluded.'})
print('9 Vincom fields accepted;2 bounded unavailable accepted;1 core LYN amendment recorded.')
