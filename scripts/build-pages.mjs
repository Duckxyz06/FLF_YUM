import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
const dist=new URL('../dist/',import.meta.url),docs=new URL('../docs/',import.meta.url);
await fs.rm(docs,{recursive:true,force:true});await fs.cp(dist,docs,{recursive:true});
const files=['app.js','files.js','core.js'];const contents=await Promise.all(files.map(n=>fs.readFile(new URL(n,dist),'utf8')));const revision=createHash('sha256').update(contents.join('\n')).digest('hex').slice(0,12);
for(let i=0;i<files.length;i++){let text=contents[i];for(const n of ['files.js','core.js'])text=text.replaceAll(`'./${n}'`,`'./${n}?v=${revision}'`);await fs.writeFile(new URL(files[i],docs),text);}
const html=await fs.readFile(new URL('index.html',docs),'utf8');await fs.writeFile(new URL('index.html',docs),html.replace('./app.js',`./app.js?v=${revision}`));await fs.writeFile(new URL('.nojekyll',docs),'');console.log('GitHub Pages ready, revision '+revision);
