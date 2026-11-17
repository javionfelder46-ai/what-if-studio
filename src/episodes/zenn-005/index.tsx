import React from 'react';
import { defineEpisode, Timeline } from '../../engine';
import timeline from './timeline.json';
import { zenn005Shots } from './scenes';

// "What If You Woke Up 100 Years in the Future?" — video #5, 42 narrative
// beats + S43 end card, built as modular scene functions with set durations.
// 2D Remotion, Liam voiceover (not recorded yet — audio comes later), the
// new rules apply from the first frame: fluent movement, pose catalog,
// back-and-forth dialogue (Ch 5), cutaway (S17), phone text scene (S35),
// ticking timer on screen from the cold open. Timeline is DERIVED from the
// scene durations by .tmp/check_zenn005.mjs — never hand-edit timeline.json.
export const zenn005 = defineEpisode('Zenn005', {
  timeline: timeline as Timeline,
  shots: zenn005Shots(),
});
