// "What If Everyone's True Age Was Written on Their Face?" — video #8.
// 43 narrative beats (S1–S43) + end card (S44), each its own sealed scene
// function with a set duration (modular scene build, Nov 14).
//
// DURATIONS ARE PLACEHOLDER: ~14s per beat (420 frames) until the Archer VO
// exists; re-time exactly from the alignment then. Total 18,180 frames
// (606s): 43 beats x 420 + end card 120. The board renders from THESE
// scenes through the rig — no drawing scripts.

import React from 'react';
import {
  Hero, basePose, faceAt, kf, camT, lerp, clamp, LOOKS,
  FONT, ShotProps, joints, toWorld, Magnifier,
  GlowDisc, Glow,
} from '../../engine';
import {
  defineScene, getScenes, SceneDef,
} from '../../engine/sceneBuilder';
import { EndCard } from '../../engine/ui';
import {
  FPS, PINK, CREAM, INK, ROOM_FLOOR_V, FLOOR_PX, standY, sitY, ageTagY, headC,
  pose, cast, setCurrentScene, STAND, SIT, SIT_FRONT, WALK,
  AgeTag, footShadows, Ped, DetectiveCameo, WhiteHair, Headphones, Cane,
  Skateboard, Dog, Pigeon, OfficeChair, Plant, StreetSign, FilingCabinet,
  CityStreet, Bathroom, OfficeDay, InterviewRoom, CoffeeShop, BedroomSet,
} from './shared';
import type { Expr, Limb, Pose } from '../../engine/rig';

// ---------------------------------------------------------------------------
// Durations — PLACEHOLDER, ~14s per beat until the Archer VO exists.
// S44 is the subscribe end card (4s, no verbal ask). Total 18,180 frames.
// ---------------------------------------------------------------------------

export const DUR: Record<string, number> = {
  S1: 14, S2: 14, S3: 14, S4: 14, S5: 14, S6: 14,
  S7: 14, S8: 14, S9: 14, S10: 14, S11: 14, S12: 14,
  S13: 14, S14: 14, S15: 14, S16: 14, S17: 14, S18: 14,
  S19: 14, S20: 14, S21: 14, S22: 14, S23: 14, S24: 14,
  S25: 14, S26: 14, S27: 14, S28: 14, S29: 14, S30: 14,
  S31: 14, S32: 14, S33: 14, S34: 14, S35: 14, S36: 14,
  S37: 14, S38: 14, S39: 14, S40: 14, S41: 14, S42: 14,
  S43: 14, S44: 4,
};

// A scene's local clock in frames: f = t * 30, len = duration * 30.
const F = (api: { t: number; fps: number }) => api.t * api.fps;

// ===========================================================================
// COLD OPEN
// ===========================================================================

// S1 — Morning street, wide. Jake steps out his front door — glowing
// hot-pink numbers float above every head on the street. Warm morning light,
// long shadows. Camera: slow push-in. Jake mid-stride (yaw 1, WALK pose)
// translating right; the crowd tagged: 31, 58, 14, 22, 67, 41.
defineScene({
  id: 'S1',
  durationSec: DUR.S1,
  characters: [
    { who: 'jake', x: 0.45, feetY: ROOM_FLOOR_V },
    { who: 'guestA', x: 0.12, feetY: ROOM_FLOOR_V },
    { who: 'guestB', x: 0.22, feetY: ROOM_FLOOR_V },
    { who: 'guestC', x: 0.32, feetY: ROOM_FLOOR_V },
    { who: 'teacher', x: 0.68, feetY: ROOM_FLOOR_V },
    { who: 'student', x: 0.8, feetY: ROOM_FLOOR_V },
    { who: 'researcher', x: 0.9, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const pj = pose('S1', 'jake', f, [
      { f: 0, p: { ...basePose, x: 700, y: standY(1, ROOM_FLOOR_V), scale: 1, ...WALK, yaw: 1, expr: 'neutral' } },
      { f: len, p: { ...basePose, x: 1000, y: standY(1, ROOM_FLOOR_V), scale: 1, ...WALK, yaw: 1, expr: 'neutral' } },
    ]);
    const faceJ = faceAt(f, [[0, 'neutral']]);
    const zoom = kf(f, [[0, 1.0], [len, 1.08]]);
    return (
      <g>
        <g transform={camT(960, 560, zoom)}>
          <CityStreet t={f} mode="day" id="s1" />
          {Ped({ scene: 'S1', label: 'ped1', x: 230, look: 'guestA', scale: 0.9, tag: '31', expr: 'neutral', yaw: -1 }, f, len)}
          {Ped({ scene: 'S1', label: 'ped2', x: 420, look: 'guestB', scale: 0.95, tag: '58', expr: 'neutral', yaw: 1 }, f, len)}
          {Ped({ scene: 'S1', label: 'ped3', x: 610, look: 'guestC', scale: 0.85, tag: '14', expr: 'neutral', yaw: -1 }, f, len)}
          {Ped({ scene: 'S1', label: 'ped4', x: 1300, look: 'teacher', scale: 0.95, tag: '67', expr: 'neutral', yaw: 1 }, f, len)}
          {Ped({ scene: 'S1', label: 'ped5', x: 1540, look: 'student', scale: 0.9, tag: '22', expr: 'neutral', yaw: -1 }, f, len)}
          {Ped({ scene: 'S1', label: 'ped6', x: 1780, look: 'researcher', scale: 0.9, tag: '41', expr: 'neutral', yaw: 1 }, f, len)}
          <Pigeon x={820} y={1000} s={1} />
          <Pigeon x={880} y={1016} s={0.85} flip />
          {footShadows(pj)}
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...pj, ...faceJ, facing: 1 }} rimId="rimR" shadow={0} showBrows />)}
        </g>
      </g>
    );
  },
});

// S2 — Close-up on Jake in the bathroom mirror: his own number glows above
// his head. His white oval eyes go wide, brows shoot up. Camera: hold still.
// The shot IS the mirror: Jake real in front of it, his dim reflection
// inside it, the pink number above his head.
defineScene({
  id: 'S2',
  durationSec: DUR.S2,
  characters: [
    { who: 'jake', x: 0.5, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const pj = pose('S2', 'jake', f, [
      { f: 0, p: { ...basePose, x: 960, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, headTilt: -3, expr: 'shock' } },
      { f: len, p: { ...basePose, x: 960, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, headTilt: -3, expr: 'shock' } },
    ]);
    const faceJ = faceAt(f, [[0, 'shock']]);
    const hc = headC(pj, 1);
    return (
      <g>
        <g transform={camT(960, 500, 1.35)}>
          <Bathroom t={f} mode="morning" id="s2" />
          {/* his reflection in the mirror — dim, with the number above it */}
          <defs>
            <clipPath id="s2mirror"><rect x={676} y={156} width={568} height={488} /></clipPath>
          </defs>
          <g clipPath="url(#s2mirror)" opacity={0.3}>
            {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...pj, ...faceJ, facing: 1 }} rimId="rimBlue" shadow={0} showBrows />)}
            <AgeTag x={pj.x} y={ageTagY(pj.y, 1)} text="27" size={44} o={0.9} />
          </g>
          {footShadows(pj)}
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...pj, ...faceJ, facing: 1 }} rimId="rimR" shadow={0} showBrows />)}
          <AgeTag x={pj.x} y={ageTagY(pj.y, 1)} text="27" size={44} />
        </g>
      </g>
    );
  },
});

// S3 — Jake on the street, slowly turning, looking at the numbers above the
// crowd. His eyes narrow, confused. Camera: slow pan left to right.
defineScene({
  id: 'S3',
  durationSec: DUR.S3,
  characters: [
    { who: 'jake', x: 0.5, feetY: ROOM_FLOOR_V },
    { who: 'guestA', x: 0.15, feetY: ROOM_FLOOR_V },
    { who: 'guestB', x: 0.3, feetY: ROOM_FLOOR_V },
    { who: 'guestC', x: 0.7, feetY: ROOM_FLOOR_V },
    { who: 'teacher', x: 0.85, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    // a slow turn: yaw drifts from +1 to -1 across the scene, head leads
    const pj = pose('S3', 'jake', f, [
      { f: 0, p: { ...basePose, x: 960, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, yaw: 1, headTilt: 4, expr: 'puzzled' } },
      { f: len, p: { ...basePose, x: 960, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, yaw: -1, headTilt: -4, expr: 'puzzled' } },
    ]);
    const faceJ = faceAt(f, [[0, 'puzzled']]);
    const panX = 860 + (200 * f) / len;
    return (
      <g>
        <g transform={camT(panX, 560, 1.0)}>
          <CityStreet t={f} mode="day" id="s3" />
          {Ped({ scene: 'S3', label: 'ped1', x: 280, look: 'guestA', scale: 0.9, tag: '36', expr: 'neutral', yaw: -1 }, f, len)}
          {Ped({ scene: 'S3', label: 'ped2', x: 560, look: 'guestB', scale: 0.95, tag: '52', expr: 'neutral', yaw: 1 }, f, len)}
          {Ped({ scene: 'S3', label: 'ped3', x: 1360, look: 'guestC', scale: 0.85, tag: '19', expr: 'neutral', yaw: -1 }, f, len)}
          {Ped({ scene: 'S3', label: 'ped4', x: 1640, look: 'teacher', scale: 0.95, tag: '73', expr: 'neutral', yaw: 1 }, f, len)}
          {footShadows(pj)}
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...pj, ...faceJ, facing: 1 }} rimId="rimR" shadow={0} showBrows />)}
        </g>
      </g>
    );
  },
});

// S4 — Bathroom, close-up. Jake splashes water on his face, looks up — his
// number glows pink above his head. He checks it twice. Camera: slow
// push-in. The number fades IN over the first 40 frames (it appears).
defineScene({
  id: 'S4',
  durationSec: DUR.S4,
  characters: [
    { who: 'jake', x: 0.5, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const pj = pose('S4', 'jake', f, [
      { f: 0, p: { ...basePose, x: 960, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, armR: { a: 120, b: 60 }, handR: 'open', headTilt: -6, expr: 'shock' } },
      { f: len, p: { ...basePose, x: 960, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, armR: { a: 120, b: 60 }, handR: 'open', headTilt: -6, expr: 'shock' } },
    ]);
    const faceJ = faceAt(f, [[0, 'shock']]);
    const zoom = kf(f, [[0, 1.2], [len, 1.35]]);
    const tagO = clamp(f / 40, 0, 1);
    return (
      <g>
        <g transform={camT(960, 520, zoom)}>
          <Bathroom t={f} mode="morning" id="s4" />
          <defs>
            <clipPath id="s4mirror"><rect x={676} y={156} width={568} height={488} /></clipPath>
          </defs>
          <g clipPath="url(#s4mirror)" opacity={0.3}>
            {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...pj, ...faceJ, facing: 1 }} rimId="rimBlue" shadow={0} showBrows />)}
            <AgeTag x={pj.x} y={ageTagY(pj.y, 1)} text="27" size={44} o={tagO * 0.9} />
          </g>
          {footShadows(pj)}
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...pj, ...faceJ, facing: 1 }} rimId="rimR" shadow={0} showBrows />)}
          <AgeTag x={pj.x} y={ageTagY(pj.y, 1)} text="27" size={44} o={tagO} />
        </g>
      </g>
    );
  },
});

// S5 — Jake stares at his own number, hand on his chin, thinking. The
// mirror shows his silhouette and the pink glow. Camera: hold still.
defineScene({
  id: 'S5',
  durationSec: DUR.S5,
  characters: [
    { who: 'jake', x: 0.5, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const pj = pose('S5', 'jake', f, [
      { f: 0, p: { ...basePose, x: 960, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, armR: { a: 95, b: 85 }, handR: 'open', headTilt: 5, expr: 'puzzled' } },
      { f: len, p: { ...basePose, x: 960, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, armR: { a: 95, b: 85 }, handR: 'open', headTilt: 5, expr: 'puzzled' } },
    ]);
    const faceJ = faceAt(f, [[0, 'puzzled']]);
    return (
      <g>
        <g transform={camT(960, 540, 1.15)}>
          <Bathroom t={f} mode="morning" id="s5" />
          <defs>
            <clipPath id="s5mirror"><rect x={676} y={156} width={568} height={488} /></clipPath>
          </defs>
          <g clipPath="url(#s5mirror)" opacity={0.3}>
            {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...pj, ...faceJ, facing: 1 }} rimId="rimBlue" shadow={0} showBrows />)}
            <AgeTag x={pj.x} y={ageTagY(pj.y, 1)} text="27" size={44} o={0.9} />
          </g>
          {footShadows(pj)}
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...pj, ...faceJ, facing: 1 }} rimId="rimR" shadow={0} showBrows />)}
          <AgeTag x={pj.x} y={ageTagY(pj.y, 1)} text="27" size={44} />
        </g>
      </g>
    );
  },
});

