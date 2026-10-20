import {readFileSync,writeFileSync,copyFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const out='evidence/enrichment-exhaustion-2026-10-20-r3/validation';
const names=[4431,4432,4433,4434].flatMap(port=>[`server-${port}.log`,`server-${port}-error.log`]);
writeFileSync(`${out}/.gitignore`,'# Mutable logs held open by local acceptance/snapshot preview servers.\n'+names.map(name=>'/'+name).join('\n')+'\n');
const rows=names.map(name=>{const frozen=name.replace(/\.log$/,'.frozen.log');copyFileSync(`${out}/${name}`,`${out}/${frozen}`);const bytes=readFileSync(`${out}/${frozen}`);return {live:name,frozen,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')};});
writeFileSync(`${out}/server-log-freeze.json`,JSON.stringify({at:new Date().toISOString(),reason:'Keep mutable open server logs out of tracked evidence; frozen copies preserve receipts without restarting previews',rows},null,2)+'\n');
