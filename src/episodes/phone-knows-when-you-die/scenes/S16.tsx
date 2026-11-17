// S16 — MEDIUM SHOT. Dinner at the table. You actually taste it.
// The candle flickers; the phone lies flat on the tabletop.
import { defineScene } from '../../../engine/sceneBuilder';
import { AddLight, Night, Oval, RRect, Sky } from '../kit-phone';
import { You } from '../you';
import { DuskSky } from '../sets';
import { camFor, fr, bob, mouth, gf } from '../common';
import { SHOT_TIMING } from '../timing';

const ID = 'S16';

defineScene({
  id: ID,
  durationSec: SHOT_TIMING[ID].durSec,
  characters: [{ who: 'you', x: 0.5, feetY: 1020 / 1080 }],
  fn: (api) => {
    const t = api.t;
    const g = gf(ID, api.frame);
    const m = mouth(g);
    const flicker = 130 + 25 * Math.sin(t * 7) + 10 * Math.sin(t * 13);
    return (
      <g transform={camFor(ID, t, [
        fr(1.0, 1.07, [960, 540], [950, 536]),
        fr(1.18, 1.24, [1100, 850], [1100, 850]),
      ])}>
        {/* warm kitchen: wall, dusk window (left), table */}
        <Sky top="#4A3048" bot="#2A1A30" h={1080} />
        <defs>
          <clipPath id="s16-win">
            <rect x={140} y={96} width={600} height={524} />
          </clipPath>
        </defs>
        <g clipPath="url(#s16-win)">
          <DuskSky t={t} />
        </g>
        <RRect x0={118} y0={74} x1={762} y1={96} fill="#3B2416" w={6 * 0.8} />
        <RRect x0={118} y0={620} x1={762} y1={642} fill="#3B2416" w={6 * 0.8} />
        <RRect x0={118} y0={96} x1={140} y1={620} fill="#3B2416" w={6 * 0.8} />
        <RRect x0={740} y0={96} x1={762} y1={620} fill="#3B2416" w={6 * 0.8} />
        <line x1={440} y1={96} x2={440} y2={620} stroke="#18161B" strokeWidth={14} />
        {/* you behind the table — head + shoulders + chest above the table top */}
        <ellipse cx={960} cy={1025} rx={100} ry={15} fill="#000" opacity={110 / 255} />
        <You x={960} y={1020} s={1.0} face={0.05} eyes="dot" mouth="smile" brow={0.1}
          arms={['down', 'down']} tilt={2} bob={bob(g, 2.2)} light={-1} rim="#FFE6B0" mouthOpen={m} />
        {/* table (covers your lower body) */}
        <RRect x0={240} y0={780} x1={1680} y1={1060} fill="#6E4426" />
        <RRect x0={240} y0={780} x1={1680} y1={820} fill="#8E5C36" w={6 * 0.6} />
        {/* plate + food + glass + candle + phone face-down */}
        <Oval x0={700} y0={830} x1={1000} y1={920} fill="#F4EFE2" />
        {[[800, 870, 34, '#E8A04A'], [870, 880, 28, '#D86A3A'], [920, 865, 24, '#4E8A4E'], [840, 895, 20, '#E8A04A']].map(([fx, fy, fr_, fc], i) => (
          <circle key={i} cx={fx as number} cy={fy as number} r={fr_ as number} fill={fc as string} />
        ))}
        <RRect x0={1150} y0={830} x1={1210} y1={920} fill="#BFE8FF" w={6 * 0.8} />
        <rect x={1160} y={860} width={40} height={55} fill="#DFF4FF" opacity={140 / 255} />
        <RRect x0={1080} y0={850} x1={1100} y1={900} fill="#F4EFE2" w={6 * 0.7} />
        <circle cx={1090} cy={832} r={13} fill="#FFD98A" />
        <AddLight x={1090} y={830} r={120} v="#FFD98A" a={flicker} />
        <RRect x0={1300} y0={766} x1={1450} y1={788} fill="#1E1E28" w={6 * 0.8} r={8} />
        <Night lights={[
          { kind: 'pool', x: 960, y: 600, r: 800, a: 0.5 },
          { kind: 'oval', x: 960, y: 1010, rx: 420, ry: 110, a: 0.65 },
        ]} />
        <AddLight x={960} y={500} r={400} v="#FFD98A" a={60} />
      </g>
    );
  },
});
