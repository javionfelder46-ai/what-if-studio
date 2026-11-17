// "The Shadow That Warns You" — an original 9-panel storyboard, built as REAL
// Remotion scenes through the rig. NO drawing scripts, NO simple SVG shapes:
// every panel is a frame from this episode (render the ShadowWarnsBoard
// composition, frames 0-8, one panel per beat).
//
// STORY: a stickman's shadow reacts to danger BEFORE he sees it. It flinches,
// it points, it pulls back. He ignores it all day — until it yanks him back
// from stepping into traffic, and he finally understands: the shadow is his
// instinct, and it knew first.
//
// LOOK (locked): the MAN is a pure BLACK SILHOUETTE stick man — round solid
// black head, thin black stick limbs, NO face (no eyes, no mouth, no brows),
// black torso. The SHADOW is a second character with the same geometry in
// dark grey-blue (#2E3448) with soft blurred edges, moving independently —
// its own pose and position in every beat. It is NEVER a ground blob.
// Light direction always matches its source: sunset low-right (S1, S9),
// streetlamp overhead (S2, S6, S7), ceiling light (S3), warm lamp (S4, S8).
// Every set is a full world: gradient sky, visible light source + real pool
// of light, haze, dust, vignette. Miko style, approved Nov 15.

import React from 'react';
import {
  Hero, basePose, poseAt, faceAt, kf, camT, lerp, clamp, LOOKS,
  FONT, MOONLIGHT, ShotProps, joints, toWorld,
  RealDefs, WindowShaft, AtmoHaze, Vignette, GlowDisc, SoftShadow, Dust,
  Glow, LightVeil, Cone,
} from '../../engine';
import {
  defineScene, getScenes, SceneDef,
} from '../../engine/sceneBuilder';
import type { Expr, Limb, Pose, Look } from '../../engine/rig';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const FPS = 30;
export const CREAM = '#F6EFE3';
export const INK = '#161616';
// Floor lines (v coordinate, 0..1 in the 1920x1080 world). Street/room sets:
// feet at 876 -> v = 0.811. Slim build: hip height at scale 1 is 876 - 158 = 718.
export const ROOM_FLOOR_V = 0.811;
export const FLOOR_PX = 876;
/** Hip y (px) for a character of `scale` standing with feet on floor v. Slim leg length 158. */
export const standY = (scale: number, floorV: number) => floorV * 1080 - 158 * scale;
/** Hip y for a SEATED character whose feet plant on the ground: hip sits one
    shin below the seat line; the SIT angles (a=82, b=-82) drop the foot to
    hip + 89, overlapping the ground. */
export const sitY = (floorYPx: number, scale = 1) => floorYPx - 89 * scale;

// ---------------------------------------------------------------------------
// Guard instrumentation — mirrors zenn-009 so the build-time checks run the
// same way on this episode's real key arrays and cast.
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
// shot; pick from the catalog and hold it. Angles: 0 = limb hangs straight
// down, 90 = horizontal forward, 180 = straight up (rig joints math).
// ---------------------------------------------------------------------------

export const STAND = { armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 }, look: 0, headTilt: 0, tilt: 0 };
// SIT — the rig's shin angle is RELATIVE (a2 = a + b), so a vertical shin needs
// a + b = 0. {a:82, b:-82}: thigh slopes 8 deg below horizontal, shin perfectly
// vertical, foot lands at hip + 89 — overlapping the ground, never hovering.
export const SIT = { armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 82, b: -82 }, legR: { a: 82, b: -82 }, look: 0, headTilt: 0, tilt: 0 };
export const WALK = { armL: { a: 18, b: 12 }, armR: { a: -14, b: 12 }, legL: { a: 28, b: -18 }, legR: { a: -22, b: 24 }, look: 0, headTilt: 0, tilt: 0 };
// POINT — one arm straight out, horizontal, index finger out (handR 'point').
export const POINT = { armL: { a: 4, b: 8 }, armR: { a: 88, b: 2 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 }, look: 0, headTilt: 0, tilt: 0 };
// FLINCH — both arms thrown up in front of the face, body leaning away.
export const FLINCH = { armL: { a: 150, b: 25 }, armR: { a: 155, b: 20 }, legL: { a: 12, b: -8 }, legR: { a: -18, b: 14 }, look: 0, headTilt: -8, tilt: -12 };
// WAVE — right arm high and OUT to the side (a 140 clears the head so the
// raised hand reads), open hand, calling for attention.
export const WAVE = { armL: { a: 4, b: 8 }, armR: { a: 140, b: 20 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 }, look: 0, headTilt: 0, tilt: 0 };
// PULLBACK — braced wide, leaning away, both arms reaching back toward the man.
export const PULLBACK = { armL: { a: 72, b: 12 }, armR: { a: 78, b: 8 }, legL: { a: 26, b: -6 }, legR: { a: -30, b: 10 }, look: 0, headTilt: 0, tilt: -14 };
// SLIP — body tilted hard, arms flailing up, legs split mid-fall.
export const SLIP = { armL: { a: 145, b: 20 }, armR: { a: 158, b: 12 }, legL: { a: 34, b: -12 }, legR: { a: -32, b: 34 }, look: 0, headTilt: -10, tilt: 20 };

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

// ---------------------------------------------------------------------------
// Looks — the man is a PURE black silhouette WITH A FACE (white oval eyes +
// brows, mood-matched per beat; NO mouth when silent — slim renders no static
// mouth, it appears only while speaking). The shadow is the same geometry in
// dark grey-blue with soft edges (blurred at render) and a SOFTER white face.
// The stranger is a black silhouette too, with a dark teal jacket and a
// readable smug face (white features). Faces use the rig (ink = look.face)
// plus the opt-in `brows` prop — see rig.tsx (Nov 16, Javion: "put faces on
// the stick man").
// ---------------------------------------------------------------------------

export const MAN_LOOK: Look = {
  skin: '#161616', skinShade: '#2A2A2A', hand: '#161616',
  jacket: '#161616', jacketShade: '#0E0E0E', accent: '#161616',
  limb: '#161616', line: '#000000', shoe: '#161616', face: '#FFFFFF',
  sleeve: 'tshirt',
};
export const SHADOW_LOOK: Look = {
  skin: '#2E3448', skinShade: '#252A3A', hand: '#2E3448',
  jacket: '#2E3448', jacketShade: '#232838', accent: '#2E3448',
  limb: '#2E3448', line: '#1A1E2E', shoe: '#2E3448', face: '#C9D4EA',
  sleeve: 'tshirt',
};
export const STRANGER_LOOK: Look = {
  skin: '#161616', skinShade: '#2A2A2A', hand: '#161616',
  jacket: '#2E5A52', jacketShade: '#22443E', accent: '#22443E',
  limb: '#2A2A2A', line: '#000000', shoe: '#161616', face: '#FFFFFF',
  sleeve: 'tshirt',
};

/** The shadow figure, rendered with soft blurred edges — a living character,
    never a ground blob. Wrap the Hero in this. */
export const ShadowFig: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <g>
    {/* soft edge glow — a blurred copy behind, so the shadow reads as a living
        character with its own faint blue aura, never a flat blob */}
    <g filter="url(#swGlow)" opacity={0.55}>{children}</g>
    <g filter="url(#swBlur)" opacity={0.94}>{children}</g>
    <defs>
      <filter id="swBlur" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation={1.4} />
      </filter>
      <filter id="swGlow" x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation={7} />
      </filter>
    </defs>
  </g>
);

/** Subtle film grain — feTurbulence noise over the whole frame, so the image
    reads as film, not flat vector. Keep opacity low (0.04–0.06). */
export const FilmGrain: React.FC<{ id: string; o?: number }> = ({ id, o = 0.05 }) => (
  <g opacity={o}>
    <defs>
      <filter id={`${id}grain`}>
        <feTurbulence type="fractalNoise" baseFrequency={0.9} numOctaves={2} stitchTiles="stitch" />
        <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.6 0" />
      </filter>
    </defs>
    <rect x={0} y={0} width={1920} height={1080} filter={`url(#${id}grain)`} />
  </g>
);

/** Minimal motion-graphics cue: a small glowing "!" above a character's head
    (the shadow warning, the man realising). Miko-style: one mark, no clutter. */
export const WarnMark: React.FC<{ x: number; y: number; size?: number }> = ({ x, y, size = 44 }) => (
  <g>
    <GlowDisc cx={x} cy={y} r={size} color="#FFE9A8" o={0.5} />
    <text x={x} y={y + size * 0.36} textAnchor="middle" fontFamily={FONT.ui} fontSize={size} fontWeight={700} fill="#FFE9A8">!</text>
  </g>
);

// ---------------------------------------------------------------------------
// Sets — each a full world, following the CityStreet pattern (gradient sky,
// visible light source + real pool, skyline in two depths, lit windows,
// trees, pavement detail, haze, dust, vignette). Light always slants the
// way its source dictates.
// ---------------------------------------------------------------------------

/** Sunset street — deep purple sky melting into orange at the horizon, a big
    low sun, hazy skyline, lit windows, trees, pavement with joints + puddle
    + leaves, streetlamps just warming up. S1 and S9. */
