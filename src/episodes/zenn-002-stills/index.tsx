import React from 'react';
import { defineEpisode, Timeline } from '../../engine';
import timeline from './timeline.json';
import { S1, S2, S3, S4, S5, S6, S7, S8, S9, S10, S11, S12, S13, S14, S15, S16, S17, S18, S19, S20, S21, S22, S23, S24, S25, S26, S27, S28, S29, S30, S31, S32, S33, S34, S35, S36, S37, S38, S39, S40, S41 } from './shots';

// "The Spotlight Effect" — stills cut: the 41 externally-made stills Javion
// sent (chat.z.ai board), sequenced in Remotion with a slow Ken Burns drift per
// still, over the same 614.77s George voiceover + 'Darkness is Coming' music
// as the v7 master (same files, same volumes). Total 18,590 frames = 619.67s.
// Stills are shown exactly as made: grain and vignette OFF, no grade on top.
export const zenn002Stills = defineEpisode('Zenn002Stills', {
  timeline: timeline as Timeline,
  shots: { S1, S2, S3, S4, S5, S6, S7, S8, S9, S10, S11, S12, S13, S14, S15, S16, S17, S18, S19, S20, S21, S22, S23, S24, S25, S26, S27, S28, S29, S30, S31, S32, S33, S34, S35, S36, S37, S38, S39, S40, S41 },
  grain: false,
  vignette: false,
});
