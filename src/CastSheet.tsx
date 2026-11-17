import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Hero, basePose, Pose, LOOKS, CastName, KitDefs, SetDefs, Study, FONT, joints, toWorld, Magnifier } from './engine';

// The cast sheet: INKL's cast only — video #2 (Detective, Jake, crowd guests) on row 1, video #3
// (hero + six guests) on row 2, Jake's acting poses on row 3. The skill's default characters (Pip, Mo,
// sister, mum, the suit) are NOT in our stories and do not appear. Every head is a plain smooth round
// black silhouette with white features; rim light is the cool blue moonlight rimBlue on the lit side.
// Render it after adding or changing a look:
//   npx remotion still src/index.ts Cast out/cast.png
//   npx remotion still src/index.ts Cast out/cast-2x.png --scale=2

const Label: React.FC<{ x: number; y: number; text: string }> = ({ x, y, text }) => (
  <text x={x} y={y} textAnchor="middle" fontFamily={FONT.ui} fontSize={20} fill="#F6EFE3" letterSpacing={1.5}>
    {text}
  </text>
);
const Header: React.FC<{ x: number; y: number; text: string }> = ({ x, y, text }) => (
  <text x={x} y={y} fontFamily={FONT.ui} fontSize={22} fill="#F6EFE3" letterSpacing={4}>
    {text}
  </text>
);
const P = (o: Partial<Pose>): Pose => ({ ...basePose, ...o });

type CastRow = { look: CastName; label: string; pose: Partial<Pose> };

export const CastSheet: React.FC = () => {
  // Nov 11 (Javion: no hair, ever): the old hair flag is gone. Every head is a
  // plain smooth round black silhouette; costume details tell characters apart.
  // Row 1 — video #2, The Spotlight Effect. The Detective holds his magnifying glass in his left hand
  // (placed at the hand via joints + toWorld) and scratches his head with his right.
  const detPose = P({ x: 240, y: 290, scale: 0.62, yaw: 0.25, look: 0.3, expr: 'puzzled', headTilt: 6, armL: { a: 95, b: 30 }, armR: { a: 120, b: 110 } });
  const detHandL = toWorld(detPose, joints(detPose).armL.end);
  const row1: CastRow[] = [
    { look: 'detective', label: 'DETECTIVE — PUZZLED', pose: {} },
    { look: 'jake', label: 'JAKE — SMUG', pose: { x: 600, y: 290, scale: 0.62, yaw: -0.3, look: -0.4, expr: 'smug' } },
    { look: 'guestA', label: 'GUEST A — NEUTRAL', pose: { x: 960, y: 290, scale: 0.62, yaw: 0.3, look: 0.4, expr: 'neutral' } },
    { look: 'guestB', label: 'GUEST B — HAPPY', pose: { x: 1320, y: 290, scale: 0.62, yaw: -0.3, look: -0.4, expr: 'happy' } },
    { look: 'guestC', label: 'GUEST C — WORRIED', pose: { x: 1680, y: 290, scale: 0.62, yaw: 0.3, look: 0.4, expr: 'worried' } },
  ];
  // Row 2 — video #3, Trapped 30 Days. Each figure shows its canonical face; the five new
  // feeling-expressions are on display here (stressed, scared, sad, determined, angry).
  const row2: CastRow[] = [
    { look: 'hero', label: 'HERO — WORRIED', pose: { x: 120, y: 590, scale: 0.62, yaw: 0.3, look: 0.4, expr: 'worried' } },
    { look: 'researcher', label: 'RESEARCHER — STRESSED', pose: { x: 400, y: 590, scale: 0.62, yaw: -0.3, look: -0.4, expr: 'stressed' } },
    { look: 'student', label: 'STUDENT — SCARED', pose: { x: 680, y: 590, scale: 0.62, yaw: 0.3, look: 0.4, expr: 'scared' } },
    { look: 'prisoner', label: 'PRISONER — SAD', pose: { x: 960, y: 590, scale: 0.62, yaw: -0.3, look: -0.4, expr: 'sad' } },
    { look: 'teenager', label: 'TEENAGER — DETERMINED', pose: { x: 1240, y: 590, scale: 0.62, yaw: 0.3, look: 0.4, expr: 'determined' } },
    { look: 'scientist', label: 'SCIENTIST — NEUTRAL', pose: { x: 1520, y: 590, scale: 0.62, yaw: -0.3, look: -0.4, expr: 'neutral' } },
    { look: 'teacher', label: 'TEACHER — ANGRY', pose: { x: 1800, y: 590, scale: 0.62, yaw: 0.3, look: 0.4, expr: 'angry' } },
  ];
  // Row 3 — Jake's acting poses (the video #2 hero; the skill's Pip B "hero" is not ours).
  const poses: { name: string; p: Partial<Pose> }[] = [
    { name: 'thinking', p: { armR: { a: 120, b: 110 }, armL: { a: -10, b: -70 }, headTilt: 8, expr: 'worried', yaw: 0.2 } },
    { name: 'shrug', p: { armL: { a: 40, b: 80 }, armR: { a: 40, b: 80 }, headTilt: -10, expr: 'oops' } },
    { name: 'point', p: { armR: { a: 95, b: -5 }, armL: { a: 10, b: -8 }, look: 1, yaw: 0.35, expr: 'smug', handR: 'point' } },
    { name: 'cheer', p: { armL: { a: 135, b: 20 }, armR: { a: 135, b: 20 }, expr: 'happy', squash: -0.05 } },
    { name: 'shock', p: { armL: { a: 60, b: 40 }, armR: { a: 60, b: 40 }, expr: 'shock', yaw: -0.3, look: -0.6 } },
  ];
  return (
    <AbsoluteFill style={{ backgroundColor: '#14101C' }}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080">
        <KitDefs />
        <SetDefs />
        <g filter="url(#blur10)">
          <Study t={0} id="cast" />
        </g>
        <rect width={1920} height={1080} fill="#0B0816" opacity={0.35} />
        <Header x={60} y={64} text="INKL CAST — VIDEO #2 + VIDEO #3 · BLACK SILHOUETTES" />
        {row1.map((c) => {
          const pose = c.look === 'detective' ? detPose : P(c.pose);
          return (
            <g key={c.look}>
              <Hero look={LOOKS[c.look]} pose={pose} shadow={0.6} rimId="rimBlue" />
              {c.look === 'detective' ? (
                <g filter="url(#rimBlue)">
                  <Magnifier x={detHandL.x} y={detHandL.y} s={0.62} />
                </g>
              ) : null}
              <Label x={pose.x} y={430} text={c.label} />
            </g>
          );
        })}
        {row2.map((c) => {
          const pose = P(c.pose);
          return (
            <g key={c.look}>
              <Hero look={LOOKS[c.look]} pose={pose} shadow={0.6} rimId="rimBlue" />
              <Label x={pose.x} y={730} text={c.label} />
            </g>
          );
        })}
        {poses.map((q, i) => (
          <g key={q.name}>
            <Hero look={LOOKS.jake} pose={P({ x: 220 + i * 370, y: 890, scale: 0.6, ...q.p })} shadow={0.6} rimId="rimBlue" />
            <Label x={220 + i * 370} y={1020} text={q.name.toUpperCase()} />
          </g>
        ))}
      </svg>
    </AbsoluteFill>
  );
};

