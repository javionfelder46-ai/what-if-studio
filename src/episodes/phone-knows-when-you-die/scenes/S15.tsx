// S15 — MEDIUM WIDE. You walk home the long way, past the park, purple sky.
// The legs cycle (board walk_legs rate) and the park drifts past — the
// background moves with the walk, the character doesn't walk in place.
import { defineScene } from '../../../engine/sceneBuilder';
import { AddLight, Blur, FarCity, Night, Poly, RRect } from '../kit-phone';
import { You, walkLegs } from '../you';
import { DuskSky, StringLights } from '../sets';
import { camFor, fr, mouth, gf } from '../common';
import { SHOT_TIMING } from '../timing';

const ID = 'S15';

const Tree: React.FC<{ tx: number; s: number }> = ({ tx, s }) => (
  <g>
    <RRect x0={tx - 15} y0={650} x1={tx + 15} y1={820} fill="#4A3226" w={6 * 0.8} />
    <circle cx={tx} cy={560} r={120 * s} fill="#3E6B3E" />
    <circle cx={tx - 70 * s} cy={620} r={80 * s} fill="#356135" />
    <circle cx={tx + 70 * s} cy={620} r={80 * s} fill="#356135" />
  </g>
);

defineScene({
  id: ID,
  durationSec: SHOT_TIMING[ID].durSec,
  characters: [{ who: 'you', x: 0.5, feetY: 1020 / 1080 }],
  fn: (api) => {
    const t = api.t;
    const g = gf(ID, api.frame);
    const m = mouth(g);
    const phase = t * 10; // board walk rate
    const drift = -t * 18; // park scrolls past as he walks
    return (
      <g transform={camFor(ID, t, [
        fr(1.0, 1.08, [960, 548], [948, 544]),
        fr(1.2, 1.26, [960, 800], [960, 800]),
      ])}>
        <DuskSky t={t} />
        <g transform={`translate(${drift * 0.4} 0)`}>
          <Blur sigma={1.8}>
            <FarCity base={860} seed={15} v="#2A1B4E" />
          </Blur>
        </g>
        <g transform={`translate(${drift} 0)`}>
          <rect x={-900} y={820} width={3720} height={1260} fill="#2E4A2E" />
          <line x1={-900} y1={820} x2={2820} y2={820} stroke="#18161B" strokeWidth={6} />
          <Poly pts={[[820, 1080], [960, 820], [1100, 1080]]} fill="#8A7A5A" w={6 * 0.6} />
          <Tree tx={300} s={1.0} />
          <Tree tx={1620} s={1.1} />
          <RRect x0={1150} y0={780} x1={1400} y1={810} fill="#6E4426" />
          <RRect x0={1170} y0={810} x1={1190} y1={860} fill="#6E4426" w={6 * 0.8} />
          <RRect x0={1360} y0={810} x1={1380} y1={860} fill="#6E4426" w={6 * 0.8} />
          <StringLights x0={300} x1={1620} y={300} sag={60} n={12} t={t} />
        </g>
        {/* you walking mid-stride, looking up at the sky */}
        <ellipse cx={960} cy={1015} rx={110} ry={15} fill="#000" opacity={110 / 255} />
        <You x={960} y={1020} s={0.95} face={0.1} eyes="dot" mouth="smile" brow={0.1}
          arms={['down', 'down']} tilt={-8} bob={6 * Math.abs(Math.sin(phase))}
          light={-1} rim="#FFD98A" legs={walkLegs(phase)} mouthOpen={m} />
        <Night lights={[
          { kind: 'pool', x: 960, y: 600, r: 800, a: 0.4 },
          { kind: 'oval', x: 960, y: 1010, rx: 420, ry: 110, a: 0.65 },
        ]} ambient="#6A4A8A" />
        <AddLight x={1420} y={560} r={400} v="#FFD98A" a={50} />
      </g>
    );
  },
});
