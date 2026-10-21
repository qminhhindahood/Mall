import {readFile,writeFile} from 'node:fs/promises';
const p='src/components/JourneyAtlas.tsx';let s=await readFile(p,'utf8');
s=s.replace("import '../styles/journey-atlas.css';","import '../styles/journey-atlas.css';\nimport {planRoute} from '../data/plan-routes';");
s=s.replace("const defaults=shops.find(p=>p.destinationId===network.endpoints[1].destinationId)!;","const defaults=shops.find(p=>p.destinationId===(site.mallId==='saigon-centre'?'saigon-prototype-mlb':network.endpoints[1].destinationId))!;\n const initialFrom=site.mallId==='saigon-centre'?shops.find(p=>p.destinationId==='saigon-prototype-calvinklein')!:landmarks[0];");
s=s.replace('useState<Place>(landmarks[0])','useState<Place>(initialFrom)').replace('useState(network.floor)','useState(initialFrom.floor)');
s=s.replace('const path=from.floor','const legacyPath=from.floor');
s=s.replace(' const same=from.id'," const plan=planRoute(site.mallId,from.destinationId,to.destinationId);\n const path=plan?{edges:plan.steps.map(s=>({instruction:{en:s.text}})),nodes:[]}:legacyPath;\n const same=from.id");
s=s.replace("const routePoints=path&&floorId===network.floor?path.nodes.map(n=>mapPoint(n.x,n.y)):[];","const planLeg=plan?.legs.find(l=>l.floor===floorId);\n const routePoints=planLeg?planLeg.points.map(([x,y])=>{const [a,b,c,d,e,f]=frame.transform;return [a*x+c*y+e,b*x+d*y+f]}):legacyPath&&floorId===network.floor?legacyPath.nodes.map(n=>mapPoint(n.x,n.y)):[];");
s=s.replace("function routeAdvance(){if(!path)return;setExpanded(true);setFloorId(network.floor);setStep(s=>s>=path.edges.length?-1:s+1)}","function routeAdvance(){if(!path)return;setExpanded(true);const next=step>=path.edges.length?-1:step+1;setStep(next);setFloorId(plan?plan.steps[Math.max(0,Math.min(next,plan.steps.length-1))].floor:network.floor)}");
s=s.replace("path?'Reviewed same-floor area route'","path?(plan?'Plan-based cross-floor route':'Reviewed same-floor area route')");
s=s.replace("Public-area guidance to the destination frontage. No exact doorway, live location, distance or arrival time is claimed.","{plan?'Zone A is paired from the supplied L2/L3 plans. Confirm the destination floor at the lift; current operation is not verified.':'Public-area guidance to the destination frontage.'} No exact doorway, live location, distance or arrival time is claimed.");
s=s.replace("setStep(i);setFloorId(network.floor)","setStep(i);setFloorId(plan?plan.steps[i].floor:network.floor)");
s=s.replace("'3 areas on L5'","'CALVIN KLEIN L2 ↔ MLB L3 via plan-paired Zone A, plus 3 areas on L5'");
s=s.replace('Cross-floor connector pairings remain unverified.','Other floor connections remain unreviewed. Zone A L2/L3 has plan-based pairing only.');
s=s.replace("function open(which:'from'|'to')","function optionCoverage(p:Place){const a=editing==='from'?p:from,b=editing==='to'?p:to;if(a.id===b.id)return 'Same place';if(planRoute(site.mallId,a.destinationId,b.destinationId))return 'Plan-based route available';const dest=site.destinations.find(d=>d.id===b.destinationId);const n=dest&&supportedNetwork(site.mallId,dest,b.floor);if(a.floor===b.floor&&a.start&&n&&areaPath(n,b.destinationId!,a.start))return 'Reviewed area route available';return 'Map only · walking connection not reviewed'}\n function open(which:'from'|'to')");
s=s.replace("{p.floor} · {p.start?'Reviewed route start':p.areaIds.length?'Mapped area':'Floor only'}","{p.floor} · {p.start?'Reviewed route start':p.areaIds.length?'Mapped area':'Floor only'}<em className=\"atlas-option-coverage\">{optionCoverage(p)}</em>");
await writeFile(p,s);

