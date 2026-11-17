// S03 — EXTREME CLOSE-UP. The countdown fills the frame: 47 DAYS, 06:14:00.
// The seconds tick down with the narration (06:14:00 -> 06:13:51).
import { defineScene } from '../../../engine/sceneBuilder';
import { AddLight, Vignette } from '../kit-phone';
import { Phone } from '../you';
import { camFor, fr } from '../common';
import { SHOT_TIMING } from '../timing';

const ID = 'S03';

const fmt = (totalSec: number) => {
  const s = Math.max(0, Math.floor(totalSec));
  const hh = String(Math.floor(s / 3600)).padStart(2, '0');
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
};

defineScene({
  id: ID,
  durationSec: SHOT_TIMING[ID].durSec,
  characters: [],
  fn: (api) => {
    const t = api.t;
    const countdown = fmt(6 * 3600 + 14 * 60 - t);
    return (
      <g transform={camFor(ID, t, [fr(1.0, 1.04, [960, 540], [960, 540])])}>
        <rect x={-900} y={-600} width={3720} height={2280} fill="#05070F" />
        <Phone
          cx={960} cy={540} w={860} h={1560}
          lines={[
            { txt: '47', size: 300, col: '#7AC8E8', dy: -250 },
            { txt: 'DAYS', size: 150, col: '#FFF6DC', dy: -30 },
            { txt: countdown, size: 130, col: '#FF5A5A', dy: 160 },
            { txt: 'TICKING', size: 56, col: '#8A93B8', dy: 280 },
          ]}
        />
        <AddLight x={960} y={300} r={600} v="#7AC8E8" a={60} />
        <Vignette strength={0.5} />
      </g>
    );
  },
});
