// shared.tsx — constants + atmosphere helpers shared by the Night Shift scenes.
// Pure refactor (Nov 14): moved verbatim out of NightShift2D.tsx so each scene file
// (ns1–ns6) can import them without duplicating code or importing from the assembler
// (which would be a circular import). No visual or timing changes.

import React from 'react';
import { backOut, clamp, FONT, LOOKS } from '../../engine';

export const W = 1080;
export const H = 1920;
export const FLOOR = 1560; // feet line (world px) for every standing scene
export const FPS = 24;
export const TOTAL_FRAMES = 1823; // 75.94s — matches the v2 voiceover exactly (rule 3 re-record, Nov 14)

// Jake in the Night Shift: NO MOUTH, ever. The rig's Face draws a mouth in the look's
// `face` ink colour; Jake's stock look has face #FFFFFF, which renders as a white smile
// under the shades (caught in stills f200/f700). Overriding face to the head black makes
// the mouth invisible — the eyes are hidden behind the shades and the brows are suppressed
// with shades on, so nothing else uses the face ink. The sunglasses keep their own colours.
export const JAKE_NS = { ...LOOKS.jake, face: '#161616' };

// Portrait camera (camT in anim.ts is hardcoded to the 1920x1080 centre — do not use it here).
export const cam = (cx: number, cy: number, s: number) => `translate(540 960) scale(${s}) translate(${-cx} ${-cy})`;
// Slow 0.5 Hz flicker for lamps/sconces: 1–2% is too subtle to read, 8–12% reads as a living light.
export const flick = (f: number, phase = 0, amp = 0.09) => 1 + amp * Math.sin(f * 0.1309 + phase);

// ---------------------------------------------------------------------------
// Atmosphere helpers — the life of every scene
// ---------------------------------------------------------------------------

/** Drifting fog: three big soft ellipses sliding sideways, always moving. */
export const Fog = ({ f, y = 1480, o = 1 }: { f: number; y?: number; o?: number }) => (
  <g filter="url(#nsFogBlur)" opacity={o}>
    {[0, 1, 2].map((i) => {
      const cx = 540 + Math.sin((f / FPS) * 0.11 + i * 2.1) * 280;
      const cy = y + Math.cos((f / FPS) * 0.07 + i * 1.7) * 30;
      return <ellipse key={i} cx={cx} cy={cy} rx={430} ry={95} fill="#A9C6FF" opacity={0.09} />;
    })}
  </g>
);

/** Rain falling on a window: streaks drop ~420px/s — unmistakably moving. */
export const Rain = ({ f, x, y, w, h, id }: { f: number; x: number; y: number; w: number; h: number; id: string }) => (
  <g clipPath={`url(#${id})`}>
    {Array.from({ length: 24 }).map((_, i) => {
      const rx = x + ((i * 137.5) % w);
      const speed = 420 + (i % 5) * 70;
      const ry = y + ((((i * 211) % h) + (f / FPS) * speed) % h);
      return <line key={i} x1={rx} y1={ry} x2={rx - 7} y2={ry + 36} stroke="#A9C6FF" strokeWidth={2.5} opacity={0.38} strokeLinecap="round" />;
    })}
  </g>
);

/** A wall sconce: brass fixture ON the wall (never floating), warm glow + cone, flickering. */
export const Sconce = ({ x, y, f, phase = 0 }: { x: number; y: number; f: number; phase?: number }) => {
  const fl = flick(f, phase);
  return (
    <g>
      <circle cx={x} cy={y} r={150} fill="url(#nsWarmGlow)" opacity={0.5 * fl} />
      <path d={`M ${x - 90} ${y + 30} L ${x + 90} ${y + 30} L ${x + 34} ${y + 260} L ${x - 34} ${y + 260} Z`} fill="url(#nsCone)" opacity={0.35 * fl} />
      <rect x={x - 10} y={y - 90} width={20} height={90} fill="#3A2E1E" />
      <path d={`M ${x - 46} ${y - 10} L ${x + 46} ${y - 10} L ${x + 30} ${y + 34} L ${x - 30} ${y + 34} Z`} fill="#B08D4F" stroke="#6E5426" strokeWidth={3} />
      <ellipse cx={x} cy={y + 6} rx={26} ry={14} fill="#FFE2B0" opacity={0.95 * fl} />
    </g>
  );
};

/** Jake from BEHIND (S1, S6): plain smooth circle head, red shirt back, no sunglasses, no tie —
    front details never appear in a back view. Proportions match the rig (HEAD r=62, LEG_LEN=140). */
