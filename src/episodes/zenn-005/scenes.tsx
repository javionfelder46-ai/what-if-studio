// "What If You Woke Up 100 Years in the Future?" — video #5, 2D Remotion build.
// 42 narrative beats (S1-S42) + S43 end card, each its own sealed scene function
// with a set duration (modular scene build, Nov 14). Durations from the script's
// word counts at video #3's measured pace (527s / 1,368 words = 0.385 s/word),
// min 4s per beat, total 623.8s + 4s end card = 627.8s. Audio sync comes later
// (no Liam voiceover exists yet) — the edit cuts long beats into <=6s shots.
//
// LOOK (locked, rule book + Javion's Nov 14 samples): Detective + Jake are BLACK
// SILHOUETTES — round solid black heads, black torsos/limbs, white oval eyes
// (Detective) / black sunglasses (Jake, his eyes), no ears, no nose, no mouth,
// no chin. Moonlight blue glow (#A9C6FF rim, rimId="rimBlue") on the Detective
// (and Jake's edges) in EVERY scene — never removed. Detective: slate-blue
// deerstalker (little bow on top stays) + slate jacket + white shirt + dark tie.
// Jake: plain red shirt #C0392B, bald, sunglasses. Accent: amber yellow #F39C12
// — sparse highlight on the focal element ONLY (timer, time machine lights,
// chapter-card key word). Never on characters/glow. Detective narrates
// third-person facing camera; Jake lives the story; the Detective sneaks in the
// background (small, in shadow, at the frame edge) of scenes where he is not
// the focus.
//
// STYLE LOCK (Nov 14, Javion — "STOP CHANGING MY FUCKING STYLE" / "Don't do
// no other style but that" / "I want it like this"): the FUSION CUTAWAY
// sample is the ONLY style for this video —
//   zenn/out/media-generation-zenn-005-sample-fusion-cutaway-0-72c89a14-*.webp
// Small round heads, thin stick limbs, slate coat, deerstalker with bow,
// moonlight blue glow on every character, RICH DETAILED SETS (pipes, panels,
// vents, gauges, skyline, lanterns — no plain empty walls, no blank banners,
// no unfinished set piece), colored outfit on every character. The rig stills
// that came out flat and simple (plain WhiteRoom, empty star-fields, blank
// stall banner, purple-shirt Mara) were WRONG and were reworked to this.
// Generated samples drift the other way (big-head cartoon) — never use them
// as the build reference. The fusion cutaway is the reference. Period.
// SECOND REFERENCE (Nov 14 evening, Javion — "Keep everything this style" /
// "This looks fantastic"): the NOODLE STALL sample —
//   zenn/out/media-generation-zenn-005-sample-noodle-stall-v-0-ba7a05c0-*.webp
// Same lock (small round heads, thin stick limbs, moonlight blue glow, rich
// detailed sets, colored outfits) proven in a FULL environment scene — night
// market, string lights, lanterns, steaming pots, menu board. The rig stall
// (NoodleStall) carries its signature: string lights under the awning +
// paper lanterns along the counter front, Mara in teal apron + bun serving,
// Jake on a stool / standing, red shirt, sunglasses.
//
// SLIM BUILD (Nov 14, Javion — fusion-cutaway / Jake-2126 / Mars samples):
// SMALL round head (r 54, head/total ≈ 0.27), thin black stick arms and legs,
// longer legs (158), narrower shoulders. NOT the video #3 rig proportions
// (big head, thick limbs) and NOT the big-head first sample. Every Hero in
// this file renders with `slim` (rig.tsx SLIM geometry, default-off so video
// #3 is byte-identical). HANDS (Mars lock): simple solid black mitten, NO
// fingers, no thumb, no knuckle marks; pointing = mitten + ONE point. FEET
// (Mars lock): simple rounded black ovals at the ends of the thin stick legs,
// planted flat on the floor, fully visible — no shoe shape, no toes.
//
// MAGNIFYING GLASS (Nov 14, Javion): the glass is RAISED only when the
// Detective is examining something CLOSE UP. In wide shots where he looks
// out at a distant view (flooded city, Mars, skyline, night sky) the glass
// stays DOWN at his side, arm relaxed — glass up in a wide looking-out shot
// reads like he is examining something small that is not there. S3 + S27
// were restaged to glass-down (point at the timer, bare hand) for this.
// BACK VIEW (Nov 14, Javion): from BEHIND, only the back of the clothing
// shows — the Detective's tie + white shirt front + collar live on his
// chest, so a back view is solid slate coat only. The rig has no back-view
// mode (yaw is -1..1, profile-to-profile) and its frontFade already hides
// the tie/shirt/collar at |yaw| >= 0.6 — NO back-view shot exists in this
// episode (audit Nov 14: max |yaw| is 0.7, Mara's head turn in S34; every
// `facing: -1` is a left PROFILE, not a back). Any future back view must
// hide the front details; a front detail drawn on a back view is a defect.
//
// MOVEMENT (fluent, Nov 14): one movement at a time, a move spans >=15 frames,
// hold >=0.5s after it lands, head leads / body follows. Standing poses repeat
// IDENTICAL arm/look values at every key (0 reversals). A deliberate gesture is
// a single out-and-hold or out-and-back (<=1 reversal) — the poseAt idle-flap
// fix and guardNoIdleFlap both enforce this. look stays 0 unless the beat
// names a look; eyes never dart.

import React from 'react';
import {
  Hero, basePose, poseAt, faceAt, kf, camT, lerp, clamp, LOOKS, Look,
  Cell, Bedroom, Kitchen, Lab, Exterior, EndCard, FONT, MOONLIGHT,
  ShotProps,
} from '../../engine';
import {
  defineScene, getScenes, buildTimeline, totalDurationSec,
  guardScene, guardNoIdleFlap, countReversals, SceneDef,
} from '../../engine/sceneBuilder';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const FPS = 30;
export const AMBER = '#F39C12'; // video #5 accent — focal element only
export const CREAM = '#F6EFE3';
export const INK = '#161616';
// Floor lines (v coordinate, 0..1 in the 1920x1080 world). Room sets (Cell,
// Bedroom, Kitchen, Lab): feet at 876 -> v = 0.811. Exterior / street / park /
// Mars ground: 864 -> v = 0.80. A scene's floorY is its HIGHEST walking
// surface (S5's seawall top, v=0.648) — feet BELOW the floor line (closer to
// camera) pass the guard. Slim build: hip height at scale 1 is 876 - 158 = 718.
export const ROOM_FLOOR_V = 0.811;
export const STREET_FLOOR_V = 0.8;
export const WALL_TOP_V = 0.648;
/** Hip y (px) for a character of `scale` standing with feet on floor v. Slim leg length 158. */
export const standY = (scale: number, floorV: number) => floorV * 1080 - 158 * scale;
/** Hip y for a SEATED character whose feet plant on floorYPx: slim shin 78 +
    foot oval (~11) at the seated angles below, feet land on floorYPx. */
export const sitY = (floorYPx: number, scale = 1) => floorYPx - 89 * scale;

// Mara — supporting one-off (noodle-stall owner, about Jake's age). LOCKED LOOK
// (dialogue sample v3, Javion Nov 14): a TEAL APRON over a dark shirt, hair in
// a BUN, white oval eyes, NO mouth, NO nose. NOT the purple shirt + brown
// ponytail the build had before (wrong — Javion: "STOP CHANGING MY FUCKING
// STYLE"). The apron reads through the jacket colour; the bun is the rig's
// 'bun' hair style in dark teal-black, as in the sample.
// EXPRESSION (Nov 14 fix): Mara is ALWAYS 'neutral' — the 'happy' expression
// draws closed arc eyes, which reads as her eyes being shut. The locked look
// is two plain white oval eyes, open. The mood is carried by the pose, not
// the face (slim rule).
export const MARA: Look = {
  ...LOOKS.student,
  extra: undefined,
  gear: undefined,
  jacket: '#2F6E69',
  jacketShade: '#245954',
  accent: '#245954',
  hair: 'bun',
  hairC: '#1F3A38',
};

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
export const POINT = { armL: { a: 4, b: 8 }, armR: { a: 75, b: 20 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 }, look: 0, headTilt: 0, tilt: 0, handR: 'point' as const };
export const POINT_UP = { armL: { a: 4, b: 8 }, armR: { a: 150, b: 10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 }, look: 0, headTilt: -6, tilt: 0, handR: 'point' as const };
export const LISTEN = { armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 }, look: 0, headTilt: 6, tilt: 0 };
export const THINK = { armL: { a: 4, b: 8 }, armR: { a: 55, b: 65 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 }, look: 0, headTilt: 5, tilt: 0 };
export const WALK = (dir: 1 | -1) => ({ armL: { a: 20 * dir, b: 8 }, armR: { a: -20 * dir, b: 8 }, legL: { a: 12 * dir, b: -15 }, legR: { a: -8 * dir, b: -3 }, look: 0, headTilt: 0, tilt: 4 });
export const SIT = { armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 75, b: -75 }, legR: { a: 75, b: -75 }, look: 0, headTilt: 0, tilt: 0 };

// ---------------------------------------------------------------------------
// Shared overlays
// ---------------------------------------------------------------------------

const hmsToSec = (hms: string) => {
  const [h, m, s] = hms.split(':').map(Number);
  return h * 3600 + m * 60 + s;
};
const secToHms = (s: number) => {
  const v = Math.max(0, Math.round(s));
  const h = Math.floor(v / 3600);
  const m = Math.floor((v % 3600) / 60);
  const ss = v % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
};
/** The ticking timer, top-right corner, amber mono text on a dark pill.
    `start` is the timer value when the scene begins; it counts down in real time. */
export const TimerChip: React.FC<{ start: string; tSec: number }> = ({ start, tSec }) => (
  <g>
    <rect x={1470} y={56} width={400} height={76} rx={12} fill="#0B0816" stroke={AMBER} strokeWidth={3} opacity={0.92} />
    <text x={1670} y={108} textAnchor="middle" fontFamily={FONT.ui} fontSize={44} fill={AMBER}>
      {secToHms(hmsToSec(start) - tSec)}
    </text>
  </g>
);
/** A fact in big hand text, cream, with the key number in amber. Never overlaps
    a character: facts sit in clear space, top-centre or centre-right. */
export const FactText: React.FC<{ lines: string[]; accentLine?: number; x?: number; y?: number; size?: number }> = ({
  lines, accentLine = 0, x = 960, y = 300, size = 84,
}) => (
  <g>
    {lines.map((ln, i) => (
      <text key={i} x={x} y={y + i * (size + 18)} textAnchor="middle" fontFamily={FONT.hand} fontSize={size} fill={i === accentLine ? AMBER : CREAM} stroke="#1A1230" strokeWidth={6} paintOrder="stroke">
        {ln}
      </text>
    ))}
  </g>
);
/** Chapter title card — pops in at the chapter's first beat, fades out after
    ~2.5s. Kicker in cream, key word in amber (the video accent). */
export const ChapterCard: React.FC<{ t: number; kicker: string; title: string; accentWord: string }> = ({ t, kicker, title, accentWord }) => {
  const pop = 1 + 0.3 * Math.max(0, Math.sin(clamp(t / 9) * Math.PI));
  const op = t < 60 ? 1 : t < 75 ? 1 - (t - 60) / 15 : 0;
  if (op <= 0) return null;
  return (
    <g opacity={op} transform={`translate(960 220) scale(${pop})`}>
      <text y={0} textAnchor="middle" fontFamily={FONT.ui} fontSize={40} letterSpacing={6} fill={CREAM}>
        {kicker}
      </text>
      <text y={110} textAnchor="middle" fontFamily={FONT.title} fontWeight={700} fontSize={104} fill={CREAM} stroke="#1A1230" strokeWidth={10} paintOrder="stroke">
        {title.split(' ').map((w, i) => (
          <tspan key={i} fill={w.replace(/[^A-Za-z]/g, '') === accentWord ? AMBER : undefined}>
            {(i ? ' ' : '') + w}
          </tspan>
        ))}
      </text>
    </g>
  );
};
/** Screen-space caption in clear space at the bottom — never over a character. */
export const Caption: React.FC<{ text: string; y?: number; size?: number }> = ({ text, y = 990, size = 44 }) => (
  <text x={960} y={y} textAnchor="middle" fontFamily={FONT.hand} fontSize={size} fill={CREAM} stroke="#1A1230" strokeWidth={5} paintOrder="stroke">
    {text}
  </text>
);

// ---------------------------------------------------------------------------
// Backdrops drawn inline for this video (the engine sets cover the rest)
// ---------------------------------------------------------------------------

/** S1/S38-S40: the white room — warm-white walls, ceiling panels glowing soft
    blue, a door frame on the right (where the Detective sneaks), floor at
    v=0.811. The platform bed (S1) sits knee-high per the bed rule. STYLE LOCK
    (Nov 14, Javion — fusion cutaway is the ONLY style): no plain empty walls —
    the room is finished: panel seams, baseboard, vent, a framed print, floor
    seams. Still a white room per the script, just not an empty one. */
export const WhiteRoom: React.FC<{ t: number; bed?: boolean; door?: boolean }> = ({ t, bed = false, door = false }) => (
  <g>
    <rect x={0} y={0} width={1920} height={876} fill="#E9E5DB" />
    <rect x={0} y={876} width={1920} height={204} fill="#D8D2C4" />
    <rect x={0} y={0} width={1920} height={150} fill="#DCD6C8" />
    {/* wall panel seams — the wall is built from panels, not one blank slab */}
    {[480, 960, 1440].map((x) => (
      <path key={x} d={`M ${x} 150 L ${x} 876`} stroke="#CFC8B8" strokeWidth={3} opacity={0.8} />
    ))}
    {/* baseboard along the floor line */}
    <rect x={0} y={852} width={1920} height={24} fill="#CFC8B8" stroke="#B8B2A4" strokeWidth={2} />
    {/* floor tile seams */}
    {[320, 640, 1280, 1600].map((x) => (
      <path key={x} d={`M ${x} 876 L ${x - 40} 1080`} stroke="#C4BCA9" strokeWidth={2} opacity={0.7} />
    ))}
    <path d="M 0 980 L 1920 980" stroke="#C4BCA9" strokeWidth={2} opacity={0.7} />
    {/* vent grille, left wall */}
    <g>
      <rect x={120} y={280} width={150} height={70} rx={6} fill="#C9C2B0" stroke="#A8A08C" strokeWidth={3} />
      {[0, 1, 2, 3].map((i) => (
        <path key={i} d={`M ${134} ${296 + i * 14} L ${256} ${296 + i * 14}`} stroke="#A8A08C" strokeWidth={3} />
      ))}
    </g>
    {/* framed print, right of centre — a small moon over a dark skyline */}
    <g>
      <rect x={1090} y={360} width={150} height={180} fill="#2A2E3A" stroke="#8A7A5A" strokeWidth={5} />
      <rect x={1102} y={372} width={126} height={156} fill="#1E2436" />
      <circle cx={1165} cy={420} r={22} fill="#FFE2B0" />
      <path d="M 1102 500 L 1140 470 L 1175 498 L 1205 478 L 1228 500 L 1228 528 L 1102 528 Z" fill="#0B0816" />
    </g>
    {[0, 1, 2].map((i) => (
      <g key={i}>
        <rect x={360 + i * 380} y={60} width={300} height={86} rx={8} fill="#C9D6E8" stroke="#B8B2A4" strokeWidth={3} />
        <ellipse cx={510 + i * 380} cy={103} rx={150} ry={40} fill={MOONLIGHT} opacity={0.35 + 0.06 * Math.sin(t / 30 + i)} />
      </g>
    ))}
    {/* ceiling grid lines between the panels */}
    {[340, 680, 1020, 1360].map((x) => (
      <path key={x} d={`M ${x} 0 L ${x} 150`} stroke="#B8B2A4" strokeWidth={2} opacity={0.8} />
    ))}
    {door ? (
      <g>
        <rect x={1500} y={240} width={280} height={636} fill="#3A3340" stroke="#1E1824" strokeWidth={6} />
        <rect x={1520} y={260} width={240} height={596} fill="#241E2C" />
        <circle cx={1740} cy={560} r={10} fill="#8A7A5A" stroke="#1E1824" strokeWidth={4} />
      </g>
    ) : null}
    {bed ? (
      <g>
        {/* platform bed, knee height: mattress top v=0.79 (y=853), short legs to the floor */}
        <rect x={300} y={853} width={420} height={23} fill="#EFE3C8" stroke={INK} strokeWidth={4} />
        <rect x={300} y={812} width={420} height={41} fill="#D8CFC0" stroke={INK} strokeWidth={4} />
        <rect x={308} y={853} width={404} height={23} fill="#5A4A6A" stroke={INK} strokeWidth={3} />
        <path d="M 320 812 Q 380 770 440 812 L 440 830 L 320 830 Z" fill="#F6EFE3" stroke={INK} strokeWidth={4} />
      </g>
    ) : null}
  </g>
);

/** S38-S40: the time machine — tall rounded device, dark slate, amber lights
    (the accent, on the focal element), a dial and a glowing ring. */
export const TimeMachine: React.FC<{ t: number; flash?: boolean }> = ({ t, flash = false }) => (
  <g>
    <rect x={1060} y={280} width={220} height={596} rx={26} fill="#2E3444" stroke={INK} strokeWidth={6} />
    <rect x={1080} y={300} width={180} height={120} rx={14} fill="#14101C" stroke={AMBER} strokeWidth={3} />
    <circle cx={1170} cy={360} r={34} fill={flash ? '#FFFFFF' : AMBER} opacity={flash ? 1 : 0.85 + 0.15 * Math.sin(t / 12)} />
    <circle cx={1170} cy={360} r={52} fill="none" stroke={AMBER} strokeWidth={3} opacity={0.5} />
    {[0, 1, 2, 3].map((i) => (
      <circle key={i} cx={1100 + i * 46} cy={470} r={10} fill={i % 2 ? AMBER : '#7FD4FF'} opacity={0.6 + 0.4 * Math.sin(t / 15 + i * 2)} />
    ))}
    <rect x={1090} y={520} width={160} height={14} rx={7} fill="#454C60" />
    <rect x={1090} y={520} width={160 * (0.5 + 0.5 * Math.sin(t / 40))} height={14} rx={7} fill={AMBER} />
    <rect x={1060} y={876} width={220} height={18} fill={INK} />
  </g>
);

