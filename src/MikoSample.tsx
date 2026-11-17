// Miko-style sample, v3 — S1 cold open, "Why Your Brain Deletes the
// Scariest Moments of Your Life".
//
// Javion's direction: keep Jake a BLACK SILHOUETTE (the Inkl character
// lock), but make the GRAPHICS more realistic like Miko's ("What If You
// Could See Everyone's Lie Count?", 921K views).
//
// v3 — one more graphics pass. What's new over v2:
//   - a visible MOONLIGHT SHAFT from the window (angled, soft, blurred) —
//     you can see the light in the air, not just a pool on the floor
//   - DUST MOTES drifting in the shaft (tiny dots, varying opacity)
//   - HAZE: a faint blue wash over the whole room that unifies the palette
//     (wall, floor, rug and bed all sit in one dusky family now)
//   - the BLANKET has real folds (curved fold lines + shading), the PILLOW
//     has a crease — fabric reads as fabric, not a flat shape
//   - Jake's red is muted a touch + the shirt has a gradient, so he has
//     volume and sits in the room instead of shouting over it.
// Jake stays the Inkl black silhouette: black, bald, white oval eyes +
// brows, red shirt, no mouth when silent.
import React from 'react';
import { Composition } from 'remotion';

// --- realistic dusky palette (muted, one family) ---
const SILHOUETTE = '#161616';
const JAKE_RED = '#A93226';
const JAKE_RED_SHADE = '#7B241C';
const PANTS = '#1E1A20';
const MOON = '#F5EDD0';
const CLOCK_GREEN = '#7DE8A0';

// Black-silhouette Jake, SEATED on the edge of the bed. Local origin = hips,
// which sit on the mattress top. Legs go down to the floor (feet at
// local y +227). He just woke up: slumped, tired, eyes half-lidded.
const SilhouetteJakeSeated: React.FC<{ x: number; y: number; scale?: number }> = ({
  x,
  y,
  scale = 1,
}) => {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {/* soft blurred ground shadow under the feet */}
      <ellipse cx={0} cy={230} rx={66} ry={10} fill="#000" opacity={0.35} filter="url(#softBlur)" />
      {/* legs: thighs forward off the mattress edge, shins straight down */}
      <path
        d="M -16 4 L -46 26 L -48 218"
        stroke={PANTS}
        strokeWidth={20}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M 16 4 L 46 26 L 48 218"
        stroke={PANTS}
        strokeWidth={20}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* feet: rounded black ovals, flat on the floor */}
      <ellipse cx={-50} cy={224} rx={20} ry={9} fill="#0E0C10" />
      <ellipse cx={50} cy={224} rx={20} ry={9} fill="#0E0C10" />
      {/* torso: red shirt, gradient volume, slumped forward */}
      <path
        d="M -36 -78 Q 0 -92 36 -78 L 32 8 Q 0 18 -32 8 Z"
        fill="url(#shirtGrad)"
      />
      {/* arms: hanging down, hands near the knees */}
      <path
        d="M -34 -68 L -46 -8 L -42 26"
        stroke={JAKE_RED}
        strokeWidth={18}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M 34 -68 L 46 -8 L 42 26"
        stroke={JAKE_RED}
        strokeWidth={18}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx={-42} cy={30} r={10} fill={SILHOUETTE} />
      <circle cx={42} cy={30} r={10} fill={SILHOUETTE} />
      {/* neck */}
      <rect x={-10} y={-96} width={20} height={18} fill={SILHOUETTE} />
      {/* head: black silhouette, bald, round, tilted down a little */}
      <g transform="rotate(4 0 -130)">
        <circle cx={0} cy={-130} r={46} fill={SILHOUETTE} />
        {/* moonlight rim on the left edge of the head (cool blue) */}
        <path
          d="M -46 -130 A 46 46 0 0 1 -20 -172"
          stroke="#A9C6FF"
          strokeWidth={3}
          fill="none"
          opacity={0.55}
          strokeLinecap="round"
        />
        {/* tired eyes: white ovals, half-lidded, looking down */}
        <ellipse cx={-16} cy={-132} rx={7} ry={9} fill="#FFF" />
        <ellipse cx={16} cy={-132} rx={7} ry={9} fill="#FFF" />
        {/* heavy lids (black, over the top of the eyes) */}
        <path
          d="M -24 -138 Q -16 -144 -8 -138 L -8 -134 Q -16 -138 -24 -134 Z"
          fill={SILHOUETTE}
        />
        <path
          d="M 8 -138 Q 16 -144 24 -138 L 24 -134 Q 16 -138 8 -134 Z"
          fill={SILHOUETTE}
        />
        {/* brows: low, flat, tired — white, so they read on the black head */}
        <path
          d="M -25 -152 L -7 -150"
          stroke="#FFF"
          strokeWidth={4}
          strokeLinecap="round"
        />
        <path
          d="M 7 -150 L 25 -152"
          stroke="#FFF"
          strokeWidth={4}
          strokeLinecap="round"
        />
      </g>
    </g>
  );
};

