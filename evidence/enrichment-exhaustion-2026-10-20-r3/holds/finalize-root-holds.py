import json
from pathlib import Path

root = Path(__file__).parent
queue = json.loads((root / 'queue.json').read_text(encoding='utf-8'))['records']
decisions = []
records = []
for stem in ('phones', 'resolved', 'browser'):
    decisions.extend(json.loads((root / f'chunk-{stem}-decisions.json').read_text(encoding='utf-8'))['decisions'])
    records.extend(json.loads((root / f'chunk-{stem}-records.json').read_text(encoding='utf-8'))['records'])
done = {(d['destinationId'], d['field']) for d in decisions}
remaining = []
new_records = []
specific = {
 'saigon-prototype-rakthai': ('Official mall profile has no useful offering description; independent searches find wrong-market RAK brands. Candidate Vietnam Facebook body is throttled and exact operator/offering remains unverified.', ['open-7.json', 'search-9.json', '../saigon-dining/source-receipts.json'], 'Read an accessible first-party Vietnam RAK Thai offering statement tied to this tenant.'),
 'saigon-candidate-175eb1fd-2de0-4649-8584-8435bacb798c': ('SportFair official mall source remains placeholder S/Opening Soon at L3-42; no specific operator or product offering is established by independent brand searches.', ['search-9.json', '../saigon-retail/source-033.txt', '../saigon-retail/source-083.txt'], 'Obtain exact SportFair operator identity and an actual official product/offering statement.'),
 'vincom-prototype-pangpang': ('Official mall profile identifies a dining tenant without concrete offerings; unrelated third-party crab-hotpot claims do not resolve exact frozen fast-food identity.', ['search-9.json', 'open-5.json'], 'Verify exact PangPang operator and offerings from an accessible primary source.'),
 'vincom-candidate-vd-b2-012': ('Catia independent searches resolve unrelated CATIA software and Katia marketplace identities, not the frozen mall tenant.', ['../vincom-retail-b/search-05.json', '../vincom-retail-b/target-01.json'], 'Establish exact tenant operator identity and first-party product evidence.'),
 'vincom-prototype-sehaaccessories': ('Official mall profile only classifies jewellery without concrete offerings; independent brand searches do not authenticate an exact operator.', ['../vincom-retail-a/source-text/detail-seha.json', '../vincom-retail-a/source-text/s18.json', '../vincom-retail-a/source-text/targeted-60.json'], 'Resolve the exact Seha Accessories operator and first-party offerings.'),
 'vincom-candidate-vd-x-070': ('Studio77 exact official-looking domain remains inaccessible; search results identify unrelated coffee/bedding businesses and cannot authenticate this tenant.', ['../vincom-retail-b/search-07.json', '../vincom-retail-b/target-04.json', '../vincom-retail-b/open-18.json'], 'Read authenticated Studio77 Vietnam tenant/operator product information.'),
 'vincom-prototype-dessertplanet': ('Current mall directory names Dessert Planet but does not establish specific offerings; foreign same-name dessert businesses are not evidence for this tenant.', ['search-9.json', 'search-10.json', 'open-5.json'], 'Find an authenticated tenant/operator offering statement linked to this exact mall identity.'),
 'vincom-prototype-meatmeet': ('Previous official sources contain conflicting corporate hotline values. Fresh rendered home/contact pages show company 02866500868, but selecting the Dong Khoi accordion reveals no branch-specific number or dated reconciliation of the conflicting corporate value.', ['queue.json', 'browser-held-followthrough.json', 'browser-held-detail.json', 'browser-held-final.json'], 'Resolve the competing corporate contacts or obtain an explicitly verified Dong Khoi branch number.'),
 'vincom-prototype-primaart': ('Official PRIMA locator identifies Dong Khoi floor M while frozen Prima Art identity is B1; no evidence establishes that these are the same counter. Jewellery warranty content does not resolve this identity/location conflict.', ['queue.json', '../vincom-retail-b/service-search-15.json'], 'Verify whether frozen Prima Art B1 and PRIMA floor M refer to the same tenant before attaching phone or hours.'),
}
menu = {
 'saigon-prototype-spicybox': ('https://danangthanhkhe.aeonmall-vietnam.com/en/da-nang-unique/gia-ve-spicy-box.html', 'Actual official AEON mall article lists named sauces, rice-cake varieties, side dishes and extras. This is a July2026 Da Nang reference menu, not a Saigon Centre branch menu; no prices or policy transplanted.', 'Thực đơn tham khảo do AEON MALL Đà Nẵng Thanh Khê đăng, cập nhật tháng 7/2026; không phải thực đơn riêng của Saigon Centre. Xác nhận món và giá tại chi nhánh.', 'Reference menu published by AEON MALL Da Nang Thanh Khe, updated July2026; not the Saigon Centre branch menu. Confirm local dishes and prices.'),
 'vincom-prototype-chillithai': ('https://vincom.com.vn/brand/chilli-thai', 'Correct-brand official Vincom profile embeds actual named Thai menu dishes, visually inspected salad-menu spread. Images are attributed by Vincom to Internet; date and current branch applicability are not established. Wrong ChillThai domain excluded.', 'Hình thực đơn tham khảo do Vincom đăng, ghi nguồn Internet; ngày cập nhật và áp dụng tại Đồng Khởi chưa xác định. Xác nhận món và giá với nhà hàng.', 'Reference menu images published by Vincom with Internet attribution; update date and Dong Khoi applicability are unconfirmed. Confirm dishes and prices with the restaurant.')
}
for r in queue:
    for name, prior in r['fields'].items():
        key = (r['destinationId'], name)
        if key in done:
            continue
        d = {'mallId': r['mallId'], 'destinationId': key[0], 'field': name, 'checkedAt': '2026-10-20'}
        if key[0] in menu:
            url, reason, vi, en = menu[key[0]]
            field = {'field':name,'state':'newly-sourced-proposal','sourceUrl':url,'url':url,'evidence':reason,'checkedAt':'2026-10-20','applicability':'brand-wide','verification':'source-checked','approval':'provisional','uncertainty':{'vi':vi,'en':en}}
            d.update(outcome='proposal', proposedField=field, reason=reason, sources=[{'url':url,'evidenceFile':'mall-menu-reference.json','result':'actual official mall page body retrieved in installed Chromium; visual image inspection separate'}], remainingAction=None)
            new_records.append({'mallId':r['mallId'],'destinationId':key[0],'fields':[field]})
        else:
            reason, files, action = specific.get(key[0], (prior.get('holdReason'), ['queue.json', 'search-1.json', 'search-2.json', 'open-1.json', 'open-2.json'], 'Reconcile the competing official branch values using an explicit dated correction or authoritative branch confirmation; do not silently select a source.'))
            assert reason, key
            d.update(outcome='hold', reason=reason, remainingAction=action, evidenceFiles=files, priorEvidence=prior, independentBrandResearchExhausted=False, limit='Exact conflict/access/identity hold; no claim that all sources everywhere were exhausted. Original source-check dates preserved in priorEvidence.')
        remaining.append(d)
decisions.extend(remaining)
records.extend(new_records)
expected={(r['destinationId'],f) for r in queue for f in r['fields']}
assert len(decisions)==43 and {(d['destinationId'],d['field']) for d in decisions}==expected
for name, data in [('chunk-final-decisions.json', {'checkedAt':'2026-10-20','decisions':remaining}), ('chunk-final-records.json', {'revision':'r3-mall-reference-menu-proposals-04','records':new_records}), ('decisions-complete.json', {'checkedAt':'2026-10-20','decisions':decisions}), ('records-complete.json', {'revision':'r3-held-lane-complete-proposals','records':records})]:
    (root/name).write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print({'queued':43,'proposals':sum(d['outcome']=='proposal' for d in decisions),'holds':sum(d['outcome']=='hold' for d in decisions),'remainingChunk':len(remaining)})
