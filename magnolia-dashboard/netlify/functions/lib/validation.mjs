export const stages = new Set(['new','reach','talking','walk','quote','won','lost']);
export function validate(collection, data, partial = false) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Invalid record');
  if (Object.keys(data).some(k=>['__proto__','constructor','prototype','id'].includes(k))) throw new Error('Invalid field');
  for (const [key,value] of Object.entries(data)) {
    if (typeof value === 'string' && value.length > (key==='notes'||key==='body'||key==='note'?20000:2000)) throw new Error('Text is too long');
    if (value !== null && !['string','number','boolean'].includes(typeof value) && !Array.isArray(value)) throw new Error('Invalid field value');
  }
  if(collection==='leads') {
    if(!partial && !String(data.company||data.name||'').trim()) throw new Error('Enter a company or contact name');
    if(data.stage!==undefined&&!stages.has(data.stage)) throw new Error('Choose a valid stage');
    if(data.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) throw new Error('Enter a valid email address');
    if(data.website&&!/^https?:\/\//i.test(data.website)) throw new Error('Website must start with https:// or http://');
    if(data.followUp&&(!/^\d{4}-\d{2}-\d{2}$/.test(data.followUp)||new Date(data.followUp+'T12:00:00Z').toISOString().slice(0,10)!==data.followUp)) throw new Error('Choose a valid follow-up date');
  }
  if(collection==='activity'&&!partial&&(!data.leadId||!data.type||!data.at)) throw new Error('Invalid activity');
  if(collection==='templates'&&data.kind!==undefined&&!['email','call','voicemail','text'].includes(data.kind)) throw new Error('Choose a valid template type');
}
