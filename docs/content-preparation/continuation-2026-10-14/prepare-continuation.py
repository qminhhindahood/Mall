"""Prepare immutable source proposals and editable reviews; never write public data.

Run once with --workspace D:/Midterm. Later use --verify-only so reviewed
worksheets are not overwritten. This is content preparation, not an import.
"""
import argparse
import csv
import hashlib
import json
import re
import unicodedata
from collections import Counter, defaultdict
from pathlib import Path


REVISION = "directory-continuation-2026-10-14-r1"
HERE = Path(__file__).resolve().parent
PACKET = HERE.parent


def read_json(path):
    return json.loads(path.read_text(encoding="utf-8-sig"))


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def slug(name):
    text = unicodedata.normalize("NFKD", name.replace("đ", "d").replace("Đ", "D"))
    text = text.encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z0-9]+", "-", text).strip("-")


def display_name(name):
    return re.sub(r"\\([!\"#$%&'()*+,\-./:;<=>?@\[\]^_`{|}~])", r"\1", name)


def pending():
    return {"decision": "pending", "reviewer": None, "reviewedAt": None}


def prepare(workspace):
    claims = read_json(PACKET / "floor-claims.json")
    inventory = read_json(PACKET / "supplied-reference-inventory.json")
    drafts = [read_json(PACKET / f"{mall}.draft.json") for mall in ("saigon-centre", "vincom-dong-khoi")]
    with (PACKET / "all-record-map-comparison.csv").open(encoding="utf-8-sig", newline="") as stream:
        comparison = {row["candidate_ref"]: row for row in csv.DictReader(stream)}
    claim_by_ref = {row["candidateRef"]: row for row in claims["records"]}
    inputs = [PACKET / name for name in ("floor-claims.json", "all-record-map-comparison.csv", "supplied-reference-inventory.json", "saigon-centre.draft.json", "vincom-dong-khoi.draft.json")]
    inputs += [workspace / item["path"] for item in inventory]
    inputs += [workspace / "implementation/mall-visitor/data/malls" / mall / "directory.json" for mall in ("saigon-centre", "vincom-dong-khoi")]
    receipt = {str(path.relative_to(workspace)).replace("\\", "/"): digest(path) for path in inputs}
    for item in inventory:
        assert digest(workspace / item["path"]) == item["sha256"], item["path"]
    for mall in ("saigon-centre", "vincom-dong-khoi"):
        snapshot = read_json(workspace / "implementation/mall-visitor/data/malls" / mall / "directory.json")
        assert snapshot["approval"] == "pending" and snapshot["reviewedAt"] is None
        assert all(snapshot[key] == [] for key in ("destinations", "categories", "areas", "facilities", "highlights"))
    cards, by_name = [], defaultdict(list)
    for draft in drafts:
        for source in draft["destinations"]:
            ref = source["candidateRef"]
            claim, observed = claim_by_ref[ref], comparison[ref]
            lines = (workspace / source["source"]["path"]).read_text(encoding="utf-8-sig").splitlines()
            assert lines[source["source"]["line"] - 1] == source["suppliedClaims"]["rawRow"]
            assert claim["name"] == source["name"]["vi"] == observed["name"]
            assert source["verifiedFloors"] == claim["verifiedFloors"] == []
            assert claim["approvedAreaIds"] == [] and claim["editorialReviewedAt"] is None
            supported = {"B2", "B1", "L1", "L2", "L3", "L4", "L5", "L6"} if draft["mallId"] == "saigon-centre" else {"B3", "B2", "B1", "L1", "M", "L2", "L3"}
            assert set(claim["claimedFloors"]) <= supported
            assert source["status"] is None and source["primaryFloor"] is None
            assert all(not review["approved"] for review in source["review"]["languages"].values())
            assert all(review["reviewer"] is None and review["reviewedAt"] is None for review in source["review"]["languages"].values())
            assert source["review"]["reviewedAt"] is None
            card = {
                "candidateRef": ref, "mallId": draft["mallId"], "workflowStatus": "pending",
                "source": source["source"], "rawRow": source["suppliedClaims"]["rawRow"],
                "sourceLabel": source["suppliedClaims"]["label"],
                "sourceVietnameseDescription": source["description"]["vi"],
                "sourceHomepageCell": source["suppliedClaims"]["homepageCell"],
                "floorProposal": {"claimedFloors": claim["claimedFloors"], "evidence": claim["floorClaimEvidence"], "unitOrRangeClaim": claim["claimedUnitOrRange"]},
                "historicalMapComparison": {key: observed[key] for key in ("observed_map_floors", "observed_map_unit_or_label", "comparison", "note")},
                "basicListingProposal": {
                    "name": {"vi": display_name(source["name"]["vi"]), "en": display_name(source["name"]["vi"])},
                    "description": {"vi": "", "en": ""},
                    "reason": "Official-form brand spelling proposed in both locales; empty introductions proposed for a reviewed basic listing. Team must approve both choices.",
                    "verifiedFloors": [], "primaryFloor": None, "locations": [], "categories": [], "status": None,
                    "languageReviews": {"vi": pending(), "en": pending()},
                    "intentionalEmptyDescriptionReview": pending(),
                },
                "decision": {"identity": pending(), "floorAndStatus": pending(), "taxonomy": pending()},
            }
            cards.append(card)
            by_name[(draft["mallId"], source["name"]["vi"].casefold())].append(card)
    assert len(cards) == len(comparison) == len(claim_by_ref) == 383
    groups = []
    collision = defaultdict(list)
    for (mall, _), occurrences in by_name.items():
        name = occurrences[0]["basicListingProposal"]["name"]["vi"]
        proposal_id = slug(name)
        assert proposal_id
        group_ref = f"{mall}-identity-{len(groups) + 1:03}"
        collision[(mall, proposal_id)].append(group_ref)
        floors = list(dict.fromkeys(floor for item in occurrences for floor in item["floorProposal"]["claimedFloors"]))
        groups.append({"groupRef": group_ref, "mallId": mall, "name": name, "proposedDestinationId": proposal_id,
                       "matchingRule": "case-insensitive exact name only; no approved merge or fuzzy match",
                       "candidateRefs": [item["candidateRef"] for item in occurrences],
                       "claimedFloorUnionForReview": floors, "mergeDecision": pending(),
                       "destinationIdDecision": pending()})
        for card in occurrences:
            card["identityGroupRef"] = group_ref
            card["basicListingProposal"]["proposedDestinationId"] = proposal_id
    collisions = [{"mallId": mall, "proposedId": proposed, "groupRefs": refs} for (mall, proposed), refs in collision.items() if len(refs) > 1]
    rows = []
    sizes = {group["groupRef"]: len(group["candidateRefs"]) for group in groups}
    for card in cards:
        issues = []
        if not card["floorProposal"]["claimedFloors"]:
            issues.append("missing-explicit-list-floor")
        if sizes[card["identityGroupRef"]] > 1:
            issues.append("repeated-exact-name-identity")
        name = card["basicListingProposal"]["name"]["vi"].casefold()
        if card["mallId"] == "vincom-dong-khoi" and name in {"crocs", "an phước", "valentino creations", "sony", "studio 77", "yamazaki", "king bbq", "mujosh & ted baker"}:
            issues.append("targeted-location-or-identity-decision")
        description = (card["sourceLabel"] + " " + card["sourceVietnameseDescription"]).casefold()
        if "sắp khai trương" in description or "opening soon" in description or "chuẩn bị khai trương" in description:
            issues.append("planned-opening-status")
        priority = 1 if "missing-explicit-list-floor" in issues else 2 if issues else 3
        rows.append({"priority": priority, "candidate_ref": card["candidateRef"], "mall": card["mallId"], "name": card["basicListingProposal"]["name"]["vi"],
                     "source_path": card["source"]["path"], "source_line": card["source"]["line"],
                     "list_floor_claims": "; ".join(card["floorProposal"]["claimedFloors"]),
                     "list_unit_claim": card["floorProposal"]["unitOrRangeClaim"] or "",
                     "identity_group": card["identityGroupRef"], "proposed_id": card["basicListingProposal"]["proposedDestinationId"],
                     "attention": "; ".join(issues) or "review-source-backed-basic-listing",
                     "historical_map_note": card["historicalMapComparison"]["note"],
                     **{key: "" for key in ("reviewed_destination_id", "identity_decision", "verified_floors", "primary_floor", "reviewed_status", "approved_categories", "location_evidence", "approve_empty_introductions", "vi_reviewer", "vi_review_date", "en_reviewer", "en_review_date", "decision_notes")}})
    rows.sort(key=lambda row: (row["priority"], row["mall"], row["source_line"]))
    counts = {mall: {"occurrences": sum(card["mallId"] == mall for card in cards),
                     "withExplicitSourceFloor": sum(card["mallId"] == mall and bool(card["floorProposal"]["claimedFloors"]) for card in cards),
                     "withoutExplicitSourceFloor": sum(card["mallId"] == mall and not card["floorProposal"]["claimedFloors"] for card in cards)} for mall in ("saigon-centre", "vincom-dong-khoi")}
    report = {"revision": REVISION, "format": "offline-review-proposals; not DirectorySnapshot", "approval": "pending", "reviewedAt": None,
              "highlights": [], "highlightsDecision": "deferred by owner", "counts": counts,
              "identityGroupCount": len(groups), "repeatedExactNameGroups": [group for group in groups if len(group["candidateRefs"]) > 1],
              "proposedIdCollisions": collisions, "priorityCounts": dict(Counter(str(row["priority"]) for row in rows)),
              "preservedInputSha256": receipt, "checks": {"sourceRows": 383, "inventoryHashes": len(inventory), "sourceClaimsWithFloors": 316, "pendingApprovals": 383},
              "limits": "No merge, floor, unit, primary floor, status, taxonomy, language or editorial date approved. Source/map receipts reused; no fresh tenant research. No public import or deployment."}
    return cards, groups, rows, report


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--workspace", type=Path, required=True)
    parser.add_argument("--verify-only", action="store_true")
    args = parser.parse_args()
    cards, groups, rows, report = prepare(args.workspace.resolve())
    payloads = {"review-cards.json": {"revision": REVISION, "approval": "pending", "reviewedAt": None, "format": "offline-review-proposals; not DirectorySnapshot", "highlights": [], "records": cards},
                "identity-proposals.json": {"revision": REVISION, "approval": "pending", "groups": groups}, "validation.json": report}
    if args.verify_only:
        for name, payload in payloads.items():
            assert read_json(HERE / name) == payload, f"Input/proposal changed: {name}; reconcile instead of regenerating reviewed work."
        with (HERE / "decision-queue.csv").open(encoding="utf-8-sig", newline="") as stream:
            reviewed = list(csv.DictReader(stream))
        assert len(reviewed) == 383
        assert {row["candidate_ref"] for row in reviewed} == {row["candidate_ref"] for row in rows}
        protected = list(rows[0])[:11]
        expected = {row["candidate_ref"]: row for row in rows}
        for row in reviewed:
            assert all(row[key] == str(expected[row["candidate_ref"]][key]) for key in protected), row["candidate_ref"]
        print("PASS: 383 source cards, 383 queue identities, 316 floor claims / 67 missing, 62 inventory hashes and unchanged public snapshots; proposal approvals pending.")
        return
    outputs = [HERE / name for name in payloads] + [HERE / "decision-queue.csv"]
    if any(path.exists() for path in outputs):
        raise SystemExit("Refusing to overwrite continuation outputs. Use --verify-only; preserve reviewed copies.")
    for name, payload in payloads.items():
        (HERE / name).write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    with (HERE / "decision-queue.csv").open("w", encoding="utf-8-sig", newline="") as stream:
        writer = csv.DictWriter(stream, fieldnames=list(rows[0]))
        writer.writeheader()
        writer.writerows(rows)
    print(json.dumps({key: report[key] for key in ("counts", "identityGroupCount", "priorityCounts", "proposedIdCollisions")}, ensure_ascii=False))


if __name__ == "__main__":
    main()
