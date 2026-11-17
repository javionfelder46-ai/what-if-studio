// you.tsx — "YOU", the black silhouette stick man, ported 1:1 from
// scenes_phone.py (draw_you + _sil_face + draw_phone + draw_grip_hand).
// Charcoal suit #232330, black head/limbs #0A0A0C, cream shirt #F4EFE2,
// red tie #A8232B, white eyes (NO pupils), slim torso 180 wide (narrower
// than the 200-wide head), thick capsule arms (26) / legs (28), bald.
// Mouth appears + moves ONLY when speaking (mouthOpen from the VO envelope),
// vanishes when silent.
import React from 'react';
import { INK, LW, AddLight, Blur, Label, RRect } from './kit-phone';

export const SUIT = '#232330';
export const SIL_BLACK = '#0A0A0C';
export const SHIRT = '#F4EFE2';
export const TIE = '#A8232B';
export const SIL_WHITE = '#FBFBF7';

// Arm pose table (kit3 ARM, left-arm coords; mirrored for the right arm).
export type ArmPose = 'down' | 'pocket' | 'hip' | 'present' | 'gesture' | 'chin' | 'hat' | 'hold' | 'push';
const ARM: Record<ArmPose, { e: [number, number]; h: [number, number]; show: boolean }> = {
  down: { e: [-90, -235], h: [-96, -168], show: true },
  pocket: { e: [-96, -232], h: [-70, -176], show: false },
  hip: { e: [-128, -238], h: [-84, -190], show: true },
  present: { e: [-128, -306], h: [-208, -338], show: true },
  gesture: { e: [-136, -262], h: [-152, -352], show: true },
  chin: { e: [-128, -262], h: [-62, -322], show: true },
  hat: { e: [-140, -400], h: [-104, -482], show: true },
  hold: { e: [-96, -236], h: [-44, -214], show: true },
  push: { e: [-120, -270], h: [-190, -262], show: true },
};

export type Eyes = 'dot' | 'wide' | 'closed' | 'half';
export type MouthShape = 'smile' | 'smirk' | 'flat' | 'o' | 'mid' | 'open';
export type LegSpec = [number, number, number][]; // [hipX, footX, lift]

export type YouProps = {
  x: number; y: number; s: number;
  face?: number; eyes?: Eyes; mouth?: MouthShape; brow?: number; browTilt?: number;
  arms?: [ArmPose, ArmPose]; tilt?: number; bob?: number; squash?: number;
  sweat?: number; light?: number; rim?: string; legs?: LegSpec | [];
  mouthOpen?: number; // 0..1 from the VO envelope; <0.08 = silent, mouth hidden
  /** Blended arm poses (kit3 _arm interpolation) — overrides the pose table for that side. */
  armLBlend?: { e: [number, number]; h: [number, number]; show: boolean };
  armRBlend?: { e: [number, number]; h: [number, number]; show: boolean };
};

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

/** The mouth: the board's shape, opening with the VO envelope. Hidden when silent. */
const Mouth: React.FC<{ shape: MouthShape; mx: number; my: number; open: number; lw: number }> = ({ shape, mx, my, open, lw }) => {
  if (open < 0.08) return null;
  const w = lw * 0.7;
  if (shape === 'o') return <ellipse cx={mx} cy={my + 1} rx={8} ry={9 * (0.35 + 0.65 * open)} fill={SIL_WHITE} stroke={SIL_WHITE} strokeWidth={w} />;
  if (shape === 'mid') return <ellipse cx={mx} cy={my + 3} rx={12} ry={7 * (0.35 + 0.65 * open)} fill={SIL_WHITE} stroke={SIL_WHITE} strokeWidth={w} />;
  if (shape === 'open') return <ellipse cx={mx} cy={my + 9} rx={15} ry={13 * (0.35 + 0.65 * open)} fill={SIL_WHITE} stroke={SIL_WHITE} strokeWidth={w} />;
  if (shape === 'smirk') {
    const d = mx >= 0 ? 1 : -1;
    return (
      <g>
        <path d={`M ${mx - 15 * d} ${my + 3} Q ${mx + 4 * d} ${my + 12 + open * 10} ${mx + 20 * d} ${my - 6}`} fill="none" stroke={SIL_WHITE} strokeWidth={w} strokeLinecap="round" />
        {open > 0.3 ? <ellipse cx={mx + 4 * d} cy={my + 8} rx={10} ry={open * 10} fill={SIL_WHITE} /> : null}
      </g>
    );
  }
  if (shape === 'flat') {
    return (
      <g>
        <line x1={mx - 12} y1={my + 2} x2={mx + 12} y2={my + 2} stroke={SIL_WHITE} strokeWidth={w} strokeLinecap="round" />
        <ellipse cx={mx} cy={my + 4} rx={12} ry={2 + open * 11} fill={SIL_WHITE} />
      </g>
    );
  }
  // smile: the curve deepens as the mouth opens, plus a small open oval
  return (
    <g>
      <path d={`M ${mx - 17} ${my - 2} Q ${mx} ${my + 13 + open * 16} ${mx + 17} ${my - 2}`} fill="none" stroke={SIL_WHITE} strokeWidth={w} strokeLinecap="round" />
      {open > 0.3 ? <ellipse cx={mx} cy={my + 8} rx={11} ry={open * 11} fill={SIL_WHITE} /> : null}
    </g>
  );
};