/** S23: Mars — red sky, red dust ground at v=0.80, habitat dome + boxes.
    STYLE LOCK (Nov 14): finished, not flat — stars, distant mesas on the
    horizon, rocks and rover tracks on the dust, lit dome windows, a flag. */
export const MarsGround: React.FC = () => (
  <g>
    <rect x={0} y={0} width={1920} height={864} fill="#C96A4A" />
    {/* stars in the thin Martian sky */}
    {Array.from({ length: 28 }).map((_, i) => (
      <circle key={i} cx={(i * 397) % 1920} cy={(i * 173) % 380 + 30} r={1.5 + (i % 3)} fill="#FFE2B0" opacity={0.35 + 0.35 * ((i * 7) % 10) / 10} />
    ))}
    <circle cx={1560} cy={180} r={70} fill="#FFE2B0" opacity={0.9} />
    <circle cx={1560} cy={180} r={110} fill="#FFC978" opacity={0.3} />
    {/* distant mesas on the horizon */}
    <path d="M 80 864 L 120 800 L 340 800 L 380 864 Z" fill="#7A3A28" />
    <path d="M 1500 864 L 1540 806 L 1780 806 L 1830 864 Z" fill="#7A3A28" />
    <path d="M 200 864 L 230 824 L 320 824 L 350 864 Z" fill="#8A4A34" />
    <rect x={0} y={864} width={1920} height={216} fill="#8A4A34" />
    <ellipse cx={960} cy={880} rx={900} ry={26} fill="#6E3828" opacity={0.6} />
    {/* rover tracks curving across the dust */}
    <path d="M 100 1080 Q 600 960 1100 1020 Q 1500 1060 1900 980" stroke="#5A2E20" strokeWidth={6} fill="none" strokeDasharray="26 18" opacity={0.7} />
    <path d="M 100 1040 Q 600 920 1100 980 Q 1500 1020 1900 940" stroke="#5A2E20" strokeWidth={6} fill="none" strokeDasharray="26 18" opacity={0.5} />
    {/* rocks on the dust */}
    {[[200, 950, 26], [500, 1010, 18], [1500, 980, 22], [1750, 940, 16], [900, 1030, 14], [80, 1010, 20]].map(([cx, cy, r], i) => (
      <ellipse key={i} cx={cx} cy={cy} rx={r} ry={r * 0.55} fill="#6E3828" stroke="#4A2418" strokeWidth={2} />
    ))}
    <path d="M 700 864 A 260 260 0 0 1 1220 864 Z" fill="#D8D2C0" stroke={INK} strokeWidth={5} />
    <path d="M 700 864 A 260 260 0 0 1 1220 864" fill="none" stroke="#8A8EA6" strokeWidth={4} opacity={0.7} />
    {/* lit dome windows + antenna light */}
    {[820, 960, 1100].map((x) => (
      <rect key={x} x={x} y={760} width={36} height={48} rx={6} fill="#FFE2B0" stroke={INK} strokeWidth={3} />
    ))}
    <line x1={960} y1={606} x2={960} y2={540} stroke={INK} strokeWidth={4} />
    <circle cx={960} cy={532} r={9} fill={AMBER} stroke={INK} strokeWidth={3} />
    <rect x={940} y={700} width={40} height={164} fill="#454C60" stroke={INK} strokeWidth={4} />
    <rect x={1300} y={720} width={260} height={144} fill="#5A4636" stroke={INK} strokeWidth={5} />
    <rect x={360} y={740} width={200} height={124} fill="#5A4636" stroke={INK} strokeWidth={5} />
    {/* a small flag by the habitat */}
    <line x1={1650} y1={864} x2={1650} y2={780} stroke={INK} strokeWidth={4} />
    <path d="M 1650 782 L 1700 792 L 1650 804 Z" fill={AMBER} stroke={INK} strokeWidth={3} />
  </g>
);

/** S28-S34: the noodle stall — awning, counter, steam, bowls. Sits on the
    street floor (v=0.80); the counter front is at y≈700-864. STYLE LOCK
    (Nov 14, Javion — dialogue sample v3 is Mara's stall): the sign says
    NOODLES (no blank banners, ever), paper lanterns hang under the awning
    (one big amber, glowing), a steaming pot with chopsticks sits on the
    counter, jars + sauce bottle + herb bowl + stacked bowls finish it, towels
    hang on hooks at the sides. */
export const NoodleStall: React.FC<{ t: number }> = ({ t }) => (
  <g>
    {/* the NOODLES sign board above the awning — amber letters, dark board */}
    <g>
      <rect x={770} y={168} width={380} height={84} rx={10} fill="#2A3A44" stroke="#1E1824" strokeWidth={5} />
      <text x={960} y={230} textAnchor="middle" fontFamily={FONT.title} fontWeight={700} fontSize={62} letterSpacing={4} fill={AMBER}>
        NOODLES
      </text>
      {[[788, 186], [1132, 186], [788, 234], [1132, 234]].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={5} fill="#8A7A5A" stroke="#1E1824" strokeWidth={2} />
      ))}
    </g>
    <polygon points="560,300 1360,300 1300,380 620,380" fill="#C0392B" stroke={INK} strokeWidth={5} />
    <polygon points="560,300 1360,300 1300,380 620,380" fill="none" stroke="#F6EFE3" strokeWidth={3} strokeDasharray="40 30" opacity={0.5} />
    {/* string lights under the awning — warm bulbs, the noodle-stall sample's signature */}
    <path d="M 600 392 Q 960 424 1320 392" fill="none" stroke="#3A2E1E" strokeWidth={3} />
    {[660, 750, 840, 930, 1020, 1110, 1200, 1290].map((x, i) => (
      <circle key={i} cx={x} cy={398 + (i % 2 ? 12 : 6)} r={7} fill="#FFC978" opacity={0.95} />
    ))}
    {/* hanging paper lanterns under the awning — one big amber, glowing */}
    <g>
      <line x1={960} y1={380} x2={960} y2={408} stroke={INK} strokeWidth={4} />
      <ellipse cx={960} cy={470} rx={86} ry={70} fill={AMBER} opacity={0.25} />
      <circle cx={960} cy={466} r={52} fill={AMBER} stroke={INK} strokeWidth={4} />
      <path d="M 912 440 Q 960 466 1008 440 M 908 466 L 1012 466 M 912 492 Q 960 466 1008 492" stroke="#8A5A00" strokeWidth={3} fill="none" />
      <rect x={946} y={410} width={28} height={12} fill="#8A5A00" stroke={INK} strokeWidth={3} />
    </g>
    {[[700], [1220]].map(([cx], i) => (
      <g key={i}>
        <line x1={cx} y1={380} x2={cx} y2={400} stroke={INK} strokeWidth={4} />
        <rect x={cx - 30} y={400} width={60} height={64} rx={14} fill="#5A6A7A" stroke={INK} strokeWidth={4} />
        <path d={`M ${cx - 30} 420 L ${cx + 30} 420 M ${cx - 30} 442 L ${cx + 30} 442`} stroke="#3A4654" strokeWidth={3} />
      </g>
    ))}
    {/* towels on hooks at the stall sides */}
    {[[606], [1334]].map(([cx], i) => (
      <g key={i}>
        <circle cx={cx} cy={424} r={8} fill="none" stroke={INK} strokeWidth={4} />
        <rect x={cx - 24} y={432} width={48} height={92} rx={6} fill="#EFE2CC" stroke={INK} strokeWidth={3} />
        <path d={`M ${cx - 24} 460 L ${cx + 24} 460`} stroke="#B8A888" strokeWidth={3} />
      </g>
    ))}
    <rect x={600} y={700} width={720} height={164} fill="#7A5747" stroke={INK} strokeWidth={5} />
    <rect x={600} y={700} width={720} height={20} fill="#5B4038" />
    {/* counter front panel seams */}
    {[820, 1040, 1240].map((x) => (
      <path key={x} d={`M ${x} 720 L ${x} 864`} stroke="#5B4038" strokeWidth={3} />
    ))}
    {/* paper lanterns hanging along the counter front — the sample's warmth */}
    {[750, 960, 1170].map((x) => (
      <g key={x}>
        <line x1={x} y1={700} x2={x} y2={716} stroke="#3A2E1E" strokeWidth={3} />
        <ellipse cx={x} cy={740} rx={20} ry={26} fill="#FFC978" stroke={INK} strokeWidth={3} />
        <line x1={x - 13} y1={730} x2={x + 13} y2={730} stroke="#E8A33A" strokeWidth={2} />
        <line x1={x - 13} y1={750} x2={x + 13} y2={750} stroke="#E8A33A" strokeWidth={2} />
      </g>
    ))}
    {/* jars, left of the pot */}
    {[0, 1].map((i) => (
      <g key={i}>
        <rect x={636 + i * 52} y={648} width={44} height={52} rx={6} fill="#C9D6DE" stroke={INK} strokeWidth={3} />
        <rect x={636 + i * 52} y={648} width={44} height={12} rx={4} fill="#8A5A3A" stroke={INK} strokeWidth={3} />
        <circle cx={658 + i * 52} cy={682} r={8} fill="#D96A5F" opacity={0.8} />
      </g>
    ))}
    {/* the steaming pot with chopsticks */}
    <g>
      <rect x={796} y={640} width={168} height={60} rx={10} fill="#6A6A72" stroke={INK} strokeWidth={4} />
      <ellipse cx={880} cy={640} rx={84} ry={14} fill="#8A8A92" stroke={INK} strokeWidth={3} />
      <path d="M 820 640 Q 850 628 880 640 Q 910 652 940 640" stroke="#F2EAD8" strokeWidth={4} fill="none" />
      <line x1={906} y1={606} x2={952} y2={556} stroke="#8A6A4A" strokeWidth={5} strokeLinecap="round" />
      <line x1={922} y1={610} x2={964} y2={566} stroke="#8A6A4A" strokeWidth={5} strokeLinecap="round" />
    </g>
    {/* a bowl on the counter */}
    <g>
      <ellipse cx={1020} cy={690} rx={48} ry={14} fill="#F2EAD8" stroke={INK} strokeWidth={4} />
      <path d="M 1000 686 Q 1020 676 1040 686" stroke="#8A5A3A" strokeWidth={4} fill="none" />
    </g>
    {/* sauce bottle + herb bowl + stacked bowls, right end */}
    <g>
      <rect x={1088} y={636} width={26} height={64} rx={8} fill="#8A5A3A" stroke={INK} strokeWidth={3} />
      <rect x={1094} y={622} width={14} height={16} rx={4} fill="#5A3A28" stroke={INK} strokeWidth={3} />
      <rect x={1088} y={660} width={26} height={18} fill="#EFE2CC" stroke={INK} strokeWidth={2} />
    </g>
    <g>
      <path d="M 1130 676 Q 1130 700 1154 700 Q 1178 700 1178 676 Z" fill="#F2EAD8" stroke={INK} strokeWidth={3} />
      <circle cx={1146} cy={676} r={5} fill="#7FA97A" />
      <circle cx={1160} cy={672} r={5} fill="#5A8A5A" />
      <circle cx={1172} cy={678} r={5} fill="#7FA97A" />
    </g>
    {[0, 1, 2].map((i) => (
      <ellipse key={i} cx={1252} cy={692 - i * 12} rx={44} ry={10} fill="#F2EAD8" stroke={INK} strokeWidth={3} />
    ))}
    {[0, 1, 2].map((i) => (
      <path key={i} d={`M ${820 + i * 180} ${640 - 10 * Math.sin(t / 20 + i)} Q ${800 + i * 180} ${600 - 10 * Math.sin(t / 20 + i)} ${830 + i * 180} ${566 - 10 * Math.sin(t / 20 + i)}`} stroke="#F6EFE3" strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.6} />
    ))}
  </g>
);

/** S5-S8: the seawall — a long concrete wall across the frame, water glinting
    beyond it, street in front. Wall top at v=0.648 (y=700). STYLE LOCK
    (Nov 14): finished, not flat — railing posts on the wall top, gulls, a
    distant boat, wall seams and a waterline stain, a lifebuoy on the face. */
export const SeaWall: React.FC<{ t: number; water?: boolean }> = ({ t, water = true }) => (
  <g>
    {water ? (
      <g>
        <rect x={0} y={560} width={1920} height={140} fill="#608EAA" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <path key={i} d={`M ${200 + i * 320} ${600 + 20 * Math.sin(t / 25 + i)} Q ${260 + i * 320} ${590 + 20 * Math.sin(t / 25 + i)} ${320 + i * 320} ${600 + 20 * Math.sin(t / 25 + i)}`} stroke="#BFE3F0" strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.8} />
        ))}
        {/* a distant boat on the water */}
        <g>
          <path d="M 1480 640 L 1560 640 L 1540 668 L 1500 668 Z" fill="#3A3440" stroke={INK} strokeWidth={3} />
          <line x1={1520} y1={640} x2={1520} y2={590} stroke={INK} strokeWidth={4} />
          <path d="M 1520 592 L 1552 636 L 1520 636 Z" fill="#F6EFE3" stroke={INK} strokeWidth={3} />
        </g>
        {/* gulls over the water */}
        {[[420, 500], [700, 470], [1080, 510]].map(([cx, cy], i) => (
          <path key={i} d={`M ${cx - 16} ${cy} Q ${cx - 6} ${cy - 10} ${cx} ${cy} Q ${cx + 6} ${cy - 10} ${cx + 16} ${cy}`} stroke="#1E1824" strokeWidth={3} fill="none" strokeLinecap="round" />
        ))}
      </g>
    ) : null}
    <rect x={0} y={700} width={1920} height={176} fill="#8A8A8A" stroke={INK} strokeWidth={5} />
    <rect x={0} y={700} width={1920} height={18} fill="#6E6E6E" />
    <path d="M 0 790 H 1920 M 0 840 H 1920" stroke="#6E6E6E" strokeWidth={3} />
    {/* wall seams + waterline stain at the base */}
    {[480, 960, 1440].map((x) => (
      <path key={x} d={`M ${x} 718 L ${x} 876`} stroke="#6E6E6E" strokeWidth={3} opacity={0.8} />
    ))}
    <rect x={0} y={852} width={1920} height={24} fill="#5A5A5A" opacity={0.7} />
    {/* railing posts + top rail along the wall top */}
    {[200, 600, 1000, 1400, 1800].map((x) => (
      <rect key={x} x={x - 4} y={648} width={8} height={52} fill="#4A4A4A" stroke={INK} strokeWidth={2} />
    ))}
    <rect x={0} y={642} width={1920} height={10} fill="#4A4A4A" stroke={INK} strokeWidth={2} />
    {/* lifebuoy ring on the wall face */}
    <g>
      <circle cx={300} cy={790} r={26} fill="#F6EFE3" stroke={INK} strokeWidth={4} />
      <circle cx={300} cy={790} r={13} fill="#8A8A8A" stroke={INK} strokeWidth={3} />
      {[45, 135, 225, 315].map((a, i) => {
        const r = (a * Math.PI) / 180;
        return <path key={i} d={`M ${300 + Math.cos(r) * 13} ${790 + Math.sin(r) * 13} L ${300 + Math.cos(r) * 26} ${790 + Math.sin(r) * 26}`} stroke="#C0392B" strokeWidth={9} />;
      })}
    </g>
  </g>
);

/** S22/S26/S27: the night sky — moon + glow, stars, a two-depth city skyline
    with lit windows, dusk haze on the horizon, dark ground at v=0.80.
    STYLE LOCK (Nov 14): no empty star-field — the Detective in S27 stands
    against a finished night city, not a blank dark rect. */
export const NightSky: React.FC = () => (
  <g>
    <rect x={0} y={0} width={1920} height={864} fill="#0B0816" />
    {/* dusk haze low on the horizon */}
    <rect x={0} y={560} width={1920} height={304} fill="#1E2436" opacity={0.7} />
    {/* the moon + glow, upper LEFT — clear of the timer chip (top-right, S27)
        and clear of the red dot's path (y 280, S22) */}
    <circle cx={300} cy={180} r={110} fill="#FFC978" opacity={0.25} />
    <circle cx={300} cy={180} r={64} fill="#FFE2B0" opacity={0.95} />
    <circle cx={280} cy={165} r={12} fill="#E8C88A" opacity={0.7} />
    <circle cx={320} cy={195} r={8} fill="#E8C88A" opacity={0.7} />
    {/* stars */}
    {Array.from({ length: 60 }).map((_, i) => (
      <circle key={i} cx={(i * 337) % 1920} cy={(i * 173) % 700 + 40} r={2 + (i % 3)} fill="#F6EFE3" opacity={0.4 + 0.4 * ((i * 7) % 10) / 10} />
    ))}
    {/* far city skyline, lit windows */}
    <path d="M 0 864 L 0 720 L 120 720 L 120 660 L 260 660 L 260 740 L 420 740 L 420 620 L 560 620 L 560 720 L 700 720 L 700 680 L 860 680 L 860 760 L 1020 760 L 1020 700 L 1180 700 L 1180 640 L 1340 640 L 1340 730 L 1500 730 L 1500 670 L 1660 670 L 1660 740 L 1800 740 L 1800 700 L 1920 700 L 1920 864 Z" fill="#14101C" />
    {[[180, 690], [480, 660], [760, 710], [1080, 730], [1240, 680], [1560, 700], [1720, 710], [300, 700], [900, 720], [1400, 760]].map(([x, y], i) => (
      <rect key={i} x={x} y={y} width={14} height={20} fill="#FFC978" opacity={0.85} />
    ))}
    {/* near skyline, darker */}
    <path d="M 0 864 L 0 800 L 200 800 L 200 760 L 420 760 L 420 820 L 640 820 L 640 780 L 900 780 L 900 830 L 1200 830 L 1200 790 L 1500 790 L 1500 840 L 1750 840 L 1750 800 L 1920 800 L 1920 864 Z" fill="#0A0710" />
    <rect x={0} y={864} width={1920} height={216} fill="#1E1824" />
  </g>
);

