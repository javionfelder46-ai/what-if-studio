import React from 'react';
import { defineEpisode, Timeline } from '../../engine';
import timeline from './timeline.json';
import { zenn009Shots } from './scenes';

// "What If You Could See How Much Time Everyone Has Left?" — video #13, 43
// narrative beats + end card, built as modular scene functions with set
// durations. 2D Remotion, Archer voiceover, the new rules apply from the
// first frame: fluent movement, pose catalog, camera movement, show-don't-tell,
// only popping titles. Timeline is DERIVED from the scene durations — never
// hand-edit timeline.json. Durations are PLACEHOLDER (Archer's measured pace
// on video #6) until the Archer VO exists; re-time exactly from alignment then.
// The board renders from THESE scenes through the rig — no drawing scripts.
export const zenn009 = defineEpisode('Zenn009', {
  timeline: timeline as Timeline,
  shots: zenn009Shots(),
});
