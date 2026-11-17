// Minimal Remotion entry: ONLY the ShadowWarns composition + its storyboard.
// Mirrors src/index-zenn009.tsx — the full src/index.ts registers 5 episodes +
// cast sheets, which makes esbuild's bundle take ~7s of writes. This entry
// bundles just the one episode the render needs. Do NOT add shadow-warns to
// the shared EPISODES registry in src/episodes/index.ts: the S1-S9 ids would
// collide with the other episodes' ids ("duplicate scene id S1").
import { registerRoot } from 'remotion';
import React from 'react';
import { Composition } from 'remotion';
import './engine/fonts';
import { STUDIO } from './studio.config';
import { shadowWarns } from './episodes/shadow-warns';

const Root: React.FC = () => {
  const common = { width: STUDIO.width, height: STUDIO.height, fps: STUDIO.fps };
  return (
    <>
      <Composition id={shadowWarns.id} component={shadowWarns.Main} durationInFrames={Math.max(1, shadowWarns.total)} {...common} />
      <Composition id={`${shadowWarns.id}Board`} component={shadowWarns.Board} durationInFrames={Math.max(1, shadowWarns.shotCount)} {...common} />
    </>
  );
};

registerRoot(Root);
