import pathlib,json,hashlib,copy
p=pathlib.Path(__file__).resolve().parent
def read(n):return json.loads((p/n).read_text(encoding='utf-8'))
def save(n,x):(p/n).write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
def sha(n):return hashlib.sha256((p/n).read_bytes()).hexdigest()
q=read('queue.json')['records'];by={r['name']['en']:r for r in q};base=read('decisions.json')['decisions']
rows=[
('Beauty Box','18006035','https://beautybox.com.vn/stores/BG012','locator-detail-01.json','turn403view3 L41','Beauty Box Việt Nam, tổng đài chung','Beauty Box Vietnam general hotline'),
('Cath Kidston','0967588832','https://cathkidston.com.vn/','open-03.json','turn376view1 L284; also turn376view0 L105','Cath Kidston Việt Nam, liên hệ chung trên website','Cath Kidston Vietnam general website contact'),
('Ceci','0789866225','https://ceci.vn/','product-service-01.json','turn802view1 L139/159','Céci Việt Nam, hotline chung','Céci Vietnam general hotline'),
('Cutie Land','+84397888818','https://www.cutieland.vn/','product-service-05.json','turn812view1 L186; printed +84 397 8888 18','Cutieland Việt Nam, hotline chung','Cutieland Vietnam general hotline'),
('Coway','1800556892','https://cowayvina.com.vn/coway-vina','open-04.json','turn382view0 L32–33/131–132','Coway Vina, hotline chăm sóc khách hàng toàn quốc','Coway Vina national customer-care hotline'),
('Fixifoot','0983000821','https://fixifoot.vn/contact-us/','open-04.json','turn382view1 L14/27/40','Fixifoot Việt Nam, số liên hệ chung trên website','Fixifoot Vietnam general website contact'),
('Himalaya','0865772112','https://www.himalaya-vn.com/','product-proof-10.json','turn848view2 L424','Himalaya Việt Nam, hotline chung','Himalaya Vietnam general hotline'),
('Li-Ning','1900633083','https://lining.com.vn/collections/giay-chay-bo-nam-2','product-service-06.json','turn814view0 L699–703 identifies Hải Long distributor and hotline','Hải Long, nhà phân phối Li-Ning tại Việt Nam, hotline chung','Hai Long, Li-Ning Vietnam distributor general hotline'),
('My Kingdom','19001208','https://www.mykingdom.com.vn/pages/faqs','open-17.json','turn618view0 L255/270/283','Mykingdom Việt Nam, hotline hỗ trợ chung','Mykingdom Vietnam general support hotline'),
('Mắt Việt','19006081','https://matviet.vn/pages/about-us','matviet-service.json','turn797view1 L171/300/344','Mắt Việt, hotline chung toàn hệ thống','Mắt Việt general network hotline'),
('Viin Riic Niche Perfume','+84909816771','https://viinriic.com/en/store-locator/','locator-detail-02.json','turn493view2 L175/221; independently repeated product-proof02 L402/448. Older0901982607 is identified with named Ngoc Quyen/regional block, not the generic contact@viinriic.com block. No branch line chosen.','VIINRIIC Việt Nam, hotline thương hiệu tại khối liên hệ chung','VIINRIIC Vietnam brand hotline in the general contact block'),
('Lush','1900252538','https://www.lushvietnam.com/pages/lien-he','open-17.json','turn618view1 L23–25; operator Maison also product-proof03 L701–702','LUSH Việt Nam / Maison, hotline chăm sóc khách hàng chung','LUSH Vietnam / Maison general customer-care hotline'),
('Charles & Keith','1900252538','https://www.charleskeith.vn/vn-en/contactus','last-locators-03.json','turn717view5 L94/160/175','CHARLES & KEITH Việt Nam / Maison, hotline hỗ trợ chung','CHARLES & KEITH Vietnam / Maison general support hotline'),
('BHPC - Beverly Hills Polo Club','19008079','https://bhpc.com.vn/','phone-scope-proof-01.json','turn893view3 L255–257 Kowil contact block','Kowil / Beverly Hills Polo Club Việt Nam, số hỗ trợ chung','Kowil / Beverly Hills Polo Club Vietnam general support contact'),
('VinFast','1900232389','https://vinfastauto.com/vn_vi','phone-scope-proof-02.json','turn894view0 L1006–1008 customer service, extension1','VinFast Việt Nam, dịch vụ khách hàng chung — chọn nhánh 1','VinFast Vietnam general customer service — choose extension 1'),
('PNJ','1800545457','https://www.pnj.com.vn/trang-suc/','phone-scope-proof-02.json','turn894view3 L8 hotline','PNJ Việt Nam, hotline chung','PNJ Vietnam general hotline'),
('Scentuals','02873003889','https://scentuals.vn/','open-12.json','turn482view1 L322–324 office hotline','Scentuals Việt Nam, hotline văn phòng chung','Scentuals Vietnam general office hotline'),
('Lancôme','1800545463','https://www.lancome.vn/vi_VN/stores','open-05.json','turn384view0 L285–287 general support footer; no branch row','Lancôme Việt Nam, số hỗ trợ chung công bố trên website','Lancôme Vietnam general support number published on its website'),
('New Balance','8005959138','https://www.newbalance.com/customerservice/','../saigon-retail/source-090.txt','turn786view1; central-reviewed reusable brand-wide US customer-care source','New Balance Hoa Kỳ, số chăm sóc khách hàng website theo định dạng nội địa Hoa Kỳ','New Balance United States website customer care in its published US domestic format'),
]
records=[];decisions=[]
for name,number,url,file,reference,vi,en in rows:
 r=by[name];assert 'phone' in r['fields'];f={'field':'phone','state':'verified-agent','sourceUrl':url,'evidence':'Official numeric contact in actual saved source body: '+reference+'. General brand/operator/market contact fallback; no branch-direct claim or country prefix invented.','checkedAt':'2026-10-20','applicability':'brand-wide','verification':'source-checked','approval':'candidate-proposal','value':{'vi':number,'en':number},'uncertainty':{'vi':vi+'. Không phải số trực tiếp đã xác minh của chi nhánh Đồng Khởi; chưa thử kết nối hoặc xác nhận khả năng hỗ trợ tại trung tâm.','en':en+'. Not a verified direct Dong Khoi branch line; connectivity and ability to assist with this mall have not been tested.'}}
 records.append({'mallId':'vincom-dong-khoi','destinationId':r['destinationId'],'fields':[f]})
 prior=next(z for z in base if z['destinationId']==r['destinationId'] and z['field']=='phone')
 decisions.append({'mallId':'vincom-dong-khoi','destinationId':r['destinationId'],'field':'phone','decision':'candidate-proposal','checkedAt':'2026-10-20','sourceFile':file,'sourceSha256':sha(file),'sourceUrl':url,'sourceReference':reference,'scope':'brand-wide','reason':f['evidence'],'value':f['value'],'caveats':f['uncertainty'],'proposedField':f,'replacesFrozenOutcome':prior['decision'],'nextAction':'Independent review of this explicit general-contact fallback supplement; retain unresolved branch-direct lookup separately.'})
save('phone-scope-chunk01-records.json',{'revision':'scoped-general-phone-fallback-01','records':records});save('phone-scope-chunk01-decisions.json',{'decisions':decisions})
save('phone-scope-chunk01-manifest.json',{'fields':len(rows),'recordsSha256':sha('phone-scope-chunk01-records.json'),'decisionsSha256':sha('phone-scope-chunk01-decisions.json'),'frozenRecordsSha256':sha('records.json'),'frozenDecisionsSha256':sha('decisions.json'),'MangoConflictPreserved':True})
print(json.dumps(read('phone-scope-chunk01-manifest.json')))
