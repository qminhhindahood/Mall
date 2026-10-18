"""Build private, non-importable effective review records. Never edits application data."""
import copy
import gzip
import hashlib
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
APP = HERE.parents[2]
PROJECT = APP.parents[1]
REVISION = "integration-candidate-2026-10-18-r2"
SOURCES = {}
CHECKS = []


def read(path):
    path = path.resolve()
    data = path.read_bytes()
    SOURCES[path.relative_to(PROJECT).as_posix()] = hashlib.sha256(data).hexdigest()
    return json.loads(data)


def write(name, value):
    (HERE / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def require(condition, message):
    if not condition:
        raise ValueError(message)
    CHECKS.append({"invariant": message, "result": "pass"})


def main():
    base = HERE.parent
    owner_decisions = read(HERE / "owner-decisions.json")
    require(owner_decisions["geometry"]["ownerApproval"] is True and owner_decisions["geometry"]["exactStatement"] == "r4 geometry accept all", "Geometry decision scope must match exact owner statement")
    require(owner_decisions["unresolvedTreatment"]["ownerApproval"] is True and owner_decisions["unresolvedTreatment"]["exactStatement"] == "Approve no-photo and no-marker treatment for unresolved records.", "Unresolved treatment decision must retain exact owner statement")
    review = base / "record-review-2026-10-18"
    geometry_path = PROJECT / "docs/polygon-review/result-2026-10-18-r4"
    roster = read(base / "completion-packet-2026-10-17/roster.json")
    content = read(review / "content-ledger.json")
    original_gaps = read(review / "mapping-ledger.json")
    returned = read(base / "copy-return-2026-10-18/reconciled-copy.json")
    holds = read(base / "copy-hold-amendment-2026-10-18/effective-holds.json")
    neutral = read(base / "evidence-follow-up-2026-10-18-r1/neutral-copy-proposals.json")
    neutral_by_id = {r["id"]: r for r in neutral["records"]}
    require(len(neutral_by_id) == 27 and all(not r["ownerApproval"] and not any(r["languageApprovals"].values()) for r in neutral["records"]), "Optional neutral proposals must remain unapproved")
    geometry = read(geometry_path / "floor-geometry-candidate.json")
    packaged_geometry = gzip.compress((geometry_path / "floor-geometry-candidate.json").read_bytes(), mtime=0)
    decisions = read(geometry_path / "decision-ledger.json")
    associations = read(geometry_path / "record-area-associations.json")
    validation = read(geometry_path / "validation.json")
    require(len(validation["checks"]) == 24 and all(c["result"] == "pass" for c in validation["checks"]), "r4 technical validation must pass")
    # Include all r4 artifacts so the receipt binds imagery, exception evidence and geometry.
    for path in sorted(geometry_path.rglob("*")):
        if path.is_file() and "__pycache__" not in path.parts:
            SOURCES[path.relative_to(PROJECT).as_posix()] = hashlib.sha256(path.read_bytes()).hexdigest()
    by_id = {r["id"]: r for r in content}
    require(len(by_id) == len(content) == 371, "Expected 371 distinct content identities")
    require(set(by_id) == {r["id"] for r in roster["records"]}, "Roster/content identity mismatch")
    returns_by_id = {r["id"]: r for r in returned["records"]}
    holds_by_id = {r["id"]: r for r in holds["records"]}
    require(len(returns_by_id) == 20 and len(holds_by_id) == 3, "Unexpected copy overlay scope")
    geometry_by_key = {(r["recordId"], r["floor"]): r for r in decisions["rows"]}
    association_by_key = {(r["recordId"], r["floor"]): r for r in associations["associations"]}
    require(len(geometry_by_key) == len(association_by_key) == 42, "Expected 42 unique r4 locations")
    require(set(geometry_by_key) == set(association_by_key), "Geometry ledger/association mismatch")
    source_geometry = read(APP / "data/malls/saigon-centre/floor-geometry.json")
    candidate_floors = {f["id"]: f for f in geometry["floors"]}
    for floor in source_geometry["floors"]:
        candidate = candidate_floors[floor["id"]]
        require(all(candidate.get(k) == v for k, v in floor.items() if k != "regions"), "Original floor metadata changed")
        regions = {r["id"]: r for r in candidate["regions"]}
        require(all(regions.get(r["id"]) == r for r in floor["regions"]), "Original geometry changed")
    public = {}
    for mall in ("saigon-centre", "vincom-dong-khoi"):
        snapshot = read(APP / f"data/malls/{mall}/directory.json")
        require(snapshot["approval"] == "pending" and snapshot["reviewedAt"] is None and not snapshot["destinations"], "Public snapshot must remain pending/empty")
        public[mall] = snapshot["revision"]
    records = []
    for identity in roster["records"]:
        record = copy.deepcopy(by_id[identity["id"]])
        record["categories"] = identity["categories"]
        record["rosterEvidence"] = {"occurrences": identity["occurrences"], "ownerUnits": identity.get("ownerUnits", {})}
        record["copyRevision"] = "record-review-2026-10-18-r1"
        record["evidencePathBases"] = {"baseline": "implementation/mall-visitor/docs/content-preparation/record-review-2026-10-18", "copyReturn": "implementation/mall-visitor/docs/content-preparation/copy-return-2026-10-18", "copyHoldAmendment": "implementation/mall-visitor/docs/content-preparation/copy-hold-amendment-2026-10-18", "geometry": "docs/polygon-review/result-2026-10-18-r4", "optionalNeutralCopy": "implementation/mall-visitor/docs/content-preparation/evidence-follow-up-2026-10-18-r1"}
        if record["id"] in neutral_by_id:
            proposal = neutral_by_id[record["id"]]
            require(proposal["mall"] == record["mall"], "Neutral copy mall mismatch")
            record["additionalUnapprovedCopyProposal"] = proposal
        if record["id"] in returns_by_id:
            overlay = returns_by_id[record["id"]]
            require(overlay["mall"] == record["mall"], "Copy mall mismatch")
            record["copyRevision"] = returned["revision"]
            for language in ("vi", "en"):
                record["copy"][language].update({"proposedText": overlay["description"][language], "proposedDecision": overlay["copyDecisionStatus"], "ownerApproval": overlay["copyOwnerApproval"], "readyForOwnerDecision": overlay["description"][language] is not None, "finding": overlay["rationaleAsReported"], "unresolvedFact": overlay["unresolvedFact"], "approvalScope": overlay["approvalScope"], "reviewerAsReported": overlay["reviewerAsReported"], "actualReviewDateAsReported": overlay["actualReviewDateAsReported"], "conversationDecisionDate": overlay["conversationDecisionDate"], "sourceEvidence": overlay["sourceEvidence"]})
        if record["id"] in holds_by_id:
            hold = holds_by_id[record["id"]]
            require(hold["mall"] == record["mall"], "Hold mall mismatch")
            record["copyRevision"] = holds["revision"]
            for language in ("vi", "en"):
                record["copy"][language] = {"proposedText": None, "proposedDecision": "needs-evidence", "ownerApproval": False, "readyForOwnerDecision": False, "finding": hold["rationale"], "unresolvedFact": hold["unresolvedFact"], "sourceEvidence": hold["sourceEvidence"], "reviewerAsReported": hold["reviewerIdentity"], "actualReviewDateAsReported": hold["actualReviewDate"], "approvalScope": hold["approvalScope"]}
        record["geometryCandidates"] = []
        record["originalLocationGaps"] = []
        for gap in original_gaps:
            if gap["id"] != record["id"]:
                continue
            key = (gap["id"], gap["floor"])
            if key in geometry_by_key:
                decision = geometry_by_key[key]
                association = association_by_key[key]
                region_id = decision["reusedExistingRegion"] or decision["proposalRegionId"]
                require(record["mall"] == "saigon-centre" and gap["floor"] in record["floors"], "Cross-mall or floor geometry association")
                floor_geometry = candidate_floors[gap["floor"]]
                require(any(r["id"] == region_id for r in floor_geometry["regions"] + floor_geometry.get("candidateRegions", [])), "Unknown candidate region")
                require(decision["readyForOwnerGeometryDecision"] and not decision["ownerApproval"], "Unexpected geometry approval state")
                record["geometryCandidates"].append({"floor": gap["floor"], "regionId": region_id, "revision": decisions["revision"], "ownerApproval": True, "ownerApprovedAt": "2026-10-18", "approvalScope": "Geometry proposal only; not identity, current occupancy, copy or release", "ownerDecisionPointer": "owner-decisions.json#geometry", "readyForOwnerGeometryDecision": False, "disposition": decision["disposition"], "sharedAreaRole": association["sharedAreaRole"], "sharedAreaChildren": association.get("sharedAreaChildren", []), "remainingEvidenceAsReviewed": decision["remainingEvidence"], "remainingEvidence": "Identity, current occupancy and duplicate-code relationships remain separate; owner geometry acceptance recorded", "sourceEvidencePaths": decision["sourceEvidencePaths"], "decisionPointer": f"docs/polygon-review/result-2026-10-18-r4/decision-ledger.json#rows[recordId={record['id']},floor={gap['floor']}]"})
            else:
                record["originalLocationGaps"].append({"floor": gap["floor"], "regionId": None, "proposedDecision": "retain-floor-list-access-without-precise-marker", "noMarkerTreatmentOwnerApproval": True, "ownerDecisionPointer": "owner-decisions.json#unresolvedTreatment", "missingEvidence": gap["missingEvidence"], "sources": gap["sources"]})
        require(not record["media"]["ownerApproval"], "No-photo policy applies to unresolved unapproved media")
        record["unresolvedMediaTreatment"] = {"treatment": "no-photo", "ownerApproval": True, "ownerApprovedAt": "2026-10-18", "ownerDecisionPointer": "owner-decisions.json#unresolvedTreatment", "mediaRightsApproval": False}
        record["missingDecisions"] = ["Roster/category/facility and current occupancy review", "Rendered journey and release acceptance"]
        for language in ("vi", "en"):
            if not record["copy"][language]["ownerApproval"]:
                record["missingDecisions"].append(f"{language}: " + record["copy"][language]["proposedDecision"])
        if record["geometryCandidates"]:
            record["missingDecisions"].append("Duplicate-code identity questions remain separate from accepted geometry")
        if record["originalLocationGaps"]:
            record["missingDecisions"].append("Precise location evidence; retain floor/list access without marker")
        record["publicationApproval"] = False
        records.append(record)
    require(sum(len(r["geometryCandidates"]) for r in records) == 42, "Missing geometry candidate")
    require(sum(len(r["originalLocationGaps"]) for r in records) == 128, "Original gap denominator changed")
    approved_copy_ids = {r["id"] for r in records if any(c["ownerApproval"] for c in r["copy"].values())}
    require(approved_copy_ids == {"saigon-prototype-meatmeet"}, "Scoped copy acceptance broadened")
    summary = {"identities": len(records), "originalMappingOccurrences": len(original_gaps), "geometryCandidatesPendingOwnerApproval": 0, "geometryCandidatesOwnerApproved": 42, "noPhotoTreatmentOwnerApprovedIdentities": len(records), "noMarkerTreatmentOwnerApprovedOriginalOccurrences": 128, "remainingOriginalPreciseLocationGaps": 128, "expandedPendingLocationBaseline": 191, "expandedBaselineScope": "Historical completion-packet baseline; not recomputed or interchangeable with original 170 gaps", "copyEvidenceHoldsAmended": sorted(holds_by_id), "additionalUnapprovedNeutralCopyProposals": len(neutral_by_id), "scopedAcceptedCopyIds": sorted(approved_copy_ids), "publishableRecords": 0, "publicSnapshots": public}
    require(all(g["ownerApproval"] for r in records for g in r["geometryCandidates"]), "All 42 r4 geometry proposals owner accepted")
    require(all(not r["publicationApproval"] and not r["ownerApproval"] for r in records), "Geometry and treatment approval must not imply record/publication approval")
    require(all(g["regionId"] is None and g["noMarkerTreatmentOwnerApproval"] for r in records for g in r["originalLocationGaps"]), "Unresolved original locations remain unmarked with approved treatment")
    prior_hashes = HERE / "source-hashes.json"
    if prior_hashes.exists():
        require(json.loads(prior_hashes.read_text(encoding="utf-8"))["files"] == dict(sorted(SOURCES.items())), "Inputs changed: preserve this revision and create a new versioned candidate")
    (HERE / "accepted-r4-geometry.json.gz").write_bytes(packaged_geometry)
    for mall in public:
        write(f"{mall}.private.json", {"revision": REVISION, "mallId": mall, "approval": "pending", "publicationApproval": False, "importableDirectorySnapshot": False, "records": [r for r in records if r["mall"] == mall]})
    write("summary.json", summary)
    write("source-hashes.json", {"algorithm": "sha256", "pathBase": "D:/Midterm (repository root)", "files": dict(sorted(SOURCES.items()))})
    # The prior-hash check runs only on rebuild; keep the receipt itself deterministic.
    checks = [c for c in CHECKS if not c["invariant"].startswith("Inputs changed:")]
    write("integrity.json", {"revision": REVISION, "checks": checks, "scope": "Private assembly invariants, not application behavior or owner acceptance"})
    outputs = ["accepted-r4-geometry.json.gz", "saigon-centre.private.json", "vincom-dong-khoi.private.json", "summary.json", "source-hashes.json", "integrity.json"]
    write("manifest.json", {"revision": REVISION, "outputs": {name: hashlib.sha256((HERE / name).read_bytes()).hexdigest() for name in outputs}, "generatorSha256": hashlib.sha256(Path(__file__).read_bytes()).hexdigest(), "scope": "Deterministic private assembly integrity only; not editorial, geometry-owner, rendered or release acceptance"})
    print(json.dumps(summary, ensure_ascii=False))


if __name__ == "__main__":
    main()
