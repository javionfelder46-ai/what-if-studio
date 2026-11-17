// S14 — MEDIUM SHOT. You call your mom. Phone to your ear, warm light.
// The left arm RISES from down to the ear over the first second (planned:
// picking the phone up to call), the phone follows the hand.
import { defineScene } from '../../../engine/sceneBuilder';
import { AddLight, Night, RRect, Shape, Sky } from '../kit-phone';
import { You, armBlend } from '../you';
import { DuskSky } from '../sets';
import { camFor, fr, bob, mouth, gf } from '../common';
import { SHOT_TIMING } from '../timing';
import { clamp, easeInOut } from '../../../engine/anim';

const ID = 'S14';

defineScene({
  id: ID,
  durationSec: SHOT_TIMING[ID].durSec,
  characters: [{ who: 'you', x: 0.5, feetY: 1030 / 1080 }],
  fn: (api) => {
    const t = api.t;
    const g = gf(ID, api.frame);
    const m = mouth(g);
    const k = easeInOut(clamp(t / 1.0));
    const armL = armBlend('down', 'hat', k);
    // phone follows the left hand as it rises — but lands on the board's
    // fixed ear position (880,545): the hand sits on the phone's upper-left,
    // 34px left and 45px above the phone centre at full raise.
    const handX = 960 + armL.h[0] * 1.1 + 34;
    const handY = 1030 + armL.h[1] * 1.1 + 45;
    return (
      <g transform={camFor(ID, t, [
        fr(1.0, 1.07, [960, 540], [950, 536]),
        fr(1.18, 1.24, [960, 600], [960, 600]),
        fr(1.0, 1.07, [960, 540], [950, 536]),
        fr(1.18, 1.24, [960, 600], [960, 600]),
        fr(1.0, 1.07, [960, 540], [950, 536]),
        fr(1.18, 1.24, [960, 600], [960, 600]),
      ])}>
        {/* warm evening living room: purple wall, dusk window, sofa, floor lamp */}
        <Sky top="#3A2A55" bot="#241A3E" h={1080} />
        <defs>
          <clipPath id="s14-win">
            <rect x={1180} y={96} width={600} height={524} />
          </clipPath>
        </defs>
        <g clipPath="url(#s14-win)">
          <DuskSky t={t} />
        </g>
        <RRect x0={1158} y0={74} x1={1802} y1={96} fill="#3B2416" w={6 * 0.8} />
        <RRect x0={1158} y0={620} x1={1802} y1={642} fill="#3B2416" w={6 * 0.8} />
        <RRect x0={1158} y0={96} x1={1180} y1={620} fill="#3B2416" w={6 * 0.8} />
        <RRect x0={1780} y0={96} x1={1802} y1={620} fill="#3B2416" w={6 * 0.8} />
        <line x1={1480} y1={96} x2={1480} y2={620} stroke="#18161B" strokeWidth={14} />
        {/* sofa (left) */}
        <RRect x0={120} y0={780} x1={900} y1={1060} fill="#7A3A6E" />
        <RRect x0={120} y0={700} x1={900} y1={800} fill="#8A4A7E" />
        <RRect x0={120} y0={700} x1={200} y1={800} fill="#6E2A5E" w={6 * 0.8} />
        {/* floor lamp (left of you) */}
        <line x1={420} y1={1060} x2={420} y2={560} stroke="#18161B" strokeWidth={12} />
        <Shape d="M 360 562 C 372 500 468 500 480 562 Z" fill="#F2C14E" />
        <AddLight x={420} y={560} r={260} v="#FFD98A" a={120} />
        {/* you, phone to ear, eyes closed, small warm smile */}
        <ellipse cx={960} cy={1025} rx={100} ry={15} fill="#000" opacity={110 / 255} />
        <You x={960} y={1030} s={1.1} face={0.1} eyes="closed" mouth="smile" brow={0.1}
          arms={['down', 'down']} armLBlend={armL} tilt={-3} bob={bob(g, 2.2)} light={1} rim="#FFE6B0" mouthOpen={m} />
        {/* phone at your ear, following the hand */}
        <g transform={`translate(${handX} ${handY}) rotate(-14)`}>
          <rect x={-38} y={-75} width={76} height={150} rx={14} fill="#1E1E28" stroke="#18161B" strokeWidth={6} />
          <rect x={-30} y={-66} width={60} height={132} rx={10} fill="#05070F" stroke="#18161B" strokeWidth={3} />
        </g>
        <Night lights={[
          { kind: 'pool', x: 960, y: 600, r: 800, a: 0.5 },
          { kind: 'oval', x: 960, y: 1020, rx: 420, ry: 110, a: 0.65 },
        ]} />
        <AddLight x={420} y={560} r={300} v="#FFD98A" a={90} />
      </g>
    );
  },
});
