import React from 'react';
import { defineEpisode, Timeline } from '../../engine';
import timeline from './timeline.json';
import { zenn011Shots } from './scenes';

// "What If Everyone's True Age Was Written on Their Face?" — video #8, 43
// narrative beats + end card, built as modular scene functions with set
// durations. 2D Remotion, Archer voiceover, the new rules apply from the
// first frame: fluent movement, pose catalog, camera movement, show-don't-tell,
// only popping titles. Timeline is DERIVED from the scene durations — never
// hand-edit timeline.json. Durations are PLACEHOLDER (~14s per beat) until
// the Archer VO exists; re-time exactly from alignment then.
// The board renders from THESE scenes through the rig — no drawing scripts.
export const zenn011 = defineEpisode('Zenn011', {
  timeline: timeline as Timeline,
  shots: zenn011Shots(),
});
