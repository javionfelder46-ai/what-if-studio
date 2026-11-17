// ns2 — setup: Jake walks into the lobby (6.29–18.17s, 285f)
// Rain on the windows, chandelier swaying, camera panning with his planted walk.
// Pure refactor: moved verbatim out of NightShift2D.tsx. No visual or timing changes.

import React from 'react';
import { basePose, Dust, faceAt, Hero, kf, plantedWalkPose, poseAt } from '../../engine';
import { defineScene } from '../../engine/sceneBuilder';
import { cam, flick, FLOOR, Fog, FPS, H, JAKE_NS, Rain, Sconce, Vignette, W } from './shared';

// ---------------------------------------------------------------------------
// LIGHTNING (S2 lobby) — the storm outside the windows.
// The sky is STORM CLOUDS (no moon: a clear moon + rain makes no sense). The moon is
// hidden behind the clouds; the flash lights the clouds up from within.
// 3 flashes at irregular times; each flickers 0 -> full -> dip -> full -> gone over 8f.
// ---------------------------------------------------------------------------
const CLOUD_BLOBS: [number, number, number, number][] = [
  [70, 450, 90, 45], [180, 420, 100, 55], [130, 500, 110, 50], [220, 520, 80, 40],
  [90, 700, 90, 35], [200, 780, 100, 40], [120, 870, 80, 30],
];
const CLOUD_DARK = ['#232D45', '#1C2438', '#28324C', '#1C2438', '#1A2233', '#232D45', '#1A2233'];
const FLICKER = [0, 1, 0.3, 0.95, 1, 0.4, 0.7, 0];
const FLASHES = [
  { start: 40, winX: 80, mirror: false },
  { start: 150, winX: 760, mirror: true },
  { start: 230, winX: 80, mirror: true },
];
const flashAt = (f: number): { k: number; winX: number; mirror: boolean } | null => {
  for (const fl of FLASHES) {
    const t = f - fl.start;
    if (t >= 0 && t < 8) return { k: FLICKER[t], winX: fl.winX, mirror: fl.mirror };
  }
  return null;
};
/** A jagged lightning bolt inside a window (x = window left edge). mirror flips it. */
const boltPath = (x: number, mirror: boolean) => {
  const px = (dx: number) => (mirror ? x + 280 - dx : x + dx);
  const seg = (pts: [number, number][]) => 'M ' + pts.map(([dx, y]) => `${px(dx)} ${y}`).join(' L ');
  const main: [number, number][] = [[150, 350], [125, 415], [165, 470], [115, 545], [155, 605], [120, 675], [145, 740]];
  const b1: [number, number][] = [[135, 540], [95, 595], [75, 650]];
  const b2: [number, number][] = [[145, 610], [195, 660], [215, 715]];
  return seg(main) + ' ' + seg(b1) + ' ' + seg(b2);
};

