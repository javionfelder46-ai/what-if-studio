// Minimal Remotion entry: ONLY the Zenn005 composition + its storyboard.
// Mirrors src/index-zenn003.tsx — the full src/index.ts registers 5 episodes +
// cast sheets, which makes esbuild's bundle take ~7s of writes, too long to
// fit inside the disk fault's brief OFF windows. This entry bundles just the
// one episode the board needs.
// Usage: bundle({ entryPoint: 'src/index-zenn005.tsx', ... })
import { registerRoot } from 'remotion';
import React from 'react';
import { Composition } from 'remotion';
import './engine/fonts';
import { STUDIO } from './studio.config';
import { zenn005 } from './episodes/zenn-005';

const Root: React.FC = () => {
  const common = { width: STUDIO.width, height: STUDIO.height, fps: STUDIO.fps };
  return (
    <>
      <Composition id={zenn005.id} component={zenn005.Main} durationInFrames={Math.max(1, zenn005.total)} {...common} />
      <Composition id={`${zenn005.id}Board`} component={zenn005.Board} durationInFrames={Math.max(1, zenn005.shotCount)} {...common} />
    </>
  );
};

registerRoot(Root);