// ---------------------------------------------------------------------------
// Scene durations (seconds) — from the script's word counts at 0.385 s/word,
// min 4s, total 623.8s. S43 is the 4s end card.
// ---------------------------------------------------------------------------

const DUR: Record<string, number> = {
  S1: 4.5, S2: 4.5, S3: 31.0, S4: 9.1, S5: 17.7, S6: 16.6, S7: 14.7, S8: 14.0,
  S9: 9.1, S10: 6.8, S11: 17.7, S12: 13.2, S13: 21.9, S14: 13.2, S15: 16.6,
  S16: 14.0, S17: 23.4, S18: 20.0, S19: 18.5, S20: 21.1, S21: 17.7, S22: 10.2,
  S23: 16.2, S24: 24.2, S25: 21.1, S26: 11.0, S27: 19.6, S28: 10.6, S29: 3.9,
  S30: 4.5, S31: 3.9, S32: 3.9, S33: 3.9, S34: 13.6, S35: 17.4, S36: 29.5,
  S37: 14.7, S38: 10.6, S39: 19.3, S40: 9.8, S41: 11.0, S42: 39.6, S43: 4.0,
};

// A scene's local clock in frames: f = t * 30, len = duration * 30.
const F = (api: { t: number; fps: number }) => api.t * api.fps;

// ===========================================================================
// COLD OPEN
// ===========================================================================

// S1 — Jake in the white room, ceiling panels glowing soft blue. Slow push-in.
// Detective sneaks behind the door frame, in shadow. Jake stands, puzzled,
// one hand rising to his head (single eased move, >=15 frames, hold).
defineScene({
  id: 'S1',
  durationSec: DUR.S1,
  characters: [
    { who: 'jake', x: 0.5, feetY: ROOM_FLOOR_V },
    { who: 'detective', x: 0.85, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const p = pose('S1', 'jake', f, [
      { f: 0, p: { ...basePose, x: 960, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, expr: 'puzzled' } },
      { f: 60, p: { ...basePose, x: 960, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, expr: 'puzzled' } },
      { f: 120, p: { ...basePose, x: 960, y: standY(1, ROOM_FLOOR_V), scale: 1, ...THINK, expr: 'puzzled' } },
      { f: len, p: { ...basePose, x: 960, y: standY(1, ROOM_FLOOR_V), scale: 1, ...THINK, expr: 'puzzled' } },
    ]);
    const face = faceAt(f, [[0, 'puzzled']]);
    const zoom = kf(f, [[0, 1.0], [len, 1.1]]);
    return (
      <g>
        <g transform={camT(960, 560, zoom)}>
          <WhiteRoom t={f} bed door />
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...p, ...face, facing: 1 }} rimId="rimBlue" shadow={1} />)}
          <g opacity={0.55}>
            {cast('detective', <Hero slim look={LOOKS.detective} pose={{ ...basePose, x: 1500, y: standY(0.55, ROOM_FLOOR_V), scale: 0.55, ...STAND, expr: 'neutral', look: 0 }} rimId="rimBlue" shadow={1} />)}
          </g>
        </g>
      </g>
    );
  },
});

// S2 — Phone close-up: the date reads November 14, 2126. POV shift to Jake's
// hand holding it. No characters on screen (a hand only) — the phone IS the shot.
defineScene({
  id: 'S2',
  durationSec: DUR.S2,
  characters: [],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const zoom = kf(f, [[0, 1.0], [len, 1.35]]);
    const camY = kf(f, [[0, 540], [len, 540]]);
    return (
      <g>
        <g transform={camT(960, camY, zoom)}>
          <rect x={0} y={0} width={1920} height={1080} fill="#14101C" />
          <rect x={660} y={120} width={600} height={840} rx={48} fill="#0B0816" stroke="#454C60" strokeWidth={6} />
          <rect x={690} y={150} width={540} height={780} rx={30} fill="#1E1824" />
          <text x={960} y={420} textAnchor="middle" fontFamily={FONT.hand} fontSize={92} fill={CREAM}>
            November 14
          </text>
          <text x={960} y={540} textAnchor="middle" fontFamily={FONT.title} fontWeight={700} fontSize={150} fill={AMBER}>
            2126
          </text>
          <text x={960} y={640} textAnchor="middle" fontFamily={FONT.ui} fontSize={40} fill="#8A8EA6">
            100 YEARS FROM TODAY
          </text>
          {/* Jake's hand at the phone's bottom edge — one wide palm shape, no fingers */}
          <ellipse cx={960} cy={1020} rx={170} ry={56} fill={INK} />
        </g>
      </g>
    );
  },
});

// S3 — Detective faces camera. Timer 23:59:59. The 24-hour rule lands here.
// One gesture: point at the timer (bare hand, held), then lower. The glass
// stays DOWN — this is a rule statement in a room, not a close examination
// (magnifying-glass rule, Nov 14).
defineScene({
  id: 'S3',
  durationSec: DUR.S3,
  characters: [{ who: 'detective', x: 0.5, feetY: ROOM_FLOOR_V }],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const p = pose('S3', 'detective', f, [
      { f: 0, p: { ...basePose, x: 960, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, expr: 'neutral' } },
      { f: 90, p: { ...basePose, x: 960, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, expr: 'neutral' } },
      { f: 180, p: { ...basePose, x: 960, y: standY(1, ROOM_FLOOR_V), scale: 1, ...POINT, expr: 'neutral' } },
      { f: 750, p: { ...basePose, x: 960, y: standY(1, ROOM_FLOOR_V), scale: 1, ...POINT, expr: 'smug' } },
      { f: 840, p: { ...basePose, x: 960, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, expr: 'neutral' } },
      { f: len, p: { ...basePose, x: 960, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, expr: 'neutral' } },
    ]);
    const face = faceAt(f, [[0, 'neutral'], [510, 'smug'], [840, 'neutral']]);
    return (
      <g>
        <g transform={camT(960, 560, 1.0)}>
          <WhiteRoom t={f} />
          {cast('detective', <Hero slim look={LOOKS.detective} pose={{ ...p, ...face, facing: 1 }} rimId="rimBlue" shadow={1} />)}
        </g>
        <TimerChip start="23:59:59" tSec={api.t} />
        <Caption text="24 HOURS. MIDNIGHT, OR YOU STAY FOREVER." y={990} size={40} />
      </g>
    );
  },
});

// ===========================================================================
// CHAPTER 1 — THE WORLD MOVED
// ===========================================================================

// S4 — Jake steps out onto a street. Water glints at the end of it. Slow pull
// back. Detective sneaks behind a doorway at the left edge.
defineScene({
  id: 'S4',
  durationSec: DUR.S4,
  characters: [
    { who: 'jake', x: 0.5, feetY: STREET_FLOOR_V },
    { who: 'detective', x: 0.06, feetY: STREET_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const p = pose('S4', 'jake', f, [
      { f: 0, p: { ...basePose, x: 880, y: standY(1, STREET_FLOOR_V), scale: 1, ...WALK(1), expr: 'puzzled' } },
      { f: 120, p: { ...basePose, x: 960, y: standY(1, STREET_FLOOR_V), scale: 1, ...WALK(1), expr: 'puzzled' } },
      { f: 180, p: { ...basePose, x: 960, y: standY(1, STREET_FLOOR_V), scale: 1, ...STAND, expr: 'puzzled' } },
      { f: len, p: { ...basePose, x: 960, y: standY(1, STREET_FLOOR_V), scale: 1, ...STAND, expr: 'puzzled' } },
    ]);
    const face = faceAt(f, [[0, 'puzzled']]);
    const zoom = kf(f, [[0, 1.14], [len, 1.0]]);
    return (
      <g>
        <g transform={camT(960, 560, zoom)}>
          <Exterior t={f} id="s4" veil={0.35} />
          <SeaWall t={f} />
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...p, ...face, facing: 1 }} rimId="rimBlue" shadow={1} />)}
          <g opacity={0.55}>
            {cast('detective', <Hero slim look={LOOKS.detective} pose={{ ...basePose, x: 130, y: standY(0.5, STREET_FLOOR_V), scale: 0.5, ...STAND, expr: 'neutral', look: 0 }} rimId="rimBlue" shadow={1} />)}
          </g>
        </g>
        <ChapterCard t={f} kicker="CHAPTER 1" title="THE WORLD MOVED" accentWord="MOVED" />
      </g>
    );
  },
});

// S5 — The old boardwalk, now a sea wall. People walk on top of it. A kid
// fishes off the wall. Gentle pan right. Floor = the wall top (v=0.648);
// Jake stands on the street below it (feet BELOW the floor line — passes).
defineScene({
  id: 'S5',
  durationSec: DUR.S5,
  characters: [
    { who: 'jake', x: 0.35, feetY: STREET_FLOOR_V },
    { who: 'kid', x: 0.7, feetY: WALL_TOP_V },
    { who: 'walker1', x: 0.55, feetY: WALL_TOP_V },
    { who: 'walker2', x: 0.85, feetY: WALL_TOP_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const pj = pose('S5', 'jake', f, [
      { f: 0, p: { ...basePose, x: 672, y: standY(1, STREET_FLOOR_V), scale: 1, ...STAND, expr: 'puzzled' } },
      { f: len, p: { ...basePose, x: 672, y: standY(1, STREET_FLOOR_V), scale: 1, ...STAND, expr: 'puzzled' } },
    ]);
    // The kid sits ON the wall top (y=700), feet dangling against the wall
    // face — hip just above the wall top, legs too short to reach the street.
    const pk = pose('S5', 'kid', f, [
      { f: 0, p: { ...basePose, x: 1344, y: 690, scale: 0.45, ...SIT, expr: 'happy' } },
      { f: len, p: { ...basePose, x: 1344, y: 690, scale: 0.45, ...SIT, expr: 'happy' } },
    ]);
    const w1 = pose('S5', 'walker1', f, [
      { f: 0, p: { ...basePose, x: 1000, y: standY(0.6, WALL_TOP_V), scale: 0.6, ...WALK(1), expr: 'neutral' } },
      { f: len, p: { ...basePose, x: 1120, y: standY(0.6, WALL_TOP_V), scale: 0.6, ...WALK(1), expr: 'neutral' } },
    ]);
    const w2 = pose('S5', 'walker2', f, [
      { f: 0, p: { ...basePose, x: 1560, y: standY(0.6, WALL_TOP_V), scale: 0.6, ...WALK(-1), expr: 'neutral' } },
      { f: len, p: { ...basePose, x: 1480, y: standY(0.6, WALL_TOP_V), scale: 0.6, ...WALK(-1), expr: 'neutral' } },
    ]);
    const face = faceAt(f, [[0, 'puzzled']]);
    const faceK = faceAt(f, [[0, 'happy']]);
    const camX = kf(f, [[0, 900], [len, 1020]]);
    return (
      <g>
        <g transform={camT(camX, 560, 1.0)}>
          <Exterior t={f} id="s5" veil={0.35} />
          <SeaWall t={f} />
          {cast('walker1', <Hero slim look={LOOKS.teenager} pose={{ ...w1, ...faceK, facing: 1 }} rimId="rimBlue" shadow={1} />)}
          {cast('walker2', <Hero slim look={{ ...LOOKS.guestA, hair: 'bun', hairC: '#4A3226' }} pose={{ ...w2, ...faceK, facing: -1 }} rimId="rimBlue" shadow={1} />)}
          {cast('kid', <Hero slim look={LOOKS.student} pose={{ ...pk, ...faceK, facing: 1 }} rimId="rimBlue" shadow={1} />)}
          {/* fishing rod: angles up over the wall into the water, line drops in */}
          <g stroke="#8A6A4A" strokeWidth={5} strokeLinecap="round">
            <line x1={1358} y1={648} x2={1452} y2={576} />
          </g>
          <g stroke="#D8CFC0" strokeWidth={2}>
            <line x1={1452} y1={576} x2={1462} y2={644} />
          </g>
          <circle cx={1462} cy={648} r={7} fill="#F39C12" stroke="#8A5A00" strokeWidth={2} />
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...pj, ...face, facing: 1 }} rimId="rimBlue" shadow={1} />)}
        </g>
      </g>
    );
  },
});

// S6 — Fact: "+0.28 to +1.01 m by 2100." Detective points at the number.
// Slow push-in. The Detective's point is one eased raise, then hold.
defineScene({
  id: 'S6',
  durationSec: DUR.S6,
  characters: [{ who: 'detective', x: 0.28, feetY: STREET_FLOOR_V }],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const p = pose('S6', 'detective', f, [
      { f: 0, p: { ...basePose, x: 540, y: standY(1, STREET_FLOOR_V), scale: 1, ...STAND, expr: 'neutral' } },
      { f: 60, p: { ...basePose, x: 540, y: standY(1, STREET_FLOOR_V), scale: 1, ...STAND, expr: 'neutral' } },
      { f: 150, p: { ...basePose, x: 540, y: standY(1, STREET_FLOOR_V), scale: 1, ...POINT, expr: 'neutral' } },
      { f: len, p: { ...basePose, x: 540, y: standY(1, STREET_FLOOR_V), scale: 1, ...POINT, expr: 'neutral' } },
    ]);
    const face = faceAt(f, [[0, 'neutral']]);
    const zoom = kf(f, [[0, 1.0], [len, 1.08]]);
    return (
      <g>
        <g transform={camT(960, 560, zoom)}>
          <Exterior t={f} id="s6" veil={0.35} />
          <SeaWall t={f} water={false} />
          {cast('detective', <Hero slim look={LOOKS.detective} pose={{ ...p, ...face, facing: 1 }} rimId="rimBlue" shadow={1} />)}
        </g>
        <FactText lines={['+0.28 to +1.01 m', 'BY 2100']} y={330} size={88} />
        <Caption text="IPCC — the world's climate scientists" y={980} size={36} />
      </g>
    );
  },
});

// S7 — A child splashes at the base of the wall. Jake watches, shoes dry by
// half a step. Hold still. The child is the only mover: one small splash
// arm, out and back once.
defineScene({
  id: 'S7',
  durationSec: DUR.S7,
  characters: [
    { who: 'jake', x: 0.62, feetY: STREET_FLOOR_V },
    { who: 'kid', x: 0.3, feetY: STREET_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const pj = pose('S7', 'jake', f, [
      { f: 0, p: { ...basePose, x: 1190, y: standY(1, STREET_FLOOR_V), scale: 1, ...STAND, expr: 'puzzled' } },
      { f: len, p: { ...basePose, x: 1190, y: standY(1, STREET_FLOOR_V), scale: 1, ...STAND, expr: 'puzzled' } },
    ]);
    const pk = pose('S7', 'kid', f, [
      { f: 0, p: { ...basePose, x: 576, y: standY(0.45, STREET_FLOOR_V), scale: 0.45, ...STAND, expr: 'happy' } },
      { f: 120, p: { ...basePose, x: 576, y: standY(0.45, STREET_FLOOR_V), scale: 0.45, ...STAND, expr: 'happy' } },
      { f: 210, p: { ...basePose, x: 576, y: standY(0.45, STREET_FLOOR_V), scale: 0.45, armL: { a: 4, b: 8 }, armR: { a: 80, b: 20 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 }, look: 0, headTilt: 0, tilt: 0, expr: 'happy' } },
      { f: 300, p: { ...basePose, x: 576, y: standY(0.45, STREET_FLOOR_V), scale: 0.45, ...STAND, expr: 'happy' } },
      { f: len, p: { ...basePose, x: 576, y: standY(0.45, STREET_FLOOR_V), scale: 0.45, ...STAND, expr: 'happy' } },
    ]);
    const faceJ = faceAt(f, [[0, 'puzzled']]);
    const faceK = faceAt(f, [[0, 'happy']]);
    const splash = f > 210 && f < 330 ? 1 : 0;
    return (
      <g>
        <g transform={camT(960, 560, 1.0)}>
          <Exterior t={f} id="s7" veil={0.35} />
          <SeaWall t={f} water={false} />
          <ellipse cx={576} cy={880} rx={90} ry={14} fill="#608EAA" opacity={0.8} />
          {splash ? (
            <g stroke="#BFE3F0" strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.9}>
              <path d="M 520 850 Q 540 820 560 850 M 590 850 Q 610 820 630 850" />
            </g>
          ) : null}
          {cast('kid', <Hero slim look={LOOKS.student} pose={{ ...pk, ...faceK, facing: 1 }} rimId="rimBlue" shadow={1} />)}
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...pj, ...faceJ, facing: -1 }} rimId="rimBlue" shadow={1} />)}
        </g>
      </g>
    );
  },
});

