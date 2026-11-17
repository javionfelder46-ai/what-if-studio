// Lip-sync sample (Nov 15, Javion: "make the mouth move the same time the
// narration is going on") — S5 kitchen, first two exchanges only (10.23s):
//   Jake (new voice: Callum): "Right. New rule. I'm not thinking about last
//   night. Not one thought. Just cereal. Just a normal guy eating cereal."
//   Bear (Brian): "You said that out loud."
// Mouths are driven by the amplitude envelope of the v3 dialogue audio
// (lipsyncEnvelope.ts): Jake's mouth opens ONLY during his line, the Bear's
// ONLY during his, both closed in the pauses. George is the NARRATOR only —
// he does not appear here; Jake speaks in Callum's voice, the Bear in Brian's.
// The scene is S5 verbatim (same poses, same camera pull-back, same Detective
// cameo behind the fridge) with mouthOpen wired in.
import React from 'react';
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from 'remotion';
import { Hero, basePose, poseAt, faceAt, camT, joints, LOOKS } from '../../engine';
import { ShotFrame } from '../../engine/episode';
import {
  MorningKitchen, Bear, SIT, sitY, FLOOR_PX, ROOM_FLOOR_V, standY,
} from './scenes';
import { LIPSYNC_FRAMES, LIPSYNC_JAKE, LIPSYNC_BEAR } from './lipsyncEnvelope';

export const LipsyncSample: React.FC = () => {
  const frame = useCurrentFrame();
  const f = Math.min(frame, LIPSYNC_FRAMES - 1);
  const jakeOpen = LIPSYNC_JAKE[f];
  const bearOpen = LIPSYNC_BEAR[f];
  // S5 camera: slow pull back 1.12 -> 1.0 across the clip.
  const zoom = 1.12 + (1.0 - 1.12) * (frame / (LIPSYNC_FRAMES - 1));
  const p = poseAt(frame, [
    { f: 0, p: { ...basePose, x: 640, y: sitY(FLOOR_PX), scale: 1, ...SIT, expr: 'tired', yaw: 0.65, look: 0.5 } },
    { f: LIPSYNC_FRAMES, p: { ...basePose, x: 640, y: sitY(FLOOR_PX), scale: 1, ...SIT, expr: 'tired', yaw: 0.65, look: 0.5 } },
  ]);
  const face = faceAt(frame, [[0, 'tired']]);
  const pd = poseAt(frame, [
    { f: 0, p: { ...basePose, x: 330, y: standY(0.5, ROOM_FLOOR_V), scale: 0.5, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 }, look: 0, headTilt: 0, tilt: 0, expr: 'smug' } },
    { f: LIPSYNC_FRAMES, p: { ...basePose, x: 330, y: standY(0.5, ROOM_FLOOR_V), scale: 0.5, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 }, look: 0, headTilt: 0, tilt: 0, expr: 'smug' } },
  ]);
  const faceD = faceAt(frame, [[0, 'smug']]);
  const j = joints(p, true);
  const footL = { x: p.x + j.legL.end.x, y: p.y + j.legL.end.y + 11 };
  const footR = { x: p.x + j.legR.end.x, y: p.y + j.legR.end.y + 11 };
  return (
    <AbsoluteFill style={{ backgroundColor: '#0E0C1E' }}>
      <Audio src={staticFile('lipsync_bear_sample_audio.mp3')} />
      <ShotFrame>
        <g transform={camT(960, 560, zoom)}>
          <MorningKitchen t={frame} />
          <Hero slim look={LOOKS.detective} pose={{ ...pd, ...faceD, facing: 1 }} rimId="rimBlue" shadow={1} />
          {/* fridge-edge occluder: hides the Detective's left half so he reads
              as behind the fridge (copied from S5). */}
          <rect x={290} y={320} width={40} height={532} fill="#EDE8DE" />
          <rect x={290} y={852} width={40} height={24} fill="#F6EFE3" />
          <line x1={290} y1={852} x2={330} y2={852} stroke="#C9BFA8" strokeWidth={2} />
          <line x1={290} y1={876} x2={330} y2={876} stroke="#C9BFA8" strokeWidth={2} />
          <rect x={290} y={876} width={40} height={30} fill="#7A5A3A" />
          <line x1={330} y1={320} x2={330} y2={876} stroke="#B8B2A4" strokeWidth={4} />
          <Bear x={1300} hipY={sitY(FLOOR_PX)} mouthOpen={bearOpen} />
          <ellipse cx={footL.x} cy={footL.y + 2} rx={20} ry={6} fill="#000" opacity={0.35} />
          <ellipse cx={footR.x} cy={footR.y + 2} rx={20} ry={6} fill="#000" opacity={0.35} />
          <Hero slim look={LOOKS.jake} pose={{ ...p, ...face, facing: 1 }} rimId="rimBlue" shadow={0} mouthOpen={jakeOpen} />
        </g>
      </ShotFrame>
    </AbsoluteFill>
  );
};
