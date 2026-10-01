import { getStore } from '@netlify/blobs';
import { validate } from './lib/validation.mjs';
import { createHmac, timingSafeEqual, createHash } from 'node:crypto';
const reply=(body,status=200,headers={})=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store',...headers}});
const empty=()=>({leads:[],activity:[],templates:[]});
const equal=(a,b)=>{const aa=createHash('sha256').update(a).digest(),bb=createHash('sha256').update(b).digest();return timingSafeEqual(aa,bb);};
const sign=(data,password)=>createHmac('sha256',password).update(data).digest('hex');
function sessionValid(req,password){const cookie=(req.headers.get('cookie')||'').split(';').map(x=>x.trim()).find(x=>x.startsWith('magnolia_session='));if(!cookie)return false;const [expires,sig]=cookie.slice(17).split('.');return Number(expires)>Date.now()&&Number(expires)<Date.now()+86400001&&sig&&equal(sig,sign(expires,password));}
export default async function handler(req){
  const password=process.env.DASHBOARD_PASSWORD;
  if(!password||password.length<16)return reply({error:'Workspace setup needed: set DASHBOARD_PASSWORD in Netlify to a strong password of at least 16 characters.'},503);
  if(!['GET','POST'].includes(req.method))return reply({error:'Method not allowed'},405);
  if(req.method==='POST'&&req.headers.get('origin')!==new URL(req.url).origin)return reply({error:'Origin not allowed'},403);
  let body;
  if(req.method==='POST') {const text=await req.text();if(text.length>2000000)return reply({error:'Request too large'},413);try{body=JSON.parse(text);}catch{return reply({error:'Invalid request'},400);}}
  if(body?.action==='login'){
    if(typeof body.password!=='string'||!equal(body.password,password))return reply({error:'Incorrect workspace password.'},401);
    const exp=String(Date.now()+86400000),cookie=exp+'.'+sign(exp,password);
    return reply({ok:true},200,{'Set-Cookie':`magnolia_session=${cookie}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=86400`});
  }
  if(!sessionValid(req,password))return reply({error:'Sign in to your workspace.'},401);
  if(body?.action==='logout')return reply({ok:true},200,{'Set-Cookie':'magnolia_session=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0'});
  try {
    const store=getStore({name:'magnolia-sales',consistency:'strong'});
    if(req.method==='GET'){const data=await store.get('workspace',{type:'json'});return reply({state:data||empty(),automation:{configured:Boolean(process.env.LEAD_FEED_URL),...(await store.get('discovery-status',{type:'json'})||{})}});}
    if(body?.action==='log'){
      const {leadId,eventId,event,patch}=body;
      if(![leadId,eventId].every(id=>typeof id==='string'&&/^[a-zA-Z0-9_-]{1,100}$/.test(id)))return reply({error:'Invalid activity ID'},400);
      try{validate('activity',{...event,leadId});validate('leads',patch,true);}catch(e){return reply({error:e.message},400);}
      for(let attempt=0;attempt<5;attempt++){
        const current=await store.getWithMetadata('workspace',{type:'json'}),state=current?.data||empty(),lead=state.leads.find(x=>x.id===leadId);
        if(!lead)return reply({error:'Lead no longer exists.'},409);
        if(!state.activity.some(x=>x.id===eventId)){state.activity.push({...event,leadId,id:eventId});Object.assign(lead,patch);}
        const result=await store.setJSON('workspace',state,current?{onlyIfMatch:current.etag}:{onlyIfNew:true});
        if(result.modified)return reply({state});
      }
      return reply({error:'Workspace is busy. Try again.'},409);
    }
    if(body?.action==='restore'){
      const incoming=body.state;
      if(!incoming||!['leads','activity','templates'].every(k=>Array.isArray(incoming[k])&&incoming[k].length<=10000))return reply({error:'Invalid workspace backup'},400);
      try{for(const collection of ['leads','activity','templates'])for(const record of incoming[collection]){const {id,...fields}=record;if(typeof id!=='string'||!/^[a-zA-Z0-9_-]{1,100}$/.test(id))throw new Error('Invalid record ID');validate(collection,fields);}}catch(e){return reply({error:e.message},400);}
      for(let attempt=0;attempt<5;attempt++){
        const current=await store.getWithMetadata('workspace',{type:'json'}),state=current?.data||empty();
        await store.setJSON('backup-'+Date.now()+'-'+attempt,state);
        for(const collection of ['leads','activity','templates']){const ids=new Set(state[collection].map(x=>x.id));for(const record of incoming[collection])if(!ids.has(record.id)){state[collection].push(record);ids.add(record.id);}}
        const result=await store.setJSON('workspace',state,current?{onlyIfMatch:current.etag}:{onlyIfNew:true});
        if(result.modified)return reply({state});
      }
      return reply({error:'Workspace is busy. Try again.'},409);
    }
    const op=body?.op;
    if(body?.action!=='mutate'||!op||!['leads','activity','templates'].includes(op.collection)||!['add','update','delete'].includes(op.type)||typeof op.id!=='string'||!/^[a-zA-Z0-9_-]{1,100}$/.test(op.id))return reply({error:'Invalid operation'},400);
    if(op.type!=='delete'&&(!op.data||typeof op.data!=='object'||Array.isArray(op.data)))return reply({error:'Invalid record'},400);
    if(op.data&&Object.keys(op.data).some(k=>['__proto__','constructor','prototype','id'].includes(k)))return reply({error:'Invalid field'},400);
    try{if(op.type!=='delete')validate(op.collection,op.data,op.type==='update');}catch(e){return reply({error:e.message},400);}
    for(let attempt=0;attempt<5;attempt++){
      const current=await store.getWithMetadata('workspace',{type:'json'}),state=current?.data||empty(),items=state[op.collection],idx=items.findIndex(x=>x.id===op.id);
      if(op.type==='add'){if(idx<0)items.push({...op.data,id:op.id});}
      if(op.type==='update'){if(idx<0)return reply({error:'Record no longer exists. Refresh your workspace.'},409);items[idx]={...items[idx],...op.data};}
      if(op.type==='delete')state[op.collection]=items.filter(x=>x.id!==op.id);
      // Preserve removed records for recovery rather than permanent deletion.
      if(op.type==='delete'&&idx>=0){state.trash=state.trash||[];state.trash.push({collection:op.collection,record:items[idx],deletedAt:new Date().toISOString()});}
      const result=await store.setJSON('workspace',state,current?{onlyIfMatch:current.etag}:{onlyIfNew:true});
      if(result.modified)return reply({state});
    }
    return reply({error:'Workspace is busy. Try saving again.'},409);
  }catch{return reply({error:'Cloud storage unavailable. Try again shortly.'},503);}
}

