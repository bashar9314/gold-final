/* Browser data adapter: Netlify cloud storage or explicit local preview. */
(() => {
  const preview = location.protocol==='file:' || ['localhost','127.0.0.1',''].includes(location.hostname);
  window.magnoliaPreview = preview;
  const key = 'magnolia-sales-v1';
  let state = {leads:[],activity:[],templates:[]}, listeners = [], queue = Promise.resolve();
  let storageBlocked=false;
  function loadLocal(){try{const raw=localStorage.getItem(key);if(raw){const parsed=JSON.parse(raw);if(!['leads','activity','templates'].every(k=>Array.isArray(parsed[k])))throw new Error('Invalid saved workspace');state=parsed;}}catch(e){storageBlocked=true;status('Local storage unavailable · Changes cannot be saved');if(e instanceof SyntaxError)throw new Error('Saved workspace is unreadable. Preserve this browser data before recovery.');}}
  function saveLocal(next){if(storageBlocked)throw new Error('Storage unavailable. Use a normal browser or the live dashboard.');localStorage.setItem(key,JSON.stringify(next));}
  const status = text => { const el=document.getElementById('syncStatus'); if(el) el.textContent=text; };
  function emit() { listeners.forEach(l=>l.fn({docs:state[l.name].filter(x=>!l.filter || x[l.filter[0]]===l.filter[1]).slice().sort((a,b)=>l.order?String(b[l.order]||'').localeCompare(String(a[l.order]||'')):0).slice(0,l.max||Infinity).map(x=>({id:x.id,data:()=>({...x})}))})); }
  async function request(method, body) {
    const r=await fetch('/.netlify/functions/pipeline',{method,credentials:'same-origin',signal:AbortSignal.timeout(20000),headers:{'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});
    const data=await r.json();
    if(!r.ok) { const e=new Error(data.error||'Unable to sync'); e.status=r.status; throw e; }
    return data;
  }
  function login() {
    return new Promise(resolve=>{
      const view=document.getElementById('view');
      view.innerHTML='<form class="login"><div class="eyebrow">Private workspace</div><h1>Welcome to Magnolia</h1><p class="hint">Sign in to access your leads and follow-ups.</p><label class="f">Workspace password<input type="password" class="field" autocomplete="current-password" required minlength="16"></label><button class="btn primary">Open workspace</button><p class="hint" role="alert" id="loginError"></p></form>';
      const form=view.querySelector('form');
      form.onsubmit=async e=>{e.preventDefault();e.stopImmediatePropagation();const button=form.querySelector('button');button.disabled=true;try {await request('POST',{action:'login',password:form.querySelector('input').value});resolve();}catch(err){document.getElementById('loginError').textContent=err.message;button.disabled=false;}};
    });
  }
  async function pull() { const data=await request('GET'); state=data.state; window.magnoliaAutomation=data.automation; status('Cloud synced · '+new Intl.DateTimeFormat('en-US',{timeZone:'America/Chicago',hour:'numeric',minute:'2-digit'}).format(new Date())); emit(); }
  const initialized = new Promise(resolve=>document.readyState==='loading'?document.addEventListener('DOMContentLoaded',resolve,{once:true}):resolve()).then(async()=>{
    if(preview) {loadLocal();if(window.magnoliaSeed&&state.leads.length===0&&!storageBlocked){state=JSON.parse(JSON.stringify(window.magnoliaSeed));saveLocal(state);}if(!storageBlocked)status('Local preview · This browser');return;}
    try {await pull();}catch(e){if(e.status===401){await login();await pull();}else throw e;}
    setInterval(()=>{if(document.visibilityState==='visible')queue=queue.then(pull).catch(()=>status('Sync paused · Check connection'));},15000);
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')queue=queue.then(pull).catch(()=>status('Sync paused · Check connection'));});
  });
  function mutate(op) {
    const task=queue.then(async()=>{
      await initialized;status('Saving…');
      if(preview){ const next=JSON.parse(JSON.stringify(state)),items=next[op.collection];if(op.type==='add')items.push({...op.data,id:op.id});if(op.type==='update'){const target=items.find(x=>x.id===op.id);if(!target)throw new Error('Record missing');Object.assign(target,op.data);}if(op.type==='delete'){const record=items.find(x=>x.id===op.id);next[op.collection]=items.filter(x=>x.id!==op.id);if(record)(next.trash||=[]).push({collection:op.collection,record,deletedAt:new Date().toISOString()});}saveLocal(next);state=next;status('Saved in this browser');}
      else { const data=await request('POST',{action:'mutate',op});state=data.state;status('Cloud synced · Saved'); }
      emit();return {id:op.id};
    });queue=task.catch(()=>status('Not saved · Check connection'));return task;
  }
  function collection(name,filter,order,max) {return {
    add:data=>mutate({type:'add',collection:name,id:crypto.randomUUID(),data}),
    where:(field,operator,value)=>collection(name,[field,value],order,max),
    orderBy:field=>collection(name,filter,field,max),limit:n=>collection(name,filter,order,n),
    onSnapshot:(fn,error)=>{const l={name,filter,order,max,fn};listeners.push(l);initialized.then(emit).catch(error);return ()=>{listeners=listeners.filter(x=>x!==l);};}
  };}
  const db={collection,doc:path=>{const [name,id]=path.split('/');return {update:data=>mutate({type:'update',collection:name,id,data}),delete:()=>mutate({type:'delete',collection:name,id})};}};
  window.magnoliaLog=(leadId,event,patch)=>{const eventId=crypto.randomUUID(),task=queue.then(async()=>{await initialized;status('Saving…');if(preview){const next=JSON.parse(JSON.stringify(state)),lead=next.leads.find(x=>x.id===leadId);if(!lead)throw new Error('Lead missing');next.activity.push({...event,leadId,id:eventId});Object.assign(lead,patch);saveLocal(next);state=next;}else{const data=await request('POST',{action:'log',leadId,eventId,event,patch});state=data.state;}emit();status(preview?'Saved in this browser':'Cloud synced · Saved');});queue=task.catch(()=>status('Not saved · Try again'));return task;};
  const user={me:()=>Promise.resolve({id:'owner',name:'Bashar'}),can:()=>Promise.resolve(true),profiles:()=>Promise.resolve({owner:{id:'owner',name:'Bashar',avatarUrl:'/avatar.svg'}}),search:()=>Promise.resolve([{id:'owner',name:'Bashar',isMe:true,avatarUrl:'/avatar.svg'}])};
  const downloads={save:async({filename,data})=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([data],{type:'text/csv;charset=utf-8'}));a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}};
  window.magnoliaBackup=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify({version:1,exportedAt:new Date().toISOString(),state},null,2)],{type:'application/json'}));a.download='magnolia-workspace-backup-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);};
  window.magnoliaRestore=async incoming=>{await initialized;const task=queue.then(async()=>{if(!incoming||!['leads','activity','templates'].every(k=>Array.isArray(incoming[k])))throw new Error('Invalid backup');if(preview){const next=JSON.parse(JSON.stringify(state));for(const collection of ['leads','activity','templates']){const ids=new Set(next[collection].map(x=>x.id));for(const record of incoming[collection])if(!ids.has(record.id)){next[collection].push(record);ids.add(record.id);}}saveLocal(next);state=next;}else{const data=await request('POST',{action:'restore',state:incoming});state=data.state;}emit();status(preview?'Saved in this browser':'Cloud synced · Backup merged');});queue=task.catch(()=>status('Not saved · Try again'));return task;};
  window.magnoliaLogout=async()=>{if(!preview)await request('POST',{action:'logout'});location.reload();};
  window.claude={use:async name=>{if(name==='db'){await initialized;return db;}return name==='user'?user:downloads;}};
  window.addEventListener('storage',e=>{if(preview&&e.key===key){try{loadLocal();emit();}catch{status('Local data unreadable · Restore from backup');}}});
  document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches('.row,.card')){e.preventDefault();e.target.click();}});
  new MutationObserver(()=>{document.querySelectorAll('.row,.card').forEach(el=>{el.tabIndex=0;el.setAttribute('role','button');});}).observe(document.documentElement,{subtree:true,childList:true});
})();

