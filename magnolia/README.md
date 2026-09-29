# Magnolia Construction Cleaning — website

Next.js 15 (static export) + Tailwind CSS. Self-hosted fonts, pre-optimized WebP images, ~112 kB first-load JS.

## Run
```
npm install
npm run dev        # http://localhost:3000
npm run build      # optimizes photos + exports static site to /out
```
Deploy `/out` to Netlify, Vercel, Cloudflare Pages, or any static host.

## 1. Add your photos
Drop originals in `photos-inbox/` (see the README there): `hero.jpg`, `before-1.jpg` + `after-1.jpg` (more pairs: -2, -3…), `gallery-*.jpg`, `uniform.jpg`. Then `npm run photos`.
Until photos exist, clearly labelled placeholders show. No fake imagery is used.

## 2. Add business facts — `src/data/site.ts`
Phone, email, hours, service area, social links, domain (`NEXT_PUBLIC_SITE_URL`). Empty values render as `[INSERT …]` placeholders and are omitted from schema.org.
Set `serviceAreaConfirmed: true` only when Memphis / Southaven / Mid-South are confirmed; that turns on location SEO in titles, descriptions and schema.

## 3. Connect the quote form
Set `NEXT_PUBLIC_FORM_ENDPOINT` to a Formspree / Netlify / custom endpoint that accepts multipart POST (photos are attached as `photos`).
Without it, the form opens an email draft if an email is set (no attachments), otherwise shows a "not connected" notice.

## Notes
- Privacy / Terms pages are draft templates; have them reviewed.
- Logo files are in `public/brand/` (original PNG kept unmodified).
