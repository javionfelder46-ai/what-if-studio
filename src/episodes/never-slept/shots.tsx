// "What If You Never Slept Again?" — 2.5D test Short. 1080x1920 world.
// Flat 2D rig characters (black silhouettes: Detective + Jake) inside layered
// painterly 3D environments, with parallax camera moves. Real animation:
// characters gesture / react / blink / talk on the beats — nothing is a still
// with a zoom.
import { Hero, LOOKS, poseAt, kf, joints, toWorld, Magnifier, FONT, easeOut } from '../../engine';
import type { Look } from '../../engine';
import { staticFile } from 'remotion';

export const FPS = 30;

export type SceneProps = { t: number; len: number; g: number };

// ---- looks (scoped to this Short; rig.tsx is untouched) ----
// Detective: little slate-blue tie (accent #566A85, matching coat + cap) and no
// cream shirt V (shirt black, so the tie reads on the black silhouette).
// plainFace: the head is a PERFECT smooth circle — NO nose, NO ears, NO mouth,
// NO chin, NO jaw; the ONLY face is the eyes (plain solid white ovals).
// capBow: little bow on top of the deerstalker (Nov 13, Javion: "it's cool, keep it").
export const DETECTIVE: Look = { ...LOOKS.detective, shirt: '#161616', accent: '#566A85', plainFace: true, capBow: true };
// Jake: full black silhouette (canon red shirt goes black under the silhouette standard).
// plainFace: perfect circle head, sunglasses only (his eyes), no mouth/nose/ears/chin.
export const JAKE: Look = { ...LOOKS.jake, jacket: '#161616', jacketShade: '#2A2A2A', accent: '#2A2A2A', plainFace: true };
// Ghost Jake (S4 hallucination): pale blue-white silhouette, dark sunglasses, translucent.
// Same plain-face rule (perfect circle head, sunglasses only).
export const GHOST: Look = { ...LOOKS.jake, skin: '#BFE3FF', skinShade: '#9CC8E8', hand: '#BFE3FF', jacket: '#BFE3FF', jacketShade: '#9CC8E8', accent: '#9CC8E8', limb: '#BFE3FF', line: '#7FB2FF', shoe: '#BFE3FF', face: '#FFFFFF', gear: undefined, shades: true, plainFace: true };

// ---- helpers ----
export const cam1080 = (cx: number, cy: number, s: number) =>
  `translate(540 960) scale(${s}) translate(${-cx} ${-cy})`;

/** A 3-frame blink every ~3 seconds. */
const blinkAt = (f: number, period = 97) => (f % period < 3 ? 1 : 0);

type BgProps = { img: string; cx: number; cy: number; s: number; tint?: string; tintOp?: number };
/** Layered environment, drawn oversized so camera moves never reveal an edge.
    SAME transform as the character group: the background and the characters share
    one camera, so a character standing on the floor (or lying on the bed) stays
    grounded on the furniture. (A half-rate parallax drift broke the grounding —
    the characters floated off the bed/desk/floor in the first stills pass.) */
export const Bg = ({ img, cx, cy, s, tint, tintOp = 0.5 }: BgProps) => {
  const bx = cx;
  const by = cy;
  const bs = s;
  return (
    <g transform={cam1080(bx, by, bs)}>
      <image href={staticFile(`never-slept/${img}`)} x={-70} y={-120} width={1220} height={2160} preserveAspectRatio="xMidYMid slice" />
      {tint ? <rect x={-70} y={-120} width={1220} height={2160} fill={tint} opacity={tintOp} /> : null}
    </g>
  );
};

