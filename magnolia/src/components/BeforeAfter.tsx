'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { photos, srcSet, largest, type Photo } from '@/data/photos';
import { Arrow } from './Icons';

function Img({ p, alt, eager }: { p: Photo; alt: string; eager?: boolean }) {
  return <img src={largest(p)} srcSet={srcSet(p)} sizes="(min-width:1024px) 1100px, 100vw" alt={alt} width={p.width} height={p.height}
    loading={eager ? 'eager' : 'lazy'} decoding="async" draggable={false} className="absolute inset-0 h-full w-full object-cover" />;
}

/** Placeholder scenes shown until real photos exist. Pure CSS, clearly labelled. */
function PlaceholderScene({ kind }: { kind: 'before' | 'after' }) {
  const before = kind === 'before';
  return (
    <div className="absolute inset-0 flex items-end justify-start p-6 sm:p-10"
      style={before
        ? { background: 'repeating-linear-gradient(135deg,#8d8a80 0 14px,#84817a 14px 28px)' }
        : { background: 'linear-gradient(160deg,#FBF9F1,#EFEBDB)' }}>
      <p className={`max-w-[60%] text-[10px] uppercase tracking-[0.25em] ${before ? 'text-ivory/80' : 'text-forest/60'}`}>
        {before ? 'Add before photo' : 'Add after photo'}<br />
        <span className="normal-case tracking-normal opacity-80">photos-inbox/{before ? 'before' : 'after'}-1.jpg</span>
      </p>
    </div>
  );
}

function Slider({ before, after, caption, index, eager }: { before: Photo | null; after: Photo | null; caption?: string; index: number; eager?: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(50);
  const [touched, setTouched] = useState(false);
  const dragging = useRef(false);

  const setFromX = useCallback((x: number) => {
    const r = root.current!.getBoundingClientRect();
    setPos(Math.max(0, Math.min(100, ((x - r.left) / r.width) * 100)));
  }, []);

  // intro sweep when scrolled into view (skipped for reduced motion / once user has interacted)
  useEffect(() => {
    const el = root.current!;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    setPos(96);
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      el.classList.add('settle');
      requestAnimationFrame(() => setPos(50));
      setTimeout(() => el.classList.remove('settle'), 1000);
    }, { threshold: 0.45 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const down = (e: React.PointerEvent) => {
    dragging.current = true; setTouched(true);
    root.current!.classList.remove('settle');
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setFromX(e.clientX);
  };
  const move = (e: React.PointerEvent) => { if (dragging.current) setFromX(e.clientX); };
  const up = () => { dragging.current = false; };

  return (
    <figure className="m-0">
      <div ref={root} className="ba relative aspect-[4/3] w-full overflow-hidden bg-forest-deep shadow-[0_30px_60px_-30px_rgba(19,42,32,.55)] sm:aspect-[16/10]"
        style={{ '--pos': `${pos}%` } as React.CSSProperties}
        onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
        {/* AFTER underneath, BEFORE clipped on top */}
        {after ? <Img p={after} alt={`After: finished, cleaned space (project ${index + 1})`} eager={eager} /> : <PlaceholderScene kind="after" />}
        <div className="ba-before absolute inset-0">
          {before ? <Img p={before} alt={`Before: construction site prior to cleaning (project ${index + 1})`} eager={eager} /> : <PlaceholderScene kind="before" />}
        </div>

        <span className="pointer-events-none absolute left-4 top-4 bg-forest-deep/80 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.28em] text-ivory backdrop-blur-sm sm:left-6 sm:top-6">Before</span>
        <span className="pointer-events-none absolute right-4 top-4 bg-gold px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.28em] text-forest-deep sm:right-6 sm:top-6">After</span>

        <input type="range" min={0} max={100} step={1} value={Math.round(pos)} aria-label={`Before and after comparison slider, project ${index + 1}`}
          onChange={(e) => { setTouched(true); setPos(+e.target.value); }} tabIndex={0} />

        <div className="ba-handle pointer-events-none absolute inset-y-0 -translate-x-1/2">
          <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-ivory shadow-[0_0_12px_rgba(0,0,0,.4)]" />
          <div className="ba-knob absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-gold bg-ivory text-forest shadow-xl">
            <svg width="26" height="14" viewBox="0 0 26 14" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden><path d="M8 1 2 7l6 6M18 1l6 6-6 6" /></svg>
          </div>
        </div>

        <p className={`pointer-events-none absolute inset-x-0 bottom-4 text-center text-[10px] uppercase tracking-[0.3em] text-ivory transition-opacity duration-700 [text-shadow:0_1px_8px_rgba(0,0,0,.6)] ${touched ? 'opacity-0' : 'opacity-90'}`}>
          Drag to compare
        </p>
      </div>
      {caption && <figcaption className="mt-3 text-sm text-charcoal/60">{caption}</figcaption>}
    </figure>
  );
}

export default function BeforeAfter() {
  const pairs = photos.pairs;
  return (
    <section id="difference" className="relative overflow-hidden bg-forest-deep py-24 text-ivory sm:py-32">
      <div className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full border border-gold/20" />
      <div className="pointer-events-none absolute -right-24 -top-24 h-[520px] w-[520px] rounded-full border border-gold/10" />
      <div className="container-x relative">
        <div className="mb-12 grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="eyebrow eyebrow-line rv mb-6">Before → After</p>
            <h2 className="rv font-serif font-medium" style={{ fontSize: 'clamp(2.6rem,7vw,5.5rem)', lineHeight: 1, '--d': '80ms' } as React.CSSProperties}>See the difference.</h2>
          </div>
          <p className="rv lead !text-ivory/70 lg:col-span-5" style={{ '--d': '160ms' } as React.CSSProperties}>The final detail that turns a construction project into a finished space.</p>
        </div>

        <div className="rv" style={{ '--d': '100ms' } as React.CSSProperties}>
          {pairs.length === 0
            ? <Slider before={null} after={null} index={0} />
            : <Slider before={pairs[0].before} after={pairs[0].after} caption={pairs[0].caption} index={0} eager />}
        </div>

        {pairs.length > 1 && (
          <div className="mt-8 grid gap-8 md:grid-cols-2">
            {pairs.slice(1).map((p, i) => (
              <div key={i} className="rv"><Slider before={p.before} after={p.after} caption={p.caption} index={i + 1} /></div>
            ))}
          </div>
        )}

        <div className="mt-14 flex flex-col items-start justify-between gap-6 border-t border-gold/25 pt-10 sm:flex-row sm:items-center">
          <p className="rv font-serif text-2xl text-ivory sm:text-3xl">Ready to see your project finished?</p>
          <a href="#quote" className="btn btn-gold rv"><span>Request a Free Quote <Arrow /></span></a>
        </div>
      </div>
    </section>
  );
}