// S8 — Jake looks back at his street, then at the water. Slow push-in on Jake.
defineScene({
  id: 'S8',
  durationSec: DUR.S8,
  characters: [{ who: 'jake', x: 0.5, feetY: STREET_FLOOR_V }],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const p = pose('S8', 'jake', f, [
      { f: 0, p: { ...basePose, x: 960, y: standY(1, STREET_FLOOR_V), scale: 1, ...STAND, expr: 'worried', yaw: -0.6 } },
      { f: 150, p: { ...basePose, x: 960, y: standY(1, STREET_FLOOR_V), scale: 1, ...STAND, expr: 'worried', yaw: -0.6 } },
      { f: 260, p: { ...basePose, x: 960, y: standY(1, STREET_FLOOR_V), scale: 1, ...STAND, expr: 'worried', yaw: 0.6 } },
      { f: len, p: { ...basePose, x: 960, y: standY(1, STREET_FLOOR_V), scale: 1, ...STAND, expr: 'worried', yaw: 0.6 } },
    ]);
    const face = faceAt(f, [[0, 'worried']]);
    const zoom = kf(f, [[0, 1.0], [len, 1.12]]);
    return (
      <g>
        <g transform={camT(960, 560, zoom)}>
          <Exterior t={f} id="s8" veil={0.35} />
          <SeaWall t={f} />
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...p, ...face, facing: 1 }} rimId="rimBlue" shadow={1} />)}
        </g>
      </g>
    );
  },
});

// S9 — Detective faces camera. Timer 22:41:07. Hold still. Re-hook: the people.
defineScene({
  id: 'S9',
  durationSec: DUR.S9,
  characters: [{ who: 'detective', x: 0.5, feetY: STREET_FLOOR_V }],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const p = pose('S9', 'detective', f, [
      { f: 0, p: { ...basePose, x: 960, y: standY(1, STREET_FLOOR_V), scale: 1, ...STAND, expr: 'smug' } },
      { f: len, p: { ...basePose, x: 960, y: standY(1, STREET_FLOOR_V), scale: 1, ...STAND, expr: 'smug' } },
    ]);
    const face = faceAt(f, [[0, 'smug']]);
    return (
      <g>
        <g transform={camT(960, 560, 1.0)}>
          <Exterior t={f} id="s9" veil={0.4} />
          {cast('detective', <Hero slim look={LOOKS.detective} pose={{ ...p, ...face, facing: 1 }} rimId="rimBlue" shadow={1} />)}
        </g>
        <TimerChip start="22:41:07" tSec={api.t} />
      </g>
    );
  },
});

// S10 — A park. Old people playing chess. A few children. Nobody in a rush.
// Gentle pan left. Viewer question: how many people alive in 2126?
// Detective sneaks behind the bench at the right edge.
defineScene({
  id: 'S10',
  durationSec: DUR.S10,
  characters: [
    { who: 'oldman', x: 0.38, feetY: STREET_FLOOR_V },
    { who: 'teen', x: 0.55, feetY: STREET_FLOOR_V },
    { who: 'kid', x: 0.72, feetY: STREET_FLOOR_V },
    { who: 'detective', x: 0.92, feetY: STREET_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const po = pose('S10', 'oldman', f, [
      { f: 0, p: { ...basePose, x: 730, y: sitY(864, 0.9), scale: 0.9, ...SIT, expr: 'smug' } },
      { f: len, p: { ...basePose, x: 730, y: sitY(864, 0.9), scale: 0.9, ...SIT, expr: 'smug' } },
    ]);
    const pt = pose('S10', 'teen', f, [
      { f: 0, p: { ...basePose, x: 1056, y: sitY(864, 0.9), scale: 0.9, ...SIT, expr: 'worried' } },
      { f: len, p: { ...basePose, x: 1056, y: sitY(864, 0.9), scale: 0.9, ...SIT, expr: 'worried' } },
    ]);
    const pk = pose('S10', 'kid', f, [
      { f: 0, p: { ...basePose, x: 1382, y: standY(0.45, STREET_FLOOR_V), scale: 0.45, ...STAND, expr: 'happy' } },
      { f: len, p: { ...basePose, x: 1382, y: standY(0.45, STREET_FLOOR_V), scale: 0.45, ...STAND, expr: 'happy' } },
    ]);
    const faceO = faceAt(f, [[0, 'smug']]);
    const faceT = faceAt(f, [[0, 'worried']]);
    const faceK = faceAt(f, [[0, 'happy']]);
    const camX = kf(f, [[0, 1020], [len, 900]]);
    return (
      <g>
        <g transform={camT(camX, 560, 1.0)}>
          <Exterior t={f} id="s10" veil={0.3} />
          {/* chess table between the two players */}
          <rect x={880} y={700} width={160} height={164} fill="#7A5747" stroke={INK} strokeWidth={5} />
          <rect x={880} y={700} width={160} height={14} fill="#5B4038" />
          <rect x={910} y={716} width={100} height={100} fill="#F2EAD8" stroke={INK} strokeWidth={3} />
          {[0, 1].map((r) => [0, 1].map((c) => (
            <rect key={`${r}${c}`} x={910 + c * 50} y={716 + r * 50} width={50} height={50} fill={(r + c) % 2 ? '#2A2530' : '#F2EAD8'} opacity={(r + c) % 2 ? 0.9 : 1} />
          )))}
          {/* bench the players sit on — seat top at y=790, feet on the floor */}
          <rect x={660} y={790} width={560} height={18} fill="#8A7A5A" stroke={INK} strokeWidth={4} />
          <rect x={680} y={808} width={12} height={56} fill={INK} />
          <rect x={1188} y={808} width={12} height={56} fill={INK} />
          {cast('oldman', <Hero slim look={{ ...LOOKS.teacher, jacket: '#5A6A7A', jacketShade: '#46525F', accent: '#46525F', hair: 'sidepart', hairC: '#C8C8C8' }} pose={{ ...po, ...faceO, facing: 1 }} rimId="rimBlue" shadow={1} />)}
          {cast('teen', <Hero slim look={LOOKS.teenager} pose={{ ...pt, ...faceT, facing: -1 }} rimId="rimBlue" shadow={1} />)}
          {cast('kid', <Hero slim look={LOOKS.student} pose={{ ...pk, ...faceK, facing: 1 }} rimId="rimBlue" shadow={1} />)}
          <g opacity={0.55}>
            {cast('detective', <Hero slim look={LOOKS.detective} pose={{ ...basePose, x: 1766, y: standY(0.5, STREET_FLOOR_V), scale: 0.5, ...STAND, expr: 'neutral', look: 0 }} rimId="rimBlue" shadow={1} />)}
          </g>
        </g>
        <ChapterCard t={f} kicker="CHAPTER 2" title="THE PEOPLE CHANGED" accentWord="PEOPLE" />
        <Caption text="PAUSE AND GUESS — MORE PEOPLE, OR FEWER?" y={990} size={40} />
      </g>
    );
  },
});

// ===========================================================================
// CHAPTER 2 — THE PEOPLE CHANGED (continued)
// ===========================================================================

// S11 — Fact: "10.3 BILLION — peak, mid-2080s." Detective points. Slow push-in.
defineScene({
  id: 'S11',
  durationSec: DUR.S11,
  characters: [{ who: 'detective', x: 0.28, feetY: STREET_FLOOR_V }],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const p = pose('S11', 'detective', f, [
      { f: 0, p: { ...basePose, x: 540, y: standY(1, STREET_FLOOR_V), scale: 1, ...STAND, expr: 'neutral' } },
      { f: 60, p: { ...basePose, x: 540, y: standY(1, STREET_FLOOR_V), scale: 1, ...STAND, expr: 'neutral' } },
      { f: 150, p: { ...basePose, x: 540, y: standY(1, STREET_FLOOR_V), scale: 1, ...POINT, expr: 'neutral' } },
      { f: len, p: { ...basePose, x: 540, y: standY(1, STREET_FLOOR_V), scale: 1, ...POINT, expr: 'neutral' } },
    ]);
    const face = faceAt(f, [[0, 'neutral']]);
    const zoom = kf(f, [[0, 1.0], [len, 1.08]]);
    return (
      <g>
        <g transform={camT(960, 560, zoom)}>
          <Exterior t={f} id="s11" veil={0.3} />
          {cast('detective', <Hero slim look={LOOKS.detective} pose={{ ...p, ...face, facing: 1 }} rimId="rimBlue" shadow={1} />)}
        </g>
        <FactText lines={['10.3 BILLION', 'PEAK, MID-2080s']} y={330} size={88} />
        <Caption text="UNITED NATIONS — WORLD POPULATION PROSPECTS 2024" y={980} size={36} />
      </g>
    );
  },
});

// S12 — The chess players. One is 94 and sharp, beating a teenager. Hold still.
defineScene({
  id: 'S12',
  durationSec: DUR.S12,
  characters: [
    { who: 'oldman', x: 0.38, feetY: STREET_FLOOR_V },
    { who: 'teen', x: 0.55, feetY: STREET_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const po = pose('S12', 'oldman', f, [
      { f: 0, p: { ...basePose, x: 730, y: sitY(864, 0.9), scale: 0.9, ...SIT, expr: 'smug' } },
      { f: 180, p: { ...basePose, x: 730, y: sitY(864, 0.9), scale: 0.9, ...SIT, expr: 'smug' } },
      { f: 260, p: { ...basePose, x: 730, y: sitY(864, 0.9), scale: 0.9, armL: { a: 4, b: 8 }, armR: { a: 55, b: 30 }, legL: { a: 75, b: -75 }, legR: { a: 75, b: -75 }, look: 0, headTilt: 0, tilt: 0, expr: 'smug' } },
      { f: len, p: { ...basePose, x: 730, y: sitY(864, 0.9), scale: 0.9, armL: { a: 4, b: 8 }, armR: { a: 55, b: 30 }, legL: { a: 75, b: -75 }, legR: { a: 75, b: -75 }, look: 0, headTilt: 0, tilt: 0, expr: 'smug' } },
    ]);
    const pt = pose('S12', 'teen', f, [
      { f: 0, p: { ...basePose, x: 1056, y: sitY(864, 0.9), scale: 0.9, ...SIT, expr: 'worried' } },
      { f: len, p: { ...basePose, x: 1056, y: sitY(864, 0.9), scale: 0.9, ...SIT, expr: 'worried' } },
    ]);
    const faceO = faceAt(f, [[0, 'smug']]);
    const faceT = faceAt(f, [[0, 'worried']]);
    return (
      <g>
        <g transform={camT(960, 560, 1.0)}>
          <Exterior t={f} id="s12" veil={0.3} />
          <rect x={880} y={700} width={160} height={164} fill="#7A5747" stroke={INK} strokeWidth={5} />
          <rect x={880} y={700} width={160} height={14} fill="#5B4038" />
          <rect x={910} y={716} width={100} height={100} fill="#F2EAD8" stroke={INK} strokeWidth={3} />
          {[0, 1].map((r) => [0, 1].map((c) => (
            <rect key={`${r}${c}`} x={910 + c * 50} y={716 + r * 50} width={50} height={50} fill={(r + c) % 2 ? '#2A2530' : '#F2EAD8'} opacity={(r + c) % 2 ? 0.9 : 1} />
          )))}
          <rect x={660} y={790} width={560} height={18} fill="#8A7A5A" stroke={INK} strokeWidth={4} />
          <rect x={680} y={808} width={12} height={56} fill={INK} />
          <rect x={1188} y={808} width={12} height={56} fill={INK} />
          {cast('oldman', <Hero slim look={{ ...LOOKS.teacher, jacket: '#5A6A7A', jacketShade: '#46525F', accent: '#46525F', hair: 'sidepart', hairC: '#C8C8C8' }} pose={{ ...po, ...faceO, facing: 1 }} rimId="rimBlue" shadow={1} />)}
          {cast('teen', <Hero slim look={LOOKS.teenager} pose={{ ...pt, ...faceT, facing: -1 }} rimId="rimBlue" shadow={1} />)}
        </g>
      </g>
    );
  },
});

// S13 — Fact: "72.6 years (2019) → 77.1 (2050) → ~82 (2100)." Slow push-in.
defineScene({
  id: 'S13',
  durationSec: DUR.S13,
  characters: [{ who: 'detective', x: 0.28, feetY: STREET_FLOOR_V }],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const p = pose('S13', 'detective', f, [
      { f: 0, p: { ...basePose, x: 540, y: standY(1, STREET_FLOOR_V), scale: 1, ...STAND, expr: 'neutral' } },
      { f: 60, p: { ...basePose, x: 540, y: standY(1, STREET_FLOOR_V), scale: 1, ...STAND, expr: 'neutral' } },
      { f: 150, p: { ...basePose, x: 540, y: standY(1, STREET_FLOOR_V), scale: 1, ...POINT, expr: 'neutral' } },
      { f: len, p: { ...basePose, x: 540, y: standY(1, STREET_FLOOR_V), scale: 1, ...POINT, expr: 'neutral' } },
    ]);
    const face = faceAt(f, [[0, 'neutral']]);
    const zoom = kf(f, [[0, 1.0], [len, 1.08]]);
    return (
      <g>
        <g transform={camT(960, 560, zoom)}>
          <Exterior t={f} id="s13" veil={0.3} />
          {cast('detective', <Hero slim look={LOOKS.detective} pose={{ ...p, ...face, facing: 1 }} rimId="rimBlue" shadow={1} />)}
        </g>
        <FactText lines={['72.6 → 77.1 → ~82', 'YEARS OF LIFE']} y={330} size={84} />
        <Caption text="UN — LIFE EXPECTANCY 2019 → 2050 → 2100" y={980} size={36} />
      </g>
    );
  },
});

// S14 — Jake sits on a bench next to an old woman. She smiles. He smiles back,
// nervous. Hold still. Both seated, feet planted on the floor.
defineScene({
  id: 'S14',
  durationSec: DUR.S14,
  characters: [
    { who: 'jake', x: 0.38, feetY: STREET_FLOOR_V },
    { who: 'oldwoman', x: 0.58, feetY: STREET_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const pj = pose('S14', 'jake', f, [
      { f: 0, p: { ...basePose, x: 730, y: sitY(864, 1), scale: 1, ...SIT, expr: 'puzzled' } },
      { f: 150, p: { ...basePose, x: 730, y: sitY(864, 1), scale: 1, ...SIT, expr: 'puzzled' } },
      { f: 240, p: { ...basePose, x: 730, y: sitY(864, 1), scale: 1, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 75, b: -75 }, legR: { a: 75, b: -75 }, look: 0, headTilt: 6, tilt: 0, expr: 'happy' } },
      { f: len, p: { ...basePose, x: 730, y: sitY(864, 1), scale: 1, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 75, b: -75 }, legR: { a: 75, b: -75 }, look: 0, headTilt: 6, tilt: 0, expr: 'happy' } },
    ]);
    const pw = pose('S14', 'oldwoman', f, [
      { f: 0, p: { ...basePose, x: 1114, y: sitY(864, 0.9), scale: 0.9, ...SIT, expr: 'happy' } },
      { f: len, p: { ...basePose, x: 1114, y: sitY(864, 0.9), scale: 0.9, ...SIT, expr: 'happy' } },
    ]);
    const faceJ = faceAt(f, [[0, 'puzzled'], [240, 'happy']]);
    const faceW = faceAt(f, [[0, 'happy']]);
    return (
      <g>
        <g transform={camT(960, 560, 1.0)}>
          <Exterior t={f} id="s14" veil={0.3} />
          <rect x={660} y={790} width={560} height={18} fill="#8A7A5A" stroke={INK} strokeWidth={4} />
          <rect x={680} y={808} width={12} height={56} fill={INK} />
          <rect x={1188} y={808} width={12} height={56} fill={INK} />
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...pj, ...faceJ, facing: 1 }} rimId="rimBlue" shadow={1} />)}
          {cast('oldwoman', <Hero slim look={{ ...LOOKS.teacher, jacket: '#A87A8A', jacketShade: '#8A6270', accent: '#8A6270', hair: 'bun', hairC: '#C8C8C8' }} pose={{ ...pw, ...faceW, facing: -1 }} rimId="rimBlue" shadow={1} />)}
        </g>
      </g>
    );
  },
});

// S15 — Detective faces camera. Timer 20:12:44. Slow push-in. Re-hook: the lights.
defineScene({
  id: 'S15',
  durationSec: DUR.S15,
  characters: [{ who: 'detective', x: 0.5, feetY: STREET_FLOOR_V }],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const p = pose('S15', 'detective', f, [
      { f: 0, p: { ...basePose, x: 960, y: standY(1, STREET_FLOOR_V), scale: 1, ...STAND, expr: 'smug' } },
      { f: len, p: { ...basePose, x: 960, y: standY(1, STREET_FLOOR_V), scale: 1, ...STAND, expr: 'smug' } },
    ]);
    const face = faceAt(f, [[0, 'smug']]);
    const zoom = kf(f, [[0, 1.0], [len, 1.08]]);
    return (
      <g>
        <g transform={camT(960, 560, zoom)}>
          <Exterior t={f} id="s15" veil={0.4} />
          {cast('detective', <Hero slim look={LOOKS.detective} pose={{ ...p, ...face, facing: 1 }} rimId="rimBlue" shadow={1} />)}
        </g>
        <TimerChip start="20:12:44" tSec={api.t} />
      </g>
    );
  },
});

// ===========================================================================
// CHAPTER 3 — THE LIGHTS ARE DIFFERENT
// ===========================================================================

