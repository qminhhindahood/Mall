import pathlib,json,re
p=pathlib.Path(__file__).parent
q=json.loads((p/'queue.json').read_text(encoding='utf-8'))['records']
n=json.loads((p/'notes.json').read_text(encoding='utf-8'))
cfg=json.loads((p/'batch-candidate-input.json').read_text(encoding='utf-8'))
for ix,url,ev,vi,en,cat,reason in cfg:
 r=q[ix];name=r['name']['en'];fs={}
 block=not url or vi is None
 for f in r['fields']:
  fs[f]={'outcome':'hold','url':url,'evidence':ev,'reason':reason+' Field: '+f+'.','remainingAction':('Resolve exact official brand/counter identity and retrieve its '+f+' source.' if not url else 'Obtain a readable authoritative '+name+' source for '+f+' with exact scope and branch applicability.')}
 if not block:
  fs['website']={'reason':'Retrieved official '+name+' brand site; exact brand identity and stated market scope; no branch occupancy, stock or schedule inferred.','url':url,'evidence':ev}
  if cat: fs['catalog']={'reason':'Actual official catalogue presents product listings/categories supporting the general range. No Vietnam/Dong Khoi stock, prices or delivery promised.','url':url,'evidence':ev}
  fs['services']={'reason':'Specific official product offering categories support the Products / services summary; no unmentioned operational policy or efficacy claim. '+reason,'vi':vi,'en':en,'url':url,'evidence':ev}
 # Only assigned fields
 fs={f:x for f,x in fs.items() if f in r['fields']}
 n.append({'id':r['destinationId'],'url':url,'evidence':ev,'fields':fs,'searches':[{'query':name+' official Vincom Đồng Khởi store phone hours catalogue services','result':'Brand/mall identity search receipts retained in source-text/s*.json; direct official source result bound per field; no third-party values proposed.'}],'attempts':[{'action':'read prior r2 mall/brand receipts and r3 accepted source index','result':'Checked exact frozen identity; baseline field objects preserved.'},{'action':'search official brand plus exact mall/branch identity','evidenceFile':ev,'result':reason},{'action':'open official brand source','url':url,'evidenceFile':ev,'result':'See retained response including any exact HTTP/shell error.'}]})
# exact current branch proposals
def setfield(ix,f,url,ev,value,reason):
 a=next(z for z in n if z['id']==q[ix]['destinationId']);a['fields'][f]={'url':url,'evidence':ev,'scope':'branch','vi':value,'en':value,'reason':reason}
setfield(12,'phone','https://vangcuulong.vn/lien-he/','source-text/open24.json','0938 244 179','Actual official Cuu Long Jewelry Vincom HCM contact block names70-72 Le Thanh Ton and lists0938244179. Location geometry remains frozen.')
setfield(17,'phone','https://rabity.vn/pages/pn-vincom-dong-khoi','source-text/find25.json','0327 987 022','Actual official PN-Vincom Dong Khoi block at72 Le Thanh Ton gives0327987022.')
setfield(17,'hours','https://rabity.vn/pages/pn-vincom-dong-khoi','source-text/find25.json','10:00–22:00','Actual official PN-Vincom Dong Khoi block explicitly states working time10:00–22:00; no holiday schedule inferred.')
for ix,value,ev,url in [(11,'1900 63 6641','source-text/find23.json','https://shooz.vn/'),(13,'1900 988 903','source-text/open24.json','https://www.pantio.vn/'),(15,'0932 988 080','source-text/find25.json','https://gintell.vn/'),(16,'091 373 2020','source-text/open24.json','https://albettaretail.vn/'),(18,'1900 6656','source-text/catalog-pnc.json','https://nhasachphuongnam.com/'),(19,'0862 020 988','source-text/catalog-amm.json','https://www.ammofficial.com/')]:
 a=next(z for z in n if z['id']==q[ix]['destinationId']);a['fields']['phone']={'url':url,'evidence':ev,'scope':'brand-wide','vi':'Liên hệ chung: '+value,'en':'General contact: '+value,'reason':'Actual official Vietnam brand/operator page supplies this general contact; explicitly brand/distributor-wide, not a dedicated Dong Khoi branch line.'}
(p/'notes.json').write_text(json.dumps(n,ensure_ascii=False,indent=2),encoding='utf-8')

