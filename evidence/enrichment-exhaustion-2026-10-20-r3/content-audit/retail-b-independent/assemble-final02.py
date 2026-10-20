import pathlib,json,copy,hashlib
ROOT=pathlib.Path(r"D:/Midterm/.scratch/combined-discovery-motion-2026-10-19/evidence/enrichment-exhaustion-2026-10-20-r3");OUT=ROOT/"content-audit/retail-b-independent";LANE=ROOT/"vincom-retail-b"
def read(p):return json.loads(p.read_text(encoding="utf-8-sig"))
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def key(d):return(d["destinationId"],d["field"])
reviewer="Codex (AI) independent retail B reviewer /root/saigon_research"
prior={key(d):d for d in read(OUT/"reviewed-remaining.json")["decisions"]}
firstp=ROOT/"content-audit/reviewed-chunks/vincom-retail-b-01.json"
first={key(d):d for d in read(firstp)["decisions"]}
inputs={OUT/"reviewed-remaining.json",firstp,OUT/"furla-catalog-source.txt",LANE/"phone-scope-all-phone-review.json"}
out=[]
for stem in ["phone-scope-chunk02","mothercare-international"]:
 rp=LANE/(stem+"-records.json");dp=LANE/(stem+"-decisions.json")
 inputs.update([rp,dp]);ds={key(d):d for d in read(dp)["decisions"]}
 for r in read(rp)["records"]:
  for f0 in r["fields"]:
   k=(r["destinationId"],f0["field"]);d=ds[k];f=copy.deepcopy(f0)
   assert prior[k]["auditDecision"] in ["hold","unavailable-after-research"]
   assert f["applicability"]=="brand-wide" and not f.get("branchMallId")
   f.update(state="verified-agent",approval="agent-accepted",verification="source-checked",reviewedBy=reviewer,reviewedAt="2026-10-20")
   files=d.get("sourceFiles",[d.get("sourceFile")]);bindings=[]
   for fn in files:
    p=(LANE/fn).resolve();inputs.add(p)
    if d.get("sourceSha256"):assert sha(p)==d["sourceSha256"]
    bindings.append({"file":p.relative_to(ROOT).as_posix(),"reference":d.get("sourceReference") or f["evidence"],"sourceUrl":f["sourceUrl"],"section":"Actual official numeric contact/product content and market/authority context"})
   if k[0]=="vincom-candidate-vd-b2-027":
    reason="Independent complete official source review confirms global Mothercare authority links Singapore at turn892view0 L62; root Singapore retailer exposes actual named product cards in turn903view0 L467–619. Global body L38/42/153/163 supports only the stated products. Explicit international/Singapore and Vietnam-website cessation caveats preserve unknown local availability; no parenting, medical or appointment service inferred."
    if k[1]=="services":f["evidence"]="Actual global Mothercare product narrative turn892view0 L38/42 and L153/163 supports newborn clothing, pushchairs, toys, nursery and feeding products. General international product summary only; local availability and any advisory/medical service unverified."
   else:
    assert f["value"]["vi"]==f["value"]["en"]
    reason="Independent actual saved-source reading confirms numeric customer-service contact and exact market/site scope. US domestic formats and Jo Malone's unconfirmed international country routing remain explicit; no country prefix, branch-direct claim or tested connectivity invented."
   a={"mallId":r["mallId"],"destinationId":r["destinationId"],"field":f["field"],"auditDecision":"accept","priorAuditedDecision":prior[k],"acceptedField":f,"reason":reason,"evidenceBindings":bindings,"reviewedBy":reviewer,"reviewedAt":"2026-10-20"}
   if f["field"]=="phone":a["brandContactScopeExplicit"]=True
   out.append(a)