export const SunsetStreet: React.FC<{ t: number; id?: string; sunX?: number; sunY?: number }> = ({ t, id = 'ss', sunX = 1420, sunY = 560 }) => (
  <g>
    <defs>
      <linearGradient id={`${id}sky`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#1A1438" />
        <stop offset="30%" stopColor="#4A2350" />
        <stop offset="52%" stopColor="#8A3A6E" />
        <stop offset="72%" stopColor="#C85A46" />
        <stop offset="88%" stopColor="#FF9A3D" />
        <stop offset="100%" stopColor="#FFB25E" />
      </linearGradient>
      <linearGradient id={`${id}pave`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#6E5878" />
        <stop offset="100%" stopColor="#4A3852" />
      </linearGradient>
      <linearGradient id={`${id}road`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#2E2A33" />
        <stop offset="100%" stopColor="#17141C" />
      </linearGradient>
    </defs>
    <rect x={0} y={0} width={1920} height={880} fill={`url(#${id}sky)`} />
    {/* the light source — a low sun with a real glow */}
    <Glow x={sunX} y={sunY} r={820} o={0.9} />
    <GlowDisc cx={sunX} cy={sunY} r={320} color="#FFB25E" o={0.5} />
    <GlowDisc cx={sunX} cy={sunY} r={180} color="#FF9A3D" o={0.6} />
    <circle cx={sunX} cy={sunY} r={90} fill="#FF9A3D" opacity={0.98} />
    <circle cx={sunX} cy={sunY} r={96} fill="none" stroke="#FFE2B0" strokeWidth={3} opacity={0.7} />
    <circle cx={sunX} cy={sunY} r={130} fill="none" stroke="#FFB25E" strokeWidth={2} opacity={0.35} />
    <ellipse cx={sunX} cy={820} rx={900} ry={90} fill="#FF9A3D" opacity={0.35} />
    {/* clouds, drifting slowly — three depths: high faint, mid bright, low warm-lit */}
    <g fill="#FFFFFF" opacity={0.22}>
      <ellipse cx={((t * 0.25 + 600) % 2200) - 140} cy={70} rx={180} ry={20} />
      <ellipse cx={((t * 0.25 + 1400) % 2200) - 140} cy={90} rx={140} ry={16} />
    </g>
    <g fill="#FFFFFF" opacity={0.4}>
      <ellipse cx={((t * 0.4 + 300) % 2200) - 140} cy={150} rx={130} ry={26} />
      <ellipse cx={((t * 0.4 + 300) % 2200) - 110} cy={140} rx={80} ry={18} opacity={0.7} />
      <ellipse cx={((t * 0.3 + 900) % 2200) - 140} cy={210} rx={100} ry={20} />
      <ellipse cx={((t * 0.5 + 1600) % 2200) - 140} cy={110} rx={150} ry={30} />
    </g>
    <g fill="#FFB25E" opacity={0.35}>
      <ellipse cx={((t * 0.35 + 200) % 2200) - 140} cy={330} rx={170} ry={18} />
      <ellipse cx={((t * 0.35 + 1200) % 2200) - 140} cy={360} rx={120} ry={14} />
    </g>
    {/* birds — life in the sky */}
    <g stroke="#1E2438" strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.7}>
      <path d={`M ${((t * 0.8 + 400) % 2200) - 140} 260 q 10 -10 20 0 q 10 -10 20 0`} />
      <path d={`M ${((t * 0.8 + 900) % 2200) - 140} 300 q 8 -8 16 0 q 8 -8 16 0`} />
      <path d={`M ${((t * 0.8 + 1500) % 2200) - 140} 230 q 10 -10 20 0 q 10 -10 20 0`} />
      <path d={`M ${((t * 0.6 + 200) % 2200) - 140} 190 q 9 -9 18 0 q 9 -9 18 0`} />
      <path d={`M ${((t * 0.9 + 1200) % 2200) - 140} 340 q 8 -8 16 0 q 8 -8 16 0`} />
      <path d={`M ${((t * 0.7 + 1800) % 2200) - 140} 280 q 10 -10 20 0 q 10 -10 20 0`} />
    </g>
    {/* skyline, far depth — hazy silhouettes */}
    <g fill="#4A3A63" opacity={0.85}>
      <rect x={-40} y={420} width={260} height={460} />
      <rect x={240} y={360} width={200} height={520} />
      <rect x={480} y={450} width={300} height={430} />
      <rect x={820} y={380} width={220} height={500} />
      <rect x={1080} y={440} width={280} height={440} />
      <rect x={1400} y={360} width={220} height={520} />
      <rect x={1660} y={430} width={300} height={450} />
      <rect x={110} y={480} width={110} height={400} />
      <rect x={1240} y={500} width={130} height={380} />
    </g>
    <rect x={0} y={780} width={1920} height={100} fill="#5A4A6E" opacity={0.65} />
    <rect x={0} y={800} width={1920} height={60} fill="#FF9A3D" opacity={0.08} />
    {/* rooftop details — water towers, antennas, beacon */}
    <g fill="#3E3255" opacity={0.9}>
      <rect x={300} y={320} width={8} height={40} />
      <circle cx={560} cy={428} r={22} />
      <rect x={552} y={446} width={16} height={14} />
      <path d="M 538 428 L 560 406 L 582 428 Z" />
      <rect x={896} y={340} width={8} height={40} />
      <circle cx={1474} cy={312} r={6} fill="#FF9A3D" opacity={0.9} />
      <rect x={120} y={396} width={36} height={24} />
      <rect x={1450} y={336} width={30} height={24} />
      <rect x={1720} y={406} width={8} height={24} />
      <circle cx={1160} cy={418} r={18} />
      <rect x={1152} y={432} width={16} height={12} />
      <path d="M 1142 418 L 1160 400 L 1178 418 Z" />
      <circle cx={1840} cy={388} r={5} fill="#FFD39A" opacity={0.9} />
    </g>
    {/* skyline, mid depth — lit windows */}
    <g fill="#33284A">
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
      const lit = i % 2 === 0;
      const cool = i % 5 === 2;
      const flicker = i === 10 ? 0.55 + 0.4 * Math.sin(t * 0.3) : 1;
      const col = cool ? '#CFE8FF' : '#FFD39A';
      return (
        <g key={i} opacity={flicker}>
          {lit ? <GlowDisc cx={x + 10} cy={y + 14} r={26} color={col} o={0.5} /> : null}
          <rect x={x} y={y} width={20} height={28} fill={lit ? col : '#3A4A6A'} opacity={lit ? 0.95 : 0.7} />
          <rect x={x} y={y} width={20} height={4} fill="#FFFFFF" opacity={0.25} />
        </g>
      );
    })}
    {/* near depth — a brick building with a storefront + awning, left; a
        glass-front shop, right. */}
    <g>
      <rect x={-20} y={600} width={420} height={276} fill="#4A3440" stroke="#241A26" strokeWidth={5} />
      {[640, 690, 740, 790].map((y) => (
        <path key={y} d={`M -20 ${y} L 400 ${y}`} stroke="#3A2832" strokeWidth={2} opacity={0.7} />
      ))}
      <rect x={30} y={660} width={120} height={150} fill="#FFD39A" opacity={0.9} stroke="#241A26" strokeWidth={4} />
      <path d="M 90 660 L 90 810 M 30 735 L 150 735" stroke="#241A26" strokeWidth={4} />
      <polygon points="20,640 400,640 380,600 40,600" fill="#C0392B" stroke="#241A26" strokeWidth={3} />
      <text x={210} y={632} textAnchor="middle" fontFamily={FONT.ui} fontSize={22} fill="#F6EFE3">CORNER SHOP</text>
      <rect x={1560} y={620} width={380} height={256} fill="#2E2A3A" stroke="#241A26" strokeWidth={5} />
      <rect x={1590} y={660} width={320} height={140} fill="#3A4A6A" opacity={0.9} stroke="#241A26" strokeWidth={4} />
      <path d="M 1750 660 L 1750 800 M 1590 730 L 1910 730" stroke="#241A26" strokeWidth={4} />
      <polygon points="1560,650 1940,650 1920,612 1580,612" fill="#3E8C86" stroke="#241A26" strokeWidth={3} />
      <GlowDisc cx={1750} cy={700} r={80} color="#FF6A9A" o={0.5} />
      <text x={1750} y={708} textAnchor="middle" fontFamily={FONT.ui} fontSize={26} fontWeight={700} fill="#FF9AB8">OPEN</text>
      <GlowDisc cx={90} cy={735} r={100} color="#FFD39A" o={0.4} />
    </g>
    {/* trees — layered foliage, sunlit side, dappled light below */}
    <g>
      <rect x={700} y={700} width={16} height={176} fill="#3A2A1E" />
      <rect x={704} y={700} width={5} height={176} fill="#5A4632" opacity={0.8} />
      <circle cx={708} cy={660} r={70} fill="#2E4A2E" />
      <circle cx={660} cy={700} r={46} fill="#38583A" />
      <circle cx={758} cy={700} r={46} fill="#334F34" />
      <circle cx={748} cy={640} r={34} fill="#3E5A3A" />
      <path d="M 770 620 A 70 70 0 0 1 770 700" stroke="#FFB25E" strokeWidth={4} fill="none" opacity={0.55} />
      <rect x={1300} y={720} width={14} height={156} fill="#3A2A1E" />
      <circle cx={1307} cy={686} r={58} fill="#2E4A2E" />
      <circle cx={1270} cy={716} r={38} fill="#38583A" />
      <circle cx={1336} cy={668} r={28} fill="#3E5A3A" />
      <path d="M 1358 646 A 58 58 0 0 1 1358 726" stroke="#FFB25E" strokeWidth={4} fill="none" opacity={0.55} />
      <rect x={450} y={760} width={10} height={116} fill="#3A2A1E" />
      <circle cx={455} cy={736} r={40} fill="#2E4A2E" />
      <circle cx={428} cy={758} r={26} fill="#38583A" />
      <ellipse cx={708} cy={882} rx={90} ry={8} fill="#FFE9A8" opacity={0.1} />
      <ellipse cx={1307} cy={882} rx={70} ry={7} fill="#FFE9A8" opacity={0.1} />
    </g>
    {/* pavement + road — slab joints, a puddle, fallen leaves */}
    <rect x={0} y={876} width={1920} height={84} fill={`url(#${id}pave)`} />
    {[160, 400, 640, 880, 1120, 1360, 1600, 1840].map((x) => (
      <path key={x} d={`M ${x} 876 L ${x - 12} 960`} stroke="#5A5468" strokeWidth={2} opacity={0.6} />
    ))}
    <ellipse cx={1050} cy={930} rx={130} ry={12} fill="#A8CBE8" opacity={0.25} />
    <ellipse cx={1050} cy={930} rx={130} ry={12} fill="none" stroke="#D9ECF7" strokeWidth={2} opacity={0.5} />
    <ellipse cx={1000} cy={928} rx={36} ry={4} fill="#FFE9A8" opacity={0.3} />
    <ellipse cx={620} cy={940} rx={80} ry={8} fill="#FFB25E" opacity={0.22} />
    <ellipse cx={620} cy={940} rx={80} ry={8} fill="none" stroke="#FFE2B0" strokeWidth={1.5} opacity={0.4} />
    <ellipse cx={600} cy={939} rx={26} ry={3} fill="#FFE2B0" opacity={0.45} />
    <path d="M 300 880 L 320 920 L 310 950" stroke="#3A3040" strokeWidth={2} fill="none" opacity={0.6} />
    <path d="M 1420 884 L 1440 910 L 1432 940" stroke="#3A3040" strokeWidth={2} fill="none" opacity={0.6} />
    <ellipse cx={240} cy={900} rx={9} ry={5} fill="#C85A46" opacity={0.8} transform="rotate(-20 240 900)" />
    <ellipse cx={520} cy={920} rx={9} ry={5} fill="#F2C94C" opacity={0.8} transform="rotate(30 520 920)" />
    <ellipse cx={1500} cy={906} rx={9} ry={5} fill="#C85A46" opacity={0.8} transform="rotate(10 1500 906)" />
    <ellipse cx={1780} cy={924} rx={9} ry={5} fill="#F2C94C" opacity={0.8} transform="rotate(-35 1780 924)" />
    <ellipse cx={860} cy={912} rx={8} ry={4} fill="#C85A46" opacity={0.8} transform="rotate(15 860 912)" />
    <ellipse cx={1180} cy={936} rx={8} ry={4} fill="#F2C94C" opacity={0.8} transform="rotate(-25 1180 936)" />
    <path d="M 0 920 L 1920 920" stroke="#2A2530" strokeWidth={3} opacity={0.7} />
    <rect x={0} y={960} width={1920} height={120} fill={`url(#${id}road)`} />
    <path d="M 0 1020 L 1920 1020" stroke="#F6EFE3" strokeWidth={4} strokeDasharray="46 30" opacity={0.5} />
    {/* streetlamps warming up — small pools, sun still owns the light */}
    {[300, 1620].map((x) => (
      <g key={x}>
        <rect x={x - 5} y={640} width={10} height={236} fill="#2A2530" />
        <circle cx={x} cy={636} r={14} fill="#FFD39A" />
        <GlowDisc cx={x} cy={636} r={140} color="#FFD39A" o={0.7} />
        <GlowDisc cx={x} cy={636} r={50} color="#FFE9A8" o={0.5} />
        <polygon points={`${x - 12},644 ${x + 12},644 ${x + 100},880 ${x - 100},880`} fill="#FFD39A" opacity={0.18} />
        <ellipse cx={x} cy={880} rx={170} ry={16} fill="#FFD39A" opacity={0.45} />
      </g>
    ))}
    {/* warm sun pool on the pavement, sun side */}
    <ellipse cx={1500} cy={884} rx={340} ry={16} fill="#FFE2B0" opacity={0.2} />
    <RealDefs p={`${id}r`} palette="day" />
    <AtmoHaze color="#2A2A55" o={0.11} />
    <Dust t={t} seed={9} x0={1100} y0={260} w={500} h={320} n={48} o={0.55} />
    <Dust t={t} seed={21} x0={1300} y0={300} w={400} h={400} n={30} o={0.5} />
    <Vignette p={`${id}r`} o={0.8} />
    <FilmGrain id={`${id}g`} o={0.05} />
  </g>
);

