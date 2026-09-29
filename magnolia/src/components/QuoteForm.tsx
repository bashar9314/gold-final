'use client';
import { useState } from 'react';
import { site, propertyTypes, projectTypes } from '@/data/site';
import { Arrow } from './Icons';

type State = 'idle' | 'sending' | 'sent' | 'error';

export default function QuoteForm() {
  const [state, setState] = useState<State>('idle');
  const [files, setFiles] = useState<File[]>([]);
  const [err, setErr] = useState('');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    if (fd.get('company_website')) return; // honeypot
    files.forEach((f) => fd.append('photos', f));

    if (!site.formEndpoint) {
      // No backend connected yet: open an email draft if we have an address, otherwise explain honestly.
      if (site.email) {
        const body = ['firstName', 'lastName', 'phone', 'email', 'address', 'propertyType', 'projectType', 'sqft', 'date', 'message']
          .map((k) => `${k}: ${fd.get(k) ?? ''}`).join('\n');
        window.location.href = `mailto:${site.email}?subject=${encodeURIComponent('Quote request')}&body=${encodeURIComponent(body)}`;
        setState('sent');
      } else {
        setErr('The quote form is not connected yet. Set NEXT_PUBLIC_FORM_ENDPOINT (see README) or add the business email.');
        setState('error');
      }
      return;
    }
    setState('sending'); setErr('');
    try {
      const r = await fetch(site.formEndpoint, { method: 'POST', body: fd, headers: { Accept: 'application/json' } });
      if (!r.ok) throw new Error('bad status');
      setState('sent'); form.reset(); setFiles([]);
    } catch {
      setErr('Something went wrong. Please try again or call us.'); setState('error');
    }
  }

  if (state === 'sent') {
    return (
      <div role="status" className="py-10 text-center">
        <p className="font-serif text-3xl text-forest">Thank you.</p>
        <p className="mt-3 text-charcoal/70">We received your request and will be in touch shortly.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-x-8 gap-y-6 sm:grid-cols-2" noValidate={false}>
      <input type="text" name="company_website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
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
      <div className="sm:col-span-2">
        <span className="label">Upload Photos <span className="normal-case tracking-normal text-stone">(optional)</span></span>
        <label className="mt-2 flex min-h-[64px] cursor-pointer items-center justify-between gap-4 border border-dashed border-forest/30 px-4 py-3 text-sm text-charcoal/70 transition-colors hover:border-gold">
          <span>{files.length ? `${files.length} photo${files.length > 1 ? 's' : ''} selected` : 'Tap to add photos of the space'}</span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-dark">Browse</span>
          <input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => setFiles(Array.from(e.target.files ?? []).slice(0, 10))} />
        </label>
      </div>
      <div className="sm:col-span-2">
        <button type="submit" disabled={state === 'sending'} className="btn btn-forest w-full disabled:opacity-60 sm:w-auto sm:min-w-[260px]">
          <span>{state === 'sending' ? 'Sending…' : <>Request My Quote <Arrow /></>}</span>
        </button>
        <p role="alert" className="mt-4 min-h-[1.25rem] text-sm text-red-800">{state === 'error' ? err : ''}</p>
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
