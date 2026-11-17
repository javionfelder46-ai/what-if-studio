// S02 — TOP-DOWN INSERT. The phone on the nightstand, screen glowing in the dark.
import { defineScene } from '../../../engine/sceneBuilder';
import { AddLight, Blur, Circ, Label, Line, Night, RRect } from '../kit-phone';
import { Phone } from '../you';
import { camFor, fr } from '../common';
import { SHOT_TIMING } from '../timing';

const ID = 'S02';

defineScene({
  id: ID,
  durationSec: SHOT_TIMING[ID].durSec,
  characters: [],
  fn: (api) => {
    const t = api.t;
    return (
      <g transform={camFor(ID, t, [fr(1.0, 1.04, [960, 540], [960, 540])])}>
        {/* the whole frame IS the nightstand surface, seen from above */}
        <rect x={-900} y={-600} width={2820} height={2280} fill="#7C4E2C" />
        {Array.from({ length: 18 }, (_, k) => {
          const yy = -600 + k * 130;
          return <line key={k} x1={-900} y1={yy} x2={1920 + 900} y2={yy} stroke="#6A3E22" strokeWidth={3} opacity={120 / 255} />;
        })}
        {/* glass of water + book + bedside clock */}
        <RRect x0={300} y0={300} x1={380} y1={460} fill="#BFE8FF" w={6 * 0.6} />
        <rect x={312} y={340} width={56} height={110} fill="#DFF4FF" opacity={120 / 255} />
        <RRect x0={1420} y0={700} x1={1660} y1={780} fill="#7A3A6E" w={6 * 0.8} />
        <Line x0={1440} y0={740} x1={1640} y1={740} w={3} />
        <Circ x={1560} y={300} r={60} fill="#F4EFE2" />
        <Line x0={1560} y0={300} x1={1592} y1={300} w={6 * 0.8} />
        <Line x0={1560} y0={300} x1={1570} y1={256} w={6 * 0.8} />
        <circle cx={1560} cy={300} r={5} fill="#18161B" />
        <Label s="3:12" x={1560} y={400} size={44} color="#FFF6DC" align="center" />
        {/* the phone, flat on the surface, screen up */}
        <Blur sigma={20}>
          <ellipse cx={960} cy={550} rx={260} ry={210} fill="#7AC8E8" opacity={60 / 255} />
        </Blur>
        <Phone
          cx={960} cy={540} w={520} h={940}
          lines={[
            { txt: '47 DAYS', size: 92, col: '#7AC8E8', dy: -260 },
            { txt: '6 HRS 14 MIN', size: 64, col: '#FFF6DC', dy: -140 },
            { txt: 'This app has', size: 52, col: '#FFD98A', dy: 40 },
            { txt: 'never been', size: 52, col: '#FFD98A', dy: 110 },
            { txt: 'wrong.', size: 52, col: '#FFD98A', dy: 180 },
          ]}
        />
        <Night lights={[{ kind: 'pool', x: 960, y: 540, r: 700, a: 0.5 }]} />
        <AddLight x={960} y={540} r={500} v="#7AC8E8" a={70} />
      </g>
    );
  },
});