// S6 — Wide street shot. The jogger, the woman with the dog, the kid on the
// skateboard — each with a glowing pink number above their head. Camera:
// slow pan.
defineScene({
  id: 'S6',
  durationSec: DUR.S6,
  characters: [
    { who: 'jake', x: 0.5, feetY: ROOM_FLOOR_V },
    { who: 'guestC', x: 0.25, feetY: ROOM_FLOOR_V },
    { who: 'teacher', x: 0.68, feetY: ROOM_FLOOR_V },
    { who: 'student', x: 0.88, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const pj = pose('S6', 'jake', f, [
      { f: 0, p: { ...basePose, x: 960, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, yaw: 1, expr: 'neutral' } },
      { f: len, p: { ...basePose, x: 960, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, yaw: 1, expr: 'neutral' } },
    ]);
    const faceJ = faceAt(f, [[0, 'neutral']]);
    // the jogger — mid-stride, translating left to right across the scene
    const pjo = pose('S6', 'jogger', f, [
      { f: 0, p: { ...basePose, x: 380, y: standY(0.95, ROOM_FLOOR_V), scale: 0.95, ...WALK, yaw: 1, expr: 'neutral' } },
      { f: len, p: { ...basePose, x: 620, y: standY(0.95, ROOM_FLOOR_V), scale: 0.95, ...WALK, yaw: 1, expr: 'neutral' } },
    ]);
    const faceJo = faceAt(f, [[0, 'neutral']]);
    // the woman with the dog — standing, the dog at her side
    const pw = pose('S6', 'woman', f, [
      { f: 0, p: { ...basePose, x: 1300, y: standY(0.95, ROOM_FLOOR_V), scale: 0.95, ...STAND, yaw: -1, expr: 'neutral' } },
      { f: len, p: { ...basePose, x: 1300, y: standY(0.95, ROOM_FLOOR_V), scale: 0.95, ...STAND, yaw: -1, expr: 'neutral' } },
    ]);
    const faceW = faceAt(f, [[0, 'neutral']]);
    // the kid on the skateboard — standing on the board, rolling slowly
    const pk = pose('S6', 'kid', f, [
      { f: 0, p: { ...basePose, x: 1620, y: standY(0.75, ROOM_FLOOR_V) - 14, scale: 0.75, ...STAND, yaw: 1, expr: 'happy' } },
      { f: len, p: { ...basePose, x: 1720, y: standY(0.75, ROOM_FLOOR_V) - 14, scale: 0.75, ...STAND, yaw: 1, expr: 'happy' } },
    ]);
    const faceK = faceAt(f, [[0, 'happy']]);
    const panX = 860 + (200 * f) / len;
    return (
      <g>
        <g transform={camT(panX, 560, 1.0)}>
          <CityStreet t={f} mode="day" id="s6" />
          {footShadows(pjo)}
          {cast('guestC', <Hero slim look={LOOKS.guestC} pose={{ ...pjo, ...faceJo, facing: 1 }} rimId="rimR" shadow={0} showBrows />)}
          <AgeTag x={pjo.x} y={ageTagY(pjo.y, 0.95)} text="31" size={30} />
          {footShadows(pw)}
          {cast('teacher', <Hero slim look={LOOKS.teacher} pose={{ ...pw, ...faceW, facing: 1 }} rimId="rimR" shadow={0} showBrows />)}
          <AgeTag x={pw.x} y={ageTagY(pw.y, 0.95)} text="58" size={30} />
          <Dog x={pw.x + 90} y={876} s={0.8} />
          <Skateboard x={pk.x} y={876} s={0.8} />
          {footShadows(pk)}
          {cast('student', <Hero slim look={LOOKS.student} pose={{ ...pk, ...faceK, facing: 1 }} rimId="rimR" shadow={0} showBrows />)}
          <AgeTag x={pk.x} y={ageTagY(pk.y, 0.75)} text="14" size={26} />
          {footShadows(pj)}
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...pj, ...faceJ, facing: 1 }} rimId="rimR" shadow={0} showBrows />)}
        </g>
      </g>
    );
  },
});

// S7 — Close-up on Jake's face as he watches the crowd. His eyes flick from
// number to number. The numbers glow pink. Camera: slow push-in.
defineScene({
  id: 'S7',
  durationSec: DUR.S7,
  characters: [
    { who: 'jake', x: 0.5, feetY: ROOM_FLOOR_V },
    { who: 'guestA', x: 0.18, feetY: ROOM_FLOOR_V },
    { who: 'guestB', x: 0.82, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    // eyes flick number to number: the head tilts left, then right
    const pj = pose('S7', 'jake', f, [
      { f: 0, p: { ...basePose, x: 960, y: standY(1.3, ROOM_FLOOR_V), scale: 1.3, ...STAND, headTilt: -5, expr: 'puzzled' } },
      { f: Math.round(len * 0.5), p: { ...basePose, x: 960, y: standY(1.3, ROOM_FLOOR_V), scale: 1.3, ...STAND, headTilt: 5, expr: 'puzzled' } },
      { f: len, p: { ...basePose, x: 960, y: standY(1.3, ROOM_FLOOR_V), scale: 1.3, ...STAND, headTilt: -5, expr: 'puzzled' } },
    ]);
    const faceJ = faceAt(f, [[0, 'puzzled']]);
    const zoom = kf(f, [[0, 1.25], [len, 1.4]]);
    return (
      <g>
        <g transform={camT(960, 480, zoom)}>
          <CityStreet t={f} mode="day" id="s7" />
          {Ped({ scene: 'S7', label: 'ped1', x: 340, look: 'guestA', scale: 0.85, tag: '44', expr: 'neutral', yaw: 1 }, f, len)}
          {Ped({ scene: 'S7', label: 'ped2', x: 1580, look: 'guestB', scale: 0.85, tag: '29', expr: 'neutral', yaw: -1 }, f, len)}
          {footShadows(pj)}
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...pj, ...faceJ, facing: 1 }} rimId="rimR" shadow={0} showBrows />)}
        </g>
      </g>
    );
  },
});

// S8 — Street corner, Jake at the edge of frame. The Detective peeks out from
// behind a street sign at the far-left edge, half hidden, magnifier down.
// Camera: slow pan.
defineScene({
  id: 'S8',
  durationSec: DUR.S8,
  characters: [
    { who: 'jake', x: 0.78, feetY: ROOM_FLOOR_V },
    { who: 'detective', x: 0.06, feetY: ROOM_FLOOR_V },
    { who: 'guestA', x: 0.35, feetY: ROOM_FLOOR_V },
    { who: 'guestC', x: 0.55, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const pj = pose('S8', 'jake', f, [
      { f: 0, p: { ...basePose, x: 1500, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, yaw: -1, headTilt: 4, expr: 'worried' } },
      { f: len, p: { ...basePose, x: 1500, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, yaw: -1, headTilt: 4, expr: 'worried' } },
    ]);
    const faceJ = faceAt(f, [[0, 'worried']]);
    const panX = 860 + (200 * f) / len;
    return (
      <g>
        <g transform={camT(panX, 560, 1.0)}>
          <CityStreet t={f} mode="day" id="s8" />
          {Ped({ scene: 'S8', label: 'ped1', x: 660, look: 'guestA', scale: 0.9, tag: '38', expr: 'neutral', yaw: 1 }, f, len)}
          {Ped({ scene: 'S8', label: 'ped2', x: 1060, look: 'guestC', scale: 0.9, tag: '61', expr: 'neutral', yaw: -1 }, f, len)}
          {footShadows(pj)}
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...pj, ...faceJ, facing: 1 }} rimId="rimR" shadow={0} showBrows />)}
          {DetectiveCameo({ scene: 'S8', label: 'detective', x: 110, f, len, magnifier: 'down', expr: 'smug' })}
          <StreetSign x={130} label="MAIN ST" />
        </g>
      </g>
    );
  },
});

// S9 — Jake keeps walking, the crowd flowing past him, numbers bobbing above
// heads. His brows furrow. Camera: slow push-in.
defineScene({
  id: 'S9',
  durationSec: DUR.S9,
  characters: [
    { who: 'jake', x: 0.45, feetY: ROOM_FLOOR_V },
    { who: 'guestA', x: 0.12, feetY: ROOM_FLOOR_V },
    { who: 'guestB', x: 0.28, feetY: ROOM_FLOOR_V },
    { who: 'guestC', x: 0.72, feetY: ROOM_FLOOR_V },
    { who: 'teacher', x: 0.88, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const pj = pose('S9', 'jake', f, [
      { f: 0, p: { ...basePose, x: 800, y: standY(1, ROOM_FLOOR_V), scale: 1, ...WALK, yaw: 1, expr: 'worried' } },
      { f: len, p: { ...basePose, x: 1150, y: standY(1, ROOM_FLOOR_V), scale: 1, ...WALK, yaw: 1, expr: 'worried' } },
    ]);
    const faceJ = faceAt(f, [[0, 'worried']]);
    const zoom = kf(f, [[0, 1.0], [len, 1.1]]);
    return (
      <g>
        <g transform={camT(960, 560, zoom)}>
          <CityStreet t={f} mode="day" id="s9" />
          {Ped({ scene: 'S9', label: 'ped1', x: 230, look: 'guestA', scale: 0.9, tag: '47', expr: 'neutral', yaw: -1 }, f, len)}
          {Ped({ scene: 'S9', label: 'ped2', x: 520, look: 'guestB', scale: 0.95, tag: '33', expr: 'neutral', yaw: 1 }, f, len)}
          {Ped({ scene: 'S9', label: 'ped3', x: 1400, look: 'guestC', scale: 0.85, tag: '55', expr: 'neutral', yaw: -1 }, f, len)}
          {Ped({ scene: 'S9', label: 'ped4', x: 1700, look: 'teacher', scale: 0.95, tag: '26', expr: 'neutral', yaw: 1 }, f, len)}
          {footShadows(pj)}
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...pj, ...faceJ, facing: 1 }} rimId="rimR" shadow={0} showBrows />)}
        </g>
      </g>
    );
  },
});

// ===========================================================================
// CHAPTER 2 — THE COWORKER WHO IS 47
// ===========================================================================

// S10 — Office, wide. A young-looking coworker laughs with colleagues at her
// desk. Her glowing number reads 47. Jake watches from his desk. Camera:
// slow push-in.
defineScene({
  id: 'S10',
  durationSec: DUR.S10,
  characters: [
    { who: 'guestB', x: 0.36, feetY: ROOM_FLOOR_V },
    { who: 'guestA', x: 0.26, feetY: ROOM_FLOOR_V },
    { who: 'teacher', x: 0.47, feetY: ROOM_FLOOR_V },
    { who: 'jake', x: 0.78, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    // Maya — laughing with colleagues, one arm raised
    const pm = pose('S10', 'maya', f, [
      { f: 0, p: { ...basePose, x: 700, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, armR: { a: 60, b: 40 }, handR: 'open', yaw: -1, expr: 'happy' } },
      { f: len, p: { ...basePose, x: 700, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, armR: { a: 60, b: 40 }, handR: 'open', yaw: -1, expr: 'happy' } },
    ]);
    const faceM = faceAt(f, [[0, 'happy']]);
    const pj = pose('S10', 'jake', f, [
      { f: 0, p: { ...basePose, x: 1500, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, yaw: -1, headTilt: 4, expr: 'neutral' } },
      { f: len, p: { ...basePose, x: 1500, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, yaw: -1, headTilt: 4, expr: 'neutral' } },
    ]);
    const faceJ = faceAt(f, [[0, 'neutral']]);
    const zoom = kf(f, [[0, 1.0], [len, 1.08]]);
    return (
      <g>
        <g transform={camT(960, 560, zoom)}>
          <OfficeDay t={f} id="s10" />
          {Ped({ scene: 'S10', label: 'col1', x: 480, look: 'guestA', scale: 0.95, tag: '34', expr: 'happy', yaw: 1 }, f, len)}
          {Ped({ scene: 'S10', label: 'col2', x: 920, look: 'teacher', scale: 0.95, tag: '49', expr: 'happy', yaw: -1 }, f, len)}
          {footShadows(pm)}
          {cast('guestB', <Hero slim look={LOOKS.guestB} pose={{ ...pm, ...faceM, facing: 1 }} rimId="rimR" shadow={0} showBrows />)}
          <AgeTag x={pm.x} y={ageTagY(pm.y, 1)} text="47" size={34} />
          {footShadows(pj)}
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...pj, ...faceJ, facing: 1 }} rimId="rimR" shadow={0} showBrows />)}
        </g>
      </g>
    );
  },
});

