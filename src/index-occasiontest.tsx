// Minimal Remotion entry: ONLY the OccasionTest composition (Nov 11 weather/season
// verification). Mirrors src/index-zenn002.tsx — a small entry keeps the bundle short
// so it lands inside the disk fault's brief OFF windows.
// Usage (from the studio folder):
//   TMPDIR=/home/hatch/workspace/what-if-studio/.tmp node .tmp/render_occasion_test.mjs
import { registerRoot } from 'remotion';
import React from 'react';
import { Composition } from 'remotion';
import './engine/fonts';
import { STUDIO } from './studio.config';
import { OccasionTest } from './OccasionTest';

const Root: React.FC = () => {
  const common = { width: STUDIO.width, height: STUDIO.height, fps: STUDIO.fps };
  return (
    <Composition
      id="OccasionTest"
      component={OccasionTest}
      durationInFrames={2}
      {...common}
    />
  );
};

registerRoot(Root);
