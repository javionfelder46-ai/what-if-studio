// THE NIGHT SHIFT — "ROOM 100" PART 1 — 2D REBUILD (Nov 14, Javion: full scratch, 2.5D dead).
// Flat 2D like @oddhourtales, built in the Remotion rig. The whole point: BACKGROUNDS MOVE
// IN CODE. Every scene has visible environmental motion — fog drifting, dust, lamp flicker,
// rain falling, doors sliding, the camera pushing in — so the room feels alive in the first
// 3 seconds. Jake walks with plantedWalkPose (true planted steps, feet never slide) and the
// camera pans with him: no treadmill, no walking in place. Detective narrates VOICE-ONLY.
// Voiceover + music are NOT rendered here: the audio_mix.m4a (75.94s, Liam v2 voiceover +
// Darkness is Coming with the S5/S6 swells) is muxed on with ffmpeg after the silent render.
// The v2 voiceover has rule 3 re-recorded ("Cash appears in the elevator at 3 AM", Nov 14)
// — 1.38s shorter than v1, so the whole video is 75.94s and S3 is 18.03s.
//   npx remotion render src/index.ts NightShift2D out/night_shift_2d_silent.mp4
//   ffmpeg -i out/night_shift_2d_silent.mp4 -i work/night_shift_room100/audio_mix.m4a \
//     -map 0:v -map 1:a -c:v copy -c:a aac -shortest out/night_shift_room100_part1_final_2d.mp4
//
// THIN ASSEMBLER (modular refactor, Nov 14): the six scenes live in
// src/scenes/nightshift/ (ns1–ns6, one file per scene), shared constants/helpers in
// shared.tsx, keyword overlays + HUD in overlays.tsx. This file only imports them
// (in scene order — registration order is the timeline order), runs the build-time
// guards, and stacks the active scene + overlays. No visuals live here.

import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { KitDefs } from './engine';
import { getScenes, guardNoIdleFlap, guardScene } from './engine/sceneBuilder';
// Import order matters: defineScene registers in import order, and the timeline
// is derived from that order. Keep ns1 → ns6.
import { ns1 } from './scenes/nightshift/ns1';
import { ns2 } from './scenes/nightshift/ns2';
import { ns3 } from './scenes/nightshift/ns3';
import { ns4 } from './scenes/nightshift/ns4';
import { ns5 } from './scenes/nightshift/ns5';
import { ns6 } from './scenes/nightshift/ns6';
import { FLOOR, FPS, H, NsDefs, W } from './scenes/nightshift/shared';
import { Hud, KeywordOverlay } from './scenes/nightshift/overlays';

// ---------------------------------------------------------------------------
// Guards + assembly
// ---------------------------------------------------------------------------
const NS_SCENES = [ns1, ns2, ns3, ns4, ns5, ns6];
// Build-time guards: every scene declares Jake, feet planted on FLOOR. A violation
// fails the build here instead of shipping a floating or ghost character.
NS_SCENES.forEach((s) => guardScene(s, FLOOR, ['jake']));
// Arm keys are constant ({a:4, b:8}) in every standing pose — zero reversals by
// construction; the walks use plantedWalkPose (a continuous walk cycle, not keys).
guardNoIdleFlap('ns3', 'jake arms', [4, 4]);

export const NightShift2D: React.FC = () => {
  const f = useCurrentFrame();
  // The registry also holds sceneBuilder's example scene — filter to this video's ids.
  const mine = getScenes().filter((s) => s.id.startsWith('ns'));
  let acc = 0;
  const timeline = mine.map((s) => {
    const len = Math.round(s.durationSec * FPS);
    const shot = { def: s, first: acc, len };
    acc += len;
    return shot;
  });
  const active = timeline.find((t) => f >= t.first && f < t.first + t.len) ?? timeline[timeline.length - 1];
  const localFrame = f - active.first;
  const api = { t: localFrame / FPS, duration: active.def.durationSec, floorY: FLOOR, frame: localFrame, fps: FPS };
  return (
    <AbsoluteFill style={{ backgroundColor: '#0B0A10' }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <KitDefs />
        <NsDefs />
        {active.def.fn(api)}
        {/* lighthouse overlays — on top of the scene, never under it */}
        <KeywordOverlay f={f} />
        <Hud f={f} />
      </svg>
    </AbsoluteFill>
  );
};
