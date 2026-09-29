import type { Metadata } from 'next';
import LegalPage from '@/components/LegalPage';
export const metadata: Metadata = { title: 'Privacy Policy | Magnolia Construction Cleaning', alternates: { canonical: '/privacy/' } };

export default function Privacy() {
  return (
    <LegalPage title="Privacy Policy">
      <p>Magnolia Construction Cleaning LLC (&ldquo;Magnolia&rdquo;) respects your privacy. This page explains what we collect and why.</p>
      <h2>What we collect</h2>
      <p>When you request a quote we collect the details you enter: name, phone, email, project address, project information, and any photos you upload.</p>
      <h2>How we use it</h2>
      <p>We use this information only to respond to your request, prepare a quote, and schedule work. We do not sell your information.</p>
      <h2>Contact</h2>
      <p>Questions about this policy: magnoliaconstructioncleans@gmail.com.</p>
      <p>Last updated: September 29, 2026</p>
    </LegalPage>
  );
}
