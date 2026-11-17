// "Why Your Brain Deletes the Scariest Moments of Your Life" — video #6, 2D Remotion build.
// 43 narrative beats (S1-S43) + end card, each its own sealed scene function
// with a set duration (modular scene build, Nov 14). Durations from the script's
// word counts at video #3's measured pace (527s / 1,368 words = 0.385 s/word),
// min 4s per beat. Audio sync comes later (George voiceover).
//
// LOOK (locked, rule book + script header): Jake is a BLACK SILHOUETTE —
// round solid black head, black torso/limbs, white oval eyes, no ears, no
// nose, no mouth, no chin. Moonlight blue glow (#A9C6FF rim,
// rimId="rimBlue") on Jake's edges in EVERY scene — never removed. Jake:
// plain red shirt #C0392B, BALD, NO glasses (removed Nov 14 — brows/eyes
// carry the expression now). Accent: lime green #A3E635 — sparse highlight
// on the focal element ONLY (the clock digits here). Never on
// characters/glow.
//
// MAIN CAST = 1 (Nov 17, Javion: "having 2 is a bit annoying" — get rid of
// the Detective). Jake ("you") is the SOLE main character. The Detective was
// removed from every scene in this file Nov 17 — no cameos, no pop-ups, no
// narration framing. Jake carries every scene alone. Do NOT add any new
// character.
//
// STYLE LOCK (Nov 14): the FUSION CUTAWAY sample is the ONLY style — small
// round heads, thin stick limbs, slate coat, deerstalker with bow, moonlight
// blue glow on every character, RICH DETAILED SETS (no plain empty walls, no
// blank banners, no unfinished set piece), colored outfit on every character.
// SLIM BUILD: small round head (r 54), thin black stick arms and legs, longer
// legs (158). HANDS (Mars lock): plain black mitten, no fingers. FEET: plain
// rounded black ovals flat on the floor.
//
// BED RULE (Nov 14, Javion — approved v42 bed): a bed's mattress sits at KNEE
// height, not waist height. For a SEATED character that means the mattress top
// is one shin below the floor line: floor v=0.811 (y=876), mattress top y=787
// (= floor - 89, the sitY hip height), so a character sitting on the edge has
// hips on the mattress and feet flat on the floor. NO headboard.
//
// MOVEMENT (fluent, Nov 14): one movement at a time, a move spans >=15 frames,
// hold >=0.5s after it lands, head leads / body follows. Standing poses repeat
// IDENTICAL arm/look values at every key (0 reversals). look stays 0 unless
// the beat names a look; eyes never dart.

import React from 'react';
import {
  Hero, basePose, poseAt, faceAt, kf, camT, lerp, clamp, LOOKS,
  FONT, MOONLIGHT, ShotProps, joints, toWorld,
  RealDefs, WindowShaft, AtmoHaze, Vignette, GlowDisc, SoftShadow, Dust,
} from '../../engine';
import {
  defineScene, getScenes, SceneDef,
} from '../../engine/sceneBuilder';
import { EndCard } from '../../engine/ui';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const FPS = 30;
export const LIME = '#A3E635'; // video #6 accent — focal element only
export const CREAM = '#F6EFE3';
export const INK = '#161616';
// Floor lines (v coordinate, 0..1 in the 1920x1080 world). Room sets: feet at
// 876 -> v = 0.811. Slim build: hip height at scale 1 is 876 - 158 = 718.
export const ROOM_FLOOR_V = 0.811;
export const FLOOR_PX = 876;
/** Hip y (px) for a character of `scale` standing with feet on floor v. Slim leg length 158. */
export const standY = (scale: number, floorV: number) => floorV * 1080 - 158 * scale;
/** Hip y for a SEATED character whose feet plant on the rug: hip sits on the
    mattress top (787); the SIT angles (a=82, b=-82) drop the foot to y=887,
    overlapping the rug body. See SIT comment — the foot must OVERLAP the rug,
    not just touch the floor line. */
export const sitY = (floorYPx: number, scale = 1) => floorYPx - 89 * scale;
/** Mattress top for a knee-height bed: one sit-height below the floor line,
    so a seated character's hips rest on the mattress and feet plant on the floor. */
export const MATTRESS_PX = 787;

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
// SIT (fixed Nov 15, Javion: "Why is his feet hovering?") — the old {a:75, b:-75}
// left the feet perched on the rug's thin back edge with no contact, reading as
// floating. The rig's shin angle is RELATIVE (a2 = a + b), so a vertical shin needs
// a + b = 0. {a:82, b:-82}: thigh slopes 8 deg below horizontal, shin perfectly
// vertical, foot lands at y=887 — 11px below the wall/floor line (876) but 6-8px
// INSIDE the rug body (rug top at the feet's x is y=879-881), so the foot overlaps
// the rug surface instead of balancing on its rim. Verified with joints(): drop =
// 80*cos(82) + 78*cos(0) = 89.1, shoe bottom = 787 + 89.1 + 11 = 887.1. A foot
// exactly at 876 (a=90) would sit 3-5px ABOVE the rug surface and still hover.
// Rule: seated feet must OVERLAP the rug, not just touch the floor line.
export const SIT = { armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 82, b: -82 }, legR: { a: 82, b: -82 }, look: 0, headTilt: 0, tilt: 0 };
// SIT_FRONT (Nov 15, Javion: "Why the fuck isn't he facing us?") — a seated
// character FACING THE CAMERA. The rig's SIT points both thighs sideways
// (a=82), which on a front-facing torso reads as a twisted body. Front-facing
// thighs point AT the camera, so they are foreshortened: thighScale 0.4 draws
// the thigh at 32px, and the legs splay SYMMETRICALLY (legL a=-70, legR a=+70,
// shins vertical via b=∓70) so the knees/feet sit evenly either side of the
// body instead of both jutting to one side. Verified with joints(): knee at
// (±52, 11), foot at (±52, 89), shoe bottom = 787 + 89 + 11 = 887 (on the rug,
// same as SIT). Use for any seated character facing the viewer (S1-S4 bed).
// NEVER "fix" a front-torso twist by turning the character to profile —
// face them at the camera and match the legs to the torso.
export const SIT_FRONT = { armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: -70, b: 70 }, legR: { a: 70, b: -70 }, look: 0, headTilt: 0, tilt: 0, thighScale: 0.4 };

// ---------------------------------------------------------------------------
// Backdrops drawn inline for this video (the engine sets cover the rest)
// ---------------------------------------------------------------------------

/** S1/S40/S42: the night bedroom — cold dark blue walls, moonlight ONLY (no warm
    lamp: Jake just woke from sleep at 3 AM, nobody turned the lamp on — the lamp
    stays as furniture, OFF). Window with moon + stars, moonlight pool on the floor.
    The bed is a knee-height platform (mattress top y=787, floor 876), cream mattress,
    purple blanket, puffy pillow, NO headboard. Nightstand UNDER THE WINDOW on
    the left (moved Nov 15 — the right side is the door now); lamp (OFF) + digital
    clock reading 3:00 AM in lime green on it. The DOOR is a real interior door
    on the right, ~340px wide (x 1560-1900) — about 40% of the bed's visible LENGTH
    in side view (30" door vs 75" bed length at ~11.2px/inch). Framed print,
    rug, door. STYLE LOCK: a finished room, not empty dark space — every wall
    carries something (window, print, door, seams, baseboard). */
export const NightBedroom: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <RealDefs p="nb" palette="night" />
    {/* bedroom-only gradients: wood, mattress, rug, door */}
    <defs>
      <linearGradient id="nbwood" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#54432E" />
        <stop offset="100%" stopColor="#33261A" />
      </linearGradient>
      <linearGradient id="nbmattress" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#F2E8D0" />
        <stop offset="100%" stopColor="#D8CDB2" />
      </linearGradient>
      <radialGradient id="nbRug" cx="0.5" cy="0.4" r="0.8">
        <stop offset="0%" stopColor="#453545" />
        <stop offset="100%" stopColor="#2E222E" />
      </radialGradient>
      <linearGradient id="nbdoor" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#2A2333" />
        <stop offset="100%" stopColor="#1A1424" />
      </linearGradient>
    </defs>
    {/* ceiling + walls: gradient, cold dark blue */}
    <rect x={0} y={0} width={1920} height={120} fill="#0E1224" />
    <rect x={0} y={120} width={1920} height={756} fill="url(#nbwall)" />
    <rect x={0} y={876} width={1920} height={204} fill="url(#nbfloor)" />
    {/* moonlight shaft from the window — the moon sits high-RIGHT in the
        window, so the beam angles down-LEFT to the pool on the floor.
        (Nov 15 direction rule: the v6 sample had it backwards.) */}
    <WindowShaft p="nb" sill={[140, 460, 560]} floorY={1000} dir={-1} seed={11} />
    {/* wall panel seams — right seam sits in the gap between bed and door */}
    {[480, 1390].map((x) => (
      <path key={x} d={`M ${x} 120 L ${x} 876`} stroke="#232B47" strokeWidth={3} opacity={0.7} />
    ))}
    {/* baseboard */}
    <rect x={0} y={852} width={1920} height={24} fill="#10142A" stroke="#05070F" strokeWidth={2} />
    {/* floor boards */}
    <path d="M 0 960 L 1920 960" stroke="#1E1626" strokeWidth={2} opacity={0.8} />
    {[320, 640, 1280, 1600].map((x) => (
      <path key={x} d={`M ${x} 876 L ${x - 30} 1080`} stroke="#1E1626" strokeWidth={2} opacity={0.6} />
    ))}
    {/* window, left wall: night sky, moon, stars, books on the sill */}
    <g>
      <rect x={140} y={170} width={320} height={390} fill="#0B0816" stroke="#05070F" strokeWidth={6} />
      <rect x={156} y={186} width={288} height={358} fill="url(#nbsky)" />
      {[[200, 240], [260, 300], [340, 230], [400, 320], [220, 420], [380, 460], [300, 500], [180, 340]].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={2.5} fill="#F6EFE3" opacity={0.8} />
      ))}
      {/* moon halo + moon (soft, diffused — not a flat disc) */}
      <circle cx={380} cy={260} r={120} fill="url(#nbhalo)" />
      <circle cx={380} cy={260} r={46} fill="#FFE2B0" opacity={0.95} />
      <circle cx={366} cy={248} r={8} fill="#E8D2A0" opacity={0.7} />
      <circle cx={392} cy={272} r={6} fill="#E8D2A0" opacity={0.7} />
      <path d="M 300 186 L 300 544 M 156 365 L 444 365" stroke="#05070F" strokeWidth={8} />
      <rect x={128} y={560} width={344} height={16} fill="#05070F" />
      <rect x={170} y={528} width={70} height={32} rx={3} fill="#5A4A6A" stroke="#161616" strokeWidth={3} />
      <rect x={180} y={506} width={56} height={22} rx={3} fill="#7A5A3A" stroke="#161616" strokeWidth={3} />
    </g>
    {/* framed print above the bed's left end — moon over a dark skyline */}
    <g>
      <rect x={600} y={240} width={250} height={160} fill="#2A2E3A" stroke="#8A7A5A" strokeWidth={5} />
      <rect x={612} y={252} width={226} height={136} fill="#1E2436" />
      <circle cx={725} cy={300} r={34} fill="url(#nbhalo)" opacity={0.6} />
      <circle cx={725} cy={300} r={20} fill="#FFE2B0" />
      <path d="M 612 360 L 660 330 L 700 356 L 740 336 L 770 360 L 838 360 L 838 388 L 612 388 Z" fill="#0B0816" />
    </g>
    {/* door, far right — a REAL interior door, ~340px wide (x 1560-1900).
        Side view: the bed's 840px is its LENGTH (75" twin), so scale is
        ~11.2px/inch and a 30" door is ~340px — about 40% of the bed's visible
        length. (Fixed Nov 15 twice: v1 was 120px, v2 overcorrected to 500px.)
        Closed, dark. Panels and knob scaled to match the width. */}
    <g>
      <rect x={1560} y={280} width={340} height={596} fill="url(#nbdoor)" stroke="#0E0C1E" strokeWidth={5} />
      <rect x={1590} y={300} width={280} height={260} fill="#1A1424" stroke="#0E0C1E" strokeWidth={3} />
      <rect x={1590} y={580} width={280} height={276} fill="#1A1424" stroke="#0E0C1E" strokeWidth={3} />
      <circle cx={1852} cy={580} r={9} fill="#8A7A5A" stroke="#0E0C1E" strokeWidth={3} />
    </g>
    {/* rug under the bed front */}
    <ellipse cx={930} cy={930} rx={430} ry={52} fill="url(#nbRug)" stroke="#241A24" strokeWidth={3} />
    <ellipse cx={930} cy={930} rx={360} ry={38} fill="none" stroke="#5A3A4A" strokeWidth={3} opacity={0.7} />
    {/* bed: platform, knee height — mattress top y=787, floor 876. No headboard. */}
    <g>
      <rect x={490} y={821} width={880} height={55} fill="url(#nbwood)" stroke="#161616" strokeWidth={4} />
      <rect x={480} y={787} width={900} height={34} fill="url(#nbmattress)" stroke="#161616" strokeWidth={4} />
      {/* puffy pillow, left end — soft volume + a crease */}
      <path d="M 520 787 Q 520 748 570 744 Q 660 738 720 748 Q 740 760 730 787 Z" fill="url(#nbpillow)" stroke="#161616" strokeWidth={4} />
      <path d="M 560 776 Q 625 770 690 776" stroke="#5A4A72" strokeWidth={3} fill="none" opacity={0.5} strokeLinecap="round" />
      {/* purple blanket over the right half + fold over the foot end — gradient
          volume + fold lines so it drapes like fabric, not a flat sheet */}
      <rect x={1030} y={787} width={350} height={34} fill="url(#nbblanket)" stroke="#161616" strokeWidth={3} />
      <path d="M 1120 787 L 1120 821 M 1240 787 L 1240 821" stroke="#26244A" strokeWidth={3} opacity={0.5} />
      <path d="M 1360 787 L 1380 787 L 1380 850 Q 1370 856 1360 850 Z" fill="#2E2C55" stroke="#161616" strokeWidth={3} />
    </g>
    {/* nightstand — under the window on the left (moved Nov 15 to make room
        for the full-width door on the right) */}
    <g>
      <rect x={170} y={700} width={180} height={176} fill="url(#nbwood)" stroke="#161616" strokeWidth={4} />
      <rect x={186} y={716} width={148} height={70} fill="#2E2418" stroke="#161616" strokeWidth={3} />
      <circle cx={260} cy={751} r={7} fill="#8A7A5A" stroke="#161616" strokeWidth={2} />
      <path d="M 170 806 L 350 806" stroke="#161616" strokeWidth={3} />
    </g>
    {/* lamp — OFF. Jake just woke from sleep at 3 AM; nobody turned it on.
        Unlit shade (dark fabric, no warm fill), bulb dark, NO warm glow circle,
        NO light pool. The lamp stays as furniture. Moonlight carries the scene.
        Shade top (576) just meets the window sill's bottom edge. (Fixed Nov 15:
        Javion — "why is his lamp on at 3?") */}
    <g>
      <rect x={300} y={688} width={30} height={12} rx={4} fill="#2E2418" stroke="#161616" strokeWidth={3} />
      <line x1={315} y1={688} x2={315} y2={630} stroke="#161616" strokeWidth={6} strokeLinecap="round" />
      <path d="M 275 630 L 355 630 L 342 576 L 288 576 Z" fill="#3A352F" stroke="#161616" strokeWidth={3} strokeLinejoin="round" />
    </g>
    {/* digital clock on the nightstand — lime green digits, 3:00 AM, soft glow */}
    <g>
      <circle cx={242} cy={675} r={70} fill="url(#nbclock)" />
      <rect x={178} y={650} width={128} height={50} rx={8} fill="#1E1824" stroke="#161616" strokeWidth={3} />
      <text x={225} y={684} textAnchor="middle" fontFamily={FONT.ui} fontSize={32} fill={LIME}>3:00</text>
      <text x={288} y={680} textAnchor="middle" fontFamily={FONT.ui} fontSize={15} fill={LIME}>AM</text>
    </g>
    {/* atmosphere: haze unifies the palette, vignette falls off to darkness */}
    <AtmoHaze color="#2A2A55" o={0.06} />
    <Vignette p="nb" />
  </g>
);

/** S5: the morning kitchen — daylight, warm cream walls, wood floor. Jake sits
    at the kitchen table (left) staring at his untouched cereal; the white bear
    sits across from him (right), eating. Window with blue sky + sun, fridge,
    counter with cereal boxes + fruit bowl, wall clock (~7:05), pendant lamp
    (OFF — it's daylight), rug under the table. The rug is big (rx 480, cy 925)
    so seated feet at y=887 OVERLAP its surface at both sitters' x — see the
    S1 rug lesson: feet must overlap the rug, never balance on its rim.
    MIKO REBUILD (Nov 15): gradients replace flat fills (walls, floor, sky,
    wood, rug, fridge, counter), a visible SUNLIGHT shaft angles down-LEFT
    from the window (sun high-RIGHT at x=1080, y=250 — direction rule), with
    dust motes + a warm pool on the open floor, a warm haze unifies the palette
    and a light vignette closes the edges. All coordinates unchanged. */
export const MorningKitchen: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <RealDefs p="mk" palette="day" />
    {/* kitchen-only gradients: warm wood, table, chairs, rug, fridge, counter */}
    <defs>
      <linearGradient id="mkceiling" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#F5EDDA" />
        <stop offset="100%" stopColor="#E9DFC8" />
      </linearGradient>
      <linearGradient id="mkwood" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#8A6238" />
        <stop offset="100%" stopColor="#5E4429" />
      </linearGradient>
      <linearGradient id="mktable" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#8A5E36" />
        <stop offset="100%" stopColor="#6A4426" />
      </linearGradient>
      <linearGradient id="mkchair" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#6A4426" />
        <stop offset="100%" stopColor="#4A2E16" />
      </linearGradient>
      <radialGradient id="mkrug" cx="0.5" cy="0.4" r="0.8">
        <stop offset="0%" stopColor="#C07A5E" />
        <stop offset="100%" stopColor="#9A5A42" />
      </radialGradient>
      <linearGradient id="mkfridge" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#F2EDE2" />
        <stop offset="55%" stopColor="#EDE8DE" />
        <stop offset="100%" stopColor="#D8D2C2" />
      </linearGradient>
      <linearGradient id="mkcounter" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#96684A" />
        <stop offset="100%" stopColor="#6A4A2E" />
      </linearGradient>
      <linearGradient id="mkcream" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FBF6EC" />
        <stop offset="100%" stopColor="#EDE4D0" />
      </linearGradient>
    </defs>
    {/* ceiling + warm cream walls */}
    <rect x={0} y={0} width={1920} height={120} fill="url(#mkceiling)" />
    <rect x={0} y={120} width={1920} height={756} fill="url(#mkwall)" />
    {/* wood floor */}
    <rect x={0} y={876} width={1920} height={204} fill="url(#mkfloor)" />
    <path d="M 0 960 L 1920 960" stroke="#5E4429" strokeWidth={2} opacity={0.8} />
    {[320, 640, 1280, 1600].map((x) => (
      <path key={x} d={`M ${x} 876 L ${x - 30} 1080`} stroke="#5E4429" strokeWidth={2} opacity={0.6} />
    ))}
    {/* baseboard */}
    <rect x={0} y={852} width={1920} height={24} fill="url(#mkcream)" stroke="#C9BFA8" strokeWidth={2} />
    {/* sunlight shaft from the window — the sun sits high-RIGHT in the window
        (cx 1080, cy 250), so the beam angles down-LEFT to the pool on the
        floor. (Nov 15 direction rule: the v6 sample had it backwards.)
        The pool lands where the beam lands (under the rug's left edge) — the
        rug covers most of it, which is correct: the light falls on the rug. */}
    <WindowShaft p="mk" sill={[700, 1180, 520]} floorY={1000} dir={-1} seed={7} />
    {/* window, back wall: blue sky, sun, clouds, plant on the sill */}
    <g>
      <rect x={700} y={170} width={480} height={350} fill="url(#mkcream)" stroke="#C9BFA8" strokeWidth={6} />
      <rect x={716} y={186} width={448} height={318} fill="url(#mksky)" />
      {/* sun halo + sun (soft, diffused — not a flat disc) */}
      <circle cx={1080} cy={250} r={120} fill="url(#mkhalo)" />
      <circle cx={1080} cy={250} r={42} fill="#FFE2B0" />
      <ellipse cx={820} cy={260} rx={70} ry={22} fill="#FFFFFF" opacity={0.9} />
      <ellipse cx={980} cy={330} rx={90} ry={26} fill="#FFFFFF" opacity={0.85} />
      <path d="M 940 186 L 940 504 M 716 345 L 1164 345" stroke="#F6EFE3" strokeWidth={8} />
      <rect x={688} y={520} width={504} height={16} fill="url(#mkcream)" />
      {/* small plant on the sill */}
      <rect x={740} y={492} width={44} height={28} rx={4} fill="#C85A46" stroke="#161616" strokeWidth={3} />
      <path d="M 762 492 Q 750 462 738 456 M 762 492 Q 762 458 762 452 M 762 492 Q 774 462 786 456" stroke="#5E8C46" strokeWidth={5} fill="none" strokeLinecap="round" />
    </g>
    {/* fridge, left wall */}
    <g>
      <rect x={110} y={320} width={220} height={556} fill="url(#mkfridge)" stroke="#B8B2A4" strokeWidth={4} />
      <path d="M 110 520 L 330 520" stroke="#B8B2A4" strokeWidth={3} />
      <rect x={300} y={360} width={12} height={90} rx={6} fill="#8A8578" />
      <rect x={300} y={560} width={12} height={90} rx={6} fill="#8A8578" />
      {/* magnets + a kid's drawing */}
      <circle cx={170} cy={380} r={10} fill="#C0392B" />
      <circle cx={210} cy={420} r={10} fill="#3E8C86" />
      <rect x={230} y={360} width={56} height={70} rx={4} fill="#FFFFFF" stroke="#161616" strokeWidth={2} transform="rotate(4 258 395)" />
      <path d="M 240 410 L 252 382 L 264 408 Z" fill="#5E8C46" transform="rotate(4 258 395)" />
    </g>
    {/* counter + cabinets, right wall: cereal boxes, fruit bowl */}
    <g>
      <rect x={1480} y={560} width={340} height={316} fill="url(#mkcounter)" stroke="#5E4429" strokeWidth={4} />
      <rect x={1480} y={560} width={340} height={24} fill="url(#mkcream)" stroke="#C9BFA8" strokeWidth={3} />
      <path d="M 1650 584 L 1650 876" stroke="#5E4429" strokeWidth={3} />
      <circle cx={1565} cy={720} r={7} fill="#5E4429" />
      <circle cx={1735} cy={720} r={7} fill="#5E4429" />
      {/* cereal boxes on the counter */}
      <rect x={1520} y={440} width={70} height={120} fill="#C0392B" stroke="#161616" strokeWidth={3} />
      <rect x={1520} y={470} width={70} height={34} fill="#F2C94C" stroke="#161616" strokeWidth={2} />
      <rect x={1610} y={460} width={60} height={100} fill="#3E8C86" stroke="#161616" strokeWidth={3} />
      <rect x={1610} y={486} width={60} height={28} fill="#F6EFE3" stroke="#161616" strokeWidth={2} />
      {/* fruit bowl */}
      <path d="M 1700 540 A 42 26 0 0 0 1784 540 Z" fill="#3E8C86" stroke="#161616" strokeWidth={3} />
      <circle cx={1720} cy={528} r={12} fill="#D96A5F" stroke="#161616" strokeWidth={2} />
      <circle cx={1744} cy={524} r={12} fill="#F2C94C" stroke="#161616" strokeWidth={2} />
      <circle cx={1764} cy={530} r={11} fill="#5E8C46" stroke="#161616" strokeWidth={2} />
    </g>
    {/* wall clock (~7:05) */}
    <g>
      <circle cx={1560} cy={260} r={55} fill="url(#mkcream)" stroke="#161616" strokeWidth={4} />
      <path d="M 1560 260 L 1560 222 M 1560 260 L 1588 272" stroke="#161616" strokeWidth={5} strokeLinecap="round" />
      <circle cx={1560} cy={260} r={5} fill="#161616" />
    </g>
    {/* pendant lamp over the table — OFF, it's daylight. Fixture only. */}
    <g>
      <line x1={960} y1={120} x2={960} y2={196} stroke="#161616" strokeWidth={5} />
      <path d="M 920 246 L 1000 246 L 986 196 L 934 196 Z" fill="#3A352F" stroke="#161616" strokeWidth={3} strokeLinejoin="round" />
    </g>
    {/* rug under the table — big, so seated feet overlap it at both ends */}
    <ellipse cx={960} cy={925} rx={480} ry={60} fill="url(#mkrug)" stroke="#8A4A38" strokeWidth={3} />
    <ellipse cx={960} cy={925} rx={400} ry={44} fill="none" stroke="#D89A7A" strokeWidth={3} opacity={0.7} />
    {/* soft blurred ground shadow under the table (light pools on the floor,
        the table grounds into it — no hard shadow anywhere in the set) */}
    <ellipse cx={960} cy={880} rx={330} ry={16} fill="#000" opacity={0.22} filter="url(#mksoftBlur)" />
    {/* table — NOV 15 FIX (Javion: "the table looks weird with the chairs"):
        the old top sat 12px above the chair seats (same colour, one merged
        plank) and the legs hid behind the chairs, so the table floated. Now:
        top at y=715 (32 thick, lighter warm brown + top highlight), 40px clear
        gap down to the chair seats at 787, legs in the CLEAR zone between the
        sitters' feet (x 800 + 1120) so they reach the floor visibly, plus a
        stretcher bar tying the legs together so the wide overhang reads as a
        sturdy farmhouse base, not a floating plank.
        NOV 15 FIX v4 (Javion: "the back of the chair is too close and they
        not sitting on the edge of the table"): the top used to span x=560-1380,
        running BEHIND both sitters' backs and crossing both backrests, so they
        read as sitting on the SIDE of the table. Now the top spans x=670-1250
        only — it ends at each sitter's front (belly), never extends behind a
        back or crosses a backrest. Sitters sit AT the table's edge. */}
    <g>
      <rect x={670} y={715} width={580} height={32} fill="url(#mktable)" stroke="#161616" strokeWidth={4} />
      <rect x={674} y={719} width={572} height={5} fill="#9A6A3A" />
      <rect x={800} y={747} width={26} height={129} fill="url(#mkwood)" stroke="#161616" strokeWidth={3} />
      <rect x={1120} y={747} width={26} height={129} fill="url(#mkwood)" stroke="#161616" strokeWidth={3} />
      <rect x={800} y={830} width={346} height={16} fill="url(#mkchair)" stroke="#161616" strokeWidth={3} />
    </g>
    {/* chairs — NOV 15 FIX v3 (fresh-eyes diagnosis): the v2 backs were drawn
        in FRONT view (two posts + top rail + mid slat = the width of a chair
        back seen head-on) while the table, the room and both sitters are in
        pure SIDE view — so the chairs read as turned 90° from the people
        sitting on them. Also the backs floated 20–60px behind the sitters'
        backs (nobody was leaning on anything) and the mid slat sat at exactly
        the tabletop's height, vanishing into it. Now each chair is drawn in
        PROFILE, like everything else in the room: one solid vertical backrest
        bar (rounded top) rising behind the sitter and TOUCHING their back,
        seat at hip height 787, legs to the floor. Dark wood, darker
        than the table so the chairs read as separate objects. */}
    <g>
      {/* Jake's chair, left — solid profile backrest touching his back.
          NOV 15 FIX v5 (Javion, 5th flag): the backrest (x 592-614) sat 20px
          RIGHT of the back leg (x 556-572) — they never overlapped, so the
          backrest read as a separate stick stuck on top of the seat instead of
          one continuous back leg running floor-to-shoulder (the bear's chair
          has them aligned). Now the back leg sits directly under the backrest
          (x 595) and the seat starts at the backrest (x 592) — no stub behind. */}
      <rect x={592} y={787} width={108} height={18} fill="url(#mkchair)" stroke="#161616" strokeWidth={3} />
      <rect x={592} y={655} width={22} height={132} rx={8} fill="url(#mkchair)" stroke="#161616" strokeWidth={3} />
      <rect x={595} y={805} width={16} height={71} fill="url(#mkchair)" stroke="#161616" strokeWidth={3} />
      <rect x={668} y={805} width={16} height={71} fill="url(#mkchair)" stroke="#161616" strokeWidth={3} />
      {/* bear's chair, right — solid profile backrest touching his back */}
      <rect x={1240} y={787} width={140} height={18} fill="url(#mkchair)" stroke="#161616" strokeWidth={3} />
      <rect x={1358} y={655} width={22} height={132} rx={8} fill="url(#mkchair)" stroke="#161616" strokeWidth={3} />
      <rect x={1252} y={805} width={16} height={71} fill="url(#mkchair)" stroke="#161616" strokeWidth={3} />
      <rect x={1372} y={805} width={16} height={71} fill="url(#mkchair)" stroke="#161616" strokeWidth={3} />
    </g>
    {/* cereal box, centre of the table (sits on the new tabletop, y=715) */}
    <g>
      <rect x={930} y={595} width={64} height={120} fill="#C0392B" stroke="#161616" strokeWidth={3} />
      <rect x={930} y={625} width={64} height={32} fill="#F2C94C" stroke="#161616" strokeWidth={2} />
      <circle cx={962} cy={685} r={12} fill="#F6EFE3" stroke="#161616" strokeWidth={2} />
    </g>
    {/* Jake's bowl (untouched) + spoon, left on the table.
        NOV 15 FIX (Javion: "the bowls of cereal is phasing through the
        table"): the bowl's base dipped to y=736, 21px BELOW the tabletop's
        top (y=715), so it sank into the table. Now the whole bowl sits ON the
        tabletop — base at y=715, rim at y=691. */}
    <g>
      <path d="M 758 691 A 32 24 0 0 0 822 691 Z" fill="url(#mkcream)" stroke="#161616" strokeWidth={3} />
      <ellipse cx={790} cy={691} rx={30} ry={7} fill="#E8DFC8" />
      <circle cx={778} cy={689} r={4} fill="#C9A86A" />
      <circle cx={794} cy={687} r={4} fill="#C9A86A" />
      <circle cx={806} cy={690} r={4} fill="#C9A86A" />
      <line x1={806} y1={685} x2={832} y2={655} stroke="#8A8578" strokeWidth={5} strokeLinecap="round" />
    </g>
    {/* bear's bowl, right on the table — same fix: base on the tabletop (y=715), rim at y=691 */}
    <g>
      <path d="M 1138 691 A 32 24 0 0 0 1202 691 Z" fill="url(#mkcream)" stroke="#161616" strokeWidth={3} />
      <ellipse cx={1170} cy={691} rx={30} ry={7} fill="#E8DFC8" />
      <circle cx={1158} cy={689} r={4} fill="#C9A86A" />
      <circle cx={1174} cy={687} r={4} fill="#C9A86A" />
      <circle cx={1186} cy={690} r={4} fill="#C9A86A" />
    </g>
    {/* atmosphere: warm haze unifies the palette, light vignette closes the edges */}
    <AtmoHaze color="#F5E6C8" o={0.05} />
    <Vignette p="mk" o={0.5} />
  </g>
);

/** The white bear (S5, new one-off character) — fully white, seated across the
    table from Jake, eating cereal with a spoon. Round head (r 54, same as Jake),
    small round ears, black oval eyes + black oval nose, NO mouth (Nov 15 rule —
    heads stay smooth with eyes only; the bear is no exception). Facing left
    (three-quarter): eyes + nose shifted left. Legs extend left under the table,
    feet flat on the floor at y=887, overlapping the rug, with contact shadows.
    Drawn as inline SVG (not a Hero) — it is not in the rig's cast. */
