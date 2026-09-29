/**
 * Photo pipeline.
 * Drop originals into /photos-inbox using these names (jpg/jpeg/png/webp/heic-converted):
 *   hero.jpg                 -> hero background
 *   team.jpg (or uniform.jpg) -> team / uniform photo
 *   before-1.jpg, after-1.jpg (pairs 1..N)   -> before/after sliders (optional: pair-1.txt = caption)
 *   gallery-*.jpg            -> project gallery (optional prefix category-: e.g. gallery-final-kitchen.jpg)
 * Run `npm run photos` (also runs on `npm run build`).
 * Output: public/photos/*.webp in several widths + src/data/photos.generated.json
 */
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const IN = 'photos-inbox';
const OUT = 'public/photos';
const WIDTHS = [480, 800, 1280, 1920];
fs.mkdirSync(OUT, { recursive: true });

const files = fs.existsSync(IN)
  ? fs.readdirSync(IN).filter((f) => /\.(jpe?g|png|webp|avif|tiff?)$/i.test(f))
  : [];

async function process(file) {
  const base = path.parse(file).name.toLowerCase().replace(/[^a-z0-9-]+/g, '-');
  const img = sharp(path.join(IN, file), { failOn: 'none' }).rotate(); // honour EXIF orientation
  const meta = await img.metadata();
  const w = meta.width, h = meta.height;
  const srcs = [];
  for (const width of WIDTHS) {
    if (width > w && srcs.length) continue;
    const target = Math.min(width, w);
    const name = `${base}-${target}.webp`;
    await img.clone().resize({ width: target }).webp({ quality: 78, effort: 5 }).toFile(path.join(OUT, name));
    srcs.push({ src: `/photos/${name}`, width: target });
  }
  // tiny blurred placeholder
  const buf = await img.clone().resize({ width: 24 }).blur(1).webp({ quality: 40 }).toBuffer();
  return { id: base, width: w, height: h, srcs, blur: `data:image/webp;base64,${buf.toString('base64')}` };
}

const out = { hero: null, team: null, pairs: [], gallery: [] };
const byName = Object.fromEntries(files.map((f) => [path.parse(f).name.toLowerCase(), f]));

const cache = {};
const get = async (f) => (cache[f] ??= await process(f));

if (byName.hero) out.hero = await get(byName.hero);
if (byName.team || byName.uniform) out.team = await get(byName.team || byName.uniform);

for (let i = 1; i < 50; i++) {
  const b = byName[`before-${i}`], a = byName[`after-${i}`];
  if (!b || !a) continue;
  const capFile = path.join(IN, `pair-${i}.txt`);
  const caption = fs.existsSync(capFile) ? fs.readFileSync(capFile, 'utf8').trim() : '';
  out.pairs.push({ before: await get(b), after: await get(a), caption });
}

for (const f of files.filter((f) => /^gallery-/i.test(f)).sort()) {
  const item = await get(f);
  // gallery-<category>-<name>: category is one of final|rough|remodel|move-in
  const m = path.parse(f).name.toLowerCase().match(/^gallery-(final|rough|remodel|move-in|post-construction)-/);
  out.gallery.push({ ...item, category: m ? m[1] : 'all' });
}

fs.writeFileSync('src/data/photos.generated.json', JSON.stringify(out, null, 2));
console.log(`photos: hero=${!!out.hero} team=${!!out.team} pairs=${out.pairs.length} gallery=${out.gallery.length}`);
