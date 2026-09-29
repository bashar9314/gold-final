import { Arrow } from './Icons';
export default function Intro() {
  return (
    <section id="intro" className="relative bg-ivory py-24 sm:py-32">
      <div className="container-x grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-7">
          <p className="eyebrow eyebrow-line rv mb-6">The Final Step</p>
          <h2 className="h-section rv" style={{ '--d': '80ms' } as React.CSSProperties}>
            Construction leaves a mess.<br /><em className="text-gold-dark">We leave a finished space.</em>
          </h2>
        </div>
        <div className="lg:col-span-5 lg:pt-14">
          <div className="gold-rule rv-line mb-8" />
          <p className="lead rv">Magnolia Construction Cleaning turns newly built, renovated, and remodeled spaces into clean, polished, move-in-ready properties.</p>
          <p className="lead rv mt-4" style={{ '--d': '100ms' } as React.CSSProperties}>Dust, residue, debris: gone. Every surface checked. Ready for the next stage.</p>
          <a href="#quote" className="btn btn-line-dark rv mt-9" style={{ '--d': '200ms' } as React.CSSProperties}><span>Request a Free Quote <Arrow /></span></a>
        </div>
      </div>
    </section>
  );
}
