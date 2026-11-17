// ns5 — escalation: 2:59 AM, phone, elevator dings, cash, step in, rise (44.67–62.58s, 430f)
// Sub-beats (local frames): 0–19 lobby clock + "2:59 AM"; 20–83 phone cut (TextChat,
// bubbles 18f apart, red lands at 56); 83–285 doors open + cash pops at 196, Jake
// watches from the left; 285–312 Jake walks into the doorway; 315–343 doors close;
// 343–430 the car rises — shake, indicator climbs 12 → 14 → glitches to 13, doors
// part again in the last frames onto the dark hallway.
// Pure refactor: moved verbatim out of NightShift2D.tsx. No visual or timing changes.

import React from 'react';
import { basePose, clamp, Dust, easeInOut, faceAt, FONT, Hero, kf, plantedWalkPose, poseAt, TextChat } from '../../engine';
import { defineScene } from '../../engine/sceneBuilder';
import { cam, CashStack, Clock259, DisplayText, FLOOR, Fog, FPS, H, JAKE_NS, Sconce, Vignette, W } from './shared';

const PHONE_MSGS = [
  { text: "the elevator's moving", side: 'left' as const, time: '2:59 AM' },
  { text: "you didn't call it", side: 'left' as const },
  { text: "DON'T GET IN", side: 'left' as const, red: true },
];

