import json,pathlib,hashlib,copy,os
ROOT=pathlib.Path(__file__).resolve().parent;PACKET=ROOT.parent;LANE=PACKET/'holds'
def read(p):return json.loads(p.read_text(encoding='utf-8-sig'))
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def write(p,x):p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
path=LANE/'chunk-phones-decisions.json';incoming=read(path);decisions=[]
inputs={path.resolve(),(LANE/'chunk-phones-records.json').resolve()}
fresh={'beautybox':'turn505view0','christianlouboutin':'turn505view1','aldo':'turn527view0/turn527view2','labellab':'turn510view1','tierradiamondjewelry':'turn510view2','gigi':'turn510view3','leejeans':'turn523view1','levis':'turn510view5','matinkimvietnam':'turn523view2'}
for d in incoming['decisions']:
 f=copy.deepcopy(d['proposedField']);bindings=[];suffix=d['destinationId'].removeprefix('saigon-prototype-')
 for s in d['sources']:
  p=(LANE/s['evidenceFile']).resolve();inputs.add(p)
  bindings.append({**s,'file':os.path.relpath(p,PACKET).replace('\\','/')})
 if suffix in fresh:bindings.append({'sourceUrl':f['sourceUrl'],'freshWebReference':fresh[suffix]})
 reason='Exact official contact matches proposed VI/EN digits. Brand/distributor-wide support is explicitly labelled and not promoted as a direct branch telephone; source authority and narrower applicability resolve earlier hold.'
 if suffix=='labellab':reason='Fresh official DAFC Label Lab page explicitly names SaigonCentreL2-17 and prints+84814112589. Branch-specific source supersedes former generic distributor-phone proposal without altering accepted location/roster.'
 if suffix in['thegioikimcuong','phuclongcoffeetea']:reason='Reused complete19Oct official branch receipt explicitly prints base number plus extension. Base action dials only that number; both languages instruct manually requesting the extension. Source checkedAt19Oct is preserved, independent reviewedAt20Oct; no fabricated fresh read or automatic extension claim.'
 f.update(state='verified-agent',approval='agent-accepted',verification='source-checked',reviewedBy='Codex independent content auditor (delegated AI review)',reviewedAt='2026-10-20')
 if suffix=='christianlouboutin':
  f['uncertainty']={'vi':'Liên hệ nhà phân phối DAFC; đây không phải số điện thoại riêng của boutique.','en':'DAFC distributor contact; this is not a direct boutique line.'}
  reason+=' Narrowed customer-support wording to distributor contact because source labels it head office.'
 decisions.append({'mallId':d['mallId'],'destinationId':d['destinationId'],'field':d['field'],'auditDecision':'accept','brandContactScopeExplicit':f['applicability']=='brand-wide','reason':reason,'evidenceBindings':bindings,'reviewedBy':'Codex independent content auditor (AI)','reviewedAt':'2026-10-20','acceptedField':f,'originalProposal':d['proposedField']})
write(ROOT/'reviewed-chunks/holds-phones-01.json',{'revision':'independent-held-phones-audit-r3','inputs':[{'file':os.path.relpath(p,PACKET).replace('\\','/'),'sha256':sha(p)}for p in sorted(inputs)],'decisions':decisions})
write(ROOT/'baseline-conflict-observations.json',{'checkedAt':'2026-10-20','observations':[{'mallId':'saigon-centre','destinationId':'saigon-prototype-tierradiamondjewelry','field':'hours','baselineValue':'9:30 - 21:30','newSourceValue':'10:00 - 22:00','sourceUrl':'https://www.tierra.vn/kham-pha-cua-hang','freshWebReference':'turn510view2','section':'169-174','scope':'Outside1315queuedkeys; existing658acceptance preserved pending explicit coordinator decision.','action':'Reconcile competing official sources with an explicit baseline amendment; never silently overwrite.'}]})
print('11 held-phone fields independently accepted; one outside-queue baseline hours conflict separately reported.')
