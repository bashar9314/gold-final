import type { SVGProps } from 'react';
const base = { width: 32, height: 32, viewBox: '0 0 32 32', fill: 'none', stroke: 'currentColor', strokeWidth: 1, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true } as const;

const paths: Record<string, React.ReactElement> = {
  sparkle: <><path d="M16 4c.8 6.4 3.6 9.2 10 10-6.4.8-9.2 3.6-10 10-.8-6.4-3.6-9.2-10-10 6.4-.8 9.2-3.6 10-10Z" /><path d="M25 3v4M23 5h4" /></>,
  check: <><rect x="5" y="5" width="22" height="22" /><path d="m11 16.5 3.5 3.5L21.5 12" /></>,
  layers: <><path d="m16 5 11 6-11 6L5 11l11-6Z" /><path d="m5 17 11 6 11-6M5 22l11 6 11-6" /></>,
  key: <><circle cx="11" cy="16" r="5" /><path d="M16 16h11M23 16v4M27 16v3" /></>,
  frame: <><path d="M4 15 16 5l12 10" /><path d="M7 13v14h18V13" /><path d="M13 27v-8h6v8" /></>,
  door: <><path d="M8 27V5h16v22" /><path d="M4 27h24" /><circle cx="20" cy="16" r=".8" fill="currentColor" /></>,
  phone: <><path d="M9 4h5l2 6-3 2a15 15 0 0 0 7 7l2-3 6 2v5a2 2 0 0 1-2 2A21 21 0 0 1 7 6a2 2 0 0 1 2-2Z" /></>,
  mail: <><rect x="4" y="7" width="24" height="18" /><path d="m4 9 12 9 12-9" /></>,
  pin: <><path d="M16 28s-8-7.5-8-14a8 8 0 0 1 16 0c0 6.500-8 14-8 14Z" /><circle cx="16" cy="14" r="3" /></>,
  clock: <><circle cx="16" cy="16" r="11" /><path d="M16 9v7l4 3" /></>,
};

export function Icon({ name, ...p }: { name: string } & SVGProps<SVGSVGElement>) {
  return <svg {...base} {...p}>{paths[name]}</svg>;
}

export const Arrow = () => (
  <svg className="arrow" width="18" height="10" viewBox="0 0 18 10" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden><path d="M0 5h16M12 1l4 4-4 4" /></svg>
);
