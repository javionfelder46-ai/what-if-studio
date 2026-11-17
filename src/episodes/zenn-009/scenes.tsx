// "What If You Could See How Much Time Everyone Has Left?" — video #13, 2D Remotion build.
// 43 narrative beats (S1-S43) + end card, each its own sealed scene function
// with a set duration (modular scene build, Nov 14). Durations from the script's
// narration word counts at Archer's measured pace (584.1s / 1,636 words =
// 0.357 s/word, video #6), min 4s per beat. Total 608.79s (18,264 frames) —
// PLACEHOLDER until the Archer VO exists; re-time exactly from alignment then.
// Audio sync comes later (Archer voiceover, not yet recorded Nov 16).
//
// LOOK (locked, rule book + script header): Detective + Jake are BLACK
// SILHOUETTES — round solid black heads, black torsos/limbs, white oval eyes,
// no ears, no nose, no mouth, no chin. Moonlight blue glow (#A9C6FF rim,
// rimId="rimR") on the Detective (and Jake's edges) in EVERY scene — never
// removed. Detective: slate-blue deerstalker (little bow on top stays) + slate
// jacket + white shirt + dark tie. Jake: plain red shirt #C0392B, BALD, NO
// glasses (removed Nov 14 — brows/eyes carry the expression now). Accent:
// sky blue #38BDF8 — the COUNTDOWN NUMBERS glow sky blue above every head,
// a sparse highlight on the focal element ONLY. Never on characters/glow.
// THE DETECTIVE IS NEVER A HOST — he lives in the background and POPS UP to
// give information when needed: small, at the edge of the frame, a cameo,
// never front and center, never facing the camera as the main subject. Jake
// lives the story.
//
// NO SIMPLE CODE (Nov 16, Javion — rule book): these scenes ARE the board.
// Every panel renders through this rig, never through a drawing script. Each
// scene is a full world — detailed, atmospheric, cinematic — with visible
// light sources + pools of light, haze/glow, and the characters on-model.
// Flat solid fills alone do not match the reference. Match the painterly dusk
// look: gradient skies, warm light, atmosphere (Miko style, approved Nov 15).
//
// STYLE LOCK: small round heads (r 54), thin stick limbs, slate coat,
// deerstalker with bow, moonlight blue glow on every character, RICH DETAILED
// SETS (no plain empty walls, no blank banners, no unfinished set piece),
// colored outfit on every character. HANDS: plain black mitten, no fingers.
// FEET: plain rounded black ovals flat on the floor.
//
// MOVEMENT (fluent, Nov 14): one movement at a time, a move spans >=15 frames,
// hold >=0.5s after it lands, head leads / body follows. Standing poses repeat
// IDENTICAL arm/look values at every key (0 reversals). look stays 0 unless
// the beat names a look; eyes never dart.
//
// MUSIC: "The Descent" by Kevin MacLeod, 0.03 looped (not needed for stills).

import React from 'react';
import {
  Hero, basePose, poseAt, faceAt, kf, camT, lerp, clamp, LOOKS,
  FONT, MOONLIGHT, ShotProps, joints, toWorld, Magnifier,
  RealDefs, WindowShaft, AtmoHaze, Vignette, GlowDisc, SoftShadow, Dust,
  Glow, LightVeil, Cone,
} from '../../engine';
import {
  defineScene, getScenes, SceneDef,
} from '../../engine/sceneBuilder';
import { EndCard } from '../../engine/ui';
import type { CastName, Expr, Limb, Pose } from '../../engine/rig';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const FPS = 30;
export const SKY = '#38BDF8'; // video #13 accent — countdown numbers ONLY
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
    hip + 89, overlapping the ground. See SIT comment — the foot must OVERLAP
    the ground, not just touch the floor line. */
export const sitY = (floorYPx: number, scale = 1) => floorYPx - 89 * scale;
/** Tag centre y above a character's head: head centre is 188px above the hip
    (slim build), head top a further 54px; the tag hangs 55px above that. */
export const countdownY = (hipY: number, scale = 1) => hipY - 242 * scale - 55;

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

/** The signature element: a glowing sky-blue countdown tag above a head.
    Dark navy pill, sky-blue border + text, a soft halo behind it so it reads
    as glowing, never as a flat label. Width fits the text (monospace). */
export const Countdown: React.FC<{ x: number; y: number; text: string; size?: number; o?: number }> = ({ x, y, text, size = 34, o = 1 }) => {
  const w = Math.round(text.length * size * 0.62 + 46);
  return (
    <g opacity={o}>
      <GlowDisc cx={x} cy={y} r={Math.round(w * 0.95)} color={SKY} o={0.42} />
      <GlowDisc cx={x} cy={y} r={Math.round(w * 0.55)} color={SKY} o={0.35} />
      <rect x={x - w / 2 - 10} y={y - 32} width={w + 20} height={64} rx={32} fill={SKY} opacity={0.16} />
      <rect x={x - w / 2} y={y - 27} width={w} height={54} rx={27} fill="#0B1B2E" opacity={0.95} stroke={SKY} strokeWidth={3} />
      <text x={x} y={y + 12} textAnchor="middle" fontFamily={FONT.ui} fontSize={size} fontWeight={700} fill={SKY}>{text}</text>
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
    shirt — never a clone of Jake), standing on the floor with a countdown tag.
    Used for the crowd scenes (S1, S4, S10, S22, S38, S40). The scene must
    declare every pedestrian's `who` in its characters list. */
export type PedOpts = {
  scene: string; label: string; x: number; look: CastName; scale?: number;
  tag?: string; expr?: Expr; yaw?: number; headTilt?: number;
  armL?: Limb; armR?: Limb; phone?: boolean;
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
      {cast(o.look, <Hero slim look={LOOKS[o.look]} pose={{ ...p, ...face, facing: 1 }} rimId="rimR" shadow={0} />)}
      {o.phone && hand ? (
        <g>
          <rect x={hand.x - 9} y={hand.y - 34} width={18} height={34} rx={4} fill="#161616" stroke="#3A3E4A" strokeWidth={2} />
          <rect x={hand.x - 6} y={hand.y - 30} width={12} height={26} rx={2} fill="#8FD3FF" opacity={0.85} />
        </g>
      ) : null}
      {o.tag ? <Countdown x={p.x} y={countdownY(p.y, s)} text={o.tag} size={Math.max(20, Math.round(30 * s))} /> : null}
    </g>
  );
};

/** A small pigeon on the ground (park scenes). */
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
    trees, haze. Used by S1, S2, S4–S10, S12 (right half), S22, S38, S39, S40. */
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

/** The park — day or dusk. Gradient sky, sun glow, distant tree line, grass
    with a winding path, a wooden bench, a big oak with dappled light, lamp
    posts, a small pond glint, pigeons, haze. Used by S11, S12 (left half),
    S15, S16, S20, S28–S34, S40, S41 (montage), S42. */