// S11 — Close-up on Maya's number: 47, glowing pink. Cut to Jake's face —
// his eyes go wide. Camera: hold still.
defineScene({
  id: 'S11',
  durationSec: DUR.S11,
  characters: [
    { who: 'guestB', x: 0.65, feetY: ROOM_FLOOR_V },
    { who: 'jake', x: 0.23, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const pm = pose('S11', 'maya', f, [
      { f: 0, p: { ...basePose, x: 1250, y: standY(1.15, ROOM_FLOOR_V), scale: 1.15, ...STAND, yaw: -1, expr: 'happy' } },
      { f: len, p: { ...basePose, x: 1250, y: standY(1.15, ROOM_FLOOR_V), scale: 1.15, ...STAND, yaw: -1, expr: 'happy' } },
    ]);
    const faceM = faceAt(f, [[0, 'happy']]);
    const pj = pose('S11', 'jake', f, [
      { f: 0, p: { ...basePose, x: 450, y: standY(0.9, ROOM_FLOOR_V), scale: 0.9, ...STAND, yaw: 1, expr: 'shock' } },
      { f: len, p: { ...basePose, x: 450, y: standY(0.9, ROOM_FLOOR_V), scale: 0.9, ...STAND, yaw: 1, expr: 'shock' } },
    ]);
    const faceJ = faceAt(f, [[0, 'shock']]);
    return (
      <g>
        <g transform={camT(960, 480, 1.2)}>
          <OfficeDay t={f} id="s11" />
          {footShadows(pj)}
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...pj, ...faceJ, facing: 1 }} rimId="rimR" shadow={0} showBrows />)}
          {footShadows(pm)}
          {cast('guestB', <Hero slim look={LOOKS.guestB} pose={{ ...pm, ...faceM, facing: 1 }} rimId="rimR" shadow={0} showBrows />)}
          <AgeTag x={pm.x} y={ageTagY(pm.y, 1.15)} text="47" size={72} />
        </g>
      </g>
    );
  },
});

// S12 — Meeting room. Maya presents, confident — her number 47 glowing. The
// manager nods, smiles, and hands the project to an older-looking colleague.
// Maya's brows droop. Camera: slow pan.
defineScene({
  id: 'S12',
  durationSec: DUR.S12,
  characters: [
    { who: 'guestB', x: 0.47, feetY: ROOM_FLOOR_V },
    { who: 'hero', x: 0.68, feetY: ROOM_FLOOR_V },
    { who: 'guestC', x: 0.31, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    // Maya presents, then her brows droop when the project goes elsewhere
    const pm = pose('S12', 'maya', f, [
      { f: 0, p: { ...basePose, x: 900, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, armR: { a: 70, b: 30 }, handR: 'open', yaw: 1, expr: 'happy' } },
      { f: len, p: { ...basePose, x: 900, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, armR: { a: 70, b: 30 }, handR: 'open', yaw: 1, expr: 'happy' } },
    ]);
    const faceM = faceAt(f, [[0, 'happy'], [Math.round(len * 0.6), 'sad']]);
    // the manager — seated at the meeting table, arm extended toward the
    // older-looking colleague as he hands the project over
    const pg = pose('S12', 'manager', f, [
      { f: 0, p: { ...basePose, x: 1300, y: sitY(876, 1), scale: 1, ...SIT, armR: { a: 50, b: 20 }, handR: 'open', yaw: -1, expr: 'smug' } },
      { f: len, p: { ...basePose, x: 1300, y: sitY(876, 1), scale: 1, ...SIT, armR: { a: 50, b: 20 }, handR: 'open', yaw: -1, expr: 'smug' } },
    ]);
    const faceG = faceAt(f, [[0, 'smug']]);
    const pc = pose('S12', 'colleague', f, [
      { f: 0, p: { ...basePose, x: 600, y: sitY(876, 1), scale: 1, ...SIT, yaw: 1, expr: 'neutral' } },
      { f: len, p: { ...basePose, x: 600, y: sitY(876, 1), scale: 1, ...SIT, yaw: 1, expr: 'neutral' } },
    ]);
    const faceC = faceAt(f, [[0, 'neutral']]);
    const panX = 860 + (200 * f) / len;
    return (
      <g>
        <g transform={camT(panX, 560, 1.0)}>
          <OfficeDay t={f} id="s12" />
          <OfficeChair x={600} />
          <OfficeChair x={1300} flip />
          {footShadows(pc)}
          {cast('guestC', <Hero slim look={LOOKS.guestC} pose={{ ...pc, ...faceC, facing: 1 }} rimId="rimR" shadow={0} showBrows />)}
          <AgeTag x={pc.x} y={ageTagY(pc.y, 1)} text="52" size={30} />
          {footShadows(pm)}
          {cast('guestB', <Hero slim look={LOOKS.guestB} pose={{ ...pm, ...faceM, facing: 1 }} rimId="rimR" shadow={0} showBrows />)}
          <AgeTag x={pm.x} y={ageTagY(pm.y, 1)} text="47" size={34} />
          {footShadows(pg)}
          {cast('hero', <Hero slim look={LOOKS.hero} pose={{ ...pg, ...faceG, facing: 1 }} rimId="rimR" shadow={0} showBrows />)}
          <AgeTag x={pg.x} y={ageTagY(pg.y, 1)} text="58" size={30} />
        </g>
      </g>
    );
  },
});

// S13 — Close-up on Maya's face, then on the manager's face. Both
// silhouettes, white oval eyes. Her number glows pink above her. Camera:
// hold still.
defineScene({
  id: 'S13',
  durationSec: DUR.S13,
  characters: [
    { who: 'guestB', x: 0.31, feetY: ROOM_FLOOR_V },
    { who: 'hero', x: 0.7, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const pm = pose('S13', 'maya', f, [
      { f: 0, p: { ...basePose, x: 600, y: standY(1.25, ROOM_FLOOR_V), scale: 1.25, ...STAND, yaw: 1, headTilt: 3, expr: 'sad' } },
      { f: len, p: { ...basePose, x: 600, y: standY(1.25, ROOM_FLOOR_V), scale: 1.25, ...STAND, yaw: 1, headTilt: 3, expr: 'sad' } },
    ]);
    const faceM = faceAt(f, [[0, 'sad']]);
    const pg = pose('S13', 'manager', f, [
      { f: 0, p: { ...basePose, x: 1350, y: standY(1.25, ROOM_FLOOR_V), scale: 1.25, ...STAND, yaw: -1, expr: 'smug' } },
      { f: len, p: { ...basePose, x: 1350, y: standY(1.25, ROOM_FLOOR_V), scale: 1.25, ...STAND, yaw: -1, expr: 'smug' } },
    ]);
    const faceG = faceAt(f, [[0, 'smug']]);
    return (
      <g>
        <g transform={camT(960, 500, 1.15)}>
          <OfficeDay t={f} id="s13" />
          {footShadows(pm)}
          {cast('guestB', <Hero slim look={LOOKS.guestB} pose={{ ...pm, ...faceM, facing: 1 }} rimId="rimR" shadow={0} showBrows />)}
          <AgeTag x={pm.x} y={ageTagY(pm.y, 1.25)} text="47" size={56} />
          {footShadows(pg)}
          {cast('hero', <Hero slim look={LOOKS.hero} pose={{ ...pg, ...faceG, facing: 1 }} rimId="rimR" shadow={0} showBrows />)}
          <AgeTag x={pg.x} y={ageTagY(pg.y, 1.25)} text="58" size={48} />
        </g>
      </g>
    );
  },
});

// S14 — Maya at her desk, quietly fixing someone else's report. Jake
// watches, his head tilted. Warm afternoon light through the window.
// Camera: slow push-in.
defineScene({
  id: 'S14',
  durationSec: DUR.S14,
  characters: [
    { who: 'guestB', x: 0.17, feetY: ROOM_FLOOR_V },
    { who: 'jake', x: 0.68, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    // Maya seated at the left desk (chair at x=320), typing the fix
    const pm = pose('S14', 'maya', f, [
      { f: 0, p: { ...basePose, x: 320, y: sitY(876, 1), scale: 1, ...SIT, armR: { a: 40, b: 30 }, armL: { a: 40, b: 30 }, yaw: 1, headTilt: 6, expr: 'tired' } },
      { f: len, p: { ...basePose, x: 320, y: sitY(876, 1), scale: 1, ...SIT, armR: { a: 40, b: 30 }, armL: { a: 40, b: 30 }, yaw: 1, headTilt: 6, expr: 'tired' } },
    ]);
    const faceM = faceAt(f, [[0, 'tired']]);
    const pj = pose('S14', 'jake', f, [
      { f: 0, p: { ...basePose, x: 1300, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, yaw: -1, headTilt: 8, expr: 'sad' } },
      { f: len, p: { ...basePose, x: 1300, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, yaw: -1, headTilt: 8, expr: 'sad' } },
    ]);
    const faceJ = faceAt(f, [[0, 'sad']]);
    const zoom = kf(f, [[0, 1.0], [len, 1.08]]);
    return (
      <g>
        <g transform={camT(960, 560, zoom)}>
          <OfficeDay t={f} id="s14" />
          {footShadows(pm)}
          {cast('guestB', <Hero slim look={LOOKS.guestB} pose={{ ...pm, ...faceM, facing: 1 }} rimId="rimR" shadow={0} showBrows />)}
          <AgeTag x={pm.x} y={ageTagY(pm.y, 1)} text="47" size={30} />
          {footShadows(pj)}
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...pj, ...faceJ, facing: 1 }} rimId="rimR" shadow={0} showBrows />)}
        </g>
      </g>
    );
  },
});

// S15 — Office, Maya at the water cooler. The Detective peeks from behind a
// tall office plant at the far-right edge, half hidden. Camera: slow pan.
defineScene({
  id: 'S15',
  durationSec: DUR.S15,
  characters: [
    { who: 'guestB', x: 0.9, feetY: ROOM_FLOOR_V },
    { who: 'detective', x: 0.68, feetY: ROOM_FLOOR_V },
    { who: 'jake', x: 0.3, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const pm = pose('S15', 'maya', f, [
      { f: 0, p: { ...basePose, x: 1720, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, yaw: -1, expr: 'neutral' } },
      { f: len, p: { ...basePose, x: 1720, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, yaw: -1, expr: 'neutral' } },
    ]);
    const faceM = faceAt(f, [[0, 'neutral']]);
    const pj = pose('S15', 'jake', f, [
      { f: 0, p: { ...basePose, x: 580, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, yaw: 1, expr: 'neutral' } },
      { f: len, p: { ...basePose, x: 580, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, yaw: 1, expr: 'neutral' } },
    ]);
    const faceJ = faceAt(f, [[0, 'neutral']]);
    const panX = 860 + (200 * f) / len;
    return (
      <g>
        <g transform={camT(panX, 560, 1.0)}>
          <OfficeDay t={f} id="s15" />
          {footShadows(pj)}
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...pj, ...faceJ, facing: 1 }} rimId="rimR" shadow={0} showBrows />)}
          {footShadows(pm)}
          {cast('guestB', <Hero slim look={LOOKS.guestB} pose={{ ...pm, ...faceM, facing: 1 }} rimId="rimR" shadow={0} showBrows />)}
          <AgeTag x={pm.x} y={ageTagY(pm.y, 1)} text="47" size={34} />
          {DetectiveCameo({ scene: 'S15', label: 'detective', x: 1300, f, len, magnifier: null, expr: 'smug' })}
          <Plant x={1300} />
        </g>
      </g>
    );
  },
});

