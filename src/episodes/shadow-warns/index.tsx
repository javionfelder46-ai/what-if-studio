import React from 'react';
import { defineEpisode, Timeline } from '../../engine';
import timeline from './timeline.json';
import { shadowWarnsShots } from './scenes';

// "The Shadow That Warns You" — an original 9-beat storyboard, built as REAL
// Remotion scenes through the rig. 9 beats x 10s = 90s (2700 frames).
// The board renders from THESE scenes through the rig — no drawing scripts.
export const shadowWarns = defineEpisode('ShadowWarns', {
  timeline: timeline as Timeline,
  shots: shadowWarnsShots(),
});
