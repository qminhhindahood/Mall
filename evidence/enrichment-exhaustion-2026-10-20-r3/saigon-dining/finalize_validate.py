import json, hashlib
from pathlib import Path
root=Path(__file__).resolve().parent
load=lambda name: json.loads((root/name).read_text(encoding="utf-8"))
write=lambda name,obj: (root/name).write_text(json.dumps(obj,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
draft=load("proposals-final-input.json")
audit=json.loads((root.parent/"content-audit/reviewed-chunks/saigon-dining-03.json").read_text(encoding="utf-8"))
audited={(d["destinationId"],d["field"]):d for d in audit["decisions"]}
records=draft["records"]
for r in records:
 for i,f in enumerate(r["fields"]):
  a=audited.get((r["destinationId"],f["field"]))
  if a and a["auditDecision"]=="accept":
   # Use independent wording/source refinements, keep this research packet as proposals.
   refined=dict(a["acceptedField"])
   refined["state"]="newly-sourced-proposal"
   refined["approval"]="provisional"
   refined.pop("reviewedBy",None); refined.pop("reviewedAt",None)
   r["fields"][i]=refined
proposed={(r["destinationId"],f["field"]):f for r in records for f in r["fields"]}
decisions=draft["decisions"]
for d in decisions:
 key=(d["destinationId"],d["field"])
 d["proposedField"]=proposed[key]
 d["reason"]=proposed[key]["evidence"]
 if key in audited:
  d["independentAudit"]={"file":"../content-audit/reviewed-chunks/saigon-dining-03.json","decision":audited[key]["auditDecision"],"reviewedAt":"2026-10-20"}
  d["independentEvidenceBindings"]=audited[key].get("evidenceBindings",[])
decisions+=load("terminal-decisions.json")["decisions"]
queue=load("queue.json")
expected={(r["destinationId"],f if isinstance(f,str) else f.get("field")) for r in queue["records"] for f in r.get("unresearchedFields",r.get("fields",[]))}
# Queue field property is checked deterministically below instead of assuming it.
if len(expected)!=143:
 expected=set()
 for r in queue["records"]:
  if "queuedFields" in r:
   expected.update((r["destinationId"], f if isinstance(f,str) else f["field"]) for f in r["queuedFields"])
  elif "remainingFields" in r:
   expected.update((r["destinationId"], f if isinstance(f,str) else f["field"]) for f in r["remainingFields"])
  elif "researchQueue" in r:
   expected.update((r["destinationId"], f if isinstance(f,str) else f["field"]) for f in r["researchQueue"])
if len(expected)!=143:
 print("QUEUE_KEYS",list(queue["records"][0])); raise ValueError("Queue property needs explicit selection")
actual=[(d["destinationId"],d["field"]) for d in decisions]
assert len(actual)==143 and len(set(actual))==143
assert set(actual)==expected, (expected-set(actual),set(actual)-expected)
baseline=json.loads((root.parent/"baseline-accepted.json").read_text(encoding="utf-8"))
baselinekeys={(r["destinationId"],f["field"]) for r in baseline["records"] for f in r["fields"]}
assert len(baselinekeys)==658
assert not baselinekeys.intersection(proposed)
assert len(proposed)==81
assert all(f["state"]=="newly-sourced-proposal" and f["approval"]=="provisional" for f in proposed.values())
assert all(d["sources"] and d["reason"] for d in decisions)
assert all(d["remainingAction"] for d in decisions if d["outcome"]=="hold")
assert all(d["searches"] for d in decisions if d["outcome"]!="proposal")
assert all(f.get("value",{}).get("vi") and f.get("value",{}).get("en") for f in proposed.values() if "value" in f)
counts={k:sum(d["outcome"]==k for d in decisions) for k in ("proposal","bounded-unavailable","hold")}
write("records.json",{"revision":"saigon-dining-r3-final-research-proposals","checkedAt":"2026-10-20","baseHead":"281f8d2","sourceHead":"3e505fb","preservedAcceptedFields":658,"proposalCount":81,"independentReview":"80 audited with wording/source refinements in ../content-audit/reviewed-chunks/saigon-dining-03.json; phone supplement remains for review. These remain research proposals in this packet, not personal owner acceptance.","records":records})
write("decisions.json",{"revision":"saigon-dining-r3-all143-final-decisions","checkedAt":"2026-10-20","scope":"Exclusive 49-destination/143-field queue. All keys attempted; exact source/access/authority holds remain actionable, no claim of global unavailability or complete wider-brand research.","counts":counts,"decisions":decisions})
write("progress.json",{"revision":"saigon-dining-r3-complete","checkedAt":"2026-10-20","destinations":49,"queuedFields":143,"decidedFields":143,"proposals":81,"independentlyAuditedProposals":80,"pendingProposalAudit":1,"boundedPublicSourceNegatives":8,"exactHolds":54,"unresearchedWithinOwnedQueue":0,"preservedAcceptedFields":658,"status":"All owned queue fields have a proposed value/action or a field-specific source-bound negative/hold. Held resolution work is not declared globally exhausted.","sourceEdits":False,"trackerEdits":False,"commits":False,"externalCommunications":False,"formsSubmitted":False,"buildsRun":False})
hashes={name:hashlib.sha256((root/name).read_bytes()).hexdigest() for name in ("records.json","decisions.json","terminal-decisions.json","phone-supplement.json","supporting-evidence.json","source-followthrough.json","booking-searches.json")}
write("validation.json",{"checkedAt":"2026-10-20","result":"pass","assertions":{"queueKeyCount":143,"uniqueDecisionKeyCount":143,"exactQueueEquality":True,"proposalCount":81,"existing658Overlap":0,"allHoldsHaveNextAction":True,"allNegativeKeysHaveSourceAttemptsAndQueries":True,"allProposalsRemainProvisional":True,"bilingualValues":True},"counts":counts,"sha256":hashes})
print(json.dumps({"result":"pass","counts":counts,"sha256":hashes},ensure_ascii=True))