export const Bear: React.FC<{ x: number; hipY: number; mouthOpen?: number }> = ({ x, hipY, mouthOpen }) => {
  const footY = 887;
  return (
    <g>
      {/* contact shadows under the feet — exactly under each foot (feet are
          at x-55 / x-30); a shadow offset from its foot reads as the bear
          floating. Drawn first, feet cover their top edge */}
      <ellipse cx={x - 55} cy={footY + 2} rx={20} ry={6} fill="#000" opacity={0.35} />
      <ellipse cx={x - 30} cy={footY + 2} rx={20} ry={6} fill="#000" opacity={0.35} />
      {/* legs: thighs forward (left), shins vertical, white with black outline */}
      <path d={`M ${x} ${hipY} L ${x - 55} ${hipY + 13} L ${x - 55} ${footY - 11}`} stroke="#161616" strokeWidth={22} strokeLinecap="round" fill="none" />
      <path d={`M ${x} ${hipY} L ${x - 55} ${hipY + 13} L ${x - 55} ${footY - 11}`} stroke="#F6F0E4" strokeWidth={16} strokeLinecap="round" fill="none" />
      <path d={`M ${x + 6} ${hipY} L ${x - 30} ${hipY + 15} L ${x - 30} ${footY - 11}`} stroke="#161616" strokeWidth={22} strokeLinecap="round" fill="none" />
      <path d={`M ${x + 6} ${hipY} L ${x - 30} ${hipY + 15} L ${x - 30} ${footY - 11}`} stroke="#F6F0E4" strokeWidth={16} strokeLinecap="round" fill="none" />
      {/* feet: white ovals flat on the floor */}
      <ellipse cx={x - 55} cy={footY} rx={20} ry={11} fill="#F6F0E4" stroke="#161616" strokeWidth={3} />
      <ellipse cx={x - 30} cy={footY} rx={20} ry={11} fill="#F6F0E4" stroke="#161616" strokeWidth={3} />
      {/* torso: big round white belly */}
      <ellipse cx={x} cy={hipY - 77} rx={62} ry={80} fill="#F6F0E4" stroke="#161616" strokeWidth={4} />
      {/* far arm down at the side */}
      <path d={`M ${x + 52} ${hipY - 120} L ${x + 58} ${hipY - 40}`} stroke="#161616" strokeWidth={22} strokeLinecap="round" fill="none" />
      <path d={`M ${x + 52} ${hipY - 120} L ${x + 58} ${hipY - 40}`} stroke="#F6F0E4" strokeWidth={16} strokeLinecap="round" fill="none" />
      <circle cx={x + 58} cy={hipY - 34} r={12} fill="#F6F0E4" stroke="#161616" strokeWidth={3} />
      {/* ears */}
      <circle cx={x - 38} cy={hipY - 232} r={14} fill="#F6F0E4" stroke="#161616" strokeWidth={3} />
      <circle cx={x + 34} cy={hipY - 236} r={14} fill="#F6F0E4" stroke="#161616" strokeWidth={3} />
      <circle cx={x - 38} cy={hipY - 232} r={7} fill="#D8CFC0" />
      <circle cx={x + 34} cy={hipY - 236} r={7} fill="#D8CFC0" />
      {/* head */}
      <circle cx={x - 8} cy={hipY - 188} r={54} fill="#F6F0E4" stroke="#161616" strokeWidth={4} />
      {/* muzzle + nose + eyes (shifted left — facing left, three-quarter) */}
      <ellipse cx={x - 24} cy={hipY - 170} rx={24} ry={15} fill="#E8DFCE" />
      <ellipse cx={x - 34} cy={hipY - 172} rx={10} ry={7} fill="#161616" />
      <ellipse cx={x - 28} cy={hipY - 194} rx={7} ry={10} fill="#161616" />
      <ellipse cx={x + 2} cy={hipY - 196} rx={7} ry={10} fill="#161616" />
      {/* near arm LOWERED — paw rests in the lap, spoon pointing down (Nov 15,
          Javion: "Why is the bear constantly holding his paw to his face" — the
          raised spoon arm never came down, and paw + spoon + nose + muzzle were
          all jumbled at the face). A character eating lowers the spoon between
          bites; it does not hold it to its face. Bent arm: shoulder down to the
          elbow, then back in to the paw resting on the thigh. The spoon hangs
          from the paw, bowl end down toward the table — the face (eyes, nose,
          muzzle, lip-sync mouth) is now completely clear. */}
      <path d={`M ${x - 45} ${hipY - 122} L ${x - 62} ${hipY - 60} L ${x - 48} ${hipY - 15}`} stroke="#161616" strokeWidth={22} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d={`M ${x - 45} ${hipY - 122} L ${x - 62} ${hipY - 60} L ${x - 48} ${hipY - 15}`} stroke="#F6F0E4" strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx={x - 48} cy={hipY - 15} r={12} fill="#F6F0E4" stroke="#161616" strokeWidth={3} />
      <line x1={x - 48} y1={hipY - 15} x2={x - 68} y2={hipY + 13} stroke="#8A8578" strokeWidth={5} strokeLinecap="round" />
      <ellipse cx={x - 70} cy={hipY + 17} rx={10} ry={6} fill="#C9C2B2" stroke="#161616" strokeWidth={2} transform={`rotate(-65 ${x - 70} ${hipY + 17})`} />
      {/* lip-sync mouth (Nov 15, Javion: mouth moves with the narration) — a dark
          ellipse on the muzzle that opens with the speech amplitude and vanishes
          when the bear is silent. The spoon paw now rests in the lap, far below
          the face, so the mouth sits centred on the muzzle under the nose. */}
      {mouthOpen !== undefined && mouthOpen > 0.01 ? (
        <ellipse cx={x - 18} cy={hipY - 158} rx={8} ry={Math.max(1.5, mouthOpen * 6.5)} fill="#161616" />
      ) : null}
      {/* moonlight-blue rim on the upper-left edge (same rim light as Jake) */}
      <path d={`M ${x - 56} ${hipY - 200} A 54 54 0 0 1 ${x - 30} ${hipY - 238}`} stroke="#A9C6FF" strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.85} />
    </g>
  );
};

/** S17: the delete-button stage — a plain dark room, spotlight on the pedestal.
    The button is the hero prop: big red circle (r 150) on a pedestal, DELETE in
    white across it. Sized against the room: the button is ~27 inches across at
    the room's ~11.2px/inch scale — giant, as scripted. Spotlight cone + light
    pool on the floor. Nothing else in the room — the button is the whole point.
    MIKO REBUILD (Nov 15): gradient walls/floor/ceiling, cool two-cone spotlight
    beam with dust, glowing floor pool, volumetric button + pedestal, soft
    contact shadow, haze + vignette. All coordinates unchanged. */
export const DeleteStage: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <RealDefs p="ds" palette="night" />
    <defs>
      {/* ceiling: dark falloff, lighter near the spotlight source */}
      <linearGradient id="dsceil" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#181D36" />
        <stop offset="100%" stopColor="#0E1226" />
      </linearGradient>
      {/* baseboard: soft vertical falloff */}
      <linearGradient id="dsbase" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#151A30" />
        <stop offset="100%" stopColor="#0A0D1E" />
      </linearGradient>
      {/* pedestal body: top-lit, darker toward the floor */}
      <linearGradient id="dspede" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#363A48" />
        <stop offset="100%" stopColor="#22252F" />
      </linearGradient>
      {/* pedestal cap: catches the spotlight */}
      <linearGradient id="dspedeTop" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#4A4E5C" />
        <stop offset="100%" stopColor="#2C303C" />
      </linearGradient>
      {/* the giant red button: lit from upper-left, deep red at the rim —
          stays the bold focal colour, now with volume instead of a flat disc */}
      <radialGradient id="dsbutton" cx="0.35" cy="0.3" r="0.85">
        <stop offset="0%" stopColor="#E05545" />
        <stop offset="55%" stopColor="#C0392B" />
        <stop offset="100%" stopColor="#8E2418" />
      </radialGradient>
    </defs>
    {/* ceiling + dark walls */}
    <rect x={0} y={0} width={1920} height={120} fill="url(#dsceil)" />
    <rect x={0} y={120} width={1920} height={756} fill="url(#dswall)" />
    <rect x={0} y={876} width={1920} height={204} fill="url(#dsfloor)" />
    {/* wall panel seams */}
    {[480, 1440].map((x) => (
      <path key={x} d={`M ${x} 120 L ${x} 876`} stroke="#232B47" strokeWidth={3} opacity={0.7} />
    ))}
    {/* baseboard */}
    <rect x={0} y={852} width={1920} height={24} fill="url(#dsbase)" stroke="#05070F" strokeWidth={2} />
    {/* floor boards */}
    <path d="M 0 960 L 1920 960" stroke="#1E1626" strokeWidth={2} opacity={0.8} />
    {[320, 640, 1280, 1600].map((x) => (
      <path key={x} d={`M ${x} 876 L ${x - 30} 1080`} stroke="#1E1626" strokeWidth={2} opacity={0.6} />
    ))}
    {/* spotlight: halo where the beam enters, then the beam itself.
        Source is directly overhead (centred on 1325), so the beam is
        vertical — wide soft cone + narrower brighter core, cool moonlight. */}
    <GlowDisc cx={1325} cy={120} r={130} color="#C8D8FF" o={0.4} />
    <polygon points="1250,120 1400,120 1520,876 1130,876" fill="url(#dsshaft)" filter="url(#dsshaftBlur)" opacity={0.9} />
    <polygon points="1287,120 1362,120 1418,876 1232,876" fill="url(#dsshaft)" filter="url(#dsshaftBlur)" opacity={0.9} />
    {/* dust drifting in the beam */}
    <Dust t={t} seed={31} x0={1130} y0={200} w={390} h={676} n={22} o={0.5} />
    {/* light pool on the floor */}
    <ellipse cx={1325} cy={930} rx={320} ry={42} fill="url(#dspool)" />
    {/* soft contact shadow under the pedestal */}
    <SoftShadow p="ds" cx={1325} cy={882} rx={150} ry={16} o={0.45} />
    {/* pedestal */}
    <rect x={1230} y={700} width={190} height={176} fill="url(#dspede)" stroke="#161616" strokeWidth={4} />
    <rect x={1215} y={685} width={220} height={20} fill="url(#dspedeTop)" stroke="#161616" strokeWidth={4} />
    {/* the giant red button — DELETE in white across it */}
    <circle cx={1325} cy={560} r={150} fill="url(#dsbutton)" stroke="#161616" strokeWidth={6} />
    <circle cx={1325} cy={560} r={128} fill="none" stroke="#96281B" strokeWidth={4} opacity={0.6} />
    <path d="M 1215 480 A 120 120 0 0 1 1300 432" stroke="#FFFFFF" strokeWidth={7} fill="none" strokeLinecap="round" opacity={0.5} />
    <text x={1325} y={580} textAnchor="middle" fontFamily={FONT.title} fontSize={58} fontWeight={800} fill="#FFFFFF">DELETE</text>
    {/* atmosphere: haze unifies the palette, vignette falls off to darkness */}
    <AtmoHaze />
    <Vignette p="ds" />
  </g>
);

/** An EMPTY thought bubble above Jake's head (S2/S4) — white cloud outline,
    empty inside (filled with the wall colour so nothing is drawn in it). The
    cloud is built from overlapping circles drawn twice: stroke+fill first,
    then fill-only, so the strokes where circles overlap are painted over and
    only the outer silhouette keeps its outline. Two small trailing dots lead
    down to the top of Jake's head (head centre 960,599; head top 545). */
export const ThoughtBubble: React.FC = () => {
  const circles: [number, number, number][] = [
    [870, 430, 52],
    [930, 380, 66],
    [1010, 385, 62],
    [1075, 430, 50],
    [905, 450, 55],
    [990, 452, 58],
  ];
  return (
    <g>
      {circles.map(([cx, cy, r], i) => (
        <circle key={`o${i}`} cx={cx} cy={cy} r={r} fill="#1A2036" stroke="#F6EFE3" strokeWidth={4} />
      ))}
      {circles.map(([cx, cy, r], i) => (
        <circle key={`f${i}`} cx={cx} cy={cy} r={r} fill="#1A2036" />
      ))}
      {/* trailing dots down toward Jake's head */}
      <circle cx={945} cy={508} r={10} fill="#1A2036" stroke="#F6EFE3" strokeWidth={3} />
      <circle cx={953} cy={538} r={7} fill="#1A2036" stroke="#F6EFE3" strokeWidth={3} />
    </g>
  );
};

/** Jake LYING in bed, asleep (S40/S41/S42). The Hero rig has no lying pose,
    so he is drawn as an inline silhouette: round black head resting on the
    pillow (left end of the bed, head centre 620,760), CLOSED eyes (two short
    white lines), a low black ridge for the torso lying on the mattress top
    (787) with a slight shoulder bump near the head, running under the purple
    blanket (which already covers x1030-1380 in NightBedroom). Moonlight-blue
    rim on the upper-left edge of the head. ONE shared drawing — S40, S41 and
    S42 all use it, so Jake never jumps between cuts. */
export const LyingJake: React.FC = () => (
  <g>
    {/* torso ridge on the mattress top: shoulder bump near the head, tapering
        flat toward the blanket. Bottom edge sits exactly on the mattress top
        (787) so the body reads as lying ON the bed, never floating. */}
    <path
      d="M 668 787 L 668 778 Q 700 764 740 772 Q 780 780 830 782 L 1030 784 L 1030 787 Z"
      fill="#161616"
    />
    {/* head resting on the pillow */}
    <circle cx={620} cy={760} r={54} fill="#161616" stroke="#000000" strokeWidth={4} />
    {/* moonlight-blue rim, upper-left edge */}
    <path d="M 572 742 A 54 54 0 0 1 606 708" stroke={MOONLIGHT} strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.85} />
    {/* closed eyes — two short white lines, asleep */}
    <path d="M 592 750 Q 600 754 608 750" stroke="#F6EFE3" strokeWidth={3} fill="none" strokeLinecap="round" />
    <path d="M 632 750 Q 640 754 648 750" stroke="#F6EFE3" strokeWidth={3} fill="none" strokeLinecap="round" />
  </g>
);

/** The word-pair card (S18/S19/S21): cream card, ~420x260, dark text that
    fits inside it. sx/sy let the same card flip (scaleX only) in S18 and
    shrink (uniform) in S19/S21. The blank back carries a small diamond
    motif, no words. */
export const WordCard: React.FC<{ cx: number; cy: number; sx: number; sy: number; dx?: number; label?: string | null; fontSize?: number; back?: boolean }> = ({ cx, cy, sx, sy, dx = 0, label = null, fontSize = 44, back = false }) => (
  <g transform={`translate(${cx + dx} ${cy}) scale(${sx} ${sy})`}>
    <rect x={-210} y={-130} width={420} height={260} rx={18} fill={back ? '#E8DFC8' : '#F6EFE3'} stroke="#161616" strokeWidth={5} />
    <rect x={-196} y={-116} width={392} height={232} rx={12} fill="none" stroke="#161616" strokeWidth={2} opacity={0.35} />
    {label ? <text x={0} y={16} textAnchor="middle" fontFamily={FONT.title} fontSize={fontSize} fontWeight={800} fill="#161616">{label}</text> : null}
    {back ? <path d="M 0 -40 L 26 0 L 0 40 L -26 0 Z" fill="none" stroke="#8A7A5A" strokeWidth={3} /> : null}
  </g>
);

// S20 — "Inside Jake's head: a control room." Two one-off supporting
// silhouettes (neither is Jake), drawn inline like the Bear: the
// prefrontal-cortex operator (flat cap, teal shirt) at the switchboard on the
// LEFT pulls a lever down; the hippocampus librarian (glasses, bun,
// burgundy shirt) at her desk on the RIGHT dims her lamp.

/** Operator: black silhouette, flat cap + brim, teal shirt. His right arm
    reaches the pulled lever (x=520); handY animates down with the lever knob. */
export const Operator: React.FC<{ handY: number }> = ({ handY }) => (
  <g>
    <ellipse cx={340} cy={878} rx={20} ry={6} fill="#000" opacity={0.35} />
    <ellipse cx={382} cy={878} rx={20} ry={6} fill="#000" opacity={0.35} />
    {/* legs */}
    <path d="M 360 718 L 342 865" stroke="#161616" strokeWidth={20} strokeLinecap="round" fill="none" />
    <path d="M 360 718 L 380 865" stroke="#161616" strokeWidth={20} strokeLinecap="round" fill="none" />
    <ellipse cx={340} cy={872} rx={20} ry={11} fill="#161616" />
    <ellipse cx={382} cy={872} rx={20} ry={11} fill="#161616" />
    {/* torso: teal shirt */}
    <ellipse cx={360} cy={655} rx={48} ry={75} fill="#3E8C86" stroke="#161616" strokeWidth={4} />
    {/* left arm hanging at his side */}
    <path d="M 320 610 L 305 700" stroke="#161616" strokeWidth={22} strokeLinecap="round" fill="none" />
    <path d="M 320 610 L 305 700" stroke="#3E8C86" strokeWidth={16} strokeLinecap="round" fill="none" />
    <circle cx={305} cy={705} r={11} fill="#161616" />
    {/* right arm reaching up to the lever — follows the knob down */}
    <path d={`M 390 605 Q 470 530 520 ${handY}`} stroke="#161616" strokeWidth={22} strokeLinecap="round" fill="none" />
    <path d={`M 390 605 Q 470 530 520 ${handY}`} stroke="#3E8C86" strokeWidth={16} strokeLinecap="round" fill="none" />
    <circle cx={520} cy={handY} r={11} fill="#161616" />
    {/* head + flat cap (dome + brim pointing right, toward the panel) */}
    <circle cx={360} cy={530} r={54} fill="#161616" />
    <path d="M 306 532 A 54 54 0 0 1 414 532 Z" fill="#2E4A6A" stroke="#161616" strokeWidth={3} />
    <ellipse cx={424} cy={524} rx={18} ry={6} fill="#2E4A6A" stroke="#161616" strokeWidth={2} />
    {/* white oval eyes, shifted right — facing the switchboard */}
    <ellipse cx={378} cy={530} rx={7} ry={10} fill="#FFFFFF" />
    <ellipse cx={400} cy={530} rx={7} ry={10} fill="#FFFFFF" />
    {/* moonlight rim on the upper-left edge */}
    <path d="M 312 518 A 54 54 0 0 1 336 480" stroke={MOONLIGHT} strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.85} />
  </g>
);

/** Librarian: black silhouette, glasses + hair bun, burgundy shirt. She stands
    behind her desk (the desk front covers her legs); her right arm reaches
    toward the lamp on the desk. */
export const Librarian: React.FC = () => (
  <g>
    {/* torso: burgundy shirt (desk covers everything below y=700) */}
    <ellipse cx={1620} cy={665} rx={50} ry={75} fill="#8A5A6A" stroke="#161616" strokeWidth={4} />
    {/* left arm hanging at her side */}
    <path d="M 1665 610 L 1680 690" stroke="#161616" strokeWidth={22} strokeLinecap="round" fill="none" />
    <path d="M 1665 610 L 1680 690" stroke="#8A5A6A" strokeWidth={16} strokeLinecap="round" fill="none" />
    <circle cx={1680} cy={695} r={11} fill="#161616" />
    {/* right arm reaching left toward the lamp */}
    <path d="M 1580 610 Q 1540 630 1505 655" stroke="#161616" strokeWidth={22} strokeLinecap="round" fill="none" />
    <path d="M 1580 610 Q 1540 630 1505 655" stroke="#8A5A6A" strokeWidth={16} strokeLinecap="round" fill="none" />
    <circle cx={1505} cy={655} r={11} fill="#161616" />
    {/* head + hair bun */}
    <circle cx={1620} cy={470} r={16} fill="#4A3226" stroke="#161616" strokeWidth={3} />
    <circle cx={1620} cy={530} r={54} fill="#161616" />
    {/* white oval eyes, shifted left — facing the lamp */}
    <ellipse cx={1602} cy={530} rx={7} ry={10} fill="#FFFFFF" />
    <ellipse cx={1624} cy={530} rx={7} ry={10} fill="#FFFFFF" />
    {/* glasses: rims around both eyes + bridge + temples */}
    <circle cx={1602} cy={530} r={15} fill="none" stroke="#F6EFE3" strokeWidth={3} />
    <circle cx={1624} cy={530} r={15} fill="none" stroke="#F6EFE3" strokeWidth={3} />
    <line x1={1617} y1={530} x2={1609} y2={530} stroke="#F6EFE3" strokeWidth={3} />
    <line x1={1587} y1={528} x2={1568} y2={524} stroke="#F6EFE3" strokeWidth={3} />
    <line x1={1639} y1={528} x2={1658} y2={524} stroke="#F6EFE3" strokeWidth={3} />
    {/* moonlight rim on the upper-left edge */}
    <path d="M 1572 518 A 54 54 0 0 1 1596 480" stroke={MOONLIGHT} strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.85} />
  </g>
);

/** The control room set (S20): dark walls, ceiling pipes, switchboard panel
    with levers + lights on the LEFT, librarian's desk with a lamp on the
    RIGHT. leverY animates the middle lever down; lampGlow fades the lamp.
    MIKO REBUILD (Nov 15): gradient walls/floor/ceiling/pipes/panel/desk,
    warm lamp halo (GlowDisc, still driven by lampGlow), glowing indicator
    lights, soft contact shadows under panel + desk, haze + vignette.
    All coordinates unchanged; leverY / lampGlow behaviour unchanged. */
export const ControlRoom: React.FC<{ leverY: number; lampGlow: number }> = ({ leverY, lampGlow }) => (
  <g>
    <RealDefs p="cr" palette="night" />
    <defs>
      {/* ceiling: dark falloff */}
      <linearGradient id="crceil" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#181D36" />
        <stop offset="100%" stopColor="#0E1226" />
      </linearGradient>
      {/* baseboard: soft vertical falloff */}
      <linearGradient id="crbase" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#151A30" />
        <stop offset="100%" stopColor="#0A0D1E" />
      </linearGradient>
      {/* ceiling pipes: metal catching a little light on top */}
      <linearGradient id="crpipe" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#3A3E4A" />
        <stop offset="100%" stopColor="#20242F" />
      </linearGradient>
      {/* switchboard panel: top-lit, darker toward the floor */}
      <linearGradient id="crpanel" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#333743" />
        <stop offset="100%" stopColor="#22252F" />
      </linearGradient>
      {/* label plates: dark, faintly lighter on top */}
      <linearGradient id="crplate" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#221A30" />
        <stop offset="100%" stopColor="#130E1C" />
      </linearGradient>
      {/* desk top: warm wood, lit by the lamp */}
      <linearGradient id="crdeskTop" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#A8763F" />
        <stop offset="100%" stopColor="#7A5228" />
      </linearGradient>
      {/* desk front: darker wood, falling off toward the floor */}
      <linearGradient id="crdeskFront" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#7A5636" />
        <stop offset="100%" stopColor="#4E3319" />
      </linearGradient>
      {/* wall shelf: warm wood in shadow */}
      <linearGradient id="crshelf" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#4A3A28" />
        <stop offset="100%" stopColor="#2E2418" />
      </linearGradient>
    </defs>
    {/* ceiling + dark walls + floor */}
    <rect x={0} y={0} width={1920} height={120} fill="url(#crceil)" />
    <rect x={0} y={120} width={1920} height={756} fill="url(#crwall)" />
    <rect x={0} y={876} width={1920} height={204} fill="url(#crfloor)" />
    {/* ceiling pipes */}
    <rect x={0} y={78} width={1920} height={14} fill="url(#crpipe)" stroke="#161616" strokeWidth={2} />
    <rect x={0} y={100} width={1920} height={10} fill="url(#crpipe)" stroke="#161616" strokeWidth={2} />
    {[300, 900, 1500].map((x) => (
      <rect key={x} x={x} y={76} width={18} height={38} fill="url(#crpipe)" stroke="#161616" strokeWidth={2} />
    ))}
    {/* wall panel seams + baseboard + floor boards */}
    {[700, 1250].map((x) => (
      <path key={x} d={`M ${x} 120 L ${x} 876`} stroke="#232B47" strokeWidth={3} opacity={0.7} />
    ))}
    <rect x={0} y={852} width={1920} height={24} fill="url(#crbase)" stroke="#05070F" strokeWidth={2} />
    <path d="M 0 960 L 1920 960" stroke="#1E1626" strokeWidth={2} opacity={0.8} />
    {[320, 640, 1280, 1600].map((x) => (
      <path key={x} d={`M ${x} 876 L ${x - 30} 1080`} stroke="#1E1626" strokeWidth={2} opacity={0.6} />
    ))}
    {/* vent grate, right wall */}
    <g>
      <rect x={1830} y={200} width={70} height={110} fill="url(#crpanel)" stroke="#161616" strokeWidth={3} />
      {[220, 240, 260, 280].map((y) => (
        <line key={y} x1={1838} y1={y} x2={1892} y2={y} stroke="#161616" strokeWidth={4} />
      ))}
    </g>
    {/* soft contact shadows on the floor, under the panel and the desk */}
    <SoftShadow p="cr" cx={380} cy={882} rx={280} ry={14} o={0.4} />
    <SoftShadow p="cr" cx={1540} cy={882} rx={260} ry={14} o={0.4} />
    {/* ---- switchboard panel, LEFT (x 120-640) ---- */}
    <g>
      <rect x={120} y={260} width={520} height={616} fill="url(#crpanel)" stroke="#161616" strokeWidth={4} />
      <rect x={136} y={276} width={488} height={584} fill="none" stroke="#3A3E4A" strokeWidth={2} />
      {/* label plate on the panel */}
      <rect x={220} y={292} width={320} height={40} rx={6} fill="url(#crplate)" stroke="#161616" strokeWidth={3} />
      <text x={380} y={320} textAnchor="middle" fontFamily={FONT.ui} fontSize={22} fill="#F6EFE3">PREFRONTAL CORTEX</text>
      {/* row of small indicator lights (+ faint halos so they read as lit) */}
      {[[180, 372, '#5E8C46'], [250, 372, '#F2C94C'], [320, 372, '#5E8C46'], [390, 372, '#C85A46'], [460, 372, '#5E8C46'], [530, 372, '#F2C94C'], [590, 372, '#5E8C46']].map(([x, y, c], i) => (
        <g key={i}>
          <GlowDisc cx={x as number} cy={y as number} r={20} color={c as string} o={0.3} />
          <circle cx={x as number} cy={y as number} r={9} fill={c as string} stroke="#161616" strokeWidth={2} />
        </g>
      ))}
      {/* two dials with needles */}
      <circle cx={230} cy={470} r={42} fill="#F6EFE3" stroke="#161616" strokeWidth={4} />
      <line x1={230} y1={470} x2={258} y2={442} stroke="#161616" strokeWidth={4} strokeLinecap="round" />
      <circle cx={230} cy={470} r={5} fill="#161616" />
      <circle cx={340} cy={470} r={42} fill="#F6EFE3" stroke="#161616" strokeWidth={4} />
      <line x1={340} y1={470} x2={312} y2={444} stroke="#161616" strokeWidth={4} strokeLinecap="round" />
      <circle cx={340} cy={470} r={5} fill="#161616" />
      {/* three lever slots; the middle one (x=520) is the lever the operator pulls */}
      {[450, 520, 590].map((x) => (
        <line key={x} x1={x} y1={400} x2={x} y2={580} stroke="#0E0C1E" strokeWidth={8} strokeLinecap="round" />
      ))}
      <circle cx={450} cy={440} r={14} fill="#C0392B" stroke="#161616" strokeWidth={3} />
      <circle cx={520} cy={leverY} r={14} fill="#C0392B" stroke="#161616" strokeWidth={3} />
      <circle cx={590} cy={540} r={14} fill="#C0392B" stroke="#161616" strokeWidth={3} />
      {/* grid of small square buttons, lower panel */}
      {[[180, 620], [250, 620], [320, 620], [390, 620], [460, 620], [530, 620], [180, 680], [250, 680], [320, 680], [390, 680], [460, 680], [530, 680], [180, 740], [250, 740], [320, 740], [390, 740], [460, 740], [530, 740]].map(([x, y], i) => (
        <rect key={i} x={x} y={y} width={34} height={34} rx={5} fill={['#3E8C86', '#C85A46', '#5A4A6A', '#8A6A4A'][i % 4]} stroke="#161616" strokeWidth={2} />
      ))}
      {/* cables from the panel base to the floor */}
      <path d="M 200 876 Q 220 830 260 812 M 560 876 Q 540 830 500 812" stroke="#0E0C1E" strokeWidth={6} fill="none" />
    </g>
    {/* ---- librarian's desk, RIGHT (x 1300-1780) ---- */}
    {/* wall sign above the desk */}
    <rect x={1400} y={292} width={300} height={40} rx={6} fill="url(#crplate)" stroke="#161616" strokeWidth={3} />
    <text x={1550} y={320} textAnchor="middle" fontFamily={FONT.ui} fontSize={22} fill="#F6EFE3">HIPPOCAMPUS</text>
    {/* wall shelf with books behind the desk */}
    <g>
      <rect x={1480} y={400} width={320} height={14} fill="url(#crshelf)" stroke="#161616" strokeWidth={3} />
      {[[1490, 44, '#C0392B'], [1532, 56, '#3E8C86'], [1574, 40, '#F2C94C'], [1610, 52, '#5A4A6A'], [1652, 44, '#8A6A4A'], [1694, 56, '#5E8C46'], [1736, 44, '#C85A46']].map(([x, h, c], i) => (
        <rect key={i} x={x as number} y={400 - (h as number)} width={36} height={h as number} fill={c as string} stroke="#161616" strokeWidth={2} />
      ))}
    </g>
    {/* lamp glow (dims) + light pool on the desk */}
    <GlowDisc cx={1480} cy={636} r={130} color="#FFE2B0" o={lampGlow} />
    <circle cx={1480} cy={636} r={90} fill="#FFE2B0" opacity={lampGlow} />
    <ellipse cx={1480} cy={700} rx={120} ry={14} fill="#FFE2B0" opacity={lampGlow * 0.5} />
    {/* desk */}
    <rect x={1300} y={690} width={480} height={16} fill="url(#crdeskTop)" stroke="#161616" strokeWidth={3} />
    <rect x={1300} y={706} width={480} height={170} fill="url(#crdeskFront)" stroke="#161616" strokeWidth={4} />
    <path d="M 1540 706 L 1540 876" stroke="#5A3A1E" strokeWidth={3} />
    <rect x={1340} y={740} width={160} height={50} fill="#5A3A1E" stroke="#161616" strokeWidth={3} />
    <circle cx={1420} cy={765} r={7} fill="#8A7A5A" stroke="#161616" strokeWidth={2} />
    <rect x={1580} y={740} width={160} height={50} fill="#5A3A1E" stroke="#161616" strokeWidth={3} />
    <circle cx={1660} cy={765} r={7} fill="#8A7A5A" stroke="#161616" strokeWidth={2} />
    {/* books + papers + inkwell on the desk */}
    <rect x={1680} y={640} width={80} height={22} fill="#5A4A6A" stroke="#161616" strokeWidth={3} />
    <rect x={1688} y={620} width={64} height={20} fill="#C0392B" stroke="#161616" strokeWidth={3} />
    <rect x={1330} y={668} width={90} height={22} rx={2} fill="#F6EFE3" stroke="#161616" strokeWidth={2} transform="rotate(-3 1375 679)" />
    <circle cx={1450} cy={676} r={10} fill="#1A1424" stroke="#161616" strokeWidth={2} />
    {/* the lamp: base + stem + shade on the desk */}
    <ellipse cx={1480} cy={692} rx={26} ry={8} fill="#2E2418" stroke="#161616" strokeWidth={3} />
    <line x1={1480} y1={690} x2={1480} y2={646} stroke="#161616" strokeWidth={6} strokeLinecap="round" />
    <path d="M 1445 646 L 1515 646 L 1505 606 L 1455 606 Z" fill="#3A352F" stroke="#161616" strokeWidth={3} strokeLinejoin="round" />
    <circle cx={1480} cy={636} r={12} fill="#FFE2B0" opacity={lampGlow} />
    {/* atmosphere: faint warm haze from the lamp, vignette falls off to darkness */}
    <AtmoHaze color="#33291F" o={0.06} />
    <Vignette p="cr" />
  </g>
);

// ---------------------------------------------------------------------------
// BearX — extended Bear (S6-S10), defined HERE; scenes.tsx's Bear (S5) is
// untouched. Same seated body / lowered spoon paw as S5 by default. New
// options:
//   arm: 'down' (default, spoon lowered in lap) | 'wave' (one arm raised,
//        paw waving beside the head) | 'shrug' (both arms slightly raised,
//        paws up) | 'sign' (near arm raised, holding a small "HI." card).
//   standing: legs straight down to the floor (hip 729 = foot 887 - 158)
//        instead of the seated legs-forward pose.
//   faceDir: -1 faces left (S5 default) | 1 faces right (toward Jake).
//   t: local frame, drives the gentle wave sway.
// ---------------------------------------------------------------------------

type BearArm = 'down' | 'wave' | 'shrug' | 'sign';

