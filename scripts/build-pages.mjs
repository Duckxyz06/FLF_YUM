import fs from 'node:fs/promises';
await fs.rm(new URL('../docs/',import.meta.url),{recursive:true,force:true});
await fs.cp(new URL('../dist/',import.meta.url),new URL('../docs/',import.meta.url),{recursive:true});
await fs.writeFile(new URL('../docs/.nojekyll',import.meta.url),'');
console.log('GitHub Pages files prepared in docs/');