// S16 — Maya talking on the phone, animated, gesturing — her number 47 steady
// above her. Jake listens from his desk. Camera: hold still.
defineScene({
  id: 'S16',
  durationSec: DUR.S16,
  characters: [
    { who: 'guestB', x: 0.35, feetY: ROOM_FLOOR_V },
    { who: 'jake', x: 0.72, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    // Maya on the phone, gesturing with her free hand
    const pm = pose('S16', 'maya', f, [
      { f: 0, p: { ...basePose, x: 680, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, armR: { a: 55, b: 70 }, handR: 'open', armL: { a: 60, b: 40 }, handL: 'open', yaw: 1, expr: 'happy' } },
      { f: len, p: { ...basePose, x: 680, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, armR: { a: 55, b: 70 }, handR: 'open', armL: { a: 60, b: 40 }, handL: 'open', yaw: 1, expr: 'happy' } },
    ]);
    const faceM = faceAt(f, [[0, 'happy']]);
    const hm = toWorld(pm, joints(pm, true).armR.end);
    const pj = pose('S16', 'jake', f, [
      { f: 0, p: { ...basePose, x: 1380, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, yaw: -1, headTilt: 4, expr: 'neutral' } },
      { f: len, p: { ...basePose, x: 1380, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, yaw: -1, headTilt: 4, expr: 'neutral' } },
    ]);
    const faceJ = faceAt(f, [[0, 'neutral']]);
    return (
      <g>
        <g transform={camT(960, 560, 1.0)}>
          <OfficeDay t={f} id="s16" />
          {footShadows(pm)}
          {cast('guestB', <Hero slim look={LOOKS.guestB} pose={{ ...pm, ...faceM, facing: 1 }} rimId="rimR" shadow={0} showBrows />)}
          <AgeTag x={pm.x} y={ageTagY(pm.y, 1)} text="47" size={34} />
          {/* phone at Maya's ear */}
          <rect x={hm.x - 9} y={hm.y - 34} width={18} height={34} rx={4} fill="#161616" stroke="#3A3E4A" strokeWidth={2} />
          <rect x={hm.x - 6} y={hm.y - 30} width={12} height={26} rx={2} fill="#8FD3FF" opacity={0.85} />
          {footShadows(pj)}
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...pj, ...faceJ, facing: 1 }} rimId="rimR" shadow={0} showBrows />)}
        </g>
      </g>
    );
  },
});

// ===========================================================================
// CHAPTER 3 — THE TEENAGER WHO IS 63
// ===========================================================================

// S17 — Coffee shop, wide. A teenager in a hoodie, headphones on, skateboard
// under one arm. His glowing number reads 63. Warm light through the window.
// Camera: slow push-in.
defineScene({
  id: 'S17',
  durationSec: DUR.S17,
  characters: [
    { who: 'teenager', x: 0.6, feetY: ROOM_FLOOR_V },
    { who: 'student', x: 0.25, feetY: ROOM_FLOOR_V },
    { who: 'jake', x: 0.85, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const pt = pose('S17', 'teenager', f, [
      { f: 0, p: { ...basePose, x: 1150, y: standY(0.95, ROOM_FLOOR_V), scale: 0.95, ...STAND, armL: { a: 30, b: 50 }, handL: 'open', yaw: -1, expr: 'cool' } },
      { f: len, p: { ...basePose, x: 1150, y: standY(0.95, ROOM_FLOOR_V), scale: 0.95, ...STAND, armL: { a: 30, b: 50 }, handL: 'open', yaw: -1, expr: 'cool' } },
    ]);
    const faceT = faceAt(f, [[0, 'cool']]);
    const hct = headC(pt, 0.95);
    const pj = pose('S17', 'jake', f, [
      { f: 0, p: { ...basePose, x: 1640, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, yaw: -1, expr: 'puzzled' } },
      { f: len, p: { ...basePose, x: 1640, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, yaw: -1, expr: 'puzzled' } },
    ]);
    const faceJ = faceAt(f, [[0, 'puzzled']]);
    const zoom = kf(f, [[0, 1.0], [len, 1.08]]);
    return (
      <g>
        <g transform={camT(960, 560, zoom)}>
          <CoffeeShop t={f} id="s17" />
          {Ped({ scene: 'S17', label: 'barista', x: 480, look: 'student', scale: 0.95, tag: '24', expr: 'happy', yaw: 1 }, f, len)}
          {footShadows(pt)}
          {cast('teenager', <Hero slim look={LOOKS.teenager} pose={{ ...pt, ...faceT, facing: 1 }} rimId="rimR" shadow={0} showBrows />)}
          <Headphones x={hct.x} y={hct.y} s={0.95} />
          <Skateboard x={pt.x - 70} y={876} s={0.8} />
          <AgeTag x={pt.x} y={ageTagY(pt.y, 0.95)} text="63" size={34} />
          {footShadows(pj)}
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...pj, ...faceJ, facing: 1 }} rimId="rimR" shadow={0} showBrows />)}
        </g>
      </g>
    );
  },
});

// S18 — The barista chats with the teenager like an old friend, asking his
// opinion. The teenager nods, relaxed. Camera: slow pan.
defineScene({
  id: 'S18',
  durationSec: DUR.S18,
  characters: [
    { who: 'student', x: 0.25, feetY: ROOM_FLOOR_V },
    { who: 'teenager', x: 0.55, feetY: ROOM_FLOOR_V },
    { who: 'jake', x: 0.85, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const pb = pose('S18', 'barista', f, [
      { f: 0, p: { ...basePose, x: 480, y: standY(0.95, ROOM_FLOOR_V), scale: 0.95, ...STAND, armR: { a: 50, b: 40 }, handR: 'open', yaw: 1, expr: 'happy' } },
      { f: len, p: { ...basePose, x: 480, y: standY(0.95, ROOM_FLOOR_V), scale: 0.95, ...STAND, armR: { a: 50, b: 40 }, handR: 'open', yaw: 1, expr: 'happy' } },
    ]);
    const faceB = faceAt(f, [[0, 'happy']]);
    // the teenager nods — a small head dip mid-scene, then back up
    const pt = pose('S18', 'teenager', f, [
      { f: 0, p: { ...basePose, x: 1060, y: standY(0.95, ROOM_FLOOR_V), scale: 0.95, ...STAND, yaw: -1, headTilt: 0, expr: 'neutral' } },
      { f: Math.round(len * 0.45), p: { ...basePose, x: 1060, y: standY(0.95, ROOM_FLOOR_V), scale: 0.95, ...STAND, yaw: -1, headTilt: 8, expr: 'neutral' } },
      { f: Math.round(len * 0.7), p: { ...basePose, x: 1060, y: standY(0.95, ROOM_FLOOR_V), scale: 0.95, ...STAND, yaw: -1, headTilt: 0, expr: 'neutral' } },
      { f: len, p: { ...basePose, x: 1060, y: standY(0.95, ROOM_FLOOR_V), scale: 0.95, ...STAND, yaw: -1, headTilt: 0, expr: 'neutral' } },
    ]);
    const faceT = faceAt(f, [[0, 'neutral']]);
    const hct = headC(pt, 0.95);
    const pj = pose('S18', 'jake', f, [
      { f: 0, p: { ...basePose, x: 1640, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, yaw: -1, expr: 'neutral' } },
      { f: len, p: { ...basePose, x: 1640, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, yaw: -1, expr: 'neutral' } },
    ]);
    const faceJ = faceAt(f, [[0, 'neutral']]);
    const panX = 860 + (200 * f) / len;
    return (
      <g>
        <g transform={camT(panX, 560, 1.0)}>
          <CoffeeShop t={f} id="s18" />
          {footShadows(pb)}
          {cast('student', <Hero slim look={LOOKS.student} pose={{ ...pb, ...faceB, facing: 1 }} rimId="rimR" shadow={0} showBrows />)}
          <AgeTag x={pb.x} y={ageTagY(pb.y, 0.95)} text="24" size={30} />
          {footShadows(pt)}
          {cast('teenager', <Hero slim look={LOOKS.teenager} pose={{ ...pt, ...faceT, facing: 1 }} rimId="rimR" shadow={0} showBrows />)}
          <Headphones x={hct.x} y={hct.y} s={0.95} />
          <AgeTag x={pt.x} y={ageTagY(pt.y, 0.95)} text="63" size={34} />
          {footShadows(pj)}
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...pj, ...faceJ, facing: 1 }} rimId="rimR" shadow={0} showBrows />)}
        </g>
      </g>
    );
  },
});

// S19 — The door opens. An old man with white hair, slow steps, a cane walks
// in. His glowing number reads 19. The whole room turns to look. Camera:
// slow push-in.
defineScene({
  id: 'S19',
  durationSec: DUR.S19,
  characters: [
    { who: 'guestA', x: 0.82, feetY: ROOM_FLOOR_V },
    { who: 'teenager', x: 0.4, feetY: ROOM_FLOOR_V },
    { who: 'student', x: 0.2, feetY: ROOM_FLOOR_V },
    { who: 'jake', x: 0.62, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    // the old man — slow steps in from the door, cane planted, white hair
    const po = pose('S19', 'oldman', f, [
      { f: 0, p: { ...basePose, x: 1700, y: standY(0.95, ROOM_FLOOR_V), scale: 0.95, ...WALK, yaw: -1, headTilt: 4, expr: 'neutral' } },
      { f: len, p: { ...basePose, x: 1560, y: standY(0.95, ROOM_FLOOR_V), scale: 0.95, ...WALK, yaw: -1, headTilt: 4, expr: 'neutral' } },
    ]);
    const faceO = faceAt(f, [[0, 'neutral']]);
    const hco = headC(po, 0.95);
    const pj = pose('S19', 'jake', f, [
      { f: 0, p: { ...basePose, x: 1200, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, yaw: 1, expr: 'shock' } },
      { f: len, p: { ...basePose, x: 1200, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, yaw: 1, expr: 'shock' } },
    ]);
    const faceJ = faceAt(f, [[0, 'shock']]);
    const zoom = kf(f, [[0, 1.0], [len, 1.08]]);
    return (
      <g>
        <g transform={camT(960, 560, zoom)}>
          <CoffeeShop t={f} id="s19" />
          {Ped({ scene: 'S19', label: 'teen', x: 780, look: 'teenager', scale: 0.95, tag: '63', expr: 'neutral', yaw: 1 }, f, len)}
          {Ped({ scene: 'S19', label: 'barista', x: 400, look: 'student', scale: 0.95, tag: '24', expr: 'neutral', yaw: 1 }, f, len)}
          {footShadows(pj)}
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...pj, ...faceJ, facing: 1 }} rimId="rimR" shadow={0} showBrows />)}
          <Cane x={po.x + 46} y={876} h={150} />
          {footShadows(po)}
          {cast('guestA', <Hero slim look={LOOKS.guestA} pose={{ ...po, ...faceO, facing: 1 }} rimId="rimR" shadow={0} showBrows />)}
          <WhiteHair x={hco.x} y={hco.y} s={0.95} />
          <AgeTag x={po.x} y={ageTagY(po.y, 0.95)} text="19" size={34} />
        </g>
      </g>
    );
  },
});

// S20 — Close-up on Jake's face, eyes darting between the teenager and the
// old man. His brows are raised, confused. Camera: hold still.
defineScene({
  id: 'S20',
  durationSec: DUR.S20,
  characters: [
    { who: 'jake', x: 0.5, feetY: ROOM_FLOOR_V },
    { who: 'teenager', x: 0.2, feetY: ROOM_FLOOR_V },
    { who: 'guestA', x: 0.82, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    // eyes dart: the head tilts left, then right, then left again
    const pj = pose('S20', 'jake', f, [
      { f: 0, p: { ...basePose, x: 960, y: standY(1.3, ROOM_FLOOR_V), scale: 1.3, ...STAND, headTilt: -6, expr: 'puzzled' } },
      { f: Math.round(len * 0.33), p: { ...basePose, x: 960, y: standY(1.3, ROOM_FLOOR_V), scale: 1.3, ...STAND, headTilt: 6, expr: 'puzzled' } },
      { f: Math.round(len * 0.66), p: { ...basePose, x: 960, y: standY(1.3, ROOM_FLOOR_V), scale: 1.3, ...STAND, headTilt: -6, expr: 'puzzled' } },
      { f: len, p: { ...basePose, x: 960, y: standY(1.3, ROOM_FLOOR_V), scale: 1.3, ...STAND, headTilt: 6, expr: 'puzzled' } },
    ]);
    const faceJ = faceAt(f, [[0, 'puzzled']]);
    return (
      <g>
        <g transform={camT(960, 480, 1.3)}>
          <CoffeeShop t={f} id="s20" />
          {Ped({ scene: 'S20', label: 'teen', x: 380, look: 'teenager', scale: 0.85, tag: '63', expr: 'neutral', yaw: 1 }, f, len)}
          {Ped({ scene: 'S20', label: 'oldman', x: 1580, look: 'guestA', scale: 0.85, tag: '19', expr: 'neutral', yaw: -1 }, f, len)}
          {footShadows(pj)}
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...pj, ...faceJ, facing: 1 }} rimId="rimR" shadow={0} showBrows />)}
        </g>
      </g>
    );
  },
});