export const BearX: React.FC<{
  x: number;
  hipY: number;
  mouthOpen?: number;
  arm?: BearArm;
  standing?: boolean;
  faceDir?: 1 | -1;
  t?: number;
}> = ({ x, hipY, mouthOpen, arm = 'down', standing = false, faceDir = -1, t }) => {
  const d = faceDir;
  const footY = 887;
  // Contact shadows sit directly under the feet: standing feet are at
  // x-30 / x+10, seated feet at x-55 / x-30 (shadow must match the pose).
  const shL = standing ? x - 30 : x - 55;
  const shR = standing ? x + 10 : x - 30;
  // Gentle wave sway: slow, small (±7px, ~28-frame period).
  const w = arm === 'wave' && t !== undefined ? Math.sin(t * 0.22) * 7 : 0;
  return (
    <g>
      {/* contact shadows under the feet */}
      <ellipse cx={shL} cy={footY + 2} rx={20} ry={6} fill="#000" opacity={0.35} />
      <ellipse cx={shR} cy={footY + 2} rx={20} ry={6} fill="#000" opacity={0.35} />
      {standing ? (
        <>
          {/* standing legs: straight down, feet flat on the floor */}
          <path d={`M ${x - 18} ${hipY} L ${x - 28} ${hipY + 80} L ${x - 30} ${footY - 11}`} stroke="#161616" strokeWidth={22} strokeLinecap="round" fill="none" />
          <path d={`M ${x - 18} ${hipY} L ${x - 28} ${hipY + 80} L ${x - 30} ${footY - 11}`} stroke="#F6F0E4" strokeWidth={16} strokeLinecap="round" fill="none" />
          <path d={`M ${x + 18} ${hipY} L ${x + 8} ${hipY + 80} L ${x + 10} ${footY - 11}`} stroke="#161616" strokeWidth={22} strokeLinecap="round" fill="none" />
          <path d={`M ${x + 18} ${hipY} L ${x + 8} ${hipY + 80} L ${x + 10} ${footY - 11}`} stroke="#F6F0E4" strokeWidth={16} strokeLinecap="round" fill="none" />
          <ellipse cx={x - 30} cy={footY} rx={20} ry={11} fill="#F6F0E4" stroke="#161616" strokeWidth={3} />
          <ellipse cx={x + 10} cy={footY} rx={20} ry={11} fill="#F6F0E4" stroke="#161616" strokeWidth={3} />
        </>
      ) : (
        <>
          {/* seated legs: thighs forward (left), shins vertical, feet at 887 */}
          <path d={`M ${x} ${hipY} L ${x - 55} ${hipY + 13} L ${x - 55} ${footY - 11}`} stroke="#161616" strokeWidth={22} strokeLinecap="round" fill="none" />
          <path d={`M ${x} ${hipY} L ${x - 55} ${hipY + 13} L ${x - 55} ${footY - 11}`} stroke="#F6F0E4" strokeWidth={16} strokeLinecap="round" fill="none" />
          <path d={`M ${x + 6} ${hipY} L ${x - 30} ${hipY + 15} L ${x - 30} ${footY - 11}`} stroke="#161616" strokeWidth={22} strokeLinecap="round" fill="none" />
          <path d={`M ${x + 6} ${hipY} L ${x - 30} ${hipY + 15} L ${x - 30} ${footY - 11}`} stroke="#F6F0E4" strokeWidth={16} strokeLinecap="round" fill="none" />
          <ellipse cx={x - 55} cy={footY} rx={20} ry={11} fill="#F6F0E4" stroke="#161616" strokeWidth={3} />
          <ellipse cx={x - 30} cy={footY} rx={20} ry={11} fill="#F6F0E4" stroke="#161616" strokeWidth={3} />
        </>
      )}
      {/* torso: big round white belly */}
      <ellipse cx={x} cy={hipY - 77} rx={62} ry={80} fill="#F6F0E4" stroke="#161616" strokeWidth={4} />
      {/* far arm: down at the side, except the shrug raises it too */}
      {arm === 'shrug' ? (
        <>
          <path d={`M ${x + 52} ${hipY - 120} L ${x + 72} ${hipY - 72} L ${x + 80} ${hipY - 108}`} stroke="#161616" strokeWidth={22} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d={`M ${x + 52} ${hipY - 120} L ${x + 72} ${hipY - 72} L ${x + 80} ${hipY - 108}`} stroke="#F6F0E4" strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <circle cx={x + 80} cy={hipY - 108} r={12} fill="#F6F0E4" stroke="#161616" strokeWidth={3} />
        </>
      ) : (
        <>
          <path d={`M ${x + 52} ${hipY - 120} L ${x + 58} ${hipY - 40}`} stroke="#161616" strokeWidth={22} strokeLinecap="round" fill="none" />
          <path d={`M ${x + 52} ${hipY - 120} L ${x + 58} ${hipY - 40}`} stroke="#F6F0E4" strokeWidth={16} strokeLinecap="round" fill="none" />
          <circle cx={x + 58} cy={hipY - 34} r={12} fill="#F6F0E4" stroke="#161616" strokeWidth={3} />
        </>
      )}
      {/* ears */}
      <circle cx={x - 38} cy={hipY - 232} r={14} fill="#F6F0E4" stroke="#161616" strokeWidth={3} />
      <circle cx={x + 34} cy={hipY - 236} r={14} fill="#F6F0E4" stroke="#161616" strokeWidth={3} />
      <circle cx={x - 38} cy={hipY - 232} r={7} fill="#D8CFC0" />
      <circle cx={x + 34} cy={hipY - 236} r={7} fill="#D8CFC0" />
      {/* head */}
      <circle cx={x - 8} cy={hipY - 188} r={54} fill="#F6F0E4" stroke="#161616" strokeWidth={4} />
      {/* muzzle + nose + eyes — shifted by faceDir (left = S5 default) */}
      <ellipse cx={x + d * 24} cy={hipY - 170} rx={24} ry={15} fill="#E8DFCE" />
      <ellipse cx={x + d * 34} cy={hipY - 172} rx={10} ry={7} fill="#161616" />
      <ellipse cx={x + d * 28} cy={hipY - 194} rx={7} ry={10} fill="#161616" />
      <ellipse cx={x - d * 2} cy={hipY - 196} rx={7} ry={10} fill="#161616" />
      {/* near arm, by variant */}
      {arm === 'wave' ? (
        <>
          {/* raised beside the head, paw open, swaying gently */}
          <path d={`M ${x - 45} ${hipY - 122} L ${x - 80} ${hipY - 178} L ${x - 72 + w} ${hipY - 222}`} stroke="#161616" strokeWidth={22} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d={`M ${x - 45} ${hipY - 122} L ${x - 80} ${hipY - 178} L ${x - 72 + w} ${hipY - 222}`} stroke="#F6F0E4" strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <circle cx={x - 72 + w} cy={hipY - 222} r={12} fill="#F6F0E4" stroke="#161616" strokeWidth={3} />
        </>
      ) : arm === 'shrug' ? (
        <>
          {/* both paws up, elbows out — the shrug */}
          <path d={`M ${x - 45} ${hipY - 122} L ${x - 72} ${hipY - 72} L ${x - 80} ${hipY - 108}`} stroke="#161616" strokeWidth={22} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d={`M ${x - 45} ${hipY - 122} L ${x - 72} ${hipY - 72} L ${x - 80} ${hipY - 108}`} stroke="#F6F0E4" strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <circle cx={x - 80} cy={hipY - 108} r={12} fill="#F6F0E4" stroke="#161616" strokeWidth={3} />
        </>
      ) : arm === 'sign' ? (
        <>
          {/* raised high, paw under the card's bottom edge */}
          <path d={`M ${x - 45} ${hipY - 122} L ${x - 95} ${hipY - 210} L ${x - 88} ${hipY - 252}`} stroke="#161616" strokeWidth={22} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d={`M ${x - 45} ${hipY - 122} L ${x - 95} ${hipY - 210} L ${x - 88} ${hipY - 252}`} stroke="#F6F0E4" strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <circle cx={x - 88} cy={hipY - 252} r={12} fill="#F6F0E4" stroke="#161616" strokeWidth={3} />
          {/* the sign: small white card, "HI." in dark text, fits inside */}
          <rect x={x - 170} y={hipY - 330} width={120} height={70} rx={6} fill="#FFFFFF" stroke="#161616" strokeWidth={3} />
          <text x={x - 110} y={hipY - 283} textAnchor="middle" fontFamily={FONT.title} fontSize={44} fontWeight={800} fill="#161616">HI.</text>
        </>
      ) : (
        <>
          {/* lowered — paw rests in the lap, spoon pointing down (S5 default) */}
          <path d={`M ${x - 45} ${hipY - 122} L ${x - 62} ${hipY - 60} L ${x - 48} ${hipY - 15}`} stroke="#161616" strokeWidth={22} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d={`M ${x - 45} ${hipY - 122} L ${x - 62} ${hipY - 60} L ${x - 48} ${hipY - 15}`} stroke="#F6F0E4" strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <circle cx={x - 48} cy={hipY - 15} r={12} fill="#F6F0E4" stroke="#161616" strokeWidth={3} />
          <line x1={x - 48} y1={hipY - 15} x2={x - 68} y2={hipY + 13} stroke="#8A8578" strokeWidth={5} strokeLinecap="round" />
          <ellipse cx={x - 70} cy={hipY + 17} rx={10} ry={6} fill="#C9C2B2" stroke="#161616" strokeWidth={2} transform={`rotate(-65 ${x - 70} ${hipY + 17})`} />
        </>
      )}
      {/* lip-sync mouth — only when a mouthOpen is passed (never in S6-S10) */}
      {mouthOpen !== undefined && mouthOpen > 0.01 ? (
        <ellipse cx={x + d * 18} cy={hipY - 158} rx={8} ry={Math.max(1.5, mouthOpen * 6.5)} fill="#161616" />
      ) : null}
      {/* moonlight-blue rim on the upper-left edge */}
      <path d={`M ${x - 56} ${hipY - 200} A 54 54 0 0 1 ${x - 30} ${hipY - 238}`} stroke="#A9C6FF" strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.85} />
    </g>
  );
};

// Standing bear hip height: feet on the floor at 887, bear leg length 158.
const BEAR_STAND_HIP = 729;

// ---------------------------------------------------------------------------
// Chapter 2 shared bits (S11-S16): blank photos, living-room floor,
// records room, filing cabinet, folder fragments, split memory, day room.
// ---------------------------------------------------------------------------

/** A blank photograph: white rectangle, thin dark border, blank inside. */
const BlankPhoto: React.FC<{ x: number; y: number; w: number; h: number; rot?: number }> = ({ x, y, w, h, rot = 0 }) => (
  <g transform={`rotate(${rot} ${x + w / 2} ${y + h / 2})`}>
    <rect x={x} y={y} width={w} height={h} fill="#FFFFFF" stroke="#161616" strokeWidth={3} />
    <rect x={x + 5} y={y + 5} width={w - 10} height={h - 10} fill="none" stroke="#8A8578" strokeWidth={1.5} />
  </g>
);

/** S11: a simple living-room floor — wood floor (floor line y=876), cream wall,
    baseboard, rug, daylight window (the light Jake holds the photo up to),
    framed print, low bookshelf. */
const LivingRoomFloor: React.FC = () => (
  <g>
    <RealDefs p="lr" palette="day" />
    {/* living-room-only gradients: ceiling, wood, rug, frame, hills */}
    <defs>
      <linearGradient id="lrceil" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#F8F2E4" />
        <stop offset="100%" stopColor="#EFE6D0" />
      </linearGradient>
      <linearGradient id="lrwood" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#7A5A3A" />
        <stop offset="100%" stopColor="#4A3220" />
      </linearGradient>
      <linearGradient id="lrwoodDark" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#54432E" />
        <stop offset="100%" stopColor="#33261A" />
      </linearGradient>
      <linearGradient id="lrframe" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#3A3E4A" />
        <stop offset="100%" stopColor="#1E222E" />
      </linearGradient>
      <linearGradient id="lrhills" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#6FA055" />
        <stop offset="100%" stopColor="#4A7038" />
      </linearGradient>
      <radialGradient id="lrrug" cx="0.5" cy="0.4" r="0.8">
        <stop offset="0%" stopColor="#C07A62" />
        <stop offset="100%" stopColor="#8A4A38" />
      </radialGradient>
    </defs>
    {/* ceiling + walls + floor: gradients, warm daylight */}
    <rect x={0} y={0} width={1920} height={120} fill="url(#lrceil)" />
    <rect x={0} y={120} width={1920} height={756} fill="url(#lrwall)" />
    <rect x={0} y={876} width={1920} height={204} fill="url(#lrfloor)" />
    {/* sunlight shaft from the big window — the sun sits high-RIGHT in the
        window, so the beam angles down-LEFT to the pool on the floor.
        (Replaces the old flat white polygon shaft.) */}
    <WindowShaft p="lr" sill={[1420, 1760, 520]} floorY={1000} dir={-1} seed={5} />
    {/* floor boards */}
    <path d="M 0 960 L 1920 960" stroke="#5E4429" strokeWidth={2} opacity={0.8} />
    {[320, 640, 1280, 1600].map((x) => (
      <path key={x} d={`M ${x} 876 L ${x - 30} 1080`} stroke="#5E4429" strokeWidth={2} opacity={0.6} />
    ))}
    {/* baseboard */}
    <rect x={0} y={852} width={1920} height={24} fill="#F6EFE3" stroke="#C9BFA8" strokeWidth={2} />
    {/* wall panel seams */}
    {[480, 1390].map((x) => (
      <path key={x} d={`M ${x} 120 L ${x} 876`} stroke="#C9BFA8" strokeWidth={3} opacity={0.7} />
    ))}
    {/* framed print, left wall: gradient sky, sun with halo, gradient hills */}
    <g>
      <rect x={180} y={240} width={250} height={160} fill="url(#lrframe)" stroke="#8A7A5A" strokeWidth={5} />
      <rect x={192} y={252} width={226} height={136} fill="url(#lrsky)" />
      <circle cx={360} cy={292} r={52} fill="url(#lrhalo)" opacity={0.7} />
      <circle cx={360} cy={292} r={20} fill="#FFE2B0" />
      <path d="M 192 350 Q 260 310 305 348 Q 360 318 418 350 L 418 388 L 192 388 Z" fill="url(#lrhills)" />
    </g>
    {/* bookshelf: gradient wood, darker shelf backs, books unchanged */}
    <g>
      <rect x={150} y={640} width={310} height={236} fill="url(#lrwood)" stroke="#161616" strokeWidth={4} />
      <rect x={162} y={652} width={286} height={96} fill="url(#lrwoodDark)" stroke="#161616" strokeWidth={3} />
      <rect x={162} y={760} width={286} height={104} fill="url(#lrwoodDark)" stroke="#161616" strokeWidth={3} />
      <rect x={170} y={688} width={52} height={60} fill="#C0392B" stroke="#161616" strokeWidth={2} />
      <rect x={232} y={676} width={52} height={72} fill="#3E8C86" stroke="#161616" strokeWidth={2} />
      <rect x={294} y={692} width={52} height={56} fill="#D9A441" stroke="#161616" strokeWidth={2} />
      <rect x={352} y={680} width={52} height={68} fill="#5A4A6A" stroke="#161616" strokeWidth={2} />
      <rect x={170} y={800} width={52} height={64} fill="#7FA97A" stroke="#161616" strokeWidth={2} />
      <rect x={232} y={812} width={52} height={52} fill="#C85A46" stroke="#161616" strokeWidth={2} />
      <rect x={294} y={796} width={52} height={68} fill="#2E4057" stroke="#161616" strokeWidth={2} />
      <rect x={352} y={806} width={52} height={58} fill="#8A7A5A" stroke="#161616" strokeWidth={2} />
    </g>
    {/* big window, right wall: gradient sky, sun with halo, clouds */}
    <g>
      <rect x={1420} y={170} width={340} height={350} fill="#F6EFE3" stroke="#C9BFA8" strokeWidth={6} />
      <rect x={1436} y={186} width={308} height={318} fill="url(#lrsky)" />
      <circle cx={1670} cy={250} r={110} fill="url(#lrhalo)" opacity={0.8} />
      <circle cx={1670} cy={250} r={38} fill="#FFE2B0" />
      <ellipse cx={1520} cy={280} rx={66} ry={20} fill="#FFFFFF" opacity={0.9} />
      <ellipse cx={1640} cy={340} rx={80} ry={24} fill="#FFFFFF" opacity={0.85} />
      <path d="M 1590 186 L 1590 504 M 1436 345 L 1744 345" stroke="#F6EFE3" strokeWidth={8} />
      <rect x={1408} y={520} width={364} height={16} fill="#C9BFA8" />
    </g>
    {/* rug: radial gradient volume */}
    <ellipse cx={960} cy={920} rx={560} ry={55} fill="url(#lrrug)" stroke="#8A4A38" strokeWidth={3} />
    <ellipse cx={960} cy={920} rx={480} ry={40} fill="none" stroke="#D89A7A" strokeWidth={3} opacity={0.7} />
    {/* atmosphere: warm haze unifies the palette, lighter vignette for day */}
    <AtmoHaze color="#E8D9A8" o={0.05} />
    <Vignette p="lr" o={0.6} />
  </g>
);

/** S12/S16: the room around the filing cabinet — cream walls, wood floor,
    framed certificate, side table with a stack of folders, rug under the
    cabinet. */
const RecordsRoom: React.FC = () => (
  <g>
    <RealDefs p="rr" palette="day" />
    {/* records-room-only gradients: ceiling, frame, paper, wood, folders, rug */}
    <defs>
      <linearGradient id="rrceil" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#F8F2E4" />
        <stop offset="100%" stopColor="#EFE6D0" />
      </linearGradient>
      <linearGradient id="rrframe" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#3A3E4A" />
        <stop offset="100%" stopColor="#1E222E" />
      </linearGradient>
      <linearGradient id="rrpaper" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="100%" stopColor="#E8DCC3" />
      </linearGradient>
      <linearGradient id="rrwood" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#8A5A34" />
        <stop offset="100%" stopColor="#5E3E22" />
      </linearGradient>
      <linearGradient id="rrwoodDark" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#7A5A3A" />
        <stop offset="100%" stopColor="#4A3220" />
      </linearGradient>
      <linearGradient id="rrfolder" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#E8D9B0" />
        <stop offset="100%" stopColor="#C9B183" />
      </linearGradient>
      <radialGradient id="rrrug" cx="0.5" cy="0.4" r="0.8">
        <stop offset="0%" stopColor="#C07A62" />
        <stop offset="100%" stopColor="#8A4A38" />
      </radialGradient>
    </defs>
    {/* ceiling + walls + floor: gradients, warm daylight (no window in this
        room, so no shaft — soft light comes from the gradients + haze) */}
    <rect x={0} y={0} width={1920} height={120} fill="url(#rrceil)" />
    <rect x={0} y={120} width={1920} height={756} fill="url(#rrwall)" />
    <rect x={0} y={876} width={1920} height={204} fill="url(#rrfloor)" />
    {/* floor boards */}
    <path d="M 0 960 L 1920 960" stroke="#5E4429" strokeWidth={2} opacity={0.8} />
    {[320, 640, 1280, 1600].map((x) => (
      <path key={x} d={`M ${x} 876 L ${x - 30} 1080`} stroke="#5E4429" strokeWidth={2} opacity={0.6} />
    ))}
    {/* baseboard */}
    <rect x={0} y={852} width={1920} height={24} fill="#F6EFE3" stroke="#C9BFA8" strokeWidth={2} />
    {/* wall panel seams */}
    {[480, 1440].map((x) => (
      <path key={x} d={`M ${x} 120 L ${x} 876`} stroke="#C9BFA8" strokeWidth={3} opacity={0.7} />
    ))}
    {/* framed certificate: gradient frame + paper, gold seal with a soft glint */}
    <g>
      <rect x={150} y={220} width={250} height={170} fill="url(#rrframe)" stroke="#8A7A5A" strokeWidth={5} />
      <rect x={162} y={232} width={226} height={146} fill="url(#rrpaper)" />
      <path d="M 192 268 L 358 268 M 212 298 L 338 298 M 232 328 L 318 328" stroke="#8A8578" strokeWidth={4} strokeLinecap="round" />
      <circle cx={350} cy={348} r={40} fill="url(#rrhalo)" opacity={0.5} />
      <circle cx={350} cy={348} r={14} fill="#C9A227" stroke="#161616" strokeWidth={2} />
    </g>
    {/* rug under the cabinet: radial gradient volume */}
    <ellipse cx={620} cy={928} rx={430} ry={50} fill="url(#rrrug)" stroke="#8A4A38" strokeWidth={3} />
    <ellipse cx={620} cy={928} rx={360} ry={36} fill="none" stroke="#D89A7A" strokeWidth={3} opacity={0.7} />
    {/* side table with a stack of folders: gradient wood + folder sheets */}
    <g>
      <rect x={1500} y={700} width={280} height={20} fill="url(#rrwood)" stroke="#161616" strokeWidth={4} />
      <rect x={1520} y={720} width={18} height={156} fill="url(#rrwoodDark)" stroke="#161616" strokeWidth={3} />
      <rect x={1742} y={720} width={18} height={156} fill="url(#rrwoodDark)" stroke="#161616" strokeWidth={3} />
      <g transform="rotate(-3 1640 660)">
        <rect x={1540} y={652} width={200} height={14} fill="url(#rrfolder)" stroke="#161616" strokeWidth={2} />
      </g>
      <g transform="rotate(2 1640 640)">
        <rect x={1545} y={632} width={200} height={14} fill="#C9B183" stroke="#161616" strokeWidth={2} />
      </g>
      <g transform="rotate(-1 1640 620)">
        <rect x={1535} y={612} width={200} height={14} fill="url(#rrfolder)" stroke="#161616" strokeWidth={2} />
      </g>
    </g>
    {/* atmosphere: warm haze unifies the palette, lighter vignette for day */}
    <AtmoHaze color="#E8D9A8" o={0.05} />
    <Vignette p="rr" o={0.6} />
  </g>
);

/** S12/S16: the tall filing cabinet — 4 drawers, dark metal, body x 520-720
    (~200px wide), y 306-876 (~570px tall). Drawer slots start at y 314 / 454 /
    595 / 735, each 132px tall.
    open=true (S12): the BOTTOM drawer is pulled out — dark cavity with three
    dated folders standing in it (tabs "2019", "2021", "2023") and ONE blank
    folder sliding half-out to the right, plus the pulled-out drawer front
    below the cavity.
    open=false (S16): all four drawers shut flush, and the blank folder slides
    out again from the bottom drawer's top seam, half-out to the right. */
const FilingCabinet: React.FC<{ open: boolean }> = ({ open }) => {
  const slots = [314, 454, 595, 735];
  const drawerFront = (top: number) => (
    <g key={top}>
      <rect x={532} y={top + 2} width={176} height={128} fill="#454A58" stroke="#161616" strokeWidth={3} />
      <rect x={592} y={top + 58} width={56} height={12} rx={6} fill="#8A8578" stroke="#161616" strokeWidth={2.5} />
    </g>
  );
  return (
    <g>
      <rect x={520} y={306} width={200} height={570} fill="#3A3E4A" stroke="#161616" strokeWidth={4} />
      <rect x={524} y={310} width={192} height={10} fill="#4A4F5E" />
      {open ? (
        <g>
          {slots.slice(0, 3).map((top) => drawerFront(top))}
          <rect x={532} y={738} width={176} height={62} fill="#14141C" stroke="#161616" strokeWidth={3} />
          <g>
            <rect x={545} y={688} width={52} height={112} fill="#D8C49A" stroke="#161616" strokeWidth={2.5} />
            <rect x={547} y={674} width={48} height={16} fill="#E8D9B0" stroke="#161616" strokeWidth={2} />
            <text x={571} y={687} textAnchor="middle" fontFamily={FONT.ui} fontSize={12} fill="#161616">2019</text>
          </g>
          <g>
            <rect x={600} y={694} width={52} height={106} fill="#D8C49A" stroke="#161616" strokeWidth={2.5} />
            <rect x={602} y={680} width={48} height={16} fill="#E8D9B0" stroke="#161616" strokeWidth={2} />
            <text x={626} y={693} textAnchor="middle" fontFamily={FONT.ui} fontSize={12} fill="#161616">2021</text>
          </g>
          <g>
            <rect x={655} y={700} width={52} height={100} fill="#D8C49A" stroke="#161616" strokeWidth={2.5} />
            <rect x={657} y={686} width={48} height={16} fill="#E8D9B0" stroke="#161616" strokeWidth={2} />
            <text x={681} y={699} textAnchor="middle" fontFamily={FONT.ui} fontSize={12} fill="#161616">2023</text>
          </g>
          <g transform="rotate(10 720 760)">
            <rect x={620} y={720} width={220} height={92} fill="#D8C49A" stroke="#161616" strokeWidth={3} />
            <rect x={628} y={728} width={204} height={76} fill="none" stroke="#8A7A5A" strokeWidth={1.5} />
          </g>
          <rect x={528} y={800} width={184} height={72} fill="#454A58" stroke="#161616" strokeWidth={3} />
          <rect x={528} y={800} width={10} height={72} fill="#2E3240" />
          <rect x={702} y={800} width={10} height={72} fill="#2E3240" />
          <rect x={592} y={830} width={56} height={12} rx={6} fill="#8A8578" stroke="#161616" strokeWidth={2.5} />
        </g>
      ) : (
        <g>
          {slots.map((top) => drawerFront(top))}
          <g transform="rotate(14 720 735)">
            <rect x={640} y={700} width={240} height={80} fill="#D8C49A" stroke="#161616" strokeWidth={3} />
            <rect x={648} y={708} width={224} height={64} fill="none" stroke="#8A7A5A" strokeWidth={1.5} />
          </g>
        </g>
      )}
    </g>
  );
};

/** The three fragments inside the blank folder (S13 close-up, S14 right half).
    Flash: jagged 8-point star, pale yellow-white. Sound wave: wavy horizontal
    line in moonlight blue. Shiver: small zigzag in pale blue. */
const FlashStar: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <polygon
      points="150,0 51,21 106,106 21,51 0,150 -21,51 -106,106 -51,21 -150,0 -51,-21 -106,-106 -21,-51 0,-150 21,-51 106,-106 51,-21"
      fill="#FFF3C4"
      stroke="#161616"
      strokeWidth={3}
      strokeLinejoin="round"
    />
    <circle cx={0} cy={0} r={34} fill="#FFFFFF" />
  </g>
);

const SoundWave: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <path
      d="M -150 0 Q -125 -65 -95 0 Q -65 65 -35 0 Q -10 -60 20 0 Q 50 60 80 0 Q 110 -55 140 0"
      fill="none"
      stroke="#161616"
      strokeWidth={11}
      strokeLinecap="round"
    />
    <path
      d="M -150 0 Q -125 -65 -95 0 Q -65 65 -35 0 Q -10 -60 20 0 Q 50 60 80 0 Q 110 -55 140 0"
      fill="none"
      stroke={MOONLIGHT}
      strokeWidth={6}
      strokeLinecap="round"
    />
  </g>
);

const Shiver: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <polyline
      points="-80,-50 -50,50 -20,-50 10,50 40,-50 70,50"
      fill="none"
      stroke="#161616"
      strokeWidth={11}
      strokeLinejoin="round"
      strokeLinecap="round"
    />
    <polyline
      points="-80,-50 -50,50 -20,-50 10,50 40,-50 70,50"
      fill="none"
      stroke="#BFE3FF"
      strokeWidth={6}
      strokeLinejoin="round"
      strokeLinecap="round"
    />
  </g>
);

/** S13: close-up of the open blank folder filling most of the frame — big
    manila folder, two flaps, blank tab, the three fragments inside. */
const OpenFolderCloseUp: React.FC = () => (
  <g>
    <RealDefs p="of" palette="night" />
    {/* close-up-only gradients: folder paper, lighter where the light catches it */}
    <defs>
      <linearGradient id="offolder" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#D9BE8E" />
        <stop offset="100%" stopColor="#A98F56" />
      </linearGradient>
      <linearGradient id="offlap" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#EAD9A8" />
        <stop offset="100%" stopColor="#C9AE72" />
      </linearGradient>
    </defs>
    <rect x={0} y={0} width={1920} height={1080} fill="url(#ofwall)" />
    <SoftShadow p="of" cx={960} cy={888} rx={720} ry={24} o={0.5} />
    <rect x={260} y={200} width={1400} height={680} fill="url(#offolder)" stroke="#161616" strokeWidth={4} />
    <rect x={260} y={220} width={680} height={640} fill="url(#offlap)" stroke="#161616" strokeWidth={3} />
    <rect x={980} y={220} width={680} height={640} fill="url(#offlap)" stroke="#161616" strokeWidth={3} />
    <rect x={300} y={196} width={180} height={28} fill="url(#offlap)" stroke="#161616" strokeWidth={3} />
    <GlowDisc cx={600} cy={520} r={170} color="#FFF3C4" o={0.45} />
    <FlashStar x={600} y={520} />
    <line x1={755} y1={520} x2={805} y2={520} stroke={LIME} strokeWidth={6} strokeLinecap="round" />
    <GlowDisc cx={965} cy={520} r={130} color="#A9C6FF" o={0.3} />
    <SoundWave x={965} y={520} />
    <Shiver x={1330} y={520} />
    {/* atmosphere: haze unifies the palette, vignette falls off to darkness */}
    <AtmoHaze color="#2A2A55" o={0.06} />
    <Vignette p="of" />
  </g>
);

/** One dated photo on the album page (S14 left half): white paper, the picture
    inside, date caption on the paper below it. */
const AlbumPhoto: React.FC<{ x: number; y: number; w: number; h: number; caption: string; children: React.ReactNode }> = ({
  x,
  y,
  w,
  h,
  caption,
  children,
}) => (
  <g>
    <rect x={x} y={y} width={w} height={h} fill="url(#smpage)" stroke="#161616" strokeWidth={3} />
    {children}
    <text x={x + w / 2} y={y + h - 16} textAnchor="middle" fontFamily={FONT.ui} fontSize={26} fill="#161616">
      {caption}
    </text>
  </g>
);

/** S14: vertical split down the middle. LEFT: a calm photo album page with
    three dated photos. RIGHT: dark, Jake's fragments scattered without order. */
const SplitMemory: React.FC = () => (
  <g>
    <RealDefs p="sm" palette="night" />
    {/* SplitMemory-only gradients: warm album side, dark fragment side, photos */}
    <defs>
      <linearGradient id="smleft" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FBF3E2" />
        <stop offset="100%" stopColor="#E3D5B8" />
      </linearGradient>
      <linearGradient id="smpage" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="100%" stopColor="#EDE4D0" />
      </linearGradient>
      <linearGradient id="smdark" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#1E1828" />
        <stop offset="100%" stopColor="#0E0B16" />
      </linearGradient>
      <linearGradient id="smphotoSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#A8D0F0" />
        <stop offset="100%" stopColor="#7FB8E8" />
      </linearGradient>
      <radialGradient id="smsun" cx="0.4" cy="0.35" r="0.9">
        <stop offset="0%" stopColor="#FFF6D8" />
        <stop offset="100%" stopColor="#FFE2B0" />
      </radialGradient>
      <linearGradient id="smhill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#6A9A52" />
        <stop offset="100%" stopColor="#4A7038" />
      </linearGradient>
      <linearGradient id="smsea" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#4A9A92" />
        <stop offset="100%" stopColor="#2E6A64" />
      </linearGradient>
      <linearGradient id="smsand" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#F0E2B8" />
        <stop offset="100%" stopColor="#D9C48E" />
      </linearGradient>
    </defs>
    <rect x={0} y={0} width={960} height={1080} fill="url(#smleft)" />
    <rect x={82} y={142} width={820} height={820} fill="#000000" opacity={0.15} filter="url(#smsoftBlur)" />
    <rect x={70} y={130} width={820} height={820} fill="url(#smpage)" stroke="#161616" strokeWidth={4} />
    <AlbumPhoto x={130} y={190} w={330} h={260} caption="JUNE 2019">
      <rect x={140} y={200} width={310} height={186} fill="url(#smphotoSky)" />
      <circle cx={400} cy={250} r={24} fill="url(#smsun)" />
      <path d="M 140 330 Q 250 290 310 330 Q 380 300 450 330 L 450 386 L 140 386 Z" fill="url(#smhill)" />
      <circle cx={290} cy={312} r={7} fill="#161616" />
      <rect x={285} y={319} width={10} height={22} fill="#161616" />
    </AlbumPhoto>
    <AlbumPhoto x={500} y={190} w={330} h={260} caption="AUG 2020">
      <rect x={510} y={200} width={310} height={186} fill="url(#smphotoSky)" />
      <circle cx={760} cy={240} r={22} fill="url(#smsun)" />
      <rect x={510} y={290} width={310} height={50} fill="url(#smsea)" />
      <rect x={510} y={340} width={310} height={46} fill="url(#smsand)" />
    </AlbumPhoto>
    <AlbumPhoto x={295} y={520} w={370} h={260} caption="DEC 2021">
      <rect x={305} y={530} width={350} height={186} fill="url(#smsky)" />
      <circle cx={600} cy={580} r={52} fill="url(#smhalo)" opacity={0.5} />
      <circle cx={600} cy={580} r={20} fill="#FFE2B0" />
      <path d="M 305 680 L 400 600 L 470 660 L 540 610 L 655 680 L 655 716 L 305 716 Z" fill="#0B0816" />
    </AlbumPhoto>
    {/* warm light over the calm album side — drawn before the right half so
        none of it spills across the divide */}
    <GlowDisc cx={480} cy={540} r={620} color="#FFE2B0" o={0.16} />
    <rect x={960} y={0} width={960} height={1080} fill="url(#smdark)" />
    <GlowDisc cx={1250} cy={300} r={120} color="#FFF3C4" o={0.35} />
    <GlowDisc cx={1520} cy={540} r={140} color="#A9C6FF" o={0.3} />
    <g opacity={0.9}>
      <FlashStar x={1250} y={300} s={0.5} />
      <FlashStar x={1700} y={300} s={0.35} rot={20} />
      <SoundWave x={1520} y={540} s={0.9} rot={12} />
      <SoundWave x={1700} y={800} s={0.6} rot={-20} />
      <Shiver x={1220} y={780} s={0.9} rot={-8} />
    </g>
    <rect x={954} y={0} width={12} height={1080} fill="#161616" />
    <rect x={966} y={0} width={3} height={1080} fill="#FFFFFF" opacity={0.25} />
    {/* atmosphere: light haze (kept low so the warm left half stays warm),
        vignette falls off to darkness */}
    <AtmoHaze color="#2A2A55" o={0.05} />
    <Vignette p="sm" />
  </g>
);

/** S15: a day room with a window onto the street — a car silhouette is visible
    through it. Cream walls, wood floor, framed print, rug, wall clock. */