/** White eyes / brows / mouth / sweat on the black head (head centre 0,0, R=100). */
const SilFace: React.FC<{
  face: number; eyes: Eyes; mouth: MouthShape; brow: number; browTilt: number; sweat: number; lw: number; mouthOpen: number;
}> = ({ face, eyes, mouth, brow, browTilt, sweat, lw, mouthOpen }) => {
  const fx = face * 40;
  const eyy = -6;
  const eyePair = ([-30, 30] as const).map((ex0) => {
    const ex = ex0 + fx;
    const far = (face > 0 && ex0 > 0) || (face < 0 && ex0 < 0);
    const sq = far ? 1 - 0.3 * Math.abs(face) : 1.0;
    const inner = ex0 < 0 ? 1 : -1;
    const by = eyy - 29 - brow * 9;
    return (
      <g key={ex0}>
        {eyes === 'wide' ? (
          <ellipse cx={ex} cy={eyy} rx={17 * sq} ry={17} fill={SIL_WHITE} stroke={SIL_WHITE} strokeWidth={lw * 0.7} />
        ) : eyes === 'closed' ? (
          <path d={`M ${ex - 11 * sq} ${eyy} Q ${ex} ${eyy + 9} ${ex + 11 * sq} ${eyy}`} fill="none" stroke={SIL_WHITE} strokeWidth={lw * 0.8} strokeLinecap="round" />
        ) : eyes === 'half' ? (
          <g>
            <line x1={ex - 13 * sq} y1={eyy - 4} x2={ex + 13 * sq} y2={eyy - 4} stroke={SIL_WHITE} strokeWidth={lw * 0.8} strokeLinecap="round" />
            <ellipse cx={ex} cy={eyy - 3} rx={6 * sq} ry={5} fill={SIL_WHITE} />
          </g>
        ) : (
          <ellipse cx={ex} cy={eyy} rx={6.5 * sq} ry={9} fill={SIL_WHITE} />
        )}
        <line x1={ex - 13 * sq} y1={by + (inner < 0 ? browTilt * 7 : -browTilt * 7)}
          x2={ex + 13 * sq} y2={by + (inner > 0 ? browTilt * 7 : -browTilt * 7)}
          stroke={SIL_WHITE} strokeWidth={lw * 0.78} strokeLinecap="round" />
      </g>
    );
  });
  const mx = face * 34;
  const my = 42;
  // sweat side: -1 if face > 0 else 1 (mirrors the skia code)
  const sd = face > 0 ? -1 : 1;
  const sy0 = -66 + 30 * (sweat % 1);
  const sweatPath =
    sweat >= 0 ? (
      <path
        d={`M ${sd * 62} ${sy0 - 19} C ${sd * 62 + 12} ${sy0 - 3} ${sd * 62 + 11} ${sy0 + 10} ${sd * 62} ${sy0 + 10} C ${sd * 62 - 11} ${sy0 + 10} ${sd * 62 - 12} ${sy0 - 3} ${sd * 62} ${sy0 - 19} Z`}
        fill="#8FC8EE" stroke="#8FC8EE" strokeWidth={lw * 0.7}
      />
    ) : null;
  return (
    <g>
      {eyePair}
      <Mouth shape={mouth} mx={mx} my={my} open={mouthOpen} lw={lw} />
      {sweatPath}
    </g>
  );
};