// Jake lying in bed under a blanket (S1/S7). The rig's Hero lying pose is a rigid
// plank that floats above the bed and leaves the arms sticking out over the blanket
// (the spin pivot puts the shoulders ~130 units above the mattress), so the lying
// Jake is a custom shape instead: only his head (perfect smooth circle, sunglasses
// only — his eyes) shows above a blanket mound that drapes over his body on the
// bed. `bunch` (S7) raises the blanket's top edge near his chin where the Detective
// tucks it; `breathe` is a small y offset for his breathing. Head centre (201, 1135)
// r=93 matches the Hero's lying head position, so the Detective's reach still lands.
const LyingJake = ({ bunch, breathe }: { bunch?: boolean; breathe?: number }) => {
  const top = bunch
    ? 'M 280 1130 Q 300 1070 330 1075 Q 360 1080 380 1110 Q 490 1060 700 1150'
    : 'M 280 1130 Q 490 1050 700 1150';
  return (
    <g transform={`translate(0 ${breathe ?? 0})`}>
      {/* blanket mound over his body, draped on the bed */}
      <path d={`${top} L 700 1300 Q 700 1330 660 1330 L 320 1330 Q 280 1330 280 1290 Z`} fill="#5B7A96" />
      <path d={top} fill="none" stroke="#8AA8C2" strokeWidth={5} strokeLinecap="round" />
      {/* head on the pillow — perfect smooth circle, sunglasses only */}
      <g filter="url(#rimBlue)">
        <circle cx={201} cy={1135} r={93} fill="#161616" />
        <ellipse cx={173} cy={1120} rx={28} ry={22} fill="#232E3D" stroke="#000000" strokeWidth={3} />
        <ellipse cx={229} cy={1120} rx={28} ry={22} fill="#232E3D" stroke="#000000" strokeWidth={3} />
        <line x1={201} y1={1120} x2={201} y2={1120} stroke="#000000" strokeWidth={3} />
        <line x1={162} y1={1112} x2={176} y2={1128} stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" />
        <line x1={218} y1={1112} x2={232} y2={1128} stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" />
      </g>
    </g>
  );
};

// ---------- S1: hook — Jake lying awake in bed, Detective beside the bed ----------
// VERIFIED staging (parent-checked reference): the Detective stands FULLY on the
// wooden floor beside the bed — entire body head-to-feet visible, a clear gap of
// floor between him and the bed, feet planted flat, NO overlap with the bed,
// pillow, headboard, or nightstand. Only his arm reaches over with the glass.
export const S1 = ({ t, len, g }: SceneProps) => {
  const camX = kf(t, [[0, 480], [len, 490]]);
  const camY = kf(t, [[0, 1160], [len, 1140]]);
  const zoom = kf(t, [[0, 1.05], [len, 1.12]]);
  // Jake lying in bed — custom LyingJake (head + blanket mound); the rig's lying
  // Hero floated above the bed with its arms sticking out over the blanket.
  // Detective on the floor (feet at y 1600, clear floorboards), leaning in from the side.
  const pd = poseAt(t, [
    { f: 0, p: { x: 838, y: 1390, scale: 1.5, tilt: -4, yaw: -0.35, headTilt: -4, look: -12, armL: { a: 108, b: 4 }, armR: { a: 8, b: 6 }, legL: { a: 4, b: 0 }, legR: { a: -4, b: 0 } } },
    { f: 60, p: { x: 828, y: 1390, scale: 1.5, tilt: -8, yaw: -0.45, headTilt: -7, look: -14, armL: { a: 116, b: 2 } } },
    { f: len, p: { x: 824, y: 1390, scale: 1.5, tilt: -9, yaw: -0.45, headTilt: -7, look: -14 } },
  ]);
  const mg = toWorld(pd, joints(pd).armL.end);
  const det = <Hero look={DETECTIVE} pose={{ ...pd, expr: 'neutral', blink: blinkAt(t, 91) }} rimId="rimBlue" shadow={1} />;
  return (
    <g>
      <Bg img="env_bedroom.jpg" cx={camX} cy={camY} s={zoom} />
      <g transform={cam1080(camX, camY, zoom)}>
        <LyingJake />
        {det}
        <Magnifier x={mg.x} y={mg.y} s={1.15} />
      </g>
    </g>
  );
};

// ---------- S2: superhero — Jake on a rooftop at sunrise, blanket-cape, Detective beside him ----------
// VERIFIED staging (parent-checked reference): both characters fully on the
// rooftop, feet planted on the concrete, clear of the buildings and clock
// towers. Jake stands tall, arms raised in a V, sunglasses on, cape flowing
// left. Detective beside him, looking up, magnifying glass raised. The clock
// towers are in the background image itself — no floating SVG clocks.

