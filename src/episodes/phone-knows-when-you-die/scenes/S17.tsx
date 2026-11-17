// S17 — CLOSE-UP. That night you check the number. 46 days. Puzzled.
// The arm bends at the elbow (a straight line read as a pole, not an arm).
import { defineScene } from '../../../engine/sceneBuilder';
import { AddLight, Line } from '../kit-phone';
import { You, Phone } from '../you';
import { BedroomSet, CloseupBg } from '../sets';
import { camFor, fr, bob, mouth, gf } from '../common';
import { SHOT_TIMING } from '../timing';

const ID = 'S17';

defineScene({
  id: ID,
  durationSec: SHOT_TIMING[ID].durSec,
  characters: [{ who: 'you', x: 0.4, feetY: 1975 / 1080 }],
  fn: (api) => {
    const t = api.t;
    const g = gf(ID, api.frame);
    const m = mouth(g);
    return (
      <g transform={camFor(ID, t, [
        fr(1.0, 1.06, [960, 560], [960, 560]),
        fr(1.2, 1.26, [1420, 620], [1420, 620]),
        fr(1.1, 1.16, [960, 560], [960, 560]),
      ])}>
        <CloseupBg t={t} dx={-900} zoom={1.5} set={<BedroomSet t={t} />} />
        <You x={760} y={1975} s={3.4} face={0.3} eyes="dot" mouth="flat" brow={0.9} browTilt={0.5}
          tilt={3} bob={bob(g, 2.2)} light={-1} rim="#7AC8E8" mouthOpen={m} />
        <Phone
          cx={1420} cy={620} w={420} h={760}
          lines={[
            { txt: '46', size: 200, col: '#7AC8E8', dy: -180 },
            { txt: 'DAYS', size: 90, col: '#FFF6DC', dy: -40 },
          ]}
        />
        {/* hand grips the phone's edge — forearm bent at the elbow */}
        <Line x0={1039} y0={972} x1={1180} y1={850} w={44} v="#0A0A0C" />
        <Line x0={1180} y0={850} x1={1210} y1={620} w={44} v="#0A0A0C" />
        <circle cx={1210} cy={620} r={30} fill="#0A0A0C" />
        <AddLight x={1420} y={620} r={380} v="#7AC8E8" a={70} />
      </g>
    );
  },
});
