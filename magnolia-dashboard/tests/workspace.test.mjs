import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';
const tick=()=>new Promise(r=>setTimeout(r,35));
test('Workspace loads, records a lead, logs a call and persists a stage change',async()=>{
 const html=readFileSync('public/index.html','utf8');
 const dom=new JSDOM(html,{url:'http://localhost:8092',runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window; test.after(()=>w.close());w.scrollTo=()=>{};w.console.error=(...x)=>{throw new Error(x.join(' '));};
 w.eval(readFileSync('public/adapter.js','utf8'));w.eval([...html.matchAll(/<script>([\s\S]*?)<\/script>/g)][0][1]);
 await tick();await tick();await new Promise(r=>setTimeout(r,140));
 const d=w.document;assert.match(d.querySelector('#view').textContent,/Every lead/);assert.match(d.querySelector('#syncStatus').textContent,/Local preview/);
 d.querySelector('[data-act="addlead"]').click();
 d.querySelector('#a_company').value='Test Contractor';d.querySelector('#a_name').value='Test Contact';
 const form=d.querySelector('#addForm');assert.ok(form);form.dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));await tick();
 let saved=JSON.parse(w.localStorage.getItem('magnolia-sales-v1'));assert.equal(saved.leads[0].company,'Test Contractor');
 d.querySelector('[data-act="startlog"][data-t="spoke"]').click();d.querySelector('#logNote').value='Test conversation';d.querySelector('[data-act="savelog"]').click();await tick();
 saved=JSON.parse(w.localStorage.getItem('magnolia-sales-v1'));assert.equal(saved.activity[0].type,'spoke');assert.equal(saved.leads[0].stage,'talking');assert.match(saved.leads[0].followUp,/^\d{4}-\d{2}-\d{2}$/);
 const stage=d.querySelector('[data-lf="stage"]');stage.value='won';stage.dispatchEvent(new w.Event('change',{bubbles:true}));await tick();
 saved=JSON.parse(w.localStorage.getItem('magnolia-sales-v1'));assert.equal(saved.leads[0].stage,'won');assert.equal(saved.leads[0].followUp,'');
 w.close();
});

