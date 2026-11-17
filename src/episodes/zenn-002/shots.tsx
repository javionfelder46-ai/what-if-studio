import React from 'react';
import {
  Hero, basePose, poseAt, faceAt, kf, camT, LOOKS, Foreground, TitleCard,
  joints, toWorld, walkPose, plantedWalkPose, Magnifier, Study, Desk, Classroom, SchoolDesk,
  Party, PARTY_SIGN, Schematic, CountUp, SchLabel, Arrow, Gauge, BarChart, PieChart, Bedroom,
  Kitchen, KitchenIsland, Exterior, Stairwell, Banister, Rooftop,
  Phone, Mug, Cat, Glow, SpotlightBeam, EndCard, FONT, ShotProps, RewindOverlay, clamp, MOONLIGHT,
} from '../../engine';

// "The Spotlight Effect" — 182 shots, one per scene (+ S182, the voiceless end card),
// generated from episode.json (sizes/sets/keys) + timeline.json + scenes/zenn_002_scenes.json by
// src/episodes/zenn-002/gen_shots.py. Every shot is a pure function of its own clock t;
// each is right at its `key` frame first. Review the generated code, then verify on the board.
// Black silhouettes, rimBlue (moonlight) rim light, Detective's deerstalker + magnifier, Jake's plain
// red shirt (lobster emblem removed Nov 11 — it was video #2 only). Question popups are screen-space
// hand text in moonlight blue — never captions.
// Poster re-plan: Jake carries the story; the Detective appears ONLY at S1 (cold open),
// S31 (the sign beat) and S178-S181 (sunset finale, closing alongside Jake); S182 is the
// Inkl end card — the video's ONLY subscribe ask.

const CREAM = '#F6EFE3';

// --- focal props (drawn in shots.tsx, zenn-003 Prop pattern) ---

/** The GIANT LOBSTER SIGN: the poster's big red lobster — bold black shades + a
    white thumbs-up, on a cream board so it reads at medium distance (the old dark
    board vanished against the party wall). PANEL 3 order (poster is the spec): the
    big lobster KEEPS its shades + thumbs up; the old plain-sign rule is reversed. */
const LobsterSign: React.FC = () => (
  <g>
    <rect x={PARTY_SIGN.x} y={PARTY_SIGN.y} width={PARTY_SIGN.w} height={PARTY_SIGN.h} fill="#EFE3D0" stroke="#161616" strokeWidth={6} />
    <g transform={`translate(${PARTY_SIGN.x + 128} ${PARTY_SIGN.y + 88}) scale(1.15)`}>
      <ellipse cx={-52} cy={-8} rx={26} ry={18} fill="#D94A3A" stroke="#161616" strokeWidth={5} />
      <ellipse cx={52} cy={-8} rx={26} ry={18} fill="#D94A3A" stroke="#161616" strokeWidth={5} />
      {/* pincer notches (Nov 9): plain ellipses read as Mickey ears — a V split into each
          claw's outer edge makes them pincers. */}
      <path d="M -78 -8 L -64 -13 M -78 -8 L -64 -3" stroke="#161616" strokeWidth={4} strokeLinecap="round" />
      <path d="M 78 -8 L 64 -13 M 78 -8 L 64 -3" stroke="#161616" strokeWidth={4} strokeLinecap="round" />
      <ellipse cx={0} cy={0} rx={34} ry={30} fill="#D94A3A" stroke="#161616" strokeWidth={5} />
      <rect x={-26} y={-22} width={22} height={18} rx={6} fill="#0D0F1C" stroke="#000000" strokeWidth={3} />
      <rect x={4} y={-22} width={22} height={18} rx={6} fill="#0D0F1C" stroke="#000000" strokeWidth={3} />
      <path d="M -4 -14 L 4 -14" stroke="#0D0F1C" strokeWidth={5} strokeLinecap="round" />
      <path d="M -20 -6 L -10 -16 M 10 -6 L 20 -16" stroke="#FFFFFF" strokeWidth={2.5} strokeLinecap="round" opacity={0.85} />
      <path d="M -14 8 Q 0 20 14 8" stroke="#161616" strokeWidth={5} fill="none" strokeLinecap="round" />
      <path d="M -20 26 L 20 26 L 28 52 L 0 60 L -20 52 Z" fill="#D94A3A" stroke="#161616" strokeWidth={5} strokeLinejoin="round" />
      {/* thumbs-up (Nov 8 fix, redrawn Nov 9): a fist with the thumb on its SIDE, angled
          up-left — a centred vertical digit reads as a middle finger, not a thumb. */}
      <path d="M 26 46 L 38 24" stroke="#D94A3A" strokeWidth={11} strokeLinecap="round" />
      <rect x={27} y={2} width={24} height={22} rx={8} fill="#FFF8EB" stroke="#161616" strokeWidth={4} />
      <rect x={25.5} y={-16} width={9} height={20} rx={4.5} fill="#FFF8EB" stroke="#161616" strokeWidth={4} transform="rotate(-40 30 -6)" />
      <path d="M 36 7 L 36 15 M 44 7 L 44 15" stroke="#161616" strokeWidth={2.5} strokeLinecap="round" />
    </g>
  </g>
);

/** PANEL 3, the full-frame big lobster (S4, macro insert): the poster's lobster as
    drawn — big red body, bold black shades, wide grin, one claw giving a white
    thumbs-up — on a deep-red field, like the T-shirt graphic itself. The poster is
    the spec: do NOT 'fix' this lobster (no plain version, no shades removal). */
const BigLobster: React.FC = () => (
  <g>
    <rect x={340} y={180} width={1240} height={720} rx={32} fill="#8E2318" stroke="#161616" strokeWidth={6} />
    <path d="M 930 400 Q 870 300 830 250" stroke="#D94A3A" strokeWidth={10} fill="none" strokeLinecap="round" />
    <path d="M 990 400 Q 1050 300 1090 250" stroke="#D94A3A" strokeWidth={10} fill="none" strokeLinecap="round" />
    <circle cx={830} cy={250} r={9} fill="#FFF8EB" stroke="#161616" strokeWidth={4} />
    <circle cx={1090} cy={250} r={9} fill="#FFF8EB" stroke="#161616" strokeWidth={4} />
    <ellipse cx={960} cy={800} rx={95} ry={42} fill="#C0392B" stroke="#161616" strokeWidth={6} />
    <ellipse cx={905} cy={845} rx={62} ry={32} fill="#C0392B" stroke="#161616" strokeWidth={6} />
    <ellipse cx={1015} cy={845} rx={62} ry={32} fill="#C0392B" stroke="#161616" strokeWidth={6} />
    <path d="M 800 780 L 740 800 M 800 810 L 745 835 M 1120 780 L 1180 800 M 1120 810 L 1175 835" stroke="#D94A3A" strokeWidth={12} strokeLinecap="round" />
    <ellipse cx={960} cy={580} rx={170} ry={190} fill="#D94A3A" stroke="#161616" strokeWidth={7} />
    <ellipse cx={960} cy={690} rx={95} ry={75} fill="#FFF8EB" stroke="#161616" strokeWidth={5} />
    <path d="M 882 668 L 1038 668 M 878 698 L 1042 698" stroke="#161616" strokeWidth={4} strokeLinecap="round" />
    <path d="M 810 620 Q 760 620 740 640" stroke="#D94A3A" strokeWidth={24} strokeLinecap="round" fill="none" />
    <ellipse cx={730} cy={650} rx={72} ry={60} fill="#D94A3A" stroke="#161616" strokeWidth={7} />
    <path d="M 688 615 Q 715 650 688 685" stroke="#161616" strokeWidth={5} fill="none" strokeLinecap="round" />
    <path d="M 1110 600 Q 1165 555 1180 478" stroke="#D94A3A" strokeWidth={24} strokeLinecap="round" fill="none" />
    <ellipse cx={1180} cy={500} rx={68} ry={56} fill="#D94A3A" stroke="#161616" strokeWidth={7} />
    {/* thumbs-up (Nov 8 fix, redrawn Nov 9): a fist with the thumb on its SIDE, angled
        up-left — a centred vertical digit reads as a middle finger, not a thumb. */}
    <rect x={1150} y={420} width={60} height={54} rx={16} fill="#FFF8EB" stroke="#161616" strokeWidth={5} />
    <rect x={1152} y={376} width={20} height={44} rx={10} fill="#FFF8EB" stroke="#161616" strokeWidth={5} transform="rotate(-40 1162 398)" />
    <path d="M 1178 434 L 1178 452 M 1194 434 L 1194 452" stroke="#161616" strokeWidth={3} strokeLinecap="round" />
    <rect x={852} y={420} width={112} height={72} rx={18} fill="#0D0F1C" stroke="#000000" strokeWidth={5} />
    <rect x={976} y={420} width={112} height={72} rx={18} fill="#0D0F1C" stroke="#000000" strokeWidth={5} />
    <path d="M 964 452 L 976 452" stroke="#0D0F1C" strokeWidth={8} strokeLinecap="round" />
    <path d="M 852 450 L 840 448 M 1088 450 L 1100 448" stroke="#0D0F1C" strokeWidth={8} strokeLinecap="round" />
    <path d="M 880 470 L 920 440 M 1010 470 L 1050 440" stroke="#FFFFFF" strokeWidth={5} strokeLinecap="round" opacity={0.85} />
    <path d="M 880 540 L 1040 540 Q 1040 610 960 610 Q 880 610 880 540 Z" fill="#5E150C" stroke="#161616" strokeWidth={5} strokeLinejoin="round" />
    <rect x={895} y={540} width={130} height={18} rx={8} fill="#FFFFFF" stroke="#161616" strokeWidth={3} />
  </g>
);

/** The red lobster T-shirt itself, lying on the desk (macro insert S40).
    The small emblem on its chest is the rig's emblem, copied once — shades + thumbs-up,
    as on Jake's shirt. */
const Tshirt: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -110 -80 L -170 -40 L -120 0 L -120 110 L 120 110 L 120 0 L 170 -40 L 110 -80 Q 0 -40 -110 -80 Z" fill="#C0392B" stroke="#161616" strokeWidth={6} strokeLinejoin="round" />
    <path d="M 60 -70 L 120 110 L 120 0 L 170 -40 L 110 -80 Q 90 -60 60 -70 Z" fill="#96281B" opacity={0.6} />
    <g transform="translate(0 22) scale(1.8)">
      <ellipse cx={-16.9} cy={-14.3} rx={7.8} ry={5.85} fill="#FFF8EB" stroke="#161616" strokeWidth={2.6} />
      <path d="M -16.9 -13 L -19.5 -6.5" stroke="#161616" strokeWidth={2} strokeLinecap="round" />
      {/* thumbs-up (Nov 8 fix, redrawn Nov 9): thumb on the fist's SIDE, angled up-left. */}
      <path d="M 11 -13 L 16 -21" stroke="#FFF8EB" strokeWidth={5} strokeLinecap="round" />
      <rect x={11.5} y={-32} width={12} height={11} rx={4} fill="#FFF8EB" stroke="#161616" strokeWidth={2.6} />
      <rect x={7.5} y={-45} width={6.5} height={15} rx={3.25} fill="#FFF8EB" stroke="#161616" strokeWidth={2.6} transform="rotate(-40 10.75 -37.5)" />
      <path d="M 18 -29 L 18 -24" stroke="#161616" strokeWidth={2} strokeLinecap="round" />
      <ellipse cx={0} cy={-0.65} rx={8.45} ry={8.45} fill="#FFF8EB" stroke="#161616" strokeWidth={2.6} />
      <ellipse cx={-5.2} cy={-5.85} rx={6.5} ry={4.55} fill="#161616" />
      <ellipse cx={5.2} cy={-5.85} rx={6.5} ry={4.55} fill="#161616" />
      <circle cx={1.95} cy={-7.8} r={1.3} fill="#FFFFFF" />
      <circle cx={-8.45} cy={-7.8} r={1.3} fill="#FFFFFF" />
      <path d="M -1.3 -5.85 L 1.3 -5.85" stroke="#161616" strokeWidth={2.6} strokeLinecap="round" />
      <path d="M -11.7 -5.85 L -15.6 -7.8 M 11.7 -5.85 L 15.6 -7.8" stroke="#161616" strokeWidth={2.6} strokeLinecap="round" />
      <path d="M -4.55 6.5 L 4.55 6.5 L 8.45 15.6 L 0 18.2 L -4.55 15.6 Z" fill="#FFF8EB" stroke="#161616" strokeWidth={2.6} strokeLinejoin="round" />
    </g>
  </g>
);

/** A beating heart (S64, 'your heartbeat sounds when you\'re nervous'): lub-dub,
    scale 1.00 -> ~1.14, two sharp thumps per second — never a smooth sine. */
const Heart: React.FC<{ x: number; y: number; s?: number; t: number }> = ({ x, y, s = 1, t }) => {
  const ph = t % 30;
  const thump = Math.max(0, 1 - ph / 5) + 0.6 * Math.max(0, 1 - Math.abs(ph - 9) / 5);
  const beat = 1 + 0.14 * Math.min(1, thump);
  return (
    <g transform={`translate(${x} ${y}) scale(${s * beat})`}>
      <path d="M 0 34 Q -58 -8 -34 -38 Q -12 -58 0 -34 Q 12 -58 34 -38 Q 58 -8 0 34 Z" fill="#C0392B" stroke="#161616" strokeWidth={5} strokeLinejoin="round" />
      <g stroke={CREAM} strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.9}>
        {[0, 1, 2].map((i) => (
          <path key={i} d={`M ${58 + i * 18} ${-22 + i * 8} Q ${76 + i * 20} 0 ${58 + i * 18} ${22 - i * 8}`} />
        ))}
      </g>
    </g>
  );
};

/** Lunch on the desk (S104, 'thinking about lunch'): a sandwich and an apple. */
const Lunch: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={26} rx={150} ry={14} fill="#000" opacity={0.3} />
    {/* sandwich: golden bread, lettuce + tomato layers peeking out, bottom slice */}
    <path d="M -110 -12 L -10 -72 L 42 18 Z" fill="#EBCB8B" stroke="#161616" strokeWidth={5} strokeLinejoin="round" />
    <path d="M -98 -22 L -10 -64 L 30 8 Z" fill="#F6E3B0" />
    <path d="M -110 -12 L 42 18" stroke="#5A9A4A" strokeWidth={10} strokeLinecap="round" />
    <path d="M -104 -2 L 36 26" stroke="#C0392B" strokeWidth={7} strokeLinecap="round" />
    <path d="M -100 6 L 30 32 L 8 40 L -88 20 Z" fill="#EBCB8B" stroke="#161616" strokeWidth={4} strokeLinejoin="round" />
    <circle cx={120} cy={-6} r={34} fill="#C0392B" stroke="#161616" strokeWidth={5} />
    <path d="M 120 -40 Q 128 -58 140 -56" stroke="#4A7A3A" strokeWidth={6} fill="none" strokeLinecap="round" />
  </g>
);

/** A messy desk (S136, 'real life is messier than a lab'): scattered papers, a tipped mug. */
const MessyDesk: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <g transform="rotate(-14 -80 0)"><rect x={-150} y={-34} width={140} height={90} fill="#F2EAD8" stroke="#161616" strokeWidth={4} /><path d="M -130 -12 L -40 -12 M -130 8 L -60 8" stroke="#4A4438" strokeWidth={4} strokeLinecap="round" /></g>
    <g transform="rotate(9 60 10)"><rect x={-10} y={-28} width={140} height={90} fill="#EDE8DE" stroke="#161616" strokeWidth={4} /><path d="M 10 -6 L 100 -6 M 10 14 L 80 14" stroke="#4A4438" strokeWidth={4} strokeLinecap="round" /></g>
    <g transform="translate(120 40) rotate(78)"><rect x={-24} y={-52} width={48} height={52} rx={8} fill="#F4F1EA" stroke="#161616" strokeWidth={4} /><rect x={-24} y={-36} width={48} height={10} fill="#FF8A3D" /></g>
    <ellipse cx={150} cy={58} rx={46} ry={10} fill="#5B3A26" opacity={0.8} />
  </g>
);

/** A dark plant silhouette for blurred foreground depth (about a third of shots).
    Nov 10 slim: blades ~25% shorter and narrower — the old 260-tall blades read as a
    big dark smudge in close-ups (S79/S87/S127 hid students behind it). */
const FgPlant: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} fill="#0E0C12">
    <path d="M 0 0 Q -50 -85 -22 -160 Q 8 -85 0 0 Z" />
    <path d="M 0 0 Q 45 -75 68 -150 Q 15 -80 0 0 Z" />
    <path d="M 0 0 Q -30 -120 8 -195 Q 22 -105 0 0 Z" />
  </g>
);

/** THE SPOTLIGHT EFFECT sign (S31, poster panel 14): a standing board on an easel,
    right of the Detective's desk — he points at it. Cream board, hand-lettered caps. */
const SignBoard: React.FC = () => (
  <g>
    <path d="M 1470 650 L 1440 850 M 1710 650 L 1740 850 M 1565 650 L 1565 850" stroke="#3A2A22" strokeWidth={10} strokeLinecap="round" />
    <rect x={1410} y={380} width={310} height={270} rx={10} fill="#F6EFE3" stroke="#161616" strokeWidth={6} />
    <text x={1565} y={470} textAnchor="middle" fontFamily={FONT.hand} fontSize={44} fill="#161616">THE</text>
    <text x={1565} y={540} textAnchor="middle" fontFamily={FONT.hand} fontSize={44} fill="#161616">SPOTLIGHT</text>
    <text x={1565} y={610} textAnchor="middle" fontFamily={FONT.hand} fontSize={44} fill="#161616">EFFECT</text>
  </g>
);

/** Jake's replay thought bubble (S62, poster panel 19): a cloud with the lobster in
    it — he spent the whole night aware of the lobster. The mini lobster is the rig emblem. */
const ThoughtBubble: React.FC = () => (
  <g>
    <circle cx={1120} cy={470} r={10} fill="#F6EFE3" opacity={0.9} />
    <circle cx={1160} cy={430} r={14} fill="#F6EFE3" opacity={0.9} />
    <circle cx={1210} cy={380} r={18} fill="#F6EFE3" opacity={0.9} />
    <g fill="#F6EFE3" stroke="#161616" strokeWidth={5}>
      <ellipse cx={1360} cy={300} rx={150} ry={80} />
      <ellipse cx={1270} cy={330} rx={70} ry={50} />
      <ellipse cx={1450} cy={330} rx={70} ry={50} />
    </g>
    <g transform="translate(1360 300) scale(1.6)">
      <ellipse cx={-16.9} cy={-14.3} rx={7.8} ry={5.85} fill="#FFF8EB" stroke="#161616" strokeWidth={2.6} />
      <path d="M -16.9 -13 L -19.5 -6.5" stroke="#161616" strokeWidth={2} strokeLinecap="round" />
      {/* thumbs-up (Nov 8 fix, redrawn Nov 9): thumb on the fist's SIDE, angled up-left. */}
      <path d="M 11 -13 L 16 -21" stroke="#FFF8EB" strokeWidth={5} strokeLinecap="round" />
      <rect x={11.5} y={-32} width={12} height={11} rx={4} fill="#FFF8EB" stroke="#161616" strokeWidth={2.6} />
      <rect x={7.5} y={-45} width={6.5} height={15} rx={3.25} fill="#FFF8EB" stroke="#161616" strokeWidth={2.6} transform="rotate(-40 10.75 -37.5)" />
      <path d="M 18 -29 L 18 -24" stroke="#161616" strokeWidth={2} strokeLinecap="round" />
      <ellipse cx={0} cy={-0.65} rx={8.45} ry={8.45} fill="#FFF8EB" stroke="#161616" strokeWidth={2.6} />
      <ellipse cx={-5.2} cy={-5.85} rx={6.5} ry={4.55} fill="#161616" />
      <ellipse cx={5.2} cy={-5.85} rx={6.5} ry={4.55} fill="#161616" />
      <circle cx={1.95} cy={-7.8} r={1.3} fill="#FFFFFF" />
      <circle cx={-8.45} cy={-7.8} r={1.3} fill="#FFFFFF" />
      <path d="M -1.3 -5.85 L 1.3 -5.85" stroke="#161616" strokeWidth={2.6} strokeLinecap="round" />
      <path d="M -11.7 -5.85 L -15.6 -7.8 M 11.7 -5.85 L 15.6 -7.8" stroke="#161616" strokeWidth={2.6} strokeLinecap="round" />
      <path d="M -4.55 6.5 L 4.55 6.5 L 8.45 15.6 L 0 18.2 L -4.55 15.6 Z" fill="#FFF8EB" stroke="#161616" strokeWidth={2.6} strokeLinejoin="round" />
    </g>
  </g>
);

/** Confidence sparkles (S40, poster panel 15): four-point stars around Jake's head,
    gently pulsing — always visible at the key frame (no t-window like the ui Sparkle). */
const Sparkles: React.FC<{ t: number }> = ({ t }) => {
  const o = 0.55 + 0.35 * Math.sin(t / 6);
  const star = 'M 0 -40 Q 6 -6 40 0 Q 6 6 0 40 Q -6 6 -40 0 Q -6 -6 0 -40 Z';
  return (
    <g opacity={o} fill="#FFE27A">
      <path transform="translate(880 460) scale(0.9)" d={star} />
      <path transform="translate(1090 440) scale(1.1)" d={star} />
      <path transform="translate(1150 560) scale(0.7)" d={star} />
      <path transform="translate(855 580) scale(0.6)" d={star} />
    </g>
  );
};

/** BOLD DARK SUNGLASSES on Jake's face (S43, poster panel 16). The rig's pose.glasses reads as
    white-framed CLEAR glasses on a black head (dark lenses vanish, the white glints
    read as frames — S4 first-pass fail), so the shades are drawn here, AFTER the Hero,
    tracking the hero's pose: x/y/s/yaw come from p0 (head centre = x + yaw*30*s,
    y - 176*s). Lenses are solid near-black with a bold black frame and ONE small
    white glint each. */
const BoldShades: React.FC<{ x: number; y: number; s: number; yaw: number }> = ({ x, y, s, yaw }) => {
  const eyeY = y - 4 * s;
  const dx = 21 * (1 - 0.28 * Math.abs(yaw)) * s;
  const w = 52 * s;
  const h = 36 * s;
  return (
    <g>
      <path d={`M ${x - 58 * s} ${eyeY - 14 * s} L ${x + 58 * s} ${eyeY - 14 * s}`} stroke="#0D0F1C" strokeWidth={6 * s} strokeLinecap="round" />
      {[-1, 1].map((sd) => (
        <g key={sd}>
          <rect x={x + sd * dx - w / 2} y={eyeY - h / 2} width={w} height={h} rx={10 * s} fill="#0D0F1C" stroke="#000000" strokeWidth={4 * s} />
          <path d={`M ${x + sd * dx - 8 * s} ${eyeY + 8 * s} L ${x + sd * dx + 8 * s} ${eyeY - 8 * s}`} stroke="#FFFFFF" strokeWidth={3 * s} strokeLinecap="round" opacity={0.85} />
        </g>
      ))}
    </g>
  );
};

/** A screen-space question popup: hand font, warm red, inside the frame. */
const Popup: React.FC<{ lines: string[]; x: number; y: number; size: number }> = ({ lines, x, y, size }) => (
  <text x={x} y={y} textAnchor="middle" fontFamily={FONT.hand} fontSize={size} fill={MOONLIGHT}>
    {lines.map((ln, i) => (
      <tspan key={i} x={x} dy={i === 0 ? 0 : size + 12}>{ln}</tspan>
    ))}
  </text>
);

