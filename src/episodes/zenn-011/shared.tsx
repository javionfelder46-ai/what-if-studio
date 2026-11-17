// "What If Everyone's True Age Was Written on Their Face?" — video #8,
// episode zenn-011. 43 narrative beats + end card, each its own sealed scene
// function with a set duration (modular scene build, Nov 14).
//
// DURATIONS ARE PLACEHOLDER: ~14s per beat until the Archer VO exists;
// re-time exactly from the alignment then. Total 18,180 frames (606s).
//
// LOOK (locked, rule book + script header): Jake + every other person are
// BLACK SILHOUETTES — round solid black heads, black torsos/limbs, white oval
// eyes (no pupils) + brows that change with the mood of each beat, no mouth
// when silent. Moonlight blue glow on edges at night, warm rim light in
// sunlight — never removed. Detective: slate-blue deerstalker v6 + slate
// jacket + white shirt + dark tie, moonlight blue rim, background pop-up
// ONLY (S8, S15, S27, S40), never a host. Jake: plain red shirt #C0392B,
// BALD, no glasses. Accent: hot pink #EC4899 — the AGE NUMBERS glow hot pink
// above every head, a sparse highlight on the numbers ONLY. Never on
// characters/glow.
//
// NO SIMPLE CODE (Nov 16, Javion — rule book): these scenes ARE the board.
// Every panel renders through this rig, never through a drawing script. Each
// scene is a full world — detailed, atmospheric, cinematic — with visible
// light sources + pools of light, haze/glow, and the characters on-model.
// Flat solid fills alone do not match the reference. Match the painterly dusk
// look: gradient skies, warm light, atmosphere (Miko style, approved Nov 15).
//
// Sets reused from zenn-009's pattern (copied here, not imported — importing
// zenn-009/scenes would double-register its S1–S43 scene ids): CityStreet.
// New sets built the same way: Bathroom (morning/evening), OfficeDay,
// InterviewRoom, CoffeeShop, BedroomSet.
//
// MOVEMENT (fluent, Nov 14): one movement at a time, a move spans >=15
// frames, hold >=0.5s after it lands, head leads / body follows. Standing
// poses repeat IDENTICAL arm/look values at every key (0 reversals). look
// stays 0 unless the beat names a look; eyes never dart.
//
// MUSIC: "The Descent" by Kevin MacLeod, 0.03 looped (not needed for stills).

import React from 'react';
import {
  Hero, basePose, poseAt, faceAt, kf, camT, lerp, clamp, LOOKS,
  FONT, MOONLIGHT, ShotProps, joints, toWorld, Magnifier,
  RealDefs, WindowShaft, AtmoHaze, Vignette, GlowDisc, SoftShadow, Dust,
  Glow, LightVeil, Cone,
} from '../../engine';
import type { CastName, Expr, Limb, Pose, Look } from '../../engine/rig';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const FPS = 30;
export const PINK = '#EC4899'; // video #8 accent — the age numbers ONLY
export const CREAM = '#F6EFE3';
export const INK = '#161616';
// Floor lines (v coordinate, 0..1 in the 1920x1080 world). Street/park/room
// sets: feet at 876 -> v = 0.811. Slim build: hip height at scale 1 is 876 - 158 = 718.
export const ROOM_FLOOR_V = 0.811;
export const FLOOR_PX = 876;
/** Hip y (px) for a character of `scale` standing with feet on floor v. Slim leg length 158. */
export const standY = (scale: number, floorV: number) => floorV * 1080 - 158 * scale;
/** Hip y for a SEATED character whose feet plant on the ground: hip sits one
    shin below the seat line; the SIT angles (a=82, b=-82) drop the foot to
    hip + 89, overlapping the ground. */
export const sitY = (floorYPx: number, scale = 1) => floorYPx - 89 * scale;
/** Tag centre y above a character's head: head centre is 188px above the hip
    (slim build), head top a further 54px; the tag hangs 55px above that. */
export const ageTagY = (hipY: number, scale = 1) => hipY - 242 * scale - 55;
/** Head centre (x, y) for a posed character — props that sit on the head
    (white hair, headphones) anchor here. Head r = 54 * scale. */
export const headC = (p: Pose, scale = 1) => ({ x: p.x, y: p.y - 188 * scale });

// ---------------------------------------------------------------------------
// Guard instrumentation — every pose call is logged so the build-time check
// script can run guardNoIdleFlap on the real key arrays, and every rendered
// Hero is logged so guardDeclaredCharacters can run on the real cast.
// ---------------------------------------------------------------------------

export type KeyLog = { scene: string; label: string; armLa: number[]; armLb: number[]; armRa: number[]; armRb: number[]; look: number[] };
export const KEYS_LOG: KeyLog[] = [];
export const CAST_LOG: Record<string, string[]> = {};
let currentScene = '';
export const setCurrentScene = (id: string) => { currentScene = id; };
type PoseKey = { f: number; p: Partial<typeof basePose> };
export function pose(scene: string, label: string, f: number, keys: PoseKey[]) {
  const armLa = keys.map((k) => (k.p.armL ?? basePose.armL).a);
  const armLb = keys.map((k) => (k.p.armL ?? basePose.armL).b);
  const armRa = keys.map((k) => (k.p.armR ?? basePose.armR).a);
  const armRb = keys.map((k) => (k.p.armR ?? basePose.armR).b);
  const look = keys.map((k) => k.p.look ?? 0);
  if (!KEYS_LOG.some((e) => e.scene === scene && e.label === label)) {
    KEYS_LOG.push({ scene, label, armLa, armLb, armRa, armRb, look });
  }
  return poseAt(f, keys as never);
}
/** Render a Hero and log who appeared, for guardDeclaredCharacters. */
export const cast = (who: string, el: React.ReactElement) => {
  const log = CAST_LOG[currentScene] ?? (CAST_LOG[currentScene] = []);
  if (!log.includes(who)) log.push(who);
  return el;
};

// ---------------------------------------------------------------------------
// Pose catalog — fixed poses, reused everywhere. Never invent a pose inside a
// shot; pick from the catalog and hold it.
// ---------------------------------------------------------------------------

export const STAND = { armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 }, look: 0, headTilt: 0, tilt: 0 };
// SIT — the rig's shin angle is RELATIVE (a2 = a + b), so a vertical shin needs
// a + b = 0. {a:82, b:-82}: thigh slopes 8 deg below horizontal, shin perfectly
// vertical, foot lands at hip + 89 — overlapping the ground, never hovering.
// Rule: seated feet must OVERLAP the ground, not just touch the floor line.
export const SIT = { armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 82, b: -82 }, legR: { a: 82, b: -82 }, look: 0, headTilt: 0, tilt: 0 };
// SIT_FRONT — a seated character FACING THE CAMERA. Front-facing thighs point
// AT the camera, so they are foreshortened: thighScale 0.4 draws the thigh at
// 32px, and the legs splay SYMMETRICALLY (legL a=-70, legR a=+70, shins
// vertical via b=∓70) so the knees/feet sit evenly either side of the body.
// Verified with joints(): knee at (±52, 11), foot at (±52, 89). Use for any
// seated character facing the viewer. NEVER "fix" a front-torso twist by
// turning the character to profile — face them at the camera and match the
// legs to the torso.
export const SIT_FRONT = { armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: -70, b: 70 }, legR: { a: 70, b: -70 }, look: 0, headTilt: 0, tilt: 0, thighScale: 0.4 };
// WALK — a held mid-stride pose (one leg forward, one back) that translates
// across the frame. The rig draws walking as a pose + translation, never as
// animated legs: the stride never cycles, so it cannot read as a treadmill.
export const WALK = { armL: { a: 18, b: 12 }, armR: { a: -14, b: 12 }, legL: { a: 28, b: -18 }, legR: { a: -22, b: 24 }, look: 0, headTilt: 0, tilt: 0 };

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

/** The signature element: a glowing hot-pink age number floating above a
    head. No pill, no box — the number itself glows, with a tight halo behind
    it so it reads as lit, never as a flat label.
    READABILITY FIX (Nov 17, Dash): the wide-shot numbers rendered small,
    thin and faint — small digits lost inside a big diffuse glow, nearly
    illegible on a phone. The numbers ARE the concept (script S1: "in big
    glowing numbers, right above their head"), so two things changed:
    (1) small tags scale up ~1.7x — Ped defaults ~26–29 and direct 26–34
    become 44–58. Tags already >= 40 (close-ups: S2's 44, 48–72) are left
    EXACTLY as they are — S2's "27" reads fine and must not move.
    (2) the digits are bold for real now. Fragment Mono only has a 400 face
    loaded, so the old fontWeight 700 rendered thin; Bricolage Grotesque 800
    is a real loaded heavy face. A dark plum outline separates the digits
    from bright sets and from their own glow, and the glow discs are tight
    halos hugging the digits instead of a big blob that swallows them. */
export const AgeTag: React.FC<{ x: number; y: number; text: string; size?: number; o?: number }> = ({ x, y, text, size = 34, o = 1 }) => {
  const effSize = size >= 40 ? size : Math.round(size * 1.7);
  const w = Math.round(text.length * effSize * 0.62);
  return (
    <g opacity={o}>
      <GlowDisc cx={x} cy={y} r={Math.round(w * 0.45 + effSize * 0.3)} color={PINK} o={0.35} />
      <GlowDisc cx={x} cy={y} r={Math.round(w * 0.3 + effSize * 0.2)} color={PINK} o={0.28} />
      <text x={x} y={y + effSize * 0.36} textAnchor="middle" fontFamily={FONT.title} fontSize={effSize} fontWeight={800} fill="#2A0A18" stroke="#2A0A18" strokeWidth={effSize * 0.22} strokeLinejoin="round" paintOrder="stroke">{text}</text>
      <text x={x} y={y + effSize * 0.36} textAnchor="middle" fontFamily={FONT.title} fontSize={effSize} fontWeight={800} fill={PINK}>{text}</text>
    </g>
  );
};

