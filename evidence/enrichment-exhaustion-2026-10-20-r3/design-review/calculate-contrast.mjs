import {readFileSync,writeFileSync} from 'node:fs';
const out='evidence/enrichment-exhaustion-2026-10-20-r3/design-review';
const lum=value=>{const c=value.match(/\d+/g).slice(0,3).map(Number).map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return c[0]*.2126+c[1]*.7152+c[2]*.0722;};
const rows=[];
for(const r of JSON.parse(readFileSync(out+'/results.json')))for(const sample of r.samples)for(const color of sample.measurements.colors){
 const background=sample.measurements.background,key=`${r.mall}:${color}:${background}`;
 if(rows.some(row=>row.key===key))continue;
 const a=lum(color),b=lum(background),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);
 rows.push({key,mall:r.mall,color,background,ratio:Number(ratio.toFixed(2)),normalTextAA:ratio>=4.5});
}
writeFileSync(out+'/sampled-contrast.json',JSON.stringify(rows,null,2));console.log(JSON.stringify(rows));
