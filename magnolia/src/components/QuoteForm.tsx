'use client';
import { useRef, useState } from 'react';
import { site, propertyTypes, projectTypes } from '@/data/site';
import { Arrow } from './Icons';

type State = 'idle' | 'sending' | 'sent' | 'error';

/** Downscale a photo to max 1600px JPEG. Returns null if the browser cannot decode it (e.g. HEIC on Chrome). */
async function shrink(file: File): Promise<File | null> {
  if (!file.type.startsWith('image/')) return null;
  if (file.size < 450_000 && /jpe?g|png|webp/.test(file.type)) return file;
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, 1400 / Math.max(bmp.width, bmp.height));
    const c = document.createElement('canvas');
    c.width = Math.round(bmp.width * scale); c.height = Math.round(bmp.height * scale);
    c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height);
    const blob: Blob | null = await new Promise((res) => c.toBlob(res, 'image/jpeg', 0.78));
    return blob ? new File([blob], file.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' }) : null;
  } catch { return file.size < 2_000_000 ? file : null; }
}

export default function QuoteForm() {
  const [state, setState] = useState<State>('idle');
  const [files, setFiles] = useState<File[]>([]);
  const [err, setErr] = useState('');
  const lastData = useRef<FormData | null>(null);

  const FIELDS = ['firstName', 'lastName', 'phone', 'email', 'address', 'propertyType', 'projectType', 'sqft', 'date', 'message'];

  function mailtoFallback(fd: FormData) {
    const body = FIELDS.map((k) => `${k}: ${fd.get(k) ?? ''}`).join('\n');
    return `mailto:${site.email}?subject=${encodeURIComponent('Quote request')}&body=${encodeURIComponent(body)}`;
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    if (fd.get('botcheck')) return; // honeypot
    lastData.current = fd;
    setState('sending'); setErr('');
    try {
      fd.append('access_key', site.web3formsKey);
      fd.append('subject', 'New quote request from the Magnolia website');
      fd.append('from_name', `${fd.get('firstName') ?? ''} ${fd.get('lastName') ?? ''}`.trim() || 'Website visitor');
      const r = await fetch(site.formEndpoint, { method: 'POST', body: fd, headers: { Accept: 'application/json' } });
      const j = await r.json().catch(() => ({} as { success?: boolean; message?: string }));
      if (!r.ok || !j.success) throw new Error(j.message || 'status ' + r.status);
      setState('sent'); form.reset(); setFiles([]);
    } catch (x) {
      console.error(x);
      setErr(`We couldn't send your request just now. Please call ${site.phone} or use the button below to email it to us instead.`);
      setState('error');
    }
  }

  if (state === 'sent') {
    return (
      <div role="status" className="py-10 text-center">
        <p className="font-serif text-3xl text-forest">Thank you.</p>
        <p className="mt-3 text-charcoal/70">We received your request and will be in touch shortly. You can email photos of the space to {site.email} any time.</p>
      </div>
    );
  }

  return (
    <form name="quote" onSubmit={onSubmit} className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
      <input type="checkbox" name="botcheck" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
      <F label="First Name" name="firstName" autoComplete="given-name" required />
      <F label="Last Name" name="lastName" autoComplete="family-name" required />
      <F label="Phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" required />
      <F label="Email" name="email" type="email" autoComplete="email" inputMode="email" required />
      <div className="sm:col-span-2"><F label="Project Address" name="address" autoComplete="street-address" required /></div>
      <S label="Property Type" name="propertyType" options={propertyTypes} />
      <S label="Project Type" name="projectType" options={projectTypes} />
      <F label="Approximate Square Footage" name="sqft" inputMode="numeric" placeholder="e.g. 2,400" />
      <F label="Desired Cleaning Date" name="date" type="date" />
      <div className="sm:col-span-2">
        <label className="label" htmlFor="message">Message / Project Details</label>
        <textarea id="message" name="message" rows={4} className="field resize-y" placeholder="Tell us about the project, timing, and anything we should know." />
      </div>
      <p className="text-sm text-charcoal/70 sm:col-span-2">Have photos of the space? Reply to our confirmation or email them to <a className="ulink text-gold-dark" href={`mailto:${site.email}`}>{site.email}</a> and we will include them in your quote.</p>
      <div className="sm:col-span-2">
        <button type="submit" disabled={state === 'sending'} className="btn btn-forest w-full disabled:opacity-60 sm:w-auto sm:min-w-[260px]">
          <span>{state === 'sending' ? 'Sending…' : <>Request My Quote <Arrow /></>}</span>
        </button>
        <div role="alert" className="mt-4 min-h-[1.25rem] text-sm text-red-800">
          {state === 'error' && (<>
            <p>{err}</p>
            {lastData.current && <a href={mailtoFallback(lastData.current)} className="btn btn-line-dark mt-3"><span>Email my request instead</span></a>}
          </>)}
        </div>
        <p className="mt-1 text-xs text-stone">We only use your details to respond to your request.</p>
      </div>
    </form>
  );
}

function F({ label, name, type = 'text', required, ...rest }: { label: string; name: string; type?: string; required?: boolean } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="label" htmlFor={name}>{label}{required && <span className="text-gold-dark"> *</span>}</label>
      <input id={name} name={name} type={type} required={required} className="field" {...rest} />
    </div>
  );
}
function S({ label, name, options }: { label: string; name: string; options: string[] }) {
  return (
    <div>
      <label className="label" htmlFor={name}>{label}</label>
      <select id={name} name={name} defaultValue="" className="field appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%228%22 fill=%22none%22 stroke=%22%23A8864E%22><path d=%22m1 1 5 5 5-5%22/></svg>')] bg-[right_2px_center] bg-no-repeat pr-6">
        <option value="" disabled>Select…</option>
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
}
