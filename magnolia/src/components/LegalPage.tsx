export default function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ivory">
      <header className="border-b border-gold/30 bg-ivory">
        <div className="container-x flex h-[72px] items-center justify-between">
          <a href="/" className="font-serif text-2xl font-semibold tracking-[0.06em] text-forest">MAGNOLIA</a>
          <a href="/" className="text-[11px] font-medium uppercase tracking-[0.22em] text-forest ulink">← Back to site</a>
        </div>
      </header>
      <main id="main" className="container-x max-w-3xl py-20">
        <h1 className="h-display text-5xl sm:text-6xl">{title}</h1>
        <div className="gold-rule my-8 w-24" />
        <div className="space-y-5 text-[16px] leading-relaxed text-charcoal/80 [&_h2]:mt-10 [&_h2]:font-serif [&_h2]:text-3xl [&_h2]:text-forest">{children}</div>
        <p className="mt-12 border border-dashed border-gold/60 p-4 text-sm text-stone">Draft template. Have this reviewed by a qualified professional and fill in the bracketed details before publishing.</p>
      </main>
    </div>
  );
}