export const ns2 = defineScene({
  id: 'ns2',
  durationSec: 11.88,
  characters: [{ who: 'jake', x: 0.5, feetY: FLOOR }],
  fn: ({ frame }) => {
    const f = frame;
    const WALK_LEN = 240; // frames of walking, then he stands at the desk
    const t30 = (ff: number) => Math.round(ff * 1.25); // plantedWalkPose runs on a 30fps step clock
    const pose =
      f < WALK_LEN
        ? plantedWalkPose(140, 780, t30(f), t30(WALK_LEN), FLOOR, 1.35, { expr: 'neutral' }, 1)
        : poseAt(f, [
            { f: WALK_LEN, p: { ...basePose, x: 780, y: FLOOR - 140 * 1.35, scale: 1.35, facing: 1, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
          ]);
    const face = faceAt(f, [[0, 'neutral']]);
    const walkYaw = f < WALK_LEN ? 0.5 : 0; // 3/4 while walking, front when standing
    const camX = kf(f, [[0, 540], [285, 660]]);
    const zoom = kf(f, [[0, 1.0], [285, 1.05]]);
    const sway = Math.sin((f / FPS) * 0.5) * 1.6;
    const flash = flashAt(f);
    const flashMirror = flash ? flash.mirror : false;
    return (
      <g>
        <g transform={cam(camX, 1000, zoom)}>
          <rect x={-300} y={-300} width={W + 900} height={H + 600} fill="#0E0C14" />
          <rect x={-300} y={0} width={W + 900} height={FLOOR} fill="#15121F" />
          {/* windows: storm clouds + rain + lightning (no moon — a clear moon + rain makes no sense) */}
          {[
            { x: 80, clip: 'nsWinL' },
            { x: 760, clip: 'nsWinR' },
          ].map((win) => {
            const isFlashWin = !!flash && flash.winX === win.x;
            const fk = flash ? flash.k : 0;
            return (
              <g key={win.x}>
                <rect x={win.x} y={350} width={280} height={600} fill="#0D1420" stroke="#1E1824" strokeWidth={14} />
                <g clipPath={`url(#${win.clip})`}>
                  {/* storm clouds filling the window */}
                  {CLOUD_BLOBS.map(([dx, cy, rx, ry], i) => (
                    <ellipse key={i} cx={win.x + dx} cy={cy} rx={rx} ry={ry} fill={CLOUD_DARK[i]} />
                  ))}
                  {/* the clouds light up from within during a flash */}
                  {isFlashWin && fk > 0 ? (
                    <g opacity={fk * 0.55}>
                      {CLOUD_BLOBS.map(([dx, cy, rx, ry], i) => (
                        <ellipse key={i} cx={win.x + dx} cy={cy} rx={rx} ry={ry} fill="#B9CFFF" />
                      ))}
                    </g>
                  ) : null}
                  {/* window flare — bright in the flash window, faint in the other */}
                  {fk > 0 ? (
                    <rect x={win.x} y={350} width={280} height={600} fill="#CFE0FF" opacity={isFlashWin ? fk * 0.35 : fk * 0.12} />
                  ) : null}
                  {/* the bolt, inside this window only, only while the flash is on */}
                  {isFlashWin && fk > 0 ? (
                    <g opacity={fk}>
                      <path d={boltPath(win.x, flashMirror)} stroke="#A9C6FF" strokeWidth={12} fill="none" opacity={0.6} strokeLinecap="round" strokeLinejoin="round" />
                      <path d={boltPath(win.x, flashMirror)} stroke="#FFFFFF" strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </g>
                  ) : null}
                  <Rain f={f} x={win.x} y={350} w={280} h={600} id={win.clip} />
                </g>
                <line x1={win.x + 140} y1={350} x2={win.x + 140} y2={950} stroke="#1E1824" strokeWidth={10} />
                <line x1={win.x} y1={650} x2={win.x + 280} y2={650} stroke="#1E1824" strokeWidth={10} />
              </g>
            );
          })}
          {/* chandelier, swaying on its chains — FIXED Nov 14 (Javion: "Why is
              the ceiling light hanging upside down"): the old one drew a flat
              gold disc with the candles sticking up off it and the two chains
              ending at the candle tops, so the whole thing read inverted — a
              tray with candles on it, floating. A chandelier reads right-side
              up when the chains clearly go UP to the ceiling and the candles
              clearly stand ON the fixture: one central rod from the ceiling
              down to a horizontal brass bar, the three candles standing on
              the bar in little cup holders, flames up. No disc. */}
          <g transform={`rotate(${sway} 540 0)`}>
            <line x1={540} y1={0} x2={540} y2={300} stroke="#3A2E1E" strokeWidth={6} />
            <line x1={500} y1={0} x2={500} y2={290} stroke="#3A2E1E" strokeWidth={4} />
            <line x1={580} y1={0} x2={580} y2={290} stroke="#3A2E1E" strokeWidth={4} />
            <circle cx={540} cy={330} r={120} fill="url(#nsWarmGlow)" opacity={0.5 * flick(f, 1)} />
            <rect x={420} y={300} width={240} height={16} rx={8} fill="#B08D4F" stroke="#6E5426" strokeWidth={4} />
            {[470, 540, 610].map((cx) => (
              <g key={cx}>
                <path d={`M ${cx - 12} ${316} L ${cx + 12} ${316} L ${cx + 8} ${330} L ${cx - 8} ${330} Z`} fill="#8A6D3B" stroke="#6E5426" strokeWidth={3} />
                <rect x={cx - 8} y={282} width={16} height={34} fill="#EFE2CC" />
                <ellipse cx={cx} cy={280} rx={10} ry={16} fill="#FFE2B0" opacity={0.95 * flick(f, cx)} />
              </g>
            ))}
          </g>
          {/* the note pinned to the wall */}
          <g transform={`rotate(${Math.sin((f / FPS) * 0.4) * 0.6} 180 900)`}>
            <rect x={140} y={840} width={90} height={120} fill="#EFE6D2" stroke="#B3A78F" strokeWidth={3} transform="rotate(-3 185 900)" />
            <circle cx={185} cy={852} r={7} fill="#8A2A2A" />
          </g>
          {/* front desk */}
          <rect x={700} y={1250} width={420} height={60} fill="#3A2A1A" stroke="#241A10" strokeWidth={4} />
          <rect x={700} y={1310} width={420} height={250} fill="#241A10" />
          <rect x={720} y={1330} width={380} height={8} fill="#3A2A1A" />
          {/* desk lamp, on a visible fixture, flickering */}
          <circle cx={1010} cy={1180} r={110} fill="url(#nsWarmGlow)" opacity={0.55 * flick(f, 2)} />
          <rect x={1000} y={1180} width={8} height={70} fill="#3A2E1E" />
          <path d={`M 980 1180 L 1040 1180 L 1028 1140 L 992 1140 Z`} fill="#B08D4F" stroke="#6E5426" strokeWidth={3} />
          <ellipse cx={1010} cy={1152} rx={18} ry={12} fill="#FFE2B0" opacity={0.95 * flick(f, 2)} />
          <rect x={-300} y={FLOOR} width={W + 900} height={H - FLOOR} fill="#0B090F" />
          <Hero look={JAKE_NS} pose={{ ...pose, ...face, facing: 1, yaw: walkYaw }} rimId="rimBlue" shadow={1} />
          <Fog f={f} y={1500} o={0.9} />
          <Dust t={f} seed={11} x0={0} y0={0} w={W} h={H} n={36} o={0.5} />
        </g>
        {/* lightning: the whole room briefly lights up (subtle) */}
        {flash && flash.k > 0 ? (
          <rect x={-300} y={-300} width={W + 900} height={H + 600} fill="#FFFFFF" opacity={flash.k * 0.07} />
        ) : null}
        <Vignette />
      </g>
    );
  },
});
