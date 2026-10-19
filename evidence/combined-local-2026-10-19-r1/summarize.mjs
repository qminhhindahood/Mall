import {readFileSync,writeFileSync,existsSync,readdirSync} from 'node:fs';
const out='evidence/combined-local-2026-10-19-r1';
const read=p=>existsSync(`${out}/${p}`)?JSON.parse(readFileSync(`${out}/${p}`,'utf8').replace(/^\uFEFF/,'')):null;
const suites=[];
for(const [name,path,expected]of[
 ['entry-controls','entry-controls-results.json',4],['detail-parity','detail-parity-results.json',4],['map-pointer','interaction/browser-results.json',8],
 ['fixtures','fixture-results.json',4],['journey','journey/browser-results.json',16],['fallback','fallback-results.json',16],
 ['area-history','area-history-results.json',4],['search-review','review-results.json',8],['rapid-reversals','reversal-results.json',8]
]){
 const data=read(path),runs=Array.isArray(data)?data:data?.runs??[];
 const failures=runs.flatMap(r=>[...new Set([...(r.failed??[]),...(r.checks??[]).filter(c=>typeof c==='object'&&!c.pass).map(c=>c.label??c.name)])]);
 suites.push({name,path,expectedCases:expected,cases:runs.length,assertions:runs.reduce((n,r)=>n+(r.checks?.length??0),0),failures,complete:runs.length===expected});
}
const discovery=read('discovery-results.json');
if(discovery){const runs=[...discovery.categories,...discovery.runs];suites.push({name:'discovery',path:'discovery-results.json',expectedCases:60,cases:runs.length,assertions:runs.reduce((n,r)=>n+r.checks.length,0),failures:[...discovery.failed,...discovery.static.flatMap(r=>r.failures),...runs.flatMap(r=>r.failed)],complete:runs.length===60});}
else suites.push({name:'discovery',expectedCases:60,cases:0,assertions:0,failures:[],complete:false});
const transitions=read('transition-results.json'),pacing=read('pacing-results.json'),boundary=read('public-fixture-boundary.json'),builds=read('builds.json');
const motion={transitionCases:transitions?.runs.length??0,expectedTransitionCases:16,transitionSamples:transitions?.runs.reduce((n,r)=>n+(r.samples?.length??0),0)??0,transitionFailures:transitions?.runs.flatMap(r=>r.failed)??[],pacingCases:pacing?.length??0,expectedPacingCases:8,pacingCompositions:pacing?.reduce((n,r)=>n+r.samples.length,0)??0,pacingFailures:pacing?.flatMap(r=>r.failed)??[]};
const walk=dir=>existsSync(dir)?readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(`${dir}/${e.name}`):[`${dir}/${e.name}`]):[];
const summary={at:new Date().toISOString(),sourceCheckpoint:'b114498',builds:builds??[],browserCases:suites.reduce((n,r)=>n+r.cases,0),browserAssertions:suites.reduce((n,r)=>n+r.assertions,0),expectedBrowserCases:132,suites,staticRouteChecks:discovery?.static.reduce((n,r)=>n+r.checks,0)??0,boundaryChecks:boundary??[],motion,freshScreenshots:walk(out).filter(p=>p.endsWith('.png')&&!p.includes('/pre-css/')).length,initialFailures:{areaHistory:{cases:2,reason:'Copied phone harness opened a fresh collapsed-map deep link then attempted a hidden map control. Targeted VI retry expands through visible control before exercising the same history assertions.',preserved:'area-history-initial-results.json'},detailParity:{cases:2,reason:'Copied Vietnamese assertion expected lowercase toàn thương hiệu; actual rendered scope starts Toàn thương hiệu. Only VI cases rerun with full scope and exact accepted uncertainty assertions.',preserved:'detail-parity-initial-results.json'},provenance:{reason:'Git blob LF versus Windows checkout CRLF; raw and normalized SHA-256s retained.',preserved:'provenance-initial-line-endings.json'}},limitations:['Installed local Chrome and emulated CSS/touch/reduced-motion viewports; no physical-device or native background/return acceptance','No production, push, deployment or release acceptance']};
const cssFollowup=read('final-css-execution.json');
if(cssFollowup){summary.sourceCheckpoint=cssFollowup.sourceCheckpoint;summary.cssFollowup={...cssFollowup,focusedCases:12,focusedAssertions:suites.filter(r=>['search-review','detail-parity'].includes(r.name)).reduce((n,r)=>n+r.assertions,0),computedStyleMeasurementPages:2,scope:'Four final builds plus eight responsive search/control/detail cases, four full detail-parity cases and two computed-style measurement pages. Broad behavior and motion remain frozen at b114498; only the twelve-line typography override differs.',initialBuilds:'pre-css/builds.json',initialProvenance:'pre-css/provenance.json',initialBehaviorSummary:'pre-css/validation-summary.json'};}
summary.complete=suites.every(r=>r.complete)&&motion.transitionCases===16&&motion.pacingCases===8&&builds?.length===4&&(!cssFollowup||cssFollowup.runs.length===4&&cssFollowup.runs.every(r=>r.exitCode===0));
summary.failures=[...suites.flatMap(r=>r.failures),...motion.transitionFailures,...motion.pacingFailures,...(boundary??[]).filter(r=>!r.pass).map(r=>`${r.mall}/${r.mode} output boundary`),...(builds??[]).filter(r=>r.exitCode!==0).map(r=>`${r.mode}/${r.mall} build`)];
writeFileSync(`${out}/validation-summary.json`,JSON.stringify(summary,null,2)+'\n');
console.log(JSON.stringify({complete:summary.complete,browserCases:summary.browserCases,assertions:summary.browserAssertions,staticRouteChecks:summary.staticRouteChecks,motion,failures:summary.failures,pending:suites.filter(r=>!r.complete).map(r=>r.name),freshScreenshots:summary.freshScreenshots}));