// S16 — Night. The city glows, but there are no smokestacks. Slow pull back.
// Detective sneaks at the street's left edge, in shadow.
// CROWD FLOW (Nov 14, Javion — the "overwhelmed" beat): the crowd walks in
// BOTH directions — two clear streams, half LEFT and half RIGHT in side
// profile, passing each other. Jake stands still in the MIDDLE FACING THE
// CAMERA while the flow crosses around him. NO front-facing pedestrians
// (nobody walking toward the camera), NO single-direction flow. The generator
// could not do this (it kept facing everyone at the camera) — the rig is the
// only place it can be done exactly. Two depth layers: the right-bound stream
// walks closer to camera (scale 1.0, feet v=0.83), the left-bound stream
// farther (scale 0.85, feet v=0.80). Every pedestrian is distinct — different
// jacket colour, different hair, different gear; never copies.
defineScene({
  id: 'S16',
  durationSec: DUR.S16,
  characters: [
    { who: 'jake', x: 0.5, feetY: STREET_FLOOR_V },
    { who: 'pedR1', x: 0.31, feetY: 0.83 },
    { who: 'pedR2', x: 0.43, feetY: 0.83 },
    { who: 'pedR3', x: 0.65, feetY: 0.83 },
    { who: 'pedL1', x: 0.72, feetY: STREET_FLOOR_V },
    { who: 'pedL2', x: 0.57, feetY: STREET_FLOOR_V },
    { who: 'pedL3', x: 0.38, feetY: STREET_FLOOR_V },
    { who: 'detective', x: 0.08, feetY: STREET_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const p = pose('S16', 'jake', f, [
      { f: 0, p: { ...basePose, x: 960, y: standY(1, STREET_FLOOR_V), scale: 1, ...STAND, expr: 'puzzled' } },
      { f: len, p: { ...basePose, x: 960, y: standY(1, STREET_FLOOR_V), scale: 1, ...STAND, expr: 'puzzled' } },
    ]);
    const face = faceAt(f, [[0, 'puzzled']]);
    const faceN = faceAt(f, [[0, 'neutral']]);
    // Right-bound stream (closer to camera): teal, red, yellow — all distinct.
    const pR1 = pose('S16', 'pedR1', f, [
      { f: 0, p: { ...basePose, x: 200, y: standY(1, 0.83), scale: 1, ...WALK(1), expr: 'neutral' } },
      { f: len, p: { ...basePose, x: 1000, y: standY(1, 0.83), scale: 1, ...WALK(1), expr: 'neutral' } },
    ]);
    const pR2 = pose('S16', 'pedR2', f, [
      { f: 0, p: { ...basePose, x: 380, y: standY(1, 0.83), scale: 1, ...WALK(1), expr: 'neutral' } },
      { f: len, p: { ...basePose, x: 1260, y: standY(1, 0.83), scale: 1, ...WALK(1), expr: 'neutral' } },
    ]);
    const pR3 = pose('S16', 'pedR3', f, [
      { f: 0, p: { ...basePose, x: 800, y: standY(1, 0.83), scale: 1, ...WALK(1), expr: 'neutral' } },
      { f: len, p: { ...basePose, x: 1700, y: standY(1, 0.83), scale: 1, ...WALK(1), expr: 'neutral' } },
    ]);
    // Left-bound stream (farther): green, purple, amber — all distinct.
    const pL1 = pose('S16', 'pedL1', f, [
      { f: 0, p: { ...basePose, x: 1750, y: standY(0.85, STREET_FLOOR_V), scale: 0.85, ...WALK(-1), expr: 'neutral' } },
      { f: len, p: { ...basePose, x: 1000, y: standY(0.85, STREET_FLOOR_V), scale: 0.85, ...WALK(-1), expr: 'neutral' } },
    ]);
    const pL2 = pose('S16', 'pedL2', f, [
      { f: 0, p: { ...basePose, x: 1550, y: standY(0.85, STREET_FLOOR_V), scale: 0.85, ...WALK(-1), expr: 'neutral' } },
      { f: len, p: { ...basePose, x: 650, y: standY(0.85, STREET_FLOOR_V), scale: 0.85, ...WALK(-1), expr: 'neutral' } },
    ]);
    const pL3 = pose('S16', 'pedL3', f, [
      { f: 0, p: { ...basePose, x: 1200, y: standY(0.85, STREET_FLOOR_V), scale: 0.85, ...WALK(-1), expr: 'neutral' } },
      { f: len, p: { ...basePose, x: 250, y: standY(0.85, STREET_FLOOR_V), scale: 0.85, ...WALK(-1), expr: 'neutral' } },
    ]);
    const zoom = kf(f, [[0, 1.12], [len, 1.0]]);
    return (
      <g>
        <g transform={camT(960, 560, zoom)}>
          <Exterior t={f} id="s16" veil={0.55} />
          {[0, 1, 2, 3, 4].map((i) => (
            <rect key={i} x={420 + i * 260} y={420} width={60} height={80} fill="#FFE2B0" opacity={0.85} stroke={INK} strokeWidth={3} />
          ))}
          {/* SET DRESSING (Nov 14 fix — the street read too sparse against the
              fusion reference: one flat building + empty wall). All inside the
              script's setting (a crowded city street at night): a second
              building, a lit shopfront, a street lamp, more lit windows. Drawn
              behind the pedestrians, so the flow still reads in front of it. */}
          <g>
            {/* second building, right-middle, with lit windows */}
            <rect x={1290} y={450} width={290} height={400} fill="#3A2E44" stroke={INK} strokeWidth={4} />
            <path d="M 1290 520 L 1580 520 M 1290 600 L 1580 600 M 1290 690 L 1580 690" stroke="#2A2132" strokeWidth={2} opacity={0.7} />
            <rect x={1330} y={480} width={70} height={80} fill="#FFE2B0" opacity={0.85} stroke={INK} strokeWidth={3} />
            <rect x={1470} y={480} width={70} height={80} fill="#FFE2B0" opacity={0.85} stroke={INK} strokeWidth={3} />
            <rect x={1330} y={630} width={70} height={80} fill="#FFE2B0" opacity={0.7} stroke={INK} strokeWidth={3} />
            <rect x={1470} y={630} width={70} height={80} fill="#FFE2B0" opacity={0.7} stroke={INK} strokeWidth={3} />
            {/* lit shopfront, centre — amber awning (the video accent), big lit window */}
            <rect x={820} y={660} width={340} height={190} fill="#2E2438" stroke={INK} strokeWidth={4} />
            <rect x={820} y={660} width={340} height={26} fill="#F39C12" stroke={INK} strokeWidth={3} />
            <rect x={850} y={710} width={280} height={110} fill="#FFE2B0" opacity={0.9} stroke={INK} strokeWidth={3} />
            <path d="M 850 765 L 1130 765 M 920 710 L 920 820 M 1020 710 L 1020 820" stroke="#1E1824" strokeWidth={4} />
            {/* street lamp, warm glow */}
            <rect x={1236} y={480} width={8} height={370} fill="#5E5A6C" />
            <circle cx={1240} cy={470} r={44} fill="#FFE2B0" opacity={0.25} />
            <circle cx={1240} cy={470} r={26} fill="#FFE2B0" opacity={0.9} />
            {/* second row of lit windows on the facade */}
            {[0, 1, 2].map((i) => (
              <rect key={i} x={330 + i * 150} y={620} width={60} height={80} fill="#FFE2B0" opacity={0.8} stroke={INK} strokeWidth={3} />
            ))}
          </g>
          {/* left-bound stream first (farther), then Jake, then the right-bound stream (closer) */}
          {cast('pedL1', <Hero slim look={LOOKS.student} pose={{ ...pL1, ...faceN, facing: -1 }} rimId="rimBlue" shadow={1} />)}
          {cast('pedL2', <Hero slim look={LOOKS.teacher} pose={{ ...pL2, ...faceN, facing: -1 }} rimId="rimBlue" shadow={1} />)}
          {cast('pedL3', <Hero slim look={LOOKS.guestC} pose={{ ...pL3, ...faceN, facing: -1 }} rimId="rimBlue" shadow={1} />)}
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...p, ...face, facing: 1 }} rimId="rimBlue" shadow={1} />)}
          {cast('pedR1', <Hero slim look={LOOKS.guestA} pose={{ ...pR1, ...faceN, facing: 1 }} rimId="rimBlue" shadow={1} />)}
          {cast('pedR2', <Hero slim look={LOOKS.guestB} pose={{ ...pR2, ...faceN, facing: 1 }} rimId="rimBlue" shadow={1} />)}
          {cast('pedR3', <Hero slim look={LOOKS.teenager} pose={{ ...pR3, ...faceN, facing: 1 }} rimId="rimBlue" shadow={1} />)}
          <g opacity={0.55}>
            {cast('detective', <Hero slim look={LOOKS.detective} pose={{ ...basePose, x: 154, y: standY(0.5, STREET_FLOOR_V), scale: 0.5, ...STAND, expr: 'neutral', look: 0 }} rimId="rimBlue" shadow={1} />)}
          </g>
        </g>
        <ChapterCard t={f} kicker="CHAPTER 3" title="THE LIGHTS ARE DIFFERENT" accentWord="LIGHTS" />
      </g>
    );
  },
});

// S17 — CUTAWAY: a power station cut open like a cake. Inside, a glowing ring.
// The outside of the building stays in frame. Slow dive in toward the ring.
// The ring is the focal element — its glow is the amber accent.
// STYLE LOCK (Nov 14, Javion — the fusion cutaway sample IS this scene):
// the station is a big rounded industrial shell at night, cut open to reveal
// pipes, gauges, conduits and railings inside, the amber ring glowing at the
// centre, city skyline behind it. Jake watches from the left, the Detective
// points at the ring from the right — exactly the reference staging. The old
// flat grey box + generic lab interior is gone.
defineScene({
  id: 'S17',
  durationSec: DUR.S17,
  characters: [
    { who: 'jake', x: 0.36, feetY: ROOM_FLOOR_V },
    { who: 'detective', x: 0.68, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const pj = pose('S17', 'jake', f, [
      { f: 0, p: { ...basePose, x: 700, y: standY(0.8, ROOM_FLOOR_V), scale: 0.8, ...STAND, expr: 'puzzled' } },
      { f: len, p: { ...basePose, x: 700, y: standY(0.8, ROOM_FLOOR_V), scale: 0.8, ...STAND, expr: 'puzzled' } },
    ]);
    const p = pose('S17', 'detective', f, [
      { f: 0, p: { ...basePose, x: 1300, y: standY(0.8, ROOM_FLOOR_V), scale: 0.8, ...STAND, expr: 'neutral' } },
      { f: 180, p: { ...basePose, x: 1300, y: standY(0.8, ROOM_FLOOR_V), scale: 0.8, ...STAND, expr: 'neutral' } },
      { f: 280, p: { ...basePose, x: 1300, y: standY(0.8, ROOM_FLOOR_V), scale: 0.8, ...POINT, expr: 'neutral' } },
      { f: len, p: { ...basePose, x: 1300, y: standY(0.8, ROOM_FLOOR_V), scale: 0.8, ...POINT, expr: 'neutral' } },
    ]);
    const faceJ = faceAt(f, [[0, 'puzzled']]);
    const face = faceAt(f, [[0, 'neutral']]);
    const zoom = kf(f, [[0, 1.0], [len, 1.15]]);
    const camX = kf(f, [[0, 960], [len, 990]]);
    const pulse = 1 + 0.06 * Math.sin((f / 30) * Math.PI * 2 * 0.8);
    return (
      <g>
        <g transform={camT(camX, 560, zoom)}>
          {/* deep blue-teal night sky + stars */}
          <rect x={0} y={0} width={1920} height={864} fill="#0E2E3C" />
          {Array.from({ length: 40 }).map((_, i) => (
            <circle key={i} cx={(i * 389) % 1920} cy={(i * 211) % 420 + 30} r={2 + (i % 2)} fill="#F6EFE3" opacity={0.4 + 0.4 * ((i * 7) % 10) / 10} />
          ))}
          {/* city skyline silhouettes behind the station */}
          <path d="M 0 864 L 0 700 L 90 700 L 90 640 L 180 640 L 180 720 L 260 720 L 260 680 L 340 680 L 340 760 L 420 760 L 420 864 Z" fill="#0A2230" />
          <path d="M 1500 864 L 1500 740 L 1580 740 L 1580 660 L 1680 660 L 1680 730 L 1780 730 L 1780 690 L 1860 690 L 1860 760 L 1920 760 L 1920 864 Z" fill="#0A2230" />
          <rect x={0} y={864} width={1920} height={216} fill="#0A1E28" />
          {/* the station shell — big rounded industrial building, fills the frame */}
          <g>
            <rect x={220} y={120} width={1480} height={780} rx={60} fill="#3E5A6A" stroke={INK} strokeWidth={6} />
            {/* roof: vents, pipes, antenna */}
            <rect x={320} y={88} width={220} height={40} rx={8} fill="#2E4554" stroke={INK} strokeWidth={4} />
            <rect x={1180} y={92} width={260} height={34} rx={8} fill="#2E4554" stroke={INK} strokeWidth={4} />
            {[0, 1, 2, 3, 4].map((i) => (
              <path key={i} d={`M ${340 + i * 40} 96 L ${340 + i * 40} 120`} stroke="#1E2E3C" strokeWidth={4} />
            ))}
            <line x1={1560} y1={120} x2={1560} y2={52} stroke={INK} strokeWidth={5} />
            <circle cx={1560} cy={46} r={8} fill={AMBER} stroke={INK} strokeWidth={3} />
            {/* shell panel seams + bolts */}
            {[560, 900, 1240, 1560].map((x) => (
              <path key={x} d={`M ${x} 140 L ${x} 880`} stroke="#2E4554" strokeWidth={3} opacity={0.8} />
            ))}
            <path d="M 240 300 L 1680 300 M 240 700 L 1680 700" stroke="#2E4554" strokeWidth={3} opacity={0.8} />
            {[280, 1640].map((x) => (
              <g key={x}>
                <rect x={x} y={340} width={56} height={80} rx={8} fill="#2E4554" stroke={INK} strokeWidth={3} />
                {[0, 1, 2].map((i) => (
                  <path key={i} d={`M ${x + 8} ${360 + i * 22} L ${x + 48} ${360 + i * 22}`} stroke="#1E2E3C" strokeWidth={3} />
                ))}
              </g>
            ))}
            {/* the cut face: the station opened up, interior machinery */}
            <rect x={420} y={220} width={1080} height={680} fill="#1E2A36" stroke={INK} strokeWidth={5} />
            {/* vertical conduits + horizontal pipes inside */}
            {[500, 620, 1380, 1460].map((x) => (
              <rect key={x} x={x} y={240} width={26} height={640} fill="#3A4A5A" stroke={INK} strokeWidth={3} />
            ))}
            {[300, 780].map((y) => (
              <rect key={y} x={440} y={y} width={1040} height={22} fill="#3A4A5A" stroke={INK} strokeWidth={3} />
            ))}
            {/* cable bundles curving through the interior */}
            <path d="M 460 260 Q 700 420 660 640 Q 640 800 760 860" stroke="#2A3A4A" strokeWidth={10} fill="none" />
            <path d="M 1460 260 Q 1260 400 1300 620 Q 1320 780 1200 860" stroke="#2A3A4A" strokeWidth={10} fill="none" />
            {/* gauges with needles */}
            {[[560, 360], [1360, 360], [560, 700], [1360, 700]].map(([cx, cy], i) => (
              <g key={i}>
                <circle cx={cx} cy={cy} r={34} fill="#D8D2C0" stroke={INK} strokeWidth={4} />
                <line x1={cx} y1={cy} x2={cx + 20} y2={cy - 16} stroke="#C0392B" strokeWidth={4} strokeLinecap="round" />
                <circle cx={cx} cy={cy} r={5} fill={INK} />
              </g>
            ))}
            {/* railings across the interior */}
            <rect x={460} y={660} width={1000} height={8} fill="#4A5A6A" stroke={INK} strokeWidth={2} />
            {[480, 700, 920, 1140, 1360].map((x) => (
              <rect key={x} x={x} y={660} width={6} height={60} fill="#4A5A6A" stroke={INK} strokeWidth={2} />
            ))}
            {/* blinking panel lights */}
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <circle key={i} cx={700 + i * 48} cy={260} r={7} fill={i % 2 ? AMBER : '#7FD4FF'} opacity={0.6 + 0.4 * Math.sin(f / 15 + i * 2)} />
            ))}
            {/* the glowing ring — the focal element, amber accent */}
            <ellipse cx={960} cy={540} rx={300} ry={280} fill={AMBER} opacity={0.18} />
            <circle cx={960} cy={540} r={230 * pulse} fill="none" stroke={AMBER} strokeWidth={30} opacity={0.9} />
            <circle cx={960} cy={540} r={230 * pulse} fill="none" stroke="#FFE27A" strokeWidth={12} opacity={0.8} />
            <circle cx={960} cy={540} r={120} fill="#FFF6DC" opacity={0.9} />
            <circle cx={960} cy={540} r={120} fill={AMBER} opacity={0.35} />
            {[0, 1, 2, 3, 4, 5].map((i) => {
              const a = (i * 60 * Math.PI) / 180;
              return <line key={i} x1={960 + Math.cos(a) * 252} y1={540 + Math.sin(a) * 252} x2={960 + Math.cos(a) * 292} y2={540 + Math.sin(a) * 292} stroke={AMBER} strokeWidth={7} strokeLinecap="round" opacity={0.7} />;
            })}
            {/* sparks drifting off the ring */}
            {[[820, 380], [1100, 360], [860, 700], [1120, 700]].map(([cx, cy], i) => (
              <circle key={i} cx={cx} cy={cy + 6 * Math.sin(f / 18 + i * 3)} r={5} fill="#FFE27A" opacity={0.85} />
            ))}
            <text x={1010} y={862} textAnchor="middle" fontFamily={FONT.ui} fontSize={28} fill={CREAM}>
              PLASMA — HOTTER THAN THE SUN
            </text>
          </g>
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...pj, ...faceJ, facing: 1 }} rimId="rimBlue" shadow={1} />)}
          {cast('detective', <Hero slim look={LOOKS.detective} pose={{ ...p, ...face, facing: -1 }} rimId="rimBlue" shadow={1} />)}
        </g>
        <Caption text="A SUN IN A BOTTLE" y={990} size={44} />
      </g>
    );
  },
});