/** Contact shadows exactly under each foot, from the real joint positions. */
export const footShadows = (p: Pose) => {
  const j = joints(p, true);
  const footL = { x: p.x + j.legL.end.x, y: p.y + j.legL.end.y + 11 };
  const footR = { x: p.x + j.legR.end.x, y: p.y + j.legR.end.y + 11 };
  return (
    <>
      <ellipse cx={footL.x} cy={footL.y + 2} rx={20} ry={6} fill="#000" opacity={0.35} />
      <ellipse cx={footR.x} cy={footR.y + 2} rx={20} ry={6} fill="#000" opacity={0.35} />
    </>
  );
};

/** A background pedestrian: a real Hero in a guest look (natural hair, colored
    shirt — never a clone of Jake), standing on the floor with an age tag.
    Used for the crowd scenes. The scene must declare every pedestrian's
    `who` in its characters list. */
export type PedOpts = {
  scene: string; label: string; x: number; look: CastName; scale?: number;
  tag?: string; tagO?: number; expr?: Expr; yaw?: number; headTilt?: number;
  armL?: Limb; armR?: Limb; phone?: boolean; tagSize?: number;
};
export const Ped = (o: PedOpts, f: number, len: number) => {
  const s = o.scale ?? 1;
  const p = pose(o.scene, o.label, f, [
    { f: 0, p: { ...basePose, x: o.x, y: standY(s, ROOM_FLOOR_V), scale: s, ...STAND, yaw: o.yaw ?? 0, headTilt: o.headTilt ?? 0, expr: o.expr ?? 'neutral', ...(o.armL ? { armL: o.armL } : {}), ...(o.armR ? { armR: o.armR } : {}) } },
    { f: len, p: { ...basePose, x: o.x, y: standY(s, ROOM_FLOOR_V), scale: s, ...STAND, yaw: o.yaw ?? 0, headTilt: o.headTilt ?? 0, expr: o.expr ?? 'neutral', ...(o.armL ? { armL: o.armL } : {}), ...(o.armR ? { armR: o.armR } : {}) } },
  ]);
  const face = faceAt(f, [[0, o.expr ?? 'neutral']]);
  const hand = o.phone ? toWorld(p, joints(p, true).armR.end) : null;
  return (
    <g key={o.label}>
      {footShadows(p)}
      {cast(o.look, <Hero slim look={LOOKS[o.look]} pose={{ ...p, ...face, facing: 1 }} rimId="rimR" shadow={0} showBrows />)}
      {o.phone && hand ? (
        <g>
          <rect x={hand.x - 9} y={hand.y - 34} width={18} height={34} rx={4} fill="#161616" stroke="#3A3E4A" strokeWidth={2} />
          <rect x={hand.x - 6} y={hand.y - 30} width={12} height={26} rx={2} fill="#8FD3FF" opacity={0.85} />
        </g>
      ) : null}
      {o.tag ? <AgeTag x={p.x} y={ageTagY(p.y, s)} text={o.tag} size={o.tagSize ?? Math.max(20, Math.round(30 * s))} o={o.tagO ?? 1} /> : null}
    </g>
  );
};

/** The Detective's background cameo — small (scale 0.5), at the frame edge,
    half-hidden behind a prop the scene draws AFTER him. Magnifier down by
    default (S8); pass magnifier="up" to raise it. Never front-and-center,
    never the subject. */
export type CameoOpts = {
  scene: string; label: string; x: number; f: number; len: number;
  magnifier?: 'down' | 'up' | null; expr?: Expr; nod?: boolean;
};
export const DetectiveCameo = (o: CameoOpts) => {
  const armR = o.magnifier === 'up' ? { a: 100, b: 45 } : o.magnifier === 'down' ? { a: 55, b: 30 } : { a: 4, b: 8 };
  const keys: PoseKey[] = o.nod
    ? [
      { f: 0, p: { ...basePose, x: o.x, y: standY(0.5, ROOM_FLOOR_V), scale: 0.5, ...STAND, armR, handR: 'open', headTilt: 0, expr: o.expr ?? 'neutral' } },
      { f: Math.round(o.len * 0.4), p: { ...basePose, x: o.x, y: standY(0.5, ROOM_FLOOR_V), scale: 0.5, ...STAND, armR, handR: 'open', headTilt: 7, expr: o.expr ?? 'neutral' } },
      { f: Math.round(o.len * 0.7), p: { ...basePose, x: o.x, y: standY(0.5, ROOM_FLOOR_V), scale: 0.5, ...STAND, armR, handR: 'open', headTilt: 0, expr: o.expr ?? 'neutral' } },
      { f: o.len, p: { ...basePose, x: o.x, y: standY(0.5, ROOM_FLOOR_V), scale: 0.5, ...STAND, armR, handR: 'open', headTilt: 0, expr: o.expr ?? 'neutral' } },
    ]
    : [
      { f: 0, p: { ...basePose, x: o.x, y: standY(0.5, ROOM_FLOOR_V), scale: 0.5, ...STAND, armR, handR: 'open', headTilt: -6, expr: o.expr ?? 'neutral' } },
      { f: o.len, p: { ...basePose, x: o.x, y: standY(0.5, ROOM_FLOOR_V), scale: 0.5, ...STAND, armR, handR: 'open', headTilt: -6, expr: o.expr ?? 'neutral' } },
    ];
  const pd = pose(o.scene, o.label, o.f, keys);
  const faceD = faceAt(o.f, [[0, o.expr ?? 'neutral']]);
  const hd = toWorld(pd, joints(pd, true).armR.end);
  return (
    <g key={o.label}>
      {footShadows(pd)}
      {cast('detective', <Hero slim look={LOOKS.detective} pose={{ ...pd, ...faceD, facing: 1 }} rimId="rimBlue" shadow={1} showBrows />)}
      {o.magnifier ? <Magnifier x={hd.x} y={hd.y} s={0.7} /> : null}
    </g>
  );
};

// ---------------------------------------------------------------------------
// Small props — drawn in-scene, anchored to real joint/head positions.
// ---------------------------------------------------------------------------

/** White hair cap for the old man (S19–S21): a white dome over the top of
    the head + side wisps. Anchored to the real head centre. */
export const WhiteHair: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -54 6 A 54 54 0 0 1 54 6 L 46 -6 A 46 46 0 0 0 -46 -6 Z" fill="#E8E4DA" />
    <path d="M -54 6 Q -58 26 -44 30 Q -50 12 -54 6 Z" fill="#E8E4DA" />
    <path d="M 54 6 Q 58 26 44 30 Q 50 12 54 6 Z" fill="#E8E4DA" />
    <circle cx={-20} cy={-46} r={10} fill="#E8E4DA" opacity={0.9} />
    <circle cx={14} cy={-50} r={9} fill="#E8E4DA" opacity={0.9} />
  </g>
);

/** Headphones over the teenager's head (S17–S18): band + two ear cups. */
export const Headphones: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} stroke="#161616" strokeWidth={7} fill="none" strokeLinecap="round">
    <path d="M -56 4 A 56 56 0 0 1 56 4" />
    <rect x={-66} y={-6} width={22} height={34} rx={9} fill="#161616" stroke="#3A3E4A" strokeWidth={3} />
    <rect x={44} y={-6} width={22} height={34} rx={9} fill="#161616" stroke="#3A3E4A" strokeWidth={3} />
  </g>
);

/** A walking cane (S19–S21): shaft + curved handle, planted on the floor. */
export const Cane: React.FC<{ x: number; y: number; h?: number }> = ({ x, y, h = 150 }) => (
  <g stroke="#5A4632" strokeWidth={7} fill="none" strokeLinecap="round">
    <path d={`M ${x} ${y} L ${x} ${y - h}`} />
    <path d={`M ${x} ${y - h} Q ${x} ${y - h - 18} ${x + 18} ${y - h - 12}`} />
  </g>
);

/** A skateboard under a foot (S6, S17): deck + two wheels. */
export const Skateboard: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-46} y={-8} width={92} height={12} rx={6} fill="#3E8C86" stroke="#161616" strokeWidth={3} />
    <circle cx={-28} cy={8} r={7} fill="#161616" />
    <circle cx={28} cy={8} r={7} fill="#161616" />
  </g>
);

/** A small dog on a lead (S6, S39): body, head, ears, tail, legs. */
export const Dog: React.FC<{ x: number; y: number; s?: number; flip?: boolean }> = ({ x, y, s = 1, flip = false }) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
    <ellipse cx={0} cy={-14} rx={34} ry={16} fill="#6A4A2E" />
    <circle cx={32} cy={-30} r={15} fill="#6A4A2E" />
    <path d="M 24 -42 L 20 -58 L 32 -46 Z" fill="#4A3226" />
    <path d="M 38 -42 L 44 -58 L 46 -44 Z" fill="#4A3226" />
    <circle cx={37} cy={-32} r={2.4} fill="#161616" />
    <circle cx={46} cy={-24} r={4} fill="#161616" />
    <path d="M -32 -18 Q -48 -30 -44 -44" stroke="#6A4A2E" strokeWidth={6} fill="none" strokeLinecap="round" />
    <line x1={-18} y1={0} x2={-18} y2={12} stroke="#6A4A2E" strokeWidth={6} strokeLinecap="round" />
    <line x1={18} y1={0} x2={18} y2={12} stroke="#6A4A2E" strokeWidth={6} strokeLinecap="round" />
    <line x1={-8} y1={0} x2={-8} y2={12} stroke="#6A4A2E" strokeWidth={6} strokeLinecap="round" />
    <line x1={8} y1={0} x2={8} y2={12} stroke="#6A4A2E" strokeWidth={6} strokeLinecap="round" />
  </g>
);

