'use client';
import { useEffect, useRef } from 'react';
import { photos, srcSet, largest } from '@/data/photos';
import { site, tel } from '@/data/site';
import { Arrow } from './Icons';

export default function Hero() {
  const bg = useRef<HTMLDivElement>(null);

  // subtle parallax: transform only, rAF-throttled, disabled for reduced motion
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    const tick = () => {
      raf = 0;
      const y = Math.min(window.scrollY, 900);
      if (bg.current) bg.current.style.transform = `translate3d(0, ${y * 0.18}px, 0) scale(1.08)`;
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(tick); };
    window.addEventListener('scroll', on, { passive: true });
    return () => { window.removeEventListener('scroll', on); cancelAnimationFrame(raf); };
  }, []);

  const hero = photos.hero;
  return (
    <section id="top" className="relative isolate flex min-h-[100svh] items-end overflow-hidden bg-forest-deep pt-[76px] text-ivory">
      {/* background */}
      <div ref={bg} className="absolute inset-0 -z-20 will-change-transform" style={{ transform: 'scale(1.08)' }}>
        {hero ? (
          <img src={largest(hero)} srcSet={srcSet(hero)} sizes="100vw" alt="Freshly cleaned interior after construction by Magnolia Construction Cleaning"
            width={hero.width} height={hero.height} fetchPriority="high" decoding="async" className="h-full w-full object-cover" />
        ) : (
          <HeroArt />
        )}
      </div>
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(19,42,32,.55)_0%,rgba(19,42,32,.25)_35%,rgba(19,42,32,.92)_100%)]" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(19,42,32,.8),transparent_70%)]" />

      <div className="container-x pb-20 pt-24 sm:pb-28 lg:pb-32">
        <p className="eyebrow eyebrow-line fade-in mb-6" style={{ '--d': '200ms' } as React.CSSProperties}>Post-Construction Cleaning</p>
        <h1 className="font-serif font-medium text-ivory" style={{ fontSize: 'clamp(2.9rem, 9.4vw, 7.6rem)', lineHeight: 0.98, letterSpacing: '-0.02em' }}>
          <span className="mask"><span style={{ '--d': '350ms' } as React.CSSProperties}>From Construction</span></span>
          <span className="mask"><span style={{ '--d': '480ms' } as React.CSSProperties}>Dust to <em className="text-gold-light">Move-In</em></span></span>
          <span className="mask"><span style={{ '--d': '610ms' } as React.CSSProperties}>Ready.</span></span>
        </h1>
        <p className="fade-in mt-7 max-w-xl text-[17px] leading-relaxed text-ivory/80 sm:text-lg" style={{ '--d': '900ms' } as React.CSSProperties}>
          Professional post-construction cleaning for newly built, renovated, and remodeled spaces.
        </p>
        <div className="fade-in mt-10 flex flex-col gap-3 sm:flex-row" style={{ '--d': '1050ms' } as React.CSSProperties}>
          <a href="#quote" className="btn btn-gold"><span>Request a Free Quote <Arrow /></span></a>
          <a href="#work" className="btn btn-line-light"><span>View Our Work</span></a>
        </div>
        <div className="fade-in mt-10 flex items-center gap-4 text-[11px] uppercase tracking-[0.25em] text-ivory/60 sm:mt-14" style={{ '--d': '1300ms' } as React.CSSProperties}>
          <span className="h-px w-12 bg-gold" /> Built Clean. Finished Right.
        </div>
      </div>

      <a href="#intro" aria-label="Scroll to content" className="scroll-cue fade-in absolute bottom-6 right-8 hidden text-[10px] uppercase tracking-[0.3em] text-gold-light lg:block" style={{ '--d': '1600ms' } as React.CSSProperties}>Scroll</a>
    </section>
  );
}

/** Architectural line-art used until a real hero photo is supplied. Draws itself on load. */
function HeroArt() {
  return (
    <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden fill="none" stroke="#C9A96A" strokeWidth="1" opacity=".5">
      <defs>
        <radialGradient id="glow" cx="72%" cy="40%" r="60%"><stop offset="0" stopColor="#2C4D3E" /><stop offset="1" stopColor="#132A20" /></radialGradient>
      </defs>
      <rect width="1600" height="900" fill="url(#glow)" stroke="none" />
      <g pathLength="1">
        <path className="draw" pathLength={1} style={{ '--d': '300ms' } as React.CSSProperties} d="M760 470 1100 210 1440 470" />
        <path className="draw" pathLength={1} style={{ '--d': '600ms' } as React.CSSProperties} d="M820 440V800h560V440" />
        <path className="draw" pathLength={1} style={{ '--d': '800ms' } as React.CSSProperties} d="M1290 300V210h50v160" />
        <path className="draw" pathLength={1} style={{ '--d': '900ms' } as React.CSSProperties} d="M1000 800V590h200v210M1100 590v210M1000 695h200" />
        <path className="draw" pathLength={1} style={{ '--d': '1100ms' } as React.CSSProperties} d="M870 520h80v70h-80zM1250 520h80v70h-80z" />
        <path className="draw" pathLength={1} style={{ '--d': '1200ms' } as React.CSSProperties} d="M700 800H1500" />
      </g>
      <g stroke="#C9A96A" opacity=".18">
        {Array.from({ length: 13 }).map((_, i) => <path key={i} d={`M${i * 125} 0V900`} />)}
        {Array.from({ length: 8 }).map((_, i) => <path key={i} d={`M0 ${i * 125}H1600`} />)}
      </g>
      <g fill="#C9A96A" stroke="none">
        <path className="twinkle" d="M1500 160c.6 12 6 17.400 18 18-12 .6-17.400 6-18 18-.6-12-6-17.400-18-18 12-.6 17.400-6 18-18Z" />
        <path className="twinkle" style={{ animationDelay: '1.5s' }} d="M1420 250c.4 7 3.500 10 10.500 10.500-7 .4-10 3.500-10.500 10.500-.4-7-3.500-10-10.500-10.500 7-.4 10-3.500 10.500-10.500Z" />
      </g>
    </svg>
  );
}
