import { site, ph, tel } from '@/data/site';
import { Icon, Arrow } from './Icons';
import QuoteForm from './QuoteForm';

const missing = (v: string, p: string) => v || p;

export default function Contact() {
  const rows = [
    { i: 'phone', k: 'Phone', v: missing(site.phone, ph.phone), href: site.phone ? tel(site.phone) : undefined },
    { i: 'mail', k: 'Email', v: missing(site.email, ph.email), href: site.email ? `mailto:${site.email}` : undefined },
    { i: 'pin', k: 'Service Area', v: missing(site.serviceArea, ph.serviceArea) },
    { i: 'clock', k: 'Hours', v: missing(site.hours, ph.hours) },
  ];
  return (
    <section id="contact" className="relative bg-ivory py-24 sm:py-32">
      <div className="container-x grid gap-16 lg:grid-cols-12 lg:gap-20">
        <div className="lg:col-span-5">
          <p className="eyebrow eyebrow-line rv mb-6">Contact</p>
          <h2 className="h-section rv" style={{ '--d': '80ms' } as React.CSSProperties}>Tell us about your project.</h2>
          <p className="lead rv mt-6" style={{ '--d': '140ms' } as React.CSSProperties}>Free quotes. Clear answers. Send the details and we&rsquo;ll take it from there.</p>

          <div className="rv mt-12 border-t border-gold/50 pt-8" style={{ '--d': '200ms' } as React.CSSProperties}>
            <p className="font-serif text-2xl font-semibold uppercase tracking-[0.05em] text-forest">Magnolia Construction Cleaning LLC</p>
            <dl className="mt-8 grid gap-6">
              {rows.map((r) => (
                <div key={r.k} className="flex gap-5">
                  <Icon name={r.i} className="mt-1 h-6 w-6 shrink-0 text-gold" />
                  <div>
                    <dt className="text-[11px] uppercase tracking-[0.22em] text-forest/60">{r.k}</dt>
                    <dd className="mt-1 text-[17px] text-charcoal">
                      {r.href ? <a href={r.href} className="ulink">{r.v}</a> : <span className={r.v.startsWith('[') ? 'text-stone' : ''}>{r.v}</span>}
                    </dd>
                  </div>
                </div>
              ))}
            </dl>
            <div className="mt-10 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              <a href={site.phone ? tel(site.phone) : '#contact'} className="btn btn-forest !px-4"><span>Call</span></a>
              <a href={site.email ? `mailto:${site.email}` : '#contact'} className="btn btn-line-dark !px-4"><span>Email</span></a>
              <a href="#quote" className="btn btn-line-dark !px-4"><span>Quote <Arrow /></span></a>
            </div>
          </div>
        </div>

        <div id="quote" className="rv scroll-mt-24 border border-forest/15 bg-ivory-soft p-6 shadow-[0_40px_80px_-50px_rgba(19,42,32,.5)] sm:p-10 lg:col-span-7" style={{ '--d': '120ms' } as React.CSSProperties}>
          <h3 className="font-serif text-3xl font-medium text-forest">Request your free quote</h3>
          <div className="gold-rule my-5 w-16" />
          <QuoteForm />
        </div>
      </div>
    </section>
  );
}
