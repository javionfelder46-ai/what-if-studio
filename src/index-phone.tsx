// Minimal Remotion entry: ONLY the PhoneKnowsWhenYouDie composition + its
// storyboard. Mirrors src/index-zenn006.tsx — the full src/index.ts registers
// every episode, which makes the bundle slow. This entry bundles just the one
// episode the render needs.
import { registerRoot } from 'remotion';
import React from 'react';
import { Composition } from 'remotion';
import './engine/fonts';
import { STUDIO } from './studio.config';
import { phoneKnowsWhenYouDie } from './episodes/phone-knows-when-you-die';

const Root: React.FC = () => {
  const common = { width: STUDIO.width, height: STUDIO.height, fps: STUDIO.fps };
  return (
    <>
      <Composition id={phoneKnowsWhenYouDie.id} component={phoneKnowsWhenYouDie.Main} durationInFrames={Math.max(1, phoneKnowsWhenYouDie.total)} {...common} />
      <Composition id={`${phoneKnowsWhenYouDie.id}Board`} component={phoneKnowsWhenYouDie.Board} durationInFrames={Math.max(1, phoneKnowsWhenYouDie.shotCount)} {...common} />
    </>
  );
};

registerRoot(Root);
