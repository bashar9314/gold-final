import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
let data=null,version=0,forceConflict=false;
globalThis.__testStore={
 async get(){return structuredClone(data);},
 async getWithMetadata(){return data?{data:structuredClone(data),etag:String(version)}:null;},
 async setJSON(key,value,options={}){if(key!=='workspace')return {modified:true};if(forceConflict){forceConflict=false;data={...data,templates:[{id:'parallel',name:'Keep me'}]};version++;return {modified:false};}if((options.onlyIfNew&&data)||(options.onlyIfMatch&&options.onlyIfMatch!==String(version)))return {modified:false};data=structuredClone(value);version++;return {modified:true,etag:String(version)};}
};
const code=readFileSync('netlify/functions/pipeline.mjs','utf8').replace("import { getStore } from '@netlify/blobs';","const getStore=()=>globalThis.__testStore;").replace("import { validate } from './lib/validation.mjs';",readFileSync('netlify/functions/lib/validation.mjs','utf8').replaceAll('export ',''));
const {default:handler}=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
process.env.DASHBOARD_PASSWORD='test-password-only-123456';
const req=(method,body,cookie='',origin='https://dashboard.example')=>new Request('https://dashboard.example/.netlify/functions/pipeline',{method,headers:{Origin:origin,Cookie:cookie,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});
let cookie;
test('Unauthenticated reads and bad sign-ins are denied',async()=>{assert.equal((await handler(req('GET'))).status,401);assert.equal((await handler(req('POST',{action:'login',password:'wrong'}))).status,401);});
test('Strong-password configuration is required',async()=>{const before=process.env.DASHBOARD_PASSWORD;delete process.env.DASHBOARD_PASSWORD;assert.equal((await handler(req('GET'))).status,503);process.env.DASHBOARD_PASSWORD=before;});
test('Sign-in sets a protected cookie',async()=>{const r=await handler(req('POST',{action:'login',password:process.env.DASHBOARD_PASSWORD}));assert.equal(r.status,200);const header=r.headers.get('set-cookie');assert.match(header,/HttpOnly; Secure; SameSite=Strict/);cookie=header.split(';')[0];});
test('Mutations reject a different origin',async()=>{assert.equal((await handler(req('POST',{action:'mutate'},cookie,'https://attacker.example'))).status,403);});
test('Lead creation, update, concurrent merge and removal preserve data',async()=>{let r=await handler(req('POST',{action:'mutate',op:{type:'add',collection:'leads',id:'one',data:{company:'Test <company>',stage:'new'}}},cookie));assert.equal(r.status,200);forceConflict=true;r=await handler(req('POST',{action:'mutate',op:{type:'update',collection:'leads',id:'one',data:{stage:'quote'}}},cookie));assert.equal(r.status,200);assert.equal(data.leads[0].stage,'quote');assert.equal(data.templates[0].name,'Keep me');r=await handler(req('POST',{action:'mutate',op:{type:'delete',collection:'leads',id:'one'}},cookie));assert.equal(r.status,200);assert.equal(data.leads.length,0);assert.equal(data.trash[0].record.company,'Test <company>');});
test('Invalid collections, missing updates and forged cookies are denied',async()=>{assert.equal((await handler(req('POST',{action:'mutate',op:{type:'add',collection:'invalid',id:'bad',data:{}}},cookie))).status,400);assert.equal((await handler(req('POST',{action:'mutate',op:{type:'update',collection:'leads',id:'missing',data:{}}},cookie))).status,409);assert.equal((await handler(req('GET',null,'magnolia_session=9999999999999.fake'))).status,401);});
test('Backup merges preserve existing edits and duplicate IDs are skipped',async()=>{
 const incoming={leads:[{id:'restored',company:'Saved contractor',stage:'new',sourceCalled:true,followUp:''}],activity:[],templates:[]};
 assert.equal((await handler(req('POST',{action:'restore',state:incoming},cookie))).status,200);
 assert.equal((await handler(req('POST',{action:'mutate',op:{type:'update',collection:'leads',id:'restored',data:{notes:'Keep this edit'}}},cookie))).status,200);
 assert.equal((await handler(req('POST',{action:'restore',state:incoming},cookie))).status,200);
 assert.equal(data.leads.filter(x=>x.id==='restored').length,1);assert.equal(data.leads[0].notes,'Keep this edit');assert.equal(data.leads[0].sourceCalled,true);
});
test('Call activity and follow-up update commit together and retries do not duplicate',async()=>{
 const body={action:'log',leadId:'restored',eventId:'call-once',event:{type:'spoke',at:new Date().toISOString(),note:'Confirmed next call'},patch:{stage:'talking',followUp:'2026-10-05'}};
 forceConflict=true;assert.equal((await handler(req('POST',body,cookie))).status,200);assert.equal((await handler(req('POST',body,cookie))).status,200);
 assert.equal(data.activity.filter(x=>x.id==='call-once').length,1);assert.equal(data.leads[0].followUp,'2026-10-05');
});
test('Invalid emails, unsafe websites and impossible dates are rejected',async()=>{
 for(const fields of [{email:'invalid'},{website:'javascript:alert(1)'},{followUp:'2026-02-30'},{stage:'fake'}])assert.equal((await handler(req('POST',{action:'mutate',op:{type:'update',collection:'leads',id:'restored',data:fields}},cookie))).status,400);
});

