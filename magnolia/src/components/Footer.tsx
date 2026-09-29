import { site, ph, nav, services, tel } from '@/data/site';
import { Arrow } from './Icons';

export default function Footer() {
  const socials = Object.entries(site.social).filter(([, v]) => v);
  return (
    <footer className="bg-forest-deep text-ivory/75">
      <div className="container-x py-20">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="inline-block bg-ivory p-3">
              <img src="/brand/magnolia-logo-512.webp" alt="Magnolia Construction Cleaning LLC logo" width={512} height={512} loading="lazy" className="h-28 w-28" />
            </div>
            <p className="mt-6 max-w-sm font-serif text-2xl leading-snug text-ivory">Built Clean. Finished Right.</p>
            <p className="mt-3 max-w-sm text-[15px] leading-relaxed">Professional post-construction cleaning for newly built, renovated, and remodeled spaces.</p>
            <a href="#quote" className="btn btn-gold mt-8"><span>Request a Free Quote <Arrow /></span></a>
          </div>

          <nav aria-label="Footer" className="lg:col-span-2">
            <h3 className="eyebrow mb-5">Navigate</h3>
            <ul className="space-y-3 text-[15px]">
              {nav.map((n) => <li key={n.href}><a href={n.href} className="ulink">{n.label}</a></li>)}
            </ul>
          </nav>

          <div className="lg:col-span-3">
            <h3 className="eyebrow mb-5">Services</h3>
            <ul className="space-y-3 text-[15px]">
              {services.map((s) => <li key={s.id}><a href="#services" className="ulink">{s.title}</a></li>)}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h3 className="eyebrow mb-5">Contact</h3>
            <ul className="space-y-3 text-[15px]">
              <li>{site.phone ? <a className="ulink" href={tel(site.phone)}>{site.phone}</a> : <span className="text-ivory/50">{ph.phone}</span>}</li>
              <li>{site.email ? <a className="ulink" href={`mailto:${site.email}`}>{site.email}</a> : <span className="text-ivory/50">{ph.email}</span>}</li>
              <li className={site.serviceArea ? '' : 'text-ivory/50'}>{site.serviceArea || ph.serviceArea}</li>
              {socials.map(([k, v]) => <li key={k}><a className="ulink capitalize" href={v} rel="noopener noreferrer" target="_blank">{k}</a></li>)}
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col justify-between gap-4 border-t border-gold/25 pt-8 text-xs text-ivory/55 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} Magnolia Construction Cleaning LLC. All rights reserved.</p>
          <p className="flex gap-6"><a href="/privacy/" className="ulink">Privacy Policy</a><a href="/terms/" className="ulink">Terms</a></p>
        </div>
      </div>
    </footer>
  );
}