const DayRoom: React.FC = () => (
  <g>
    <RealDefs p="dr" palette="day" />
    {/* day-room-only gradients: ceiling, frame, hills, clock face, street, car, rug */}
    <defs>
      <linearGradient id="drceil" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#F8F2E4" />
        <stop offset="100%" stopColor="#EFE6D0" />
      </linearGradient>
      <linearGradient id="drframe" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#3A3E4A" />
        <stop offset="100%" stopColor="#1E222E" />
      </linearGradient>
      <linearGradient id="drhills" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#6FA055" />
        <stop offset="100%" stopColor="#4A7038" />
      </linearGradient>
      <linearGradient id="drclockface" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="100%" stopColor="#E8DCC3" />
      </linearGradient>
      <linearGradient id="drstreet" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#7A7A82" />
        <stop offset="100%" stopColor="#4A4A52" />
      </linearGradient>
      <linearGradient id="drcar" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#3A3A44" />
        <stop offset="100%" stopColor="#1E1E26" />
      </linearGradient>
      <radialGradient id="drrug" cx="0.5" cy="0.4" r="0.8">
        <stop offset="0%" stopColor="#C07A62" />
        <stop offset="100%" stopColor="#8A4A38" />
      </radialGradient>
    </defs>
    {/* ceiling + walls + floor: gradients, warm daylight */}
    <rect x={0} y={0} width={1920} height={120} fill="url(#drceil)" />
    <rect x={0} y={120} width={1920} height={756} fill="url(#drwall)" />
    <rect x={0} y={876} width={1920} height={204} fill="url(#drfloor)" />
    {/* sunlight shaft from the street window — the sun sits high-RIGHT in
        the window, so the beam angles down-LEFT to the pool on the floor */}
    <WindowShaft p="dr" sill={[1150, 1700, 540]} floorY={1000} dir={-1} seed={9} />
    {/* floor boards */}
    <path d="M 0 960 L 1920 960" stroke="#5E4429" strokeWidth={2} opacity={0.8} />
    {[320, 640, 1280, 1600].map((x) => (
      <path key={x} d={`M ${x} 876 L ${x - 30} 1080`} stroke="#5E4429" strokeWidth={2} opacity={0.6} />
    ))}
    {/* baseboard */}
    <rect x={0} y={852} width={1920} height={24} fill="#F6EFE3" stroke="#C9BFA8" strokeWidth={2} />
    {/* wall panel seams */}
    {[480, 1440].map((x) => (
      <path key={x} d={`M ${x} 120 L ${x} 876`} stroke="#C9BFA8" strokeWidth={3} opacity={0.7} />
    ))}
    {/* framed print, left wall: gradient sky, sun with halo, gradient hills */}
    <g>
      <rect x={150} y={220} width={250} height={160} fill="url(#drframe)" stroke="#8A7A5A" strokeWidth={5} />
      <rect x={162} y={232} width={226} height={136} fill="url(#drsky)" />
      <circle cx={330} cy={272} r={52} fill="url(#drhalo)" opacity={0.7} />
      <circle cx={330} cy={272} r={20} fill="#FFE2B0" />
      <path d="M 162 340 Q 240 300 300 338 Q 350 312 388 340 L 388 368 L 162 368 Z" fill="url(#drhills)" />
    </g>
    {/* wall clock: soft glow behind it, gradient face, hands unchanged */}
    <g>
      <circle cx={520} cy={260} r={80} fill="url(#drhalo)" opacity={0.35} />
      <circle cx={520} cy={260} r={50} fill="url(#drclockface)" stroke="#161616" strokeWidth={4} />
      <path d="M 520 260 L 520 224 M 520 260 L 546 272" stroke="#161616" strokeWidth={5} strokeLinecap="round" />
      <circle cx={520} cy={260} r={5} fill="#161616" />
    </g>
    {/* street window: gradient sky, sun with halo, clouds, gradient street + car */}
    <g>
      <rect x={1150} y={180} width={550} height={360} fill="#F6EFE3" stroke="#C9BFA8" strokeWidth={6} />
      <rect x={1166} y={196} width={518} height={328} fill="url(#drsky)" />
      <circle cx={1620} cy={250} r={110} fill="url(#drhalo)" opacity={0.8} />
      <circle cx={1620} cy={250} r={36} fill="#FFE2B0" />
      <ellipse cx={1300} cy={270} rx={70} ry={20} fill="#FFFFFF" opacity={0.9} />
      <rect x={1166} y={440} width={518} height={84} fill="url(#drstreet)" />
      <path d="M 1166 440 L 1684 440" stroke="#E8E0D0" strokeWidth={4} />
      <path d="M 1166 482 L 1684 482" stroke="#E8E0D0" strokeWidth={3} strokeDasharray="24 18" opacity={0.7} />
      <g>
        <rect x={1230} y={445} width={370} height={50} rx={14} fill="url(#drcar)" stroke="#161616" strokeWidth={3} />
        <path d="M 1300 445 L 1320 412 L 1510 412 L 1540 445 Z" fill="url(#drcar)" stroke="#161616" strokeWidth={3} />
        <rect x={1330} y={420} width={60} height={25} fill="#A9C6FF" opacity={0.85} />
        <rect x={1410} y={420} width={60} height={25} fill="#A9C6FF" opacity={0.85} />
        <circle cx={1310} cy={496} r={16} fill="#161616" />
        <circle cx={1310} cy={496} r={6} fill="#8A8578" />
        <circle cx={1530} cy={496} r={16} fill="#161616" />
        <circle cx={1530} cy={496} r={6} fill="#8A8578" />
        <circle cx={1222} cy={488} r={9} fill="#9A9A9A" opacity={0.7} />
        <circle cx={1208} cy={478} r={7} fill="#9A9A9A" opacity={0.55} />
        <circle cx={1196} cy={488} r={5} fill="#9A9A9A" opacity={0.4} />
      </g>
      <path d="M 1425 196 L 1425 524 M 1166 360 L 1684 360" stroke="#F6EFE3" strokeWidth={8} />
      <rect x={1138} y={540} width={574} height={16} fill="#C9BFA8" />
    </g>
    {/* rug: radial gradient volume */}
    <ellipse cx={900} cy={925} rx={480} ry={55} fill="url(#drrug)" stroke="#8A4A38" strokeWidth={3} />
    <ellipse cx={900} cy={925} rx={400} ry={40} fill="none" stroke="#D89A7A" strokeWidth={3} opacity={0.7} />
    {/* atmosphere: warm haze unifies the palette, lighter vignette for day */}
    <AtmoHaze color="#E8D9A8" o={0.05} />
    <Vignette p="dr" o={0.6} />
  </g>
);

// ---------------------------------------------------------------------------
// Chapter 4 shared bits (S23-S28): the quiet room + desk + folder.
// One set shared by all six scenes. Jake stands beside the desk (x=880)
// facing the folder on it. No mouths.
// Lime is never used: the folder's glow is a soft warm/white glow, not lime.
// ---------------------------------------------------------------------------

const JAKE_X = 880;
const DESK_TOP = 700;
const FOLDER_CX = 1200;

type FolderDeskProps = {
  folder?: 'closed' | 'open' | 'hidden';
  folderX?: number;
  open?: number;
  rise?: number;
  glow?: number;
  flashDim?: boolean;
  waveFlat?: number;
  shift?: number;
  showFragments?: boolean;
  bottleOnDesk?: { x: number } | null;
};

/** The three memory fragments that pop out of the folder: a flash of light,
    a sound wave, and a shiver. They rise out of the folder like pop-ups and
    rearrange themselves with small x-shifts. */
const Fragments: React.FC<{ cx: number; rise: number; flashDim: boolean; waveFlat: number; shift: number }> = ({
  cx, rise, flashDim, waveFlat, shift,
}) => {
  const fy = 655 - rise * 110;
  const op = rise;
  const waveH = [30, 55, 80, 60, 88, 62, 40, 70, 50, 28];
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  return (
    <g>
      <g transform={`translate(${cx - 70 - shift * 18} ${fy}) scale(${flashDim ? 0.65 : 1})`} opacity={op * (flashDim ? 0.5 : 1)}>
        <circle r={26} fill="#FFF3C4" stroke="#E8B84B" strokeWidth={3} />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
          const r = (a * Math.PI) / 180;
          return (
            <line
              key={a}
              x1={Math.cos(r) * 30}
              y1={Math.sin(r) * 30}
              x2={Math.cos(r) * 48}
              y2={Math.sin(r) * 48}
              stroke="#FFE9A8"
              strokeWidth={6}
              strokeLinecap="round"
            />
          );
        })}
      </g>
      <g transform={`translate(${cx + 40 + shift * 12} ${fy})`} opacity={op}>
        {waveH.map((h, i) => {
          const bh = lerp(h, 16, waveFlat);
          return <rect key={i} x={-54 + i * 12} y={-bh / 2} width={7} height={bh} rx={3} fill="#3E8C86" />;
        })}
      </g>
      <g transform={`translate(${cx + 150 - shift * 6} ${fy})`} opacity={op}>
        <path d="M -16 18 L -5 -6 L 5 10 L 16 -16" stroke={MOONLIGHT} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <line x1={-28} y1={8} x2={-21} y2={8} stroke={MOONLIGHT} strokeWidth={4} strokeLinecap="round" />
        <line x1={21} y1={-6} x2={28} y2={-6} stroke={MOONLIGHT} strokeWidth={4} strokeLinecap="round" />
      </g>
    </g>
  );
};

/** The small pill bottle: amber body, cream cap, white label reading
    PROPRANOLOL (the real drug name from the script). x,y = bottle centre. */
const PillBottle: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g>
    <rect x={x - 39} y={y - 55} width={78} height={110} rx={10} fill="#C97A2E" stroke="#161616" strokeWidth={3} />
    <rect x={x - 41} y={y - 76} width={82} height={24} rx={6} fill="#F6EFE3" stroke="#161616" strokeWidth={3} />
    <rect x={x - 35} y={y - 22} width={70} height={44} fill="#FFFFFF" stroke="#161616" strokeWidth={2} />
    <text x={x} y={y + 4} textAnchor="middle" fontFamily={FONT.ui} fontSize={8.5} fill="#161616">PROPRANOLOL</text>
  </g>
);

const FolderDesk: React.FC<FolderDeskProps> = ({
  folder = 'closed',
  folderX = FOLDER_CX,
  open = 0,
  rise = 0,
  glow = 0,
  flashDim = false,
  waveFlat = 0,
  shift = 0,
  showFragments = false,
  bottleOnDesk = null,
}) => {
  const cx = folderX;
  return (
    <g>
      <RealDefs p="fd" palette="night" />
      {/* FolderDesk-only gradients: desk wood, folder paper, rug, frame, books */}
      <defs>
        <linearGradient id="fdwood" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5A3E26" />
          <stop offset="100%" stopColor="#3A2812" />
        </linearGradient>
        <linearGradient id="fdwoodDark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4A3018" />
          <stop offset="100%" stopColor="#2E1D0E" />
        </linearGradient>
        <linearGradient id="fdwoodHi" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8A5A34" />
          <stop offset="100%" stopColor="#6A4226" />
        </linearGradient>
        {/* folder paper: warm manila, lighter where the glow catches it */}
        <linearGradient id="fdfolder" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E8C88A" />
          <stop offset="100%" stopColor="#C9A45A" />
        </linearGradient>
        <linearGradient id="fdflap" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F0D49A" />
          <stop offset="100%" stopColor="#D9B36A" />
        </linearGradient>
        <radialGradient id="fdrug" cx="0.5" cy="0.4" r="0.8">
          <stop offset="0%" stopColor="#3A3345" />
          <stop offset="100%" stopColor="#241A24" />
        </radialGradient>
        <linearGradient id="fdframe" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2E3242" />
          <stop offset="100%" stopColor="#1E2230" />
        </linearGradient>
        <linearGradient id="fdbookR" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C0392B" />
          <stop offset="100%" stopColor="#8E2A20" />
        </linearGradient>
        <linearGradient id="fdbookT" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3E8C86" />
          <stop offset="100%" stopColor="#2A5E58" />
        </linearGradient>
        <linearGradient id="fdbookY" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F2C94C" />
          <stop offset="100%" stopColor="#D9A82E" />
        </linearGradient>
        <linearGradient id="fdpot" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C85A46" />
          <stop offset="100%" stopColor="#8E3A2E" />
        </linearGradient>
      </defs>
      {/* ceiling + walls + floor: night gradients, cold dark blue */}
      <rect x={0} y={0} width={1920} height={120} fill="#0E1224" />
      <rect x={0} y={120} width={1920} height={756} fill="url(#fdwall)" />
      <rect x={0} y={876} width={1920} height={204} fill="url(#fdfloor)" />
      <path d="M 0 960 L 1920 960" stroke="#1E1626" strokeWidth={2} opacity={0.8} />
      {[320, 640, 1280, 1600].map((x) => (
        <path key={x} d={`M ${x} 876 L ${x - 30} 1080`} stroke="#1E1626" strokeWidth={2} opacity={0.6} />
      ))}
      <rect x={0} y={852} width={1920} height={24} fill="#10142A" stroke="#05070F" strokeWidth={2} />
      <path d="M 480 120 L 480 876" stroke="#232B47" strokeWidth={3} opacity={0.7} />
      <g>
        <rect x={150} y={230} width={240} height={150} fill="url(#fdframe)" stroke="#8A7A5A" strokeWidth={5} />
        <rect x={162} y={242} width={216} height={126} fill="url(#fdsky)" />
        <circle cx={270} cy={282} r={54} fill="url(#fdhalo)" opacity={0.7} />
        <circle cx={270} cy={282} r={18} fill="#FFE2B0" />
        <path d="M 162 340 L 205 312 L 245 336 L 285 318 L 315 340 L 378 340 L 378 368 L 162 368 Z" fill="#0B0816" />
      </g>
      <g>
        <rect x={150} y={430} width={260} height={14} fill="url(#fdwood)" stroke="#161616" strokeWidth={3} />
        <rect x={170} y={382} width={28} height={48} fill="url(#fdbookR)" stroke="#161616" strokeWidth={2} />
        <rect x={200} y={374} width={26} height={56} fill="url(#fdbookT)" stroke="#161616" strokeWidth={2} />
        <rect x={228} y={388} width={30} height={42} fill="url(#fdbookY)" stroke="#161616" strokeWidth={2} />
        <rect x={300} y={398} width={34} height={32} rx={4} fill="url(#fdpot)" stroke="#161616" strokeWidth={2} />
        <path d="M 317 398 Q 310 372 300 366 M 317 398 Q 317 368 317 362 M 317 398 Q 324 372 334 366" stroke="#5E8C46" strokeWidth={4} fill="none" strokeLinecap="round" />
      </g>
      <g>
        <path d="M 1790 876 L 1860 876 L 1850 800 L 1800 800 Z" fill="url(#fdpot)" stroke="#161616" strokeWidth={3} />
        <path d="M 1825 800 Q 1800 730 1770 710 M 1825 800 Q 1825 720 1825 700 M 1825 800 Q 1850 730 1880 712" stroke="#5E8C46" strokeWidth={7} fill="none" strokeLinecap="round" />
      </g>
      <ellipse cx={1300} cy={935} rx={430} ry={50} fill="url(#fdrug)" stroke="#241A24" strokeWidth={3} />
      <ellipse cx={1300} cy={935} rx={350} ry={36} fill="none" stroke="#5A4A5A" strokeWidth={3} opacity={0.7} />
      <g>
        <rect x={1000} y={732} width={26} height={144} fill="url(#fdwoodDark)" stroke="#161616" strokeWidth={3} />
        <rect x={1650} y={732} width={26} height={144} fill="url(#fdwoodDark)" stroke="#161616" strokeWidth={3} />
        <rect x={1000} y={830} width={676} height={14} fill="url(#fdwoodDark)" stroke="#161616" strokeWidth={3} />
        <rect x={960} y={DESK_TOP} width={760} height={32} fill="url(#fdwood)" stroke="#161616" strokeWidth={4} />
        <rect x={964} y={704} width={752} height={5} fill="url(#fdwoodHi)" />
      </g>
      {folder !== 'hidden' && glow > 0 ? (
        <g>
          <ellipse cx={cx} cy={672} rx={280} ry={95} fill="#FFE2B0" opacity={glow * 0.3} />
          <ellipse cx={cx} cy={672} rx={180} ry={55} fill="#FFE2B0" opacity={glow * 0.22} />
          <GlowDisc cx={cx} cy={672} r={210} color="#FFE2B0" o={glow * 0.45} />
        </g>
      ) : null}
      {folder !== 'hidden' ? (
        <g>
          <SoftShadow p="fd" cx={cx} cy={706} rx={185} ry={10} o={0.35} />
          <polygon points={`${cx - 180},${DESK_TOP} ${cx + 180},${DESK_TOP} ${cx + 160},668 ${cx - 160},668`} fill="url(#fdfolder)" stroke="#161616" strokeWidth={3} strokeLinejoin="round" />
          <rect x={cx + 110} y={652} width={64} height={16} rx={4} fill="url(#fdfolder)" stroke="#161616" strokeWidth={3} />
          <polygon
            points={`${cx - 160},668 ${cx + 160},668 ${cx + 160 - open * 12},${668 - open * 72} ${cx - 160 + open * 12},${668 - open * 72}`}
            fill="url(#fdflap)"
            stroke="#161616"
            strokeWidth={3}
            strokeLinejoin="round"
          />
          {folder === 'closed' && glow > 0 ? (
            <line x1={cx - 180} y1={DESK_TOP} x2={cx + 180} y2={DESK_TOP} stroke="#FFE2B0" strokeWidth={4} opacity={Math.min(0.55, glow * 4)} />
          ) : null}
          {showFragments ? <Fragments cx={cx} rise={rise} flashDim={flashDim} waveFlat={waveFlat} shift={shift} /> : null}
        </g>
      ) : null}
      {bottleOnDesk ? <PillBottle x={bottleOnDesk.x} y={DESK_TOP - 55} /> : null}
      {/* atmosphere: haze unifies the palette, vignette falls off to darkness */}
      <AtmoHaze color="#2A2A55" o={0.06} />
      <Vignette p="fd" />
    </g>
  );
};

// ---------------------------------------------------------------------------
// Chapter 5 shared bits (S29-S34): story table (dog/cat/clown), classroom.
// Sets split so animals sit BEHIND the table and desks sit IN FRONT of the
// students. Lime appears exactly once in the chapter: the checkmark on the
// teacher's survey form (the focal prop).
// ---------------------------------------------------------------------------

const DOG_X = 430;
const CAT_X = 780;
const CLOWN_X = 1080;
const ANIMAL_Y = 880;

type AnimalProps = { x: number; y: number; s: number; f: number; len: number; wave: boolean; opacity: number };

/** Alternating ±16° keys every 25 frames, out to the scene length. */
const waveKeys = (len: number): [number, number][] => {
  const keys: [number, number][] = [];
  for (let k = 0; k <= len; k += 25) keys.push([k, (k / 25) % 2 === 0 ? -16 : 16]);
  return keys;
};

/** Sitting dog, facing right. Base (0,0) is the ground under him. */
const Dog: React.FC<AnimalProps> = ({ x, y, s, f, len, wave, opacity }) => {
  const rot = wave ? kf(f, waveKeys(len)) : 0;
  return (
    <g opacity={opacity} transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M -38 -30 Q -72 -52 -64 -80" stroke="#161616" strokeWidth={10} strokeLinecap="round" fill="none" />
      <ellipse cx={-5} cy={-48} rx={42} ry={50} fill="#161616" />
      <ellipse cx={18} cy={-55} rx={28} ry={45} fill="#161616" />
      <ellipse cx={-32} cy={-4} rx={16} ry={7} fill="#161616" />
      {wave ? (
        <g>
          <rect x={36} y={-70} width={12} height={70} rx={6} fill="#161616" />
          <g transform={`rotate(${rot} 28 -66)`}>
            <path d="M 28 -66 L 28 -116" stroke="#161616" strokeWidth={12} strokeLinecap="round" />
            <circle cx={28} cy={-120} r={8} fill="#161616" />
          </g>
        </g>
      ) : (
        <g>
          <rect x={20} y={-70} width={12} height={70} rx={6} fill="#161616" />
          <rect x={38} y={-70} width={12} height={70} rx={6} fill="#161616" />
        </g>
      )}
      <circle cx={30} cy={-108} r={27} fill="#161616" />
      <ellipse cx={14} cy={-116} rx={9} ry={17} fill="#161616" transform="rotate(-18 14 -116)" />
      <ellipse cx={52} cy={-100} rx={14} ry={9} fill="#161616" />
      <ellipse cx={36} cy={-114} rx={5} ry={7} fill="#F6EFE3" />
    </g>
  );
};

/** Sitting cat, facing right. Base (0,0) is the ground under her. */
const Cat: React.FC<AnimalProps> = ({ x, y, s, f, len, wave, opacity }) => {
  const rot = wave ? kf(f, waveKeys(len)) : 0;
  return (
    <g opacity={opacity} transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M -34 -12 Q -72 -6 -70 -44" stroke="#161616" strokeWidth={9} strokeLinecap="round" fill="none" />
      <ellipse cx={0} cy={-42} rx={34} ry={44} fill="#161616" />
      {wave ? (
        <g>
          <rect x={20} y={-60} width={10} height={60} rx={6} fill="#161616" />
          <g transform={`rotate(${rot} 12 -58)`}>
            <path d="M 12 -58 L 12 -104" stroke="#161616" strokeWidth={10} strokeLinecap="round" />
            <circle cx={12} cy={-108} r={7} fill="#161616" />
          </g>
        </g>
      ) : (
        <g>
          <rect x={4} y={-60} width={10} height={60} rx={6} fill="#161616" />
          <rect x={20} y={-60} width={10} height={60} rx={6} fill="#161616" />
        </g>
      )}
      <path d="M -10 -116 L -4 -142 L 4 -118 Z" fill="#161616" />
      <path d="M 14 -120 L 22 -144 L 30 -118 Z" fill="#161616" />
      <circle cx={8} cy={-100} r={24} fill="#161616" />
      <ellipse cx={14} cy={-104} rx={4} ry={6} fill="#F6EFE3" />
    </g>
  );
};

/** Clown on a bicycle, facing right — black silhouette, round red nose,
    red party hat with a yellow pompom. Base (0,0) is the ground under the wheels. */
const ClownBike: React.FC<AnimalProps> = ({ x, y, s, f, len, wave, opacity }) => {
  const rot = wave ? kf(f, waveKeys(len)) : 0;
  return (
    <g opacity={opacity} transform={`translate(${x} ${y}) scale(${s})`}>
      <circle cx={-55} cy={-34} r={34} fill="none" stroke="#161616" strokeWidth={7} />
      <circle cx={55} cy={-34} r={34} fill="none" stroke="#161616" strokeWidth={7} />
      <path d="M -55 -34 L -55 -68 M -89 -34 L -21 -34 M 55 -34 L 55 -68 M 21 -34 L 89 -34" stroke="#161616" strokeWidth={3} />
      <path d="M -55 -34 L 2 -92 L 55 -34" stroke="#161616" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M 55 -34 L 62 -94" stroke="#161616" strokeWidth={7} strokeLinecap="round" />
      <path d="M 56 -98 L 74 -88" stroke="#161616" strokeWidth={7} strokeLinecap="round" />
      <rect x={-12} y={-102} width={28} height={8} rx={4} fill="#161616" />
      <path d="M 0 -92 L 30 -46" stroke="#161616" strokeWidth={12} strokeLinecap="round" />
      <path d="M 0 -92 L -24 -48" stroke="#161616" strokeWidth={12} strokeLinecap="round" />
      <circle cx={30} cy={-44} r={7} fill="#161616" />
      <circle cx={-24} cy={-46} r={7} fill="#161616" />
      <path d="M 0 -92 L 2 -146" stroke="#161616" strokeWidth={26} strokeLinecap="round" />
      <path d="M 2 -138 L 58 -96" stroke="#161616" strokeWidth={10} strokeLinecap="round" />
      {wave ? (
        <g transform={`rotate(${rot} 2 -140)`}>
          <path d="M 2 -140 L -14 -186" stroke="#161616" strokeWidth={10} strokeLinecap="round" />
          <circle cx={-15} cy={-190} r={8} fill="#161616" />
        </g>
      ) : (
        <path d="M 0 -138 L -8 -100" stroke="#161616" strokeWidth={10} strokeLinecap="round" />
      )}
      <circle cx={4} cy={-172} r={26} fill="#161616" />
      <path d="M -12 -190 L 4 -228 L 20 -188 Z" fill="#C0392B" stroke="#161616" strokeWidth={3} strokeLinejoin="round" />
      <circle cx={4} cy={-230} r={6} fill="#F2C94C" stroke="#161616" strokeWidth={2} />
      <circle cx={26} cy={-168} r={8} fill="#C0392B" stroke="#161616" strokeWidth={2} />
      <ellipse cx={10} cy={-178} rx={4} ry={6} fill="#F6EFE3" />
    </g>
  );
};

// StoryTable set (S29/S33/S34) — a warm room, table in the middle. Split in
// two so the animals sit between the back wall and the table: the table
// occludes their lower halves, the dog (left of the table) shows whole.

const StoryTableBack: React.FC = () => (
  <g>
    <RealDefs p="st" palette="day" />
    {/* story-table-only gradients: wood, rug, screen, cream, + a userSpace
        wall gradient so the two wall rects share one continuous falloff
        (no seam at y=120) */}
    <defs>
      <linearGradient id="stWallFull" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="876">
        <stop offset="0%" stopColor="#F2E8D5" />
        <stop offset="70%" stopColor="#E9DCC3" />
        <stop offset="100%" stopColor="#DCCFB2" />
      </linearGradient>
      <linearGradient id="stWood" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#8A5E34" />
        <stop offset="100%" stopColor="#5E3C1E" />
      </linearGradient>
      <linearGradient id="stWoodDark" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#6A4A26" />
        <stop offset="100%" stopColor="#452A12" />
      </linearGradient>
      <radialGradient id="stRug" cx="0.5" cy="0.45" r="0.65">
        <stop offset="0%" stopColor="#C07A5E" />
        <stop offset="100%" stopColor="#8A4A38" />
      </radialGradient>
      <linearGradient id="stScreen" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#2E3342" />
        <stop offset="100%" stopColor="#141824" />
      </linearGradient>
      <linearGradient id="stCream" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FBF6EC" />
        <stop offset="100%" stopColor="#EFE6D0" />
      </linearGradient>
    </defs>
    {/* walls + floor: warm daylight gradients */}
    <rect x={0} y={0} width={1920} height={120} fill="url(#stWallFull)" />
    <rect x={0} y={120} width={1920} height={756} fill="url(#stWallFull)" />
    <rect x={0} y={876} width={1920} height={204} fill="url(#stfloor)" />
    <path d="M 0 960 L 1920 960" stroke="#5E4429" strokeWidth={2} opacity={0.8} />
    {[320, 640, 1280, 1600].map((x) => (
      <path key={x} d={`M ${x} 876 L ${x - 30} 1080`} stroke="#5E4429" strokeWidth={2} opacity={0.6} />
    ))}
    <rect x={0} y={852} width={1920} height={24} fill="url(#stCream)" stroke="#C9BFA8" strokeWidth={2} />
    {/* sunlight shaft: the sun sits high-RIGHT in the window (cx 380 of
        140–460), so the beam angles DOWN-LEFT to the floor (dir -1). */}
    <WindowShaft p="st" sill={[140, 460, 500]} floorY={980} dir={-1} spread={60} motes={6} seed={11} />
    <g>
      <rect x={140} y={180} width={320} height={320} fill="url(#stCream)" stroke="#C9BFA8" strokeWidth={6} />
      <rect x={156} y={196} width={288} height={288} fill="url(#stsky)" />
      <circle cx={380} cy={250} r={110} fill="url(#sthalo)" />
      <circle cx={380} cy={250} r={38} fill="#FFE2B0" />
      <ellipse cx={240} cy={280} rx={60} ry={18} fill="#FFFFFF" opacity={0.9} />
      <ellipse cx={330} cy={360} rx={80} ry={22} fill="#FFFFFF" opacity={0.85} />
      <path d="M 300 196 L 300 484 M 156 340 L 444 340" stroke="#F6EFE3" strokeWidth={8} />
      <rect x={128} y={500} width={344} height={16} fill="#C9BFA8" />
      <rect x={180} y={472} width={44} height={28} rx={4} fill="#C85A46" stroke="#161616" strokeWidth={3} />
      <path d="M 202 472 Q 190 442 178 436 M 202 472 Q 202 438 202 432 M 202 472 Q 214 442 226 436" stroke="#5E8C46" strokeWidth={5} fill="none" strokeLinecap="round" />
    </g>
    <g>
      <rect x={900} y={220} width={220} height={140} fill="url(#stScreen)" stroke="#8A7A5A" strokeWidth={5} />
      <rect x={912} y={232} width={196} height={116} fill="#1E2436" />
      <circle cx={1010} cy={272} r={60} fill="url(#sthalo)" opacity={0.6} />
      <circle cx={1010} cy={272} r={18} fill="#FFE2B0" />
      <path d="M 912 320 L 950 296 L 985 316 L 1020 300 L 1050 320 L 1108 320 L 1108 348 L 912 348 Z" fill="#0B0816" />
    </g>
    <g>
      <circle cx={1350} cy={280} r={45} fill="url(#stCream)" stroke="#161616" strokeWidth={4} />
      <path d="M 1350 280 L 1350 248 M 1350 280 L 1372 292" stroke="#161616" strokeWidth={4} strokeLinecap="round" />
      <circle cx={1350} cy={280} r={4} fill="#161616" />
    </g>
    <g>
      <rect x={1560} y={220} width={320} height={500} fill="url(#stWood)" stroke="#161616" strokeWidth={4} />
      {[320, 440, 560, 680].map((y) => (
        <rect key={y} x={1572} y={y} width={296} height={14} fill="url(#stWoodDark)" stroke="#161616" strokeWidth={2} />
      ))}
      {[
        { y: 268, books: ['#C0392B', '#3E8C86', '#F2C94C', '#7A5A8A', '#5E8C46', '#8A6A4A'] },
        { y: 388, books: ['#7A5A8A', '#C0392B', '#5E8C46', '#3E8C86', '#F2C94C'] },
        { y: 508, books: ['#3E8C86', '#F2C94C', '#C0392B', '#8A6A4A', '#7A5A8A', '#5E8C46'] },
      ].map((shelf, si) => (
        <g key={si}>
          {shelf.books.map((c, bi) => (
            <rect key={bi} x={1584 + bi * 46 + (si % 2) * 12} y={shelf.y} width={34} height={52} fill={c} stroke="#161616" strokeWidth={2} />
          ))}
        </g>
      ))}
      <rect x={1620} y={614} width={52} height={66} rx={4} fill="#C85A46" stroke="#161616" strokeWidth={3} />
      <path d="M 1646 614 Q 1630 574 1614 566 M 1646 614 Q 1646 570 1646 562 M 1646 614 Q 1662 574 1678 566" stroke="#5E8C46" strokeWidth={5} fill="none" strokeLinecap="round" />
    </g>
    <g>
      <GlowDisc cx={960} cy={246} r={70} color="#FFE2B0" o={0.5} />
      <ellipse cx={960} cy={300} rx={180} ry={60} fill="#FFE2B0" opacity={0.12} />
      <line x1={960} y1={120} x2={960} y2={196} stroke="#161616" strokeWidth={5} />
      <path d="M 920 246 L 1000 246 L 986 196 L 934 196 Z" fill="#3A352F" stroke="#161616" strokeWidth={3} strokeLinejoin="round" />
    </g>
    <ellipse cx={960} cy={925} rx={480} ry={60} fill="url(#stRug)" stroke="#8A4A38" strokeWidth={3} />
    <ellipse cx={960} cy={925} rx={400} ry={44} fill="none" stroke="#D89A7A" strokeWidth={3} opacity={0.7} />
    {/* atmosphere: warm haze unifies the palette, vignette falls off to the edges */}
    <AtmoHaze color="#FFE2B0" o={0.05} />
    <Vignette p="st" o={0.6} />
  </g>
);


const StoryTableFront: React.FC = () => (
  <g>
    {/* RealDefs re-mounted here (same "st" prefix, identical defs — harmless
        per real.tsx) so the SoftShadow blur resolves even if Front ever
        renders without Back. */}
    <RealDefs p="st" palette="day" />
    <defs>
      <linearGradient id="stfWood" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#8A5E34" />
        <stop offset="100%" stopColor="#6A4423" />
      </linearGradient>
      <linearGradient id="stfWoodDark" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#6A4A26" />
        <stop offset="100%" stopColor="#452A12" />
      </linearGradient>
      <linearGradient id="stfPaper" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="100%" stopColor="#EFE8D8" />
      </linearGradient>
      <linearGradient id="stfMug" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#4A9A92" />
        <stop offset="100%" stopColor="#2E6E68" />
      </linearGradient>
    </defs>
    {/* soft blurred shadow under the table, on the floor line */}
    <SoftShadow p="st" cx={970} cy={882} rx={430} ry={14} o={0.3} />
    <g>
      <rect x={560} y={715} width={820} height={32} fill="url(#stfWood)" stroke="#161616" strokeWidth={4} />
      <rect x={564} y={719} width={812} height={5} fill="#9A6A3A" />
      <rect x={800} y={747} width={26} height={129} fill="url(#stfWoodDark)" stroke="#161616" strokeWidth={3} />
      <rect x={1120} y={747} width={26} height={129} fill="url(#stfWoodDark)" stroke="#161616" strokeWidth={3} />
      <rect x={800} y={830} width={346} height={16} fill="url(#stfWoodDark)" stroke="#161616" strokeWidth={3} />
    </g>
    <g>
      <rect x={560} y={787} width={140} height={18} fill="url(#stfWoodDark)" stroke="#161616" strokeWidth={3} />
      <rect x={592} y={655} width={22} height={132} rx={8} fill="url(#stfWoodDark)" stroke="#161616" strokeWidth={3} />
      <rect x={556} y={805} width={16} height={71} fill="url(#stfWoodDark)" stroke="#161616" strokeWidth={3} />
      <rect x={668} y={805} width={16} height={71} fill="url(#stfWoodDark)" stroke="#161616" strokeWidth={3} />
    </g>
    <g>
      <rect x={1240} y={831} width={140} height={18} fill="url(#stfWoodDark)" stroke="#161616" strokeWidth={3} />
      <rect x={1322} y={765} width={22} height={66} rx={8} fill="url(#stfWoodDark)" stroke="#161616" strokeWidth={3} />
      <rect x={1252} y={849} width={16} height={27} fill="url(#stfWoodDark)" stroke="#161616" strokeWidth={3} />
      <rect x={1372} y={849} width={16} height={27} fill="url(#stfWoodDark)" stroke="#161616" strokeWidth={3} />
    </g>
    <g transform="rotate(-4 755 696)">
      <rect x={700} y={678} width={110} height={37} fill="url(#stfPaper)" stroke="#161616" strokeWidth={3} />
      <path d="M 712 690 L 798 690 M 712 700 L 798 700 M 712 710 L 770 710" stroke="#8A8578" strokeWidth={2} />
    </g>
    <g>
      <rect x={1180} y={680} width={34} height={35} rx={4} fill="url(#stfMug)" stroke="#161616" strokeWidth={3} />
      <path d="M 1214 688 A 10 10 0 0 1 1214 706" fill="none" stroke="#161616" strokeWidth={3} />
    </g>
  </g>
);


