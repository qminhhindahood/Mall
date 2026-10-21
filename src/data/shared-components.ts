import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import type { DirectorySnapshot, Destination, MappedArea } from './content';
import type { FloorDataset } from '../runtime/scene-contract';

type SharedDecision = {
  destinationId: string; floorId: string; expectedDestination: Destination;
  geometryFrame: FloorDataset['frame'];
  floorSources: FloorDataset['floors'][number]['sources'];
  members: { expectedDestination: Destination; expectedArea: MappedArea; geometryRegions: FloorDataset['floors'][number]['regions'] }[];
  associationDetail: NonNullable<Destination['locations'][number]['associationDetail']>;
};
export type SharedComponentsSupplement = {
  revision: string; mallId: string; baseDirectoryRevision: string; activation: string;
  reviewEvidence: {path: string; sha256: string}; decision: SharedDecision;
};
type SharedReview = {
  status: string; reviewedBy: string; reviewedAt: string; decision: SharedDecision;
  sourceSha256: Record<string,string>;
};

/** Reuse reviewed component areas without changing their geometry or ownership. Build time only. */
export function applySharedComponents(root: string, snapshot: DirectorySnapshot, geometry: FloorDataset, supplement: SharedComponentsSupplement): DirectorySnapshot {
  if (snapshot.mallId !== supplement.mallId || snapshot.approval !== 'approved' || supplement.activation !== 'accepted-source-review') return snapshot;
  const fail = (message: string): never => {throw new Error(`Shared components: ${message}`);};
  const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
  const bytes = (relative: string) => {
    const resolved = path.resolve(root,relative);
    const local = path.relative(path.resolve(root),resolved);
    if (local.startsWith('..') || path.isAbsolute(local)) fail('evidence outside workspace');
    return fs.readFileSync(resolved);
  };
  const hash = (value: Buffer) => createHash('sha256').update(value).digest('hex');
  if (snapshot.revision !== supplement.baseDirectoryRevision) fail('directory revision drift');
  const reviewBytes = bytes(supplement.reviewEvidence.path);
  if (hash(reviewBytes) !== supplement.reviewEvidence.sha256) fail('review hash drift');
  const review: SharedReview = JSON.parse(reviewBytes.toString('utf8'));
  if (review.status !== 'accepted-source-review' || !review.reviewedBy?.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(review.reviewedAt)) fail('unaccepted review');
  if (!same(review.decision,supplement.decision)) fail('decision differs from source review');
  if (!Object.keys(review.sourceSha256).length) fail('missing source hashes');
  for (const [source,expected] of Object.entries(review.sourceSha256)) if (hash(bytes(source)) !== expected) fail(`source hash drift: ${source}`);
  const row = supplement.decision;
  const target = snapshot.destinations.find(d=>d.id===row.destinationId);
  if (!target || !same(target,row.expectedDestination)) fail('target destination drift');
  const location = target!.locations.find(l=>l.floorId===row.floorId);
  if (!location || location.certainty !== 'floor-confirmed' || location.areaIds.length) fail('expected target floor-only location');
  const floor = geometry.floors.find(f=>f.id===row.floorId);
  if (!floor || !same(geometry.frame,row.geometryFrame) || !same(floor.sources,row.floorSources)) fail('geometry frame or source drift');
  if (row.associationDetail.kind !== 'partial-source-layout' || !row.associationDetail.note.en.trim() || !row.associationDetail.note.vi.trim()) fail('missing bilingual partial shared scope');
  if (row.members.length !== 2) fail('expected exactly two reviewed components');
  const memberIds = new Set<string>();
  const areaIds: string[] = [];
  for (const member of row.members) {
    const child = snapshot.destinations.find(d=>d.id===member.expectedDestination.id);
    if (!child || child.id===target!.id || memberIds.has(child.id) || !same(child,member.expectedDestination)) fail('member destination drift or duplicate');
    memberIds.add(child!.id);
    const area = snapshot.areas.find(a=>a.id===member.expectedArea.id);
    if (!area || area.floorId !== row.floorId || areaIds.includes(area.id) || !same(area,member.expectedArea)) fail('component area drift or duplicate');
    const childLocation = child!.locations.find(l=>l.floorId===row.floorId);
    if (!childLocation || childLocation.certainty !== 'area-confirmed' || !childLocation.areaIds.includes(area!.id)) fail('member no longer owns reviewed association');
    if (!same(area!.regionIds,member.geometryRegions.map(r=>r.id)) || !area!.regionIds.length) fail('component region identity drift');
    for (const region of member.geometryRegions) {
      if (!same(floor!.regions.find(r=>r.id===region.id),region)) fail('component geometry drift');
      if (snapshot.areas.filter(a=>a.floorId===row.floorId && a.regionIds.includes(region.id)).length !== 1) fail('component region ownership drift');
    }
    areaIds.push(area!.id);
  }
  const source = `data/research/${supplement.revision}.json; source-reviewed shared food-village components only; exclusive or complete boundary, current occupancy and exact entrances not established`;
  return {...snapshot,revision:`${snapshot.revision}+${supplement.revision}`,destinations:snapshot.destinations.map(d=>d.id===row.destinationId?{...d,locations:d.locations.map(l=>l.floorId===row.floorId?{...l,certainty:'area-confirmed' as const,areaIds,associationDetail:row.associationDetail,source:`${l.source}; ${source}`}:l)}:d)};
}
