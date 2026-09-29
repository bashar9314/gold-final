/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',          // fully static: fast, host anywhere (Netlify, Vercel, Cloudflare, GitHub Pages)
  trailingSlash: true,
  images: { unoptimized: true }, // images are pre-optimized by scripts/optimize-photos.mjs
  poweredByHeader: false,
};
export default nextConfig;
