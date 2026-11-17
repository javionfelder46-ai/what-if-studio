import React from 'react';
import { defineEpisode, Timeline } from '../../engine';
import timeline from './timeline.json';
import { zenn006Shots } from './scenes';

// "Why Your Brain Deletes the Scariest Moments of Your Life" — video #6, 43
// narrative beats + end card, built as modular scene functions with set
// durations. 2D Remotion, George voiceover, the new rules apply from the
// first frame: fluent movement, pose catalog, camera movement, show-don't-tell,
// only popping titles. Timeline is DERIVED from the scene durations — never
// hand-edit timeline.json.
export const zenn006 = defineEpisode('Zenn006', {
  timeline: timeline as Timeline,
  shots: zenn006Shots(),
});
