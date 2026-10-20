import pathlib,json,hashlib,copy
ROOT=pathlib.Path(r"D:/Midterm/.scratch/combined-discovery-motion-2026-10-19/evidence/enrichment-exhaustion-2026-10-20-r3")
OUT=ROOT/"content-audit/retail-b-independent";LANE=ROOT/"vincom-retail-b"
def read(p):return json.loads(p.read_text(encoding="utf-8-sig"))
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def key(d):return(d["destinationId"],d["field"])
prior={key(d):d for d in read(OUT/"reviewed-remaining.json")["decisions"]}
recs=read(LANE/"phone-scope-chunk01-records.json")["records"]
ds={key(d):d for d in read(LANE/"phone-scope-chunk01-decisions.json")["decisions"]}
inputs={OUT/"reviewed-remaining.json",OUT/"phone-chunk01-source-review.json",LANE/"phone-scope-chunk01-records.json",LANE/"phone-scope-chunk01-decisions.json"}
out=[]
for r in recs:
 for f0 in r["fields"]:
  k=(r["destinationId"],f0["field"]);d=ds[k];f=copy.deepcopy(f0);p=(LANE/d["sourceFile"]).resolve()
  assert sha(p)==d["sourceSha256"]
  inputs.add(p)
  assert prior[k]["auditDecision"] in ["hold","unavailable-after-research"]
  assert f["applicability"]=="brand-wide" and not f.get("branchMallId")
  assert f["value"]["vi"]==f["value"]["en"] and f["uncertainty"]["vi"] and f["uncertainty"]["en"]
  f.update(state="verified-agent",approval="agent-accepted",verification="source-checked",reviewedBy="Codex (AI) independent retail B reviewer /root/saigon_research",reviewedAt="2026-10-20")
  if k[0]=="vincom-prototype-viinriicnicheperfume":
   f["evidence"]="Actual official source general contact@viinriic.com blocks publish (+84)909816771. The same page also publishes (+84)901982607 beside a named-email company contact. Neither is assigned to this branch; no regional designation or chronological replacement is inferred. Saved turn493view2 L175/221 and product-proof-02.json L402/448; fresh independent turn901view0 confirms both contexts."
  if k[0]=="vincom-prototype-newbalance":
   f["uncertainty"]["vi"]+=" Chưa xác nhận khả năng gọi từ Việt Nam; giữ định dạng số miễn phí nội địa Hoa Kỳ, không tự thêm mã quốc gia."
   f["uncertainty"]["en"]+=" Calling access from Vietnam is unconfirmed; the published US domestic toll-free format is retained without adding a country code."
  out.append({"mallId":r["mallId"],"destinationId":r["destinationId"],"field":f["field"],"auditDecision":"accept","priorAuditedDecision":prior[k],"acceptedField":f,"reason":"Independent actual-source review confirms this exact published general brand/operator/market contact. The earlier branch-only finding is superseded only for this explicitly scoped general fallback; no branch-direct or call-connectivity claim.","evidenceBindings":[{"file":p.relative_to(ROOT).as_posix(),"reference":d["sourceReference"],"sourceUrl":d["sourceUrl"],"section":"Actual numeric contact and surrounding brand/operator/market identity"},{"file":"content-audit/retail-b-independent/phone-chunk01-source-review.json","reference":r["destinationId"],"section":"Independent complete saved-body check and sampled fresh scope checks"}],"brandContactScopeExplicit":True,"reviewedBy":f["reviewedBy"],"reviewedAt":"2026-10-20"})
assert len(out)==19
payload={"revision":"retail-b-independent-general-phone-01","inputs":[{"file":p.relative_to(ROOT).as_posix(),"sha256":sha(p)} for p in sorted(inputs)],"records":out}
(OUT/"phone-amendments-01.json").write_text(json.dumps(payload,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
print(json.dumps({"count":len(out),"sha256":sha(OUT/"phone-amendments-01.json")}))