export const Park: React.FC<{ t: number; mode?: 'day' | 'dusk'; id?: string }> = ({ t, mode = 'day', id = 'pk' }) => {
  const skyTop = mode === 'day' ? '#4A86C8' : '#332A55';
  const skyBot = mode === 'day' ? '#F6D9A0' : '#E8845A';
  return (
    <g>
      <defs>
        <linearGradient id={`${id}sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={skyTop} />
          <stop offset="60%" stopColor={mode === 'day' ? '#A8CBE8' : '#8A5570'} />
          <stop offset="100%" stopColor={skyBot} />
        </linearGradient>
        <linearGradient id={`${id}grass`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={mode === 'day' ? '#6A9A58' : '#3E5A34'} />
          <stop offset="100%" stopColor={mode === 'day' ? '#4A7A44' : '#2A4226'} />
        </linearGradient>
      </defs>
      <rect x={0} y={0} width={1920} height={700} fill={`url(#${id}sky)`} />
      <Glow x={1500} y={280} r={560} o={0.75} />
      <GlowDisc cx={1500} cy={280} r={150} color={mode === 'day' ? '#FFE9A8' : '#FF9A3D'} o={0.5} />
      <circle cx={1500} cy={280} r={58} fill={mode === 'day' ? '#FFE9A8' : '#FF9A3D'} opacity={0.98} />
      <ellipse cx={1500} cy={680} rx={700} ry={60} fill={mode === 'day' ? '#FFE2B0' : '#FF9A3D'} opacity={0.25} />
      {/* distant tree line — two depths for atmospheric perspective */}
      <g fill={mode === 'day' ? '#5A8A54' : '#38583A'} opacity={0.55}>
        {[120, 320, 520, 720, 920, 1120, 1320, 1520, 1720].map((x, i) => (
          <circle key={i} cx={x} cy={660 - (i % 2) * 10} r={80 + (i % 3) * 10} />
        ))}
      </g>
      <g fill={mode === 'day' ? '#4A7A44' : '#2E4A2E'}>
        {[60, 220, 380, 540, 700, 860, 1020, 1180, 1340, 1500, 1660, 1820].map((x, i) => (
          <circle key={i} cx={x} cy={690 - (i % 3) * 14} r={64 + (i % 3) * 12} />
        ))}
      </g>
      <rect x={0} y={700} width={1920} height={380} fill={`url(#${id}grass)`} />
      {/* grass tufts, wildflowers, fallen leaves */}
      <g stroke={mode === 'day' ? '#3E6A38' : '#24381E'} strokeWidth={3} strokeLinecap="round" opacity={0.8}>
        {[240, 420, 700, 980, 1240, 1560, 1800].map((x, i) => (
          <path key={x} d={`M ${x} ${940 + (i % 3) * 40} l -8 -22 M ${x} ${940 + (i % 3) * 40} l 0 -26 M ${x} ${940 + (i % 3) * 40} l 8 -22`} />
        ))}
      </g>
      <g>
        {[[360, 980, '#F2C94C'], [640, 1020, '#F6EFE3'], [1040, 990, '#C85A46'], [1420, 1030, '#F2C94C'], [1700, 960, '#F6EFE3']].map(([x, y, c], i) => (
          <circle key={i} cx={x as number} cy={y as number} r={5} fill={c as string} opacity={0.9} />
        ))}
      </g>
      <ellipse cx={300} cy={1020} rx={9} ry={5} fill="#C85A46" opacity={0.7} transform="rotate(-15 300 1020)" />
      <ellipse cx={1560} cy={990} rx={9} ry={5} fill="#F2C94C" opacity={0.7} transform="rotate(25 1560 990)" />
      {/* winding path */}
      <path d="M 0 1080 L 0 960 Q 480 900 960 940 Q 1440 980 1920 900 L 1920 1080 Z" fill={mode === 'day' ? '#D9C6A8' : '#8A7A5E'} opacity={0.9} />
      <path d="M 0 960 Q 480 900 960 940 Q 1440 980 1920 900" stroke="#B09A78" strokeWidth={4} fill="none" opacity={0.6} />
      {/* the big oak, left — layered foliage, sunlit side, dappled light */}
      <g>
        <rect x={180} y={560} width={34} height={320} fill="#3A2A1E" />
        <rect x={188} y={560} width={10} height={320} fill="#5A4632" opacity={0.8} />
        <circle cx={197} cy={500} r={150} fill={mode === 'day' ? '#4A7A44' : '#2E4A2E'} />
        <circle cx={110} cy={560} r={90} fill={mode === 'day' ? '#5A8A54' : '#38583A'} />
        <circle cx={290} cy={560} r={90} fill={mode === 'day' ? '#557F4E' : '#334F34'} />
        <circle cx={260} cy={440} r={70} fill={mode === 'day' ? '#6A9A64' : '#3E5A3A'} />
        <circle cx={140} cy={470} r={56} fill={mode === 'day' ? '#6A9A64' : '#3E5A3A'} />
        <circle cx={197} cy={580} r={60} fill={mode === 'day' ? '#557F4E' : '#334F34'} />
        <ellipse cx={200} cy={884} rx={180} ry={16} fill="#000" opacity={0.2} />
        <ellipse cx={200} cy={884} rx={120} ry={10} fill="#FFE9A8" opacity={mode === 'day' ? 0.3 : 0.12} />
        <ellipse cx={260} cy={886} rx={40} ry={5} fill="#FFE9A8" opacity={mode === 'day' ? 0.35 : 0.1} />
        <ellipse cx={140} cy={886} rx={30} ry={4} fill="#FFE9A8" opacity={mode === 'day' ? 0.3 : 0.1} />
      </g>
      {/* the bench — wooden slats, iron frame — centre-right. Seat top at
          y=787: a seated character's hips sit at sitY(876)=787, so the SIT
          geometry drops the feet to exactly 876 — on the ground, never
          hovering. */}
      <g>
        <rect x={1120} y={787} width={360} height={18} fill="#7A5230" stroke="#241A12" strokeWidth={3} />
        <rect x={1120} y={817} width={360} height={18} fill="#6A4526" stroke="#241A12" strokeWidth={3} />
        <rect x={1120} y={727} width={360} height={18} fill="#7A5230" stroke="#241A12" strokeWidth={3} />
        <rect x={1120} y={757} width={360} height={18} fill="#6A4526" stroke="#241A12" strokeWidth={3} />
        <rect x={1140} y={727} width={14} height={159} fill="#2A2530" />
        <rect x={1446} y={727} width={14} height={159} fill="#2A2530" />
        <rect x={1140} y={872} width={14} height={14} fill="#2A2530" />
        <rect x={1446} y={872} width={14} height={14} fill="#2A2530" />
        <ellipse cx={1300} cy={890} rx={200} ry={10} fill="#000" opacity={0.2} />
        <ellipse cx={1300} cy={790} rx={170} ry={8} fill="#FFE9A8" opacity={mode === 'day' ? 0.3 : 0.1} />
      </g>
      {/* pond glint, right — sun streak on the water */}
      <ellipse cx={1720} cy={980} rx={180} ry={46} fill="#7FB8D8" opacity={0.7} />
      <ellipse cx={1720} cy={980} rx={180} ry={46} fill="none" stroke="#5A8AA8" strokeWidth={3} />
      <ellipse cx={1680} cy={976} rx={90} ry={8} fill="#FFE9A8" opacity={mode === 'day' ? 0.7 : 0.3} />
      <path d="M 1600 972 Q 1680 962 1760 972 M 1620 992 Q 1700 984 1800 992" stroke="#D9ECF7" strokeWidth={3} fill="none" opacity={0.7} />
      <path d="M 1640 1000 Q 1720 994 1800 1000" stroke="#D9ECF7" strokeWidth={2} fill="none" opacity={0.5} />
      {/* lamp posts with warm pools (dusk) */}
      {mode === 'dusk' ? [560, 1560].map((x) => (
        <g key={x}>
          <rect x={x - 5} y={620} width={10} height={256} fill="#2A2530" />
          <circle cx={x} cy={616} r={13} fill="#FFD39A" />
          <GlowDisc cx={x} cy={616} r={80} color="#FFD39A" o={0.5} />
          <ellipse cx={x} cy={880} rx={100} ry={11} fill="#FFD39A" opacity={0.2} />
        </g>
      )) : null}
      <Pigeon x={820} y={1000} s={1} />
      <Pigeon x={880} y={1016} s={0.85} flip />
      <Pigeon x={760} y={1024} s={0.7} />
      <RealDefs p={`${id}r`} palette={mode === 'day' ? 'day' : 'night'} />
      <AtmoHaze color={mode === 'day' ? '#A8CBE8' : '#3A2E5E'} o={0.08} />
      <Dust t={t} seed={14} x0={1200} y0={240} w={500} h={300} n={34} o={0.45} />
      <Vignette p={`${id}r`} o={mode === 'day' ? 0.55 : 0.75} />
    </g>
  );
};

/** The friend's kitchen — warm, lived-in. Daylight window with a sheer
    curtain, wood cabinets, a stove with a steaming pot, a fridge with magnets
    and a kid drawing, a table with a fruit bowl, a pendant lamp ON with a
    warm pool, a wall clock, a plant on the sill, a rug. Used by S17, S18. */
export const FriendKitchen: React.FC<{ t: number; id?: string }> = ({ t, id = 'fk' }) => (
  <g>
    <RealDefs p="fkr" palette="day" />
    <defs>
      <linearGradient id={`${id}wall`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#F2E3C8" />
        <stop offset="100%" stopColor="#D9BE96" />
      </linearGradient>
    </defs>
    <rect x={0} y={0} width={1920} height={876} fill={`url(#${id}wall)`} />
    <path d="M 0 876 L 1920 876" stroke="#8A6A4A" strokeWidth={4} />
    <rect x={0} y={876} width={1920} height={204} fill="#8A6A4A" />
    {[240, 560, 880, 1200, 1520, 1840].map((x) => (
      <path key={x} d={`M ${x} 876 L ${x - 24} 1080`} stroke="#6E5238" strokeWidth={3} opacity={0.7} />
    ))}
    {/* window with daylight + sheer curtain */}
    <g>
      <rect x={120} y={140} width={420} height={380} fill="#A8CBE8" stroke="#5A4028" strokeWidth={6} />
      <rect x={130} y={150} width={400} height={360} fill="#BFD9E8" />
      <circle cx={440} cy={240} r={46} fill="#FFE9A8" />
      <ellipse cx={240} cy={220} rx={80} ry={18} fill="#FFFFFF" opacity={0.8} />
      <ellipse cx={400} cy={300} rx={100} ry={20} fill="#FFFFFF" opacity={0.7} />
      <path d="M 330 140 L 330 520 M 120 330 L 540 330" stroke="#5A4028" strokeWidth={5} />
      <path d="M 120 140 Q 90 330 120 520 L 170 520 Q 140 330 170 140 Z" fill="#F6EFE3" opacity={0.75} />
      <path d="M 540 140 Q 570 330 540 520 L 490 520 Q 520 330 490 140 Z" fill="#F6EFE3" opacity={0.75} />
      <rect x={200} y={500} width={260} height={16} fill="#7A5230" stroke="#241A12" strokeWidth={3} />
      <circle cx={260} cy={480} r={26} fill="#4A7A44" />
      <circle cx={300} cy={470} r={20} fill="#5A8A54" />
      <rect x={270} y={486} width={24} height={18} fill="#C85A46" />
    </g>
    {/* daylight shaft from the window — sun left in the glass, beam down-right */}
    <WindowShaft p="fkr" sill={[140, 520, 520]} floorY={876} dir={1} spread={60} o={0.9} motes={10} seed={5} />
    {/* tile backsplash behind the stove + a framed picture on the wall */}
    <g>
      {[660, 700, 740, 780, 820, 860, 900, 940, 980, 1020, 1060, 1100, 1140, 1180].map((x) => (
        <rect key={x} x={x} y={340} width={36} height={36} fill="#E8D9BC" stroke="#C8B090" strokeWidth={2} opacity={0.8} />
      ))}
      {[660, 700, 740, 780, 820, 860, 900, 940, 980, 1020, 1060, 1100, 1140, 1180].map((x) => (
        <rect key={x} x={x} y={380} width={36} height={36} fill="#DCC9A8" stroke="#C8B090" strokeWidth={2} opacity={0.8} />
      ))}
      <rect x={1660} y={300} width={160} height={120} fill="#F6EFE3" stroke="#5A4028" strokeWidth={5} />
      <circle cx={1740} cy={350} r={26} fill="#FFD39A" />
      <path d="M 1680 400 L 1740 350 L 1800 400" stroke="#4A7A44" strokeWidth={5} fill="none" />
    </g>
    {/* upper cabinets */}
    <g>
      <rect x={640} y={120} width={560} height={180} fill="#7A5230" stroke="#241A12" strokeWidth={4} />
      <path d="M 920 120 L 920 300 M 640 210 L 1200 210" stroke="#5A3E22" strokeWidth={3} />
      {[700, 780, 860, 980, 1060, 1140].map((x) => (
        <circle key={x} cx={x} cy={205} r={7} fill="#D9C6A8" stroke="#241A12" strokeWidth={2} />
      ))}
    </g>
    {/* stove with a steaming pot */}
    <g>
      <rect x={640} y={560} width={560} height={316} fill="#3A3446" stroke="#161616" strokeWidth={4} />
      <rect x={640} y={560} width={560} height={24} fill="#2A2530" />
      <circle cx={760} cy={600} r={34} fill="#161616" stroke="#3A3E4A" strokeWidth={3} />
      <circle cx={960} cy={600} r={34} fill="#161616" stroke="#3A3E4A" strokeWidth={3} />
      <circle cx={1060} cy={600} r={34} fill="#161616" stroke="#3A3E4A" strokeWidth={3} />
      <rect x={700} y={500} width={160} height={60} rx={10} fill="#5A6E8F" stroke="#161616" strokeWidth={3} />
      <path d={`M 780 ${500 - ((t * 0.6) % 40)} Q 770 ${480 - ((t * 0.6) % 40)} 782 ${460 - ((t * 0.6) % 40)}`} stroke="#FFFFFF" strokeWidth={5} fill="none" opacity={0.5} strokeLinecap="round" />
      <path d={`M 800 ${500 - ((t * 0.6 + 20) % 40)} Q 810 ${480 - ((t * 0.6 + 20) % 40)} 798 ${460 - ((t * 0.6 + 20) % 40)}`} stroke="#FFFFFF" strokeWidth={5} fill="none" opacity={0.4} strokeLinecap="round" />
    </g>
    {/* fridge with magnets + a kid drawing */}
    <g>
      <rect x={1300} y={240} width={300} height={636} fill="#B8C4CC" stroke="#161616" strokeWidth={4} />
      <path d="M 1300 480 L 1600 480" stroke="#8A97A3" strokeWidth={3} />
      <rect x={1330} y={300} width={120} height={110} fill="#F6EFE3" stroke="#161616" strokeWidth={2} transform="rotate(-3 1390 355)" />
      <circle cx={1390} cy={330} r={18} fill="#F2C94C" stroke="#161616" strokeWidth={2} />
      <path d="M 1370 380 L 1410 380 M 1390 360 L 1390 400" stroke="#161616" strokeWidth={3} />
      <circle cx={1500} cy={330} r={12} fill="#C0392B" />
      <circle cx={1540} cy={380} r={12} fill="#3E8C86" />
      <circle cx={1470} cy={420} r={12} fill="#5A4A6A" />
      <rect x={1420} y={540} width={10} height={90} fill="#5A6E8F" stroke="#161616" strokeWidth={2} />
      <rect x={1420} y={700} width={10} height={90} fill="#5A6E8F" stroke="#161616" strokeWidth={2} />
    </g>
    {/* table with fruit bowl + chairs */}
    <g>
      <ellipse cx={960} cy={880} rx={420} ry={14} fill="#000" opacity={0.18} />
      <rect x={700} y={700} width={520} height={20} rx={8} fill="#7A5230" stroke="#241A12" strokeWidth={3} />
      <rect x={720} y={720} width={24} height={160} fill="#5A3E22" />
      <rect x={1176} y={720} width={24} height={160} fill="#5A3E22" />
      <ellipse cx={960} cy={686} rx={70} ry={20} fill="#3E8C86" stroke="#161616" strokeWidth={3} />
      <circle cx={930} cy={672} r={14} fill="#C0392B" stroke="#161616" strokeWidth={2} />
      <circle cx={962} cy={668} r={14} fill="#F2C94C" stroke="#161616" strokeWidth={2} />
      <circle cx={992} cy={674} r={13} fill="#5E8C46" stroke="#161616" strokeWidth={2} />
    </g>
    {/* pendant lamp ON — warm pool on the table */}
    <g>
      <line x1={960} y1={0} x2={960} y2={420} stroke="#241A12" strokeWidth={5} />
      <path d="M 900 420 L 1020 420 L 990 470 L 930 470 Z" fill="#C0392B" stroke="#161616" strokeWidth={3} />
      <GlowDisc cx={960} cy={470} r={160} color="#FFE2B0" o={0.65} />
      <polygon points="934,470 986,470 1140,700 780,700" fill="#FFE2B0" opacity={0.12} />
      <circle cx={960} cy={472} r={26} fill="#FFE2B0" />
      <ellipse cx={960} cy={700} rx={220} ry={18} fill="#FFE2B0" opacity={0.45} />
    </g>
    {/* wall clock + rug */}
    <circle cx={1760} cy={220} r={52} fill="#F6EFE3" stroke="#161616" strokeWidth={4} />
    <line x1={1760} y1={220} x2={1760} y2={184} stroke="#161616" strokeWidth={4} strokeLinecap="round" />
    <line x1={1760} y1={220} x2={1790} y2={232} stroke="#161616" strokeWidth={4} strokeLinecap="round" />
    <ellipse cx={960} cy={1010} rx={420} ry={40} fill="#C85A46" opacity={0.55} />
    <ellipse cx={960} cy={1010} rx={340} ry={28} fill="#3E8C86" opacity={0.5} />
    <ellipse cx={960} cy={1010} rx={420} ry={40} fill="none" stroke="#8A3A2E" strokeWidth={4} opacity={0.5} />
    <ellipse cx={960} cy={1010} rx={260} ry={20} fill="none" stroke="#F6EFE3" strokeWidth={3} opacity={0.35} />
    <AtmoHaze color="#F2E3C8" o={0.06} />
    <Vignette p="fkr" o={0.5} />
  </g>
);

/** The corner office at 2 AM — cold blue night. A floor-to-ceiling window
    with city lights and a moon, a desk with two glowing monitors, energy
    drink cans, a sleep tracker, a stack of productivity books, an office
    chair, carpet. The monitors are the warm light in a cold room. Used by
    S23, S24, S26, S27. */
export const OfficeNight: React.FC<{ t: number; id?: string }> = ({ t, id = 'of' }) => (
  <g>
    <defs>
      <linearGradient id={`${id}wall`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#1E2438" />
        <stop offset="100%" stopColor="#141A2C" />
      </linearGradient>
    </defs>
    <rect x={0} y={0} width={1920} height={876} fill={`url(#${id}wall)`} />
    {/* floor-to-ceiling window with the city at night */}
    <g>
      <rect x={120} y={80} width={1100} height={700} fill="#0B0816" stroke="#2A3355" strokeWidth={6} />
      <rect x={140} y={100} width={1060} height={660} fill="#10182E" />
      <circle cx={1020} cy={200} r={40} fill="#E8EEF7" />
      <circle cx={1000} cy={188} r={9} fill="#C8D2E4" opacity={0.5} />
      {[[200, 300], [320, 420], [460, 260], [600, 480], [720, 340], [860, 520], [980, 300], [1120, 440], [260, 600], [480, 640], [700, 600], [900, 680], [1080, 620], [380, 380], [560, 560], [820, 420], [1020, 560], [180, 500], [1140, 280]].map(([x, y], i) => (
        <g key={i}>
          {i % 4 === 0 ? <GlowDisc cx={x + 13} cy={y + 17} r={34} color={i % 3 === 0 ? '#FFD39A' : '#8FD3FF'} o={0.4} /> : null}
          <rect x={x} y={y} width={26} height={34} fill={i % 3 === 0 ? '#FFD39A' : i % 3 === 1 ? '#8FD3FF' : '#FF9AB8'} opacity={i === 7 ? 0.4 + 0.45 * Math.abs(Math.sin(t * 0.05)) : 0.85} />
        </g>
      ))}
      {[400, 680, 960].map((x) => (
        <path key={x} d={`M ${x} 80 L ${x} 780`} stroke="#2A3355" strokeWidth={5} />
      ))}
      <path d="M 120 430 L 1220 430" stroke="#2A3355" strokeWidth={5} />
      {/* moonlight shaft slanting down-left from the moon (high right) */}
      <Cone d="M 980 160 L 1080 160 L 760 876 L 560 876 Z" o={0.28} />
      <Cone d="M 1000 170 L 1060 170 L 780 876 L 620 876 Z" o={0.18} />
      <ellipse cx={700} cy={880} rx={260} ry={16} fill="#A9C6FF" opacity={0.2} />
      <Dust t={t} seed={31} x0={620} y0={200} w={380} h={620} n={16} o={0.5} />
    </g>
    {/* the desk with two glowing monitors — desk top at waist height for a
        seated person (730), screens at eye level (570-690), stands on the
        desk top. The man sits BETWEEN the two monitors; their glow lights
        his face. */}
    <g>
      <rect x={1280} y={730} width={520} height={20} fill="#3A3446" stroke="#161616" strokeWidth={3} />
      <rect x={1300} y={750} width={480} height={126} fill="#2A2530" stroke="#161616" strokeWidth={4} />
      <rect x={1330} y={570} width={180} height={120} rx={6} fill="#10182E" stroke="#161616" strokeWidth={4} />
      <rect x={1342} y={582} width={156} height={96} fill="#1E3A5A" />
      {[600, 620, 640, 660].map((y, i) => (
        <rect key={y} x={1350} y={y} width={140 - i * 22} height={8} fill="#8FD3FF" opacity={0.8} />
      ))}
      <rect x={1560} y={570} width={180} height={120} rx={6} fill="#10182E" stroke="#161616" strokeWidth={4} />
      <rect x={1572} y={582} width={156} height={96} fill="#1E3A5A" />
      {[600, 620, 640].map((y, i) => (
        <rect key={y} x={1580} y={y} width={120 - i * 30} height={8} fill="#FFD39A" opacity={0.8} />
      ))}
      <rect x={1400} y={690} width={40} height={40} fill="#2A2530" />
      <rect x={1630} y={690} width={40} height={40} fill="#2A2530" />
      {/* monitor glow pools on the desk + a blue wash on the wall behind */}
      <GlowDisc cx={1420} cy={640} r={150} color="#8FD3FF" o={0.42} />
      <GlowDisc cx={1650} cy={640} r={150} color="#FFD39A" o={0.3} />
      <ellipse cx={1540} cy={700} rx={260} ry={18} fill="#8FD3FF" opacity={0.18} />
      <ellipse cx={1540} cy={620} rx={300} ry={120} fill="#8FD3FF" opacity={0.08} />
      {/* energy drink cans + sleep tracker + book stack, on the desk top */}
      <rect x={1330} y={686} width={26} height={44} rx={4} fill="#C0392B" stroke="#161616" strokeWidth={2} />
      <rect x={1364} y={686} width={26} height={44} rx={4} fill="#5E8C46" stroke="#161616" strokeWidth={2} />
      <rect x={1760} y={706} width={50} height={24} rx={10} fill="#161616" stroke="#3A3E4A" strokeWidth={2} />
      <circle cx={1785} cy={718} r={8} fill="#8FD3FF" />
      <rect x={1740} y={690} width={50} height={40} fill="#C0392B" stroke="#161616" strokeWidth={2} transform="rotate(-4 1765 710)" />
      <rect x={1744} y={650} width={50} height={40} fill="#F2C94C" stroke="#161616" strokeWidth={2} transform="rotate(3 1769 670)" />
      <rect x={1748} y={610} width={50} height={40} fill="#3E8C86" stroke="#161616" strokeWidth={2} transform="rotate(-2 1773 630)" />
    </g>
    {/* office chair — seat at y=787 so a seated character's hips sit on it
        (sitY(876) = 787) and the feet land on the floor at 876 */}
    <g>
      <rect x={1420} y={640} width={180} height={147} rx={14} fill="#2E2A3A" stroke="#161616" strokeWidth={4} />
      <rect x={1420} y={787} width={180} height={24} rx={10} fill="#2E2A3A" stroke="#161616" strokeWidth={3} />
      <rect x={1490} y={811} width={20} height={65} fill="#161616" />
      <rect x={1420} y={872} width={180} height={12} rx={6} fill="#161616" />
    </g>
    {/* bookshelf silhouette on the right wall */}
    <g>
      <rect x={1840} y={200} width={80} height={676} fill="#1A1626" />
      {[240, 360, 480, 600, 720].map((y) => (
        <rect key={y} x={1840} y={y} width={80} height={8} fill="#2A2530" />
      ))}
      {[1860, 1880, 1900].map((x, i) => (
        <rect key={x} x={x} y={280 + i * 8} width={12} height={70 - i * 10} fill="#3A4A6A" />
      ))}
    </g>
    <rect x={0} y={876} width={1920} height={204} fill="#241F2A" />
    <path d="M 0 940 L 1920 940" stroke="#1B1620" strokeWidth={3} opacity={0.7} />
    <ellipse cx={960} cy={1000} rx={420} ry={36} fill="#2E2A3A" opacity={0.6} />
    <ellipse cx={960} cy={1000} rx={340} ry={26} fill="none" stroke="#3A3446" strokeWidth={3} opacity={0.7} />
    <RealDefs p="ofr" palette="night" />
    <AtmoHaze color="#1E2438" o={0.09} />
    <Dust t={t} seed={21} x0={300} y0={200} w={600} h={400} n={28} o={0.4} />
    <Vignette p="ofr" o={0.75} />
  </g>
);

/** The bathroom — tiled wall, a big mirror with a warm light above it, a
    sink, a towel, a small window with night sky, a bath mat. The mirror is
    drawn empty here; the scene draws the reflection inside it. Used by S35, S36. */
export const Bathroom: React.FC<{ t: number; id?: string }> = ({ t, id = 'ba' }) => (
  <g>
    <RealDefs p="bar" palette="night" />
    <defs>
      <linearGradient id={`${id}wall`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#2E4A55" />
        <stop offset="100%" stopColor="#1E3240" />
      </linearGradient>
    </defs>
    <rect x={0} y={0} width={1920} height={876} fill={`url(#${id}wall)`} />
    {[0, 1, 2, 3, 4, 5, 6].map((i) => (
      <path key={i} d={`M 0 ${140 + i * 120} L 1920 ${140 + i * 120}`} stroke="#24404C" strokeWidth={3} opacity={0.7} />
    ))}
    {[160, 480, 800, 1120, 1440, 1760].map((x) => (
      <path key={x} d={`M ${x} 0 L ${x} 876`} stroke="#24404C" strokeWidth={3} opacity={0.7} />
    ))}
    {/* a few darker tiles so the wall isn't one flat colour */}
    {[[320, 260], [960, 380], [1280, 140], [1600, 500], [640, 620], [160, 740]].map(([x, y], i) => (
      <rect key={i} x={x} y={y} width={160} height={120} fill="#24404C" opacity={0.45} />
    ))}
    {/* the mirror + warm light bar */}
    <rect x={660} y={140} width={600} height={520} fill="#0E1A22" stroke="#C9A227" strokeWidth={8} />
    <rect x={676} y={156} width={568} height={488} fill="#16242E" />
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
    <rect x={300} y={180} width={220} height={260} fill="#0B0816" stroke="#5A4028" strokeWidth={6} />
    <circle cx={460} cy={260} r={34} fill="#E8EEF7" />
    <ellipse cx={380} cy={330} rx={60} ry={14} fill="#FFFFFF" opacity={0.25} />
    {/* moonlight shaft from the small window — moon left, beam down-right */}
    <WindowShaft p="bar" sill={[320, 500, 440]} floorY={876} dir={1} spread={40} o={0.7} motes={8} seed={11} />
    <rect x={0} y={876} width={1920} height={204} fill="#3A3E4A" />
    <ellipse cx={960} cy={980} rx={260} ry={30} fill="#C85A46" opacity={0.5} />
    <ellipse cx={960} cy={980} rx={260} ry={30} fill="none" stroke="#8A3A2E" strokeWidth={3} opacity={0.5} />
    <path d="M 760 980 L 1160 980 M 800 966 L 1120 966 M 800 994 L 1120 994" stroke="#F6EFE3" strokeWidth={2} opacity={0.25} />
    <AtmoHaze color="#2E4A55" o={0.08} />
    <Vignette p="bar" o={0.7} />
  </g>
);

/** The chalkboard — a dark board on a wall with a chalk grid, wooden frame
    and chalk tray. Diagram scenes draw their content inside it. Used by
    S13, S19, S25, S33, S37. */
export const Chalkboard: React.FC<{ t: number; id?: string; title?: string }> = ({ t, id = 'cb', title }) => (
  <g>
    <rect x={0} y={0} width={1920} height={1080} fill="#1B2340" />
    <path d="M 0 200 L 1920 200 M 0 500 L 1920 500 M 0 800 L 1920 800" stroke="#232B47" strokeWidth={3} opacity={0.6} />
    {/* wainscot line + a soft spotlight cone falling on the board */}
    <path d="M 0 1040 L 1920 1040" stroke="#232B47" strokeWidth={4} opacity={0.6} />
    <polygon points="760,0 1160,0 1380,960 540,960" fill="#FFE9B8" opacity={0.06} />
    <ellipse cx={960} cy={540} rx={700} ry={380} fill="#FFE9B8" opacity={0.05} />
    <Dust t={t} seed={41} x0={700} y0={120} w={520} h={700} n={18} o={0.4} />
    <rect x={180} y={120} width={1560} height={840} rx={10} fill="#10182E" stroke="#7A5230" strokeWidth={14} />
    <rect x={204} y={144} width={1512} height={792} fill="none" stroke="#3A4A6A" strokeWidth={2} opacity={0.6} />
    {[320, 560, 800, 1040, 1280, 1520].map((x) => (
      <path key={x} d={`M ${x} 144 L ${x} 936`} stroke="#1E2A44" strokeWidth={2} opacity={0.5} />
    ))}
    {[280, 440, 600, 760].map((y) => (
      <path key={y} d={`M 204 ${y} L 1716 ${y}`} stroke="#1E2A44" strokeWidth={2} opacity={0.5} />
    ))}
    {/* soft shadow the board throws on the wall */}
    <rect x={196} y={136} width={1560} height={840} rx={10} fill="#000" opacity={0.3} />
    <rect x={760} y={960} width={400} height={16} rx={8} fill="#7A5230" stroke="#241A12" strokeWidth={3} />
    <rect x={820} y={944} width={60} height={14} rx={7} fill="#F6EFE3" />
    <rect x={900} y={944} width={60} height={14} rx={7} fill={SKY} />
    {/* chalk dust on the tray */}
    <ellipse cx={960} cy={956} rx={120} ry={5} fill="#F6EFE3" opacity={0.25} />
    {title ? (
      <text x={960} y={212} textAnchor="middle" fontFamily={FONT.ui} fontSize={34} fill={SKY}>{title}</text>
    ) : null}
    <RealDefs p="cbr" palette="night" />
    <AtmoHaze color="#1B2340" o={0.07} />
    <Vignette p="cbr" o={0.7} />
  </g>
);

/** A shopfront with a big glass window — for the reflection beat (S21).
    The glass is a dark reflective gradient; the scene draws Jake's reflection
    inside it. */
export const ShopFront: React.FC<{ t: number; id?: string }> = ({ t, id = 'sf' }) => (
  <g>
    <defs>
      <linearGradient id={`${id}glass`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#3A4A6A" />
        <stop offset="45%" stopColor="#1E2A44" />
        <stop offset="100%" stopColor="#10182E" />
      </linearGradient>
    </defs>
    <rect x={0} y={0} width={1920} height={876} fill="#2E2A3A" />
    <rect x={0} y={0} width={1920} height={876} fill="none" stroke="#241A26" strokeWidth={6} />
    {/* the glass — dark, reflective, with the street mirrored faintly in it */}
    <rect x={240} y={120} width={1440} height={700} fill={`url(#${id}glass)`} stroke="#5A4028" strokeWidth={10} />
    <path d="M 240 470 L 1680 470 M 960 120 L 960 820" stroke="#5A4028" strokeWidth={6} />
    <polygon points="240,120 700,120 500,820 240,820" fill="#FFFFFF" opacity={0.09} />
    <polygon points="900,120 1200,120 1000,820 760,820" fill="#FFFFFF" opacity={0.07} />
    <polygon points="1300,120 1560,120 1400,820 1180,820" fill="#FFFFFF" opacity={0.05} />
    {/* neon OPEN sign glowing in the glass */}
    <GlowDisc cx={960} cy={300} r={110} color="#FF6A9A" o={0.45} />
    <text x={960} y={310} textAnchor="middle" fontFamily={FONT.ui} fontSize={44} fontWeight={700} fill="#FF9AB8">OPEN</text>
    {/* interior silhouettes behind the glass */}
    <rect x={420} y={620} width={180} height={200} fill="#0E0C1E" opacity={0.7} />
    <rect x={1300} y={600} width={220} height={220} fill="#0E0C1E" opacity={0.7} />
    <circle cx={1500} cy={300} r={40} fill="#FFD39A" opacity={0.5} />
    <GlowDisc cx={1500} cy={300} r={120} color="#FFD39A" o={0.3} />
    {/* awning + sign + the shadow it throws on the glass */}
    <polygon points="200,140 1720,140 1680,80 240,80" fill="#3E8C86" stroke="#241A26" strokeWidth={4} />
    <polygon points="200,140 1720,140 1720,180 200,180" fill="#000" opacity={0.25} />
    <text x={960} y={122} textAnchor="middle" fontFamily={FONT.ui} fontSize={30} fill="#F6EFE3">CORNER SHOP</text>
    <rect x={0} y={876} width={1920} height={204} fill="#3A3440" />
    <path d="M 0 920 L 1920 920" stroke="#2A2530" strokeWidth={3} opacity={0.7} />
    {/* sidewalk slab joints + a puddle catching the neon */}
    {[240, 560, 880, 1200, 1520, 1840].map((x) => (
      <path key={x} d={`M ${x} 876 L ${x - 10} 1080`} stroke="#2A2530" strokeWidth={2} opacity={0.6} />
    ))}
    <ellipse cx={960} cy={1000} rx={150} ry={12} fill="#FF6A9A" opacity={0.14} />
    <ellipse cx={960} cy={1000} rx={150} ry={12} fill="none" stroke="#FF9AB8" strokeWidth={2} opacity={0.3} />
    <RealDefs p="sfr" palette="night" />
    <AtmoHaze color="#2E2A3A" o={0.08} />
    <Vignette p="sfr" o={0.7} />
  </g>
);

// ---------------------------------------------------------------------------
// Durations — from the script's narration word counts at Archer's measured
// pace (0.357 s/word), min 4s per beat, S43 end card 4.0s. Total 608.79s.
// PLACEHOLDER: re-time exactly from the Archer VO alignment when it exists.
// ---------------------------------------------------------------------------

export const DUR: Record<string, number> = {
  S1: 13.21, S2: 11.78, S3: 12.85, S4: 11.78, S5: 13.92, S6: 12.14,
  S7: 9.28, S8: 11.78, S9: 12.14, S10: 15.0, S11: 13.57, S12: 15.35,
  S13: 14.64, S14: 15.71, S15: 16.42, S16: 18.57, S17: 12.85, S18: 15.71,
  S19: 16.42, S20: 12.85, S21: 16.78, S22: 18.57, S23: 14.64, S24: 12.85,
  S25: 17.85, S26: 14.28, S27: 13.21, S28: 14.28, S29: 13.57, S30: 13.92,
  S31: 13.57, S32: 15.35, S33: 17.49, S34: 13.92, S35: 12.5, S36: 13.92,
  S37: 16.78, S38: 18.57, S39: 16.07, S40: 10.71, S41: 11.07, S42: 18.92,
  S43: 4.0,
};

// A scene's local clock in frames: f = t * 30, len = duration * 30.
const F = (api: { t: number; fps: number }) => api.t * api.fps;

/** Format seconds as a countdown "00:MM:SS". */
const mmss = (s: number) => `00:${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.max(0, s % 60)).padStart(2, '0')}`;

// ===========================================================================
// COLD OPEN
// ===========================================================================

// S1 — A busy city street. Jake walks through the crowd. Above every head, a
// glowing sky-blue number. Jake stares at one man ahead of him. Camera: slow
// push-in. Jake mid-stride (yaw 1, WALK pose) translating right through the
// crowd; six pedestrians with countdowns; the stranger ahead in a dark suit,
// phone to his ear, "00:02:47" glowing above him. The street is a full world:
// gradient sky, sun, three depths of skyline, storefronts, lamps, crosswalk.
defineScene({
  id: 'S1',
  durationSec: DUR.S1,
  characters: [
    { who: 'jake', x: 0.45, feetY: ROOM_FLOOR_V },
    { who: 'suit', x: 0.68, feetY: ROOM_FLOOR_V },
    { who: 'guestA', x: 0.12, feetY: ROOM_FLOOR_V },
    { who: 'guestB', x: 0.22, feetY: ROOM_FLOOR_V },
    { who: 'guestC', x: 0.32, feetY: ROOM_FLOOR_V },
    { who: 'student', x: 0.58, feetY: ROOM_FLOOR_V },
    { who: 'teacher', x: 0.8, feetY: ROOM_FLOOR_V },
    { who: 'teenager', x: 0.9, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const pj = pose('S1', 'jake', f, [
      { f: 0, p: { ...basePose, x: 700, y: standY(1, ROOM_FLOOR_V), scale: 1, ...WALK, yaw: 1, expr: 'worried' } },
      { f: len, p: { ...basePose, x: 1000, y: standY(1, ROOM_FLOOR_V), scale: 1, ...WALK, yaw: 1, expr: 'worried' } },
    ]);
    const faceJ = faceAt(f, [[0, 'worried']]);
    // The stranger ahead — dark suit, phone to his ear, walking fast, the
    // countdown "00:02:47" glowing above him.
    const ps = pose('S1', 'stranger', f, [
      { f: 0, p: { ...basePose, x: 1300, y: standY(1, ROOM_FLOOR_V), scale: 1, ...WALK, yaw: 1, armR: { a: 55, b: 70 }, handR: 'open', expr: 'angry' } },
      { f: len, p: { ...basePose, x: 1450, y: standY(1, ROOM_FLOOR_V), scale: 1, ...WALK, yaw: 1, armR: { a: 55, b: 70 }, handR: 'open', expr: 'angry' } },
    ]);
    const faceS = faceAt(f, [[0, 'angry']]);
    const hs = toWorld(ps, joints(ps, true).armR.end);
    const zoom = kf(f, [[0, 1.0], [len, 1.1]]);
    return (
      <g>
        <g transform={camT(960, 560, zoom)}>
          <CityStreet t={f} mode="day" id="s1" />
          {Ped({ scene: 'S1', label: 'ped1', x: 230, look: 'guestA', scale: 0.9, tag: '12:04', expr: 'neutral', yaw: -1 }, f, len)}
          {Ped({ scene: 'S1', label: 'ped2', x: 420, look: 'guestB', scale: 0.95, tag: '18 YRS', expr: 'neutral', yaw: 1 }, f, len)}
          {Ped({ scene: 'S1', label: 'ped3', x: 610, look: 'guestC', scale: 0.85, tag: '3 DAYS', expr: 'neutral', yaw: -1 }, f, len)}
          {Ped({ scene: 'S1', label: 'ped4', x: 1180, look: 'student', scale: 0.8, tag: '6 HRS', expr: 'neutral', yaw: -1 }, f, len)}
          {Ped({ scene: 'S1', label: 'ped5', x: 1620, look: 'teacher', scale: 0.95, tag: '44 YRS', expr: 'neutral', yaw: 1 }, f, len)}
          {Ped({ scene: 'S1', label: 'ped6', x: 1790, look: 'teenager', scale: 0.9, tag: '9 DAYS', expr: 'neutral', yaw: -1 }, f, len)}
          {footShadows(pj)}
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...pj, ...faceJ, facing: 1 }} rimId="rimR" shadow={0} />)}
          {footShadows(ps)}
          {cast('suit', <Hero slim look={LOOKS.suit} pose={{ ...ps, ...faceS, facing: 1 }} rimId="rimR" shadow={0} />)}
          {/* phone at the stranger's ear */}
          <rect x={hs.x - 9} y={hs.y - 34} width={18} height={34} rx={4} fill="#161616" stroke="#3A3E4A" strokeWidth={2} />
          <rect x={hs.x - 6} y={hs.y - 30} width={12} height={26} rx={2} fill="#8FD3FF" opacity={0.85} />
          <Countdown x={ps.x} y={countdownY(ps.y, 1)} text="00:02:47" size={36} />
        </g>
      </g>
    );
  },
});

// S2 — Close-up on the stranger's countdown: "00:02:47" ticking down to
// "00:02:31". The man walks fast, phone to his ear, not looking up. Camera:
// hold still. The tag is the shot: big, glowing, actually ticking (167s down
// to 151s across the scene). The stranger fills the right of frame; Jake
// follows small at the left edge.
defineScene({
  id: 'S2',
  durationSec: DUR.S2,
  characters: [
    { who: 'suit', x: 0.6, feetY: ROOM_FLOOR_V },
    { who: 'jake', x: 0.3, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const ps = pose('S2', 'stranger', f, [
      { f: 0, p: { ...basePose, x: 950, y: standY(1.15, ROOM_FLOOR_V), scale: 1.15, ...WALK, yaw: 1, armR: { a: 55, b: 70 }, handR: 'open', expr: 'angry' } },
      { f: len, p: { ...basePose, x: 1180, y: standY(1.15, ROOM_FLOOR_V), scale: 1.15, ...WALK, yaw: 1, armR: { a: 55, b: 70 }, handR: 'open', expr: 'angry' } },
    ]);
    const faceS = faceAt(f, [[0, 'angry']]);
    const hs = toWorld(ps, joints(ps, true).armR.end);
    const pj = pose('S2', 'jake', f, [
      { f: 0, p: { ...basePose, x: 420, y: standY(0.85, ROOM_FLOOR_V), scale: 0.85, ...WALK, yaw: 1, expr: 'worried' } },
      { f: len, p: { ...basePose, x: 620, y: standY(0.85, ROOM_FLOOR_V), scale: 0.85, ...WALK, yaw: 1, expr: 'worried' } },
    ]);
    const faceJ = faceAt(f, [[0, 'worried']]);
    // the countdown actually ticks: 167s -> 151s across the scene
    const secs = 167 - Math.floor((16 * f) / len);
    return (
      <g>
        <g transform={camT(1150, 480, 1.3)}>
          <CityStreet t={f} mode="day" id="s2" />
          {footShadows(pj)}
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...pj, ...faceJ, facing: 1 }} rimId="rimR" shadow={0} />)}
          {footShadows(ps)}
          {cast('suit', <Hero slim look={LOOKS.suit} pose={{ ...ps, ...faceS, facing: 1 }} rimId="rimR" shadow={0} />)}
          <rect x={hs.x - 10} y={hs.y - 38} width={20} height={38} rx={4} fill="#161616" stroke="#3A3E4A" strokeWidth={2} />
          <rect x={hs.x - 7} y={hs.y - 33} width={14} height={29} rx={2} fill="#8FD3FF" opacity={0.85} />
          <Countdown x={ps.x} y={countdownY(ps.y, 1.15) - 30} text={mmss(secs)} size={62} />
        </g>
      </g>
    );
  },
});

