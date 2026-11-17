// Realistic-graphics helper (Miko style, Nov 15) — the shared system every
// zenn-006 set uses after the rebuild. Built from the approved sample
// (src/MikoSample.tsx, sample_miko_S1_v7.png) plus the engine's existing
// light system (light.tsx: Glow, Dust, Cone, LightVeil).
//
// What it does, in Miko's language:
//   - gradients instead of flat fills (walls, floors, sky, fabric)
//   - soft light: moon/sun halo, diffused light pools, glowing clocks
//   - visible light shafts with dust motes — the shaft MUST slant the way
//     the light source dictates (see WindowShaft)
//   - atmospheric haze unifying the palette + a vignette so the room falls
//     off into darkness at the edges
//   - blurred soft shadows instead of hard ellipses
//
// Characters are NOT touched by this file — Jake, the Detective and the bear
// stay black silhouettes. Only environments use it.
//
// Gradient-ID rule: every id is prefixed by `p`. Pass a different prefix per
// set (e.g. "nb" for NightBedroom, "mk" for MorningKitchen) so two sets in
// one scene never collide. The defs are identical for a given palette, so a
// duplicate prefix is harmless — but a unique one is free.
import React from 'react';

export type RealPalette = 'night' | 'day';

const STOPS: Record<RealPalette, {
  wall: [string, string, string];
  floor: [string, string];
  sky: [string, string, string];
}> = {
  night: {
    wall: ['#23233A', '#2A2A48', '#1C1C30'],
    floor: ['#35323E', '#211D26'],
    sky: ['#2A2A55', '#1B1B38', '#12122A'],
  },
  day: {
    wall: ['#F2E8D5', '#E9DCC3', '#DCCFB2'],
    floor: ['#8A6A4A', '#6A4A2E'],
    sky: ['#A8D0F0', '#7FB8E8', '#5E9ED6'],
  },
};