// S18 — Fact: "500 MW out from 50 MW in." The plasma pulses. Hold still.
defineScene({
  id: 'S18',
  durationSec: DUR.S18,
  characters: [{ who: 'detective', x: 0.28, feetY: ROOM_FLOOR_V }],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const p = pose('S18', 'detective', f, [
      { f: 0, p: { ...basePose, x: 540, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, expr: 'neutral' } },
      { f: 60, p: { ...basePose, x: 540, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, expr: 'neutral' } },
      { f: 150, p: { ...basePose, x: 540, y: standY(1, ROOM_FLOOR_V), scale: 1, ...POINT, expr: 'neutral' } },
      { f: len, p: { ...basePose, x: 540, y: standY(1, ROOM_FLOOR_V), scale: 1, ...POINT, expr: 'neutral' } },
    ]);
    const face = faceAt(f, [[0, 'neutral']]);
    const pulse = 1 + 0.05 * Math.sin((f / 30) * Math.PI * 2);
    return (
      <g>
        <g transform={camT(960, 560, 1.0)}>
          <Lab t={f} id="s18" veil={0.4} />
          <circle cx={1500} cy={420} r={110 * pulse} fill="none" stroke={AMBER} strokeWidth={20} opacity={0.85} />
          <circle cx={1500} cy={420} r={58} fill="#FFF6DC" opacity={0.9} />
          {cast('detective', <Hero slim look={LOOKS.detective} pose={{ ...p, ...face, facing: 1 }} rimId="rimBlue" shadow={1} />)}
        </g>
        <FactText lines={['500 MW OUT', 'FROM 50 MW IN']} y={300} size={84} />
        <Caption text="ITER — 35 NATIONS, ONE VERY EXPENSIVE KETTLE" y={980} size={36} />
      </g>
    );
  },
});

// S19 — Jake stares up at the reactor. The Detective stands beside him.
// Slow push-in. Jake's point-up is one eased raise, then hold.
defineScene({
  id: 'S19',
  durationSec: DUR.S19,
  characters: [
    { who: 'jake', x: 0.4, feetY: ROOM_FLOOR_V },
    { who: 'detective', x: 0.62, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const pj = pose('S19', 'jake', f, [
      { f: 0, p: { ...basePose, x: 768, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, expr: 'puzzled' } },
      { f: 90, p: { ...basePose, x: 768, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, expr: 'puzzled' } },
      { f: 180, p: { ...basePose, x: 768, y: standY(1, ROOM_FLOOR_V), scale: 1, ...POINT_UP, expr: 'puzzled' } },
      { f: len, p: { ...basePose, x: 768, y: standY(1, ROOM_FLOOR_V), scale: 1, ...POINT_UP, expr: 'puzzled' } },
    ]);
    const pd = pose('S19', 'detective', f, [
      { f: 0, p: { ...basePose, x: 1190, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, expr: 'neutral' } },
      { f: len, p: { ...basePose, x: 1190, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, expr: 'neutral' } },
    ]);
    const faceJ = faceAt(f, [[0, 'puzzled']]);
    const faceD = faceAt(f, [[0, 'neutral']]);
    const zoom = kf(f, [[0, 1.0], [len, 1.1]]);
    const pulse = 1 + 0.05 * Math.sin((f / 30) * Math.PI * 2);
    return (
      <g>
        <g transform={camT(960, 560, zoom)}>
          <Lab t={f} id="s19" veil={0.4} />
          <circle cx={960} cy={330} r={120 * pulse} fill="none" stroke={AMBER} strokeWidth={22} opacity={0.85} />
          <circle cx={960} cy={330} r={62} fill="#FFF6DC" opacity={0.9} />
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...pj, ...faceJ, facing: 1 }} rimId="rimBlue" shadow={1} />)}
          {cast('detective', <Hero slim look={LOOKS.detective} pose={{ ...pd, ...faceD, facing: 1 }} rimId="rimBlue" shadow={1} />)}
        </g>
      </g>
    );
  },
});

// S20 — Fact: "Ignition: December 2022." A lab, a flash of light. Hold still.
defineScene({
  id: 'S20',
  durationSec: DUR.S20,
  characters: [{ who: 'detective', x: 0.28, feetY: ROOM_FLOOR_V }],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const p = pose('S20', 'detective', f, [
      { f: 0, p: { ...basePose, x: 540, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, expr: 'neutral' } },
      { f: 60, p: { ...basePose, x: 540, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, expr: 'neutral' } },
      { f: 150, p: { ...basePose, x: 540, y: standY(1, ROOM_FLOOR_V), scale: 1, ...POINT, expr: 'neutral' } },
      { f: len, p: { ...basePose, x: 540, y: standY(1, ROOM_FLOOR_V), scale: 1, ...POINT, expr: 'neutral' } },
    ]);
    const face = faceAt(f, [[0, 'neutral']]);
    const flash = f >= 300 && f < 315 ? 0.85 : f >= 315 && f < 330 ? 0.3 : 0;
    return (
      <g>
        <g transform={camT(960, 560, 1.0)}>
          <Lab t={f} id="s20" veil={0.4} />
          <circle cx={1500} cy={420} r={90} fill="#FFF6DC" opacity={0.9} />
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
            const a = (i * 45 * Math.PI) / 180;
            return <line key={i} x1={1500 + Math.cos(a) * 104} y1={420 + Math.sin(a) * 104} x2={1500 + Math.cos(a) * 140} y2={420 + Math.sin(a) * 140} stroke="#FFE2B0" strokeWidth={6} strokeLinecap="round" />;
          })}
          {cast('detective', <Hero slim look={LOOKS.detective} pose={{ ...p, ...face, facing: 1 }} rimId="rimBlue" shadow={1} />)}
        </g>
        {flash > 0 ? <rect x={0} y={0} width={1920} height={1080} fill="#FFFFFF" opacity={flash} /> : null}
        <FactText lines={['IGNITION', 'DECEMBER 2022']} y={300} size={88} />
        <Caption text="NATIONAL IGNITION FACILITY — 70 YEARS, ONE SNEEZE" y={980} size={36} />
      </g>
    );
  },
});

// S21 — Detective faces camera. Timer 17:58:31. Slow push-in. Re-hook: Mars.
defineScene({
  id: 'S21',
  durationSec: DUR.S21,
  characters: [{ who: 'detective', x: 0.5, feetY: ROOM_FLOOR_V }],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const p = pose('S21', 'detective', f, [
      { f: 0, p: { ...basePose, x: 960, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, expr: 'smug' } },
      { f: len, p: { ...basePose, x: 960, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, expr: 'smug' } },
    ]);
    const face = faceAt(f, [[0, 'smug']]);
    const zoom = kf(f, [[0, 1.0], [len, 1.08]]);
    return (
      <g>
        <g transform={camT(960, 560, zoom)}>
          <Lab t={f} id="s21" veil={0.4} />
          {cast('detective', <Hero slim look={LOOKS.detective} pose={{ ...p, ...face, facing: 1 }} rimId="rimBlue" shadow={1} />)}
        </g>
        <TimerChip start="17:58:31" tSec={api.t} />
      </g>
    );
  },
});

// ===========================================================================
// CHAPTER 4 — THE SKY HAS PEOPLE
// ===========================================================================

// S22 — Night sky. A red dot moves steadily across the stars. Jake points up.
// Slow push-in. Detective sneaks at the right edge, looking up.
defineScene({
  id: 'S22',
  durationSec: DUR.S22,
  characters: [
    { who: 'jake', x: 0.5, feetY: STREET_FLOOR_V },
    { who: 'detective', x: 0.9, feetY: STREET_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const p = pose('S22', 'jake', f, [
      { f: 0, p: { ...basePose, x: 960, y: standY(1, STREET_FLOOR_V), scale: 1, ...STAND, expr: 'puzzled' } },
      { f: 90, p: { ...basePose, x: 960, y: standY(1, STREET_FLOOR_V), scale: 1, ...STAND, expr: 'puzzled' } },
      { f: 180, p: { ...basePose, x: 960, y: standY(1, STREET_FLOOR_V), scale: 1, ...POINT_UP, expr: 'puzzled' } },
      { f: len, p: { ...basePose, x: 960, y: standY(1, STREET_FLOOR_V), scale: 1, ...POINT_UP, expr: 'puzzled' } },
    ]);
    const face = faceAt(f, [[0, 'puzzled']]);
    const zoom = kf(f, [[0, 1.0], [len, 1.1]]);
    const dotX = kf(f, [[0, 500], [len, 1420]]);
    return (
      <g>
        <g transform={camT(960, 560, zoom)}>
          <NightSky />
          <circle cx={dotX} cy={280} r={16} fill="#D96A5F" />
          <circle cx={dotX} cy={280} r={30} fill="#D96A5F" opacity={0.35} />
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...p, ...face, facing: 1 }} rimId="rimBlue" shadow={1} />)}
          <g opacity={0.55}>
            {cast('detective', <Hero slim look={LOOKS.detective} pose={{ ...basePose, x: 1728, y: standY(0.5, STREET_FLOOR_V), scale: 0.5, ...POINT_UP, expr: 'neutral', look: 0 }} rimId="rimBlue" shadow={1} />)}
          </g>
        </g>
        <ChapterCard t={f} kicker="CHAPTER 4" title="THE SKY HAS PEOPLE" accentWord="SKY" />
      </g>
    );
  },
});

// S23 — Mars, red dust, a small habitat dome. Four figures in suits walk
// between buildings. Slow pull back. The crew are tiny (scale 0.35) —
// distinct by position, never by face.
defineScene({
  id: 'S23',
  durationSec: DUR.S23,
  characters: [
    { who: 'crew1', x: 0.3, feetY: STREET_FLOOR_V },
    { who: 'crew2', x: 0.45, feetY: STREET_FLOOR_V },
    { who: 'crew3', x: 0.6, feetY: STREET_FLOOR_V },
    { who: 'crew4', x: 0.75, feetY: STREET_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const mk = (label: string, x0: number, x1: number, look: Look) =>
      pose('S23', label, f, [
        { f: 0, p: { ...basePose, x: x0, y: standY(0.35, STREET_FLOOR_V), scale: 0.35, ...WALK(1), expr: 'neutral' } },
        { f: len, p: { ...basePose, x: x1, y: standY(0.35, STREET_FLOOR_V), scale: 0.35, ...WALK(1), expr: 'neutral' } },
      ]);
    const p1 = mk('crew1', 520, 640, LOOKS.scientist);
    const p2 = mk('crew2', 820, 900, LOOKS.scientist);
    const p3 = mk('crew3', 1100, 1180, LOOKS.scientist);
    const p4 = mk('crew4', 1400, 1480, LOOKS.scientist);
    const face = faceAt(f, [[0, 'neutral']]);
    const zoom = kf(f, [[0, 1.12], [len, 1.0]]);
    return (
      <g>
        <g transform={camT(960, 560, zoom)}>
          <MarsGround />
          {cast('crew1', <Hero slim look={LOOKS.scientist} pose={{ ...p1, ...face, facing: 1 }} rimId="rimBlue" shadow={1} />)}
          {cast('crew2', <Hero slim look={{ ...LOOKS.scientist, jacket: '#E8C86A', jacketShade: '#BFA153', accent: '#BFA153' }} pose={{ ...p2, ...face, facing: 1 }} rimId="rimBlue" shadow={1} />)}
          {cast('crew3', <Hero slim look={LOOKS.scientist} pose={{ ...p3, ...face, facing: 1 }} rimId="rimBlue" shadow={1} />)}
          {cast('crew4', <Hero slim look={{ ...LOOKS.scientist, jacket: '#D96A5F', jacketShade: '#AD544B', accent: '#AD544B' }} pose={{ ...p4, ...face, facing: 1 }} rimId="rimBlue" shadow={1} />)}
        </g>
        <Caption text="HUMANS LANDED ON MARS — LATE 2030s" y={990} size={40} />
      </g>
    );
  },
});

// S24 — Fact: "2.5–3 YEARS. 7–9 months each way." A ship coasts between two
// planets. Gentle pan. The ship drifts left to right across the frame.
defineScene({
  id: 'S24',
  durationSec: DUR.S24,
  characters: [],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const shipX = kf(f, [[0, 300], [len, 1620]]);
    const camX = kf(f, [[0, 900], [len, 1020]]);
    return (
      <g>
        <g transform={camT(camX, 540, 1.0)}>
          <rect x={0} y={0} width={1920} height={1080} fill="#0B0816" />
          {/* nebula haze — soft deep-blue and violet clouds, so space is not flat black */}
          <ellipse cx={500} cy={300} rx={420} ry={200} fill="#1E2A4A" opacity={0.55} />
          <ellipse cx={1500} cy={800} rx={460} ry={220} fill="#2A1E3A" opacity={0.5} />
          <ellipse cx={1300} cy={180} rx={300} ry={140} fill="#14263A" opacity={0.5} />
          {Array.from({ length: 50 }).map((_, i) => (
            <circle key={i} cx={(i * 389) % 1920} cy={(i * 211) % 900 + 40} r={2 + (i % 3)} fill="#F6EFE3" opacity={0.5} />
          ))}
          {/* a few bright stars with glow */}
          {[[240, 160], [900, 120], [1740, 520], [700, 900]].map(([cx, cy], i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r={14} fill="#FFFFFF" opacity={0.25} />
              <circle cx={cx} cy={cy} r={5} fill="#FFFFFF" />
            </g>
          ))}
          {/* the dashed orbit path from Earth to Mars */}
          <path d="M 420 760 Q 900 300 1560 300" stroke="#8A8EA6" strokeWidth={4} fill="none" strokeDasharray="22 18" opacity={0.7} />
          <circle cx={420} cy={760} r={110} fill="#608EAA" stroke={INK} strokeWidth={5} />
          {/* Earth: continents + cloud swirls */}
          <path d="M 360 720 Q 400 690 440 720 Q 460 750 420 770 Q 380 770 360 720 Z" fill="#7FA97A" />
          <path d="M 440 780 Q 480 760 500 790 Q 470 820 440 800 Z" fill="#7FA97A" />
          <path d="M 340 700 Q 420 760 500 700" stroke="#F6EFE3" strokeWidth={8} fill="none" strokeLinecap="round" opacity={0.7} />
          <path d="M 350 800 Q 420 830 490 800" stroke="#F6EFE3" strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.5} />
          <text x={420} y={920} textAnchor="middle" fontFamily={FONT.ui} fontSize={32} fill={CREAM}>EARTH</text>
          <circle cx={1560} cy={300} r={90} fill="#D96A5F" stroke={INK} strokeWidth={5} />
          <circle cx={1530} cy={280} r={16} fill="#8A4A34" />
          <circle cx={1590} cy={330} r={10} fill="#8A4A34" />
          <circle cx={1580} cy={260} r={7} fill="#8A4A34" />
          {/* Mars polar cap */}
          <path d="M 1500 224 Q 1560 205 1620 224 Q 1560 240 1500 224 Z" fill="#F6EFE3" opacity={0.9} />
          <text x={1560} y={440} textAnchor="middle" fontFamily={FONT.ui} fontSize={32} fill={CREAM}>MARS</text>
          <g transform={`translate(${shipX} 540)`}>
            <polygon points="0,-18 70,0 0,18 -30,10 -30,-10" fill="#D8D2C0" stroke={INK} strokeWidth={4} />
            <circle cx={-6} cy={0} r={10} fill="#7FD4FF" stroke={INK} strokeWidth={3} />
            <path d="M -40 0 L -120 0" stroke="#FFE2B0" strokeWidth={5} strokeLinecap="round" strokeDasharray="18 14" />
          </g>
        </g>
        <FactText lines={['2.5–3 YEARS', '7–9 MONTHS EACH WAY']} y={180} size={72} />
        <Caption text="MISS THE WINDOW — WAIT 26 MONTHS. NO CUSTOMER SERVICE." y={990} size={36} />
      </g>
    );
  },
});

