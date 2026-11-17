// S06 — EXTREME CLOSE-UP. Your finger holds the strange icon; the little X
// appears, you tap it, the delete dialog fades in.
import { defineScene } from '../../../engine/sceneBuilder';
import { AddLight, Label, RRect, Circ, Line } from '../kit-phone';
import { Phone } from '../you';
import { BedroomSet, CloseupBg } from '../sets';
import { camFor, fr } from '../common';
import { SHOT_TIMING } from '../timing';
import { clamp, easeInOut } from '../../../engine/anim';

const ID = 'S06';
const ICON_COLS = ['#7AC8E8', '#B8F04A', '#F2C14E', '#D86A6A', '#8A7AB8', '#4E8A4E', '#E8A04A', '#5A93C8'];
const ICON_POS: [number, number][] = [[700, 300], [960, 300], [1220, 300], [700, 460], [1220, 460], [700, 620], [960, 620], [1220, 620]];

defineScene({
  id: ID,
  durationSec: SHOT_TIMING[ID].durSec,
  characters: [],
  fn: (api) => {
    const t = api.t;
    // the X appears at ~1.5s, the dialog at ~3.5s; the fingertip presses at ~3s
    const xO = easeInOut(clamp((t - 1.5) / 0.5));
    const dO = easeInOut(clamp((t - 3.5) / 0.5));
    const press = easeInOut(clamp((t - 3.0) / 0.4)) * 10;
    return (
      <g transform={camFor(ID, t, [fr(1.0, 1.07, [960, 540], [950, 536])])}>
        <CloseupBg t={t} dx={-900} zoom={1.5} set={<BedroomSet t={t} />} />
        <Phone cx={960} cy={540} w={860} h={1560} />
        {ICON_POS.map(([ix, iy], k) => (
          <RRect key={k} x0={ix - 55} y0={iy - 55} x1={ix + 55} y1={iy + 55} fill={ICON_COLS[k]} w={6 * 0.7} r={20} />
        ))}
        {/* the strange icon at the centre, with a red X and badge */}
        <RRect x0={905} y0={405} x1={1015} y1={515} fill="#000000" w={6 * 0.7} r={20} />
        <g opacity={xO}>
          <Line x0={920} y0={420} x1={1000} y1={500} w={8} v="#FF5A5A" />
          <Line x0={1000} y0={420} x1={920} y1={500} w={8} v="#FF5A5A" />
          <Circ x={1025} y={405} r={30} fill="#C8242C" w={6 * 0.6} />
          <Line x0={1013} y0={393} x1={1037} y1={417} w={6} v="#FFFFFF" />
          <Line x0={1037} y0={393} x1={1013} y1={417} w={6} v="#FFFFFF" />
        </g>
        {/* delete confirm dialog */}
        <g opacity={dO}>
          <RRect x0={660} y0={780} x1={1260} y1={950} fill="#F4EFE2" r={18} />
          <Label s="DELETE?" x={960} y={860} size={64} color="#18161B" align="center" />
          <Label s="Are you sure?" x={960} y={920} size={44} color="#5A6280" align="center" />
        </g>
        <Label s="47 DAYS  06:12" x={960} y={1040} size={56} color="#7AC8E8" align="center" />
        {/* fingertip, pressing the strange icon */}
        <circle cx={1000} cy={500 + press} r={44} fill="#0A0A0C" />
        <AddLight x={960} y={540} r={500} v="#7AC8E8" a={50} />
      </g>
    );
  },
});
