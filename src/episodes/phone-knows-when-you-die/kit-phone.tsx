// kit-phone.tsx — SVG drawing primitives for the phone episode, mirroring
// the skia kit3.py API the board was drawn with (rect/circ/oval/line/poly/
// label/shape/add_light/night/vignette), so the animated frames match the
// approved board (v25) one-to-one: same coordinates, same colors, same shapes.
// World: 1920x1080. Ink line LW=6, INK=#18161B (kit3 defaults).
import React, { useId } from 'react';
import { camT, clamp, easeInOut, lerp } from '../../engine/anim';

export const W = 1920;
export const H = 1080;
export const INK = '#18161B';
export const LW = 6;
export const GOLD = '#F2C14E';
export const RED = '#C8242C';
export const LIME = '#B8F04A';
export const CREAM = '#FFF6DC';

/** Deterministic PRNG (mulberry32) — sets scatter stars/cities stably. */
export const rng = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

// ---------------------------------------------------------------------------
// Shapes (kit3: shape() draws fill + ink outline)
// ---------------------------------------------------------------------------

export const RRect: React.FC<{ x0: number; y0: number; x1: number; y1: number; fill: string; w?: number; r?: number; v?: string; o?: number }> =
  ({ x0, y0, x1, y1, fill, w = LW, r = 0, v = INK, o = 1 }) => (
    <rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} rx={r} ry={r} fill={fill} fillOpacity={o}
      stroke={w ? v : 'none'} strokeWidth={w} strokeLinejoin="round" />
  );

export const Circ: React.FC<{ x: number; y: number; r: number; fill: string; w?: number; v?: string; o?: number }> =
  ({ x, y, r, fill, w = LW, v = INK, o = 1 }) => (
    <circle cx={x} cy={y} r={r} fill={fill} fillOpacity={o} stroke={w ? v : 'none'} strokeWidth={w} />
  );

export const Oval: React.FC<{ x0: number; y0: number; x1: number; y1: number; fill: string; w?: number; v?: string; o?: number }> =
  ({ x0, y0, x1, y1, fill, w = LW, v = INK, o = 1 }) => (
    <ellipse cx={(x0 + x1) / 2} cy={(y0 + y1) / 2} rx={(x1 - x0) / 2} ry={(y1 - y0) / 2}
      fill={fill} fillOpacity={o} stroke={w ? v : 'none'} strokeWidth={w} />
  );

export const Line: React.FC<{ x0: number; y0: number; x1: number; y1: number; w?: number; v?: string; o?: number }> =
  ({ x0, y0, x1, y1, w = LW, v = INK, o = 1 }) => (
    <line x1={x0} y1={y0} x2={x1} y2={y1} stroke={v} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" opacity={o} />
  );

export const Poly: React.FC<{ pts: [number, number][]; fill: string; w?: number; v?: string; o?: number }> =
  ({ pts, fill, w = LW, v = INK, o = 1 }) => (
    <polygon points={pts.map((p) => p.join(',')).join(' ')} fill={fill} fillOpacity={o}
      stroke={w ? v : 'none'} strokeWidth={w} strokeLinejoin="round" />
  );

/** A filled path with the ink outline (kit3 shape()). d is an SVG path string. */
export const Shape: React.FC<{ d: string; fill: string; w?: number; v?: string; o?: number }> =
  ({ d, fill, w = LW, v = INK, o = 1 }) => (
    <path d={d} fill={fill} fillOpacity={o} stroke={w ? v : 'none'} strokeWidth={w} strokeLinejoin="round" />
  );

// ---------------------------------------------------------------------------
// Text (kit3 label(): Kalam-Bold, skew -0.08, baseline at y)
// ---------------------------------------------------------------------------

