import { services } from '@/data/site';
import { Icon, Arrow } from './Icons';

export default function Services() {
  return (
    <section id="services" className="relative bg-ivory py-24 sm:py-32">
      <div className="container-x grid gap-14 lg:grid-cols-12 lg:gap-20">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-32">
            <p className="eyebrow eyebrow-line rv mb-6">Services</p>
            <h2 className="h-section rv" style={{ '--d': '80ms' } as React.CSSProperties}>Every stage. One standard.</h2>
            <p className="lead rv mt-6" style={{ '--d': '160ms' } as React.CSSProperties}>From the first rough clean to the final walkthrough, we handle the cleaning so the build can finish strong.</p>
            <a href="#quote" className="btn btn-forest rv mt-9" style={{ '--d': '240ms' } as React.CSSProperties}><span>Request a Free Quote <Arrow /></span></a>
          </div>
        </div>

        <ol className="border-t border-forest/20 lg:col-span-8">
          {services.map((s, i) => (
            <li key={s.id} className="rv group relative overflow-hidden border-b border-forest/20" style={{ '--d': `${i * 70}ms` } as React.CSSProperties}>
              <span className="absolute inset-y-0 left-0 w-0 bg-forest transition-[width] duration-500 ease-out group-hover:w-full" aria-hidden />
              <div className="relative flex items-start gap-5 py-8 transition-[padding] duration-500 group-hover:px-6 sm:gap-8 sm:py-10 sm:group-hover:px-8">
                <span className="w-8 shrink-0 pt-1 font-serif text-lg text-gold sm:pt-3">0{i + 1}</span>
                <Icon name={s.icon} className="mt-2 hidden h-9 w-9 shrink-0 text-gold sm:block" />
                <div>
                  <h3 className="font-serif text-[1.65rem] font-medium leading-tight text-forest transition-colors duration-500 group-hover:text-ivory sm:text-[2rem]">{s.title}</h3>
                  <p className="mt-2 max-w-xl text-[15.5px] leading-relaxed text-charcoal/70 transition-colors duration-500 group-hover:text-ivory/80">{s.body}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