# Replace the prior locator-as-catalogue target with an independently read actual international e-shop catalogue.
k=("vincom-candidate-vd-x-074","catalog");p=copy.deepcopy(first[k]);f=copy.deepcopy(p["acceptedField"])
f.update(sourceUrl="https://www.furla.com/int/en/eshop/woman/woman-bags/",url="https://www.furla.com/int/en/eshop/woman/woman-bags/",checkedAt="2026-10-20",state="verified-agent",approval="agent-accepted",verification="source-checked",applicability="brand-wide",reviewedBy=reviewer,reviewedAt="2026-10-20",evidence="Actual official international bags catalogue turn907view0 L44–104 exposes bag-type/line filters and L118–203 named Dora, Goccia, Iride and other product cards. Replaces branch locator as catalogue target; no Vietnam stock, prices or fulfilment promise.",uncertainty={"vi":"Danh mục quốc tế của Furla; sản phẩm, giá và tình trạng cung cấp có thể khác tại Việt Nam. Xác nhận danh mục tại chi nhánh.","en":"Furla international catalogue; products, prices and availability may differ in Vietnam. Confirm the branch range."})
f.pop("branchMallId",None)
out.append({"mallId":"vincom-dong-khoi","destinationId":k[0],"field":k[1],"auditDecision":"accept","priorAuditedDecision":p,"acceptedField":f,"reason":"The previous branch-locator URL described goods but did not perform the catalogue action. Fresh actual official international e-shop product/category page directly resolves that role; international caveat added in VI/EN.","evidenceBindings":[{"file":"content-audit/retail-b-independent/furla-catalog-source.txt","reference":"turn907view0 L44–104; L118–203","sourceUrl":f["sourceUrl"],"section":"Actual catalogue filters and named product cards"}],"reviewedBy":reviewer,"reviewedAt":"2026-10-20"})
# Fourth phone negative is now a precise access hold after bounded official general-contact attempt.
ad=next(d for d in read(LANE/"phone-scope-all-phone-review.json")["decisions"] if d["destinationId"]=="vincom-prototype-adidas")
k=key(ad);ap=LANE/"adidas-general-contact-check.json";inputs.add(ap)
browserReceipt=ROOT/"holds/adidas-contact-final.json";inputs.add(browserReceipt)
ad["reason"]+=" Root independently attempted the same official contact target through browser rendering; page.goto timed out after25seconds, with no actual body or response status established. This is a source-access hold, not an approval blocker or a global absence finding."
out.append({"mallId":"vincom-dong-khoi","destinationId":k[0],"field":k[1],"auditDecision":"hold","priorAuditedDecision":prior[k],"reason":ad["reason"],"remainingAction":ad["nextAction"],"evidenceBindings":[{"file":"vincom-retail-b/adidas-general-contact-check.json","reference":"turn905view0","sourceUrl":"https://www.adidas.com.vn/en/help/contact-us","section":"Exact official general-contact URL is inaccessible through the reader"},{"file":"vincom-retail-b/phone-scope-all-phone-review.json","reference":"vincom-prototype-adidas/phone","section":"Systematic phone-scope followthrough; preserves B2/B1 identity separation"}],"reviewedBy":reviewer,"reviewedAt":"2026-10-20"})
out[-1]["evidenceBindings"].append({"file":"holds/adidas-contact-final.json","reference":"Root exact official-contact browser retrieval,20October2026","sourceUrl":"https://www.adidas.com.vn/en/help/contact-us","section":"Bounded25-second page.goto timeout; no body/status verified"})
assert len(out)==7 and len({key(d) for d in out})==7
payload={"revision":"retail-b-independent-final-role-and-phone-amendments","inputs":[{"file":p.relative_to(ROOT).as_posix(),"sha256":sha(p)} for p in sorted(inputs)],"records":out}
p=OUT/"final-amendments-02.json";p.write_text(json.dumps(payload,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
print(json.dumps({"records":len(out),"accept":sum(d["auditDecision"]=="accept" for d in out),"hold":sum(d["auditDecision"]=="hold" for d in out),"sha256":sha(p)}))

