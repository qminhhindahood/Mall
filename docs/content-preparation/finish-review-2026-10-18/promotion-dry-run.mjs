// Read-only toward the application. All outputs stay in this private packet.
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {gzipSync} from 'node:zlib';
const here=dirname(fileURLToPath(import.meta.url));
const root=resolve(here,'../../..');
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const sha=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const {validateContent}=await import(pathToFileURL(resolve(root,'src/data/content.ts')));
const {createResearchFixtures}=await import(pathToFileURL(resolve(root,'src/data/research-fixtures.ts')));
const {researchGeometry}=await import(pathToFileURL(resolve(root,'scripts/research-overlay.mjs')));
const packet=read(resolve(here,'roster-proposals.json'));
const nominations=read(resolve(here,'highlights.json')).records;
const hashes={roster:sha(resolve(here,'roster-proposals.json')),highlights:sha(resolve(here,'highlights.json')),holds:sha(resolve(root,'data/research/location-holds-2026-10-18-r1.json'))};
const approvalIndex=process.argv.indexOf('--approval');
const approval=approvalIndex<0?null:read(resolve(process.argv[approvalIndex+1]));
if(approval && Object.entries(hashes).some(([key,value])=>approval.contentHashes?.[key]!==value)) throw Error('Approval does not bind this exact roster, Highlights and holds revision');
const output=resolve(here,'dry-run'); mkdirSync(output,{recursive:true});
const translations={'Thương hiệu cao cấp':'Luxury brands','Ẩm thực':'Dining','Thời trang':'Fashion','Mỹ phẩm':'Beauty','Trang sức & đồng hồ':'Jewellery & watches','Siêu thị':'Supermarket','Nhà sách':'Bookshop','Sức khỏe':'Health','Điện tử':'Electronics','Thể thao':'Sports','Trang trí nội thất':'Home decor','Phong cách sống':'Lifestyle','Vui chơi giải trí':'Entertainment','Rạp chiếu phim':'Cinema','Mẹ & bé':'Parent & baby','Nội thất, gia dụng & điện máy':'Home & appliances','Giày dép & túi xách':'Shoes & bags','Trang sức, đồng hồ & mắt kính':'Jewellery, watches & eyewear','Mỹ phẩm & làm đẹp':'Beauty','Đồ dùng & quà tặng':'Gifts & essentials','Thể thao & wellness':'Sports & wellness'};
const receipt={revision:'finish-review-promotion-dry-run-r1',contentHashes:hashes,approvalSupplied:!!approval,productionFilesWritten:[],malls:[]};
for(const mallId of ['saigon-centre','vincom-dong-khoi']){
  const geometrySource=read(resolve(root,`data/malls/${mallId}/floor-geometry.json`));
  const input=read(resolve(root,`data/research/${mallId}.json`));
  process.env.INCLUDE_TEST_FIXTURES='research';
  const geometry=researchGeometry(root,mallId,geometrySource);
  const reference=createResearchFixtures(input,mallId,geometry);
  delete process.env.INCLUDE_TEST_FIXTURES;
  const baseline=new Map(reference.destinations.map(d=>[d.id,d]));
  const decision=approval?.malls?.[mallId];
  if(approval){
    for(const key of ['rosterApproved','copyApproved','taxonomyApproved','statusesConfirmed','highlightsApproved','noFacilitiesApproved']) if(decision?.[key]!==true)throw Error(`${mallId}: missing explicit ${key}`);
    for(const lang of ['vi','en'])if(!decision.languages?.[lang]?.reviewedBy?.trim()||!/^\d{4}-\d{2}-\d{2}$/.test(decision.languages[lang].reviewedAt))throw Error(`${mallId}: actual ${lang} reviewer and date required`);
    if(!decision.rosterReviewedBy?.trim()||!/^\d{4}-\d{2}-\d{2}$/.test(decision.reviewedAt)||!decision.source?.trim())throw Error(`${mallId}: roster source/reviewer/date required`);
  }
  const review={source:decision?.source??'Private draft; approval not supplied',reviewedAt:decision?.reviewedAt??'',reviewedBy:decision?`${decision.rosterReviewedBy}; VI ${decision.languages.vi.reviewedBy} (${decision.languages.vi.reviewedAt}); EN ${decision.languages.en.reviewedBy} (${decision.languages.en.reviewedAt})`:'',languages:{vi:!!decision,en:!!decision}};
  const rows=packet.records.filter(r=>r.mall===mallId&&r.proposedLaunchDisposition!=='exclude-identity-unresolved'&&!decision?.excludeIds?.includes(r.id));
  const usedCategories=new Set(rows.flatMap(r=>r.categories));
  const categories=input.categories.filter(c=>usedCategories.has(c.id)).map(c=>({id:c.id,name:{vi:c.label,en:translations[c.label]},review}));
  if(usedCategories.has('category-pending'))categories.push({id:'category-pending',name:{vi:'Chưa phân loại',en:'Uncategorised'},review});
  if(categories.length!==usedCategories.size||categories.some(c=>!c.name.en))throw Error(`${mallId}: missing category/translation`);
  const destinations=rows.map(r=>{
    const old=baseline.get(r.id); const status=decision?.statusById?.[r.id]??(decision?.allIncludedStatusesOpen===true?'open':undefined);
    if(decision&&!status)throw Error(`${mallId}: explicit reviewed status required for ${r.id}`);
    return {id:r.id,name:r.name,description:r.proposedDescription,primaryFloor:r.floors[0],floors:r.floors,categories:r.categories,aliases:[],status:status??'open',reviewedAt:review.reviewedAt,review,
      locations:r.floors.map(floorId=>old?.locations.find(l=>l.floorId===floorId)??{floorId,certainty:'floor-confirmed',areaIds:[],source:'Owner-confirmed floor roster; unresolved precise marker omitted under accepted treatment'})};
  });
  const usedAreas=new Set(destinations.flatMap(d=>d.locations.flatMap(l=>l.areaIds)));
  const areas=reference.areas.filter(a=>usedAreas.has(a.id)).map(a=>({...a,review}));
  const highlights=nominations.filter(h=>h.mall===mallId&&!decision?.excludeHighlightIds?.includes(h.destinationId)).map(h=>{
    const d=destinations.find(d=>d.id===h.destinationId);if(!d)throw Error('Highlight references excluded identity');
    return {destinationId:d.id,categoryId:d.categories[0],floorId:d.primaryFloor,review};
  });
  const candidate={mallId,revision:'finish-review-proposed-promotion-r1',approval:'approved',reviewedAt:review.reviewedAt,destinations,categories,areas,facilities:[],highlights};
  // In-memory software fixture tests structure without asserting editorial approval.
  const structuralFixture=structuredClone(candidate);
  const softwareReview={source:'Software structural fixture only; no editorial or occupancy approval',reviewedAt:'2026-10-18',reviewedBy:'Codex fixture validator',languages:{vi:true,en:true}};
  structuralFixture.approval='fixture';structuralFixture.reviewedAt=softwareReview.reviewedAt;
  for(const row of [...structuralFixture.destinations,...structuralFixture.categories,...structuralFixture.areas,...structuralFixture.highlights]){row.review=softwareReview;if('reviewedAt' in row)row.reviewedAt=softwareReview.reviewedAt;}
  structuralFixture.destinations.forEach(d=>{d.fixture=true;});
  process.env.INCLUDE_TEST_FIXTURES='1';validateContent(structuralFixture,mallId,geometry);delete process.env.INCLUDE_TEST_FIXTURES;
  // No approval case is deliberately schema-invalid: never fake reviews to get a green receipt.
  let candidateValidation;try{validateContent(candidate,mallId,geometry);candidateValidation='pass';}catch(error){candidateValidation=String(error.message);if(decision)throw error;}
  if(!decision&&candidateValidation==='pass')throw Error('Unapproved candidate unexpectedly passed');
  const pending={mallId,revision:'finish-review-held-pending-r1',approval:'pending',reviewedAt:null,destinations:[],categories:[],areas:[],facilities:[],highlights:[]};
  validateContent(pending,mallId,geometry);
  const prefix=decision?'approved-shaped-private-candidate':'unapproved-structural-proposal';
  writeFileSync(resolve(output,`${mallId}.${prefix}.json`),JSON.stringify(candidate,null,2)+'\n');
  writeFileSync(resolve(output,`${mallId}.geometry-private.json.gz`),gzipSync(JSON.stringify(geometry)+'\n'));
  receipt.malls.push({mallId,destinations:destinations.length,areas:areas.length,highlights:highlights.length,structuralFixtureValidation:'pass (software fixture, in memory only)',candidateValidation,pendingValidation:'pass',fixtureFlags:destinations.some(d=>d.fixture),missingMarkerTreatment:'floor-confirmed; no invented areas',note:'Approved-shaped private output is not release approval. Never copy unapproved-structural-proposal into production.'});
}
writeFileSync(resolve(output,'receipt.json'),JSON.stringify(receipt,null,2)+'\n');console.log(JSON.stringify(receipt,null,2));
