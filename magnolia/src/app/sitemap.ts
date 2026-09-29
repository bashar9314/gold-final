import type { MetadataRoute } from 'next';
import { site } from '@/data/site';
export const dynamic = 'force-static';
export default function sitemap(): MetadataRoute.Sitemap {
  return ['', 'privacy/', 'terms/'].map((p) => ({ url: `${site.url}/${p}`, changeFrequency: 'monthly', priority: p ? 0.3 : 1 }));
}