export type LabelFont = 'hand' | 'marker';
export const Label: React.FC<{
  s: string; x: number; y: number; size: number; color: string;
  font?: LabelFont; align?: 'left' | 'center' | 'right'; stroke?: number; strokeCol?: string;
  skew?: number; alpha?: number; rot?: number;
}> = ({ s, x, y, size, color, font = 'hand', align = 'left', stroke = 0, strokeCol = INK, skew = -0.08, alpha = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) skewX(${(Math.atan(skew) * 180) / Math.PI})`} opacity={alpha}>
    <text x={0} y={0} fontSize={size} fill={color} fontFamily={font === 'marker' ? 'Permanent Marker' : 'Kalam'}
      fontWeight={font === 'marker' ? 400 : 700}
      textAnchor={align === 'center' ? 'middle' : align === 'right' ? 'end' : 'start'}
      stroke={stroke ? strokeCol : 'none'} strokeWidth={stroke} paintOrder="stroke" strokeLinejoin="round">
      {s}
    </text>
  </g>
);

// ---------------------------------------------------------------------------
// Light (kit3 add_light / night / vignette)
// ---------------------------------------------------------------------------

/** A soft radial glow, additive (kit3 add_light, kPlus blend). */
export const AddLight: React.FC<{ x: number; y: number; r: number; v: string; a: number }> = ({ x, y, r, v, a }) => {
  const id = useId();
  return (
    <circle cx={x} cy={y} r={r} fill={`url(#${id})`} style={{ mixBlendMode: 'screen' }}>
      <defs>
        <radialGradient id={id}>
          <stop offset="0%" stopColor={v} stopOpacity={a / 255} />
          <stop offset="50%" stopColor={v} stopOpacity={(a * 0.4) / 255} />
          <stop offset="100%" stopColor={v} stopOpacity={0} />
        </radialGradient>
      </defs>
    </circle>
  );
};

export type NightLight =
  | { kind: 'pool'; x: number; y: number; r: number; a: number }
  | { kind: 'oval'; x: number; y: number; rx: number; ry: number; a: number }
  | { kind: 'path'; d: string; a: number; blur?: number };

/** Navy multiply darkness with soft holes where lights are (kit3 night()). */
export const Night: React.FC<{ lights: NightLight[]; ambient?: string }> = ({ lights, ambient = '#4C5CA0' }) => {
  const id = useId();
  return (
    <g>
      <rect x={-900} y={-600} width={W + 1800} height={H + 1200} fill={ambient} opacity={0.62} style={{ mixBlendMode: 'multiply' }} />
      {lights.map((L, i) => {
        if (L.kind === 'pool') {
          return (
            <circle key={i} cx={L.x} cy={L.y} r={L.r} fill={`url(#${id}-p${i})`} style={{ mixBlendMode: 'screen' }}>
              <defs>
                <radialGradient id={`${id}-p${i}`}>
                  <stop offset="0%" stopColor="#fff" stopOpacity={L.a} />
                  <stop offset="50%" stopColor="#fff" stopOpacity={L.a * 0.75} />
                  <stop offset="100%" stopColor="#fff" stopOpacity={0} />
                </radialGradient>
              </defs>
            </circle>
          );
        }
        if (L.kind === 'oval') {
          return (
            <ellipse key={i} cx={L.x} cy={L.y} rx={L.rx} ry={L.ry} fill={`url(#${id}-o${i})`} style={{ mixBlendMode: 'screen' }}>
              <defs>
                <radialGradient id={`${id}-o${i}`}>
                  <stop offset="0%" stopColor="#fff" stopOpacity={L.a} />
                  <stop offset="55%" stopColor="#fff" stopOpacity={L.a * 0.7} />
                  <stop offset="100%" stopColor="#fff" stopOpacity={0} />
                </radialGradient>
              </defs>
            </ellipse>
          );
        }
        return (
          <path key={i} d={L.d} fill="#fff" opacity={L.a} style={{ mixBlendMode: 'screen' }}
            filter={L.blur ? `url(#${id}-b)` : undefined}>
            {L.blur ? (
              <defs>
                <filter id={`${id}-b`} x="-40%" y="-40%" width="180%" height="180%">
                  <feGaussianBlur stdDeviation={L.blur} />
                </filter>
              </defs>
            ) : null}
          </path>
        );
      })}
    </g>
  );
};