// S3 — Detective pops up in the background at the far-left edge, small, brass
// magnifying glass in hand, pointing at the countdown. Jake is the focus.
// Camera: hold still. Jake front-facing centre, puzzled. The stranger ahead
// right with "00:02:31". The Detective is SMALL (scale 0.5), at the edge, in
// shadow — a cameo, never the subject. Magnifier raised in his right hand.
defineScene({
  id: 'S3',
  durationSec: DUR.S3,
  characters: [
    { who: 'jake', x: 0.5, feetY: ROOM_FLOOR_V },
    { who: 'suit', x: 0.73, feetY: ROOM_FLOOR_V },
    { who: 'detective', x: 0.06, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const pj = pose('S3', 'jake', f, [
      { f: 0, p: { ...basePose, x: 960, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, headTilt: 5, expr: 'puzzled' } },
      { f: len, p: { ...basePose, x: 960, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, headTilt: 5, expr: 'puzzled' } },
    ]);
    const faceJ = faceAt(f, [[0, 'puzzled']]);
    const ps = pose('S3', 'stranger', f, [
      { f: 0, p: { ...basePose, x: 1400, y: standY(0.9, ROOM_FLOOR_V), scale: 0.9, ...WALK, yaw: 1, armR: { a: 55, b: 70 }, handR: 'open', expr: 'angry' } },
      { f: len, p: { ...basePose, x: 1520, y: standY(0.9, ROOM_FLOOR_V), scale: 0.9, ...WALK, yaw: 1, armR: { a: 55, b: 70 }, handR: 'open', expr: 'angry' } },
    ]);
    const faceS = faceAt(f, [[0, 'angry']]);
    // Detective — background pop-up, half size, far-left edge, magnifier up.
    const pd = pose('S3', 'detective', f, [
      { f: 0, p: { ...basePose, x: 110, y: standY(0.5, ROOM_FLOOR_V), scale: 0.5, ...STAND, armR: { a: 100, b: 45 }, handR: 'open', headTilt: -6, expr: 'smug' } },
      { f: len, p: { ...basePose, x: 110, y: standY(0.5, ROOM_FLOOR_V), scale: 0.5, ...STAND, armR: { a: 100, b: 45 }, handR: 'open', headTilt: -6, expr: 'smug' } },
    ]);
    const faceD = faceAt(f, [[0, 'smug']]);
    const hd = toWorld(pd, joints(pd, true).armR.end);
    return (
      <g>
        <g transform={camT(960, 560, 1.0)}>
          <CityStreet t={f} mode="day" id="s3" />
          {footShadows(pj)}
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...pj, ...faceJ, facing: 1 }} rimId="rimR" shadow={0} />)}
          {footShadows(ps)}
          {cast('suit', <Hero slim look={LOOKS.suit} pose={{ ...ps, ...faceS, facing: 1 }} rimId="rimR" shadow={0} />)}
          <Countdown x={ps.x} y={countdownY(ps.y, 0.9)} text="00:02:31" size={32} />
          {cast('detective', <Hero slim look={LOOKS.detective} pose={{ ...pd, ...faceD, facing: 1 }} rimId="rimBlue" shadow={1} />)}
          <Magnifier x={hd.x} y={hd.y} s={0.7} />
        </g>
      </g>
    );
  },
});

// S4 — Jake looks at the camera. Behind him, the crowd walks by, each with a
// glowing number overhead. Camera: slow push-in on Jake. Direct address:
// Jake front-facing centre, neutral, speaking to the viewer; the crowd moves
// behind him at smaller scale, each tagged.
defineScene({
  id: 'S4',
  durationSec: DUR.S4,
  characters: [
    { who: 'jake', x: 0.5, feetY: ROOM_FLOOR_V },
    { who: 'guestA', x: 0.18, feetY: ROOM_FLOOR_V },
    { who: 'guestB', x: 0.32, feetY: ROOM_FLOOR_V },
    { who: 'guestC', x: 0.68, feetY: ROOM_FLOOR_V },
    { who: 'teacher', x: 0.82, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const pj = pose('S4', 'jake', f, [
      { f: 0, p: { ...basePose, x: 960, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, expr: 'neutral' } },
      { f: len, p: { ...basePose, x: 960, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, expr: 'neutral' } },
    ]);
    const faceJ = faceAt(f, [[0, 'neutral']]);
    const zoom = kf(f, [[0, 1.0], [len, 1.15]]);
    return (
      <g>
        <g transform={camT(960, 530, zoom)}>
          <CityStreet t={f} mode="day" id="s4" />
          {Ped({ scene: 'S4', label: 'ped1', x: 340, look: 'guestA', scale: 0.8, tag: '7 YRS', expr: 'neutral', yaw: 1 }, f, len)}
          {Ped({ scene: 'S4', label: 'ped2', x: 600, look: 'guestB', scale: 0.85, tag: '2 DAYS', expr: 'neutral', yaw: -1 }, f, len)}
          {Ped({ scene: 'S4', label: 'ped3', x: 1300, look: 'guestC', scale: 0.8, tag: '31 YRS', expr: 'neutral', yaw: 1 }, f, len)}
          {Ped({ scene: 'S4', label: 'ped4', x: 1580, look: 'teacher', scale: 0.85, tag: '5 HRS', expr: 'neutral', yaw: -1 }, f, len)}
          {footShadows(pj)}
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...pj, ...faceJ, facing: 1 }} rimId="rimR" shadow={0} />)}
        </g>
      </g>
    );
  },
});

// ===========================================================================
// CHAPTER 1 — THE THREE-MINUTE MAN
// ===========================================================================

// S5 — The stranger rushes through the crowd, phone to his ear, gesturing
// angrily. His countdown reads "00:01:58". Jake hurries after him. Camera:
// gentle pan right. The stranger gestures with his free arm; Jake follows
// behind, worried, mid-stride.
defineScene({
  id: 'S5',
  durationSec: DUR.S5,
  characters: [
    { who: 'suit', x: 0.52, feetY: ROOM_FLOOR_V },
    { who: 'jake', x: 0.34, feetY: ROOM_FLOOR_V },
    { who: 'guestA', x: 0.15, feetY: ROOM_FLOOR_V },
    { who: 'guestB', x: 0.85, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const ps = pose('S5', 'stranger', f, [
      { f: 0, p: { ...basePose, x: 940, y: standY(1, ROOM_FLOOR_V), scale: 1, ...WALK, yaw: 1, armL: { a: 120, b: 20 }, handL: 'open', armR: { a: 55, b: 70 }, handR: 'open', expr: 'angry' } },
      { f: len, p: { ...basePose, x: 1120, y: standY(1, ROOM_FLOOR_V), scale: 1, ...WALK, yaw: 1, armL: { a: 120, b: 20 }, handL: 'open', armR: { a: 55, b: 70 }, handR: 'open', expr: 'angry' } },
    ]);
    const faceS = faceAt(f, [[0, 'angry']]);
    const hs = toWorld(ps, joints(ps, true).armR.end);
    const pj = pose('S5', 'jake', f, [
      { f: 0, p: { ...basePose, x: 620, y: standY(1, ROOM_FLOOR_V), scale: 1, ...WALK, yaw: 1, expr: 'worried' } },
      { f: len, p: { ...basePose, x: 820, y: standY(1, ROOM_FLOOR_V), scale: 1, ...WALK, yaw: 1, expr: 'worried' } },
    ]);
    const faceJ = faceAt(f, [[0, 'worried']]);
    const pan = kf(f, [[0, 880], [len, 1080]]);
    return (
      <g>
        <g transform={camT(pan, 560, 1.05)}>
          <CityStreet t={f} mode="day" id="s5" />
          {Ped({ scene: 'S5', label: 'ped1', x: 300, look: 'guestA', scale: 0.9, tag: '14 YRS', expr: 'neutral', yaw: -1 }, f, len)}
          {Ped({ scene: 'S5', label: 'ped2', x: 1640, look: 'guestB', scale: 0.9, tag: '8 DAYS', expr: 'neutral', yaw: 1 }, f, len)}
          {footShadows(pj)}
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...pj, ...faceJ, facing: 1 }} rimId="rimR" shadow={0} />)}
          {footShadows(ps)}
          {cast('suit', <Hero slim look={LOOKS.suit} pose={{ ...ps, ...faceS, facing: 1 }} rimId="rimR" shadow={0} />)}
          <rect x={hs.x - 9} y={hs.y - 34} width={18} height={34} rx={4} fill="#161616" stroke="#3A3E4A" strokeWidth={2} />
          <rect x={hs.x - 6} y={hs.y - 30} width={12} height={26} rx={2} fill="#8FD3FF" opacity={0.85} />
          <Countdown x={ps.x} y={countdownY(ps.y, 1)} text="00:01:58" size={34} />
        </g>
      </g>
    );
  },
});

// S6 — Jake catches up, reaches for the man's arm. The man shrugs him off
// without looking. Countdown: "00:01:20". Camera: hold still. Jake reaches
// with his right arm; the stranger's left arm swings back, shrugging him off.
defineScene({
  id: 'S6',
  durationSec: DUR.S6,
  characters: [
    { who: 'jake', x: 0.42, feetY: ROOM_FLOOR_V },
    { who: 'suit', x: 0.55, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const pj = pose('S6', 'jake', f, [
      { f: 0, p: { ...basePose, x: 780, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, yaw: 1, armR: { a: 80, b: 5 }, handR: 'open', expr: 'determined' } },
      { f: len, p: { ...basePose, x: 780, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, yaw: 1, armR: { a: 80, b: 5 }, handR: 'open', expr: 'determined' } },
    ]);
    const faceJ = faceAt(f, [[0, 'determined']]);
    const ps = pose('S6', 'stranger', f, [
      { f: 0, p: { ...basePose, x: 1060, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, yaw: 1, armL: { a: -50, b: 40 }, armR: { a: 55, b: 70 }, handR: 'open', expr: 'angry' } },
      { f: len, p: { ...basePose, x: 1060, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, yaw: 1, armL: { a: -50, b: 40 }, armR: { a: 55, b: 70 }, handR: 'open', expr: 'angry' } },
    ]);
    const faceS = faceAt(f, [[0, 'angry']]);
    const hs = toWorld(ps, joints(ps, true).armR.end);
    return (
      <g>
        <g transform={camT(960, 560, 1.05)}>
          <CityStreet t={f} mode="day" id="s6" />
          {footShadows(pj)}
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...pj, ...faceJ, facing: 1 }} rimId="rimR" shadow={0} />)}
          {footShadows(ps)}
          {cast('suit', <Hero slim look={LOOKS.suit} pose={{ ...ps, ...faceS, facing: 1 }} rimId="rimR" shadow={0} />)}
          <rect x={hs.x - 9} y={hs.y - 34} width={18} height={34} rx={4} fill="#161616" stroke="#3A3E4A" strokeWidth={2} />
          <rect x={hs.x - 6} y={hs.y - 30} width={12} height={26} rx={2} fill="#8FD3FF" opacity={0.85} />
          <Countdown x={ps.x} y={countdownY(ps.y, 1)} text="00:01:20" size={34} />
        </g>
      </g>
    );
  },
});

