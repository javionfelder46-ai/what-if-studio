import React from 'react';
import { rnd } from '../anim';
import { LightVeil, Dust, Glow, Cone } from '../light';
import { DuskSky, Skyline, Foreground } from '../kit';

// Outside, day thirty: the street in front of the building, the door standing open with sunlight spilling out,
// the world the hero has not seen for a month. Dusk sky, a low sun, the city in three depths, the pavement
// catching the light. Feet at EXT_GROUND.
export const EXT_GROUND = 840;

export const Exterior: React.FC<{ t: number; id?: string; veil?: number; doorOpen?: boolean }> = ({ t, id = 'ext', veil = 0.4, doorOpen = false }) => {
  const sun = { x: 1420, y: 330 };
  return (
    <g>
      <DuskSky id={`${id}sky`} horizonY={700} />
      <Glow x={sun.x} y={sun.y} r={550} o={0.7} />
      <Skyline y={700} seed={4} />
      {/* the building facade: brick, the door, a small window with the bulb still burning inside */}
      <defs>
        <linearGradient id={`${id}facadeWarm`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#FFC978" stopOpacity={0} />
          <stop offset="100%" stopColor="#FFC978" stopOpacity={0.5} />
        </linearGradient>
        <linearGradient id={`${id}paveWarm`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#FFC978" stopOpacity={0.35} />
          <stop offset="45%" stopColor="#FFC978" stopOpacity={0.15} />
          <stop offset="100%" stopColor="#FFC978" stopOpacity={0} />
        </linearGradient>
      </defs>
      <g>
        <rect x={120} y={380} width={620} height={470} fill="#4A3440" />
        {/* the sun's warmth on the facade's sun side — the flat brick read darker than the poster */}
        <rect x={120} y={380} width={620} height={470} fill={`url(#${id}facadeWarm)`} opacity={0.3} />
        <rect x={120} y={380} width={620} height={470} fill="none" stroke="#241A26" strokeWidth={6} />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <path key={i} d={`M 120 ${430 + i * 68} L 740 ${430 + i * 68}`} stroke="#3A2832" strokeWidth={2} opacity={0.7} />
        ))}
        <rect x={180} y={440} width={110} height={130} fill="#1E1824" />
        <rect x={190} y={450} width={90} height={110} fill="#FFD39A" opacity={0.9} />
        <path d="M 235 450 L 235 560 M 190 505 L 280 505" stroke="#1E1824" strokeWidth={4} />
        {/* the door: shut, or open with the light spilling onto the pavement */}
        {doorOpen ? (
          <g>
            <rect x={420} y={560} width={150} height={290} fill="#14101C" />
            <polygon points="420,850 570,850 700,900 360,900" fill="#FFD39A" opacity={0.45} style={{ mixBlendMode: 'screen' }} />
            <rect x={540} y={570} width={46} height={280} fill="#5A4030" stroke="#1E1824" strokeWidth={4} transform="rotate(-18 540 850)" />
            <Glow x={495} y={700} r={260} o={0.6} />
            <Glow x={495} y={860} r={300} o={0.4} />
          </g>
        ) : (
          <g>
            <rect x={420} y={560} width={150} height={290} fill="#3A2A22" stroke="#1E1824" strokeWidth={6} />
            <circle cx={548} cy={710} r={10} fill="#8A7A5A" stroke="#1E1824" strokeWidth={3} />
            <rect x={470} y={600} width={50} height={70} fill="#2A2026" />
          </g>
        )}
        <rect x={400} y={540} width={190} height={20} fill="#241A26" />
      </g>
      {/* the pavement and the road, with a drain and a road sign */}
      <polygon points="0,850 1920,850 1920,1100 0,1100" fill="#3A3440" />
      {/* the door's light warming the pavement on the building side */}
      <rect x={0} y={850} width={1920} height={250} fill={`url(#${id}paveWarm)`} opacity={0.25} />
      <path d="M 0 920 L 1920 920" stroke="#2A2530" strokeWidth={4} />
      <path d="M 0 990 L 1920 990" stroke="#2A2530" strokeWidth={3} strokeDasharray="46 30" />
      {[0, 1, 2, 3].map((i) => (
        <ellipse key={i} cx={900 + i * 130} cy={880 + (i % 2) * 8} rx={14} ry={5} fill="#2A2530" opacity={0.7} />
      ))}
      <g>
        <rect x={1640} y={640} width={10} height={210} fill="#5E5A6C" />
        <rect x={1590} y={580} width={110} height={66} rx={8} fill="#EFE2CC" stroke="#1E1824" strokeWidth={4} />
        <path d="M 1610 614 L 1680 614 M 1645 596 L 1645 632" stroke="#1E1824" strokeWidth={4} strokeLinecap="round" />
      </g>
      {/* a bird crossing, slow and calm */}
      <g transform={`translate(${((t * 1.1 + 200) % 2200) - 140} ${180 + Math.sin(t / 30) * 12})`}>
        <path d="M 0 0 Q 14 -12 28 0 Q 14 6 0 0 Z" fill="#1E1824" />
        <path d="M 28 0 Q 42 -12 56 0 Q 42 6 28 0 Z" fill="#1E1824" />
      </g>
      <Dust t={t} seed={9} x0={1300} y0={300} w={400} h={300} n={26} o={0.5} />
      <LightVeil id={`${id}veil`} lights={[[sun.x, sun.y, 520], [495, 700, 380]]} o={veil} />
    </g>
  );
};