// S25 — Inside the habitat. A crew eats dinner together. A window shows red
// dust outside. Hold still. Three seated figures, feet planted.
defineScene({
  id: 'S25',
  durationSec: DUR.S25,
  characters: [
    { who: 'crew1', x: 0.32, feetY: ROOM_FLOOR_V },
    { who: 'crew2', x: 0.5, feetY: ROOM_FLOOR_V },
    { who: 'crew3', x: 0.68, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const mk = (label: string, x: number, look: Look) =>
      pose('S25', label, f, [
        { f: 0, p: { ...basePose, x, y: sitY(876, 0.8), scale: 0.8, ...SIT, expr: 'happy' } },
        { f: len, p: { ...basePose, x, y: sitY(876, 0.8), scale: 0.8, ...SIT, expr: 'happy' } },
      ]);
    const p1 = mk('crew1', 614, LOOKS.scientist);
    const p2 = mk('crew2', 960, LOOKS.scientist);
    const p3 = mk('crew3', 1306, LOOKS.scientist);
    // Three DIFFERENT researchers — never copy each other: distinct hair and
    // expressions (jacket color alone is not enough).
    const face1 = faceAt(f, [[0, 'happy']]);
    const face2 = faceAt(f, [[0, 'neutral']]);
    const face3 = faceAt(f, [[0, 'smug']]);
    return (
      <g>
        <g transform={camT(960, 560, 1.0)}>
          <Lab t={f} id="s25" veil={0.4} />
          {/* round window: red dust outside */}
          <circle cx={1560} cy={340} r={130} fill="#C96A4A" stroke={INK} strokeWidth={6} />
          <circle cx={1520} cy={320} r={18} fill="#8A4A34" />
          <circle cx={1600} cy={380} r={12} fill="#8A4A34" />
          <circle cx={1590} cy={300} r={8} fill="#8A4A34" />
          {/* dinner table */}
          <rect x={520} y={700} width={880} height={26} fill="#7A5747" stroke={INK} strokeWidth={5} />
          <rect x={560} y={726} width={16} height={150} fill={INK} />
          <rect x={1344} y={726} width={16} height={150} fill={INK} />
          {[0, 1, 2].map((i) => (
            <ellipse key={i} cx={700 + i * 260} cy={694} rx={56} ry={12} fill="#F2EAD8" stroke={INK} strokeWidth={3} />
          ))}
          {/* bench the crew sits on */}
          <rect x={520} y={790} width={880} height={18} fill="#8A7A5A" stroke={INK} strokeWidth={4} />
          {cast('crew1', <Hero slim look={LOOKS.scientist} pose={{ ...p1, ...face1, facing: 1 }} rimId="rimBlue" shadow={1} />)}
          {cast('crew2', <Hero slim look={{ ...LOOKS.scientist, hair: 'curly', hairC: '#5A3A28', jacket: '#E8C86A', jacketShade: '#BFA153', accent: '#BFA153' }} pose={{ ...p2, ...face2, facing: 1 }} rimId="rimBlue" shadow={1} />)}
          {cast('crew3', <Hero slim look={{ ...LOOKS.scientist, hair: 'bun', hairC: '#4A3226', jacket: '#D96A5F', jacketShade: '#AD544B', accent: '#AD544B' }} pose={{ ...p3, ...face3, facing: 1 }} rimId="rimBlue" shadow={1} />)}
        </g>
        <Caption text="DINNER ON MARS. THE FORECAST IS JUST THE WORD “DUST”." y={990} size={36} />
      </g>
    );
  },
});

// S26 — Jake looks up at the sky again. The red dot is gone. Slow push-in.
defineScene({
  id: 'S26',
  durationSec: DUR.S26,
  characters: [{ who: 'jake', x: 0.5, feetY: STREET_FLOOR_V }],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const p = pose('S26', 'jake', f, [
      { f: 0, p: { ...basePose, x: 960, y: standY(1, STREET_FLOOR_V), scale: 1, ...POINT_UP, expr: 'puzzled' } },
      { f: 150, p: { ...basePose, x: 960, y: standY(1, STREET_FLOOR_V), scale: 1, ...POINT_UP, expr: 'puzzled' } },
      { f: 240, p: { ...basePose, x: 960, y: standY(1, STREET_FLOOR_V), scale: 1, ...STAND, expr: 'smug' } },
      { f: len, p: { ...basePose, x: 960, y: standY(1, STREET_FLOOR_V), scale: 1, ...STAND, expr: 'smug' } },
    ]);
    const face = faceAt(f, [[0, 'puzzled'], [240, 'smug']]);
    const zoom = kf(f, [[0, 1.0], [len, 1.12]]);
    return (
      <g>
        <g transform={camT(960, 560, zoom)}>
          <NightSky />
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...p, ...face, facing: 1 }} rimId="rimBlue" shadow={1} />)}
        </g>
      </g>
    );
  },
});

// S27 — Detective faces camera against the night sky. Timer 14:20:05.
// Slow push-in. Re-hook: the decision chapter + a character. The glass
// stays DOWN — this is a wide looking-out shot (night sky), not a close
// examination (magnifying-glass rule, Nov 14). One gesture: point at the
// timer (bare hand, held).
defineScene({
  id: 'S27',
  durationSec: DUR.S27,
  characters: [{ who: 'detective', x: 0.5, feetY: STREET_FLOOR_V }],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const p = pose('S27', 'detective', f, [
      { f: 0, p: { ...basePose, x: 960, y: standY(1, STREET_FLOOR_V), scale: 1, ...STAND, expr: 'smug' } },
      { f: 90, p: { ...basePose, x: 960, y: standY(1, STREET_FLOOR_V), scale: 1, ...STAND, expr: 'smug' } },
      { f: 180, p: { ...basePose, x: 960, y: standY(1, STREET_FLOOR_V), scale: 1, ...POINT, expr: 'smug' } },
      { f: len, p: { ...basePose, x: 960, y: standY(1, STREET_FLOOR_V), scale: 1, ...POINT, expr: 'smug' } },
    ]);
    const face = faceAt(f, [[0, 'smug']]);
    const zoom = kf(f, [[0, 1.0], [len, 1.08]]);
    return (
      <g>
        <g transform={camT(960, 560, zoom)}>
          <NightSky />
          {cast('detective', <Hero slim look={LOOKS.detective} pose={{ ...p, ...face, facing: 1 }} rimId="rimBlue" shadow={1} />)}
        </g>
        <TimerChip start="14:20:05" tSec={api.t} />
      </g>
    );
  },
});

// ===========================================================================
// CHAPTER 5 — THE CHOICE
// ===========================================================================

// S28 — A food stall. Steam. Mara serves noodles, looks up, smiles like she's
// seen him before. Slow push-in. Dialogue beat begins — two-shot, Jake + Mara.
defineScene({
  id: 'S28',
  durationSec: DUR.S28,
  characters: [
    { who: 'jake', x: 0.35, feetY: STREET_FLOOR_V },
    { who: 'mara', x: 0.65, feetY: STREET_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const pj = pose('S28', 'jake', f, [
      { f: 0, p: { ...basePose, x: 672, y: standY(1, STREET_FLOOR_V), scale: 1, ...STAND, expr: 'puzzled' } },
      { f: len, p: { ...basePose, x: 672, y: standY(1, STREET_FLOOR_V), scale: 1, ...STAND, expr: 'puzzled' } },
    ]);
    const pm = pose('S28', 'mara', f, [
      { f: 0, p: { ...basePose, x: 1248, y: standY(1, STREET_FLOOR_V), scale: 1, ...STAND, expr: 'neutral' } },
      { f: len, p: { ...basePose, x: 1248, y: standY(1, STREET_FLOOR_V), scale: 1, ...STAND, expr: 'neutral' } },
    ]);
    const faceJ = faceAt(f, [[0, 'puzzled']]);
    const faceM = faceAt(f, [[0, 'neutral']]);
    const zoom = kf(f, [[0, 1.0], [len, 1.08]]);
    return (
      <g>
        <g transform={camT(960, 560, zoom)}>
          <Exterior t={f} id="s28" veil={0.4} />
          <NoodleStall t={f} />
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...pj, ...faceJ, facing: 1 }} rimId="rimBlue" shadow={1} />)}
          {cast('mara', <Hero slim look={MARA} pose={{ ...pm, ...faceM, facing: -1 }} rimId="rimBlue" shadow={1} />)}
        </g>
        <ChapterCard t={f} kicker="CHAPTER 5" title="THE CHOICE" accentWord="CHOICE" />
      </g>
    );
  },
});

// Dialogue beats S29-S34 — two-shot, Jake left (x 672, facing right), Mara
// right (x 1248, facing left). ONLY the speaker moves (one eased gesture +
// head tilt); the listener reacts small (one nod at the line's start) then
// holds still. Turn-taking is visible in the two-shot. First-person lines.
const DIALOGUE = (id: string, speaker: 'jake' | 'mara', durKey: string) =>
  defineScene({
    id,
    durationSec: DUR[durKey],
    characters: [
      { who: 'jake', x: 0.35, feetY: STREET_FLOOR_V },
      { who: 'mara', x: 0.65, feetY: STREET_FLOOR_V },
    ],
    fn: (api) => {
      const f = F(api);
      const len = Math.round(api.duration * api.fps);
      // Speaker: one eased arm gesture + head tilt over the first ~30 frames,
      // then hold. Listener: one small nod (headTilt 0->5->0) over the first
      // ~24 frames, then still. Neither reverses 2+ times.
      const speakerKeys = (x: number): PoseKey[] => [
        { f: 0, p: { ...basePose, x, y: standY(1, STREET_FLOOR_V), scale: 1, ...STAND, expr: speaker === 'jake' ? 'puzzled' : 'neutral' } },
        { f: 30, p: { ...basePose, x, y: standY(1, STREET_FLOOR_V), scale: 1, armL: { a: 4, b: 8 }, armR: { a: 45, b: 15 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 }, look: 0, headTilt: 6, tilt: 0, expr: speaker === 'jake' ? 'puzzled' : 'neutral' } },
        { f: len, p: { ...basePose, x, y: standY(1, STREET_FLOOR_V), scale: 1, armL: { a: 4, b: 8 }, armR: { a: 45, b: 15 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 }, look: 0, headTilt: 6, tilt: 0, expr: speaker === 'jake' ? 'puzzled' : 'neutral' } },
      ];
      const listenerKeys = (x: number, expr: 'puzzled' | 'neutral'): PoseKey[] => [
        { f: 0, p: { ...basePose, x, y: standY(1, STREET_FLOOR_V), scale: 1, ...STAND, expr } },
        { f: 12, p: { ...basePose, x, y: standY(1, STREET_FLOOR_V), scale: 1, ...LISTEN, expr } },
        { f: 24, p: { ...basePose, x, y: standY(1, STREET_FLOOR_V), scale: 1, ...STAND, expr } },
        { f: len, p: { ...basePose, x, y: standY(1, STREET_FLOOR_V), scale: 1, ...STAND, expr } },
      ];
      const pj = pose(id, 'jake', f, speaker === 'jake' ? speakerKeys(672) : listenerKeys(672, 'puzzled'));
      const pm = pose(id, 'mara', f, speaker === 'mara' ? speakerKeys(1248) : listenerKeys(1248, 'neutral'));
      const faceJ = faceAt(f, [[0, 'puzzled']]);
      const faceM = faceAt(f, [[0, 'neutral']]);
      return (
        <g>
          <g transform={camT(960, 560, 1.0)}>
            <Exterior t={f} id={id.toLowerCase()} veil={0.4} />
            <NoodleStall t={f} />
            {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...pj, ...faceJ, facing: 1 }} rimId="rimBlue" shadow={1} />)}
            {cast('mara', <Hero slim look={MARA} pose={{ ...pm, ...faceM, facing: -1 }} rimId="rimBlue" shadow={1} />)}
          </g>
        </g>
      );
    },
  });

DIALOGUE('S29', 'jake', 'S29'); // "Is this real? Am I dreaming?"
DIALOGUE('S30', 'mara', 'S30'); // "You're the third one this month."
DIALOGUE('S31', 'jake', 'S31'); // "The third one? Do I get a loyalty card?"
DIALOGUE('S32', 'mara', 'S32'); // "No. You get noodles."

// S33 — Jake speaks, quieter. Mara listens, still. Two-shot.
DIALOGUE('S33', 'jake', 'S33'); // "Do they stay? The other two?"

// S34 — Mara speaks, looks toward the stall next door. Jake listens.
// Mara's gesture is a turn of the head toward the next stall (yaw), one
// eased move, then hold — the only beat where the speaker's head turns away.
defineScene({
  id: 'S34',
  durationSec: DUR.S34,
  characters: [
    { who: 'jake', x: 0.35, feetY: STREET_FLOOR_V },
    { who: 'mara', x: 0.65, feetY: STREET_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const pm = pose('S34', 'mara', f, [
      { f: 0, p: { ...basePose, x: 1248, y: standY(1, STREET_FLOOR_V), scale: 1, ...STAND, expr: 'neutral', yaw: 0 } },
      { f: 60, p: { ...basePose, x: 1248, y: standY(1, STREET_FLOOR_V), scale: 1, ...STAND, expr: 'neutral', yaw: 0 } },
      { f: 150, p: { ...basePose, x: 1248, y: standY(1, STREET_FLOOR_V), scale: 1, armL: { a: 4, b: 8 }, armR: { a: 45, b: 15 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 }, look: 0, headTilt: 6, tilt: 0, expr: 'neutral', yaw: 0.7 } },
      { f: len, p: { ...basePose, x: 1248, y: standY(1, STREET_FLOOR_V), scale: 1, armL: { a: 4, b: 8 }, armR: { a: 45, b: 15 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 }, look: 0, headTilt: 6, tilt: 0, expr: 'neutral', yaw: 0.7 } },
    ]);
    const pj = pose('S34', 'jake', f, [
      { f: 0, p: { ...basePose, x: 672, y: standY(1, STREET_FLOOR_V), scale: 1, ...STAND, expr: 'puzzled' } },
      { f: 12, p: { ...basePose, x: 672, y: standY(1, STREET_FLOOR_V), scale: 1, ...LISTEN, expr: 'puzzled' } },
      { f: 24, p: { ...basePose, x: 672, y: standY(1, STREET_FLOOR_V), scale: 1, ...STAND, expr: 'puzzled' } },
      { f: len, p: { ...basePose, x: 672, y: standY(1, STREET_FLOOR_V), scale: 1, ...STAND, expr: 'puzzled' } },
    ]);
    const faceJ = faceAt(f, [[0, 'puzzled']]);
    const faceM = faceAt(f, [[0, 'neutral']]);
    return (
      <g>
        <g transform={camT(960, 560, 1.0)}>
          <Exterior t={f} id="s34" veil={0.4} />
          <NoodleStall t={f} />
          {/* the stall next door, where the one who stayed works */}
          <g opacity={0.85}>
            <polygon points="1420,340 1840,340 1790,410 1470,410" fill="#7A5A3A" stroke={INK} strokeWidth={4} />
            <rect x={1460} y={700} width={380} height={164} fill="#5B4038" stroke={INK} strokeWidth={4} />
          </g>
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...pj, ...faceJ, facing: 1 }} rimId="rimBlue" shadow={1} />)}
          {cast('mara', <Hero slim look={MARA} pose={{ ...pm, ...faceM, facing: -1 }} rimId="rimBlue" shadow={1} />)}
        </g>
      </g>
    );
  },
});

// S35 — PHONE TEXT SCENE: notification banner pops at the top first, then cut
// to the full phone screen in Mara's hand. Dark-mode chat, grey bubbles left /
// blue replies right, bubbles appear ONE AT A TIME as if live, bottom caption
// narrates, the urgent message in red bold caps. Our colors: slate blue +
// moonlight glow, not their dark mode. Hold still.
// SPACING (Nov 14, Javion): AIRY, not cramped — each bubble gets a clear
// visible gap of empty dark space above and below it (~72px), with its
// timestamp sitting in that gap. The chat spreads down the screen.
defineScene({
  id: 'S35',
  durationSec: DUR.S35,
  characters: [{ who: 'mara', x: 0.78, feetY: STREET_FLOOR_V }],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    // Phase 1 (first ~2.5s): the banner at the top over the stall scene.
    // Phase 2: the full phone screen. Bubbles appear one at a time.
    const phonePhase = f >= 75;
    const b1 = f >= 150;
    const b2 = f >= 240;
    const b3 = f >= 330;
    const b4 = f >= 420;
    const pm = pose('S35', 'mara', f, [
      { f: 0, p: { ...basePose, x: 1498, y: standY(0.8, STREET_FLOOR_V), scale: 0.8, ...STAND, expr: 'neutral' } },
      { f: len, p: { ...basePose, x: 1498, y: standY(0.8, STREET_FLOOR_V), scale: 0.8, ...STAND, expr: 'neutral' } },
    ]);
    const faceM = faceAt(f, [[0, 'neutral']]);
    if (!phonePhase) {
      return (
        <g>
          <g transform={camT(960, 560, 1.0)}>
            <Exterior t={f} id="s35" veil={0.4} />
            <NoodleStall t={f} />
            {cast('mara', <Hero slim look={MARA} pose={{ ...pm, ...faceM, facing: -1 }} rimId="rimBlue" shadow={1} />)}
          </g>
          {/* notification banner pops at the top */}
          <g>
            <rect x={560} y={48} width={800} height={96} rx={16} fill="#1E1824" stroke={MOONLIGHT} strokeWidth={3} opacity={0.96} />
            <circle cx={620} cy={96} r={24} fill="#8A6A9A" stroke={INK} strokeWidth={3} />
            <text x={660} y={88} fontFamily={FONT.ui} fontSize={34} fill={CREAM}>Lena</text>
            <text x={660} y={126} fontFamily={FONT.hand} fontSize={30} fill="#BFE3F0">tell him the sea took the old pier, 21:47</text>
          </g>
        </g>
      );
    }
    return (
      <g>
        <rect x={0} y={0} width={1920} height={1080} fill="#14101C" />
        {/* the phone, filling the frame, in Mara's hand at the edge */}
        <rect x={560} y={80} width={800} height={920} rx={48} fill="#0B0816" stroke="#566A85" strokeWidth={5} />
        <rect x={590} y={110} width={740} height={860} rx={30} fill="#1E1824" />
        <text x={960} y={180} textAnchor="middle" fontFamily={FONT.ui} fontSize={36} fill={CREAM}>Lena</text>
        {b1 ? (
          <g>
            <text x={960} y={232} textAnchor="middle" fontFamily={FONT.ui} fontSize={26} fill="#8A8EA6">21:47</text>
            <rect x={630} y={258} width={640} height={84} rx={20} fill="#454C60" />
            <text x={660} y={310} fontFamily={FONT.hand} fontSize={34} fill={CREAM}>He's here again? The one from 2026?</text>
          </g>
        ) : null}
        {b2 ? (
          <g>
            <text x={960} y={388} textAnchor="middle" fontFamily={FONT.ui} fontSize={26} fill="#8A8EA6">21:48</text>
            <rect x={630} y={414} width={620} height={84} rx={20} fill="#454C60" />
            <text x={660} y={466} fontFamily={FONT.hand} fontSize={34} fill={CREAM}>Tell him the sea took the old pier.</text>
          </g>
        ) : null}
        {b3 ? (
          <g>
            <text x={960} y={544} textAnchor="middle" fontFamily={FONT.ui} fontSize={26} fill="#8A8EA6">21:51</text>
            <rect x={800} y={570} width={500} height={84} rx={20} fill="#566A85" />
            <text x={830} y={622} fontFamily={FONT.hand} fontSize={34} fill={CREAM}>He'll want to see the wall.</text>
          </g>
        ) : null}
        {b4 ? (
          <g>
            <text x={960} y={700} textAnchor="middle" fontFamily={FONT.ui} fontSize={26} fill="#8A8EA6">21:52</text>
            <rect x={640} y={726} width={640} height={92} rx={20} fill="#7A2A2A" stroke="#E62117" strokeWidth={3} />
            <text x={960} y={784} textAnchor="middle" fontFamily={FONT.title} fontWeight={700} fontSize={40} fill="#FF6A5A">
              DON'T LET HIM MISS MIDNIGHT
            </text>
          </g>
        ) : null}
        {/* chat input bar at the bottom of the screen */}
        <rect x={630} y={880} width={640} height={64} rx={32} fill="#2A2530" stroke="#454C60" strokeWidth={2} />
        <text x={660} y={920} fontFamily={FONT.hand} fontSize={30} fill="#8A8EA6">Message…</text>
        <Caption text="HER FRIEND TEXTS LIKE A MOM. A MOM FROM THE FUTURE." y={1050} size={36} />
      </g>
    );
  },
});

