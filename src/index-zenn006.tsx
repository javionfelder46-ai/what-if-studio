// Minimal Remotion entry: ONLY the Zenn006 composition + its storyboard.
// Mirrors src/index-zenn005.tsx — the full src/index.ts registers 5 episodes +
// cast sheets, which makes esbuild's bundle take ~7s of writes. This entry
// bundles just the one episode the render needs.
import { registerRoot } from 'remotion';
import React from 'react';
import { Composition } from 'remotion';
import './engine/fonts';
import { STUDIO } from './studio.config';
import { zenn006 } from './episodes/zenn-006';

const Root: React.FC = () => {
  const common = { width: STUDIO.width, height: STUDIO.height, fps: STUDIO.fps };
  return (
    <>
      <Composition id={zenn006.id} component={zenn006.Main} durationInFrames={Math.max(1, zenn006.total)} {...common} />
      <Composition id={`${zenn006.id}Board`} component={zenn006.Board} durationInFrames={Math.max(1, zenn006.shotCount)} {...common} />
    </>
  );
};

registerRoot(Root);
