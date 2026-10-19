const accepted = import.meta.env.PUBLIC_CONTENT_FIXTURES === '1' ? { records: [] } : (await import('./enrichment-accepted.json')).default;
// Compile-time gate prevents provisional source values entering approved-only/fixture bundles.
const proposals = import.meta.env.PUBLIC_CONTENT_FIXTURES !== '1' && import.meta.env.PUBLIC_DISCOVERY_REVIEW === '1'
  ? (await import('./enrichment-proposals.json')).default
  : { records: [] };
import type { Bilingual, Destination, DirectorySnapshot } from './content';
import type { MallId } from '../runtime/scene-contract';

export const detailFields = ['website','phone','hours','menu','catalog','programme','booking','services'] as const;
export type DetailField = typeof detailFields[number];
export type CoverageState = 'verified-existing'|'verified-agent'|'newly-sourced-proposal'|'unavailable-after-research'|'evidence-conflict-hold'|'not-applicable'|'unresearched';
export type EnrichmentField = {
  field: DetailField; value?: Bilingual; url?: string;
  state: CoverageState; sourceUrl: string; evidence: string; checkedAt: string;
  applicability: 'branch'|'brand-wide'|'unresolved'; branchMallId?: MallId;
  verification: 'source-checked'|'held'; approval: 'provisional'|'agent-accepted'; reviewedBy?: string; reviewedAt?: string; uncertainty: Bilingual;
};
export type EnrichmentRecord = { mallId: MallId; destinationId: string; fields: EnrichmentField[] };
const acceptedRecords = accepted.records as EnrichmentRecord[];
const proposalRecords = proposals.records as EnrichmentRecord[];
export const enrichmentRecords: EnrichmentRecord[] = [...acceptedRecords, ...proposalRecords.filter(p=>!acceptedRecords.some(a=>a.mallId===p.mallId&&a.destinationId===p.destinationId))];
export const enrichmentReview = import.meta.env.PUBLIC_DISCOVERY_REVIEW === '1';
const linkFields: DetailField[] = ['website','menu','catalog','programme','booking'];
export function safeOfficialUrl(value: string) {
  try { const url = new URL(value); return ['https:','http:'].includes(url.protocol) && !url.username && !url.password && !/^(localhost|127\.|.*\.invalid$|.*\.test$)/i.test(url.hostname); } catch { return false; }
}
export function validateEnrichment(snapshot: DirectorySnapshot) {
  const fail = (message:string):never => { throw new Error(`Enrichment ${snapshot.mallId}: ${message}`); };
  if (enrichmentRecords.some(r=>!['saigon-centre','vincom-dong-khoi'].includes(r.mallId))) fail('unknown mall identity');
  const seen = new Set<string>();
  for (const record of enrichmentRecords.filter(r=>r.mallId===snapshot.mallId)) {
    const destination=snapshot.destinations.find(d=>d.id===record.destinationId);
    if (!destination || destination.fixture || seen.has(record.destinationId)) fail(`unknown/fixture/duplicate identity ${record.destinationId}`);
    seen.add(record.destinationId);
    const fields=new Set<string>();
    for (const item of record.fields) {
      if (!detailFields.includes(item.field) || fields.has(item.field)) fail('unknown/duplicate field');
      fields.add(item.field);
      if (!safeOfficialUrl(item.sourceUrl) || (item.url && !safeOfficialUrl(item.url))) fail('unsafe source/action URL');
      if (!/^\d{4}-\d{2}-\d{2}$/.test(item.checkedAt) || new Date(item.checkedAt).toISOString().slice(0,10)!==item.checkedAt || item.checkedAt>new Date().toISOString().slice(0,10)) fail('invalid/future check date');
      if (!item.evidence.trim() || !item.uncertainty?.vi?.trim() || !item.uncertainty?.en?.trim() || (item.state==='verified-agent' ? item.approval!=='agent-accepted'||!item.reviewedBy?.trim()||item.reviewedAt!==item.checkedAt : item.approval!=='provisional')) fail('provenance/uncertainty/provisional approval required');
      if (!['branch','brand-wide','unresolved'].includes(item.applicability) || (item.applicability==='branch' && item.branchMallId!==snapshot.mallId) || (item.applicability!=='branch' && item.branchMallId)) fail('branch identity mismatch');
      if (!['verified-agent','newly-sourced-proposal','unavailable-after-research','evidence-conflict-hold'].includes(item.state)) fail('invalid research state');
      if (item.state==='newly-sourced-proposal'||item.state==='verified-agent') {
        if (item.verification!=='source-checked' || item.applicability==='unresolved') fail('unverified proposal');
        if (linkFields.includes(item.field) ? !item.url : !item.value?.vi?.trim() || !item.value?.en?.trim()) fail('missing field value');
        if (item.field==='phone' && (!/^\+?[0-9 ()-]{7,24}$/.test(item.value!.en) || item.value!.vi!==item.value!.en)) fail('invalid telephone');
      } else if (item.url || item.value || item.verification!=='held') fail('held field must not expose an action/value');
      const dining=destination!.categories.some(id=>snapshot.categories.find(c=>c.id===id)?.name.en==='Dining');
      if (['menu','booking'].includes(item.field) && !dining) fail('dining field on unrelated category');
      if (item.field==='programme' && !destination!.categories.some(id=>/Cinema|Entertainment/.test(snapshot.categories.find(c=>c.id===id)?.name.en??''))) fail('programme on unrelated category');
    }
  }
}
/** Proposals are visible only in explicitly built local review outputs, never fixtures. */
export function destinationEnrichment(mallId:MallId, destination:Destination) {
  return !destination.fixture ? enrichmentRecords.find(r=>r.mallId===mallId&&r.destinationId===destination.id)?.fields??[] : [];
}