// S7 — The countdown ticks past "00:00:30". The man stops at a crosswalk,
// still on the phone. Jake stands frozen behind him. Camera: slow push-in.
// The tag ticks 30s down to 8s across the scene; the crosswalk stripes are
// under the stranger's feet.
defineScene({
  id: 'S7',
  durationSec: DUR.S7,
  characters: [
    { who: 'suit', x: 0.57, feetY: ROOM_FLOOR_V },
    { who: 'jake', x: 0.42, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const ps = pose('S7', 'stranger', f, [
      { f: 0, p: { ...basePose, x: 1100, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, yaw: 1, armR: { a: 55, b: 70 }, handR: 'open', expr: 'angry' } },
      { f: len, p: { ...basePose, x: 1100, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, yaw: 1, armR: { a: 55, b: 70 }, handR: 'open', expr: 'angry' } },
    ]);
    const faceS = faceAt(f, [[0, 'angry']]);
    const hs = toWorld(ps, joints(ps, true).armR.end);
    const pj = pose('S7', 'jake', f, [
      { f: 0, p: { ...basePose, x: 800, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, expr: 'scared' } },
      { f: len, p: { ...basePose, x: 800, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, expr: 'scared' } },
    ]);
    const faceJ = faceAt(f, [[0, 'scared']]);
    const secs = 30 - Math.floor((22 * f) / len);
    const zoom = kf(f, [[0, 1.0], [len, 1.12]]);
    return (
      <g>
        <g transform={camT(960, 560, zoom)}>
          <CityStreet t={f} mode="day" id="s7" />
          {footShadows(pj)}
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...pj, ...faceJ, facing: 1 }} rimId="rimR" shadow={0} />)}
          {footShadows(ps)}
          {cast('suit', <Hero slim look={LOOKS.suit} pose={{ ...ps, ...faceS, facing: 1 }} rimId="rimR" shadow={0} />)}
          <rect x={hs.x - 9} y={hs.y - 34} width={18} height={34} rx={4} fill="#161616" stroke="#3A3E4A" strokeWidth={2} />
          <rect x={hs.x - 6} y={hs.y - 30} width={12} height={26} rx={2} fill="#8FD3FF" opacity={0.85} />
          <Countdown x={ps.x} y={countdownY(ps.y, 1)} text={mmss(secs)} size={38} />
        </g>
      </g>
    );
  },
});

// S8 — The countdown hits "00:00:00". Nothing explodes. The man lowers his
// phone, looks up at the sky for the first time, and takes a slow breath.
// Camera: hold still. The stranger faces the viewer, head tilted back
// (headTilt -8, the look-up convention), phone lowered to his side, the tag
// reading "00:00:00". Jake watches, shocked.
defineScene({
  id: 'S8',
  durationSec: DUR.S8,
  characters: [
    { who: 'suit', x: 0.52, feetY: ROOM_FLOOR_V },
    { who: 'jake', x: 0.34, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const ps = pose('S8', 'stranger', f, [
      { f: 0, p: { ...basePose, x: 1000, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, headTilt: -8, armR: { a: 10, b: 10 }, handR: 'open', expr: 'shock' } },
      { f: len, p: { ...basePose, x: 1000, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, headTilt: -8, armR: { a: 10, b: 10 }, handR: 'open', expr: 'shock' } },
    ]);
    const faceS = faceAt(f, [[0, 'shock']]);
    const pj = pose('S8', 'jake', f, [
      { f: 0, p: { ...basePose, x: 650, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, expr: 'shock' } },
      { f: len, p: { ...basePose, x: 650, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, expr: 'shock' } },
    ]);
    const faceJ = faceAt(f, [[0, 'shock']]);
    return (
      <g>
        <g transform={camT(960, 540, 1.05)}>
          <CityStreet t={f} mode="day" id="s8" />
          {footShadows(pj)}
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...pj, ...faceJ, facing: 1 }} rimId="rimR" shadow={0} />)}
          {footShadows(ps)}
          {cast('suit', <Hero slim look={LOOKS.suit} pose={{ ...ps, ...faceS, facing: 1 }} rimId="rimR" shadow={0} />)}
          <Countdown x={ps.x} y={countdownY(ps.y, 1)} text="00:00:00" size={38} />
        </g>
      </g>
    );
  },
});

// S9 — The man smiles faintly, puts his phone in his pocket, and walks on —
// slower now. Above his head, the number is GONE. Jake stares after him.
// Camera: slow pull back. The stranger walks away at half pace, phone going
// into his pocket (arm bent across the body); no tag above him — the absence
// IS the beat. Jake stands still, puzzled, watching him go.
defineScene({
  id: 'S9',
  durationSec: DUR.S9,
  characters: [
    { who: 'suit', x: 0.5, feetY: ROOM_FLOOR_V },
    { who: 'jake', x: 0.31, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const ps = pose('S9', 'stranger', f, [
      { f: 0, p: { ...basePose, x: 900, y: standY(1, ROOM_FLOOR_V), scale: 1, ...WALK, yaw: 1, armR: { a: 40, b: 60 }, handR: 'open', expr: 'happy' } },
      { f: len, p: { ...basePose, x: 1200, y: standY(1, ROOM_FLOOR_V), scale: 1, ...WALK, yaw: 1, armR: { a: 40, b: 60 }, handR: 'open', expr: 'happy' } },
    ]);
    const faceS = faceAt(f, [[0, 'happy']]);
    const pj = pose('S9', 'jake', f, [
      { f: 0, p: { ...basePose, x: 600, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, yaw: 1, expr: 'puzzled' } },
      { f: len, p: { ...basePose, x: 600, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, yaw: 1, expr: 'puzzled' } },
    ]);
    const faceJ = faceAt(f, [[0, 'puzzled']]);
    const zoom = kf(f, [[0, 1.12], [len, 1.0]]);
    return (
      <g>
        <g transform={camT(960, 560, zoom)}>
          <CityStreet t={f} mode="day" id="s9" />
          {footShadows(pj)}
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...pj, ...faceJ, facing: 1 }} rimId="rimR" shadow={0} />)}
          {footShadows(ps)}
          {cast('suit', <Hero slim look={LOOKS.suit} pose={{ ...ps, ...faceS, facing: 1 }} rimId="rimR" shadow={0} />)}
          {/* NO countdown above the stranger — the number is gone. */}
        </g>
      </g>
    );
  },
});

// S10 — Jake looks up at the sky, then back at the crowd. Every countdown is
// still there, ticking. Camera: slow push-in. Jake centre, front-facing; his
// head tilts up (headTilt -8) then back to level over the scene — one smooth
// movement, head leads. The crowd behind him, every head tagged.
defineScene({
  id: 'S10',
  durationSec: DUR.S10,
  characters: [
    { who: 'jake', x: 0.5, feetY: ROOM_FLOOR_V },
    { who: 'guestA', x: 0.2, feetY: ROOM_FLOOR_V },
    { who: 'guestB', x: 0.33, feetY: ROOM_FLOOR_V },
    { who: 'guestC', x: 0.67, feetY: ROOM_FLOOR_V },
    { who: 'student', x: 0.8, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const pj = pose('S10', 'jake', f, [
      { f: 0, p: { ...basePose, x: 960, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, headTilt: -8, expr: 'puzzled' } },
      { f: Math.round(len * 0.45), p: { ...basePose, x: 960, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, headTilt: -8, expr: 'puzzled' } },
      { f: len, p: { ...basePose, x: 960, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, headTilt: 0, expr: 'puzzled' } },
    ]);
    const faceJ = faceAt(f, [[0, 'puzzled']]);
    const zoom = kf(f, [[0, 1.0], [len, 1.12]]);
    return (
      <g>
        <g transform={camT(960, 540, zoom)}>
          <CityStreet t={f} mode="day" id="s10" />
          {Ped({ scene: 'S10', label: 'ped1', x: 380, look: 'guestA', scale: 0.85, tag: '3 YRS', expr: 'neutral', yaw: -1 }, f, len)}
          {Ped({ scene: 'S10', label: 'ped2', x: 630, look: 'guestB', scale: 0.9, tag: '11 DAYS', expr: 'neutral', yaw: 1 }, f, len)}
          {Ped({ scene: 'S10', label: 'ped3', x: 1290, look: 'guestC', scale: 0.85, tag: '22 YRS', expr: 'neutral', yaw: -1 }, f, len)}
          {Ped({ scene: 'S10', label: 'ped4', x: 1540, look: 'student', scale: 0.8, tag: '4 HRS', expr: 'neutral', yaw: 1 }, f, len)}
          {footShadows(pj)}
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...pj, ...faceJ, facing: 1 }} rimId="rimR" shadow={0} />)}
        </g>
      </g>
    );
  },
});

// ===========================================================================
// CHAPTER 2 — THE CLOCK IN YOUR HEAD
// ===========================================================================

// S11 — A park. Jake's friend sits on a bench, laughing, holding a coffee.
// Above her head: "40 YEARS". Jake stares. Camera: slow push-in. The friend
// (guestB look — curly hair, red jacket — the same look in every friend scene
// so she reads as the same person) sits on the bench, coffee in hand, happy;
// her tag glows "40 YEARS". Jake stands left, shocked, staring.
defineScene({
  id: 'S11',
  durationSec: DUR.S11,
  characters: [
    { who: 'guestB', x: 0.68, feetY: ROOM_FLOOR_V },
    { who: 'jake', x: 0.42, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const pf = pose('S11', 'friend', f, [
      { f: 0, p: { ...basePose, x: 1300, y: sitY(FLOOR_PX), scale: 1, ...SIT, yaw: -1, armR: { a: 55, b: 65 }, handR: 'open', expr: 'happy' } },
      { f: len, p: { ...basePose, x: 1300, y: sitY(FLOOR_PX), scale: 1, ...SIT, yaw: -1, armR: { a: 55, b: 65 }, handR: 'open', expr: 'happy' } },
    ]);
    const faceF = faceAt(f, [[0, 'happy']]);
    const hf = toWorld(pf, joints(pf, true).armR.end);
    const pj = pose('S11', 'jake', f, [
      { f: 0, p: { ...basePose, x: 800, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, yaw: 1, expr: 'shock' } },
      { f: len, p: { ...basePose, x: 800, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, yaw: 1, expr: 'shock' } },
    ]);
    const faceJ = faceAt(f, [[0, 'shock']]);
    const zoom = kf(f, [[0, 1.0], [len, 1.12]]);
    return (
      <g>
        <g transform={camT(1100, 600, zoom)}>
          <Park t={f} mode="day" id="s11" />
          {footShadows(pf)}
          {cast('guestB', <Hero slim look={LOOKS.guestB} pose={{ ...pf, ...faceF, facing: 1 }} rimId="rimR" shadow={0} />)}
          {/* coffee cup in her hand */}
          <rect x={hf.x - 10} y={hf.y - 26} width={20} height={26} rx={4} fill="#F6EFE3" stroke="#161616" strokeWidth={2} />
          <rect x={hf.x - 10} y={hf.y - 26} width={20} height={8} rx={4} fill="#6A4526" />
          <Countdown x={pf.x} y={countdownY(pf.y, 1)} text="40 YEARS" size={34} />
          {footShadows(pj)}
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...pj, ...faceJ, facing: 1 }} rimId="rimR" shadow={0} />)}
        </g>
      </g>
    );
  },
});

// S12 — Split screen: the friend laughing on the bench / the businessman
// from S5 still arguing on his phone, his number now reading "6 DAYS".
// Camera: hold still. Two half-worlds side by side: the park bench on the
// left (friend, "40 YEARS"), the street on the right (businessman, "6 DAYS"),
// divided by a dark seam. Each half is drawn at 0.7 scale.
defineScene({
  id: 'S12',
  durationSec: DUR.S12,
  characters: [
    { who: 'guestB', x: 0.25, feetY: 0.833 },
    { who: 'suit', x: 0.75, feetY: 0.833 },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const pf = pose('S12', 'friend', f, [
      { f: 0, p: { ...basePose, x: 480, y: sitY(FLOOR_PX), scale: 0.7, ...SIT, expr: 'happy' } },
      { f: len, p: { ...basePose, x: 480, y: sitY(FLOOR_PX), scale: 0.7, ...SIT, expr: 'happy' } },
    ]);
    const faceF = faceAt(f, [[0, 'happy']]);
    const ps = pose('S12', 'stranger', f, [
      { f: 0, p: { ...basePose, x: 1440, y: standY(0.7, ROOM_FLOOR_V), scale: 0.7, ...STAND, yaw: -1, armR: { a: 55, b: 70 }, handR: 'open', expr: 'angry' } },
      { f: len, p: { ...basePose, x: 1440, y: standY(0.7, ROOM_FLOOR_V), scale: 0.7, ...STAND, yaw: -1, armR: { a: 55, b: 70 }, handR: 'open', expr: 'angry' } },
    ]);
    const faceS = faceAt(f, [[0, 'angry']]);
    const hs = toWorld(ps, joints(ps, true).armR.end);
    return (
      <g>
        <g transform={camT(960, 560, 1.0)}>
          <defs>
            <clipPath id="s12left"><rect x={0} y={0} width={960} height={1080} /></clipPath>
            <clipPath id="s12right"><rect x={960} y={0} width={960} height={1080} /></clipPath>
          </defs>
          {/* left half — the park bench, friend laughing. The Park set's own
              bench sits right of the split, so this half draws its own bench
              under the friend (seat top y=787, so her feet land on the ground). */}
          <g clipPath="url(#s12left)">
            <Park t={f} mode="day" id="s12p" />
            <g>
              <rect x={300} y={787} width={360} height={18} fill="#7A5230" stroke="#241A12" strokeWidth={3} />
              <rect x={300} y={817} width={360} height={18} fill="#6A4526" stroke="#241A12" strokeWidth={3} />
              <rect x={300} y={727} width={360} height={18} fill="#7A5230" stroke="#241A12" strokeWidth={3} />
              <rect x={300} y={757} width={360} height={18} fill="#6A4526" stroke="#241A12" strokeWidth={3} />
              <rect x={320} y={727} width={14} height={159} fill="#2A2530" />
              <rect x={626} y={727} width={14} height={159} fill="#2A2530" />
              <ellipse cx={480} cy={890} rx={200} ry={10} fill="#000" opacity={0.2} />
            </g>
            {footShadows(pf)}
            {cast('guestB', <Hero slim look={LOOKS.guestB} pose={{ ...pf, ...faceF, facing: 1 }} rimId="rimR" shadow={0} />)}
            <Countdown x={pf.x} y={countdownY(pf.y, 0.7)} text="40 YEARS" size={26} />
          </g>
          {/* right half — the street, the businessman still arguing */}
          <g clipPath="url(#s12right)">
            <CityStreet t={f} mode="day" id="s12c" />
            {footShadows(ps)}
            {cast('suit', <Hero slim look={LOOKS.suit} pose={{ ...ps, ...faceS, facing: 1 }} rimId="rimR" shadow={0} />)}
            <rect x={hs.x - 7} y={hs.y - 26} width={14} height={26} rx={3} fill="#161616" stroke="#3A3E4A" strokeWidth={2} />
            <rect x={hs.x - 5} y={hs.y - 22} width={10} height={20} rx={2} fill="#8FD3FF" opacity={0.85} />
            <Countdown x={ps.x} y={countdownY(ps.y, 0.7)} text="6 DAYS" size={26} />
          </g>
          {/* the seam */}
          <rect x={954} y={0} width={12} height={1080} fill="#0E0C1E" />
          <rect x={958} y={0} width={4} height={1080} fill={SKY} opacity={0.7} />
        </g>
      </g>
    );
  },
});

// S13 — A diagram of a brain. A clock inside it spins, then melts. A calendar
// page flips too fast. Camera: hold still. Chalkboard diagram: a cream-chalk
// brain outline, a clock face inside it with drooping melted hands, a calendar
// page with its corners curling, captioned "YOUR BRAIN HAS NO CLOCK" and
// "TIME = MEMORIES". No characters — the diagram is the shot.
defineScene({
  id: 'S13',
  durationSec: DUR.S13,
  characters: [],
  fn: (api) => {
    const f = F(api);
    return (
      <g>
        <g transform={camT(960, 560, 1.0)}>
          <Chalkboard t={f} id="s13" title="YOUR BRAIN HAS NO CLOCK" />
          {/* the brain — a cloud-like chalk outline */}
          <g fill="none" stroke="#F6EFE3" strokeWidth={6} strokeLinecap="round">
            <path d="M 560 620 Q 480 560 520 460 Q 470 400 540 350 Q 520 260 620 250 Q 660 170 760 200 Q 820 140 900 200 Q 980 160 1020 240 Q 1100 260 1060 340 Q 1120 400 1050 460 Q 1090 540 1010 580 Q 1020 650 920 640 Q 880 700 780 660 Q 700 700 640 650 Q 570 660 560 620 Z" />
            <path d="M 640 420 Q 700 380 780 400 M 700 520 Q 780 480 860 510 M 620 580 Q 700 550 800 580" strokeWidth={4} opacity={0.7} />
          </g>
          {/* the clock inside the brain — melting: the rim drips, the hands droop */}
          <g>
            <circle cx={780} cy={460} r={110} fill="#F6EFE3" stroke="#161616" strokeWidth={5} />
            <path d="M 700 550 Q 690 600 710 620 Q 700 650 720 660" stroke="#F6EFE3" strokeWidth={8} fill="none" strokeLinecap="round" />
            <path d="M 850 550 Q 860 590 845 615" stroke="#F6EFE3" strokeWidth={8} fill="none" strokeLinecap="round" />
            <line x1={780} y1={460} x2={780} y2={392} stroke="#161616" strokeWidth={6} strokeLinecap="round" />
            <line x1={780} y1={460} x2={830} y2={500} stroke="#161616" strokeWidth={6} strokeLinecap="round" />
            <circle cx={780} cy={460} r={8} fill="#161616" />
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((a) => {
              const r = (a * Math.PI) / 180;
              return <line key={a} x1={780 + Math.sin(r) * 96} y1={460 - Math.cos(r) * 96} x2={780 + Math.sin(r) * 104} y2={460 - Math.cos(r) * 104} stroke="#161616" strokeWidth={4} />;
            })}
          </g>
          {/* the calendar page, flipping too fast */}
          <g>
            <rect x={1240} y={300} width={280} height={340} rx={8} fill="#F6EFE3" stroke="#161616" strokeWidth={4} transform="rotate(6 1380 470)" />
            <text x={1380} y={360} textAnchor="middle" fontFamily={FONT.ui} fontSize={26} fill="#161616" transform="rotate(6 1380 470)">JUNE</text>
            {[400, 450, 500, 550].map((y) => (
              <path key={y} d={`M 1270 ${y} L 1490 ${y}`} stroke="#161616" strokeWidth={3} opacity={0.6} transform="rotate(6 1380 470)" />
            ))}
            <path d="M 1240 300 Q 1180 380 1240 470 Q 1300 560 1240 640" stroke="#F6EFE3" strokeWidth={5} fill="none" opacity={0.8} />
            <path d="M 1520 300 Q 1580 400 1520 500" stroke="#F6EFE3" strokeWidth={5} fill="none" opacity={0.5} />
          </g>
          <text x={960} y={880} textAnchor="middle" fontFamily={FONT.ui} fontSize={36} fill={SKY}>TIME = MEMORIES</text>
        </g>
      </g>
    );
  },
});

