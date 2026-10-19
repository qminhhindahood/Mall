import type { DirectorySnapshot } from '../data/content';
import { searchDirectory } from '../data/content';
import type { FloorGeometry } from '../runtime/scene-contract';

export function discoveryAreaNumbers(content:DirectorySnapshot, categoryId:string, query:string, floorId:string, scope?:'category') {
  const matches=searchDirectory(content.destinations.filter(d=>d.status==='open'),content.categories,query,query.trim()&&scope!=='category'?'':categoryId,floorId).results;
  const ids = new Set(matches.flatMap(d=>d.locations.filter(l=>l.floorId===floorId).flatMap(l=>l.areaIds)));
  return Object.fromEntries(content.areas.filter(area=>area.floorId===floorId&&ids.has(area.id)).map((area,index)=>[area.id,index+1]));
}

function inside([x,y]:[number,number], ring:[number,number][]) {
  let result=false;
  for(let i=0,j=ring.length-1;i<ring.length;j=i++) {
    const [a,b]=ring[i],[c,d]=ring[j];
    if((b>y)!==(d>y)&&x<(c-a)*(y-b)/(d-b)+a)result=!result;
  }
  return result;
}
/** Place a label inside source geometry, not at an invented store coordinate. */
export function areaLabelPoint(floor:FloorGeometry,regionIds:string[]):[number,number]|undefined {
  const regions=floor.regions.filter(region=>regionIds.includes(region.id));
  const region=regions.sort((a,b)=>b.outer.length-a.outer.length)[0];
  if(!region)return;
  const xs=region.outer.map(p=>p[0]),ys=region.outer.map(p=>p[1]);
  const bounds=[Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys)];
  const center:[number,number]=[(bounds[0]+bounds[2])/2,(bounds[1]+bounds[3])/2];
  const valid=(point:[number,number])=>inside(point,region.outer)&&!region.holes.some(hole=>inside(point,hole));
  if(valid(center))return center;
  let best:[number,number]|undefined,distance=Infinity;
  for(let i=1;i<20;i++)for(let j=1;j<20;j++) {
    const point:[number,number]=[bounds[0]+(bounds[2]-bounds[0])*i/20,bounds[1]+(bounds[3]-bounds[1])*j/20];
    const delta=(point[0]-center[0])**2+(point[1]-center[1])**2;
    if(delta<distance&&valid(point)){best=point;distance=delta;}
  }
  return best;
}
