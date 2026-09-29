import type { Metadata } from 'next';
import LegalPage from '@/components/LegalPage';
export const metadata: Metadata = { title: 'Terms | Magnolia Construction Cleaning', alternates: { canonical: '/terms/' } };

export default function Terms() {
  return (
    <LegalPage title="Terms of Use">
      <p>By using this website you agree to these terms. The information on this site is provided for general purposes and does not constitute a binding offer.</p>
      <h2>Quotes and services</h2>
      <p>Quotes are estimates based on the information provided. Final scope, pricing, and schedule are confirmed in writing before work begins.</p>
      <h2>Website content</h2>
      <p>All logos, photographs, and text on this site belong to Magnolia Construction Cleaning LLC and may not be reused without permission.</p>
      <h2>Contact</h2>
      <p>[INSERT EMAIL]</p>
      <p>Last updated: [INSERT DATE]</p>
    </LegalPage>
  );
}
