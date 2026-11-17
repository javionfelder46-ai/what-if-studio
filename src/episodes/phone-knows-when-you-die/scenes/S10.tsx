// S10 — SCHEMATIC. Your phone knows your body: heart, steps, sleep, one trail.
// The 100,000 counts up over the first two seconds; the heart beats.
import { defineScene } from '../../../engine/sceneBuilder';
import { AddLight, Label, Line, Moon, Oval, Poly, Vignette } from '../kit-phone';
import { Phone } from '../you';
import { camFor, fr } from '../common';
import { SHOT_TIMING } from '../timing';
import { clamp, easeOut } from '../../../engine/anim';

const ID = 'S10';

defineScene({
  id: ID,
  durationSec: SHOT_TIMING[ID].durSec,
  characters: [],
  fn: (api) => {
    const t = api.t;
    const count = Math.round(100000 * easeOut(clamp(t / 2)));
    const beat = 1 + 0.05 * Math.sin(t * 2 * Math.PI * 1.1);
    return (
      <g transform={camFor(ID, t, [
        fr(1.0, 1.03, [960, 540], [960, 540]),
        fr(1.2, 1.25, [960, 900], [960, 900]),
        fr(1.25, 1.3, [960, 300], [960, 300]),
      ])}>
        <rect x={-900} y={-600} width={3720} height={2280} fill="#0A1136" />
        {Array.from({ length: 12 }, (_, i) => (
          <line key={`v${i}`} x1={i * 180} y1={-600} x2={i * 180} y2={1680} stroke="#1A2560" strokeWidth={2} opacity={100 / 255} />
        ))}
        {Array.from({ length: 7 }, (_, j) => (
          <line key={`h${j}`} x1={-900} y1={j * 180} x2={2820} y2={j * 180} stroke="#1A2560" strokeWidth={2} opacity={100 / 255} />
        ))}
        <Label s={count.toLocaleString('en-US')} x={960} y={300} size={120} color="#FF5A5A" align="center" />
        <Label s="HEARTBEATS A DAY" x={960} y={380} size={54} color="#FFF6DC" align="center" />
        {/* heart icon (left) — beats */}
        <g transform={`translate(420 550) scale(${beat}) translate(-420 -550)`}>
          <path d="M 420 630 C 330 560 340 470 420 520 C 500 470 510 560 420 630 Z" fill="#FF5A5A" stroke="#18161B" strokeWidth={6} strokeLinejoin="round" />
        </g>
        {/* steps icon: footprint (middle) */}
        <Oval x0={930} y0={480} x1={990} y1={570} fill="#B8F04A" w={6 * 0.7} />
        {[[935, 472], [955, 462], [975, 462], [990, 472]].map(([tx, ty], i) => (
          <circle key={i} cx={tx} cy={ty} r={10} fill="#B8F04A" />
        ))}
        {/* sleep icon: moon (right) */}
        <Moon x={1500} y={520} r={44} />
        <Label s="HEART" x={420} y={680} size={44} color="#FFF6DC" align="center" />
        <Label s="STEPS" x={960} y={680} size={44} color="#FFF6DC" align="center" />
        <Label s="SLEEP" x={1500} y={680} size={44} color="#FFF6DC" align="center" />
        {/* arrows converge on the phone */}
        {[[420, 700, 860, 770], [960, 700, 960, 750], [1500, 700, 1060, 770]].map(([ax0, ay0, ax1, ay1], i) => (
          <g key={i}>
            <Line x0={ax0} y0={ay0} x1={ax1} y1={ay1} w={6} v="#7AC8E8" />
            <Poly pts={[[ax1 - 14, ay1 - 12], [ax1 + 14, ay1 - 12], [ax1, ay1 + 10]]} fill="#7AC8E8" w={0} />
          </g>
        ))}
        <Phone cx={960} cy={900} w={200} h={300} lines={[{ txt: 'SCORE', size: 40, col: '#7AC8E8', dy: 0 }]} />
        <AddLight x={960} y={900} r={300} v="#7AC8E8" a={60} />
        <Vignette strength={0.5} />
      </g>
    );
  },
});
