// S21 — WIDE SHOT. The rooftop at sunset. Purple light, the city lit below.
// You stand at the railing, phone held up in one hand — 1 day left.
// (Board: dusk sky + blurred far city + lit blocks + rooftop floor + railing
// at y=700 + string lights across the top. The "1 DAY" is on the screen
// facing him; the narration says it.)
import { defineScene } from '../../../engine/sceneBuilder';
import { AddLight, Block, Blur, FarCity, Line, Night } from '../kit-phone';
import { You, Phone, GripHand } from '../you';
import { DuskSky, StringLights } from '../sets';
import { camFor, fr, bob, mouth, gf } from '../common';
import { SHOT_TIMING } from '../timing';

const ID = 'S21';

const WIDE = fr(1.0, 1.1, [960, 560], [980, 540]);
const CLOSE = fr(1.18, 1.24, [1000, 700], [1000, 700]);
const BLOCKS: [number, number, number, number][] = [
  [-90, 300, 420, 41],
  [200, 260, 340, 42],
  [1500, 280, 380, 43],
  [1800, 260, 460, 44],
];

defineScene({
  id: ID,
  durationSec: SHOT_TIMING[ID].durSec,
  characters: [{ who: 'you', x: 0.5, feetY: 1020 / 1080 }],
  fn: (api) => {
    const t = api.t;
    const g = gf(ID, api.frame);
    const m = mouth(g);
    return (
      <g transform={camFor(ID, t, [WIDE, CLOSE, WIDE, CLOSE, WIDE, CLOSE])}>
        <DuskSky t={t} />
        <Blur sigma={1.8}>
          <FarCity base={1060} seed={12} v="#2A1B4E" />
        </Blur>
        {BLOCKS.map(([bx, bw, bh, sd]) => (
          <Block key={bx} x={bx} w={bw} h={bh} base={1000} seed={sd} lit={0.5} body="#241A3E" dim="#2E2150" />
        ))}
        {/* rooftop floor */}
        <rect x={-900} y={820} width={3720} height={1260} fill="#3A2A4E" />
        <Line x0={-900} y0={820} x1={2820} y1={820} />
        <StringLights x0={120} x1={1800} y={120} sag={46} n={12} t={t} />
        {/* railing behind you (bars 700-820, drawn before you so you stand in front of it) */}
        <Line x0={0} y0={700} x1={1920} y1={700} w={10} v="#18161B" />
        {Array.from({ length: 12 }, (_, i) => 60 + i * 160).map((rx) => (
          <Line key={rx} x0={rx} y0={700} x1={rx} y1={820} w={6} v="#18161B" />
        ))}
        {/* you at the railing, holding the phone up in one hand, looking at it */}
        <ellipse cx={960} cy={1015} rx={80} ry={15} fill="#000" opacity={110 / 255} />
        <You x={960} y={1020} s={0.9} face={0.2} eyes="dot" mouth="smile" brow={0.1}
          arms={['down', 'gesture']} tilt={3} bob={bob(g, 2.2)} light={1} rim="#FFD98A" mouthOpen={m} />
        <Night lights={[
          { kind: 'pool', x: 960, y: 600, r: 800, a: 0.35 },
          { kind: 'oval', x: 960, y: 1010, rx: 400, ry: 110, a: 0.6 },
        ]} ambient="#6A4A8A" />
        <AddLight x={1420} y={560} r={500} v="#FFD98A" a={50} />
        {/* phone held UP in one hand, back to camera — raised to face level on
            the 'gesture' hand (1097,703), OUT from your torso */}
        <Phone cx={1097} cy={703} w={80} h={160} rot={-12} back />
        <GripHand cx={1097} cy={703} rot={-12} s={0.9} />
        <AddLight x={1137} y={703} r={240} v="#FFD98A" a={80} />
      </g>
    );
  },
});
