import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
const dist=new URL('../dist/',import.meta.url),docs=new URL('../docs/',import.meta.url);
await fs.rm(docs,{recursive:true,force:true});await fs.cp(dist,docs,{recursive:true});
// Public Pages always starts empty, even if the local checkout has private seed data.
const seed=JSON.parse(await fs.readFile(new URL('seed.json',dist),'utf8'));
await fs.writeFile(new URL('seed.json',docs),JSON.stringify({schemaVersion:1,members:[],excluded:[],branches:seed.branches.map(({name,year})=>({name,year})),contests:[],audit:[],updatedAt:null},null,2));
const files=['app.js','files.js','core.js','auth.js','auth-config.js','report.js'];const contents=await Promise.all(files.map(n=>fs.readFile(new URL(n,dist),'utf8')));const css=await fs.readFile(new URL('style.css',dist),'utf8');const revision=createHash('sha256').update(contents.join('\n')+css).digest('hex').slice(0,12);
for(let i=0;i<files.length;i++){let text=contents[i];for(const n of files)text=text.replaceAll(`'./${n}'`,`'./${n}?v=${revision}'`);await fs.writeFile(new URL(files[i],docs),text);}
const html=await fs.readFile(new URL('index.html',docs),'utf8');await fs.writeFile(new URL('index.html',docs),html.replace('./app.js',`./app.js?v=${revision}`).replace('./style.css',`./style.css?v=${revision}`));await fs.writeFile(new URL('.nojekyll',docs),'');console.log('GitHub Pages ready, revision '+revision);