// Split so the desks sit IN FRONT of the students (drawn after them).

type Hair = 'short' | 'bun' | 'pony' | 'cap' | 'curly';
type KidSpec = { x: number; hair: Hair; hairC: string; top: string; raised: boolean };

const BACK_ROW: KidSpec[] = [
  { x: 620, hair: 'pony', hairC: '#3A2420', top: '#6A8A9A', raised: true },
  { x: 960, hair: 'cap', hairC: '#4A3226', top: '#9A6A5A', raised: true },
  { x: 1300, hair: 'curly', hairC: '#1E1418', top: '#7A7A4A', raised: false },
];
const FRONT_ROW: KidSpec[] = [
  { x: 790, hair: 'bun', hairC: '#5A3A28', top: '#6A5A8A', raised: true },
  { x: 1130, hair: 'short', hairC: '#C9925A', top: '#4A6A5A', raised: true },
];
const BACK_SEAT_Y = 640;
const FRONT_SEAT_Y = 800;

/** A classmate seen from behind, sitting at a desk — shaped shirt torso,
    arms at the sides (or one raised), head with hair, no face (we see the
    back of the head). Local y=0 is the chair seat. */
const Kid: React.FC<{ x: number; seatY: number; s: number; hair: Hair; hairC: string; top: string; raised: boolean }> = ({ x, seatY, s, hair, hairC, top, raised }) => (
  <g transform={`translate(${x} ${seatY}) scale(${s})`}>
    <rect x={-39} y={-32} width={78} height={38} rx={10} fill="#7A5747" stroke="#5B4038" strokeWidth={3} />
    <rect x={-39} y={-2} width={78} height={10} rx={4} fill="#7A5747" stroke="#5B4038" strokeWidth={3} />
    <rect x={-28} y={-52} width={56} height={52} rx={14} fill={top} stroke="#161616" strokeWidth={3} />
    <path d="M -28 -40 L -31 -8" stroke="#161616" strokeWidth={7} strokeLinecap="round" />
    <path d="M 28 -40 L 31 -8" stroke="#161616" strokeWidth={7} strokeLinecap="round" />
    {raised ? (
      <g>
        <path d="M 28 -44 L 36 -104" stroke="#161616" strokeWidth={8} strokeLinecap="round" />
        <circle cx={36} cy={-108} r={8} fill="#161616" />
      </g>
    ) : null}
    <rect x={-10} y={-64} width={20} height={18} fill={hairC} />
    <circle cx={0} cy={-72} r={26} fill={hairC} />
    {hair === 'bun' ? <circle cx={0} cy={-98} r={10} fill={hairC} stroke="#161616" strokeWidth={2} /> : null}
    {hair === 'pony' ? <ellipse cx={24} cy={-62} rx={7} ry={18} fill={hairC} stroke="#161616" strokeWidth={2} transform="rotate(15 24 -62)" /> : null}
    {hair === 'cap' ? (
      <g>
        <path d="M -26 -72 A 26 26 0 0 1 26 -72 Z" fill="#C0392B" stroke="#161616" strokeWidth={2} />
        <ellipse cx={0} cy={-70} rx={30} ry={6} fill="#C0392B" stroke="#161616" strokeWidth={2} />
      </g>
    ) : null}
    {hair === 'curly' ? (
      <g fill={hairC} stroke="#161616" strokeWidth={2}>
        <circle cx={-20} cy={-88} r={7} />
        <circle cx={-10} cy={-96} r={7} />
        <circle cx={0} cy={-98} r={7} />
        <circle cx={10} cy={-96} r={7} />
        <circle cx={20} cy={-88} r={7} />
      </g>
    ) : null}
  </g>
);

const Students: React.FC = () => (
  <g>
    {BACK_ROW.map((k, i) => (
      <Kid key={`b${i}`} x={k.x} seatY={BACK_SEAT_Y} s={0.85} hair={k.hair} hairC={k.hairC} top={k.top} raised={k.raised} />
    ))}
    {FRONT_ROW.map((k, i) => (
      <Kid key={`f${i}`} x={k.x} seatY={FRONT_SEAT_Y} s={1} hair={k.hair} hairC={k.hairC} top={k.top} raised={k.raised} />
    ))}
  </g>
);

const ClassroomBack: React.FC = () => (
  <g>
    <RealDefs p="cl" palette="day" />
    <defs>
      <linearGradient id="clWallFull" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="876">
        <stop offset="0%" stopColor="#F2E8D5" />
        <stop offset="70%" stopColor="#E9DCC3" />
        <stop offset="100%" stopColor="#DCCFB2" />
      </linearGradient>
      <linearGradient id="clWood" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#9A7A52" />
        <stop offset="100%" stopColor="#6E4E2E" />
      </linearGradient>
      <linearGradient id="clWoodTop" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#B08A5E" />
        <stop offset="100%" stopColor="#96683F" />
      </linearGradient>
      <linearGradient id="clWoodDark" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#7A5A38" />
        <stop offset="100%" stopColor="#54381E" />
      </linearGradient>
      <linearGradient id="clBoard" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#33523F" />
        <stop offset="100%" stopColor="#223626" />
      </linearGradient>
      <linearGradient id="clCork" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#D8B878" />
        <stop offset="100%" stopColor="#B8935A" />
      </linearGradient>
      <linearGradient id="clCream" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FBF6EC" />
        <stop offset="100%" stopColor="#EFE6D0" />
      </linearGradient>
      <linearGradient id="clPaper" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="100%" stopColor="#EFE8D8" />
      </linearGradient>
    </defs>
    {/* walls + floor: warm daylight gradients */}
    <rect x={0} y={0} width={1920} height={120} fill="url(#clWallFull)" />
    <rect x={0} y={120} width={1920} height={756} fill="url(#clWallFull)" />
    <rect x={0} y={876} width={1920} height={204} fill="url(#clfloor)" />
    <path d="M 0 960 L 1920 960" stroke="#5E4429" strokeWidth={2} opacity={0.8} />
    {[320, 640, 1280, 1600].map((x) => (
      <path key={x} d={`M ${x} 876 L ${x - 30} 1080`} stroke="#5E4429" strokeWidth={2} opacity={0.6} />
    ))}
    <rect x={0} y={852} width={1920} height={24} fill="url(#clCream)" stroke="#C9BFA8" strokeWidth={2} />
    {/* sunlight from an off-frame window at the upper LEFT (this set has no
        window drawn): the beam angles DOWN-RIGHT to the floor (dir 1). */}
    <WindowShaft p="cl" sill={[0, 260, 140]} floorY={980} dir={1} spread={80} motes={5} seed={21} />
    <g>
      <rect x={540} y={170} width={840} height={280} fill="url(#clWood)" stroke="#5E4429" strokeWidth={5} />
      <rect x={560} y={190} width={800} height={240} fill="url(#clBoard)" stroke="#1E3026" strokeWidth={3} />
      <text x={960} y={268} textAnchor="middle" fontFamily={FONT.title} fontSize={46} fontWeight={800} fill="#F6EFE3">CLASS SURVEY</text>
      <text x={960} y={330} textAnchor="middle" fontFamily={FONT.ui} fontSize={30} fill="#F6EFE3">Raise your hand if you remember</text>
      <rect x={560} y={430} width={800} height={12} fill="url(#clWood)" stroke="#5E4429" strokeWidth={3} />
      <rect x={900} y={442} width={60} height={8} rx={3} fill="#F6EFE3" />
      <rect x={980} y={442} width={60} height={8} rx={3} fill="#F2C94C" />
    </g>
    <g>
      <rect x={150} y={220} width={350} height={210} fill="url(#clWood)" stroke="#5E4429" strokeWidth={4} />
      <rect x={162} y={232} width={326} height={186} fill="url(#clCork)" />
      <rect x={190} y={260} width={90} height={110} fill="url(#clPaper)" stroke="#161616" strokeWidth={2} transform="rotate(-3 235 315)" />
      <rect x={300} y={270} width={90} height={110} fill="#DCE8F5" stroke="#161616" strokeWidth={2} transform="rotate(2 345 325)" />
      <rect x={400} y={255} width={70} height={90} fill="#F2C94C" stroke="#161616" strokeWidth={2} transform="rotate(4 435 300)" />
      <circle cx={235} cy={262} r={6} fill="#C0392B" />
      <circle cx={345} cy={272} r={6} fill="#3E8C86" />
      <circle cx={435} cy={257} r={6} fill="#C0392B" />
    </g>
    <g>
      <circle cx={1500} cy={280} r={45} fill="url(#clCream)" stroke="#161616" strokeWidth={4} />
      <path d="M 1500 280 L 1500 248 M 1500 280 L 1524 292" stroke="#161616" strokeWidth={4} strokeLinecap="round" />
      <circle cx={1500} cy={280} r={4} fill="#161616" />
    </g>
    <g>
      <rect x={1460} y={660} width={360} height={22} fill="url(#clWoodTop)" stroke="#5E4429" strokeWidth={3} />
      <rect x={1470} y={682} width={340} height={194} fill="url(#clWood)" stroke="#5E4429" strokeWidth={3} />
      <rect x={1490} y={700} width={300} height={60} fill="url(#clWoodDark)" stroke="#5E4429" strokeWidth={2} />
      <rect x={1752} y={628} width={34} height={32} fill="#5E4429" />
      <circle cx={1769} cy={600} r={55} fill="url(#clhalo)" opacity={0.4} />
      <circle cx={1769} cy={600} r={30} fill="#7FB8E8" stroke="#161616" strokeWidth={3} />
      <path d="M 1748 588 Q 1762 578 1772 590 Q 1782 600 1774 612 Q 1760 616 1752 604 Z" fill="#5E8C46" stroke="#161616" strokeWidth={2} />
    </g>
    {/* atmosphere: warm haze unifies the palette, vignette falls off to the edges */}
    <AtmoHaze color="#FFE2B0" o={0.05} />
    <Vignette p="cl" o={0.55} />
  </g>
);

/** One desk per student, drawn IN FRONT of the student (covers the torso
    below the shoulders, like sitting at a real desk). Legs reach the floor. */

const Desk: React.FC<{ x: number; topY: number; w: number }> = ({ x, topY, w }) => (
  <g>
    <SoftShadow p="cl" cx={x} cy={882} rx={w / 2 + 24} ry={10} o={0.28} />
    <rect x={x - w / 2} y={topY} width={w} height={8} rx={3} fill="url(#cldWoodTop)" stroke="#5E4429" strokeWidth={3} />
    <rect x={x - w / 2 + 4} y={topY + 8} width={w - 8} height={54} fill="url(#cldWoodBody)" stroke="#5E4429" strokeWidth={3} />
    <rect x={x - w / 2 + 8} y={topY + 62} width={10} height={876 - (topY + 62)} fill="url(#cldWoodDark)" />
    <rect x={x + w / 2 - 18} y={topY + 62} width={10} height={876 - (topY + 62)} fill="url(#cldWoodDark)" />
  </g>
);


const ClassroomDesks: React.FC = () => (
  <g>
    {/* RealDefs re-mounted here (same "cl" prefix, identical defs) so the
        Desk SoftShadow blur resolves even if Desks ever renders without Back. */}
    <RealDefs p="cl" palette="day" />
    <defs>
      <linearGradient id="cldWoodTop" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#B08A5E" />
        <stop offset="100%" stopColor="#8A6A44" />
      </linearGradient>
      <linearGradient id="cldWoodBody" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#96683F" />
        <stop offset="100%" stopColor="#6E4A28" />
      </linearGradient>
      <linearGradient id="cldWoodDark" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#6A4A2E" />
        <stop offset="100%" stopColor="#4A3220" />
      </linearGradient>
    </defs>
    {BACK_ROW.map((k, i) => (
      <Desk key={`b${i}`} x={k.x} topY={632} w={170} />
    ))}
    {FRONT_ROW.map((k, i) => (
      <Desk key={`f${i}`} x={k.x} topY={786} w={200} />
    ))}
  </g>
);

const SurveyPapers: React.FC<{ opacity: number }> = ({ opacity }) => (
  <g opacity={opacity}>
    {[...BACK_ROW.map((k) => ({ x: k.x, topY: 632 })), ...FRONT_ROW.map((k) => ({ x: k.x, topY: 786 }))].map((d, i) => (
      <g key={i} transform={`rotate(${i % 2 === 0 ? -4 : 3} ${d.x} ${d.topY - 20})`}>
        <rect x={d.x - 17} y={d.topY - 42} width={34} height={44} fill="#F6EFE3" stroke="#161616" strokeWidth={2} />
        <rect x={d.x - 11} y={d.topY - 34} width={8} height={8} fill="none" stroke="#161616" strokeWidth={2} />
        <rect x={d.x - 11} y={d.topY - 20} width={8} height={8} fill="none" stroke="#161616" strokeWidth={2} />
        <path d={`M ${d.x + 1} ${d.topY - 30} L ${d.x + 13} ${d.topY - 30} M ${d.x + 1} ${d.topY - 16} L ${d.x + 13} ${d.topY - 16}`} stroke="#8A8578" strokeWidth={2} />
      </g>
    ))}
    <g transform="rotate(-3 1610 608)">
      <rect x={1540} y={556} width={140} height={104} fill="#FFFFFF" stroke="#161616" strokeWidth={3} />
      <text x={1610} y={584} textAnchor="middle" fontFamily={FONT.ui} fontSize={20} fontWeight={700} fill="#161616">SURVEY</text>
      {[596, 616, 636].map((y) => (
        <g key={y}>
          <rect x={1554} y={y} width={12} height={12} fill="none" stroke="#161616" strokeWidth={2} />
          <path d={`M 1574 ${y + 6} L 1668 ${y + 6}`} stroke="#8A8578" strokeWidth={2} />
        </g>
      ))}
      <path d="M 1555 597 L 1560 606 L 1567 594" stroke={LIME} strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  </g>
);

/** The survey forms dissolve into coloured paper pieces drifting down.
    24 pieces, staggered starts, each falling from its form's desk to the
    floor over 240–360 frames with a sideways drift and a spin. */
const CONFETTI_COLORS = ['#C0392B', '#F2C94C', '#3E8C86', '#7A5A8A', '#F6EFE3', '#D96A5F'];
const CONFETTI_SRC = [
  { x: 620, y: 632 },
  { x: 960, y: 632 },
  { x: 1300, y: 632 },
  { x: 790, y: 786 },
  { x: 1130, y: 786 },
  { x: 1610, y: 600 },
];

const Confetti: React.FC<{ f: number; len: number }> = ({ f, len }) => {
  const pieces = Array.from({ length: 24 }, (_, i) => {
    const src = CONFETTI_SRC[i % CONFETTI_SRC.length];
    return {
      sx: src.x + ((i * 53) % 70) - 35,
      y0: src.y,
      start: 70 + (i % 6) * 18,
      fall: 240 + (i % 4) * 40,
      endY: 950 + (i % 3) * 30,
      drift: ((i * 37) % 80) - 40,
      rot: (i % 2 === 0 ? 1 : -1) * (120 + (i % 5) * 60),
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    };
  });
  const op = kf(f, [[60, 0], [90, 1], [len, 1]]);
  return (
    <g opacity={op}>
      {pieces.map((p, i) => {
        const y = kf(f, [[p.start, p.y0], [p.start + p.fall, p.endY]]);
        const x = p.sx + kf(f, [[p.start, 0], [p.start + p.fall, 1]]) * p.drift;
        const r = kf(f, [[p.start, 0], [p.start + p.fall, p.rot]]);
        return (
          <g key={i} transform={`translate(${x} ${y}) rotate(${r})`}>
            <rect x={-6} y={-4} width={12} height={8} fill={p.color} stroke="#161616" strokeWidth={1.5} />
          </g>
        );
      })}
    </g>
  );
};

// Shared seated Jake for the StoryTable scenes — Jake left (scale 1), seated
// at the table alone, telling his story to the camera. Seated, so shadow={0}
// plus foot contact shadows from joints().
// (Nov 17: a second character used to sit across the table as the listener;
// he is gone — Jake is alone at the table now, facing the camera/right,
// telling the story to the viewer.)

const tablePair = (scene: string, f: number, len: number, jakeKeys: { f: number; p: Partial<typeof basePose> }[], jakeExpr: 'neutral' | 'shock' | 'oops') => {
  const pj = pose(scene, 'jake', f, jakeKeys);
  const faceJ = faceAt(f, [[0, jakeExpr]]);
  const jj = joints(pj, true);
  const footJL = { x: pj.x + jj.legL.end.x, y: pj.y + jj.legL.end.y + 11 };
  const footJR = { x: pj.x + jj.legR.end.x, y: pj.y + jj.legR.end.y + 11 };
  return { pj, faceJ, footJL, footJR };
};

const tableShadows = (footJL: { x: number; y: number }, footJR: { x: number; y: number }) => (
  <g>
    <ellipse cx={footJL.x} cy={footJL.y + 2} rx={20} ry={6} fill="#000" opacity={0.35} />
    <ellipse cx={footJR.x} cy={footJR.y + 2} rx={20} ry={6} fill="#000" opacity={0.35} />
  </g>
);

// ---------------------------------------------------------------------------
// Chapter 6 shared bits (S35-S39): baby's room, head garden, blocks floor,
// album room. Lime is the focal highlight only (the new shoots in S36).
// ---------------------------------------------------------------------------

/** Baby's room: soft pale-blue/cream walls, wood floor. Crib centre-left
    (~500px wide, ~350px tall). Mobile hangs above it, turning slowly. Open
    doorway on the right; Jake (scale 1.15) stands in it, head high in the
    frame — too big for the room. */
const BabyRoom: React.FC<{ mobileAngle: number }> = ({ mobileAngle }) => (
  <g>
    <RealDefs p="br" palette="night" />
    {/* baby-room-only gradients. Walls stay the room's own pale blue, dimmed
        to a soft dusk (not full navy — a baby's room at night, gentle, not
        scary); floor stays warm wood, dimmed for night. */}
    <defs>
      <linearGradient id="brWallFull" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="540">
        <stop offset="0%" stopColor="#93A5BC" />
        <stop offset="70%" stopColor="#6B7D99" />
        <stop offset="100%" stopColor="#55677F" />
      </linearGradient>
      <linearGradient id="brWains" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#C9B8A0" />
        <stop offset="100%" stopColor="#A89880" />
      </linearGradient>
      <linearGradient id="brFloor" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#6A4A34" />
        <stop offset="100%" stopColor="#452E1E" />
      </linearGradient>
      <linearGradient id="brWood" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#8A5E34" />
        <stop offset="100%" stopColor="#5E3C1E" />
      </linearGradient>
      <linearGradient id="brWoodDark" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#6A4A26" />
        <stop offset="100%" stopColor="#452A12" />
      </linearGradient>
      <linearGradient id="brSlat" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#B08A5E" />
        <stop offset="100%" stopColor="#8A6A44" />
      </linearGradient>
      <radialGradient id="brRug" cx="0.5" cy="0.45" r="0.65">
        <stop offset="0%" stopColor="#E0AAAA" />
        <stop offset="100%" stopColor="#A87878" />
      </radialGradient>
      <linearGradient id="brDoor" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#2E2438" />
        <stop offset="100%" stopColor="#171222" />
      </linearGradient>
      <linearGradient id="brCream" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FBF6EC" />
        <stop offset="100%" stopColor="#E8DFCE" />
      </linearGradient>
      <linearGradient id="brBlanket" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#8FB4D4" />
        <stop offset="100%" stopColor="#6A94B8" />
      </linearGradient>
      <radialGradient id="brPillow" cx="0.4" cy="0.35" r="0.9">
        <stop offset="0%" stopColor="#FBF6EC" />
        <stop offset="100%" stopColor="#E0D6C2" />
      </radialGradient>
    </defs>
    {/* walls: soft dusk blue up top, warm dimmed wainscot below */}
    <rect x={0} y={0} width={1920} height={120} fill="url(#brWallFull)" />
    <rect x={0} y={120} width={1920} height={420} fill="url(#brWallFull)" />
    <rect x={0} y={540} width={1920} height={336} fill="url(#brWains)" />
    <rect x={0} y={530} width={1920} height={14} fill="url(#brCream)" stroke="#D8CFC0" strokeWidth={2} />
    <rect x={0} y={876} width={1920} height={204} fill="url(#brFloor)" />
    <path d="M 0 960 L 1920 960" stroke="#6A4A2E" strokeWidth={2} opacity={0.8} />
    {[320, 640, 1280, 1600].map((x) => (
      <path key={x} d={`M ${x} 876 L ${x - 30} 1080`} stroke="#6A4A2E" strokeWidth={2} opacity={0.6} />
    ))}
    <rect x={0} y={852} width={1920} height={24} fill="url(#brCream)" stroke="#C9BFA8" strokeWidth={2} />
    {[480, 1440].map((x) => (
      <path key={x} d={`M ${x} 120 L ${x} 876`} stroke="#B8CBD8" strokeWidth={3} opacity={0.7} />
    ))}
    {/* moonlight shaft: the moon sits LEFT-of-centre in the window (cx 320
        of 140–380), so the beam angles DOWN-RIGHT to the floor (dir 1). */}
    <WindowShaft p="br" sill={[140, 380, 480]} floorY={980} dir={1} spread={50} motes={5} seed={31} />
    <g>
      <rect x={140} y={170} width={240} height={310} fill="url(#brCream)" stroke="#C9BFA8" strokeWidth={6} />
      <rect x={156} y={186} width={208} height={278} fill="url(#brsky)" />
      <circle cx={320} cy={240} r={90} fill="url(#brhalo)" />
      <circle cx={320} cy={240} r={30} fill="#F5EDD0" />
      <ellipse cx={220} cy={300} rx={55} ry={16} fill="#FFFFFF" opacity={0.5} />
      <ellipse cx={300} cy={380} rx={60} ry={18} fill="#FFFFFF" opacity={0.45} />
      <path d="M 260 186 L 260 464 M 156 325 L 364 325" stroke="#F6EFE3" strokeWidth={8} />
      <rect x={128} y={480} width={264} height={16} fill="#C9BFA8" />
    </g>
    <g>
      <rect x={1000} y={200} width={250} height={160} fill="#2A2E3A" stroke="#8A7A5A" strokeWidth={5} />
      <rect x={1012} y={212} width={226} height={136} fill="#1E2436" />
      <circle cx={1125} cy={260} r={20} fill="#FFE2B0" />
      {[[1050, 310], [1100, 320], [1180, 300], [1210, 330], [1070, 280]].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={2.5} fill="#F6EFE3" opacity={0.9} />
      ))}
    </g>
    <g>
      <rect x={1330} y={330} width={180} height={14} fill="url(#brWood)" stroke="#161616" strokeWidth={3} />
      <rect x={1350} y={288} width={34} height={42} fill="#C0392B" stroke="#161616" strokeWidth={3} />
      <rect x={1392} y={296} width={34} height={34} fill="#3E8C86" stroke="#161616" strokeWidth={3} />
      <circle cx={1468} cy={312} r={18} fill="#E8C86A" stroke="#161616" strokeWidth={3} />
    </g>
    {/* warm night-light wash over the crib side */}
    <GlowDisc cx={650} cy={470} r={180} color="#FFD9A0" o={0.3} />
    <ellipse cx={650} cy={930} rx={380} ry={52} fill="url(#brRug)" stroke="#B07878" strokeWidth={3} />
    <ellipse cx={650} cy={930} rx={310} ry={38} fill="none" stroke="#E8C0C0" strokeWidth={3} opacity={0.7} />
    <g>
      <rect x={120} y={720} width={260} height={156} fill="url(#brWood)" stroke="#161616" strokeWidth={4} />
      <rect x={120} y={720} width={260} height={26} fill="#9A6A3A" stroke="#161616" strokeWidth={3} />
      <circle cx={250} cy={800} r={7} fill="#8A7A5A" stroke="#161616" strokeWidth={2} />
      <circle cx={180} cy={706} r={16} fill="#C0392B" stroke="#161616" strokeWidth={3} />
      <rect x={300} y={690} width={30} height={30} fill="#3E8C86" stroke="#161616" strokeWidth={3} transform="rotate(8 315 705)" />
    </g>
    <g>
      <rect x={400} y={520} width={16} height={356} rx={8} fill="url(#brWood)" stroke="#161616" strokeWidth={3} />
      <rect x={884} y={520} width={16} height={356} rx={8} fill="url(#brWood)" stroke="#161616" strokeWidth={3} />
      <rect x={400} y={540} width={500} height={16} fill="url(#brWood)" stroke="#161616" strokeWidth={3} />
      <rect x={400} y={830} width={500} height={16} fill="url(#brWood)" stroke="#161616" strokeWidth={3} />
      {[432, 474, 516, 558, 600, 642, 684, 726, 768, 810, 852].map((x) => (
        <rect key={x} x={x} y={556} width={8} height={274} fill="url(#brSlat)" stroke="#161616" strokeWidth={2} />
      ))}
      <rect x={416} y={740} width={468} height={50} fill="url(#brCream)" stroke="#161616" strokeWidth={3} />
      <rect x={416} y={740} width={280} height={50} fill="url(#brBlanket)" stroke="#161616" strokeWidth={3} />
      <path d="M 700 740 Q 700 712 740 710 Q 800 706 850 716 Q 868 726 858 740 Z" fill="url(#brPillow)" stroke="#161616" strokeWidth={3} />
      <circle cx={820} cy={712} r={18} fill="#E8DFCE" stroke="#161616" strokeWidth={3} />
      <ellipse cx={812} cy={688} rx={6} ry={14} fill="#E8DFCE" stroke="#161616" strokeWidth={2} />
      <ellipse cx={830} cy={688} rx={6} ry={14} fill="#E8DFCE" stroke="#161616" strokeWidth={2} />
      <circle cx={814} cy={710} r={2.5} fill="#161616" />
      <circle cx={826} cy={710} r={2.5} fill="#161616" />
    </g>
    <g transform={`rotate(${mobileAngle} 650 380)`}>
      <line x1={650} y1={120} x2={650} y2={380} stroke="#5A4A3A" strokeWidth={5} />
      <rect x={560} y={374} width={180} height={10} rx={5} fill="url(#brWood)" stroke="#161616" strokeWidth={3} />
      <line x1={580} y1={384} x2={580} y2={420} stroke="#5A4A3A" strokeWidth={2} />
      <path d="M 580 420 L 586 434 L 601 434 L 589 443 L 593 458 L 580 449 L 567 458 L 571 443 L 559 434 L 574 434 Z" fill="#F2C94C" stroke="#161616" strokeWidth={2} />
      <line x1={630} y1={384} x2={630} y2={428} stroke="#5A4A3A" strokeWidth={2} />
      <circle cx={630} cy={448} r={18} fill="#F2C94C" stroke="#161616" strokeWidth={2} />
      <circle cx={638} cy={444} r={15} fill="#C9DEEB" />
      <line x1={680} y1={384} x2={680} y2={416} stroke="#5A4A3A" strokeWidth={2} />
      <path d="M 680 416 L 685 428 L 697 428 L 688 436 L 691 448 L 680 441 L 669 448 L 672 436 L 663 428 L 675 428 Z" fill="#E8A0A0" stroke="#161616" strokeWidth={2} />
      <line x1={724} y1={384} x2={724} y2={424} stroke="#5A4A3A" strokeWidth={2} />
      <circle cx={724} cy={440} r={14} fill="#7FB8E8" stroke="#161616" strokeWidth={2} />
    </g>
    <g>
      <rect x={1540} y={260} width={380} height={616} fill="url(#brCream)" stroke="#C9BFA8" strokeWidth={4} />
      <rect x={1560} y={280} width={340} height={596} fill="url(#brDoor)" />
      <rect x={1860} y={280} width={40} height={596} fill="#3A2E4A" />
      <rect x={1560} y={840} width={340} height={36} fill="#1A1424" />
    </g>
    {/* atmosphere: dusky violet haze, vignette falls off to the edges */}
    <AtmoHaze color="#3A3455" o={0.07} />
    <Vignette p="br" o={0.8} />
  </g>
);

const SHOOTS: { x: number; start: number; h: number }[] = [
  { x: 320, start: 0, h: 230 },
  { x: 640, start: 70, h: 260 },
  { x: 960, start: 140, h: 210 },
  { x: 1280, start: 210, h: 250 },
  { x: 1600, start: 280, h: 220 },
  { x: 1900, start: 350, h: 240 },
];
/** Old plants: taller, muted green/grey. Each leans aside (away from its
    nearest new shoot) over the same 90 frames its shoot sprouts, then holds. */
const OLD_PLANTS: { x: number; h: number; near: number; dir: 1 | -1 }[] = [
  { x: 180, h: 380, near: 0, dir: -1 },
  { x: 480, h: 340, near: 0, dir: 1 },
  { x: 800, h: 400, near: 70, dir: -1 },
  { x: 1120, h: 350, near: 140, dir: 1 },
  { x: 1440, h: 390, near: 210, dir: -1 },
  { x: 1760, h: 330, near: 280, dir: 1 },
  { x: 2040, h: 370, near: 350, dir: -1 },
];

const HeadGarden: React.FC<{ f: number; len: number }> = ({ f, len }) => {
  void len;
  return (
    <g>
      <RealDefs p="hg" palette="night" />
      <defs>
        <linearGradient id="hgSoil" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2E2115" />
          <stop offset="100%" stopColor="#1A130C" />
        </linearGradient>
        <linearGradient id="hgSoilTop" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3A2C1E" />
          <stop offset="100%" stopColor="#2A1E12" />
        </linearGradient>
        <linearGradient id="hgOldLeaf" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7A8A76" />
          <stop offset="100%" stopColor="#55634F" />
        </linearGradient>
      </defs>
      {/* sky inside the head: night-sky gradient, dimmed back toward the
          original near-black so it stays dark, not blue */}
      <rect x={-100} y={0} width={2360} height={720} fill="url(#hgsky)" />
      <rect x={-100} y={0} width={2360} height={720} fill="#0E1420" opacity={0.35} />
      {[[200, 120], [520, 200], [900, 100], [1300, 180], [1700, 110], [2050, 200], [700, 320], [1500, 300]].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={2.5} fill="#F6EFE3" opacity={0.5} />
      ))}
      {/* faint cool light from above, so the garden has depth instead of flat black */}
      <GlowDisc cx={960} cy={180} r={260} color="#A9C6FF" o={0.18} />
      <rect x={-100} y={720} width={2360} height={360} fill="url(#hgSoil)" />
      <rect x={-100} y={720} width={2360} height={10} fill="url(#hgSoilTop)" />
      {/* soft light pool on the soil, centre frame */}
      <ellipse cx={960} cy={770} rx={700} ry={90} fill="url(#hgpool)" />
      {[[150, 800], [450, 900], [800, 820], [1100, 950], [1450, 830], [1800, 920], [2050, 800]].map(([cx, cy], i) => (
        <ellipse key={i} cx={cx} cy={cy} rx={26} ry={8} fill="#1A130C" opacity={0.8} />
      ))}
      {OLD_PLANTS.map((pl) => {
        const lean = kf(f, [[pl.near, 0], [pl.near + 90, 14 * pl.dir]]);
        const topY = 720 - pl.h;
        return (
          <g key={pl.x} transform={`rotate(${lean} ${pl.x} 720)`}>
            <line x1={pl.x} y1={720} x2={pl.x} y2={topY} stroke="#6E7F6A" strokeWidth={9} strokeLinecap="round" />
            <ellipse cx={pl.x - 26} cy={topY + 90} rx={30} ry={12} fill="url(#hgOldLeaf)" transform={`rotate(-30 ${pl.x - 26} ${topY + 90})`} />
            <ellipse cx={pl.x + 26} cy={topY + 150} rx={30} ry={12} fill="url(#hgOldLeaf)" transform={`rotate(30 ${pl.x + 26} ${topY + 150})`} />
            <ellipse cx={pl.x - 22} cy={topY + 210} rx={26} ry={11} fill="url(#hgOldLeaf)" transform={`rotate(-25 ${pl.x - 22} ${topY + 210})`} />
            <circle cx={pl.x} cy={topY} r={14} fill="#7A7A6E" />
          </g>
        );
      })}
      {SHOOTS.map((sh) => {
        const g = kf(f, [[sh.start, 0], [sh.start + 90, 1]]);
        if (g <= 0.01) return null;
        const h = sh.h * g;
        const topY = 720 - h;
        return (
          <g key={sh.x}>
            <line x1={sh.x} y1={720} x2={sh.x} y2={topY} stroke={LIME} strokeWidth={8} strokeLinecap="round" />
            {g > 0.35 ? (
              <>
                <ellipse cx={sh.x - 24} cy={topY + 40} rx={26} ry={11} fill={LIME} transform={`rotate(-35 ${sh.x - 24} ${topY + 40})`} />
                <ellipse cx={sh.x + 24} cy={topY + 70} rx={26} ry={11} fill={LIME} transform={`rotate(35 ${sh.x + 24} ${topY + 70})`} />
              </>
            ) : null}
            {g > 0.7 ? <circle cx={sh.x} cy={topY} r={11} fill={LIME} /> : null}
            <ellipse cx={sh.x} cy={720} rx={34} ry={8} fill={LIME} opacity={0.25 * g} />
          </g>
        );
      })}
      <AtmoHaze color="#1E2A44" o={0.08} />
      <Vignette p="hg" o={0.6} />
    </g>
  );
};