// S36 — Mara looks at Jake. Timer 02:14:33. Slow push-in. Viewer question:
// what would you do first with 24 hours in the future?
defineScene({
  id: 'S36',
  durationSec: DUR.S36,
  characters: [
    { who: 'jake', x: 0.35, feetY: STREET_FLOOR_V },
    { who: 'mara', x: 0.65, feetY: STREET_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const pj = pose('S36', 'jake', f, [
      { f: 0, p: { ...basePose, x: 672, y: standY(1, STREET_FLOOR_V), scale: 1, ...STAND, expr: 'puzzled' } },
      { f: 120, p: { ...basePose, x: 672, y: standY(1, STREET_FLOOR_V), scale: 1, ...STAND, expr: 'puzzled' } },
      { f: 210, p: { ...basePose, x: 672, y: standY(1, STREET_FLOOR_V), scale: 1, ...THINK, expr: 'puzzled' } },
      { f: len, p: { ...basePose, x: 672, y: standY(1, STREET_FLOOR_V), scale: 1, ...THINK, expr: 'puzzled' } },
    ]);
    const pm = pose('S36', 'mara', f, [
      { f: 0, p: { ...basePose, x: 1248, y: standY(1, STREET_FLOOR_V), scale: 1, ...STAND, expr: 'neutral' } },
      { f: len, p: { ...basePose, x: 1248, y: standY(1, STREET_FLOOR_V), scale: 1, ...STAND, expr: 'neutral' } },
    ]);
    const faceJ = faceAt(f, [[0, 'puzzled']]);
    const faceM = faceAt(f, [[0, 'neutral']]);
    const zoom = kf(f, [[0, 1.0], [len, 1.1]]);
    return (
      <g>
        <g transform={camT(960, 560, zoom)}>
          <Exterior t={f} id="s36" veil={0.4} />
          <NoodleStall t={f} />
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...pj, ...faceJ, facing: 1 }} rimId="rimBlue" shadow={1} />)}
          {cast('mara', <Hero slim look={MARA} pose={{ ...pm, ...faceM, facing: -1 }} rimId="rimBlue" shadow={1} />)}
        </g>
        <TimerChip start="02:14:33" tSec={api.t} />
        <Caption text="WHAT WOULD YOU DO FIRST? TELL ME IN THE COMMENTS." y={990} size={40} />
      </g>
    );
  },
});

// S37 — Detective faces camera. Timer 01:58:02. Hold still. Re-hook: midnight.
defineScene({
  id: 'S37',
  durationSec: DUR.S37,
  characters: [{ who: 'detective', x: 0.5, feetY: STREET_FLOOR_V }],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const p = pose('S37', 'detective', f, [
      { f: 0, p: { ...basePose, x: 960, y: standY(1, STREET_FLOOR_V), scale: 1, ...STAND, expr: 'smug' } },
      { f: len, p: { ...basePose, x: 960, y: standY(1, STREET_FLOOR_V), scale: 1, ...STAND, expr: 'smug' } },
    ]);
    const face = faceAt(f, [[0, 'smug']]);
    return (
      <g>
        <g transform={camT(960, 560, 1.0)}>
          <Exterior t={f} id="s37" veil={0.45} />
          {cast('detective', <Hero slim look={LOOKS.detective} pose={{ ...p, ...face, facing: 1 }} rimId="rimBlue" shadow={1} />)}
        </g>
        <TimerChip start="01:58:02" tSec={api.t} />
      </g>
    );
  },
});

// ===========================================================================
// CHAPTER 6 — THE RETURN
// ===========================================================================

// S38 — The white room again. The machine hums. Timer 00:09:41. Slow push-in.
defineScene({
  id: 'S38',
  durationSec: DUR.S38,
  characters: [{ who: 'jake', x: 0.35, feetY: ROOM_FLOOR_V }],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const p = pose('S38', 'jake', f, [
      { f: 0, p: { ...basePose, x: 672, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, expr: 'worried' } },
      { f: len, p: { ...basePose, x: 672, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, expr: 'worried' } },
    ]);
    const face = faceAt(f, [[0, 'worried']]);
    const zoom = kf(f, [[0, 1.0], [len, 1.1]]);
    return (
      <g>
        <g transform={camT(960, 560, zoom)}>
          <WhiteRoom t={f} door />
          <TimeMachine t={f} />
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...p, ...face, facing: 1 }} rimId="rimBlue" shadow={1} />)}
        </g>
        <ChapterCard t={f} kicker="CHAPTER 6" title="THE RETURN" accentWord="RETURN" />
        <TimerChip start="00:09:41" tSec={api.t} />
      </g>
    );
  },
});

// S39 — Jake stands in front of the machine. Mara waits by the door.
// Slow push-in on Jake. One eased step toward the machine, then hold.
defineScene({
  id: 'S39',
  durationSec: DUR.S39,
  characters: [
    { who: 'jake', x: 0.45, feetY: ROOM_FLOOR_V },
    { who: 'mara', x: 0.85, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const pj = pose('S39', 'jake', f, [
      { f: 0, p: { ...basePose, x: 820, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, expr: 'worried' } },
      { f: 90, p: { ...basePose, x: 820, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, expr: 'worried' } },
      { f: 180, p: { ...basePose, x: 920, y: standY(1, ROOM_FLOOR_V), scale: 1, ...WALK(1), expr: 'worried' } },
      { f: 270, p: { ...basePose, x: 960, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, expr: 'worried' } },
      { f: len, p: { ...basePose, x: 960, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, expr: 'worried' } },
    ]);
    const pm = pose('S39', 'mara', f, [
      { f: 0, p: { ...basePose, x: 1632, y: standY(0.9, ROOM_FLOOR_V), scale: 0.9, ...STAND, expr: 'sad' } },
      { f: len, p: { ...basePose, x: 1632, y: standY(0.9, ROOM_FLOOR_V), scale: 0.9, ...STAND, expr: 'sad' } },
    ]);
    const faceJ = faceAt(f, [[0, 'worried']]);
    const faceM = faceAt(f, [[0, 'sad']]);
    const zoom = kf(f, [[0, 1.0], [len, 1.1]]);
    return (
      <g>
        <g transform={camT(960, 560, zoom)}>
          <WhiteRoom t={f} door />
          <TimeMachine t={f} />
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...pj, ...faceJ, facing: 1 }} rimId="rimBlue" shadow={1} />)}
          {cast('mara', <Hero slim look={MARA} pose={{ ...pm, ...faceM, facing: -1 }} rimId="rimBlue" shadow={1} />)}
        </g>
        <TimerChip start="00:09:30" tSec={api.t} />
      </g>
    );
  },
});

// S40 — The timer hits 00:00:00. The machine flashes. The room goes white.
// Hold still, then cut to black. The flash is a screen-space white overlay.
defineScene({
  id: 'S40',
  durationSec: DUR.S40,
  characters: [
    { who: 'jake', x: 0.45, feetY: ROOM_FLOOR_V },
    { who: 'mara', x: 0.85, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const pj = pose('S40', 'jake', f, [
      { f: 0, p: { ...basePose, x: 960, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, expr: 'shock' } },
      { f: len, p: { ...basePose, x: 960, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, expr: 'shock' } },
    ]);
    const pm = pose('S40', 'mara', f, [
      { f: 0, p: { ...basePose, x: 1632, y: standY(0.9, ROOM_FLOOR_V), scale: 0.9, ...STAND, expr: 'sad' } },
      { f: len, p: { ...basePose, x: 1632, y: standY(0.9, ROOM_FLOOR_V), scale: 0.9, ...STAND, expr: 'sad' } },
    ]);
    const faceJ = faceAt(f, [[0, 'shock']]);
    const faceM = faceAt(f, [[0, 'sad']]);
    const flash = f >= len - 60 && f < len - 30 ? 0.9 : f >= len - 30 ? 1 : 0;
    const black = f >= len - 15 ? 1 : 0;
    return (
      <g>
        <g transform={camT(960, 560, 1.0)}>
          <WhiteRoom t={f} door />
          <TimeMachine t={f} flash={flash > 0} />
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...pj, ...faceJ, facing: 1 }} rimId="rimBlue" shadow={1} />)}
          {cast('mara', <Hero slim look={MARA} pose={{ ...pm, ...faceM, facing: -1 }} rimId="rimBlue" shadow={1} />)}
        </g>
        <TimerChip start="00:00:08" tSec={api.t} />
        {flash > 0 ? <rect x={0} y={0} width={1920} height={1080} fill="#FFFFFF" opacity={flash} /> : null}
        {black > 0 ? <rect x={0} y={0} width={1920} height={1080} fill="#000000" opacity={black} /> : null}
      </g>
    );
  },
});

// ===========================================================================
// CLOSE
// ===========================================================================

// S41 — Jake's bedroom, 2026. Morning light. His phone says November 14,
// 2026. Slow pull back. Jake stands by the bed, phone in hand.
defineScene({
  id: 'S41',
  durationSec: DUR.S41,
  characters: [{ who: 'jake', x: 0.5, feetY: ROOM_FLOOR_V }],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const p = pose('S41', 'jake', f, [
      { f: 0, p: { ...basePose, x: 960, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, expr: 'tired' } },
      { f: 120, p: { ...basePose, x: 960, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, expr: 'tired' } },
      { f: 210, p: { ...basePose, x: 960, y: standY(1, ROOM_FLOOR_V), scale: 1, armL: { a: 4, b: 8 }, armR: { a: 55, b: 40 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 }, look: 0, headTilt: 0, tilt: 0, expr: 'puzzled' } },
      { f: len, p: { ...basePose, x: 960, y: standY(1, ROOM_FLOOR_V), scale: 1, armL: { a: 4, b: 8 }, armR: { a: 55, b: 40 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 }, look: 0, headTilt: 0, tilt: 0, expr: 'puzzled' } },
    ]);
    const face = faceAt(f, [[0, 'tired'], [210, 'puzzled']]);
    const zoom = kf(f, [[0, 1.14], [len, 1.0]]);
    return (
      <g>
        <g transform={camT(960, 560, zoom)}>
          <Bedroom t={f} id="s41" veil={0.3} clock="07:02" />
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...p, ...face, facing: 1 }} rimId="rimBlue" shadow={1} />)}
          {f >= 210 ? (
            <g>
              <rect x={1080} y={560} width={130} height={220} rx={18} fill="#0B0816" stroke="#454C60" strokeWidth={4} />
              <text x={1145} y={650} textAnchor="middle" fontFamily={FONT.hand} fontSize={30} fill={CREAM}>Nov 14</text>
              <text x={1145} y={700} textAnchor="middle" fontFamily={FONT.title} fontWeight={700} fontSize={44} fill={CREAM}>2026</text>
            </g>
          ) : null}
        </g>
        <Caption text="YOUR OWN CEILING. YOUR OWN PHONE. NOVEMBER 14, 2026." y={990} size={36} />
      </g>
    );
  },
});

// S42 — Jake sits up, smiling. The Detective is in the corner, scratching his
// head under the question mark. Slow push-in. (Staging note: Jake STANDS and
// stretches instead of sitting up — the standing rig can't seat a character
// on a bed without floating feet; the narration ("you woke up... came back
// with the answer") is unchanged. Revisit only if Javion asks for the sit-up.)
defineScene({
  id: 'S42',
  durationSec: DUR.S42,
  characters: [
    { who: 'jake', x: 0.45, feetY: ROOM_FLOOR_V },
    { who: 'detective', x: 0.85, feetY: ROOM_FLOOR_V },
  ],
  fn: (api) => {
    const f = F(api);
    const len = Math.round(api.duration * api.fps);
    const pj = pose('S42', 'jake', f, [
      { f: 0, p: { ...basePose, x: 864, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, expr: 'tired' } },
      { f: 150, p: { ...basePose, x: 864, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, expr: 'tired' } },
      { f: 270, p: { ...basePose, x: 864, y: standY(1, ROOM_FLOOR_V), scale: 1, armL: { a: 120, b: 20 }, armR: { a: 120, b: 20 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 }, look: 0, headTilt: -4, tilt: 0, expr: 'happy' } },
      { f: 500, p: { ...basePose, x: 864, y: standY(1, ROOM_FLOOR_V), scale: 1, armL: { a: 120, b: 20 }, armR: { a: 120, b: 20 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 }, look: 0, headTilt: -4, tilt: 0, expr: 'happy' } },
      { f: 620, p: { ...basePose, x: 864, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, expr: 'happy' } },
      { f: len, p: { ...basePose, x: 864, y: standY(1, ROOM_FLOOR_V), scale: 1, ...STAND, expr: 'happy' } },
    ]);
    const pd = pose('S42', 'detective', f, [
      { f: 0, p: { ...basePose, x: 1632, y: standY(0.9, ROOM_FLOOR_V), scale: 0.9, ...STAND, expr: 'puzzled' } },
      { f: 300, p: { ...basePose, x: 1632, y: standY(0.9, ROOM_FLOOR_V), scale: 0.9, ...STAND, expr: 'puzzled' } },
      { f: 420, p: { ...basePose, x: 1632, y: standY(0.9, ROOM_FLOOR_V), scale: 0.9, armL: { a: 4, b: 8 }, armR: { a: 110, b: 55 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 }, look: 0, headTilt: 8, tilt: 0, expr: 'puzzled' } },
      { f: len, p: { ...basePose, x: 1632, y: standY(0.9, ROOM_FLOOR_V), scale: 0.9, armL: { a: 4, b: 8 }, armR: { a: 110, b: 55 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 }, look: 0, headTilt: 8, tilt: 0, expr: 'puzzled' } },
    ]);
    const faceJ = faceAt(f, [[0, 'tired'], [270, 'happy']]);
    const faceD = faceAt(f, [[0, 'puzzled']]);
    const zoom = kf(f, [[0, 1.0], [len, 1.1]]);
    return (
      <g>
        <g transform={camT(960, 560, zoom)}>
          <Bedroom t={f} id="s42" veil={0.3} clock="07:04" />
          <text x={1632} y={330} textAnchor="middle" fontFamily={FONT.hand} fontSize={200} fill={MOONLIGHT}>?</text>
          {cast('jake', <Hero slim look={LOOKS.jake} pose={{ ...pj, ...faceJ, facing: 1 }} rimId="rimBlue" shadow={1} />)}
          {cast('detective', <Hero slim look={LOOKS.detective} pose={{ ...pd, ...faceD, facing: -1 }} rimId="rimBlue" shadow={1} />)}
        </g>
        <Caption text="THE FUTURE ISN'T A MYSTERY. IT'S A SCHEDULE. AND YOU'RE EARLY." y={990} size={36} />
      </g>
    );
  },
});

// S43 — End card: Inkl logo + "Curiosity. Explained." + Subscribe button.
// The video's ONLY subscribe ask. No characters, no set.
defineScene({
  id: 'S43',
  durationSec: DUR.S43,
  characters: [],
  fn: () => (
    <g>
      <EndCard />
    </g>
  ),
});

// ---------------------------------------------------------------------------
// Assembly — the registry also holds sceneBuilder's own example scene
// ('S53-example', registered at import). Filter it out: this episode is
// S1-S43 only. The timeline is DERIVED from these durations, never hand-written.
// ---------------------------------------------------------------------------

export const zenn005Scenes = (): SceneDef[] =>
  getScenes().filter((s) => s.id !== 'S53-example' && /^S\d+$/.test(s.id));

export const zenn005Timeline = (fps = FPS) => {
  // Same math as buildTimeline, but over THIS episode's scenes only —
  // buildTimeline() walks the shared registry, whose first entry is
  // sceneBuilder's own 'S53-example' (135 frames), which would shift S1.
  let frame = 0;
  return zenn005Scenes().map((s) => {
    const len = Math.round(s.durationSec * fps);
    const shot = { id: s.id, first: frame, len, durationSec: s.durationSec };
    frame += len;
    return shot;
  });
};

export const zenn005TotalSec = () => zenn005Scenes().reduce((sum, s) => sum + s.durationSec, 0);

// Adapter: a scene def becomes an episode Shot (ShotProps clock in frames).
export const sceneToShot = (def: SceneDef): React.FC<ShotProps> => {
  const Shot: React.FC<ShotProps> = ({ t, len }) => {
    setCurrentScene(def.id);
    const floorY = def.characters[0]?.feetY ?? ROOM_FLOOR_V;
    return def.fn({ t: t / FPS, duration: def.durationSec, floorY, frame: t, fps: FPS });
  };
  return Shot;
};

export const zenn005Shots = (): Record<string, React.FC<ShotProps>> => {
  const out: Record<string, React.FC<ShotProps>> = {};
  for (const def of zenn005Scenes()) out[def.id] = sceneToShot(def);
  return out;
};

// Re-export the guard helpers so the check script can import everything from here.
export { guardScene, guardNoIdleFlap, countReversals, totalDurationSec };
export { buildTimeline };