export const You: React.FC<YouProps> = ({
  x, y, s, face = 0, eyes = 'dot', mouth = 'smile', brow = 0, browTilt = 0,
  arms = ['down', 'down'], tilt = 0, bob = 0, squash = 0, sweat = -1,
  light = -1, rim, legs, mouthOpen = 0, armLBlend, armRBlend,
}) => {
  const lw = Math.max(5.2, 4.0 / s);
  const legList: [number, number, number][] =
    legs === undefined ? [[-28, 0, 0], [28, 0, 0]] : (legs as [number, number, number][]).map(([h, fx, lift]) => [h < 0 ? -28 : 28, fx, lift] as [number, number, number]);
  const armEls = ([-1, 1] as const).map((side, i) => {
    const blend = side < 0 ? armLBlend : armRBlend;
    const spec = blend ?? ARM[arms[i]];
    const m = side < 0 ? 1 : -1;
    const sx = -82 * m;
    const sy = -295;
    const ex = spec.e[0] * m;
    const ey = spec.e[1];
    const hx = spec.h[0] * m;
    const hy = spec.h[1];
    const cx = 1.35 * ex - 0.175 * (sx + hx);
    const cy = 1.35 * ey - 0.175 * (sy + hy);
    return (
      <g key={side}>
        <path d={`M ${sx} ${sy} Q ${cx} ${cy} ${hx} ${hy}`} fill="none" stroke={SIL_BLACK} strokeWidth={26} strokeLinecap="round" />
        {spec.show ? <circle cx={hx} cy={hy} r={18} fill={SIL_BLACK} /> : null}
      </g>
    );
  });
  // Rim light: a lit arc on the light side of the head (skia draws the
  // head-minus-offset crescent; an arc reads the same at this size).
  const rimArc =
    rim ? (
      <path
        d={light >= 0
          ? 'M 78 -62 A 100 100 0 0 1 78 62'
          : 'M -78 -62 A 100 100 0 0 0 -78 62'}
        fill="none" stroke={rim} strokeWidth={9} strokeLinecap="round" opacity={215 / 255}
      />
    ) : null;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* legs + flat shoes */}
      {legList.map(([hx0, fx, lift], i) => (
        <g key={i}>
          <line x1={hx0} y1={-136} x2={hx0 + fx} y2={-lift} stroke={SIL_BLACK} strokeWidth={28} strokeLinecap="round" />
          <ellipse cx={hx0 + fx} cy={-5} rx={22} ry={9} fill={SIL_BLACK} />
        </g>
      ))}
      <g transform={`translate(0 ${-bob}) scale(${1 + squash * 0.6} ${1 - squash})`}>
        {/* slim torso (narrower than the head) + shirt V + tie + lapels */}
        <defs>
          <clipPath id={`you-body-${x}-${y}-${s}`}>
            <rect x={-90} y={-345} width={180} height={217} rx={48} />
          </clipPath>
        </defs>
        <rect x={-90} y={-345} width={180} height={217} rx={48} fill={SUIT} stroke={INK} strokeWidth={lw} />
        <g clipPath={`url(#you-body-${x}-${y}-${s})`}>
          <path d="M -36 -349 L 0 -242 L 36 -349 Z" fill={SHIRT} />
          <path d="M -11 -330 L 11 -330 L 14 -268 L 0 -248 L -14 -268 Z" fill={TIE} />
          <rect x={-11} y={-340} width={22} height={26} rx={6} fill={TIE} stroke={INK} strokeWidth={lw * 0.6} />
          {[-1, 1].map((sx) => (
            <path key={sx} d={`M ${sx * 40} -347 L ${sx * 4} -242 L ${sx * 4} -128`} fill="none" stroke="#4A4A58" strokeWidth={lw * 0.75} />
          ))}
        </g>
        {/* arms (thick capsules over the body) */}
        {armEls}
        {/* head */}
        <g transform={`translate(0 -419) rotate(${tilt})`}>
          <circle cx={0} cy={0} r={100} fill={SIL_BLACK} stroke={INK} strokeWidth={lw} />
          {rimArc}
          <SilFace face={face} eyes={eyes} mouth={mouth} brow={brow} browTilt={browTilt} sweat={sweat} lw={lw} mouthOpen={mouthOpen} />
        </g>
      </g>
    </g>
  );
};

