// S08 — EXTREME CLOSE-UP. Settings: name, size, date — all blank.
import { defineScene } from '../../../engine/sceneBuilder';
import { AddLight, Label, Line } from '../kit-phone';
import { Phone } from '../you';
import { BedroomSet, CloseupBg } from '../sets';
import { camFor, fr } from '../common';
import { SHOT_TIMING } from '../timing';

const ID = 'S08';
const ROWS = ['NAME', 'SIZE', 'INSTALLED'];

defineScene({
  id: ID,
  durationSec: SHOT_TIMING[ID].durSec,
  characters: [],
  fn: (api) => {
    const t = api.t;
    return (
      <g transform={camFor(ID, t, [
        fr(1.0, 1.07, [960, 540], [950, 536]),
        fr(1.12, 1.18, [960, 500], [960, 500]),
        fr(1.18, 1.24, [960, 1000], [960, 1000]),
      ])}>
        <CloseupBg t={t} dx={-900} zoom={1.5} set={<BedroomSet t={t} />} />
        <Phone cx={960} cy={540} w={860} h={1560} />
        {ROWS.map((txt, i) => {
          const yy = 300 + i * 200;
          return (
            <g key={txt}>
              <Label s={txt} x={620} y={yy} size={72} color="#8A93B8" align="left" />
              <Line x0={620} y0={yy + 40} x1={1300} y1={yy + 40} w={4} v="#2A2A38" />
              <Label s="—" x={1300} y={yy} size={72} color="#5A6280" align="right" skew={0} />
            </g>
          );
        })}
        <Label s="47 DAYS  06:11" x={960} y={1040} size={80} color="#7AC8E8" align="center" />
        <AddLight x={960} y={540} r={500} v="#7AC8E8" a={50} />
      </g>
    );
  },
});
