"""Deterministic evidence accounting aid; factual exceptions are reviewer decisions, not tests."""
import json,pathlib,hashlib,re,collections,copy
ROOT=pathlib.Path(__file__).resolve().parent
PACKET=ROOT.parent
BASE=ROOT.parents[2]
def read(p): return json.loads(p.read_text(encoding='utf-8-sig'))
def write(name,x): (ROOT/name).write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
baseline=read(ROOT/'baseline-accepted.json')
baselinekeys={(r['mallId'],r['destinationId'],f['field']) for r in baseline['records'] for f in r['fields']}
roster={mall:{r['id']:r for r in read(BASE/f'data/malls/{mall}/directory.json')['destinations']} for mall in ['saigon-centre','vincom-dong-khoi']}
blocks=read(PACKET/'research-saigon/source-blocks.json')['reads']
byurl=collections.defaultdict(list)
for b in blocks:
 if b.get('complete'): byurl[b['url']].append(b)
norm=lambda s:re.sub(r'\D','',s or '')
vparts=[(f.name,s) for f in (PACKET/'research-vincom').glob('*.txt') for s in f.read_text(encoding='utf-8-sig').split('--------------------------------------------------------------------------------')]
holds={
 ('saigon-prototype-bastahiroitalianrestaurant','hours'):('Fresh official mall hours09:30–21:30 conflict with official brand Saigon Centre hours10:30–22:00, last order21:30. No authority silently selected.',['https://shopping.saigoncentre.com.vn/en/store-directory/basta-hiro','https://bastahiro.com.vn/en/location/?current=Vincom+Center+Dong+Khoi']),
 ('saigon-prototype-somtamthai','hours'):('Fresh official mall hours10:00–22:00 conflict with official brand Saigon Centre hours10:30–22:00, last order21:30.',['https://shopping.saigoncentre.com.vn/en/store-directory/som-%E0%B8%95%E0%B8%B3-thai','https://somtumthai.com.vn/en/location/?current=Vincom+Center+Dong+Khoi']),
 ('saigon-prototype-nespresso','hours'):('Mall daily09:30–21:30 omits brand locator Friday–Sunday09:30–22:00; source conflict remains explicit.',['https://shopping.saigoncentre.com.vn/en/store-directory/nespresso','https://nespresso.vn/vn/vi/store-locator']),
 ('vincom-prototype-chillithai','menu'):('Identity mismatch: proposed chillthai.vn presents ChillThai at Co Giang, Hong Ha and Phu My Hung; official Vincom names Chilli Thai with different branch contact. Frozen existing URL alone does not establish brand identity.',['https://www.chillthai.vn/','https://vincom.com.vn/brand/chilli-thai']),
}
decisions=[]; accepted=[]; rejected=[]; issues=[]; inputs={}
for mall,folder in [('saigon-centre','research-saigon'),('vincom-dong-khoi','research-vincom')]:
 path=PACKET/folder/'enrichment-records.json'; inputs[str(path.relative_to(PACKET))]=sha(path)
 incoming=read(path)
 write(folder+'-input.json',incoming)
 for r in incoming['records']:
  out={**r,'fields':[]}
  if r['mallId']!=mall or r['destinationId'] not in roster[mall]: raise ValueError('identity mismatch')
  for f in r['fields']:
   identity=r['destinationId']; field=f['field']; key=(mall,identity,field)
   if key in baselinekeys: raise ValueError('baseline overlap '+str(key))
   binding=[]; outcome='accept'; reason='Official source identity, field role and scope supported; bilingual caveats preserve stated uncertainty.'
   if mall=='saigon-centre' and field in ['website','phone','hours']:
    candidates=byurl[f['sourceUrl']]
    if not candidates: raise ValueError('missing complete source '+str(key))
    if field=='phone' and not any(norm(f['value']['en']) in norm(b.get('phone')) for b in candidates): raise ValueError('phone mismatch '+identity)
    if field=='hours' and not any(norm(f['value']['en'])==norm(b.get('hours')) for b in candidates): raise ValueError('hour mismatch '+identity)
    binding=[{'file':'research-saigon/source-blocks.json','sourceUrl':f['sourceUrl'],'sourceName':b['name'],'reference':b.get('ref'),'complete':True} for b in candidates]
   elif mall=='vincom-dong-khoi':
    urls=[f['sourceUrl']]+([f['url']] if f.get('url') else [])
    matched=[(name,s) for name,s in vparts if any(('('+u+')') in s or ('"ref_id":"'+u+'"') in s for u in urls) and not s.strip().startswith('Internal Error')]
    if not matched: raise ValueError('missing Vincom evidence '+str(key))
    binding=[{'file':'research-vincom/'+name,'sourceUrl':f['sourceUrl'],'title':s.strip().splitlines()[0]} for name,s in sorted(matched,key=lambda t:len(t[1]),reverse=True)[:1]]
   else:
    binding=[{'sourceUrl':f['sourceUrl'],'method':'Independent fresh official menu/catalogue or services read; see fresh-read-ledger.json.'}]
   revised=copy.deepcopy(f)
   if field=='phone' and norm(f['value']['en']).startswith(('1800','1900')):
    outcome='hold'; reason='General service/hotline number in mall Phone block; dedicated branch applicability not established. Withheld under coordinator scope; do not expose as branch telephone.'
   elif (identity,field) in holds:
    outcome='hold';reason,urls=holds[(identity,field)];binding.extend({'sourceUrl':u,'method':'Independent fresh official read'} for u in urls)
   elif identity=='vincom-prototype-watsons' and field=='phone':
    outcome='accept-corrected';reason='Official source prints malformed country/trunk form+84-0971088853. Normalize domestic number0971088853, preserving exact source form in evidence; both languages identical.'
    revised['value']={'vi':'0971088853','en':'0971088853'}
    revised['evidence']+=' Independent audit: source country/trunk prefix normalized to domestic0971088853 for dialing; exact original form remains recorded above.'
   elif mall=='vincom-dong-khoi' and field=='hours' and identity in ['vincom-prototype-bastahiro','vincom-prototype-somthai']:
    outcome='accept-corrected';reason='Branch values supported; repaired missing English space in last order at21:30.'
    revised['value']['en']=revised['value']['en'].replace('at21:30','at 21:30')
   if f.get('value'):
    if not all(f['value'].get(lang,'').strip() for lang in ['vi','en']): raise ValueError('empty translation')
    if field=='phone' and f['value']['vi']!=f['value']['en']: raise ValueError('phone language mismatch')
   if f['applicability']=='branch' and f.get('branchMallId')!=mall: raise ValueError('branch scope')
   if f['applicability']=='brand-wide' and f.get('branchMallId'): raise ValueError('brand branch leak')
   if not all(f['uncertainty'].get(lang,'').strip() for lang in ['vi','en']): raise ValueError('uncertainty missing')
   decision={'mallId':mall,'destinationId':identity,'field':field,'decision':outcome,'reason':reason,'sourceBindings':binding,'original':f}
   if outcome!='hold':
    revised['reviewedBy']='Codex independent content auditor (delegated AI review)'
    revised['reviewedAt']='2026-10-19'
    if outcome=='accept-corrected': decision['accepted']=revised
    out['fields'].append(revised)
   else:
    rejected.append({'mallId':mall,'destinationId':identity,'field':field,'sourceUrl':f['sourceUrl'],'reason':reason,'state':'evidence-conflict-hold'})
   decisions.append(decision)
  if out['fields']: accepted.append(out)
counts=collections.Counter(d['decision'] for d in decisions)
summary={'inputFields':len(decisions),'acceptedNewFields':counts['accept']+counts['accept-corrected'],'acceptedUnchanged':counts['accept'],'acceptedCorrected':counts['accept-corrected'],'heldFields':counts['hold'],'baselineFieldsPreserved':len(baselinekeys),'combinedAcceptedFields':len(baselinekeys)+counts['accept']+counts['accept-corrected'],'byMall':{m:{'inputFields':sum(d['mallId']==m for d in decisions),'acceptedNewFields':sum(d['mallId']==m and d['decision']!='hold' for d in decisions),'heldFields':sum(d['mallId']==m and d['decision']=='hold' for d in decisions)} for m in roster},'inputHashes':inputs,'baselineSha256':sha(ROOT/'baseline-accepted.json')}
write('audited-incremental-records.json',{'revision':'independent-content-audit-2026-10-19-r2-core','records':accepted})
write('decisions.json',{'revision':'independent-content-audit-2026-10-19-r2-core','checkedAt':'2026-10-19','reviewer':'Codex independent content auditor (AI)','summary':summary,'decisions':decisions})
write('held-fields.json',rejected)
write('summary.json',summary)
print(json.dumps(summary,indent=2))
