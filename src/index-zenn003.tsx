// Minimal Remotion entry: ONLY the Zenn003 composition. Mirrors
// src/index-zenn002.tsx — the full src/index.ts registers 5 episodes +
// cast sheets, which makes esbuild's bundle take ~7s of writes, too long to
// fit inside the disk fault's brief OFF windows. This entry bundles just the
// one episode the board needs, so the bundle is shorter and far more likely
// to land while the fault is off.
// Usage: bundle({ entryPoint: 'src/index-zenn003.tsx', ... })
// (Nov 11, displacement verification — same pattern as index-zenn002.tsx.)
import { registerRoot } from 'remotion';
import React from 'react';
import { Composition } from 'remotion';
import './engine/fonts';
import { STUDIO } from './studio.config';
import { zenn003 } from './episodes/zenn-003';

const Root: React.FC = () => {
  const common = { width: STUDIO.width, height: STUDIO.height, fps: STUDIO.fps };
  return (
    <Composition
      id={zenn003.id}
      component={zenn003.Main}
      durationInFrames={Math.max(1, zenn003.total)}
      {...common}
    />
  );
};

registerRoot(Root);
