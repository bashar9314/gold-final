import { getStore } from '@netlify/blobs';
import { createHash } from 'node:crypto';
import { validate } from './lib/validation.mjs';
export const config={schedule:'0 13 * * *'};
export const day=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/Chicago',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const identity=x=>String(x.company||x.name||'').toLowerCase().replace(/[^a-z0-9]/g,'');
export function candidates(records){
  const unique=new Map();
  for(const input of records){
    if(!input.company||!input.source||!/^https:\/\//.test(input.source)||!['General Contractor','Home Builder'].includes(input.segment))continue;
    const lat=Number(input.latitude),lon=Number(input.longitude);
    if(!Number.isFinite(lat)||!Number.isFinite(lon))continue;
    const rad=x=>x*Math.PI/180,a=Math.sin(rad(lat-34.98898)/2)**2+Math.cos(rad(34.98898))*Math.cos(rad(lat))*Math.sin(rad(lon+90.01259)/2)**2;
    if(3958.8*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a))>40)continue;
    const record={company:input.company,name:input.name||'',phone:input.phone||'',email:input.email||'',website:input.website||'',segment:input.segment,source:input.source,notes:'Automatically sourced prospect. Confirm contact details and cleaning needs before outreach.',stage:'new',followUp:'',lastContact:'',lastType:'',sourceType:'automatic',verification:'Source supplied; not a confirmed job',latitude:lat,longitude:lon};
    try{validate('leads',record);}catch{continue;}
    unique.set(identity(record),record);
  }
  return [...unique.values()];
}
export default async function daily(){
  const store=getStore({name:'magnolia-sales',consistency:'strong'}),date=day(),feed=process.env.LEAD_FEED_URL;
  if(!feed){await store.setJSON('discovery-status',{date,status:'setup_needed',added:0,message:'Connect a lead source to enable the daily 10–15 target.'});return new Response(null,{status:204});}
  const prior=await store.get('discovery-status',{type:'json'});if(prior?.date===date&&prior.status!=='error')return new Response(null,{status:204});
  try{
    const url=new URL(feed);if(url.protocol!=='https:')throw new Error('Lead feed must use HTTPS');
    const response=await fetch(url,{headers:process.env.LEAD_FEED_TOKEN?{Authorization:'Bearer '+process.env.LEAD_FEED_TOKEN}:{},signal:AbortSignal.timeout(15000)});
    if(!response.ok)throw new Error('Lead source unavailable');
    const payload=await response.json();if(!Array.isArray(payload.leads)||payload.leads.length>5000)throw new Error('Invalid lead source response');
    const incoming=candidates(payload.leads),now=new Date().toISOString();
    for(let attempt=0;attempt<5;attempt++){
      const current=await store.getWithMetadata('workspace',{type:'json'}),state=current?.data||{leads:[],activity:[],templates:[]};
      const existing=new Set([...state.leads,...(state.trash||[]).filter(x=>x.collection==='leads').map(x=>x.record)].map(identity));
      const todayAdded=state.leads.filter(x=>x.sourceType==='automatic'&&x.discoveryDay===date).length;
      const add=incoming.filter(x=>!existing.has(identity(x))).slice(0,Math.max(0,15-todayAdded));
      for(const lead of add)state.leads.push({...lead,id:'auto-'+createHash('sha256').update(identity(lead)).digest('hex').slice(0,20),createdAt:now,updatedAt:now,createdBy:'automation',owner:'owner',discoveryDay:date});
      const result=await store.setJSON('workspace',state,current?{onlyIfMatch:current.etag}:{onlyIfNew:true});
      if(result.modified){const total=todayAdded+add.length;await store.setJSON('discovery-status',{date,status:total>=10?'complete':'below_target',added:total,message:total>=10?'Daily target reached.':'Fewer new matching businesses available; no duplicates or invented leads added.'});return new Response(null,{status:204});}
    }
    throw new Error('Workspace busy');
  }catch{await store.setJSON('discovery-status',{date,status:'error',added:0,message:'Daily search failed. Existing leads are safe; check the source connection.'});return new Response(null,{status:500});}
}
