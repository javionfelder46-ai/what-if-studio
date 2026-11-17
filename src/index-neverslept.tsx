// Minimal Remotion entry: ONLY the NeverSlept composition (1080x1920 test Short).
// Mirrors src/index-zenn003.tsx — a single-episode entry keeps the bundle short.
// Usage: bundle({ entryPoint: 'src/index-neverslept.tsx', ... })
import { registerRoot } from 'remotion';
import React from 'react';
import { Composition } from 'remotion';
import './engine/fonts';
import { Main, TOTAL } from './episodes/never-slept';

const Root: React.FC = () => (
  <Composition
    id="NeverSlept"
    component={Main}
    durationInFrames={Math.max(1, TOTAL)}
    fps={30}
    width={1080}
    height={1920}
  />
);

registerRoot(Root);
