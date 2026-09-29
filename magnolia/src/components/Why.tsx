import { why } from '@/data/site';

export default function Why() {
  return (
    <section id="about" className="relative bg-forest py-24 text-ivory sm:py-32">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
      <div className="container-x">
        <div className="mb-16 max-w-3xl">
          <p className="eyebrow eyebrow-line rv mb-6">Why Magnolia</p>
          <h2 className="rv font-serif font-medium" style={{ fontSize: 'clamp(2.4rem,6vw,4.6rem)', lineHeight: 1.02, '--d': '80ms' } as React.CSSProperties}>
            Built Clean. <em className="text-gold-light">Finished Right.</em>
          </h2>
        </div>
        <div className="grid gap-px overflow-hidden border border-gold/25 bg-gold/25 sm:grid-cols-2 lg:grid-cols-4">
          {why.map((w, i) => (
            <div key={w.t} className="rv group bg-forest p-8 transition-colors duration-500 hover:bg-forest-deep sm:p-10" style={{ '--d': `${i * 90}ms` } as React.CSSProperties}>
              <span className="font-serif text-5xl text-gold/70 transition-colors duration-500 group-hover:text-gold">0{i + 1}</span>
              <div className="my-6 h-px w-10 bg-gold transition-all duration-500 group-hover:w-20" />
              <h3 className="font-serif text-[1.75rem] font-medium leading-tight">{w.t}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-ivory/70">{w.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
