'use client';
import { useEffect, useState } from 'react';
import { nav, site, ph, tel } from '@/data/site';

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', esc);
    return () => { window.removeEventListener('keydown', esc); document.body.style.overflow = ''; };
  }, [open]);

  return (
    <header className={`fixed inset-x-0 top-0 z-50 border-b transition-all duration-500 ${scrolled ? 'border-gold/30 bg-ivory shadow-[0_8px_30px_-18px_rgba(19,42,32,.35)]' : 'border-transparent bg-ivory'}`}>
      <div className={`container-x flex items-center justify-between transition-all duration-500 ${scrolled ? 'h-[64px]' : 'h-[76px]'}`}>
        <a href="#top" className="group flex items-center gap-3" aria-label={`${site.name} — home`} onClick={() => setOpen(false)}>
          <img src="/brand/magnolia-mark.webp" alt="" width={860} height={440}
            className={`w-auto transition-all duration-500 group-hover:scale-[1.04] ${scrolled ? 'h-9' : 'h-11'}`} />
          <span className="leading-none">
            <span className="block font-serif text-[22px] font-semibold tracking-[0.06em] text-forest sm:text-[26px]">MAGNOLIA</span>
            <span className="mt-1 block text-[8.5px] font-medium uppercase tracking-[0.3em] text-forest/70 sm:text-[9.5px]">Construction Cleaning</span>
          </span>
        </a>

        <nav aria-label="Primary" className="hidden items-center gap-9 lg:flex">
          {nav.map((n) => (
            <a key={n.href} href={n.href} className="ulink py-2 text-[11.5px] font-medium uppercase tracking-[0.22em] text-forest">{n.label}</a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a href="#quote" className="btn btn-forest hidden !min-h-[44px] !px-5 lg:inline-flex"><span>Get a Free Quote</span></a>
          <button aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls="mobile-menu"
            onClick={() => setOpen(!open)} className="relative -mr-2 flex h-12 w-12 items-center justify-center lg:hidden">
            <span className={`absolute h-px w-6 bg-forest transition-transform duration-300 ${open ? 'rotate-45' : '-translate-y-[6px]'}`} />
            <span className={`absolute h-px w-6 bg-forest transition-opacity duration-200 ${open ? 'opacity-0' : ''}`} />
            <span className={`absolute h-px w-6 bg-forest transition-transform duration-300 ${open ? '-rotate-45' : 'translate-y-[6px]'}`} />
          </button>
        </div>
      </div>

      {/* mobile menu */}
      <div id="mobile-menu" className={`fixed inset-x-0 top-[64px] h-[calc(100dvh-64px)] overflow-y-auto bg-forest-deep transition-[opacity,visibility,transform] duration-500 lg:hidden ${open ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-3 opacity-0'}`}>
        <nav aria-label="Mobile" className="container-x flex min-h-full flex-col justify-between py-10">
          <ul>
            {nav.map((n, i) => (
              <li key={n.href} className="border-b border-ivory/10">
                <a href={n.href} onClick={() => setOpen(false)}
                  style={{ transitionDelay: open ? `${100 + i * 60}ms` : '0ms' }}
                  className={`flex items-center justify-between py-5 font-serif text-4xl text-ivory transition-all duration-500 ${open ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                  {n.label}<span className="text-sm text-gold">0{i + 1}</span>
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-10 grid gap-3">
            <a href="#quote" onClick={() => setOpen(false)} className="btn btn-gold w-full"><span>Get a Free Quote</span></a>
            <a href={site.phone ? tel(site.phone) : '#contact'} onClick={() => setOpen(false)} className="btn btn-line-light w-full"><span>Call Us{site.phone ? '' : ''}</span></a>
            <p className="mt-2 text-center text-xs uppercase tracking-[0.2em] text-ivory/50">{site.phone || ph.phone}</p>
          </div>
        </nav>
      </div>
    </header>
  );
}
