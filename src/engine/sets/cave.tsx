import React from 'react';
import { rnd } from '../anim';
import { LightVeil, Dust, Glow, Cone } from '../light';

// Siffre's cave (1962): a dark rock chamber, a single oil lamp on the ground as the only light, stalactites
// overhead, a rope disappearing up into the dark, the rock floor catching the lamp's pool. Feet at CAVE_GROUND.
export const CAVE_GROUND = 830;

export const Cave: React.FC<{ t: number; id?: string; veil?: number }> = ({ t, id = 'cave', veil = 0.48 }) => {
  const lamp = { x: 960, y: 780 };
  const stal: React.ReactNode[] = [];
  for (let i = 0; i < 9; i++) {
    const x = 120 + i * 210 + rnd(3, i) * 60;
    const len = 90 + rnd(4, i) * 160;
    stal.push(<polygon key={i} points={`${x - 26},0 ${x + 26},0 ${x},${len}`} fill="#1C1420" />);
  }
  const rocks: React.ReactNode[] = [];
  for (let i = 0; i < 7; i++) {
    const x = 80 + i * 270 + rnd(5, i) * 80;
    const s = 30 + rnd(6, i) * 46;
    rocks.push(<polygon key={i} points={`${x - s},${CAVE_GROUND} ${x - s * 0.4},${CAVE_GROUND - s * 0.7} ${x + s * 0.5},${CAVE_GROUND - s * 0.5} ${x + s},${CAVE_GROUND}`} fill="#241B28" />);
  }
  return (
    <g>
      <rect x={-200} y={-200} width={2320} height={1300} fill="#171019" />
      {/* poster-style dusk filtering down from the cave mouth: a purple wash at the top so the
          chamber reads as dusk-lit, not a flat black box */}
      <defs>
        <linearGradient id={`${id}caveDusk`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4A2A55" />
          <stop offset="100%" stopColor="#4A2A55" stopOpacity={0} />
        </linearGradient>
      </defs>
      <rect x={-200} y={-200} width={2320} height={500} fill={`url(#${id}caveDusk)`} opacity={0.5} />
      {/* the chamber walls: two big dark rock masses closing in from the sides */}
      <path d="M -200 -200 L 420 -200 Q 300 300 240 700 L 180 1100 L -200 1100 Z" fill="#221627" />
      <path d="M 2120 -200 L 1520 -200 Q 1640 320 1700 720 L 1760 1100 L 2120 1100 Z" fill="#221627" />
      <path d="M 420 -200 Q 960 -60 1520 -200 L 1520 -200 L 420 -200 Z" fill="#1C1420" />
      {stal}
      {/* v38 (Javion: "thin gold vertical line top-right" in S22, "cave calendars on a string" in S23/S24): the hanging rope line is REMOVED. At x=1330 it read as a stray thin gold line at the frame edge in S22 (no calendar to anchor it), and in S23/S24 it was the string the calendars hung from — a calendar on a string has no place in a cave. The cave still reads from the lamp, stalactites, rocks and walls. The S23/S24/S139 calendars now sit on the cave floor instead of hanging. */}
      {/* the lamp: the only light in the cave */}
      <ellipse cx={lamp.x} cy={lamp.y + 26} rx={120} ry={16} fill="#000" opacity={0.5} />
      <Cone d={`M ${lamp.x - 26} ${lamp.y - 30} L ${lamp.x + 26} ${lamp.y - 30} L ${lamp.x + 190} ${lamp.y + 60} L ${lamp.x - 190} ${lamp.y + 60} Z`} o={0.5} />
      <Glow x={lamp.x} y={lamp.y - 20} r={420} o={0.85} />
      <rect x={lamp.x - 16} y={lamp.y - 34} width={32} height={44} rx={6} fill="#1C1620" stroke="#3A2E22" strokeWidth={3} />
      <circle cx={lamp.x} cy={lamp.y - 12} r={10} fill="#FFE2B0" />
      <path d={`M ${lamp.x} ${lamp.y - 34} Q ${lamp.x + 4} ${lamp.y - 52} ${lamp.x} ${lamp.y - 62}`} stroke="#FFE2B0" strokeWidth={3} fill="none" opacity={0.7} />
      {rocks}
      {/* the lamp's pool on the rock floor: warm light the hero stands in */}
      <ellipse cx={lamp.x} cy={lamp.y + 26} rx={260} ry={30} fill="#FFD7A0" opacity={0.25} style={{ mixBlendMode: 'screen' }} />
      <path d={`M 0 ${CAVE_GROUND} L 1920 ${CAVE_GROUND}`} stroke="#0E0A12" strokeWidth={4} />
      <Dust t={t} seed={11} x0={820} y0={620} w={300} h={220} n={30} o={0.55} />
      <LightVeil id={`${id}veil`} lights={[[lamp.x, lamp.y - 20, 420]]} o={veil} />
      <Glow x={lamp.x} y={lamp.y - 20} r={260} o={0.5} />
    </g>
  );
};
