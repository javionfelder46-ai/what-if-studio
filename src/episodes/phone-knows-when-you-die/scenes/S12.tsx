// S12 — EXTREME CLOSE-UP. The one from last year. Your face fills the frame.
import { defineScene } from '../../../engine/sceneBuilder';
import { AddLight } from '../kit-phone';
import { You } from '../you';
import { BedroomSet, CloseupBg } from '../sets';
import { camFor, fr, bob, mouth, gf } from '../common';
import { SHOT_TIMING } from '../timing';

const ID = 'S12';

defineScene({
  id: ID,
  durationSec: SHOT_TIMING[ID].durSec,
  characters: [{ who: 'you', x: 0.5, feetY: 2550 / 1080 }],
  fn: (api) => {
    const t = api.t;
    const g = gf(ID, api.frame);
    const m = mouth(g);
    return (
      <g transform={camFor(ID, t, [
        fr(1.0, 1.05, [960, 620], [960, 620]),
        fr(1.1, 1.16, [960, 620], [960, 620]),
      ])}>
        <CloseupBg t={t} dx={-900} zoom={1.5} set={<BedroomSet t={t} />} />
        <You x={960} y={2550} s={4.6} face={0.05} eyes="wide" mouth="open" brow={1.0} browTilt={0.6}
          sweat={0.6} tilt={2} bob={bob(g, 2.2)} light={-1} rim="#7AC8E8" mouthOpen={m} />
        <AddLight x={960} y={500} r={700} v="#7AC8E8" a={36} />
      </g>
    );
  },
});
