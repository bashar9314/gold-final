import { serve } from '@/data/site';

export default function Serve() {
  return (
    <section id="serve" className="relative overflow-hidden bg-ivory-warm py-24 sm:py-32">
      <div className="container-x grid gap-12 lg:grid-cols-12 lg:gap-20">
        <div className="lg:col-span-5">
          <p className="eyebrow eyebrow-line rv mb-6">Who We Serve</p>
          <h2 className="h-section rv" style={{ '--d': '80ms' } as React.CSSProperties}>For the people who build, and the people who move in.</h2>
          <p className="lead rv mt-6" style={{ '--d': '160ms' } as React.CSSProperties}>One dependable team for the final step, whatever the project.</p>
        </div>
        <ul className="border-t border-forest/25 lg:col-span-7">
          {serve.map((s, i) => (
            <li key={s} className="rv group flex items-baseline justify-between gap-6 border-b border-forest/25 py-5 transition-all duration-500 hover:pl-3 sm:py-6" style={{ '--d': `${i * 60}ms` } as React.CSSProperties}>
              <span className="flex items-baseline gap-5">
                <span className="w-7 text-[11px] tracking-[0.2em] text-gold">0{i + 1}</span>
                <span className="font-serif text-[1.65rem] leading-tight text-forest transition-colors duration-300 group-hover:text-gold-dark sm:text-[2.1rem]">{s}</span>
              </span>
              <span className="h-px w-8 shrink-0 bg-gold transition-all duration-500 group-hover:w-16" aria-hidden />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
