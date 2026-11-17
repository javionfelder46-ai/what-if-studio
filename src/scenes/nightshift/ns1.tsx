// ns1 — cold open: elevator interior, doors closed (0–6.29s, 151f)
// Jake's back to the closed brass doors. "FLOOR 13" top-center the whole scene.
// Pure refactor: moved verbatim out of NightShift2D.tsx. No visual or timing changes.

import React from 'react';
import { Dust, FONT, kf } from '../../engine';
import { defineScene } from '../../engine/sceneBuilder';
import { cam, DisplayText, FLOOR, Fog, FPS, H, JakeBack, Sconce, Vignette, W } from './shared';

export const ns1 = defineScene({
  id: 'ns1',
  durationSec: 6.29,
  characters: [{ who: 'jake', x: 0.5, feetY: FLOOR }],
  fn: ({ frame, duration }) => {
    const f = frame;
    const zoom = kf(f, [[0, 1.0], [150, 1.1]]);
    const indPulse = 0.85 + 0.15 * Math.sin(f * 0.25);
    return (
      <g>
        <g transform={cam(540, 1000, zoom)}>
          <rect x={-300} y={-300} width={W + 600} height={H + 600} fill="#0E0C14" />
          <rect x={-300} y={0} width={W + 600} height={FLOOR} fill="#14121E" />
          {/* wall panels */}
          {[-160, 140, 940, 1240].map((px) => (
            <rect key={px} x={px} y={120} width={10} height={FLOOR - 120} fill="#1E1828" opacity={0.8} />
          ))}
          <rect x={-300} y={FLOOR} width={W + 600} height={H - FLOOR} fill="#0B090F" />
          {[0, 1, 2, 3, 4].map((i) => (
            <line key={i} x1={-300 + i * 360} y1={FLOOR} x2={-180 + i * 300} y2={H} stroke="#1A1526" strokeWidth={4} />
          ))}
          {/* floor indicator: 13, pulsing amber */}
          <rect x={470} y={330} width={140} height={72} rx={10} fill="#060508" stroke="#3A2E1E" strokeWidth={4} />
          <text x={540} y={388} textAnchor="middle" fontFamily={FONT.ui} fontSize={52} fill="#FFB46A" opacity={indPulse}>
            13
          </text>
          {/* brass elevator doors, closed */}
          <rect x={240} y={400} width={600} height={FLOOR - 400 + 10} fill="#241D12" />
          <rect x={258} y={418} width={282} height={FLOOR - 418} fill="url(#nsBrass)" />
          <rect x={540} y={418} width={282} height={FLOOR - 418} fill="url(#nsBrass)" />
          <line x1={540} y1={418} x2={540} y2={FLOOR} stroke="#241D12" strokeWidth={8} />
          {[500, 700, 900, 1100, 1300].map((dy) => (
            <line key={dy} x1={258} y1={dy} x2={822} y2={dy} stroke="#6E5426" strokeWidth={2} opacity={0.5} />
          ))}
          <Sconce x={140} y={700} f={f} phase={0} />
          <JakeBack x={540} floorY={FLOOR} s={1.5} />
          <Fog f={f} y={1500} o={0.8} />
          <Dust t={f} seed={7} x0={0} y0={0} w={W} h={H} n={36} o={0.5} />
        </g>
        <DisplayText x={540} y={190} size={96}>
          FLOOR 13
        </DisplayText>
        <Vignette />
      </g>
    );
  },
});
