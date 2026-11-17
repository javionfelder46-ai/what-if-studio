// Minimal Remotion entry: ONLY the PedHairTest composition (Nov 11 pedestrian-hair
// verification). Mirrors src/index-occasiontest.tsx — a small entry keeps the bundle short
// so it lands inside the disk fault's brief OFF windows.
// Usage (from the studio folder):
//   TMPDIR=/home/hatch/workspace/what-if-studio/.tmp node .tmp/render_pedhair_test.mjs
import { registerRoot } from 'remotion';
import React from 'react';
import { Composition } from 'remotion';
import './engine/fonts';
import { STUDIO } from './studio.config';
import { PedHairTest } from './PedHairTest';

const Root: React.FC = () => {
  const common = { width: STUDIO.width, height: STUDIO.height, fps: STUDIO.fps };
  return (
    <Composition
      id="PedHairTest"
      component={PedHairTest}
      durationInFrames={3}
      {...common}
    />
  );
};

registerRoot(Root);
