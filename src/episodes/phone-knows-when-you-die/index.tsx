import React from 'react';
import { defineEpisode, Timeline } from '../../engine';
import timeline from './timeline.json';
import { phoneShots } from './scenes';

// "What If Your Phone Knew the Exact Day You'd Die?" — 23 shots, modular
// scene build, Archer voiceover (479.76s). Vignette OFF on the episode — the
// shots carry their own board vignette, and the engine Grade vignette would
// double-darken. Grain stays on (the genre's finish).
export const phoneKnowsWhenYouDie = defineEpisode('PhoneKnowsWhenYouDie', {
  timeline: timeline as Timeline,
  shots: phoneShots(),
  grain: true,
  vignette: false,
});
