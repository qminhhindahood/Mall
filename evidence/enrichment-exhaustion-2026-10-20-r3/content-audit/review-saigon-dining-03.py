import json,pathlib,copy,hashlib,re,collections
ROOT=pathlib.Path(__file__).resolve().parent;PACKET=ROOT.parent;LANE=PACKET/'saigon-dining'
def read(p):return json.loads(p.read_text(encoding='utf-8-sig'))
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def write(p,x):p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
proposal=LANE/'chunk-03-proposals.json';support=LANE/'supporting-evidence.json'
incoming=read(proposal);evidence={(d['destinationId'],d['field']):d for d in read(support)['fields']}
fresh={
'annamcafe':'turn401view0','breadtalk':'turn401view1','genkisushi':'turn401view2','the350f':'turn401view4','spicybox':'turn401view5','somtamthai':'turn660view0','oedoalley':'turn660view1',
'poulet':'turn730view0','miyamamoderntokyorestaurantcafe':'turn730view1','gyushigeyakiniku':'turn730view2','mochisweets':'turn730view3','boatnoodle':'turn730view5'}
freshurls={
'https://bastahiro.com.vn/en/reservation/':'turn624view0','https://asanoha.com.vn/en/reservation/':'turn624view1','https://oedoalley.com.vn/en/reservation/':'turn624view2','https://somtumthai.com.vn/en/reservation/':'turn624view3','https://gyushige.com.vn/en/reservation/':'turn624view4','https://jindinrou.com.vn/en/reservation/':'turn624view5',
'https://lusinespace.com/menu/':'turn631view0','https://shop.annam-gourmet.com/hcm-taka/lounge-menu':'turn626view1/turn654view1','https://www.chateraise.co.jp/ec/default.aspx':'turn654view0 actual products332-400','https://eatirvins.com/':'turn626view3 actual salted-egg products',
'https://trungnguyenecoffee.com/san-pham/':'turn626view4/turn631view4 packaged coffee and brewing tools','https://coffee.phuclong.com.vn/':'turn631view1 actual drink descriptions22-62','https://caferunam.com/vi/':'turn631view2/turn660view3',
'https://www.paul.fr/dejeuner/sandwichs':'turn719view0 actual sandwich product cards','https://wako-group.co.jp/menu/':'turn719view1 actual cutlet meals43-143','https://tokyo-sundubu.net/menu/':'turn720view1 actual sundubu dishes68-112','https://sushihokkaidosachi.com.vn/en/reservation/':'turn720view2 actual Saigon selector and party/date inputs',
'https://lachcalachcach.com.vn/dat-ban':'turn720view3 explicit Golden Gate portal link28','https://datban.ggg.com.vn/':'turn720view0 real reservation chooser; known exact r2role',
'https://help.highlandscoffee.com.vn/hc/vi/articles/15863940086031-D%C3%B9ng-T%E1%BA%A1i-Ch%E1%BB%97-Mang-%C4%90i-V%C3%A0-Giao-H%C3%A0ng':'turn720view4 actual service formats and store variability20-26'}
decisions=[];corrections=[]
for r in incoming['records']:
 for original in r['fields']:
  d=evidence[(r['destinationId'],original['field'])]
  assert d['sourceUrl']==original['sourceUrl']and d['proposedBilingualValue']==original.get('value')and d['proposedAction']==original.get('url')
  f=copy.deepcopy(original);suffix=r['destinationId'].removeprefix('saigon-prototype-');changes=[]
  if f.get('value'):
   old=f['value']['en']
   for word in ['thai','japanese','vietnamese','hokkaido','korean','tokyo','cantonese','taiwanese','french']:
    f['value']['en']=re.sub(r'\b'+word+r'\b',word.capitalize(),f['value']['en'])
   if suffix=='oedoalley':f['value']['en']='The brand presents a Japanese food village with multiple restaurant concepts.'
   if old!=f['value']['en']:changes.append('Corrected English proper-name capitalization/grammar without changing supported meaning.')
  if suffix=='runamboutique'and f['field']=='services':
   f['sourceUrl']='https://caferunam.com/vi/san-pham/ca-phe';f['value']={'vi':'RuNam giới thiệu cà phê bột và cà phê hạt mang thương hiệu RuNam.','en':'RuNam presents its own ground and whole-bean coffee products.'};f['evidence']='Official RuNam coffee collection displays actual ground-coffee and whole-bean products. Brand-wide range only; no local stock or complete dining-menu claim.';changes.append('Replaced vague café-experience wording with actual ground/whole-bean product offering, independently verified on linked official coffee collection.')
  bindings=[{'file':'saigon-dining/supporting-evidence.json','evidenceId':d['evidenceId'],'sourceUrl':d['sourceUrl'],'reference':d['reference'],'section':d['section'],'supportingExtract':d['sourceText'],'observation':d['observedFact']}]
  if original['sourceUrl']in freshurls:bindings.append({'sourceUrl':original['sourceUrl'],'freshWebReference':freshurls[original['sourceUrl']]})
  elif suffix in fresh:bindings.append({'sourceUrl':original['sourceUrl'],'freshWebReference':fresh[suffix]})
  if suffix=='runamboutique'and f['field']=='services':bindings.append({'sourceUrl':f['sourceUrl'],'freshWebReference':'turn660view3 actual ground/whole-bean products50-138'})
  if suffix=='llaollao':bindings.append({'sourceUrl':original['sourceUrl'],'freshWebReference':'turn730view4','result':'Independent fresh attempt temporarily inaccessible; retained complete worker20Oct profile receipt and existing r2mall-source authority, not claimed successful independent refetch.'})
  reason='Exact frozen destination and official authority checked against field-bound full-profile or actual product/form evidence. Specific product offerings qualify under runtime Products/services; no stock, prices, undocumented facilities or service policies inferred. Brand-wide scope and bilingual caveats retained.'
  if f['field']=='cuisine':reason+=' Sourced food/drink style label; central cuisine runtime extension required, directory text not overwritten.'
  if f['field']=='booking':reason+=' Real reservation request action verified; no submission or confirmation guarantee. Shared Golden Gate/LUsine routes retain brand-wide scope.'
  if f['field']=='menu':reason+=' Actual food/drink product content or menu images verified; international-market and limited-range caveats retained where applicable.'
  if suffix=='highlandscoffee'and f['field']=='services':bindings[0]['section']='Official help article service formats20-26; worker section label incorrectly says reservation form, corrected in independent binding.';reason+=' Corrected evidence-section label; source is service help article, not a booking form.'
  f.update(state='verified-agent',approval='agent-accepted',verification='source-checked',reviewedBy='Codex independent content auditor (delegated AI review)',reviewedAt='2026-10-20')
  if changes:corrections.append({'destinationId':r['destinationId'],'field':f['field'],'corrections':changes});reason+=' '+' '.join(changes)
  decisions.append({'mallId':r['mallId'],'destinationId':r['destinationId'],'field':f['field'],'auditDecision':'accept','reason':reason,'evidenceBindings':bindings,'reviewedBy':'Codex independent content auditor (AI)','reviewedAt':'2026-10-20','acceptedField':f,'originalProposal':original})
write(ROOT/'reviewed-chunks/saigon-dining-03.json',{'revision':'independent-saigon-dining80-proposals','supersedesUnauditedSnapshots':['chunk-01-proposals.json','chunk-02-proposals.json'],'inputs':[{'file':str(p.relative_to(PACKET)),'sha256':sha(p)}for p in[proposal,support]],'decisions':decisions,'corrections':corrections,'method':'All80 source-to-field bindings independently reviewed from exact product/form observations and limited supporting extracts; independent fresh reads cover representative mall profiles and all new menu/booking roles except known exact reused Gong/McD/Starbucks roles. These3 have worker fresh20Oct receipts; no claim all80 independently refetched.'})
print(json.dumps({'accepted':len(decisions),'byField':dict(collections.Counter(d['field']for d in decisions)),'correctedFields':len(corrections)}))