// S14 — A car crash in slow motion — glass, a coffee cup falling, a face in
// shock. Then the same scene at normal speed. Camera: hold still. Dusk street,
// a sedan mid-crash: glass shards suspended in the air, a coffee cup tumbling
// with a splash arc, the driver's shocked face in the window, speed lines
// behind the car. The still is the slow-mo moment; the VO carries the speed.
defineScene({
  id: 'S14',
  durationSec: DUR.S14,
  characters: [
    { who: 'suit', x: 0.5, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    // The driver — shocked, hands up, seen through the car window.
    const pd = pose('S14', 'driver', f, [
      { f: 0, p: { ...basePose, x: 1010, y: standY(0.85, ROOM_FLOOR_V), scale: 0.85, ...STAND, armL: { a: 100, b: 40 }, armR: { a: 100, b: 40 }, handL: 'open', handR: 'open', expr: 'shock' } },
      { f: len, p: { ...basePose, x: 1010, y: standY(0.85, ROOM_FLOOR_V), scale: 0.85, ...STAND, armL: { a: 100, b: 40 }, armR: { a: 100, b: 40 }, handL: 'open', handR: 'open', expr: 'shock' } },
    ]);
    const faceD = faceAt(f, [[0, 'shock']]);
    return (
      <g>
        <g transform={camT(960, 560, 1.0)}>
          <CityStreet t={f} mode="dusk" id="s14" />
          {/* speed lines behind the car */}
          {[700, 730, 760].map((y, i) => (
            <path key={i} d={`M 240 ${y} L 620 ${y}`} stroke="#F6EFE3" strokeWidth={4} opacity={0.5 - i * 0.12} strokeLinecap="round" />
          ))}
          {/* the sedan, side profile, headlights on */}
          <g>
            <path d="M 640 800 Q 660 720 780 700 L 900 690 Q 980 620 1120 620 L 1320 620 Q 1420 640 1500 700 L 1620 720 Q 1680 740 1680 800 Z" fill="#C0392B" stroke="#161616" strokeWidth={5} />
            <path d="M 920 690 Q 990 630 1100 630 L 1300 630 Q 1380 645 1430 690 Z" fill="#8FD3FF" opacity={0.85} stroke="#161616" strokeWidth={4} />
            <path d="M 1120 630 L 1120 690" stroke="#161616" strokeWidth={4} />
            <circle cx={820} cy={800} r={52} fill="#161616" />
            <circle cx={820} cy={800} r={22} fill="#8A97A3" />
            <circle cx={1500} cy={800} r={52} fill="#161616" />
            <circle cx={1500} cy={800} r={22} fill="#8A97A3" />
            <GlowDisc cx={1690} cy={770} r={90} color="#FFE2B0" o={0.6} />
            <ellipse cx={1690} cy={770} rx={34} ry={16} fill="#FFE2B0" />
          </g>
          {/* the driver, shocked, in the window */}
          {cast('suit', <Hero slim look={LOOKS.suit} pose={{ ...pd, ...faceD, facing: 1 }} rimId="rimR" shadow={0} />)}
          {/* glass shards suspended mid-air */}
          {[[700, 640], [760, 600], [820, 660], [880, 590], [940, 640], [700, 720], [860, 700]].map(([x, y], i) => (
            <g key={i}>
              <polygon points={`${x},${y} ${x + 22},${y + 8} ${x + 10},${y + 26} ${x - 8},${y + 12}`} fill="#BFD9E8" stroke="#FFFFFF" strokeWidth={2} opacity={0.9} />
              <circle cx={x + 6} cy={y + 10} r={3} fill="#FFFFFF" />
            </g>
          ))}
          {/* the coffee cup tumbling, splash arcing out */}
          <g transform="rotate(28 1420 560)">
            <rect x={1400} y={540} width={40} height={52} rx={6} fill="#F6EFE3" stroke="#161616" strokeWidth={3} />
            <rect x={1400} y={540} width={40} height={12} rx={6} fill="#6A4526" />
          </g>
          <path d="M 1440 540 Q 1500 480 1560 500 Q 1520 540 1470 560" fill="#6A4526" opacity={0.85} />
          <circle cx={1560} cy={500} r={8} fill="#6A4526" />
          <circle cx={1520} cy={470} r={6} fill="#6A4526" />
          <circle cx={1480} cy={450} r={5} fill="#6A4526" />
        </g>
      </g>
    );
  },
});

// S15 — Jake watches a child chasing pigeons in the park. Above the child:
// "78 YEARS". The child is fully absorbed, grinning. Camera: gentle pan
// right. The child (student look, small scale) mid-stride after the pigeons,
// which scatter ahead of him; Jake watches from the left, happy.
defineScene({
  id: 'S15',
  durationSec: DUR.S15,
  characters: [
    { who: 'student', x: 0.62, feetY: ROOM_FLOOR_V },
    { who: 'jake', x: 0.26, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const pc = pose('S15', 'child', f, [
      { f: 0, p: { ...basePose, x: 1050, y: standY(0.55, ROOM_FLOOR_V), scale: 0.55, ...WALK, yaw: 1, armL: { a: 60, b: 20 }, armR: { a: 60, b: 20 }, expr: 'happy' } },
      { f: len, p: { ...basePose, x: 1250, y: standY(0.55, ROOM_FLOOR_V), scale: 0.55, ...WALK, yaw: 1, armL: { a: 60, b: 20 }, armR: { a: 60, b: 20 }, expr: 'happy' } },
    ]);
    const faceC = faceAt(f, [[0, 'happy']]);
    const pj = pose('S15', 'jake', f, [
      { f: 0, p: { ...basePose, x: 500, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, yaw: 1, expr: 'happy' } },
      { f: len, p: { ...basePose, x: 500, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, yaw: 1, expr: 'happy' } },
    ]);
    const faceJ = faceAt(f, [[0, 'happy']]);
    const pan = kf(f, [[0, 900], [len, 1100]]);
    return (
      <g>
        <g transform={camT(pan, 560, 1.05)}>
          <Park t={f} mode="day" id="s15" />
          <Pigeon x={1400} y={960} s={1.1} />
          <Pigeon x={1470} y={990} s={0.9} flip />
          <Pigeon x={1340} y={1000} s={0.8} />
          {footShadows(pj)}
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...pj, ...faceJ, facing: 1 }} rimId="rimR" shadow={0} />)}
          {footShadows(pc)}
          {cast('student', <Hero slim look={LOOKS.student} pose={{ ...pc, ...faceC, facing: 1 }} rimId="rimR" shadow={0} />)}
          <Countdown x={pc.x} y={countdownY(pc.y, 0.55)} text="78 YEARS" size={26} />
        </g>
      </g>
    );
  },
});

// S16 — Detective pops up at the edge of the park, pointing at the child,
// then at the businessman. Jake watches both. Camera: hold still. The child
// chases pigeons right with "78 YEARS"; the businessman stands left on his
// phone with "6 DAYS"; Jake centre, watching; the Detective small at the far
// right edge, pointing left at the child.
defineScene({
  id: 'S16',
  durationSec: DUR.S16,
  characters: [
    { who: 'student', x: 0.72, feetY: ROOM_FLOOR_V },
    { who: 'suit', x: 0.16, feetY: ROOM_FLOOR_V },
    { who: 'jake', x: 0.45, feetY: ROOM_FLOOR_V },
    { who: 'detective', x: 0.94, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const pc = pose('S16', 'child', f, [
      { f: 0, p: { ...basePose, x: 1380, y: standY(0.55, ROOM_FLOOR_V), scale: 0.55, ...WALK, yaw: 1, armL: { a: 60, b: 20 }, armR: { a: 60, b: 20 }, expr: 'happy' } },
      { f: len, p: { ...basePose, x: 1380, y: standY(0.55, ROOM_FLOOR_V), scale: 0.55, ...WALK, yaw: 1, armL: { a: 60, b: 20 }, armR: { a: 60, b: 20 }, expr: 'happy' } },
    ]);
    const faceC = faceAt(f, [[0, 'happy']]);
    const ps = pose('S16', 'stranger', f, [
      { f: 0, p: { ...basePose, x: 300, y: standY(0.95, ROOM_FLOOR_V), scale: 0.95, ...STAND, yaw: 1, armR: { a: 55, b: 70 }, handR: 'open', expr: 'angry' } },
      { f: len, p: { ...basePose, x: 300, y: standY(0.95, ROOM_FLOOR_V), scale: 0.95, ...STAND, yaw: 1, armR: { a: 55, b: 70 }, handR: 'open', expr: 'angry' } },
    ]);
    const faceS = faceAt(f, [[0, 'angry']]);
    const hs = toWorld(ps, joints(ps, true).armR.end);
    const pj = pose('S16', 'jake', f, [
      { f: 0, p: { ...basePose, x: 860, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, expr: 'neutral' } },
      { f: len, p: { ...basePose, x: 860, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, expr: 'neutral' } },
    ]);
    const faceJ = faceAt(f, [[0, 'neutral']]);
    // Detective — small, far-right edge, pointing LEFT at the child.
    const pd = pose('S16', 'detective', f, [
      { f: 0, p: { ...basePose, x: 1810, y: standY(0.5, ROOM_FLOOR_V), scale: 0.5, ...STAND, yaw: -1, armL: { a: 120, b: 10 }, handL: 'point', headTilt: -4, expr: 'smug' } },
      { f: len, p: { ...basePose, x: 1810, y: standY(0.5, ROOM_FLOOR_V), scale: 0.5, ...STAND, yaw: -1, armL: { a: 120, b: 10 }, handL: 'point', headTilt: -4, expr: 'smug' } },
    ]);
    const faceD = faceAt(f, [[0, 'smug']]);
    return (
      <g>
        <g transform={camT(960, 560, 1.0)}>
          <Park t={f} mode="day" id="s16" />
          <Pigeon x={1520} y={980} s={1} />
          <Pigeon x={1580} y={1000} s={0.85} flip />
          {footShadows(ps)}
          {cast('suit', <Hero slim look={LOOKS.suit} pose={{ ...ps, ...faceS, facing: 1 }} rimId="rimR" shadow={0} />)}
          <rect x={hs.x - 9} y={hs.y - 32} width={18} height={32} rx={4} fill="#161616" stroke="#3A3E4A" strokeWidth={2} />
          <rect x={hs.x - 6} y={hs.y - 28} width={12} height={24} rx={2} fill="#8FD3FF" opacity={0.85} />
          <Countdown x={ps.x} y={countdownY(ps.y, 0.95)} text="6 DAYS" size={30} />
          {footShadows(pj)}
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...pj, ...faceJ, facing: 1 }} rimId="rimR" shadow={0} />)}
          {footShadows(pc)}
          {cast('student', <Hero slim look={LOOKS.student} pose={{ ...pc, ...faceC, facing: 1 }} rimId="rimR" shadow={0} />)}
          <Countdown x={pc.x} y={countdownY(pc.y, 0.55)} text="78 YEARS" size={26} />
          {cast('detective', <Hero slim look={LOOKS.detective} pose={{ ...pd, ...faceD, facing: 1 }} rimId="rimBlue" shadow={1} />)}
        </g>
      </g>
    );
  },
});

// ===========================================================================
// CHAPTER 3 — THE FORTY-YEAR FRIEND
// ===========================================================================

// S17 — Jake's friend at a kitchen table, cooking, music on, singing badly.
// Above her: "40 YEARS". Steam rises from a pot. Camera: slow push-in. The
// friend at the stove, stirring, happy, mid-song; Jake watches from the
// fridge side, happy. Warm kitchen, pendant lamp on, steam curling.
defineScene({
  id: 'S17',
  durationSec: DUR.S17,
  characters: [
    { who: 'guestB', x: 0.41, feetY: ROOM_FLOOR_V },
    { who: 'jake', x: 0.78, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const pf = pose('S17', 'friend', f, [
      { f: 0, p: { ...basePose, x: 780, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, yaw: 1, armR: { a: 60, b: 50 }, handR: 'open', headTilt: -4, expr: 'happy' } },
      { f: len, p: { ...basePose, x: 780, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, yaw: 1, armR: { a: 60, b: 50 }, handR: 'open', headTilt: -4, expr: 'happy' } },
    ]);
    const faceF = faceAt(f, [[0, 'happy']]);
    const pj = pose('S17', 'jake', f, [
      { f: 0, p: { ...basePose, x: 1500, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, yaw: -1, tilt: 5, expr: 'happy' } },
      { f: len, p: { ...basePose, x: 1500, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, yaw: -1, tilt: 5, expr: 'happy' } },
    ]);
    const faceJ = faceAt(f, [[0, 'happy']]);
    const zoom = kf(f, [[0, 1.0], [len, 1.1]]);
    return (
      <g>
        <g transform={camT(960, 560, zoom)}>
          <FriendKitchen t={f} id="s17" />
          {footShadows(pf)}
          {cast('guestB', <Hero slim look={LOOKS.guestB} pose={{ ...pf, ...faceF, facing: 1 }} rimId="rimL" shadow={0} />)}
          <Countdown x={pf.x} y={countdownY(pf.y, 1)} text="40 YEARS" size={34} />
          {footShadows(pj)}
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...pj, ...faceJ, facing: 1 }} rimId="rimL" shadow={0} />)}
        </g>
      </g>
    );
  },
});

// S18 — The friend calls her mom, laughing. A photo on the wall: the friend
// as a kid with her mom. Camera: hold still. The friend centre, phone to her
// ear, laughing; the framed photo on the wall left shows two small figures —
// a kid and her mom. Her tag reads "40 YEARS".
defineScene({
  id: 'S18',
  durationSec: DUR.S18,
  characters: [
    { who: 'guestB', x: 0.5, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const pf = pose('S18', 'friend', f, [
      { f: 0, p: { ...basePose, x: 960, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, armR: { a: 55, b: 70 }, handR: 'open', expr: 'happy' } },
      { f: len, p: { ...basePose, x: 960, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, armR: { a: 55, b: 70 }, handR: 'open', expr: 'happy' } },
    ]);
    const faceF = faceAt(f, [[0, 'happy']]);
    const hf = toWorld(pf, joints(pf, true).armR.end);
    return (
      <g>
        <g transform={camT(960, 560, 1.0)}>
          <FriendKitchen t={f} id="s18" />
          {/* the photo on the wall — the friend as a kid with her mom */}
          <g>
            <rect x={300} y={280} width={180} height={220} fill="#7A5230" stroke="#161616" strokeWidth={4} />
            <rect x={316} y={296} width={148} height={188} fill="#BFD9E8" />
            <circle cx={360} cy={380} r={22} fill="#161616" />
            <path d="M 338 430 L 382 430 L 388 470 L 332 470 Z" fill="#D96A5F" />
            <circle cx={420} cy={370} r={26} fill="#161616" />
            <path d="M 392 430 L 448 430 L 454 470 L 386 470 Z" fill="#8A5A6A" />
            <circle cx={356} cy={376} r={3} fill="#FFFFFF" />
            <circle cx={368} cy={376} r={3} fill="#FFFFFF" />
            <circle cx={414} cy={366} r={3} fill="#FFFFFF" />
            <circle cx={428} cy={366} r={3} fill="#FFFFFF" />
          </g>
          {footShadows(pf)}
          {cast('guestB', <Hero slim look={LOOKS.guestB} pose={{ ...pf, ...faceF, facing: 1 }} rimId="rimL" shadow={0} />)}
          <rect x={hf.x - 9} y={hf.y - 34} width={18} height={34} rx={4} fill="#161616" stroke="#3A3E4A" strokeWidth={2} />
          <rect x={hf.x - 6} y={hf.y - 30} width={12} height={26} rx={2} fill="#8FD3FF" opacity={0.85} />
          <Countdown x={pf.x} y={countdownY(pf.y, 1)} text="40 YEARS" size={34} />
        </g>
      </g>
    );
  },
});

// S19 — A diagram: two columns. One labeled "knowledge goals" (books, money,
// status), one labeled "meaningful goals" (family, friends, laughter). The
// second column glows. Camera: hold still. Chalkboard: the left column dim
// cream (book stack, money bag, trophy), the right column glowing sky blue
// (heart, two figures, laughing friends), an arrow between them.
defineScene({
  id: 'S19',
  durationSec: DUR.S19,
  characters: [],
  fn: (api) => {
    const f = F(api);
    return (
      <g>
        <g transform={camT(960, 560, 1.0)}>
          <Chalkboard t={f} id="s19" />
          {/* left column — KNOWLEDGE GOALS, dim */}
          <g opacity={0.75}>
            <rect x={280} y={260} width={600} height={560} rx={12} fill="none" stroke="#F6EFE3" strokeWidth={4} />
            <text x={580} y={330} textAnchor="middle" fontFamily={FONT.ui} fontSize={34} fill="#F6EFE3">KNOWLEDGE GOALS</text>
            {/* book stack */}
            <rect x={400} y={620} width={160} height={40} fill="#C0392B" stroke="#161616" strokeWidth={3} />
            <rect x={410} y={580} width={140} height={40} fill="#3E8C86" stroke="#161616" strokeWidth={3} />
            <rect x={420} y={540} width={120} height={40} fill="#F2C94C" stroke="#161616" strokeWidth={3} />
            {/* money bag */}
            <circle cx={720} cy={600} r={60} fill="#5E8C46" stroke="#161616" strokeWidth={4} />
            <path d="M 700 545 L 720 520 L 740 545 Z" fill="#5E8C46" stroke="#161616" strokeWidth={3} />
            <text x={720} y={620} textAnchor="middle" fontFamily={FONT.ui} fontSize={44} fill="#F6EFE3">$</text>
            {/* trophy / status star */}
            <path d="M 580 400 L 596 440 L 640 444 L 606 472 L 616 514 L 580 492 L 544 514 L 554 472 L 520 444 L 564 440 Z" fill="#F2C94C" stroke="#161616" strokeWidth={3} />
          </g>
          {/* the arrow between the columns */}
          <path d="M 900 540 L 1000 540" stroke={SKY} strokeWidth={6} strokeLinecap="round" />
          <path d="M 1000 540 L 970 515 M 1000 540 L 970 565" stroke={SKY} strokeWidth={6} strokeLinecap="round" fill="none" />
          {/* right column — MEANINGFUL GOALS, glowing sky blue */}
          <g>
            <GlowDisc cx={1340} cy={540} r={330} color={SKY} o={0.22} />
            <rect x={1040} y={260} width={600} height={560} rx={12} fill="none" stroke={SKY} strokeWidth={5} />
            <text x={1340} y={330} textAnchor="middle" fontFamily={FONT.ui} fontSize={34} fill={SKY}>MEANINGFUL GOALS</text>
            {/* heart */}
            <path d="M 1340 640 Q 1290 590 1240 620 Q 1220 660 1260 700 Q 1300 740 1340 760 Q 1380 740 1420 700 Q 1460 660 1440 620 Q 1390 590 1340 640 Z" fill="#C0392B" stroke="#161616" strokeWidth={4} />
            {/* family — two figures holding hands */}
            <circle cx={1180} cy={480} r={30} fill="#161616" />
            <path d="M 1150 520 L 1210 520 L 1216 600 L 1144 600 Z" fill="#D96A5F" />
            <circle cx={1260} cy={490} r={24} fill="#161616" />
            <path d="M 1236 524 L 1284 524 L 1288 590 L 1232 590 Z" fill="#3E8C86" />
            <path d="M 1210 550 Q 1236 560 1236 550" stroke="#161616" strokeWidth={4} fill="none" />
            {/* friends laughing — two heads, open smiles */}
            <circle cx={1480} cy={480} r={30} fill="#161616" />
            <circle cx={1560} cy={480} r={30} fill="#161616" />
            <ellipse cx={1480} cy={488} rx={10} ry={6} fill="#FFFFFF" />
            <ellipse cx={1560} cy={488} rx={10} ry={6} fill="#FFFFFF" />
            <path d="M 1450 520 L 1510 520 L 1516 600 L 1444 600 Z" fill="#F2C94C" />
            <path d="M 1530 520 L 1590 520 L 1596 600 L 1524 600 Z" fill="#5A4A6A" />
          </g>
          <text x={960} y={880} textAnchor="middle" fontFamily={FONT.ui} fontSize={32} fill={SKY}>WHEN TIME FEELS SHORT, MEANING WINS</text>
        </g>
      </g>
    );
  },
});

// S20 — Jake and his friend on the bench, sharing fries, both laughing. Her
// number: "40 YEARS". His reflection in a window shows no number. Camera:
// slow pull back. Park bench with both of them seated, a red fry carton
// between them; behind the bench, a kiosk window with Jake's dim reflection
// (same pose, low opacity, NO tag above the reflection).
defineScene({
  id: 'S20',
  durationSec: DUR.S20,
  characters: [
    { who: 'jake', x: 0.62, feetY: ROOM_FLOOR_V },
    { who: 'guestB', x: 0.74, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const pj = pose('S20', 'jake', f, [
      { f: 0, p: { ...basePose, x: 1200, y: sitY(FLOOR_PX), scale: 1, ...SIT, yaw: 1, expr: 'happy' } },
      { f: len, p: { ...basePose, x: 1200, y: sitY(FLOOR_PX), scale: 1, ...SIT, yaw: 1, expr: 'happy' } },
    ]);
    const faceJ = faceAt(f, [[0, 'happy']]);
    const pf = pose('S20', 'friend', f, [
      { f: 0, p: { ...basePose, x: 1420, y: sitY(FLOOR_PX), scale: 1, ...SIT, yaw: -1, expr: 'happy' } },
      { f: len, p: { ...basePose, x: 1420, y: sitY(FLOOR_PX), scale: 1, ...SIT, yaw: -1, expr: 'happy' } },
    ]);
    const faceF = faceAt(f, [[0, 'happy']]);
    const zoom = kf(f, [[0, 1.12], [len, 1.0]]);
    return (
      <g>
        <g transform={camT(1100, 600, zoom)}>
          <Park t={f} mode="day" id="s20" />
          {/* kiosk window behind the bench, with Jake's reflection (no number) */}
          <g>
            <rect x={1000} y={300} width={620} height={360} fill="#1E2A44" stroke="#5A4028" strokeWidth={6} opacity={0.95} />
            <rect x={1020} y={320} width={580} height={320} fill="#2A3A5A" />
            <g opacity={0.22}>
              {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...pj, ...faceJ, facing: 1 }} rimId="rimR" shadow={0} />)}
            </g>
          </g>
          {footShadows(pj)}
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...pj, ...faceJ, facing: 1 }} rimId="rimR" shadow={0} />)}
          {footShadows(pf)}
          {cast('guestB', <Hero slim look={LOOKS.guestB} pose={{ ...pf, ...faceF, facing: 1 }} rimId="rimR" shadow={0} />)}
          {/* the fry carton between them */}
          <g>
            <path d="M 1290 740 L 1350 740 L 1342 780 L 1298 780 Z" fill="#C0392B" stroke="#161616" strokeWidth={3} />
            {[1300, 1312, 1324, 1336].map((x) => (
              <rect key={x} x={x} y={716} width={8} height={28} fill="#F2C94C" stroke="#161616" strokeWidth={1.5} />
            ))}
          </g>
          <Countdown x={pf.x} y={countdownY(pf.y, 1)} text="40 YEARS" size={34} />
        </g>
      </g>
    );
  },
});

