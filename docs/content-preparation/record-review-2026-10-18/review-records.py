"""Reproduce geometric and source-evidence proposals, never owner approvals.

Requires the locally available numpy, OpenCV and shapely packages. All generated
geometry is private review geometry; application inputs are read-only.
"""
from pathlib import Path
import csv
import hashlib
import html
import json
import re
import cv2
import numpy as np
from shapely.affinity import affine_transform
from shapely.geometry import Polygon, mapping
from shapely.ops import unary_union

HERE = Path(__file__).resolve().parent
APP = HERE.parents[2]
ROOT = APP.parents[1]
PACKET = HERE.parent / 'completion-packet-2026-10-17'
COVERAGE = ROOT / 'docs/evidence/unit-hover-coverage-2026-10-17'
OBSERVATION = json.loads((HERE / 'media-observations.json').read_text(encoding='utf-8'))
REVIEWER = OBSERVATION['reviewedBy']
# Reproduction preserves the date of the recorded review, not the execution date.
DATE = OBSERVATION['reviewedAt']


def read(path):
    return json.loads(path.read_text(encoding='utf-8'))


def save(name, value):
    (HERE / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


def polygon(region):
    # Repair for measurement only. Original vertices are retained in source files.
    return Polygon(region['outer'], region.get('holes', [])).buffer(0)


def overlap(a, b):
    return a.intersection(b).area / a.union(b).area if a.union(b).area else 0


def normalize(code):
    return re.sub('[^A-Z0-9]', '', code.upper())


def extract_vincom_sources(records):
    result = []
    for record in records.values():
        if record['mall'] != 'vincom-dong-khoi':
            continue
        sources = []
        for official in record['official']:
            slug = official['url'].split('/store/')[-1].split('?')[0]
            path = PACKET / 'vincom-research/store-pages' / (slug + '.html')
            if not path.exists():
                continue
            text = re.sub(r'<(script|style)\b[^>]*>.*?</\1>', '', path.read_text(encoding='utf-8'), flags=re.S)
            text = re.sub(r'\s+', ' ', html.unescape(re.sub('<[^>]*>', ' ', text)))
            # A source lacking the content delimiter is not a usable brand description.
            text = text.split('Thu gọn')[-1].split('BẮT KỊP MỌI XU HƯỚNG')[0].split('Đang diễn ra')[0].strip() if 'Thu gọn' in text else ''
            sources.append({'path': path.relative_to(PACKET / 'vincom-research').as_posix(), 'text': text})
        result.append({'id': record['id'], 'name': record['name'], 'sources': sources})
    save('vincom-source-extracts.json', result)


def base(record, floor=None):
    return {'id': record['id'], 'mall': record['mall'], 'name': record['name'],
            **({'floor': floor} if floor else {}), 'reviewedBy': REVIEWER, 'reviewedAt': DATE,
            'ownerApproval': False, 'ownerApprovedAt': None}


def source_paths(record):
    return [f'../completion-packet-2026-10-17/roster.json#records[id={record["id"]}]'] + [x['url'] for x in record['official']]


def register(records, target, source, previous):
    registrations = {}
    for floor in target['floors']:
        fid = floor['id']
        sf = next(f for f in source['floors'] if f['id'] == fid)
        sm = {r['id']: polygon(r) for r in sf['regions']}
        tm = {r['id']: polygon(r) for r in floor['regions']}
        pairs = []
        for old in previous:
            record = records.get(old['id'])
            if not record:
                continue
            sl = [x['region'] for x in record['locations'].get(fid, []) if x['region'] in sm]
            tl = [x['region'] for x in old['locations'].get(fid, []) if x['region'] in tm]
            if sl and tl:
                a, b = unary_union([sm[x] for x in sl]), unary_union([tm[x] for x in tl])
                pairs.append((record['id'], a, b, sl, tl))
        pairs.sort(key=lambda x: x[0])
        if len(pairs) < 6:
            registrations[fid] = {'status': 'insufficient-named-anchors', 'anchorCount': len(pairs)}
            continue
        a = np.array([[x.centroid.x, x.centroid.y] for _, x, _, _, _ in pairs])
        b = np.array([[y.centroid.x, y.centroid.y] for _, _, y, _, _ in pairs])
        held = np.array([i % 4 == 0 for i in range(len(pairs))])
        cv2.setRNGSeed(20261018)
        matrix, mask = cv2.estimateAffine2D(a[~held], b[~held], method=cv2.RANSAC,
                                         ransacReprojThreshold=1, maxIters=5000, confidence=.999)
        assert matrix is not None
        aff = [float(matrix[0, 0]), float(matrix[0, 1]), float(matrix[1, 0]), float(matrix[1, 1]),
               float(matrix[0, 2]), float(matrix[1, 2])]
        errors = np.linalg.norm(a @ matrix[:, :2].T + matrix[:, 2] - b, axis=1)
        anchors = []
        for i, (rid, sp, tp, sl, tl) in enumerate(pairs):
            anchors.append({'id': rid, 'name': records[rid]['name'], 'sourceRegions': sl, 'targetRegions': tl,
                            'heldOut': bool(held[i]), 'centroidResidual': round(float(errors[i]), 6),
                            'intersectionOverUnion': round(overlap(affine_transform(sp, aff), tp), 6),
                            'source': f'../../../data/research/saigon-centre.json#records[id={rid}]'})
        # Holdouts may expose inaccurate inherited associations; report every one.
        held_errors = errors[held]
        stable = int(mask.sum()) >= 5 and float(np.median(held_errors)) < .6
        registrations[fid] = {'status': 'candidate-affine-registration' if stable else 'registration-needs-more-evidence',
                              'matrix': matrix.tolist(), 'shapelyAffine': aff, 'units': 'website schematic units; not metres',
                              'trainingInliers': int(mask.sum()), 'trainingCount': int((~held).sum()),
                              'heldOutCount': int(held.sum()), 'heldOutMedianResidual': float(np.median(held_errors)),
                              'heldOutMaxResidual': float(max(held_errors)), 'anchors': anchors,
                              'sourceRevision': source['revision'], 'targetRevision': target['revision'],
                              'sourceFrame': source['frame']['version'], 'targetFrame': target['frame']['version'],
                              'ownerApproval': False, 'reviewedBy': REVIEWER, 'reviewedAt': DATE}
    return registrations


def mapping_review(records, registrations, target, source, gaps, vincom):
    anchors = list(csv.DictReader((COVERAGE / 'vincom-anchor-results.csv').open(encoding='utf-8-sig')))
    vincom_by_id = {r['previewId']: r for r in vincom['records']}
    rows, features = [], []
    polygon_index = {}
    for candidate in records.values():
        if candidate['mall'] != 'saigon-centre':
            continue
        for fid, links in candidate['locations'].items():
            sf = next(f for f in source['floors'] if f['id'] == fid)
            ids = {x['region'] for x in links}
            polygons = [polygon(x) for x in sf['regions'] if x['id'] in ids]
            if polygons:
                polygon_index[(candidate['id'], fid)] = unary_union(polygons)
    for gap in gaps:
        record = records[gap['previewId']]
        floor = gap['floor']
        row = {**base(record, floor), 'originalGapState': gap['newState'], 'sources': source_paths(record),
               'ownerUnitClaims': record['ownerUnits'].get(floor, []), 'sourceConflicts': record['issues']}
        if gap['newState'] == 'official-source-polygon':
            reg = registrations[floor]
            sf = next(f for f in source['floors'] if f['id'] == floor)
            tf = next(f for f in target['floors'] if f['id'] == floor)
            ids = [x['region'] for x in record['locations'][floor]]
            sp = unary_union([polygon(x) for x in sf['regions'] if x['id'] in ids])
            transformed = affine_transform(sp, reg['shapelyAffine'])
            ranked = sorted([{'region': x['id'], 'iou': overlap(transformed, polygon(x)),
                              'sourceCoverage': transformed.intersection(polygon(x)).area / transformed.area}
                             for x in tf['regions']], key=lambda x: x['iou'], reverse=True)[:3]
            best = ranked[0]
            proposed = 'review-20261018-' + ids[0]
            good_boundary = best['iou'] >= .7 and best['sourceCoverage'] >= .8
            reg_supported = reg['status'] == 'candidate-affine-registration'
            conflict = record['name'] in ('Irvins', 'llaollao', 'Label Lab', 'Moschino')
            overlaps = [{'id': rid, 'fractionOfThisSourceArea': round(sp.intersection(other).area / sp.area, 6)}
                        for (rid, fid), other in polygon_index.items()
                        if fid == floor and rid != record['id'] and sp.intersection(other).area / sp.area > .05]
            visual_number = len(features) + 1
            row.update(proposedDecision='review-registered-source-polygon' if reg_supported else 'hold-registration',
                       proposedRegion=proposed, proposedExistingRegion=best['region'] if good_boundary else None,
                       sourceRegionIds=ids, targetRegionComparisons=ranked,
                       registrationEvidence=f'registration.json#{floor}',
                       confidence={'sourceIdentity': 'high (official UUID/name/floor-linked polygon)',
                                   'registration': 'medium (named-anchor fit; held-out measurements supplied)' if reg_supported else 'low',
                                   'existingBoundary': 'medium' if good_boundary else 'low; no exclusive raster contour established',
                                   'currentOccupancy': 'unverified'},
                       sourcePolygonOverlaps=overlaps,
                       visualReview={'path': f'registration-crops-{(visual_number-1)//14+1}.jpg',
                                     'cell': visual_number,
                                     'finding': 'Registered outline visually compared with the named raster location; this is schematic correspondence, not current occupancy or survey precision'},
                       readyForOwnerDecision=reg_supported and not conflict,
                       missingEvidence=(['Resolve duplicate printed unit claim against distinct official UUID polygons'] if conflict else [])
                           + ([] if good_boundary else ['A new candidate geometry region would be required; existing captured contour is fragmented, merged, or absent'])
                           + (['Owner decision on overlapping parent/shared-area geometry; do not treat nested polygons as separate storefronts'] if overlaps else [])
                           + ['Owner mapping approval; current occupancy is not established by geometric registration'])
            row['sources'] += ['../completion-packet-2026-10-17/saigon-source-map.json',
                               '../../../data/malls/saigon-centre/floor-geometry.json',
                               'registration.json', 'source-evidence/regions.csv']
            features.append({'type': 'Feature', 'properties': {'id': proposed, 'recordId': record['id'],
                             'floor': floor, 'ownerApproval': False, 'targetFrame': reg['targetFrame']},
                             'geometry': mapping(transformed)})
        else:
            row.update(proposedDecision='retain-floor-list-access-without-precise-marker', proposedRegion=None,
                       readyForOwnerDecision=False,
                       confidence={'preciseMapping': 'unsupported', 'currentOccupancy': 'unverified'})
            missing = []
            if record['mall'] == 'vincom-dong-khoi':
                finding = vincom_by_id.get(record['id'], {})
                claims = finding.get('unitEvidence', [])
                row['firstPartyUnitEvidence'] = claims
                row['sources'] += [x['sourceUrl'] for x in claims]
                codes = [code for code in row['ownerUnitClaims'] + [x['unitClaim'] for x in claims]
                         if not re.search(r'unknown|pending|cleared|removed', code, re.I)]
                matched = [a for a in anchors if a['floor'] == floor and any(normalize(a['source_label']) == normalize(c) for c in codes)]
                row['sourceLabelAnchors'] = matched
                if not codes:
                    missing.append(f'Current branch-specific unit/area on {floor}; available owner/official evidence supplies no unit code')
                elif not matched:
                    missing.append(f'Locate the evidenced full code(s) {codes} on the saved {floor} source image or obtain a newer labeled floor plan')
                else:
                    for anchor in matched:
                        siblings = [a['source_label'] for a in anchors if a['floor'] == floor and a['primary_region']
                                    and a['primary_region'] == anchor['primary_region']]
                        if not anchor['primary_region']:
                            missing.append(f'{anchor["source_label"]} label anchor has no captured contour; trace the supported source boundary')
                        elif len(set(siblings)) > 1:
                            missing.append(f'{anchor["source_label"]} anchor lies in {anchor["primary_region"]}, also containing {siblings}; source-supported unit partition is missing')
                        else:
                            missing.append(f'{anchor["source_label"]} has a candidate contour {anchor["primary_region"]}; inspect complete boundary and current branch correspondence before proposing a precise region')
                if finding.get('conflicts'):
                    missing += [x if isinstance(x, str) else 'Source conflict: ' + json.dumps(x, ensure_ascii=False)
                                for x in finding['conflicts']]
                if any(any(t in c.get('status', '') for t in ('historical', '403', 'search-index', 'promotion')) for c in claims):
                    missing.append('Direct/current accessible first-party confirmation of historical or access-limited unit claim')
                row['sources'] += ['source-evidence/vincom-anchor-results.csv',
                                   '../completion-packet-2026-10-17/vincom-research/discoveries.json']
            elif record['name'] == 'Takashimaya':
                missing += [f'Official unified Takashimaya department-store footprint on {floor}; store mapData is null',
                            'Counter polygons do not establish the complete department-store boundary; do not union counters into an invented footprint']
                row['sources'] += ['../completion-packet-2026-10-17/saigon-research/official-storeInfoTaka-en.json',
                                   'https://shopping.saigoncentre.com.vn/en/store-directory/takashimaya']
            else:
                missing += ['Official Matin Kim store polygon (mapData is null)',
                            'Resolve Matin Kim/Miana competing L3-12 claims and source-reported Opening Soon before occupancy or precise mapping']
            row['missingEvidence'] = missing
        rows.append(row)
    return rows, features


def content_review(records):
    findings = read(HERE / 'copy-findings.json')
    assert all(rid in records for rid in findings), set(findings) - records.keys()
    samples = {r['id']: r for r in read(HERE / 'media-sample.json')}
    observations = read(HERE / 'media-observations.json')
    official = {r['officialId']: r for r in read(PACKET / 'saigon-research/discoveries.json')['currentOfficialMallRoster']}
    vincom = {r['id']: r for r in read(HERE / 'vincom-source-extracts.json')}
    follow_up = read(HERE / 'follow-up-sources.json')
    result = []
    for record in records.values():
        rid = record['id']
        row = {**base(record), 'sources': source_paths(record), 'floors': record['floors'], 'copy': {}}
        row['freshFollowUp'] = [f for f in follow_up if f['url'] in row['sources']]
        firstparty = next((official[x['id']] for x in record['official'] if x['id'] in official), None)
        text_available = bool(firstparty and any(firstparty['descriptionEvidence'].values()))
        if record['mall'] == 'vincom-dong-khoi':
            extracts = vincom[rid]['sources']
            text_available = any(x['text'] for x in extracts)
            row['copySourcePaths'] = ['../completion-packet-2026-10-17/vincom-research/' + x['path'] for x in extracts]
        else:
            row['copySourcePaths'] = ['../completion-packet-2026-10-17/saigon-research/discoveries.json#currentOfficialMallRoster']
        finding = findings.get(rid)
        temporal = bool(re.search(r'sắp mở|sắp khai trương|mới nhất|giá hợp lý|giá tốt|mỗi ngày|chính hãng|hiệu quả|thuần chay|an toàn', record['description'], re.I))
        named_product = bool(re.search(r'501|Supersonic|Airwrap|Advanced |Génifique|Ultimune|Orgasm|Radiant Creamy|Ruby Woo|Studio Fix|Ultra Facial|Water Bank|Water Sleeping|Rouge G|Abeille Royale|Superstar|Stan Smith|Jibbitz|First Care|băng chuyền|vàng miếng', record['description'], re.I))
        for locale, field in [('vi', 'description'), ('en', 'descriptionEn')]:
            draft = record.get(field, '')
            if finding:
                decision = finding['decision']
                note = finding['note']
                proposed = finding.get(locale)
                ready = not finding.get('needsEvidence', False)
            elif record['copyState'] == 'bilingual-source-listing-placeholder':
                decision, note, proposed, ready = 'request-evidenced-introduction-or-approve-empty', 'Only a listing placeholder is supplied; official introduction is empty.', None, False
            elif not text_available:
                decision, note, proposed, ready = 'request-product-service-evidence-or-approve-empty', 'Owner draft exists, but no usable matched first-party descriptive text was found in the saved packet. A listing/floor claim alone does not support the introduction.', None, False
            elif temporal or named_product:
                decision, note, proposed, ready = 'verify-or-neutralize-specific-claims', 'Brand/source context exists, but time-sensitive status, price/quality claims, specific product inventory or service mechanisms need branch-specific support or a neutral rewrite.', None, False
            else:
                decision, note, proposed, ready = 'submit-broad-summary-for-owner-language-review', 'Broad product/service meaning compared with matched first-party descriptive context; no specific contradiction identified. This is not verification of every item in current branch inventory.', draft, True
            row['copy'][locale] = {'proposedDecision': decision, 'draftText': draft, 'proposedText': proposed,
                                   'finding': note, 'readyForOwnerDecision': ready, 'ownerApproval': False,
                                   'languageReview': 'AI evidence/fidelity review; independent owner/editorial language approval pending'}
        row['copySourceEvidenceAvailable'] = text_available
        row['media'] = {'candidateCount': len(record['photos']), 'ownerApproval': False,
                        'rights': 'not established', 'freshness': 'not established',
                        'unreviewedCandidateCount': max(0, len(record['photos']) - int(rid in samples and samples[rid]['result'] == 'downloaded-for-visual-review'))}
        if rid not in samples:
            row['media'].update(proposedDecision='request-branch-photo-or-explicitly-approve-no-photo',
                                finding='No candidate media in packet.', readyForOwnerNoPhotoDecision=True)
        else:
            sample = samples[rid]
            cell = sample['cell']
            available = sample['result'] == 'downloaded-for-visual-review'
            if not available:
                kind = 'unavailable'
            elif cell in observations['logoCells']:
                kind = 'logo-or-brand-graphic'
            elif cell in (194, 197):
                kind = 'brand-person-portrait'
            elif cell in observations['storeOrInteriorCells']:
                kind = 'store-signage-or-interior'
            elif cell in observations['compositeWithStoreCells']:
                kind = 'mixed-promotional-composite-with-store'
            elif cell == 162:
                kind = 'different-mall-exterior'
            elif cell == 178:
                kind = 'street-store-with-unverified-branch'
            else:
                kind = 'product-model-or-promotional-image'
            specific = observations['specificFindings'].get(str(cell))
            row['media'].update(sample=sample, visuallyReviewed=available, observedKind=kind,
                                finding=specific or ('Source associates the image with this store page; no readable branch identifier proves its physical location.' if available else sample.get('error')),
                                proposedDecision='reject-representative-as-storefront' if kind in ('logo-or-brand-graphic', 'brand-person-portrait', 'different-mall-exterior', 'product-model-or-promotional-image') else 'hold-for-branch-freshness-and-rights-evidence',
                                branchConfidence='medium; readable branch caption' if cell == 166 else 'contextual-only; not physically verified',
                                readyForOwnerPhotoApproval=False)
        result.append(row)
    return result


def export_decision_queue(rows, content):
    lines = ['# Per-record mapping findings — 18 October 2026', '',
             f'Proposals reviewed by {REVIEWER}, actual review date {DATE}. All ownerApproval values remain false. Full evidence and confidence are in mapping-ledger.json.', '',
             '| Record / store | Mall / floor | Proposed region or disposition | Evidence / remaining requirement |',
             '| --- | --- | --- | --- |']
    for row in rows:
        source = next((p for p in row['sources'] if p.startswith('https://')), row['sources'][0])
        requirement = '; '.join(row['missingEvidence']).replace('|', '/')
        proposed = row['proposedRegion'] or 'No precise marker; retain floor/list'
        lines.append(f'| `{row["id"]}` / {row["name"]} | {row["mall"]} / {row["floor"]} | {proposed} | [Source]({source}) — {requirement} |')
    (HERE / 'mapping-findings.md').write_text('\n'.join(lines) + '\n', encoding='utf-8')
    save('owner-decision-queue.json', {
        'reviewedBy': REVIEWER, 'reviewedAt': DATE, 'ownerApproval': False,
        'mappingProposalsForVisualReview': [{k: r[k] for k in ('id', 'mall', 'floor', 'proposedRegion', 'sources', 'ownerApproval')}
                                          for r in rows if r['readyForOwnerDecision']],
        'languageProposalsForSeparateDecisions': [
            {'id': r['id'], 'mall': r['mall'], 'languages': r['copy'],
             'sources': r['sources'] + r['copySourcePaths'], 'ownerApproval': False}
            for r in content if all(x['readyForOwnerDecision'] for x in r['copy'].values())],
        'noPhotoDecisionCandidates': [r['id'] for r in content if not r['media']['candidateCount']]})


def main():
    for entry in read(HERE / 'input-integrity.json')['files']:
        assert hashlib.sha256((ROOT / entry['path']).read_bytes()).hexdigest() == entry['sha256'], entry['path']
    (HERE / 'source-evidence').mkdir(exist_ok=True)
    for name in ('regions.csv', 'vincom-anchor-results.csv'):
        (HERE / 'source-evidence' / name).write_bytes((COVERAGE / name).read_bytes())
    records = {r['id']: r for r in read(PACKET / 'roster.json')['records']}
    source = read(PACKET / 'saigon-source-map.json')
    target = read(APP / 'data/malls/saigon-centre/floor-geometry.json')
    previous = read(APP / 'data/research/saigon-centre.json')['records']
    registrations = register(records, target, source, previous)
    save('registration.json', registrations)
    rows, features = mapping_review(records, registrations, target, source,
                                   read(PACKET / 'original-170-gap-decisions.json'),
                                   read(PACKET / 'vincom-research/discoveries.json'))
    save('mapping-ledger.json', rows)
    save('registered-proposals.geojson', {'type': 'FeatureCollection', 'features': features})
    extract_vincom_sources(records)
    content = content_review(records)
    save('content-ledger.json', content)
    export_decision_queue(rows, content)
    save('summary.json', {'revision': 'record-review-2026-10-18-r1', 'reviewedBy': REVIEWER, 'reviewedAt': DATE,
                         'ownerApproval': False, 'originalMappingRows': len(rows),
                         'sourcePolygonProposals': len(features),
                         'existingRegionReuseCandidates': sum(bool(r.get('proposedExistingRegion')) for r in rows),
                         'mappingProposalsReadyForOwnerReview': sum(r['readyForOwnerDecision'] for r in rows),
                         'remainingOriginalGaps': sum(r['originalGapState'] == 'precise-location-pending' for r in rows),
                         'contentIdentitiesReviewed': len(content), 'specificCopyFindings': len(read(HERE / 'copy-findings.json')),
                         'copyIdentityReadyForOwnerLanguageDecision': sum(all(x['readyForOwnerDecision'] for x in r['copy'].values()) for r in content),
                         'copyIdentityNeedsEvidenceOrRewrite': sum(not all(x['readyForOwnerDecision'] for x in r['copy'].values()) for r in content),
                         'mediaRepresentatives': len(read(HERE / 'media-sample.json')),
                         'mediaImagesVisuallyReviewed': sum(r['media'].get('visuallyReviewed', False) for r in content),
                         'mediaWithoutCandidates': sum(not r['media']['candidateCount'] for r in content),
                         'mediaRemainingUnreviewedCandidates': sum(r['media']['unreviewedCandidateCount'] for r in content),
                         'scope': 'Evidence proposals only; neither tool checks nor AI review constitute owner content acceptance.'})
    print(json.dumps({'mappingRows': len(rows), 'registeredProposals': len(features),
                      'ownerDecisionReadyMappings': sum(x['readyForOwnerDecision'] for x in rows),
                      'floorFits': {f: {k: v for k, v in r.items() if k not in ('anchors', 'matrix', 'shapelyAffine')}
                                    for f, r in registrations.items()}}, ensure_ascii=True))


if __name__ == '__main__':
    main()
