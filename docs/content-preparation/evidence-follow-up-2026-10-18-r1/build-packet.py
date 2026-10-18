"""Build private source-bounded copy proposals and an owner decision reader."""
from pathlib import Path
import hashlib
import html
import json

HERE = Path(__file__).resolve().parent
BASE = HERE.parent
def read(path):
    return json.loads(path.read_text(encoding='utf-8'))
def write(name, value):
    (HERE / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

ledger = read(BASE / 'record-review-2026-10-18/content-ledger.json')
roster = {r['id']: r for r in read(BASE / 'completion-packet-2026-10-17/roster.json')['records']}
vincom = {r['id']: r for r in read(BASE / 'record-review-2026-10-18/vincom-source-extracts.json')}
saigon = {r['officialId']: r for r in read(BASE / 'completion-packet-2026-10-17/saigon-research/discoveries.json')['currentOfficialMallRoster']}
# Broad descriptions remove inventory, freshness, price, performance and status promises.
wording = {
'boatnoodle': ('Thưởng thức các món ăn Thái tại BOAT NOODLE.', 'Explore Thai dishes at BOAT NOODLE.'),
'breadtalk': ('Khám phá các loại bánh mì và bánh ngọt tại BreadTalk.', 'Explore breads and cakes at BreadTalk.'),
'converse': ('Khám phá giày dép Converse.', 'Explore Converse footwear.'),
'charleskeith': ('Khám phá giày dép, túi xách và phụ kiện Charles & Keith.', 'Explore Charles & Keith footwear, bags and accessories.'),
'jns': ('Khám phá gọng kính và tròng kính J!NS.', 'Explore J!NS frames and lenses.'),
'levis': ('Khám phá thời trang denim Levi’s.', 'Explore Levi’s denim clothing.'),
'skechers': ('Khám phá giày dép Skechers.', 'Explore Skechers footwear.'),
'dji': ('Khám phá thiết bị bay không người lái và công nghệ máy ảnh DJI.', 'Explore DJI drones and camera technology.'),
'uniqlo': ('Khám phá trang phục thường ngày UNIQLO.', 'Explore UNIQLO everyday clothing.'),
'kichikichi': ('Thưởng thức lẩu tại Kichi Kichi.', 'Enjoy hot pot at Kichi Kichi.'),
'touslesjours': ('Khám phá các loại bánh ngọt tại Tous Les Jours.', 'Explore cakes and pastries at Tous Les Jours.'),
'crocs': ('Khám phá giày dép Crocs.', 'Explore Crocs footwear.'),
'cottonon': ('Khám phá trang phục và phụ kiện Cotton On.', 'Explore Cotton On clothing and accessories.'),
'dyson': ('Khám phá thiết bị gia dụng và chăm sóc tóc Dyson.', 'Explore Dyson home and hair care appliances.'),
'urbanrevivo': ('Khám phá trang phục Urban Revivo.', 'Explore Urban Revivo clothing.'),
'lancome': ('Khám phá mỹ phẩm và nước hoa Lancôme.', 'Explore Lancôme cosmetics and fragrances.'),
'kiehls': ('Khám phá các sản phẩm chăm sóc da Kiehl’s.', 'Explore Kiehl’s skin care products.'),
'sulwhasoo': ('Khám phá mỹ phẩm chăm sóc da Sulwhasoo.', 'Explore Sulwhasoo skin care cosmetics.'),
'dior': ('Khám phá mỹ phẩm và nước hoa Dior.', 'Explore Dior cosmetics and fragrances.'),
'esteelauder': ('Khám phá mỹ phẩm và sản phẩm chăm sóc da Estée Lauder.', 'Explore Estée Lauder cosmetics and skin care products.'),
'shiseido': ('Khám phá mỹ phẩm và sản phẩm chăm sóc da Shiseido.', 'Explore Shiseido cosmetics and skin care products.'),
'nars': ('Khám phá các sản phẩm trang điểm NARS.', 'Explore NARS makeup products.'),
'mac': ('Khám phá các sản phẩm trang điểm MAC.', 'Explore MAC makeup products.'),
'hm': ('Khám phá trang phục và phụ kiện H&M.', 'Explore H&M clothing and accessories.'),
'matinkimvietnam': ('Khám phá thời trang Matin Kim.', 'Explore Matin Kim fashion.'),
}
rows = []
for old in ledger:
    if old['copy']['vi']['proposedDecision'] != 'verify-or-neutralize-specific-claims':
        continue
    rid = old['id']
    vi, en = wording[rid.split('-prototype-')[1]]
    evidence = []
    if old['mall'] == 'vincom-dong-khoi':
        for source in vincom[rid]['sources']:
            if source['text']:
                evidence.append({'path': '../completion-packet-2026-10-17/vincom-research/' + source['path'], 'archivedDescription': source['text']})
    else:
        for official in roster[rid]['official']:
            if official['id'] in saigon:
                source = saigon[official['id']]
                evidence.append({'path': '../completion-packet-2026-10-17/saigon-research/discoveries.json#currentOfficialMallRoster[officialId=' + official['id'] + ']', 'sourceUrls': source['sourceUrls'], 'archivedDescription': source['descriptionEvidence']})
    assert evidence
    rows.append({'id': rid, 'mall': old['mall'], 'name': old['name'], 'reviewedBy': 'Codex (AI evidence reviewer)', 'reviewedAt': '2026-10-18', 'sourceReviewScope': 'Archived first-party description fidelity; no fresh operating-status verification', 'previousCopy': old['copy'], 'proposedText': {'vi': vi, 'en': en}, 'proposedDecision': 'submit-neutral-summary-for-independent-language-review', 'readyForOwnerDecision': True, 'ownerApproval': False, 'ownerApprovedAt': None, 'languageApprovals': {'vi': False, 'en': False}, 'missingEvidence': 'Owner/editorial VI and EN acceptance; identity/current occupancy and location remain separate', 'sources': evidence})
assert len(rows) == 27
write('neutral-copy-proposals.json', {'revision': 'evidence-follow-up-2026-10-18-r1', 'baselineCopyHolds': 151, 'optionalNeutralProposals': 27, 'effectiveApprovedReduction': 0, 'records': rows})
paths = [BASE/'record-review-2026-10-18/content-ledger.json', BASE/'record-review-2026-10-18/vincom-source-extracts.json', BASE/'completion-packet-2026-10-17/roster.json', BASE/'completion-packet-2026-10-17/saigon-research/discoveries.json', BASE/'copy-return-2026-10-18/reconciled-copy.json', BASE/'copy-hold-amendment-2026-10-18/effective-holds.json']
write('input-hashes.json', [{'path': str(p.relative_to(BASE)), 'sha256': hashlib.sha256(p.read_bytes()).hexdigest()} for p in paths])
e = html.escape
cards = ''.join('<details><summary>'+e(r['name'])+' · '+e(r['mall'])+'</summary><p><b>VI:</b> '+e(r['proposedText']['vi'])+'</p><p><b>EN:</b> '+e(r['proposedText']['en'])+'</p><p>Reply: “'+e(r['id'])+' VI accept / EN accept” or give replacement wording.</p><details><summary>Archived evidence and prior wording</summary><pre>'+e(json.dumps(r, ensure_ascii=False, indent=2))+'</pre></details></details>' for r in rows)
page = '''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Owner decisions · 18 October</title><style>body{font-family:var(--font-sans,system-ui);color:var(--foreground,#242424);margin:0;line-height:1.55}h2{font-size:19px;margin:20px 0 8px}p{margin:8px 0}details{border-top:1px solid var(--border,#ddd);padding:12px 0}summary{cursor:pointer;font-weight:600}a{color:var(--accent-foreground,#975719)}pre{white-space:pre-wrap;overflow-wrap:anywhere;font-size:12px}small{color:var(--muted-foreground,#666)}.decision{background:var(--card,#f3f1ed);padding:16px;border-radius:var(--radius,12px);margin:12px 0}li{margin:7px 0}</style><body><p><b>Review decisions · 18 October 2026</b><br><small>Private proposals. No approvals are recorded by this page. Reply in the conversation with exact IDs and decisions.</small></p>
<div class="decision"><b>1 · Saigon geometry: review all 42</b><p>Recommendation: accept the r4 technical shapes after viewing every crop; keep identity/shared-unit questions explicit. <a href="http://127.0.0.1:4349/../../../../docs/polygon-review/result-2026-10-18-r4/README.md">r4 evidence</a></p><p>Resolve separately: Irvins / llaollao both print B2-K5; Label Lab / Moschino both print L2-17. Confirm current code/identity or retain “unit unverified”. Shared parent areas (The Hour Glass, Asian Corner, Oedo Alley, Moschino) must preserve independent destinations.</p><p>Reply: “r4 geometry accept all” with any named exceptions; separately state each duplicate-code/shared-area decision. Shape acceptance does not approve current occupancy.</p></div>
<div class="decision"><b>2 · Bilingual copy</b><p>The prior 220 broad summaries and 16 pending returned rewrites need separate VI and EN decisions. Meat &amp; Meet has scoped wording acceptance already. Cara, Lizd Namat and Mujosh &amp; Ted Baker still have null proposals and require identity/assortment evidence.</p><p><a href="http://127.0.0.1:4349/docs/content-preparation/record-review-2026-10-18/review.html">220-summary review</a> · <a href="http://127.0.0.1:4349/docs/content-preparation/copy-return-2026-10-18/copy-review.md">Returned copy batch</a></p><p>Below are 27 additional neutral proposals, replacing narrow inventory/quality/freshness/status claims with archived-source-backed descriptions. These remain separate from the baseline. Accept VI/EN by ID after reading.</p></div>
<details><summary>Read the 27 neutral VI/EN proposals</summary>'''+cards+'''</details>
<div class="decision"><b>3 · Photos</b><p>Recommendation: choose no-photo treatment unless a specific image has branch, freshness and reuse permission evidence. For 159 identities no candidate exists. 985 other references remain unreviewed; nine representatives were unavailable.</p><p>Reject Winmart sample 162 as target-branch evidence: the building reads VINCOM PLAZA. Portraits/logos/product shots are not storefront photos. Hokkaido Sachi sample 166 has a readable Vincom Đồng Khởi/B3-07 caption but still needs currentness/rights.</p><p>Reply: “Use no-photo for [all pending / listed IDs]” or supply the exact image URL plus branch/date/permission evidence. No-photo approval does not approve roster/copy.</p></div>
<div class="decision"><b>4 · Missing locations and roster</b><p>Recommendation: retain list/floor navigation and no marker for all 128 original unresolved occurrences (122 Vincom, Matin Kim L3, Takashimaya B2/B1/L1/L2/L3). The expanded baseline remains 191 pending locations; private shapes are not an approved reduction.</p><p>Matin Kim/Miana both claim L3-12: supply current mall confirmation. Takashimaya needs its authoritative perimeter on five floors; counter unions do not prove it. Vincom needs isolated boundaries/full-code crosswalks, not merged contours. Confirm complete counter/facility rosters, primary floors and category memberships.</p><p>Reply with record ID + floor + authoritative boundary evidence, or explicitly retain pending/no marker. <a href="http://127.0.0.1:4349/docs/content-preparation/record-review-2026-10-18/mapping-findings.md">Per-record missing evidence</a></p></div>
<p><small>Journey rendered acceptance, runtime background/return and production-host performance, account/origin and release approval remain separate. Nothing here authorizes deployment.</small></p></body></html>'''
geometry_root = HERE.parents[4] / 'docs/polygon-review/result-2026-10-18-r4'
geometry = read(geometry_root/'mapping-ledger.json')['rows']
geometry_cards = ''.join('<details><summary>'+e(str(r['index'])+' · '+r['name']+' / '+r['floor'])+'</summary><p>'+e(r['recordId'])+'</p><p>'+e(r['proposedDecision'])+' · '+e(r['sharedAreaRole'])+'</p><p>'+e(r['remainingEvidence'])+'</p><p>Palette exception: '+e(str((r.get('footprintReview') or {}).get('exceptionReason') or 'none'))+'</p><p>Source relationship: '+e(str(r.get('sourceRelationship') or 'none recorded'))+'</p></details>' for r in geometry)
geometry_images = ''.join('<img style="width:100%;height:auto" alt="r4 geometry contact sheet '+str(i)+'" src="'+(geometry_root/f'overlays/contact-sheet-{i:02d}.jpg').as_posix()+'">' for i in range(1,7))
page = page.replace('http://127.0.0.1:4349/../../../../docs/polygon-review/result-2026-10-18-r4/README.md', '#geometry')
page = page.replace('<div class="decision"><b>2 · Bilingual copy</b>', '<details id="geometry"><summary>All 42 r4 geometry records and six visual contact sheets</summary><p>Before/after images are inherited r4 evidence. All owner approvals remain false. Inspect at full size; geometric overlap is not exclusive occupancy.</p>'+geometry_images+geometry_cards+'</details><div class="decision"><b>2 · Bilingual copy</b>')
ready_copy = [r for r in ledger if r['copy']['vi']['readyForOwnerDecision']]
copy_cards = ''.join('<details><summary>'+e(r['name']+' · '+r['mall'])+'</summary><p>'+e(r['id'])+'</p><p>VI: '+e(r['copy']['vi']['proposedText'])+'</p><p>EN: '+e(r['copy']['en']['proposedText'])+'</p></details>' for r in ready_copy)
returned = read(BASE/'copy-return-2026-10-18/reconciled-copy.json')['records']
return_cards = ''.join('<details><summary>'+e(r['name'])+'</summary><p>'+e(r['id'])+'</p><p>VI: '+e(r['description']['vi'])+'</p><p>EN: '+e(r['description']['en'])+'</p><p>'+e(r['copyDecisionStatus'])+'</p></details>' for r in returned if r['id'] not in {'vincom-prototype-cara','vincom-prototype-lizdnamat','vincom-prototype-mujoshtedbaker'})
page = page.replace('<details><summary>Read the 27 neutral VI/EN proposals</summary>', '<details><summary>Read original 220 ready-copy proposals (historical wording; returned batch supersedes overlapping IDs)</summary>'+copy_cards+'</details><details><summary>Read 17 returned rewrites (Meat &amp; Meet accepted; 16 pending)</summary><p>HIMALAYA contains an internal owner attribution. Recommendation: remove the parenthetical attribution in both languages before approving visitor wording; the submitted strings below remain preserved.</p>'+return_cards+'</details><details><summary>Read the 27 neutral VI/EN proposals</summary>')
(HERE/'owner-review.html').write_text(page,encoding='utf-8')
write('validation.json', {'revision':'evidence-follow-up-2026-10-18-r1','checks':{'27_exact_prior_claim_holds':len(rows)==27,'all_have_archived_source':all(r['sources'] for r in rows),'all_language_approvals_false':all(not any(r['languageApprovals'].values()) for r in rows),'all_owner_approvals_false':all(r['ownerApproval'] is False and r['ownerApprovedAt'] is None for r in rows),'unique_mall_ids':len({r['id'] for r in rows})==27},'scope':'Private content evidence validation; no application unit test or rendered journey acceptance'})
