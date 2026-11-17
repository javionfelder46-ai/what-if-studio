// S23 — END CARD (10.4s, holds still — the board says hold still).
// Dark navy grid, a tilted polaroid "Inkl" logo with a red marker ring
// around it, red SUBSCRIBE button, "Curiosity. Explained."
import { defineScene } from '../../../engine/sceneBuilder';
import { AddLight, Blur, camAt, Label, RRect, Vignette } from '../kit-phone';
import { fr } from '../common';
import { SHOT_TIMING } from '../timing';

const ID = 'S23';

defineScene({
  id: ID,
  durationSec: SHOT_TIMING[ID].durSec,
  characters: [],
  fn: (api) => {
    const t = api.t;
    return (
      <g transform={camAt(t, SHOT_TIMING[ID].durSec, [], [fr(1.0, 1.03, [960, 540], [960, 540])])}>
        <rect x={-900} y={-600} width={3720} height={2280} fill="#0E1438" />
        {Array.from({ length: 10 }, (_, i) => (
          <line key={i} x1={i * 220} y1={-600} x2={i * 220} y2={1680} stroke="#1A2560" strokeWidth={2} opacity={100 / 255} />
        ))}
        {/* polaroid-style frame, tilted -3° */}
        <g transform="translate(960 470) rotate(-3)">
          <Blur sigma={15}>
            <rect x={-330} y={-300} width={660} height={660} fill="#000000" opacity={120 / 255} />
          </Blur>
          <RRect x0={-320} y0={-290} x1={320} y1={350} fill="#F7F2E6" />
          <circle cx={0} cy={-40} r={190} fill="#0E1438" />
          <Label s="Inkl" x={0} y={10} size={130} color="#FFF6DC" align="center" />
        </g>
        {/* red marker circle around the logo: arc from -110°, sweeping 300° */}
        <path d="M 871 146 A 260 260 0 1 1 704 345" fill="none" stroke="#C8242C" strokeWidth={16} strokeLinecap="round" />
        {/* subscribe button */}
        <RRect x0={700} y0={760} x1={1220} y1={880} fill="#C8242C" r={28} />
        <Label s="SUBSCRIBE" x={960} y={846} size={72} color="#FFF6DC" align="center" font="marker" skew={0} />
        <Label s="Curiosity. Explained." x={960} y={980} size={56} color="#FFF6DC" align="center" skew={-0.12} />
        <AddLight x={960} y={450} r={500} v="#B8F04A" a={36} />
        <Vignette strength={0.5} />
      </g>
    );
  },
});
