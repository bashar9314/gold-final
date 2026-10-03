import type { Metadata, Viewport } from 'next';
import './globals.css';
import { site } from '@/data/site';

const where = site.serviceAreaConfirmed ? ` serving ${site.serviceArea}` : '';
const title = `Post-Construction Cleaning${site.serviceAreaConfirmed ? ` in ${site.serviceAreas[0]}` : ''} | Magnolia Construction Cleaning`;
const description = `Magnolia Construction Cleaning LLC provides professional post-construction, rough, final, and move-in ready cleaning${where}. From construction dust to move-in ready. Request a free quote.`;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title,
  description,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website', siteName: site.name, title, description, url: '/',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Magnolia Construction Cleaning LLC logo' }],
  },
  twitter: { card: 'summary_large_image', title, description, images: ['/og-image.jpg'] },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { themeColor: '#F7F4E8', width: 'device-width', initialScale: 1 };

const schema = {
  '@context': 'https://schema.org',
  '@type': 'HomeAndConstructionBusiness',
  name: site.name,
  url: site.url,
  logo: `${site.url}/brand/magnolia-logo.webp`,
  image: `${site.url}/og-image.jpg`,
  description: 'Professional post-construction cleaning for newly built, renovated, and remodeled spaces.',
  // Only emitted once real facts are entered in src/data/site.ts. Nothing is invented.
  ...(site.phone && { telephone: site.phone }),
  ...(site.email && { email: site.email }),
  ...(site.serviceAreaConfirmed && {
    areaServed: { '@type': 'GeoCircle', geoMidpoint: { '@type': 'GeoCoordinates', latitude: site.geo.lat, longitude: site.geo.lng }, geoRadius: site.geo.radiusMeters },
  }),
  ...(site.hours && { openingHoursSpecification: [{ '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'], opens: '08:00', closes: '20:00' }] }),
  makesOffer: ['Post-Construction Cleaning', 'Final Construction Clean', 'Rough Clean', 'Final Clean', 'Renovation & Remodel Cleaning', 'Move-In Ready Cleaning']
    .map((n) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: n } })),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* add .js class before paint so reveal animations never flash or leave content hidden without JS */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
        <link rel="preload" as="image" href="/brand/magnolia-mark.webp" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      </head>
      <body>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:bg-forest focus:px-4 focus:py-3 focus:text-ivory">Skip to content</a>
        {children}
      </body>
    </html>
  );
}
