import {execFileSync} from 'node:child_process';
import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';
import {dirname,resolve} from 'node:path';
import {createHash} from 'node:crypto';
const root=process.cwd();
const git=(cwd,...args)=>execFileSync('git',args,{cwd,encoding:'utf8',maxBuffer:8*1024*1024}).trim();
const revision=git(root,'rev-parse','HEAD');
const paths=['src/components/Explorer.tsx'];
const hash=async p=>createHash('sha256').update(await readFile(p)).digest('hex');
const receipt={at:new Date().toISOString(),sharedCommit:revision,scope:'Separate hidden Discovery composition from map reveal; assets and content unchanged',sites:[]};
for(const [folder,branch]of [['.scratch/mall-branch-bootstrap','vincom-dong-khoi'],['.scratch/issue-0005-takashimaya','takashimaya']]){
 const worktree=resolve(root,'../..',folder);
 if(git(worktree,'branch','--show-current')!==branch||git(worktree,'status','--porcelain'))throw Error('Expected clean site branch '+branch);
 const files=[];
 for(const path of paths){const target=resolve(worktree,'visitor-app',path);await mkdir(dirname(target),{recursive:true});await copyFile(resolve(root,path),target);const sha256=await hash(resolve(root,path));if(sha256!==await hash(target))throw Error('Copy drift '+path);files.push({path,sha256});}
 git(worktree,'add','--',...paths.map(p=>'visitor-app/'+p));
 git(worktree,'commit','-qm','Separate Discovery map layout from reveal timing');
 for(const {path,sha256}of files)if(sha256!==await hash(resolve(worktree,'visitor-app',path)))throw Error('Post-commit drift '+path);
 receipt.sites.push({worktree,branch,commit:git(worktree,'rev-parse','HEAD'),verifiedSharedFiles:files.length,sha256Match:true,files});
 console.log(branch+' '+receipt.sites.at(-1).commit+' '+files.length+' exact file matches');
 await writeFile(resolve(root,'evidence/discovery-handoff-2026-10-18-r5/propagation.json'),JSON.stringify(receipt,null,2)+'\n');
}