// S21 — The teenager and the old man at the same table, talking. Their
// numbers glow: 63 and 19. Jake watches from the counter. Camera: slow pan.
defineScene({
  id: 'S21',
  durationSec: DUR.S21,
  characters: [
    { who: 'teenager', x: 0.72, feetY: ROOM_FLOOR_V },
    { who: 'guestA', x: 0.86, feetY: ROOM_FLOOR_V },
    { who: 'jake', x: 0.25, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    // both seated at the round table (table at x=1450 in the set) — the
    // teenager on the near chair, the old man on the far chair
    const pt = pose('S21', 'teenager', f, [
      { f: 0, p: { ...basePose, x: 1380, y: sitY(876, 0.95), scale: 0.95, ...SIT, yaw: 1, expr: 'neutral' } },
      { f: len, p: { ...basePose, x: 1380, y: sitY(876, 0.95), scale: 0.95, ...SIT, yaw: 1, expr: 'neutral' } },
    ]);
    const faceT = faceAt(f, [[0, 'neutral']]);
    const hct = headC(pt, 0.95);
    const po = pose('S21', 'oldman', f, [
      { f: 0, p: { ...basePose, x: 1580, y: sitY(876, 0.95), scale: 0.95, ...SIT, yaw: -1, headTilt: 4, expr: 'neutral' } },
      { f: len, p: { ...basePose, x: 1580, y: sitY(876, 0.95), scale: 0.95, ...SIT, yaw: -1, headTilt: 4, expr: 'neutral' } },
    ]);
    const faceO = faceAt(f, [[0, 'neutral']]);
    const hco = headC(po, 0.95);
    const pj = pose('S21', 'jake', f, [
      { f: 0, p: { ...basePose, x: 480, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, yaw: 1, expr: 'neutral' } },
      { f: len, p: { ...basePose, x: 480, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, yaw: 1, expr: 'neutral' } },
    ]);
    const faceJ = faceAt(f, [[0, 'neutral']]);
    const panX = 860 + (200 * f) / len;
    return (
      <g>
        <g transform={camT(panX, 560, 1.0)}>
          <CoffeeShop t={f} id="s21" />
          <OfficeChair x={1380} />
          {footShadows(pj)}
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...pj, ...faceJ, facing: 1 }} rimId="rimR" shadow={0} showBrows />)}
          {footShadows(pt)}
          {cast('teenager', <Hero slim look={LOOKS.teenager} pose={{ ...pt, ...faceT, facing: 1 }} rimId="rimR" shadow={0} showBrows />)}
          <Headphones x={hct.x} y={hct.y} s={0.95} />
          <AgeTag x={pt.x} y={ageTagY(pt.y, 0.95)} text="63" size={32} />
          <Cane x={po.x + 46} y={876} h={150} />
          {footShadows(po)}
          {cast('guestA', <Hero slim look={LOOKS.guestA} pose={{ ...po, ...faceO, facing: 1 }} rimId="rimR" shadow={0} showBrows />)}
          <WhiteHair x={hco.x} y={hco.y} s={0.95} />
          <AgeTag x={po.x} y={ageTagY(po.y, 0.95)} text="19" size={32} />
        </g>
      </g>
    );
  },
});

// S22 — Close-up on Jake, looking down at his coffee, sheepish. His eyes
// droop. Camera: hold still.
defineScene({
  id: 'S22',
  durationSec: DUR.S22,
  characters: [
    { who: 'jake', x: 0.5, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const pj = pose('S22', 'jake', f, [
      { f: 0, p: { ...basePose, x: 960, y: standY(1.25, ROOM_FLOOR_V), scale: 1.25, ...STAND, headTilt: 10, expr: 'sad' } },
      { f: len, p: { ...basePose, x: 960, y: standY(1.25, ROOM_FLOOR_V), scale: 1.25, ...STAND, headTilt: 10, expr: 'sad' } },
    ]);
    const faceJ = faceAt(f, [[0, 'sad']]);
    return (
      <g>
        <g transform={camT(960, 500, 1.25)}>
          <CoffeeShop t={f} id="s22" />
          {footShadows(pj)}
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...pj, ...faceJ, facing: 1 }} rimId="rimR" shadow={0} showBrows />)}
          {/* his coffee on the counter in front of him */}
          <rect x={1060} y={660} width={40} height={60} fill="#F6EFE3" stroke="#161616" strokeWidth={2} />
          <ellipse cx={1080} cy={664} rx={16} ry={6} fill="#3A2A1E" />
        </g>
      </g>
    );
  },
});

// S23 — Coffee shop, wide. The crowd moves around Jake, numbers bobbing. He
// stands still in the middle of it. Camera: slow push-in.
defineScene({
  id: 'S23',
  durationSec: DUR.S23,
  characters: [
    { who: 'jake', x: 0.5, feetY: ROOM_FLOOR_V },
    { who: 'guestA', x: 0.15, feetY: ROOM_FLOOR_V },
    { who: 'guestB', x: 0.3, feetY: ROOM_FLOOR_V },
    { who: 'guestC', x: 0.7, feetY: ROOM_FLOOR_V },
    { who: 'teacher', x: 0.85, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const pj = pose('S23', 'jake', f, [
      { f: 0, p: { ...basePose, x: 960, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, expr: 'neutral' } },
      { f: len, p: { ...basePose, x: 960, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, expr: 'neutral' } },
    ]);
    const faceJ = faceAt(f, [[0, 'neutral']]);
    const zoom = kf(f, [[0, 1.0], [len, 1.08]]);
    return (
      <g>
        <g transform={camT(960, 560, zoom)}>
          <CoffeeShop t={f} id="s23" />
          {Ped({ scene: 'S23', label: 'ped1', x: 280, look: 'guestA', scale: 0.9, tag: '41', expr: 'neutral', yaw: 1 }, f, len)}
          {Ped({ scene: 'S23', label: 'ped2', x: 560, look: 'guestB', scale: 0.95, tag: '28', expr: 'neutral', yaw: -1 }, f, len)}
          {Ped({ scene: 'S23', label: 'ped3', x: 1340, look: 'guestC', scale: 0.85, tag: '63', expr: 'neutral', yaw: 1 }, f, len)}
          {Ped({ scene: 'S23', label: 'ped4', x: 1640, look: 'teacher', scale: 0.95, tag: '19', expr: 'neutral', yaw: -1 }, f, len)}
          {footShadows(pj)}
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...pj, ...faceJ, facing: 1 }} rimId="rimR" shadow={0} showBrows />)}
        </g>
      </g>
    );
  },
});

// ===========================================================================
// CHAPTER 4 — THE JOB INTERVIEW
// ===========================================================================

// S24 — Office hallway, morning light. Jake walks toward a glass interview
// room. Two candidates wait on chairs, numbers glowing above them. Camera:
// slow push-in.
defineScene({
  id: 'S24',
  durationSec: DUR.S24,
  characters: [
    { who: 'jake', x: 0.3, feetY: ROOM_FLOOR_V },
    { who: 'guestC', x: 0.65, feetY: ROOM_FLOOR_V },
    { who: 'guestA', x: 0.82, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const pj = pose('S24', 'jake', f, [
      { f: 0, p: { ...basePose, x: 560, y: standY(1, ROOM_FLOOR_V), scale: 1, ...WALK, yaw: 1, expr: 'worried' } },
      { f: len, p: { ...basePose, x: 820, y: standY(1, ROOM_FLOOR_V), scale: 1, ...WALK, yaw: 1, expr: 'worried' } },
    ]);
    const faceJ = faceAt(f, [[0, 'worried']]);
    // the two candidates wait on chairs in the hallway, numbers glowing
    const pc1 = pose('S24', 'cand29', f, [
      { f: 0, p: { ...basePose, x: 1250, y: sitY(876, 1), scale: 1, ...SIT, yaw: -1, expr: 'neutral' } },
      { f: len, p: { ...basePose, x: 1250, y: sitY(876, 1), scale: 1, ...SIT, yaw: -1, expr: 'neutral' } },
    ]);
    const faceC1 = faceAt(f, [[0, 'neutral']]);
    const pc2 = pose('S24', 'cand54', f, [
      { f: 0, p: { ...basePose, x: 1580, y: sitY(876, 1), scale: 1, ...SIT, yaw: -1, headTilt: 4, expr: 'tired' } },
      { f: len, p: { ...basePose, x: 1580, y: sitY(876, 1), scale: 1, ...SIT, yaw: -1, headTilt: 4, expr: 'tired' } },
    ]);
    const faceC2 = faceAt(f, [[0, 'tired']]);
    const zoom = kf(f, [[0, 1.0], [len, 1.08]]);
    return (
      <g>
        <g transform={camT(960, 560, zoom)}>
          <OfficeDay t={f} id="s24" />
          <OfficeChair x={1250} flip />
          <OfficeChair x={1580} flip />
          {footShadows(pc1)}
          {cast('guestC', <Hero slim look={LOOKS.guestC} pose={{ ...pc1, ...faceC1, facing: 1 }} rimId="rimR" shadow={0} showBrows />)}
          <AgeTag x={pc1.x} y={ageTagY(pc1.y, 1)} text="29" size={32} />
          {footShadows(pc2)}
          {cast('guestA', <Hero slim look={LOOKS.guestA} pose={{ ...pc2, ...faceC2, facing: 1 }} rimId="rimR" shadow={0} showBrows />)}
          <AgeTag x={pc2.x} y={ageTagY(pc2.y, 1)} text="54" size={32} />
          {footShadows(pj)}
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...pj, ...faceJ, facing: 1 }} rimId="rimR" shadow={0} showBrows />)}
        </g>
      </g>
    );
  },
});