/** A small pigeon on the ground (street scenes). */
export const Pigeon: React.FC<{ x: number; y: number; s?: number; flip?: boolean }> = ({ x, y, s = 1, flip = false }) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
    <ellipse cx={0} cy={0} rx={16} ry={10} fill="#3A3446" />
    <circle cx={13} cy={-8} r={7} fill="#3A3446" />
    <circle cx={15} cy={-9} r={1.6} fill="#F6EFE3" />
    <path d="M 19 -9 L 25 -7 L 19 -5 Z" fill="#C85A46" />
    <line x1={-6} y1={9} x2={-6} y2={15} stroke="#C85A46" strokeWidth={2} />
    <line x1={4} y1={9} x2={4} y2={15} stroke="#C85A46" strokeWidth={2} />
  </g>
);

// ---------------------------------------------------------------------------
// Backdrops — full worlds, not empty walls. Every set carries: a gradient sky
// with a visible light source, buildings/trees in three depths, lit windows,
// a streetlamp or window with a real pool of light, haze + dust. Ground at
// y=876 (feet plant here).
// ---------------------------------------------------------------------------

/** The city street — morning/day, dusk, or night. Gradient sky, sun or moon
    with a real glow, skyline in three depths with lit windows, storefronts
    with awnings, streetlamps with warm pools on the pavement, crosswalk,
    trees, haze. Used by S1, S3, S6–S9, S38–S42. */