export const S2 = ({ t, len, g }: SceneProps) => {
  const camX = kf(t, [[0, 540], [len, 530]]);
  const camY = kf(t, [[0, 1100], [len, 1060]]);
  const zoom = kf(t, [[0, 1.0], [len, 1.07]]);
  // Jake rises into a superhero pose, arms up in a V.
  const pj = poseAt(t, [
    { f: 0, p: { x: 420, y: 1460, scale: 2.15, tilt: 2, headTilt: 0, look: 0, armL: { a: 60, b: 10 }, armR: { a: 60, b: 10 }, legL: { a: -8, b: 0 }, legR: { a: 8, b: 0 } } },
    { f: 70, p: { x: 420, y: 1418, scale: 2.3, tilt: -3, headTilt: -6, look: 0, armL: { a: 158, b: 8 }, armR: { a: 158, b: 8 }, legL: { a: -12, b: 0 }, legR: { a: 12, b: 0 } } },
    { f: len, p: { x: 420, y: 1414, scale: 2.32, tilt: -3, headTilt: -6, look: 0, armL: { a: 162, b: 6 }, armR: { a: 162, b: 6 } } },
  ]);
  const jake = <Hero look={JAKE} pose={{ ...pj, expr: 'determined', blink: blinkAt(t, 95) }} rimId="rimBlue" shadow={1} />;
  // Detective beside him on the rooftop, POINTING UP at Jake with his free
  // hand (presenting him), magnifying glass lowered in his other hand.
  // The Detective always has an ACTION matching the beat — never just standing.
  const pd = poseAt(t, [
    { f: 0, p: { x: 800, y: 1560, scale: 1.6, tilt: 0, yaw: -0.3, headTilt: -6, look: -10, armL: { a: 70, b: 10 }, armR: { a: 14, b: 6 }, legL: { a: 5, b: 0 }, legR: { a: -5, b: 0 } } },
    { f: 80, p: { x: 800, y: 1522, scale: 1.7, tilt: -2, yaw: -0.35, headTilt: -10, look: -12, armL: { a: 150, b: 6 }, handL: 'point', armR: { a: 16, b: 4 } } },
    { f: len, p: { x: 800, y: 1522, scale: 1.7, headTilt: -10, look: -12, armL: { a: 155, b: 4 }, armR: { a: 16, b: 4 } } },
  ]);
  const mg = toWorld(pd, joints(pd).armR.end);
  const det = <Hero look={DETECTIVE} pose={{ ...pd, expr: 'neutral', blink: blinkAt(t, 93) }} rimId="rimBlue" shadow={1} />;
  const capeWave = Math.sin(t * 0.15) * 8;
  const sunPulse = 0.28 + 0.1 * Math.sin(t * 0.08);
  return (
    <g>
      <Bg img="env_rooftop.jpg" cx={camX} cy={camY} s={zoom} />
      <g transform={cam1080(camX, camY, zoom)}>
        <defs>
          <radialGradient id="sunGlow">
            <stop offset="0%" stopColor="#FFE9A8" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#FFE9A8" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx={380} cy={330} r={320} fill="url(#sunGlow)" opacity={sunPulse} />
        {/* blanket-cape flowing left behind Jake */}
        <g transform={`translate(${capeWave} ${capeWave * 0.5})`}>
          <path d="M 380 1170 L 465 1170 L 490 1380 Q 300 1450 140 1420 Q 90 1330 150 1250 Q 230 1190 380 1170 Z" fill="#1A1A1A" stroke="#2E4A7A" strokeWidth={4} />
        </g>
        {jake}
        {det}
        <Magnifier x={mg.x} y={mg.y} s={1.0} />
      </g>
    </g>
  );
};

