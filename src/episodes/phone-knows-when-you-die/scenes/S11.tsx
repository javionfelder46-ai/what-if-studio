// S11 — EXTREME CLOSE-UP. The app's history. Every prediction, right.
// The rows appear one at a time, each with its green check.
import { defineScene } from '../../../engine/sceneBuilder';
import { AddLight, Label, Line, Vignette } from '../kit-phone';
import { Phone } from '../you';
import { DayRoom, CloseupBg } from '../sets';
import { camFor, fr } from '../common';
import { SHOT_TIMING } from '../timing';
import { clamp, easeInOut } from '../../../engine/anim';

const ID = 'S11';
const ROWS = ['TUE 4:02 PM — RAIN', 'FRI — BUS 22 MIN LATE', '2 WKS — DINNER CANCELED', 'LAST YEAR — A NAME'];

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
        fr(1.18, 1.22, [960, 700], [960, 700]),
        fr(1.22, 1.26, [960, 1000], [960, 1000]),
      ])}>
        <CloseupBg t={t} dx={-900} zoom={1.5} set={<DayRoom t={t} />} />
        <Phone cx={960} cy={540} w={860} h={1560} />
        <Label s="HISTORY" x={960} y={260} size={84} color="#F2C14E" align="center" />
        {ROWS.map((txt, i) => {
          const yy = 420 + i * 170;
          const o = easeInOut(clamp((t - (1.0 + i * 1.6)) / 0.5));
          return (
            <g key={txt} opacity={o}>
              <Label s={txt} x={620} y={yy} size={48} color="#FFF6DC" align="left" />
              <circle cx={1300} cy={yy - 18} r={24} fill="#B8F04A" />
              <Line x0={1289} y0={yy - 18} x1={1298} y1={yy - 8} w={6} v="#18161B" />
              <Line x0={1298} y0={yy - 8} x1={1313} y1={yy - 28} w={6} v="#18161B" />
              {i < 3 ? <Line x0={620} y0={yy + 50} x1={1320} y1={yy + 50} w={3} v="#2A2A38" /> : null}
            </g>
          );
        })}
        <Label s="47 DAYS" x={960} y={1040} size={64} color="#7AC8E8" align="center" />
        <AddLight x={960} y={540} r={500} v="#7AC8E8" a={50} />
        <Vignette strength={0.35} />
      </g>
    );
  },
});