// S25 — Interview room. Two candidates sit across from the manager. Same
// posture, same folder on the table. One number reads 29, the other 54.
// Camera: hold still.
defineScene({
  id: 'S25',
  durationSec: DUR.S25,
  characters: [
    { who: 'guestC', x: 0.36, feetY: ROOM_FLOOR_V },
    { who: 'guestA', x: 0.64, feetY: ROOM_FLOOR_V },
    { who: 'hero', x: 0.5, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    // same posture, same folder — the candidates mirror each other
    const pc1 = pose('S25', 'cand29', f, [
      { f: 0, p: { ...basePose, x: 700, y: sitY(876, 1), scale: 1, ...SIT, yaw: 1, expr: 'neutral' } },
      { f: len, p: { ...basePose, x: 700, y: sitY(876, 1), scale: 1, ...SIT, yaw: 1, expr: 'neutral' } },
    ]);
    const faceC1 = faceAt(f, [[0, 'neutral']]);
    const pc2 = pose('S25', 'cand54', f, [
      { f: 0, p: { ...basePose, x: 1220, y: sitY(876, 1), scale: 1, ...SIT, yaw: -1, expr: 'neutral' } },
      { f: len, p: { ...basePose, x: 1220, y: sitY(876, 1), scale: 1, ...SIT, yaw: -1, expr: 'neutral' } },
    ]);
    const faceC2 = faceAt(f, [[0, 'neutral']]);
    // the manager across the table, between them
    const pg = pose('S25', 'manager', f, [
      { f: 0, p: { ...basePose, x: 960, y: sitY(876, 1), scale: 1, ...SIT, yaw: 0, expr: 'neutral' } },
      { f: len, p: { ...basePose, x: 960, y: sitY(876, 1), scale: 1, ...SIT, yaw: 0, expr: 'neutral' } },
    ]);
    const faceG = faceAt(f, [[0, 'neutral']]);
    return (
      <g>
        <g transform={camT(960, 560, 1.0)}>
          <InterviewRoom t={f} id="s25" />
          {footShadows(pc1)}
          {cast('guestC', <Hero slim look={LOOKS.guestC} pose={{ ...pc1, ...faceC1, facing: 1 }} rimId="rimR" shadow={0} showBrows />)}
          <AgeTag x={pc1.x} y={ageTagY(pc1.y, 1)} text="29" size={34} />
          {footShadows(pc2)}
          {cast('guestA', <Hero slim look={LOOKS.guestA} pose={{ ...pc2, ...faceC2, facing: 1 }} rimId="rimR" shadow={0} showBrows />)}
          <AgeTag x={pc2.x} y={ageTagY(pc2.y, 1)} text="54" size={34} />
          {footShadows(pg)}
          {cast('hero', <Hero slim look={LOOKS.hero} pose={{ ...pg, ...faceG, facing: 1 }} rimId="rimR" shadow={0} showBrows />)}
          <AgeTag x={pg.x} y={ageTagY(pg.y, 1)} text="58" size={30} />
        </g>
      </g>
    );
  },
});

// S26 — Close-up on the manager's face, eyes flicking between the two
// numbers. Papers on the desk. Cold office light. Camera: slow push-in.
defineScene({
  id: 'S26',
  durationSec: DUR.S26,
  characters: [
    { who: 'hero', x: 0.5, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    // eyes flick between the two numbers: head tilts left, then right
    const pg = pose('S26', 'manager', f, [
      { f: 0, p: { ...basePose, x: 960, y: standY(1.3, ROOM_FLOOR_V), scale: 1.3, ...STAND, headTilt: -6, expr: 'puzzled' } },
      { f: Math.round(len * 0.5), p: { ...basePose, x: 960, y: standY(1.3, ROOM_FLOOR_V), scale: 1.3, ...STAND, headTilt: 6, expr: 'puzzled' } },
      { f: len, p: { ...basePose, x: 960, y: standY(1.3, ROOM_FLOOR_V), scale: 1.3, ...STAND, headTilt: -6, expr: 'puzzled' } },
    ]);
    const faceG = faceAt(f, [[0, 'puzzled']]);
    const zoom = kf(f, [[0, 1.2], [len, 1.35]]);
    return (
      <g>
        <g transform={camT(960, 500, zoom)}>
          <InterviewRoom t={f} id="s26" />
          {/* the two numbers he is flicking between */}
          <AgeTag x={620} y={300} text="29" size={56} />
          <AgeTag x={1300} y={300} text="54" size={56} />
          {footShadows(pg)}
          {cast('hero', <Hero slim look={LOOKS.hero} pose={{ ...pg, ...faceG, facing: 1 }} rimId="rimR" shadow={0} showBrows />)}
        </g>
      </g>
    );
  },
});

// S27 — Interview room, wide. The Detective peeks from behind a tall filing
// cabinet at the far-left edge, half hidden, watching. Camera: slow pan.
defineScene({
  id: 'S27',
  durationSec: DUR.S27,
  characters: [
    { who: 'detective', x: 0.06, feetY: ROOM_FLOOR_V },
    { who: 'guestC', x: 0.36, feetY: ROOM_FLOOR_V },
    { who: 'guestA', x: 0.64, feetY: ROOM_FLOOR_V },
    { who: 'hero', x: 0.5, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const pc1 = pose('S27', 'cand29', f, [
      { f: 0, p: { ...basePose, x: 700, y: sitY(876, 1), scale: 1, ...SIT, yaw: 1, expr: 'neutral' } },
      { f: len, p: { ...basePose, x: 700, y: sitY(876, 1), scale: 1, ...SIT, yaw: 1, expr: 'neutral' } },
    ]);
    const faceC1 = faceAt(f, [[0, 'neutral']]);
    const pc2 = pose('S27', 'cand54', f, [
      { f: 0, p: { ...basePose, x: 1220, y: sitY(876, 1), scale: 1, ...SIT, yaw: -1, expr: 'neutral' } },
      { f: len, p: { ...basePose, x: 1220, y: sitY(876, 1), scale: 1, ...SIT, yaw: -1, expr: 'neutral' } },
    ]);
    const faceC2 = faceAt(f, [[0, 'neutral']]);
    const pg = pose('S27', 'manager', f, [
      { f: 0, p: { ...basePose, x: 960, y: sitY(876, 1), scale: 1, ...SIT, yaw: 0, expr: 'neutral' } },
      { f: len, p: { ...basePose, x: 960, y: sitY(876, 1), scale: 1, ...SIT, yaw: 0, expr: 'neutral' } },
    ]);
    const faceG = faceAt(f, [[0, 'neutral']]);
    const panX = 860 + (200 * f) / len;
    return (
      <g>
        <g transform={camT(panX, 560, 1.0)}>
          <InterviewRoom t={f} id="s27" />
          {footShadows(pc1)}
          {cast('guestC', <Hero slim look={LOOKS.guestC} pose={{ ...pc1, ...faceC1, facing: 1 }} rimId="rimR" shadow={0} showBrows />)}
          <AgeTag x={pc1.x} y={ageTagY(pc1.y, 1)} text="29" size={34} />
          {footShadows(pc2)}
          {cast('guestA', <Hero slim look={LOOKS.guestA} pose={{ ...pc2, ...faceC2, facing: 1 }} rimId="rimR" shadow={0} showBrows />)}
          <AgeTag x={pc2.x} y={ageTagY(pc2.y, 1)} text="54" size={34} />
          {footShadows(pg)}
          {cast('hero', <Hero slim look={LOOKS.hero} pose={{ ...pg, ...faceG, facing: 1 }} rimId="rimR" shadow={0} showBrows />)}
          {DetectiveCameo({ scene: 'S27', label: 'detective', x: 110, f, len, magnifier: null, expr: 'neutral' })}
          <FilingCabinet x={60} />
        </g>
      </g>
    );
  },
});

// S28 — The two candidates shake hands with the manager. The 29 glows
// bright, the 54 glows dimmer in the cold light. Jake watches through the
// glass. Camera: hold still.
defineScene({
  id: 'S28',
  durationSec: DUR.S28,
  characters: [
    { who: 'guestC', x: 0.36, feetY: ROOM_FLOOR_V },
    { who: 'guestA', x: 0.64, feetY: ROOM_FLOOR_V },
    { who: 'hero', x: 0.5, feetY: ROOM_FLOOR_V },
    { who: 'jake', x: 0.88, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    // both candidates standing now, shaking the manager's hand in turn
    const pc1 = pose('S28', 'cand29', f, [
      { f: 0, p: { ...basePose, x: 700, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, armR: { a: 50, b: 20 }, handR: 'open', yaw: 1, expr: 'happy' } },
      { f: len, p: { ...basePose, x: 700, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, armR: { a: 50, b: 20 }, handR: 'open', yaw: 1, expr: 'happy' } },
    ]);
    const faceC1 = faceAt(f, [[0, 'happy']]);
    const pc2 = pose('S28', 'cand54', f, [
      { f: 0, p: { ...basePose, x: 1220, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, armR: { a: 50, b: 20 }, handR: 'open', yaw: -1, expr: 'tired' } },
      { f: len, p: { ...basePose, x: 1220, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, armR: { a: 50, b: 20 }, handR: 'open', yaw: -1, expr: 'tired' } },
    ]);
    const faceC2 = faceAt(f, [[0, 'tired']]);
    const pg = pose('S28', 'manager', f, [
      { f: 0, p: { ...basePose, x: 960, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, armR: { a: 50, b: 20 }, handR: 'open', yaw: 0, expr: 'smug' } },
      { f: len, p: { ...basePose, x: 960, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, armR: { a: 50, b: 20 }, handR: 'open', yaw: 0, expr: 'smug' } },
    ]);
    const faceG = faceAt(f, [[0, 'smug']]);
    const pj = pose('S28', 'jake', f, [
      { f: 0, p: { ...basePose, x: 1700, y: standY(0.9, ROOM_FLOOR_V), scale: 0.9, ...STAND, yaw: -1, expr: 'worried' } },
      { f: len, p: { ...basePose, x: 1700, y: standY(0.9, ROOM_FLOOR_V), scale: 0.9, ...STAND, yaw: -1, expr: 'worried' } },
    ]);
    const faceJ = faceAt(f, [[0, 'worried']]);
    return (
      <g>
        <g transform={camT(960, 560, 1.0)}>
          <InterviewRoom t={f} id="s28" />
          {footShadows(pc1)}
          {cast('guestC', <Hero slim look={LOOKS.guestC} pose={{ ...pc1, ...faceC1, facing: 1 }} rimId="rimR" shadow={0} showBrows />)}
          <AgeTag x={pc1.x} y={ageTagY(pc1.y, 1)} text="29" size={34} o={1} />
          {footShadows(pc2)}
          {cast('guestA', <Hero slim look={LOOKS.guestA} pose={{ ...pc2, ...faceC2, facing: 1 }} rimId="rimR" shadow={0} showBrows />)}
          <AgeTag x={pc2.x} y={ageTagY(pc2.y, 1)} text="54" size={34} o={0.45} />
          {footShadows(pg)}
          {cast('hero', <Hero slim look={LOOKS.hero} pose={{ ...pg, ...faceG, facing: 1 }} rimId="rimR" shadow={0} showBrows />)}
          {footShadows(pj)}
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...pj, ...faceJ, facing: 1 }} rimId="rimR" shadow={0} showBrows />)}
        </g>
      </g>
    );
  },
});

// S29 — Close-up on Jake's face through the glass, eyes wide, brows up. The
// interview room glows cold behind him. Camera: slow push-in.
defineScene({
  id: 'S29',
  durationSec: DUR.S29,
  characters: [
    { who: 'jake', x: 0.5, feetY: ROOM_FLOOR_V },
    { who: 'guestC', x: 0.25, feetY: ROOM_FLOOR_V },
    { who: 'guestA', x: 0.75, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const pj = pose('S29', 'jake', f, [
      { f: 0, p: { ...basePose, x: 960, y: standY(1.3, ROOM_FLOOR_V), scale: 1.3, ...STAND, expr: 'shock' } },
      { f: len, p: { ...basePose, x: 960, y: standY(1.3, ROOM_FLOOR_V), scale: 1.3, ...STAND, expr: 'shock' } },
    ]);
    const faceJ = faceAt(f, [[0, 'shock']]);
    const zoom = kf(f, [[0, 1.2], [len, 1.35]]);
    return (
      <g>
        <g transform={camT(960, 500, zoom)}>
          <InterviewRoom t={f} id="s29" />
          {Ped({ scene: 'S29', label: 'cand29', x: 480, look: 'guestC', scale: 0.85, tag: '29', expr: 'happy', yaw: 1 }, f, len)}
          {Ped({ scene: 'S29', label: 'cand54', x: 1440, look: 'guestA', scale: 0.85, tag: '54', tagO: 0.45, expr: 'tired', yaw: -1 }, f, len)}
          {footShadows(pj)}
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...pj, ...faceJ, facing: 1 }} rimId="rimR" shadow={0} showBrows />)}
        </g>
      </g>
    );
  },
});

// S30 — Hallway, Jake walking away from the interview room, head down. The
// numbers of passing workers glow pink. Camera: slow pan.
defineScene({
  id: 'S30',
  durationSec: DUR.S30,
  characters: [
    { who: 'jake', x: 0.45, feetY: ROOM_FLOOR_V },
    { who: 'guestA', x: 0.15, feetY: ROOM_FLOOR_V },
    { who: 'guestB', x: 0.75, feetY: ROOM_FLOOR_V },
    { who: 'guestC', x: 0.88, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const pj = pose('S30', 'jake', f, [
      { f: 0, p: { ...basePose, x: 1100, y: standY(1, ROOM_FLOOR_V), scale: 1, ...WALK, yaw: -1, headTilt: 8, expr: 'sad' } },
      { f: len, p: { ...basePose, x: 820, y: standY(1, ROOM_FLOOR_V), scale: 1, ...WALK, yaw: -1, headTilt: 8, expr: 'sad' } },
    ]);
    const faceJ = faceAt(f, [[0, 'sad']]);
    const panX = 1060 - (200 * f) / len;
    return (
      <g>
        <g transform={camT(panX, 560, 1.0)}>
          <OfficeDay t={f} id="s30" />
          {Ped({ scene: 'S30', label: 'ped1', x: 280, look: 'guestA', scale: 0.9, tag: '36', expr: 'neutral', yaw: 1 }, f, len)}
          {Ped({ scene: 'S30', label: 'ped2', x: 1440, look: 'guestB', scale: 0.95, tag: '48', expr: 'neutral', yaw: -1 }, f, len)}
          {Ped({ scene: 'S30', label: 'ped3', x: 1700, look: 'guestC', scale: 0.9, tag: '59', expr: 'neutral', yaw: 1 }, f, len)}
          {footShadows(pj)}
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...pj, ...faceJ, facing: 1 }} rimId="rimR" shadow={0} showBrows />)}
        </g>
      </g>
    );
  },
});