export const JakeBack = ({ x, floorY = FLOOR, s = 1.4 }: { x: number; floorY?: number; s?: number }) => {
  const hipY = floorY - 140 * s;
  const headCY = hipY - 176 * s;
  return (
    <g filter="url(#rimBlue)">
      <path d={`M ${x - 18 * s} ${hipY} L ${x - 26 * s} ${floorY}`} stroke="#161616" strokeWidth={11 * s} strokeLinecap="round" />
      <path d={`M ${x + 18 * s} ${hipY} L ${x + 26 * s} ${floorY}`} stroke="#161616" strokeWidth={11 * s} strokeLinecap="round" />
      <ellipse cx={x - 26 * s} cy={floorY - 6 * s} rx={17 * s} ry={10 * s} fill="#161616" />
      <ellipse cx={x + 26 * s} cy={floorY - 6 * s} rx={17 * s} ry={10 * s} fill="#161616" />
      <rect x={x - 46 * s} y={hipY - 112 * s} width={92 * s} height={122 * s} rx={26 * s} fill="#C0392B" />
      <path d={`M ${x - 44 * s} ${hipY - 100 * s} L ${x - 52 * s} ${hipY - 8 * s}`} stroke="#161616" strokeWidth={11 * s} strokeLinecap="round" />
      <path d={`M ${x + 44 * s} ${hipY - 100 * s} L ${x + 52 * s} ${hipY - 8 * s}`} stroke="#161616" strokeWidth={11 * s} strokeLinecap="round" />
      <circle cx={x - 52 * s} cy={hipY - 2 * s} r={12 * s} fill="#161616" />
      <circle cx={x + 52 * s} cy={hipY - 2 * s} r={12 * s} fill="#161616" />
      <circle cx={x} cy={headCY} r={62 * s} fill="#161616" />
    </g>
  );
};

/** A wall clock with its hands fixed at 2:59 — the hour hand just short of 3, minute hand at 59. */
export const Clock259 = ({ x, y, r = 64 }: { x: number; y: number; r?: number }) => (
  <g>
    <circle cx={x} cy={y} r={r} fill="#EFE2CC" stroke="#1E1824" strokeWidth={7} />
    <circle cx={x} cy={y} r={r - 10} fill="none" stroke="#1E1824" strokeWidth={2} opacity={0.4} />
    {/* hands fixed at 2:59 — hour hand just before 3 (pointing right), minute hand at 59 (just left of 12) */}
    <line x1={x} y1={y} x2={x + r * 0.42} y2={y - r * 0.01} stroke="#1E1824" strokeWidth={6} strokeLinecap="round" />
    <line x1={x} y1={y} x2={x - r * 0.06} y2={y - r * 0.62} stroke="#1E1824" strokeWidth={6} strokeLinecap="round" />
    <circle cx={x} cy={y} r={6} fill="#1E1824" />
  </g>
);

/** The cash stack on the elevator floor: banded bills, with a faint warm shimmer above it. */
export const CashStack = ({ x, y, f, show }: { x: number; y: number; f: number; show: boolean }) => {
  if (!show) return null;
  const k = backOut(clamp((f - 100) / 10));
  const shimmer = 0.25 + 0.2 * Math.sin(f * 0.35);
  return (
    <g transform={`translate(${x} ${y}) scale(${k})`} opacity={k}>
      <path d="M -70 -8 Q -40 -34 0 -30 Q 40 -34 70 -8" stroke="#FFE2B0" strokeWidth={3} fill="none" opacity={shimmer} />
      <path d="M -56 -2 Q -28 -22 0 -20 Q 28 -22 56 -2" stroke="#FFE2B0" strokeWidth={2.5} fill="none" opacity={shimmer * 0.7} />
      <rect x={-78} y={0} width={156} height={26} rx={4} fill="#2E6B3E" stroke="#1E4A2A" strokeWidth={3} />
      <rect x={-78} y={-22} width={156} height={26} rx={4} fill="#3E7A4E" stroke="#1E4A2A" strokeWidth={3} />
      <rect x={-78} y={-44} width={156} height={26} rx={4} fill="#4A8A5A" stroke="#1E4A2A" strokeWidth={3} />
      <rect x={-16} y={-48} width={32} height={76} fill="#EFE2CC" stroke="#B3A78F" strokeWidth={2} />
      <circle cx={0} cy={-10} r={10} fill="#2E6B3E" />
    </g>
  );
};

/** Shared defs for this composition (fog blur, glows, brass). */
export const NsDefs = () => (
  <defs>
    <filter id="nsFogBlur" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="42" />
    </filter>
    <radialGradient id="nsWarmGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stopColor="#FFB46A" stopOpacity="0.55" />
      <stop offset="100%" stopColor="#FFB46A" stopOpacity="0" />
    </radialGradient>
    <linearGradient id="nsCone" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#FFB46A" stopOpacity="0.5" />
      <stop offset="100%" stopColor="#FFB46A" stopOpacity="0" />
    </linearGradient>
    <linearGradient id="nsBrass" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stopColor="#8A6A3A" />
      <stop offset="35%" stopColor="#C9A35F" />
      <stop offset="65%" stopColor="#A8823F" />
      <stop offset="100%" stopColor="#6E5426" />
    </linearGradient>
    <radialGradient id="nsVig" cx="50%" cy="46%" r="78%">
      <stop offset="58%" stopColor="#000000" stopOpacity="0" />
      <stop offset="100%" stopColor="#000000" stopOpacity="0.55" />
    </radialGradient>
    <clipPath id="nsWinL"><rect x={80} y={350} width={280} height={600} /></clipPath>
    <clipPath id="nsWinR"><rect x={760} y={350} width={280} height={600} /></clipPath>
  </defs>
);

export const Vignette = () => <rect x={-300} y={-300} width={W + 600} height={H + 600} fill="url(#nsVig)" />;

/** On-screen display text (screen space, never inside the camera group). */
export const DisplayText = ({ x, y, size, children, fill = '#F6EFE3' }: { x: number; y: number; size: number; children: React.ReactNode; fill?: string }) => (
  <text x={x} y={y} textAnchor="middle" fontFamily={FONT.hand} fontSize={size} fill={fill} style={{ filter: 'drop-shadow(0 0 18px rgba(169,198,255,0.5))' }}>
    {children}
  </text>
);
