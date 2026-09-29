import Nav from '@/components/Nav';
import Hero from '@/components/Hero';
import Intro from '@/components/Intro';
import BeforeAfter from '@/components/BeforeAfter';
import Services from '@/components/Services';
import Why from '@/components/Why';
import Process from '@/components/Process';
import Serve from '@/components/Serve';
import Gallery from '@/components/Gallery';
import Uniform from '@/components/Uniform';
import QuoteCTA from '@/components/QuoteCTA';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import RevealObserver from '@/components/Reveal';

export default function Home() {
  return (
    <>
      <Nav />
      <main id="main">
        <Hero />
        <Intro />
        <BeforeAfter />
        <Services />
        <Why />
        <Process />
        <Serve />
        <Gallery />
        <Uniform />
        <QuoteCTA />
        <Contact />
      </main>
      <Footer />
      <RevealObserver />
    </>
  );
}
