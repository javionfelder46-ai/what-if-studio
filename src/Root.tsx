import React from 'react';
import { Composition } from 'remotion';
import './engine/fonts';
import { STUDIO } from './studio.config';
import { EPISODES } from './episodes';
import { CastSheet } from './CastSheet';
import { HairMotionSample } from './HairMotionSample';
import { FluentSample } from './FluentSample';
import { PhoneSceneSample } from './PhoneSceneSample';
import { NightShift2D } from './NightShift2D';

// Every episode gets two compositions: <Id> (the film) and <Id>Board (one frame per shot, at its key frame, for the
// storyboard). Cast renders the cast sheet.
//   npx remotion studio src/index.ts --port 3430

export const Root: React.FC = () => {
  const common = { width: STUDIO.width, height: STUDIO.height, fps: STUDIO.fps };
  return (
    <>
      {EPISODES.map((e) => (
        <React.Fragment key={e.id}>
          <Composition id={e.id} component={e.Main} durationInFrames={Math.max(1, e.total)} {...common} />
          <Composition id={`${e.id}Board`} component={e.Board} durationInFrames={Math.max(1, e.shotCount)} {...common} />
        </React.Fragment>
      ))}
      <Composition id="Cast" component={CastSheet} durationInFrames={1} {...common} />
      <Composition id="HairMotion" component={HairMotionSample} durationInFrames={1} defaultProps={{ variant: 0 }} {...common} />
      <Composition id="FluentSample" component={FluentSample} durationInFrames={150} {...common} />
      <Composition id="PhoneSceneSample" component={PhoneSceneSample} durationInFrames={150} width={1080} height={1920} fps={30} />
      <Composition id="NightShift2D" component={NightShift2D} durationInFrames={1823} width={1080} height={1920} fps={24} /> {/* 75.94s — v2 voiceover, rule 3 re-record, Nov 14 */}
    </>
  );
};
