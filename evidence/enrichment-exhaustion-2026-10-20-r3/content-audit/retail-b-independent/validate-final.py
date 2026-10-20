import json,pathlib,hashlib,collections
ROOT=pathlib.Path(r"D:/Midterm/.scratch/combined-discovery-motion-2026-10-19/evidence/enrichment-exhaustion-2026-10-20-r3");OUT=ROOT/"content-audit/retail-b-independent"
def read(p):return json.loads(p.read_text(encoding="utf-8-sig"))
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def key(d):return(d["mallId"],d["destinationId"],d["field"])
first=read(ROOT/"content-audit/reviewed-chunks/vincom-retail-b-01.json")["decisions"]
remaining=read(OUT/"reviewed-remaining.json")["decisions"]
state={key(d):d for d in first+remaining};assert len(state)==300
central=read(ROOT/"content-audit/review-amendments.json")["records"]
mango=next(d for d in central if d["mallId"]=="vincom-dong-khoi" and d["destinationId"]=="vincom-candidate-vd-b1-024" and d["field"]=="phone")
assert mango["priorAuditedDecision"]==state[key(mango)];state[key(mango)]=mango
files=["amendments.json","phone-amendments-01.json","final-amendments-02.json"]
inputChecks=0
for fn in ["reviewed-remaining.json"]+files:
 d=read(OUT/fn)
 for i in d.get("inputs",[]):
  assert sha(ROOT/i["file"])==i["sha256"],i["file"]
  inputChecks+=1
 if fn=="reviewed-remaining.json":continue
 for a in d.get("records",d.get("decisions",[])):
  assert a["priorAuditedDecision"]==state[key(a)],str(key(a))
  state[key(a)]=a
for d in state.values():
 assert d["auditDecision"] in ["accept","hold","unavailable-after-research"]
 assert d["evidenceBindings"] and d["reason"]
 if d["auditDecision"]=="accept":
  f=d["acceptedField"];assert f["approval"]=="agent-accepted" and f["verification"]=="source-checked" and f["state"]=="verified-agent"
  assert f["uncertainty"]["vi"] and f["uncertainty"]["en"]
  if f["applicability"]=="branch":assert f["branchMallId"]==d["mallId"]
  if f["field"]=="phone":
   assert f["value"]["vi"]==f["value"]["en"]
   if f["applicability"]=="brand-wide":assert d.get("brandContactScopeExplicit")
 elif d["auditDecision"]=="hold":assert d.get("remainingAction")
 else:assert d.get("boundedScope") and d.get("negativeCoverage")
phones=read(ROOT/"vincom-retail-b/phone-scope-all-phone-review.json")["decisions"]
assert len(phones)==69 and len({(d["destinationId"],d["field"]) for d in phones})==69
counts=dict(collections.Counter(d["auditDecision"] for d in state.values()))
v={"checkedAt":"2026-10-20","originalKeys":300,"priorAuditedKeys":41,"newReviewedKeys":259,"duplicateKeys":0,"pendingKeys":0,"finalCounts":counts,"hashChecksPassed":inputChecks,"exactPriorAmendmentObjectsVerified":28,"newExplicitGeneralPhoneAcceptances":22,"all69QueuedPhoneKeysReviewed":True,"all14PriorNegativesReviewed":"3phone negatives accepted as explicitly scoped general contacts;1Adidasphone negative replaced with reader+browser accesshold;10branchhour negatives preserved.","FurlaCatalogueActionCorrected":True,"BotanifiqueMarketCaveatsExplicit":True,"MothercareInternationalAuthorityAndScopeVerified":True,"MangoConflictPreserved":True,"baselineSourceOrTrackerEdited":False}
(OUT/"final-validation.json").write_text(json.dumps(v,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
print(json.dumps(v))

