import React from 'react';
import { rnd } from '../anim';
import { LightVeil, Dust, Glow } from '../light';

// Neumayer III, Antarctica: a pale blue-white waste, the station hut a dark block with lit windows, mountains
// far behind, wind-blown snow drifting sideways with t. A bright set on purpose — the cold open's proof flash
// and the brain-shrink chapter need the white to read against the dark room. Poster style: the SKY goes dusk
// (purple-to-orange gradient, low warm sun) while the snow stays bright — dusk above, white below.
export const ANT_GROUND = 835;

export const Antarctic: React.FC<{ t: number; id?: string; veil?: number }> = ({ t, id = 'ant', veil = 0.22 }) => {
  const flakes: React.ReactNode[] = [];
  for (let i = 0; i < 46; i++) {
    const bx = rnd(21, i) * 1920;
    const by = 60 + rnd(22, i) * 760;
    const drift = ((t * (1.2 + rnd(23, i) * 2.2) + rnd(24, i) * 900) % 900) - 450;
    const x = ((bx + drift) % 1920 + 1920) % 1920;
    flakes.push(<circle key={i} cx={x} cy={by} r={1.5 + rnd(25, i) * 2.5} fill="#FFFFFF" opacity={0.35 + rnd(26, i) * 0.45} />);
  }
  return (
    <g>
      <defs>
        <linearGradient id={`${id}antSky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8A76B8" />
          <stop offset="55%" stopColor="#D89A8A" />
          <stop offset="100%" stopColor="#E8B06A" />
        </linearGradient>
        <linearGradient id={`${id}antSnow`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFC978" stopOpacity={0.35} />
          <stop offset="100%" stopColor="#FFC978" stopOpacity={0} />
        </linearGradient>
      </defs>
      <rect x={-200} y={-200} width={2320} height={700} fill={`url(#${id}antSky)`} />
      {/* far mountains — Nov 12 v16 (Javion: "We'll fix it" on S96): bottom edge was y=560, leaving a 200px undrawn gap (560..760) between the mountains and the snow field (760+) that read as a dark void band behind the researchers in S96 (and S3/S120/S124/S152). Now runs down to y=760 to meet the snowfield; the station (drawn after) stays on top and the snow covers the join. */}
      <path d="M -200 500 L 240 260 L 520 500 L 900 300 L 1300 500 L 1620 330 L 2120 500 L 2120 760 L -200 760 Z" fill="#8FA8C4" />
      <path d="M 240 260 L 320 330 L 200 340 Z M 900 300 L 980 370 L 840 375 Z M 1620 330 L 1700 395 L 1560 400 Z" fill="#E8EEF2" />
      {/* the low warm sun */}
      <circle cx={1560} cy={330} r={64} fill="#FFE8B0" opacity={0.95} />
      <circle cx={1560} cy={330} r={150} fill="#FFC978" opacity={0.3} />
      {/* the station hut on stilts, windows lit warm against the white */}
      <g>
        <rect x={620} y={560} width={640} height={150} fill="#3E4654" stroke="#232833" strokeWidth={5} />
        <rect x={600} y={540} width={680} height={26} fill="#2C323E" />
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i}>
            <rect x={660 + i * 118} y={600} width={72} height={56} fill="#1E1824" />
            <rect x={666 + i * 118} y={606} width={60} height={44} fill="#FFD39A" />
            <path d={`M ${696 + i * 118} 606 L ${696 + i * 118} 650 M ${666 + i * 118} 628 L ${726 + i * 118} 628`} stroke="#1E1824" strokeWidth={3} />
          </g>
        ))}
        <rect x={940} y={640} width={60} height={70} fill="#232833" />
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={680 + i * 150} y={710} width={16} height={90} fill="#2C323E" />
        ))}
        {/* the antenna, and a dish */}
        <path d="M 1180 540 L 1180 420 M 1180 420 L 1240 380 M 1180 430 L 1120 390" stroke="#232833" strokeWidth={5} fill="none" />
        <circle cx={1180} cy={414} r={8} fill="#FF5A4A" />
        <path d="M 700 540 Q 660 480 720 460 Q 740 510 700 540 Z" fill="#C9CFD8" stroke="#232833" strokeWidth={3} />
      </g>
      {/* the snow field, with wind ripples and a path of footprints to the hut */}
      <polygon points="0,760 1920,760 1920,1100 0,1100" fill="#E8EEF2" />
      {/* the sun's warmth on the snow near the horizon, fading down the field */}
      <rect x={-200} y={760} width={2320} height={160} fill={`url(#${id}antSnow)`} />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <path key={i} d={`M ${120 + i * 300} ${820 + (i % 2) * 60} Q ${220 + i * 300} ${800 + (i % 2) * 60} ${340 + i * 300} ${824 + (i % 2) * 60}`} stroke="#C6D2DE" strokeWidth={4} fill="none" opacity={0.8} />
      ))}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <ellipse key={i} cx={820 + i * 26} cy={800 + i * 6} rx={9} ry={5} fill="#B8C6D6" opacity={0.8} />
      ))}
      {flakes}
      <Glow x={1560} y={330} r={450} kind="warm" o={0.5} />
      <LightVeil id={`${id}veil`} lights={[[1560, 330, 500], [940, 620, 420]]} o={veil} />
    </g>
  );
};
