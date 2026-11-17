// S13 — SCHEMATIC. Denmark 2023: life events in, a prediction out.
// Icons pop in one at a time; the verdict text fades in at ~12s.
import { defineScene } from '../../../engine/sceneBuilder';
import { AddLight, Label, Line, Poly, RRect, Circ, Vignette } from '../kit-phone';
import { camFor, fr } from '../common';
import { SHOT_TIMING } from '../timing';
import { clamp, easeInOut } from '../../../engine/anim';

const ID = 'S13';

defineScene({
  id: ID,
  durationSec: SHOT_TIMING[ID].durSec,
  characters: [],
  fn: (api) => {
    const t = api.t;
    const pop = (i: number) => easeInOut(clamp((t - 0.4 - i * 0.4) / 0.4));
    const verdict = easeInOut(clamp((t - 12) / 1));
    const chipPulse = 1 + 0.02 * Math.sin(t * 2);
    return (
      <g transform={camFor(ID, t, [
        fr(1.0, 1.03, [960, 540], [960, 540]),
        fr(1.2, 1.25, [840, 450], [840, 450]),
        fr(1.25, 1.3, [960, 700], [960, 700]),
        fr(1.2, 1.25, [960, 930], [960, 930]),
        fr(1.03, 1.05, [960, 540], [960, 540]),
        fr(1.25, 1.3, [960, 700], [960, 700]),
      ])}>
        <rect x={-900} y={-600} width={3720} height={2280} fill="#0A1136" />
        {Array.from({ length: 12 }, (_, i) => (
          <line key={`v${i}`} x1={i * 180} y1={-600} x2={i * 180} y2={1680} stroke="#1A2560" strokeWidth={2} opacity={100 / 255} />
        ))}
        {Array.from({ length: 7 }, (_, j) => (
          <line key={`h${j}`} x1={-900} y1={j * 180} x2={2820} y2={j * 180} stroke="#1A2560" strokeWidth={2} opacity={100 / 255} />
        ))}
        <Label s="DENMARK  •  2023" x={960} y={180} size={64} color="#F2C14E" align="center" />
        {/* life-event icons: job, health, money, home */}
        <g opacity={pop(0)}>
          <RRect x0={250} y0={360} x1={350} y1={450} fill="#F2C14E" w={6 * 0.8} r={10} />
          <RRect x0={280} y0={330} x1={320} y1={362} fill="#F2C14E" w={6 * 0.8} r={6} />
          <Line x0={250} y0={405} x1={350} y1={405} w={6 * 0.6} />
        </g>
        <g opacity={pop(1)}>
          <path d="M 660 500 C 570 430 580 340 660 390 C 740 340 750 430 660 500 Z" fill="#FF5A5A" stroke="#18161B" strokeWidth={6} strokeLinejoin="round" />
        </g>
        <g opacity={pop(2)}>
          <Circ x={1020} y={400} r={55} fill="#B8F04A" w={6 * 0.8} />
          <Label s="$" x={1020} y={430} size={80} color="#18161B" align="center" skew={0} />
        </g>
        <g opacity={pop(3)}>
          <RRect x0={1330} y0={380} x1={1430} y1={470} fill="#7AC8E8" w={6 * 0.8} />
          <Poly pts={[[1310, 385], [1380, 310], [1450, 385]]} fill="#5A93C8" w={6 * 0.8} />
          <RRect x0={1365} y0={420} x1={1395} y1={470} fill="#3B4660" w={6 * 0.6} />
        </g>
        <Label s="JOB" x={300} y={540} size={40} color="#FFF6DC" align="center" />
        <Label s="HEALTH" x={660} y={540} size={40} color="#FFF6DC" align="center" />
        <Label s="MONEY" x={1020} y={540} size={40} color="#FFF6DC" align="center" />
        <Label s="HOME" x={1380} y={540} size={40} color="#FFF6DC" align="center" />
        {/* arrows into the AI chip */}
        {[[300, 560, 880, 660], [660, 560, 920, 640], [1020, 560, 1000, 640], [1380, 560, 1040, 660]].map(([ax0, ay0, ax1, ay1], i) => (
          <g key={i} opacity={pop(3)}>
            <Line x0={ax0} y0={ay0} x1={ax1} y1={ay1} w={6} v="#7AC8E8" />
            <Poly pts={[[ax1 - 14, ay1 - 12], [ax1 + 14, ay1 - 12], [ax1, ay1 + 10]]} fill="#7AC8E8" w={0} />
          </g>
        ))}
        {/* AI chip */}
        <g transform={`translate(960 700) scale(${chipPulse}) translate(-960 -700)`}>
          <RRect x0={840} y0={620} x1={1080} y1={780} fill="#1E2A68" r={18} />
          {[870, 920, 970, 1020].map((px) => (
            <g key={px}>
              <Line x0={px} y0={600} x1={px} y1={620} w={5} />
              <Line x0={px} y0={780} x1={px} y1={800} w={5} />
            </g>
          ))}
          <Label s="AI" x={960} y={730} size={110} color="#FFF6DC" align="center" skew={0} />
        </g>
        <g opacity={verdict}>
          <Label s="WILL THEY DIE" x={960} y={880} size={56} color="#FFF6DC" align="center" />
          <Label s="WITHIN 4 YEARS" x={960} y={980} size={110} color="#FF5A5A" align="center" stroke={12} />
        </g>
        <AddLight x={960} y={700} r={500} v="#7AC8E8" a={40} />
        <Vignette strength={0.5} />
      </g>
    );
  },
});