// ---------- S3: 24h glitch — back-seat camera, Jake facing the road, Detective bracing ----------
// VERIFIED staging (parent-checked reference): back-seat camera. Jake faces the ROAD
// (back of his bald head, never his face — a driver looks at the road), BOTH hands on
// the wheel. Detective in the passenger seat turned toward Jake, right hand pressed
// FLAT ON the dashboard bracing, left hand gripping the console, eyes wide.
// Detective's eyes are plain solid white ovals — NEVER pupils (the rig draws them so).
export const S3 = ({ t, len }: SceneProps) => {
  const swerve = Math.sin(t * 0.09) * 26;
  const camX = 540 + Math.sin(t * 0.5) * 5;
  const camY = kf(t, [[0, 1020], [len, 1000]]);
  const zoom = 1.06;
  // Jake from behind: custom back-view silhouette (the rig is front-view only).
  // Head bobs with the drive; body leans with the swerve.
  const headBob = Math.sin(t * 0.15) * 3;
  const lean = Math.sin(t * 0.09) * 2;
  // Detective turned toward Jake, right hand flat on the dash, left hand on the console.
  const pd = poseAt(t, [
    { f: 0, p: { x: 780, y: 1280, scale: 1.9, tilt: -2, yaw: -0.25, headTilt: -6, look: -10, armL: { a: 40, b: 10 }, armR: { a: 175, b: 5 }, handL: 'fist', handR: 'open', legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 60, p: { x: 780, y: 1280, scale: 1.9, tilt: 2, yaw: -0.55, headTilt: 6, look: -12 } },
    { f: 120, p: { x: 780, y: 1280, scale: 1.9, tilt: -2, yaw: -0.5, headTilt: -6, look: -10 } },
    { f: 180, p: { x: 780, y: 1280, scale: 1.9, tilt: 2, yaw: -0.55, headTilt: 6, look: -12 } },
    { f: len, p: { x: 780, y: 1280, scale: 1.9, tilt: -2, yaw: -0.5, headTilt: -6, look: -10 } },
  ]);
  const det = <Hero look={DETECTIVE} pose={{ ...pd, expr: 'scared', blink: blinkAt(t, 101) }} rimId="rimBlue" shadow={0} />;
  return (
    // The swerve wraps BOTH the env and the characters, so Jake's hands stay on the wheel.
    <g transform={`translate(${swerve} 0)`}>
      <Bg img="env_car.jpg" cx={camX} cy={camY} s={zoom} />
      <g transform={cam1080(camX, camY, zoom)}>
        {/* Jake from behind: back of his bald head (a PERFECT smooth circle — NO ears), both hands on the wheel */}
        <g transform={`rotate(${lean} 300 1350)`} filter="url(#rimBlue)">
          <circle cx={300} cy={780 + headBob} r={115} fill="#161616" />
          <path d="M 260 880 L 340 880 L 385 925 Q 395 1050 385 1250 L 215 1250 Q 205 1050 215 925 Z" fill="#161616" />
          {/* arms to the wheel (the env's wheel, far left) */}
          <path d="M 225 960 L 140 1000 L 70 1010" stroke="#161616" strokeWidth={42} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 375 960 L 300 1030 L 240 1080" stroke="#161616" strokeWidth={42} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx={70} cy={1010} r={26} fill="#161616" />
          <circle cx={240} cy={1080} r={26} fill="#161616" />
        </g>
        {det}
        {/* foreground seat backs (the env's own bottom edge) hide the legs */}
        <defs>
          <clipPath id="seatClip">
            <rect x={-70} y={1450} width={1220} height={710} />
          </clipPath>
        </defs>
        <g clipPath="url(#seatClip)">
          <image href={staticFile('never-slept/env_car.jpg')} x={-70} y={-120} width={1220} height={2160} preserveAspectRatio="xMidYMid slice" />
        </g>
        {/* dark leather seat backs — hide the characters' lower bodies so they read as seated */}
        <defs>
          <linearGradient id="seatGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#26262C" />
            <stop offset="100%" stopColor="#101012" />
          </linearGradient>
        </defs>
        <path d="M -50 1920 L -50 1330 Q 150 1300 360 1320 L 360 1920 Z" fill="url(#seatGrad)" />
        <path d="M 720 1920 L 720 1280 Q 920 1250 1130 1270 L 1130 1920 Z" fill="url(#seatGrad)" />
        <path d="M -50 1330 Q 150 1300 360 1320" fill="none" stroke="#2A2A30" strokeWidth={3} />
        <path d="M 720 1280 Q 920 1250 1130 1270" fill="none" stroke="#2A2A30" strokeWidth={3} />
      </g>
    </g>
  );
};

// ---------- S4: day three — Jake rubbing his eyes, his ghost behind him, Detective pointing ----------
// VERIFIED staging (parent-checked reference): dark room, moonlight. Real Jake
// (solid black, sunglasses) rubbing his eyes; ONE LARGE translucent ghostly shadow Jake
// standing tall and STILL directly behind him, arms hanging down at its sides, looming
// and staring down at him — the hallucination does NOT copy Jake (characters never copy
// each other). Detective pointing at the shadow Jake with the magnifying glass lowered.
// All feet on the floor, clear of the bed and chair. Heads are perfect smooth circles;
// the Detective's eyes are plain solid white ovals.
export const S4 = ({ t, len }: SceneProps) => {
  const camX = 540 + Math.sin(t * 0.11) * 6;
  const camY = kf(t, [[0, 1100], [len, 1050]]);
  const zoom = kf(t, [[0, 1.0], [len, 1.1]]);
  const flick = t >= 206 && t < 212 ? 1 : 0;
  // Real Jake rubbing his eyes (solid, sunglasses).
  const pj = poseAt(t, [
    { f: 0, p: { x: 650, y: 1280, scale: 2.0, tilt: 0, headTilt: 8, look: 0, armL: { a: 130, b: 20 }, armR: { a: 130, b: 20 }, legL: { a: -6, b: 0 }, legR: { a: 6, b: 0 } } },
    { f: 75, p: { x: 650, y: 1280, scale: 2.0, headTilt: 10, look: 0, armL: { a: 140, b: 15 }, armR: { a: 140, b: 15 } } },
    { f: 150, p: { x: 650, y: 1280, scale: 2.0, headTilt: 6, look: 0, armL: { a: 125, b: 25 }, armR: { a: 125, b: 25 } } },
    { f: 225, p: { x: 650, y: 1280, scale: 2.0, headTilt: 10, look: 0, armL: { a: 140, b: 15 }, armR: { a: 140, b: 15 } } },
    { f: len, p: { x: 650, y: 1280, scale: 2.0, headTilt: 8, look: 0 } },
  ]);
  const jake = <Hero look={JAKE} pose={{ ...pj, expr: 'tired', blink: blinkAt(t, 87) }} rimId="rimBlue" shadow={1} />;
  // Ghost Jake: the hallucination — LARGE and looming, stands tall and still, arms hanging at its sides, staring down. Does NOT copy Jake.
  const ghostBob = Math.sin(t * 0.07) * 6;
  const pg = poseAt(t, [
    { f: 0, p: { x: 670, y: 1200, scale: 2.5, tilt: 0, headTilt: 8, look: 0, armL: { a: 10, b: 6 }, armR: { a: 10, b: 6 }, legL: { a: -6, b: 0 }, legR: { a: 6, b: 0 } } },
    { f: 150, p: { x: 670, y: 1200, scale: 2.5, headTilt: 10, look: 0, armL: { a: 10, b: 6 }, armR: { a: 10, b: 6 } } },
    { f: len, p: { x: 670, y: 1200, scale: 2.5, headTilt: 8, look: 0 } },
  ]);
  const ghost = <Hero look={GHOST} pose={{ ...pg, y: pg.y + ghostBob, expr: 'tired', blink: 0 }} rimId="rimBlue" shadow={0} />;
  // Detective pointing at the ghost, magnifier lowered in his other hand.
  const pd = poseAt(t, [
    { f: 0, p: { x: 320, y: 1390, scale: 1.5, tilt: 0, yaw: -0.4, headTilt: 0, look: -8, armL: { a: 15, b: 6 }, armR: { a: 105, b: 4 }, handR: 'point', legL: { a: -4, b: 0 }, legR: { a: 4, b: 0 } } },
    { f: 120, p: { x: 320, y: 1390, scale: 1.5, tilt: -2, yaw: -0.45, headTilt: -3, look: -10, armR: { a: 110, b: 2 } } },
    { f: len, p: { x: 320, y: 1390, scale: 1.5, tilt: 0, yaw: -0.4, headTilt: 0, look: -8 } },
  ]);
  const mg = toWorld(pd, joints(pd).armL.end);
  const det = <Hero look={DETECTIVE} pose={{ ...pd, expr: 'neutral', blink: blinkAt(t, 91) }} rimId="rimBlue" shadow={1} />;
  return (
    <g>
      <Bg img="env_bedroom.jpg" cx={camX} cy={camY} s={zoom} tint="#060B18" tintOp={0.6} />
      <g transform={cam1080(camX, camY, zoom)}>
        {/* the hallucination: translucent ghost Jake behind the real one */}
        <g opacity={0.6}>{ghost}</g>
        {jake}
        {det}
        <Magnifier x={mg.x} y={mg.y} s={1.0} />
        {/* microsleep blackout: the screen flickers black for 6 frames */}
        <rect x={-200} y={-200} width={1480} height={2320} fill="#000000" opacity={flick} />
      </g>
    </g>
  );
};

// ---------- S5: the scary part — Detective at the desk, glowing brain, FFI ----------
// VERIFIED staging (parent-checked reference): Detective BEHIND the desk, arm extended
// HORIZONTALLY, index finger pointing straight AT the glowing BLUE brain, which FLOATS
// at chest height right in front of his fingertip. Jake BESIDE the desk, nervous,
// ARMS CROSSED (not copying the Detective). The magnifying glass RESTS ON the desk,
// not in his hand. The book is oriented for the Detective to read. Heads are perfect
// smooth circles; Detective plain white oval eyes, no pupils. Background (bookshelf,
// lamp, moonlight window) is the approved original — keep it.
export const S5 = ({ t, len, g }: SceneProps) => {
  const camX = 540;
  const camY = kf(t, [[0, 1010], [len, 990]]);
  const zoom = kf(t, [[0, 1.0], [len, 1.06]]);
  // Feet at y 1420 (the desk's back edge) so they read as standing BEHIND the desk.
  const pd = poseAt(t, [
    { f: 0, p: { x: 300, y: 1182, scale: 1.7, tilt: 0, yaw: -0.2, headTilt: 0, look: -8, armL: { a: 10, b: 6 }, armR: { a: 83, b: 5 }, handR: 'point', legL: { a: 4, b: 0 }, legR: { a: -4, b: 0 } } },
    { f: 100, p: { x: 300, y: 1182, scale: 1.7, tilt: 2, yaw: -0.25, headTilt: 4, look: -10, armL: { a: 12, b: 6 } } },
    { f: len, p: { x: 300, y: 1182, scale: 1.7, tilt: 0, headTilt: 0, look: -6 } },
  ]);
  const pj = poseAt(t, [
    { f: 0, p: { x: 820, y: 1182, scale: 1.7, tilt: 3, headTilt: 0, look: -10, armL: { a: -40, b: 35 }, armR: { a: -40, b: 35 }, legL: { a: 4, b: 0 }, legR: { a: -4, b: 0 } } },
    { f: 120, p: { x: 820, y: 1186, scale: 1.7, tilt: 5, headTilt: 6, look: -14 } },
    { f: len, p: { x: 820, y: 1182, scale: 1.7, tilt: 3, headTilt: 0, look: -8 } },
  ]);
  const det = <Hero look={DETECTIVE} pose={{ ...pd, expr: 'neutral', blink: blinkAt(t, 93) }} rimId="rimBlue" shadow={0} />;
  const jake = <Hero look={JAKE} pose={{ ...pj, expr: 'worried', blink: blinkAt(t, 99) }} rimId="rimBlue" shadow={0} />;
  const glow = 0.22 + 0.13 * Math.sin(t * 0.12);
  return (
    <g>
      <Bg img="env_desk.jpg" cx={camX} cy={camY} s={zoom} />
      <g transform={cam1080(camX, camY, zoom)}>
        <defs>
          <radialGradient id="brainGlow">
            <stop offset="0%" stopColor="#66CCFF" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#66CCFF" stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* floating blue brain (hologram) at chest height, between the Detective and Jake — the Detective points straight at it */}
        <circle cx={635} cy={980} r={170} fill="url(#brainGlow)" opacity={glow} />
        <g transform="translate(635 980)">
          <ellipse cx={0} cy={0} rx={115} ry={82} fill="#66CCFF" opacity={0.92} />
          <ellipse cx={0} cy={0} rx={115} ry={82} fill="none" stroke="#BFE3FF" strokeWidth={3} opacity={0.85} />
          <path d="M -80 -20 Q -40 -45 0 -20 Q 40 -45 80 -20" fill="none" stroke="#BFE3FF" strokeWidth={4} opacity={0.7} />
          <path d="M -90 10 Q -45 -10 0 10 Q 45 -10 90 10" fill="none" stroke="#BFE3FF" strokeWidth={4} opacity={0.7} />
          <path d="M -70 40 Q -30 20 10 40 Q 50 20 80 35" fill="none" stroke="#BFE3FF" strokeWidth={4} opacity={0.7} />
          <path d="M -18 62 Q 0 78 18 62 L 10 88 L -10 88 Z" fill="#66CCFF" opacity={0.92} />
        </g>
        {/* magnifying glass resting on the desk (not in the Detective's hand) */}
        <g transform="translate(640 1600) rotate(-15)">
          <circle cx={0} cy={0} r={34} fill="#7FB2FF" opacity={0.35} stroke="#C9A227" strokeWidth={7} />
          <rect x={30} y={-7} width={62} height={14} rx={7} fill="#5A3A1A" />
        </g>
        {det}
        {jake}
      </g>
    </g>
  );
};

// ---------- S6: Randy Gardner, 1964 — Jake counts on his fingers, Detective with a clipboard ----------
export const S6 = ({ t, len, g }: SceneProps) => {
  const camX = kf(t, [[0, 600], [len, 580]]);
  const camY = kf(t, [[0, 950], [len, 880]]);
  const zoom = kf(t, [[0, 1.0], [len, 1.1]]);
  const pj = poseAt(t, [
    { f: 0, p: { x: 810, y: 1348, scale: 1.8, tilt: 0, headTilt: 0, look: 0, armL: { a: 10, b: 6 }, armR: { a: 10, b: 6 }, legL: { a: 5, b: 0 }, legR: { a: -5, b: 0 } } },
    { f: 60, p: { x: 810, y: 1348, scale: 1.8, headTilt: -4, look: -6, armL: { a: 10, b: 6 }, armR: { a: 135, b: 10 }, handR: 'open' } },
    { f: 120, p: { x: 810, y: 1348, scale: 1.8, headTilt: 4, look: 6, armL: { a: 140, b: 10 }, armR: { a: 135, b: 10 }, handL: 'open', handR: 'open' } },
    { f: 180, p: { x: 810, y: 1348, scale: 1.8, headTilt: -6, look: 0, armL: { a: 150, b: 55 }, armR: { a: 135, b: 10 }, handL: 'open', handR: 'open' } },
    { f: len, p: { x: 810, y: 1348, scale: 1.8, headTilt: 0, look: -8, armL: { a: 140, b: 50 }, armR: { a: 135, b: 10 } } },
  ]);
  const pd = poseAt(t, [
    { f: 0, p: { x: 420, y: 1348, scale: 1.8, tilt: 0, yaw: 0, headTilt: 0, look: 10, armL: { a: -30, b: 15 }, armR: { a: -20, b: 20 }, legL: { a: 4, b: 0 }, legR: { a: -4, b: 0 } } },
    { f: 150, p: { x: 420, y: 1348, scale: 1.8, headTilt: 3, look: 12, armL: { a: -25, b: 16 } } },
    { f: len, p: { x: 420, y: 1348, scale: 1.8, headTilt: 0, look: 10 } },
  ]);
  const cb = toWorld(pd, joints(pd).armL.end);
  const jakeExpr = t < 180 ? 'puzzled' : 'worried';
  const jake = <Hero look={JAKE} pose={{ ...pj, expr: jakeExpr, blink: blinkAt(t, 95) }} rimId="rimBlue" shadow={1} />;
  const det = <Hero look={DETECTIVE} pose={{ ...pd, expr: 'neutral', blink: blinkAt(t, 91) }} rimId="rimBlue" shadow={1} />;
  return (
    <g>
      <Bg img="env_calendar.jpg" cx={camX} cy={camY} s={zoom} />
      <g transform={cam1080(camX, camY, zoom)}>
        {jake}
        {det}
        {/* clipboard in the Detective's left hand */}
        <g transform={`translate(${cb.x} ${cb.y}) rotate(-8)`}>
          <rect x={-36} y={-50} width={72} height={100} rx={6} fill="#F6EFE3" stroke="#161616" strokeWidth={3} />
          <line x1={28} y1={-68} x2={14} y2={-46} stroke="#161616" strokeWidth={5} strokeLinecap="round" />
          <line x1={-24} y1={-30} x2={24} y2={-30} stroke="#161616" strokeWidth={3} />
          <line x1={-24} y1={-14} x2={24} y2={-14} stroke="#161616" strokeWidth={3} />
          <line x1={-24} y1={2} x2={14} y2={2} stroke="#161616" strokeWidth={3} />
          <line x1={-24} y1={18} x2={24} y2={18} stroke="#161616" strokeWidth={3} />
        </g>
      </g>
    </g>
  );
};

// ---------- S7: payoff — Jake asleep, Detective tucks him in ----------
// Same bedroom as S1; Jake asleep (eyes shut, slow breathing), Detective reaches
// toward the blanket, then nods. Calm moonlight.
export const S7 = ({ t, len }: SceneProps) => {
  const camX = kf(t, [[0, 480], [len, 490]]);
  const camY = kf(t, [[0, 1160], [len, 1140]]);
  const zoom = kf(t, [[0, 1.05], [len, 1.12]]);
  const breathe = Math.sin(t * 0.09) * 4;
  const pd = poseAt(t, [
    { f: 0, p: { x: 620, y: 1348, scale: 1.8, tilt: -4, yaw: -0.5, headTilt: -2, look: -14, armL: { a: 85, b: 12 }, armR: { a: -85, b: 10 }, legL: { a: 4, b: 0 }, legR: { a: -4, b: 0 } } },
    { f: 90, p: { x: 615, y: 1348, scale: 1.8, tilt: -7, yaw: -0.55, headTilt: 2, look: -16, armL: { a: 100, b: 8 }, armR: { a: -105, b: 5 } } },
    { f: 150, p: { x: 618, y: 1348, scale: 1.8, tilt: -3, yaw: -0.45, headTilt: 6, look: -12, armL: { a: 20, b: 8 }, armR: { a: -40, b: 8 } } },
    { f: 200, p: { x: 620, y: 1348, scale: 1.8, tilt: -2, yaw: -0.4, headTilt: 0, look: -12, armL: { a: 10, b: 6 }, armR: { a: 8, b: 6 } } },
    { f: len, p: { x: 620, y: 1348, scale: 1.8, headTilt: 0, look: -12 } },
  ]);
  const det = <Hero look={DETECTIVE} pose={{ ...pd, expr: 'neutral', blink: blinkAt(t, 97) }} rimId="rimBlue" shadow={1} />;
  return (
    <g>
      <Bg img="env_bedroom.jpg" cx={camX} cy={camY} s={zoom} tint="#7FB2FF" tintOp={0.08} />
      <g transform={cam1080(camX, camY, zoom)}>
        <LyingJake bunch breathe={breathe} />
        {det}
        {/* magnifying glass resting on the dresser — fully in frame */}
        <Magnifier x={880} y={1150} s={0.9} />
      </g>
    </g>
  );
};

// ---------- END: subscribe card (standalone topic — NO "watch the full video" card) ----------
export const END = ({ t, len }: SceneProps) => {
  const pop = kf(t, [[0, 0.85], [18, 1.0]], easeOut);
  const pd = poseAt(t, [
    { f: 0, p: { x: 540, y: 1192, scale: 2.2, tilt: 0, headTilt: -4, look: 0, armL: { a: 10, b: 6 }, armR: { a: 168, b: 4 }, handR: 'point', legL: { a: 5, b: 0 }, legR: { a: -5, b: 0 } } },
    { f: len, p: { x: 540, y: 1192, scale: 2.2, headTilt: -6, look: 0, armR: { a: 172, b: 2 } } },
  ]);
  return (
    <g>
      <rect x={0} y={0} width={1080} height={1920} fill="#EFE8DC" />
      <g transform="translate(540 300)">
        <rect x={-260} y={-70} width={520} height={140} rx={70} fill="#E62117" />
        <text x={0} y={30} textAnchor="middle" fontFamily={FONT.title} fontWeight={800} fontSize={88} fill="#FFFFFF">SUBSCRIBE</text>
      </g>
      <Hero look={DETECTIVE} pose={{ ...pd, scale: pd.scale * pop, expr: 'neutral', blink: blinkAt(t, 90) }} rimId="rimBlue" shadow={1} />
      <text x={540} y={1690} textAnchor="middle" fontFamily={FONT.title} fontWeight={800} fontSize={96} fill="#161616">Inkl</text>
      <text x={540} y={1770} textAnchor="middle" fontFamily={FONT.title} fontWeight={600} fontSize={52} fill="#3A3A3A">Curiosity. Explained.</text>
    </g>
  );
};