/** Shared gradients + filters for one set. Mount once per set, inside its <g>. */
export const RealDefs: React.FC<{ p: string; palette?: RealPalette }> = ({ p, palette = 'night' }) => {
  const s = STOPS[palette];
  return (
    <defs>
      {/* wall: soft vertical falloff */}
      <linearGradient id={`${p}wall`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={s.wall[0]} />
        <stop offset="70%" stopColor={s.wall[1]} />
        <stop offset="100%" stopColor={s.wall[2]} />
      </linearGradient>
      {/* floor: darker toward the viewer */}
      <linearGradient id={`${p}floor`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={s.floor[0]} />
        <stop offset="100%" stopColor={s.floor[1]} />
      </linearGradient>
      {/* sky seen through a window: lighter near the light source */}
      <radialGradient id={`${p}sky`} cx="0.7" cy="0.3" r="0.9">
        <stop offset="0%" stopColor={s.sky[0]} />
        <stop offset="60%" stopColor={s.sky[1]} />
        <stop offset="100%" stopColor={s.sky[2]} />
      </radialGradient>
      {/* moon/sun halo: soft, diffused */}
      <radialGradient id={`${p}halo`}>
        <stop offset="0%" stopColor="#F5EDD0" stopOpacity="0.9" />
        <stop offset="35%" stopColor="#F5EDD0" stopOpacity="0.28" />
        <stop offset="100%" stopColor="#F5EDD0" stopOpacity="0" />
      </radialGradient>
      {/* light pool on the floor: soft blue (night) / warm (day) */}
      <radialGradient id={`${p}pool`}>
        <stop offset="0%" stopColor={palette === 'night' ? '#A9C6FF' : '#FFE2B0'} stopOpacity="0.22" />
        <stop offset="100%" stopColor={palette === 'night' ? '#A9C6FF' : '#FFE2B0'} stopOpacity="0" />
      </radialGradient>
      {/* light shaft: brighter at the window, fading to the floor */}
      <linearGradient id={`${p}shaft`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor={palette === 'night' ? '#C8D8FF' : '#FFE9B8'} stopOpacity="0.26" />
        <stop offset="100%" stopColor={palette === 'night' ? '#C8D8FF' : '#FFE9B8'} stopOpacity="0.04" />
      </linearGradient>
      {/* blanket: soft volume, lighter on top */}
      <linearGradient id={`${p}blanket`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#4A4780" />
        <stop offset="100%" stopColor="#2E2C55" />
      </linearGradient>
      {/* pillow: soft volume */}
      <radialGradient id={`${p}pillow`} cx="0.4" cy="0.35" r="0.9">
        <stop offset="0%" stopColor="#9A8AB2" />
        <stop offset="100%" stopColor="#6A5A82" />
      </radialGradient>
      {/* clock glow: soft green */}
      <radialGradient id={`${p}clock`}>
        <stop offset="0%" stopColor="#7DE8A0" stopOpacity="0.35" />
        <stop offset="100%" stopColor="#7DE8A0" stopOpacity="0" />
      </radialGradient>
      {/* vignette: the room falls off into darkness at the edges */}
      <radialGradient id={`${p}vig`} cx="0.5" cy="0.45" r="0.75">
        <stop offset="55%" stopColor="#000" stopOpacity="0" />
        <stop offset="100%" stopColor="#000" stopOpacity="0.45" />
      </radialGradient>
      <filter id={`${p}softBlur`} x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="6" />
      </filter>
      <filter id={`${p}shaftBlur`} x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="18" />
      </filter>
    </defs>
  );
};

// Deterministic pseudo-random in [0,1) — same seed, same motes every frame.
const rnd = (seed: number, i: number) => {
  const x = Math.sin(seed * 127.1 + i * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/**
 * A visible shaft of light from a window down to the floor, with dust motes
 * and the pool where it lands.
 *
 * DIRECTION RULE (Nov 15 — the v6 sample had this backwards): the shaft MUST
 * slant the way the light source dictates. The light source is a distant
 * disc (moon/sun) high in the window; its rays come in from that side.
 *   - source high-RIGHT in the window  -> dir = -1 (beam angles down-LEFT)
 *   - source high-LEFT in the window   -> dir = 1  (beam angles down-RIGHT)
 * `sill` is the window sill's [left x, right x, y]. `floorY` is where the
 * beam lands. `spread` widens the beam at the floor. `pool` overrides the
 * default floor pool (centred on the beam's landing point).
 */
export const WindowShaft: React.FC<{
  p: string;
  sill: [number, number, number];
  floorY: number;
  dir: -1 | 1;
  spread?: number;
  o?: number;
  motes?: number;
  seed?: number;
  pool?: { cx: number; cy: number; rx: number; ry: number };
}> = ({ p, sill, floorY, dir, spread = 40, o = 1, motes = 6, seed = 7, pool }) => {
  const [x0, x1, y] = sill;
  const shift = (floorY - y) * 0.36 * dir;
  const bx0 = x0 + shift - spread;
  const bx1 = x1 + shift + spread;
  const pcx = (bx0 + bx1) / 2;
  const prx = (bx1 - bx0) / 2 + 60;
  const dots = Array.from({ length: motes }).map((_, i) => {
    const along = 0.12 + rnd(seed, i) * 0.76; // 0 = sill, 1 = floor
    const across = rnd(seed + 1, i);
    const topX = x0 + (x1 - x0) * across;
    const botX = bx0 + (bx1 - bx0) * across;
    return {
      x: topX + (botX - topX) * along,
      y: y + (floorY - y) * along,
      r: 1.8 + rnd(seed + 2, i) * 1.4,
      o: 0.45 + rnd(seed + 3, i) * 0.3,
    };
  });
  return (
    <g opacity={o}>
      <polygon
        points={`${x0},${y} ${x1},${y} ${bx1},${floorY} ${bx0},${floorY}`}
        fill={`url(#${p}shaft)`}
        filter={`url(#${p}shaftBlur)`}
      />
      <ellipse
        cx={pool?.cx ?? pcx}
        cy={pool?.cy ?? floorY - 40}
        rx={pool?.rx ?? prx}
        ry={pool?.ry ?? 60}
        fill={`url(#${p}pool)`}
      />
      {dots.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r={d.r} fill="#E8EEFF" opacity={d.o} />
      ))}
    </g>
  );
};

/** Full-frame falloff into darkness at the edges. Draw LAST in a set (before characters). */
export const Vignette: React.FC<{ p: string; o?: number }> = ({ p, o = 1 }) => (
  <rect x={0} y={0} width={1920} height={1080} fill={`url(#${p}vig)`} opacity={o} />
);

/** Faint colour wash over a whole set — unifies the palette so the wall,
 * floor, rug and furniture sit in one family. Draw after the set, before
 * the characters. (Named AtmoHaze — kit.tsx already has a Haze band.) */
export const AtmoHaze: React.FC<{ color?: string; o?: number }> = ({ color = '#2A2A55', o = 0.06 }) => (
  <rect x={0} y={0} width={1920} height={1080} fill={color} opacity={o} />
);

/** Blurred ellipse — a contact/ground shadow that reads as soft, not a hard disc. */
export const SoftShadow: React.FC<{ p: string; cx: number; cy: number; rx: number; ry: number; o?: number }> = ({
  p, cx, cy, rx, ry, o = 0.35,
}) => <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#000" opacity={o} filter={`url(#${p}softBlur)`} />;

/** Radial halo — moon, clock, lamp. `color` is the light's colour. */
export const GlowDisc: React.FC<{ cx: number; cy: number; r: number; color: string; o?: number }> = ({
  cx, cy, r, color, o = 1,
}) => (
  <circle
    cx={cx}
    cy={cy}
    r={r}
    fill={color}
    opacity={o}
    style={{ filter: 'blur(18px)' }}
  />
);
