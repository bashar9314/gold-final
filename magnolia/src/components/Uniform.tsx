import { photos, srcSet, largest } from '@/data/photos';

export default function Uniform() {
  const u = photos.uniform;
  return (
    <section id="brand" className="relative overflow-hidden bg-forest-deep text-ivory">
      <div className="grid lg:grid-cols-2">
        <div className="rv relative min-h-[420px] bg-forest lg:min-h-[640px]">
          {u ? (
            <img src={largest(u)} srcSet={srcSet(u)} sizes="(min-width:1024px) 50vw, 100vw" alt="Magnolia Construction Cleaning branded team uniform"
              width={u.width} height={u.height} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-contain p-6 sm:p-10" />
          ) : (
            <div className="absolute inset-0 flex items-end border border-dashed border-gold/40 m-6 p-6 sm:m-10">
              <p className="text-[10px] uppercase tracking-[0.25em] text-ivory/50">Uniform mockup<br /><span className="normal-case tracking-normal">Add photos-inbox/uniform.jpg</span></p>
            </div>
          )}
        </div>
        <div className="flex flex-col justify-center px-5 py-20 sm:px-12 lg:px-20 lg:py-28">
          <p className="eyebrow eyebrow-line rv mb-6">The Magnolia Standard</p>
          <h2 className="rv font-serif font-medium" style={{ fontSize: 'clamp(2.3rem,5vw,4rem)', lineHeight: 1.04, '--d': '80ms' } as React.CSSProperties}>Professional from site to finish.</h2>
          <div className="gold-rule rv-line my-8 w-24" />
          <p className="lead rv !text-ivory/75" style={{ '--d': '120ms' } as React.CSSProperties}>Our team arrives in Magnolia colors, prepared and presentable. On your job site, and in your finished space.</p>
        </div>
      </div>
    </section>
  );
}