/** Darkened frame edges (kit3 vignette()). */
export const Vignette: React.FC<{ strength?: number }> = ({ strength = 0.5 }) => {
  const id = useId();
  return (
    <rect x={0} y={0} width={W} height={H} fill={`url(#${id})`}>
      <defs>
        <radialGradient id={id} cx="50%" cy="50%" r="75%">
          <stop offset="55%" stopColor="#000" stopOpacity={0} />
          <stop offset="100%" stopColor="#000" stopOpacity={strength} />
        </radialGradient>
      </defs>
    </rect>
  );
};

/** Gaussian blur wrapper (kit3 blur_begin). */
export const Blur: React.FC<{ sigma: number; children: React.ReactNode }> = ({ sigma, children }) => {
  const id = useId();
  return (
    <g filter={`url(#${id})`}>
      <defs>
        <filter id={id} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation={sigma} />
        </filter>
      </defs>
      {children}
    </g>
  );
};

// ---------------------------------------------------------------------------
// Sky / city pieces (kit3 sky/stars/moon/cloud/far_city/block)
// ---------------------------------------------------------------------------

export const Sky: React.FC<{ top: string; bot: string; h?: number }> = ({ top, bot, h = 860 }) => {
  const id = useId();
  return (
    <rect x={-2000} y={-1500} width={W + 4000} height={H + 3000} fill={`url(#${id})`}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2={h} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={top} />
          <stop offset="100%" stopColor={bot} />
        </linearGradient>
      </defs>
    </rect>
  );
};

const STAR_R = [1.6, 2.0, 2.6, 3.2];
export const Stars: React.FC<{ t: number; n?: number; yScale?: number }> = ({ t, n = 120, yScale = 1 }) => {
  const r = rng(11);
  const stars = Array.from({ length: n }, () => ({
    x: -200 + r() * (W + 400),
    y: (-100 + r() * 860) * yScale,
    rad: STAR_R[Math.floor(r() * STAR_R.length)],
    ph: r() * 6,
  }));
  return (
    <g>
      {stars.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.rad} fill="#E8ECFF"
          opacity={clamp((150 + 90 * Math.sin(t * 2.4 + s.ph)) / 255, 0, 1)} />
      ))}
    </g>
  );
};

export const Moon: React.FC<{ x: number; y: number; r?: number }> = ({ x, y, r = 50 }) => (
  <g>
    <circle cx={x} cy={y} r={r * 3.0} fill="#C9D4FF" opacity={16 / 255} />
    <circle cx={x} cy={y} r={r * 2.2} fill="#C9D4FF" opacity={22 / 255} />
    <circle cx={x} cy={y} r={r * 1.55} fill="#C9D4FF" opacity={30 / 255} />
    <circle cx={x} cy={y} r={r} fill="#F3EDD3" />
    <circle cx={x - r * 0.3} cy={y - r * 0.25} r={r * 0.16} fill="#D9D2B4" />
    <circle cx={x + r * 0.25} cy={y + r * 0.3} r={r * 0.22} fill="#DDD6B8" />
  </g>
);

export const Cloud: React.FC<{ x: number; y: number; s: number; v?: string; a?: number }> = ({ x, y, s, v = '#2C3B80', a = 1 }) => (
  <g fill={v} opacity={a}>
    {[[-70, 8, 34], [-30, -14, 46], [22, -6, 40], [64, 10, 30]].map(([dx, dy, rr], i) => (
      <circle key={i} cx={x + dx * s} cy={y + dy * s} r={rr * s} />
    ))}
    <rect x={x - 100 * s} y={y + 8 * s} width={192 * s} height={32 * s} />
  </g>
);

