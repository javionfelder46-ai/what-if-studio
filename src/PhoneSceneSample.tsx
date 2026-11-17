import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { TextChat, KitDefs, FONT } from './engine';

// Phone text-message scary scene — sample for the Night Shift "Room 100" Part 1 (2D rebuild).
// Javion, Nov 14: "use a phone scene in ours as well" / "Text message scary scene".
// The phone fills the 9:16 frame. Bubbles appear ONE AT A TIME (18 frames apart) as if live.
// The texts are from an UNKNOWN number, arriving at 2:59 AM — the elevator is moving and
// Jake didn't press anything. The last one is red bold caps: color carries the urgency.
// No voiceover for the bubbles — the text IS the scare, the viewer reads it.
// Render stills: npx remotion still src/index.ts PhoneSceneSample out/phone_sample_f<frame>.png --frame=<n>
// Render clip: npx remotion render src/index.ts PhoneSceneSample out/phone_scene_sample.mp4
// Sample-only: it never feeds a video composition.

const MESSAGES = [
  { text: "the elevator's moving", side: 'left' as const, time: '2:59 AM' },
  { text: "you didn't call it", side: 'left' as const },
  { text: "DON'T GET IN", side: 'left' as const, red: true },
];

export const PhoneSceneSample: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: '#0B0A10' }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <KitDefs />
        {/* faint hotel-lobby glow behind the phone so it isn't a void */}
        <rect x={0} y={0} width={1080} height={1920} fill="#0B0A10" />
        <circle cx={540} cy={960} r={700} fill="#1A1626" opacity={0.6} />
        <TextChat x={540} y={960} t={f} w={920} messages={MESSAGES} gap={18} title="Unknown" />
        {/* caption: the beat, so the sample reads on its own */}
        <text x={540} y={1860} textAnchor="middle" fontFamily={FONT.hand} fontSize={44} fill="#A9C6FF">
          2:59 AM — the phone lights up
        </text>
      </svg>
    </AbsoluteFill>
  );
};
