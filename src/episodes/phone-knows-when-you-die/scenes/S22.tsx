// S22 — MEDIUM SHOT. You hold the phone up, facing camera. 00:00:00.
// Nothing happens. (Board: the "00:00:00" + "You spent it well." are on the
// screen facing HIM — the narration says them, so no text is drawn here.
// The phone is palm-sized because YOU are drawn big, scale 2.2, close up.)
import { defineScene } from '../../../engine/sceneBuilder';
import { AddLight, Blur, FarCity, Line } from '../kit-phone';
import { You, Phone } from '../you';
import { DuskSky, CloseupBg } from '../sets';
import { camFor, fr, bob, mouth, gf } from '../common';
import { SHOT_TIMING } from '../timing';

const ID = 'S22';

const WIDE = fr(1.0, 1.06, [960, 560], [960, 560]);
const PHONE = fr(1.2, 1.26, [1057, 729], [1057, 729]);
const FACE = fr(1.15, 1.2, [960, 350], [960, 350]);

defineScene({
  id: ID,
  durationSec: SHOT_TIMING[ID].durSec,
  characters: [{ who: 'you', x: 0.5, feetY: 1200 / 1080 }],
  fn: (api) => {
    const t = api.t;
    const g = gf(ID, api.frame);
    const m = mouth(g);
    return (
      <g transform={camFor(ID, t, [WIDE, PHONE, WIDE, FACE, WIDE, PHONE, WIDE, FACE, WIDE])}>
        <CloseupBg
          t={t} dx={-700} zoom={1.5}
          set={
            <g>
              <DuskSky t={t} />
              <Blur sigma={1.8}>
                <FarCity base={700} seed={12} v="#2A1B4E" />
              </Blur>
            </g>
          }
        />
        {/* your face above the phone, looking down at it, awestruck */}
        <You x={960} y={1200} s={2.2} face={0.2} eyes="wide" mouth="o" brow={0.9}
          arms={['down', 'hold']} tilt={4} bob={bob(g, 2.2)} light={-1} rim="#FFD98A" mouthOpen={m} />
        {/* the arm runs from your shoulder to where it slips BEHIND the phone;
            the hand straddles the left edge so you see it holding */}
        <Line x0={1140} y0={551} x1={975} y1={729} w={50} v="#0A0A0C" />
        <Phone cx={1057} cy={729} w={190} h={380} rot={-12} back />
        <circle cx={975} cy={729} r={44} fill="#9A9A9A" />
        <circle cx={975} cy={729} r={40} fill="#0A0A0C" />
        <AddLight x={1152} y={729} r={420} v="#FF5A5A" a={60} />
      </g>
    );
  },
});
