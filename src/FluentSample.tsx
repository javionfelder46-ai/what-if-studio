import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Hero, basePose, poseAt, faceAt, kf, camT, LOOKS, Cell, FONT, KitDefs, SetDefs } from './engine';

// Fluent-movement sample (Nov 14, Javion: "I just want me characters to move like the
// professionals" / "Can I see a sample?"). 5 seconds, 150 frames, one Detective, one
// gesture, one camera move — the fluent-movement rule book section in action:
//  - ONE movement at a time: the arm raises while everything else holds still.
//  - MANY small steps: the raise spans 60 frames (2.0s), the lower spans 45 frames
//    (1.5s) — both far over the 15-frame minimum. poseAt/kf ease in-out by default.
//  - HOLD after the move: the arm sits raised for a beat before it comes down.
//  - HEAD leads: the head tilts a touch as the arm rises, returns as it lowers.
//  - CAMERA creeps: a slow push-in 1.00 -> 1.12 across the whole 5s, one move only.
//  - The gesture is out-and-hold-and-back (1 reversal) so the v42 idle-flap fix
//    passes it through untouched; look stays 0, eyes centred, feet planted (y 736).
// Render:
//   npx remotion render src/index.ts FluentSample out/fluent_sample.mp4
// Sample-only: it never feeds a video composition.

export const FluentSample: React.FC = () => {
  const f = useCurrentFrame();
  const len = 150;
  const pose = poseAt(f, [
    { f: 0, p: { ...basePose, x: 900, y: 736, scale: 1, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 45, p: { x: 900, y: 736, scale: 1, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 105, p: { x: 900, y: 736, scale: 1, tilt: 0, headTilt: 6, look: 0, armL: { a: 4, b: 8 }, armR: { a: 75, b: 20 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 150, p: { x: 900, y: 736, scale: 1, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const face = faceAt(f, [[0, 'neutral']]);
  const camX = kf(f, [[0, 900], [len, 900]]);
  const camY = kf(f, [[0, 600], [len, 600]]);
  const zoom = kf(f, [[0, 1.0], [len, 1.12]]);
  return (
    <AbsoluteFill style={{ backgroundColor: '#14101C' }}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080">
        <KitDefs />
        <SetDefs />
        <g transform={camT(camX, camY, zoom)}>
          <Cell t={f} id="fluent" veil={0.3} day={1} />
          <Hero look={LOOKS.detective} pose={{ ...pose, ...face, facing: 1 }} rimId="rimBlue" shadow={1} />
        </g>
        <text x={960} y={1010} textAnchor="middle" fontFamily={FONT.ui} fontSize={28} fill="#F6EFE3" letterSpacing={2}>
          FLUENT SAMPLE — EASED GESTURE + SLOW PUSH-IN
        </text>
      </svg>
    </AbsoluteFill>
  );
};