// ---------- S1: wide, study — Ch1 The Lobster Shirt ----------
export const S1: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 960, y: 712, scale: 1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 55, p: { x: 960, y: 712, scale: 1, yaw: -0.3, headTilt: 6, armL: { a: 95, b: 30 }, armR: { a: 120, b: 110 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 95, p: { x: 960, y: 712, scale: 1, yaw: -0.3, headTilt: 4, armL: { a: 88, b: 26 }, armR: { a: 112, b: 100 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  // Nov 8 smirk (Javion: Detective should do a funny smirk with one eyebrow raised —
  // sly, like he's onto the mystery): 'smirk' (rig: one brow raised high, other flat,
  // one-sided smile, eyes open) comes in at f=30 as the glass starts to lift, replacing
  // the old 'puzzled' at f=55. Head-scratch + glass raise + glow unchanged.
  const f0 = faceAt(t, [[0, 'neutral'], [30, 'smirk']]);
  const mg = toWorld(p0, joints(p0).armL.end);
  // Magnifier raise (Nov 8 glass fix): the glass starts lens-DOWN in his grip behind the desk
  // (the Desk is drawn over it, so it stays hidden) and swings up to head height over f=30-55
  // as the arm rises — raised from behind the desk, in his hand the whole time, never floating.
  const mgRot = kf(t, [[0, 180], [30, 180], [55, 0], [95, 0]]);
  const camX = kf(t, [[0, 960], [len, 960]]);
  const camY = kf(t, [[0, 560], [len, 560]]);
  const zoom = kf(t, [[0, 1.0], [len, 1.06]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Study t={t + 77} id="s1" veil={0.28} />
        <Hero look={LOOKS.detective} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <g transform={`translate(${mg.x} ${mg.y}) rotate(${mgRot})`}>
          <Magnifier x={0} y={0} s={1} />
        </g>
        <Desk x0={560} x1={1360} y={700} />
        <TitleCard t={t} lines={['WHY DOES IT FEEL LIKE', 'EVERYONE IS WATCHING YOU?']} accent="#C0392B" size={96} />
      </g>
    </g>
  );
};

// ---------- S2: medium, party — Ch1 The Lobster Shirt ----------
// Nov 8 walk fix (Javion: "literally walking in place and gliding across the fucking
// floor"): Jake enters on TRUE planted steps (plantedWalkPose — each foot plants, holds
// while the body moves over it, stride matched to body speed, ~2 steps/sec, arms swing
// opposite the legs). The old walkPose + easeInOut made him glide in place AND linger on
// top of guestB at the door (the "doubled Jake"). guestB now waits a step BACK from
// Jake's lane (smaller + higher = further back) and Jake is drawn last, so Jake walks
// PAST him instead of through him. Standing feet are apart (shoulder width), never glued
// together. Rim light KEPT as-is (Javion's settled call Nov 8: keep the glow — the earlier
// tighten/remove orders were cancelled; halo untouched).
// Nov 8 duplicate-Jake fix (Javion: "get rid of the duplicate jake" — clip v2): guestB
// at x=1520 still stood directly behind Jake in the doorway, his head poking out from
// behind Jake's head, so at a glance he read as a second Jake. guestB is now moved to
// x=950 — standing by the snack table's right end, well clear of the door and of Jake's
// path (Jake walks 1564 -> 1050) — so the doorway shows ONE Jake entering alone and
// guestB reads as a separate person in a separate spot. Same y/scale/yaw, feet apart.
export const S2: React.FC<ShotProps> = ({ t, len }) => {
  const lin = (x: number) => x; // a walk moves at constant speed — no ease in/out
  const p0w = plantedWalkPose(1564, 1050, t, len, 900.5, 1.1, {}, -1);
  // Nov 8 arrival fix (Javion, on clip v4 at 7.0s / f210: Jake looked bent/leaning like
  // he was propped on something — the walk's lean-into-the-walk tilt never settles, so
  // the last frames of the walk-in read as a slouch, not a stand; the guests stand
  // upright and need no fix). Over the final 9 frames (t=92-101) the walk settles into
  // a straight standing pose — tilt, head tilt and sway ease to 0, legs come to the
  // standing -10/+10, arms hang (10/-8), hip rises to the standing height — and the
  // body holds its t=101 x from then on, so the planted feet never slide. By f210
  // (t=101) he is fully upright; frames 101-105 hold the stand. The walk itself
  // (t<92) is untouched — planted steps, ~2 steps/sec.
  const st = Math.min(1, Math.max(0, (t - 92) / 9));
  const lerpN = (a: number, b: number) => a + (b - a) * st;
  const lerpL = (a: { a: number; b: number }, b: { a: number; b: number }) => ({ a: lerpN(a.a, b.a), b: lerpN(a.b, b.b) });
  const X_HOLD = 1564 + ((1050 - 1564) / len) * 101; // hip x at t=101 — hold it once standing
  const p0 = {
    ...p0w,
    x: Math.max(p0w.x, X_HOLD),
    y: lerpN(p0w.y, 900.5 - 140 * 1.1),
    tilt: p0w.tilt * (1 - st),
    headTilt: p0w.headTilt * (1 - st),
    sway: p0w.sway * (1 - st),
    legL: lerpL(p0w.legL, { a: -10, b: 0 }),
    legR: lerpL(p0w.legR, { a: 10, b: 0 }),
    armL: lerpL(p0w.armL, { a: 10, b: -8 }),
    armR: lerpL(p0w.armR, { a: 10, b: -8 }),
  };
  const f0 = faceAt(t, [[0, 'neutral']]);
  const p1 = poseAt(t, [
    { f: 0, p: { x: 818.2, y: 719.4, scale: 1, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 52, p: { x: 818.2, y: 719.4, scale: 1, yaw: 0.3, look: 0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 92, p: { x: 818.2, y: 719.4, scale: 1, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f1 = faceAt(t, [[0, 'neutral']]);
  const p2 = poseAt(t, [
    { f: 0, p: { x: 950, y: 692, scale: 0.88, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 52, p: { x: 950, y: 692, scale: 0.88, yaw: -0.3, look: -0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 92, p: { x: 950, y: 692, scale: 0.88, yaw: -0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f2 = faceAt(t, [[0, 'neutral']]);
  const camX = kf(t, [[0, 1364], [len, 1050]], lin);
  const camY = kf(t, [[0, 650.5], [len, 650.5]]);
  const zoom = kf(t, [[0, 1.7], [len, 1.75]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Party t={t + 114} id="s2" veil={0.44} />
        <Hero look={LOOKS.guestB} pose={{ ...p2, ...f2 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestA} pose={{ ...p1, ...f1 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
      </g>
    </g>
  );
};

// ---------- S3: two-shot, party — Ch1 The Lobster Shirt ----------
// Nov 8 fix: standing feet apart (shoulder width), never glued. The f=45 'open' arms
// had a sign error (armL -40 crossed INWARD across the body — the generator's 'open'
// gesture, gen_shots.py:422 — fixed here to a symmetric +28 spread, straight arms).
// f=82 returns to a neutral hang. Rim light kept as-is (Javion: keep the glow).
// Nov 8 legs fix (Javion, on clip v3: Jake's chest/head turned toward guestA but his
// legs/feet still pointed straight at the camera — "how his body turn towards her but
// the legs is in the opposite direction?"): the turn now includes the lower body.
// Jake's turned keys set facing -1 (shoes point toward her) with legs biased left
// (legL 14/-4, legR 8/-2 — feet land left of the hips, staggered, planted, one foot
// pivoting around the other over f=0-12); guestA mirrors it (facing 1, legL 7/-2,
// legR 12/-4, feet biased right toward him). Upper-body turn, reach, glow unchanged.
// Nov 8 facing fix (Javion, on clip v2: Jake + guestA stood shoulder-to-shoulder facing
// the camera "like posing for a photo" — they must FACE EACH OTHER, like two people
// talking): both turn toward each other over the first 12 frames and hold it — Jake
// yaw -0.6 + look -0.5 (three-quarter toward her, both eyes still visible), guestA
// yaw +0.6 + look +0.5 (three-quarter toward him). Jake's f=45 gesture is now a
// one-arm reach toward her (armL a:38) instead of the symmetric spread; his other arm
// hangs. Feet stay apart and planted throughout.
// Nov 8 side-view fix (Javion, on clip v4: "when you turn to the side we arent suppose
// to see the front of the shirt still" — the turn must rotate the ENTIRE body as one
// unit, head + torso + legs + feet together, and it applies to EVERY character via the
// rig, not a per-character patch): the rig's yaw now genuinely rotates the body —
// turnWidth narrows the torso to ~a third in profile and the chest emblem / centre
// seam / collar fade out as |yaw| grows, so a turned body shows its side, never the
// shirt front. The head stays three-quarter (yaw -0.6 keeps both eyes visible).
// Nov 8 stand-straight fix (Javion, on clip v4 at 7s: standing characters looked bent /
// leaning like they were propped on something): the v4 leg angles (14/-4, 8/-2) bent
// the legs sideways, which read as a lunge. Standing legs are now near-vertical with
// only a slight forward stagger (legL 5, legR -5 — lead foot toward the other person,
// trail foot back, both flat and planted), so the turned stance stands STRAIGHT UP:
// vertical torso, upright posture, no bend, no lean. Same values for both characters —
// the rig mirrors them by `facing`, so each one's lead foot points at the other.
export const S3: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 980, y: 731.3, scale: 1.1, yaw: -0.15, look: 0, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 12, p: { x: 980, y: 731.3, scale: 1.1, yaw: -0.6, look: -0.5, facing: -1, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 45, p: { x: 980, y: 731.3, scale: 1.1, yaw: -0.6, look: -0.5, facing: -1, armL: { a: 38, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 82, p: { x: 980, y: 731.3, scale: 1.1, yaw: -0.6, look: -0.5, facing: -1, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral']]);
  const p1 = poseAt(t, [
    { f: 0, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.25, look: 0, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 12, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.6, look: 0.5, facing: 1, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 45, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.6, look: 0.5, facing: 1, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 82, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.6, look: 0.5, facing: 1, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f1 = faceAt(t, [[0, 'neutral']]);
  const camX = kf(t, [[0, 845.1], [len, 845.1]]);
  const camY = kf(t, [[0, 595.3], [len, 595.3]]);
  const zoom = kf(t, [[0, 1.35], [len, 1.4]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Party t={t + 151} id="s3" veil={0.44} />
        <LobsterSign />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestA} pose={{ ...p1, ...f1 }} rimId="rimBlue" shadow={1} />
        <Foreground blur={10}>
          <FgPlant x={194} y={1020} s={1.8} />
        </Foreground>
      </g>
    </g>
  );
};

// ---------- S4: macro insert, party — Ch1 The Lobster Shirt ----------
export const S4: React.FC<ShotProps> = ({ t, len }) => {
  const camX = kf(t, [[0, 960], [len, 960]]);
  const camY = kf(t, [[0, 540], [len, 540]]);
  const zoom = kf(t, [[0, 1.5], [len, 1.55]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Party t={t + 188} id="s4" veil={0.44} />
        <BigLobster />
      </g>
    </g>
  );
};

// ---------- S5: wide, party — Ch1 The Lobster Shirt ----------
export const S5: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 980, y: 731.3, scale: 1.1, yaw: -0.45, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 50, p: { x: 980, y: 731.3, scale: 1.1, yaw: -0.45, armL: { a: 15, b: -9 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 90, p: { x: 980, y: 731.3, scale: 1.1, yaw: -0.45, armL: { a: 15, b: -9 }, armR: { a: 45, b: -55 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'cool']]);
  const p1 = poseAt(t, [
    { f: 0, p: { x: 710.3, y: 712, scale: 1, yaw: 0.55, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 50, p: { x: 710.3, y: 712, scale: 1, yaw: 0.55, look: 0.4, armL: { a: 30, b: -40 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 90, p: { x: 710.3, y: 712, scale: 1, yaw: 0.55, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f1 = faceAt(t, [[0, 'happy']]);
  const p2 = poseAt(t, [
    { f: 0, p: { x: 1249.7, y: 719.4, scale: 1, yaw: -0.5, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 50, p: { x: 1249.7, y: 719.4, scale: 1, yaw: -0.5, look: -0.4, armL: { a: 5, b: 0 }, armR: { a: 40, b: -30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 90, p: { x: 1249.7, y: 719.4, scale: 1, yaw: -0.5, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f2 = faceAt(t, [[0, 'smug']]);
  const p3 = poseAt(t, [
    { f: 0, p: { x: 575.5, y: 726, scale: 1, yaw: 0.5, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 50, p: { x: 575.5, y: 726, scale: 1, yaw: 0.5, look: 0.4, armL: { a: 20, b: -70 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 90, p: { x: 575.5, y: 726, scale: 1, yaw: 0.5, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f3 = faceAt(t, [[0, 'happy']]);
  const camX = kf(t, [[0, 960], [len, 960]]);
  const camY = kf(t, [[0, 570], [len, 570]]);
  const zoom = kf(t, [[0, 1.08], [len, 1.12]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Party t={t + 225} id="s5" veil={0.28} />
        {/* v8: the Detective sneaks in the background, watching — small, still,
            at the frame edge among the crowd, never centre. Nov 9 fix: he was
            standing ON the sofa (feet 47 units above the guests' floor line) —
            now on the floor (y 747 + 140*0.8 = 859, the guests' floor line),
            clear of the sofa footprint, still at the edge in shadow. */}
        <Hero look={LOOKS.detective} pose={{ ...basePose, x: 490, y: 747, scale: 0.8, yaw: 0.25 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestA} pose={{ ...p1, ...f1 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestB} pose={{ ...p2, ...f2 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestC} pose={{ ...p3, ...f3 }} rimId="rimBlue" shadow={1} />
      </g>
    </g>
  );
};

// ---------- S6: two-shot, party — Ch1 The Lobster Shirt ----------
export const S6: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = walkPose(kf(t, [[0, 1564], [len, 1250]]), t * 0.6 + 1.2, 900.5, 1.1, {}, -1);
  const f0 = faceAt(t, [[0, 'neutral']]);
  const p1 = poseAt(t, [
    { f: 0, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 51, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.3, look: 0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 91, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f1 = faceAt(t, [[0, 'neutral']]);
  const camX = kf(t, [[0, 1364], [len, 1250]]);
  const camY = kf(t, [[0, 670.5], [len, 670.5]]);
  const zoom = kf(t, [[0, 1.35], [len, 1.4]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Party t={t + 262} id="s6" veil={0.44} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestA} pose={{ ...p1, ...f1 }} rimId="rimBlue" shadow={1} />
      </g>
    </g>
  );
};

// ---------- S7: medium, party — Ch1 The Lobster Shirt ----------
export const S7: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 49, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.2, armL: { a: 25, b: -60 }, armR: { a: 25, b: -60 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 89, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.2, armL: { a: 17.5, b: -34 }, armR: { a: -7.5, b: -34 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral'], [49, 'worried']]);
  const p1 = poseAt(t, [
    { f: 0, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 49, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.3, look: 0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 89, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f1 = faceAt(t, [[0, 'neutral']]);
  const p2 = poseAt(t, [
    { f: 0, p: { x: 1249.7, y: 719.4, scale: 1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 49, p: { x: 1249.7, y: 719.4, scale: 1, yaw: -0.3, look: -0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 89, p: { x: 1249.7, y: 719.4, scale: 1, yaw: -0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f2 = faceAt(t, [[0, 'neutral']]);
  const camX = kf(t, [[0, 980], [len, 980]]);
  const camY = kf(t, [[0, 671.3], [len, 671.3]]);
  const zoom = kf(t, [[0, 1.8], [len, 1.9]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Party t={t + 299} id="s7" veil={0.44} />
        <SpotlightBeam x={980} poolY={860} t={t} o={0.65} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestA} pose={{ ...p1, ...f1 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestB} pose={{ ...p2, ...f2 }} rimId="rimBlue" shadow={1} />
      </g>
    </g>
  );
};

// ---------- S8: two-shot, party — Ch1 The Lobster Shirt ----------
export const S8: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 50, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.3, armL: { a: 25, b: -60 }, armR: { a: 25, b: -60 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 90, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.2, armL: { a: 17.5, b: -34 }, armR: { a: -7.5, b: -34 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral'], [50, 'worried']]);
  const p1 = poseAt(t, [
    { f: 0, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.3, armL: { a: 14, b: -12 }, armR: { a: 6, b: -4 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 50, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.3, look: 0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 90, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: 55, b: -5 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 }, handR: 'point' } },
  ]);
  const f1 = faceAt(t, [[0, 'neutral']]);
  const camX = kf(t, [[0, 845.1], [len, 845.1]]);
  const camY = kf(t, [[0, 595.3], [len, 595.3]]);
  const zoom = kf(t, [[0, 1.35], [len, 1.4]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Party t={t + 336} id="s8" veil={0.44} />
        <LobsterSign />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestA} pose={{ ...p1, ...f1 }} rimId="rimBlue" shadow={1} />
      </g>
    </g>
  );
};

// ---------- S9: close-up, party — Ch1 The Lobster Shirt ----------
export const S9: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 980, y: 731.3, scale: 1.1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 44, p: { x: 980, y: 731.3, scale: 1.1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 120, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 79, p: { x: 980, y: 731.3, scale: 1.1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 55, b: -4 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral'], [44, 'happy']]);
  const camX = kf(t, [[0, 980], [len, 980]]);
  const camY = kf(t, [[0, 546.1], [len, 546.1]]);
  const zoom = kf(t, [[0, 3.2], [len, 3.35]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Party t={t + 373} id="s9" veil={0.44} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
      </g>
    </g>
  );
};

// ---------- S10: medium, party — Ch1 The Lobster Shirt ----------
export const S10: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.5, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 67, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.5, armL: { a: 40, b: -10 }, armR: { a: 40, b: -10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 80, p: { x: 980, y: 731.3, scale: 1.1, yaw: -0.5, armL: { a: 5, b: 0 }, armR: { a: 120, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 107, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.4, armL: { a: 15, b: -9 }, armR: { a: 25, b: -9 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral'], [67, 'determined']]);
  const camX = kf(t, [[0, 900], [len, 900]]);
  const camY = kf(t, [[0, 671.3], [len, 671.3]]);
  const zoom = kf(t, [[0, 1.8], [len * 0.5, 1.8], [len, 1.9]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Party t={t + 410} id="s10" veil={0.44} />
        <Glow x={980} y={611.3} r={320} o={kf(t, [[0, 0.25], [len, 0.5]])} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
      </g>
    </g>
  );
};

// ---------- S11: close-up, party — Ch1 The Lobster Shirt ----------
export const S11: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 38, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: 15, b: -55 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 }, handR: 'point' } },
    { f: 69, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: -2.5, b: -31.5 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 }, handR: 'point' } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral'], [38, 'puzzled']]);
  const camX = kf(t, [[0, 980], [len, 980]]);
  const camY = kf(t, [[0, 546.1], [len, 546.1]]);
  const zoom = kf(t, [[0, 3.2], [len, 3.35]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Party t={t + 447} id="s11" veil={0.44} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
      </g>
    </g>
  );
};

// ---------- S12: low angle, party — Ch1 The Lobster Shirt ----------
export const S12: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 49, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 15, b: -55 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 }, handR: 'point' } },
    { f: 89, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: -2.5, b: -31.5 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 }, handR: 'point' } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral'], [49, 'puzzled']]);
  const camX = kf(t, [[0, 980], [len, 980]]);
  const camY = kf(t, [[0, 771.3], [len, 771.3]]);
  const zoom = kf(t, [[0, 1.6], [len, 1.68]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Party t={t + 484} id="s12" veil={0.44} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <Foreground blur={10}>
          <FgPlant x={440} y={1020} s={1.8} />
        </Foreground>
      </g>
    </g>
  );
};

// ---------- S13: medium, party — Ch1 The Lobster Shirt ----------
export const S13: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 980, y: 731.3, scale: 1.1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 57, p: { x: 980, y: 731.3, scale: 1.1, yaw: -0.3, armL: { a: 25, b: -60 }, armR: { a: 25, b: -60 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 97, p: { x: 980, y: 731.3, scale: 1.1, yaw: -0.3, armL: { a: 17.5, b: -34 }, armR: { a: -7.5, b: -34 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral'], [57, 'worried']]);
  const camX = kf(t, [[0, 1060], [len, 1060]]);
  const camY = kf(t, [[0, 671.3], [len, 671.3]]);
  const zoom = kf(t, [[0, 1.8], [len, 1.9]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Party t={t + 521} id="s13" veil={0.44} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
      </g>
    </g>
  );
};

// ---------- S14: wide, party — Ch1 The Lobster Shirt ----------
export const S14: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.5, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 50, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.5, armL: { a: 40, b: -10 }, armR: { a: 40, b: -10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 90, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.4, armL: { a: 15, b: -9 }, armR: { a: 25, b: -9 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral']]);
  const p1 = poseAt(t, [
    { f: 0, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 50, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.3, look: 0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 90, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f1 = faceAt(t, [[0, 'neutral']]);
  const p2 = poseAt(t, [
    { f: 0, p: { x: 1249.7, y: 719.4, scale: 1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 50, p: { x: 1249.7, y: 719.4, scale: 1, yaw: -0.3, look: -0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 90, p: { x: 1249.7, y: 719.4, scale: 1, yaw: -0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f2 = faceAt(t, [[0, 'neutral']]);
  const p3 = poseAt(t, [
    { f: 0, p: { x: 575.5, y: 719.4, scale: 1, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 50, p: { x: 575.5, y: 719.4, scale: 1, yaw: 0.3, look: 0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 90, p: { x: 575.5, y: 719.4, scale: 1, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f3 = faceAt(t, [[0, 'neutral']]);
  const camX = kf(t, [[0, 980], [len, 980]]);
  const camY = kf(t, [[0, 570], [len, 570]]);
  const zoom = kf(t, [[0, 1.0], [len, 1.06]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Party t={t + 558} id="s14" veil={0.28} />
        {/* v8: the Detective sneaks in the background, watching — small, still,
            at the frame edge among the crowd, never centre. */}
        <Hero look={LOOKS.detective} pose={{ ...basePose, x: 350, y: 747, scale: 0.8, yaw: 0.25 }} rimId="rimBlue" shadow={1} />
        <SpotlightBeam x={980} poolY={860} t={t} o={0.65} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestA} pose={{ ...p1, ...f1 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestB} pose={{ ...p2, ...f2 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestC} pose={{ ...p3, ...f3 }} rimId="rimBlue" shadow={1} />
      </g>
    </g>
  );
};

// ---------- S15: over-the-shoulder, party — Ch1 The Lobster Shirt ----------
export const S15: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 71, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.2, armL: { a: 40, b: -10 }, armR: { a: 40, b: -10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 85, p: { x: 980, y: 731.3, scale: 1.1, yaw: -0.2, armL: { a: 5, b: 0 }, armR: { a: 120, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 111, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.2, armL: { a: 15, b: -9 }, armR: { a: 25, b: -9 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral'], [71, 'determined']]);
  const camX = kf(t, [[0, 980], [len, 980]]);
  const camY = kf(t, [[0, 671.3], [len, 671.3]]);
  const zoom = kf(t, [[0, 1.5], [len * 0.5, 1.5], [len, 1.55]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Party t={t + 595} id="s15" veil={0.44} />
        <Glow x={980} y={611.3} r={320} o={kf(t, [[0, 0.25], [len, 0.5]])} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <Foreground blur={16}>
          <FgPlant x={540} y={1020} s={2.0} />
        </Foreground>
      </g>
    </g>
  );
};

// ---------- S16: medium, exterior — Ch2 The Experiment That Measured Embarrassment ----------
export const S16: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 960, y: 700, scale: 1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 53, p: { x: 960, y: 700, scale: 1, yaw: -0.3, armL: { a: 40, b: -10 }, armR: { a: 40, b: -10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 93, p: { x: 960, y: 700, scale: 1, yaw: -0.3, armL: { a: 15, b: -9 }, armR: { a: 25, b: -9 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral']]);
  const p1 = poseAt(t, [
    { f: 0, p: { x: 620, y: 700, scale: 0.9, yaw: 0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 53, p: { x: 620, y: 700, scale: 0.9, yaw: 0.4, look: 0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 93, p: { x: 620, y: 700, scale: 0.9, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f1 = faceAt(t, [[0, 'neutral']]);
  const p2 = poseAt(t, [
    { f: 0, p: { x: 1300, y: 700, scale: 0.9, yaw: -0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 53, p: { x: 1300, y: 700, scale: 0.9, yaw: -0.4, look: -0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 93, p: { x: 1300, y: 700, scale: 0.9, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f2 = faceAt(t, [[0, 'neutral']]);
  const camX = kf(t, [[0, 960], [len, 960]]);
  const camY = kf(t, [[0, 640], [len, 640]]);
  const zoom = kf(t, [[0, 1.8], [len, 1.9]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Exterior t={t + 632} id="s16" />
        {/* v8: the three Cornell professors are introduced here — Gilovich (center),
            Medvec (left), Savitsky (right) — living it out in lab coats while the
            Detective narrates them. They stay BALD; shirt colour tells them apart. */}
        <Hero look={LOOKS.profA} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.profB} pose={{ ...p1, ...f1 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.profC} pose={{ ...p2, ...f2 }} rimId="rimBlue" shadow={1} />
      </g>
      <text x={120} y={130} fontFamily={FONT.hand} fontSize={44} fill="#F6EFE3">CHAPTER TWO</text>
    </g>
  );
};

// ---------- S17: wide, classroom — Ch2 The Experiment That Measured Embarrassment ----------
export const S17: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 1260, y: 760, scale: 1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 51, p: { x: 1260, y: 760, scale: 1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 120, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 91, p: { x: 1260, y: 760, scale: 1, yaw: -0.3, armL: { a: 15, b: -9 }, armR: { a: 25, b: -9 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral']]);
  const p1 = poseAt(t, [
    { f: 0, p: { x: 520, y: 830, scale: 0.9, yaw: 0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 51, p: { x: 520, y: 830, scale: 0.9, yaw: 0.4, look: 0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 91, p: { x: 520, y: 830, scale: 0.9, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f1 = faceAt(t, [[0, 'neutral']]);
  const p2 = poseAt(t, [
    { f: 0, p: { x: 1620, y: 830, scale: 0.9, yaw: -0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 51, p: { x: 1620, y: 830, scale: 0.9, yaw: -0.4, look: -0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 91, p: { x: 1620, y: 830, scale: 0.9, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f2 = faceAt(t, [[0, 'neutral']]);
  const camX = kf(t, [[0, 900], [len, 900]]);
  const camY = kf(t, [[0, 540], [len, 540]]);
  const zoom = kf(t, [[0, 1.0], [len, 1.06]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Classroom t={t + 669} id="s17" />
        {/* v8: the three professors run the experiment here — Gilovich (center, at the desk),
            Medvec (left), Savitsky (right) — living it out while the Detective narrates. */}
        <Hero look={LOOKS.profA} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.profB} pose={{ ...p1, ...f1 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.profC} pose={{ ...p2, ...f2 }} rimId="rimBlue" shadow={1} />
        <SchoolDesk x={1260} />
      </g>
    </g>
  );
};

// ---------- S18: medium, classroom — Ch2 The Experiment That Measured Embarrassment ----------
export const S18: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 1260, y: 760, scale: 1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 30, p: { x: 1260, y: 760, scale: 1, yaw: -0.3, armL: { a: 35, b: -55 }, armR: { a: 35, b: -55 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 52, p: { x: 1260, y: 760, scale: 1, yaw: -0.3, armL: { a: 22.5, b: -31.5 }, armR: { a: 12.5, b: -31.5 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral'], [30, 'smug']]);
  const camX = kf(t, [[0, 1260], [len, 1260]]);
  const camY = kf(t, [[0, 700], [len, 700]]);
  const zoom = kf(t, [[0, 1.8], [len, 1.9]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Classroom t={t + 706} id="s18" />
        <Hero look={LOOKS.student} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <SchoolDesk x={1260} />
        <Foreground blur={10}>
          <FgPlant x={786.7} y={1020} s={1.8} />
        </Foreground>
      </g>
    </g>
  );
};

// ---------- S19: two-shot, classroom — Ch2 The Experiment That Measured Embarrassment ----------
export const S19: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 1260, y: 760, scale: 1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 51, p: { x: 1260, y: 760, scale: 1, yaw: -0.3, armL: { a: 40, b: -10 }, armR: { a: 40, b: -10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 91, p: { x: 1260, y: 760, scale: 1, yaw: -0.3, armL: { a: 15, b: -9 }, armR: { a: 25, b: -9 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral']]);
  const p1 = poseAt(t, [
    { f: 0, p: { x: 900, y: 840, scale: 0.9, yaw: 0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 51, p: { x: 900, y: 840, scale: 0.9, yaw: 0.4, look: 0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 91, p: { x: 900, y: 840, scale: 0.9, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f1 = faceAt(t, [[0, 'neutral']]);
  const camX = kf(t, [[0, 1080], [len, 1080]]);
  const camY = kf(t, [[0, 670], [len, 670]]);
  const zoom = kf(t, [[0, 1.35], [len, 1.4]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Classroom t={t + 743} id="s19" />
        <Hero look={LOOKS.student} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestA} pose={{ ...p1, ...f1 }} rimId="rimBlue" shadow={1} />
        <SchoolDesk x={1260} />
      </g>
    </g>
  );
};

// ---------- S20: medium, classroom — Ch2 The Experiment That Measured Embarrassment ----------
export const S20: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 1260, y: 760, scale: 1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 32, p: { x: 1260, y: 760, scale: 1, yaw: -0.3, armL: { a: 120, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 55, p: { x: 1260, y: 760, scale: 1, yaw: -0.3, armL: { a: 15, b: -9 }, armR: { a: 25, b: -9 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral']]);
  const camX = kf(t, [[0, 1260], [len, 1260]]);
  const camY = kf(t, [[0, 700], [len, 700]]);
  const zoom = kf(t, [[0, 1.8], [len, 1.9]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Classroom t={t + 780} id="s20" />
        <Hero look={LOOKS.student} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <SchoolDesk x={1260} />
      </g>
    </g>
  );
};

// ---------- S21: wide, classroom — Ch2 The Experiment That Measured Embarrassment ----------
export const S21: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 1260, y: 760, scale: 1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 65, p: { x: 1260, y: 760, scale: 1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 120, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 78, p: { x: 1260, y: 760, scale: 1, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 120, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 105, p: { x: 1260, y: 760, scale: 1, yaw: -0.3, armL: { a: 15, b: -9 }, armR: { a: 25, b: -9 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral']]);
  const p1 = poseAt(t, [
    { f: 0, p: { x: 520, y: 830, scale: 0.9, yaw: 0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 65, p: { x: 520, y: 830, scale: 0.9, yaw: 0.4, look: 0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 78, p: { x: 520, y: 830, scale: 0.9, yaw: -0.4, armL: { a: 120, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 105, p: { x: 520, y: 830, scale: 0.9, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f1 = faceAt(t, [[0, 'neutral']]);
  const p2 = poseAt(t, [
    { f: 0, p: { x: 1620, y: 830, scale: 0.9, yaw: -0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 65, p: { x: 1620, y: 830, scale: 0.9, yaw: -0.4, look: -0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 78, p: { x: 1620, y: 830, scale: 0.9, yaw: 0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 105, p: { x: 1620, y: 830, scale: 0.9, yaw: -0.3, armL: { a: 55, b: -4 }, armR: { a: 25, b: -9 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f2 = faceAt(t, [[0, 'neutral']]);
  const camX = kf(t, [[0, 900], [len, 900]]);
  const camY = kf(t, [[0, 540], [len, 540]]);
  const zoom = kf(t, [[0, 1.0], [len * 0.5, 1], [len, 1.06]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Classroom t={t + 817} id="s21" />
        <Glow x={1260} y={640} r={320} o={kf(t, [[0, 0.25], [len, 0.5]])} />
        <Hero look={LOOKS.student} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestA} pose={{ ...p1, ...f1 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestB} pose={{ ...p2, ...f2 }} rimId="rimBlue" shadow={1} />
        <SchoolDesk x={1260} />
        <Foreground blur={10}>
          <FgPlant x={0} y={1020} s={1.8} />
        </Foreground>
      </g>
    </g>
  );
};

// ---------- S22: two-shot, classroom — Ch2 The Experiment That Measured Embarrassment ----------
export const S22: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 1260, y: 760, scale: 1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 69, p: { x: 1260, y: 760, scale: 1, yaw: -0.3, armL: { a: 25, b: -60 }, armR: { a: 25, b: -60 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 82, p: { x: 1260, y: 760, scale: 1, yaw: 0.3, armL: { a: 25, b: -9 }, armR: { a: 55, b: -4 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 109, p: { x: 1260, y: 760, scale: 1, yaw: -0.3, armL: { a: 17.5, b: -34 }, armR: { a: -7.5, b: -34 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral'], [69, 'worried']]);
  const p1 = poseAt(t, [
    { f: 0, p: { x: 900, y: 840, scale: 0.9, yaw: 0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 69, p: { x: 900, y: 840, scale: 0.9, yaw: 0.4, look: 0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 82, p: { x: 900, y: 840, scale: 0.9, yaw: -0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 109, p: { x: 900, y: 840, scale: 0.9, yaw: 0.3, armL: { a: 40, b: -10 }, armR: { a: 25, b: -9 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f1 = faceAt(t, [[0, 'neutral']]);
  const camX = kf(t, [[0, 1080], [len, 1080]]);
  const camY = kf(t, [[0, 670], [len, 670]]);
  const zoom = kf(t, [[0, 1.35], [len * 0.5, 1.4], [len, 1.4]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Classroom t={t + 854} id="s22" />
        <Glow x={1260} y={640} r={320} o={kf(t, [[0, 0.25], [len, 0.5]])} />
        <Hero look={LOOKS.student} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestA} pose={{ ...p1, ...f1 }} rimId="rimBlue" shadow={1} />
        <SchoolDesk x={1260} />
      </g>
      <Popup lines={['HOW MANY PEOPLE', 'COULD TELL?']} x={1000} y={140} size={48} />
    </g>
  );
};

// ---------- S23: medium, classroom — Ch2 The Experiment That Measured Embarrassment ----------
export const S23: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 1260, y: 760, scale: 1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 51, p: { x: 1260, y: 760, scale: 1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 15, b: -55 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 }, handR: 'point' } },
    { f: 91, p: { x: 1260, y: 760, scale: 1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: -2.5, b: -31.5 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 }, handR: 'point' } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral'], [51, 'puzzled']]);
  const camX = kf(t, [[0, 1260], [len, 1260]]);
  const camY = kf(t, [[0, 700], [len, 700]]);
  const zoom = kf(t, [[0, 1.8], [len, 1.9]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Classroom t={t + 891} id="s23" />
        <Hero look={LOOKS.student} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <SchoolDesk x={1260} />
      </g>
      <Popup lines={['PICK A NUMBER!']} x={960} y={180} size={64} />
    </g>
  );
};

// ---------- S24: two-shot, classroom — Ch2 The Experiment That Measured Embarrassment ----------
export const S24: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 1260, y: 760, scale: 1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 52, p: { x: 1260, y: 760, scale: 1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 15, b: -55 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 }, handR: 'point' } },
    { f: 92, p: { x: 1260, y: 760, scale: 1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: -2.5, b: -31.5 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 }, handR: 'point' } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral'], [52, 'puzzled']]);
  const p1 = poseAt(t, [
    { f: 0, p: { x: 900, y: 840, scale: 0.9, yaw: 0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 52, p: { x: 900, y: 840, scale: 0.9, yaw: 0.4, look: 0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 92, p: { x: 900, y: 840, scale: 0.9, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f1 = faceAt(t, [[0, 'neutral']]);
  const camX = kf(t, [[0, 1080], [len, 1080]]);
  const camY = kf(t, [[0, 670], [len, 670]]);
  const zoom = kf(t, [[0, 1.35], [len, 1.4]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Classroom t={t + 928} id="s24" />
        <Hero look={LOOKS.student} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestA} pose={{ ...p1, ...f1 }} rimId="rimBlue" shadow={1} />
        <SchoolDesk x={1260} />
        <Foreground blur={10}>
          <FgPlant x={428.9} y={1020} s={1.8} />
        </Foreground>
      </g>
    </g>
  );
};

// ---------- S25: high angle, schematic — Ch2 The Experiment That Measured Embarrassment ----------
export const S25: React.FC<ShotProps> = ({ t, len }) => {
  const camX = kf(t, [[0, 900], [len, 900]]);
  const camY = kf(t, [[0, 520], [len, 520]]);
  const zoom = kf(t, [[0, 1.25], [len, 1.3]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Schematic t={t + 965} id="s25" />
        <SchLabel x={1300} y={380} t={t} text="GUESSED" size={36} color="#FF8A3D" />
        <CountUp x={1300} y={480} t={t} to={46} size={120} color="#FF8A3D" suffix="%" />
      </g>
    </g>
  );
};

// ---------- S26: medium, schematic — Ch2 The Experiment That Measured Embarrassment ----------
export const S26: React.FC<ShotProps> = ({ t, len }) => {
  const camX = kf(t, [[0, 900], [len, 900]]);
  const camY = kf(t, [[0, 640], [len, 640]]);
  const zoom = kf(t, [[0, 1.5], [len, 1.56]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Schematic t={t + 1002} id="s26" />
        <SchLabel x={1300} y={380} t={t} text="THEY FELT" size={36} color="#FF8A3D" />
        <CountUp x={1300} y={480} t={t} to={46} size={120} color="#FF8A3D" suffix="%" />
        <SchLabel x={1300} y={640} t={t} text="ALMOST HALF" size={44} color="#7E8DA6" />
      </g>
    </g>
  );
};

// ---------- S27: two-shot, schematic — Ch2 The Experiment That Measured Embarrassment ----------
export const S27: React.FC<ShotProps> = ({ t, len }) => {
  const camX = kf(t, [[0, 900], [len, 900]]);
  const camY = kf(t, [[0, 640], [len, 640]]);
  const zoom = kf(t, [[0, 1.35], [len * 0.5, 1.4], [len, 1.4]]);
  // v8 (Nov 9, Javion: "add graphs/bars filling up and other explanations too it while
  // adding the detective too it" / "put both percentages on that chart a pie chart is used
  // to compare 2 or more percentages"): the Detective narrates the numbers to us (facing
  // camera, 3rd person), BOTH percentages on the SAME pie as slices (whole circle = 100%),
  // and a line underneath explains what it means. The old shot was two counting numbers
  // on empty blue. Bars are NOT for comparing percentages — the pie is.
  const pDet = poseAt(t, [
    { f: 0, p: { x: 360, y: 780, scale: 1.05, yaw: 0, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 30, p: { x: 360, y: 780, scale: 1.05, yaw: 0, armL: { a: 5, b: 0 }, armR: { a: 55, b: -20 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 70, p: { x: 360, y: 780, scale: 1.05, yaw: 0, armL: { a: 5, b: 0 }, armR: { a: 55, b: -20 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const fDet = faceAt(t, [[0, 'neutral'], [30, 'worried']]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Schematic t={t + 1039} id="s27" />
        <Glow x={975} y={420} r={320} o={kf(t, [[0, 0.25], [len, 0.5]])} />
        <Hero look={LOOKS.detective} pose={{ ...pDet, ...fDet }} rimId="rimBlue" shadow={1} />
        <PieChart
          x={1060} y={420} t={t} dur={40} r={150}
          slices={[
            { label: 'GUESSED', value: 46, color: '#7E8DA6' },
            { label: 'REAL', value: 23, color: '#FF8A3D' },
          ]}
        />
        <SchLabel x={1060} y={660} t={t + 30} text="THEY THOUGHT ALMOST HALF WOULD NOTICE" size={30} color="#F6EFE3" />
        <SchLabel x={1060} y={710} t={t + 40} text="ONLY 23% ACTUALLY DID" size={30} color="#FF8A3D" />
        <Foreground blur={10}>
          <FgPlant x={248.9} y={1030} s={1.6} />
        </Foreground>
      </g>
    </g>
  );
};

// ---------- S28: macro insert, schematic — Ch2 The Experiment That Measured Embarrassment ----------
export const S28: React.FC<ShotProps> = ({ t, len }) => {
  const camX = kf(t, [[0, 975], [len, 975]]);
  const camY = kf(t, [[0, 540], [len, 540]]);
  const zoom = kf(t, [[0, 2.4], [len, 2.5]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Schematic t={t + 1076} id="s28" />
        <SchLabel x={740} y={420} t={t} text="GUESSED" size={36} color="#7E8DA6" />
        <CountUp x={740} y={560} t={t} to={46} size={150} color="#7E8DA6" suffix="%" />
        <SchLabel x={1210} y={420} t={t} text="REAL" size={36} color="#FF8A3D" />
        <CountUp x={1210} y={560} t={t} to={23} size={150} color="#FF8A3D" suffix="%" />
      </g>
    </g>
  );
};

// ---------- S29: medium, schematic — Ch2 The Experiment That Measured Embarrassment ----------
export const S29: React.FC<ShotProps> = ({ t, len }) => {
  const camX = kf(t, [[0, 900], [len, 900]]);
  const camY = kf(t, [[0, 640], [len, 640]]);
  const zoom = kf(t, [[0, 1.5], [len, 1.56]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Schematic t={t + 1113} id="s29" />
        <SchLabel x={1300} y={380} t={t} text="COULD NAME IT" size={36} color="#FF8A3D" />
        <CountUp x={1300} y={480} t={t} to={23} size={120} color="#FF8A3D" suffix="%" />
      </g>
    </g>
  );
};

// ---------- S30: wide, classroom — Ch2 The Experiment That Measured Embarrassment ----------
export const S30: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 1260, y: 760, scale: 1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 52, p: { x: 1260, y: 760, scale: 1, yaw: -0.3, armL: { a: 25, b: -60 }, armR: { a: 25, b: -60 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 92, p: { x: 1260, y: 760, scale: 1, yaw: -0.3, armL: { a: 17.5, b: -34 }, armR: { a: -7.5, b: -34 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral'], [52, 'scared']]);
  const p1 = poseAt(t, [
    { f: 0, p: { x: 520, y: 830, scale: 0.9, yaw: 0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 52, p: { x: 520, y: 830, scale: 0.9, yaw: 0.4, look: 0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 92, p: { x: 520, y: 830, scale: 0.9, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f1 = faceAt(t, [[0, 'neutral']]);
  const p2 = poseAt(t, [
    { f: 0, p: { x: 1620, y: 830, scale: 0.9, yaw: -0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 52, p: { x: 1620, y: 830, scale: 0.9, yaw: -0.4, look: -0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 92, p: { x: 1620, y: 830, scale: 0.9, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f2 = faceAt(t, [[0, 'neutral']]);
  const camX = kf(t, [[0, 900], [len, 900]]);
  const camY = kf(t, [[0, 540], [len, 540]]);
  const zoom = kf(t, [[0, 1.0], [len, 1.06]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Classroom t={t + 1150} id="s30" />
        <Hero look={LOOKS.student} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestA} pose={{ ...p1, ...f1 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestB} pose={{ ...p2, ...f2 }} rimId="rimBlue" shadow={1} />
        <SchoolDesk x={1260} />
        <Foreground blur={10}>
          <FgPlant x={0} y={1020} s={1.8} />
        </Foreground>
      </g>
    </g>
  );
};

// ---------- S31: two-shot, study — Ch2 The Experiment That Measured Embarrassment ----------
export const S31: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 960, y: 712, scale: 1, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 49, p: { x: 960, y: 712, scale: 1, yaw: 0.2, armL: { a: 95, b: 30 }, armR: { a: 55, b: -5 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 }, handR: 'point' } },
    { f: 89, p: { x: 960, y: 712, scale: 1, yaw: 0.2, armL: { a: 88, b: 26 }, armR: { a: 55, b: -5 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 }, handR: 'point' } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral'], [49, 'smug']]);
  const mg = toWorld(p0, joints(p0).armL.end);
  const camX = kf(t, [[0, 1050], [len, 1050]]);
  const camY = kf(t, [[0, 580], [len, 580]]);
  const zoom = kf(t, [[0, 1.35], [len, 1.4]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Study t={t + 1187} id="s31" veil={0.44} />
        <SignBoard />
        <Hero look={LOOKS.detective} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <Desk x0={560} x1={1360} y={700} />
        <Magnifier x={mg.x} y={mg.y} s={1} />
      </g>
    </g>
  );
};

// ---------- S32: medium, party — Ch2 The Experiment That Measured Embarrassment ----------
export const S32: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 52, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.3, armL: { a: 40, b: -10 }, armR: { a: 40, b: -10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 92, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.2, armL: { a: 15, b: -9 }, armR: { a: 25, b: -9 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral']]);
  const camX = kf(t, [[0, 980], [len, 980]]);
  const camY = kf(t, [[0, 671.3], [len, 671.3]]);
  const zoom = kf(t, [[0, 1.8], [len, 1.9]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Party t={t + 1224} id="s32" veil={0.44} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
      </g>
    </g>
  );
};

// ---------- S33: wide, party — Ch2 The Experiment That Measured Embarrassment ----------
export const S33: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 980, y: 731.3, scale: 1.1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 49, p: { x: 980, y: 731.3, scale: 1.1, yaw: -0.3, armL: { a: 25, b: -60 }, armR: { a: 25, b: -60 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 89, p: { x: 980, y: 731.3, scale: 1.1, yaw: -0.3, armL: { a: 17.5, b: -34 }, armR: { a: -7.5, b: -34 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral'], [49, 'worried']]);
  const p1 = poseAt(t, [
    { f: 0, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 49, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.3, look: 0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 89, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f1 = faceAt(t, [[0, 'neutral']]);
  const p2 = poseAt(t, [
    { f: 0, p: { x: 1249.7, y: 719.4, scale: 1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 49, p: { x: 1249.7, y: 719.4, scale: 1, yaw: -0.3, look: -0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 89, p: { x: 1249.7, y: 719.4, scale: 1, yaw: -0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f2 = faceAt(t, [[0, 'neutral']]);
  const p3 = poseAt(t, [
    { f: 0, p: { x: 575.5, y: 719.4, scale: 1, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 49, p: { x: 575.5, y: 719.4, scale: 1, yaw: 0.3, look: 0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 89, p: { x: 575.5, y: 719.4, scale: 1, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f3 = faceAt(t, [[0, 'neutral']]);
  const camX = kf(t, [[0, 980], [len, 980]]);
  const camY = kf(t, [[0, 570], [len, 570]]);
  const zoom = kf(t, [[0, 1.0], [len, 1.06]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Party t={t + 1261} id="s33" veil={0.28} />
        {/* v8: the Detective sneaks in the background, watching — small, still,
            at the frame edge among the crowd, never centre. */}
        <Hero look={LOOKS.detective} pose={{ ...basePose, x: 380, y: 747, scale: 0.8, yaw: 0.25 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestA} pose={{ ...p1, ...f1 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestB} pose={{ ...p2, ...f2 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestC} pose={{ ...p3, ...f3 }} rimId="rimBlue" shadow={1} />
        <Foreground blur={10}>
          <FgPlant x={80} y={1020} s={1.8} />
        </Foreground>
      </g>
    </g>
  );
};

// ---------- S34: medium, party — Ch2 The Experiment That Measured Embarrassment ----------
export const S34: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.5, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 61, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.5, armL: { a: 40, b: -10 }, armR: { a: 40, b: -10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 73, p: { x: 980, y: 731.3, scale: 1.1, yaw: -0.5, armL: { a: 5, b: 0 }, armR: { a: 120, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 101, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.4, armL: { a: 15, b: -9 }, armR: { a: 25, b: -9 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral']]);
  const camX = kf(t, [[0, 980], [len, 980]]);
  const camY = kf(t, [[0, 620], [len, 620]]);
  const zoom = kf(t, [[0, 1.5], [len * 0.5, 1.5], [len, 1.6]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Party t={t + 1298} id="s34" veil={0.44} />
        <Glow x={980} y={611.3} r={320} o={kf(t, [[0, 0.25], [len, 0.5]])} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
      </g>
    </g>
  );
};

// ---------- S35: close-up, schematic — Ch2 The Experiment That Measured Embarrassment ----------
export const S35: React.FC<ShotProps> = ({ t, len }) => {
  const camX = kf(t, [[0, 760], [len, 760]]);
  const camY = kf(t, [[0, 620], [len, 620]]);
  const zoom = kf(t, [[0, 2.6], [len, 2.7]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Schematic t={t + 1335} id="s35" />
        <SchLabel x={950} y={560} t={t} text="×2" size={150} color="#FF8A3D" />
      </g>
    </g>
  );
};

// ---------- S36: medium, schematic — Ch2 The Experiment That Measured Embarrassment ----------
export const S36: React.FC<ShotProps> = ({ t, len }) => {
  const camX = kf(t, [[0, 900], [len, 900]]);
  const camY = kf(t, [[0, 640], [len, 640]]);
  const zoom = kf(t, [[0, 1.5], [len, 1.56]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Schematic t={t + 1372} id="s36" />
        <SchLabel x={1300} y={360} t={t} text="FACTOR OF TWO" size={36} color="#FF8A3D" />
        <CountUp x={1300} y={500} t={t} to={2} size={150} color="#FF8A3D" suffix="×" />
      </g>
    </g>
  );
};

// ---------- S37: wide, party — Ch2 The Experiment That Measured Embarrassment ----------
export const S37: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 980, y: 731.3, scale: 1.1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 47, p: { x: 980, y: 731.3, scale: 1.1, yaw: -0.3, armL: { a: 40, b: -10 }, armR: { a: 40, b: -10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 85, p: { x: 980, y: 731.3, scale: 1.1, yaw: -0.3, armL: { a: 15, b: -9 }, armR: { a: 25, b: -9 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral']]);
  const p1 = poseAt(t, [
    { f: 0, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 47, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.3, look: 0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 85, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f1 = faceAt(t, [[0, 'neutral']]);
  const p2 = poseAt(t, [
    { f: 0, p: { x: 1249.7, y: 719.4, scale: 1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 47, p: { x: 1249.7, y: 719.4, scale: 1, yaw: -0.3, look: -0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 85, p: { x: 1249.7, y: 719.4, scale: 1, yaw: -0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f2 = faceAt(t, [[0, 'neutral']]);
  const p3 = poseAt(t, [
    { f: 0, p: { x: 575.5, y: 719.4, scale: 1, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 47, p: { x: 575.5, y: 719.4, scale: 1, yaw: 0.3, look: 0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 85, p: { x: 575.5, y: 719.4, scale: 1, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f3 = faceAt(t, [[0, 'neutral']]);
  const camX = kf(t, [[0, 980], [len, 980]]);
  const camY = kf(t, [[0, 570], [len, 570]]);
  const zoom = kf(t, [[0, 1.0], [len, 1.06]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Party t={t + 1409} id="s37" veil={0.28} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestA} pose={{ ...p1, ...f1 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestB} pose={{ ...p2, ...f2 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestC} pose={{ ...p3, ...f3 }} rimId="rimBlue" shadow={1} />
      </g>
    </g>
  );
};

// ---------- S38: two-shot, party — Ch2 The Experiment That Measured Embarrassment ----------
export const S38: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.5, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 49, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.5, armL: { a: 40, b: -10 }, armR: { a: 40, b: -10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 89, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.4, armL: { a: 15, b: -9 }, armR: { a: 25, b: -9 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral']]);
  const p1 = poseAt(t, [
    { f: 0, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 49, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.3, look: 0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 89, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f1 = faceAt(t, [[0, 'neutral']]);
  const camX = kf(t, [[0, 845.1], [len, 845.1]]);
  const camY = kf(t, [[0, 595.3], [len, 595.3]]);
  const zoom = kf(t, [[0, 1.35], [len, 1.4]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Party t={t + 1446} id="s38" veil={0.44} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestA} pose={{ ...p1, ...f1 }} rimId="rimBlue" shadow={1} />
      </g>
    </g>
  );
};

// ---------- S39: medium, party — Ch2 The Experiment That Measured Embarrassment ----------
export const S39: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 51, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.2, armL: { a: 40, b: -10 }, armR: { a: 40, b: -10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 91, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.2, armL: { a: 15, b: -9 }, armR: { a: 25, b: -9 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral']]);
  const camX = kf(t, [[0, 980], [len, 980]]);
  const camY = kf(t, [[0, 700], [len, 700]]);
  const zoom = kf(t, [[0, 1.35], [len, 1.45]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Party t={t + 1483} id="s39" veil={0.44} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <Foreground blur={10}>
          <FgPlant x={506.7} y={1020} s={1.8} />
        </Foreground>
      </g>
    </g>
  );
};

// ---------- S40: medium, party — Ch3 The Plus and the Minus of Being Seen ----------
export const S40: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 50, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 120, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 90, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: 55, b: -4 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral'], [50, 'happy']]);
  const camX = kf(t, [[0, 980], [len, 980]]);
  const camY = kf(t, [[0, 600], [len, 600]]);
  const zoom = kf(t, [[0, 2.2], [len, 2.3]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Party t={t + 1520} id="s40" veil={0.44} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <Sparkles t={t} />
      </g>
      <text x={120} y={130} fontFamily={FONT.hand} fontSize={44} fill="#F6EFE3">CHAPTER THREE</text>
    </g>
  );
};

// ---------- S41: high angle, party — Ch3 The Plus and the Minus of Being Seen ----------
export const S41: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 980, y: 731.3, scale: 1.1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 43, p: { x: 980, y: 731.3, scale: 1.1, yaw: -0.3, armL: { a: 40, b: -10 }, armR: { a: 40, b: -10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 78, p: { x: 980, y: 731.3, scale: 1.1, yaw: -0.3, armL: { a: 22.5, b: -31.5 }, armR: { a: 12.5, b: -31.5 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral'], [43, 'smug']]);
  const camX = kf(t, [[0, 980], [len, 980]]);
  const camY = kf(t, [[0, 520], [len, 520]]);
  const zoom = kf(t, [[0, 1.25], [len, 1.3]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Party t={t + 1557} id="s41" veil={0.44} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
      </g>
    </g>
  );
};

// ---------- S42: medium, party — Ch3 The Plus and the Minus of Being Seen ----------
export const S42: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.5, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 54, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.5, armL: { a: 5, b: 0 }, armR: { a: 120, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 94, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.4, armL: { a: 22.5, b: -31.5 }, armR: { a: 12.5, b: -31.5 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral'], [54, 'smug']]);
  const camX = kf(t, [[0, 900], [len, 900]]);
  const camY = kf(t, [[0, 671.3], [len, 671.3]]);
  const zoom = kf(t, [[0, 1.8], [len, 1.9]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Party t={t + 1594} id="s42" veil={0.44} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <Foreground blur={10}>
          <FgPlant x={506.7} y={1020} s={1.8} />
        </Foreground>
      </g>
    </g>
  );
};

// ---------- S43: close-up, party — Ch3 The Plus and the Minus of Being Seen ----------
export const S43: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 53, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.2, armL: { a: 120, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 93, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.2, armL: { a: 22.5, b: -31.5 }, armR: { a: 12.5, b: -31.5 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral'], [53, 'smug']]);
  const camX = kf(t, [[0, 980], [len, 980]]);
  const camY = kf(t, [[0, 546.1], [len, 546.1]]);
  const zoom = kf(t, [[0, 3.2], [len, 3.35]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Party t={t + 1631} id="s43" veil={0.44} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <BoldShades x={p0.x + p0.yaw * 30 * p0.scale} y={p0.y - 176 * p0.scale} s={p0.scale} yaw={p0.yaw} />
      </g>
    </g>
  );
};

// ---------- S44: low angle, party — Ch3 The Plus and the Minus of Being Seen ----------
export const S44: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 54, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.3, armL: { a: 25, b: -60 }, armR: { a: 25, b: -60 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 94, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.2, armL: { a: 17.5, b: -34 }, armR: { a: -7.5, b: -34 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral'], [54, 'worried']]);
  const camX = kf(t, [[0, 980], [len, 980]]);
  const camY = kf(t, [[0, 771.3], [len, 771.3]]);
  const zoom = kf(t, [[0, 1.6], [len, 1.68]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Party t={t + 1668} id="s44" veil={0.44} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
      </g>
    </g>
  );
};

// ---------- S45: medium, party — Ch3 The Plus and the Minus of Being Seen ----------
export const S45: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 980, y: 731.3, scale: 1.1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 61, p: { x: 980, y: 731.3, scale: 1.1, yaw: -0.3, armL: { a: 25, b: -60 }, armR: { a: 25, b: -60 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 74, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.3, armL: { a: 40, b: -10 }, armR: { a: 40, b: -10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 101, p: { x: 980, y: 731.3, scale: 1.1, yaw: -0.3, armL: { a: 17.5, b: -34 }, armR: { a: -7.5, b: -34 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral'], [61, 'scared'], [112, 'worried']]);
  const camX = kf(t, [[0, 980], [len, 980]]);
  const camY = kf(t, [[0, 671.3], [len, 671.3]]);
  const zoom = kf(t, [[0, 1.8], [len * 0.5, 1.8], [len, 1.9]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Party t={t + 1705} id="s45" veil={0.44} />
        <Glow x={980} y={611.3} r={320} o={kf(t, [[0, 0.25], [len, 0.5]])} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <Foreground blur={10}>
          <FgPlant x={506.7} y={1020} s={1.8} />
        </Foreground>
      </g>
    </g>
  );
};

// ---------- S46: wide, party — Ch3 The Plus and the Minus of Being Seen ----------
export const S46: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.5, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 52, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.5, armL: { a: 25, b: -60 }, armR: { a: 25, b: -60 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 92, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.4, armL: { a: 17.5, b: -34 }, armR: { a: -7.5, b: -34 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral'], [52, 'worried']]);
  const p1 = poseAt(t, [
    { f: 0, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 52, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.3, look: 0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 92, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f1 = faceAt(t, [[0, 'neutral']]);
  const p2 = poseAt(t, [
    { f: 0, p: { x: 1249.7, y: 719.4, scale: 1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 52, p: { x: 1249.7, y: 719.4, scale: 1, yaw: -0.3, look: -0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 92, p: { x: 1249.7, y: 719.4, scale: 1, yaw: -0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f2 = faceAt(t, [[0, 'neutral']]);
  const p3 = poseAt(t, [
    { f: 0, p: { x: 575.5, y: 719.4, scale: 1, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 52, p: { x: 575.5, y: 719.4, scale: 1, yaw: 0.3, look: 0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 92, p: { x: 575.5, y: 719.4, scale: 1, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f3 = faceAt(t, [[0, 'neutral']]);
  const camX = kf(t, [[0, 980], [len, 980]]);
  const camY = kf(t, [[0, 570], [len, 570]]);
  const zoom = kf(t, [[0, 1.0], [len, 1.06]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Party t={t + 1742} id="s46" veil={0.28} />
        {/* v8: the Detective sneaks in the background, watching — small, still,
            at the frame edge among the crowd, never centre. */}
        <Hero look={LOOKS.detective} pose={{ ...basePose, x: 350, y: 747, scale: 0.8, yaw: 0.25 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestA} pose={{ ...p1, ...f1 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestB} pose={{ ...p2, ...f2 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestC} pose={{ ...p3, ...f3 }} rimId="rimBlue" shadow={1} />
      </g>
    </g>
  );
};

// ---------- S47: over-the-shoulder, party — Ch3 The Plus and the Minus of Being Seen ----------
export const S47: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 49, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.2, armL: { a: 40, b: -10 }, armR: { a: 40, b: -10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 89, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.2, armL: { a: 15, b: -9 }, armR: { a: 25, b: -9 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral']]);
  const camX = kf(t, [[0, 980], [len, 980]]);
  const camY = kf(t, [[0, 671.3], [len, 671.3]]);
  const zoom = kf(t, [[0, 1.5], [len, 1.55]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Party t={t + 1779} id="s47" veil={0.44} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <Foreground blur={16}>
          <FgPlant x={540} y={1020} s={2.0} />
        </Foreground>
      </g>
    </g>
  );
};

// ---------- S48: medium, party — Ch3 The Plus and the Minus of Being Seen ----------
export const S48: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 59, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.3, armL: { a: 25, b: -60 }, armR: { a: 25, b: -60 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 99, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.2, armL: { a: 17.5, b: -34 }, armR: { a: -7.5, b: -34 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral'], [59, 'scared']]);
  const camX = kf(t, [[0, 1060], [len, 1060]]);
  const camY = kf(t, [[0, 671.3], [len, 671.3]]);
  const zoom = kf(t, [[0, 1.8], [len, 1.9]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Party t={t + 1816} id="s48" veil={0.44} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <Foreground blur={10}>
          <FgPlant x={506.7} y={1020} s={1.8} />
        </Foreground>
      </g>
    </g>
  );
};

// ---------- S49: wide, party — Ch3 The Plus and the Minus of Being Seen ----------
export const S49: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 980, y: 731.3, scale: 1.1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 51, p: { x: 980, y: 731.3, scale: 1.1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 15, b: -55 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 }, handR: 'point' } },
    { f: 91, p: { x: 980, y: 731.3, scale: 1.1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: -2.5, b: -31.5 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 }, handR: 'point' } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral'], [51, 'puzzled']]);
  const p1 = poseAt(t, [
    { f: 0, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 51, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.3, look: 0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 91, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f1 = faceAt(t, [[0, 'neutral']]);
  const p2 = poseAt(t, [
    { f: 0, p: { x: 1249.7, y: 719.4, scale: 1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 51, p: { x: 1249.7, y: 719.4, scale: 1, yaw: -0.3, look: -0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 91, p: { x: 1249.7, y: 719.4, scale: 1, yaw: -0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f2 = faceAt(t, [[0, 'neutral']]);
  const p3 = poseAt(t, [
    { f: 0, p: { x: 575.5, y: 719.4, scale: 1, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 51, p: { x: 575.5, y: 719.4, scale: 1, yaw: 0.3, look: 0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 91, p: { x: 575.5, y: 719.4, scale: 1, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f3 = faceAt(t, [[0, 'neutral']]);
  const camX = kf(t, [[0, 980], [len, 980]]);
  const camY = kf(t, [[0, 570], [len, 570]]);
  const zoom = kf(t, [[0, 1.0], [len, 1.06]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Party t={t + 1853} id="s49" veil={0.28} />
        {/* v8: the Detective sneaks in the background, watching — small, still,
            at the frame edge among the crowd, never centre. */}
        <Hero look={LOOKS.detective} pose={{ ...basePose, x: 300, y: 747, scale: 0.8, yaw: 0.25 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestA} pose={{ ...p1, ...f1 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestB} pose={{ ...p2, ...f2 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestC} pose={{ ...p3, ...f3 }} rimId="rimBlue" shadow={1} />
      </g>
    </g>
  );
};

// ---------- S50: medium, party — Ch3 The Plus and the Minus of Being Seen ----------
export const S50: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.5, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 57, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.5, armL: { a: 25, b: -60 }, armR: { a: 25, b: -60 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 97, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.4, armL: { a: 17.5, b: -34 }, armR: { a: -7.5, b: -34 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral'], [57, 'worried']]);
  const camX = kf(t, [[0, 980], [len, 980]]);
  const camY = kf(t, [[0, 620], [len, 620]]);
  const zoom = kf(t, [[0, 1.5], [len, 1.6]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Party t={t + 1890} id="s50" veil={0.44} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
      </g>
      <Popup lines={['HOW MANY TIMES', 'THIS WEEK?']} x={330} y={110} size={52} />
    </g>
  );
};

// ---------- S51: close-up, stairwell — Ch3 The Plus and the Minus of Being Seen ----------
export const S51: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 800, y: 504, scale: 0.9, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 54, p: { x: 800, y: 504, scale: 0.9, yaw: 0.2, tilt: 12, armL: { a: 70, b: -10 }, armR: { a: 70, b: -10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 84, p: { x: 800, y: 504, scale: 0.9, yaw: 0.2, tilt: 4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral'], [54, 'oops'], [79, 'dizzy']]);
  const camX = kf(t, [[0, 800], [len, 800]]);
  const camY = kf(t, [[0, 345.6], [len, 345.6]]);
  const zoom = kf(t, [[0, 3.2], [len, 3.35]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Stairwell t={t + 1927} id="s51" />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <Banister />
      </g>
    </g>
  );
};

// ---------- S52: medium, bedroom — Ch3 The Plus and the Minus of Being Seen ----------
export const S52: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 1026.3, y: 684.1, scale: 0.9, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 34, p: { x: 1026.3, y: 684.1, scale: 0.9, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 25, b: -65 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 60, p: { x: 1026.3, y: 684.1, scale: 0.9, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: -7.5, b: -36.5 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral'], [34, 'sad']]);
  const ph = toWorld(p0, joints(p0).armR.end);
  const camX = kf(t, [[0, 1026.3], [len, 1026.3]]);
  const camY = kf(t, [[0, 624.1], [len, 624.1]]);
  const zoom = kf(t, [[0, 1.8], [len, 1.9]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Bedroom t={t + 1964} id="s52" crossed={0} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <Phone x={ph.x} y={ph.y} w={42} rot={-18} on={1} caller="BOSS" f={t} />
      </g>
    </g>
  );
};

// ---------- S53: wide, bedroom — Ch3 The Plus and the Minus of Being Seen ----------
export const S53: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 1026.3, y: 684.1, scale: 0.9, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 42, p: { x: 1026.3, y: 684.1, scale: 0.9, yaw: -0.3, armL: { a: 95, b: 30 }, armR: { a: 120, b: 110 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 77, p: { x: 1026.3, y: 684.1, scale: 0.9, yaw: -0.3, armL: { a: 52.5, b: 11 }, armR: { a: 65, b: 51 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral'], [42, 'stressed']]);
  const camX = kf(t, [[0, 940], [len, 940]]);
  const camY = kf(t, [[0, 560], [len, 560]]);
  const zoom = kf(t, [[0, 1.0], [len, 1.06]]);
  // v8 (Nov 9, Javion: "add the rewind mechanic in it as well i really like it"): the rewind
  // mechanic from the rewind reference episode, in the "replayed it four hundred times" shot.
  // Frames 20–65: the party moment REWINDS — Jake at the party, his pose played in reverse
  // (arms lowering back down, the moment un-happening), under the RewindOverlay (red wash,
  // tape lines, blinking REWIND chip, stopwatch counting back from 10, "REPLAY #400").
  // Before and after, Jake is in his bedroom replaying it in his head. The rewind is the
  // visual of what "replayed it four hundred times" actually looks like.
  const RW_START = 20;
  const RW_END = 65;
  const rwLen = RW_END - RW_START;
  const rt = t - RW_START; // 0..45 during the rewind
  const revT = rwLen - rt; // runs backward: 45 down to 0
  const pRw = poseAt(revT, [
    { f: 0, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 45, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.2, armL: { a: 25, b: -60 }, armR: { a: 25, b: -60 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const fRw = faceAt(revT, [[0, 'neutral'], [45, 'worried']]);
  const inRewind = t >= RW_START && t < RW_END;
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        {inRewind ? (
          <g>
            <Party t={t + 299} id="s53rw" veil={0.44} />
            <SpotlightBeam x={980} poolY={860} t={t} o={0.65} />
            <Hero look={LOOKS.jake} pose={{ ...pRw, ...fRw }} rimId="rimBlue" shadow={1} />
          </g>
        ) : (
          <g>
            <Bedroom t={t + 2001} id="s53" crossed={0} />
            <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
          </g>
        )}
      </g>
      {inRewind ? (
        <RewindOverlay f={t} p={rt / rwLen} secs={10} take={400} />
      ) : (
        <Popup lines={['REPLAYED 400 TIMES']} x={1420} y={300} size={72} />
      )}
    </g>
  );
};

// ---------- S54: medium, bedroom — Ch3 The Plus and the Minus of Being Seen ----------
export const S54: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 1026.3, y: 684.1, scale: 0.9, yaw: 0.5, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 47, p: { x: 1026.3, y: 684.1, scale: 0.9, yaw: 0.5, armL: { a: 35, b: -55 }, armR: { a: 35, b: -55 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 87, p: { x: 1026.3, y: 684.1, scale: 0.9, yaw: 0.4, armL: { a: 22.5, b: -31.5 }, armR: { a: 12.5, b: -31.5 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral'], [47, 'smug']]);
  const camX = kf(t, [[0, 1026.3], [len, 1026.3]]);
  const camY = kf(t, [[0, 624.1], [len, 624.1]]);
  const zoom = kf(t, [[0, 1.8], [len, 1.9]]);
  // v8: the number COUNTS DOWN 400 -> 0 over the first 30 frames — S53 ends on "REPLAYED
  // 400 TIMES" and S54 was a hard cut to "REPLAYED 0 TIMES" with no count in between.
  // Now the viewer watches the count fall to zero: that IS the punchline landing.
  const replayN = Math.max(0, Math.round(400 * (1 - clamp(t / 30))));
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Bedroom t={t + 2038} id="s54" crossed={0} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <Foreground blur={10}>
          <FgPlant x={553} y={914.1} s={1.6} />
        </Foreground>
      </g>
      <Popup lines={[`REPLAYED ${replayN} TIMES`]} x={1420} y={300} size={72} />
    </g>
  );
};

// ---------- S55: medium, bedroom — Ch3 The Plus and the Minus of Being Seen ----------
export const S55: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 1026.3, y: 684.1, scale: 0.9, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 53, p: { x: 1026.3, y: 684.1, scale: 0.9, yaw: 0.2, armL: { a: 40, b: -10 }, armR: { a: 40, b: -10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 93, p: { x: 1026.3, y: 684.1, scale: 0.9, yaw: 0.2, armL: { a: 15, b: -9 }, armR: { a: 25, b: -9 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral']]);
  const camX = kf(t, [[0, 1026.3], [len, 1026.3]]);
  const camY = kf(t, [[0, 624.1], [len, 624.1]]);
  const zoom = kf(t, [[0, 1.8], [len, 1.9]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Bedroom t={t + 2075} id="s55" crossed={0} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
      </g>
    </g>
  );
};

// ---------- S56: macro insert, study — Ch3 The Plus and the Minus of Being Seen ----------
export const S56: React.FC<ShotProps> = ({ t, len }) => {
  const camX = kf(t, [[0, 960], [len, 960]]);
  const camY = kf(t, [[0, 500], [len, 500]]);
  // Nov 9 board fix: zoom 2.4–2.5 pushed the outer circles flush with the frame
  // edges (their strokes were cut left and right). 2.2–2.3 keeps every circle whole.
  const zoom = kf(t, [[0, 2.2], [len, 2.3]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Study t={t + 2112} id="s56" veil={0.44} />
        <Desk x0={560} x1={1360} y={700} />
        <circle cx={660} cy={580} r={90} fill="#C0392B" stroke="#161616" strokeWidth={6} />
        <text x={660} y={616} textAnchor="middle" fontFamily={FONT.hand} fontSize={110} fill="#F6EFE3">1</text>
        <text x={660} y={690} textAnchor="middle" fontFamily={FONT.ui} fontSize={18} fill="#F6EFE3">STARTS WITH YOU</text>
        <circle cx={960} cy={580} r={90} fill="#C0392B" stroke="#161616" strokeWidth={6} />
        <text x={960} y={616} textAnchor="middle" fontFamily={FONT.hand} fontSize={110} fill="#F6EFE3">2</text>
        <text x={960} y={690} textAnchor="middle" fontFamily={FONT.ui} fontSize={18} fill="#F6EFE3">STARING AT THEMSELVES</text>
        <circle cx={1260} cy={580} r={90} fill="#C0392B" stroke="#161616" strokeWidth={6} />
        <text x={1260} y={616} textAnchor="middle" fontFamily={FONT.hand} fontSize={110} fill="#F6EFE3">3</text>
        <text x={1260} y={690} textAnchor="middle" fontFamily={FONT.ui} fontSize={18} fill="#F6EFE3">DIMS FAST</text>
      </g>
    </g>
  );
};

// ---------- S57: high angle, bedroom — Ch3 The Plus and the Minus of Being Seen ----------
export const S57: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 1026.3, y: 684.1, scale: 0.9, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 41, p: { x: 1026.3, y: 684.1, scale: 0.9, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 120, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 74, p: { x: 1026.3, y: 684.1, scale: 0.9, yaw: -0.3, armL: { a: 15, b: -9 }, armR: { a: 25, b: -9 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral'], [41, 'determined']]);
  const camX = kf(t, [[0, 1026.3], [len, 1026.3]]);
  const camY = kf(t, [[0, 520], [len, 520]]);
  const zoom = kf(t, [[0, 1.25], [len, 1.3]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Bedroom t={t + 2149} id="s57" crossed={0} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <Foreground blur={10}>
          <FgPlant x={318.3} y={942} s={1.6} />
        </Foreground>
      </g>
    </g>
  );
};

// ---------- S58: medium, bedroom — Ch3 The Plus and the Minus of Being Seen ----------
export const S58: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 1026.3, y: 684.1, scale: 0.9, yaw: 0.5, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 50, p: { x: 1026.3, y: 684.1, scale: 0.9, yaw: 0.5, armL: { a: 120, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 90, p: { x: 1026.3, y: 684.1, scale: 0.9, yaw: 0.4, armL: { a: 15, b: -9 }, armR: { a: 25, b: -9 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral'], [50, 'determined']]);
  const camX = kf(t, [[0, 1026.3], [len, 1026.3]]);
  const camY = kf(t, [[0, 624.1], [len, 624.1]]);
  const zoom = kf(t, [[0, 1.8], [len, 1.9]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Bedroom t={t + 2186} id="s58" crossed={0} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
      </g>
    </g>
  );
};

// ---------- S59: close-up, bedroom — Ch3 The Plus and the Minus of Being Seen ----------
export const S59: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 1026.3, y: 684.1, scale: 0.9, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 51, p: { x: 1026.3, y: 684.1, scale: 0.9, yaw: 0.2, armL: { a: 30, b: -4 }, armR: { a: 25, b: -9 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 91, p: { x: 1026.3, y: 684.1, scale: 0.9, yaw: 0.2, armL: { a: 15, b: -9 }, armR: { a: 25, b: -9 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral'], [51, 'determined']]);
  const camX = kf(t, [[0, 1026.3], [len, 1026.3]]);
  const camY = kf(t, [[0, 529.6], [len, 529.6]]);
  const zoom = kf(t, [[0, 3.2], [len, 3.35]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Bedroom t={t + 2223} id="s59" crossed={0} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
      </g>
    </g>
  );
};

// ---------- S60: low angle, bedroom — Ch3 The Plus and the Minus of Being Seen ----------
export const S60: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 1026.3, y: 684.1, scale: 0.9, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 48, p: { x: 1026.3, y: 684.1, scale: 0.9, yaw: 0.3, armL: { a: 25, b: -9 }, armR: { a: 55, b: -4 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 88, p: { x: 1026.3, y: 684.1, scale: 0.9, yaw: 0.2, armL: { a: 15, b: -9 }, armR: { a: 25, b: -9 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral'], [48, 'determined']]);
  const camX = kf(t, [[0, 1026.3], [len, 1026.3]]);
  const camY = kf(t, [[0, 724.1], [len, 724.1]]);
  const zoom = kf(t, [[0, 1.6], [len, 1.68]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Bedroom t={t + 2260} id="s60" crossed={0} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <Foreground blur={10}>
          <FgPlant x={486.3} y={1051.6} s={1.6} />
        </Foreground>
      </g>
    </g>
  );
};

// ---------- S61: medium, bedroom — Ch3 The Plus and the Minus of Being Seen ----------
export const S61: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 1026.3, y: 684.1, scale: 0.9, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 55, p: { x: 1026.3, y: 684.1, scale: 0.9, yaw: -0.3, armL: { a: 40, b: -10 }, armR: { a: 25, b: -9 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 95, p: { x: 1026.3, y: 684.1, scale: 0.9, yaw: -0.3, armL: { a: 15, b: -9 }, armR: { a: 25, b: -9 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral'], [55, 'determined']]);
  const camX = kf(t, [[0, 1026.3], [len, 1026.3]]);
  const camY = kf(t, [[0, 624.1], [len, 624.1]]);
  const zoom = kf(t, [[0, 1.8], [len, 1.9]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Bedroom t={t + 2297} id="s61" crossed={0} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
      </g>
    </g>
  );
};

// ---------- S62: wide, bedroom — Ch4 Rule One: Your Brain Starts With You ----------
export const S62: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 1026.3, y: 684.1, scale: 0.9, yaw: 0.5, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 53, p: { x: 1026.3, y: 684.1, scale: 0.9, yaw: 0.5, armL: { a: 25, b: -60 }, armR: { a: 25, b: -60 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 93, p: { x: 1026.3, y: 684.1, scale: 0.9, yaw: 0.4, armL: { a: 17.5, b: -34 }, armR: { a: -7.5, b: -34 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral'], [53, 'worried']]);
  const camX = kf(t, [[0, 940], [len, 940]]);
  const camY = kf(t, [[0, 560], [len, 560]]);
  const zoom = kf(t, [[0, 1.0], [len, 1.06]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Bedroom t={t + 2334} id="s62" crossed={0} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <ThoughtBubble />
      </g>
      <text x={120} y={130} fontFamily={FONT.hand} fontSize={44} fill="#F6EFE3">CHAPTER FOUR</text>
    </g>
  );
};

// ---------- S63: over-the-shoulder, bedroom — Ch4 Rule One: Your Brain Starts With You ----------
export const S63: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 1026.3, y: 684.1, scale: 0.9, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 50, p: { x: 1026.3, y: 684.1, scale: 0.9, yaw: 0.2, armL: { a: 40, b: -10 }, armR: { a: 40, b: -10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 90, p: { x: 1026.3, y: 684.1, scale: 0.9, yaw: 0.2, armL: { a: 15, b: -9 }, armR: { a: 25, b: -9 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral']]);
  const camX = kf(t, [[0, 1026.3], [len, 1026.3]]);
  const camY = kf(t, [[0, 624.1], [len, 624.1]]);
  const zoom = kf(t, [[0, 1.5], [len, 1.55]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Bedroom t={t + 2371} id="s63" crossed={0} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <Foreground blur={16}>
          <FgPlant x={586.3} y={1020} s={2.0} />
        </Foreground>
      </g>
    </g>
  );
};

// ---------- S64: medium, bedroom — Ch4 Rule One: Your Brain Starts With You ----------
export const S64: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 1026.3, y: 684.1, scale: 0.9, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 36, p: { x: 1026.3, y: 684.1, scale: 0.9, yaw: 0.3, armL: { a: 25, b: -60 }, armR: { a: 25, b: -60 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 63, p: { x: 1026.3, y: 684.1, scale: 0.9, yaw: 0.2, armL: { a: 17.5, b: -34 }, armR: { a: -7.5, b: -34 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral'], [36, 'worried']]);
  const camX = kf(t, [[0, 1026.3], [len, 1026.3]]);
  const camY = kf(t, [[0, 624.1], [len, 624.1]]);
  const zoom = kf(t, [[0, 1.8], [len, 1.9]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Bedroom t={t + 2408} id="s64" crossed={0} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <Heart x={1260} y={560} s={1} t={t} />
      </g>
    </g>
  );
};

// ---------- S65: wide, bedroom — Ch4 Rule One: Your Brain Starts With You ----------
export const S65: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 1026.3, y: 684.1, scale: 0.9, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 49, p: { x: 1026.3, y: 684.1, scale: 0.9, yaw: -0.3, armL: { a: 40, b: -10 }, armR: { a: 40, b: -10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 89, p: { x: 1026.3, y: 684.1, scale: 0.9, yaw: -0.3, armL: { a: 15, b: -9 }, armR: { a: 25, b: -9 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral']]);
  const camX = kf(t, [[0, 940], [len, 940]]);
  const camY = kf(t, [[0, 560], [len, 560]]);
  const zoom = kf(t, [[0, 1.0], [len, 1.06]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Bedroom t={t + 2445} id="s65" crossed={0} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
      </g>
    </g>
  );
};

// ---------- S66: medium, bedroom — Ch4 Rule One: Your Brain Starts With You ----------
export const S66: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 1026.3, y: 684.1, scale: 0.9, yaw: 0.5, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 50, p: { x: 1026.3, y: 684.1, scale: 0.9, yaw: 0.5, armL: { a: 40, b: -10 }, armR: { a: 40, b: -10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 90, p: { x: 1026.3, y: 684.1, scale: 0.9, yaw: 0.4, armL: { a: 15, b: -9 }, armR: { a: 25, b: -9 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral']]);
  const camX = kf(t, [[0, 1026.3], [len, 1026.3]]);
  const camY = kf(t, [[0, 624.1], [len, 624.1]]);
  const zoom = kf(t, [[0, 1.8], [len, 1.9]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Bedroom t={t + 2482} id="s66" crossed={0} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <Foreground blur={10}>
          <FgPlant x={553} y={914.1} s={1.6} />
        </Foreground>
      </g>
    </g>
  );
};

// ---------- S67: close-up, bedroom — Ch4 Rule One: Your Brain Starts With You ----------
export const S67: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 1026.3, y: 684.1, scale: 0.9, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 36, p: { x: 1026.3, y: 684.1, scale: 0.9, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: 15, b: -55 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 }, handR: 'point' } },
    { f: 64, p: { x: 1026.3, y: 684.1, scale: 0.9, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: -2.5, b: -31.5 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 }, handR: 'point' } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral'], [36, 'puzzled']]);
  const camX = kf(t, [[0, 1026.3], [len, 1026.3]]);
  const camY = kf(t, [[0, 529.6], [len, 529.6]]);
  const zoom = kf(t, [[0, 3.2], [len, 3.35]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Bedroom t={t + 2519} id="s67" crossed={0} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
      </g>
    </g>
  );
};

// ---------- S68: medium, bedroom — Ch4 Rule One: Your Brain Starts With You ----------
export const S68: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 1026.3, y: 684.1, scale: 0.9, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 56, p: { x: 1026.3, y: 684.1, scale: 0.9, yaw: 0.3, armL: { a: 40, b: -10 }, armR: { a: 40, b: -10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 96, p: { x: 1026.3, y: 684.1, scale: 0.9, yaw: 0.2, armL: { a: 15, b: -9 }, armR: { a: 25, b: -9 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral']]);
  const camX = kf(t, [[0, 1026.3], [len, 1026.3]]);
  const camY = kf(t, [[0, 624.1], [len, 624.1]]);
  const zoom = kf(t, [[0, 1.8], [len, 1.9]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Bedroom t={t + 2556} id="s68" crossed={0} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
      </g>
    </g>
  );
};

// ---------- S69: wide, bedroom — Ch4 Rule One: Your Brain Starts With You ----------
export const S69: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 1026.3, y: 684.1, scale: 0.9, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 49, p: { x: 1026.3, y: 684.1, scale: 0.9, yaw: -0.3, armL: { a: 40, b: -10 }, armR: { a: 40, b: -10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 89, p: { x: 1026.3, y: 684.1, scale: 0.9, yaw: -0.3, armL: { a: 15, b: -9 }, armR: { a: 25, b: -9 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral']]);
  const camX = kf(t, [[0, 940], [len, 940]]);
  const camY = kf(t, [[0, 560], [len, 560]]);
  const zoom = kf(t, [[0, 1.0], [len, 1.06]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Bedroom t={t + 2593} id="s69" crossed={0} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <Foreground blur={10}>
          <FgPlant x={40} y={1090} s={1.6} />
        </Foreground>
      </g>
    </g>
  );
};

// ---------- S70: two-shot, party — Ch4 Rule One: Your Brain Starts With You ----------
export const S70: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.5, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 52, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.5, armL: { a: 40, b: -10 }, armR: { a: 40, b: -10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 92, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.4, armL: { a: 15, b: -9 }, armR: { a: 25, b: -9 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral']]);
  const p1 = poseAt(t, [
    { f: 0, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 52, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.3, look: 0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 92, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f1 = faceAt(t, [[0, 'neutral']]);
  const camX = kf(t, [[0, 845.1], [len, 845.1]]);
  const camY = kf(t, [[0, 595.3], [len, 595.3]]);
  const zoom = kf(t, [[0, 1.35], [len, 1.4]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Party t={t + 2630} id="s70" veil={0.44} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestA} pose={{ ...p1, ...f1 }} rimId="rimBlue" shadow={1} />
      </g>
    </g>
  );
};

// ---------- S71: medium, party — Ch4 Rule One: Your Brain Starts With You ----------
export const S71: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 42, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.2, armL: { a: 25, b: -60 }, armR: { a: 25, b: -60 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 77, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.2, armL: { a: 17.5, b: -34 }, armR: { a: -7.5, b: -34 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral'], [42, 'worried']]);
  const p1 = poseAt(t, [
    { f: 0, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 42, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.3, look: 0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 77, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f1 = faceAt(t, [[0, 'neutral']]);
  const p2 = poseAt(t, [
    { f: 0, p: { x: 1400, y: 719.4, scale: 1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 42, p: { x: 1400, y: 719.4, scale: 1, yaw: -0.3, look: -0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 77, p: { x: 1400, y: 719.4, scale: 1, yaw: -0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f2 = faceAt(t, [[0, 'neutral']]);
  const camX = kf(t, [[0, 980], [len, 980]]);
  const camY = kf(t, [[0, 671.3], [len, 671.3]]);
  const zoom = kf(t, [[0, 1.8], [len, 1.9]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Party t={t + 2667} id="s71" veil={0.44} />
        <LobsterSign />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestA} pose={{ ...p1, ...f1 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestB} pose={{ ...p2, ...f2 }} rimId="rimBlue" shadow={1} />
      </g>
    </g>
  );
};

// ---------- S72: two-shot, party — Ch4 Rule One: Your Brain Starts With You ----------
export const S72: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 64, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.3, armL: { a: 25, b: -60 }, armR: { a: 25, b: -60 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 77, p: { x: 980, y: 731.3, scale: 1.1, yaw: -0.3, armL: { a: 40, b: -10 }, armR: { a: 40, b: -10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 104, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.2, armL: { a: 17.5, b: -34 }, armR: { a: -7.5, b: -34 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral'], [64, 'worried']]);
  const p1 = poseAt(t, [
    { f: 0, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 64, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.3, look: 0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 77, p: { x: 710.3, y: 719.4, scale: 1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 104, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.2, armL: { a: 40, b: -10 }, armR: { a: 40, b: -10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f1 = faceAt(t, [[0, 'neutral']]);
  const camX = kf(t, [[0, 845.1], [len, 845.1]]);
  const camY = kf(t, [[0, 595.3], [len, 595.3]]);
  const zoom = kf(t, [[0, 1.35], [len * 0.5, 1.4], [len, 1.4]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Party t={t + 2704} id="s72" veil={0.44} />
        <Glow x={980} y={611.3} r={320} o={kf(t, [[0, 0.25], [len, 0.5]])} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestA} pose={{ ...p1, ...f1 }} rimId="rimBlue" shadow={1} />
        <Foreground blur={10}>
          <FgPlant x={194} y={1020} s={1.8} />
        </Foreground>
      </g>
    </g>
  );
};

// ---------- S73: high angle, party — Ch4 Rule One: Your Brain Starts With You ----------
export const S73: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 980, y: 731.3, scale: 1.1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 55, p: { x: 980, y: 731.3, scale: 1.1, yaw: -0.3, armL: { a: 40, b: -10 }, armR: { a: 40, b: -10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 95, p: { x: 980, y: 731.3, scale: 1.1, yaw: -0.3, armL: { a: 15, b: -9 }, armR: { a: 25, b: -9 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral'], [55, 'determined']]);
  const p1 = poseAt(t, [
    { f: 0, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 55, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.3, look: 0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 95, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f1 = faceAt(t, [[0, 'neutral']]);
  const p2 = poseAt(t, [
    { f: 0, p: { x: 1249.7, y: 719.4, scale: 1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 55, p: { x: 1249.7, y: 719.4, scale: 1, yaw: -0.3, look: -0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 95, p: { x: 1249.7, y: 719.4, scale: 1, yaw: -0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f2 = faceAt(t, [[0, 'neutral']]);
  const p3 = poseAt(t, [
    { f: 0, p: { x: 575.5, y: 719.4, scale: 1, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 55, p: { x: 575.5, y: 719.4, scale: 1, yaw: 0.3, look: 0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 95, p: { x: 575.5, y: 719.4, scale: 1, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f3 = faceAt(t, [[0, 'neutral']]);
  const camX = kf(t, [[0, 980], [len, 980]]);
  const camY = kf(t, [[0, 520], [len, 520]]);
  const zoom = kf(t, [[0, 1.25], [len, 1.3]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Party t={t + 2741} id="s73" veil={0.44} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestA} pose={{ ...p1, ...f1 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestB} pose={{ ...p2, ...f2 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestC} pose={{ ...p3, ...f3 }} rimId="rimBlue" shadow={1} />
      </g>
    </g>
  );
};

// ---------- S74: medium, party — Ch4 Rule One: Your Brain Starts With You ----------
export const S74: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.5, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 56, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.5, armL: { a: 40, b: -10 }, armR: { a: 40, b: -10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 96, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.4, armL: { a: 15, b: -9 }, armR: { a: 25, b: -9 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral']]);
  const p1 = poseAt(t, [
    { f: 0, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 56, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.3, look: 0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 96, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f1 = faceAt(t, [[0, 'neutral']]);
  const p2 = poseAt(t, [
    { f: 0, p: { x: 1249.7, y: 719.4, scale: 1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 56, p: { x: 1249.7, y: 719.4, scale: 1, yaw: -0.3, look: -0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 96, p: { x: 1249.7, y: 719.4, scale: 1, yaw: -0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f2 = faceAt(t, [[0, 'neutral']]);
  const camX = kf(t, [[0, 980], [len, 980]]);
  const camY = kf(t, [[0, 700], [len, 700]]);
  const zoom = kf(t, [[0, 1.35], [len, 1.45]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Party t={t + 2778} id="s74" veil={0.44} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestA} pose={{ ...p1, ...f1 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestB} pose={{ ...p2, ...f2 }} rimId="rimBlue" shadow={1} />
      </g>
    </g>
  );
};

// ---------- S75: two-shot, party — Ch4 Rule One: Your Brain Starts With You ----------
export const S75: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 50, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.2, armL: { a: 40, b: -10 }, armR: { a: 40, b: -10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 90, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.2, armL: { a: 15, b: -9 }, armR: { a: 25, b: -9 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral']]);
  const p1 = poseAt(t, [
    { f: 0, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 50, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.3, look: 0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 90, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f1 = faceAt(t, [[0, 'neutral']]);
  const camX = kf(t, [[0, 845.1], [len, 845.1]]);
  const camY = kf(t, [[0, 595.3], [len, 595.3]]);
  const zoom = kf(t, [[0, 1.35], [len, 1.4]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Party t={t + 2815} id="s75" veil={0.44} />
        <LobsterSign />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestA} pose={{ ...p1, ...f1 }} rimId="rimBlue" shadow={1} />
        <Foreground blur={10}>
          <FgPlant x={194} y={1020} s={1.8} />
        </Foreground>
      </g>
    </g>
  );
};

// ---------- S76: low angle, party — Ch4 Rule One: Your Brain Starts With You ----------
export const S76: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 49, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.3, armL: { a: 25, b: -60 }, armR: { a: 25, b: -60 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 89, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.2, armL: { a: 17.5, b: -34 }, armR: { a: -7.5, b: -34 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral'], [49, 'scared'], [87, 'worried']]);
  const p1 = poseAt(t, [
    { f: 0, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 49, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.3, look: 0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 89, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f1 = faceAt(t, [[0, 'neutral']]);
  const p2 = poseAt(t, [
    { f: 0, p: { x: 1249.7, y: 719.4, scale: 1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 49, p: { x: 1249.7, y: 719.4, scale: 1, yaw: -0.3, look: -0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 89, p: { x: 1249.7, y: 719.4, scale: 1, yaw: -0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f2 = faceAt(t, [[0, 'neutral']]);
  const camX = kf(t, [[0, 980], [len, 980]]);
  const camY = kf(t, [[0, 771.3], [len, 771.3]]);
  const zoom = kf(t, [[0, 1.6], [len, 1.68]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Party t={t + 2852} id="s76" veil={0.44} />
        <SpotlightBeam x={980} poolY={860} t={t} o={0.65} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestA} pose={{ ...p1, ...f1 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestB} pose={{ ...p2, ...f2 }} rimId="rimBlue" shadow={1} />
      </g>
    </g>
  );
};

// ---------- S77: medium, party — Ch4 Rule One: Your Brain Starts With You ----------
export const S77: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 980, y: 731.3, scale: 1.1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 59, p: { x: 980, y: 731.3, scale: 1.1, yaw: -0.3, armL: { a: 40, b: -10 }, armR: { a: 40, b: -10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 99, p: { x: 980, y: 731.3, scale: 1.1, yaw: -0.3, armL: { a: 15, b: -9 }, armR: { a: 25, b: -9 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral'], [59, 'determined']]);
  const camX = kf(t, [[0, 980], [len, 980]]);
  const camY = kf(t, [[0, 600], [len, 600]]);
  const zoom = kf(t, [[0, 2.2], [len, 2.3]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Party t={t + 2889} id="s77" veil={0.44} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
      </g>
    </g>
  );
};

// ---------- S78: wide, classroom — Ch5 Rule Two: Everyone Is Staring At Themselves ----------
export const S78: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 1260, y: 760, scale: 1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 54, p: { x: 1260, y: 760, scale: 1, yaw: -0.3, armL: { a: 25, b: -60 }, armR: { a: 25, b: -60 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 94, p: { x: 1260, y: 760, scale: 1, yaw: -0.3, armL: { a: 17.5, b: -34 }, armR: { a: -7.5, b: -34 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral'], [54, 'worried']]);
  const p1 = poseAt(t, [
    { f: 0, p: { x: 520, y: 830, scale: 0.9, yaw: 0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 54, p: { x: 520, y: 830, scale: 0.9, yaw: 0.4, look: 0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 94, p: { x: 520, y: 830, scale: 0.9, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f1 = faceAt(t, [[0, 'neutral']]);
  const p2 = poseAt(t, [
    { f: 0, p: { x: 1620, y: 830, scale: 0.9, yaw: -0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 54, p: { x: 1620, y: 830, scale: 0.9, yaw: -0.4, look: -0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 94, p: { x: 1620, y: 830, scale: 0.9, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f2 = faceAt(t, [[0, 'neutral']]);
  const camX = kf(t, [[0, 900], [len, 900]]);
  const camY = kf(t, [[0, 540], [len, 540]]);
  const zoom = kf(t, [[0, 1.0], [len, 1.06]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Classroom t={t + 2926} id="s78" board={<text x={740} y={380} textAnchor="middle" fontFamily={FONT.hand} fontSize={72} fill="#EDEFE6">RULE TWO</text>} />
        <Hero look={LOOKS.student} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestA} pose={{ ...p1, ...f1 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestB} pose={{ ...p2, ...f2 }} rimId="rimBlue" shadow={1} />
        <SchoolDesk x={1260} />
        <Foreground blur={10}>
          <FgPlant x={0} y={1020} s={1.8} />
        </Foreground>
      </g>
      <text x={120} y={130} fontFamily={FONT.hand} fontSize={44} fill="#F6EFE3">CHAPTER FIVE</text>
    </g>
  );
};

// ---------- S79: over-the-shoulder, classroom — Ch5 Rule Two: Everyone Is Staring At Themselves ----------
export const S79: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 1260, y: 760, scale: 1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 50, p: { x: 1260, y: 760, scale: 1, yaw: -0.3, armL: { a: 40, b: -10 }, armR: { a: 40, b: -10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 90, p: { x: 1260, y: 760, scale: 1, yaw: -0.3, armL: { a: 15, b: -9 }, armR: { a: 25, b: -9 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral'], [50, 'determined']]);
  const camX = kf(t, [[0, 1260], [len, 1260]]);
  const camY = kf(t, [[0, 700], [len, 700]]);
  const zoom = kf(t, [[0, 1.5], [len, 1.55]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Classroom t={t + 2963} id="s79" />
        <Hero look={LOOKS.student} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <SchoolDesk x={1260} />
      </g>
    </g>
  );
};

// ---------- S80: medium, classroom — Ch5 Rule Two: Everyone Is Staring At Themselves ----------
export const S80: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 1260, y: 760, scale: 1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 54, p: { x: 1260, y: 760, scale: 1, yaw: -0.3, armL: { a: 55, b: -4 }, armR: { a: 25, b: -9 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 94, p: { x: 1260, y: 760, scale: 1, yaw: -0.3, armL: { a: 15, b: -9 }, armR: { a: 25, b: -9 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral']]);
  const camX = kf(t, [[0, 1260], [len, 1260]]);
  const camY = kf(t, [[0, 700], [len, 700]]);
  const zoom = kf(t, [[0, 1.8], [len, 1.9]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Classroom t={t + 3000} id="s80" />
        <Hero look={LOOKS.student} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <SchoolDesk x={1260} />
      </g>
    </g>
  );
};

// ---------- S81: wide, classroom — Ch5 Rule Two: Everyone Is Staring At Themselves ----------
export const S81: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 1260, y: 760, scale: 1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 49, p: { x: 1260, y: 760, scale: 1, yaw: -0.3, armL: { a: 25, b: -9 }, armR: { a: 55, b: -4 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 89, p: { x: 1260, y: 760, scale: 1, yaw: -0.3, armL: { a: 15, b: -9 }, armR: { a: 25, b: -9 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral']]);
  const p1 = poseAt(t, [
    { f: 0, p: { x: 520, y: 830, scale: 0.9, yaw: 0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 49, p: { x: 520, y: 830, scale: 0.9, yaw: 0.4, look: 0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 89, p: { x: 520, y: 830, scale: 0.9, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f1 = faceAt(t, [[0, 'neutral']]);
  const p2 = poseAt(t, [
    { f: 0, p: { x: 1620, y: 830, scale: 0.9, yaw: -0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 49, p: { x: 1620, y: 830, scale: 0.9, yaw: -0.4, look: -0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 89, p: { x: 1620, y: 830, scale: 0.9, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f2 = faceAt(t, [[0, 'neutral']]);
  const camX = kf(t, [[0, 900], [len, 900]]);
  const camY = kf(t, [[0, 540], [len, 540]]);
  const zoom = kf(t, [[0, 1.0], [len, 1.06]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Classroom t={t + 3037} id="s81" />
        <Hero look={LOOKS.student} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestA} pose={{ ...p1, ...f1 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestB} pose={{ ...p2, ...f2 }} rimId="rimBlue" shadow={1} />
        <SchoolDesk x={1260} />
        <Foreground blur={10}>
          <FgPlant x={0} y={1020} s={1.8} />
        </Foreground>
      </g>
    </g>
  );
};

// ---------- S82: medium, classroom — Ch5 Rule Two: Everyone Is Staring At Themselves ----------
export const S82: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 1260, y: 760, scale: 1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 49, p: { x: 1260, y: 760, scale: 1, yaw: -0.3, armL: { a: 40, b: -10 }, armR: { a: 25, b: -9 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 89, p: { x: 1260, y: 760, scale: 1, yaw: -0.3, armL: { a: 15, b: -9 }, armR: { a: 25, b: -9 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral']]);
  const camX = kf(t, [[0, 1260], [len, 1260]]);
  const camY = kf(t, [[0, 700], [len, 700]]);
  const zoom = kf(t, [[0, 1.8], [len, 1.9]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Classroom t={t + 3074} id="s82" />
        <Hero look={LOOKS.student} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <SchoolDesk x={1260} />
      </g>
    </g>
  );
};

// ---------- S83: two-shot, schematic — Ch5 Rule Two: Everyone Is Staring At Themselves ----------
export const S83: React.FC<ShotProps> = ({ t, len }) => {
  const camX = kf(t, [[0, 900], [len, 900]]);
  const camY = kf(t, [[0, 640], [len, 640]]);
  const zoom = kf(t, [[0, 1.35], [len, 1.4]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Schematic t={t + 3111} id="s83" />
        <SchLabel x={1300} y={380} t={t} text="GUESSED" size={36} color="#FF8A3D" />
        <CountUp x={1300} y={480} t={t} to={48} size={120} color="#FF8A3D" suffix="%" />
      </g>
    </g>
  );
};

// ---------- S84: macro insert, schematic — Ch5 Rule Two: Everyone Is Staring At Themselves ----------
export const S84: React.FC<ShotProps> = ({ t, len }) => {
  const camX = kf(t, [[0, 900], [len, 900]]);
  const camY = kf(t, [[0, 640], [len, 640]]);
  const zoom = kf(t, [[0, 1.35], [len, 1.4]]);
  // v8 (Nov 9, Javion: bars filling up + explanations + Detective / "put both percentages
  // on that chart a pie chart is used to compare 2 or more percentages"): was a macro
  // insert of two counting numbers. Now the Detective narrates (facing camera) while BOTH
  // percentages fill up on the SAME pie as slices (whole circle = 100%) — 48% guessed vs
  // 8% real, the gap made visible — with the takeaway underneath. Bars are NOT for
  // comparing percentages — the pie is.
  const pDet = poseAt(t, [
    { f: 0, p: { x: 360, y: 780, scale: 1.05, yaw: 0, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 30, p: { x: 360, y: 780, scale: 1.05, yaw: 0, armL: { a: 5, b: 0 }, armR: { a: 55, b: -20 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 70, p: { x: 360, y: 780, scale: 1.05, yaw: 0, armL: { a: 5, b: 0 }, armR: { a: 55, b: -20 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const fDet = faceAt(t, [[0, 'neutral'], [30, 'worried']]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Schematic t={t + 3148} id="s84" />
        <Hero look={LOOKS.detective} pose={{ ...pDet, ...fDet }} rimId="rimBlue" shadow={1} />
        <PieChart
          x={1060} y={420} t={t} dur={40} r={150}
          slices={[
            { label: 'GUESSED', value: 48, color: '#7E8DA6' },
            { label: 'REAL', value: 8, color: '#FF8A3D' },
          ]}
        />
        <SchLabel x={1060} y={660} t={t + 30} text="THEY GUESSED SIX TIMES TOO HIGH" size={30} color="#F6EFE3" />
        <SchLabel x={1060} y={710} t={t + 40} text="ONLY 8% ACTUALLY NOTICED" size={30} color="#FF8A3D" />
      </g>
    </g>
  );
};

// ---------- S85: wide, schematic — Ch5 Rule Two: Everyone Is Staring At Themselves ----------
export const S85: React.FC<ShotProps> = ({ t, len }) => {
  const camX = kf(t, [[0, 960], [len, 960]]);
  const camY = kf(t, [[0, 540], [len, 540]]);
  const zoom = kf(t, [[0, 1.0], [len, 1.06]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Schematic t={t + 3185} id="s85" />
        <SchLabel x={1100} y={340} t={t} text="THE REAL NUMBER" size={36} color="#FF8A3D" />
        <CountUp x={1100} y={480} t={t} to={8} size={150} color="#FF8A3D" suffix="%" />
      </g>
    </g>
  );
};

// ---------- S86: two-shot, schematic — Ch5 Rule Two: Everyone Is Staring At Themselves ----------
export const S86: React.FC<ShotProps> = ({ t, len }) => {
  const camX = kf(t, [[0, 900], [len, 900]]);
  const camY = kf(t, [[0, 640], [len, 640]]);
  const zoom = kf(t, [[0, 1.35], [len, 1.4]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Schematic t={t + 3222} id="s86" />
        <SchLabel x={1300} y={360} t={t} text="OVERESTIMATED BY" size={36} color="#FF8A3D" />
        <CountUp x={1300} y={500} t={t} to={6} size={150} color="#FF8A3D" suffix="×" />
      </g>
    </g>
  );
};

// ---------- S87: medium, classroom — Ch5 Rule Two: Everyone Is Staring At Themselves ----------
export const S87: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 1260, y: 760, scale: 1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 50, p: { x: 1260, y: 760, scale: 1, yaw: -0.3, armL: { a: 25, b: -60 }, armR: { a: 25, b: -60 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 90, p: { x: 1260, y: 760, scale: 1, yaw: -0.3, armL: { a: 17.5, b: -34 }, armR: { a: -7.5, b: -34 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral'], [50, 'worried']]);
  const camX = kf(t, [[0, 1260], [len, 1260]]);
  const camY = kf(t, [[0, 700], [len, 700]]);
  const zoom = kf(t, [[0, 1.8], [len, 1.9]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Classroom t={t + 3259} id="s87" />
        <Hero look={LOOKS.student} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <SchoolDesk x={1260} />
      </g>
    </g>
  );
};

// ---------- S88: two-shot, classroom — Ch5 Rule Two: Everyone Is Staring At Themselves ----------
export const S88: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 1260, y: 760, scale: 1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 50, p: { x: 1260, y: 760, scale: 1, yaw: -0.3, armL: { a: 40, b: -10 }, armR: { a: 40, b: -10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 90, p: { x: 1260, y: 760, scale: 1, yaw: -0.3, armL: { a: 15, b: -9 }, armR: { a: 25, b: -9 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral']]);
  const p1 = poseAt(t, [
    { f: 0, p: { x: 900, y: 840, scale: 0.9, yaw: 0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 50, p: { x: 900, y: 840, scale: 0.9, yaw: 0.4, look: 0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 90, p: { x: 900, y: 840, scale: 0.9, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f1 = faceAt(t, [[0, 'neutral']]);
  const camX = kf(t, [[0, 1080], [len, 1080]]);
  const camY = kf(t, [[0, 670], [len, 670]]);
  const zoom = kf(t, [[0, 1.35], [len, 1.4]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Classroom t={t + 3296} id="s88" />
        <Hero look={LOOKS.student} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestA} pose={{ ...p1, ...f1 }} rimId="rimBlue" shadow={1} />
        <SchoolDesk x={1260} />
      </g>
    </g>
  );
};

// ---------- S89: high angle, classroom — Ch5 Rule Two: Everyone Is Staring At Themselves ----------
export const S89: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 1260, y: 760, scale: 1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 58, p: { x: 1260, y: 760, scale: 1, yaw: -0.3, armL: { a: 25, b: -60 }, armR: { a: 25, b: -60 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 98, p: { x: 1260, y: 760, scale: 1, yaw: -0.3, armL: { a: 17.5, b: -34 }, armR: { a: -7.5, b: -34 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral'], [58, 'worried']]);
  const p1 = poseAt(t, [
    { f: 0, p: { x: 520, y: 830, scale: 0.9, yaw: 0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 58, p: { x: 520, y: 830, scale: 0.9, yaw: 0.4, look: 0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 98, p: { x: 520, y: 830, scale: 0.9, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f1 = faceAt(t, [[0, 'neutral']]);
  const p2 = poseAt(t, [
    { f: 0, p: { x: 1620, y: 830, scale: 0.9, yaw: -0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 58, p: { x: 1620, y: 830, scale: 0.9, yaw: -0.4, look: -0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 98, p: { x: 1620, y: 830, scale: 0.9, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f2 = faceAt(t, [[0, 'neutral']]);
  const camX = kf(t, [[0, 1100], [len, 1100]]);
  const camY = kf(t, [[0, 520], [len, 520]]);
  const zoom = kf(t, [[0, 1.25], [len, 1.3]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Classroom t={t + 3333} id="s89" />
        <Hero look={LOOKS.student} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestA} pose={{ ...p1, ...f1 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestB} pose={{ ...p2, ...f2 }} rimId="rimBlue" shadow={1} />
        <SchoolDesk x={1260} />
      </g>
    </g>
  );
};

// ---------- S90: medium, classroom — Ch5 Rule Two: Everyone Is Staring At Themselves ----------
export const S90: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 1260, y: 760, scale: 1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 53, p: { x: 1260, y: 760, scale: 1, yaw: -0.3, armL: { a: 40, b: -10 }, armR: { a: 40, b: -10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 93, p: { x: 1260, y: 760, scale: 1, yaw: -0.3, armL: { a: 15, b: -9 }, armR: { a: 25, b: -9 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral']]);
  const camX = kf(t, [[0, 1150], [len, 1150]]);
  const camY = kf(t, [[0, 700], [len, 700]]);
  const zoom = kf(t, [[0, 1.8], [len, 1.9]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Classroom t={t + 3370} id="s90" />
        <Hero look={LOOKS.student} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <SchoolDesk x={1260} />
      </g>
    </g>
  );
};

// ---------- S91: two-shot, classroom — Ch5 Rule Two: Everyone Is Staring At Themselves ----------
export const S91: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 1260, y: 760, scale: 1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 61, p: { x: 1260, y: 760, scale: 1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 120, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 73, p: { x: 1260, y: 760, scale: 1, yaw: 0.3, armL: { a: 40, b: -10 }, armR: { a: 40, b: -10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 101, p: { x: 1260, y: 760, scale: 1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 55, b: -4 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral'], [61, 'happy']]);
  const p1 = poseAt(t, [
    { f: 0, p: { x: 900, y: 840, scale: 0.9, yaw: 0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 61, p: { x: 900, y: 840, scale: 0.9, yaw: 0.4, look: 0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 73, p: { x: 900, y: 840, scale: 0.9, yaw: -0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 101, p: { x: 900, y: 840, scale: 0.9, yaw: 0.3, armL: { a: 40, b: -10 }, armR: { a: 40, b: -10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f1 = faceAt(t, [[0, 'neutral']]);
  const camX = kf(t, [[0, 1080], [len, 1080]]);
  const camY = kf(t, [[0, 670], [len, 670]]);
  const zoom = kf(t, [[0, 1.35], [len * 0.5, 1.4], [len, 1.4]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Classroom t={t + 3407} id="s91" />
        <Glow x={1260} y={640} r={320} o={kf(t, [[0, 0.25], [len, 0.5]])} />
        <Hero look={LOOKS.student} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestA} pose={{ ...p1, ...f1 }} rimId="rimBlue" shadow={1} />
        <SchoolDesk x={1260} />
      </g>
    </g>
  );
};

// ---------- S92: low angle, classroom — Ch5 Rule Two: Everyone Is Staring At Themselves ----------
export const S92: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 1260, y: 760, scale: 1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 51, p: { x: 1260, y: 760, scale: 1, yaw: -0.3, armL: { a: 40, b: -10 }, armR: { a: 40, b: -10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 91, p: { x: 1260, y: 760, scale: 1, yaw: -0.3, armL: { a: 15, b: -9 }, armR: { a: 25, b: -9 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral']]);
  const camX = kf(t, [[0, 1260], [len, 1260]]);
  const camY = kf(t, [[0, 800], [len, 800]]);
  const zoom = kf(t, [[0, 1.6], [len, 1.68]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Classroom t={t + 3444} id="s92" />
        <Hero look={LOOKS.student} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <SchoolDesk x={1260} />
      </g>
    </g>
  );
};

// ---------- S93: medium, classroom — Ch5 Rule Two: Everyone Is Staring At Themselves ----------
export const S93: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 1260, y: 760, scale: 1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 36, p: { x: 1260, y: 760, scale: 1, yaw: -0.3, armL: { a: 40, b: -10 }, armR: { a: 40, b: -10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 64, p: { x: 1260, y: 760, scale: 1, yaw: -0.3, armL: { a: 15, b: -9 }, armR: { a: 25, b: -9 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral']]);
  const camX = kf(t, [[0, 1260], [len, 1260]]);
  const camY = kf(t, [[0, 700], [len, 700]]);
  const zoom = kf(t, [[0, 1.8], [len, 1.9]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Classroom t={t + 3481} id="s93" />
        <Hero look={LOOKS.student} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <SchoolDesk x={1260} />
        <Foreground blur={10}>
          <FgPlant x={786.7} y={1020} s={1.8} />
        </Foreground>
      </g>
    </g>
  );
};

// ---------- S94: wide, classroom — Ch5 Rule Two: Everyone Is Staring At Themselves ----------
export const S94: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 1260, y: 760, scale: 1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 47, p: { x: 1260, y: 760, scale: 1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 15, b: -55 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 }, handR: 'point' } },
    { f: 87, p: { x: 1260, y: 760, scale: 1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: -2.5, b: -31.5 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 }, handR: 'point' } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral'], [47, 'puzzled']]);
  const p1 = poseAt(t, [
    { f: 0, p: { x: 520, y: 830, scale: 0.9, yaw: 0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 47, p: { x: 520, y: 830, scale: 0.9, yaw: 0.4, look: 0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 87, p: { x: 520, y: 830, scale: 0.9, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f1 = faceAt(t, [[0, 'neutral']]);
  const p2 = poseAt(t, [
    { f: 0, p: { x: 1620, y: 830, scale: 0.9, yaw: -0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 47, p: { x: 1620, y: 830, scale: 0.9, yaw: -0.4, look: -0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 87, p: { x: 1620, y: 830, scale: 0.9, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f2 = faceAt(t, [[0, 'neutral']]);
  const camX = kf(t, [[0, 900], [len, 900]]);
  const camY = kf(t, [[0, 540], [len, 540]]);
  const zoom = kf(t, [[0, 1.0], [len, 1.06]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Classroom t={t + 3518} id="s94" />
        <Hero look={LOOKS.student} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestA} pose={{ ...p1, ...f1 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestB} pose={{ ...p2, ...f2 }} rimId="rimBlue" shadow={1} />
        <SchoolDesk x={1260} />
      </g>
    </g>
  );
};

// ---------- S95: over-the-shoulder, classroom — Ch5 Rule Two: Everyone Is Staring At Themselves ----------
export const S95: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 1260, y: 760, scale: 1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 43, p: { x: 1260, y: 760, scale: 1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 15, b: -55 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 }, handR: 'point' } },
    { f: 78, p: { x: 1260, y: 760, scale: 1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: -2.5, b: -31.5 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 }, handR: 'point' } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral'], [43, 'puzzled']]);
  const camX = kf(t, [[0, 1260], [len, 1260]]);
  const camY = kf(t, [[0, 700], [len, 700]]);
  const zoom = kf(t, [[0, 1.5], [len, 1.55]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Classroom t={t + 3555} id="s95" />
        <Hero look={LOOKS.student} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <SchoolDesk x={1260} />
        <Foreground blur={16}>
          <FgPlant x={820} y={1020} s={2.0} />
        </Foreground>
      </g>
    </g>
  );
};

// ---------- S96: medium, classroom — Ch5 Rule Two: Everyone Is Staring At Themselves ----------
export const S96: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 1260, y: 760, scale: 1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 52, p: { x: 1260, y: 760, scale: 1, yaw: -0.3, armL: { a: 40, b: -10 }, armR: { a: 40, b: -10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 92, p: { x: 1260, y: 760, scale: 1, yaw: -0.3, armL: { a: 15, b: -9 }, armR: { a: 25, b: -9 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral']]);
  const camX = kf(t, [[0, 1260], [len, 1260]]);
  const camY = kf(t, [[0, 700], [len, 700]]);
  const zoom = kf(t, [[0, 1.8], [len, 1.9]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Classroom t={t + 3592} id="s96" />
        <Hero look={LOOKS.student} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <SchoolDesk x={1260} />
        <Foreground blur={10}>
          <FgPlant x={786.7} y={1020} s={1.8} />
        </Foreground>
      </g>
    </g>
  );
};

// ---------- S97: wide, classroom — Ch5 Rule Two: Everyone Is Staring At Themselves ----------
export const S97: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 1260, y: 760, scale: 1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 59, p: { x: 1260, y: 760, scale: 1, yaw: -0.3, armL: { a: 40, b: -10 }, armR: { a: 40, b: -10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 99, p: { x: 1260, y: 760, scale: 1, yaw: -0.3, armL: { a: 15, b: -9 }, armR: { a: 25, b: -9 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral']]);
  const p1 = poseAt(t, [
    { f: 0, p: { x: 520, y: 830, scale: 0.9, yaw: 0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 59, p: { x: 520, y: 830, scale: 0.9, yaw: 0.4, look: 0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 99, p: { x: 520, y: 830, scale: 0.9, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f1 = faceAt(t, [[0, 'neutral']]);
  const p2 = poseAt(t, [
    { f: 0, p: { x: 1620, y: 830, scale: 0.9, yaw: -0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 59, p: { x: 1620, y: 830, scale: 0.9, yaw: -0.4, look: -0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 99, p: { x: 1620, y: 830, scale: 0.9, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f2 = faceAt(t, [[0, 'neutral']]);
  const camX = kf(t, [[0, 900], [len, 900]]);
  const camY = kf(t, [[0, 540], [len, 540]]);
  const zoom = kf(t, [[0, 1.0], [len, 1.06]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Classroom t={t + 3629} id="s97" />
        <Hero look={LOOKS.student} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestA} pose={{ ...p1, ...f1 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestB} pose={{ ...p2, ...f2 }} rimId="rimBlue" shadow={1} />
        <SchoolDesk x={1260} />
      </g>
    </g>
  );
};

// ---------- S98: medium, bedroom — Ch6 The Twist Nobody Mentions ----------
export const S98: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 1026.3, y: 684.1, scale: 0.9, yaw: 0.5, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 55, p: { x: 1026.3, y: 684.1, scale: 0.9, yaw: 0.5, armL: { a: 25, b: -60 }, armR: { a: 25, b: -60 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 95, p: { x: 1026.3, y: 684.1, scale: 0.9, yaw: 0.4, armL: { a: 17.5, b: -34 }, armR: { a: -7.5, b: -34 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral'], [55, 'worried']]);
  const camX = kf(t, [[0, 1026.3], [len, 1026.3]]);
  const camY = kf(t, [[0, 624.1], [len, 624.1]]);
  const zoom = kf(t, [[0, 1.8], [len, 1.9]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Bedroom t={t + 3666} id="s98" crossed={0} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
      </g>
      <Popup lines={['WHY DOES IT FEEL', 'LIKE THEY ARE?']} x={330} y={110} size={52} />
    </g>
  );
};

// ---------- S99: close-up, bedroom — Ch6 The Twist Nobody Mentions ----------
export const S99: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 1026.3, y: 684.1, scale: 0.9, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 38, p: { x: 1026.3, y: 684.1, scale: 0.9, yaw: 0.2, armL: { a: 25, b: -9 }, armR: { a: 25, b: -9 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 67, p: { x: 1026.3, y: 684.1, scale: 0.9, yaw: 0.2, armL: { a: 15, b: -9 }, armR: { a: 25, b: -9 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral'], [38, 'determined']]);
  const camX = kf(t, [[0, 1026.3], [len, 1026.3]]);
  const camY = kf(t, [[0, 529.6], [len, 529.6]]);
  const zoom = kf(t, [[0, 3.2], [len, 3.35]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Bedroom t={t + 3703} id="s99" crossed={0} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
      </g>
    </g>
  );
};

// ---------- S100: medium, bedroom — Ch6 The Twist Nobody Mentions ----------
export const S100: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 1026.3, y: 684.1, scale: 0.9, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 64, p: { x: 1026.3, y: 684.1, scale: 0.9, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 55, b: -4 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 76, p: { x: 1026.3, y: 684.1, scale: 0.9, yaw: -0.3, armL: { a: 25, b: -9 }, armR: { a: 25, b: -9 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 104, p: { x: 1026.3, y: 684.1, scale: 0.9, yaw: 0.2, armL: { a: 22.5, b: -31.5 }, armR: { a: 12.5, b: -31.5 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral'], [64, 'smug']]);
  const camX = kf(t, [[0, 1026.3], [len, 1026.3]]);
  const camY = kf(t, [[0, 624.1], [len, 624.1]]);
  const zoom = kf(t, [[0, 1.8], [len * 0.5, 1.8], [len, 1.9]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Bedroom t={t + 3740} id="s100" crossed={0} />
        <Glow x={1026.3} y={564.1} r={320} o={kf(t, [[0, 0.25], [len, 0.5]])} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
      </g>
    </g>
  );
};

// ---------- S101: wide, bedroom — Ch6 The Twist Nobody Mentions ----------
export const S101: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 1026.3, y: 684.1, scale: 0.9, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 49, p: { x: 1026.3, y: 684.1, scale: 0.9, yaw: -0.3, armL: { a: 40, b: -10 }, armR: { a: 40, b: -10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 89, p: { x: 1026.3, y: 684.1, scale: 0.9, yaw: -0.3, armL: { a: 15, b: -9 }, armR: { a: 25, b: -9 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral']]);
  const camX = kf(t, [[0, 940], [len, 940]]);
  const camY = kf(t, [[0, 560], [len, 560]]);
  const zoom = kf(t, [[0, 1.0], [len, 1.06]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Bedroom t={t + 3777} id="s101" crossed={0} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
      </g>
    </g>
  );
};

// ---------- S102: medium, bedroom — Ch6 The Twist Nobody Mentions ----------
export const S102: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 1026.3, y: 684.1, scale: 0.9, yaw: 0.5, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 50, p: { x: 1026.3, y: 684.1, scale: 0.9, yaw: 0.5, armL: { a: 40, b: -10 }, armR: { a: 40, b: -10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 90, p: { x: 1026.3, y: 684.1, scale: 0.9, yaw: 0.4, armL: { a: 15, b: -9 }, armR: { a: 25, b: -9 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral']]);
  const camX = kf(t, [[0, 1026.3], [len, 1026.3]]);
  const camY = kf(t, [[0, 624.1], [len, 624.1]]);
  const zoom = kf(t, [[0, 1.8], [len, 1.9]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Bedroom t={t + 3814} id="s102" crossed={0} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <Foreground blur={10}>
          <FgPlant x={553} y={914.1} s={1.6} />
        </Foreground>
      </g>
    </g>
  );
};

// ---------- S103: medium, bedroom — Ch6 The Twist Nobody Mentions ----------
export const S103: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 1026.3, y: 684.1, scale: 0.9, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 36, p: { x: 1026.3, y: 684.1, scale: 0.9, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: 15, b: -55 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 }, handR: 'point' } },
    { f: 65, p: { x: 1026.3, y: 684.1, scale: 0.9, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: -2.5, b: -31.5 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 }, handR: 'point' } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral'], [36, 'puzzled']]);
  const camX = kf(t, [[0, 1026.3], [len, 1026.3]]);
  const camY = kf(t, [[0, 624.1], [len, 624.1]]);
  const zoom = kf(t, [[0, 1.8], [len, 1.9]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Bedroom t={t + 3851} id="s103" crossed={0} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
      </g>
    </g>
  );
};

// ---------- S104: macro insert, study — Ch6 The Twist Nobody Mentions ----------
export const S104: React.FC<ShotProps> = ({ t, len }) => {
  const camX = kf(t, [[0, 960], [len, 960]]);
  const camY = kf(t, [[0, 650], [len, 650]]);
  const zoom = kf(t, [[0, 2.4], [len, 2.5]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Study t={t + 3888} id="s104" veil={0.44} />
        <Desk x0={560} x1={1360} y={700} />
        <Lunch x={960} y={650} s={1.2} />
      </g>
    </g>
  );
};

// ---------- S105: high angle, bedroom — Ch6 The Twist Nobody Mentions ----------
export const S105: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 1026.3, y: 684.1, scale: 0.9, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 38, p: { x: 1026.3, y: 684.1, scale: 0.9, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 15, b: -55 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 }, handR: 'point' } },
    { f: 69, p: { x: 1026.3, y: 684.1, scale: 0.9, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: -2.5, b: -31.5 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 }, handR: 'point' } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral'], [38, 'puzzled']]);
  const camX = kf(t, [[0, 1045], [len, 1045]]);
  const camY = kf(t, [[0, 560], [len, 560]]);
  const zoom = kf(t, [[0, 1.25], [len, 1.3]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Bedroom t={t + 3925} id="s105" crossed={0} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <Foreground blur={10}>
          <FgPlant x={337} y={982} s={1.6} />
        </Foreground>
      </g>
    </g>
  );
};

// ---------- S106: medium, bedroom — Ch6 The Twist Nobody Mentions ----------
export const S106: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 1026.3, y: 684.1, scale: 0.9, yaw: 0.5, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 50, p: { x: 1026.3, y: 684.1, scale: 0.9, yaw: 0.5, armL: { a: 35, b: -55 }, armR: { a: 35, b: -55 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 90, p: { x: 1026.3, y: 684.1, scale: 0.9, yaw: 0.4, armL: { a: 22.5, b: -31.5 }, armR: { a: 12.5, b: -31.5 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral'], [50, 'smug']]);
  const camX = kf(t, [[0, 1026.3], [len, 1026.3]]);
  const camY = kf(t, [[0, 624.1], [len, 624.1]]);
  const zoom = kf(t, [[0, 1.8], [len, 1.9]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Bedroom t={t + 3962} id="s106" crossed={0} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
      </g>
    </g>
  );
};

// ---------- S107: close-up, party — Ch6 The Twist Nobody Mentions ----------
export const S107: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 50, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.2, armL: { a: 35, b: -55 }, armR: { a: 35, b: -55 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 90, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.2, armL: { a: 22.5, b: -31.5 }, armR: { a: 12.5, b: -31.5 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral'], [50, 'smug']]);
  const camX = kf(t, [[0, 980], [len, 980]]);
  const camY = kf(t, [[0, 546.1], [len, 546.1]]);
  const zoom = kf(t, [[0, 3.2], [len, 3.35]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Party t={t + 3999} id="s107" veil={0.44} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
      </g>
    </g>
  );
};

// ---------- S108: low angle, party — Ch6 The Twist Nobody Mentions ----------
export const S108: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 50, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.3, armL: { a: 40, b: -10 }, armR: { a: 40, b: -10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 90, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.2, armL: { a: 15, b: -9 }, armR: { a: 25, b: -9 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral']]);
  // v8: Savitsky callback — the professor whose research this twist is, watching from
  // the edge of the party while Jake lives it out. He observes; he does not gesture.
  const pSav = poseAt(t, [
    { f: 0, p: { x: 1450, y: 760, scale: 0.9, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 50, p: { x: 1450, y: 760, scale: 0.9, yaw: -0.2, look: 0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 90, p: { x: 1450, y: 760, scale: 0.9, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const fSav = faceAt(t, [[0, 'neutral']]);
  const camX = kf(t, [[0, 980], [len, 980]]);
  const camY = kf(t, [[0, 771.3], [len, 771.3]]);
  const zoom = kf(t, [[0, 1.6], [len, 1.68]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Party t={t + 4036} id="s108" veil={0.44} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.profC} pose={{ ...pSav, ...fSav }} rimId="rimBlue" shadow={1} />
        <Foreground blur={10}>
          <FgPlant x={440} y={1020} s={1.8} />
        </Foreground>
      </g>
    </g>
  );
};

// ---------- S109: medium, party — Ch6 The Twist Nobody Mentions ----------
export const S109: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 980, y: 731.3, scale: 1.1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 50, p: { x: 980, y: 731.3, scale: 1.1, yaw: -0.3, armL: { a: 40, b: -10 }, armR: { a: 40, b: -10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 90, p: { x: 980, y: 731.3, scale: 1.1, yaw: -0.3, armL: { a: 15, b: -9 }, armR: { a: 25, b: -9 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral']]);
  const camX = kf(t, [[0, 980], [len, 980]]);
  const camY = kf(t, [[0, 671.3], [len, 671.3]]);
  const zoom = kf(t, [[0, 1.8], [len, 1.9]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Party t={t + 4073} id="s109" veil={0.44} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
      </g>
    </g>
  );
};

// ---------- S110: wide, party — Ch6 The Twist Nobody Mentions ----------
export const S110: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.5, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 42, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.5, armL: { a: 25, b: -60 }, armR: { a: 25, b: -60 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 76, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.4, armL: { a: 17.5, b: -34 }, armR: { a: -7.5, b: -34 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral'], [42, 'worried']]);
  const p1 = poseAt(t, [
    { f: 0, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 42, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.3, look: 0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 76, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f1 = faceAt(t, [[0, 'neutral']]);
  const p2 = poseAt(t, [
    { f: 0, p: { x: 1249.7, y: 719.4, scale: 1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 42, p: { x: 1249.7, y: 719.4, scale: 1, yaw: -0.3, look: -0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 76, p: { x: 1249.7, y: 719.4, scale: 1, yaw: -0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f2 = faceAt(t, [[0, 'neutral']]);
  const p3 = poseAt(t, [
    { f: 0, p: { x: 575.5, y: 719.4, scale: 1, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 42, p: { x: 575.5, y: 719.4, scale: 1, yaw: 0.3, look: 0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 76, p: { x: 575.5, y: 719.4, scale: 1, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f3 = faceAt(t, [[0, 'neutral']]);
  const camX = kf(t, [[0, 980], [len, 980]]);
  const camY = kf(t, [[0, 570], [len, 570]]);
  const zoom = kf(t, [[0, 1.0], [len, 1.06]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Party t={t + 4110} id="s110" veil={0.28} />
        {/* v8: the Detective sneaks in the background, watching — small, still,
            at the frame edge among the crowd, never centre. */}
        <Hero look={LOOKS.detective} pose={{ ...basePose, x: 350, y: 747, scale: 0.8, yaw: 0.25 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestA} pose={{ ...p1, ...f1 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestB} pose={{ ...p2, ...f2 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestC} pose={{ ...p3, ...f3 }} rimId="rimBlue" shadow={1} />
      </g>
      <Popup lines={['DO THEY JUDGE US', 'AS HARSHLY?']} x={960} y={120} size={52} />
    </g>
  );
};

// ---------- S111: over-the-shoulder, party — Ch6 The Twist Nobody Mentions ----------
export const S111: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 51, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.2, armL: { a: 40, b: -10 }, armR: { a: 40, b: -10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 91, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.2, armL: { a: 15, b: -9 }, armR: { a: 25, b: -9 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral']]);
  const camX = kf(t, [[0, 980], [len, 980]]);
  const camY = kf(t, [[0, 671.3], [len, 671.3]]);
  const zoom = kf(t, [[0, 1.5], [len, 1.55]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Party t={t + 4147} id="s111" veil={0.44} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <Foreground blur={16}>
          <FgPlant x={540} y={1020} s={2.0} />
        </Foreground>
      </g>
    </g>
  );
};

// ---------- S112: medium, party — Ch6 The Twist Nobody Mentions ----------
export const S112: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 51, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.3, armL: { a: 25, b: -60 }, armR: { a: 25, b: -60 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 91, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.2, armL: { a: 17.5, b: -34 }, armR: { a: -7.5, b: -34 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral'], [51, 'worried']]);
  const camX = kf(t, [[0, 900], [len, 900]]);
  const camY = kf(t, [[0, 671.3], [len, 671.3]]);
  const zoom = kf(t, [[0, 1.8], [len, 1.9]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Party t={t + 4184} id="s112" veil={0.44} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
      </g>
    </g>
  );
};

// ---------- S113: wide, party — Ch6 The Twist Nobody Mentions ----------
export const S113: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 980, y: 731.3, scale: 1.1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 49, p: { x: 980, y: 731.3, scale: 1.1, yaw: -0.3, armL: { a: 40, b: -10 }, armR: { a: 40, b: -10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 89, p: { x: 980, y: 731.3, scale: 1.1, yaw: -0.3, armL: { a: 15, b: -9 }, armR: { a: 25, b: -9 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral']]);
  const p1 = poseAt(t, [
    { f: 0, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 49, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.3, look: 0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 89, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f1 = faceAt(t, [[0, 'neutral']]);
  const p2 = poseAt(t, [
    { f: 0, p: { x: 1249.7, y: 719.4, scale: 1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 49, p: { x: 1249.7, y: 719.4, scale: 1, yaw: -0.3, look: -0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 89, p: { x: 1249.7, y: 719.4, scale: 1, yaw: -0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f2 = faceAt(t, [[0, 'neutral']]);
  const p3 = poseAt(t, [
    { f: 0, p: { x: 575.5, y: 719.4, scale: 1, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 49, p: { x: 575.5, y: 719.4, scale: 1, yaw: 0.3, look: 0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 89, p: { x: 575.5, y: 719.4, scale: 1, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f3 = faceAt(t, [[0, 'neutral']]);
  const camX = kf(t, [[0, 980], [len, 980]]);
  const camY = kf(t, [[0, 570], [len, 570]]);
  const zoom = kf(t, [[0, 1.0], [len, 1.06]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Party t={t + 4221} id="s113" veil={0.28} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestA} pose={{ ...p1, ...f1 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestB} pose={{ ...p2, ...f2 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestC} pose={{ ...p3, ...f3 }} rimId="rimBlue" shadow={1} />
      </g>
    </g>
  );
};

// ---------- S114: medium, party — Ch6 The Twist Nobody Mentions ----------
export const S114: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.5, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 58, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.5, armL: { a: 40, b: -10 }, armR: { a: 40, b: -10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 98, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.4, armL: { a: 15, b: -9 }, armR: { a: 25, b: -9 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral']]);
  const camX = kf(t, [[0, 1060], [len, 1060]]);
  const camY = kf(t, [[0, 671.3], [len, 671.3]]);
  const zoom = kf(t, [[0, 1.8], [len, 1.9]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Party t={t + 4258} id="s114" veil={0.44} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <Foreground blur={10}>
          <FgPlant x={506.7} y={1020} s={1.8} />
        </Foreground>
      </g>
    </g>
  );
};

// ---------- S115: close-up, party — Ch6 The Twist Nobody Mentions ----------
export const S115: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 59, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: 120, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 99, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: 55, b: -4 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral'], [59, 'happy']]);
  const camX = kf(t, [[0, 980], [len, 980]]);
  const camY = kf(t, [[0, 546.1], [len, 546.1]]);
  const zoom = kf(t, [[0, 3.2], [len, 3.35]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Party t={t + 4295} id="s115" veil={0.44} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
      </g>
    </g>
  );
};

// ---------- S116: medium, party — Ch6 The Twist Nobody Mentions ----------
export const S116: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 49, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.3, armL: { a: 40, b: -10 }, armR: { a: 40, b: -10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 89, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.2, armL: { a: 15, b: -9 }, armR: { a: 25, b: -9 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral']]);
  const camX = kf(t, [[0, 980], [len, 980]]);
  const camY = kf(t, [[0, 620], [len, 620]]);
  const zoom = kf(t, [[0, 1.5], [len, 1.6]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Party t={t + 4332} id="s116" veil={0.44} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
      </g>
    </g>
  );
};

// ---------- S117: wide, party — Ch6 The Twist Nobody Mentions ----------
export const S117: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 980, y: 731.3, scale: 1.1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 56, p: { x: 980, y: 731.3, scale: 1.1, yaw: -0.3, armL: { a: 25, b: -60 }, armR: { a: 25, b: -60 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 96, p: { x: 980, y: 731.3, scale: 1.1, yaw: -0.3, armL: { a: 17.5, b: -34 }, armR: { a: -7.5, b: -34 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral'], [56, 'worried']]);
  const p1 = poseAt(t, [
    { f: 0, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 56, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.3, look: 0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 96, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f1 = faceAt(t, [[0, 'neutral']]);
  const p2 = poseAt(t, [
    { f: 0, p: { x: 1249.7, y: 719.4, scale: 1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 56, p: { x: 1249.7, y: 719.4, scale: 1, yaw: -0.3, look: -0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 96, p: { x: 1249.7, y: 719.4, scale: 1, yaw: -0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f2 = faceAt(t, [[0, 'neutral']]);
  const p3 = poseAt(t, [
    { f: 0, p: { x: 575.5, y: 719.4, scale: 1, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 56, p: { x: 575.5, y: 719.4, scale: 1, yaw: 0.3, look: 0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 96, p: { x: 575.5, y: 719.4, scale: 1, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f3 = faceAt(t, [[0, 'neutral']]);
  const camX = kf(t, [[0, 980], [len, 980]]);
  const camY = kf(t, [[0, 570], [len, 570]]);
  const zoom = kf(t, [[0, 1.0], [len, 1.06]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Party t={t + 4369} id="s117" veil={0.28} />
        {/* v8: the Detective sneaks in the background, watching — small, still,
            at the frame edge among the crowd, never centre. */}
        <Hero look={LOOKS.detective} pose={{ ...basePose, x: 360, y: 747, scale: 0.8, yaw: 0.25 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestA} pose={{ ...p1, ...f1 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestB} pose={{ ...p2, ...f2 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestC} pose={{ ...p3, ...f3 }} rimId="rimBlue" shadow={1} />
        <Foreground blur={10}>
          <FgPlant x={80} y={1020} s={1.8} />
        </Foreground>
      </g>
    </g>
  );
};

// ---------- S118: two-shot, classroom — Ch7 Rule Three: The Spotlight Dims ----------
export const S118: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 1260, y: 760, scale: 1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 62, p: { x: 1260, y: 760, scale: 1, yaw: -0.3, armL: { a: 40, b: -10 }, armR: { a: 40, b: -10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 75, p: { x: 1260, y: 760, scale: 1, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 120, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 102, p: { x: 1260, y: 760, scale: 1, yaw: -0.3, armL: { a: 15, b: -9 }, armR: { a: 25, b: -9 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral'], [62, 'determined']]);
  const p1 = poseAt(t, [
    { f: 0, p: { x: 900, y: 840, scale: 0.9, yaw: 0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 62, p: { x: 900, y: 840, scale: 0.9, yaw: 0.4, look: 0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 75, p: { x: 900, y: 840, scale: 0.9, yaw: -0.4, armL: { a: 40, b: -10 }, armR: { a: 40, b: -10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 102, p: { x: 900, y: 840, scale: 0.9, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f1 = faceAt(t, [[0, 'neutral']]);
  const camX = kf(t, [[0, 1080], [len, 1080]]);
  const camY = kf(t, [[0, 670], [len, 670]]);
  const zoom = kf(t, [[0, 1.35], [len * 0.5, 1.4], [len, 1.4]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Classroom t={t + 4406} id="s118" board={<text x={740} y={380} textAnchor="middle" fontFamily={FONT.hand} fontSize={72} fill="#EDEFE6">RULE THREE</text>} />
        <Glow x={1260} y={640} r={320} o={kf(t, [[0, 0.25], [len, 0.5]])} />
        <Hero look={LOOKS.student} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestA} pose={{ ...p1, ...f1 }} rimId="rimBlue" shadow={1} />
        <SchoolDesk x={1260} />
      </g>
    </g>
  );
};

// ---------- S119: medium, classroom — Ch7 Rule Three: The Spotlight Dims ----------
export const S119: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 1260, y: 760, scale: 1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 52, p: { x: 1260, y: 760, scale: 1, yaw: -0.3, armL: { a: 40, b: -10 }, armR: { a: 40, b: -10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 92, p: { x: 1260, y: 760, scale: 1, yaw: -0.3, armL: { a: 15, b: -9 }, armR: { a: 25, b: -9 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral']]);
  const camX = kf(t, [[0, 1260], [len, 1260]]);
  const camY = kf(t, [[0, 700], [len, 700]]);
  const zoom = kf(t, [[0, 1.8], [len, 1.9]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Classroom t={t + 4443} id="s119" />
        <Hero look={LOOKS.student} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <SchoolDesk x={1260} />
      </g>
    </g>
  );
};

// ---------- S120: two-shot, classroom — Ch7 Rule Three: The Spotlight Dims ----------
export const S120: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = walkPose(kf(t, [[0, 500], [len, 1150]]), t * 0.6 + 1.2, 900, 1, {}, 1);
  const f0 = faceAt(t, [[0, 'neutral']]);
  const p1 = poseAt(t, [
    { f: 0, p: { x: 1620, y: 830, scale: 0.9, yaw: -0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 41, p: { x: 1620, y: 830, scale: 0.9, yaw: -0.4, look: -0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 75, p: { x: 1620, y: 830, scale: 0.9, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f1 = faceAt(t, [[0, 'neutral']]);
  const camX = kf(t, [[0, 300], [len, 1150]]);
  const camY = kf(t, [[0, 670], [len, 670]]);
  const zoom = kf(t, [[0, 1.35], [len, 1.4]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Classroom t={t + 4480} id="s120" />
        <Hero look={LOOKS.student} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestB} pose={{ ...p1, ...f1 }} rimId="rimBlue" shadow={1} />
        <SchoolDesk x={1260} />
      </g>
    </g>
  );
};

// ---------- S121: high angle, classroom — Ch7 Rule Three: The Spotlight Dims ----------
export const S121: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 1260, y: 760, scale: 1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 39, p: { x: 1260, y: 760, scale: 1, yaw: -0.3, armL: { a: 25, b: -60 }, armR: { a: 25, b: -60 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 70, p: { x: 1260, y: 760, scale: 1, yaw: -0.3, armL: { a: 17.5, b: -34 }, armR: { a: -7.5, b: -34 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral'], [39, 'worried']]);
  const p1 = poseAt(t, [
    { f: 0, p: { x: 520, y: 830, scale: 0.9, yaw: 0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 39, p: { x: 520, y: 830, scale: 0.9, yaw: 0.4, look: 0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 70, p: { x: 520, y: 830, scale: 0.9, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f1 = faceAt(t, [[0, 'neutral']]);
  const p2 = poseAt(t, [
    { f: 0, p: { x: 1620, y: 830, scale: 0.9, yaw: -0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 39, p: { x: 1620, y: 830, scale: 0.9, yaw: -0.4, look: -0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 70, p: { x: 1620, y: 830, scale: 0.9, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f2 = faceAt(t, [[0, 'neutral']]);
  const camX = kf(t, [[0, 1260], [len, 1260]]);
  const camY = kf(t, [[0, 520], [len, 520]]);
  const zoom = kf(t, [[0, 1.25], [len, 1.3]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Classroom t={t + 4517} id="s121" />
        <Hero look={LOOKS.student} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestA} pose={{ ...p1, ...f1 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestB} pose={{ ...p2, ...f2 }} rimId="rimBlue" shadow={1} />
        <SchoolDesk x={1260} />
      </g>
    </g>
  );
};

// ---------- S122: medium, schematic — Ch7 Rule Three: The Spotlight Dims ----------
export const S122: React.FC<ShotProps> = ({ t, len }) => {
  const camX = kf(t, [[0, 900], [len, 900]]);
  const camY = kf(t, [[0, 640], [len, 640]]);
  const zoom = kf(t, [[0, 1.5], [len, 1.56]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Schematic t={t + 4554} id="s122" />
        <SchLabel x={1300} y={380} t={t} text="GUESSED" size={36} color="#FF8A3D" />
        <CountUp x={1300} y={480} t={t} to={51} size={120} color="#FF8A3D" suffix="%" />
      </g>
    </g>
  );
};

// ---------- S123: two-shot, classroom — Ch7 Rule Three: The Spotlight Dims ----------
export const S123: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 1260, y: 760, scale: 1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 50, p: { x: 1260, y: 760, scale: 1, yaw: -0.3, armL: { a: 40, b: -10 }, armR: { a: 40, b: -10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 90, p: { x: 1260, y: 760, scale: 1, yaw: -0.3, armL: { a: 15, b: -9 }, armR: { a: 25, b: -9 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral']]);
  const p1 = poseAt(t, [
    { f: 0, p: { x: 900, y: 840, scale: 0.9, yaw: 0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 50, p: { x: 900, y: 840, scale: 0.9, yaw: 0.4, look: 0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 90, p: { x: 900, y: 840, scale: 0.9, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f1 = faceAt(t, [[0, 'neutral']]);
  const camX = kf(t, [[0, 1080], [len, 1080]]);
  const camY = kf(t, [[0, 670], [len, 670]]);
  const zoom = kf(t, [[0, 1.35], [len, 1.4]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Classroom t={t + 4591} id="s123" />
        <Hero look={LOOKS.student} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestA} pose={{ ...p1, ...f1 }} rimId="rimBlue" shadow={1} />
        <SchoolDesk x={1260} />
        <Foreground blur={10}>
          <FgPlant x={428.9} y={1020} s={1.8} />
        </Foreground>
      </g>
    </g>
  );
};

// ---------- S124: low angle, classroom — Ch7 Rule Three: The Spotlight Dims ----------
export const S124: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 1260, y: 760, scale: 1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 41, p: { x: 1260, y: 760, scale: 1, yaw: -0.3, armL: { a: 25, b: -60 }, armR: { a: 25, b: -60 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 73, p: { x: 1260, y: 760, scale: 1, yaw: -0.3, armL: { a: 17.5, b: -34 }, armR: { a: -7.5, b: -34 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral'], [41, 'worried']]);
  const camX = kf(t, [[0, 1260], [len, 1260]]);
  const camY = kf(t, [[0, 800], [len, 800]]);
  const zoom = kf(t, [[0, 1.6], [len, 1.68]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Classroom t={t + 4628} id="s124" />
        <Hero look={LOOKS.student} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <SchoolDesk x={1260} />
      </g>
    </g>
  );
};

// ---------- S125: medium, schematic — Ch7 Rule Three: The Spotlight Dims ----------
export const S125: React.FC<ShotProps> = ({ t, len }) => {
  const camX = kf(t, [[0, 900], [len, 900]]);
  const camY = kf(t, [[0, 640], [len, 640]]);
  const zoom = kf(t, [[0, 1.5], [len * 0.5, 1.5], [len, 1.56]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Schematic t={t + 4665} id="s125" />
        <Glow x={975} y={420} r={320} o={kf(t, [[0, 0.25], [len, 0.5]])} />
        <SchLabel x={1300} y={380} t={t} text="AFTER 15 MINUTES" size={36} color="#FF8A3D" />
        <CountUp x={1300} y={480} t={t} to={37} size={120} color="#FF8A3D" suffix="%" />
      </g>
    </g>
  );
};

// ---------- S126: wide, schematic — Ch7 Rule Three: The Spotlight Dims ----------
export const S126: React.FC<ShotProps> = ({ t, len }) => {
  const camX = kf(t, [[0, 960], [len, 960]]);
  const camY = kf(t, [[0, 540], [len, 540]]);
  const zoom = kf(t, [[0, 1.0], [len, 1.06]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Schematic t={t + 4702} id="s126" />
        <SchLabel x={1300} y={380} t={t} text="CUT BY A THIRD" size={36} color="#FF8A3D" />
        <CountUp x={1300} y={480} t={t} to={33} size={120} color="#FF8A3D" suffix="%" />
        <Foreground blur={10}>
          <FgPlant x={60} y={1070} s={1.6} />
        </Foreground>
      </g>
    </g>
  );
};

// ---------- S127: over-the-shoulder, classroom — Ch7 Rule Three: The Spotlight Dims ----------
export const S127: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 1260, y: 760, scale: 1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 46, p: { x: 1260, y: 760, scale: 1, yaw: -0.3, armL: { a: 40, b: -10 }, armR: { a: 40, b: -10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 84, p: { x: 1260, y: 760, scale: 1, yaw: -0.3, armL: { a: 15, b: -9 }, armR: { a: 25, b: -9 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral']]);
  const camX = kf(t, [[0, 1260], [len, 1260]]);
  const camY = kf(t, [[0, 700], [len, 700]]);
  const zoom = kf(t, [[0, 1.5], [len, 1.55]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Classroom t={t + 4739} id="s127" />
        <Hero look={LOOKS.student} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <SchoolDesk x={1260} />
      </g>
    </g>
  );
};

// ---------- S128: medium, classroom — Ch7 Rule Three: The Spotlight Dims ----------
export const S128: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 1260, y: 760, scale: 1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 35, p: { x: 1260, y: 760, scale: 1, yaw: -0.3, armL: { a: 25, b: -9 }, armR: { a: 25, b: -9 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 63, p: { x: 1260, y: 760, scale: 1, yaw: -0.3, armL: { a: 15, b: -9 }, armR: { a: 25, b: -9 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral']]);
  const camX = kf(t, [[0, 1260], [len, 1260]]);
  const camY = kf(t, [[0, 700], [len, 700]]);
  const zoom = kf(t, [[0, 1.8], [len, 1.9]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Classroom t={t + 4776} id="s128" />
        <Hero look={LOOKS.student} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <SchoolDesk x={1260} />
      </g>
    </g>
  );
};

// ---------- S129: wide, classroom — Ch7 Rule Three: The Spotlight Dims ----------
export const S129: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 1260, y: 760, scale: 1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 59, p: { x: 1260, y: 760, scale: 1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 120, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 99, p: { x: 1260, y: 760, scale: 1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 55, b: -4 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral'], [59, 'happy']]);
  const p1 = poseAt(t, [
    { f: 0, p: { x: 520, y: 830, scale: 0.9, yaw: 0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 59, p: { x: 520, y: 830, scale: 0.9, yaw: 0.4, look: 0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 99, p: { x: 520, y: 830, scale: 0.9, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f1 = faceAt(t, [[0, 'neutral']]);
  const p2 = poseAt(t, [
    { f: 0, p: { x: 1620, y: 830, scale: 0.9, yaw: -0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 59, p: { x: 1620, y: 830, scale: 0.9, yaw: -0.4, look: -0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 99, p: { x: 1620, y: 830, scale: 0.9, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f2 = faceAt(t, [[0, 'neutral']]);
  const camX = kf(t, [[0, 900], [len, 900]]);
  const camY = kf(t, [[0, 540], [len, 540]]);
  const zoom = kf(t, [[0, 1.0], [len, 1.06]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Classroom t={t + 4813} id="s129" />
        <Hero look={LOOKS.student} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestA} pose={{ ...p1, ...f1 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestB} pose={{ ...p2, ...f2 }} rimId="rimBlue" shadow={1} />
        <SchoolDesk x={1260} />
        <Foreground blur={10}>
          <FgPlant x={0} y={1020} s={1.8} />
        </Foreground>
      </g>
    </g>
  );
};

// ---------- S130: medium, classroom — Ch7 Rule Three: The Spotlight Dims ----------
export const S130: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 1260, y: 760, scale: 1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 51, p: { x: 1260, y: 760, scale: 1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 120, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 91, p: { x: 1260, y: 760, scale: 1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 55, b: -4 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral'], [51, 'happy']]);
  const camX = kf(t, [[0, 1260], [len, 1260]]);
  const camY = kf(t, [[0, 700], [len, 700]]);
  const zoom = kf(t, [[0, 1.8], [len, 1.9]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Classroom t={t + 4850} id="s130" />
        <Hero look={LOOKS.student} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <SchoolDesk x={1260} />
      </g>
    </g>
  );
};

// ---------- S131: close-up, party — Ch7 Rule Three: The Spotlight Dims ----------
export const S131: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 50, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.2, armL: { a: 40, b: -10 }, armR: { a: 40, b: -10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 90, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.2, armL: { a: 15, b: -9 }, armR: { a: 25, b: -9 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral']]);
  const camX = kf(t, [[0, 980], [len, 980]]);
  const camY = kf(t, [[0, 546.1], [len, 546.1]]);
  const zoom = kf(t, [[0, 3.2], [len, 3.35]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Party t={t + 4887} id="s131" veil={0.44} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
      </g>
    </g>
  );
};

// ---------- S132: medium, party — Ch7 Rule Three: The Spotlight Dims ----------
export const S132: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 56, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.3, armL: { a: 40, b: -10 }, armR: { a: 40, b: -10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 96, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.2, armL: { a: 15, b: -9 }, armR: { a: 25, b: -9 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral']]);
  const camX = kf(t, [[0, 980], [len, 980]]);
  const camY = kf(t, [[0, 671.3], [len, 671.3]]);
  const zoom = kf(t, [[0, 1.8], [len, 1.9]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Party t={t + 4924} id="s132" veil={0.44} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <Foreground blur={10}>
          <FgPlant x={506.7} y={1020} s={1.8} />
        </Foreground>
      </g>
    </g>
  );
};

// ---------- S133: wide, party — Ch7 Rule Three: The Spotlight Dims ----------
export const S133: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 980, y: 731.3, scale: 1.1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 59, p: { x: 980, y: 731.3, scale: 1.1, yaw: -0.3, armL: { a: 40, b: -10 }, armR: { a: 40, b: -10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 99, p: { x: 980, y: 731.3, scale: 1.1, yaw: -0.3, armL: { a: 15, b: -9 }, armR: { a: 25, b: -9 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral']]);
  const p1 = poseAt(t, [
    { f: 0, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 59, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.3, look: 0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 99, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f1 = faceAt(t, [[0, 'neutral']]);
  const p2 = poseAt(t, [
    { f: 0, p: { x: 1249.7, y: 719.4, scale: 1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 59, p: { x: 1249.7, y: 719.4, scale: 1, yaw: -0.3, look: -0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 99, p: { x: 1249.7, y: 719.4, scale: 1, yaw: -0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f2 = faceAt(t, [[0, 'neutral']]);
  const p3 = poseAt(t, [
    { f: 0, p: { x: 575.5, y: 719.4, scale: 1, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 59, p: { x: 575.5, y: 719.4, scale: 1, yaw: 0.3, look: 0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 99, p: { x: 575.5, y: 719.4, scale: 1, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f3 = faceAt(t, [[0, 'neutral']]);
  const camX = kf(t, [[0, 980], [len, 980]]);
  const camY = kf(t, [[0, 570], [len, 570]]);
  const zoom = kf(t, [[0, 1.0], [len, 1.06]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Party t={t + 4961} id="s133" veil={0.28} />
        {/* v8: the Detective sneaks in the background, watching — small, still,
            at the frame edge among the crowd, never centre. */}
        <Hero look={LOOKS.detective} pose={{ ...basePose, x: 350, y: 747, scale: 0.8, yaw: 0.25 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestA} pose={{ ...p1, ...f1 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestB} pose={{ ...p2, ...f2 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestC} pose={{ ...p3, ...f3 }} rimId="rimBlue" shadow={1} />
      </g>
    </g>
  );
};

// ---------- S134: two-shot, party — Ch7 Rule Three: The Spotlight Dims ----------
export const S134: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.5, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 51, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.5, armL: { a: 40, b: -10 }, armR: { a: 40, b: -10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 91, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.4, armL: { a: 15, b: -9 }, armR: { a: 25, b: -9 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral']]);
  const p1 = poseAt(t, [
    { f: 0, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 51, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.3, look: 0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 91, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f1 = faceAt(t, [[0, 'neutral']]);
  const camX = kf(t, [[0, 845.1], [len, 845.1]]);
  const camY = kf(t, [[0, 595.3], [len, 595.3]]);
  const zoom = kf(t, [[0, 1.35], [len, 1.4]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Party t={t + 4998} id="s134" veil={0.44} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestA} pose={{ ...p1, ...f1 }} rimId="rimBlue" shadow={1} />
      </g>
    </g>
  );
};

// ---------- S135: medium, party — Ch7 Rule Three: The Spotlight Dims ----------
export const S135: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 46, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: 55, b: -4 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 84, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.2, armL: { a: 15, b: -9 }, armR: { a: 25, b: -9 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral']]);
  const camX = kf(t, [[0, 980], [len, 980]]);
  const camY = kf(t, [[0, 700], [len, 700]]);
  const zoom = kf(t, [[0, 1.35], [len, 1.45]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Party t={t + 5035} id="s135" veil={0.44} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <Foreground blur={10}>
          <FgPlant x={506.7} y={1020} s={1.8} />
        </Foreground>
      </g>
    </g>
  );
};

// ---------- S136: macro insert, study — Ch7 Rule Three: The Spotlight Dims ----------
export const S136: React.FC<ShotProps> = ({ t, len }) => {
  const camX = kf(t, [[0, 960], [len, 960]]);
  const camY = kf(t, [[0, 650], [len, 650]]);
  const zoom = kf(t, [[0, 2.4], [len, 2.5]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Study t={t + 5072} id="s136" veil={0.44} />
        <Desk x0={560} x1={1360} y={700} />
        <MessyDesk x={960} y={650} s={1.1} />
      </g>
    </g>
  );
};

// ---------- S137: high angle, exterior — Ch7 Rule Three: The Spotlight Dims ----------
export const S137: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 960, y: 700, scale: 1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 49, p: { x: 960, y: 700, scale: 1, yaw: -0.3, armL: { a: 40, b: -10 }, armR: { a: 40, b: -10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 89, p: { x: 960, y: 700, scale: 1, yaw: -0.3, armL: { a: 15, b: -9 }, armR: { a: 25, b: -9 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral']]);
  const camX = kf(t, [[0, 960], [len, 960]]);
  const camY = kf(t, [[0, 600], [len, 600]]);
  const zoom = kf(t, [[0, 1.25], [len, 1.3]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Exterior t={t + 5109} id="s137" />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
      </g>
    </g>
  );
};

// ---------- S138: medium, party — Ch7 Rule Three: The Spotlight Dims ----------
export const S138: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.5, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 51, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.5, armL: { a: 40, b: -10 }, armR: { a: 40, b: -10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 91, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.4, armL: { a: 15, b: -9 }, armR: { a: 25, b: -9 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral']]);
  const camX = kf(t, [[0, 980], [len, 980]]);
  const camY = kf(t, [[0, 600], [len, 600]]);
  const zoom = kf(t, [[0, 2.2], [len, 2.3]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Party t={t + 5146} id="s138" veil={0.44} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <Foreground blur={10}>
          <FgPlant x={506.7} y={1020} s={1.8} />
        </Foreground>
      </g>
    </g>
  );
};

// ---------- S139: close-up, party — Ch7 Rule Three: The Spotlight Dims ----------
export const S139: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 50, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.2, armL: { a: 40, b: -10 }, armR: { a: 40, b: -10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 90, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.2, armL: { a: 15, b: -9 }, armR: { a: 25, b: -9 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral'], [50, 'determined']]);
  const camX = kf(t, [[0, 980], [len, 980]]);
  const camY = kf(t, [[0, 546.1], [len, 546.1]]);
  const zoom = kf(t, [[0, 3.2], [len, 3.35]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Party t={t + 5183} id="s139" veil={0.44} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
      </g>
    </g>
  );
};

// ---------- S140: low angle, party — Ch8 How To Beat It ----------
export const S140: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 54, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.3, armL: { a: 40, b: -10 }, armR: { a: 40, b: -10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 94, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.2, armL: { a: 15, b: -9 }, armR: { a: 25, b: -9 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral'], [54, 'determined']]);
  const camX = kf(t, [[0, 980], [len, 980]]);
  const camY = kf(t, [[0, 771.3], [len, 771.3]]);
  const zoom = kf(t, [[0, 1.6], [len, 1.68]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Party t={t + 5220} id="s140" veil={0.44} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
      </g>
      <Popup lines={['HOW DO YOU', 'BEAT IT?']} x={140} y={960} size={40} />
    </g>
  );
};

// ---------- S141: medium, party — Ch8 How To Beat It ----------
export const S141: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 980, y: 731.3, scale: 1.1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 51, p: { x: 980, y: 731.3, scale: 1.1, yaw: -0.3, armL: { a: 40, b: -10 }, armR: { a: 40, b: -10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 91, p: { x: 980, y: 731.3, scale: 1.1, yaw: -0.3, armL: { a: 15, b: -9 }, armR: { a: 25, b: -9 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral'], [51, 'determined']]);
  const camX = kf(t, [[0, 980], [len, 980]]);
  const camY = kf(t, [[0, 671.3], [len, 671.3]]);
  const zoom = kf(t, [[0, 1.8], [len, 1.9]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Party t={t + 5257} id="s141" veil={0.44} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <Foreground blur={10}>
          <FgPlant x={506.7} y={1020} s={1.8} />
        </Foreground>
      </g>
    </g>
  );
};

// ---------- S142: wide, party — Ch8 How To Beat It ----------
export const S142: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.5, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 50, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.5, armL: { a: 5, b: 0 }, armR: { a: 15, b: -55 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 }, handR: 'point' } },
    { f: 90, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.4, armL: { a: 5, b: 0 }, armR: { a: -2.5, b: -31.5 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 }, handR: 'point' } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral'], [50, 'puzzled']]);
  const p1 = poseAt(t, [
    { f: 0, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 50, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.3, look: 0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 90, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f1 = faceAt(t, [[0, 'neutral']]);
  const p2 = poseAt(t, [
    { f: 0, p: { x: 1249.7, y: 719.4, scale: 1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 50, p: { x: 1249.7, y: 719.4, scale: 1, yaw: -0.3, look: -0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 90, p: { x: 1249.7, y: 719.4, scale: 1, yaw: -0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f2 = faceAt(t, [[0, 'neutral']]);
  const p3 = poseAt(t, [
    { f: 0, p: { x: 575.5, y: 719.4, scale: 1, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 50, p: { x: 575.5, y: 719.4, scale: 1, yaw: 0.3, look: 0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 90, p: { x: 575.5, y: 719.4, scale: 1, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f3 = faceAt(t, [[0, 'neutral']]);
  const camX = kf(t, [[0, 980], [len, 980]]);
  const camY = kf(t, [[0, 570], [len, 570]]);
  const zoom = kf(t, [[0, 1.0], [len, 1.06]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Party t={t + 5294} id="s142" veil={0.28} />
        {/* v8: the Detective sneaks in the background, watching — small, still,
            at the frame edge among the crowd, never centre. */}
        <Hero look={LOOKS.detective} pose={{ ...basePose, x: 320, y: 747, scale: 0.8, yaw: 0.25 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestA} pose={{ ...p1, ...f1 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestB} pose={{ ...p2, ...f2 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestC} pose={{ ...p3, ...f3 }} rimId="rimBlue" shadow={1} />
      </g>
    </g>
  );
};

// ---------- S143: over-the-shoulder, party — Ch8 How To Beat It ----------
export const S143: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 50, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.2, armL: { a: 40, b: -10 }, armR: { a: 40, b: -10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 90, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.2, armL: { a: 15, b: -9 }, armR: { a: 25, b: -9 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral']]);
  const camX = kf(t, [[0, 980], [len, 980]]);
  const camY = kf(t, [[0, 671.3], [len, 671.3]]);
  const zoom = kf(t, [[0, 1.5], [len, 1.55]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Party t={t + 5331} id="s143" veil={0.44} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <Foreground blur={16}>
          <FgPlant x={540} y={1020} s={2.0} />
        </Foreground>
      </g>
    </g>
  );
};

// ---------- S144: medium, party — Ch8 How To Beat It ----------
export const S144: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 51, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.3, armL: { a: 40, b: -10 }, armR: { a: 40, b: -10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 91, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.2, armL: { a: 15, b: -9 }, armR: { a: 25, b: -9 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral']]);
  const camX = kf(t, [[0, 900], [len, 900]]);
  const camY = kf(t, [[0, 671.3], [len, 671.3]]);
  const zoom = kf(t, [[0, 1.8], [len, 1.9]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Party t={t + 5368} id="s144" veil={0.44} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <Foreground blur={10}>
          <FgPlant x={506.7} y={1020} s={1.8} />
        </Foreground>
      </g>
    </g>
  );
};

// ---------- S145: wide, party — Ch8 How To Beat It ----------
export const S145: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 980, y: 731.3, scale: 1.1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 49, p: { x: 980, y: 731.3, scale: 1.1, yaw: -0.3, armL: { a: 40, b: -10 }, armR: { a: 40, b: -10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 89, p: { x: 980, y: 731.3, scale: 1.1, yaw: -0.3, armL: { a: 15, b: -9 }, armR: { a: 25, b: -9 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral'], [49, 'determined']]);
  const p1 = poseAt(t, [
    { f: 0, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 49, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.3, look: 0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 89, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f1 = faceAt(t, [[0, 'neutral']]);
  const p2 = poseAt(t, [
    { f: 0, p: { x: 1249.7, y: 719.4, scale: 1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 49, p: { x: 1249.7, y: 719.4, scale: 1, yaw: -0.3, look: -0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 89, p: { x: 1249.7, y: 719.4, scale: 1, yaw: -0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f2 = faceAt(t, [[0, 'neutral']]);
  const p3 = poseAt(t, [
    { f: 0, p: { x: 575.5, y: 719.4, scale: 1, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 49, p: { x: 575.5, y: 719.4, scale: 1, yaw: 0.3, look: 0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 89, p: { x: 575.5, y: 719.4, scale: 1, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f3 = faceAt(t, [[0, 'neutral']]);
  const camX = kf(t, [[0, 980], [len, 980]]);
  const camY = kf(t, [[0, 570], [len, 570]]);
  const zoom = kf(t, [[0, 1.0], [len, 1.06]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Party t={t + 5405} id="s145" veil={0.28} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestA} pose={{ ...p1, ...f1 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestB} pose={{ ...p2, ...f2 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestC} pose={{ ...p3, ...f3 }} rimId="rimBlue" shadow={1} />
      </g>
    </g>
  );
};

// ---------- S146: medium, party — Ch8 How To Beat It ----------
export const S146: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.5, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 52, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.5, armL: { a: 40, b: -10 }, armR: { a: 40, b: -10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 92, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.4, armL: { a: 15, b: -9 }, armR: { a: 25, b: -9 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral'], [52, 'determined']]);
  const camX = kf(t, [[0, 1060], [len, 1060]]);
  const camY = kf(t, [[0, 671.3], [len, 671.3]]);
  const zoom = kf(t, [[0, 1.8], [len, 1.9]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Party t={t + 5442} id="s146" veil={0.44} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
      </g>
    </g>
  );
};

// ---------- S147: close-up, party — Ch8 How To Beat It ----------
export const S147: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 61, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: 120, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 72, p: { x: 980, y: 731.3, scale: 1.1, yaw: -0.2, armL: { a: 40, b: -10 }, armR: { a: 40, b: -10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 101, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: 55, b: -4 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral'], [61, 'happy']]);
  const camX = kf(t, [[0, 980], [len, 980]]);
  const camY = kf(t, [[0, 546.1], [len, 546.1]]);
  const zoom = kf(t, [[0, 3.2], [len * 0.5, 3.2], [len, 3.35]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Party t={t + 5479} id="s147" veil={0.44} />
        <Glow x={980} y={611.3} r={320} o={kf(t, [[0, 0.25], [len, 0.5]])} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
      </g>
    </g>
  );
};

// ---------- S148: medium, party — Ch8 How To Beat It ----------
export const S148: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 34, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 120, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 60, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: 55, b: -4 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral'], [34, 'happy']]);
  const camX = kf(t, [[0, 980], [len, 980]]);
  const camY = kf(t, [[0, 620], [len, 620]]);
  const zoom = kf(t, [[0, 1.5], [len, 1.6]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Party t={t + 5516} id="s148" veil={0.44} />
        <LobsterSign />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
      </g>
    </g>
  );
};

// ---------- S149: wide, party — Ch8 How To Beat It ----------
export const S149: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 980, y: 731.3, scale: 1.1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 54, p: { x: 980, y: 731.3, scale: 1.1, yaw: -0.3, armL: { a: 40, b: -10 }, armR: { a: 40, b: -10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 94, p: { x: 980, y: 731.3, scale: 1.1, yaw: -0.3, armL: { a: 15, b: -9 }, armR: { a: 25, b: -9 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral'], [54, 'determined']]);
  const p1 = poseAt(t, [
    { f: 0, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 54, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.3, look: 0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 94, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f1 = faceAt(t, [[0, 'neutral']]);
  const p2 = poseAt(t, [
    { f: 0, p: { x: 1249.7, y: 719.4, scale: 1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 54, p: { x: 1249.7, y: 719.4, scale: 1, yaw: -0.3, look: -0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 94, p: { x: 1249.7, y: 719.4, scale: 1, yaw: -0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f2 = faceAt(t, [[0, 'neutral']]);
  const p3 = poseAt(t, [
    { f: 0, p: { x: 575.5, y: 719.4, scale: 1, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 54, p: { x: 575.5, y: 719.4, scale: 1, yaw: 0.3, look: 0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 94, p: { x: 575.5, y: 719.4, scale: 1, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f3 = faceAt(t, [[0, 'neutral']]);
  const camX = kf(t, [[0, 980], [len, 980]]);
  const camY = kf(t, [[0, 570], [len, 570]]);
  const zoom = kf(t, [[0, 1.0], [len, 1.06]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Party t={t + 5553} id="s149" veil={0.28} />
        {/* v8: the Detective sneaks in the background, watching — small, still,
            at the frame edge among the crowd, never centre. */}
        <Hero look={LOOKS.detective} pose={{ ...basePose, x: 350, y: 747, scale: 0.8, yaw: 0.25 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestA} pose={{ ...p1, ...f1 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestB} pose={{ ...p2, ...f2 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestC} pose={{ ...p3, ...f3 }} rimId="rimBlue" shadow={1} />
      </g>
    </g>
  );
};

// ---------- S150: two-shot, party — Ch8 How To Beat It ----------
export const S150: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.5, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 58, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.5, armL: { a: 40, b: -10 }, armR: { a: 40, b: -10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 98, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.4, armL: { a: 15, b: -9 }, armR: { a: 25, b: -9 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral']]);
  const p1 = poseAt(t, [
    { f: 0, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 58, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.3, look: 0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 98, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f1 = faceAt(t, [[0, 'neutral']]);
  const camX = kf(t, [[0, 845.1], [len, 845.1]]);
  const camY = kf(t, [[0, 595.3], [len, 595.3]]);
  const zoom = kf(t, [[0, 1.35], [len, 1.4]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Party t={t + 5590} id="s150" veil={0.44} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestA} pose={{ ...p1, ...f1 }} rimId="rimBlue" shadow={1} />
        <Foreground blur={10}>
          <FgPlant x={194} y={1020} s={1.8} />
        </Foreground>
      </g>
    </g>
  );
};

// ---------- S151: medium, bedroom — Ch8 How To Beat It ----------
export const S151: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 1026.3, y: 684.1, scale: 0.9, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 45, p: { x: 1026.3, y: 684.1, scale: 0.9, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: 120, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 83, p: { x: 1026.3, y: 684.1, scale: 0.9, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: 55, b: -4 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral'], [45, 'happy']]);
  const camX = kf(t, [[0, 1026.3], [len, 1026.3]]);
  const camY = kf(t, [[0, 624.1], [len, 624.1]]);
  const zoom = kf(t, [[0, 1.8], [len, 1.9]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Bedroom t={t + 5627} id="s151" crossed={0} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <Cat x={1300} y={820} mood="sleep" f={t} />
      </g>
    </g>
  );
};

// ---------- S152: macro insert, bedroom — Ch8 How To Beat It ----------
export const S152: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 1026.3, y: 684.1, scale: 0.9, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 69, p: { x: 1026.3, y: 684.1, scale: 0.9, yaw: 0.3, armL: { a: 40, b: -10 }, armR: { a: 40, b: -10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 83, p: { x: 1026.3, y: 684.1, scale: 0.9, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 120, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 109, p: { x: 1026.3, y: 684.1, scale: 0.9, yaw: 0.2, armL: { a: 15, b: -9 }, armR: { a: 25, b: -9 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral']]);
  const camX = kf(t, [[0, 1026.3], [len, 1026.3]]);
  const camY = kf(t, [[0, 624.1], [len, 624.1]]);
  const zoom = kf(t, [[0, 2.4], [len * 0.5, 2.4], [len, 2.5]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Bedroom t={t + 5664} id="s152" crossed={0} />
        <Glow x={1026.3} y={564.1} r={320} o={kf(t, [[0, 0.25], [len, 0.5]])} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
      </g>
    </g>
  );
};

// ---------- S153: high angle, party — Ch9 The Inversion That Sets You Free ----------
export const S153: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 980, y: 731.3, scale: 1.1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 58, p: { x: 980, y: 731.3, scale: 1.1, yaw: -0.3, armL: { a: 40, b: -10 }, armR: { a: 40, b: -10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 98, p: { x: 980, y: 731.3, scale: 1.1, yaw: -0.3, armL: { a: 15, b: -9 }, armR: { a: 25, b: -9 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral']]);
  const camX = kf(t, [[0, 980], [len, 980]]);
  const camY = kf(t, [[0, 520], [len, 520]]);
  const zoom = kf(t, [[0, 1.25], [len, 1.3]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Party t={t + 5701} id="s153" veil={0.44} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <Foreground blur={10}>
          <FgPlant x={272} y={1020} s={1.8} />
        </Foreground>
      </g>
      <text x={120} y={130} fontFamily={FONT.hand} fontSize={44} fill="#F6EFE3">CHAPTER NINE</text>
    </g>
  );
};

// ---------- S154: medium, party — Ch9 The Inversion That Sets You Free ----------
export const S154: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.5, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 57, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.5, armL: { a: 40, b: -10 }, armR: { a: 40, b: -10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 97, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.4, armL: { a: 15, b: -9 }, armR: { a: 25, b: -9 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral']]);
  const camX = kf(t, [[0, 980], [len, 980]]);
  const camY = kf(t, [[0, 671.3], [len, 671.3]]);
  const zoom = kf(t, [[0, 1.8], [len, 1.9]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Party t={t + 5738} id="s154" veil={0.44} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
      </g>
    </g>
  );
};

// ---------- S155: close-up, party — Ch9 The Inversion That Sets You Free ----------
export const S155: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 50, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.2, armL: { a: 40, b: -10 }, armR: { a: 40, b: -10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 90, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.2, armL: { a: 15, b: -9 }, armR: { a: 25, b: -9 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral']]);
  const camX = kf(t, [[0, 980], [len, 980]]);
  const camY = kf(t, [[0, 546.1], [len, 546.1]]);
  const zoom = kf(t, [[0, 3.2], [len, 3.35]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Party t={t + 5775} id="s155" veil={0.44} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
      </g>
    </g>
  );
};

// ---------- S156: low angle, party — Ch9 The Inversion That Sets You Free ----------
export const S156: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 52, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 15, b: -55 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 }, handR: 'point' } },
    { f: 92, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: -2.5, b: -31.5 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 }, handR: 'point' } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral'], [52, 'puzzled']]);
  const p1 = poseAt(t, [
    { f: 0, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 52, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.3, look: 0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 92, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f1 = faceAt(t, [[0, 'neutral']]);
  const camX = kf(t, [[0, 980], [len, 980]]);
  const camY = kf(t, [[0, 771.3], [len, 771.3]]);
  const zoom = kf(t, [[0, 1.6], [len, 1.68]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Party t={t + 5812} id="s156" veil={0.44} />
        <LobsterSign />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestA} pose={{ ...p1, ...f1 }} rimId="rimBlue" shadow={1} />
      </g>
      <Popup lines={["WHAT WAS JAKE'S FRIEND WEARING?"]} x={960} y={1055} size={40} />
    </g>
  );
};

// ---------- S157: medium, kitchen — Ch9 The Inversion That Sets You Free ----------
export const S157: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 960, y: 708.6, scale: 0.9, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 59, p: { x: 960, y: 708.6, scale: 0.9, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 15, b: -55 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 }, handR: 'point' } },
    { f: 99, p: { x: 960, y: 708.6, scale: 0.9, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: -2.5, b: -31.5 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 }, handR: 'point' } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral'], [59, 'puzzled']]);
  const camX = kf(t, [[0, 960], [len, 960]]);
  const camY = kf(t, [[0, 648.6], [len, 648.6]]);
  const zoom = kf(t, [[0, 1.8], [len, 1.9]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Kitchen t={t + 5849} id="s157" />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <KitchenIsland />
        <Mug x={1184.5} y={692.7} rot={-8} f={t} />
      </g>
    </g>
  );
};

// ---------- S158: wide, party — Ch9 The Inversion That Sets You Free ----------
export const S158: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.5, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 49, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.5, armL: { a: 40, b: -10 }, armR: { a: 40, b: -10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 89, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.4, armL: { a: 15, b: -9 }, armR: { a: 25, b: -9 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral']]);
  const p1 = poseAt(t, [
    { f: 0, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 49, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.3, look: 0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 89, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f1 = faceAt(t, [[0, 'neutral']]);
  const p2 = poseAt(t, [
    { f: 0, p: { x: 1249.7, y: 719.4, scale: 1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 49, p: { x: 1249.7, y: 719.4, scale: 1, yaw: -0.3, look: -0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 89, p: { x: 1249.7, y: 719.4, scale: 1, yaw: -0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f2 = faceAt(t, [[0, 'neutral']]);
  const p3 = poseAt(t, [
    { f: 0, p: { x: 575.5, y: 719.4, scale: 1, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 49, p: { x: 575.5, y: 719.4, scale: 1, yaw: 0.3, look: 0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 89, p: { x: 575.5, y: 719.4, scale: 1, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f3 = faceAt(t, [[0, 'neutral']]);
  const camX = kf(t, [[0, 980], [len, 980]]);
  const camY = kf(t, [[0, 570], [len, 570]]);
  const zoom = kf(t, [[0, 1.0], [len, 1.06]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Party t={t + 5886} id="s158" veil={0.28} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestA} pose={{ ...p1, ...f1 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestB} pose={{ ...p2, ...f2 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestC} pose={{ ...p3, ...f3 }} rimId="rimBlue" shadow={1} />
      </g>
    </g>
  );
};

// ---------- S159: over-the-shoulder, party — Ch9 The Inversion That Sets You Free ----------
export const S159: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 52, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.2, armL: { a: 40, b: -10 }, armR: { a: 40, b: -10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 92, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.2, armL: { a: 15, b: -9 }, armR: { a: 25, b: -9 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral']]);
  const camX = kf(t, [[0, 980], [len, 980]]);
  const camY = kf(t, [[0, 671.3], [len, 671.3]]);
  const zoom = kf(t, [[0, 1.5], [len, 1.55]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Party t={t + 5923} id="s159" veil={0.44} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <Foreground blur={16}>
          <FgPlant x={540} y={1020} s={2.0} />
        </Foreground>
      </g>
    </g>
  );
};

// ---------- S160: medium, party — Ch9 The Inversion That Sets You Free ----------
export const S160: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 61, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.3, armL: { a: 40, b: -10 }, armR: { a: 40, b: -10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 73, p: { x: 980, y: 731.3, scale: 1.1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 120, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 101, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.2, armL: { a: 15, b: -9 }, armR: { a: 25, b: -9 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral'], [61, 'determined']]);
  const camX = kf(t, [[0, 980], [len, 980]]);
  const camY = kf(t, [[0, 700], [len, 700]]);
  const zoom = kf(t, [[0, 1.35], [len * 0.5, 1.35], [len, 1.45]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Party t={t + 5960} id="s160" veil={0.44} />
        <Glow x={980} y={611.3} r={320} o={kf(t, [[0, 0.25], [len, 0.5]])} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
      </g>
    </g>
  );
};

// ---------- S161: wide, party — Ch9 The Inversion That Sets You Free ----------
export const S161: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 980, y: 731.3, scale: 1.1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 53, p: { x: 980, y: 731.3, scale: 1.1, yaw: -0.3, armL: { a: 40, b: -10 }, armR: { a: 40, b: -10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 93, p: { x: 980, y: 731.3, scale: 1.1, yaw: -0.3, armL: { a: 15, b: -9 }, armR: { a: 25, b: -9 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral']]);
  const p1 = poseAt(t, [
    { f: 0, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 53, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.3, look: 0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 93, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f1 = faceAt(t, [[0, 'neutral']]);
  const p2 = poseAt(t, [
    { f: 0, p: { x: 1249.7, y: 719.4, scale: 1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 53, p: { x: 1249.7, y: 719.4, scale: 1, yaw: -0.3, look: -0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 93, p: { x: 1249.7, y: 719.4, scale: 1, yaw: -0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f2 = faceAt(t, [[0, 'neutral']]);
  const p3 = poseAt(t, [
    { f: 0, p: { x: 575.5, y: 719.4, scale: 1, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 53, p: { x: 575.5, y: 719.4, scale: 1, yaw: 0.3, look: 0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 93, p: { x: 575.5, y: 719.4, scale: 1, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f3 = faceAt(t, [[0, 'neutral']]);
  const camX = kf(t, [[0, 980], [len, 980]]);
  const camY = kf(t, [[0, 570], [len, 570]]);
  const zoom = kf(t, [[0, 1.0], [len, 1.06]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Party t={t + 5997} id="s161" veil={0.28} />
        {/* v8: the Detective sneaks in the background, watching — small, still,
            at the frame edge among the crowd, never centre. */}
        <Hero look={LOOKS.detective} pose={{ ...basePose, x: 350, y: 747, scale: 0.8, yaw: 0.25 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestA} pose={{ ...p1, ...f1 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestB} pose={{ ...p2, ...f2 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestC} pose={{ ...p3, ...f3 }} rimId="rimBlue" shadow={1} />
      </g>
    </g>
  );
};

// ---------- S162: medium, party — Ch9 The Inversion That Sets You Free ----------
export const S162: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.5, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 41, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.5, armL: { a: 25, b: -9 }, armR: { a: 25, b: -9 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 74, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.4, armL: { a: 15, b: -9 }, armR: { a: 25, b: -9 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral']]);
  const camX = kf(t, [[0, 980], [len, 980]]);
  const camY = kf(t, [[0, 671.3], [len, 671.3]]);
  const zoom = kf(t, [[0, 1.8], [len, 1.9]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Party t={t + 6034} id="s162" veil={0.44} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <Foreground blur={10}>
          <FgPlant x={506.7} y={1020} s={1.8} />
        </Foreground>
      </g>
    </g>
  );
};

// ---------- S163: close-up, party — Ch9 The Inversion That Sets You Free ----------
export const S163: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 49, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: 120, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 89, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: 55, b: -4 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral'], [49, 'happy']]);
  const camX = kf(t, [[0, 980], [len, 980]]);
  const camY = kf(t, [[0, 546.1], [len, 546.1]]);
  const zoom = kf(t, [[0, 3.2], [len, 3.35]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Party t={t + 6071} id="s163" veil={0.44} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
      </g>
    </g>
  );
};

// ---------- S164: medium, party — Ch9 The Inversion That Sets You Free ----------
export const S164: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 53, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 120, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 93, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: 55, b: -4 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral'], [53, 'happy']]);
  const camX = kf(t, [[0, 980], [len, 980]]);
  const camY = kf(t, [[0, 600], [len, 600]]);
  const zoom = kf(t, [[0, 2.2], [len, 2.3]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Party t={t + 6108} id="s164" veil={0.44} />
        <LobsterSign />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
      </g>
    </g>
  );
};

// ---------- S165: wide, party — Ch9 The Inversion That Sets You Free ----------
export const S165: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 980, y: 731.3, scale: 1.1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 49, p: { x: 980, y: 731.3, scale: 1.1, yaw: -0.3, armL: { a: 40, b: -10 }, armR: { a: 40, b: -10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 89, p: { x: 980, y: 731.3, scale: 1.1, yaw: -0.3, armL: { a: 15, b: -9 }, armR: { a: 25, b: -9 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral']]);
  const p1 = poseAt(t, [
    { f: 0, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 49, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.3, look: 0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 89, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f1 = faceAt(t, [[0, 'neutral']]);
  const p2 = poseAt(t, [
    { f: 0, p: { x: 1249.7, y: 719.4, scale: 1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 49, p: { x: 1249.7, y: 719.4, scale: 1, yaw: -0.3, look: -0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 89, p: { x: 1249.7, y: 719.4, scale: 1, yaw: -0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f2 = faceAt(t, [[0, 'neutral']]);
  const p3 = poseAt(t, [
    { f: 0, p: { x: 575.5, y: 719.4, scale: 1, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 49, p: { x: 575.5, y: 719.4, scale: 1, yaw: 0.3, look: 0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 89, p: { x: 575.5, y: 719.4, scale: 1, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f3 = faceAt(t, [[0, 'neutral']]);
  const camX = kf(t, [[0, 980], [len, 980]]);
  const camY = kf(t, [[0, 570], [len, 570]]);
  const zoom = kf(t, [[0, 1.0], [len, 1.06]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Party t={t + 6145} id="s165" veil={0.28} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestA} pose={{ ...p1, ...f1 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestB} pose={{ ...p2, ...f2 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestC} pose={{ ...p3, ...f3 }} rimId="rimBlue" shadow={1} />
        <Foreground blur={10}>
          <FgPlant x={80} y={1020} s={1.8} />
        </Foreground>
      </g>
    </g>
  );
};

// ---------- S166: two-shot, party — Ch9 The Inversion That Sets You Free ----------
export const S166: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = walkPose(kf(t, [[0, 1564], [len, 1100]]), t * 0.6 + 1.2, 900.5, 1.1, {}, -1);
  const f0 = faceAt(t, [[0, 'neutral'], [68, 'happy']]);
  const p1 = poseAt(t, [
    { f: 0, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 68, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.3, look: 0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 81, p: { x: 710.3, y: 719.4, scale: 1, yaw: -0.3, armL: { a: 40, b: -10 }, armR: { a: 40, b: -10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 108, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f1 = faceAt(t, [[0, 'neutral']]);
  const camX = kf(t, [[0, 1364], [len, 1100]]);
  const camY = kf(t, [[0, 670.5], [len, 670.5]]);
  const zoom = kf(t, [[0, 1.35], [len, 1.4]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Party t={t + 6182} id="s166" veil={0.44} />
        <LobsterSign />
        <Glow x={980} y={611.3} r={320} o={kf(t, [[0, 0.25], [len, 0.5]])} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestA} pose={{ ...p1, ...f1 }} rimId="rimBlue" shadow={1} />
      </g>
    </g>
  );
};

// ---------- S167: medium, party — Ch9 The Inversion That Sets You Free ----------
export const S167: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 51, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: 120, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 91, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: 55, b: -4 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral'], [51, 'happy']]);
  const p1 = poseAt(t, [
    { f: 0, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 51, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.3, look: 0.4, armL: { a: 40, b: -10 }, armR: { a: 40, b: -10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 91, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.2, armL: { a: 15, b: -9 }, armR: { a: 25, b: -9 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f1 = faceAt(t, [[0, 'neutral']]);
  const camX = kf(t, [[0, 900], [len, 900]]);
  const camY = kf(t, [[0, 671.3], [len, 671.3]]);
  const zoom = kf(t, [[0, 1.8], [len, 1.9]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Party t={t + 6219} id="s167" veil={0.44} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestA} pose={{ ...p1, ...f1 }} rimId="rimBlue" shadow={1} />
      </g>
    </g>
  );
};

// ---------- S168: two-shot, party — Ch9 The Inversion That Sets You Free ----------
export const S168: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 51, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 120, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 91, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: 55, b: -4 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral'], [51, 'happy']]);
  const p1 = poseAt(t, [
    { f: 0, p: { x: 1249.7, y: 719.4, scale: 1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 51, p: { x: 1249.7, y: 719.4, scale: 1, yaw: -0.3, look: -0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 91, p: { x: 1249.7, y: 719.4, scale: 1, yaw: -0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f1 = faceAt(t, [[0, 'neutral']]);
  const camX = kf(t, [[0, 1114.8], [len, 1114.8]]);
  const camY = kf(t, [[0, 595.3], [len, 595.3]]);
  const zoom = kf(t, [[0, 1.35], [len, 1.4]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Party t={t + 6256} id="s168" veil={0.44} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestB} pose={{ ...p1, ...f1 }} rimId="rimBlue" shadow={1} />
        <Foreground blur={10}>
          <FgPlant x={463.7} y={1020} s={1.8} />
        </Foreground>
      </g>
    </g>
  );
};

// ---------- S169: high angle, party — Ch9 The Inversion That Sets You Free ----------
export const S169: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 980, y: 731.3, scale: 1.1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 50, p: { x: 980, y: 731.3, scale: 1.1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 120, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 90, p: { x: 980, y: 731.3, scale: 1.1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 55, b: -4 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral'], [50, 'happy']]);
  const p1 = poseAt(t, [
    { f: 0, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 50, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.3, look: 0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 90, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f1 = faceAt(t, [[0, 'neutral']]);
  const p2 = poseAt(t, [
    { f: 0, p: { x: 1249.7, y: 719.4, scale: 1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 50, p: { x: 1249.7, y: 719.4, scale: 1, yaw: -0.3, look: -0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 90, p: { x: 1249.7, y: 719.4, scale: 1, yaw: -0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f2 = faceAt(t, [[0, 'neutral']]);
  const p3 = poseAt(t, [
    { f: 0, p: { x: 575.5, y: 719.4, scale: 1, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 50, p: { x: 575.5, y: 719.4, scale: 1, yaw: 0.3, look: 0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 90, p: { x: 575.5, y: 719.4, scale: 1, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f3 = faceAt(t, [[0, 'neutral']]);
  const camX = kf(t, [[0, 980], [len, 980]]);
  const camY = kf(t, [[0, 520], [len, 520]]);
  const zoom = kf(t, [[0, 1.25], [len, 1.3]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Party t={t + 6293} id="s169" veil={0.44} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestA} pose={{ ...p1, ...f1 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestB} pose={{ ...p2, ...f2 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestC} pose={{ ...p3, ...f3 }} rimId="rimBlue" shadow={1} />
      </g>
    </g>
  );
};

// ---------- S170: medium, party — Ch9 The Inversion That Sets You Free ----------
export const S170: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.5, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 50, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.5, armL: { a: 5, b: 0 }, armR: { a: 120, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 90, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.4, armL: { a: 5, b: 0 }, armR: { a: 55, b: -4 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral'], [50, 'happy']]);
  const p1 = poseAt(t, [
    { f: 0, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 50, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.3, look: 0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 90, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f1 = faceAt(t, [[0, 'neutral']]);
  const p2 = poseAt(t, [
    { f: 0, p: { x: 1249.7, y: 719.4, scale: 1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 50, p: { x: 1249.7, y: 719.4, scale: 1, yaw: -0.3, look: -0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 90, p: { x: 1249.7, y: 719.4, scale: 1, yaw: -0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f2 = faceAt(t, [[0, 'neutral']]);
  const camX = kf(t, [[0, 980], [len, 980]]);
  const camY = kf(t, [[0, 671.3], [len, 671.3]]);
  const zoom = kf(t, [[0, 1.8], [len, 1.9]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Party t={t + 6330} id="s170" veil={0.44} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestA} pose={{ ...p1, ...f1 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestB} pose={{ ...p2, ...f2 }} rimId="rimBlue" shadow={1} />
      </g>
    </g>
  );
};

// ---------- S171: close-up, schematic — Ch9 The Inversion That Sets You Free ----------
export const S171: React.FC<ShotProps> = ({ t, len }) => {
  const camX = kf(t, [[0, 900], [len, 900]]);
  const camY = kf(t, [[0, 600], [len, 600]]);
  const zoom = kf(t, [[0, 1.9], [len, 2.0]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Schematic t={t + 6367} id="s171" />
        <SchLabel x={1150} y={350} t={t} text="FELT" size={36} color="#FF8A3D" />
        <CountUp x={1150} y={480} t={t} to={46} size={130} color="#FF8A3D" suffix="%" />
      </g>
    </g>
  );
};

// ---------- S172: low angle, schematic — Ch9 The Inversion That Sets You Free ----------
export const S172: React.FC<ShotProps> = ({ t, len }) => {
  const camX = kf(t, [[0, 900], [len, 900]]);
  const camY = kf(t, [[0, 640], [len, 640]]);
  const zoom = kf(t, [[0, 1.35], [len, 1.4]]);
  // v8 (Nov 9, Javion: bars filling up + explanations + Detective / pie chart for
  // comparing percentages): the recap comparison — REAL 23% vs PROUD 8%. Detective
  // narrates (facing camera), BOTH percentages on the SAME pie as slices (whole circle
  // = 100%), takeaway below. Bars are NOT for comparing percentages — the pie is.
  const pDet = poseAt(t, [
    { f: 0, p: { x: 360, y: 780, scale: 1.05, yaw: 0, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 30, p: { x: 360, y: 780, scale: 1.05, yaw: 0, armL: { a: 5, b: 0 }, armR: { a: 55, b: -20 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 70, p: { x: 360, y: 780, scale: 1.05, yaw: 0, armL: { a: 5, b: 0 }, armR: { a: 55, b: -20 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const fDet = faceAt(t, [[0, 'neutral'], [30, 'smug']]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Schematic t={t + 6404} id="s172" />
        <Hero look={LOOKS.detective} pose={{ ...pDet, ...fDet }} rimId="rimBlue" shadow={1} />
        <PieChart
          x={1060} y={455} t={t} dur={40} r={150}
          slices={[
            { label: 'REAL', value: 23, color: '#FF8A3D' },
            { label: 'PROUD', value: 8, color: '#7E8DA6' },
          ]}
        />
        <SchLabel x={1060} y={660} t={t + 30} text="ONLY 23% SAW IT — AND ONLY 8% WERE PROUD" size={30} color="#F6EFE3" />
        <SchLabel x={1060} y={710} t={t + 40} text="THE SPOTLIGHT WAS NEVER THAT BRIGHT" size={30} color="#FF8A3D" />
      </g>
    </g>
  );
};

// ---------- S173: medium, schematic — Ch9 The Inversion That Sets You Free ----------
export const S173: React.FC<ShotProps> = ({ t, len }) => {
  const camX = kf(t, [[0, 900], [len, 900]]);
  const camY = kf(t, [[0, 640], [len, 640]]);
  const zoom = kf(t, [[0, 1.5], [len * 0.5, 1.5], [len, 1.56]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Schematic t={t + 6441} id="s173" />
        <Glow x={975} y={420} r={320} o={kf(t, [[0, 0.25], [len, 0.5]])} />
        <SchLabel x={1150} y={360} t={t} text="TURN IT DOWN" size={56} color="#FF8A3D" />
        <Gauge x={1050} y={420} p={0.23} label="SPOTLIGHT" />
      </g>
    </g>
  );
};

// ---------- S174: wide, party — Ch9 The Inversion That Sets You Free ----------
export const S174: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.5, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 48, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.5, armL: { a: 40, b: -10 }, armR: { a: 40, b: -10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 88, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.4, armL: { a: 15, b: -9 }, armR: { a: 25, b: -9 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral']]);
  const p1 = poseAt(t, [
    { f: 0, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 48, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.3, look: 0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 88, p: { x: 710.3, y: 719.4, scale: 1, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f1 = faceAt(t, [[0, 'neutral']]);
  const p2 = poseAt(t, [
    { f: 0, p: { x: 1249.7, y: 719.4, scale: 1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 48, p: { x: 1249.7, y: 719.4, scale: 1, yaw: -0.3, look: -0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 88, p: { x: 1249.7, y: 719.4, scale: 1, yaw: -0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f2 = faceAt(t, [[0, 'neutral']]);
  const p3 = poseAt(t, [
    { f: 0, p: { x: 575.5, y: 719.4, scale: 1, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 48, p: { x: 575.5, y: 719.4, scale: 1, yaw: 0.3, look: 0.4, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 88, p: { x: 575.5, y: 719.4, scale: 1, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f3 = faceAt(t, [[0, 'neutral']]);
  const camX = kf(t, [[0, 980], [len, 980]]);
  const camY = kf(t, [[0, 570], [len, 570]]);
  const zoom = kf(t, [[0, 1.0], [len, 1.06]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Party t={t + 6478} id="s174" veil={0.28} />
        {/* v8: the Detective sneaks in the background, watching — small, still,
            at the frame edge among the crowd, never centre. */}
        <Hero look={LOOKS.detective} pose={{ ...basePose, x: 350, y: 747, scale: 0.8, yaw: 0.25 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestA} pose={{ ...p1, ...f1 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestB} pose={{ ...p2, ...f2 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.guestC} pose={{ ...p3, ...f3 }} rimId="rimBlue" shadow={1} />
        <Foreground blur={10}>
          <FgPlant x={80} y={1020} s={1.8} />
        </Foreground>
      </g>
      <Popup lines={['WHICH ONE', 'STUNG THE MOST?']} x={960} y={120} size={52} />
    </g>
  );
};

// ---------- S175: over-the-shoulder, party — Ch9 The Inversion That Sets You Free ----------
export const S175: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 39, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: 15, b: -55 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 }, handR: 'point' } },
    { f: 70, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.2, armL: { a: 5, b: 0 }, armR: { a: -2.5, b: -31.5 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 }, handR: 'point' } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral'], [39, 'puzzled']]);
  const camX = kf(t, [[0, 980], [len, 980]]);
  const camY = kf(t, [[0, 671.3], [len, 671.3]]);
  const zoom = kf(t, [[0, 1.5], [len, 1.55]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Party t={t + 6515} id="s175" veil={0.44} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <Foreground blur={16}>
          <FgPlant x={540} y={1020} s={2.0} />
        </Foreground>
      </g>
    </g>
  );
};

// ---------- S176: medium, party — Ch9 The Inversion That Sets You Free ----------
export const S176: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 49, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.3, armL: { a: 5, b: 0 }, armR: { a: 120, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 89, p: { x: 980, y: 731.3, scale: 1.1, yaw: 0.2, armL: { a: 22.5, b: -31.5 }, armR: { a: 12.5, b: -31.5 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral'], [49, 'smug']]);
  const camX = kf(t, [[0, 980], [len, 980]]);
  const camY = kf(t, [[0, 671.3], [len, 671.3]]);
  const zoom = kf(t, [[0, 1.8], [len, 1.9]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Party t={t + 6552} id="s176" veil={0.44} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
      </g>
    </g>
  );
};

// ---------- S177: wide, rooftop — Ch9 The Inversion That Sets You Free ----------
export const S177: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 960, y: 700, scale: 1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 49, p: { x: 960, y: 700, scale: 1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 120, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 89, p: { x: 960, y: 700, scale: 1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 55, b: -4 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral'], [49, 'happy']]);
  const camX = kf(t, [[0, 960], [len, 960]]);
  const camY = kf(t, [[0, 620], [len, 620]]);
  const zoom = kf(t, [[0, 1.0], [len, 1.06]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Rooftop t={t + 6589} haze={0.3} lightsUp={100} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <Foreground blur={10}>
          <FgPlant x={60} y={1150} s={1.6} />
        </Foreground>
      </g>
    </g>
  );
};

// ---------- S178: medium, rooftop — Ch9 The Inversion That Sets You Free ----------
export const S178: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 960, y: 700, scale: 1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 51, p: { x: 960, y: 700, scale: 1, yaw: -0.3, armL: { a: 95, b: 30 }, armR: { a: 120, b: 110 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 91, p: { x: 960, y: 700, scale: 1, yaw: -0.2, armL: { a: 52.5, b: 11 }, armR: { a: 65, b: 51 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral'], [51, 'smug']]);
  const mg = toWorld(p0, joints(p0).armL.end);
  const camX = kf(t, [[0, 960], [len, 960]]);
  const camY = kf(t, [[0, 640], [len, 640]]);
  const zoom = kf(t, [[0, 1.8], [len, 1.9]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Rooftop t={t + 6626} haze={0.3} lightsUp={100} />
        <Hero look={LOOKS.detective} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <Magnifier x={mg.x} y={mg.y} s={1} />
      </g>
    </g>
  );
};

// ---------- S179: close-up, rooftop — Ch9 The Inversion That Sets You Free ----------
export const S179: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 960, y: 700, scale: 1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 57, p: { x: 960, y: 700, scale: 1, yaw: -0.3, armL: { a: 95, b: 30 }, armR: { a: 120, b: 110 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 97, p: { x: 960, y: 700, scale: 1, yaw: -0.2, armL: { a: 52.5, b: 11 }, armR: { a: 65, b: 51 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral'], [57, 'scared']]);
  const mg = toWorld(p0, joints(p0).armL.end);
  const camX = kf(t, [[0, 960], [len, 960]]);
  const camY = kf(t, [[0, 524], [len, 524]]);
  const zoom = kf(t, [[0, 3.2], [len, 3.35]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Rooftop t={t + 6663} haze={0.3} lightsUp={100} />
        <Hero look={LOOKS.detective} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <Magnifier x={mg.x} y={mg.y} s={1} />
      </g>
    </g>
  );
};

// ---------- S180: medium, rooftop — Ch9 The Inversion That Sets You Free ----------
export const S180: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 960, y: 700, scale: 1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 58, p: { x: 960, y: 700, scale: 1, yaw: -0.3, armL: { a: 95, b: 30 }, armR: { a: 120, b: 110 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 98, p: { x: 960, y: 700, scale: 1, yaw: -0.2, armL: { a: 52.5, b: 11 }, armR: { a: 65, b: 51 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral'], [58, 'scared']]);
  const mg = toWorld(p0, joints(p0).armL.end);
  const camX = kf(t, [[0, 960], [len, 960]]);
  const camY = kf(t, [[0, 640], [len, 640]]);
  const zoom = kf(t, [[0, 1.8], [len, 1.9]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Rooftop t={t + 6700} haze={0.3} lightsUp={100} />
        <Hero look={LOOKS.detective} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <Magnifier x={mg.x} y={mg.y} s={1} />
        <Foreground blur={10}>
          <FgPlant x={486.7} y={930} s={1.6} />
        </Foreground>
      </g>
    </g>
  );
};

// ---------- S181: wide, rooftop — Ch9 The Inversion That Sets You Free ----------
export const S181: React.FC<ShotProps> = ({ t, len }) => {
  // v8: Jake STANDS in the finale (he was sitting while the Detective stood, legs 85/80)
  // and his gesture is staggered ahead of the Detective's — no more both-arms-up at the
  // same frame. Jake gestures at f=30, the Detective answers at f=50.
  const p0 = poseAt(t, [
    { f: 0, p: { x: 700, y: 700, scale: 1, yaw: 0.8, tilt: 0, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 30, p: { x: 700, y: 700, scale: 1, yaw: 0.8, tilt: 0, headTilt: 4, armL: { a: 40, b: -10 }, armR: { a: 40, b: -10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 83, p: { x: 700, y: 700, scale: 1, yaw: 0.8, tilt: 0, headTilt: 2, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral'], [30, 'smug']]);
  const p1 = poseAt(t, [
    { f: 0, p: { x: 1180, y: 700, scale: 1, yaw: -0.3, armL: { a: 5, b: 0 }, armR: { a: 5, b: 0 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 50, p: { x: 1180, y: 700, scale: 1, yaw: -0.3, armL: { a: 95, b: 30 }, armR: { a: 120, b: 110 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 83, p: { x: 1180, y: 700, scale: 1, yaw: -0.2, armL: { a: 52.5, b: 11 }, armR: { a: 65, b: 51 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f1 = faceAt(t, [[0, 'neutral'], [50, 'smug']]);
  const mg = toWorld(p1, joints(p1).armL.end);
  const camX = kf(t, [[0, 960], [len, 960]]);
  const camY = kf(t, [[0, 620], [len, 620]]);
  const zoom = kf(t, [[0, 1.0], [len, 1.06]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Rooftop t={t + 6737} haze={0.3} lightsUp={100} />
        <Hero look={LOOKS.jake} pose={{ ...p0, ...f0 }} rimId="rimBlue" shadow={1} />
        <Hero look={LOOKS.detective} pose={{ ...p1, ...f1 }} rimId="rimBlue" shadow={1} />
        <Magnifier x={mg.x} y={mg.y} s={1} />
      </g>
    </g>
  );
};

// ---------- S182: wide, endcard — Ch9 The Inversion That Sets You Free ----------
export const S182: React.FC<ShotProps> = ({ t, len }) => {
  const camX = kf(t, [[0, 960], [len, 960]]);
  const camY = kf(t, [[0, 540], [len, 540]]);
  const zoom = kf(t, [[0, 1.0], [len, 1.06]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <EndCard />
      </g>
    </g>
  );
};
