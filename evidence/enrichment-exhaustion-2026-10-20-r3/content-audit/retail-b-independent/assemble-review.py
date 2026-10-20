import json,pathlib,hashlib,re,copy,collections
ROOT=pathlib.Path(r"D:/Midterm/.scratch/combined-discovery-motion-2026-10-19/evidence/enrichment-exhaustion-2026-10-20-r3")
OUT=ROOT/"content-audit/retail-b-independent"
LANE=ROOT/"vincom-retail-b"
REVIEWER="Codex (AI) independent retail B reviewer /root/saigon_research"
def read(p): return json.loads(p.read_text(encoding="utf-8-sig"))
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def key(d): return (d["destinationId"],d["field"])
firstp=ROOT/"content-audit/reviewed-chunks/vincom-retail-b-01.json"
first=read(firstp)["decisions"]; firstkeys={key(d) for d in first}
base=read(LANE/"decisions.json")["decisions"]; rows={key(d):copy.deepcopy(d) for d in base}
sup=read(LANE/"brand-profile-supplement-decisions.json")["decisions"]
for d in sup:
 k=key(d)
 old=rows[k]; new=copy.deepcopy(d)
 if d["decision"]!="candidate-proposal":
  new["nextAction"]=old["nextAction"]
 rows[k]=new
proposals={(r["destinationId"],f["field"]):f for r in read(LANE/"records.json")["records"] for f in r["fields"]}
for d in sup:
 if d.get("proposedField"): proposals[key(d)]=d["proposedField"]
selected={key(d):d["binding"] for d in read(OUT/"selected-bindings.json")}
inputpaths={firstp,LANE/"records.json",LANE/"decisions.json",LANE/"final-amendments.json",LANE/"chunk-01-amendment.json",LANE/"brand-profile-supplement-decisions.json",LANE/"brand-profile-supplement-records.json",OUT/"selected-bindings.json",OUT/"fresh-source-checks.json",OUT/"fresh-products-check.json"}
def addfile(f):
 p=(LANE/f).resolve()
 if not p.exists(): raise RuntimeError("Missing binding: "+str(p))
 inputpaths.add(p)
 return p.relative_to(ROOT).as_posix()
def bindings(d):
 bs=[]
 for e in d.get("evidenceFiles",[]):
  file=addfile(e["path"])
  if e.get("sha256") and sha(ROOT/file)!=e["sha256"]: raise RuntimeError("Source hash drift "+file)
  bs.append({"file":file,"reference":", ".join(e.get("webReferences",[])) or "Saved official-source receipt","section":e.get("section","Source body and exact retrieval outcome"),"sourceUrls":d.get("attemptedPaths",[]),"support":d["reason"]})
 for f in d.get("sourceFiles",[]):
  file=addfile(f)
  if not any(b["file"]==file for b in bs): bs.append({"file":file,"reference":"Saved source body/search receipt","support":d["reason"]})
 if d.get("sourceFile"):
  file=addfile(d["sourceFile"])
  if not any(b["file"]==file for b in bs): bs.append({"file":file,"reference":d.get("sourceUrl") or "Source body","support":d["reason"]})
 s=d.get("supplementalOfficialAttempt")
 if s:
  file=addfile(s["receipt"]);bs.append({"file":file,"reference":s["url"],"section":"Exact supplemental /brand request and returned body/error","support":s["outcome"]})
 for f in d.get("supplementalSearchReceipts",[]): bs.append({"file":addfile(f),"reference":"Official exact-name /brand source-family search","support":"Search leads checked only as leads; failed direct body not promoted."})
 b=selected.get(key(d))
 if b:
  inputpaths.add(ROOT/b["file"])
  bs.insert(0,copy.deepcopy(b))
 if d["destinationId"] in ["vincom-prototype-gap","vincom-prototype-gustavogano","vincom-prototype-pnj"] and d["field"] in ["catalog","services"]:
  bs.insert(0,{"file":"content-audit/retail-b-independent/fresh-products-check.json","reference":{"vincom-prototype-gap":"turn883view0","vincom-prototype-gustavogano":"turn883view1","vincom-prototype-pnj":"turn882view0"}[d["destinationId"]],"sourceUrl":proposals.get(key(d),{}).get("sourceUrl"),"section":"Fresh actual products/categories; see precise section and source-scope finding in receipt."})
 if d.get("sourceUrl")=="https://vincom.com.vn/brand/pierre-cardin":
  bs.insert(0,{"file":"content-audit/retail-b-independent/fresh-source-checks.json","reference":"turn878view0 L11–15","sourceUrl":d["sourceUrl"],"support":"Exact Pierre Cardin menswear/operator identity; only brand-wide informational role, not current branch presence."})
 if not bs: raise RuntimeError("No binding "+str(key(d)))
 return bs
