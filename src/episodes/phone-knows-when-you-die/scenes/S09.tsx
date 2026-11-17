// S09 — MEDIUM WIDE. The lock screen lights up by itself, in your hand.
// The phone glow ramps up over the first second — it lights itself.
import { defineScene } from '../../../engine/sceneBuilder';
import { AddLight } from '../kit-phone';
import { You, Phone, GripHand } from '../you';
import { BedroomSet, BedroomNight, Duvet } from '../sets';
import { camFor, fr, bob, mouth, gf, Recline } from '../common';
import { SHOT_TIMING } from '../timing';
import { clamp, easeInOut } from '../../../engine/anim';

const ID = 'S09';

defineScene({
  id: ID,
  durationSec: SHOT_TIMING[ID].durSec,
  characters: [{ who: 'you', x: 0.23, feetY: 822 / 1080 }],
  fn: (api) => {
    const t = api.t;
    const g = gf(ID, api.frame);
    const m = mouth(g);
    const lightUp = easeInOut(clamp(t / 1.0)) * 140;
    return (
      <g transform={camFor(ID, t, [
        fr(1.0, 1.08, [960, 548], [948, 544]),
        fr(1.15, 1.22, [520, 600], [500, 600]),
        fr(1.28, 1.34, [400, 620], [400, 620]),
        fr(1.05, 1.08, [960, 548], [948, 544]),
      ])}>
        <BedroomSet t={t} />
        <Recline>
          <You x={450} y={822} s={0.95} face={0.3} eyes="wide" mouth="o" brow={1.0}
            arms={['down', 'hold']} tilt={15} bob={bob(g)} light={1} rim="#FFE6B0" legs={[]} mouthOpen={m} />
        </Recline>
        <Duvet />
        <BedroomNight />
        <Phone cx={402} cy={620} w={80} h={160} rot={-12} back />
        <GripHand cx={402} cy={620} rot={-12} s={0.95} />
        <AddLight x={402} y={620} r={240} v="#7AC8E8" a={lightUp} />
      </g>
    );
  },
});