/** Night street — cold blue sky, moon glow, dark skyline, one streetlamp with
    a real cone + pool, pavement joints, road. S2, S6, S7 build on this. */
export const NightStreet: React.FC<{ t: number; id?: string; lampX?: number; alley?: boolean }> = ({ t, id = 'ns', lampX = 960, alley = false }) => (
  <g>
    <defs>
      <linearGradient id={`${id}sky`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#070510" />
        <stop offset="35%" stopColor="#141B36" />
        <stop offset="65%" stopColor="#232C52" />
        <stop offset="100%" stopColor="#33406E" />
      </linearGradient>
      <linearGradient id={`${id}pave`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#3A3440" />
        <stop offset="100%" stopColor="#241F2A" />
      </linearGradient>
      <linearGradient id={`${id}road`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#2E2A33" />
        <stop offset="100%" stopColor="#17141C" />
      </linearGradient>
    </defs>
    <rect x={0} y={0} width={1920} height={880} fill={`url(#${id}sky)`} />
    {/* moon, high right, with glow + crater */}
    <Glow x={1560} y={300} r={680} kind="cool" o={0.6} />
    <GlowDisc cx={1560} cy={300} r={200} color="#E8EEF7" o={0.6} />
    <circle cx={1560} cy={300} r={72} fill="#E8EEF7" opacity={0.98} />
    <circle cx={1560} cy={300} r={80} fill="none" stroke="#E8EEF7" strokeWidth={2} opacity={0.4} />
    <circle cx={1560} cy={300} r={100} fill="none" stroke="#E8EEF7" strokeWidth={1.5} opacity={0.22} />
    <circle cx={1538} cy={286} r={12} fill="#C8D2E4" opacity={0.5} />
    <circle cx={1580} cy={318} r={8} fill="#C8D2E4" opacity={0.45} />
    <circle cx={1548} cy={322} r={5} fill="#C8D2E4" opacity={0.4} />
    <ellipse cx={1560} cy={820} rx={900} ry={90} fill="#2A3355" opacity={0.12} />
    {/* stars */}
    <g fill="#FFFFFF">
      <circle cx={200} cy={120} r={2.5} opacity={0.8} />
      <circle cx={420} cy={80} r={2} opacity={0.6} />
      <circle cx={640} cy={160} r={2.5} opacity={0.7} />
      <circle cx={880} cy={100} r={2} opacity={0.5} />
      <circle cx={1120} cy={140} r={2.5} opacity={0.8} />
      <circle cx={1300} cy={70} r={2} opacity={0.6} />
      <circle cx={1760} cy={130} r={2.5} opacity={0.7} />
      <circle cx={300} cy={220} r={2} opacity={0.5} />
      <circle cx={760} cy={240} r={2} opacity={0.6} />
      <circle cx={1500} cy={200} r={2} opacity={0.5} />
      <circle cx={100} cy={260} r={2} opacity={0.6} />
      <circle cx={540} cy={60} r={2.5} opacity={0.75} />
      <circle cx={980} cy={180} r={2} opacity={0.55} />
      <circle cx={1240} cy={240} r={2.5} opacity={0.65} />
      <circle cx={1420} cy={90} r={2} opacity={0.7} />
      <circle cx={1660} cy={220} r={2} opacity={0.5} />
      <circle cx={1840} cy={80} r={2.5} opacity={0.7} />
      <circle cx={60} cy={180} r={2} opacity={0.5} />
      <circle cx={700} cy={300} r={1.8} opacity={0.5} />
      <circle cx={1040} cy={60} r={2} opacity={0.6} />
    </g>
    {/* two bright star glints near the moon */}
    <g stroke="#E8EEF7" strokeWidth={2} strokeLinecap="round" opacity={0.8}>
      <path d="M 1380 180 h 20 M 1390 170 v 20" />
      <path d="M 1720 420 h 16 M 1728 412 v 16" />
    </g>
    {/* skyline, far depth — hazy silhouettes */}
    <g fill="#1E2438" opacity={0.85}>
      <rect x={-40} y={420} width={260} height={460} />
      <rect x={240} y={360} width={200} height={520} />
      <rect x={480} y={450} width={300} height={430} />
      <rect x={820} y={380} width={220} height={500} />
      <rect x={1080} y={440} width={280} height={440} />
      <rect x={1400} y={360} width={220} height={520} />
      <rect x={1660} y={430} width={300} height={450} />
      <rect x={110} y={480} width={110} height={400} />
      <rect x={1240} y={500} width={130} height={380} />
    </g>
    <g fill="#161C30" opacity={0.9}>
      <rect x={300} y={320} width={8} height={40} />
      <rect x={896} y={340} width={8} height={40} />
      <circle cx={1474} cy={312} r={6} fill="#FF6A6A" opacity={0.9} />
      <rect x={560} y={420} width={30} height={30} />
      <circle cx={1160} cy={418} r={16} />
    </g>
    <rect x={0} y={780} width={1920} height={100} fill="#232A44" opacity={0.65} />
    {/* skyline, mid depth — a few lit windows */}
    <g fill="#141A2C">
      <rect x={60} y={520} width={220} height={360} />
      <rect x={330} y={470} width={190} height={410} />
      <rect x={560} y={540} width={240} height={340} />
      <rect x={900} y={480} width={210} height={400} />
      <rect x={1180} y={530} width={230} height={350} />
      <rect x={1500} y={480} width={200} height={400} />
      <rect x={1740} y={540} width={200} height={340} />
    </g>
    {[90, 170, 250, 360, 440, 590, 670, 930, 1010, 1210, 1290, 1530, 1610, 1770, 1850].map((x, i) => {
      const y = 500 + (i % 4) * 46;
      const lit = i % 3 === 0;
      const cool = i % 4 === 1;
      const flicker = i === 6 ? 0.55 + 0.4 * Math.sin(t * 0.35) : 1;
      const col = cool ? '#CFE8FF' : '#FFD39A';
      return (
        <g key={i} opacity={flicker}>
          {lit ? <GlowDisc cx={x + 10} cy={y + 14} r={26} color={col} o={0.5} /> : null}
          <rect x={x} y={y} width={20} height={28} fill={lit ? col : '#3A4A6A'} opacity={lit ? 0.95 : 0.7} />
        </g>
      );
    })}
    {/* the dark alley — a black gap between buildings on the right, the thing
        the shadow flinches from in S2 */}
    {alley ? (
      <g>
        <rect x={1560} y={560} width={360} height={316} fill="#0A0812" />
        <rect x={1560} y={560} width={360} height={316} fill="none" stroke="#241A26" strokeWidth={5} />
        <rect x={1560} y={560} width={24} height={316} fill="#141A2C" />
        <rect x={1896} y={560} width={24} height={316} fill="#141A2C" />
        <ellipse cx={1740} cy={860} rx={150} ry={10} fill="#000" opacity={0.6} />
      </g>
    ) : null}
    {/* pavement + road */}
    <rect x={0} y={876} width={1920} height={84} fill={`url(#${id}pave)`} />
    {[160, 400, 640, 880, 1120, 1360, 1600, 1840].map((x) => (
      <path key={x} d={`M ${x} 876 L ${x - 12} 960`} stroke="#5A5468" strokeWidth={2} opacity={0.6} />
    ))}
    <path d="M 0 920 L 1920 920" stroke="#2A2530" strokeWidth={3} opacity={0.7} />
    <path d="M 300 880 L 320 920 L 310 950" stroke="#1E1A24" strokeWidth={2} fill="none" opacity={0.6} />
    <path d="M 1420 884 L 1440 910 L 1432 940" stroke="#1E1A24" strokeWidth={2} fill="none" opacity={0.6} />
    <ellipse cx={520} cy={920} rx={8} ry={4} fill="#8A5A3A" opacity={0.7} transform="rotate(25 520 920)" />
    <ellipse cx={1500} cy={906} rx={8} ry={4} fill="#6A4A3A" opacity={0.7} transform="rotate(-15 1500 906)" />
    <rect x={0} y={960} width={1920} height={120} fill={`url(#${id}road)`} />
    <path d="M 0 1020 L 1920 1020" stroke="#F6EFE3" strokeWidth={4} strokeDasharray="46 30" opacity={0.5} />
    <path d="M 0 990 L 1920 990" stroke="#000000" strokeWidth={10} opacity={0.18} />
    <path d="M 0 1050 L 1920 1050" stroke="#000000" strokeWidth={10} opacity={0.18} />
    {/* the streetlamp — the night's one warm light source, with a real cone
        falling straight down and a pool on the pavement */}
    <g>
      <rect x={lampX - 5} y={640} width={10} height={236} fill="#2A2530" />
      <circle cx={lampX} cy={636} r={14} fill="#FFD39A" />
      <GlowDisc cx={lampX} cy={636} r={150} color="#FFD39A" o={0.7} />
      <GlowDisc cx={lampX} cy={636} r={55} color="#FFE9A8" o={0.55} />
      <polygon points={`${lampX - 12},644 ${lampX + 12},644 ${lampX + 110},880 ${lampX - 110},880`} fill="#FFD39A" opacity={0.22} />
      <polygon points={`${lampX - 6},644 ${lampX + 6},644 ${lampX + 50},880 ${lampX - 50},880`} fill="#FFE9A8" opacity={0.14} />
      <ellipse cx={lampX} cy={880} rx={180} ry={16} fill="#FFD39A" opacity={0.5} />
      <ellipse cx={lampX} cy={880} rx={110} ry={10} fill="#FFE9A8" opacity={0.35} />
    </g>
    <Dust t={t} seed={31} x0={lampX - 90} y0={660} w={180} h={200} n={26} o={0.55} />
    <RealDefs p={`${id}r`} palette="night" />
    <AtmoHaze color="#2A2A55" o={0.11} />
    <Dust t={t} seed={9} x0={1100} y0={260} w={500} h={320} n={48} o={0.55} />
    <Vignette p={`${id}r`} o={0.8} />
    <FilmGrain id={`${id}g`} o={0.05} />
  </g>
);

/** Wet-floor room — a dim interior hall. Dark panelled walls, one ceiling
    light with a cone + pool, a yellow A-frame WET FLOOR sign, a puddle
    catching the light, a framed poster. S3. */
export const WetFloorRoom: React.FC<{ t: number; id?: string }> = ({ t, id = 'wf' }) => (
  <g>
    <defs>
      <linearGradient id={`${id}wall`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#2A2A3A" />
        <stop offset="70%" stopColor="#1E1E2C" />
        <stop offset="100%" stopColor="#171722" />
      </linearGradient>
      <linearGradient id={`${id}floor`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#3A3444" />
        <stop offset="100%" stopColor="#241F2A" />
      </linearGradient>
    </defs>
    <rect x={0} y={0} width={1920} height={876} fill={`url(#${id}wall)`} />
    {/* wall panels */}
    {[0, 320, 640, 960, 1280, 1600].map((x) => (
      <path key={x} d={`M ${x} 0 L ${x} 876`} stroke="#14141E" strokeWidth={3} opacity={0.8} />
    ))}
    <path d="M 0 300 L 1920 300" stroke="#14141E" strokeWidth={3} opacity={0.6} />
    <rect x={0} y={836} width={1920} height={40} fill="#14141E" opacity={0.7} />
    <path d="M 0 836 L 1920 836" stroke="#0C0C14" strokeWidth={3} opacity={0.9} />
    {/* wall clock, left wall — inside the S3 camera frame */}
    <g>
      <circle cx={480} cy={340} r={52} fill="#E8DFC8" stroke="#1A1A26" strokeWidth={6} />
      <circle cx={480} cy={340} r={6} fill="#1A1A26" />
      <path d="M 480 340 L 480 302 M 480 340 L 510 354" stroke="#1A1A26" strokeWidth={5} strokeLinecap="round" />
    </g>
    {/* small notice board, mid-right wall — inside the S3 camera frame */}
    <g>
      <rect x={1380} y={420} width={150} height={110} fill="#1A1A26" stroke="#3A3A4A" strokeWidth={4} />
      <rect x={1394} y={434} width={122} height={82} fill="#C8BFA0" />
      <rect x={1406} y={448} width={98} height={8} fill="#2A2A3A" opacity={0.7} />
      <rect x={1406} y={464} width={70} height={8} fill="#2A2A3A" opacity={0.5} />
      <rect x={1406} y={480} width={84} height={8} fill="#2A2A3A" opacity={0.5} />
    </g>
    {/* framed poster, left wall — a red circle on cream, like a transit poster */}
    <g>
      <rect x={110} y={180} width={220} height={280} fill="#1A1A26" stroke="#3A3A4A" strokeWidth={4} />
      <rect x={130} y={200} width={180} height={240} fill="#E8DFC8" />
      <circle cx={220} cy={300} r={62} fill="#C85A46" />
      <rect x={150} y={392} width={140} height={10} fill="#2A2A3A" />
      <rect x={170} y={414} width={100} height={8} fill="#2A2A3A" opacity={0.6} />
    </g>
    {/* a small potted plant, right wall */}
    <g>
      <rect x={1690} y={760} width={90} height={116} fill="#5A3A28" />
      <rect x={1690} y={760} width={90} height={18} fill="#6A4A34" />
      <circle cx={1735} cy={700} r={64} fill="#2E4A2E" />
      <circle cx={1695} cy={730} r={42} fill="#38583A" />
      <circle cx={1775} cy={730} r={42} fill="#334F34" />
      <circle cx={1735} cy={676} r={34} fill="#3E5A3A" />
    </g>
    {/* the ceiling light — the room's one light source, cone falling straight down */}
    <g>
      <rect x={880} y={0} width={160} height={26} fill="#14141E" />
      <ellipse cx={960} cy={26} rx={110} ry={18} fill="#FFE9A8" />
      <GlowDisc cx={960} cy={30} r={150} color="#FFE9A8" o={0.6} />
      <polygon points="860,30 1060,30 1240,880 680,880" fill="#FFE9A8" opacity={0.16} />
      <polygon points="920,30 1000,30 1120,880 800,880" fill="#FFF6D8" opacity={0.12} />
      <ellipse cx={960} cy={880} rx={340} ry={18} fill="#FFE9A8" opacity={0.42} />
      <ellipse cx={960} cy={880} rx={200} ry={11} fill="#FFF6D8" opacity={0.3} />
    </g>
    {/* floor */}
    <rect x={0} y={876} width={1920} height={204} fill={`url(#${id}floor)`} />
    {[200, 500, 800, 1100, 1400, 1700].map((x) => (
      <path key={x} d={`M ${x} 876 L ${x - 10} 1080`} stroke="#1A1620" strokeWidth={2} opacity={0.7} />
    ))}
    <path d="M 0 980 L 1920 980" stroke="#1A1620" strokeWidth={2} opacity={0.5} />
    {/* the puddle — catching the ceiling light */}
    <ellipse cx={1330} cy={960} rx={290} ry={22} fill="#A8CBE8" opacity={0.45} />
    <ellipse cx={1330} cy={960} rx={290} ry={22} fill="none" stroke="#D9ECF7" strokeWidth={2} opacity={0.55} />
    <ellipse cx={1260} cy={956} rx={70} ry={5} fill="#FFE9A8" opacity={0.75} />
    <polygon points="1330,986 1368,986 1349,1010" fill="#F2C94C" opacity={0.35} />
    <ellipse cx={1450} cy={964} rx={40} ry={4} fill="#FFE9A8" opacity={0.4} />
    {/* the yellow A-frame WET FLOOR sign, standing in the puddle's edge */}
    <g>
      <polygon points="1330,700 1470,940 1190,940" fill="#F2C94C" stroke="#8A6A1A" strokeWidth={4} />
      <polygon points="1330,700 1470,940 1190,940" fill="none" stroke="#161616" strokeWidth={2} opacity={0.3} />
      {/* slip pictogram: a stick figure mid-slip */}
      <circle cx={1330} cy={780} r={16} fill="#161616" />
      <path d="M 1330 796 L 1310 850 M 1330 796 L 1360 830 M 1310 850 L 1280 880 M 1310 850 L 1340 890" stroke="#161616" strokeWidth={7} strokeLinecap="round" fill="none" />
      <text x={1330} y={926} textAnchor="middle" fontFamily={FONT.ui} fontSize={22} fontWeight={700} fill="#161616">WET FLOOR</text>
    </g>
    <Dust t={t} seed={41} x0={860} y0={100} w={200} h={700} n={30} o={0.5} />
    <RealDefs p={`${id}r`} palette="night" />
    <AtmoHaze color="#2A2A55" o={0.1} />
    <Dust t={t} seed={4} x0={800} y0={200} w={400} h={500} n={36} o={0.45} />
    <Vignette p={`${id}r`} o={0.8} />
    <FilmGrain id={`${id}g`} o={0.05} />
  </g>
);

/** The liar's room — a warm interior. A table lamp glows on a side table, a
    window shows the night city + moon, a wooden table with two cups sits
    between the two men, a framed picture hangs on the wall. S4. */
export const LiarRoom: React.FC<{ t: number; id?: string }> = ({ t, id = 'lr' }) => (
  <g>
    <defs>
      <linearGradient id={`${id}wall`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#3A2E2A" />
        <stop offset="70%" stopColor="#2A211E" />
        <stop offset="100%" stopColor="#1E1816" />
      </linearGradient>
      <linearGradient id={`${id}floor`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#4A3826" />
        <stop offset="100%" stopColor="#2E2418" />
      </linearGradient>
    </defs>
    <rect x={0} y={0} width={1920} height={876} fill={`url(#${id}wall)`} />
    {/* window, right — night city + moon, cool light against the warm room */}
    <g>
      <rect x={1420} y={140} width={360} height={420} fill="#141A2C" stroke="#1A140E" strokeWidth={8} />
      <rect x={1420} y={140} width={360} height={420} fill="url(#lrWinSky)" />
      <defs>
        <linearGradient id="lrWinSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0B0816" />
          <stop offset="100%" stopColor="#2A3355" />
        </linearGradient>
      </defs>
      <GlowDisc cx={1700} cy={220} r={80} color="#E8EEF7" o={0.5} />
      <circle cx={1700} cy={220} r={34} fill="#E8EEF7" opacity={0.95} />
      <circle cx={1690} cy={212} r={6} fill="#C8D2E4" opacity={0.5} />
      <g fill="#1E2438">
        <rect x={1450} y={380} width={70} height={180} />
        <rect x={1540} y={340} width={90} height={220} />
        <rect x={1650} y={400} width={80} height={160} />
      </g>
      <g fill="#FFD39A">
        <rect x={1465} y={410} width={12} height={16} />
        <rect x={1560} y={380} width={12} height={16} />
        <rect x={1670} y={430} width={12} height={16} />
      </g>
      <path d="M 1600 140 L 1600 560 M 1420 350 L 1780 350" stroke="#1A140E" strokeWidth={8} />
      {/* cool moonlight shaft falling from the window onto the floor */}
      <polygon points="1460,560 1740,560 1840,876 1360,876" fill="#A9C6FF" opacity={0.08} />
    </g>
    {/* framed picture, left wall */}
    <g>
      <rect x={140} y={180} width={260} height={200} fill="#1A1A26" stroke="#5A4632" strokeWidth={6} />
      <rect x={156} y={196} width={228} height={168} fill="#6E3A5E" />
      <circle cx={270} cy={280} r={40} fill="#FF9A3D" />
      <rect x={156} y={320} width={228} height={44} fill="#241F4A" />
    </g>
    {/* second frame, small, above the lamp */}
    <g>
      <rect x={180} y={420} width={180} height={130} fill="#1A1A26" stroke="#5A4632" strokeWidth={5} />
      <rect x={192} y={432} width={156} height={106} fill="#2E4A5E" />
      <circle cx={270} cy={480} r={24} fill="#E8EEF7" opacity={0.9} />
      <rect x={192} y={510} width={156} height={28} fill="#1E2438" />
    </g>
    {/* baseboard along the wall */}
    <rect x={0} y={836} width={1920} height={40} fill="#1A140E" opacity={0.8} />
    <path d="M 0 836 L 1920 836" stroke="#0E0A08" strokeWidth={3} opacity={0.9} />
    {/* side table + lamp, far left — the room's warm light source */}
    <g>
      <rect x={180} y={640} width={180} height={20} fill="#5A3A28" />
      <rect x={258} y={660} width={24} height={216} fill="#4A2E20" />
      <rect x={200} y={860} width={140} height={16} fill="#4A2E20" />
      <rect x={258} y={560} width={24} height={80} fill="#2A2A2A" />
      <polygon points="200,560 316,560 340,500 176,500" fill="#FFD39A" />
      <GlowDisc cx={258} cy={520} r={180} color="#FFD39A" o={0.55} />
      <GlowDisc cx={258} cy={520} r={80} color="#FFE9A8" o={0.5} />
      <polygon points="200,560 316,560 420,876 100,876" fill="#FFD39A" opacity={0.16} />
      <polygon points="230,560 286,560 340,876 176,876" fill="#FFE9A8" opacity={0.12} />
      <ellipse cx={258} cy={880} rx={260} ry={16} fill="#FFD39A" opacity={0.42} />
    </g>
    {/* rug */}
    <ellipse cx={960} cy={960} rx={560} ry={46} fill="#5A2E2E" />
    <ellipse cx={960} cy={960} rx={480} ry={36} fill="none" stroke="#8A4A3A" strokeWidth={4} />
    <ellipse cx={960} cy={960} rx={380} ry={28} fill="none" stroke="#8A4A3A" strokeWidth={3} opacity={0.7} />
    {/* wooden table between the two men, with two cups */}
    <g>
      <rect x={760} y={760} width={400} height={26} rx={6} fill="#6A4A2E" stroke="#3A2A1E" strokeWidth={3} />
      <rect x={780} y={786} width={18} height={90} fill="#4A2E20" />
      <rect x={1122} y={786} width={18} height={90} fill="#4A2A1E" />
      <rect x={820} y={720} width={34} height={40} rx={4} fill="#F6EFE3" stroke="#2A2A2A" strokeWidth={2} />
      <rect x={1046} y={720} width={34} height={40} rx={4} fill="#F6EFE3" stroke="#2A2A2A" strokeWidth={2} />
      <rect x={920} y={738} width={80} height={10} fill="#5A2E2E" />
      <rect x={926} y={728} width={68} height={10} fill="#2E4A5E" />
      <rect x={932} y={718} width={56} height={10} fill="#8A6A3A" />
      <ellipse cx={837} cy={722} rx={14} ry={5} fill="#3A2A1A" />
      <ellipse cx={1063} cy={722} rx={14} ry={5} fill="#3A2A1A" />
    </g>
    <rect x={0} y={876} width={1920} height={204} fill={`url(#${id}floor)`} />
    {[200, 500, 800, 1100, 1400, 1700].map((x) => (
      <path key={x} d={`M ${x} 876 L ${x - 10} 1080`} stroke="#1E1810" strokeWidth={2} opacity={0.7} />
    ))}
    <Dust t={t} seed={42} x0={180} y0={500} w={200} h={300} n={26} o={0.5} />
    <RealDefs p={`${id}r`} palette="night" />
    <AtmoHaze color="#3A2A1E" o={0.1} />
    <Dust t={t} seed={7} x0={200} y0={400} w={400} h={300} n={36} o={0.45} />
    <Vignette p={`${id}r`} o={0.8} />
    <FilmGrain id={`${id}g`} o={0.05} />
  </g>
);

/** The hallway — a long corridor in one-point perspective. Walls converge on
    a bright EXIT door at the far end, ceiling lights recede into the dark,
    doors line both sides. S5. */
export const Hallway: React.FC<{ t: number; id?: string }> = ({ t, id = 'hw' }) => (
  <g>
    <defs>
      <linearGradient id={`${id}wallL`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#1E1E2C" />
        <stop offset="100%" stopColor="#2E2A3A" />
      </linearGradient>
      <linearGradient id={`${id}wallR`} x1="1" y1="0" x2="0" y2="0">
        <stop offset="0%" stopColor="#1E1E2C" />
        <stop offset="100%" stopColor="#2E2A3A" />
      </linearGradient>
      <linearGradient id={`${id}floor`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#3A3444" />
        <stop offset="100%" stopColor="#1E1A24" />
      </linearGradient>
    </defs>
    {/* far wall + the EXIT door — the bright goal at the end */}
    <rect x={0} y={0} width={1920} height={1080} fill="#14141E" />
    <rect x={1560} y={380} width={220} height={496} fill="#0E2E1E" stroke="#1A4A2E" strokeWidth={6} />
    <rect x={1580} y={400} width={180} height={456} fill="#1E5A34" />
    <rect x={1580} y={400} width={180} height={456} fill="none" stroke="#2E7A46" strokeWidth={3} />
    <GlowDisc cx={1670} cy={640} r={420} color="#7AFF9A" o={0.5} />
    <GlowDisc cx={1670} cy={640} r={200} color="#C8FFD8" o={0.4} />
    <polygon points="1560,380 1780,380 1920,876 1420,876" fill="#7AFF9A" opacity={0.08} />
    {/* left wall in perspective */}
    <polygon points="0,0 1560,380 1560,876 0,1080" fill={`url(#${id}wallL)`} />
    {/* right wall in perspective */}
    <polygon points="1920,0 1780,380 1780,876 1920,1080" fill={`url(#${id}wallR)`} />
    {/* ceiling in perspective */}
    <polygon points="0,0 1920,0 1780,380 1560,380" fill="#171722" />
    {/* EXIT sign above the door — drawn AFTER the ceiling (the ceiling plane
        covers this spot; draw order is what keeps the sign visible) */}
    <rect x={1590} y={330} width={160} height={44} rx={6} fill="#2E7A46" stroke="#7AFF9A" strokeWidth={3} />
    <GlowDisc cx={1670} cy={352} r={190} color="#7AFF9A" o={0.75} />
    <GlowDisc cx={1670} cy={352} r={90} color="#C8FFD8" o={0.6} />
    <text x={1670} y={365} textAnchor="middle" fontFamily={FONT.ui} fontSize={32} fontWeight={700} fill="#E8FFE8">EXIT</text>
    <polygon points="1590,374 1750,374 1800,876 1540,876" fill="#7AFF9A" opacity={0.1} />
    {/* doors along the left wall, receding */}
    <g fill="#241F2E" stroke="#14141E" strokeWidth={4}>
      <rect x={120} y={180} width={180} height={700} />
      <rect x={420} y={300} width={140} height={560} />
      <rect x={660} y={380} width={110} height={470} />
      <rect x={860} y={430} width={90} height={420} />
      <rect x={1020} y={460} width={76} height={390} />
      <rect x={1160} y={480} width={64} height={370} />
      <rect x={1280} y={500} width={56} height={350} />
    </g>
    <g fill="#FFD39A">
      <circle cx={290} cy={540} r={7} />
      <circle cx={550} cy={580} r={6} />
      <circle cx={760} cy={610} r={5} />
      <circle cx={940} cy={630} r={4} />
    </g>
    {/* doors along the right wall, receding */}
    <g fill="#241F2E" stroke="#14141E" strokeWidth={4}>
      <rect x={1820} y={300} width={80} height={560} />
    </g>
    {/* baseboards running along both walls in perspective */}
    <path d="M 0 1010 L 1560 850" stroke="#0E0E16" strokeWidth={10} opacity={0.8} />
    <path d="M 1920 1010 L 1780 850" stroke="#0E0E16" strokeWidth={10} opacity={0.8} />
    {/* fire alarm box on the left wall */}
    <g>
      <rect x={300} y={560} width={60} height={80} rx={6} fill="#8A2E2E" stroke="#5A1E1E" strokeWidth={3} />
      <circle cx={330} cy={600} r={12} fill="#E8DFC8" />
    </g>
    {/* ceiling lights receding — each a smaller glow, closer together */}
    <g>
      <ellipse cx={960} cy={120} rx={150} ry={20} fill="#FFE9A8" />
      <GlowDisc cx={960} cy={120} r={200} color="#FFE9A8" o={0.5} />
      <ellipse cx={960} cy={230} rx={90} ry={13} fill="#FFE9A8" opacity={0.85} />
      <ellipse cx={960} cy={300} rx={56} ry={9} fill="#FFE9A8" opacity={0.75} />
      <ellipse cx={960} cy={340} rx={34} ry={6} fill="#FFE9A8" opacity={0.65} />
    </g>
    {/* light cones falling from the ceiling lights */}
    <g fill="#FFE9A8">
      <polygon points="860,120 1060,120 1380,1000 540,1000" opacity={0.06} />
      <polygon points="900,230 1020,230 1200,940 720,940" opacity={0.06} />
    </g>
    {/* light pools on the floor under each ceiling light */}
    <g fill="#FFE9A8">
      <ellipse cx={960} cy={1000} rx={460} ry={20} opacity={0.18} />
      <ellipse cx={960} cy={940} rx={330} ry={15} opacity={0.15} />
      <ellipse cx={960} cy={900} rx={220} ry={11} opacity={0.12} />
    </g>
    {/* floor in perspective */}
    <polygon points="0,1080 1920,1080 1780,876 1560,876" fill={`url(#${id}floor)`} />
    <path d="M 960 1080 L 960 876" stroke="#14141E" strokeWidth={3} opacity={0.6} />
    <path d="M 480 1080 L 700 876 M 1440 1080 L 1220 876" stroke="#14141E" strokeWidth={2} opacity={0.5} />
    <RealDefs p={`${id}r`} palette="night" />
    <AtmoHaze color="#2A2A55" o={0.11} />
    <Dust t={t} seed={3} x0={700} y0={300} w={500} h={400} n={40} o={0.45} />
    <Dust t={t} seed={43} x0={1500} y0={400} w={300} h={400} n={24} o={0.5} />
    <Vignette p={`${id}r`} o={0.8} />
    <FilmGrain id={`${id}g`} o={0.05} />
  </g>
);

/** Crosswalk at night — NightStreet plus a full crosswalk across the road and
    car headlights. `carX` slides the approaching headlights; `streak` draws
    the rushing car's light trail across the frame (S7). S6 and S7. */
export const CrosswalkNight: React.FC<{ t: number; id?: string; carX?: number; streak?: boolean }> = ({ t, id = 'cw', carX = 1700, streak = false }) => (
  <g>
    <NightStreet t={t} id={`${id}n`} lampX={760} />
    {/* crosswalk stripes across the road */}
    {[180, 300, 420, 540, 660, 780, 900, 1020, 1140, 1260, 1380, 1500, 1620, 1740].map((x, i) => (
      <rect key={x} x={x} y={968} width={56} height={104} fill="#F6EFE3" opacity={i % 3 === 1 ? 0.32 : i % 4 === 2 ? 0.42 : 0.55} />
    ))}
    {/* worn patches where tires have eaten the paint */}
    <rect x={420} y={1000} width={56} height={30} fill="#2E2A33" opacity={0.5} />
    <rect x={1140} y={1030} width={56} height={24} fill="#2E2A33" opacity={0.5} />
    {/* approaching car headlights, right edge */}
    <g>
      <GlowDisc cx={carX} cy={990} r={120} color="#FFE9A8" o={0.7} />
      <GlowDisc cx={carX + 90} cy={990} r={120} color="#FFE9A8" o={0.7} />
      <circle cx={carX} cy={990} r={24} fill="#FFF6D8" />
      <circle cx={carX + 90} cy={990} r={24} fill="#FFF6D8" />
      <polygon points={`${carX - 20},990 ${carX + 110},990 ${carX - 420},1020 ${carX - 420},960`} fill="#FFE9A8" opacity={0.28} />
      <polygon points={`${carX - 20},990 ${carX + 110},990 ${carX - 300},1004 ${carX - 300},976`} fill="#FFF6D8" opacity={0.2} />
    </g>
    {/* the rushing car — a long red/white light streak across the ROAD (y 995),
        not floating at pavement height */}
    {streak ? (
      <g>
        <rect x={0} y={995} width={1920} height={22} fill="#FFFFFF" opacity={0.9} />
        <rect x={0} y={995} width={1920} height={9} fill="#FFF6D8" opacity={0.98} />
        <rect x={0} y={1024} width={1920} height={5} fill="#FFD39A" opacity={0.5} />
        <rect x={1200} y={993} width={720} height={26} fill="#FF4A4A" opacity={0.9} />
        <rect x={1400} y={991} width={520} height={6} fill="#FF8A8A" opacity={0.85} />
        <GlowDisc cx={960} cy={1006} r={640} color="#FFE9A8" o={0.35} />
        <rect x={0} y={995} width={1920} height={22} fill="none" stroke="#FFFFFF" strokeWidth={2} opacity={0.35} />
      </g>
    ) : null}
  </g>
);

/** Dark room — near-black, one small lamp glowing warm on the left, a window
    with a moon shaft falling across the floor, dust in the shaft, a wooden
    chair. The quietest panel. S8. */
export const DarkRoom: React.FC<{ t: number; id?: string }> = ({ t, id = 'dr' }) => (
  <g>
    <defs>
      <linearGradient id={`${id}wall`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#17171F" />
        <stop offset="70%" stopColor="#121218" />
        <stop offset="100%" stopColor="#0C0C12" />
      </linearGradient>
      <linearGradient id={`${id}floor`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#241F26" />
        <stop offset="100%" stopColor="#141118" />
      </linearGradient>
    </defs>
    <rect x={0} y={0} width={1920} height={876} fill={`url(#${id}wall)`} />
    {/* window, right — moon + night sky */}
    <g>
      <rect x={1380} y={160} width={340} height={400} fill="#0B0816" stroke="#1A1A22" strokeWidth={8} />
      <GlowDisc cx={1640} cy={250} r={110} color="#E8EEF7" o={0.5} />
      <circle cx={1640} cy={250} r={40} fill="#E8EEF7" opacity={0.95} />
      <circle cx={1640} cy={250} r={46} fill="none" stroke="#E8EEF7" strokeWidth={2} opacity={0.4} />
      <circle cx={1624} cy={238} r={9} fill="#C8D2E4" opacity={0.5} />
      <circle cx={1656} cy={266} r={6} fill="#C8D2E4" opacity={0.45} />
      <g fill="#FFFFFF">
        <circle cx={1450} cy={200} r={2} opacity={0.7} />
        <circle cx={1560} cy={180} r={2.5} opacity={0.8} />
        <circle cx={1500} cy={300} r={2} opacity={0.6} />
      </g>
      <path d="M 1550 160 L 1550 560 M 1380 360 L 1720 360" stroke="#1A1A22" strokeWidth={8} />
    </g>
    {/* moon shaft falling from the window, slanting down-left (moon high-right) */}
    <WindowShaft p="drr" sill={[1380, 1720, 560]} floorY={876} dir={-1} spread={40} o={0.85} motes={14} seed={11} />
    {/* small lamp on a side table, left — the room's only warm light */}
    <g>
      <rect x={220} y={660} width={160} height={18} fill="#3A2A1E" />
      <rect x={290} y={678} width={20} height={198} fill="#2E2218" />
      <rect x={240} y={860} width={120} height={16} fill="#2E2218" />
      <rect x={290} y={600} width={20} height={60} fill="#1A1A1A" />
      <polygon points="240,600 340,600 360,548 220,548" fill="#FFD39A" />
      <GlowDisc cx={290} cy={570} r={240} color="#FFD39A" o={0.65} />
      <GlowDisc cx={290} cy={570} r={110} color="#FFE9A8" o={0.55} />
      <polygon points="240,600 340,600 460,876 160,876" fill="#FFD39A" opacity={0.14} />
      <polygon points="262,600 318,600 380,876 200,876" fill="#FFE9A8" opacity={0.1} />
      <ellipse cx={290} cy={880} rx={280} ry={16} fill="#FFD39A" opacity={0.4} />
    </g>
    {/* framed picture on the left wall */}
    <g>
      <rect x={140} y={220} width={220} height={160} fill="#12121A" stroke="#3A3A4A" strokeWidth={5} />
      <rect x={154} y={234} width={192} height={132} fill="#2A3355" />
      <circle cx={250} cy={290} r={30} fill="#E8EEF7" opacity={0.85} />
      <rect x={154} y={330} width={192} height={36} fill="#141A2C" />
    </g>
    {/* baseboard */}
    <rect x={0} y={836} width={1920} height={40} fill="#0E0E14" opacity={0.8} />
    {/* a book dropped on the floor by the chair */}
    <g>
      <rect x={1020} y={940} width={90} height={12} fill="#5A2E2E" transform="rotate(-8 1020 940)" />
      <rect x={1024} y={930} width={82} height={10} fill="#E8DFC8" transform="rotate(-8 1024 930)" />
    </g>
    {/* rug under the chair */}
    <ellipse cx={820} cy={980} rx={420} ry={34} fill="#2E2430" />
    <ellipse cx={820} cy={980} rx={340} ry={26} fill="none" stroke="#4A3A4A" strokeWidth={3} />
    {/* wooden chair — seat top at 787, where a seated character's hips sit
        (sitY(876) = 787); legs reach the floor at 876 */}
    <g>
      <rect x={700} y={480} width={16} height={307} fill="#4A2E20" />
      <rect x={940} y={480} width={16} height={307} fill="#4A2E20" />
      <rect x={700} y={480} width={256} height={16} fill="#4A2E20" />
      <rect x={700} y={787} width={256} height={22} rx={6} fill="#5A3A28" />
      <rect x={716} y={809} width={14} height={67} fill="#4A2E20" />
      <rect x={926} y={809} width={14} height={67} fill="#4A2E20" />
    </g>
    <rect x={0} y={876} width={1920} height={204} fill={`url(#${id}floor)`} />
    {[200, 500, 800, 1100, 1400, 1700].map((x) => (
      <path key={x} d={`M ${x} 876 L ${x - 10} 1080`} stroke="#100D14" strokeWidth={2} opacity={0.7} />
    ))}
    <Dust t={t} seed={44} x0={200} y0={560} w={200} h={300} n={24} o={0.5} />
    <RealDefs p={`${id}r`} palette="night" />
    <AtmoHaze color="#1A1A2E" o={0.11} />
    <Dust t={t} seed={11} x0={1300} y0={560} w={300} h={300} n={30} o={0.55} />
    <Vignette p={`${id}r`} o={0.85} />
    <FilmGrain id={`${id}g`} o={0.05} />
  </g>
);

// ---------------------------------------------------------------------------
// Durations — 10s per beat, 9 beats, 90s total (2700 frames).
// ---------------------------------------------------------------------------

export const DUR: Record<string, number> = {
  S1: 10, S2: 10, S3: 10, S4: 10, S5: 10, S6: 10, S7: 10, S8: 10, S9: 10,
};

const F = (api: { t: number; fps: number }) => api.t * api.fps;

// ---------------------------------------------------------------------------
// S1 — Sunset street, wide. He walks home; his shadow stretches long and
// calm behind him. Sun low on the right, so both ground shadows fall LEFT.
// ---------------------------------------------------------------------------

defineScene({
  id: 'S1',
  durationSec: DUR.S1,
  characters: [
    { who: 'man', x: 0.44, feetY: ROOM_FLOOR_V },
    { who: 'shadow', x: 0.3, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const pm = pose('S1', 'man', f, [
      { f: 0, p: { ...basePose, x: 700, y: standY(1, ROOM_FLOOR_V), scale: 1, ...WALK, yaw: 1, expr: 'neutral' } },
      { f: len, p: { ...basePose, x: 1000, y: standY(1, ROOM_FLOOR_V), scale: 1, ...WALK, yaw: 1, expr: 'neutral' } },
    ]);
    const faceM = faceAt(f, [[0, 'neutral']]);
    const ps = pose('S1', 'shadow', f, [
      { f: 0, p: { ...basePose, x: 470, y: standY(0.95, ROOM_FLOOR_V), scale: 0.95, ...WALK, yaw: 1, expr: 'neutral' } },
      { f: len, p: { ...basePose, x: 690, y: standY(0.95, ROOM_FLOOR_V), scale: 0.95, ...WALK, yaw: 1, expr: 'neutral' } },
    ]);
    const faceS = faceAt(f, [[0, 'neutral']]);
    const zoom = kf(f, [[0, 1.0], [len, 1.08]]);
    return (
      <g>
        <g transform={camT(960, 560, zoom)}>
          <SunsetStreet t={f} id="s1" sunX={1420} sunY={360} />
          {/* long ground shadows stretching LEFT, away from the low sun */}
          <ellipse cx={pm.x - 190} cy={886} rx={230} ry={8} fill="#000" opacity={0.3} />
          <ellipse cx={ps.x - 160} cy={886} rx={190} ry={7} fill="#000" opacity={0.28} />
          {footShadows(ps)}
          {cast('shadow', <ShadowFig><Hero slim look={SHADOW_LOOK} pose={{ ...ps, ...faceS, facing: 1 }} shadow={0} rimId="rimR" showBrows /></ShadowFig>)}
          {footShadows(pm)}
          {cast('man', <Hero slim look={MAN_LOOK} pose={{ ...pm, ...faceM, facing: 1 }} rimId="rimR" shadow={0} showBrows />)}
        </g>
      </g>
    );
  },
});

// ---------------------------------------------------------------------------
// S2 — Night streetlamp pool. His shadow flinches back from the dark alley;
// he doesn't notice and keeps walking toward it.
// ---------------------------------------------------------------------------

defineScene({
  id: 'S2',
  durationSec: DUR.S2,
  characters: [
    { who: 'man', x: 0.62, feetY: ROOM_FLOOR_V },
    { who: 'shadow', x: 0.41, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const pm = pose('S2', 'man', f, [
      { f: 0, p: { ...basePose, x: 1150, y: standY(1, ROOM_FLOOR_V), scale: 1, ...WALK, yaw: 1, expr: 'neutral' } },
      { f: len, p: { ...basePose, x: 1300, y: standY(1, ROOM_FLOOR_V), scale: 1, ...WALK, yaw: 1, expr: 'neutral' } },
    ]);
    const faceM = faceAt(f, [[0, 'tired']]);
    const ps = pose('S2', 'shadow', f, [
      { f: 0, p: { ...basePose, x: 780, y: standY(1, ROOM_FLOOR_V), scale: 1, ...FLINCH, yaw: 1, expr: 'neutral' } },
      { f: len, p: { ...basePose, x: 780, y: standY(1, ROOM_FLOOR_V), scale: 1, ...FLINCH, yaw: 1, expr: 'neutral' } },
    ]);
    const faceS = faceAt(f, [[0, 'scared']]);
    const zoom = kf(f, [[0, 1.0], [len, 1.06]]);
    return (
      <g>
        <g transform={camT(960, 560, zoom)}>
          <NightStreet t={f} id="s2" lampX={960} alley />
          <WarnMark x={780} y={400} />
          {footShadows(ps)}
          {cast('shadow', <ShadowFig><Hero slim look={SHADOW_LOOK} pose={{ ...ps, ...faceS, facing: 1 }} shadow={0} rimId="rimBlue" showBrows /></ShadowFig>)}
          {footShadows(pm)}
          {cast('man', <Hero slim look={MAN_LOOK} pose={{ ...pm, ...faceM, facing: 1 }} rimId="rimBlue" shadow={0} showBrows />)}
        </g>
      </g>
    );
  },
});

// ---------------------------------------------------------------------------
// S3 — Close-up, wet floor. His shadow points at the yellow sign; he walks
// past it and slips. Camera tight on the three of them: man, shadow, sign.
// ---------------------------------------------------------------------------

defineScene({
  id: 'S3',
  durationSec: DUR.S3,
  characters: [
    { who: 'man', x: 0.36, feetY: ROOM_FLOOR_V },
    { who: 'shadow', x: 0.52, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const pm = pose('S3', 'man', f, [
      { f: 0, p: { ...basePose, x: 700, y: standY(1, ROOM_FLOOR_V), scale: 1, ...SLIP, yaw: 1, expr: 'neutral' } },
      { f: len, p: { ...basePose, x: 700, y: standY(1, ROOM_FLOOR_V), scale: 1, ...SLIP, yaw: 1, expr: 'neutral' } },
    ]);
    const faceM = faceAt(f, [[0, 'shock']]);
    const ps = pose('S3', 'shadow', f, [
      { f: 0, p: { ...basePose, x: 1000, y: standY(1, ROOM_FLOOR_V), scale: 1, ...POINT, yaw: 1, handR: 'point', expr: 'neutral' } },
      { f: len, p: { ...basePose, x: 1000, y: standY(1, ROOM_FLOOR_V), scale: 1, ...POINT, yaw: 1, handR: 'point', expr: 'neutral' } },
    ]);
    const faceS = faceAt(f, [[0, 'worried']]);
    return (
      <g>
        <g transform={camT(980, 640, 1.5)}>
          <WetFloorRoom t={f} id="s3" />
          <WarnMark x={1000} y={380} />
          {footShadows(ps)}
          {cast('shadow', <ShadowFig><Hero slim look={SHADOW_LOOK} pose={{ ...ps, ...faceS, facing: 1 }} shadow={0} rimId="rimR" showBrows /></ShadowFig>)}
          {footShadows(pm)}
          {cast('man', <Hero slim look={MAN_LOOK} pose={{ ...pm, ...faceM, facing: 1 }} rimId="rimR" shadow={0} showBrows />)}
        </g>
      </g>
    );
  },
});

// ---------------------------------------------------------------------------
// S4 — Interior, the liar. His shadow points at the smiling stranger's face;
// he believes him anyway. Warm lamp left, cool window right.
// ---------------------------------------------------------------------------

defineScene({
  id: 'S4',
  durationSec: DUR.S4,
  characters: [
    { who: 'man', x: 0.29, feetY: ROOM_FLOOR_V },
    { who: 'stranger', x: 0.68, feetY: ROOM_FLOOR_V },
    { who: 'shadow', x: 0.42, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const pm = pose('S4', 'man', f, [
      { f: 0, p: { ...basePose, x: 550, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, yaw: 1, expr: 'neutral' } },
      { f: len, p: { ...basePose, x: 550, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, yaw: 1, expr: 'neutral' } },
    ]);
    const faceM = faceAt(f, [[0, 'neutral']]);
    const pt = pose('S4', 'stranger', f, [
      { f: 0, p: { ...basePose, x: 1300, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, yaw: -1, armR: { a: 40, b: 30 }, handR: 'open', expr: 'smug' } },
      { f: len, p: { ...basePose, x: 1300, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, yaw: -1, armR: { a: 40, b: 30 }, handR: 'open', expr: 'smug' } },
    ]);
    const faceT = faceAt(f, [[0, 'smug']]);
    const ps = pose('S4', 'shadow', f, [
      { f: 0, p: { ...basePose, x: 800, y: standY(1, ROOM_FLOOR_V), scale: 1, ...POINT, yaw: 1, handR: 'point', expr: 'neutral' } },
      { f: len, p: { ...basePose, x: 800, y: standY(1, ROOM_FLOOR_V), scale: 1, ...POINT, yaw: 1, handR: 'point', expr: 'neutral' } },
    ]);
    const faceS = faceAt(f, [[0, 'worried']]);
    return (
      <g>
        <g transform={camT(960, 560, 1.05)}>
          <LiarRoom t={f} id="s4" />
          <WarnMark x={800} y={380} />
          {footShadows(ps)}
          {cast('shadow', <ShadowFig><Hero slim look={SHADOW_LOOK} pose={{ ...ps, ...faceS, facing: 1 }} shadow={0} rimId="rimL" showBrows /></ShadowFig>)}
          {footShadows(pm)}
          {cast('man', <Hero slim look={MAN_LOOK} pose={{ ...pm, ...faceM, facing: 1 }} rimId="rimL" shadow={0} showBrows />)}
          {footShadows(pt)}
          {cast('stranger', <Hero slim look={STRANGER_LOOK} pose={{ ...pt, ...faceT, facing: -1 }} rimId="rimBlue" shadow={0} showBrows />)}
        </g>
      </g>
    );
  },
});

// ---------------------------------------------------------------------------
// S5 — Hallway. His shadow waves for attention as he walks toward the bright
// EXIT door at the far end. Feet at 0.9 (mid-hall, closer to camera).
// ---------------------------------------------------------------------------

defineScene({
  id: 'S5',
  durationSec: DUR.S5,
  characters: [
    { who: 'man', x: 0.52, feetY: 0.9 },
    { who: 'shadow', x: 0.31, feetY: 0.9 },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const pm = pose('S5', 'man', f, [
      { f: 0, p: { ...basePose, x: 950, y: standY(1.15, 0.9), scale: 1.15, ...WALK, yaw: 1, expr: 'neutral' } },
      { f: len, p: { ...basePose, x: 1150, y: standY(1.15, 0.9), scale: 1.15, ...WALK, yaw: 1, expr: 'neutral' } },
    ]);
    const faceM = faceAt(f, [[0, 'neutral']]);
    const ps = pose('S5', 'shadow', f, [
      { f: 0, p: { ...basePose, x: 600, y: standY(1.1, 0.9), scale: 1.1, ...WAVE, yaw: 1, handR: 'open', expr: 'neutral' } },
      { f: len, p: { ...basePose, x: 600, y: standY(1.1, 0.9), scale: 1.1, ...WAVE, yaw: 1, handR: 'open', expr: 'neutral' } },
    ]);
    const faceS = faceAt(f, [[0, 'worried']]);
    // wave motion lines beside the shadow's raised hand
    const hw = toWorld(ps, joints(ps, true).armR.end);
    const zoom = kf(f, [[0, 1.0], [len, 1.06]]);
    return (
      <g>
        <g transform={camT(960, 560, zoom)}>
          <Hallway t={f} id="s5" />
          <g stroke="#FFE9A8" strokeWidth={5} strokeLinecap="round" fill="none" opacity={0.85}>
            <path d={`M ${hw.x + 30} ${hw.y - 60} q 18 -14 34 -4`} />
            <path d={`M ${hw.x + 44} ${hw.y - 26} q 18 -10 32 2`} />
            <path d={`M ${hw.x + 30} ${hw.y + 8} q 16 -6 28 6`} />
          </g>
          {footShadows(ps)}
          {cast('shadow', <ShadowFig><Hero slim look={SHADOW_LOOK} pose={{ ...ps, ...faceS, facing: 1 }} shadow={0} rimId="rimR" showBrows /></ShadowFig>)}
          {footShadows(pm)}
          {cast('man', <Hero slim look={MAN_LOOK} pose={{ ...pm, ...faceM, facing: 1 }} rimId="rimR" shadow={0} showBrows />)}
        </g>
      </g>
    );
  },
});

// ---------------------------------------------------------------------------
// S6 — Crosswalk, wide. His shadow plants its feet and pulls back hard as he
// steps toward traffic. Headlights approach from the right.
// ---------------------------------------------------------------------------

defineScene({
  id: 'S6',
  durationSec: DUR.S6,
  characters: [
    { who: 'man', x: 0.4, feetY: ROOM_FLOOR_V },
    { who: 'shadow', x: 0.24, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const pm = pose('S6', 'man', f, [
      { f: 0, p: { ...basePose, x: 700, y: standY(1, ROOM_FLOOR_V), scale: 1, ...WALK, yaw: 1, expr: 'neutral' } },
      { f: len, p: { ...basePose, x: 850, y: standY(1, ROOM_FLOOR_V), scale: 1, ...WALK, yaw: 1, expr: 'neutral' } },
    ]);
    const faceM = faceAt(f, [[0, 'tired']]);
    const ps = pose('S6', 'shadow', f, [
      { f: 0, p: { ...basePose, x: 470, y: standY(1, ROOM_FLOOR_V), scale: 1, ...PULLBACK, yaw: 1, expr: 'neutral' } },
      { f: len, p: { ...basePose, x: 470, y: standY(1, ROOM_FLOOR_V), scale: 1, ...PULLBACK, yaw: 1, expr: 'neutral' } },
    ]);
    const faceS = faceAt(f, [[0, 'determined']]);
    // resistance lines between the shadow's hands and the man — the pull
    const hp = toWorld(ps, joints(ps, true).armR.end);
    const zoom = kf(f, [[0, 1.0], [len, 1.06]]);
    return (
      <g>
        <g transform={camT(960, 560, zoom)}>
          <CrosswalkNight t={f} id="s6" carX={1700} />
          <g stroke="#FFE9A8" strokeWidth={4} strokeLinecap="round" opacity={0.7}>
            <path d={`M ${hp.x + 10} ${hp.y - 8} L ${hp.x + 90} ${hp.y - 14}`} />
            <path d={`M ${hp.x + 10} ${hp.y + 12} L ${hp.x + 90} ${hp.y + 6}`} />
          </g>
          <WarnMark x={470} y={400} />
          {footShadows(ps)}
          {cast('shadow', <ShadowFig><Hero slim look={SHADOW_LOOK} pose={{ ...ps, ...faceS, facing: 1 }} shadow={0} rimId="rimBlue" showBrows /></ShadowFig>)}
          {footShadows(pm)}
          {cast('man', <Hero slim look={MAN_LOOK} pose={{ ...pm, ...faceM, facing: 1 }} rimId="rimBlue" shadow={0} showBrows />)}
        </g>
      </g>
    );
  },
});

// ---------------------------------------------------------------------------
// S7 — Spotlight, low angle. The shadow yanks him back by the arm just as a
// car rushes past — a long red/white light streak across the frame.
// ---------------------------------------------------------------------------

defineScene({
  id: 'S7',
  durationSec: DUR.S7,
  characters: [
    { who: 'man', x: 0.47, feetY: ROOM_FLOOR_V },
    { who: 'shadow', x: 0.36, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const pm = pose('S7', 'man', f, [
      { f: 0, p: { ...basePose, x: 930, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, yaw: 1, tilt: -14, armL: { a: 70, b: 10 }, armR: { a: 30, b: 10 }, legL: { a: 20, b: -6 }, legR: { a: -25, b: 12 }, expr: 'neutral' } },
      { f: len, p: { ...basePose, x: 930, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, yaw: 1, tilt: -14, armL: { a: 70, b: 10 }, armR: { a: 30, b: 10 }, legL: { a: 20, b: -6 }, legR: { a: -25, b: 12 }, expr: 'neutral' } },
    ]);
    const faceM = faceAt(f, [[0, 'shock']]);
    const ps = pose('S7', 'shadow', f, [
      { f: 0, p: { ...basePose, x: 640, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, yaw: 1, tilt: 8, armR: { a: 55, b: 5 }, armL: { a: 40, b: 10 }, legL: { a: -18, b: 8 }, legR: { a: 24, b: -8 }, expr: 'neutral' } },
      { f: len, p: { ...basePose, x: 640, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, yaw: 1, tilt: 8, armR: { a: 55, b: 5 }, armL: { a: 40, b: 10 }, legL: { a: -18, b: 8 }, legR: { a: 24, b: -8 }, expr: 'neutral' } },
    ]);
    const faceS = faceAt(f, [[0, 'determined']]);
    return (
      <g>
        {/* camera sits LOW so the road + car streak (world y ~995) stay in frame */}
        <g transform={camT(960, 650, 1.3)}>
          <CrosswalkNight t={f} id="s7" carX={1750} streak />
          <WarnMark x={930} y={340} />
          {footShadows(ps)}
          {cast('shadow', <ShadowFig><Hero slim look={SHADOW_LOOK} pose={{ ...ps, ...faceS, facing: 1 }} shadow={0} rimId="rimBlue" showBrows /></ShadowFig>)}
          {footShadows(pm)}
          {cast('man', <Hero slim look={MAN_LOOK} pose={{ ...pm, ...faceM, facing: 1 }} rimId="rimBlue" shadow={0} showBrows />)}
        </g>
      </g>
    );
  },
});

// ---------------------------------------------------------------------------
// S8 — Dark room, close-up. He sits on the chair, finally understanding; his
// shadow stands opposite and gives a small nod. One warm lamp, one moon shaft.
// ---------------------------------------------------------------------------

defineScene({
  id: 'S8',
  durationSec: DUR.S8,
  characters: [
    { who: 'man', x: 0.43, feetY: ROOM_FLOOR_V },
    { who: 'shadow', x: 0.6, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const pm = pose('S8', 'man', f, [
      { f: 0, p: { ...basePose, x: 820, y: sitY(FLOOR_PX), scale: 1, ...SIT, yaw: 1, headTilt: 8, armL: { a: 25, b: 45 }, armR: { a: 25, b: 45 }, expr: 'neutral' } },
      { f: len, p: { ...basePose, x: 820, y: sitY(FLOOR_PX), scale: 1, ...SIT, yaw: 1, headTilt: 8, armL: { a: 25, b: 45 }, armR: { a: 25, b: 45 }, expr: 'neutral' } },
    ]);
    const faceM = faceAt(f, [[0, 'neutral']]);
    const ps = pose('S8', 'shadow', f, [
      { f: 0, p: { ...basePose, x: 1150, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, yaw: -1, headTilt: 6, expr: 'neutral' } },
      { f: len, p: { ...basePose, x: 1150, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, yaw: -1, headTilt: 6, expr: 'neutral' } },
    ]);
    const faceS = faceAt(f, [[0, 'neutral']]);
    return (
      <g>
        <g transform={camT(960, 560, 1.05)}>
          <DarkRoom t={f} id="s8" />
          {footShadows(ps)}
          {cast('shadow', <ShadowFig><Hero slim look={SHADOW_LOOK} pose={{ ...ps, ...faceS, facing: -1 }} shadow={0} rimId="rimL" showBrows /></ShadowFig>)}
          {footShadows(pm)}
          {cast('man', <Hero slim look={MAN_LOOK} pose={{ ...pm, ...faceM, facing: 1 }} rimId="rimL" shadow={0} showBrows />)}
        </g>
      </g>
    );
  },
});

// ---------------------------------------------------------------------------
// S9 — Sunset, wide. They walk together into the orange light, side by side;
// he nods down at his shadow. The sun sits low in the middle of the frame.
// ---------------------------------------------------------------------------

defineScene({
  id: 'S9',
  durationSec: DUR.S9,
  characters: [
    { who: 'man', x: 0.44, feetY: ROOM_FLOOR_V },
    { who: 'shadow', x: 0.57, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const pm = pose('S9', 'man', f, [
      { f: 0, p: { ...basePose, x: 800, y: standY(1, ROOM_FLOOR_V), scale: 1, ...WALK, yaw: 1, headTilt: 6, expr: 'neutral' } },
      { f: len, p: { ...basePose, x: 1000, y: standY(1, ROOM_FLOOR_V), scale: 1, ...WALK, yaw: 1, headTilt: 6, expr: 'neutral' } },
    ]);
    const faceM = faceAt(f, [[0, 'happy']]);
    const ps = pose('S9', 'shadow', f, [
      { f: 0, p: { ...basePose, x: 1050, y: standY(0.95, ROOM_FLOOR_V), scale: 0.95, ...WALK, yaw: 1, expr: 'neutral' } },
      { f: len, p: { ...basePose, x: 1250, y: standY(0.95, ROOM_FLOOR_V), scale: 0.95, ...WALK, yaw: 1, expr: 'neutral' } },
    ]);
    const faceS = faceAt(f, [[0, 'happy']]);
    const zoom = kf(f, [[0, 1.0], [len, 1.06]]);
    return (
      <g>
        <g transform={camT(960, 560, zoom)}>
          <SunsetStreet t={f} id="s9" sunX={960} sunY={360} />
          {/* both ground shadows stretch LEFT, away from the sun ahead of them */}
          <ellipse cx={pm.x - 190} cy={886} rx={230} ry={8} fill="#000" opacity={0.3} />
          <ellipse cx={ps.x - 160} cy={886} rx={190} ry={7} fill="#000" opacity={0.28} />
          {footShadows(ps)}
          {cast('shadow', <ShadowFig><Hero slim look={SHADOW_LOOK} pose={{ ...ps, ...faceS, facing: 1 }} shadow={0} rimId="rimR" showBrows /></ShadowFig>)}
          {footShadows(pm)}
          {cast('man', <Hero slim look={MAN_LOOK} pose={{ ...pm, ...faceM, facing: 1 }} rimId="rimR" shadow={0} showBrows />)}
        </g>
      </g>
    );
  },
});

// ---------------------------------------------------------------------------
// Registry helpers — the timeline is DERIVED from these durations, never
// hand-written.
// ---------------------------------------------------------------------------

export const shadowWarnsScenes = (): SceneDef[] =>
  getScenes().filter((s) => s.id !== 'S53-example' && /^S\d+$/.test(s.id));

export const shadowWarnsTimeline = (fps = FPS) => {
  let frame = 0;
  return shadowWarnsScenes().map((s) => {
    const len = Math.round(s.durationSec * fps);
    const shot = { id: s.id, first: frame, len, durationSec: s.durationSec };
    frame += len;
    return shot;
  });
};

export const shadowWarnsTotalSec = () => shadowWarnsScenes().reduce((sum, s) => sum + s.durationSec, 0);

// Adapter: a scene def becomes an episode Shot (ShotProps clock in frames).
export const sceneToShot = (def: SceneDef): React.FC<ShotProps> => {
  const Shot: React.FC<ShotProps> = ({ t, len }) => {
    setCurrentScene(def.id);
    const floorY = def.characters[0]?.feetY ?? ROOM_FLOOR_V;
    return def.fn({ t: t / FPS, duration: def.durationSec, floorY, frame: t, fps: FPS });
  };
  return Shot;
};

export const shadowWarnsShots = (): Record<string, React.FC<ShotProps>> => {
  const out: Record<string, React.FC<ShotProps>> = {};
  for (const def of shadowWarnsScenes()) out[def.id] = sceneToShot(def);
  return out;
};

export { guardScene, guardNoIdleFlap, countReversals, totalDurationSec } from '../../engine/sceneBuilder';
