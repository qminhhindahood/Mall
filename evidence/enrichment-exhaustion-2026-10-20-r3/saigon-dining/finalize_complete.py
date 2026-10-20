import json,hashlib
from pathlib import Path
p=Path(__file__).resolve().parent
rd=lambda n:json.loads((p/n).read_text(encoding="utf-8"))
wr=lambda n,d:(p/n).write_text(json.dumps(d,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
r=rd("records.json"); d=rd("decisions.json"); follow=rd("international-followthrough.json")
follow["proposals"].append(rd("genki-supplement.json")["proposal"])
keys={(a["destinationId"],a["field"]) for a in follow["proposals"]}
records=r["records"]
for a in follow["proposals"]:
 rec=next((x for x in records if x["destinationId"]==a["destinationId"]),None)
 assert rec is not None
 assert not any(f["field"]==a["field"] for f in rec["fields"])
 rec["fields"].append(a["proposedField"])
decisions=[x for x in d["decisions"] if (x["destinationId"],x["field"]) not in keys]+follow["proposals"]
for amend in follow["retainedHoldAmendments"]:
 for x in decisions:
  if x["destinationId"]==amend["destinationId"] and x["field"] in amend["fields"] and x["outcome"]=="hold":
   x["reason"]+=" "+amend["additionalReason"]
   x["remainingAction"]=amend["remainingAction"]
   x["sources"] += [{"evidenceFile":"international-followthrough.json","reference":amend["destinationId"],"checkedAt":"2026-10-20","scope":"Additional international source/identity checks","result":"specific access or authority limit","support":amend["additionalReason"]}]
q=rd("queue.json")
expected={(r["destinationId"],f) for r in q["records"] for f in r["fields"]}
actual={(x["destinationId"],x["field"]) for x in decisions}
props={(r["destinationId"],f["field"]) for r in records for f in r["fields"]}
assert len(actual)==len(decisions)==143 and actual==expected
assert len(props)==85
assert len(props)==sum(x["outcome"]=="proposal" for x in decisions)
base=json.loads((p.parent/"baseline-accepted.json").read_text(encoding="utf-8"))
basekeys={(r["destinationId"],f["field"]) for r in base["records"] for f in r["fields"]}
assert len(basekeys)==658 and not (basekeys&props)
assert all(x["remainingAction"] for x in decisions if x["outcome"]=="hold")
counts={k:sum(x["outcome"]==k for x in decisions) for k in ["proposal","bounded-unavailable","hold"]}
r.update(revision="saigon-dining-r3-complete-after-independent-followthrough",proposalCount=85,records=records,previousImmutableSnapshot={"file":"records.json","proposalCount":81,"sha256":"503a5f048281e2c07ded3f2d136dc00cc2ec30d65086f03892bdfdfa1dc5d9b2"},additionalSourcePackets=["international-followthrough.json","genki-supplement.json"])
d.update(revision="saigon-dining-r3-complete-all143-after-followthrough",counts=counts,decisions=decisions,previousImmutableSnapshot={"file":"decisions.json","sha256":"c015ed31eae65349cdffc1b0d3b5a88232262a86805e81acc1146a94f698e41b"})
wr("records-complete.json",r);wr("decisions-complete.json",d)
progress=rd("progress.json");progress.update(revision="saigon-dining-r3-complete-after-followthrough",proposals=85,pendingProposalAudit=5,exactHolds=50,authoritativeRecords="records-complete.json",authoritativeDecisions="decisions-complete.json",status="All143 owned queue keys have source-bound decisions. Independent-review-requested international paths checked.50 held resolution actions remain explicit; wider source space is not claimed globally exhausted.")
wr("progress.json",progress)
hashes={n:hashlib.sha256((p/n).read_bytes()).hexdigest() for n in ["records-complete.json","decisions-complete.json","international-followthrough.json","phone-supplement.json"]}
wr("validation-complete.json",{"checkedAt":"2026-10-20","result":"pass","queueKeys":143,"uniqueDecisions":143,"exactQueueEquality":True,"preservedAcceptedFields":658,"baselineKeyOverlap":0,"counts":counts,"allHoldsHaveNextAction":True,"sha256":hashes})
print(json.dumps({"result":"pass","counts":counts,"sha256":hashes}))
