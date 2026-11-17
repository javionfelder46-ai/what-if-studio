// Minimal Remotion entry: ONLY the bear lip-sync sample composition.
// Mirrors src/index-zenn006.tsx — the full src/index.ts registers 5 episodes +
// cast sheets, which makes esbuild's bundle take ~7s of writes.
import { registerRoot } from 'remotion';
import React from 'react';
import { Composition } from 'remotion';
import './engine/fonts';
import { STUDIO } from './studio.config';
import { LipsyncSample } from './episodes/zenn-006/lipsync';
import { LIPSYNC_FRAMES } from './episodes/zenn-006/lipsyncEnvelope';

const Root: React.FC = () => (
  <Composition
    id="LipsyncSample"
    component={LipsyncSample}
    durationInFrames={LIPSYNC_FRAMES}
    width={STUDIO.width}
    height={STUDIO.height}
    fps={STUDIO.fps}
  />
);

registerRoot(Root);