// S21 — Jake looks at his own reflection in a shop window. Above his head:
// nothing. Just sky. Camera: extreme close-up on Jake's face. ShopFront set,
// Jake front-facing centre, worried, the camera tight on his head; his dim
// reflection in the glass behind him, and NO tag anywhere — the absence is
// the beat.
defineScene({
  id: 'S21',
  durationSec: DUR.S21,
  characters: [
    { who: 'jake', x: 0.5, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const pj = pose('S21', 'jake', f, [
      { f: 0, p: { ...basePose, x: 960, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, expr: 'worried' } },
      { f: len, p: { ...basePose, x: 960, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, expr: 'worried' } },
    ]);
    const faceJ = faceAt(f, [[0, 'worried']]);
    return (
      <g>
        <g transform={camT(960, 530, 1.7)}>
          <ShopFront t={f} id="s21" />
          {/* his reflection in the glass — same pose, dim, no number above it */}
          <g opacity={0.22}>
            {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...pj, ...faceJ, facing: 1 }} rimId="rimR" shadow={0} />)}
          </g>
          {footShadows(pj)}
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...pj, ...faceJ, facing: 1 }} rimId="rimR" shadow={0} />)}
          {/* NO countdown above Jake — nothing. Just sky. */}
        </g>
      </g>
    );
  },
});

// S22 — Jake walks home through the evening crowd, numbers glowing above
// every head. Some short, some long. He looks at them differently now.
// Camera: slow push-in. Dusk street, lamps on, Jake walking mid-stride with a
// determined face, the crowd around him tagged short and long.
defineScene({
  id: 'S22',
  durationSec: DUR.S22,
  characters: [
    { who: 'jake', x: 0.45, feetY: ROOM_FLOOR_V },
    { who: 'guestA', x: 0.15, feetY: ROOM_FLOOR_V },
    { who: 'guestB', x: 0.28, feetY: ROOM_FLOOR_V },
    { who: 'guestC', x: 0.72, feetY: ROOM_FLOOR_V },
    { who: 'teacher', x: 0.85, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const pj = pose('S22', 'jake', f, [
      { f: 0, p: { ...basePose, x: 700, y: standY(1, ROOM_FLOOR_V), scale: 1, ...WALK, yaw: 1, expr: 'determined' } },
      { f: len, p: { ...basePose, x: 1000, y: standY(1, ROOM_FLOOR_V), scale: 1, ...WALK, yaw: 1, expr: 'determined' } },
    ]);
    const faceJ = faceAt(f, [[0, 'determined']]);
    const zoom = kf(f, [[0, 1.0], [len, 1.1]]);
    return (
      <g>
        <g transform={camT(960, 560, zoom)}>
          <CityStreet t={f} mode="dusk" id="s22" />
          {Ped({ scene: 'S22', label: 'ped1', x: 300, look: 'guestA', scale: 0.9, tag: '2 DAYS', expr: 'neutral', yaw: 1 }, f, len)}
          {Ped({ scene: 'S22', label: 'ped2', x: 540, look: 'guestB', scale: 0.95, tag: '35 YRS', expr: 'neutral', yaw: -1 }, f, len)}
          {Ped({ scene: 'S22', label: 'ped3', x: 1380, look: 'guestC', scale: 0.9, tag: '4 HRS', expr: 'neutral', yaw: 1 }, f, len)}
          {Ped({ scene: 'S22', label: 'ped4', x: 1640, look: 'teacher', scale: 0.95, tag: '60 YRS', expr: 'neutral', yaw: -1 }, f, len)}
          {footShadows(pj)}
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...pj, ...faceJ, facing: 1 }} rimId="rimR" shadow={0} />)}
        </g>
      </g>
    );
  },
});

// ===========================================================================
// CHAPTER 4 — THE MAN WHO TRIED TO CHEAT
// ===========================================================================

// S23 — A man in an expensive suit at a desk at 2 AM, surrounded by energy
// drinks, a sleep tracker, and a stack of productivity books. Above him:
// "2 DAYS". Camera: slow push-in. The man sits on the office chair between
// the two glowing monitors, hunched over the desk, tired; the desk front
// (drawn after him) occludes his legs so he reads as seated BEHIND the desk.
defineScene({
  id: 'S23',
  durationSec: DUR.S23,
  characters: [
    { who: 'suit', x: 0.79, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const pm = pose('S23', 'officeman', f, [
      { f: 0, p: { ...basePose, x: 1510, y: sitY(FLOOR_PX), scale: 1, ...SIT, tilt: 8, headTilt: 6, expr: 'tired' } },
      { f: len, p: { ...basePose, x: 1510, y: sitY(FLOOR_PX), scale: 1, ...SIT, tilt: 8, headTilt: 6, expr: 'tired' } },
    ]);
    const faceM = faceAt(f, [[0, 'tired']]);
    const zoom = kf(f, [[0, 1.0], [len, 1.1]]);
    return (
      <g>
        <g transform={camT(1100, 560, zoom)}>
          <OfficeNight t={f} id="s23" />
          {cast('suit', <Hero slim look={LOOKS.suit} pose={{ ...pm, ...faceM, facing: 1 }} rimId="rimBlue" shadow={0} />)}
          {/* the desk front occludes his legs — he sits BEHIND the desk */}
          <rect x={1300} y={750} width={480} height={126} fill="#2A2530" stroke="#161616" strokeWidth={4} />
          <Countdown x={pm.x} y={countdownY(pm.y, 1) - 40} text="2 DAYS" size={34} />
        </g>
      </g>
    );
  },
});

// S24 — The man swallows pills, checks his watch, types faster. His number
// flickers: "2 DAYS" to "1 DAY 22 HOURS". Camera: hold still. He types at the
// desk (arms forward over the keyboard), a pill bottle and water glass beside
// him, a watch on his wrist; the tag flickers halfway through the scene.
defineScene({
  id: 'S24',
  durationSec: DUR.S24,
  characters: [
    { who: 'suit', x: 0.79, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const pm = pose('S24', 'officeman', f, [
      { f: 0, p: { ...basePose, x: 1510, y: sitY(FLOOR_PX), scale: 1, ...SIT, tilt: 10, armL: { a: 70, b: 30 }, armR: { a: 70, b: 30 }, headTilt: 8, expr: 'stressed' } },
      { f: len, p: { ...basePose, x: 1510, y: sitY(FLOOR_PX), scale: 1, ...SIT, tilt: 10, armL: { a: 70, b: 30 }, armR: { a: 70, b: 30 }, headTilt: 8, expr: 'stressed' } },
    ]);
    const faceM = faceAt(f, [[0, 'stressed']]);
    const hw = toWorld(pm, joints(pm, true).armL.end);
    // the number flickers halfway through: "2 DAYS" -> "1 DAY 22 HOURS"
    const tag = f < len / 2 ? '2 DAYS' : '1 DAY 22 HOURS';
    return (
      <g>
        <g transform={camT(1100, 560, 1.05)}>
          <OfficeNight t={f} id="s24" />
          {cast('suit', <Hero slim look={LOOKS.suit} pose={{ ...pm, ...faceM, facing: 1 }} rimId="rimBlue" shadow={0} />)}
          {/* the desk front occludes his legs */}
          <rect x={1300} y={750} width={480} height={126} fill="#2A2530" stroke="#161616" strokeWidth={4} />
          {/* pill bottle + water glass on the desk, watch on his wrist */}
          <rect x={1300} y={694} width={22} height={36} rx={5} fill="#F6EFE3" stroke="#161616" strokeWidth={2} />
          <rect x={1300} y={694} width={22} height={12} rx={5} fill="#C0392B" />
          <rect x={1700} y={690} width={26} height={40} rx={4} fill="#BFD9E8" stroke="#161616" strokeWidth={2} opacity={0.9} />
          <circle cx={hw.x} cy={hw.y} r={10} fill="#C9A227" stroke="#161616" strokeWidth={2} />
          <Countdown x={pm.x} y={countdownY(pm.y, 1) - 40} text={tag} size={34} />
        </g>
      </g>
    );
  },
});

// S25 — A diagram of two clocks. One labeled "routine" — the hands spin fast.
// One labeled "new experiences" — the hands crawl. Camera: hold still.
// Chalkboard: the ROUTINE clock with fanned hands and spin arcs (a month
// collapsing into a blur), the NEW EXPERIENCES clock with one slow hand and
// sparkles. Caption: "NEW MEMORIES STRETCH TIME".
defineScene({
  id: 'S25',
  durationSec: DUR.S25,
  characters: [],
  fn: (api) => {
    const f = F(api);
    return (
      <g>
        <g transform={camT(960, 560, 1.0)}>
          <Chalkboard t={f} id="s25" />
          {/* ROUTINE clock — hands fanned, spinning fast */}
          <g>
            <circle cx={580} cy={480} r={150} fill="#F6EFE3" stroke="#161616" strokeWidth={5} />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
              const r = (a * Math.PI) / 180;
              return <line key={a} x1={580} y1={480} x2={580 + Math.sin(r) * 110} y2={480 - Math.cos(r) * 110} stroke="#161616" strokeWidth={4} opacity={0.55} strokeLinecap="round" />;
            })}
            <circle cx={580} cy={480} r={10} fill="#161616" />
            <path d="M 460 340 A 150 150 0 0 1 700 340" stroke="#C0392B" strokeWidth={5} fill="none" strokeLinecap="round" />
            <path d="M 700 340 L 672 332 M 700 340 L 690 366" stroke="#C0392B" strokeWidth={5} strokeLinecap="round" fill="none" />
            <text x={580} y={700} textAnchor="middle" fontFamily={FONT.ui} fontSize={36} fill="#F6EFE3">ROUTINE</text>
            <text x={580} y={750} textAnchor="middle" fontFamily={FONT.ui} fontSize={26} fill="#7E8DA6">same day, same route — a month collapses</text>
          </g>
          {/* NEW EXPERIENCES clock — one slow hand, sparkles */}
          <g>
            <circle cx={1340} cy={480} r={150} fill="#F6EFE3" stroke={SKY} strokeWidth={5} />
            <line x1={1340} y1={480} x2={1340} y2={392} stroke="#161616" strokeWidth={6} strokeLinecap="round" />
            <line x1={1340} y1={480} x2={1395} y2={520} stroke="#161616" strokeWidth={6} strokeLinecap="round" />
            <circle cx={1340} cy={480} r={10} fill="#161616" />
            <path d="M 1220 380 A 150 150 0 0 1 1260 350" stroke={SKY} strokeWidth={5} fill="none" strokeLinecap="round" />
            <path d="M 1260 350 L 1240 348 M 1260 350 L 1252 368" stroke={SKY} strokeWidth={5} strokeLinecap="round" fill="none" />
            {[[1180, 300], [1500, 320], [1460, 620], [1200, 620]].map(([x, y], i) => (
              <path key={i} d={`M ${x} ${y - 12} L ${x} ${y + 12} M ${x - 12} ${y} L ${x + 12} ${y}`} stroke={SKY} strokeWidth={4} strokeLinecap="round" />
            ))}
            <text x={1340} y={700} textAnchor="middle" fontFamily={FONT.ui} fontSize={36} fill={SKY}>NEW EXPERIENCES</text>
            <text x={1340} y={750} textAnchor="middle" fontFamily={FONT.ui} fontSize={26} fill={SKY}>a day full of new things stretches</text>
          </g>
          <text x={960} y={880} textAnchor="middle" fontFamily={FONT.ui} fontSize={32} fill={SKY}>NEW MEMORIES STRETCH TIME</text>
        </g>
      </g>
    );
  },
});

// S26 — The man stares at his own reflection in his office window. His
// number: "1 DAY 21 HOURS". He looks exhausted. Camera: hold still. The big
// office window with the city lights; the man stands before it, tired, his
// dim reflection in the glass beside him (same pose, low opacity, clipped to
// the window).
defineScene({
  id: 'S26',
  durationSec: DUR.S26,
  characters: [
    { who: 'suit', x: 0.36, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const pm = pose('S26', 'officeman', f, [
      { f: 0, p: { ...basePose, x: 700, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, headTilt: 4, expr: 'tired' } },
      { f: len, p: { ...basePose, x: 700, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, headTilt: 4, expr: 'tired' } },
    ]);
    const faceM = faceAt(f, [[0, 'tired']]);
    return (
      <g>
        <g transform={camT(700, 540, 1.1)}>
          <OfficeNight t={f} id="s26" />
          {/* his reflection in the window glass — dim, no separate tag */}
          <defs>
            <clipPath id="s26win"><rect x={120} y={80} width={1100} height={700} /></clipPath>
          </defs>
          <g clipPath="url(#s26win)" opacity={0.22}>
            {cast('suit', <Hero slim look={LOOKS.suit} pose={{ ...pm, ...faceM, facing: 1 }} rimId="rimBlue" shadow={0} />)}
          </g>
          {footShadows(pm)}
          {cast('suit', <Hero slim look={LOOKS.suit} pose={{ ...pm, ...faceM, facing: 1 }} rimId="rimBlue" shadow={0} />)}
          <Countdown x={pm.x} y={countdownY(pm.y, 1)} text="1 DAY 21 HOURS" size={30} />
        </g>
      </g>
    );
  },
});

// S27 — Jake watches the man through the office window, then turns and walks
// away. The man's number keeps ticking. Camera: slow pull back. Jake in the
// foreground, profile, watching the small man at his desk through the window;
// then Jake turns and walks away left while the man's tag keeps ticking.
defineScene({
  id: 'S27',
  durationSec: DUR.S27,
  characters: [
    { who: 'jake', x: 0.26, feetY: ROOM_FLOOR_V },
    { who: 'suit', x: 0.79, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    // Jake watches (first half), then turns and walks away (second half).
    const pj = pose('S27', 'jake', f, [
      { f: 0, p: { ...basePose, x: 500, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, yaw: 1, expr: 'sad' } },
      { f: Math.round(len * 0.5), p: { ...basePose, x: 500, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, yaw: 1, expr: 'sad' } },
      { f: len, p: { ...basePose, x: 320, y: standY(1, ROOM_FLOOR_V), scale: 1, ...WALK, yaw: -1, expr: 'sad' } },
    ]);
    const faceJ = faceAt(f, [[0, 'sad']]);
    const pm = pose('S27', 'officeman', f, [
      { f: 0, p: { ...basePose, x: 1510, y: sitY(FLOOR_PX), scale: 0.7, ...SIT, tilt: 8, headTilt: 6, expr: 'tired' } },
      { f: len, p: { ...basePose, x: 1510, y: sitY(FLOOR_PX), scale: 0.7, ...SIT, tilt: 8, headTilt: 6, expr: 'tired' } },
    ]);
    const faceM = faceAt(f, [[0, 'tired']]);
    const zoom = kf(f, [[0, 1.1], [len, 1.0]]);
    return (
      <g>
        <g transform={camT(960, 560, zoom)}>
          <OfficeNight t={f} id="s27" />
          {cast('suit', <Hero slim look={LOOKS.suit} pose={{ ...pm, ...faceM, facing: 1 }} rimId="rimBlue" shadow={0} />)}
          <rect x={1300} y={750} width={480} height={126} fill="#2A2530" stroke="#161616" strokeWidth={4} />
          <Countdown x={pm.x} y={countdownY(pm.y, 0.7) - 20} text="1 DAY 21 HOURS" size={26} />
          {footShadows(pj)}
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...pj, ...faceJ, facing: 1 }} rimId="rimBlue" shadow={0} />)}
        </g>
      </g>
    );
  },
});

// S28 — Jake sits alone on a curb at night, looking up at the glowing numbers
// above the crowd. His face is tired. Camera: slow push-in. Night street,
// lamps on; Jake sits on the pavement edge leaning against the shopfront,
// tired, head tilted up at the numbers; the crowd walks past, tagged.
defineScene({
  id: 'S28',
  durationSec: DUR.S28,
  characters: [
    { who: 'jake', x: 0.42, feetY: ROOM_FLOOR_V },
    { who: 'guestA', x: 0.2, feetY: ROOM_FLOOR_V },
    { who: 'guestB', x: 0.68, feetY: ROOM_FLOOR_V },
    { who: 'teacher', x: 0.85, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const pj = pose('S28', 'jake', f, [
      { f: 0, p: { ...basePose, x: 800, y: sitY(FLOOR_PX), scale: 1, ...SIT, headTilt: -8, expr: 'tired' } },
      { f: len, p: { ...basePose, x: 800, y: sitY(FLOOR_PX), scale: 1, ...SIT, headTilt: -8, expr: 'tired' } },
    ]);
    const faceJ = faceAt(f, [[0, 'tired']]);
    const zoom = kf(f, [[0, 1.0], [len, 1.1]]);
    return (
      <g>
        <g transform={camT(960, 560, zoom)}>
          <CityStreet t={f} mode="night" id="s28" />
          {/* the low curb he sits on */}
          <rect x={640} y={846} width={340} height={30} rx={6} fill="#4A4450" stroke="#241A26" strokeWidth={3} />
          {Ped({ scene: 'S28', label: 'ped1', x: 380, look: 'guestA', scale: 0.9, tag: '9 YRS', expr: 'neutral', yaw: 1 }, f, len)}
          {Ped({ scene: 'S28', label: 'ped2', x: 1300, look: 'guestB', scale: 0.95, tag: '3 DAYS', expr: 'neutral', yaw: -1 }, f, len)}
          {Ped({ scene: 'S28', label: 'ped3', x: 1640, look: 'teacher', scale: 0.9, tag: '18 YRS', expr: 'neutral', yaw: 1 }, f, len)}
          {footShadows(pj)}
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...pj, ...faceJ, facing: 1 }} rimId="rimR" shadow={0} />)}
        </g>
      </g>
    );
  },
});

