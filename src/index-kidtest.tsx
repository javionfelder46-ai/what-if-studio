// Minimal Remotion entry: ONLY the KidTest composition (Nov 12 v7 Kid verification).
// Mirrors src/index-pedhairtest.tsx — a small entry keeps the bundle short.
// Usage (from the studio folder):
//   TMPDIR=/var/tmp node .tmp/render_kid_test.mjs
import { registerRoot } from 'remotion';
import React from 'react';
import { Composition } from 'remotion';
import './engine/fonts';
import { STUDIO } from './studio.config';
import { KidTest } from './KidTest';

const Root: React.FC = () => {
  const common = { width: STUDIO.width, height: STUDIO.height, fps: STUDIO.fps };
  return (
    <Composition
      id="KidTest"
      component={KidTest}
      durationInFrames={1}
      {...common}
    />
  );
};

registerRoot(Root);
