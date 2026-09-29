'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { photos, srcSet, largest, categoryLabels } from '@/data/photos';
import { Arrow } from './Icons';

export default function Gallery() {
  const all = photos.gallery;
  const [cat, setCat] = useState('all');
  const [open, setOpen] = useState<number | null>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  const cats = useMemo(() => ['all', ...Array.from(new Set(all.map((g) => g.category).filter((c) => c !== 'all')))], [all]);
  const list = useMemo(() => (cat === 'all' ? all : all.filter((g) => g.category === cat)), [all, cat]);

  const step = useCallback((d: number) => setOpen((i) => (i === null ? i : (i + d + list.length) % list.length)), [list.length]);

  useEffect(() => {
    if (open === null) return;
    document.body.style.overflow = 'hidden';
    closeBtn.current?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null);
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', key);
    return () => { window.removeEventListener('keydown', key); document.body.style.overflow = ''; lastFocus.current?.focus(); };
  }, [open, step]);

  // touch swipe in lightbox
  const sx = useRef(0);

  return (
    <section id="work" className="relative bg-ivory py-24 sm:py-32">
      <div className="container-x">
        <div className="mb-12 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div>
            <p className="eyebrow eyebrow-line rv mb-6">Our Work</p>
            <h2 className="h-section rv" style={{ '--d': '80ms' } as React.CSSProperties}>Finished spaces.<br />Every detail.</h2>
          </div>
          {cats.length > 2 && (
            <div role="group" aria-label="Filter projects" className="rv -mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:px-0">
              {cats.map((c) => (
                <button key={c} onClick={() => setCat(c)} aria-pressed={cat === c}
                  className={`min-h-[44px] shrink-0 border px-5 text-[11px] font-medium uppercase tracking-[0.2em] transition-colors duration-300 ${cat === c ? 'border-forest bg-forest text-ivory' : 'border-forest/25 text-forest hover:border-gold'}`}>
                  {c === 'all' ? 'All' : categoryLabels[c] ?? c}
                </button>
              ))}
            </div>
          )}
        </div>

        {all.length === 0 ? (
          <div className="grid gap-4 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rv flex aspect-[4/5] items-end border border-dashed border-gold/60 bg-ivory-warm/60 p-6" style={{ '--d': `${i * 90}ms` } as React.CSSProperties}>
                <p className="text-[10px] uppercase tracking-[0.25em] text-forest/55">Project photography<br /><span className="normal-case tracking-normal">Add files named gallery-*.jpg to photos-inbox/</span></p>
              </div>
            ))}
          </div>
        ) : (
          <ul className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>li]:mb-4">
            {list.map((g, i) => (
              <li key={g.id} className="rv break-inside-avoid" style={{ '--d': `${(i % 3) * 80}ms` } as React.CSSProperties}>
                <button onClick={(e) => { lastFocus.current = e.currentTarget; setOpen(i); }} aria-label={`View project photo ${i + 1} larger`}
                  className="group relative block w-full overflow-hidden bg-ivory-warm">
                  <img src={g.srcs[Math.min(1, g.srcs.length - 1)].src} srcSet={srcSet(g)} sizes="(min-width:1024px) 400px, (min-width:640px) 50vw, 100vw"
                    alt={`Cleaned ${categoryLabels[g.category]?.toLowerCase() ?? 'construction'} project by Magnolia Construction Cleaning`}
                    width={g.width} height={g.height} loading="lazy" decoding="async"
                    style={{ backgroundImage: `url(${g.blur})`, backgroundSize: 'cover' }}
                    className="h-auto w-full transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]" />
                  <span className="absolute inset-0 flex items-end bg-gradient-to-t from-forest-deep/70 via-transparent to-transparent p-5 opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100">
                    <span className="text-[10px] uppercase tracking-[0.28em] text-ivory">{categoryLabels[g.category] ?? 'View'} <span className="text-gold-light">+</span></span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-14 flex flex-col items-center gap-5 border-t border-forest/15 pt-12 text-center">
          <p className="rv font-serif text-3xl text-forest sm:text-4xl">Your project could be next.</p>
          <a href="#quote" className="btn btn-forest rv"><span>Request a Free Quote <Arrow /></span></a>
        </div>
      </div>

      {open !== null && list[open] && (
        <div role="dialog" aria-modal="true" aria-label="Project photo viewer" className="lb-enter fixed inset-0 z-[100] flex items-center justify-center bg-forest-deep/95 p-4 backdrop-blur-sm"
          onClick={() => setOpen(null)}
          onTouchStart={(e) => (sx.current = e.touches[0].clientX)}
          onTouchEnd={(e) => { const dx = e.changedTouches[0].clientX - sx.current; if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1); }}>
          <button ref={closeBtn} onClick={() => setOpen(null)} aria-label="Close" className="absolute right-3 top-3 flex h-12 w-12 items-center justify-center text-3xl text-ivory hover:text-gold-light">×</button>
          {list.length > 1 && <>
            <button onClick={(e) => { e.stopPropagation(); step(-1); }} aria-label="Previous photo" className="absolute left-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center text-3xl text-ivory hover:text-gold-light sm:left-6">‹</button>
            <button onClick={(e) => { e.stopPropagation(); step(1); }} aria-label="Next photo" className="absolute right-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center text-3xl text-ivory hover:text-gold-light sm:right-6">›</button>
          </>}
          <img key={list[open].id} src={largest(list[open])} srcSet={srcSet(list[open])} sizes="100vw" alt="Project photo, enlarged" onClick={(e) => e.stopPropagation()}
            className="lb-enter max-h-[88vh] max-w-full object-contain shadow-2xl" />
          <p className="absolute bottom-4 left-0 right-0 text-center text-[11px] uppercase tracking-[0.25em] text-ivory/60">{open + 1} / {list.length}</p>
        </div>
      )}
    </section>
  );
}