/** Distant city silhouettes with lit windows (kit3 far_city). */
export const FarCity: React.FC<{ base: number; seed?: number; v?: string }> = ({ base, seed = 3, v = '#1A2560' }) => {
  const r = rng(seed);
  const blocks: React.ReactNode[] = [];
  let x = -260;
  let bi = 0;
  while (x < W + 260) {
    const w = 90 + r() * 110;
    const h = 120 + r() * 140;
    const bx = x;
    const wins: React.ReactNode[] = [];
    const rows = Math.floor(h / 50);
    const cols = Math.floor(w / 40);
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        if (r() < 0.3) {
          wins.push(<rect key={`${bi}-${i}-${j}`} x={bx + 12 + i * 40} y={base - h + 16 + j * 50} width={12} height={20} fill="#E9CF86" opacity={200 / 255} />);
        }
      }
    }
    blocks.push(
      <g key={bi}>
        <rect x={bx} y={base - h} width={w} height={h + 300} fill={v} />
        <rect x={bx + 10} y={base - h - 26} width={w - 20} height={26} fill={v} />
        {wins}
      </g>,
    );
    x += w + (-6 + r() * 16);
    bi++;
  }
  return <g>{blocks}</g>;
};

/** A foreground block with lit windows and a pitched roof (kit3 block). */
export const Block: React.FC<{ x: number; w: number; h: number; base: number; seed: number; lit?: number; body?: string; roof?: string; dim?: string }> =
  ({ x, w, h, base, seed, lit = 0.4, body = '#1C2658', roof = '#131A42', dim = '#263272' }) => {
    const r = rng(seed);
    const top = base - h;
    const cols = Math.max(2, Math.floor((w - 30) / 46));
    const rows = Math.floor((h - 30) / 62);
    const gap = (w - cols * 22) / (cols + 1);
    const chimneys = Array.from({ length: 1 + Math.floor(r() * 3) }, () => x + (0.15 + r() * 0.65) * w);
    const wins: React.ReactNode[] = [];
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const wx = x + gap + i * (22 + gap);
        const wy = top + 26 + j * 62;
        const on = r() < lit;
        wins.push(
          <g key={`${i}-${j}`}>
            <rect x={wx} y={wy} width={22} height={36} fill={on ? '#F2D88C' : dim} stroke={INK} strokeWidth={LW * 0.5} />
            {on ? <rect x={wx - 8} y={wy - 8} width={38} height={52} fill="#FFD98A" opacity={34 / 255} /> : null}
          </g>,
        );
      }
    }
    return (
      <g>
        <rect x={x} y={top} width={w} height={h + 600} fill={body} stroke={INK} strokeWidth={LW} />
        <polygon points={`${x - 8},${top} ${x + 16},${top - 44} ${x + w - 16},${top - 44} ${x + w + 8},${top}`} fill={roof} stroke={INK} strokeWidth={LW} strokeLinejoin="round" />
        {chimneys.map((cx, i) => (
          <rect key={i} x={cx} y={top - 78} width={22} height={34} fill={roof} stroke={INK} strokeWidth={LW * 0.8} />
        ))}
        {wins}
      </g>
    );
  };

// ---------------------------------------------------------------------------
// Camera — piecewise push-ins with hard cuts at sentence boundaries.
// framings[i] covers the segment after cuts[i-1] up to cuts[i] (seconds, local).
// ---------------------------------------------------------------------------

export type Framing = { z0: number; z1: number; f0: [number, number]; f1: [number, number] };

export const camAt = (t: number, dur: number, cuts: number[], framings: Framing[]): string => {
  let seg = 0;
  for (const c of cuts) if (t >= c) seg++;
  const segStart = seg === 0 ? 0 : cuts[seg - 1];
  const segEnd = seg < cuts.length ? cuts[seg] : dur;
  const fr = framings[Math.min(seg, framings.length - 1)];
  const u = segEnd > segStart ? clamp((t - segStart) / (segEnd - segStart)) : 0;
  const e = easeInOut(u);
  const z = lerp(fr.z0, fr.z1, e);
  const fx = lerp(fr.f0[0], fr.f1[0], e);
  const fy = lerp(fr.f0[1], fr.f1[1], e);
  return camT(fx, fy, z);
};
