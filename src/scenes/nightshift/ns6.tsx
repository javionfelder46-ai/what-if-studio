// ns6 — the hallway + vote (62.58–77.33s, 354f)
// Perspective hallway, sconces flickering, fog on the floor, Jake's back to camera
// at the threshold. Slow push-in toward the door. Vote card lands at local 226f
// (72.02s, "Comment GET OUT or STAY IN") and holds to the end.
// Pure refactor: moved verbatim out of NightShift2D.tsx. No visual or timing changes.

import React from 'react';
import { backOut, clamp, Dust, FONT, kf, MOONLIGHT } from '../../engine';
import { defineScene } from '../../engine/sceneBuilder';
import { cam, FLOOR, Fog, FPS, H, JakeBack, Sconce, Vignette, W } from './shared';

export const ns6 = defineScene({
  id: 'ns6',
  durationSec: 14.75,
  characters: [{ who: 'jake', x: 0.5, feetY: FLOOR }],
  fn: ({ frame }) => {
    const f = frame;
    const zoom = kf(f, [[0, 1.0], [354, 1.12]]);
    const cardK = f >= 226 ? backOut(clamp((f - 226) / 8)) : 0;
    return (
      <g>
        <g transform={cam(540, 1050, zoom)}>
          <rect x={-300} y={-300} width={W + 600} height={H + 600} fill="#07060C" />
          {/* ceiling + side walls + floor in perspective */}
          <polygon points="-300,-300 1380,-300 640,640 440,640" fill="#0D0B14" />
          <polygon points="-300,-300 -300,2220 440,1120 440,640" fill="#100D18" />
          <polygon points="1380,-300 1380,2220 640,1120 640,640" fill="#0E0B16" />
          <polygon points="-300,2220 1380,2220 640,1120 440,1120" fill="#0B090F" />
          {[0.25, 0.5, 0.75].map((k) => (
            <line key={k} x1={-300 + k * 1680} y1={2220} x2={440 + k * 200} y2={1120} stroke="#1A1526" strokeWidth={4} />
          ))}
          {/* the door at the end — OPEN, swung wide into the hallway.
              A dark gap where the door used to be; the panel itself is visible at an
              angle, hinged on the left jamb. Darkness beyond it. (Javion Nov 14:
              the closed door read as a wall — it must be visibly open.) */}
          <rect x={440} y={640} width={200} height={480} fill="#030207" stroke="#4A3820" strokeWidth={6} />
          {/* the open panel, hinged on the left jamb, swung toward the viewer */}
          <polygon points="445,645 310,700 310,1060 445,1115" fill="#1E1A28" stroke="#241D12" strokeWidth={4} />
          <polygon points="420,690 335,730 335,1030 420,1075" fill="none" stroke="#2A2018" strokeWidth={3} />
          <line x1={310} y1={700} x2={310} y2={1060} stroke="#A9C6FF" strokeWidth={2} opacity={0.4} />
          <circle cx={326} cy={890} r={8} fill="#B08D4F" />
          {/* sconces on the side walls, on visible fixtures, flickering */}
          <Sconce x={170} y={820} f={f} phase={0} />
          <Sconce x={910} y={820} f={f} phase={2.4} />
          <JakeBack x={540} floorY={FLOOR} s={1.5} />
          <Fog f={f} y={1560} o={1.3} />
          <Fog f={f + 200} y={1700} o={1.0} />
          <Dust t={f} seed={23} x0={0} y0={0} w={W} h={H} n={40} o={0.55} />
        </g>
        {/* vote card — cold, stark, no warm colors */}
        {cardK > 0 ? (
          <g transform={`translate(540 1500) scale(${cardK})`} opacity={cardK}>
            <rect x={-450} y={-320} width={900} height={640} rx={24} fill="#060A12" opacity={0.94} stroke={MOONLIGHT} strokeWidth={2} />
            <text x={0} y={-230} textAnchor="middle" fontFamily={FONT.ui} fontSize={42} fill="#F6EFE3">THE ELEVATOR JUST STOPPED</text>
            <text x={0} y={-172} textAnchor="middle" fontFamily={FONT.ui} fontSize={42} fill="#F6EFE3">ON FLOOR 13.</text>
            <text x={0} y={-114} textAnchor="middle" fontFamily={FONT.ui} fontSize={42} fill="#F6EFE3">THE HOTEL ONLY HAS 12 FLOORS.</text>
            <text x={0} y={-40} textAnchor="middle" fontFamily={FONT.ui} fontSize={46} fontWeight={700} fill="#FFFFFF">DO YOU GET OUT OR STAY IN?</text>
            <rect x={-380} y={20} width={340} height={110} rx={12} fill="#0E1420" stroke="#F6EFE3" strokeWidth={3} />
            <text x={-210} y={92} textAnchor="middle" fontFamily={FONT.ui} fontSize={48} fontWeight={700} fill="#FFFFFF">GET OUT</text>
            <rect x={40} y={20} width={340} height={110} rx={12} fill="#0E1420" stroke="#F6EFE3" strokeWidth={3} />
            <text x={210} y={92} textAnchor="middle" fontFamily={FONT.ui} fontSize={48} fontWeight={700} fill="#FFFFFF">STAY IN</text>
            <text x={0} y={200} textAnchor="middle" fontFamily={FONT.ui} fontSize={30} fill="#8E8E93">Comment GET OUT or STAY IN — majority decides.</text>
          </g>
        ) : null}
        <Vignette />
      </g>
    );
  },
});
