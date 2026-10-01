import { readFileSync, existsSync } from 'node:fs';
import vm from 'node:vm';
for(const path of ['public/index.html','public/adapter.js','netlify/functions/pipeline.mjs'])if(!existsSync(path))throw new Error('Missing '+path);
new vm.Script(readFileSync('public/adapter.js','utf8'));
const html=readFileSync('public/index.html','utf8');
for(const match of html.matchAll(/<script>([\s\S]*?)<\/script>/g))new vm.Script(match[1]);
console.log('Dashboard files and browser scripts verified.');