// Realistic bedroom — gradients, soft light, atmosphere, depth.
const RealBedroom: React.FC = () => {
  return (
    <g>
      <defs>
        {/* wall: soft vertical falloff, darker at the top */}
        <linearGradient id="wallGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#23233A" />
          <stop offset="70%" stopColor="#2A2A48" />
          <stop offset="100%" stopColor="#1C1C30" />
        </linearGradient>
        {/* night sky outside the window: deep blue, lighter near the moon */}
        <radialGradient id="skyGrad" cx="0.7" cy="0.3" r="0.9">
          <stop offset="0%" stopColor="#2A2A55" />
          <stop offset="60%" stopColor="#1B1B38" />
          <stop offset="100%" stopColor="#12122A" />
        </radialGradient>
        {/* moon halo: soft, diffused */}
        <radialGradient id="moonGlow">
          <stop offset="0%" stopColor="#F5EDD0" stopOpacity="0.9" />
          <stop offset="35%" stopColor="#F5EDD0" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#F5EDD0" stopOpacity="0" />
        </radialGradient>
        {/* moonlight pool on the floor: soft blue, diffused */}
        <radialGradient id="floorLight">
          <stop offset="0%" stopColor="#A9C6FF" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#A9C6FF" stopOpacity="0" />
        </radialGradient>
        {/* moonlight shaft: a soft beam, brighter at the window */}
        <linearGradient id="shaftGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#C8D8FF" stopOpacity="0.26" />
          <stop offset="100%" stopColor="#C8D8FF" stopOpacity="0.04" />
        </linearGradient>
        {/* floor: muted blue-grey wood, darker toward the viewer */}
        <linearGradient id="floorGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#35323E" />
          <stop offset="100%" stopColor="#211D26" />
        </linearGradient>
        {/* blanket: soft volume, lighter on top */}
        <linearGradient id="blanketGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4A4780" />
          <stop offset="100%" stopColor="#2E2C55" />
        </linearGradient>
        {/* pillow: soft volume */}
        <radialGradient id="pillowGrad" cx="0.4" cy="0.35" r="0.9">
          <stop offset="0%" stopColor="#9A8AB2" />
          <stop offset="100%" stopColor="#6A5A82" />
        </radialGradient>
        {/* Jake's shirt: muted red, lighter where the moon hits */}
        <linearGradient id="shirtGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#B03A2E" />
          <stop offset="100%" stopColor="#8E2A20" />
        </linearGradient>
        {/* clock glow: soft green */}
        <radialGradient id="clockGlow">
          <stop offset="0%" stopColor="#7DE8A0" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#7DE8A0" stopOpacity="0" />
        </radialGradient>
        {/* vignette: the room falls off into darkness at the edges */}
        <radialGradient id="vignette" cx="0.5" cy="0.45" r="0.75">
          <stop offset="55%" stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.45" />
        </radialGradient>
        <filter id="softBlur" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
        <filter id="shaftBlur" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="18" />
        </filter>
      </defs>

      {/* walls + floor */}
      <rect x={0} y={0} width={1920} height={876} fill="url(#wallGrad)" />
      <rect x={0} y={876} width={1920} height={204} fill="url(#floorGrad)" />
      <line x1={0} y1={876} x2={1920} y2={876} stroke="#1A151F" strokeWidth={3} />
      {/* moonlight shaft: from the window, angling DOWN-LEFT to the floor.
          The moon sits high and to the RIGHT in the window, so its rays
          come in from the upper-right and fall to the lower-left. */}
      <polygon
        points="340,560 800,560 640,1000 180,1000"
        fill="url(#shaftGrad)"
        filter="url(#shaftBlur)"
      />
      {/* moonlight pool on the floor (where the shaft lands, left of the window) */}
      <ellipse cx={420} cy={960} rx={360} ry={60} fill="url(#floorLight)" />
      {/* dust motes drifting in the shaft */}
      <circle cx={520} cy={640} r={2.5} fill="#E8EEFF" opacity={0.75} />
      <circle cx={480} cy={720} r={2} fill="#E8EEFF" opacity={0.55} />
      <circle cx={420} cy={800} r={3} fill="#E8EEFF" opacity={0.65} />
      <circle cx={380} cy={860} r={2} fill="#E8EEFF" opacity={0.5} />
      <circle cx={560} cy={680} r={2.5} fill="#E8EEFF" opacity={0.6} />
      <circle cx={460} cy={920} r={2} fill="#E8EEFF" opacity={0.45} />
      {/* window — large, moon + stars, the light source */}
      <rect x={300} y={150} width={520} height={420} rx={6} fill="#101022" stroke="#55557A" strokeWidth={4} />
      <rect x={320} y={170} width={480} height={380} fill="url(#skyGrad)" />
      <line x1={560} y1={170} x2={560} y2={550} stroke="#55557A" strokeWidth={4} />
      <line x1={320} y1={360} x2={800} y2={360} stroke="#55557A" strokeWidth={4} />
      {/* moon halo + moon */}
      <circle cx={700} cy={250} r={120} fill="url(#moonGlow)" />
      <circle cx={700} cy={250} r={52} fill={MOON} />
      <circle cx={682} cy={238} r={10} fill="#E0D6B8" opacity={0.7} />
      <circle cx={714} cy={266} r={7} fill="#E0D6B8" opacity={0.7} />
      {/* stars */}
      <circle cx={380} cy={220} r={3} fill="#FFF" opacity={0.9} />
      <circle cx={450} cy={300} r={2.5} fill="#FFF" opacity={0.7} />
      <circle cx={520} cy={210} r={2} fill="#FFF" opacity={0.8} />
      <circle cx={760} cy={330} r={3} fill="#FFF" opacity={0.8} />
      <circle cx={400} cy={420} r={2} fill="#FFF" opacity={0.6} />
      <circle cx={660} cy={420} r={2.5} fill="#FFF" opacity={0.7} />
      {/* books on the sill */}
      <rect x={340} y={520} width={90} height={22} fill="#5A4A7A" />
      <rect x={340} y={500} width={70} height={20} fill="#7A5A4A" />
      {/* framed moon print on the wall */}
      <rect x={980} y={220} width={180} height={130} fill="#1E1E38" stroke="#4A4A72" strokeWidth={3} />
      <circle cx={1070} cy={285} r={34} fill={MOON} opacity={0.9} />
      {/* bed — side view, no headboard */}
      <rect x={1000} y={700} width={560} height={90} fill="#3E2C22" />
      <rect x={1000} y={700} width={560} height={14} fill="#2C1F18" />
      {/* mattress */}
      <rect x={1020} y={620} width={520} height={84} rx={10} fill="#CFC6AE" />
      {/* blanket: gradient volume + soft folds */}
      <path
        d="M 1020 660 Q 1280 640 1540 660 L 1540 790 L 1020 790 Z"
        fill="url(#blanketGrad)"
      />
      <path
        d="M 1020 660 Q 1280 640 1540 660 L 1540 700 L 1020 700 Z"
        fill="#000"
        opacity={0.18}
      />
      {/* fold lines — the blanket drapes, it isn't a flat sheet */}
      <path
        d="M 1180 668 Q 1200 720 1188 786"
        stroke="#26244A"
        strokeWidth={4}
        fill="none"
        opacity={0.5}
        strokeLinecap="round"
      />
      <path
        d="M 1360 664 Q 1380 720 1370 786"
        stroke="#26244A"
        strokeWidth={4}
        fill="none"
        opacity={0.5}
        strokeLinecap="round"
      />
      <path
        d="M 1480 668 Q 1492 720 1484 780"
        stroke="#3A3770"
        strokeWidth={3}
        fill="none"
        opacity={0.4}
        strokeLinecap="round"
      />
      {/* pillow — soft volume, with a crease, tucked at the LEFT end */}
      <ellipse cx={1080} cy={640} rx={80} ry={30} fill="url(#pillowGrad)" />
      <path
        d="M 1030 640 Q 1080 648 1130 640"
        stroke="#5A4A72"
        strokeWidth={3}
        fill="none"
        opacity={0.6}
        strokeLinecap="round"
      />
      {/* rug — muted blue-grey now, under the bed + Jake's feet */}
      <ellipse cx={1280} cy={950} rx={430} ry={58} fill="#3A3345" opacity={0.85} />
      <ellipse cx={1280} cy={950} rx={360} ry={44} fill="none" stroke="#4A4260" strokeWidth={2} />
      {/* nightstand + digital clock, 3:00 AM, soft green glow */}
      <rect x={1620} y={720} width={150} height={156} fill="#3E2C22" />
      <rect x={1620} y={720} width={150} height={12} fill="#2C1F18" />
      <circle cx={1695} cy={711} r={70} fill="url(#clockGlow)" />
      <rect x={1640} y={690} width={110} height={42} rx={6} fill="#16161E" stroke="#3A3A55" strokeWidth={2} />
      <text
        x={1695}
        y={720}
        textAnchor="middle"
        fontFamily="Fragment Mono, monospace"
        fontSize={26}
        fontWeight={700}
        fill={CLOCK_GREEN}
      >
        3:00 AM
      </text>
      {/* Jake — black silhouette, SITTING on the edge of the bed (hips on the
          mattress top), feet on the floor. Small in the room. */}
      <SilhouetteJakeSeated x={1180} y={625} scale={1} />
      {/* haze: a faint blue wash that unifies the whole room */}
      <rect x={0} y={0} width={1920} height={1080} fill="#2A2A55" opacity={0.06} />
      {/* vignette: the room falls off into darkness at the edges */}
      <rect x={0} y={0} width={1920} height={1080} fill="url(#vignette)" />
    </g>
  );
};

export const MikoSample: React.FC = () => {
  return (
    <svg width={1920} height={1080} viewBox="0 0 1920 1080">
      <RealBedroom />
    </svg>
  );
};

export const MikoSampleRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MikoSample"
        component={MikoSample}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
