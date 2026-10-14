import { readFile, writeFile } from 'node:fs/promises';
const root = 'evidence/runtime-continuation-2026-10-14/';
const raw = JSON.parse(await readFile(root + 'browser-samples.json', 'utf8'));
const rows = raw.samples.map(({label,value:v}) => {
  const points=[{at:v.log.startedAt},...v.log.heartbeat];
  const maxHeartbeatGapMs=Math.max(...points.slice(1).map((p,i)=>p.at-points[i].at));
  const hidden=v.log.visibility.some(e=>e.state!=='visible')||v.log.heartbeat.some(e=>e.state!=='visible');
  const entry=v.measures.find(e=>e.detail?.operation==='navigation-to-frame');
  const requests=v.measures.filter(e=>e.detail?.operation==='request-to-frame');
  const early=v.log.events.find(e=>e.type==='entry-ready-early-request');
  const map=v.log.events.find(e=>e.type==='requested-map-ready');
  const discovery=v.log.events.find(e=>e.type==='prepared-discovery-ready');
  const pass=v.log.done&&!v.final.loader&&!v.final.error&&!v.final.inert&&v.final.focus==='scene-discovery'&&early.alreadyPrepared===false&&Number(early.frame)>0&&map.focus==='scene-map'&&Number(map.frame)>0&&discovery.focus==='scene-discovery'&&Number(discovery.frame)>0&&requests.length===2&&requests.every(e=>e.detail.outcome==='ready');
  if(!pass)throw new Error('Runtime assertion failed: '+label);
  // Conservative host qualification, not a browser/performance standard.
  const qualified=!hidden&&maxHeartbeatGapMs<750;
  return {label,mallId:entry.detail.mallId,cache:label.includes('-cold-')?'fetch-cache-reload/new-query; warm process/shader caches':'same-origin navigation; retained HTTP/process caches',runtimePass:pass,qualified,exclusion:qualified?null:'hidden interval or >=750ms observer gap; possible suspension/long-task ambiguity',maxHeartbeatGapMs,navigationToFrameMs:entry.duration,earlyUnpreparedMapMs:requests.find(e=>e.detail.kind==='map').duration,preparedDiscoveryMs:requests.find(e=>e.detail.kind==='discovery').duration,observerStartedAtMs:v.log.startedAt,profile:v.profile};
});
const median=a=>{a.sort((a,b)=>a-b);return a[Math.floor(a.length/2)]};
const groups=[];
for(const mallId of ['saigon-centre','vincom-dong-khoi'])for(const cache of ['cold','warm']){
  const samples=rows.filter(r=>r.mallId===mallId&&r.label.includes('-'+cache+'-')&&r.qualified);
  groups.push({mallId,cache,count:samples.length,labels:samples.map(s=>s.label),medianNavigationToFrameMs:median(samples.map(s=>s.navigationToFrameMs)),maxNavigationToFrameMs:Math.max(...samples.map(s=>s.navigationToFrameMs)),maxEarlyUnpreparedMapMs:Math.max(...samples.map(s=>s.earlyUnpreparedMapMs)),maxPreparedDiscoveryMs:Math.max(...samples.map(s=>s.preparedDiscoveryMs))});
}
const summary={source:raw.source,qualification:'No recorded hidden interval; pre-hydration observer plus <=750ms maximum heartbeat gap. Gap cutoff is conservative local host screening, not proof of unsuspended scheduling or visibility before inline observer start. T3 host visible:false disagrees with page visible; owner confirms foreground. Local reduced-motion browser only.',rows,groups,excludedInitialProbe:{label:'saigon-cold-1',reason:'partial profile/resources and observer gap >1700ms; excluded from all performance acceptance',navigationToFrameMs:raw.excludedInitialProbe.measures.find(m=>m.detail.operation==='navigation-to-frame').duration},limits:['No disk/browser-context/shader-cache reset; cold means runtime fetch reload only','No controlled identity-vs-Brotli latency comparison; exact transport comparison is separate','Local HTTP, no configured throttling; not Wi-Fi or production','Initial visibility unobserved before inline observer (recorded start times); document.hasFocus false and T3 status mismatch retained','No trace/Lighthouse/CWV, physical-device or deployment acceptance']};
await writeFile(root+'summary.json',JSON.stringify(summary,null,2)+'\n');
console.log(JSON.stringify({groups,excluded:rows.filter(r=>!r.qualified).map(r=>r.label),runtimePasses:rows.length}));
