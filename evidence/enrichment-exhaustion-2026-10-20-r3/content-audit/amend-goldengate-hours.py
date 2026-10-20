import json,pathlib,copy,hashlib
ROOT=pathlib.Path(__file__).resolve().parent;PACKET=ROOT.parent
def read(p):return json.loads(p.read_text(encoding='utf-8-sig'))
def write(p,x):p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
baseline=read(ROOT/'baseline-accepted.json');items=read(ROOT/'baseline-amendments.json')['records']
src=PACKET/'vincom-dining/browser-goldengate-hcm.json';browser=read(src);receipts=[]
for brand,identity,name in [('gogi','saigon-prototype-gogihouse','Gogi House Saigon Centre'),('manwah','saigon-prototype-manwahtaiwanesehotpot','Manwah Saigon Centre')]:
 row=next(x for x in browser if x['brand']==brand);text=row['bookingText'];start=text.index(name);end=text.index('Đặt bàn',start)
 receipt={'sourceUrl':row['bookingUrl'],'sourceCheckedAt':row['checkedAt'],'scope':'Independently read complete researcher browser receipt; independent web reader returns empty body, no independent browser session is available to this auditor.','branchText':text[start:end].strip(),'originalFullReceipt':str(src.relative_to(PACKET)),'originalFullReceiptSha256':hashlib.sha256(src.read_bytes()).hexdigest()};receipts.append(receipt)
 old=next(f for r in baseline['records']if r['destinationId']==identity for f in r['fields']if f['field']=='hours')
 proposed='09:00 - 22:00'if brand=='gogi'else'11:00 - 22:00'
 d={'mallId':'saigon-centre','destinationId':identity,'field':'hours','auditDecision':'hold','originalAcceptedField':copy.deepcopy(old),'reason':'Competing official branch schedules: original mall-page accepted hours '+old['value']['en']+' versus official brand HCM restaurant row '+proposed+'. Exact Saigon Centre address and phone match; retain conflict without selecting one schedule.','evidenceBindings':[{'sourceUrl':old['sourceUrl'],'method':'Exact field object retained from frozen658 baseline.'},{'sourceUrl':row['bookingUrl'],'file':'content-audit/goldengate-baseline-conflict-receipts.json','section':name,'sourceValue':proposed,'method':'Complete saved official browser branch row independently reviewed.'}],'remainingAction':'Obtain dated official reconciliation of Saigon Centre operating hours from the mall or restaurant before restoring a verified hours field.','reviewedAt':'2026-10-20','reviewedBy':'Codex independent content auditor (AI)','authorization':'Parent authorized explicit evidence-warranted baseline corrections outside original1315 queue; no silent replacement.'}
 items=[x for x in items if x['destinationId']!=identity]+[d]
write(ROOT/'goldengate-baseline-conflict-receipts.json',{'records':receipts});write(ROOT/'baseline-amendments.json',{'records':items})
print('Two additional baseline hours conflicts explicitly held; exact old field objects retained.')