/** Walk-cycle legs (kit3 walk_legs): phase advances with time. */
export const walkLegs = (phase: number, stride = 46, lift = 20): LegSpec => {
  const a = Math.sin(phase);
  const b = -a;
  return [
    [-10, a * stride, Math.max(0, Math.cos(phase)) * lift],
    [10, b * stride, Math.max(0, -Math.cos(phase)) * lift],
  ];
};

/** Interpolate between two arm poses (kit3 _arm with (a, b, k)). */
export const armBlend = (a: ArmPose, b: ArmPose, k: number): { e: [number, number]; h: [number, number]; show: boolean } => {
  const ea = ARM[a];
  const eb = ARM[b];
  return {
    e: [lerp(ea.e[0], eb.e[0], k), lerp(ea.e[1], eb.e[1], k)],
    h: [lerp(ea.h[0], eb.h[0], k), lerp(ea.h[1], eb.h[1], k)],
    show: k > 0.5 ? eb.show : ea.show,
  };
};

// ---------------------------------------------------------------------------
// Phone (kit3 draw_phone / draw_grip_hand, ported from scenes_phone.py)
// ---------------------------------------------------------------------------

export type PhoneLine = { txt: string; size: number; col: string; dy: number; font?: 'hand' | 'marker' };

export const Phone: React.FC<{
  cx: number; cy: number; w: number; h: number;
  lines?: PhoneLine[]; glow?: string | null; rot?: number; screen?: string; back?: boolean;
}> = ({ cx, cy, w, h, lines, glow, rot = 0, screen = '#05070F', back = false }) => {
  const x0 = -w / 2;
  const y0 = -h / 2;
  const x1 = w / 2;
  const y1 = h / 2;
  return (
    <g transform={`translate(${cx} ${cy}) rotate(${rot})`}>
      {/* soft shadow behind the phone */}
      <Blur sigma={12}>
        <rect x={x0 - 16} y={y0 - 16} width={w + 32} height={h + 32} rx={46} fill="#101018" opacity={90 / 255} />
      </Blur>
      <RRect x0={x0} y0={y0} x1={x1} y1={y1} fill="#1E1E28" r={40} />
      {back ? (
        <g>
          <circle cx={x0 + w * 0.25} cy={y0 + h * 0.12} r={w * 0.11} fill="#0A0A12" stroke={INK} strokeWidth={LW * 0.5} />
          <circle cx={x0 + w * 0.25} cy={y0 + h * 0.12} r={w * 0.05} fill="#3A4A6A" stroke={INK} strokeWidth={LW * 0.4} />
          <circle cx={0} cy={h * 0.1} r={w * 0.08} fill="#2A2A38" stroke={INK} strokeWidth={LW * 0.5} />
        </g>
      ) : (
        <g>
          <RRect x0={x0 + 12} y0={y0 + 12} x1={x1 - 12} y1={y1 - 12} fill={screen} w={LW * 0.5} r={30} />
          <rect x={-40} y={y0 + 26} width={80} height={8} rx={4} fill="#3A3A48" />
          <rect x={-70} y={y1 - 32} width={140} height={10} rx={5} fill="#3A3A48" />
          {lines?.map((L, i) => (
            <Label key={i} s={L.txt} x={0} y={L.dy} size={L.size} color={L.col} font={L.font ?? 'hand'} align="center" skew={-0.08} />
          ))}
        </g>
      )}
      {glow ? <AddLight x={0} y={0} r={Math.max(w, h) * 0.75} v={glow} a={90} /> : null}
    </g>
  );
};

/** A hand gripping the phone, drawn AFTER the phone (light outline so it reads). */
export const GripHand: React.FC<{ cx: number; cy: number; rot?: number; s: number }> = ({ cx, cy, rot = 0, s }) => (
  <g transform={`translate(${cx} ${cy}) rotate(${rot})`}>
    <circle cx={0} cy={0} r={18 * s + 4} fill="#9A9A9A" stroke={INK} strokeWidth={LW} />
    <circle cx={0} cy={0} r={18 * s} fill={SIL_BLACK} stroke={INK} strokeWidth={LW} />
  </g>
);
