import type { Locale, SceneKind } from '../runtime/scene-contract';
export const floorRoute = (locale: Locale, floorId: string) => `/${locale}/${locale==='vi'?'tang':'floors'}/${encodeURIComponent(floorId)}`;
export const storeRoute = (locale: Locale, id: string) => `/${locale}/${locale==='vi'?'cua-hang':'stores'}/${encodeURIComponent(id)}`;
export function selectionHref(selection: {locale:Locale;floorId:string;kind:SceneKind;destinationId?:string;query?:string;categoryId?:string;discoveryCategoryId?:string;discoveryFloorId?:string;discoveryQuery?:string;discoverySearchScope?:'category';areaId?:string}, journey=false) {
  // The continuous journey keeps Discovery on Home; the dedicated page owns /discovery.
  const path = selection.destinationId ? storeRoute(selection.locale,selection.destinationId) : selection.kind==='map' ? floorRoute(selection.locale,selection.floorId) : selection.kind==='discovery'&&!journey ? `/${selection.locale}/${selection.locale==='vi'?'kham-pha':'discovery'}` : `/${selection.locale}`;
  const params=new URLSearchParams({floor:selection.floorId,view:selection.kind});
  for(const [key,value] of Object.entries({q:selection.query,category:selection.categoryId,collection:selection.discoveryCategoryId,collectionFloor:selection.discoveryFloorId,collectionQ:selection.discoveryQuery,collectionScope:selection.discoverySearchScope,area:selection.areaId}))if(value)params.set(key,value);
  return `${path}?${params}`;
}
