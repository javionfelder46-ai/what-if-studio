// Occasion test sheet (Nov 11, Javion: dress for the occasion/weather/season).
// A standalone verification still — NOT a scene or episode content. Two frames:
//   frame 0 = SNOW: Jake (full snow set) + Detective (deerstalker stays, gloves + scarf)
//   frame 1 = RAIN + SUN + WIND: hero in rain holding the Umbrella, Jake in sun,
//             guestA in wind. (Rain has no rig headgear — the rain hood was built and
//             REMOVED because the render test showed it reads as blonde hair; rain is
//             covered by the Umbrella hand prop.)
// Render with .tmp/render_occasion_test.mjs into out/occasion_test_v1/ (fresh dir).
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Hero, basePose, Pose, LOOKS, KitDefs, FONT, joints, toWorld, Umbrella } from './engine';

const P = (o: Partial<Pose>): Pose => ({ ...basePose, ...o });

const Label: React.FC<{ x: number; y: number; text: string }> = ({ x, y, text }) => (
  <text x={x} y={y} textAnchor="middle" fontFamily={FONT.ui} fontSize={22} fill="#F6EFE3" letterSpacing={1.5}>
    {text}
  </text>
);

const Snowflakes: React.FC = () => (
  <g fill="#FFFFFF" opacity={0.85}>
    {[
      [120, 120], [300, 240], [520, 90], [760, 180], [980, 110], [1180, 220], [1420, 100], [1640, 190], [1800, 120],
      [200, 420], [640, 380], [1080, 420], [1520, 380], [1760, 460], [420, 620], [900, 640], [1300, 620], [1700, 660],
    ].map(([x, y], i) => (
      <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 5 : 3.5} />
    ))}
  </g>
);

const RainDrops: React.FC = () => (
  <g stroke="#8FB8D8" strokeWidth={3} strokeLinecap="round" opacity={0.7}>
    {[
      [120, 120], [260, 260], [420, 140], [560, 320], [180, 480], [380, 560], [120, 700], [300, 780],
    ].map(([x, y], i) => (
      <line key={i} x1={x} y1={y} x2={x - 8} y2={y + 26} />
    ))}
  </g>
);

export const OccasionTest: React.FC = () => {
  const frame = useCurrentFrame();
  const jakeSnow = P({ x: 560, y: 760, scale: 1.7, expr: 'happy' });
  const detSnow = P({ x: 1360, y: 760, scale: 1.7, expr: 'neutral' });
  const heroRain = P({ x: 360, y: 760, scale: 1.6, expr: 'worried', armR: { a: 55, b: 10 } });
  const jakeSun = P({ x: 960, y: 760, scale: 1.6, expr: 'happy' });
  const guestWind = P({ x: 1560, y: 760, scale: 1.6, expr: 'neutral' });
  const heroUmbHand = toWorld(heroRain, joints(heroRain).armR.end);
  return (
    <AbsoluteFill style={{ backgroundColor: '#0A2438' }}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080">
        <KitDefs />
        <rect width={1920} height={1080} fill="#0A2438" />
        <rect y={1000} width={1920} height={80} fill="#12293D" />
        {frame === 0 ? (
          <g>
            <Snowflakes />
            <Hero look={LOOKS.jake} weather="snow" pose={jakeSnow} shadow={0.6} rimId="rimBlue" />
            <Hero look={LOOKS.detective} weather="snow" pose={detSnow} shadow={0.6} rimId="rimBlue" />
            <Label x={560} y={1040} text="JAKE — SNOW" />
            <Label x={1360} y={1040} text="DETECTIVE — SNOW" />
          </g>
        ) : (
          <g>
            <RainDrops />
            <circle cx={1780} cy={120} r={46} fill="#E8C86A" opacity={0.9} />
            <Hero look={LOOKS.hero} weather="rain" pose={heroRain} shadow={0.6} rimId="rimBlue" />
            <g filter="url(#rimBlue)">
              <Umbrella x={heroUmbHand.x} y={heroUmbHand.y} s={1.6} tilt={-6} />
            </g>
            <Hero look={LOOKS.jake} weather="sun" pose={jakeSun} shadow={0.6} rimId="rimBlue" />
            <Hero look={LOOKS.guestA} weather="wind" pose={guestWind} shadow={0.6} rimId="rimBlue" />
            <Label x={360} y={1040} text="HERO — RAIN" />
            <Label x={960} y={1040} text="JAKE — SUN" />
            <Label x={1560} y={1040} text="GUEST A — WIND" />
          </g>
        )}
      </svg>
    </AbsoluteFill>
  );
};
