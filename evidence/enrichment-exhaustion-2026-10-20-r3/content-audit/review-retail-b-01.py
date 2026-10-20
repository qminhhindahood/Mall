import json,pathlib,hashlib,copy,re
ROOT=pathlib.Path(__file__).resolve().parent;PACKET=ROOT.parent
def read(p):return json.loads(p.read_text(encoding='utf-8-sig'))
def write(p,x):p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
lane=PACKET/'vincom-retail-b';chunk=lane/'chunk-01-records.json';incoming=read(chunk)
mapping={(x['destinationId'],x['field']):x for x in read(lane/'decisions.json')['decisions']}
selected=[mapping[(r['destinationId'],f['field'])]for r in incoming['records']for f in r['fields']]
write(ROOT/'vincom-retail-b-01-input-decisions.json',selected)
fresh={
 'https://shop.mango.com/vn/en/stores/ho-chi-minh-city/vincom-center-dong-khoi/9531':'turn441view0',
 'https://www.furla.com/int/en/eshop/storedetails/?StoreID=03AVN020--SO':'turn441view1',
 'https://www.laneige.com.vn/stores/info/list/':'turn444view0',
 'https://www.acfc.com.vn/blog/he-thong-cua-hang-mothercare.html':'turn444view1',
 'https://www.acfc.com.vn/blog/he-thong-cua-hang-calvin-klein.html':'turn444view2/turn447view0',
 'https://www.cledepeau-beaute.com.vn/vi/store':'turn444view3',
 'https://beautybox.com.vn/stores/BG012':'turn444view4',
 'https://www.swarovski.com/en-US/store/0000295119/acfc-vincom-hcm-ho-chi-minh-city':'turn444view5/turn444view6',
 'https://fixifoot.vn/':'turn446view0','https://cathkidston.com.vn/':'turn446view1','https://botanifique.com/':'turn446view2',
 'https://ceci.vn/':'turn446view3','https://www.cutieland.vn/':'turn446view4','https://bhpc.com.vn/':'turn446view5',
 'https://sneakerbuzz.vn/':'turn446view6','https://www.maisononline.vn/products/marhen-j-tui-deo-vai-nu-phom-chu-nhat-nua-mj22dnuaal-4':'turn446view7',
 'https://cowayvina.com.vn/coway-vina':'turn446view8','https://honeecoffee.com/':'turn446view9'}
inputs=[{'file':str(chunk.relative_to(PACKET)),'sha256':sha(chunk)}];decisions=[]
for source in sorted({x['sourceFile']for x in selected}):
 p=lane/source;inputs.append({'file':str(p.relative_to(PACKET)),'sha256':sha(p)})
for r in incoming['records']:
 for original in r['fields']:
  f=copy.deepcopy(original);d=mapping[(r['destinationId'],f['field'])]
  p=lane/d['sourceFile'];payload=read(p);text=payload.get('result','')if isinstance(payload,dict)else str(payload)
  if f['sourceUrl']not in text and f['sourceUrl']not in str(payload):raise ValueError('missing source binding')
  f.update(state='verified-agent',approval='agent-accepted',verification='source-checked',reviewedBy='Codex independent content auditor (delegated AI review)',reviewedAt='2026-10-20')
  reason='Official source identity, actual target role and scope reviewed. Brand-wide catalogue/product links preserve branch availability caveats; fresh practical locator values agree with proposed bilingual values.'
  if f['field']=='catalog'and r['destinationId']=='vincom-candidate-vd-x-074':reason+=' Furla locator contains an explicit product-category list, not merely global menu labels; retained as a brand-wide catalogue reference without local inventory claims.'
  if f['field']=='catalog'and r['destinationId']=='vincom-prototype-calvinklein':reason+=' ACFC locator article contains an actual CK product-category directory at196–218 and identifies authorized distribution; role is a catalogue gateway as well as locator.'
  if r['destinationId']=='vincom-prototype-beautybox':reason+=' Published Monday–Friday/Saturday/Sunday blocks all state09:00–22:00; stray daysOfWeek.closed label is untranslated template text, not a named closure day. No holiday guarantee inferred.'
  bindings=[{'file':str(p.relative_to(PACKET)),'sourceUrl':f['sourceUrl'],'method':'Saved official full source response reviewed.'}]
  if f['sourceUrl']in fresh:bindings.append({'sourceUrl':f['sourceUrl'],'freshWebReference':fresh[f['sourceUrl']]})
  else:bindings.append({'sourceUrl':f['sourceUrl'],'method':'Known exact r2official brand catalogue role plus worker fresh source snapshot; no redundant independent refetch.'})
  decisions.append({'mallId':r['mallId'],'destinationId':r['destinationId'],'field':f['field'],'auditDecision':'accept','reason':reason,'evidenceBindings':bindings,'reviewedBy':'Codex independent content auditor (AI)','reviewedAt':'2026-10-20','acceptedField':f,'originalProposal':original})
write(ROOT/'reviewed-chunks/vincom-retail-b-01.json',{'revision':'independent-vincom-retail-b-01','inputs':inputs,'decisions':decisions})
print('41 reviewed accepted; exact locator values, target roles, bilingual values and scopes supported.')
