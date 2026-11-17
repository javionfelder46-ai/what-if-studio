// Minimal Remotion entry: ONLY the Zenn002 composition. The full src/index.ts
// registers 5 episodes + cast sheets, which makes esbuild's bundle take ~7s of
// writes — too long to fit inside the disk fault's brief OFF windows. This
// entry bundles just the one episode the board needs, so the bundle is
// shorter and far more likely to land while the fault is off.
// Usage: bundle({ entryPoint: 'src/index-zenn002.tsx', ... })
// (Nov 10, disk-fault workaround — not a replacement for src/index.ts.)
import { registerRoot } from 'remotion';
import React from 'react';
import { Composition } from 'remotion';
import './engine/fonts';
import { STUDIO } from './studio.config';
import { zenn002 } from './episodes/zenn-002';

const Root: React.FC = () => {
  const common = { width: STUDIO.width, height: STUDIO.height, fps: STUDIO.fps };
  return (
    <Composition
      id={zenn002.id}
      component={zenn002.Main}
      durationInFrames={Math.max(1, zenn002.total)}
      {...common}
    />
  );
};

registerRoot(Root);
