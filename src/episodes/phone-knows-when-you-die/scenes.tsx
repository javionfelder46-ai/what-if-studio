// "What If Your Phone Knew the Exact Day You'd Die?" — the phone video.
// 23 shots (S01-S23), each its own file in ./scenes/ (modular scene build,
// Javion: "can u add the modular"). Durations are timed to the real Archer
// voiceover (shot_timings.json, from faster-whisper word timestamps) — no
// estimated pace. The only character is "you": a black silhouette stick man,
// DRESSED (charcoal torso, cream shirt, red tie, white oval eyes, no pupils,
// bald), palm-sized phone held in one hand, back to camera in medium/wide
// shots, screen only in extreme close-ups, visible grip hand on its edge.
// Lip sync: the mouth opens with the VO envelope (lipsyncEnvelope.ts) and
// vanishes when silent. The Detective does not appear in this video.
//
// LOOK: the board (scenes_phone.py, storyboard v25, approved Nov 16) is the
// visual spec — bed with light-oak headboard + vertical white pillow + full-
// width red duvet, nightstand + lamp OFF (phone screen is the only light),
// teal striped bedroom wall, 3:12 clock, dusk park, sunset rooftop.
// Camera: slow push-in inside each segment, hard cut at sentence boundaries
// (cuts.json) — no two consecutive framings share an angle.

import React from 'react';
import { getScenes, SceneDef } from '../../engine/sceneBuilder';
import { ShotProps } from '../../engine';

import './scenes/S01';
import './scenes/S02';
import './scenes/S03';
import './scenes/S04';
import './scenes/S05';
import './scenes/S06';
import './scenes/S07';
import './scenes/S08';
import './scenes/S09';
import './scenes/S10';
import './scenes/S11';
import './scenes/S12';
import './scenes/S13';
import './scenes/S14';
import './scenes/S15';
import './scenes/S16';
import './scenes/S17';
import './scenes/S18';
import './scenes/S19';
import './scenes/S20';
import './scenes/S21';
import './scenes/S22';
import './scenes/S23';

export const FPS = 30;

export const phoneScenes = (): SceneDef[] =>
  getScenes().filter((s) => s.id !== 'S53-example' && /^S\d{2}$/.test(s.id));

export const phoneTotalSec = () => phoneScenes().reduce((sum, s) => sum + s.durationSec, 0);

// Adapter: a scene def becomes an episode Shot (ShotProps clock in frames).
export const sceneToShot = (def: SceneDef): React.FC<ShotProps> => {
  const Shot: React.FC<ShotProps> = ({ t, len }) => {
    const floorY = def.characters[0]?.feetY ?? 0.8;
    return def.fn({ t: t / FPS, duration: def.durationSec, floorY, frame: t, fps: FPS });
  };
  return Shot;
};

export const phoneShots = (): Record<string, React.FC<ShotProps>> => {
  const out: Record<string, React.FC<ShotProps>> = {};
  for (const def of phoneScenes()) out[def.id] = sceneToShot(def);
  return out;
};
