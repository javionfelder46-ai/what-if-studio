// S05 — MEDIUM SHOT. You sit up in bed, the phone warm in one hand.
import { defineScene } from '../../../engine/sceneBuilder';
import { AddLight } from '../kit-phone';
import { You, Phone, GripHand } from '../you';
import { BedroomSet, BedroomNight, Duvet } from '../sets';
import { camFor, fr, bob, mouth, gf, Recline } from '../common';
import { SHOT_TIMING } from '../timing';

const ID = 'S05';

defineScene({
  id: ID,
  durationSec: SHOT_TIMING[ID].durSec,
  characters: [{ who: 'you', x: 0.23, feetY: 822 / 1080 }],
  fn: (api) => {
    const t = api.t;
    const g = gf(ID, api.frame);
    const m = mouth(g);
    return (
      <g transform={camFor(ID, t, [
        fr(1.0, 1.07, [960, 540], [950, 536]),
        fr(1.15, 1.22, [520, 600], [500, 600]),
        fr(1.28, 1.34, [400, 620], [400, 620]),
      ])}>
        <BedroomSet t={t} />
        <Recline>
          <You x={450} y={822} s={0.95} face={0.3} eyes="dot" mouth="flat" brow={0.8}
            arms={['down', 'hold']} tilt={15} bob={bob(g)} light={1} rim="#FFE6B0" legs={[]} mouthOpen={m} />
        </Recline>
        <Duvet />
        <BedroomNight />
        <Phone cx={402} cy={620} w={80} h={160} rot={-12} back />
        <GripHand cx={402} cy={620} rot={-12} s={0.95} />
        <AddLight x={402} y={620} r={200} v="#7AC8E8" a={100} />
      </g>
    );
  },
});
