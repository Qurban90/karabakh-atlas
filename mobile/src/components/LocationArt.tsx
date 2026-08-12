import { memo } from 'react';
import type { Category } from '../api/types';

/**
 * Generative SVG scene per location — deterministic from the location id, so
 * the same place always renders the same “postcard”. Two variants:
 *   before → muted, damaged (2020/2023)  ·  after → vibrant, restored (2026)
 * Fully self-contained: no image assets, works offline, scales crisply.
 */

type Variant = 'before' | 'after';
type Scene =
  | 'mosque' | 'fortress' | 'house' | 'dome' | 'school' | 'campus' | 'plaza'
  | 'park' | 'field' | 'spring' | 'road' | 'airport' | 'solar' | 'village'
  | 'hotel' | 'congress';

const SCENE_BY_ID: Record<string, Scene> = {
  'yuxari-govhar-aga': 'mosque',
  'ashagi-govhar-aga': 'mosque',
  'shusha-qalasi': 'fortress',
  'cidir-duzu': 'field',
  'isa-bulagi': 'spring',
  'natavan-evi': 'house',
  'uzeyir-ev-muzeyi': 'house',
  'bulbul-ev-muzeyi': 'house',
  'vaqif-turbesi': 'dome',
  'xaribulbul-hotel': 'hotel',
  'shusha-realni-mektebi': 'school',
  'qarabag-universiteti': 'campus',
  'xankendi-merkezi-meydani': 'plaza',
  'zefer-parki': 'park',
  'xankendi-konqres-merkezi': 'congress',
  'xocali-hava-limani': 'airport',
  'agdam-xankendi-yolu': 'road',
  'yasil-enerji-qovsagi': 'solar',
  'xanyurdu-mehellesi': 'village'
};

const SCENE_BY_CATEGORY: Record<Category, Scene> = {
  heritage: 'house',
  infrastructure: 'congress',
  energy_roads: 'road',
  culture_tourism: 'park',
  education: 'school',
  smart_village: 'village'
};

/** Scenes that did not exist before restoration — “before” shows a building site. */
const NEW_BUILD: Scene[] = ['hotel', 'campus', 'plaza', 'park', 'road', 'airport', 'solar', 'village', 'congress'];