// The stage: where FICTION meets REAL SCIENCE (the story-vs-fact split, scenes 16 and 126). A dark stage, one
// spotlight cone, the floor catching the pool, curtain edges at the sides. Feet at STAGE_GROUND.
export const STAGE_GROUND = 860;

export const Stage: React.FC<{ t: number; id?: string; veil?: number }> = ({ t, id = 'stage', veil = 0.46 }) => (
  <g>
    <rect x={-200} y={-200} width={2320} height={1300} fill="#120E1A" />
    {/* the curtain edges, heavy and dark red */}
    <path d="M -200 -200 L 260 -200 Q 200 400 240 1100 L -200 1100 Z" fill="#4A1E28" />
    <path d="M 2120 -200 L 1660 -200 Q 1720 400 1680 1100 L 2120 1100 Z" fill="#4A1E28" />
    {[0, 1, 2, 3].map((i) => (
      <path key={`cl${i}`} d={`M ${40 + i * 56} -200 Q ${20 + i * 56} 500 ${50 + i * 56} 1100`} stroke="#381520" strokeWidth={10} fill="none" opacity={0.7} />
    ))}
    {[0, 1, 2, 3].map((i) => (
      <path key={`cr${i}`} d={`M ${1880 - i * 56} -200 Q ${1900 - i * 56} 500 ${1870 - i * 56} 1100`} stroke="#381520" strokeWidth={10} fill="none" opacity={0.7} />
    ))}
    {/* the spotlight: its cone sways almost imperceptibly, the pool on the floor */}
    <g transform={`rotate(${Math.sin(t / 50) * 1.5} 960 -100)`}>
      <Cone d="M 920 -100 L 1000 -100 L 1240 860 L 680 860 Z" o={0.55} />
      <Glow x={960} y={860} r={420} o={0.65} />
    </g>
    {/* warm haze in the cone's path, so the beam reads as light in air, not a flat shape */}
    <Glow x={960} y={400} r={500} o={0.25} />
    <ellipse cx={960} cy={STAGE_GROUND + 8} rx={330} ry={26} fill="#FFE2B0" opacity={0.3} />
    <path d={`M 0 ${STAGE_GROUND} L 1920 ${STAGE_GROUND}`} stroke="#0A0710" strokeWidth={4} />
    <Dust t={t} seed={13} x0={800} y0={300} w={320} h={480} n={30} o={0.55} />
    <LightVeil id={`${id}veil`} lights={[[960, 300, 520], [960, 860, 380]]} o={veil} />
    <Foreground blur={10}>
      <path d="M 1560 1100 Q 1620 820 1760 740 Q 1700 880 1720 1100 Z" fill="#0A0710" />
    </Foreground>
  </g>
);
