import React from 'react';
import { makeRoom, S3, Box } from '../room';
import { RoomShell, WallLight, FloorShadow, stand } from '../furnish';
import { LightVeil, Dust, Glow, WallTexture } from '../light';

// The lab: where the science beats live (Williamson & Feyer, Bexton/McGill, the brain scan). A room-kit interior
// with a long bench, flasks and jars on shelves, and a chalkboard for the numbers. Built with the room kit like
// the kitchen: characters stand behind the bench at w 0.4, then LabBench hides their legs.
export const LAB = makeRoom({ x: 960, y: 500 }, { x0: 500, x1: 1420, y0: 330, y1: 745 }, 3.4);

/** The bench along the back wall: a long worktop with legs, flasks and a rack of test tubes on it. */
const Bench: React.FC<{ t: number }> = ({ t }) => {
  const r = LAB;
  return (
    <g>
      <FloorShadow r={r} u={[0.1, 0.9]} w={[0.05, 0.3]} />
      <Box r={r} u={[0.1, 0.9]} v={[0.62, 0.78]} w={[0.05, 0.28]} front="#4A3A34" top="#7A5A48" side="#332622" rim />
      {/* flasks: round bottoms, thin necks, muted liquids */}
      {[
        { u: 0.18, h: 52, c: '#7A9A6A' },
        { u: 0.3, h: 66, c: '#6A7A9A' },
        { u: 0.44, h: 46, c: '#9A7A5A' },
        { u: 0.72, h: 60, c: '#7A6A8A' },
        { u: 0.84, h: 48, c: '#5A8A7A' },
      ].map((f, i) => {
        const p = r.P(f.u, 0.62, 0.05);
        return (
          <g key={i}>
            <path d={`M ${p.x - 5} ${p.y - f.h} L ${p.x + 5} ${p.y - f.h} L ${p.x + 9} ${p.y - f.h + 22} L ${p.x + 20} ${p.y - 6} Q ${p.x} ${p.y + 12} ${p.x - 20} ${p.y - 6} L ${p.x - 9} ${p.y - f.h + 22} Z`} fill="#C9D6DE" opacity={0.92} stroke="#1E1824" strokeWidth={2.5} />
            <path d={`M ${p.x - 16} ${p.y - 8} Q ${p.x} ${p.y + 8} ${p.x + 16} ${p.y - 8} L ${p.x + 14} ${p.y - 2} Q ${p.x} ${p.y + 4} ${p.x - 14} ${p.y - 2} Z`} fill={f.c} opacity={0.85} />
          </g>
        );
      })}
      {/* a rack of test tubes, one bubbling */}
      {[0, 1, 2, 3].map((i) => {
        const p = r.P(0.55 + i * 0.035, 0.62, 0.05);
        return (
          <g key={i}>
            <rect x={p.x - 6} y={p.y - 44} width={12} height={44} rx={5} fill="#C9D6DE" opacity={0.9} stroke="#1E1824" strokeWidth={2} />
            <rect x={p.x - 6} y={p.y - 16} width={12} height={16} fill={i === 1 ? '#D98A5A' : '#7A9A6A'} opacity={0.85} />
            {i === 1 ? <circle cx={p.x} cy={p.y - 22 - ((t / 12 + i * 7) % 10)} r={3} fill="#FFF" opacity={0.8} /> : null}
          </g>
        );
      })}
    </g>
  );
};

export const Lab: React.FC<{ t: number; id?: string; veil?: number }> = ({ t, id = 'lab', veil = 0.44 }) => {
  const r = LAB;
  const { P } = r;
  return (
    <g>
      <RoomShell r={r} id={id} floor="tiles" wall="#3E4450" side="#333844" floorC="#2C2F38" />
      {/* poster-style dusk wash on the back wall: cool blue-grey high, warm low — the flat
          wall read darker and flatter than the poster; the wash is a blend, not a repaint */}
      <defs>
        <linearGradient id={`${id}wallDusk`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3E4450" />
          <stop offset="100%" stopColor="#5A4636" />
        </linearGradient>
      </defs>
      <rect x={500} y={330} width={920} height={415} fill={`url(#${id}wallDusk)`} opacity={0.5} />
      {/* the chalkboard with the numbers, back wall left */}
      <g>
        <rect x={560} y={380} width={340} height={200} fill="#1E1824" />
        <rect x={572} y={392} width={316} height={176} fill="#253C35" />
        {[0, 1, 2, 3].map((i) => (
          <path key={i} d={`M 592 ${420 + i * 36} L ${860 - (i % 2) * 60} ${420 + i * 36}`} stroke="#EFE2CC" strokeWidth={3} strokeLinecap="round" opacity={0.85} />
        ))}
        <circle cx={852} cy={536} r={16} fill="none" stroke="#FF8A5A" strokeWidth={4} />
        <path d="M 840 536 L 864 536" stroke="#FF8A5A" strokeWidth={4} />
      </g>
      {/* shelves with jars on the right wall */}
      {[0, 1].map((s) => {
        const y = 420 + s * 110;
        return (
          <g key={s}>
            <rect x={1080} y={y} width={280} height={10} fill="#5B4038" />
            {[0, 1, 2, 3, 4].map((i) => (
              <g key={i}>
                <rect x={1096 + i * 52} y={y - 52} width={34} height={52} rx={6} fill="#C9D6DE" opacity={0.85} stroke="#1E1824" strokeWidth={2} />
                <rect x={1096 + i * 52} y={y - 20} width={34} height={20} fill={['#7A9A6A', '#6A7A9A', '#9A7A5A', '#7A6A8A', '#5A8A7A'][i]} opacity={0.8} />
              </g>
            ))}
          </g>
        );
      })}
      <Bench t={t} />
      <WallLight r={r} u={0} v={0.3} w={0.66} />
      <WallLight r={r} u={1} v={0.3} w={0.66} />
      {/* warm pools under each wall light, and on the floor — the lights are visible sources now */}
      <Glow x={P(0, 0.3, 0.66).x} y={P(0, 0.3, 0.66).y + 40} r={300} o={0.35} />
      <Glow x={P(1, 0.3, 0.66).x} y={P(1, 0.3, 0.66).y + 40} r={300} o={0.35} />
      <Glow x={960} y={780} r={420} o={0.3} />
      <Dust t={t} seed={5} x0={700} y0={400} w={500} h={300} n={28} o={0.5} />
      <LightVeil id={`${id}veil`} lights={[[P(0, 0.3, 0.66).x, P(0, 0.3, 0.66).y, 380], [P(1, 0.3, 0.66).x, P(1, 0.3, 0.66).y, 380], [960, 470, 460]]} o={veil} />
      <Glow x={960} y={470} r={280} o={0.35} />
      <WallTexture rect={[500, 330, 920, 415]} />
    </g>
  );
};

/** Where a character stands behind the bench in the lab. */
export const labStand = (u: number, w: number) => stand(LAB, u, w);

/** A point on the bench top at (u, depth): for props the characters handle. */
export const benchTop = (u: number, d = 0.1) => LAB.P(u, 0.62, d);
