import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const out='evidence/combined-local-2026-10-19-r1',rows=[];
const hash=b=>createHash('sha256').update(b).digest('hex');
for(const mall of ['saigon-centre','vincom-dong-khoi'])for(const width of [1280,390]){
 const en=`${mall}-en-${width}.png`,vi=`${mall}-vi-${width}.png`;
 const enInput=readFileSync(`${out}/${en}`),viInput=readFileSync(`${out}/${vi}`);
 writeFileSync(`${out}/${en}`,viInput);writeFileSync(`${out}/${vi}`,enInput);
 rows.push({startingLocale:'en',renderedLocale:'vi',inputFile:en,correctedFile:vi,sha256:hash(enInput)},{startingLocale:'vi',renderedLocale:'en',inputFile:vi,correctedFile:en,sha256:hash(viInput)});
}
const results=JSON.parse(readFileSync(`${out}/review-results.json`));
for(const r of results){r.renderedLocale=r.locale==='en'?'vi':'en';r.screenshot=`${r.mall}-${r.renderedLocale}-${r.width}.png`;}
writeFileSync(`${out}/review-results.json`,JSON.stringify(results,null,2)+'\n');
writeFileSync(`${out}/screenshot-label-correction.json`,JSON.stringify({at:new Date().toISOString(),reason:'Inherited harness captures after locale switch; filenames now identify rendered locale, while result locale identifies starting route.',rows},null,2)+'\n');
