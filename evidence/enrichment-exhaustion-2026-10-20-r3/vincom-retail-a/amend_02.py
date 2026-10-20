import pathlib,json,hashlib
p=pathlib.Path(__file__).parent;n=json.loads((p/'notes.json').read_text(encoding='utf-8'))
a=next(x for x in n if x['id']=='vincom-prototype-vincy')
a['fields']['phone']={'url':'https://vincy.com.vn/','evidence':'source-text/locator-follow36.json','reference':'turn790view0 L973-L1004','scope':'brand-wide','vi':'0909 411 449','en':'0909 411 449','reason':'Actual official VINCY footer explicitly labels customer care0909411449/cskh@vincy.com.vn and sales/complaints contacts. National brand support only;7:00–21:30/8:00–21:30 are support availability, not branch opening hours.'}
# retain genuine locator blockers with completed obvious-path checks
for ident in ('vincom-prototype-vincy','vincom-prototype-bobbibrown','vincom-prototype-innisfree','vincom-prototype-sony','vincom-prototype-phototime','vincom-prototype-anphuoc'):
 a=next(x for x in n if x['id']==ident)
 for key,x in a['fields'].items():
  if x.get('outcome')=='hold' and key in ('phone','hours'):
   x.setdefault('attempts',[]).extend([{'action':'follow official locator/contact navigation from actual brand page','evidenceFile':'source-text/locator-follow35.json','result':'Bobbi international locator dynamic; Innisfree store-information link resolves to general search page; AnPhuoc store-link fetcherror; PhotoTime actualhomepage has no Vincom match.'},{'action':'inspect footer and locator actual content','evidenceFile':'source-text/locator-follow36.json','result':'Vincy customer-care phone retrieved, but branch schedule not shown. Sony official dealer-list link resolves to10-line dynamic page.'},{'action':'exact branch check on locator','evidenceFile':'source-text/locator-follow38.json','result':'Vincy official store-list has no readable Dong Khoi row; Innisfree root no1800/telephone match. Missing rendered payload is a hold, not unavailable.'}])
a=next(x for x in n if x['id']=='vincom-candidate-vd-b1-035')
a['fields']['catalog']={'url':'https://www.danielwellington.com/','evidence':'source-text/catalog-danielwellington.json','reference':'turn461view0 L200-L220','reason':'Actual official Finland/EUR storefront body features named watch collections Quadro Mini, Pathfinder, Margot, Classic, Cort, Corta, Pearl and Iconic Tachymeter, plus watch/jewellery collections. This is actual product collection content beyond navigation; international catalogue only.','uncertainty':{'vi':'Danh mục quốc tế của Daniel Wellington; giá, tồn kho, giao hàng và dịch vụ tại chi nhánh Việt Nam chưa được xác nhận.','en':'Daniel Wellington international catalogue; Vietnam branch prices, stock, delivery and services are not confirmed.'}}
(p/'notes.json').write_text(json.dumps(n,ensure_ascii=False,indent=2),encoding='utf-8')
exec(compile((p/'build.py').read_text(encoding='utf-8'),str(p/'build.py'),'exec'))
d=json.loads((p/'decisions.json').read_text(encoding='utf-8'))
keys={('vincom-prototype-vincy','phone'),('vincom-candidate-vd-b1-035','catalog')}
d['decisions']=[x for x in d['decisions'] if (x['destinationId'],x['field']) in keys];d['supersedes']='chunk-02-decisions.json corresponding2holds only; supplementary locator receipts strengthen other unchanged holds.'
f=p/'amendment-02-new-phone-catalog.json';f.write_text(json.dumps(d,ensure_ascii=False,indent=2),encoding='utf-8');print(hashlib.sha256(f.read_bytes()).hexdigest())

