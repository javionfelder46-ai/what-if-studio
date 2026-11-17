// S20 — CLOSE-UP. The real question. Do you have one day left, or fifty-eight?
// Viewer question #2 lands here ("would you believe it?").
import { defineScene } from '../../../engine/sceneBuilder';
import { AddLight } from '../kit-phone';
import { You } from '../you';
import { DayRoom, CloseupBg } from '../sets';
import { camFor, fr, bob, mouth, gf } from '../common';
import { SHOT_TIMING } from '../timing';

const ID = 'S20';

const FACE = fr(1.0, 1.06, [960, 620], [960, 620]);
const TIGHT = fr(1.12, 1.18, [960, 620], [960, 620]);

defineScene({
  id: ID,
  durationSec: SHOT_TIMING[ID].durSec,
  characters: [{ who: 'you', x: 0.5, feetY: 2550 / 1080 }],
  fn: (api) => {
    const t = api.t;
    const g = gf(ID, api.frame);
    const m = mouth(g);
    return (
      <g transform={camFor(ID, t, [FACE, TIGHT, FACE, TIGHT, FACE, TIGHT, FACE])}>
        <CloseupBg t={t} dx={-900} zoom={1.5} set={<DayRoom t={t} />} />
        <You x={960} y={2550} s={4.6} face={0.05} eyes="dot" mouth="flat" brow={1.0} browTilt={0.5}
          tilt={2} bob={bob(g, 2.2)} light={-1} rim="#FFD98A" mouthOpen={m} />
        <AddLight x={960} y={500} r={700} v="#FFD98A" a={36} />
      </g>
    );
  },
});