export const CityStreet: React.FC<{ t: number; mode?: 'day' | 'dusk' | 'night'; id?: string }> = ({ t, mode = 'day', id = 'cs' }) => {
  const skyTop = mode === 'day' ? '#3D6FB8' : mode === 'dusk' ? '#241F4A' : '#0B0816';
  const skyMid = mode === 'day' ? '#7AAEDD' : mode === 'dusk' ? '#6E3A5E' : '#1B2340';
  const skyBot = mode === 'day' ? '#F6D9A0' : mode === 'dusk' ? '#FF9A3D' : '#2A3355';
  const sunX = mode === 'night' ? 1560 : 1420;
  const sunY = mode === 'dusk' ? 560 : 300;
  const sunC = mode === 'day' ? '#FFE9A8' : mode === 'dusk' ? '#FF9A3D' : '#E8EEF7';
  const sunR = mode === 'dusk' ? 90 : 62;
  return (
    <g>
      <defs>
        <linearGradient id={`${id}sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={skyTop} />
          <stop offset="55%" stopColor={skyMid} />
          <stop offset="100%" stopColor={skyBot} />
        </linearGradient>
        <linearGradient id={`${id}pave`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={mode === 'night' ? '#3A3440' : '#8A8296'} />
          <stop offset="100%" stopColor={mode === 'night' ? '#241F2A' : '#6E6878'} />
        </linearGradient>
        <linearGradient id={`${id}road`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2E2A33" />
          <stop offset="100%" stopColor="#17141C" />
        </linearGradient>
      </defs>
      <rect x={0} y={0} width={1920} height={880} fill={`url(#${id}sky)`} />
      {/* the light source — sun or moon — with a real glow */}
      <Glow x={sunX} y={sunY} r={mode === 'dusk' ? 640 : 520} o={mode === 'night' ? 0.5 : 0.85} />
      <GlowDisc cx={sunX} cy={sunY} r={sunR + 90} color={sunC} o={0.55} />
      <circle cx={sunX} cy={sunY} r={sunR} fill={sunC} opacity={0.98} />
      {/* warm horizon band where the sun's light pools on the sky */}
      <ellipse cx={sunX} cy={820} rx={900} ry={90} fill={mode === 'day' ? '#FFE2B0' : mode === 'dusk' ? '#FF9A3D' : '#2A3355'} opacity={mode === 'night' ? 0.12 : 0.35} />
      {mode === 'night' ? <circle cx={sunX - 22} cy={sunY - 14} r={12} fill="#C8D2E4" opacity={0.5} /> : null}
      {/* clouds, drifting slowly */}
      <g fill="#FFFFFF" opacity={mode === 'day' ? 0.75 : mode === 'dusk' ? 0.4 : 0.12}>
        <ellipse cx={((t * 0.4 + 300) % 2200) - 140} cy={150} rx={130} ry={26} />
        <ellipse cx={((t * 0.4 + 300) % 2200) - 110} cy={140} rx={80} ry={18} opacity={0.7} />
        <ellipse cx={((t * 0.3 + 900) % 2200) - 140} cy={210} rx={100} ry={20} />
        <ellipse cx={((t * 0.3 + 900) % 2200) - 110} cy={200} rx={60} ry={14} opacity={0.7} />
        <ellipse cx={((t * 0.5 + 1600) % 2200) - 140} cy={110} rx={150} ry={30} />
        <ellipse cx={((t * 0.5 + 1600) % 2200) - 100} cy={100} rx={90} ry={20} opacity={0.7} />
      </g>
      {/* birds — life in the sky */}
      <g stroke={mode === 'day' ? '#3A4A6A' : '#1E2438'} strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.7}>
        <path d={`M ${((t * 0.8 + 400) % 2200) - 140} 260 q 10 -10 20 0 q 10 -10 20 0`} />
        <path d={`M ${((t * 0.8 + 900) % 2200) - 140} 300 q 8 -8 16 0 q 8 -8 16 0`} />
        <path d={`M ${((t * 0.8 + 1500) % 2200) - 140} 230 q 10 -10 20 0 q 10 -10 20 0`} />
      </g>
      {/* skyline, far depth — hazy silhouettes */}
      <g fill={mode === 'day' ? '#7E93B5' : mode === 'dusk' ? '#4A3A63' : '#1E2438'} opacity={0.85}>
        <rect x={-40} y={420} width={260} height={460} />
        <rect x={240} y={360} width={200} height={520} />
        <rect x={480} y={450} width={300} height={430} />
        <rect x={820} y={380} width={220} height={500} />
        <rect x={1080} y={440} width={280} height={440} />
        <rect x={1400} y={360} width={220} height={520} />
        <rect x={1660} y={430} width={300} height={450} />
      </g>
      {/* haze band at the base of the far skyline — atmospheric perspective */}
      <rect x={0} y={780} width={1920} height={100} fill={mode === 'day' ? '#C8D9E8' : mode === 'dusk' ? '#5A4A6E' : '#232A44'} opacity={0.5} />
      {/* rooftop details on the far skyline — water towers, antennas, beacon */}
      <g fill={mode === 'day' ? '#6E83A5' : mode === 'dusk' ? '#3E3255' : '#181E30'} opacity={0.9}>
        <rect x={300} y={320} width={8} height={40} />
        <rect x={296} y={312} width={16} height={10} />
        <circle cx={560} cy={428} r={22} />
        <rect x={552} y={446} width={16} height={14} />
        <path d="M 538 428 L 560 406 L 582 428 Z" />
        <rect x={896} y={340} width={8} height={40} />
        <rect x={892} y={332} width={16} height={10} />
        <rect x={1470} y={320} width={8} height={40} />
        <circle cx={1474} cy={312} r={6} fill="#FF9A3D" opacity={0.9} />
      </g>
      {/* skyline, mid depth — lit windows */}
      <g fill={mode === 'day' ? '#5A6E8F' : mode === 'dusk' ? '#33284A' : '#141A2C'}>
        <rect x={60} y={520} width={220} height={360} />
        <rect x={330} y={470} width={190} height={410} />
        <rect x={560} y={540} width={240} height={340} />
        <rect x={900} y={480} width={210} height={400} />
        <rect x={1180} y={530} width={230} height={350} />
        <rect x={1500} y={480} width={200} height={400} />
        <rect x={1740} y={540} width={200} height={340} />
      </g>
      {[90, 130, 170, 210, 250, 360, 400, 440, 480, 590, 630, 670, 710, 930, 970, 1010, 1050, 1210, 1250, 1290, 1330, 1530, 1570, 1610, 1650, 1770, 1810, 1850, 1890].map((x, i) => {
        const y = 500 + (i % 4) * 46;
        const lit = i % 2 === 0 && mode !== 'day';
        return (
          <g key={i}>
            {lit ? <GlowDisc cx={x + 10} cy={y + 14} r={26} color="#FFD39A" o={0.5} /> : null}
            <rect x={x} y={y} width={20} height={28} fill={lit ? '#FFD39A' : mode === 'day' ? '#C8D9E8' : '#3A4A6A'} opacity={lit ? 0.95 : mode === 'day' ? 0.6 : 0.7} />
            <rect x={x} y={y} width={20} height={4} fill="#FFFFFF" opacity={0.25} />
          </g>
        );
      })}
      {/* near depth — a brick building with a storefront + awning, left; a
          glass-front shop, right. These are the street's foreground. */}
      <g>
        <rect x={-20} y={600} width={420} height={276} fill="#4A3440" stroke="#241A26" strokeWidth={5} />
        {[640, 690, 740, 790].map((y) => (
          <path key={y} d={`M -20 ${y} L 400 ${y}`} stroke="#3A2832" strokeWidth={2} opacity={0.7} />
        ))}
        <rect x={30} y={660} width={120} height={150} fill={mode === 'day' ? '#BFD9E8' : '#FFD39A'} opacity={0.9} stroke="#241A26" strokeWidth={4} />
        <path d="M 90 660 L 90 810 M 30 735 L 150 735" stroke="#241A26" strokeWidth={4} />
        <polygon points="20,640 400,640 380,600 40,600" fill="#C0392B" stroke="#241A26" strokeWidth={3} />
        <text x={210} y={632} textAnchor="middle" fontFamily={FONT.ui} fontSize={22} fill="#F6EFE3">CORNER SHOP</text>
        <rect x={1560} y={620} width={380} height={256} fill="#2E2A3A" stroke="#241A26" strokeWidth={5} />
        <rect x={1590} y={660} width={320} height={140} fill={mode === 'day' ? '#A8CBE8' : '#3A4A6A'} opacity={0.9} stroke="#241A26" strokeWidth={4} />
        <path d="M 1750 660 L 1750 800 M 1590 730 L 1910 730" stroke="#241A26" strokeWidth={4} />
        <polygon points="1560,650 1940,650 1920,612 1580,612" fill="#3E8C86" stroke="#241A26" strokeWidth={3} />
        {mode !== 'day' ? (
          <g>
            <GlowDisc cx={1750} cy={700} r={80} color="#FF6A9A" o={0.5} />
            <text x={1750} y={708} textAnchor="middle" fontFamily={FONT.ui} fontSize={26} fontWeight={700} fill="#FF9AB8">OPEN</text>
          </g>
        ) : null}
        {mode !== 'day' ? <GlowDisc cx={90} cy={735} r={100} color="#FFD39A" o={0.4} /> : null}
      </g>
      {/* trees — layered foliage, sunlit side, dappled light below */}
      <g>
        <rect x={700} y={700} width={16} height={176} fill="#3A2A1E" />
        <rect x={704} y={700} width={5} height={176} fill="#5A4632" opacity={0.8} />
        <circle cx={708} cy={660} r={70} fill={mode === 'day' ? '#4A7A44' : '#2E4A2E'} />
        <circle cx={660} cy={700} r={46} fill={mode === 'day' ? '#5A8A54' : '#38583A'} />
        <circle cx={758} cy={700} r={46} fill={mode === 'day' ? '#557F4E' : '#334F34'} />
        <circle cx={748} cy={640} r={34} fill={mode === 'day' ? '#6A9A64' : '#3E5A3A'} />
        <circle cx={672} cy={676} r={26} fill={mode === 'day' ? '#6A9A64' : '#3E5A3A'} />
        <rect x={1300} y={720} width={14} height={156} fill="#3A2A1E" />
        <rect x={1303} y={720} width={4} height={156} fill="#5A4632" opacity={0.8} />
        <circle cx={1307} cy={686} r={58} fill={mode === 'day' ? '#4A7A44' : '#2E4A2E'} />
        <circle cx={1270} cy={716} r={38} fill={mode === 'day' ? '#5A8A54' : '#38583A'} />
        <circle cx={1336} cy={668} r={28} fill={mode === 'day' ? '#6A9A64' : '#3E5A3A'} />
        {/* dappled light spots on the pavement under the trees */}
        <ellipse cx={708} cy={882} rx={90} ry={8} fill="#FFE9A8" opacity={mode === 'day' ? 0.3 : 0.1} />
        <ellipse cx={660} cy={884} rx={40} ry={5} fill="#FFE9A8" opacity={mode === 'day' ? 0.25 : 0.08} />
        <ellipse cx={1307} cy={882} rx={70} ry={7} fill="#FFE9A8" opacity={mode === 'day' ? 0.3 : 0.1} />
      </g>
      {/* pavement + road — slab joints, a puddle, fallen leaves */}
      <rect x={0} y={876} width={1920} height={84} fill={`url(#${id}pave)`} />
      {[160, 400, 640, 880, 1120, 1360, 1600, 1840].map((x) => (
        <path key={x} d={`M ${x} 876 L ${x - 12} 960`} stroke="#5A5468" strokeWidth={2} opacity={0.6} />
      ))}
      {/* puddle reflecting the sky + a sun glint */}
      <ellipse cx={1050} cy={930} rx={130} ry={12} fill="#A8CBE8" opacity={mode === 'day' ? 0.55 : 0.25} />
      <ellipse cx={1050} cy={930} rx={130} ry={12} fill="none" stroke="#D9ECF7" strokeWidth={2} opacity={0.5} />
      <ellipse cx={1000} cy={928} rx={36} ry={4} fill="#FFE9A8" opacity={mode === 'day' ? 0.8 : 0.3} />
      {/* fallen leaves */}
      <ellipse cx={240} cy={900} rx={9} ry={5} fill="#C85A46" opacity={0.8} transform="rotate(-20 240 900)" />
      <ellipse cx={520} cy={920} rx={9} ry={5} fill="#F2C94C" opacity={0.8} transform="rotate(30 520 920)" />
      <ellipse cx={1500} cy={906} rx={9} ry={5} fill="#C85A46" opacity={0.8} transform="rotate(10 1500 906)" />
      <ellipse cx={1780} cy={924} rx={9} ry={5} fill="#F2C94C" opacity={0.8} transform="rotate(-35 1780 924)" />
      <path d="M 0 920 L 1920 920" stroke="#2A2530" strokeWidth={3} opacity={0.7} />
      <rect x={0} y={960} width={1920} height={120} fill={`url(#${id}road)`} />
      <path d="M 0 1020 L 1920 1020" stroke="#F6EFE3" strokeWidth={4} strokeDasharray="46 30" opacity={0.5} />
      {/* crosswalk stripes */}
      {[180, 300, 420, 540, 660, 780, 900, 1020, 1140, 1260, 1380, 1500, 1620, 1740].map((x) => (
        <rect key={x} x={x} y={968} width={56} height={104} fill="#F6EFE3" opacity={0.28} />
      ))}
      {/* streetlamps with warm pools of light + visible cones */}
      {[300, 1620].map((x) => (
        <g key={x}>
          <rect x={x - 5} y={640} width={10} height={236} fill="#2A2530" />
          <circle cx={x} cy={636} r={14} fill="#FFD39A" />
          <GlowDisc cx={x} cy={636} r={120} color="#FFD39A" o={0.6} />
          <polygon points={`${x - 12},644 ${x + 12},644 ${x + 90},880 ${x - 90},880`} fill="#FFD39A" opacity={0.1} />
          <ellipse cx={x} cy={880} rx={130} ry={14} fill="#FFD39A" opacity={0.3} />
        </g>
      ))}
      {/* warm sun pool on the pavement, sun side */}
      <ellipse cx={1500} cy={884} rx={340} ry={16} fill="#FFE2B0" opacity={mode === 'day' ? 0.28 : mode === 'dusk' ? 0.2 : 0.06} />
      <RealDefs p={`${id}r`} palette={mode === 'night' ? 'night' : 'day'} />
      <AtmoHaze color={mode === 'day' ? '#A8CBE8' : '#2A2A55'} o={0.08} />
      <Dust t={t} seed={9} x0={1100} y0={260} w={500} h={320} n={36} o={0.5} />
      <Vignette p={`${id}r`} o={mode === 'day' ? 0.55 : 0.75} />
    </g>
  );
};

/** The bathroom — tiled wall, a big mirror with a warm light bar above it, a
    sink, a towel, a small window. The mirror is drawn empty here; the scene
    draws the reflection inside it (clip rect 676,156,568x488 — keep these
    coordinates). Morning: warm cream tiles, sun in the window, bright.
    Evening: warm lamp light, amber dim. Used by S2, S4, S5, S31, S32, S35. */
export const Bathroom: React.FC<{ t: number; mode?: 'morning' | 'evening'; id?: string }> = ({ t, mode = 'morning', id = 'ba' }) => {
  const wallTop = mode === 'morning' ? '#F2E3C8' : '#3E3A52';
  const wallBot = mode === 'morning' ? '#D9BE96' : '#2A2438';
  const tileLine = mode === 'morning' ? '#C8B090' : '#3A3450';
  const floorC = mode === 'morning' ? '#8A6A4A' : '#2E2A3A';
  const skyC = mode === 'morning' ? '#A8CBE8' : '#2A2A55';
  const sunC = mode === 'morning' ? '#FFE9A8' : '#E8EEF7';
  return (
    <g>
      <RealDefs p={`${id}r`} palette={mode === 'morning' ? 'day' : 'night'} />
      <defs>
        <linearGradient id={`${id}wall`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={wallTop} />
          <stop offset="100%" stopColor={wallBot} />
        </linearGradient>
      </defs>
      <rect x={0} y={0} width={1920} height={876} fill={`url(#${id}wall)`} />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <path key={i} d={`M 0 ${140 + i * 120} L 1920 ${140 + i * 120}`} stroke={tileLine} strokeWidth={3} opacity={0.7} />
      ))}
      {[160, 480, 800, 1120, 1440, 1760].map((x) => (
        <path key={x} d={`M ${x} 0 L ${x} 876`} stroke={tileLine} strokeWidth={3} opacity={0.7} />
      ))}
      {/* a few darker tiles so the wall isn't one flat colour */}
      {[[320, 260], [960, 380], [1280, 140], [1600, 500], [640, 620], [160, 740]].map(([x, y], i) => (
        <rect key={i} x={x} y={y} width={160} height={120} fill={tileLine} opacity={0.45} />
      ))}
      {/* the mirror + warm light bar */}
      <rect x={660} y={140} width={600} height={520} fill={mode === 'morning' ? '#2A3A4A' : '#0E1A22'} stroke="#C9A227" strokeWidth={8} />
      <rect x={676} y={156} width={568} height={488} fill={mode === 'morning' ? '#3A4E60' : '#16242E'} />
      <rect x={760} y={110} width={400} height={26} rx={13} fill="#3A3446" stroke="#161616" strokeWidth={3} />
      <GlowDisc cx={960} cy={130} r={240} color="#FFE2B0" o={0.6} />
      <circle cx={820} cy={123} r={12} fill="#FFE2B0" />
      <circle cx={960} cy={123} r={12} fill="#FFE2B0" />
      <circle cx={1100} cy={123} r={12} fill="#FFE2B0" />
      {/* diagonal glint across the mirror glass */}
      <polygon points="700,640 820,160 900,160 780,640" fill="#FFFFFF" opacity={0.06} />
      <polygon points="880,640 1000,160 1040,160 920,640" fill="#FFFFFF" opacity={0.05} />
      <ellipse cx={960} cy={700} rx={300} ry={18} fill="#FFE2B0" opacity={0.18} />
      {/* sink + faucet */}
      <ellipse cx={960} cy={740} rx={220} ry={30} fill="#F6EFE3" stroke="#161616" strokeWidth={4} />
      <rect x={820} y={740} width={280} height={136} fill="#D8D8D2" stroke="#161616" strokeWidth={4} />
      <path d="M 960 740 L 960 680 Q 960 660 940 660" stroke="#8A97A3" strokeWidth={8} fill="none" strokeLinecap="round" />
      {/* towel + small window */}
      <rect x={1400} y={300} width={60} height={14} rx={7} fill="#8A97A3" stroke="#161616" strokeWidth={2} />
      <rect x={1390} y={314} width={80} height={180} fill="#3E8C86" stroke="#161616" strokeWidth={3} />
      <rect x={300} y={180} width={220} height={260} fill={skyC} stroke="#5A4028" strokeWidth={6} />
      <circle cx={460} cy={260} r={34} fill={sunC} />
      <ellipse cx={380} cy={330} rx={60} ry={14} fill="#FFFFFF" opacity={0.25} />
      {mode === 'morning' ? (
        <g>
          <ellipse cx={400} cy={380} rx={80} ry={16} fill="#FFFFFF" opacity={0.5} />
          {/* daylight shaft from the small window — sun left, beam down-right */}
          <WindowShaft p={`${id}r`} sill={[320, 500, 440]} floorY={876} dir={1} spread={40} o={0.8} motes={8} seed={11} />
        </g>
      ) : (
        <g>
          <circle cx={440} cy={246} r={7} fill="#C8D2E4" opacity={0.5} />
          <WindowShaft p={`${id}r`} sill={[320, 500, 440]} floorY={876} dir={1} spread={40} o={0.4} motes={6} seed={11} />
        </g>
      )}
      {/* toothbrush cup + soap on the sink edge */}
      <rect x={760} y={706} width={34} height={40} rx={6} fill="#3E8C86" stroke="#161616" strokeWidth={2} />
      <line x1={772} y1={706} x2={766} y2={676} stroke="#C0392B" strokeWidth={5} strokeLinecap="round" />
      <line x1={784} y1={706} x2={790} y2={676} stroke="#5A6E8F" strokeWidth={5} strokeLinecap="round" />
      <ellipse cx={1140} cy={726} rx={26} ry={10} fill="#F2C94C" stroke="#161616" strokeWidth={2} />
      <rect x={0} y={876} width={1920} height={204} fill={floorC} />
      <ellipse cx={960} cy={980} rx={260} ry={30} fill="#C85A46" opacity={0.5} />
      <ellipse cx={960} cy={980} rx={260} ry={30} fill="none" stroke="#8A3A2E" strokeWidth={3} opacity={0.5} />
      <path d="M 760 980 L 1160 980 M 800 966 L 1120 966 M 800 994 L 1120 994" stroke="#F6EFE3" strokeWidth={2} opacity={0.25} />
      <AtmoHaze color={mode === 'morning' ? '#F2E3C8' : '#2E4A55'} o={0.07} />
      <Dust t={t} seed={17} x0={700} y0={200} w={520} h={500} n={18} o={0.4} />
      <Vignette p={`${id}r`} o={mode === 'morning' ? 0.5 : 0.7} />
    </g>
  );
};

