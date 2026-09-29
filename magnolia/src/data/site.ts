/**
 * Single source of truth for business facts.
 * Anything left empty renders as a clearly marked placeholder and is NEVER invented.
 * Fill these in and the whole site (contact section, footer, schema.org, buttons) updates.
 */
export const site = {
  name: 'Magnolia Construction Cleaning LLC',
  short: 'Magnolia Construction Cleaning',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.example.com', // TODO: real domain
  phone: '(662) 318-4048',
  email: 'magnoliapostwork@gmail.com',
  hours: 'Monday – Sunday, 8:00 AM – 8:00 PM',
  serviceArea: 'Southaven, Mississippi and surrounding communities within a 40-mile radius',
  // Only set true once you have CONFIRMED these areas. Drives SEO copy + schema.
  serviceAreaConfirmed: true,
  serviceAreas: ['Southaven, Mississippi'], // confirmed: 40-mile radius from Southaven
  geo: { lat: 34.9889, lng: -90.0126, radiusMeters: 64374 },
  social: { instagram: '', facebook: '', linkedin: '' } as Record<string, string>,
  // Where the quote form posts (Formspree / Netlify Forms / your API). See README.
  formEndpoint: process.env.NEXT_PUBLIC_FORM_ENDPOINT || '',
};

export const ph = {
  phone: '[INSERT PHONE]',
  email: '[INSERT EMAIL]',
  hours: '[INSERT HOURS]',
  serviceArea: '[INSERT SERVICE AREA]',
};

export const tel = (p: string) => 'tel:' + p.replace(/[^+\d]/g, '');

export const nav = [
  { label: 'Home', href: '#top' },
  { label: 'Services', href: '#services' },
  { label: 'Our Work', href: '#work' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
];

export const services = [
  { id: 'post', title: 'Post-Construction Cleaning', body: 'Detailed cleaning after construction or renovation.', icon: 'sparkle' },
  { id: 'final-construction', title: 'Final Construction Clean', body: 'Removing dust, debris, residue, and construction-related mess before turnover.', icon: 'check' },
  { id: 'rough', title: 'Rough Clean', body: 'Initial cleaning during the construction process to prepare the property for the next stage.', icon: 'layers' },
  { id: 'final', title: 'Final Clean', body: 'Detailed finishing clean before the property is delivered.', icon: 'key' },
  { id: 'remodel', title: 'Renovation & Remodel Cleaning', body: 'Cleaning homes and commercial spaces after remodeling or renovation.', icon: 'frame' },
  { id: 'move-in', title: 'Move-In Ready Cleaning', body: 'Preparing newly completed spaces for owners, tenants, buyers, or clients.', icon: 'door' },
] as const;

export const why = [
  { t: 'Professional', d: 'We approach every project with attention to detail and professionalism.' },
  { t: 'Detail Driven', d: 'Construction cleaning is about the small details that make a finished space look truly finished.' },
  { t: 'Reliable', d: 'Clear communication, dependable scheduling, and professional presentation.' },
  { t: 'Built for the Final Step', d: 'We help contractors, builders, remodelers, property owners, and developers prepare spaces for the next stage.' },
];

export const processSteps = [
  { n: '01', t: 'Request a Quote', d: 'Tell us about the project. It takes a minute.' },
  { n: '02', t: 'Walkthrough / Project Details', d: 'We confirm scope, timing, and site details.' },
  { n: '03', t: 'Professional Cleaning', d: 'Our uniformed team cleans the space, top to bottom.' },
  { n: '04', t: 'Final Inspection & Turnover', d: 'We check the details, then hand over a finished space.' },
];

export const serve = [
  'General Contractors', 'Home Builders', 'Remodeling Contractors', 'Property Developers',
  'Real Estate Professionals', 'Homeowners', 'Commercial Property Owners',
];

export const propertyTypes = ['Residential', 'Commercial', 'New Construction', 'Renovation / Remodel', 'Other'];
export const projectTypes = ['Rough Clean', 'Final Clean', 'Post-Construction Clean', 'Move-In Ready', 'Other'];
