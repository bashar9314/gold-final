import { processSteps as steps } from '@/data/site';

export default function Process() {
  return (
    <section id="process" className="bg-ivory-soft py-24 sm:py-32">
      <div className="container-x">
        <div className="mb-16 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="eyebrow eyebrow-line rv mb-6">Our Process</p>
            <h2 className="h-section rv" style={{ '--d': '80ms' } as React.CSSProperties}>Four steps. No surprises.</h2>
          </div>
          <p className="lead rv max-w-md" style={{ '--d': '140ms' } as React.CSSProperties}>Simple, clear, and built around your schedule.</p>
        </div>
        <ol className="relative grid gap-12 md:grid-cols-4 md:gap-8">
          <div className="rv-line absolute left-0 right-0 top-[27px] hidden h-px bg-gold/60 md:block" aria-hidden />
          <div className="absolute bottom-0 left-[27px] top-0 w-px bg-gold/40 md:hidden" aria-hidden />
          {steps.map((s, i) => (
            <li key={s.n} className="rv relative pl-20 md:pl-0" style={{ '--d': `${i * 140}ms` } as React.CSSProperties}>
              <span className="absolute left-0 top-0 flex h-[54px] w-[54px] items-center justify-center rounded-full border border-gold bg-ivory-soft font-serif text-xl text-forest md:relative">{s.n}</span>
              <h3 className="font-serif text-2xl font-medium leading-tight text-forest md:mt-8">{s.t}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-charcoal/70">{s.d}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
