// S18 — MEDIUM SHOT. Thursday: the number moves UP. 47 becomes 52.
// The phone is in one hand AT YOUR SIDE — out from the torso, not a sign.
import { defineScene } from '../../../engine/sceneBuilder';
import { AddLight, Vignette } from '../kit-phone';
import { You, Phone, GripHand } from '../you';
import { DayRoom } from '../sets';
import { camFor, fr, bob, mouth, gf } from '../common';
import { SHOT_TIMING } from '../timing';

const ID = 'S18';

defineScene({
  id: ID,
  durationSec: SHOT_TIMING[ID].durSec,
  characters: [{ who: 'you', x: 0.5, feetY: 1150 / 1080 }],
  fn: (api) => {
    const t = api.t;
    const g = gf(ID, api.frame);
    const m = mouth(g);
    return (
      <g transform={camFor(ID, t, [
        fr(1.0, 1.07, [960, 540], [950, 536]),
        fr(1.22, 1.28, [1094, 915], [1094, 915]),
      ])}>
        <DayRoom t={t} />
        <You x={960} y={1150} s={1.4} face={0.2} eyes="wide" mouth="o" brow={0.8}
          arms={['down', 'down']} tilt={-2} bob={bob(g, 2.2)} light={-1} rim="#FFE6B0" mouthOpen={m} />
        <Phone cx={1094} cy={915} w={80} h={160} rot={-12} back />
        <GripHand cx={1094} cy={915} rot={-12} s={1.4} />
        <AddLight x={1154} y={915} r={300} v="#B8F04A" a={40} />
        <Vignette strength={0.35} />
      </g>
    );
  },
});
