// Minimal Remotion entry: ONLY the Zenn011 composition + its storyboard.
// Mirrors src/index-zenn009.tsx — the full src/index.ts registers 5 episodes +
// cast sheets, which makes esbuild's bundle take ~7s of writes. This entry
// bundles just the one episode the render needs. Do NOT add zenn-011 to the
// shared EPISODES registry in src/episodes/index.ts: the S1-S43 ids would
// collide with the other episodes' ids ("duplicate scene id S1").
import { registerRoot } from 'remotion';
import React from 'react';
import { Composition } from 'remotion';
import './engine/fonts';
import { STUDIO } from './studio.config';
import { zenn011 } from './episodes/zenn-011';

const Root: React.FC = () => {
  const common = { width: STUDIO.width, height: STUDIO.height, fps: STUDIO.fps };
  return (
    <>
      <Composition id={zenn011.id} component={zenn011.Main} durationInFrames={Math.max(1, zenn011.total)} {...common} />
      <Composition id={`${zenn011.id}Board`} component={zenn011.Board} durationInFrames={Math.max(1, zenn011.shotCount)} {...common} />
    </>
  );
};

registerRoot(Root);