function hashSeed(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rng(seed: number) {
  let s = seed || 1;
  return () => {
    s = Math.imul(s ^ (s >>> 15), s | 1);
    s ^= s + Math.imul(s ^ (s >>> 7), s | 61);
    return ((s ^ (s >>> 14)) >>> 0) / 4294967296;
  };
}

interface Palette {
  sky: [string, string];
  sun: string | null;
  far: string;
  near: string;
  ground: string;
  wall: string;
  dark: string;
  accent: string;
  win: string;
  green: string;
}

const AFTER: Palette = {
  sky: ['#c7d2fe', '#fde68a'],
  sun: '#f59e0b',
  far: '#a5b4fc',
  near: '#7c8ce0',
  ground: '#86efac',
  wall: '#f8fafc',
  dark: '#475569',
  accent: '#7c3aed',
  win: '#fbbf24',
  green: '#10b981'
};

const BEFORE: Palette = {
  sky: ['#b8b2a7', '#8f887b'],
  sun: null,
  far: '#8d867a',
  near: '#736c60',
  ground: '#a89e8d',
  wall: '#8b8478',
  dark: '#5c564c',
  accent: '#6e675c',
  win: '#6e675c',
  green: '#7d7f6a'
};

/* ── scene glyphs (drawn around cx=200, ground y≈185) ── */

function Windows({ xs, y, w, h, fill, opacity = 1 }: { xs: number[]; y: number; w: number; h: number; fill: string; opacity?: number }) {
  return (
    <>
      {xs.map((x) => (
        <rect key={x} x={x} y={y} width={w} height={h} rx={1.5} fill={fill} opacity={opacity} />
      ))}
    </>
  );
}

function SceneShape({ scene, p, damaged }: { scene: Scene; p: Palette; damaged: boolean }) {
  const winFill = damaged ? '#00000033' : p.win;
  switch (scene) {
    case 'mosque':
      return (
        <g>
          <rect x={122} y={92} width={10} height={93} fill={p.wall} />
          <rect x={268} y={92} width={10} height={93} fill={p.wall} />
          <path d="M119 92 h16 l-8 -16 Z" fill={p.accent} />
          <path d="M265 92 h16 l-8 -16 Z" fill={p.accent} />
          <rect x={145} y={122} width={110} height={63} fill={p.wall} />
          <path d="M160 122 a40 34 0 0 1 80 0 Z" fill={p.accent} />
          <path d="M196 84 l4 -9 l4 9 Z" fill={damaged ? p.dark : '#f59e0b'} />
          <path d="M188 185 v-26 a12 14 0 0 1 24 0 v26 Z" fill={p.dark} />
          <Windows xs={[156, 232]} y={140} w={12} h={22} fill={winFill} />
        </g>
      );
    case 'fortress':
      return (
        <g>
          <rect x={92} y={132} width={216} height={53} fill={p.wall} />
          {[92, 116, 140, 164, 212, 236, 260, 284].map((x) => (
            <rect key={x} x={x} y={122} width={14} height={12} fill={p.wall} />
          ))}
          <rect x={70} y={100} width={38} height={85} fill={p.dark} opacity={0.92} />
          <rect x={292} y={100} width={38} height={85} fill={p.dark} opacity={0.92} />
          {[72, 86, 100].map((x) => (
            <rect key={x} x={x} y={90} width={9} height={11} fill={p.dark} opacity={0.92} />
          ))}
          {[294, 308, 322].map((x) => (
            <rect key={x} x={x} y={90} width={9} height={11} fill={p.dark} opacity={0.92} />
          ))}
          <path d="M182 185 v-32 a18 20 0 0 1 36 0 v32 Z" fill={p.near} />
        </g>
      );
    case 'house':
      return (
        <g>
          <rect x={138} y={128} width={124} height={57} fill={p.wall} />
          <path d="M128 128 L200 96 L272 128 Z" fill={p.accent} />
          <rect x={186} y={150} width={28} height={35} fill={p.dark} rx={2} />
          <path d="M186 150 a14 12 0 0 1 28 0 Z" fill={p.dark} />
          <Windows xs={[150, 234]} y={140} w={18} h={20} fill={winFill} />
          <rect x={138} y={166} width={124} height={3} fill={p.dark} opacity={0.25} />
        </g>
      );
    case 'dome':
      return (
        <g>
          <rect x={162} y={122} width={76} height={63} fill={p.wall} />
          <path d="M164 122 C168 84 232 84 236 122 Z" fill={p.accent} />
          <path d="M197 78 l3 -8 l3 8 Z" fill={damaged ? p.dark : '#f59e0b'} />
          <rect x={188} y={148} width={24} height={37} rx={2} fill={p.dark} />
          <Windows xs={[168, 216]} y={136} w={12} h={18} fill={winFill} />
        </g>
      );
    case 'school':
      return (
        <g>
          <rect x={112} y={118} width={176} height={67} fill={p.wall} />
          <path d="M104 118 L200 92 L296 118 Z" fill={p.accent} />
          {[126, 158, 226, 258].map((x) => (
            <rect key={x} x={x} y={130} width={10} height={55} fill={p.dark} opacity={0.28} />
          ))}
          <rect x={186} y={146} width={28} height={39} fill={p.dark} rx={2} />
          <Windows xs={[128, 156, 228, 256]} y={134} w={16} h={18} fill={winFill} />
        </g>
      );
    case 'campus':
      return (
        <g>
          <rect x={98} y={126} width={92} height={59} fill={p.wall} />
          <rect x={206} y={104} width={96} height={81} fill={p.wall} />
          <Windows xs={[108, 130, 152, 172]} y={138} w={12} h={13} fill={winFill} />
          <Windows xs={[108, 130, 152, 172]} y={160} w={12} h={13} fill={winFill} />
          <Windows xs={[216, 240, 264]} y={116} w={14} h={13} fill={winFill} />
          <Windows xs={[216, 240, 264]} y={140} w={14} h={13} fill={winFill} />
          <Windows xs={[216, 240, 264]} y={162} w={14} h={13} fill={winFill} />
          <rect x={196} y={100} width={3} height={85} fill={p.dark} />
          <path d="M199 100 h20 v10 h-20 Z" fill={damaged ? p.dark : '#10b981'} />
        </g>
      );
    case 'plaza':
      return (
        <g>
          <ellipse cx={200} cy={180} rx={92} ry={9} fill={p.dark} opacity={0.2} />
          <rect x={168} y={158} width={64} height={12} rx={6} fill={p.wall} />
          <rect x={184} y={140} width={32} height={18} rx={5} fill={p.wall} />
          <rect x={196} y={124} width={8} height={18} fill={p.accent} />
          {!damaged && (
            <>
              <path d="M200 124 C 186 104 175 112 172 126" stroke="#38bdf8" strokeWidth={3} fill="none" strokeLinecap="round" />
              <path d="M200 124 C 214 104 225 112 228 126" stroke="#38bdf8" strokeWidth={3} fill="none" strokeLinecap="round" />
              <path d="M200 120 C 200 104 200 100 200 96" stroke="#38bdf8" strokeWidth={3} strokeLinecap="round" />
            </>
          )}
          <rect x={118} y={128} width={5} height={54} fill={p.dark} />
          <circle cx={120.5} cy={124} r={6} fill={damaged ? p.dark : '#fde047'} />
          <rect x={277} y={128} width={5} height={54} fill={p.dark} />
          <circle cx={279.5} cy={124} r={6} fill={damaged ? p.dark : '#fde047'} />
        </g>
      );
    case 'park': {
      const trees = [
        { x: 130, s: 1 },
        { x: 200, s: 1.25 },
        { x: 268, s: 0.9 }
      ];
      return (
        <g>
          {trees.map(({ x, s }) => (
            <g key={x} transform={`translate(${x} 185) scale(${s})`}>
              <rect x={-4} y={-30} width={8} height={30} fill={damaged ? p.dark : '#92400e'} />
              <circle cx={0} cy={-44} r={22} fill={p.green} />
              <circle cx={-15} cy={-32} r={14} fill={p.green} opacity={0.9} />
              <circle cx={15} cy={-32} r={14} fill={p.green} opacity={0.9} />
            </g>
          ))}
          <rect x={158} y={168} width={40} height={5} rx={2.5} fill={p.dark} />
          <rect x={160} y={173} width={5} height={12} fill={p.dark} />
          <rect x={191} y={173} width={5} height={12} fill={p.dark} />
        </g>
      );
    }
    case 'field':
      return (
        <g>
          <path d="M60 185 Q 140 150 220 172 T 360 168 V 185 Z" fill={p.green} opacity={0.75} />
          {!damaged && (
            <g>
              <rect x={252} y={140} width={64} height={45} rx={4} fill={p.wall} opacity={0.95} />
              <rect x={258} y={148} width={52} height={30} rx={3} fill={p.accent} opacity={0.8} />
              <path d="M252 140 l32 -14 l32 14 Z" fill={p.accent} />
            </g>
          )}
          <g transform="translate(120 158)">
            <path d="M0 0 C -8 -18 -22 -20 -24 -10 C -25 -3 -12 2 0 0 Z" fill={damaged ? p.dark : '#a78bfa'} />
            <path d="M0 0 C 8 -18 22 -20 24 -10 C 25 -3 12 2 0 0 Z" fill={damaged ? p.dark : '#8b5cf6'} />
            <circle cx={0} cy={-2} r={6} fill={damaged ? p.near : '#f59e0b'} />
            <rect x={-1.5} y={0} width={3} height={27} fill={damaged ? p.dark : '#059669'} />
          </g>
        </g>
      );
    case 'spring':
      return (
        <g>
          <path d="M150 185 v-40 a50 42 0 0 1 100 0 v40 Z" fill={p.wall} />
          <path d="M168 185 v-26 a32 26 0 0 1 64 0 v26 Z" fill={p.dark} />
          {!damaged && (
            <>
              <path d="M200 168 C 200 176 199 181 199 185" stroke="#38bdf8" strokeWidth={4} strokeLinecap="round" />
              <ellipse cx={200} cy={187} rx={26} ry={5} fill="#38bdf8" opacity={0.7} />
            </>
          )}
          <circle cx={140} cy={178} r={9} fill={p.near} />
          <circle cx={262} cy={181} r={7} fill={p.near} />
        </g>
      );
    case 'road':
      return (
        <g>
          <path d="M155 108 L245 108 L330 185 L70 185 Z" fill={damaged ? '#7a7264' : '#475569'} />
          {!damaged && (
            <>
              {[0, 1, 2, 3].map((i) => (
                <rect key={i} x={197 - i} y={116 + i * 18} width={6 + i * 2} height={10} fill="#fde047" transform={`skewX(0)`} />
              ))}
              <rect x={118} y={128} width={4} height={40} fill={p.dark} />
              <circle cx={120} cy={124} r={5} fill="#fde047" />
            </>
          )}
          <path d="M155 108 L245 108 L 251 114 L149 114 Z" fill={p.far} opacity={0.6} />
        </g>
      );
    case 'airport':
      return (
        <g>
          <path d="M130 128 L270 128 L330 185 L70 185 Z" fill="#475569" />
          {[0, 1, 2].map((i) => (
            <rect key={i} x={194} y={136 + i * 16} width={12} height={8} fill="#fde047" />
          ))}
          <rect x={92} y={104} width={26} height={54} fill={p.wall} />
          <rect x={88} y={94} width={34} height={14} rx={4} fill={p.accent} />
          <path d="M262 96 l30 10 l-30 10 l6 -10 Z" fill={p.wall} />
        </g>
      );
    case 'solar':
      return (
        <g>
          {[0, 1, 2].map((row) =>
            [0, 1, 2, 3].map((col) => (
              <g key={`${row}-${col}`} transform={`translate(${118 + col * 46} ${132 + row * 20})`}>
                <path d="M0 12 L34 12 L40 0 L6 0 Z" fill={damaged ? p.near : '#1d4ed8'} stroke={damaged ? p.dark : '#93c5fd'} strokeWidth={1.4} />
              </g>
            ))
          )}
          <rect x={310} y={120} width={4} height={65} fill={p.dark} />
          <circle cx={312} cy={112} r={9} fill={damaged ? p.near : '#f59e0b'} />
        </g>
      );
    case 'village':
      return (
        <g>
          {[118, 200, 282].map((x, i) => (
            <g key={x} transform={`translate(${x} 0)`}>
              <rect x={-32} y={140} width={64} height={45} fill={p.wall} />
              <path d="M-38 140 L0 116 L38 140 Z" fill={p.accent} />
              {!damaged && <rect x={4 - 26} y={122} width={22} height={9} fill="#1d4ed8" transform="skewX(-18)" />}
              <rect x={-8} y={158} width={16} height={27} fill={p.dark} />
              <Windows xs={[i === 1 ? 12 : -26]} y={150} w={13} h={13} fill={winFill} />
            </g>
          ))}
        </g>
      );
    case 'hotel':
      return (
        <g>
          <rect x={152} y={92} width={96} height={93} rx={4} fill={p.wall} />
          {[0, 1, 2, 3].map((row) => (
            <Windows key={row} xs={[162, 184, 206, 228]} y={102 + row * 20} w={12} h={12} fill={winFill} opacity={row === 3 ? 0.65 : 1} />
          ))}
          <rect x={144} y={178} width={112} height={7} rx={3} fill={p.accent} />
          <path d="M186 92 h28 v-10 h-28 Z" fill={p.accent} />
        </g>
      );
    case 'congress':
      return (
        <g>
          <path d="M108 128 Q 200 96 292 128 V 185 H 108 Z" fill={p.wall} />
          {[122, 146, 170, 194, 218, 242, 266].map((x) => (
            <rect key={x} x={x} y={132} width={12} height={53} fill={damaged ? '#00000026' : '#7dd3fc'} opacity={0.85} />
          ))}
          <rect x={104} y={124} width={192} height={6} rx={3} fill={p.accent} />
        </g>
      );
    default:
      return null;
  }
}

function BuildingSite({ p }: { p: Palette }) {
  return (
    <g>
      <rect x={130} y={168} width={140} height={5} fill={p.dark} opacity={0.5} />
      <rect x={130} y={178} width={140} height={5} fill={p.dark} opacity={0.35} />
      <rect x={252} y={88} width={5} height={97} fill={p.dark} />
      <rect x={182} y={88} width={92} height={5} fill={p.dark} />
      <path d="M182 91 L 182 104" stroke={p.dark} strokeWidth={2} />
      <rect x={176} y={104} width={13} height={10} fill={p.dark} />
      <path d="M252 88 L 236 110 L 268 110 Z" fill="none" stroke={p.dark} strokeWidth={2.5} />
      {[150, 205, 245].map((x) => (
        <circle key={x} cx={x} cy={182} r={5} fill={p.dark} opacity={0.45} />
      ))}
    </g>
  );
}

function KhariBulbul({ x, y, s }: { x: number; y: number; s: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M0 0 C -4 -9 -11 -10 -12 -5 C -13 -1 -6 1 0 0 Z" fill="#a78bfa" />
      <path d="M0 0 C 4 -9 11 -10 12 -5 C 13 -1 6 1 0 0 Z" fill="#8b5cf6" />
      <path d="M0 -1 C -2 -10 2 -14 4 -9 C 5 -6 3 -2 0 -1 Z" fill="#c4b5fd" />
      <circle cx={0} cy={-1} r={2.6} fill="#f59e0b" />
      <rect x={-0.7} y={0} width={1.4} height={12} fill="#059669" />
    </g>
  );
}

export const LocationArt = memo(function LocationArt({
  id,
  category,
  variant,
  height = 240
}: {
  id: string;
  category: Category;
  variant: Variant;
  height?: number;
}) {
  const scene = SCENE_BY_ID[id] ?? SCENE_BY_CATEGORY[category];
  const p = variant === 'after' ? AFTER : BEFORE;
  const rand = rng(hashSeed(id + variant));
  const isNewBuild = NEW_BUILD.includes(scene);
  const showSite = variant === 'before' && isNewBuild;
  const damaged = variant === 'before';

  const clouds = [0, 1, 2].map((i) => ({
    x: 40 + rand() * 320,
    y: 26 + rand() * 40,
    s: 0.7 + rand() * 0.8,
    key: i
  }));
  const flowers =
    variant === 'after'
      ? [0, 1, 2, 3].map((i) => ({ x: 30 + rand() * 90 + (i > 1 ? 250 : 0), y: 196 + rand() * 26, s: 0.8 + rand() * 0.7, key: i }))
      : [];
  const rubble = damaged
    ? [0, 1, 2, 3, 4].map((i) => ({ x: 80 + rand() * 240, y: 188 + rand() * 8, r: 2.5 + rand() * 4.5, key: i }))
    : [];
  const gid = `sky-${id}-${variant}`;

  return (
    <svg viewBox="0 0 400 240" style={{ maxHeight: height }} role="img" aria-label={variant === 'after' ? 'Bərpadan sonra' : 'Bərpadan əvvəl'}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={p.sky[0]} />
          <stop offset="100%" stopColor={p.sky[1]} />
        </linearGradient>
      </defs>
      <rect width={400} height={240} fill={`url(#${gid})`} />
      {p.sun && <circle cx={330} cy={46} r={22} fill={p.sun} opacity={0.9} />}
      {clouds.map((c) => (
        <g key={c.key} transform={`translate(${c.x} ${c.y}) scale(${c.s})`} opacity={damaged ? 0.35 : 0.75}>
          <ellipse cx={0} cy={0} rx={26} ry={9} fill="#fff" />
          <ellipse cx={16} cy={-5} rx={16} ry={8} fill="#fff" />
        </g>
      ))}
      <path d="M0 132 L70 84 L128 122 L196 76 L258 118 L326 82 L400 126 V 240 H 0 Z" fill={p.far} opacity={0.8} />
      <path d="M0 158 L88 116 L170 150 L262 108 L338 146 L400 122 V 240 H 0 Z" fill={p.near} opacity={0.75} />
      <rect y={185} width={400} height={55} fill={p.ground} />
      {variant === 'after' && <rect y={185} width={400} height={8} fill={p.green} opacity={0.5} />}
      {showSite ? <BuildingSite p={p} /> : <SceneShape scene={scene} p={p} damaged={damaged} />}
      {damaged && !showSite && (
        <g stroke="#00000038" strokeWidth={2} fill="none" strokeLinecap="round">
          <path d="M170 120 l10 14 l-7 12 l9 13" />
          <path d="M236 132 l-8 12 l6 11" />
        </g>
      )}
      {rubble.map((r) => (
        <circle key={r.key} cx={r.x} cy={r.y} r={r.r} fill={p.dark} opacity={0.4} />
      ))}
      {flowers.map((f) => (
        <KhariBulbul key={f.key} x={f.x} y={f.y} s={f.s} />
      ))}
      <rect width={400} height={240} fill={damaged ? '#3f3a2e' : '#7c3aed'} opacity={damaged ? 0.12 : 0.03} />
    </svg>
  );
});
