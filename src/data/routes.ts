import type { Locale, SceneKind } from '../runtime/scene-contract';
export const floorRoute = (locale: Locale, floorId: string) => `/${locale}/${locale==='vi'?'tang':'floors'}/${encodeURIComponent(floorId)}`;
export const storeRoute = (locale: Locale, id: string) => `/${locale}/${locale==='vi'?'cua-hang':'stores'}/${encodeURIComponent(id)}`;
export function selectionHref(selection: {locale:Locale;floorId:string;kind:SceneKind;destinationId?:string}) {
  const path = selection.destinationId ? storeRoute(selection.locale,selection.destinationId) : selection.kind==='map' ? floorRoute(selection.locale,selection.floorId) : `/${selection.locale}`;
  return `${path}?${new URLSearchParams({floor:selection.floorId,view:selection.kind})}`;
}
