import fs from 'node:fs';
import path from 'node:path';
import type { FloorDataset, Locale, MallId } from '../runtime/scene-contract';
export type Destination = {
  id: string; name: Record<Locale, string>; primaryFloor: string;
  floors: string[]; description: Record<Locale, string>; reviewedAt: string;
  fixture?: boolean;
};
export type SiteData = {
  mallId: MallId; name: string; defaultFloor: string; geometry: FloorDataset;
  assetRevision: string; exteriorUrl: string; destinations: Destination[];
  geometryUrl: string;
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
const destinationsPath = path.join(process.cwd(),'data','malls',mallId,'destinations.json');
const reviewed: Destination[] = fs.existsSync(destinationsPath) ? JSON.parse(fs.readFileSync(destinationsPath, 'utf8')) : [];
const manifestPath = path.join(process.cwd(),'data','malls',mallId,'asset-manifest.json');
const manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath,'utf8')) : {};
const destinations = reviewed.filter(d => !d.fixture);
if (process.env.INCLUDE_TEST_FIXTURES === '1') {
  destinations.push({ id: 'loading-test-store', name: { vi: 'Cửa hàng thử nghiệm', en: 'Test-only store' }, primaryFloor: 'L1', floors: ['L1','L2'], description: { vi: 'Dữ liệu thử nghiệm — không phải cửa hàng hiện tại.', en: 'Browser fixture — not a current store.' }, reviewedAt: 'test-only', fixture: true });
}
export const site: SiteData = {
  mallId, name: mallId === 'saigon-centre' ? 'Saigon Centre' : 'Vincom Center Đồng Khởi',
  defaultFloor: mallId === 'saigon-centre' ? 'L5' : 'B2', geometry,
  assetRevision: manifest.assetRevision ?? 'photo-polish-2026-10-12-delivery-r2', exteriorUrl: manifest.preferredExteriorUrl ?? '/models/exterior.glb', destinations,
  exteriorIdentityUrl: manifest.identityUrl ?? '/models/exterior.glb',
  geometryUrl: manifest.floorGeometry?.url ?? '/data/floor-geometry.json',
  geometryIdentityUrl: manifest.floorGeometry?.identityUrl ?? '/data/floor-geometry.json',
};
export const clientSite: SiteData = {...site, geometry: {...site.geometry, floors: site.geometry.floors.map(floor=>({...floor,regions:[],sources:[]}))}};