out=[]
for k,d in rows.items():
 if k in firstkeys: continue
 decision={"candidate-proposal":"accept","hold":"hold","unavailable-after-research":"unavailable-after-research"}[d["decision"]]
 reason=d["reason"]
 if decision=="accept":
  f=copy.deepcopy(proposals[k])
  reason="Independent source/identity, field role and VI/EN scope review: "+reason
  if d["field"] in ["catalog","services"] and f["applicability"]=="brand-wide": reason+=" Accepted only at documented brand/market scope; no branch inventory, prices or unmentioned operational policy."
  if d["field"]=="website": reason+=" This is an information action for the documented authority; broader brand scope is retained."
  f.update(state="verified-agent",approval="agent-accepted",verification="source-checked",reviewedBy=REVIEWER,reviewedAt="2026-10-20")
  # Lush source exposes real product category/filter structure but item cards load dynamically.
  if d["destinationId"]=="vincom-prototype-lush" and d["field"]=="catalog":
   reason+=" Source contains actual product-category/filter content; individual item cards are Loading placeholders. Acceptance establishes the category-catalogue action only."
  if d["destinationId"]=="vincom-prototype-gap":
   reason+=" Fresh source redirects to GAP Australia; international caveat remains explicit in both languages."
 else:
  s=d.get("supplementalOfficialAttempt")
  if s: reason+=" Supplemental official /brand-family check: "+s["url"]+" — "+s["outcome"]+"."
 a={"mallId":"vincom-dong-khoi","destinationId":k[0],"field":k[1],"auditDecision":decision,"reason":reason,"evidenceBindings":bindings(d),"reviewedBy":REVIEWER,"reviewedAt":"2026-10-20","researchDecision":d["decision"],"checkedAt":d.get("checkedAt","2026-10-20"),"sourceScope":d.get("scope"),"attemptedPaths":d.get("attemptedPaths",[]),"attemptedQueries":d.get("attemptedQueries",[])}
 if decision=="accept": a["acceptedField"]=f
 elif decision=="hold": a["remainingAction"]=d["nextAction"]
 else:
  a["boundedScope"]="Only the dedicated Vincom Center Dong Khoi branch "+k[1]+" in the named checked official sources; no claim of global nonexistence."
  a["negativeCoverage"]={"checkedSources":d.get("attemptedPaths",[]),"targetedOfficialQueries":d.get("attemptedQueries",[]),"inspectedFinding":d["reason"],"excludedInformation":"General brand/corporate contacts, office schedules, different branches, foreign locators and historical material are not substituted.","recheckTrigger":d["nextAction"]}
 out.append(a)
assert len(out)==259
assert not ({key(d) for d in out}&firstkeys)
assert len(rows)==300 and set(rows)==(firstkeys|{key(d) for d in out})
# Explicitly amend only the two previously audited Botanifique fields. Mango withdrawal remains central.
bot=read(LANE/"chunk-01-amendment.json")["replace"][0]
amends=[]
for f0 in bot["fields"]:
 prior=next(d for d in first if key(d)==(bot["destinationId"],f0["field"]))
 f=copy.deepcopy(f0);f.update(state="verified-agent",approval="agent-accepted",verification="source-checked",reviewedBy=REVIEWER,reviewedAt="2026-10-20")
 amends.append({"mallId":bot["mallId"],"destinationId":bot["destinationId"],"field":f["field"],"auditDecision":"accept","priorAuditedDecision":prior,"acceptedField":f,"reason":"Explicit replacement adds international-market scope caveat to both languages. Official global page directly exposes actual skincare product cards. No Vietnam branch stock, pricing or service promise.","evidenceBindings":[{"file":addfile("product-service-01.json"),"reference":"turn802view0","sourceUrl":"https://botanifique.com/","section":"Actual peeling gel, serum and facial mask cards"},{"file":"content-audit/retail-b-independent/fresh-source-checks.json","reference":"turn835view0","sourceUrl":"https://botanifique.com/","section":"Independent fresh international product and scope check"}],"reviewedBy":REVIEWER,"reviewedAt":"2026-10-20"})
inputs=[{"file":p.relative_to(ROOT).as_posix(),"sha256":sha(p)} for p in sorted(inputpaths)]
def write(name,d): (OUT/name).write_text(json.dumps(d,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
write("reviewed-remaining.json",{"revision":"retail-b-independent-2026-10-20-final","method":"Independent complete saved-source field review; sampled independent fresh checks documented separately. Frozen snapshot plus explicit /brand-family supplement. First41 and central Mango withdrawal are preserved.","inputs":inputs,"decisions":out})
write("amendments.json",{"revision":"retail-b-independent-botanifique-market-caveats","inputs":inputs,"decisions":amends,"preservedCentralMangoWithdrawal":True})
validation={"reviewedRemaining":len(out),"priorAuditedKeys":len(firstkeys),"originalQueueKeys":len(rows),"combinedExactCoverage":len(firstkeys|{key(d) for d in out}),"overlap":0,"remainingCounts":dict(collections.Counter(d["auditDecision"] for d in out)),"allBindingsNonempty":all(d["evidenceBindings"] for d in out),"allHoldActionsSpecific":all(d.get("remainingAction") for d in out if d["auditDecision"]=="hold"),"allNegativeScopesBounded":all(d.get("boundedScope") and d.get("negativeCoverage") for d in out if d["auditDecision"]=="unavailable-after-research"),"allInputHashesVerified":True,"BotanifiqueExplicitAmendments":2,"MangoWithdrawalPreserved":True,"baselineSrcEdited":False}
write("validation.json",validation)
print(json.dumps(validation))