// ===========================================================================
// CHAPTER 5 — THE MIRROR
// ===========================================================================

// S31 — Jake's apartment, evening. He stands in front of the bathroom
// mirror. His number glows pink above his head. Warm lamp light. Camera:
// slow push-in.
defineScene({
  id: 'S31',
  durationSec: DUR.S31,
  characters: [
    { who: 'jake', x: 0.5, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const pj = pose('S31', 'jake', f, [
      { f: 0, p: { ...basePose, x: 960, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, headTilt: 3, expr: 'neutral' } },
      { f: len, p: { ...basePose, x: 960, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, headTilt: 3, expr: 'neutral' } },
    ]);
    const faceJ = faceAt(f, [[0, 'neutral']]);
    const zoom = kf(f, [[0, 1.1], [len, 1.25]]);
    return (
      <g>
        <g transform={camT(960, 520, zoom)}>
          <Bathroom t={f} mode="evening" id="s31" />
          <defs>
            <clipPath id="s31mirror"><rect x={676} y={156} width={568} height={488} /></clipPath>
          </defs>
          <g clipPath="url(#s31mirror)" opacity={0.3}>
            {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...pj, ...faceJ, facing: 1 }} rimId="rimBlue" shadow={0} showBrows />)}
            <AgeTag x={pj.x} y={ageTagY(pj.y, 1)} text="27" size={44} o={0.9} />
          </g>
          {footShadows(pj)}
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...pj, ...faceJ, facing: 1 }} rimId="rimR" shadow={0} showBrows />)}
          <AgeTag x={pj.x} y={ageTagY(pj.y, 1)} text="27" size={44} />
        </g>
      </g>
    );
  },
});

// S32 — Close-up on Jake's face in the mirror, eyes on his own number. His
// brows furrow, then soften. Camera: hold still.
defineScene({
  id: 'S32',
  durationSec: DUR.S32,
  characters: [
    { who: 'jake', x: 0.5, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const pj = pose('S32', 'jake', f, [
      { f: 0, p: { ...basePose, x: 960, y: standY(1.3, ROOM_FLOOR_V), scale: 1.3, ...STAND, headTilt: -4, expr: 'worried' } },
      { f: len, p: { ...basePose, x: 960, y: standY(1.3, ROOM_FLOOR_V), scale: 1.3, ...STAND, headTilt: -4, expr: 'worried' } },
    ]);
    // brows furrow, then soften: worried -> neutral across the scene
    const faceJ = faceAt(f, [[0, 'worried'], [Math.round(len * 0.65), 'neutral']]);
    return (
      <g>
        <g transform={camT(960, 500, 1.3)}>
          <Bathroom t={f} mode="evening" id="s32" />
          <defs>
            <clipPath id="s32mirror"><rect x={676} y={156} width={568} height={488} /></clipPath>
          </defs>
          <g clipPath="url(#s32mirror)" opacity={0.3}>
            {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...pj, ...faceJ, facing: 1 }} rimId="rimBlue" shadow={0} showBrows />)}
            <AgeTag x={pj.x} y={ageTagY(pj.y, 1.3)} text="27" size={56} o={0.9} />
          </g>
          {footShadows(pj)}
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...pj, ...faceJ, facing: 1 }} rimId="rimR" shadow={0} showBrows />)}
          <AgeTag x={pj.x} y={ageTagY(pj.y, 1.3)} text="27" size={56} />
        </g>
      </g>
    );
  },
});

// S33 — Jake sits on the edge of his bed, looking at his hands. His number
// glows softly above him. The room is dim, one warm lamp. Camera: slow pan.
defineScene({
  id: 'S33',
  durationSec: DUR.S33,
  characters: [
    { who: 'jake', x: 0.62, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    // seated on the bed edge (bed edge at x=1140–1640, seat line y=787) —
    // front-facing, hands in his lap, looking down at them
    const pj = pose('S33', 'jake', f, [
      { f: 0, p: { ...basePose, x: 1290, y: sitY(876, 1), scale: 1, ...SIT_FRONT, armL: { a: 30, b: 40 }, armR: { a: 30, b: 40 }, headTilt: 10, expr: 'sad' } },
      { f: len, p: { ...basePose, x: 1290, y: sitY(876, 1), scale: 1, ...SIT_FRONT, armL: { a: 30, b: 40 }, armR: { a: 30, b: 40 }, headTilt: 10, expr: 'sad' } },
    ]);
    const faceJ = faceAt(f, [[0, 'sad']]);
    const panX = 860 + (200 * f) / len;
    return (
      <g>
        <g transform={camT(panX, 560, 1.0)}>
          <BedroomSet t={f} id="s33" />
          {footShadows(pj)}
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...pj, ...faceJ, facing: 1 }} rimId="rimR" shadow={0} showBrows />)}
          <AgeTag x={pj.x} y={ageTagY(pj.y, 1)} text="27" size={32} o={0.8} />
        </g>
      </g>
    );
  },
});

// S34 — Close-up on Jake, eyes wide, a small disbelieving laugh. His number
// glows pink. Camera: hold still.
defineScene({
  id: 'S34',
  durationSec: DUR.S34,
  characters: [
    { who: 'jake', x: 0.5, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const pj = pose('S34', 'jake', f, [
      { f: 0, p: { ...basePose, x: 960, y: standY(1.3, ROOM_FLOOR_V), scale: 1.3, ...STAND, headTilt: -5, expr: 'shock' } },
      { f: len, p: { ...basePose, x: 960, y: standY(1.3, ROOM_FLOOR_V), scale: 1.3, ...STAND, headTilt: -5, expr: 'shock' } },
    ]);
    // wide eyes, then the small laugh breaks through
    const faceJ = faceAt(f, [[0, 'shock'], [Math.round(len * 0.55), 'happy']]);
    return (
      <g>
        <g transform={camT(960, 500, 1.3)}>
          <BedroomSet t={f} id="s34" />
          {footShadows(pj)}
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...pj, ...faceJ, facing: 1 }} rimId="rimR" shadow={0} showBrows />)}
          <AgeTag x={pj.x} y={ageTagY(pj.y, 1.3)} text="27" size={56} />
        </g>
      </g>
    );
  },
});

// S35 — Jake looks at his reflection, hand on his chin, thinking hard. The
// mirror glows warm. Camera: slow push-in.
defineScene({
  id: 'S35',
  durationSec: DUR.S35,
  characters: [
    { who: 'jake', x: 0.5, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const pj = pose('S35', 'jake', f, [
      { f: 0, p: { ...basePose, x: 960, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, armR: { a: 95, b: 85 }, handR: 'open', headTilt: 5, expr: 'puzzled' } },
      { f: len, p: { ...basePose, x: 960, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, armR: { a: 95, b: 85 }, handR: 'open', headTilt: 5, expr: 'puzzled' } },
    ]);
    const faceJ = faceAt(f, [[0, 'puzzled']]);
    const zoom = kf(f, [[0, 1.15], [len, 1.3]]);
    return (
      <g>
        <g transform={camT(960, 520, zoom)}>
          <Bathroom t={f} mode="evening" id="s35" />
          <defs>
            <clipPath id="s35mirror"><rect x={676} y={156} width={568} height={488} /></clipPath>
          </defs>
          <g clipPath="url(#s35mirror)" opacity={0.3}>
            {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...pj, ...faceJ, facing: 1 }} rimId="rimBlue" shadow={0} showBrows />)}
            <AgeTag x={pj.x} y={ageTagY(pj.y, 1)} text="27" size={44} o={0.9} />
          </g>
          {footShadows(pj)}
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...pj, ...faceJ, facing: 1 }} rimId="rimR" shadow={0} showBrows />)}
          <AgeTag x={pj.x} y={ageTagY(pj.y, 1)} text="27" size={44} />
        </g>
      </g>
    );
  },
});

// S36 — Flashback office shot: Maya at her desk, her number 47 glowing,
// quietly fixing a report. Jake's voice carries over the memory. Camera:
// slow pan. A warm veil marks the memory (flashback, not the present).
defineScene({
  id: 'S36',
  durationSec: DUR.S36,
  characters: [
    { who: 'guestB', x: 0.17, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const pm = pose('S36', 'maya', f, [
      { f: 0, p: { ...basePose, x: 320, y: sitY(876, 1), scale: 1, ...SIT, armR: { a: 40, b: 30 }, armL: { a: 40, b: 30 }, yaw: 1, headTilt: 6, expr: 'tired' } },
      { f: len, p: { ...basePose, x: 320, y: sitY(876, 1), scale: 1, ...SIT, armR: { a: 40, b: 30 }, armL: { a: 40, b: 30 }, yaw: 1, headTilt: 6, expr: 'tired' } },
    ]);
    const faceM = faceAt(f, [[0, 'tired']]);
    const panX = 860 + (200 * f) / len;
    return (
      <g>
        <g transform={camT(panX, 560, 1.0)}>
          <OfficeDay t={f} id="s36" />
          {footShadows(pm)}
          {cast('guestB', <Hero slim look={LOOKS.guestB} pose={{ ...pm, ...faceM, facing: 1 }} rimId="rimR" shadow={0} showBrows />)}
          <AgeTag x={pm.x} y={ageTagY(pm.y, 1)} text="47" size={30} />
          {/* the warm flashback veil — a memory, not the present */}
          <rect x={0} y={0} width={1920} height={1080} fill="#FFD9A0" opacity={0.1} />
          <Glow x={960} y={400} r={700} o={0.25} />
        </g>
      </g>
    );
  },
});

// S37 — Jake stands up from the bed, straightens, eyes determined. His
// number still glows, but he looks past it. Camera: slow push-in. The one
// real movement of the chapter: SIT_FRONT -> STAND over the first 60 frames,
// then hold.
defineScene({
  id: 'S37',
  durationSec: DUR.S37,
  characters: [
    { who: 'jake', x: 0.62, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const pj = pose('S37', 'jake', f, [
      { f: 0, p: { ...basePose, x: 1290, y: sitY(876, 1), scale: 1, ...SIT_FRONT, armL: { a: 30, b: 40 }, armR: { a: 30, b: 40 }, headTilt: 10, expr: 'sad' } },
      { f: 60, p: { ...basePose, x: 1290, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, headTilt: 0, expr: 'determined' } },
      { f: len, p: { ...basePose, x: 1290, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, headTilt: 0, expr: 'determined' } },
    ]);
    const faceJ = faceAt(f, [[0, 'sad'], [60, 'determined']]);
    const zoom = kf(f, [[0, 1.0], [len, 1.08]]);
    return (
      <g>
        <g transform={camT(960, 560, zoom)}>
          <BedroomSet t={f} id="s37" />
          {footShadows(pj)}
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...pj, ...faceJ, facing: 1 }} rimId="rimR" shadow={0} showBrows />)}
          <AgeTag x={pj.x} y={ageTagY(pj.y, 1)} text="27" size={32} />
        </g>
      </g>
    );
  },
});

// ===========================================================================
// CHAPTER 6 — THE FADE
// ===========================================================================

// S38 — Sunset street, wide. Jake walks home as the sun goes down. The pink
// numbers above the crowd begin to flicker and fade, one by one. Warm orange
// light. Camera: slow push-in. Each tag fades at its own time.
defineScene({
  id: 'S38',
  durationSec: DUR.S38,
  characters: [
    { who: 'jake', x: 0.45, feetY: ROOM_FLOOR_V },
    { who: 'guestA', x: 0.12, feetY: ROOM_FLOOR_V },
    { who: 'guestB', x: 0.28, feetY: ROOM_FLOOR_V },
    { who: 'guestC', x: 0.72, feetY: ROOM_FLOOR_V },
    { who: 'teacher', x: 0.88, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const pj = pose('S38', 'jake', f, [
      { f: 0, p: { ...basePose, x: 800, y: standY(1, ROOM_FLOOR_V), scale: 1, ...WALK, yaw: 1, expr: 'neutral' } },
      { f: len, p: { ...basePose, x: 1100, y: standY(1, ROOM_FLOOR_V), scale: 1, ...WALK, yaw: 1, expr: 'neutral' } },
    ]);
    const faceJ = faceAt(f, [[0, 'neutral']]);
    const zoom = kf(f, [[0, 1.0], [len, 1.08]]);
    // each tag fades out at its own moment, with a flicker on the way down
    const fade = (start: number) => {
      const p = clamp((f - start) / 60, 0, 1);
      const flick = p > 0 && p < 1 ? 0.5 + 0.5 * Math.sin(f * 0.9) : 1;
      return (1 - p) * flick;
    };
    return (
      <g>
        <g transform={camT(960, 560, zoom)}>
          <CityStreet t={f} mode="dusk" id="s38" />
          {Ped({ scene: 'S38', label: 'ped1', x: 230, look: 'guestA', scale: 0.9, tag: '31', tagO: fade(60), expr: 'neutral', yaw: -1 }, f, len)}
          {Ped({ scene: 'S38', label: 'ped2', x: 520, look: 'guestB', scale: 0.95, tag: '58', tagO: fade(140), expr: 'neutral', yaw: 1 }, f, len)}
          {Ped({ scene: 'S38', label: 'ped3', x: 1400, look: 'guestC', scale: 0.85, tag: '14', tagO: fade(220), expr: 'neutral', yaw: -1 }, f, len)}
          {Ped({ scene: 'S38', label: 'ped4', x: 1700, look: 'teacher', scale: 0.95, tag: '47', tagO: fade(300), expr: 'neutral', yaw: 1 }, f, len)}
          {footShadows(pj)}
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...pj, ...faceJ, facing: 1 }} rimId="rimR" shadow={0} showBrows />)}
        </g>
      </g>
    );
  },
});

