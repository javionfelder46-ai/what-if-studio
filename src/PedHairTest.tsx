// PedHair test sheet (Nov 11, Javion: every pedestrian gets natural hair —
// nothing that looks like a hat, actual natural-looking hair).
// A standalone verification still — NOT a scene or episode content. Two frames:
//   frame 0 = the six PedHair styles, one Hero figure per style, large scale,
//             labelled: crop (teenager), sidepart (guestA), afro (prisoner),
//             bun (researcher), ponytail (student), curly (teacher).
//   frame 1 = CONTROL GROUP: Detective (deerstalker stays), Jake (bald), hero
//             (bald), profA (bald) — proving the main cast does NOT get hair.
//   frame 2 = the Party set full-frame — the crowd strip (PartyGuest with
//             PedHair at crowd scale) in its real room.
// The test is: does each style read as NATURAL HAIR at a glance, or does it read
// as a hat/cap? A style that reads as a hat is dropped, not shipped.
// Render with .tmp/render_pedhair_test.mjs into out/pedhair_test_v1/ (fresh dir).
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Hero, basePose, Pose, LOOKS, KitDefs, FONT } from './engine';
import { Party } from './engine/sets/party';

const P = (o: Partial<Pose>): Pose => ({ ...basePose, ...o });

const Label: React.FC<{ x: number; y: number; text: string }> = ({ x, y, text }) => (
  <text x={x} y={y} textAnchor="middle" fontFamily={FONT.ui} fontSize={24} fill="#F6EFE3" letterSpacing={1.5}>
    {text}
  </text>
);

export const PedHairTest: React.FC = () => {
  const frame = useCurrentFrame();
  // Six pedestrians in a row, scale 1.5, heads at ~y 300 so they are big.
  const row = (y: number, s: number): Pose[] => [
    P({ x: 200, y, scale: s, expr: 'neutral' }),
    P({ x: 520, y, scale: s, expr: 'neutral' }),
    P({ x: 840, y, scale: s, expr: 'neutral' }),
    P({ x: 1160, y, scale: s, expr: 'neutral' }),
    P({ x: 1480, y, scale: s, expr: 'neutral' }),
    P({ x: 1760, y, scale: s, expr: 'neutral' }),
  ];
  const styles = row(700, 1.5);
  const control = row(700, 1.5);
  return (
    <AbsoluteFill style={{ backgroundColor: '#0A2438' }}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080">
        <KitDefs />
        <rect width={1920} height={1080} fill="#0A2438" />
        <rect y={980} width={1920} height={100} fill="#12293D" />
        {frame === 0 ? (
          <g>
            <Hero look={LOOKS.teenager} pose={styles[0]} shadow={0.6} rimId="rimBlue" />
            <Hero look={LOOKS.guestA} pose={styles[1]} shadow={0.6} rimId="rimBlue" />
            <Hero look={LOOKS.prisoner} pose={styles[2]} shadow={0.6} rimId="rimBlue" />
            <Hero look={LOOKS.researcher} pose={styles[3]} shadow={0.6} rimId="rimBlue" />
            <Hero look={LOOKS.student} pose={styles[4]} shadow={0.6} rimId="rimBlue" />
            <Hero look={LOOKS.teacher} pose={styles[5]} shadow={0.6} rimId="rimBlue" />
            <Label x={200} y={1030} text="CROP" />
            <Label x={520} y={1030} text="SIDEPART" />
            <Label x={840} y={1030} text="AFRO" />
            <Label x={1160} y={1030} text="BUN" />
            <Label x={1480} y={1030} text="PONYTAIL" />
            <Label x={1760} y={1030} text="CURLY" />
          </g>
        ) : frame === 1 ? (
          <g>
            <Hero look={LOOKS.detective} pose={control[0]} shadow={0.6} rimId="rimBlue" />
            <Hero look={LOOKS.jake} pose={control[1]} shadow={0.6} rimId="rimBlue" />
            <Hero look={LOOKS.hero} pose={control[2]} shadow={0.6} rimId="rimBlue" />
            <Hero look={LOOKS.profA} pose={control[3]} shadow={0.6} rimId="rimBlue" />
            <Label x={200} y={1030} text="DETECTIVE" />
            <Label x={520} y={1030} text="JAKE — BALD" />
            <Label x={840} y={1030} text="HERO — BALD" />
            <Label x={1160} y={1030} text="PROF — BALD" />
          </g>
        ) : (
          <g>
            <Party t={0} />
            <Label x={960} y={1030} text="PARTY CROWD — PEDHAIR AT CROWD SCALE" />
          </g>
        )}
      </svg>
    </AbsoluteFill>
  );
};
