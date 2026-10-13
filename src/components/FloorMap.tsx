import type { FloorGeometry } from '../runtime/scene-contract';
export default function FloorMap({ floor, title }: { floor: FloorGeometry; title: string }) {
  const [x,y,right,bottom] = floor.bounds;
  return <svg viewBox={`${x} ${y} ${Math.max(1,right-x)} ${Math.max(1,bottom-y)}`} role="img" aria-label={`${title} ${floor.label}`}>
    <title>{`${title} ${floor.label}`}</title>
    {floor.regions.map(region => <path key={region.id} fillRule="evenodd" d={[region.outer, ...region.holes].map(ring => `M${ring.map(point => point.join(',')).join(' L')} Z`).join(' ')} />)}
  </svg>;
}
