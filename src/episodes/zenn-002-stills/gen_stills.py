#!/usr/bin/env python3
"""Generate the zenn-002-stills episode: 41 externally-made stills (Javion's
chat.z.ai board, the Spotlight Effect video) as a Remotion stills-sequence
episode. Each still holds ~15s with a slow Ken Burns drift; the 614.77s George
VO + 'Darkness is Coming' music ride underneath (same audio files/volumes as
the v7 master); S41 is the voiceless 4s Inkl end card, exactly like v7's S182.
Total 18,590 frames = 619.67s at 30fps."""
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))

LINES = [
    "Cold open — Jake in his bedroom, 19:47",
    "Jake, worried, in his bedroom",
    "The party — Jake at the center, friends around",
    "Jake close-up, shocked",
    "Title — Why does it feel like everyone is watching you?",
    "Jake imagines the whole party watching him",
    "Cornell University, 2000 — three psychologists + the Detective",
    "The classroom — fifteen students, one shirt",
    "Clipboard — how many could name the shirt?",
    "Pause and guess — 32%",
    "46% thought they'd be noticed",
    "23% actually noticed",
    "The Spotlight Effect — title card",
    "Feels like it X2 / Actually is",
    "People see you. They remember you.",
    "Jake glowing red while his friends react",
    "Your replays 400 / Their replays 0",
    "Why your brain does this to you — three rules",
    "Rule One — your brain starts with you",
    "You, in high definition — 58",
    "Plus one, plus one, plus one, times one hundred",
    "Rule Two — everyone else is staring at themselves",
    "Shirts they were proud of — Marley / King",
    "8% actually noticed — overestimated six times over",
    "Everyone has their own lobster",
    "Who keeps score? Your brain / The room",
    "Your brain inflates everything",
    "2001: do they judge as harshly?",
    "Rule Three — the spotlight dims faster than you think",
    "Same shirt, same room — 51% fresh / 37% after 15 min",
    "The feeling has a half-life — 15 minutes",
    "23% did notice — almost one in four",
    "What were they wearing? The third person on your left",
    "Jake and his friend — My week was great!",
    "Don't run. Don't hide. — 9:35",
    "Your movie, starring: you",
    "How was your week? — the friends",
    "Remember the numbers — 46 felt it / 23 real / 8 proud",
    "Which one stung the most? — the Detective",
    "Next Wednesday — you're trapped",
    "End card — Inkl, Like / Subscribe",
]
assert len(LINES) == 41

# Stills 1-40 across frames 0..18470 (the VO span, mirroring v7's S182 start);
# first 30 get 462 frames, last 10 get 461. S41 end card: 18470..18590 (120f = 4s).
VO_END = 18470
TOTAL = 18590
lens = [462] * 30 + [461] * 10
assert sum(lens) == VO_END

segments, shots = [], []
a = 0
for i, ln in enumerate(lens, start=1):
    segments.append({"shot": f"S{i}", "a": a, "b": a + ln, "t0": 0, "t1": ln, "line": LINES[i - 1]})
    shots.append({"id": f"S{i}", "size": "wide", "key": ln // 2, "len": ln, "first": a, "line": LINES[i - 1]})
    a += ln
segments.append({"shot": "S41", "a": VO_END, "b": TOTAL, "t0": 0, "t1": 120, "line": LINES[40]})
shots.append({"id": "S41", "size": "wide", "key": 60, "len": 120, "first": VO_END, "line": LINES[40]})

timeline = {
    "slug": "zenn-002-stills",
    "title": "The Spotlight Effect — stills cut",
    "fps": 30,
    "total": TOTAL,
    "segments": segments,
    "shots": shots,
    "fx": [],
    "audio": {
        "voice": "zenn-002/voice.wav",
        "sfx": "zenn-002/sfx.wav",
        "voiceVol": 0.8,
        "sfxVol": 0.2559,
        "music": "zenn-002/music.wav",
        "musicVol": 0.0499,
    },
}
with open(os.path.join(HERE, "timeline.json"), "w") as f:
    json.dump(timeline, f, indent=2)

# --- shots.tsx: one Ken Burns component per still ---------------------------
hdr = """import React from 'react';
import { staticFile } from 'remotion';
import { ShotProps } from '../../engine';

// "The Spotlight Effect" — stills cut: the 41 externally-made stills Javion
// sent (chat.z.ai board), one per beat, each held ~15s with a slow Ken Burns
// drift so the frame stays alive. Stills are shown exactly as made — no grade,
// no vignette, no grain on top (grain/vignette off in index.tsx). dir=+1 zooms
// in and drifts right/down; dir=-1 zooms out and drifts left/up; the end card
// (S41) holds static. Zoom caps at 1.04 so nothing at the frame edge is lost.

const KB: React.FC<{ src: string; t: number; len: number; dir: number }> = ({ src, t, len, dir }) => {
  const p = len > 0 ? Math.min(1, Math.max(0, t / len)) : 0;
  const s = dir === 0 ? 1 : dir > 0 ? 1 + 0.04 * p : 1.04 - 0.04 * p;
  const dx = dir * 12 * p;
  const dy = -dir * 6 * p;
  return (
    <image
      href={staticFile(src)}
      x={0}
      y={0}
      width={1920}
      height={1080}
      transform={`translate(${960 + dx} ${540 + dy}) scale(${s}) translate(-960 -540)`}
    />
  );
};

"""
parts = [hdr]
for i in range(1, 42):
    d = 0 if i == 41 else (1 if i % 2 == 1 else -1)
    parts.append(
        f"export const S{i}: React.FC<ShotProps> = ({{ t, len }}) => (\n"
        f"  <KB src=\"zenn-002-stills/shot_{i:02d}.jpg\" t={{t}} len={{len}} dir={{{d}}} />\n"
        f");\n"
    )
with open(os.path.join(HERE, "shots.tsx"), "w") as f:
    f.write("\n".join(parts))

print(f"timeline.json + shots.tsx written: {len(segments)} segments, total {TOTAL} frames")