// S39 — The jogger passes, number gone. The woman with the dog, number gone.
// Maya crosses the street, number gone. Jake watches, eyes soft. Camera:
// slow pan.
defineScene({
  id: 'S39',
  durationSec: DUR.S39,
  characters: [
    { who: 'jake', x: 0.5, feetY: ROOM_FLOOR_V },
    { who: 'guestC', x: 0.2, feetY: ROOM_FLOOR_V },
    { who: 'teacher', x: 0.62, feetY: ROOM_FLOOR_V },
    { who: 'guestB', x: 0.85, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const pj = pose('S39', 'jake', f, [
      { f: 0, p: { ...basePose, x: 960, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, yaw: 1, expr: 'neutral' } },
      { f: len, p: { ...basePose, x: 960, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, yaw: 1, expr: 'neutral' } },
    ]);
    const faceJ = faceAt(f, [[0, 'neutral']]);
    // the jogger — mid-stride, translating, NO tag any more
    const pjo = pose('S39', 'jogger', f, [
      { f: 0, p: { ...basePose, x: 300, y: standY(0.95, ROOM_FLOOR_V), scale: 0.95, ...WALK, yaw: 1, expr: 'neutral' } },
      { f: len, p: { ...basePose, x: 620, y: standY(0.95, ROOM_FLOOR_V), scale: 0.95, ...WALK, yaw: 1, expr: 'neutral' } },
    ]);
    const faceJo = faceAt(f, [[0, 'neutral']]);
    const panX = 860 + (200 * f) / len;
    return (
      <g>
        <g transform={camT(panX, 560, 1.0)}>
          <CityStreet t={f} mode="dusk" id="s39" />
          {footShadows(pjo)}
          {cast('guestC', <Hero slim look={LOOKS.guestC} pose={{ ...pjo, ...faceJo, facing: 1 }} rimId="rimR" shadow={0} showBrows />)}
          {Ped({ scene: 'S39', label: 'woman', x: 1200, look: 'teacher', scale: 0.95, expr: 'neutral', yaw: -1 }, f, len)}
          <Dog x={1290} y={876} s={0.8} />
          {Ped({ scene: 'S39', label: 'maya', x: 1640, look: 'guestB', scale: 0.95, expr: 'neutral', yaw: -1 }, f, len)}
          {footShadows(pj)}
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...pj, ...faceJ, facing: 1 }} rimId="rimR" shadow={0} showBrows />)}
        </g>
      </g>
    );
  },
});

// S40 — Sunset street, Jake at the center, looking around at the
// now-numberless crowd. The Detective stands at the far-right edge, half
// hidden behind a lamppost, giving a small nod. Camera: hold still.
defineScene({
  id: 'S40',
  durationSec: DUR.S40,
  characters: [
    { who: 'jake', x: 0.5, feetY: ROOM_FLOOR_V },
    { who: 'detective', x: 0.88, feetY: ROOM_FLOOR_V },
    { who: 'guestA', x: 0.18, feetY: ROOM_FLOOR_V },
    { who: 'guestC', x: 0.8, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const pj = pose('S40', 'jake', f, [
      { f: 0, p: { ...basePose, x: 960, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, yaw: 1, headTilt: 4, expr: 'neutral' } },
      { f: len, p: { ...basePose, x: 960, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, yaw: -1, headTilt: -4, expr: 'neutral' } },
    ]);
    const faceJ = faceAt(f, [[0, 'neutral']]);
    return (
      <g>
        <g transform={camT(960, 560, 1.0)}>
          <CityStreet t={f} mode="dusk" id="s40" />
          {Ped({ scene: 'S40', label: 'ped1', x: 340, look: 'guestA', scale: 0.9, expr: 'neutral', yaw: 1 }, f, len)}
          {Ped({ scene: 'S40', label: 'ped2', x: 1540, look: 'guestC', scale: 0.9, expr: 'neutral', yaw: -1 }, f, len)}
          {footShadows(pj)}
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...pj, ...faceJ, facing: 1 }} rimId="rimR" shadow={0} showBrows />)}
          {DetectiveCameo({ scene: 'S40', label: 'detective', x: 1700, f, len, magnifier: null, expr: 'neutral', nod: true })}
          {/* foreground lamppost in front of the Detective — he hides behind it */}
          <g>
            <rect x={1744} y={640} width={10} height={236} fill="#2A2530" />
            <circle cx={1749} cy={636} r={14} fill="#FFD39A" />
            <GlowDisc cx={1749} cy={636} r={120} color="#FFD39A" o={0.6} />
            <ellipse cx={1749} cy={880} rx={130} ry={14} fill="#FFD39A" opacity={0.3} />
          </g>
        </g>
      </g>
    );
  },
});

// S41 — Close-up on Jake's face in the sunset light, eyes thoughtful, brows
// level. The last pink number fades out above a passing stranger. Camera:
// slow push-in.
defineScene({
  id: 'S41',
  durationSec: DUR.S41,
  characters: [
    { who: 'jake', x: 0.5, feetY: ROOM_FLOOR_V },
    { who: 'guestA', x: 0.82, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const pj = pose('S41', 'jake', f, [
      { f: 0, p: { ...basePose, x: 960, y: standY(1.3, ROOM_FLOOR_V), scale: 1.3, ...STAND, expr: 'neutral' } },
      { f: len, p: { ...basePose, x: 960, y: standY(1.3, ROOM_FLOOR_V), scale: 1.3, ...STAND, expr: 'neutral' } },
    ]);
    const faceJ = faceAt(f, [[0, 'neutral']]);
    const zoom = kf(f, [[0, 1.25], [len, 1.4]]);
    // the last number fades out across the scene
    const lastO = 1 - clamp(f / (len * 0.8), 0, 1);
    return (
      <g>
        <g transform={camT(960, 480, zoom)}>
          <CityStreet t={f} mode="dusk" id="s41" />
          {Ped({ scene: 'S41', label: 'stranger', x: 1580, look: 'guestA', scale: 0.9, tag: '45', tagO: lastO, expr: 'neutral', yaw: -1 }, f, len)}
          {footShadows(pj)}
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...pj, ...faceJ, facing: 1 }} rimId="rimR" shadow={0} showBrows />)}
        </g>
      </g>
    );
  },
});

// S42 — Wide sunset shot. Jake walks into the orange light, the street warm
// and golden behind him. No numbers anywhere. Camera: slow push-in.
defineScene({
  id: 'S42',
  durationSec: DUR.S42,
  characters: [
    { who: 'jake', x: 0.45, feetY: ROOM_FLOOR_V },
    { who: 'guestA', x: 0.15, feetY: ROOM_FLOOR_V },
    { who: 'guestB', x: 0.85, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const pj = pose('S42', 'jake', f, [
      { f: 0, p: { ...basePose, x: 700, y: standY(1, ROOM_FLOOR_V), scale: 1, ...WALK, yaw: 1, expr: 'neutral' } },
      { f: len, p: { ...basePose, x: 1050, y: standY(1, ROOM_FLOOR_V), scale: 1, ...WALK, yaw: 1, expr: 'neutral' } },
    ]);
    const faceJ = faceAt(f, [[0, 'neutral']]);
    const zoom = kf(f, [[0, 1.0], [len, 1.1]]);
    return (
      <g>
        <g transform={camT(960, 560, zoom)}>
          <CityStreet t={f} mode="dusk" id="s42" />
          {Ped({ scene: 'S42', label: 'ped1', x: 280, look: 'guestA', scale: 0.9, expr: 'neutral', yaw: 1 }, f, len)}
          {Ped({ scene: 'S42', label: 'ped2', x: 1640, look: 'guestB', scale: 0.95, expr: 'neutral', yaw: -1 }, f, len)}
          {footShadows(pj)}
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...pj, ...faceJ, facing: 1 }} rimId="rimR" shadow={0} showBrows />)}
        </g>
      </g>
    );
  },
});

// ===========================================================================
// CLOSE
// ===========================================================================

// S43 — Jake faces the camera, front-facing, eyes wide and steady. The sunset
// glows warm behind him. No number above his head. Camera: slow push-in, hold.
defineScene({
  id: 'S43',
  durationSec: DUR.S43,
  characters: [
    { who: 'jake', x: 0.5, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const pj = pose('S43', 'jake', f, [
      { f: 0, p: { ...basePose, x: 960, y: standY(1.2, ROOM_FLOOR_V), scale: 1.2, ...STAND, expr: 'shock' } },
      { f: len, p: { ...basePose, x: 960, y: standY(1.2, ROOM_FLOOR_V), scale: 1.2, ...STAND, expr: 'shock' } },
    ]);
    const faceJ = faceAt(f, [[0, 'shock']]);
    const zoom = kf(f, [[0, 1.2], [len, 1.35]]);
    return (
      <g>
        <g transform={camT(960, 520, zoom)}>
          <CityStreet t={f} mode="dusk" id="s43" />
          {footShadows(pj)}
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...pj, ...faceJ, facing: 1 }} rimId="rimR" shadow={0} showBrows />)}
          {/* NO number above Jake — nothing. */}
        </g>
      </g>
    );
  },
});

// S44 — End card: Inkl logo + "Curiosity. Explained." + Subscribe button.
// Final shot, no verbal ask.
defineScene({
  id: 'S44',
  durationSec: DUR.S44,
  characters: [],
  fn: (api) => {
    const f = F(api);
    return (
      <g>
        <g transform={camT(960, 540, 1.0)}>
          <EndCard />
          {/* hot-pink halo on the logo */}
          <GlowDisc cx={960} cy={400} r={320} color={PINK} o={0.22} />
        </g>
      </g>
    );
  },
});

// ---------------------------------------------------------------------------
// Registry helpers — the timeline is DERIVED from these durations, never
// hand-written.
// ---------------------------------------------------------------------------

export const zenn011Scenes = (): SceneDef[] =>
  getScenes().filter((s) => s.id !== 'S53-example' && /^S\d+$/.test(s.id));

export const zenn011Timeline = (fps = FPS) => {
  let frame = 0;
  return zenn011Scenes().map((s) => {
    const len = Math.round(s.durationSec * fps);
    const shot = { id: s.id, first: frame, len, durationSec: s.durationSec };
    frame += len;
    return shot;
  });
};

export const zenn011TotalSec = () => zenn011Scenes().reduce((sum, s) => sum + s.durationSec, 0);

// Adapter: a scene def becomes an episode Shot (ShotProps clock in frames).
export const sceneToShot = (def: SceneDef): React.FC<ShotProps> => {
  const Shot: React.FC<ShotProps> = ({ t, len }) => {
    setCurrentScene(def.id);
    const floorY = def.characters[0]?.feetY ?? ROOM_FLOOR_V;
    return def.fn({ t: t / FPS, duration: def.durationSec, floorY, frame: t, fps: FPS });
  };
  return Shot;
};

export const zenn011Shots = (): Record<string, React.FC<ShotProps>> => {
  const out: Record<string, React.FC<ShotProps>> = {};
  for (const def of zenn011Scenes()) out[def.id] = sceneToShot(def);
  return out;
};

export { guardScene, guardNoIdleFlap, countReversals, totalDurationSec } from '../../engine/sceneBuilder';