export const ns5 = defineScene({
  id: 'ns5',
  durationSec: 17.91,
  characters: [{ who: 'jake', x: 0.5, feetY: FLOOR }],
  fn: ({ frame }) => {
    const f = frame;
    const t30 = (ff: number) => Math.round(ff * 1.25);
    // --- elevator door state ---
    const openO =
      f < 83 ? 0 : f < 151 ? easeInOut(clamp((f - 83) / 68)) : f < 315 ? 1 : f < 343 ? 1 - easeInOut(clamp((f - 315) / 28)) : f < 408 ? 0 : easeInOut(clamp((f - 408) / 22));
    // --- floor indicator ---
    let ind = 'L';
    let indFill = '#FFB46A';
    if (f >= 343 && f < 400) {
      const climb = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14];
      ind = String(climb[Math.min(12, Math.floor((f - 343) / 4.4))]);
    } else if (f >= 400 && f < 410) {
      ind = f % 2 === 0 ? '14' : '13';
    } else if (f >= 410) {
      ind = '13';
      indFill = '#FF5A4A';
    }
    // --- Jake ---
    let jake: React.ReactElement | null = null;
    if (f < 20) {
      const pose = poseAt(f, [
        { f: 0, p: { ...basePose, x: 380, y: FLOOR - 140 * 1.3, scale: 1.3, facing: 1, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
        { f: 19, p: { x: 380, y: FLOOR - 140 * 1.3, scale: 1.3, facing: 1, tilt: 0, headTilt: -8, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
      ]);
      const face = faceAt(f, [[0, 'worried']]);
      jake = <Hero look={JAKE_NS} pose={{ ...pose, ...face, facing: 1 }} rimId="rimBlue" shadow={1} />;
    } else if (f >= 83 && f < 285) {
      // Jake watches the doors open, then TURNS and looks DOWN at the cash when
      // it appears (f>=120). He does NOT stare at the camera while money sits
      // on the floor. (Javion Nov 14: "If the money is sitting on the floor
      // why the fuck is he looking at us".) The turn is a smooth yaw to the
      // right (cash is at x=540, Jake at x=300) plus a forward lean.
      const pose = poseAt(f, [
        { f: 83, p: { ...basePose, x: 300, y: FLOOR - 140 * 1.25, scale: 1.25, facing: 1, yaw: 0, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
        { f: 135, p: { ...basePose, x: 300, y: FLOOR - 140 * 1.25, scale: 1.25, facing: 1, yaw: 0.7, tilt: 7, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
      ]);
      const face = faceAt(f, [[0, 'worried']]);
      jake = <Hero look={JAKE_NS} pose={{ ...pose, ...face, facing: 1 }} rimId="rimBlue" shadow={1} />;
    } else if (f >= 285 && f < 312) {
      const pose = plantedWalkPose(300, 540, t30(f - 285), t30(27), FLOOR, 1.25, { expr: 'worried' }, 1);
      const face = faceAt(f, [[0, 'worried']]);
      jake = <Hero look={JAKE_NS} pose={{ ...pose, ...face, facing: 1 }} rimId="rimBlue" shadow={1} />;
    } else if (f >= 312) {
      const pose = poseAt(f, [
        { f: 312, p: { ...basePose, x: 540, y: FLOOR - 140 * 1.3, scale: 1.3, facing: 1, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
      ]);
      const face = faceAt(f, [[0, 'scared']]);
      jake = <Hero look={JAKE_NS} pose={{ ...pose, ...face, facing: 1 }} rimId="rimBlue" shadow={1} />;
    }
    // --- the rise shake: the whole car (doors + interior + Jake) trembles ---
    const shakeY = f >= 343 ? 2.5 * Math.sin(f * 0.9) : 0;
    const shakeX = f >= 343 ? 1.5 * Math.sin(f * 0.7 + 1) : 0;
    const zoom = kf(f, [[0, 1.0], [430, 1.06]]);

    // PHONE CUT — full screen, no lobby behind it
    if (f >= 20 && f < 83) {
      const flash = f < 26 ? 0.5 * (1 - (f - 20) / 6) : 0;
      return (
        <g>
          <rect x={-300} y={-300} width={W + 600} height={H + 600} fill="#0B0A10" />
          <circle cx={540} cy={960} r={700} fill="#1A1626" opacity={0.6} />
          <TextChat x={540} y={960} t={f - 20} w={920} messages={PHONE_MSGS} gap={18} title="Unknown" />
          {flash > 0 ? <rect x={-300} y={-300} width={W + 600} height={H + 600} fill="#FFFFFF" opacity={flash} /> : null}
          <Vignette />
        </g>
      );
    }

    return (
      <g>
        <g transform={cam(540, 1000, zoom)}>
          <rect x={-300} y={-300} width={W + 600} height={H + 600} fill="#0E0C14" />
          <rect x={-300} y={0} width={W + 600} height={FLOOR} fill="#15121F" />
          <rect x={-300} y={FLOOR} width={W + 600} height={H - FLOOR} fill="#0B090F" />
          {f < 20 ? (
            <g>
              <Clock259 x={540} y={700} r={110} />
              <Sconce x={140} y={600} f={f} phase={0} />
              <Sconce x={940} y={600} f={f} phase={2} />
            </g>
          ) : (
            <g transform={`translate(${shakeX} ${shakeY})`}>
              {/* car interior, revealed as the doors part */}
              <rect x={240} y={400} width={600} height={FLOOR - 400} fill="#060508" />
              <rect x={300} y={420} width={480} height={26} fill="#3A2E1E" />
              <rect x={480} y={430} width={120} height={18} rx={9} fill="#FFE2B0" opacity={0.8} />
              <circle cx={540} cy={440} r={150} fill="url(#nsWarmGlow)" opacity={0.35} />
              {/* indicator */}
              <rect x={470} y={300} width={140} height={72} rx={10} fill="#060508" stroke="#3A2E1E" strokeWidth={4} />
              <text x={540} y={358} textAnchor="middle" fontFamily={FONT.ui} fontSize={52} fill={indFill}>
                {ind}
              </text>
              <CashStack x={540} y={1490} f={f} show={f >= 120} />
              {/* brass doors, sliding into the wall pockets (clipped at the frame) */}
              <clipPath id="nsDoors">
                <rect x={240} y={400} width={600} height={FLOOR - 400 + 10} />
              </clipPath>
              <g clipPath="url(#nsDoors)">
                <rect x={258 - 280 * openO} y={418} width={282} height={FLOOR - 418} fill="url(#nsBrass)" />
                <rect x={540 + 280 * openO} y={418} width={282} height={FLOOR - 418} fill="url(#nsBrass)" />
              </g>
              <rect x={240} y={400} width={600} height={FLOOR - 400 + 10} fill="none" stroke="#241D12" strokeWidth={14} />
              <line x1={540} y1={418} x2={540} y2={FLOOR} stroke="#241D12" strokeWidth={8} opacity={1 - openO} />
              {jake}
            </g>
          )}
          {f < 20 ? jake : null}
          <Fog f={f} y={1500} o={0.9} />
          <Dust t={f} seed={19} x0={0} y0={0} w={W} h={H} n={36} o={0.5} />
        </g>
        {f >= 8 && f < 20 ? <DisplayText x={540} y={190} size={100}>2:59 AM</DisplayText> : null}
        <Vignette />
      </g>
    );
  },
});
