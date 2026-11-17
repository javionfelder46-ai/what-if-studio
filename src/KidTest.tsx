// Kid test sheet (Nov 12 v7/v8, Javion: "the torso is split black/blue" + "the head
// floats above the chair" + "their legs are going through the fuckin chair").
// A standalone verification still — NOT a scene or episode content. Three kids
// (first three KIDS looks) sitting in chairs, large scale, on white.
// The test is: is the torso ONE solid shirt color (no black half)? Does the head
// connect to the torso via a neck (no floating ball)? Is the seat slab a clean
// horizontal bar with NO dark bar crossing it (v8: the v7 thigh bars crossed the
// seat and read as legs going through the chair — they are gone; from a rear view
// the thighs are hidden, the visible legs are the shins dropping from under the
// seat to feet on the floor)?
// Render with .tmp/render_kid_test.mjs into the verify dir.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { KitDefs } from './engine';
import { Kid, KIDS } from './engine/sets/classroom';

export const KidTest: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#FFFFFF' }}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080">
        <KitDefs />
        {KIDS.slice(0, 3).map((look, i) => (
          <Kid key={i} x={360 + i * 600} y={800} s={1.6} look={look} turn={0} laugh={0} t={0} />
        ))}
      </svg>
    </AbsoluteFill>
  );
};