/** The day office — open-plan, warm daylight. A big window wall with the
    city in sun, rows of desks with monitors + papers + coffee cups, a water
    cooler, a tall plant, a filing cabinet, a meeting table, a wall clock, a
    rug, ceiling lights with warm pools. Used by S10–S16, S24, S30. */
export const OfficeDay: React.FC<{ t: number; id?: string }> = ({ t, id = 'od' }) => (
  <g>
    <RealDefs p={`${id}r`} palette="day" />
    <defs>
      <linearGradient id={`${id}wall`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#E8DCC4" />
        <stop offset="100%" stopColor="#C8B090" />
      </linearGradient>
    </defs>
    <rect x={0} y={0} width={1920} height={876} fill={`url(#${id}wall)`} />
    {/* window wall with the city in morning sun */}
    <g>
      <rect x={120} y={90} width={1100} height={560} fill="#A8CBE8" stroke="#5A4028" strokeWidth={6} />
      <rect x={140} y={110} width={1060} height={520} fill="#BFD9E8" />
      <circle cx={1020} cy={210} r={44} fill="#FFE9A8" />
      <GlowDisc cx={1020} cy={210} r={130} color="#FFE9A8" o={0.5} />
      <ellipse cx={300} cy={200} rx={90} ry={18} fill="#FFFFFF" opacity={0.8} />
      <ellipse cx={560} cy={280} rx={110} ry={20} fill="#FFFFFF" opacity={0.7} />
      <ellipse cx={860} cy={180} rx={80} ry={16} fill="#FFFFFF" opacity={0.75} />
      {/* city silhouette outside */}
      <g fill="#7E93B5" opacity={0.85}>
        <rect x={160} y={420} width={140} height={210} />
        <rect x={340} y={360} width={120} height={270} />
        <rect x={500} y={440} width={160} height={190} />
        <rect x={700} y={380} width={130} height={250} />
        <rect x={880} y={450} width={150} height={180} />
        <rect x={1060} y={390} width={120} height={240} />
      </g>
      {[400, 680, 960].map((x) => (
        <path key={x} d={`M ${x} 90 L ${x} 650`} stroke="#5A4028" strokeWidth={5} />
      ))}
      <path d="M 120 370 L 1220 370" stroke="#5A4028" strokeWidth={5} />
      {/* daylight shaft from the window — sun right, beam down-left */}
      <WindowShaft p={`${id}r`} sill={[140, 1220, 650]} floorY={876} dir={-1} spread={70} o={0.9} motes={12} seed={7} />
    </g>
    {/* framed poster + wall clock on the right wall */}
    <rect x={1300} y={180} width={200} height={150} fill="#F6EFE3" stroke="#5A4028" strokeWidth={5} />
    <circle cx={1400} cy={240} r={30} fill="#FFD39A" />
    <path d="M 1330 310 L 1400 240 L 1470 310" stroke="#4A7A44" strokeWidth={5} fill="none" />
    <circle cx={1700} cy={220} r={52} fill="#F6EFE3" stroke="#161616" strokeWidth={4} />
    <line x1={1700} y1={220} x2={1700} y2={184} stroke="#161616" strokeWidth={4} strokeLinecap="round" />
    <line x1={1700} y1={220} x2={1730} y2={232} stroke="#161616" strokeWidth={4} strokeLinecap="round" />
    {/* ceiling lights — warm pools on the carpet */}
    {[480, 960, 1440].map((x) => (
      <g key={x}>
        <rect x={x - 70} y={0} width={140} height={14} rx={7} fill="#3A3446" stroke="#161616" strokeWidth={2} />
        <GlowDisc cx={x} cy={20} r={150} color="#FFE2B0" o={0.5} />
        <ellipse cx={x} cy={880} rx={180} ry={14} fill="#FFE2B0" opacity={0.22} />
      </g>
    ))}
    {/* desk row, left — two monitors, papers, coffee cups */}
    <g>
      <rect x={140} y={730} width={560} height={20} fill="#7A5230" stroke="#241A12" strokeWidth={3} />
      <rect x={160} y={750} width={520} height={126} fill="#5A3E22" stroke="#241A12" strokeWidth={3} />
      <rect x={200} y={580} width={170} height={110} rx={6} fill="#10182E" stroke="#161616" strokeWidth={4} />
      <rect x={212} y={592} width={146} height={86} fill="#1E3A5A" />
      {[610, 630, 650].map((y, i) => (
        <rect key={y} x={220} y={y} width={120 - i * 26} height={8} fill="#8FD3FF" opacity={0.8} />
      ))}
      <rect x={430} y={580} width={170} height={110} rx={6} fill="#10182E" stroke="#161616" strokeWidth={4} />
      <rect x={442} y={592} width={146} height={86} fill="#1E3A5A" />
      {[610, 630].map((y, i) => (
        <rect key={y} x={450} y={y} width={110 - i * 30} height={8} fill="#FFD39A" opacity={0.8} />
      ))}
      <rect x={270} y={690} width={36} height={40} fill="#2A2530" />
      <rect x={500} y={690} width={36} height={40} fill="#2A2530" />
      <rect x={620} y={700} width={26} height={30} rx={4} fill="#C0392B" stroke="#161616" strokeWidth={2} />
      <rect x={180} y={706} width={90} height={24} fill="#F6EFE3" stroke="#161616" strokeWidth={2} transform="rotate(-4 225 718)" />
      <rect x={480} y={710} width={90} height={24} fill="#F6EFE3" stroke="#161616" strokeWidth={2} transform="rotate(3 525 722)" />
      <GlowDisc cx={285} cy={640} r={120} color="#8FD3FF" o={0.25} />
      <GlowDisc cx={515} cy={640} r={120} color="#FFD39A" o={0.2} />
    </g>
    {/* desk row, right — papers, a plant, a desk lamp */}
    <g>
      <rect x={1240} y={730} width={560} height={20} fill="#7A5230" stroke="#241A12" strokeWidth={3} />
      <rect x={1260} y={750} width={520} height={126} fill="#5A3E22" stroke="#241A12" strokeWidth={3} />
      <rect x={1300} y={700} width={110} height={30} fill="#F6EFE3" stroke="#161616" strokeWidth={2} transform="rotate(-2 1355 715)" />
      <rect x={1420} y={706} width={110} height={30} fill="#F6EFE3" stroke="#161616" strokeWidth={2} transform="rotate(4 1475 721)" />
      <rect x={1560} y={690} width={26} height={40} rx={4} fill="#3E8C86" stroke="#161616" strokeWidth={2} />
      <rect x={1700} y={640} width={60} height={90} fill="#3A3446" stroke="#161616" strokeWidth={3} />
      <circle cx={1730} cy={610} r={26} fill="#4A7A44" />
      <circle cx={1710} cy={630} r={18} fill="#5A8A54" />
      <GlowDisc cx={1730} cy={620} r={70} color="#FFE2B0" o={0.35} />
    </g>
    {/* office chairs — seat top at y=787 so a seated character's hips sit
        on them (sitY(876) = 787) and the feet land on the floor at 876 */}
    <OfficeChair x={320} />
    <OfficeChair x={560} />
    <OfficeChair x={1500} flip />
    {/* water cooler, right wall */}
    <g>
      <rect x={1840} y={640} width={70} height={236} fill="#B8C4CC" stroke="#161616" strokeWidth={3} />
      <ellipse cx={1875} cy={640} rx={42} ry={70} fill="#A8CBE8" stroke="#161616" strokeWidth={3} />
      <rect x={1860} y={700} width={30} height={14} rx={4} fill="#C0392B" />
      <rect x={1860} y={720} width={30} height={14} rx={4} fill="#3E8C86" />
      <ellipse cx={1875} cy={880} rx={60} ry={8} fill="#000" opacity={0.15} />
    </g>
    {/* tall plant, left of the window — the Detective hides behind it (S15) */}
    <g>
      <path d="M 1240 876 L 1270 760 L 1330 760 L 1360 876 Z" fill="#C85A46" stroke="#161616" strokeWidth={3} />
      <path d="M 1300 760 Q 1240 660 1260 600 Q 1300 660 1300 760 Z" fill="#4A7A44" stroke="#161616" strokeWidth={2} />
      <path d="M 1300 760 Q 1360 660 1340 600 Q 1300 660 1300 760 Z" fill="#5A8A54" stroke="#161616" strokeWidth={2} />
      <path d="M 1300 760 Q 1300 640 1300 580 Q 1310 660 1300 760 Z" fill="#6A9A64" stroke="#161616" strokeWidth={2} />
      <ellipse cx={1300} cy={880} rx={70} ry={8} fill="#000" opacity={0.15} />
    </g>
    {/* filing cabinet, far right — the Detective hides behind it (S27) */}
    <g>
      <rect x={1760} y={420} width={130} height={456} fill="#5A6E8F" stroke="#161616" strokeWidth={4} />
      {[470, 580, 690, 800].map((y) => (
        <g key={y}>
          <rect x={1772} y={y} width={106} height={90} fill="#6E83A5" stroke="#161616" strokeWidth={2} />
          <rect x={1808} y={y + 38} width={34} height={12} rx={6} fill="#2A2530" stroke="#161616" strokeWidth={2} />
        </g>
      ))}
      <ellipse cx={1825} cy={880} rx={80} ry={8} fill="#000" opacity={0.15} />
    </g>
    {/* meeting table, centre — for the S12 presentation beat */}
    <g>
      <ellipse cx={960} cy={880} rx={300} ry={12} fill="#000" opacity={0.15} />
      <rect x={760} y={700} width={400} height={18} rx={8} fill="#7A5230" stroke="#241A12" strokeWidth={3} />
      <rect x={780} y={718} width={20} height={158} fill="#5A3E22" />
      <rect x={1120} y={718} width={20} height={158} fill="#5A3E22" />
      <rect x={900} y={676} width={120} height={24} fill="#F6EFE3" stroke="#161616" strokeWidth={2} transform="rotate(-2 960 688)" />
      <rect x={1040} y={680} width={90} height={24} fill="#F6EFE3" stroke="#161616" strokeWidth={2} transform="rotate(3 1085 692)" />
      <ellipse cx={960} cy={700} rx={200} ry={10} fill="#FFE2B0" opacity={0.3} />
    </g>
    <rect x={0} y={876} width={1920} height={204} fill="#8A7A62" />
    <ellipse cx={960} cy={990} rx={480} ry={40} fill="#7A6A52" opacity={0.7} />
    <ellipse cx={960} cy={990} rx={400} ry={30} fill="none" stroke="#6E5E46" strokeWidth={3} opacity={0.6} />
    <AtmoHaze color="#E8DCC4" o={0.06} />
    <Dust t={t} seed={23} x0={300} y0={200} w={800} h={500} n={26} o={0.4} />
    <Vignette p={`${id}r`} o={0.5} />
  </g>
);

/** The interview room — glass walls, cold light. A long table, three chairs,
    two folders, a stack of resumes, a water jug. The glass is a cold blue
    gradient; Jake watches through it from the hallway. Used by S25–S29. */
export const InterviewRoom: React.FC<{ t: number; id?: string }> = ({ t, id = 'ir' }) => {
  return (
    <g>
      <RealDefs p={`${id}r`} palette="night" />
      <defs>
        <linearGradient id={`${id}wall`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3A4A6A" />
          <stop offset="100%" stopColor="#1E2A44" />
        </linearGradient>
        <linearGradient id={`${id}glass`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#5A6E8F" />
          <stop offset="45%" stopColor="#2E3A55" />
          <stop offset="100%" stopColor="#1E2A44" />
        </linearGradient>
      </defs>
      <rect x={0} y={0} width={1920} height={876} fill={`url(#${id}wall)`} />
      {/* glass wall panels with cold reflections */}
      <rect x={120} y={80} width={1680} height={640} fill={`url(#${id}glass)`} stroke="#5A4028" strokeWidth={6} />
      {[480, 840, 1200, 1560].map((x) => (
        <path key={x} d={`M ${x} 80 L ${x} 720`} stroke="#5A4028" strokeWidth={5} />
      ))}
      <polygon points="120,80 560,80 380,720 120,720" fill="#FFFFFF" opacity={0.08} />
      <polygon points="700,80 1000,80 840,720 560,720" fill="#FFFFFF" opacity={0.06} />
      <polygon points="1200,80 1500,80 1360,720 1080,720" fill="#FFFFFF" opacity={0.05} />
      {/* ceiling light strips — cold white */}
      {[480, 960, 1440].map((x) => (
        <g key={x}>
          <rect x={x - 80} y={96} width={160} height={12} rx={6} fill="#D9ECF7" stroke="#161616" strokeWidth={2} />
          <GlowDisc cx={x} cy={110} r={160} color="#D9ECF7" o={0.4} />
          <ellipse cx={x} cy={880} rx={200} ry={14} fill="#D9ECF7" opacity={0.12} />
        </g>
      ))}
      {/* the long table + three chairs */}
      <g>
        <ellipse cx={960} cy={880} rx={420} ry={14} fill="#000" opacity={0.2} />
        <rect x={560} y={700} width={800} height={20} rx={8} fill="#3A3446" stroke="#161616" strokeWidth={3} />
        <rect x={580} y={720} width={24} height={156} fill="#2A2530" />
        <rect x={1316} y={720} width={24} height={156} fill="#2A2530" />
        {/* two folders, same size, same place — the point of the scene */}
        <rect x={700} y={672} width={130} height={28} fill="#C0392B" stroke="#161616" strokeWidth={2} />
        <rect x={1090} y={672} width={130} height={28} fill="#C0392B" stroke="#161616" strokeWidth={2} />
        <rect x={900} y={676} width={120} height={24} fill="#F6EFE3" stroke="#161616" strokeWidth={2} />
        {/* water jug + glasses */}
        <ellipse cx={960} cy={690} rx={24} ry={12} fill="#A8CBE8" stroke="#161616" strokeWidth={2} />
        <rect x={948} y={640} width={24} height={50} fill="#A8CBE8" stroke="#161616" strokeWidth={2} />
        <rect x={830} y={676} width={20} height={24} fill="#D9ECF7" stroke="#161616" strokeWidth={2} />
        <rect x={1070} y={676} width={20} height={24} fill="#D9ECF7" stroke="#161616" strokeWidth={2} />
      </g>
      {/* chairs — seat at y=787 so a seated character's hips sit on it */}
      {[700, 960, 1220].map((x) => (
        <g key={x}>
          <rect x={x - 70} y={640} width={140} height={147} rx={14} fill="#2E2A3A" stroke="#161616" strokeWidth={4} />
          <rect x={x - 70} y={787} width={140} height={24} rx={10} fill="#2E2A3A" stroke="#161616" strokeWidth={3} />
          <rect x={x - 10} y={811} width={20} height={65} fill="#161616" />
          <rect x={x - 70} y={872} width={140} height={12} rx={6} fill="#161616" />
        </g>
      ))}
      {/* a resume stack on the side table */}
      <g>
        <rect x={1620} y={740} width={180} height={16} fill="#7A5230" stroke="#241A12" strokeWidth={3} />
        <rect x={1640} y={700} width={140} height={40} fill="#F6EFE3" stroke="#161616" strokeWidth={2} transform="rotate(-2 1710 720)" />
        <rect x={1644} y={664} width={140} height={40} fill="#F6EFE3" stroke="#161616" strokeWidth={2} transform="rotate(3 1714 684)" />
        <rect x={1648} y={628} width={140} height={40} fill="#F6EFE3" stroke="#161616" strokeWidth={2} transform="rotate(-3 1718 648)" />
      </g>
      <rect x={0} y={876} width={1920} height={204} fill="#2E2A3A" />
      <ellipse cx={960} cy={990} rx={460} ry={36} fill="#3A3446" opacity={0.6} />
      <AtmoHaze color="#2E3A55" o={0.08} />
      <Dust t={t} seed={29} x0={400} y0={200} w={700} h={450} n={22} o={0.35} />
      <Vignette p={`${id}r`} o={0.7} />
    </g>
  );
};

/** The coffee shop — warm, lived-in. A big front window with sun, a counter
    with an espresso machine + cups + a pastry case, a chalk menu board,
    round tables with chairs, hanging pendant lamps with warm pools, a door
    with a bell. Used by S17–S23. */
export const CoffeeShop: React.FC<{ t: number; id?: string }> = ({ t, id = 'cf' }) => (
  <g>
    <RealDefs p={`${id}r`} palette="day" />
    <defs>
      <linearGradient id={`${id}wall`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#E8D5B8" />
        <stop offset="100%" stopColor="#C8A878" />
      </linearGradient>
    </defs>
    <rect x={0} y={0} width={1920} height={876} fill={`url(#${id}wall)`} />
    {/* big front window with warm sun */}
    <g>
      <rect x={120} y={100} width={760} height={480} fill="#A8CBE8" stroke="#5A4028" strokeWidth={6} />
      <rect x={140} y={120} width={720} height={440} fill="#BFD9E8" />
      <circle cx={700} cy={210} r={46} fill="#FFE9A8" />
      <GlowDisc cx={700} cy={210} r={130} color="#FFE9A8" o={0.5} />
      <ellipse cx={300} cy={200} rx={90} ry={18} fill="#FFFFFF" opacity={0.8} />
      <ellipse cx={520} cy={290} rx={100} ry={20} fill="#FFFFFF" opacity={0.7} />
      <g fill="#7E93B5" opacity={0.8}>
        <rect x={160} y={420} width={120} height={140} />
        <rect x={320} y={370} width={110} height={190} />
        <rect x={480} y={430} width={130} height={130} />
        <rect x={660} y={390} width={120} height={170} />
      </g>
      <path d="M 500 100 L 500 580 M 120 340 L 880 340" stroke="#5A4028" strokeWidth={5} />
      {/* daylight shaft from the window — sun right, beam down-left */}
      <WindowShaft p={`${id}r`} sill={[140, 880, 580]} floorY={876} dir={-1} spread={60} o={0.85} motes={10} seed={13} />
    </g>
    {/* chalk menu board */}
    <g>
      <rect x={1000} y={140} width={340} height={300} rx={8} fill="#10182E" stroke="#7A5230" strokeWidth={8} />
      <text x={1170} y={196} textAnchor="middle" fontFamily={FONT.ui} fontSize={30} fontWeight={700} fill="#F6EFE3">MENU</text>
      {[230, 280, 330, 380].map((y, i) => (
        <g key={y}>
          <rect x={1030} y={y} width={180} height={10} rx={5} fill="#F6EFE3" opacity={0.85 - i * 0.12} />
          <rect x={1260} y={y} width={50} height={10} rx={5} fill={PINK} opacity={0.9} />
        </g>
      ))}
      <ellipse cx={1170} cy={430} rx={120} ry={5} fill="#F6EFE3" opacity={0.2} />
    </g>
    {/* the door with a bell, right */}
    <g>
      <rect x={1560} y={220} width={280} height={560} fill="#7A5230" stroke="#241A12" strokeWidth={5} />
      <rect x={1590} y={250} width={220} height={240} fill="#BFD9E8" stroke="#241A12" strokeWidth={4} />
      <rect x={1590} y={520} width={220} height={230} fill="#5A3E22" stroke="#241A12" strokeWidth={3} />
      <circle cx={1790} cy={520} r={10} fill="#C9A227" stroke="#161616" strokeWidth={2} />
      <path d="M 1700 220 Q 1700 200 1714 200 Q 1728 200 1728 220 L 1728 232 L 1700 232 Z" fill="#C9A227" stroke="#161616" strokeWidth={2} />
      <GlowDisc cx={1700} cy={330} r={90} color="#FFE9A8" o={0.35} />
    </g>
    {/* the counter — espresso machine, cups, pastry case */}
    <g>
      <rect x={140} y={700} width={1100} height={26} fill="#7A5230" stroke="#241A12" strokeWidth={4} />
      <rect x={160} y={726} width={1060} height={150} fill="#3A2A1E" stroke="#241A12" strokeWidth={4} />
      <rect x={200} y={540} width={220} height={160} rx={10} fill="#2A2530" stroke="#161616" strokeWidth={4} />
      <rect x={216} y={556} width={188} height={60} fill="#1E3A5A" />
      <circle cx={310} cy={586} r={16} fill="#8FD3FF" opacity={0.8} />
      <rect x={240} y={640} width={140} height={18} fill="#161616" />
      <rect x={280} y={658} width={60} height={42} fill="#F6EFE3" stroke="#161616" strokeWidth={2} />
      <GlowDisc cx={310} cy={600} r={90} color="#8FD3FF" o={0.25} />
      {/* pastry case with croissants */}
      <rect x={480} y={580} width={280} height={120} rx={10} fill="#D9ECF7" stroke="#161616" strokeWidth={4} opacity={0.9} />
      <path d="M 520 660 Q 560 620 600 660 Q 640 620 680 660 Q 720 620 740 650" stroke="#C85A46" strokeWidth={8} fill="none" strokeLinecap="round" />
      <ellipse cx={620} cy={690} rx={120} ry={8} fill="#FFE2B0" opacity={0.3} />
      {/* cup stack + a tip jar */}
      <rect x={820} y={640} width={40} height={60} fill="#F6EFE3" stroke="#161616" strokeWidth={2} />
      <rect x={868} y={640} width={40} height={60} fill="#C0392B" stroke="#161616" strokeWidth={2} />
      <rect x={960} y={650} width={50} height={50} fill="#D9ECF7" stroke="#161616" strokeWidth={2} />
      <circle cx={985} cy={668} r={8} fill="#F2C94C" />
      <circle cx={975} cy={684} r={8} fill="#C85A46" />
    </g>
    {/* pendant lamps over the counter — warm pools */}
    {[420, 760, 1100].map((x) => (
      <g key={x}>
        <line x1={x} y1={0} x2={x} y2={360} stroke="#241A12" strokeWidth={5} />
        <path d={`M ${x - 50} 360 L ${x + 50} 360 L ${x + 26} 410 L ${x - 26} 410 Z`} fill="#3E8C86" stroke="#161616" strokeWidth={3} />
        <GlowDisc cx={x} cy={410} r={130} color="#FFE2B0" o={0.55} />
        <circle cx={x} cy={412} r={22} fill="#FFE2B0" />
        <polygon points={`${x - 24},410 ${x + 24},410 ${x + 140},700 ${x - 140},700`} fill="#FFE2B0" opacity={0.1} />
        <ellipse cx={x} cy={700} rx={150} ry={12} fill="#FFE2B0" opacity={0.35} />
      </g>
    ))}
    {/* round tables with chairs, right half */}
    {[[1450, 720], [1700, 760]].map(([x, y], i) => (
      <g key={i}>
        <ellipse cx={x} cy={880} rx={130} ry={10} fill="#000" opacity={0.15} />
        <ellipse cx={x} cy={y} rx={110} ry={16} fill="#7A5230" stroke="#241A12" strokeWidth={3} />
        <rect x={x - 10} y={y} width={20} height={156} fill="#5A3E22" />
        <ellipse cx={x} cy={y - 8} rx={46} ry={10} fill="#F6EFE3" stroke="#161616" strokeWidth={2} />
        <rect x={x - 70} y={y + 30} width={26} height={30} rx={4} fill="#C0392B" stroke="#161616" strokeWidth={2} />
        <rect x={x + 130} y={y - 40} width={90} height={100} rx={10} fill="#2E2A3A" stroke="#161616" strokeWidth={3} />
        <rect x={x + 130} y={y + 60} width={90} height={16} rx={8} fill="#2E2A3A" stroke="#161616" strokeWidth={3} />
      </g>
    ))}
    {/* a plant on the sill + a wall shelf with mugs */}
    <g>
      <rect x={140} y={580} width={120} height={14} fill="#7A5230" stroke="#241A12" strokeWidth={3} />
      <circle cx={180} cy={560} r={22} fill="#4A7A44" />
      <circle cx={210} cy={552} r={16} fill="#5A8A54" />
      <rect x={180} y={566} width={40} height={20} fill="#C85A46" stroke="#161616" strokeWidth={2} />
    </g>
    <g>
      <rect x={1400} y={520} width={140} height={12} fill="#7A5230" stroke="#241A12" strokeWidth={3} />
      <rect x={1410} y={480} width={26} height={40} fill="#F6EFE3" stroke="#161616" strokeWidth={2} />
      <rect x={1446} y={480} width={26} height={40} fill="#3E8C86" stroke="#161616" strokeWidth={2} />
      <rect x={1482} y={480} width={26} height={40} fill="#C0392B" stroke="#161616" strokeWidth={2} />
    </g>
    <rect x={0} y={876} width={1920} height={204} fill="#8A6A4A" />
    {[240, 560, 880, 1200, 1520, 1840].map((x) => (
      <path key={x} d={`M ${x} 876 L ${x - 24} 1080`} stroke="#6E5238" strokeWidth={3} opacity={0.7} />
    ))}
    <ellipse cx={960} cy={990} rx={420} ry={36} fill="#C85A46" opacity={0.4} />
    <ellipse cx={960} cy={990} rx={340} ry={26} fill="none" stroke="#8A3A2E" strokeWidth={3} opacity={0.4} />
    <AtmoHaze color="#E8D5B8" o={0.06} />
    <Dust t={t} seed={19} x0={300} y0={200} w={700} h={450} n={26} o={0.4} />
    <Vignette p={`${id}r`} o={0.5} />
  </g>
);

/** Jake's bedroom, evening — dim, one warm lamp. A platform bed at KNEE
    height (mattress top v=0.79, per the rule book), a tall warm-oak headboard,
    a small puffy pillow with a seam, a thick rounded mattress, a soft blanket
    with folds and a wavy draped edge, a bedside table with the lamp ON, a
    window with the evening sky, a rug. The bed's edge (seat line) is at
    y=787 so a seated character's hips sit on it (sitY(876) = 787) and the
    feet land on the floor at 876. Used by S33, S37. */
export const BedroomSet: React.FC<{ t: number; id?: string }> = ({ t, id = 'bd' }) => (
  <g>
    <RealDefs p={`${id}r`} palette="night" />
    <defs>
      <linearGradient id={`${id}wall`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#3E3A52" />
        <stop offset="100%" stopColor="#2A2438" />
      </linearGradient>
    </defs>
    <rect x={0} y={0} width={1920} height={876} fill={`url(#${id}wall)`} />
    {/* window with the evening sky */}
    <g>
      <rect x={140} y={140} width={420} height={360} fill="#2A2A55" stroke="#5A4028" strokeWidth={6} />
      <rect x={160} y={160} width={380} height={320} fill="#332A55" />
      <circle cx={450} cy={240} r={30} fill="#E8EEF7" />
      <circle cx={436} cy={230} r={6} fill="#C8D2E4" opacity={0.5} />
      <ellipse cx={260} cy={300} rx={70} ry={14} fill="#FFFFFF" opacity={0.2} />
      <ellipse cx={420} cy={360} rx={90} ry={16} fill="#FFFFFF" opacity={0.15} />
      {[220, 300, 380, 460, 500].map((x, i) => (
        <circle key={x} cx={x} cy={190 + (i % 2) * 30} r={2.5} fill="#FFFFFF" opacity={0.8} />
      ))}
      <path d="M 350 140 L 350 500 M 140 320 L 560 320" stroke="#5A4028" strokeWidth={5} />
      {/* moonlight shaft — moon left, beam down-right */}
      <WindowShaft p={`${id}r`} sill={[160, 540, 500]} floorY={876} dir={1} spread={40} o={0.5} motes={8} seed={15} />
    </g>
    {/* framed picture on the wall */}
    <rect x={700} y={200} width={180} height={140} fill="#F6EFE3" stroke="#5A4028" strokeWidth={5} />
    <circle cx={790} cy={250} r={26} fill="#FFD39A" />
    <path d="M 720 320 L 790 250 L 860 320" stroke="#4A7A44" strokeWidth={5} fill="none" />
    {/* the bed — platform at knee height, headboard left, mattress + blanket */}
    <g>
      {/* headboard — tall, warm oak, light enough to see against the dark wall */}
      <rect x={880} y={420} width={60} height={340} rx={10} fill="#A87B4F" stroke="#5A3E22" strokeWidth={4} />
      <rect x={896} y={440} width={28} height={300} rx={6} fill="#C89B6A" opacity={0.7} />
      {/* mattress — thick, rounded, top at y=787 (knee height) */}
      <rect x={940} y={787} width={700} height={90} rx={24} fill="#E8DCC4" stroke="#8A7A5E" strokeWidth={4} />
      <rect x={940} y={787} width={700} height={24} rx={12} fill="#F6EFE3" opacity={0.6} />
      {/* the pillow — small, puffy, with a seam, ON the mattress at the head */}
      <ellipse cx={1030} cy={770} rx={90} ry={34} fill="#F6EFE3" stroke="#C8B8A0" strokeWidth={3} />
      <ellipse cx={1030} cy={770} rx={70} ry={22} fill="none" stroke="#C8B8A0" strokeWidth={2} opacity={0.7} />
      {/* the blanket — DRAPES over the mattress with a wavy bottom edge +
          folds, covering the frame, never a flat coloured rect */}
      <path d="M 1140 787 L 1640 787 L 1640 840 Q 1560 862 1480 844 Q 1400 862 1320 844 Q 1240 862 1160 844 Q 1140 820 1140 787 Z" fill="#3E8C86" stroke="#2F6E69" strokeWidth={3} />
      <path d="M 1220 787 Q 1230 830 1220 850 M 1360 787 Q 1370 830 1360 850 M 1500 787 Q 1510 830 1500 850" stroke="#2F6E69" strokeWidth={3} fill="none" opacity={0.8} />
      {/* bed frame + legs */}
      <rect x={940} y={877} width={700} height={16} fill="#5A3E22" />
      <rect x={960} y={893} width={24} height={60} fill="#3A2A1E" />
      <rect x={1596} y={893} width={24} height={60} fill="#3A2A1E" />
      <ellipse cx={1290} cy={880} rx={380} ry={12} fill="#000" opacity={0.2} />
    </g>
    {/* bedside table with the lamp ON — the room's warm light */}
    <g>
      <rect x={1700} y={740} width={160} height={136} fill="#7A5230" stroke="#241A12" strokeWidth={3} />
      <rect x={1700} y={740} width={160} height={20} fill="#5A3E22" />
      <circle cx={1780} cy={800} r={7} fill="#D9C6A8" stroke="#241A12" strokeWidth={2} />
      <line x1={1780} y1={640} x2={1780} y2={700} stroke="#241A12" strokeWidth={5} />
      <path d="M 1740 640 L 1820 640 L 1796 690 L 1764 690 Z" fill="#F2C94C" stroke="#161616" strokeWidth={3} />
      <GlowDisc cx={1780} cy={690} r={220} color="#FFD39A" o={0.6} />
      <polygon points="1764,690 1796,690 1900,876 1660,876" fill="#FFD39A" opacity={0.12} />
      <circle cx={1780} cy={692} r={24} fill="#FFE2B0" />
      <ellipse cx={1780} cy={880} rx={220} ry={16} fill="#FFD39A" opacity={0.3} />
      {/* a book on the bedside table */}
      <rect x={1710} y={716} width={60} height={24} fill="#C0392B" stroke="#161616" strokeWidth={2} transform="rotate(-3 1740 728)" />
    </g>
    {/* rug + slippers by the bed */}
    <ellipse cx={1290} cy={1000} rx={380} ry={34} fill="#5A4A6A" opacity={0.55} />
    <ellipse cx={1290} cy={1000} rx={300} ry={24} fill="none" stroke="#F6EFE3" strokeWidth={3} opacity={0.3} />
    <ellipse cx={1000} cy={960} rx={26} ry={10} fill="#3E8C86" stroke="#161616" strokeWidth={2} />
    <ellipse cx={1060} cy={966} rx={26} ry={10} fill="#3E8C86" stroke="#161616" strokeWidth={2} />
    <AtmoHaze color="#2A2438" o={0.08} />
    <Dust t={t} seed={27} x0={1400} y0={300} w={400} h={400} n={16} o={0.4} />
    <Vignette p={`${id}r`} o={0.75} />
  </g>
);

/** An office chair in profile — backrest, seat at y=787, post, base. A
    seated character's hips sit on the seat (sitY(876) = 787), feet on the
    floor. flip = faces left. */
export const OfficeChair: React.FC<{ x: number; flip?: boolean }> = ({ x, flip = false }) => (
  <g transform={`translate(${x} 0) scale(${flip ? -1 : 1} 1)`}>
    <rect x={-58} y={640} width={18} height={150} rx={8} fill="#2E2A3A" stroke="#161616" strokeWidth={3} />
    <rect x={-58} y={787} width={130} height={22} rx={10} fill="#2E2A3A" stroke="#161616" strokeWidth={3} />
    <rect x={-4} y={809} width={16} height={64} fill="#161616" />
    <rect x={-58} y={868} width={130} height={10} rx={5} fill="#161616" />
  </g>
);

/** A tall potted plant — drawn AFTER the Detective so he peeks from behind
    it (S15). Pot + three leaves. */
export const Plant: React.FC<{ x: number }> = ({ x }) => (
  <g>
    <path d={`M ${x - 30} 876 L ${x - 10} 760 L ${x + 30} 760 L ${x + 50} 876 Z`} fill="#C85A46" stroke="#161616" strokeWidth={3} />
    <path d={`M ${x + 10} 760 Q ${x - 50} 660 ${x - 30} 600 Q ${x + 10} 660 ${x + 10} 760 Z`} fill="#4A7A44" stroke="#161616" strokeWidth={2} />
    <path d={`M ${x + 10} 760 Q ${x + 70} 660 ${x + 50} 600 Q ${x + 10} 660 ${x + 10} 760 Z`} fill="#5A8A54" stroke="#161616" strokeWidth={2} />
    <path d={`M ${x + 10} 760 Q ${x + 10} 640 ${x + 10} 580 Q ${x + 20} 660 ${x + 10} 760 Z`} fill="#6A9A64" stroke="#161616" strokeWidth={2} />
  </g>
);

/** A street sign on a post — drawn AFTER the Detective so he peeks from
    behind it (S8). */
export const StreetSign: React.FC<{ x: number; label?: string }> = ({ x, label = 'MAIN ST' }) => (
  <g>
    <rect x={x - 6} y={560} width={12} height={316} fill="#2A2530" />
    <rect x={x - 90} y={480} width={180} height={64} rx={10} fill="#2E5E3A" stroke="#161616" strokeWidth={3} />
    <text x={x} y={522} textAnchor="middle" fontFamily={FONT.ui} fontSize={26} fontWeight={700} fill="#F6EFE3">{label}</text>
    <rect x={x - 90} y={560} width={180} height={10} fill="#161616" opacity={0.4} />
  </g>
);

/** A tall filing cabinet — drawn AFTER the Detective so he peeks from behind
    it (S27). Four drawers with handles. */
export const FilingCabinet: React.FC<{ x: number }> = ({ x }) => (
  <g>
    <rect x={x} y={420} width={130} height={456} fill="#5A6E8F" stroke="#161616" strokeWidth={4} />
    {[470, 580, 690, 800].map((y) => (
      <g key={y}>
        <rect x={x + 12} y={y} width={106} height={90} fill="#6E83A5" stroke="#161616" strokeWidth={2} />
        <rect x={x + 48} y={y + 38} width={34} height={12} rx={6} fill="#2A2530" stroke="#161616" strokeWidth={2} />
      </g>
    ))}
    <ellipse cx={x + 65} cy={880} rx={80} ry={8} fill="#000" opacity={0.15} />
  </g>
);
