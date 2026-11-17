// ns4 — the fact: elevator panel, no 13 (37.58–44.67s, 170f)
// Jake behind the front desk; the brass panel shows 12, then 14 — the 13 slot
// is an empty dark recess. The 12 button glows amber (current floor).
// Pure refactor: moved verbatim out of NightShift2D.tsx. No visual or timing changes.

import React from 'react';
import { basePose, Dust, faceAt, FONT, Hero, kf, poseAt } from '../../engine';
import { defineScene } from '../../engine/sceneBuilder';
import { cam, DisplayText, FLOOR, Fog, FPS, H, JAKE_NS, Sconce, Vignette, W } from './shared';

export const ns4 = defineScene({
  id: 'ns4',
  durationSec: 7.09,
  characters: [{ who: 'jake', x: 0.35, feetY: FLOOR }],
  fn: ({ frame }) => {
    const f = frame;
    const zoom = kf(f, [[0, 1.0], [170, 1.07]]);
    const pose = poseAt(f, [
      { f: 0, p: { ...basePose, x: 380, y: FLOOR - 140 * 1.3, scale: 1.3, facing: 1, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    ]);
    const face = faceAt(f, [[0, 'neutral']]);
    const btnPulse = 0.8 + 0.2 * Math.sin(f * 0.2);
    const rows: { label: string; y: number; lit?: boolean; missing?: boolean }[] = [
      { label: '14', y: 800 },
      { label: '13', y: 900, missing: true },
      { label: '12', y: 1000, lit: true },
      { label: '11', y: 1100 },
      { label: '10', y: 1200 },
    ];
    return (
      <g>
        <g transform={cam(540, 1000, zoom)}>
          <rect x={-300} y={-300} width={W + 600} height={H + 600} fill="#0E0C14" />
          <rect x={-300} y={0} width={W + 600} height={FLOOR} fill="#15121F" />
          <Sconce x={850} y={600} f={f} phase={0} />
          {/* brass elevator panel */}
          <rect x={700} y={730} width={300} height={560} rx={16} fill="url(#nsBrass)" stroke="#241D12" strokeWidth={6} />
          {rows.map((row) => (
            <g key={row.label}>
              {row.missing ? (
                <g>
                  <rect x={740} y={row.y - 26} width={130} height={52} rx={8} fill="#0A0805" />
                  <path d="M 750 900 L 860 880 M 760 918 L 850 896" stroke="#3A2E1E" strokeWidth={3} />
                  <text x={890} y={row.y + 14} fontFamily={FONT.ui} fontSize={40} fill="#6E5426">—</text>
                </g>
              ) : (
                <g>
                  <circle cx={800} cy={row.y} r={24} fill={row.lit ? '#FFB46A' : '#241D12'} stroke="#6E5426" strokeWidth={3} opacity={row.lit ? btnPulse : 1} />
                  {row.lit ? <circle cx={800} cy={row.y} r={40} fill="#FFB46A" opacity={0.25 * btnPulse} /> : null}
                  <text x={890} y={row.y + 14} fontFamily={FONT.ui} fontSize={40} fill="#241D12">{row.label}</text>
                </g>
              )}
            </g>
          ))}
          <Hero look={JAKE_NS} pose={{ ...pose, ...face, facing: 1 }} rimId="rimBlue" shadow={1} />
          {/* front desk, drawn AFTER Jake: it hides his legs — he stands behind it */}
          <rect x={-300} y={1360} width={W + 600} height={70} fill="#3A2A1A" stroke="#241A10" strokeWidth={4} />
          <rect x={-300} y={1430} width={W + 600} height={H - 1430} fill="#241A10" />
          <Fog f={f} y={1500} o={0.9} />
          <Dust t={f} seed={17} x0={0} y0={0} w={W} h={H} n={36} o={0.5} />
        </g>
        {f >= 7 ? <DisplayText x={540} y={1800} size={58}>Most hotels skip floor 13.</DisplayText> : null}
        <Vignette />
      </g>
    );
  },
});
