// S01 — MEDIUM WIDE, 3:12 AM. You sit up in bed; the phone glows in your hand.
import { defineScene } from '../../../engine/sceneBuilder';
import { AddLight } from '../kit-phone';
import { You, Phone, GripHand } from '../you';
import { BedroomSet, BedroomNight, Duvet } from '../sets';
import { camFor, fr, bob, mouth, gf, Recline } from '../common';
import { SHOT_TIMING } from '../timing';

const ID = 'S01';

defineScene({
  id: ID,
  durationSec: SHOT_TIMING[ID].durSec,
  characters: [{ who: 'you', x: 0.23, feetY: 822 / 1080 }],
  fn: (api) => {
    const t = api.t;
    const g = gf(ID, api.frame);
    const m = mouth(g);
    const glowPulse = 110 + 20 * Math.sin(t * 2);
    return (
      <g transform={camFor(ID, t, [fr(1.0, 1.08, [960, 548], [948, 544])])}>
        <BedroomSet t={t} />
        <Recline>
          <You x={450} y={822} s={0.95} face={0.3} eyes="wide" mouth="o" brow={1.0} sweat={0.3}
            arms={['down', 'hold']} tilt={15} bob={bob(g)} light={1} rim="#FFE6B0" legs={[]} mouthOpen={m} />
        </Recline>
        <Duvet />
        <BedroomNight />
        <Phone cx={402} cy={620} w={80} h={160} rot={-12} back />
        <GripHand cx={402} cy={620} rot={-12} s={0.95} />
        <AddLight x={402} y={620} r={200} v="#7AC8E8" a={glowPulse} />
        <AddLight x={700} y={180} r={300} v="#BFE8FF" a={40} />
      </g>
    );
  },
});
