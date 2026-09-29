import raw from './photos.generated.json';

export type Photo = {
  id: string; width: number; height: number; blur: string;
  srcs: { src: string; width: number }[];
};
export type Pair = { before: Photo; after: Photo; caption: string };
export type GalleryPhoto = Photo & { category: string };

const data = raw as unknown as {
  hero: Photo | null; team: Photo | null; pairs: Pair[]; gallery: GalleryPhoto[];
};
export const photos = data;

export const srcSet = (p: Photo) => p.srcs.map((s) => `${s.src} ${s.width}w`).join(', ');
export const largest = (p: Photo) => p.srcs[p.srcs.length - 1].src;
export const smallest = (p: Photo) => p.srcs[0].src;

export const categoryLabels: Record<string, string> = {
  final: 'Final Clean', rough: 'Rough Clean', remodel: 'Remodel',
  'move-in': 'Move-In Ready', 'post-construction': 'Post-Construction',
};
