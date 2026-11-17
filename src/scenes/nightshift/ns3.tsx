// ns3 — the rules (18.17–37.58s, 466f)
// Rules text top-left, one at a time, accumulating. The paper hangs on the right,
// Rule 4 torn and scratched out. Jake reads it from below.
// Pure refactor: moved verbatim out of NightShift2D.tsx. No visual or timing changes.

import React from 'react';
import { basePose, clamp, Dust, faceAt, FONT, Hero, kf, poseAt } from '../../engine';
import { defineScene } from '../../engine/sceneBuilder';
import { cam, FLOOR, Fog, FPS, H, JAKE_NS, Sconce, Vignette, W } from './shared';

// The rules are written ON the paper — the paper IS the note the last clerk left.
// (Javion Nov 14: floating text on the left + a blank paper on the right was wrong.)
// Each line sits on one of the paper's ruled lines, dark ink, wrapped to the paper width.
// Rule 4 is scratched out on the paper itself (scribble + torn edge) — no floating text.
const PAPER_RULES: { lines: { text: string; y: number }[]; atFrame: number }[] = [
  { lines: [{ text: '1. Never knock', y: 470 }, { text: 'on Room 100.', y: 516 }], atFrame: 7 },
  { lines: [{ text: '2. If the elevator stops', y: 608 }, { text: "on a floor that doesn't", y: 654 }, { text: "exist, don't get out.", y: 700 }], atFrame: 83 },
  { lines: [{ text: '3. Cash appears in the', y: 792 }, { text: 'elevator at 3 AM.', y: 838 }, { text: 'Never count it.', y: 884 }], atFrame: 207 },
];

export const ns3 = defineScene({
  id: 'ns3',
  durationSec: 18.03, // was 19.41 — rule 3 re-record is 1.38s shorter (Nov 14, Javion: record the clearer wording)
  characters: [{ who: 'jake', x: 0.39, feetY: FLOOR }],
  fn: ({ frame }) => {
    const f = frame;
    const zoom = kf(f, [[0, 1.0], [466, 1.06]]);
    const pose = poseAt(f, [
      { f: 0, p: { ...basePose, x: 420, y: FLOOR - 140 * 1.05, scale: 1.05, facing: 1, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
      { f: 120, p: { x: 420, y: FLOOR - 140 * 1.05, scale: 1.05, facing: 1, tilt: 0, headTilt: -8, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    ]);
    const face = faceAt(f, [[0, 'neutral']]);
    const sway = Math.sin((f / FPS) * 0.35) * 0.5;
    return (
      <g>
        <g transform={cam(540, 1000, zoom)}>
          <rect x={-300} y={-300} width={W + 600} height={H + 600} fill="#0E0C14" />
          <rect x={-300} y={0} width={W + 600} height={FLOOR} fill="#15121F" />
          <Sconce x={830} y={300} f={f} phase={0} />
          {/* the rules paper, pinned, swaying almost imperceptibly — the rules are
              WRITTEN ON it in dark ink. No floating text: every word sits on a ruled line. */}
          <g transform={`rotate(${sway} 790 378)`}>
            <rect x={560} y={360} width={460} height={880} fill="#EFE6D2" stroke="#B3A78F" strokeWidth={4} />
            <circle cx={790} cy={378} r={10} fill="#8A2A2A" />
            {[478, 524, 570, 616, 662, 708, 754, 800, 846, 892, 938, 984].map((ly) => (
              <line key={ly} x1={595} y1={ly} x2={985} y2={ly} stroke="#8E8570" strokeWidth={3} opacity={0.55} />
            ))}
            {/* Rule 4 zone: torn + scratched out so hard the paper is damaged */}
            <path d="M 600 1040 L 980 1040 L 960 1090 L 630 1090 Z" fill="#D8CDB2" />
            <path d="M 610 1055 L 970 1070 M 620 1075 L 960 1052 M 640 1048 L 950 1082" stroke="#2A2018" strokeWidth={7} strokeLinecap="round" />
            <path d="M 560 1240 L 620 1212 L 690 1240 L 760 1210 L 830 1240 L 900 1212 L 970 1240 L 1020 1216" fill="none" stroke="#8E8570" strokeWidth={3} />
            {/* the rules, in dark ink on the ruled lines, appearing one at a time */}
            {PAPER_RULES.map((rule, ri) => {
              if (f < rule.atFrame) return null;
              const k = clamp((f - rule.atFrame) / 8);
              return (
                <g key={ri} opacity={k}>
                  {rule.lines.map((ln, li) => (
                    <text key={li} x={595} y={ln.y} fontFamily={FONT.ui} fontSize={28} fill="#2A2018">
                      {ln.text}
                    </text>
                  ))}
                </g>
              );
            })}
          </g>
          <rect x={-300} y={FLOOR} width={W + 600} height={H - FLOOR} fill="#0B090F" />
          <Hero look={JAKE_NS} pose={{ ...pose, ...face, facing: 1 }} rimId="rimBlue" shadow={1} />
          <Fog f={f} y={1500} o={0.9} />
          <Dust t={f} seed={13} x0={0} y0={0} w={W} h={H} n={36} o={0.5} />
        </g>
        <Vignette />
      </g>
    );
  },
});
