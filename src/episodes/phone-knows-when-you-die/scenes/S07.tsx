// S07 — MEDIUM SHOT. The app is back. You hold it up in one hand, shocked.
import { defineScene } from '../../../engine/sceneBuilder';
import { AddLight } from '../kit-phone';
import { You, Phone, GripHand } from '../you';
import { BedroomSet, BedroomNight, Duvet } from '../sets';
import { camFor, fr, bob, mouth, gf, Recline } from '../common';
import { SHOT_TIMING } from '../timing';

const ID = 'S07';

defineScene({
  id: ID,
  durationSec: SHOT_TIMING[ID].durSec,
  characters: [{ who: 'you', x: 0.23, feetY: 822 / 1080 }],
  fn: (api) => {
    const t = api.t;
    const g = gf(ID, api.frame);
    const m = mouth(g);
    return (
      <g transform={camFor(ID, t, [fr(1.0, 1.07, [960, 540], [950, 536])])}>
        <BedroomSet t={t} />
        <Recline>
          <You x={450} y={822} s={1.0} face={0.4} eyes="wide" mouth="o" brow={1.0}
            arms={['down', 'hold']} tilt={15} bob={bob(g, 2.2)} light={-1} rim="#FFE6B0" legs={[]} mouthOpen={m} />
        </Recline>
        <Duvet />
        <BedroomNight />
        <Phone cx={399} cy={609} w={85} h={170} rot={-12} back />
        <GripHand cx={399} cy={609} rot={-12} s={1.0} />
        <AddLight x={399} y={609} r={200} v="#7AC8E8" a={110} />
      </g>
    );
  },
});
