import { site, tel } from '@/data/site';
import { Arrow } from './Icons';

export default function QuoteCTA() {
  return (
    <section id="cta" className="relative overflow-hidden bg-forest py-24 text-ivory sm:py-28">
      <svg className="pointer-events-none absolute -bottom-10 -right-10 h-[420px] w-[420px] text-gold/20" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth=".25" aria-hidden>
        <circle cx="50" cy="50" r="48" /><circle cx="50" cy="50" r="40" /><path d="M20 58 50 32l30 26" />
      </svg>
      <div className="container-x relative text-center">
        <p className="eyebrow rv mb-6">Let&rsquo;s Finish It</p>
        <h2 className="rv mx-auto max-w-3xl font-serif font-medium" style={{ fontSize: 'clamp(2.4rem,6.4vw,5rem)', lineHeight: 1.02, '--d': '80ms' } as React.CSSProperties}>
          Construction leaves a mess. <em className="text-gold-light">We leave a finished space.</em>
        </h2>
        <div className="rv mt-10 flex flex-col justify-center gap-3 sm:flex-row" style={{ '--d': '180ms' } as React.CSSProperties}>
          <a href="#quote" className="btn btn-gold"><span>Request a Free Quote <Arrow /></span></a>
          <a href={site.phone ? tel(site.phone) : '#contact'} className="btn btn-line-light"><span>Call Us</span></a>
        </div>
      </div>
    </section>
  );
}