const BlocksFloor: React.FC<{ f: number; len: number }> = ({ f, len }) => {
  void len;
  const wordOpacity = kf(f, [[200, 1], [290, 0]]);
  const newBlocks: { x: number; y: number; start: number; fill: string }[] = [
    { x: 950, y: 736, start: 230, fill: '#7FA97A' },
    { x: 1030, y: 736, start: 260, fill: '#5E8CAA' },
    { x: 1110, y: 736, start: 290, fill: '#C85A46' },
    { x: 1190, y: 736, start: 320, fill: '#E8C86A' },
    { x: 990, y: 666, start: 350, fill: '#5E8CAA' },
    { x: 1070, y: 666, start: 380, fill: '#7FA97A' },
  ];
  return (
    <g>
      <RealDefs p="bf" palette="day" />
      <defs>
        <linearGradient id="bfWallFull" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="876">
          <stop offset="0%" stopColor="#F2E8D5" />
          <stop offset="70%" stopColor="#E9DCC3" />
          <stop offset="100%" stopColor="#DCCFB2" />
        </linearGradient>
        <linearGradient id="bfWood" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8A5E34" />
          <stop offset="100%" stopColor="#5E3C1E" />
        </linearGradient>
        <radialGradient id="bfRug" cx="0.5" cy="0.45" r="0.65">
          <stop offset="0%" stopColor="#C07A5E" />
          <stop offset="100%" stopColor="#8A4A38" />
        </radialGradient>
        <linearGradient id="bfWater" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C8E6F5" />
          <stop offset="100%" stopColor="#9AC8E0" />
        </linearGradient>
        <linearGradient id="bfBlock" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E0AC68" />
          <stop offset="100%" stopColor="#C88A44" />
        </linearGradient>
        <linearGradient id="bfCream" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FBF6EC" />
          <stop offset="100%" stopColor="#EFE6D0" />
        </linearGradient>
      </defs>
      {/* walls + floor: warm daylight gradients */}
      <rect x={0} y={0} width={1920} height={120} fill="url(#bfWallFull)" />
      <rect x={0} y={120} width={1920} height={756} fill="url(#bfWallFull)" />
      <rect x={0} y={876} width={1920} height={204} fill="url(#bffloor)" />
      <path d="M 0 960 L 1920 960" stroke="#5E4429" strokeWidth={2} opacity={0.8} />
      {[320, 640, 1280, 1600].map((x) => (
        <path key={x} d={`M ${x} 876 L ${x - 30} 1080`} stroke="#5E4429" strokeWidth={2} opacity={0.6} />
      ))}
      <rect x={0} y={852} width={1920} height={24} fill="url(#bfCream)" stroke="#C9BFA8" strokeWidth={2} />
      {/* sunlight shaft: the sun sits high-RIGHT in the window (cx 1720 of
          1500–1800), so the beam angles DOWN-LEFT to the floor (dir -1). */}
      <WindowShaft p="bf" sill={[1500, 1800, 500]} floorY={980} dir={-1} spread={60} motes={6} seed={41} />
      <g>
        <rect x={1500} y={170} width={300} height={330} fill="url(#bfCream)" stroke="#C9BFA8" strokeWidth={6} />
        <rect x={1516} y={186} width={268} height={298} fill="url(#bfsky)" />
        <circle cx={1720} cy={250} r={100} fill="url(#bfhalo)" />
        <circle cx={1720} cy={250} r={32} fill="#FFE2B0" />
        <ellipse cx={1600} cy={320} rx={60} ry={16} fill="#FFFFFF" opacity={0.9} />
        <ellipse cx={1700} cy={400} rx={70} ry={18} fill="#FFFFFF" opacity={0.85} />
        <path d="M 1650 186 L 1650 484 M 1516 335 L 1784 335" stroke="#F6EFE3" strokeWidth={8} />
        <rect x={1488} y={500} width={324} height={16} fill="#C9BFA8" />
      </g>
      <g>
        <rect x={140} y={200} width={220} height={170} fill="url(#bfCream)" stroke="#8A7A5A" strokeWidth={5} />
        <rect x={152} y={212} width={196} height={146} fill="url(#bfWater)" />
        <ellipse cx={250} cy={310} rx={52} ry={32} fill="#F2C94C" stroke="#161616" strokeWidth={3} />
        <circle cx={288} cy={272} r={20} fill="#F2C94C" stroke="#161616" strokeWidth={3} />
        <path d="M 306 272 L 326 278 L 306 284 Z" fill="#E88A3D" stroke="#161616" strokeWidth={2} />
        <circle cx={294} cy={268} r={3} fill="#161616" />
      </g>
      <g>
        <rect x={140} y={560} width={300} height={16} fill="url(#bfWood)" stroke="#161616" strokeWidth={3} />
        <rect x={150} y={576} width={16} height={300} fill="url(#bfWood)" stroke="#161616" strokeWidth={3} />
        <rect x={414} y={576} width={16} height={300} fill="url(#bfWood)" stroke="#161616" strokeWidth={3} />
        <rect x={170} y={510} width={44} height={50} fill="#C0392B" stroke="#161616" strokeWidth={3} />
        <rect x={226} y={522} width={44} height={38} fill="#3E8C86" stroke="#161616" strokeWidth={3} />
        <circle cx={330} cy={540} r={20} fill="#E8C86A" stroke="#161616" strokeWidth={3} />
        <rect x={370} y={516} width={40} height={44} fill="#7FA97A" stroke="#161616" strokeWidth={3} />
      </g>
      <ellipse cx={960} cy={930} rx={560} ry={58} fill="url(#bfRug)" stroke="#8A4A38" strokeWidth={3} />
      <ellipse cx={960} cy={930} rx={480} ry={42} fill="none" stroke="#D89A7A" strokeWidth={3} opacity={0.7} />
      <rect x={760} y={836} width={40} height={40} fill="#C85A46" stroke="#161616" strokeWidth={3} transform="rotate(12 780 856)" />
      <rect x={820} y={846} width={34} height={30} fill="#5E8CAA" stroke="#161616" strokeWidth={3} transform="rotate(-8 837 861)" />
      <circle cx={1420} cy={838} r={38} fill="#C0392B" stroke="#161616" strokeWidth={3} />
      <path d="M 1386 838 A 38 38 0 0 1 1454 838" stroke="#F6EFE3" strokeWidth={4} fill="none" />
      {['M', 'A', 'M', 'A'].map((letter, i) => {
        const x = 950 + i * 80;
        return (
          <g key={i} opacity={wordOpacity}>
            <rect x={x} y={806} width={70} height={70} fill="url(#bfBlock)" stroke="#161616" strokeWidth={3} />
            <rect x={x + 4} y={810} width={62} height={8} fill="#E8BC7A" />
            <text x={x + 35} y={856} textAnchor="middle" fontFamily={FONT.title} fontSize={42} fontWeight={800} fill="#161616">{letter}</text>
          </g>
        );
      })}
      {newBlocks.map((b) => {
        const op = kf(f, [[b.start, 0], [b.start + 30, 1]]);
        const dy = kf(f, [[b.start, -18], [b.start + 30, 0]]);
        if (op <= 0.01) return null;
        return (
          <g key={`${b.x}-${b.y}`} opacity={op} transform={`translate(0 ${dy})`}>
            <rect x={b.x} y={b.y} width={70} height={70} fill={b.fill} stroke="#161616" strokeWidth={3} />
            <rect x={b.x + 4} y={b.y + 4} width={62} height={8} fill="#FFFFFF" opacity={0.25} />
          </g>
        );
      })}
      {/* atmosphere: warm haze unifies the palette, vignette falls off to the edges */}
      <AtmoHaze color="#FFE2B0" o={0.05} />
      <Vignette p="bf" o={0.55} />
    </g>
  );
};


const AlbumRoom: React.FC<{ blankSpread?: boolean }> = ({ blankSpread = false }) => (
  <g>
    <RealDefs p="ar" palette="day" />
    {/* album-room-only gradients: wood, rug, album cover, paper */}
    <defs>
      <linearGradient id="arWallFull" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="876">
        <stop offset="0%" stopColor="#F2E8D5" />
        <stop offset="70%" stopColor="#E9DCC3" />
        <stop offset="100%" stopColor="#DCCFB2" />
      </linearGradient>
      <linearGradient id="arWood" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#8A5E34" />
        <stop offset="100%" stopColor="#5E3C1E" />
      </linearGradient>
      <linearGradient id="arWoodDark" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#6A4A26" />
        <stop offset="100%" stopColor="#452A12" />
      </linearGradient>
      <radialGradient id="arRug" cx="0.5" cy="0.45" r="0.65">
        <stop offset="0%" stopColor="#C07A5E" />
        <stop offset="100%" stopColor="#8A4A38" />
      </radialGradient>
      <linearGradient id="arCover" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#3A5068" />
        <stop offset="100%" stopColor="#22303F" />
      </linearGradient>
      <linearGradient id="arPaper" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FBF6EC" />
        <stop offset="100%" stopColor="#EDE3CC" />
      </linearGradient>
      <linearGradient id="arCream" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FBF6EC" />
        <stop offset="100%" stopColor="#EFE6D0" />
      </linearGradient>
    </defs>
    {/* walls + floor: warm daylight gradients */}
    <rect x={0} y={0} width={1920} height={120} fill="url(#arWallFull)" />
    <rect x={0} y={120} width={1920} height={756} fill="url(#arWallFull)" />
    <rect x={0} y={876} width={1920} height={204} fill="url(#arfloor)" />
    <path d="M 0 960 L 1920 960" stroke="#5E4429" strokeWidth={2} opacity={0.8} />
    {[320, 640, 1280, 1600].map((x) => (
      <path key={x} d={`M ${x} 876 L ${x - 30} 1080`} stroke="#5E4429" strokeWidth={2} opacity={0.6} />
    ))}
    <rect x={0} y={852} width={1920} height={24} fill="url(#arCream)" stroke="#C9BFA8" strokeWidth={2} />
    {[480, 1440].map((x) => (
      <path key={x} d={`M ${x} 120 L ${x} 876`} stroke="#D8C9A8" strokeWidth={3} opacity={0.7} />
    ))}
    {/* sunlight shaft: the sun sits high-RIGHT in the window (cx 340 of
        120–420), so the beam angles DOWN-LEFT to the floor (dir -1). */}
    <WindowShaft p="ar" sill={[120, 420, 520]} floorY={980} dir={-1} spread={60} motes={6} seed={51} />
    <g>
      <rect x={120} y={180} width={300} height={340} fill="url(#arCream)" stroke="#C9BFA8" strokeWidth={6} />
      <rect x={136} y={196} width={268} height={308} fill="url(#arsky)" />
      <circle cx={340} cy={260} r={100} fill="url(#arhalo)" />
      <circle cx={340} cy={260} r={32} fill="#FFE2B0" />
      <ellipse cx={220} cy={330} rx={60} ry={16} fill="#FFFFFF" opacity={0.9} />
      <ellipse cx={300} cy={410} rx={70} ry={18} fill="#FFFFFF" opacity={0.85} />
      <path d="M 270 196 L 270 504 M 136 350 L 404 350" stroke="#F6EFE3" strokeWidth={8} />
      <rect x={108} y={520} width={324} height={16} fill="#C9BFA8" />
    </g>
    <g>
      <rect x={1560} y={200} width={340} height={676} fill="url(#arWood)" stroke="#161616" strokeWidth={4} />
      {[340, 480, 620, 760].map((y) => (
        <rect key={y} x={1576} y={y} width={308} height={12} fill="url(#arWoodDark)" stroke="#161616" strokeWidth={2} />
      ))}
      {[1580, 1620, 1660, 1700, 1740].map((x, i) => (
        <rect key={x} x={x} y={268} width={34} height={72} fill={['#C0392B', '#3E8C86', '#E8C86A', '#5E8CAA', '#7FA97A'][i]} stroke="#161616" strokeWidth={2} />
      ))}
      {[1580, 1624, 1668, 1712].map((x, i) => (
        <rect key={x} x={x} y={408} width={38} height={72} fill={['#5E8CAA', '#E8C86A', '#C0392B', '#7FA97A'][i]} stroke="#161616" strokeWidth={2} />
      ))}
      <path d="M 1680 620 Q 1660 580 1672 552 L 1692 552 Q 1704 580 1684 620 Z" fill="#3E8C86" stroke="#161616" strokeWidth={3} />
      {[1580, 1622, 1664, 1706, 1748, 1790].map((x, i) => (
        <rect key={x} x={x} y={688} width={36} height={72} fill={['#7FA97A', '#C0392B', '#5E8CAA', '#E8C86A', '#3E8C86', '#C85A46'][i]} stroke="#161616" strokeWidth={2} />
      ))}
    </g>
    <ellipse cx={960} cy={940} rx={500} ry={52} fill="url(#arRug)" stroke="#8A4A38" strokeWidth={3} />
    <ellipse cx={960} cy={940} rx={420} ry={38} fill="none" stroke="#D89A7A" strokeWidth={3} opacity={0.7} />
    {/* soft blurred shadow under the table, on the floor line */}
    <SoftShadow p="ar" cx={960} cy={882} rx={480} ry={14} o={0.3} />
    <g>
      <rect x={480} y={700} width={960} height={32} fill="url(#arWood)" stroke="#161616" strokeWidth={4} />
      <rect x={484} y={704} width={952} height={5} fill="#9A6A3A" />
      <rect x={520} y={732} width={26} height={144} fill="url(#arWoodDark)" stroke="#161616" strokeWidth={3} />
      <rect x={1374} y={732} width={26} height={144} fill="url(#arWoodDark)" stroke="#161616" strokeWidth={3} />
      <rect x={520} y={830} width={880} height={16} fill="url(#arWoodDark)" stroke="#161616" strokeWidth={3} />
    </g>
    <g>
      <rect x={495} y={190} width={930} height={520} rx={8} fill="url(#arCover)" stroke="#161616" strokeWidth={4} />
      <rect x={510} y={200} width={445} height={500} fill="url(#arPaper)" stroke="#C9BFA8" strokeWidth={3} />
      <rect x={965} y={200} width={445} height={500} fill="url(#arPaper)" stroke="#C9BFA8" strokeWidth={3} />
      <rect x={955} y={200} width={10} height={500} fill="#D8CFC0" />
      {!blankSpread ? (
        <>
          <g>
            <rect x={990} y={250} width={180} height={150} fill="#FFFFFF" stroke="#161616" strokeWidth={3} />
            <rect x={1000} y={260} width={160} height={110} fill="url(#arsky)" />
            <circle cx={1120} cy={288} r={16} fill="#FFE2B0" />
            <rect x={1000} y={340} width={160} height={30} fill="#7FA97A" />
            <circle cx={1080} cy={318} r={12} fill="#161616" />
            <path d="M 1080 330 L 1080 362 M 1080 340 L 1068 352 M 1080 340 L 1092 352" stroke="#161616" strokeWidth={5} strokeLinecap="round" />
            <text x={1080} y={432} textAnchor="middle" fontFamily={FONT.ui} fontSize={24} fill="#161616">AGE 4</text>
          </g>
          <g>
            <rect x={1210} y={250} width={180} height={150} fill="#FFFFFF" stroke="#161616" strokeWidth={3} />
            <rect x={1220} y={260} width={160} height={110} fill="url(#arsky)" />
            <circle cx={1340} cy={288} r={16} fill="#FFE2B0" />
            <rect x={1220} y={340} width={160} height={30} fill="#E8D9A0" />
            <circle cx={1280} cy={316} r={12} fill="#161616" />
            <path d="M 1280 328 L 1280 360 M 1280 338 L 1268 350 M 1280 338 L 1292 350" stroke="#161616" strokeWidth={5} strokeLinecap="round" />
            <circle cx={1320} cy={352} r={12} fill="#C0392B" stroke="#161616" strokeWidth={2} />
            <text x={1300} y={432} textAnchor="middle" fontFamily={FONT.ui} fontSize={24} fill="#161616">AGE 5</text>
          </g>
          <g>
            <rect x={1080} y={470} width={220} height={150} fill="#FFFFFF" stroke="#161616" strokeWidth={3} />
            <rect x={1090} y={480} width={200} height={110} fill="#E9DCC3" />
            <rect x={1140} y={540} width={100} height={50} fill="#C0392B" stroke="#161616" strokeWidth={2} />
            <rect x={1140} y={540} width={100} height={14} fill="#F6EFE3" stroke="#161616" strokeWidth={2} />
            <line x1={1170} y1={540} x2={1170} y2={516} stroke="#161616" strokeWidth={3} />
            <line x1={1210} y1={540} x2={1210} y2={516} stroke="#161616" strokeWidth={3} />
            <circle cx={1170} cy={510} r={4} fill="#F2C94C" />
            <circle cx={1210} cy={510} r={4} fill="#F2C94C" />
            <text x={1190} y={652} textAnchor="middle" fontFamily={FONT.ui} fontSize={24} fill="#161616">AGE 5</text>
          </g>
        </>
      ) : null}
    </g>
    {/* warm sun wash over the open album — the nostalgic lamp-light feel */}
    <GlowDisc cx={960} cy={450} r={320} color="#FFE2B0" o={0.25} />
    {/* atmosphere: warm nostalgic haze, vignette falls off to the edges */}
    <AtmoHaze color="#F2D9A0" o={0.07} />
    <Vignette p="ar" o={0.55} />
  </g>
);


// ---------------------------------------------------------------------------
// Scene durations (seconds) — from the ACTUAL George voiceover alignment
// (zenn_006_vo_alignment.json, 570.698s total). Each scene runs from its
// beat's first word to the NEXT beat's first word, so the visuals hold
// through the pauses between lines. S43 is the 4s music-only end card.
// (The old 0.385 s/word estimates are superseded — they totalled ~630s.)
// ---------------------------------------------------------------------------

export const DUR: Record<string, number> = {
  S1: 5.14, S2: 9.76, S3: 11.18, S4: 10.62, S5: 8.65, S6: 11.96,
  S7: 13.92, S8: 10.05, S9: 13.94, S10: 10.16, S11: 10.03, S12: 13.53,
  S13: 18.96, S14: 12.76, S15: 15.78, S16: 9.62, S17: 4.92, S18: 15.85,
  S19: 18.43, S20: 14.51, S21: 17.6, S22: 12.74, S23: 12.84, S24: 23.42,
  S25: 13.58, S26: 13.18, S27: 16.56, S28: 12.63, S29: 12.72, S30: 13.33,
  S31: 14.4, S32: 21.16, S33: 18.6, S34: 13.58, S35: 10.92, S36: 17.09,
  S37: 16.24, S38: 16.17, S39: 9.11, S40: 11.54, S41: 19.2, S42: 14.23,
  S43: 4.0,
};

// A scene's local clock in frames: f = t * 30, len = duration * 30.
const F = (api: { t: number; fps: number }) => api.t * api.fps;

// ===========================================================================
// COLD OPEN
// ===========================================================================

// S1 — Dark bedroom. Jake sits bolt upright in bed, eyes wide, sweat on his
// forehead. A clock reads 3:00 AM. Slow push-in.
// Jake sits on the bed's front edge (hips on the mattress top, y=787, feet
// planted ON the rug at y=887 — overlapping the rug body, see SIT) — bolt
// upright, arms at his sides, 'scared' expression = big white oval eyes. One
// sweat drop beside his head. Contact shadows under each foot (computed from
// the real joints, so they track the feet exactly) sell the contact — the feet
// can never read as floating again. The pose is a single held key (no movement
// in the shot except the camera push-in), so there is nothing to flap or dart.
// The clock is the lime-green accent.
// FRONT (Nov 15, Javion: "Why the fuck isn't he facing us?"): Jake faces the
// VIEWER — front-facing, eyes wide, staring straight ahead at the camera in
// shock from the nightmare. He does NOT look at the clock or the window; the
// clock just READS 3:00 AM for the viewer to see the time. His legs face the
// camera too (SIT_FRONT: foreshortened thighs, knees toward camera, shins
// down, feet on the floor) — never side-view legs on a front-facing torso.
// Same front pose in S2/S3/S4 (same bed, same night) so he never jumps
// between cuts. Rule: when a character faces the camera, the legs match the
// torso's direction — do NOT "fix" a twist by turning the character away
// from the camera.
defineScene({
  id: 'S1',
  durationSec: DUR.S1,
  characters: [
    { who: 'jake', x: 0.5, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const p = pose('S1', 'jake', f, [
      { f: 0, p: { ...basePose, x: 960, y: sitY(FLOOR_PX), scale: 1, ...SIT_FRONT, expr: 'scared' } },
      { f: len, p: { ...basePose, x: 960, y: sitY(FLOOR_PX), scale: 1, ...SIT_FRONT, expr: 'scared' } },
    ]);
    const face = faceAt(f, [[0, 'scared']]);
    const zoom = kf(f, [[0, 1.0], [len, 1.12]]);
    // Contact shadows: exactly under each foot, from the real joint positions
    // (shoe bottom = hip y + leg end y + 11). Drawn after the room, before the
    // Hero, so the feet cover the shadow's top edge and the shadow peeks out
    // underneath — the contact reads. Nov 15 feet-hover fix.
    const j = joints(p, true);
    const footL = { x: p.x + j.legL.end.x, y: p.y + j.legL.end.y + 11 };
    const footR = { x: p.x + j.legR.end.x, y: p.y + j.legR.end.y + 11 };
    return (
      <g>
        <g transform={camT(960, 560, zoom)}>
          <NightBedroom t={f} />
          <ellipse cx={footL.x} cy={footL.y + 2} rx={20} ry={6} fill="#000" opacity={0.35} />
          <ellipse cx={footR.x} cy={footR.y + 2} rx={20} ry={6} fill="#000" opacity={0.35} />
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...p, ...face, facing: 1 }} rimId="rimBlue" shadow={0} />)}
          {/* shadow={0}: the Hero's default ground shadow assumes a STANDING
              character (draws at pose.y + full leg length, under the hips). For
              a SEATED character it lands detached from the feet — below them
              and behind them — and reads as a random black spot on the floor
              (Javion caught it Nov 15). The foot contact shadows above are
              the grounding for a seated pose. Never leave the default shadow
              on a seated character. */}
          {/* sweat drop beside Jake's head (head centre 960,599; r 54) */}
          <path d="M 1012 556 Q 1022 570 1012 578 Q 1002 570 1012 556 Z" fill="#8FD3FF" stroke="#161616" strokeWidth={2} />
        </g>
      </g>
    );
  },
});

// S2 — Jake stares at his hands. They are shaking. A thought bubble appears,
// empty. Camera: hold still. Jake seated on the bed edge, same pose/position
// as S1 (x=960, sitY, SIT, 'scared'), arms bent forward with both hands up
// at chest level. The tremble is a slight shiver: a slow 3-degree arm drift
// (one reversal only — guard-safe) plus a tiny ±1.2px body tremor on the Hero
// wrapper. The foot contact shadows are computed from the real joints, as in
// S1, so the tremor never breaks contact.
defineScene({
  id: 'S2',
  durationSec: DUR.S2,
  characters: [
    { who: 'jake', x: 0.5, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const p = pose('S2', 'jake', f, [
      { f: 0, p: { ...basePose, x: 960, y: sitY(FLOOR_PX), scale: 1, ...SIT_FRONT, armL: { a: 55, b: 65 }, armR: { a: 55, b: 65 }, handL: 'open', handR: 'open', headTilt: 5, expr: 'scared' } },
      { f: Math.round(len / 2), p: { ...basePose, x: 960, y: sitY(FLOOR_PX), scale: 1, ...SIT_FRONT, armL: { a: 58, b: 65 }, armR: { a: 58, b: 65 }, handL: 'open', handR: 'open', headTilt: 5, expr: 'scared' } },
      { f: len, p: { ...basePose, x: 960, y: sitY(FLOOR_PX), scale: 1, ...SIT_FRONT, armL: { a: 55, b: 65 }, armR: { a: 55, b: 65 }, handL: 'open', handR: 'open', headTilt: 5, expr: 'scared' } },
    ]);
    const face = faceAt(f, [[0, 'scared']]);
    const j = joints(p, true);
    const footL = { x: p.x + j.legL.end.x, y: p.y + j.legL.end.y + 11 };
    const footR = { x: p.x + j.legR.end.x, y: p.y + j.legR.end.y + 11 };
    // slight tremble: ±1.2px shiver on the whole seated figure
    const trembleX = Math.sin(f * 0.55) * 1.2;
    return (
      <g>
        <g transform={camT(960, 560, 1.0)}>
          <NightBedroom t={f} />
          <ThoughtBubble />
          <ellipse cx={footL.x} cy={footL.y + 2} rx={20} ry={6} fill="#000" opacity={0.35} />
          <ellipse cx={footR.x} cy={footR.y + 2} rx={20} ry={6} fill="#000" opacity={0.35} />
          <g transform={`translate(${trembleX} 0)`}>
            {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...p, ...face, facing: 1 }} rimId="rimBlue" shadow={0} />)}
          </g>
          {/* sweat drop beside Jake's head (same as S1 — he is still scared) */}
          <path d="M 1012 556 Q 1022 570 1012 578 Q 1002 570 1012 556 Z" fill="#8FD3FF" stroke="#161616" strokeWidth={2} />
        </g>
      </g>
    );
  },
});

// S4 — Jake looks at the empty thought bubble. Camera: slow push-in on
// Jake. Jake seated on the bed edge, head tilted back (headTilt -6, the
// look-up convention) toward the bubble, 'scared'. The bubble is empty —
// nobody points at it. Jake alone carries the beat.
defineScene({
  id: 'S4',
  durationSec: DUR.S4,
  characters: [
    { who: 'jake', x: 0.5, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    // Jake — seated, looking UP at the bubble (headTilt -6), scared.
    const pj = pose('S4', 'jake', f, [
      { f: 0, p: { ...basePose, x: 960, y: sitY(FLOOR_PX), scale: 1, ...SIT_FRONT, headTilt: -6, expr: 'scared' } },
      { f: len, p: { ...basePose, x: 960, y: sitY(FLOOR_PX), scale: 1, ...SIT_FRONT, headTilt: -6, expr: 'scared' } },
    ]);
    const faceJ = faceAt(f, [[0, 'scared']]);
    const jj = joints(pj, true);
    const footL = { x: pj.x + jj.legL.end.x, y: pj.y + jj.legL.end.y + 11 };
    const footR = { x: pj.x + jj.legR.end.x, y: pj.y + jj.legR.end.y + 11 };
    const zoom = kf(f, [[0, 1.0], [len, 1.12]]);
    return (
      <g>
        <g transform={camT(960, 560, zoom)}>
          <NightBedroom t={f} />
          <ThoughtBubble />
          <ellipse cx={footL.x} cy={footL.y + 2} rx={20} ry={6} fill="#000" opacity={0.35} />
          <ellipse cx={footR.x} cy={footR.y + 2} rx={20} ry={6} fill="#000" opacity={0.35} />
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...pj, ...faceJ, facing: 1 }} rimId="rimBlue" shadow={0} />)}
          {/* sweat drop beside Jake's head (same as S1/S2) */}
          <path d="M 1012 556 Q 1022 570 1012 578 Q 1002 570 1012 556 Z" fill="#8FD3FF" stroke="#161616" strokeWidth={2} />
        </g>
      </g>
    );
  },
});

// ===========================================================================
// CHAPTER 1
// ===========================================================================

// S3 — "That's not a bug. That's the feature." Jake stays the focus: same
// cold-open bedroom, same bolt-upright scared pose as S1. Camera: HOLD STILL
// (no push-in — the script says hold). Jake alone in the room.
defineScene({
  id: 'S3',
  durationSec: DUR.S3,
  characters: [
    { who: 'jake', x: 0.5, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    // Jake — same as S1: bolt upright on the bed edge, scared, sweat drop.
    // He is the focus; he carries the scene alone.
    const pj = pose('S3', 'jake', f, [
      { f: 0, p: { ...basePose, x: 960, y: sitY(FLOOR_PX), scale: 1, ...SIT_FRONT, expr: 'scared' } },
      { f: len, p: { ...basePose, x: 960, y: sitY(FLOOR_PX), scale: 1, ...SIT_FRONT, expr: 'scared' } },
    ]);
    const faceJ = faceAt(f, [[0, 'scared']]);
    const jj = joints(pj, true);
    const footL = { x: pj.x + jj.legL.end.x, y: pj.y + jj.legL.end.y + 11 };
    const footR = { x: pj.x + jj.legR.end.x, y: pj.y + jj.legR.end.y + 11 };
    return (
      <g>
        <g transform={camT(960, 560, 1.0)}>
          <NightBedroom t={f} />
          {/* Jake's foot contact shadows (same as S1) */}
          <ellipse cx={footL.x} cy={footL.y + 2} rx={20} ry={6} fill="#000" opacity={0.35} />
          <ellipse cx={footR.x} cy={footR.y + 2} rx={20} ry={6} fill="#000" opacity={0.35} />
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...pj, ...faceJ, facing: 1 }} rimId="rimBlue" shadow={0} />)}
          {/* sweat drop beside Jake's head (same as S1) */}
          <path d="M 1012 556 Q 1022 570 1012 578 Q 1002 570 1012 556 Z" fill="#8FD3FF" stroke="#161616" strokeWidth={2} />
        </g>
      </g>
    );
  },
});

// S5 — Morning. Jake at the kitchen table, staring at a bowl of cereal. He has
// not touched it. A white bear sits on the chair across from him, eating cereal
// — spoon lowered in its lap between bites, paw never at its face (Nov 15,
// Javion: "Why is the bear constantly holding his paw to his face").
// Camera: slow pull back. Two-shot across the table: Jake left (yaw +0.65,
// facing right, 'tired' — the morning after the worst night of his life),
// bear right (facing left, spoon lowered in its lap between bites). Both seated — shadow={0} for
// Jake (the default ground shadow lands detached on a seated character);
// the bear's feet have their own contact shadows, drawn in the Bear component.
defineScene({
  id: 'S5',
  durationSec: DUR.S5,
  characters: [
    { who: 'jake', x: 0.33, feetY: ROOM_FLOOR_V },
    { who: 'bear', x: 0.68, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const p = pose('S5', 'jake', f, [
      { f: 0, p: { ...basePose, x: 640, y: sitY(FLOOR_PX), scale: 1, ...SIT, expr: 'tired', yaw: 0.65, look: 0.5 } },
      { f: len, p: { ...basePose, x: 640, y: sitY(FLOOR_PX), scale: 1, ...SIT, expr: 'tired', yaw: 0.65, look: 0.5 } },
    ]);
    const face = faceAt(f, [[0, 'tired']]);
    const zoom = kf(f, [[0, 1.12], [len, 1.0]]);
    const j = joints(p, true);
    const footL = { x: p.x + j.legL.end.x, y: p.y + j.legL.end.y + 11 };
    const footR = { x: p.x + j.legR.end.x, y: p.y + j.legR.end.y + 11 };
    return (
      <g>
        <g transform={camT(960, 560, zoom)}>
          <MorningKitchen t={f} />
          {cast('bear', <Bear x={1300} hipY={sitY(FLOOR_PX)} />)}
          <ellipse cx={footL.x} cy={footL.y + 2} rx={20} ry={6} fill="#000" opacity={0.35} />
          <ellipse cx={footR.x} cy={footR.y + 2} rx={20} ry={6} fill="#000" opacity={0.35} />
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...p, ...face, facing: 1 }} rimId="rimBlue" shadow={0} />)}
        </g>
      </g>
    );
  },
});

// S17 — Jake stands in front of a giant red button labelled DELETE. He stares
// at it. His finger hovers. Camera: slow push-in. Jake stands left, three-
// quarter toward the button (yaw +0.65), right arm raised with a pointing
// finger hovering just short of the button's edge. STANDING — shadow={1} is
// correct here (the ground shadow belongs under a standing character).
defineScene({
  id: 'S17',
  durationSec: DUR.S17,
  characters: [
    { who: 'jake', x: 0.52, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const p = pose('S17', 'jake', f, [
      { f: 0, p: { ...basePose, x: 1000, y: standY(1, ROOM_FLOOR_V), scale: 1, armL: { a: 4, b: 8 }, armR: { a: 80, b: -30 }, handR: 'point', legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 }, look: 0.5, headTilt: 0, tilt: 0, expr: 'determined', yaw: 0.65 } },
      { f: len, p: { ...basePose, x: 1000, y: standY(1, ROOM_FLOOR_V), scale: 1, armL: { a: 4, b: 8 }, armR: { a: 80, b: -30 }, handR: 'point', legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 }, look: 0.5, headTilt: 0, tilt: 0, expr: 'determined', yaw: 0.65 } },
    ]);
    const face = faceAt(f, [[0, 'determined']]);
    const zoom = kf(f, [[0, 1.0], [len, 1.12]]);
    // S17: the script is just Jake and the button — a tense moment, no cameo.
    return (
      <g>
        <g transform={camT(960, 560, zoom)}>
          <DeleteStage t={f} />
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...p, ...face, facing: 1 }} rimId="rimBlue" shadow={1} />)}
        </g>
      </g>
    );
  },
});