// ===========================================================================
// CHAPTER 5 — THE SCROOGE EFFECT
// ===========================================================================

// S29 — An older woman alone on a park bench at dusk, arms crossed, glaring
// at a pigeon. Above her: "4 HOURS". Jake approaches slowly. Camera: slow
// push-in. The woman (mom look — curly hair, mauve jacket) sits on the bench,
// arms folded, angry, glaring at the pigeon on the path; Jake walks toward
// her from the left.
defineScene({
  id: 'S29',
  durationSec: DUR.S29,
  characters: [
    { who: 'mom', x: 0.68, feetY: ROOM_FLOOR_V },
    { who: 'jake', x: 0.31, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const pw = pose('S29', 'woman', f, [
      { f: 0, p: { ...basePose, x: 1300, y: sitY(FLOOR_PX), scale: 1, ...SIT, yaw: -1, armL: { a: 60, b: 100 }, armR: { a: 60, b: 100 }, expr: 'angry' } },
      { f: len, p: { ...basePose, x: 1300, y: sitY(FLOOR_PX), scale: 1, ...SIT, yaw: -1, armL: { a: 60, b: 100 }, armR: { a: 60, b: 100 }, expr: 'angry' } },
    ]);
    const faceW = faceAt(f, [[0, 'angry']]);
    const pj = pose('S29', 'jake', f, [
      { f: 0, p: { ...basePose, x: 560, y: standY(1, ROOM_FLOOR_V), scale: 1, ...WALK, yaw: 1, expr: 'neutral' } },
      { f: len, p: { ...basePose, x: 760, y: standY(1, ROOM_FLOOR_V), scale: 1, ...WALK, yaw: 1, expr: 'neutral' } },
    ]);
    const faceJ = faceAt(f, [[0, 'neutral']]);
    const zoom = kf(f, [[0, 1.0], [len, 1.1]]);
    return (
      <g>
        <g transform={camT(1100, 600, zoom)}>
          <Park t={f} mode="dusk" id="s29" />
          <Pigeon x={1120} y={1000} s={1.1} />
          {footShadows(pw)}
          {cast('mom', <Hero slim look={LOOKS.mom} pose={{ ...pw, ...faceW, facing: 1 }} rimId="rimR" shadow={0} />)}
          <Countdown x={pw.x} y={countdownY(pw.y, 1)} text="4 HOURS" size={34} />
          {footShadows(pj)}
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...pj, ...faceJ, facing: 1 }} rimId="rimR" shadow={0} />)}
        </g>
      </g>
    );
  },
});

// S30 — Jake sits down on the bench next to her. She ignores him. He offers
// her half his sandwich. She stares at it. Camera: hold still. Both seated on
// the bench; Jake leans toward her, his right arm extended with the sandwich;
// she sits turned away, angry, staring at it. Her tag reads "4 HOURS".
defineScene({
  id: 'S30',
  durationSec: DUR.S30,
  characters: [
    { who: 'jake', x: 0.62, feetY: ROOM_FLOOR_V },
    { who: 'mom', x: 0.74, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const pj = pose('S30', 'jake', f, [
      { f: 0, p: { ...basePose, x: 1200, y: sitY(FLOOR_PX), scale: 1, ...SIT, yaw: 1, armR: { a: 60, b: 20 }, handR: 'open', expr: 'neutral' } },
      { f: len, p: { ...basePose, x: 1200, y: sitY(FLOOR_PX), scale: 1, ...SIT, yaw: 1, armR: { a: 60, b: 20 }, handR: 'open', expr: 'neutral' } },
    ]);
    const faceJ = faceAt(f, [[0, 'neutral']]);
    const hj = toWorld(pj, joints(pj, true).armR.end);
    const pw = pose('S30', 'woman', f, [
      { f: 0, p: { ...basePose, x: 1420, y: sitY(FLOOR_PX), scale: 1, ...SIT, yaw: -1, armL: { a: 60, b: 100 }, armR: { a: 60, b: 100 }, headTilt: 10, expr: 'angry' } },
      { f: len, p: { ...basePose, x: 1420, y: sitY(FLOOR_PX), scale: 1, ...SIT, yaw: -1, armL: { a: 60, b: 100 }, armR: { a: 60, b: 100 }, headTilt: 10, expr: 'angry' } },
    ]);
    const faceW = faceAt(f, [[0, 'angry']]);
    return (
      <g>
        <g transform={camT(1100, 600, 1.0)}>
          <Park t={f} mode="dusk" id="s30" />
          {footShadows(pj)}
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...pj, ...faceJ, facing: 1 }} rimId="rimR" shadow={0} />)}
          {/* half a sandwich in his outstretched hand */}
          <g>
            <path d={`M ${hj.x - 14} ${hj.y - 10} L ${hj.x + 14} ${hj.y - 10} L ${hj.x + 10} ${hj.y + 8} L ${hj.x - 10} ${hj.y + 8} Z`} fill="#F2C94C" stroke="#161616" strokeWidth={2} />
            <rect x={hj.x - 12} y={hj.y - 12} width={24} height={6} fill="#5E8C46" />
          </g>
          {footShadows(pw)}
          {cast('mom', <Hero slim look={LOOKS.mom} pose={{ ...pw, ...faceW, facing: 1 }} rimId="rimR" shadow={0} />)}
          <Countdown x={pw.x} y={countdownY(pw.y, 1)} text="4 HOURS" size={34} />
        </g>
      </g>
    );
  },
});

// S31 — The woman talks, gesturing. Jake listens. Her number flickers:
// "4 HOURS" to "6 HOURS" to "2 DAYS". Camera: hold still. Both seated; she
// gestures with her right hand as she talks, her face softening; Jake listens,
// leaning in. The tag climbs by thirds across the scene.
defineScene({
  id: 'S31',
  durationSec: DUR.S31,
  characters: [
    { who: 'mom', x: 0.74, feetY: ROOM_FLOOR_V },
    { who: 'jake', x: 0.62, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const pw = pose('S31', 'woman', f, [
      { f: 0, p: { ...basePose, x: 1420, y: sitY(FLOOR_PX), scale: 1, ...SIT, yaw: -1, armR: { a: 80, b: 30 }, handR: 'open', expr: 'sad' } },
      { f: len, p: { ...basePose, x: 1420, y: sitY(FLOOR_PX), scale: 1, ...SIT, yaw: -1, armR: { a: 80, b: 30 }, handR: 'open', expr: 'sad' } },
    ]);
    const faceW = faceAt(f, [[0, 'sad']]);
    const pj = pose('S31', 'jake', f, [
      { f: 0, p: { ...basePose, x: 1200, y: sitY(FLOOR_PX), scale: 1, ...SIT, yaw: 1, headTilt: 5, expr: 'neutral' } },
      { f: len, p: { ...basePose, x: 1200, y: sitY(FLOOR_PX), scale: 1, ...SIT, yaw: 1, headTilt: 5, expr: 'neutral' } },
    ]);
    const faceJ = faceAt(f, [[0, 'neutral']]);
    // the number climbs by thirds: 4 HOURS -> 6 HOURS -> 2 DAYS
    const tag = f < len / 3 ? '4 HOURS' : f < (2 * len) / 3 ? '6 HOURS' : '2 DAYS';
    return (
      <g>
        <g transform={camT(1100, 600, 1.0)}>
          <Park t={f} mode="dusk" id="s31" />
          {footShadows(pj)}
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...pj, ...faceJ, facing: 1 }} rimId="rimR" shadow={0} />)}
          {footShadows(pw)}
          {cast('mom', <Hero slim look={LOOKS.mom} pose={{ ...pw, ...faceW, facing: 1 }} rimId="rimR" shadow={0} />)}
          <Countdown x={pw.x} y={countdownY(pw.y, 1)} text={tag} size={34} />
        </g>
      </g>
    );
  },
});

// S32 — The woman dials her phone, hands shaking. On the other end, a voice
// answers. She smiles for the first time. Her number: "11 YEARS". Camera:
// slow push-in. She holds the phone to her ear, smiling; the tag jumps to
// "11 YEARS" once the call connects (past 60% of the scene). Jake beside her,
// happy. The sun sets behind them.
defineScene({
  id: 'S32',
  durationSec: DUR.S32,
  characters: [
    { who: 'mom', x: 0.74, feetY: ROOM_FLOOR_V },
    { who: 'jake', x: 0.62, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const pw = pose('S32', 'woman', f, [
      { f: 0, p: { ...basePose, x: 1420, y: sitY(FLOOR_PX), scale: 1, ...SIT, yaw: -1, armR: { a: 55, b: 70 }, handR: 'open', expr: 'happy' } },
      { f: len, p: { ...basePose, x: 1420, y: sitY(FLOOR_PX), scale: 1, ...SIT, yaw: -1, armR: { a: 55, b: 70 }, handR: 'open', expr: 'happy' } },
    ]);
    const faceW = faceAt(f, [[0, 'happy']]);
    const hw = toWorld(pw, joints(pw, true).armR.end);
    const pj = pose('S32', 'jake', f, [
      { f: 0, p: { ...basePose, x: 1200, y: sitY(FLOOR_PX), scale: 1, ...SIT, yaw: 1, expr: 'happy' } },
      { f: len, p: { ...basePose, x: 1200, y: sitY(FLOOR_PX), scale: 1, ...SIT, yaw: 1, expr: 'happy' } },
    ]);
    const faceJ = faceAt(f, [[0, 'happy']]);
    // the call connects past 60%: the number jumps to 11 YEARS
    const tag = f < len * 0.6 ? '4 HOURS' : '11 YEARS';
    const zoom = kf(f, [[0, 1.0], [len, 1.1]]);
    return (
      <g>
        <g transform={camT(1100, 600, zoom)}>
          <Park t={f} mode="dusk" id="s32" />
          {footShadows(pj)}
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...pj, ...faceJ, facing: 1 }} rimId="rimR" shadow={0} />)}
          {footShadows(pw)}
          {cast('mom', <Hero slim look={LOOKS.mom} pose={{ ...pw, ...faceW, facing: 1 }} rimId="rimR" shadow={0} />)}
          <rect x={hw.x - 9} y={hw.y - 34} width={18} height={34} rx={4} fill="#161616" stroke="#3A3E4A" strokeWidth={2} />
          <rect x={hw.x - 6} y={hw.y - 30} width={12} height={26} rx={2} fill="#8FD3FF" opacity={0.85} />
          <Countdown x={pw.x} y={countdownY(pw.y, 1)} text={tag} size={34} />
        </g>
      </g>
    );
  },
});

// S33 — A diagram: a grumpy old man in a top hat (Scrooge) transforms into a
// smiling, generous man handing out gifts. Camera: hold still. Chalkboard:
// BEFORE — a grumpy silhouette in a top hat, arms crossed, scowling; an arrow;
// AFTER — the same man smiling, handing a gift box to a small figure. Caption:
// "THE SCROOGE EFFECT".
defineScene({
  id: 'S33',
  durationSec: DUR.S33,
  characters: [],
  fn: (api) => {
    const f = F(api);
    return (
      <g>
        <g transform={camT(960, 560, 1.0)}>
          <Chalkboard t={f} id="s33" title="THE SCROOGE EFFECT" />
          {/* BEFORE — grumpy Scrooge in a top hat, arms crossed */}
          <g>
            <circle cx={560} cy={420} r={70} fill="#161616" />
            <rect x={500} y={330} width={120} height={50} fill="#161616" />
            <rect x={480} y={372} width={160} height={16} fill="#161616" />
            <path d="M 530 410 L 560 418 M 590 410 L 560 418" stroke="#FFFFFF" strokeWidth={5} strokeLinecap="round" />
            <circle cx={540} cy={400} r={5} fill="#FFFFFF" />
            <circle cx={580} cy={400} r={5} fill="#FFFFFF" />
            <path d="M 470 500 L 650 500 L 660 760 L 460 760 Z" fill="#161616" />
            <path d="M 500 560 L 620 560 M 500 560 L 560 620 L 620 560" stroke="#F6EFE3" strokeWidth={5} fill="none" strokeLinecap="round" />
            <text x={560} y={830} textAnchor="middle" fontFamily={FONT.ui} fontSize={32} fill="#F6EFE3">BEFORE</text>
          </g>
          {/* the arrow */}
          <path d="M 760 560 L 920 560" stroke={SKY} strokeWidth={7} strokeLinecap="round" />
          <path d="M 920 560 L 884 532 M 920 560 L 884 588" stroke={SKY} strokeWidth={7} strokeLinecap="round" fill="none" />
          {/* AFTER — smiling, handing a gift to a small figure */}
          <g>
            <GlowDisc cx={1250} cy={540} r={260} color={SKY} o={0.2} />
            <circle cx={1180} cy={420} r={70} fill="#161616" />
            <ellipse cx={1180} cy={428} rx={22} ry={12} fill="#FFFFFF" />
            <circle cx={1160} cy={405} r={5} fill="#FFFFFF" />
            <circle cx={1200} cy={405} r={5} fill="#FFFFFF" />
            <path d="M 1090 500 L 1270 500 L 1280 760 L 1080 760 Z" fill="#161616" />
            <path d="M 1270 560 L 1360 600" stroke="#161616" strokeWidth={14} strokeLinecap="round" />
            {/* the gift box */}
            <rect x={1340} y={560} width={90} height={80} fill="#C0392B" stroke="#161616" strokeWidth={4} />
            <path d="M 1385 560 L 1385 640 M 1340 600 L 1430 600" stroke="#F2C94C" strokeWidth={6} />
            {/* the small figure receiving it */}
            <circle cx={1520} cy={560} r={44} fill="#161616" />
            <circle cx={1506} cy={552} r={4} fill="#FFFFFF" />
            <circle cx={1534} cy={552} r={4} fill="#FFFFFF" />
            <ellipse cx={1520} cy={566} rx={12} ry={7} fill="#FFFFFF" />
            <path d="M 1480 620 L 1560 620 L 1566 760 L 1474 760 Z" fill="#3E8C86" />
            <text x={1250} y={830} textAnchor="middle" fontFamily={FONT.ui} fontSize={32} fill={SKY}>AFTER</text>
          </g>
          <text x={960} y={910} textAnchor="middle" fontFamily={FONT.ui} fontSize={30} fill={SKY}>REMINDING PEOPLE OF DEATH MAKES THEM KINDER</text>
        </g>
      </g>
    );
  },
});

// S34 — Jake and the woman on the bench, both laughing now. Her number:
// "11 YEARS". The sun sets behind them. Camera: slow pull back. Dusk park,
// both seated on the bench laughing, her tag glowing "11 YEARS", a low sun
// on the horizon behind them.
defineScene({
  id: 'S34',
  durationSec: DUR.S34,
  characters: [
    { who: 'jake', x: 0.62, feetY: ROOM_FLOOR_V },
    { who: 'mom', x: 0.74, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const pj = pose('S34', 'jake', f, [
      { f: 0, p: { ...basePose, x: 1200, y: sitY(FLOOR_PX), scale: 1, ...SIT, yaw: 1, expr: 'happy' } },
      { f: len, p: { ...basePose, x: 1200, y: sitY(FLOOR_PX), scale: 1, ...SIT, yaw: 1, expr: 'happy' } },
    ]);
    const faceJ = faceAt(f, [[0, 'happy']]);
    const pw = pose('S34', 'woman', f, [
      { f: 0, p: { ...basePose, x: 1420, y: sitY(FLOOR_PX), scale: 1, ...SIT, yaw: -1, expr: 'happy' } },
      { f: len, p: { ...basePose, x: 1420, y: sitY(FLOOR_PX), scale: 1, ...SIT, yaw: -1, expr: 'happy' } },
    ]);
    const faceW = faceAt(f, [[0, 'happy']]);
    const zoom = kf(f, [[0, 1.1], [len, 1.0]]);
    return (
      <g>
        <g transform={camT(1100, 600, zoom)}>
          <Park t={f} mode="dusk" id="s34" />
          {/* the low sun on the horizon behind the bench */}
          <Glow x={1300} y={660} r={300} o={0.7} />
          <circle cx={1300} cy={660} r={64} fill="#FF9A3D" opacity={0.95} />
          {footShadows(pj)}
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...pj, ...faceJ, facing: 1 }} rimId="rimR" shadow={0} />)}
          {footShadows(pw)}
          {cast('mom', <Hero slim look={LOOKS.mom} pose={{ ...pw, ...faceW, facing: 1 }} rimId="rimR" shadow={0} />)}
          <Countdown x={pw.x} y={countdownY(pw.y, 1)} text="11 YEARS" size={34} />
        </g>
      </g>
    );
  },
});

// ===========================================================================
// CHAPTER 6 — YOUR OWN NUMBER
// ===========================================================================

// S35 — Jake in front of a bathroom mirror, waving his hand above his own
// head, searching for a number. Nothing. Camera: hold still. Jake centre,
// front-facing, his right arm raised waving above his head, puzzled, looking
// up; his dim reflection in the mirror (same pose, low opacity, clipped to
// the glass). NO tag anywhere.
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
      { f: 0, p: { ...basePose, x: 960, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, armR: { a: 150, b: 20 }, handR: 'open', headTilt: -4, expr: 'puzzled' } },
      { f: len, p: { ...basePose, x: 960, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, armR: { a: 150, b: 20 }, handR: 'open', headTilt: -4, expr: 'puzzled' } },
    ]);
    const faceJ = faceAt(f, [[0, 'puzzled']]);
    return (
      <g>
        <g transform={camT(960, 560, 1.0)}>
          <Bathroom t={f} id="s35" />
          {/* his reflection in the mirror — dim, no number above it */}
          <defs>
            <clipPath id="s35mirror"><rect x={676} y={156} width={568} height={488} /></clipPath>
          </defs>
          <g clipPath="url(#s35mirror)" opacity={0.25}>
            {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...pj, ...faceJ, facing: 1 }} rimId="rimBlue" shadow={0} />)}
          </g>
          {footShadows(pj)}
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...pj, ...faceJ, facing: 1 }} rimId="rimBlue" shadow={0} />)}
          {/* NO countdown above Jake — nothing. */}
        </g>
      </g>
    );
  },
});

// S36 — Detective pops up in the bathroom mirror's corner, small, pointing at
// Jake's reflection. Jake looks at him. Camera: hold still. Jake centre,
// puzzled, turning toward the mirror's corner; the Detective appears INSIDE
// the mirror as a reflection — small, in the top-right corner, pointing at
// Jake's reflection. He is a reflection, not a physical character (declared
// airborne with a reason).
defineScene({
  id: 'S36',
  durationSec: DUR.S36,
  characters: [
    { who: 'jake', x: 0.5, feetY: ROOM_FLOOR_V },
    { who: 'detective', x: 0.6, feetY: 0.556, airborne: true, airborneReason: 'reflection inside the bathroom mirror' },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const pj = pose('S36', 'jake', f, [
      { f: 0, p: { ...basePose, x: 960, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, yaw: 1, headTilt: 4, expr: 'puzzled' } },
      { f: len, p: { ...basePose, x: 960, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, yaw: 1, headTilt: 4, expr: 'puzzled' } },
    ]);
    const faceJ = faceAt(f, [[0, 'puzzled']]);
    // The Detective's reflection: small (scale 0.5), feet at y=600 inside the
    // mirror (hip = 600 - 158*0.5 = 521), pointing at Jake's reflection.
    const pd = pose('S36', 'detective', f, [
      { f: 0, p: { ...basePose, x: 1150, y: 521, scale: 0.5, ...STAND, yaw: -1, armL: { a: 120, b: 10 }, handL: 'point', expr: 'smug' } },
      { f: len, p: { ...basePose, x: 1150, y: 521, scale: 0.5, ...STAND, yaw: -1, armL: { a: 120, b: 10 }, handL: 'point', expr: 'smug' } },
    ]);
    const faceD = faceAt(f, [[0, 'smug']]);
    return (
      <g>
        <g transform={camT(960, 560, 1.0)}>
          <Bathroom t={f} id="s36" />
          <defs>
            <clipPath id="s36mirror"><rect x={676} y={156} width={568} height={488} /></clipPath>
          </defs>
          {/* Jake's reflection, dim */}
          <g clipPath="url(#s36mirror)" opacity={0.25}>
            {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...pj, ...faceJ, facing: 1 }} rimId="rimBlue" shadow={0} />)}
          </g>
          {/* the Detective's reflection in the mirror's corner */}
          <g clipPath="url(#s36mirror)" opacity={0.85}>
            {cast('detective', <Hero slim look={LOOKS.detective} pose={{ ...pd, ...faceD, facing: 1 }} rimId="rimBlue" shadow={1} />)}
          </g>
          {footShadows(pj)}
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...pj, ...faceJ, facing: 1 }} rimId="rimBlue" shadow={0} />)}
        </g>
      </g>
    );
  },
});

