import fs from 'node:fs';
import path from 'node:path';
import type { FloorDataset, MallId } from '../runtime/scene-contract';
import { validateContent, type DirectorySnapshot } from './content';
export type { Destination } from './content';
import type { Destination } from './content';
export type SiteData = {
  mallId: MallId; name: string; defaultFloor: string; geometry: FloorDataset;
  assetRevision: string; exteriorUrl: string; destinations: Destination[];
  geometryUrl: string; content: DirectorySnapshot;
  geometryIdentityUrl: string; exteriorIdentityUrl: string;
};
const mallId = (process.env.MALL_ID ?? 'saigon-centre') as MallId;
if (!['saigon-centre', 'vincom-dong-khoi'].includes(mallId)) throw new Error('Unknown MALL_ID');
const labels = mallId === 'saigon-centre' ? ['B2','B1','L1','L2','L3','L4','L5','L6'] : ['B3','B2','B1','L1','M','L2','L3'];
const geometryPath = path.join(process.cwd(),'data','malls',mallId,'floor-geometry.json');
const geometry: FloorDataset = fs.existsSync(geometryPath) ? JSON.parse(fs.readFileSync(geometryPath, 'utf8')) : {
  revision: 'foundation-unavailable',
  frame: { version: 'unavailable', units: 'unavailable', scaleStatus: 'not established', orientationStatus: 'not established' },
  floors: labels.map((id, order) => ({ id, label: id, order, elevation: order, bounds: [0,0,1,1], regions: [], sources: [], preview: null })),
};
const contentPath = path.join(process.cwd(),'data','malls',mallId,'directory.json');
let snapshot: DirectorySnapshot = JSON.parse(fs.readFileSync(contentPath,'utf8'));
if (process.env.INCLUDE_TEST_FIXTURES === 'research') {
  const { createResearchFixtures } = await import('./research-fixtures');
  snapshot = createResearchFixtures(JSON.parse(fs.readFileSync(path.join(process.cwd(),'data','research',`${mallId}.json`),'utf8')),mallId,geometry);
}
if (process.env.INCLUDE_TEST_FIXTURES === '1') {
  const { createFixtures } = await import('./fixtures');
  snapshot = createFixtures(mallId,geometry);
}
const content = validateContent(snapshot,mallId,geometry);
const destinations = content.destinations;
const manifestPath = path.join(process.cwd(),'data','malls',mallId,'asset-manifest.json');
const manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath,'utf8')) : {};
export const site: SiteData = {
  mallId, name: mallId === 'saigon-centre' ? 'Saigon Centre' : 'Vincom Center Đồng Khởi',
  content, defaultFloor: mallId === 'saigon-centre' ? 'L5' : 'B2', geometry,
  assetRevision: manifest.assetRevision ?? 'photo-polish-2026-10-12-delivery-r2', exteriorUrl: manifest.preferredExteriorUrl ?? '/models/exterior.glb', destinations,
  exteriorIdentityUrl: manifest.identityUrl ?? '/models/exterior.glb',
  geometryUrl: manifest.floorGeometry?.url ?? '/data/floor-geometry.json',
  geometryIdentityUrl: manifest.floorGeometry?.identityUrl ?? '/data/floor-geometry.json',
};
export const clientSite: SiteData = {...site, geometry: {...site.geometry, floors: site.geometry.floors.map(floor=>({...floor,regions:[],sources:[]}))}};