// S6 — "Jake closes his eyes, hands over his ears. The bear waves at him."
// Camera: hold still. Jake seated as in S5, eyes CLOSED (blink: 1), both
// hands up at the sides of his head (elbows out, hands at ear height —
// arm a=116 swings the upper arm up-out, b≈100 folds the forearm back in
// so the mitten lands on the ear, not above the head). Bear across the
// table waves: near arm raised beside its head, paw swaying gently.
defineScene({
  id: 'S6',
  durationSec: DUR.S6,
  characters: [
    { who: 'jake', x: 0.33, feetY: ROOM_FLOOR_V },
    { who: 'bear', x: 0.68, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const p = pose('S6', 'jake', f, [
      { f: 0, p: { ...basePose, x: 640, y: sitY(FLOOR_PX), scale: 1, ...SIT, armL: { a: 116, b: 95 }, armR: { a: 116, b: 100 }, expr: 'tired', yaw: 0.65, look: 0.5 } },
      { f: len, p: { ...basePose, x: 640, y: sitY(FLOOR_PX), scale: 1, ...SIT, armL: { a: 116, b: 95 }, armR: { a: 116, b: 100 }, expr: 'tired', yaw: 0.65, look: 0.5 } },
    ]);
    // Eyes CLOSED — literal face, not faceAt (no expression change in the shot).
    const face = { expr: 'tired' as const, blink: 1 };
    const j = joints(p, true);
    const footL = { x: p.x + j.legL.end.x, y: p.y + j.legL.end.y + 11 };
    const footR = { x: p.x + j.legR.end.x, y: p.y + j.legR.end.y + 11 };
    return (
      <g>
        <g transform={camT(960, 560, 1.0)}>
          <MorningKitchen t={f} />
          {cast('bear', <BearX x={1300} hipY={sitY(FLOOR_PX)} arm="wave" t={f} />)}
          <ellipse cx={footL.x} cy={footL.y + 2} rx={20} ry={6} fill="#000" opacity={0.35} />
          <ellipse cx={footR.x} cy={footR.y + 2} rx={20} ry={6} fill="#000" opacity={0.35} />
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...p, ...face, facing: 1 }} rimId="rimBlue" shadow={0} />)}
        </g>
      </g>
    );
  },
});

// S7 — "The bear is now standing right behind Jake. Jake does not notice.
// The bear holds up a sign: 'HI.'" Camera: gentle pan right.
// The bear stands up at HIS OWN seat (right side, x=1300, in front of his
// chair), facing left toward Jake, near arm raised holding the white "HI."
// card up beside its head. He stays on his side of the table — his chair
// and bowl are right there, no teleport. Jake seated as in S5, tired,
// unaware. (A "directly behind Jake" staging was tried and read as a
// floating head with white legs showing through the chair — do not do it.)
defineScene({
  id: 'S7',
  durationSec: DUR.S7,
  characters: [
    { who: 'jake', x: 0.33, feetY: ROOM_FLOOR_V },
    { who: 'bear', x: 0.68, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const p = pose('S7', 'jake', f, [
      { f: 0, p: { ...basePose, x: 640, y: sitY(FLOOR_PX), scale: 1, ...SIT, expr: 'tired', yaw: 0.65, look: 0.5 } },
      { f: len, p: { ...basePose, x: 640, y: sitY(FLOOR_PX), scale: 1, ...SIT, expr: 'tired', yaw: 0.65, look: 0.5 } },
    ]);
    const face = faceAt(f, [[0, 'tired']]);
    const panX = kf(f, [[0, 960], [len, 1010]]);
    const j = joints(p, true);
    const footL = { x: p.x + j.legL.end.x, y: p.y + j.legL.end.y + 11 };
    const footR = { x: p.x + j.legR.end.x, y: p.y + j.legR.end.y + 11 };
    return (
      <g>
        <g transform={camT(panX, 560, 1.0)}>
          <MorningKitchen t={f} />
          {cast('bear', <BearX x={1300} hipY={BEAR_STAND_HIP} arm="sign" standing faceDir={-1} />)}
          <ellipse cx={footL.x} cy={footL.y + 2} rx={20} ry={6} fill="#000" opacity={0.35} />
          <ellipse cx={footR.x} cy={footR.y + 2} rx={20} ry={6} fill="#000" opacity={0.35} />
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...p, ...face, facing: 1 }} rimId="rimBlue" shadow={0} />)}
        </g>
      </g>
    );
  },
});

// S8 — "A bell on the table. It rings by itself. Again. And again.
// The bear shrugs." Camera: hold still.
// Service bell on the table between Jake's bowl and the cereal box
// (x=860, base on the tabletop y=715): brass dome on a dark base. It rings
// three times — each ring is a ±4° shake, one swing per 15 frames — with
// two tiny motion arcs above it while it rings. Bear shrugs: both arms
// slightly raised, paws up. Jake seated, looking toward the bell.
defineScene({
  id: 'S8',
  durationSec: DUR.S8,
  characters: [
    { who: 'jake', x: 0.33, feetY: ROOM_FLOOR_V },
    { who: 'bear', x: 0.68, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const p = pose('S8', 'jake', f, [
      { f: 0, p: { ...basePose, x: 640, y: sitY(FLOOR_PX), scale: 1, ...SIT, expr: 'neutral', yaw: 0.65, look: 0.5 } },
      { f: len, p: { ...basePose, x: 640, y: sitY(FLOOR_PX), scale: 1, ...SIT, expr: 'neutral', yaw: 0.65, look: 0.5 } },
    ]);
    const face = faceAt(f, [[0, 'neutral']]);
    // Three rings (f 30-75, 120-165, 210-255): ±4° shake, 15 frames a swing.
    const ring = kf(f, [
      [0, 0], [30, 0], [45, -4], [60, 4], [75, 0],
      [120, 0], [135, -4], [150, 4], [165, 0],
      [210, 0], [225, -4], [240, 4], [255, 0], [len, 0],
    ]);
    const ringing = (f >= 30 && f <= 78) || (f >= 120 && f <= 168) || (f >= 210 && f <= 258);
    const j = joints(p, true);
    const footL = { x: p.x + j.legL.end.x, y: p.y + j.legL.end.y + 11 };
    const footR = { x: p.x + j.legR.end.x, y: p.y + j.legR.end.y + 11 };
    return (
      <g>
        <g transform={camT(960, 560, 1.0)}>
          <MorningKitchen t={f} />
          {/* service bell on the table, centre-left of the cereal box */}
          <g transform={`rotate(${ring} 860 710)`}>
            <rect x={832} y={705} width={56} height={10} rx={3} fill="#3A352F" stroke="#161616" strokeWidth={3} />
            <path d="M 835 705 L 835 700 A 25 28 0 0 1 885 700 L 885 705 Z" fill="#C9A227" stroke="#161616" strokeWidth={3} />
            <circle cx={860} cy={670} r={6} fill="#161616" />
          </g>
          {/* motion arcs while it rings */}
          <g opacity={ringing ? 0.8 : 0}>
            <path d="M 838 648 Q 860 632 882 648" stroke="#161616" strokeWidth={3} fill="none" strokeLinecap="round" />
            <path d="M 828 632 Q 860 610 892 632" stroke="#161616" strokeWidth={3} fill="none" strokeLinecap="round" />
          </g>
          {cast('bear', <BearX x={1300} hipY={sitY(FLOOR_PX)} arm="shrug" />)}
          <ellipse cx={footL.x} cy={footL.y + 2} rx={20} ry={6} fill="#000" opacity={0.35} />
          <ellipse cx={footR.x} cy={footR.y + 2} rx={20} ry={6} fill="#000" opacity={0.35} />
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...p, ...face, facing: 1 }} rimId="rimBlue" shadow={0} />)}
        </g>
      </g>
    );
  },
});

// S9 — "The bear is now sitting on Jake's head. Jake finally notices.
// He screams silently." Camera: slow push-in (1.0 → 1.12).
// Bear scaled 0.45, perched on Jake's head: the wrap puts the bear's local
// feet (y=887) on Jake's head top (y=545) — translate y 154 sinks the feet
// 8px into the head so the contact reads. Jake seated, 'shock' — wide eyes
// and raised brows only, NO mouth (a silent scream is eyes only).
defineScene({
  id: 'S9',
  durationSec: DUR.S9,
  characters: [
    { who: 'jake', x: 0.33, feetY: ROOM_FLOOR_V },
    { who: 'bear', x: 0.33, feetY: ROOM_FLOOR_V, airborne: true, airborneReason: "sitting on Jake's head" },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const p = pose('S9', 'jake', f, [
      { f: 0, p: { ...basePose, x: 640, y: sitY(FLOOR_PX), scale: 1, ...SIT, expr: 'shock', yaw: 0.65, look: 0.5 } },
      { f: len, p: { ...basePose, x: 640, y: sitY(FLOOR_PX), scale: 1, ...SIT, expr: 'shock', yaw: 0.65, look: 0.5 } },
    ]);
    const face = faceAt(f, [[0, 'shock']]);
    const zoom = kf(f, [[0, 1.0], [len, 1.12]]);
    const j = joints(p, true);
    const footL = { x: p.x + j.legL.end.x, y: p.y + j.legL.end.y + 11 };
    const footR = { x: p.x + j.legR.end.x, y: p.y + j.legR.end.y + 11 };
    return (
      <g>
        <g transform={camT(960, 560, zoom)}>
          <MorningKitchen t={f} />
          <ellipse cx={footL.x} cy={footL.y + 2} rx={20} ry={6} fill="#000" opacity={0.35} />
          <ellipse cx={footR.x} cy={footR.y + 2} rx={20} ry={6} fill="#000" opacity={0.35} />
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...p, ...face, facing: 1 }} rimId="rimBlue" shadow={0} />)}
          {/* bear perched on Jake's head, facing the same way Jake faces */}
          {cast('bear', (
            <g transform="translate(640 154) scale(0.45)">
              <BearX x={0} hipY={787} faceDir={1} />
            </g>
          ))}
        </g>
      </g>
    );
  },
});

// S10 — "Jake runs out of the kitchen. The bear stays at the table,
// finishing his cereal." Camera: hold still.
// Jake runs on the floor in front of the table, from x=800 to x=1980
// (off the right edge) at constant speed, held mid-stride the whole way —
// left leg forward + right arm forward (contralateral pump), 'scared'.
// Declared airborne: mid-stride feet leave the floor. Bear stays seated
// at the table, spoon lowered in its lap between bites, finishing cereal.
defineScene({
  id: 'S10',
  durationSec: DUR.S10,
  characters: [
    { who: 'jake', x: 0.78, feetY: ROOM_FLOOR_V, airborne: true, airborneReason: 'running out — mid-stride, feet leave the floor' },
    { who: 'bear', x: 0.68, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const p = pose('S10', 'jake', f, [
      { f: 0, p: { ...basePose, x: 800, y: standY(1, ROOM_FLOOR_V), scale: 1, armL: { a: -55, b: -45 }, armR: { a: -45, b: -30 }, legL: { a: 38, b: -15 }, legR: { a: -32, b: 20 }, expr: 'scared', yaw: 0.85, look: 0.5 } },
      { f: len, p: { ...basePose, x: 2150, y: standY(1, ROOM_FLOOR_V), scale: 1, armL: { a: -55, b: -45 }, armR: { a: -45, b: -30 }, legL: { a: 38, b: -15 }, legR: { a: -32, b: 20 }, expr: 'scared', yaw: 0.85, look: 0.5 } },
    ]);
    const face = faceAt(f, [[0, 'scared']]);
    return (
      <g>
        <g transform={camT(960, 560, 1.0)}>
          <MorningKitchen t={f} />
          {cast('bear', <BearX x={1300} hipY={sitY(FLOOR_PX)} />)}
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...p, ...face, facing: 1 }} rimId="rimBlue" shadow={1} />)}
        </g>
      </g>
    );
  },
});

// ===========================================================================
// CHAPTER 2 — "The File With No Date"
// ===========================================================================

// S11 — Jake sits ON the floor (floor-sit, hips at FLOOR_PX - 11, legs
// stretched straight out in front, feet flat on the floor with contact
// shadows), surrounded by scattered blank photographs. He holds one up to the
// light in his raised right hand — the photo is placed at his real hand
// position from joints() + toWorld(), so it stays in his grip. 'sad': the
// photo is blank, the memory is gone. Camera: slow push-in.
defineScene({
  id: 'S11',
  durationSec: DUR.S11,
  characters: [{ who: 'jake', x: 0.5, feetY: ROOM_FLOOR_V }],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const FLOOR_SIT_Y = FLOOR_PX - 11;
    const p = pose('S11', 'jake', f, [
      { f: 0, p: { ...basePose, x: 960, y: FLOOR_SIT_Y, scale: 1, armL: { a: 10, b: 15 }, armR: { a: 105, b: 30 }, legL: { a: 90, b: 0 }, legR: { a: 90, b: 0 }, look: 0.5, headTilt: 4, tilt: 0, expr: 'sad', yaw: 0.3 } },
      { f: len, p: { ...basePose, x: 960, y: FLOOR_SIT_Y, scale: 1, armL: { a: 10, b: 15 }, armR: { a: 105, b: 30 }, legL: { a: 90, b: 0 }, legR: { a: 90, b: 0 }, look: 0.5, headTilt: 4, tilt: 0, expr: 'sad', yaw: 0.3 } },
    ]);
    const face = faceAt(f, [[0, 'sad']]);
    const zoom = kf(f, [[0, 1.0], [len, 1.12]]);
    const j = joints(p, true);
    const footL = { x: p.x + j.legL.end.x, y: p.y + j.legL.end.y + 11 };
    const footR = { x: p.x + j.legR.end.x, y: p.y + j.legR.end.y + 11 };
    const handR = toWorld(p, joints(p, true).armR.end);
    return (
      <g>
        <g transform={camT(960, 560, zoom)}>
          <LivingRoomFloor />
          <BlankPhoto x={480} y={830} w={90} h={112} rot={-12} />
          <BlankPhoto x={660} y={895} w={90} h={112} rot={8} />
          <BlankPhoto x={820} y={900} w={80} h={100} rot={-18} />
          <BlankPhoto x={1240} y={905} w={90} h={112} rot={-6} />
          <BlankPhoto x={1420} y={840} w={90} h={112} rot={14} />
          <BlankPhoto x={1560} y={910} w={80} h={100} rot={10} />
          <BlankPhoto x={560} y={880} w={80} h={100} rot={20} />
          <ellipse cx={footL.x} cy={footL.y + 2} rx={20} ry={6} fill="#000" opacity={0.35} />
          <ellipse cx={footR.x} cy={footR.y + 2} rx={20} ry={6} fill="#000" opacity={0.35} />
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...p, ...face, facing: 1 }} rimId="rimBlue" shadow={0} />)}
          <g transform={`rotate(-8 ${handR.x + 8} ${handR.y - 72})`}>
            <rect x={handR.x - 52} y={handR.y - 147} width={120} height={150} fill="#FFFFFF" stroke="#161616" strokeWidth={3} />
            <rect x={handR.x - 46} y={handR.y - 141} width={108} height={138} fill="none" stroke="#8A8578" strokeWidth={1.5} />
          </g>
        </g>
      </g>
    );
  },
});

// S12 — The filing cabinet, center-left. The open drawer shows folders with
// date labels ("2019", "2021", "2023") and ONE blank folder sliding half-out
// to the right. No characters — the cabinet and the blank folder carry the
// beat. Camera: gentle pan right.
defineScene({
  id: 'S12',
  durationSec: DUR.S12,
  characters: [],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const cx = kf(f, [[0, 940], [len, 1000]]);
    return (
      <g>
        <g transform={camT(cx, 560, 1.0)}>
          <RecordsRoom />
          <FilingCabinet open={true} />
        </g>
      </g>
    );
  },
});

// S13 — Close-up: the blank folder, open, filling most of the frame. Inside
// it, three fragments — a flash of light, a sound wave, a shiver — fragments,
// not a story. No characters. Camera: hold still.
defineScene({
  id: 'S13',
  durationSec: DUR.S13,
  characters: [],
  fn: (api) => {
    const f = F(api);
    void f;
    return (
      <g>
        <g transform={camT(960, 560, 1.0)}>
          <OpenFolderCloseUp />
        </g>
      </g>
    );
  },
});

// S14 — Split screen. LEFT: a normal memory, a calm photo album with dated
// photos. RIGHT: Jake's fragments, flashing without order, scattered and
// tilted on the dark. No characters. Camera: hold still.
defineScene({
  id: 'S14',
  durationSec: DUR.S14,
  characters: [],
  fn: (api) => {
    const f = F(api);
    void f;
    return (
      <g>
        <g transform={camT(960, 560, 1.0)}>
          <SplitMemory />
        </g>
      </g>
    );
  },
});

// S15 — Jake flinches at a sound nobody else hears. A car backfires outside
// the window. He drops his glass. The flinch is one move (arms rise over
// frames 0-20, then hold) and the face flips neutral -> 'shock' at the same
// beat (f18). The glass stays in his hand until the flinch (f18), then falls
// to the floor by f48 — tilted, with motion lines while it falls and a splash
// + puddle once it lands. Camera: slow push-in on Jake.
defineScene({
  id: 'S15',
  durationSec: DUR.S15,
  characters: [{ who: 'jake', x: 0.469, feetY: ROOM_FLOOR_V }],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const keys: Parameters<typeof pose>[3] = [
      { f: 0, p: { ...basePose, x: 900, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, expr: 'neutral' } },
      { f: 20, p: { ...basePose, x: 900, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, armL: { a: 55, b: 25 }, armR: { a: 70, b: 15 }, tilt: -3, expr: 'shock' } },
      { f: len, p: { ...basePose, x: 900, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, armL: { a: 55, b: 25 }, armR: { a: 70, b: 15 }, tilt: -3, expr: 'shock' } },
    ];
    const p = pose('S15', 'jake', f, keys);
    const face = faceAt(f, [[0, 'neutral'], [18, 'shock']]);
    const zoom = kf(f, [[0, 1.0], [len, 1.12]]);
    const p0 = pose('S15', 'jake', 0, keys);
    const hand0 = toWorld(p0, joints(p0, true).armR.end);
    const glassX = kf(f, [[0, hand0.x + 4], [18, hand0.x + 4], [48, hand0.x + 34]]);
    const glassY = kf(f, [[0, hand0.y - 12], [18, hand0.y - 12], [48, 838]]);
    const glassRot = kf(f, [[0, -8], [18, -8], [48, 38]]);
    return (
      <g>
        <g transform={camT(900, 560, zoom)}>
          <DayRoom />
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...p, ...face, facing: 1 }} rimId="rimBlue" shadow={1} />)}
          {f >= 18 && f < 48 ? (
            <g stroke="#8A8578" strokeWidth={4} strokeLinecap="round" opacity={0.7}>
              <line x1={glassX - 30} y1={glassY - 48} x2={glassX - 30} y2={glassY - 72} />
              <line x1={glassX} y1={glassY - 52} x2={glassX} y2={glassY - 78} />
              <line x1={glassX + 30} y1={glassY - 48} x2={glassX + 30} y2={glassY - 72} />
            </g>
          ) : null}
          <g transform={`translate(${glassX} ${glassY}) rotate(${glassRot})`}>
            <rect x={-22} y={-28} width={44} height={56} rx={4} fill="#CFE8FF" opacity={0.9} stroke="#161616" strokeWidth={3} />
            <rect x={-18} y={-6} width={36} height={30} fill="#7FB8E8" opacity={0.7} />
            <line x1={-22} y1={-28} x2={22} y2={-28} stroke="#161616" strokeWidth={2} />
          </g>
          {f >= 48 ? (
            <g>
              <ellipse cx={glassX} cy={872} rx={46} ry={8} fill="#7FB8E8" opacity={0.8} stroke="#161616" strokeWidth={2} />
              <circle cx={glassX - 34} cy={864} r={6} fill="#7FB8E8" stroke="#161616" strokeWidth={2} />
              <circle cx={glassX + 28} cy={868} r={5} fill="#7FB8E8" stroke="#161616" strokeWidth={2} />
              <circle cx={glassX + 48} cy={862} r={4} fill="#7FB8E8" stroke="#161616" strokeWidth={2} />
            </g>
          ) : null}
        </g>
      </g>
    );
  },
});

// S16 — The drawer shuts flush on its own — and the blank folder slides out
// again, half-out to the right, by itself. Same cabinet set as S12. No
// characters — the drawer and the folder carry the beat. Camera: hold still.
defineScene({
  id: 'S16',
  durationSec: DUR.S16,
  characters: [],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    return (
      <g>
        <g transform={camT(960, 560, 1.0)}>
          <RecordsRoom />
          <FilingCabinet open={false} />
        </g>
      </g>
    );
  },
});

// ===========================================================================
// CHAPTER 3 — THE DELETE BUTTON
// ===========================================================================

// S18 — "A word pair flashes on a card: 'ORDEAL — ROACH.' Jake reads it,
// then the card flips face down. Camera: hold still." The card sits
// centre-frame above the pedestal (centre 960,330 — its bottom edge clears
// Jake's head by ~16px). The flip runs 220->340: front narrows to a vertical
// line (220->280), then the blank back widens out (280->340) and holds.
defineScene({
  id: 'S18',
  durationSec: DUR.S18,
  characters: [{ who: 'jake', x: 0.52, feetY: ROOM_FLOOR_V }],
  fn: (api) => {
    const f = F(api); const len = Math.round(api.duration * api.fps);
    const p = pose('S18', 'jake', f, [
      { f: 0, p: { ...basePose, x: 1000, y: standY(1, ROOM_FLOOR_V), scale: 1, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 }, look: 0.5, headTilt: 0, tilt: 0, expr: 'neutral', yaw: 0.65 } },
      { f: len, p: { ...basePose, x: 1000, y: standY(1, ROOM_FLOOR_V), scale: 1, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 }, look: 0.5, headTilt: 0, tilt: 0, expr: 'neutral', yaw: 0.65 } },
    ]);
    const face = faceAt(f, [[0, 'neutral']]);
    const frontScale = kf(f, [[0, 1], [220, 1], [280, 0], [len, 0]]);
    const backScale = kf(f, [[0, 0], [280, 0], [340, 1], [len, 1]]);
    return (<g><g transform={camT(960, 560, 1.0)}>
      <DeleteStage t={f} />
      <WordCard cx={960} cy={330} sx={frontScale} sy={1} label="ORDEAL — ROACH" fontSize={36} />
      <WordCard cx={960} cy={330} sx={backScale} sy={1} back />
      {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...p, ...face, facing: 1 }} rimId="rimBlue" shadow={1} />)}
    </g></g>);
  },
});

// S19 — "Jake presses the button. The card with the second word shrinks a
// little. He presses again. It shrinks more. Camera: hold still." Jake holds
// the S17 press pose (arm extended, finger pointing at the button). The card
// now shows just "ROACH" and shrinks in two steps — 1.0 -> 0.8 (60->120),
// hold, then 0.8 -> 0.6 (300->360), hold.
defineScene({
  id: 'S19',
  durationSec: DUR.S19,
  characters: [{ who: 'jake', x: 0.52, feetY: ROOM_FLOOR_V }],
  fn: (api) => {
    const f = F(api); const len = Math.round(api.duration * api.fps);
    const p = pose('S19', 'jake', f, [
      { f: 0, p: { ...basePose, x: 1000, y: standY(1, ROOM_FLOOR_V), scale: 1, armL: { a: 4, b: 8 }, armR: { a: 80, b: -30 }, handR: 'point', legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 }, look: 0.5, headTilt: 0, tilt: 0, expr: 'determined', yaw: 0.65 } },
      { f: len, p: { ...basePose, x: 1000, y: standY(1, ROOM_FLOOR_V), scale: 1, armL: { a: 4, b: 8 }, armR: { a: 80, b: -30 }, handR: 'point', legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 }, look: 0.5, headTilt: 0, tilt: 0, expr: 'determined', yaw: 0.65 } },
    ]);
    const face = faceAt(f, [[0, 'determined']]);
    const shrink = kf(f, [[0, 1], [60, 1], [120, 0.8], [300, 0.8], [360, 0.6], [len, 0.6]]);
    return (<g><g transform={camT(960, 560, 1.0)}>
      <DeleteStage t={f} />
      <WordCard cx={960} cy={330} sx={shrink} sy={shrink} label="ROACH" fontSize={48} />
      {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...p, ...face, facing: 1 }} rimId="rimBlue" shadow={1} />)}
    </g></g>);
  },
});

// S20 — "Inside Jake's head: a control room. The prefrontal cortex — a
// switchboard operator — pulls a lever down. The hippocampus — a librarian —
// dims its lamp. Camera: gentle pan right." Two one-off supporting
// silhouettes (neither is Jake): the operator pulls the middle lever
// down over frames 150->210 (his arm follows the knob), the librarian dims
// her lamp (glow 0.55->0.08 over frames 200->260). Camera pans right
// (centre x 960 -> 1060).
defineScene({
  id: 'S20',
  durationSec: DUR.S20,
  characters: [
    { who: 'operator', x: 0.19, feetY: ROOM_FLOOR_V },
    { who: 'librarian', x: 0.84, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api); const len = Math.round(api.duration * api.fps);
    // Lever pull: hold up, then down over 150->210 (60 frames), hold down.
    // The operator's hand follows the same keys.
    const leverY = kf(f, [[0, 440], [150, 440], [210, 560], [len, 560]]);
    const handY = kf(f, [[0, 460], [150, 460], [210, 570], [len, 570]]);
    // Lamp dim: bright, then fading over 200->260 (60 frames), hold dim.
    const lampGlow = kf(f, [[0, 0.55], [200, 0.55], [260, 0.08], [len, 0.08]]);
    const panX = kf(f, [[0, 960], [len, 1060]]);
    return (<g><g transform={camT(panX, 560, 1.0)}>
      <ControlRoom leverY={leverY} lampGlow={lampGlow} />
      {cast('operator', <Operator handY={handY} />)}
      {cast('librarian', <Librarian />)}
    </g></g>);
  },
});

// S21 — "Jake presses the button one more time. The card is now tiny. He
// looks relieved. Then the card twitches. Camera: hold still." Jake holds the
// S17 press pose, expr 'happy' (relief). The card sits at scale 0.3 all
// scene, still showing "ROACH", then twitches at the end: 2-3 tiny
// side-to-side jolts (440->515, 15 frames per jolt) before settling.
defineScene({
  id: 'S21',
  durationSec: DUR.S21,
  characters: [{ who: 'jake', x: 0.52, feetY: ROOM_FLOOR_V }],
  fn: (api) => {
    const f = F(api); const len = Math.round(api.duration * api.fps);
    const p = pose('S21', 'jake', f, [
      { f: 0, p: { ...basePose, x: 1000, y: standY(1, ROOM_FLOOR_V), scale: 1, armL: { a: 4, b: 8 }, armR: { a: 80, b: -30 }, handR: 'point', legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 }, look: 0.5, headTilt: 0, tilt: 0, expr: 'happy', yaw: 0.65 } },
      { f: len, p: { ...basePose, x: 1000, y: standY(1, ROOM_FLOOR_V), scale: 1, armL: { a: 4, b: 8 }, armR: { a: 80, b: -30 }, handR: 'point', legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 }, look: 0.5, headTilt: 0, tilt: 0, expr: 'happy', yaw: 0.65 } },
    ]);
    const face = faceAt(f, [[0, 'happy']]);
    const twitch = kf(f, [[0, 0], [440, 0], [455, 8], [470, -8], [485, 6], [500, -4], [515, 0], [len, 0]]);
    return (<g><g transform={camT(960, 560, 1.0)}>
      <DeleteStage t={f} />
      <WordCard cx={960} cy={330} sx={0.3} sy={0.3} dx={twitch} label="ROACH" fontSize={48} />
      {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...p, ...face, facing: 1 }} rimId="rimBlue" shadow={1} />)}
    </g></g>);
  },
});

// S22 — Jake stops pressing. The button resists — he hesitates and pulls his
// arm back on his own. Camera: hold still. Jake lowers his arm from the press
// pose to his side over the first 60 frames, then holds. Jake alone is the
// focus.
defineScene({
  id: 'S22',
  durationSec: DUR.S22,
  characters: [
    { who: 'jake', x: 0.52, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api); const len = Math.round(api.duration * api.fps);
    const p = pose('S22', 'jake', f, [
      { f: 0, p: { ...basePose, x: 1000, y: standY(1, ROOM_FLOOR_V), scale: 1, armL: { a: 4, b: 8 }, armR: { a: 80, b: -30 }, handR: 'point', legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 }, look: 0.5, headTilt: 0, tilt: 0, expr: 'neutral', yaw: 0.65 } },
      { f: 60, p: { ...basePose, x: 1000, y: standY(1, ROOM_FLOOR_V), scale: 1, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, handR: 'point', legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 }, look: 0.5, headTilt: 0, tilt: 0, expr: 'neutral', yaw: 0.65 } },
      { f: len, p: { ...basePose, x: 1000, y: standY(1, ROOM_FLOOR_V), scale: 1, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, handR: 'point', legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 }, look: 0.5, headTilt: 0, tilt: 0, expr: 'neutral', yaw: 0.65 } },
    ]);
    const face = faceAt(f, [[0, 'neutral']]);
    return (<g><g transform={camT(960, 560, 1.0)}>
      <DeleteStage t={f} />
      {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...p, ...face, facing: 1 }} rimId="rimBlue" shadow={1} />)}
    </g></g>);
  },
});

// ===========================================================================
// CHAPTER 4 — "The File Opens Every Time You Read It"
// ===========================================================================

// S23 — Jake opens the blank folder. The moment he touches it, the folder
// glows and unfolds like a pop-up book. The fragments inside rearrange
// themselves. Camera: slow push-in.
// Jake reaches his right arm down toward the folder (arm swings 4 -> 70 over
// 90 frames, one direction, then holds); the warm glow fades in, the cover
// lifts, and the three fragments rise out of the folder and shuffle sideways.
defineScene({
  id: 'S23',
  durationSec: DUR.S23,
  characters: [{ who: 'jake', x: 0.46, feetY: ROOM_FLOOR_V }],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const p = pose('S23', 'jake', f, [
      { f: 0, p: { ...basePose, x: JAKE_X, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, armR: { a: 4, b: 8 }, look: 0, yaw: 0.65, expr: 'neutral' } },
      { f: 90, p: { ...basePose, x: JAKE_X, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, armR: { a: 70, b: 25 }, look: 0.5, yaw: 0.65, expr: 'neutral' } },
      { f: len, p: { ...basePose, x: JAKE_X, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, armR: { a: 70, b: 25 }, look: 0.5, yaw: 0.65, expr: 'neutral' } },
    ]);
    const face = faceAt(f, [[0, 'neutral']]);
    const zoom = kf(f, [[0, 1.0], [len, 1.12]]);
    const glow = kf(f, [[30, 0], [90, 1], [len, 1]]);
    const open = kf(f, [[45, 0], [105, 1], [len, 1]]);
    const rise = kf(f, [[60, 0], [120, 1], [len, 1]]);
    const shift = kf(f, [[150, 0], [210, 1], [len, 1]]);
    return (
      <g>
        <g transform={camT(960, 560, zoom)}>
          <FolderDesk folder="open" open={open} rise={rise} glow={glow} shift={shift} showFragments />
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...p, ...face, facing: 1 }} rimId="rimBlue" shadow={1} />)}
        </g>
      </g>
    );
  },
});

