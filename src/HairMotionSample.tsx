import React from 'react';
import { AbsoluteFill, getInputProps } from 'remotion';
import { Hero, basePose, Pose, LOOKS, walkPose, FONT, KitDefs, SetDefs, Study } from './engine';

// Clothes-motion proof (Nov 8, Javion: clothes must MOVE, not sit stiff). One still
// can't prove motion, so this composition renders Jake in three poses — standing with
// arms down, arms raised cheering, mid-walk. Across the three frames the sleeves point
// in different directions, the hem rides up and skews, and the watch travels with the
// wrist. (Nov 11: the hair part of this sample is gone — no hair, ever.) Render each variant:
//   npx remotion still src/index.ts HairMotion out/hair_motion_stand.png --props='{"variant":0}'
//   npx remotion still src/index.ts HairMotion out/hair_motion_cheer.png --props='{"variant":1}'
//   npx remotion still src/index.ts HairMotion out/hair_motion_walk.png  --props='{"variant":2}'
// Sample-only: it never feeds a video composition, and the flag defaults off everywhere else.

const P = (o: Partial<Pose>): Pose => ({ ...basePose, ...o });

export const HairMotionSample: React.FC = () => {
  const { variant = 0 } = getInputProps() as { variant?: number };
  const pose =
    variant === 1
      ? P({ x: 960, y: 620, scale: 1.05, expr: 'happy', armL: { a: 135, b: 20 }, armR: { a: 135, b: 20 }, squash: -0.05 })
      : variant === 2
        ? walkPose(960, 1.2, 780, 1.05, { expr: 'neutral' }, 1)
        : P({ x: 960, y: 620, scale: 1.05, expr: 'neutral' });
  const label = variant === 1 ? 'JAKE — ARMS RAISED (CHEER)' : variant === 2 ? 'JAKE — MID-WALK' : 'JAKE — STANDING, ARMS DOWN';
  return (
    <AbsoluteFill style={{ backgroundColor: '#14101C' }}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080">
        <KitDefs />
        <SetDefs />
        <g filter="url(#blur10)">
          <Study t={0} id="cast" />
        </g>
        <rect width={1920} height={1080} fill="#0B0816" opacity={0.35} />
        <Hero look={LOOKS.jake} pose={pose} shadow={0.6} rimId="rimBlue" />
        <text x={960} y={980} textAnchor="middle" fontFamily={FONT.ui} fontSize={26} fill="#F6EFE3" letterSpacing={2}>
          {label}
        </text>
        <text x={960} y={1022} textAnchor="middle" fontFamily={FONT.ui} fontSize={18} fill="#F6EFE3" letterSpacing={2}>
          CLOTHES SAMPLE — SLEEVES, HEM AND WATCH MOVE WITH THE POSE
        </text>
      </svg>
    </AbsoluteFill>
  );
};
