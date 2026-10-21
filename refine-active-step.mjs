import {readFile,writeFile} from 'node:fs/promises';
const p='src/components/JourneyAtlas.tsx';let s=await readFile(p,'utf8');s=s.replace('setExpanded(true);const next','const next');
const start=s.indexOf('{step>=0&&<div className="atlas-current-step">'),end=s.indexOf('<ol>',start);
const current=s.slice(start,end);s=s.slice(0,start)+s.slice(end);
const marker='    <button className="atlas-disclosure"';s=s.replace(marker,'    {path&&'+current.slice(1,-1)+'}\n'+marker);
await writeFile(p,s);