// S24 — A rat in a maze, in a thought bubble above Jake's head. The rat hears
// a tone and freezes. A scientist's hand reaches in with a tiny syringe.
// Camera: hold still.
// The bubble sits above Jake; inside it a simple maze (dark walls forming a
// path), a small WHITE rat frozen still in the lower corridor, tone arcs by
// its ear, and a large scientist's hand (white cuff + skin hand, not a full
// character) reaching in from the top edge of the bubble holding a tiny
// syringe pointed down at the rat. Jake stands below, head tilted up at it.
defineScene({
  id: 'S24',
  durationSec: DUR.S24,
  characters: [{ who: 'jake', x: 0.46, feetY: ROOM_FLOOR_V }],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const p = pose('S24', 'jake', f, [
      { f: 0, p: { ...basePose, x: JAKE_X, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, look: 0, headTilt: -0.15, tilt: -0.05, yaw: 0, expr: 'neutral' } },
      { f: len, p: { ...basePose, x: JAKE_X, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, look: 0, headTilt: -0.15, tilt: -0.05, yaw: 0, expr: 'neutral' } },
    ]);
    const face = faceAt(f, [[0, 'neutral']]);
    return (
      <g>
        <g transform={camT(960, 560, 1.0)}>
          <FolderDesk folder="closed" glow={0} />
          <g>
            <ellipse cx={960} cy={270} rx={390} ry={165} fill="#FFFFFF" stroke="#161616" strokeWidth={4} />
            <circle cx={900} cy={445} r={14} fill="#FFFFFF" stroke="#161616" strokeWidth={3} />
            <circle cx={872} cy={472} r={9} fill="#FFFFFF" stroke="#161616" strokeWidth={3} />
            <g stroke="#161616" strokeWidth={10} strokeLinecap="round" fill="none">
              <path d="M 680 215 H 1010" />
              <path d="M 1010 215 V 305" />
              <path d="M 800 305 H 1010" />
              <path d="M 800 305 V 375" />
              <path d="M 700 360 H 900" />
              <path d="M 1180 250 H 1270" />
            </g>
            <g>
              <path d="M 930 340 Q 890 352 880 330" stroke="#161616" strokeWidth={3} fill="none" strokeLinecap="round" />
              <ellipse cx={960} cy={340} rx={30} ry={17} fill="#FFFFFF" stroke="#161616" strokeWidth={3} />
              <circle cx={986} cy={330} r={13} fill="#FFFFFF" stroke="#161616" strokeWidth={3} />
              <circle cx={980} cy={318} r={5} fill="#FFFFFF" stroke="#161616" strokeWidth={2} />
              <circle cx={994} cy={316} r={5} fill="#FFFFFF" stroke="#161616" strokeWidth={2} />
              <circle cx={990} cy={328} r={2.5} fill="#161616" />
              <path d="M 1012 312 Q 1022 322 1012 332" stroke="#161616" strokeWidth={3} fill="none" strokeLinecap="round" />
              <path d="M 1020 306 Q 1034 322 1020 338" stroke="#161616" strokeWidth={3} fill="none" strokeLinecap="round" />
            </g>
            <g>
              <rect x={1100} y={92} width={100} height={100} fill="#F6F0E4" stroke="#161616" strokeWidth={3} />
              <line x1={1100} y1={186} x2={1200} y2={186} stroke="#161616" strokeWidth={3} />
              <ellipse cx={1150} cy={222} rx={56} ry={40} fill="#E8C39A" stroke="#161616" strokeWidth={3} />
              <circle cx={1112} cy={248} r={13} fill="#E8C39A" stroke="#161616" strokeWidth={3} />
              <circle cx={1138} cy={256} r={13} fill="#E8C39A" stroke="#161616" strokeWidth={3} />
              <circle cx={1164} cy={254} r={13} fill="#E8C39A" stroke="#161616" strokeWidth={3} />
              <g transform="rotate(35 1150 250)">
                <line x1={1150} y1={196} x2={1150} y2={222} stroke="#8A8578" strokeWidth={4} strokeLinecap="round" />
                <line x1={1138} y1={198} x2={1162} y2={198} stroke="#8A8578" strokeWidth={4} strokeLinecap="round" />
                <rect x={1142} y={222} width={16} height={56} fill="#FFFFFF" stroke="#161616" strokeWidth={3} />
                <line x1={1146} y1={238} x2={1154} y2={238} stroke="#161616" strokeWidth={2} />
                <line x1={1146} y1={254} x2={1154} y2={254} stroke="#161616" strokeWidth={2} />
                <line x1={1146} y1={270} x2={1154} y2={270} stroke="#161616" strokeWidth={2} />
                <line x1={1150} y1={278} x2={1150} y2={312} stroke="#8A8578" strokeWidth={3} strokeLinecap="round" />
              </g>
            </g>
          </g>
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...p, ...face, facing: 1 }} rimId="rimBlue" shadow={1} />)}
        </g>
      </g>
    );
  },
});

// S25 — The folder glows again. The fragments inside shift — the flash of
// light dims, the sound wave flattens. The shiver stays. Camera: hold still.
// Same desk + open folder as S23's end state, but the flash is dimmer and
// smaller, the sound-wave bars are flat and even, and the shiver is
// unchanged. The warm glow fades in again over the first 60 frames.
defineScene({
  id: 'S25',
  durationSec: DUR.S25,
  characters: [{ who: 'jake', x: 0.46, feetY: ROOM_FLOOR_V }],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const p = pose('S25', 'jake', f, [
      { f: 0, p: { ...basePose, x: JAKE_X, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, look: 0.5, yaw: 0.65, expr: 'neutral' } },
      { f: len, p: { ...basePose, x: JAKE_X, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, look: 0.5, yaw: 0.65, expr: 'neutral' } },
    ]);
    const face = faceAt(f, [[0, 'neutral']]);
    const glow = kf(f, [[0, 0.15], [60, 1], [len, 1]]);
    return (
      <g>
        <g transform={camT(960, 560, 1.0)}>
          <FolderDesk folder="open" open={1} rise={1} glow={glow} flashDim waveFlat={1} showFragments />
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...p, ...face, facing: 1 }} rimId="rimBlue" shadow={1} />)}
        </g>
      </g>
    );
  },
});

// S26 — Jake stares at the folder. A question mark forms above his head.
// Camera: slow push-in.
// Open folder as in S23's end state (bright flash, wavy wave, shiver). The
// "?" fades and scales in above Jake's head over frames 30-75, then holds.
defineScene({
  id: 'S26',
  durationSec: DUR.S26,
  characters: [{ who: 'jake', x: 0.46, feetY: ROOM_FLOOR_V }],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const p = pose('S26', 'jake', f, [
      { f: 0, p: { ...basePose, x: JAKE_X, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, look: 0.5, yaw: 0.65, expr: 'oops' } },
      { f: len, p: { ...basePose, x: JAKE_X, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, look: 0.5, yaw: 0.65, expr: 'oops' } },
    ]);
    const face = faceAt(f, [[0, 'oops']]);
    const zoom = kf(f, [[0, 1.0], [len, 1.12]]);
    const qOp = kf(f, [[30, 0], [75, 1], [len, 1]]);
    const qScale = kf(f, [[30, 0.5], [75, 1], [len, 1]]);
    return (
      <g>
        <g transform={camT(960, 560, zoom)}>
          <FolderDesk folder="open" open={1} rise={1} glow={1} showFragments />
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...p, ...face, facing: 1 }} rimId="rimBlue" shadow={1} />)}
          <g transform={`translate(${JAKE_X} 400) scale(${qScale}) translate(${-JAKE_X} -400)`} opacity={qOp}>
            <text x={JAKE_X} y={430} textAnchor="middle" fontFamily={FONT.title} fontSize={110} fontWeight={800} fill="#161616">?</text>
          </g>
        </g>
      </g>
    );
  },
});

// S27 — A small pill bottle on the table. Jake picks it up and reads the
// label. Camera: hold still.
// The folder sits closed at the far end of the desk; the bottle stands on
// the desk within Jake's reach. Jake's right arm rises (4 -> 100 over 105
// frames, one direction, then holds) and the bottle travels from the desk to
// his hand — its position is a blend of the desk spot and the live hand
// position, so it lands exactly in his hand and stays there at eye level
// while he reads the label.
defineScene({
  id: 'S27',
  durationSec: DUR.S27,
  characters: [{ who: 'jake', x: 0.46, feetY: ROOM_FLOOR_V }],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const p = pose('S27', 'jake', f, [
      { f: 0, p: { ...basePose, x: JAKE_X, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, armR: { a: 4, b: 8 }, look: 0, yaw: 0.65, expr: 'neutral' } },
      { f: 105, p: { ...basePose, x: JAKE_X, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, armR: { a: 100, b: 45 }, look: 0.5, yaw: 0.65, expr: 'neutral' } },
      { f: len, p: { ...basePose, x: JAKE_X, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, armR: { a: 100, b: 45 }, look: 0.5, yaw: 0.65, expr: 'neutral' } },
    ]);
    const face = faceAt(f, [[0, 'neutral']]);
    const lift = kf(f, [[75, 0], [135, 1], [len, 1]]);
    const hand = toWorld(p, joints(p, true).armR.end);
    const bx = 1120 + (hand.x + 14 - 1120) * lift;
    const by = (DESK_TOP - 55) + (hand.y - 48 - (DESK_TOP - 55)) * lift;
    return (
      <g>
        <g transform={camT(960, 560, 1.0)}>
          <FolderDesk folder="closed" folderX={1540} glow={0} />
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...p, ...face, facing: 1 }} rimId="rimBlue" shadow={1} />)}
          <PillBottle x={bx} y={by} />
        </g>
      </g>
    );
  },
});

// S28 — The folder closes. It looks the same from the outside. But the glow
// inside is dimmer. Camera: slow push-in.
// Closed folder, exactly as before it was opened — flat manila slab, same
// spot — with only a faint warm glow line at its front edge, far fainter
// than the S23/S25 glow. Jake stands beside it, looking at it.
defineScene({
  id: 'S28',
  durationSec: DUR.S28,
  characters: [{ who: 'jake', x: 0.46, feetY: ROOM_FLOOR_V }],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const p = pose('S28', 'jake', f, [
      { f: 0, p: { ...basePose, x: JAKE_X, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, look: 0.5, yaw: 0.65, expr: 'neutral' } },
      { f: len, p: { ...basePose, x: JAKE_X, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, look: 0.5, yaw: 0.65, expr: 'neutral' } },
    ]);
    const face = faceAt(f, [[0, 'neutral']]);
    const zoom = kf(f, [[0, 1.0], [len, 1.12]]);
    return (
      <g>
        <g transform={camT(960, 560, zoom)}>
          <FolderDesk folder="closed" glow={0.12} />
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...p, ...face, facing: 1 }} rimId="rimBlue" shadow={1} />)}
        </g>
      </g>
    );
  },
});

// ===========================================================================
// CHAPTER 5 — "The Memory That Never Happened"
// ===========================================================================

// S29 — Jake sits at the table telling a story to the camera — alone.
// Behind him the background changes in three phases: a dog, then a cat, then
// a clown on a bicycle. Jake never notices — he faces the camera the whole
// time. Camera: gentle pan right (centre 900 → 1020).
defineScene({
  id: 'S29',
  durationSec: DUR.S29,
  characters: [
    { who: 'jake', x: 0.33, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const { pj, faceJ, footJL, footJR } = tablePair('S29', f, len, [
      { f: 0, p: { ...basePose, x: 640, y: sitY(FLOOR_PX), scale: 1, ...SIT, armR: { a: 4, b: 8 }, expr: 'neutral', yaw: 0.65, look: 0.5 } },
      { f: 30, p: { ...basePose, x: 640, y: sitY(FLOOR_PX), scale: 1, ...SIT, armR: { a: 55, b: 25 }, expr: 'neutral', yaw: 0.65, look: 0.5 } },
      { f: len, p: { ...basePose, x: 640, y: sitY(FLOOR_PX), scale: 1, ...SIT, armR: { a: 55, b: 25 }, expr: 'neutral', yaw: 0.65, look: 0.5 } },
    ], 'neutral');
    const dogOp = kf(f, [[0, 1], [108, 1], [127, 0]]);
    const catOp = kf(f, [[108, 0], [127, 1], [236, 1], [255, 0]]);
    const clownOp = kf(f, [[236, 0], [255, 1], [len, 1]]);
    const panX = kf(f, [[0, 900], [len, 1020]]);
    return (
      <g>
        <g transform={camT(panX, 560, 1.0)}>
          <StoryTableBack />
          <Dog x={DOG_X} y={ANIMAL_Y} s={2.4} f={f} len={len} wave={false} opacity={dogOp} />
          <Cat x={CAT_X} y={ANIMAL_Y} s={2.4} f={f} len={len} wave={false} opacity={catOp} />
          <ClownBike x={CLOWN_X} y={ANIMAL_Y} s={2.2} f={f} len={len} wave={false} opacity={clownOp} />
          <StoryTableFront />
          {tableShadows(footJL, footJR)}
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...pj, ...faceJ, facing: 1 }} rimId="rimBlue" shadow={0} />)}
        </g>
      </g>
    );
  },
});

// S30 — Jake holds up a hand mirror himself (brass oval frame). In it, he
// sees HIMSELF telling a different version of the same story: a miniature
// Jake, facing the other way, his other arm raised high. That reflection is
// the ONLY character-copy in the video. Jake looks into the mirror, shocked.
// His right arm raises the mirror over the first 30 frames. Camera: hold
// still.
defineScene({
  id: 'S30',
  durationSec: DUR.S30,
  characters: [
    { who: 'jake', x: 0.33, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const { pj, faceJ, footJL, footJR } = tablePair('S30', f, len, [
      { f: 0, p: { ...basePose, x: 640, y: sitY(FLOOR_PX), scale: 1, ...SIT, armR: { a: 4, b: 8 }, expr: 'shock', yaw: 0.65, look: 0.5 } },
      { f: 30, p: { ...basePose, x: 640, y: sitY(FLOOR_PX), scale: 1, ...SIT, armR: { a: 45, b: 10 }, expr: 'shock', yaw: 0.65, look: 0.5 } },
      { f: len, p: { ...basePose, x: 640, y: sitY(FLOOR_PX), scale: 1, ...SIT, armR: { a: 45, b: 10 }, expr: 'shock', yaw: 0.65, look: 0.5 } },
    ], 'shock');
    // The mirror is held up by Jake's own raised right hand.
    const mg = toWorld(pj, joints(pj, true).armR.end);
    const mcx = mg.x;
    const mcy = mg.y - 118;
    return (
      <g>
        <g transform={camT(960, 560, 1.0)}>
          <StoryTableBack />
          <StoryTableFront />
          {tableShadows(footJL, footJR)}
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...pj, ...faceJ, facing: 1 }} rimId="rimBlue" shadow={0} />)}
          <defs>
            <clipPath id="s30MirrorClip">
              <ellipse cx={mcx} cy={mcy} rx={76} ry={100} />
            </clipPath>
          </defs>
          <g>
            <ellipse cx={mcx} cy={mcy} rx={76} ry={100} fill="#DCE8F5" />
            <ellipse cx={mcx} cy={mcy} rx={76} ry={100} fill={MOONLIGHT} opacity={0.3} />
            <g clipPath="url(#s30MirrorClip)">
              <polygon points={`${mcx - 70},${mcy - 100} ${mcx + 20},${mcy - 100} ${mcx - 70},${mcy + 10}`} fill="#FFFFFF" opacity={0.25} />
              <g>
                <path d={`M ${mcx - 4} ${mcy + 28} L ${mcx - 10} ${mcy + 58} M ${mcx + 8} ${mcy + 28} L ${mcx + 12} ${mcy + 58}`} stroke="#161616" strokeWidth={6} strokeLinecap="round" />
                <rect x={mcx - 12} y={mcy - 12} width={30} height={42} rx={8} fill="#C0392B" stroke="#161616" strokeWidth={2.5} />
                <path d={`M ${mcx - 8} ${mcy - 4} L ${mcx - 32} ${mcy - 52}`} stroke="#161616" strokeWidth={7} strokeLinecap="round" />
                <circle cx={mcx - 34} cy={mcy - 54} r={6} fill="#161616" />
                <path d={`M ${mcx + 16} ${mcy - 4} L ${mcx + 20} ${mcy + 22}`} stroke="#161616" strokeWidth={7} strokeLinecap="round" />
                <circle cx={mcx + 8} cy={mcy - 36} r={20} fill="#161616" />
                <ellipse cx={mcx - 2} cy={mcy - 40} rx={3.5} ry={5} fill="#F6EFE3" />
                <ellipse cx={mcx + 8} cy={mcy - 40} rx={3.5} ry={5} fill="#F6EFE3" />
              </g>
            </g>
            <ellipse cx={mcx} cy={mcy} rx={76} ry={100} fill="none" stroke="#B08D3E" strokeWidth={7} />
            <rect x={mcx - 6} y={mcy + 98} width={12} height={26} rx={4} fill="#B08D3E" stroke="#161616" strokeWidth={2} />
          </g>
        </g>
      </g>
    );
  },
});

// S31 — A classroom. A survey form on the teacher's desk. Five students sit
// at desks in two rows; four of the five raise their hands. Camera: slow
// pull back (zoom 1.12 → 1.0).
defineScene({
  id: 'S31',
  durationSec: DUR.S31,
  characters: [
    { who: 'students', x: 0.5, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const zoom = kf(f, [[0, 1.12], [len, 1.0]]);
    return (
      <g>
        <g transform={camT(960, 560, zoom)}>
          <ClassroomBack />
          {cast('students', <Students />)}
          <ClassroomDesks />
          <SurveyPapers opacity={1} />
        </g>
      </g>
    );
  },
});

// S32 — The survey forms turn into confetti: the papers fade out over 35
// frames while coloured paper pieces drift down through the air. The classroom
// plays with the students alone. Camera: hold still.
defineScene({
  id: 'S32',
  durationSec: DUR.S32,
  characters: [
    { who: 'students', x: 0.5, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const papersOp = kf(f, [[0, 1], [60, 1], [95, 0]]);
    return (
      <g>
        <g transform={camT(960, 560, 1.0)}>
          <ClassroomBack />
          {cast('students', <Students />)}
          <ClassroomDesks />
          <SurveyPapers opacity={papersOp} />
          <Confetti f={f} len={len} />
        </g>
      </g>
    );
  },
});

// S33 — Jake looks at the dog, the cat, the clown. They are all there side by
// side, all waving. He turns toward them and waves back, confused ('oops').
// Camera: hold still.
defineScene({
  id: 'S33',
  durationSec: DUR.S33,
  characters: [
    { who: 'jake', x: 0.33, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const { pj, faceJ, footJL, footJR } = tablePair('S33', f, len, [
      { f: 0, p: { ...basePose, x: 640, y: sitY(FLOOR_PX), scale: 1, ...SIT, armR: { a: 4, b: 8 }, expr: 'oops', yaw: 0.65, look: 0.5 } },
      { f: 30, p: { ...basePose, x: 640, y: sitY(FLOOR_PX), scale: 1, ...SIT, armR: { a: 120, b: 30 }, expr: 'oops', yaw: 0.65, look: 0.5 } },
      { f: len, p: { ...basePose, x: 640, y: sitY(FLOOR_PX), scale: 1, ...SIT, armR: { a: 120, b: 30 }, expr: 'oops', yaw: 0.65, look: 0.5 } },
    ], 'oops');
    return (
      <g>
        <g transform={camT(960, 560, 1.0)}>
          <StoryTableBack />
          <Dog x={DOG_X} y={ANIMAL_Y} s={2.4} f={f} len={len} wave={true} opacity={1} />
          <Cat x={CAT_X} y={ANIMAL_Y} s={2.4} f={f} len={len} wave={true} opacity={1} />
          <ClownBike x={CLOWN_X} y={ANIMAL_Y} s={2.2} f={f} len={len} wave={true} opacity={1} />
          <StoryTableFront />
          {tableShadows(footJL, footJR)}
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...pj, ...faceJ, facing: 1 }} rimId="rimBlue" shadow={0} />)}
        </g>
      </g>
    );
  },
});

// S34 — Jake erases the clown from the scene: his hand reaches toward it and
// the clown fades out over 30 frames. The dog (and the cat) stay. Jake nods
// slowly — two nods, 35 frames down and 35 up each. Camera: slow push-in.
defineScene({
  id: 'S34',
  durationSec: DUR.S34,
  characters: [
    { who: 'jake', x: 0.33, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const { pj, faceJ, footJL, footJR } = tablePair('S34', f, len, [
      { f: 0, p: { ...basePose, x: 640, y: sitY(FLOOR_PX), scale: 1, ...SIT, armR: { a: 4, b: 8 }, expr: 'neutral', yaw: 0.65, look: 0.5 } },
      { f: 30, p: { ...basePose, x: 640, y: sitY(FLOOR_PX), scale: 1, ...SIT, armR: { a: 70, b: 0 }, expr: 'neutral', yaw: 0.65, look: 0.5 } },
      { f: len, p: { ...basePose, x: 640, y: sitY(FLOOR_PX), scale: 1, ...SIT, armR: { a: 70, b: 0 }, expr: 'neutral', yaw: 0.65, look: 0.5 } },
    ], 'neutral');
    const clownOp = kf(f, [[0, 1], [45, 1], [75, 0]]);
    const nod = kf(f, [[0, 0], [90, 0], [125, 9], [160, 0], [195, 9], [230, 0], [len, 0]]);
    const zoom = kf(f, [[0, 1.0], [len, 1.12]]);
    return (
      <g>
        <g transform={camT(960, 560, zoom)}>
          <StoryTableBack />
          <Dog x={DOG_X} y={ANIMAL_Y} s={2.4} f={f} len={len} wave={false} opacity={1} />
          <Cat x={CAT_X} y={ANIMAL_Y} s={2.4} f={f} len={len} wave={false} opacity={1} />
          <ClownBike x={CLOWN_X} y={ANIMAL_Y} s={2.2} f={f} len={len} wave={false} opacity={clownOp} />
          <StoryTableFront />
          {tableShadows(footJL, footJR)}
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...pj, ...faceJ, facing: 1, headTilt: nod }} rimId="rimBlue" shadow={0} />)}
        </g>
      </g>
    );
  },
});

// ===========================================================================
// CHAPTER 6 — "The First Three Years"
// ===========================================================================

// S35 — A baby's room. A crib. A mobile turning slowly. Jake stands in the
// doorway, too big for the room. Camera: slow pull back.
defineScene({
  id: 'S35',
  durationSec: DUR.S35,
  characters: [{ who: 'jake', x: 0.9, feetY: ROOM_FLOOR_V }],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const p = pose('S35', 'jake', f, [
      { f: 0, p: { ...basePose, x: 1730, y: standY(1.15, ROOM_FLOOR_V), scale: 1.15, ...STAND, expr: 'neutral', yaw: -0.35, headTilt: 4 } },
      { f: len, p: { ...basePose, x: 1730, y: standY(1.15, ROOM_FLOOR_V), scale: 1.15, ...STAND, expr: 'neutral', yaw: -0.35, headTilt: 4 } },
    ]);
    const face = faceAt(f, [[0, 'neutral']]);
    const zoom = kf(f, [[0, 1.12], [len, 1.0]]);
    // Mobile sways gently (±5°). The old 0→80° in-plane rotation tilted the
    // whole mobile diagonally and read as knocked askew, not turning.
    const mobileAngle = kf(f, [[0, -5], [len / 2, 5], [len, -5]]);
    return (
      <g>
        <g transform={camT(960, 560, zoom)}>
          <BabyRoom mobileAngle={mobileAngle} />
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...p, ...face, facing: -1 }} rimId="rimBlue" shadow={1} />)}
        </g>
      </g>
    );
  },
});

// S36 — Inside Jake's head: a garden. New green shoots keep sprouting and
// pushing the old plants aside. Camera: gentle pan right. No characters.
defineScene({
  id: 'S36',
  durationSec: DUR.S36,
  characters: [],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const cx = kf(f, [[0, 900], [len, 1060]]);
    return (
      <g>
        <g transform={camT(cx, 560, 1.0)}>
          <HeadGarden f={f} len={len} />
        </g>
      </g>
    );
  },
});

// S37 — A toddler Jake plays with blocks. The blocks spell a word. The word
// fades as new blocks pile on top. Camera: hold still.
defineScene({
  id: 'S37',
  durationSec: DUR.S37,
  characters: [{ who: 'jake', x: 0.33, feetY: ROOM_FLOOR_V }],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const p = pose('S37', 'jake', f, [
      { f: 0, p: { ...basePose, x: 640, y: sitY(FLOOR_PX, 0.5), scale: 0.5, ...SIT, armR: { a: 55, b: 15 }, expr: 'neutral', yaw: 0.4, look: 0.3 } },
      { f: len, p: { ...basePose, x: 640, y: sitY(FLOOR_PX, 0.5), scale: 0.5, ...SIT, armR: { a: 55, b: 15 }, expr: 'neutral', yaw: 0.4, look: 0.3 } },
    ]);
    const face = faceAt(f, [[0, 'neutral']]);
    const j = joints(p, true);
    const footL = { x: p.x + j.legL.end.x, y: p.y + j.legL.end.y + 11 };
    const footR = { x: p.x + j.legR.end.x, y: p.y + j.legR.end.y + 11 };
    return (
      <g>
        <g transform={camT(960, 560, 1.0)}>
          <BlocksFloor f={f} len={len} />
          <ellipse cx={footL.x} cy={footL.y + 2} rx={12} ry={4} fill="#000" opacity={0.35} />
          <ellipse cx={footR.x} cy={footR.y + 2} rx={12} ry={4} fill="#000" opacity={0.35} />
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...p, ...face, facing: 1 }} rimId="rimBlue" shadow={0} />)}
        </g>
      </g>
    );
  },
});

// S38 — The photo album. Large open album on a table, two pages visible.
// First pages blank; photos start around age four on the right-hand page.
// Jake stands beside the album, looking down at it, 'sad'.
defineScene({
  id: 'S38',
  durationSec: DUR.S38,
  characters: [{ who: 'jake', x: 0.16, feetY: ROOM_FLOOR_V }],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const p = pose('S38', 'jake', f, [
      { f: 0, p: { ...basePose, x: 300, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, expr: 'sad', yaw: 0.5, headTilt: 6 } },
      { f: len, p: { ...basePose, x: 300, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, expr: 'sad', yaw: 0.5, headTilt: 6 } },
    ]);
    const face = faceAt(f, [[0, 'sad']]);
    const zoom = kf(f, [[0, 1.0], [len, 1.12]]);
    return (
      <g>
        <g transform={camT(960, 560, zoom)}>
          <AlbumRoom />
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...p, ...face, facing: 1 }} rimId="rimBlue" shadow={1} />)}
        </g>
      </g>
    );
  },
});

// S39 — The album again, both pages blank. Jake stands alone, looking down
// at the blank pages, 'sad'. No one stands beside him.
defineScene({
  id: 'S39',
  durationSec: DUR.S39,
  characters: [
    { who: 'jake', x: 0.15, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const p = pose('S39', 'jake', f, [
      { f: 0, p: { ...basePose, x: 280, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, expr: 'sad', yaw: 0.5, headTilt: 6 } },
      { f: len, p: { ...basePose, x: 280, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, expr: 'sad', yaw: 0.5, headTilt: 6 } },
    ]);
    const faceJ = faceAt(f, [[0, 'sad']]);
    return (
      <g>
        <g transform={camT(960, 560, 1.0)}>
          <AlbumRoom blankSpread />
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...p, ...faceJ, facing: 1 }} rimId="rimBlue" shadow={1} />)}
        </g>
      </g>
    );
  },
});

// ===========================================================================
// CLOSE
// ===========================================================================

// The thought bubble: a cloud of overlapping circles + a centre rect, drawn
// twice — once in dark, scaled 1.045 about the cloud centre, then in cream on
// top — so the union silhouette carries one clean dark outline with no
// internal seams (overlapping stroked circles would show their arcs inside).
const BUBBLE_CX = 1210;
const BUBBLE_CY = 385;
const CloudShape: React.FC<{ fill: string }> = ({ fill }) => (
  <g fill={fill}>
    <rect x={1000} y={320} width={460} height={200} />
    <circle cx={980} cy={420} r={90} />
    <circle cx={1065} cy={315} r={100} />
    <circle cx={1210} cy={275} r={110} />
    <circle cx={1360} cy={305} r={100} />
    <circle cx={1465} cy={410} r={88} />
    <circle cx={1410} cy={505} r={85} />
    <circle cx={1230} cy={525} r={92} />
    <circle cx={1050} cy={505} r={85} />
  </g>
);

// S40 — Night. Jake lies in bed. The room is calm. The clock reads 3:00 AM
// again. But Jake is asleep. Camera: slow push-in.
// Jake asleep in bed (inline LyingJake silhouette — the rig has no lying
// pose). Clock 3:00 AM + lamp OFF come free with NightBedroom. No Hero, no
// mouth, nothing moves except the camera.
defineScene({
  id: 'S40',
  durationSec: DUR.S40,
  characters: [
    { who: 'jake', x: 0.32, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const zoom = kf(f, [[0, 1.0], [len, 1.12]]);
    return (
      <g>
        <g transform={camT(960, 560, zoom)}>
          <NightBedroom t={f} />
          {cast('jake', <LyingJake />)}
        </g>
      </g>
    );
  },
});

// S41 — Jake lies asleep in bed. The empty thought bubble from the cold
// open appears beside him — and this time, a small lime-green sprout grows
// inside it. Camera: hold still. The THOUGHT BUBBLE + SPROUT is the focal
// element. Jake lies asleep in bed in the background, drawn as a simple
// inline silhouette (the rig has no lying pose — NO Hero for sleeping Jake).
defineScene({
  id: 'S41',
  durationSec: DUR.S41,
  characters: [
    { who: 'jake', x: 0.32, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    // The sprout grows from nothing to full over the first 30 frames (>=15),
    // then holds for the rest of the 19.2s scene.
    const sprout = kf(f, [[0, 0], [30, 1]]);
    return (
      <g>
        <g transform={camT(960, 560, 1.0)}>
          <NightBedroom t={f} />
          {/* Sleeping Jake — inline silhouette, lying in bed (NO Hero: the rig
              has no lying pose). Round black head resting on the pillow at the
              bed's left end, closed eyes as two short white curves, moonlight
              rim on the head's upper edge; body a low mound under the purple
              blanket (same purple as the set's blanket, so it reads as one
              blanket over him). Head bottom (782) sits just above the
              mattress top (787); the mound sits on the mattress, never
              floating above it. */}
          {/* Sleeping Jake — the shared LyingJake drawing (same as S40/S42,
              so Jake never jumps between cuts). */}
          {cast('jake', <LyingJake />)}
          {/* The thought bubble — the focal element, centre-right of frame.
              Dark under-layer (scaled 1.045) + cream cloud on top, then two
              small trailing circles drifting down-left toward sleeping Jake. */}
          <g transform={`translate(${BUBBLE_CX} ${BUBBLE_CY}) scale(1.045) translate(${-BUBBLE_CX} ${-BUBBLE_CY})`}>
            <CloudShape fill="#161616" />
          </g>
          <CloudShape fill="#F6EFE3" />
          <circle cx={960} cy={600} r={20} fill="#F6EFE3" stroke="#161616" strokeWidth={3} />
          <circle cx={890} cy={655} r={13} fill="#F6EFE3" stroke="#161616" strokeWidth={3} />
          {/* The sprout — lime green, the focal element's accent: two leaves
              + a stem, growing from its base (1210, 480) over 30 frames. */}
          <g transform={`translate(1210 480) scale(${sprout}) translate(-1210 -480)`}>
            <path d="M 1210 480 Q 1206 430 1210 385" stroke={LIME} strokeWidth={9} fill="none" strokeLinecap="round" />
            <path d="M 1210 392 Q 1160 350 1108 360 Q 1150 396 1210 392 Z" fill={LIME} stroke="#161616" strokeWidth={3} strokeLinejoin="round" />
            <path d="M 1210 392 Q 1260 350 1312 360 Q 1270 396 1210 392 Z" fill={LIME} stroke="#161616" strokeWidth={3} strokeLinejoin="round" />
          </g>
        </g>
      </g>
    );
  },
});

// S42 — Jake sleeps peacefully. Camera: slow pull back.
// Same lying-Jake drawing as S40/S41. Jake alone in the room.
defineScene({
  id: 'S42',
  durationSec: DUR.S42,
  characters: [
    { who: 'jake', x: 0.32, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const zoom = kf(f, [[0, 1.12], [len, 1.0]]);
    return (
      <g>
        <g transform={camT(960, 560, zoom)}>
          <NightBedroom t={f} />
          {cast('jake', <LyingJake />)}
        </g>
      </g>
    );
  },
});

// S43 — END CARD: the shared EndCard (Inkl logo + "Curiosity. Explained." +
// Subscribe button) plus a lime-green accent drawn in THIS scene only — the
// shared EndCard component is never modified. No characters, no set, no
// narration. Camera: hold still.
defineScene({
  id: 'S43',
  durationSec: DUR.S43,
  characters: [],
  fn: () => {
    return (
      <g>
        <g transform={camT(960, 560, 1.0)}>
          <EndCard />
          {/* Lime accent — soft glow behind the logo (low opacity so it never
              washes the hand-lettered logo out) + a thin lime line under the
              button. */}
          <ellipse cx={960} cy={400} rx={360} ry={140} fill={LIME} opacity={0.1} />
          <rect x={860} y={772} width={200} height={6} rx={3} fill={LIME} />
        </g>
      </g>
    );
  },
});

// ---------------------------------------------------------------------------
// Registry helpers — the timeline is DERIVED from these durations, never
// hand-written.
// ---------------------------------------------------------------------------

export const zenn006Scenes = (): SceneDef[] =>
  getScenes().filter((s) => s.id !== 'S53-example' && /^S\d+$/.test(s.id));

export const zenn006Timeline = (fps = FPS) => {
  let frame = 0;
  return zenn006Scenes().map((s) => {
    const len = Math.round(s.durationSec * fps);
    const shot = { id: s.id, first: frame, len, durationSec: s.durationSec };
    frame += len;
    return shot;
  });
};

export const zenn006TotalSec = () => zenn006Scenes().reduce((sum, s) => sum + s.durationSec, 0);

// Adapter: a scene def becomes an episode Shot (ShotProps clock in frames).
export const sceneToShot = (def: SceneDef): React.FC<ShotProps> => {
  const Shot: React.FC<ShotProps> = ({ t, len }) => {
    setCurrentScene(def.id);
    const floorY = def.characters[0]?.feetY ?? ROOM_FLOOR_V;
    return def.fn({ t: t / FPS, duration: def.durationSec, floorY, frame: t, fps: FPS });
  };
  return Shot;
};

export const zenn006Shots = (): Record<string, React.FC<ShotProps>> => {
  const out: Record<string, React.FC<ShotProps>> = {};
  for (const def of zenn006Scenes()) out[def.id] = sceneToShot(def);
  return out;
};
