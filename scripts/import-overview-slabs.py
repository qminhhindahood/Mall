"""Recover the already-reviewed r5 presentation without assigning new map IDs."""
import hashlib
import json
import subprocess
import xml.etree.ElementTree as ET
from pathlib import Path

APP = Path(__file__).resolve().parents[1]
COMMIT = "5d3c8319c073db35ba7ea3caef94c49315d1dd32"
BASE = "evidence/0019-composition-prototype/"


def source(name):
    data = subprocess.check_output(["git", "show", f"{COMMIT}:{BASE}{name}"], cwd=APP)
    return json.loads(data), hashlib.sha256(data).hexdigest()


plates, plates_hash = source("plate-candidates-r5.json")
assets, assets_hash = source("review-assets-r5.json")
for mall, key in [("saigon-centre", "saigonFloors"), ("vincom-dong-khoi", "vincomFloors")]:
    floors = []
    for plate in plates:
        if plate["mall"] != mall:
            continue
        paths = []
        if mall == "vincom-dong-khoi":
            svg = next(f["svg"] for f in assets[key] if f["id"] == plate["floor"])
            paths = [p.attrib["d"] for p in ET.fromstring(svg).findall("path") if "zone" in p.attrib.get("class", "").split()]
        floors.append({"floorId": plate["floor"], "outline": plate["outline"], "sourceSha256": plate["sourceSha256"], "method": plate["method"], "referenceZonePaths": paths})
    assert len(floors) == (8 if mall == "saigon-centre" else 7)
    output = {"revision": "source-floor-slabs-2026-10-18-r1", "sourceCommit": COMMIT, "sourceHashes": {"plate-candidates-r5.json": plates_hash, "review-assets-r5.json": assets_hash}, "scope": "Presentation only. Existing r5 schematic plate outlines and complete Vincom source zones; no location, occupancy or new runtime region IDs.", "floors": floors}
    path = APP / "data/malls" / mall / "overview-slabs.json"
    path.write_text(json.dumps(output, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    print(f"{mall}: {len(floors)} exact r5 slab outlines; {sum(len(f['referenceZonePaths']) for f in floors)} source zone paths")