// S37 — A diagram: a countdown timer above a head, with a red X through it.
// Below it, a person laughing with friends, the timer replaced by a heart.
// Camera: hold still. Chalkboard: top — a head with a "00:00:00" tag crossed
// out in red; bottom — three figures laughing together under a sky-blue heart.
// Caption: "THE NUMBER WAS NEVER THE POINT. THE LIVING WAS."
defineScene({
  id: 'S37',
  durationSec: DUR.S37,
  characters: [],
  fn: (api) => {
    const f = F(api);
    return (
      <g>
        <g transform={camT(960, 560, 1.0)}>
          <Chalkboard t={f} id="s37" />
          {/* top — the countdown with a red X through it */}
          <g>
            <circle cx={960} cy={330} r={56} fill="#161616" />
            <path d="M 910 400 L 1010 400 L 1018 470 L 902 470 Z" fill="#161616" />
            <rect x={840} y={220} width={240} height={64} rx={32} fill="#0B1B2E" stroke={SKY} strokeWidth={3} />
            <text x={960} y={262} textAnchor="middle" fontFamily={FONT.ui} fontSize={34} fontWeight={700} fill={SKY}>00:00:00</text>
            <path d="M 830 200 L 1090 290 M 1090 200 L 830 290" stroke="#C0392B" strokeWidth={10} strokeLinecap="round" />
          </g>
          {/* bottom — three friends laughing, a heart above them */}
          <g>
            <path d="M 960 620 Q 920 580 880 600 Q 862 632 892 662 Q 922 692 960 710 Q 998 692 1028 662 Q 1058 632 1040 600 Q 1000 580 960 620 Z" fill="#C0392B" stroke="#161616" strokeWidth={4} />
            {[780, 960, 1140].map((x, i) => (
              <g key={i}>
                <circle cx={x} cy={760} r={44} fill="#161616" />
                <circle cx={x - 12} cy={754} r={4} fill="#FFFFFF" />
                <circle cx={x + 12} cy={754} r={4} fill="#FFFFFF" />
                <ellipse cx={x} cy={768} rx={12} ry={7} fill="#FFFFFF" />
                <path d={`M ${x - 40} ${820} L ${x + 40} ${820} L ${x + 46} ${920} L ${x - 46} ${920} Z`} fill={['#D96A5F', '#3E8C86', '#F2C94C'][i]} />
              </g>
            ))}
          </g>
          <text x={960} y={980} textAnchor="middle" fontFamily={FONT.ui} fontSize={30} fill={SKY}>THE NUMBER WAS NEVER THE POINT. THE LIVING WAS.</text>
        </g>
      </g>
    );
  },
});

// S38 — Jake walks through the morning crowd. The numbers are still above
// every head — but he stops looking at them. He smiles at a stranger.
// Camera: slow push-in. Morning street, Jake walking mid-stride, happy,
// smiling at a stranger passing the other way; the crowd tagged around them.
defineScene({
  id: 'S38',
  durationSec: DUR.S38,
  characters: [
    { who: 'jake', x: 0.45, feetY: ROOM_FLOOR_V },
    { who: 'guestA', x: 0.68, feetY: ROOM_FLOOR_V },
    { who: 'guestB', x: 0.2, feetY: ROOM_FLOOR_V },
    { who: 'guestC', x: 0.85, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const pj = pose('S38', 'jake', f, [
      { f: 0, p: { ...basePose, x: 700, y: standY(1, ROOM_FLOOR_V), scale: 1, ...WALK, yaw: 1, expr: 'happy' } },
      { f: len, p: { ...basePose, x: 1000, y: standY(1, ROOM_FLOOR_V), scale: 1, ...WALK, yaw: 1, expr: 'happy' } },
    ]);
    const faceJ = faceAt(f, [[0, 'happy']]);
    const zoom = kf(f, [[0, 1.0], [len, 1.1]]);
    return (
      <g>
        <g transform={camT(960, 560, zoom)}>
          <CityStreet t={f} mode="day" id="s38" />
          {Ped({ scene: 'S38', label: 'ped1', x: 380, look: 'guestB', scale: 0.9, tag: '16 YRS', expr: 'neutral', yaw: -1 }, f, len)}
          {Ped({ scene: 'S38', label: 'ped2', x: 1640, look: 'guestC', scale: 0.9, tag: '5 DAYS', expr: 'neutral', yaw: 1 }, f, len)}
          {Ped({ scene: 'S38', label: 'stranger', x: 1300, look: 'guestA', scale: 1, tag: '28 YRS', expr: 'happy', yaw: -1 }, f, len)}
          {footShadows(pj)}
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...pj, ...faceJ, facing: 1 }} rimId="rimR" shadow={0} />)}
        </g>
      </g>
    );
  },
});

// S39 — Jake's phone. He dials his mom. She answers. He smiles. Above the
// heads of the crowd behind him, the numbers keep ticking — but he doesn't
// look. Camera: hold still. Jake centre-right, phone to his ear, smiling; the
// crowd behind him tagged, out of his attention.
defineScene({
  id: 'S39',
  durationSec: DUR.S39,
  characters: [
    { who: 'jake', x: 0.57, feetY: ROOM_FLOOR_V },
    { who: 'guestA', x: 0.25, feetY: ROOM_FLOOR_V },
    { who: 'guestB', x: 0.78, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const pj = pose('S39', 'jake', f, [
      { f: 0, p: { ...basePose, x: 1100, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, armR: { a: 55, b: 70 }, handR: 'open', expr: 'happy' } },
      { f: len, p: { ...basePose, x: 1100, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, armR: { a: 55, b: 70 }, handR: 'open', expr: 'happy' } },
    ]);
    const faceJ = faceAt(f, [[0, 'happy']]);
    const hj = toWorld(pj, joints(pj, true).armR.end);
    return (
      <g>
        <g transform={camT(960, 560, 1.05)}>
          <CityStreet t={f} mode="day" id="s39" />
          {Ped({ scene: 'S39', label: 'ped1', x: 480, look: 'guestA', scale: 0.85, tag: '12 YRS', expr: 'neutral', yaw: 1 }, f, len)}
          {Ped({ scene: 'S39', label: 'ped2', x: 1500, look: 'guestB', scale: 0.85, tag: '6 HRS', expr: 'neutral', yaw: -1 }, f, len)}
          {footShadows(pj)}
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...pj, ...faceJ, facing: 1 }} rimId="rimR" shadow={0} />)}
          <rect x={hj.x - 9} y={hj.y - 34} width={18} height={34} rx={4} fill="#161616" stroke="#3A3E4A" strokeWidth={2} />
          <rect x={hj.x - 6} y={hj.y - 30} width={12} height={26} rx={2} fill="#8FD3FF" opacity={0.85} />
        </g>
      </g>
    );
  },
});

// ===========================================================================
// CLOSE
// ===========================================================================

// S40 — Jake sits on the same park bench from the cold open, coffee in hand,
// watching the morning crowd. The numbers glow above every head. He sips his
// coffee, calm. Camera: slow push-in. Park morning, Jake seated on the bench
// with his coffee, calm; the crowd passes behind him, tagged.
defineScene({
  id: 'S40',
  durationSec: DUR.S40,
  characters: [
    { who: 'jake', x: 0.68, feetY: ROOM_FLOOR_V },
    { who: 'guestA', x: 0.25, feetY: ROOM_FLOOR_V },
    { who: 'guestB', x: 0.85, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const pj = pose('S40', 'jake', f, [
      { f: 0, p: { ...basePose, x: 1300, y: sitY(FLOOR_PX), scale: 1, ...SIT, armR: { a: 55, b: 65 }, handR: 'open', expr: 'neutral' } },
      { f: len, p: { ...basePose, x: 1300, y: sitY(FLOOR_PX), scale: 1, ...SIT, armR: { a: 55, b: 65 }, handR: 'open', expr: 'neutral' } },
    ]);
    const faceJ = faceAt(f, [[0, 'neutral']]);
    const hj = toWorld(pj, joints(pj, true).armR.end);
    const zoom = kf(f, [[0, 1.0], [len, 1.1]]);
    return (
      <g>
        <g transform={camT(1200, 600, zoom)}>
          <Park t={f} mode="day" id="s40" />
          {Ped({ scene: 'S40', label: 'ped1', x: 480, look: 'guestA', scale: 0.85, tag: '41 YRS', expr: 'neutral', yaw: 1 }, f, len)}
          {Ped({ scene: 'S40', label: 'ped2', x: 1640, look: 'guestB', scale: 0.85, tag: '8 DAYS', expr: 'neutral', yaw: -1 }, f, len)}
          {footShadows(pj)}
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...pj, ...faceJ, facing: 1 }} rimId="rimR" shadow={0} />)}
          {/* coffee in his hand */}
          <rect x={hj.x - 10} y={hj.y - 26} width={20} height={26} rx={4} fill="#F6EFE3" stroke="#161616" strokeWidth={2} />
          <rect x={hj.x - 10} y={hj.y - 26} width={20} height={8} rx={4} fill="#6A4526" />
        </g>
      </g>
    );
  },
});

// S41 — A montage: the businessman looking at the sky, the woman laughing
// with her brother, the friend cooking dinner, the kid chasing pigeons.
// Camera: gentle pan right. Four film-strip panels, each its own mini-world:
// sky + ground + one character at 0.55 scale with a tag. Panel floors at
// y=920 (v=0.852).
defineScene({
  id: 'S41',
  durationSec: DUR.S41,
  characters: [
    { who: 'suit', x: 0.14, feetY: 0.852 },
    { who: 'mom', x: 0.36, feetY: 0.852 },
    { who: 'guestA', x: 0.42, feetY: 0.852 },
    { who: 'guestB', x: 0.6, feetY: 0.852 },
    { who: 'student', x: 0.86, feetY: 0.852 },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const pan = kf(f, [[0, 880], [len, 1080]]);
    const panel = (x: number, skyTop: string, skyBot: string, ground: string) => (
      <g>
        <rect x={x} y={200} width={430} height={720} rx={16} fill={skyTop} />
        <rect x={x} y={200} width={430} height={720} rx={16} fill="none" stroke="#0E0C1E" strokeWidth={6} />
        <rect x={x} y={200} width={430} height={520} rx={16} fill={skyBot} opacity={0.5} />
        <rect x={x} y={860} width={430} height={60} fill={ground} />
      </g>
    );
    // panel 1 — the businessman looking at the sky
    const p1 = pose('S41', 'biz', f, [
      { f: 0, p: { ...basePose, x: 275, y: 833, scale: 0.55, ...STAND, headTilt: -8, expr: 'happy' } },
      { f: len, p: { ...basePose, x: 275, y: 833, scale: 0.55, ...STAND, headTilt: -8, expr: 'happy' } },
    ]);
    const face1 = faceAt(f, [[0, 'happy']]);
    // panel 2 — the woman laughing with her brother
    const p2 = pose('S41', 'woman', f, [
      { f: 0, p: { ...basePose, x: 640, y: 833, scale: 0.55, ...SIT, yaw: 1, expr: 'happy' } },
      { f: len, p: { ...basePose, x: 640, y: 833, scale: 0.55, ...SIT, yaw: 1, expr: 'happy' } },
    ]);
    const face2 = faceAt(f, [[0, 'happy']]);
    const p2b = pose('S41', 'brother', f, [
      { f: 0, p: { ...basePose, x: 810, y: 833, scale: 0.55, ...SIT, yaw: -1, expr: 'happy' } },
      { f: len, p: { ...basePose, x: 810, y: 833, scale: 0.55, ...SIT, yaw: -1, expr: 'happy' } },
    ]);
    const face2b = faceAt(f, [[0, 'happy']]);
    // panel 3 — the friend cooking dinner
    const p3 = pose('S41', 'friend', f, [
      { f: 0, p: { ...basePose, x: 1185, y: 833, scale: 0.55, ...STAND, yaw: 1, armR: { a: 60, b: 50 }, handR: 'open', expr: 'happy' } },
      { f: len, p: { ...basePose, x: 1185, y: 833, scale: 0.55, ...STAND, yaw: 1, armR: { a: 60, b: 50 }, handR: 'open', expr: 'happy' } },
    ]);
    const face3 = faceAt(f, [[0, 'happy']]);
    // panel 4 — the kid chasing pigeons
    const p4 = pose('S41', 'kid', f, [
      { f: 0, p: { ...basePose, x: 1655, y: 833, scale: 0.55, ...WALK, yaw: 1, armL: { a: 60, b: 20 }, armR: { a: 60, b: 20 }, expr: 'happy' } },
      { f: len, p: { ...basePose, x: 1655, y: 833, scale: 0.55, ...WALK, yaw: 1, armL: { a: 60, b: 20 }, armR: { a: 60, b: 20 }, expr: 'happy' } },
    ]);
    const face4 = faceAt(f, [[0, 'happy']]);
    return (
      <g>
        <g transform={camT(pan, 560, 1.0)}>
          <rect x={0} y={0} width={1920} height={1080} fill="#0E0C1E" />
          {panel(60, '#5E9BD6', '#D9ECF7', '#6E6878')}
          {panel(500, '#3A2E5E', '#E8845A', '#4A7A44')}
          {panel(940, '#F2E3C8', '#D9BE96', '#8A6A4A')}
          {panel(1380, '#6FA8DC', '#D9ECF7', '#4A7A44')}
          {/* panel 1 — businessman, sky, no tag (the number is gone) */}
          <circle cx={275} cy={300} r={40} fill="#FFE9A8" />
          {cast('suit', <Hero slim look={LOOKS.suit} pose={{ ...p1, ...face1, facing: 1 }} rimId="rimR" shadow={0} />)}
          {/* panel 2 — the woman + her brother, laughing */}
          {cast('mom', <Hero slim look={LOOKS.mom} pose={{ ...p2, ...face2, facing: 1 }} rimId="rimR" shadow={0} />)}
          {cast('guestA', <Hero slim look={LOOKS.guestA} pose={{ ...p2b, ...face2b, facing: 1 }} rimId="rimR" shadow={0} />)}
          <Countdown x={640} y={640} text="11 YEARS" size={22} />
          {/* panel 3 — the friend cooking, steam */}
          <rect x={1130} y={760} width={110} height={60} rx={8} fill="#5A6E8F" stroke="#161616" strokeWidth={3} />
          <path d="M 1185 760 Q 1175 730 1188 710" stroke="#FFFFFF" strokeWidth={4} fill="none" opacity={0.5} strokeLinecap="round" />
          {cast('guestB', <Hero slim look={LOOKS.guestB} pose={{ ...p3, ...face3, facing: 1 }} rimId="rimR" shadow={0} />)}
          <Countdown x={1185} y={640} text="40 YEARS" size={22} />
          {/* panel 4 — the kid + pigeons */}
          <Pigeon x={1560} y={900} s={0.8} />
          <Pigeon x={1760} y={910} s={0.7} flip />
          {cast('student', <Hero slim look={LOOKS.student} pose={{ ...p4, ...face4, facing: 1 }} rimId="rimR" shadow={0} />)}
          <Countdown x={1655} y={640} text="78 YEARS" size={22} />
        </g>
      </g>
    );
  },
});

// S42 — Jake looks at the camera. The Detective sneaks into the background,
// behind a tree, in shadow, giving a small wave. Camera: slow pull back.
// Park day; Jake centre, front-facing, direct address; the Detective small
// (scale 0.5) behind a tree trunk on the right, in shadow, his right arm
// raised in a small wave — the trunk (drawn after him) covers half of him.
defineScene({
  id: 'S42',
  durationSec: DUR.S42,
  characters: [
    { who: 'jake', x: 0.5, feetY: ROOM_FLOOR_V },
    { who: 'detective', x: 0.86, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const pj = pose('S42', 'jake', f, [
      { f: 0, p: { ...basePose, x: 960, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, expr: 'neutral' } },
      { f: len, p: { ...basePose, x: 960, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, expr: 'neutral' } },
    ]);
    const faceJ = faceAt(f, [[0, 'neutral']]);
    const pd = pose('S42', 'detective', f, [
      { f: 0, p: { ...basePose, x: 1650, y: standY(0.5, ROOM_FLOOR_V), scale: 0.5, ...STAND, yaw: -1, armR: { a: 140, b: 20 }, handR: 'open', expr: 'smug' } },
      { f: len, p: { ...basePose, x: 1650, y: standY(0.5, ROOM_FLOOR_V), scale: 0.5, ...STAND, yaw: -1, armR: { a: 140, b: 20 }, handR: 'open', expr: 'smug' } },
    ]);
    const faceD = faceAt(f, [[0, 'smug']]);
    const zoom = kf(f, [[0, 1.1], [len, 1.0]]);
    return (
      <g>
        <g transform={camT(960, 560, zoom)}>
          <Park t={f} mode="day" id="s42" />
          <g opacity={0.85}>
            {cast('detective', <Hero slim look={LOOKS.detective} pose={{ ...pd, ...faceD, facing: 1 }} rimId="rimBlue" shadow={1} />)}
          </g>
          {/* the tree trunk covers his left half — he is IN the shadow */}
          <g>
            <rect x={1620} y={560} width={34} height={320} fill="#3A2A1E" />
            <circle cx={1637} cy={500} r={130} fill="#2E4A2E" />
            <circle cx={1560} cy={560} r={80} fill="#38583A" />
            <circle cx={1720} cy={560} r={80} fill="#334F34" />
            <ellipse cx={1637} cy={884} rx={160} ry={14} fill="#000" opacity={0.3} />
          </g>
          {footShadows(pj)}
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...pj, ...faceJ, facing: 1 }} rimId="rimR" shadow={0} />)}
        </g>
      </g>
    );
  },
});

// S43 — END CARD: Inkl logo + "Curiosity. Explained." + Subscribe button.
// Sky blue accent on the logo. No narration. No verbal ask. Final shot.
defineScene({
  id: 'S43',
  durationSec: DUR.S43,
  characters: [],
  fn: (api) => {
    const f = F(api);
    return (
      <g>
        <g transform={camT(960, 540, 1.0)}>
          <EndCard />
          {/* sky-blue halo on the logo */}
          <GlowDisc cx={960} cy={400} r={320} color={SKY} o={0.22} />
        </g>
      </g>
    );
  },
});

// ---------------------------------------------------------------------------
// Registry helpers — the timeline is DERIVED from these durations, never
// hand-written.
// ---------------------------------------------------------------------------

export const zenn009Scenes = (): SceneDef[] =>
  getScenes().filter((s) => s.id !== 'S53-example' && /^S\d+$/.test(s.id));

export const zenn009Timeline = (fps = FPS) => {
  let frame = 0;
  return zenn009Scenes().map((s) => {
    const len = Math.round(s.durationSec * fps);
    const shot = { id: s.id, first: frame, len, durationSec: s.durationSec };
    frame += len;
    return shot;
  });
};

export const zenn009TotalSec = () => zenn009Scenes().reduce((sum, s) => sum + s.durationSec, 0);

// Adapter: a scene def becomes an episode Shot (ShotProps clock in frames).
export const sceneToShot = (def: SceneDef): React.FC<ShotProps> => {
  const Shot: React.FC<ShotProps> = ({ t, len }) => {
    setCurrentScene(def.id);
    const floorY = def.characters[0]?.feetY ?? ROOM_FLOOR_V;
    return def.fn({ t: t / FPS, duration: def.durationSec, floorY, frame: t, fps: FPS });
  };
  return Shot;
};

export const zenn009Shots = (): Record<string, React.FC<ShotProps>> => {
  const out: Record<string, React.FC<ShotProps>> = {};
  for (const def of zenn009Scenes()) out[def.id] = sceneToShot(def);
  return out;
};

export { guardScene, guardNoIdleFlap, countReversals, totalDurationSec } from '../../engine/sceneBuilder';
