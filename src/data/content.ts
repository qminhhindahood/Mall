import { validateEnrichment } from './enrichment';
import type { Locale, FloorDataset, MallId } from '../runtime/scene-contract';
export type Bilingual = Record<Locale, string>;
export type Review = { source: string; reviewedAt: string; reviewedBy: string; languages: Record<Locale, boolean> };
export type Destination = {
  id: string; name: Bilingual; primaryFloor: string; floors: string[];
  description: Bilingual; reviewedAt: string; fixture?: boolean;
  categories: string[]; aliases: string[]; status: 'open'|'closed'|'moved';
  locations: { floorId: string; certainty: 'floor-confirmed'|'area-confirmed'; areaIds: string[]; source: string }[];
  review: Review;
  cuisine?: Bilingual;
  website?: string;
  openingSoon?: boolean;
};
export type Category = { id: string; name: Bilingual; review: Review };
export type MappedArea = { id: string; floorId: string; regionIds: string[]; name: Bilingual; review: Review };
export type Facility = { id: string; name: Bilingual; floorId: string; areaId?: string; review: Review };
export type DirectorySnapshot = {
  mallId: MallId; revision: string; approval: 'pending'|'approved'|'fixture'; reviewedAt: string|null;
  destinations: Destination[]; categories: Category[]; areas: MappedArea[]; facilities: Facility[];
  highlights: { destinationId: string; categoryId: string; floorId: string; review: Review }[];
  researchPreview?: boolean;
};
// This runs at build time, before any reviewed record becomes a public route.
export function validateContent(snapshot: DirectorySnapshot, mallId: MallId, geometry: FloorDataset) {
  const fail = (message: string): never => { throw new Error(`Directory ${mallId}: ${message}`); };
  if (snapshot.mallId !== mallId) fail('cross-mall snapshot');
  if (!['pending','approved','fixture'].includes(snapshot.approval)) fail('invalid approval');
  if (snapshot.approval === 'fixture' && !['1','research'].includes(process.env.INCLUDE_TEST_FIXTURES ?? '')) fail('fixture in public build');
  if (snapshot.researchPreview && (snapshot.approval !== 'fixture' || process.env.INCLUDE_TEST_FIXTURES !== 'research')) fail('research input in public build');
  if (snapshot.approval === 'pending' && [snapshot.destinations,snapshot.categories,snapshot.areas,snapshot.facilities,snapshot.highlights].some(rows=>rows.length)) fail('unapproved records');
  const review = (record: Review) => {
    if (!record?.source?.trim() || !record.reviewedBy?.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(record.reviewedAt) || record.languages.vi !== true || record.languages.en !== true) fail('source and both language approvals required');
  };
  if (snapshot.approval !== 'pending' && !/^\d{4}-\d{2}-\d{2}$/.test(snapshot.reviewedAt ?? '')) fail('actual snapshot review date required');
  const floor = (id: string) => geometry.floors.find(f=>f.id===id) ?? fail(`unknown floor ${id}`);
  const ids = (rows: {id:string}[]) => { const seen=new Set<string>(); for(const row of rows){if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(row.id)||seen.has(row.id))fail(`invalid/duplicate ID ${row.id}`);seen.add(row.id);} };
  for (const rows of [snapshot.destinations,snapshot.categories,snapshot.areas,snapshot.facilities]) ids(rows);
  for(const row of [...snapshot.destinations,...snapshot.categories,...snapshot.areas,...snapshot.facilities]) {review(row.review);if(!row.name.vi.trim()||!row.name.en.trim())fail('bilingual name required');}
  const regionOwners=new Set<string>();
  for(const area of snapshot.areas) {for(const id of area.regionIds){const key=`${area.floorId}:${id}`;if(regionOwners.has(key))fail('mapped regions must have one area owner');regionOwners.add(key);}const f=floor(area.floorId);if(!area.regionIds.length||area.regionIds.some(id=>!f.regions.some(r=>r.id===id)))fail(`unsupported mapped area ${area.id}`);}
  for(const d of snapshot.destinations) {
    if(d.website) { let url:URL; try {url=new URL(d.website);} catch {fail(`invalid website ${d.id}`);} if(!['https:','http:'].includes(url!.protocol)||url!.username||url!.password)fail(`invalid website ${d.id}`); }
    if(d.fixture && snapshot.approval!=='fixture')fail('fixture record in reviewed snapshot');
    if(!['open','closed','moved'].includes(d.status)||!d.floors.includes(d.primaryFloor)||!d.categories.length||new Set(d.floors).size!==d.floors.length)fail(`invalid destination ${d.id}`);
    if(d.reviewedAt!==d.review.reviewedAt)fail(`review date mismatch ${d.id}`);
    d.floors.forEach(floor);
    if(d.categories.some(id=>!snapshot.categories.some(c=>c.id===id)))fail(`unknown category ${d.id}`);
    if(d.locations.length!==d.floors.length||new Set(d.locations.map(l=>l.floorId)).size!==d.floors.length)fail(`one location per floor required ${d.id}`);
    for(const l of d.locations) {if(!d.floors.includes(l.floorId)||!l.source.trim()||!['floor-confirmed','area-confirmed'].includes(l.certainty))fail(`invalid location ${d.id}`);if((l.certainty==='floor-confirmed'&&l.areaIds.length)||(l.certainty==='area-confirmed'&&!l.areaIds.length)||l.areaIds.some(id=>!snapshot.areas.some(a=>a.id===id&&a.floorId===l.floorId)))fail(`unsupported precision ${d.id}`);}
  }
  for(const f of snapshot.facilities){floor(f.floorId);if(f.areaId&&!snapshot.areas.some(a=>a.id===f.areaId&&a.floorId===f.floorId))fail(`unsupported facility ${f.id}`);}
  for(const h of snapshot.highlights){review(h.review);if(!snapshot.destinations.some(d=>d.id===h.destinationId&&d.status==='open'&&d.floors.includes(h.floorId)&&d.categories.includes(h.categoryId)))fail('ineligible Highlight');}
  if (snapshot.approval === 'approved') validateEnrichment(snapshot);
  return snapshot;
}
export const normalize = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase().trim().replace(/\s+/g,' ');
function edits(a: string,b: string) {
  let row=Array.from({length:b.length+1},(_,i)=>i);
  for(let i=1;i<=a.length;i++){const next=[i];for(let j=1;j<=b.length;j++)next[j]=Math.min(next[j-1]+1,row[j]+1,row[j-1]+Number(a[i-1]!==b[j-1]));row=next;}return row[b.length];
}
export function searchDirectory(destinations: Destination[], categories: Category[], query: string, categoryId: string, floorId: string) {
  const q=normalize(query);
  const candidates=destinations.filter(d=>(!categoryId||d.categories.includes(categoryId))&&(q||categoryId||d.floors.includes(floorId)));
  const rank=(d:Destination)=>{const names=Object.values(d.name).map(normalize);return names.includes(q)?0:names.some(n=>n.startsWith(q))?1:names.some(n=>n.includes(q))?2:3;};
  const direct=candidates.filter(d=>!q||normalize([...Object.values(d.name),...d.aliases,...categories.filter(c=>d.categories.includes(c.id)).flatMap(c=>Object.values(c.name))].join(' ')).includes(q)).sort((a,b)=>rank(a)-rank(b)||a.id.localeCompare(b.id));
  const limit=q.length>=8?2:q.length>=4?1:0;
  const suggestions=direct.length||!limit||/\d/.test(q)?[]:candidates.filter(d=>Object.values(d.name).some(n=>normalize(n).split(' ').some(token=>Math.abs(token.length-q.length)<=limit&&edits(q,token)<=limit))).slice(0,5);
  return {results:direct,suggestions};
}
export function categoryFloor(destinations: Destination[], categoryId: string, geometry: FloorDataset, fallback: string) {
  const ranked=geometry.floors.map(f=>({id:f.id,count:destinations.filter(d=>d.status==='open'&&d.categories.includes(categoryId)&&d.floors.includes(f.id)).length,order:f.order})).sort((a,b)=>b.count-a.count||a.order-b.order);
  return ranked[0]?.count?ranked[0].id:fallback;
}
