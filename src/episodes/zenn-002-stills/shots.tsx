import React from 'react';
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


export const S1: React.FC<ShotProps> = ({ t, len }) => (
  <KB src="zenn-002-stills/shot_01.jpg" t={t} len={len} dir={1} />
);

export const S2: React.FC<ShotProps> = ({ t, len }) => (
  <KB src="zenn-002-stills/shot_02.jpg" t={t} len={len} dir={-1} />
);

export const S3: React.FC<ShotProps> = ({ t, len }) => (
  <KB src="zenn-002-stills/shot_03.jpg" t={t} len={len} dir={1} />
);

export const S4: React.FC<ShotProps> = ({ t, len }) => (
  <KB src="zenn-002-stills/shot_04.jpg" t={t} len={len} dir={-1} />
);

export const S5: React.FC<ShotProps> = ({ t, len }) => (
  <KB src="zenn-002-stills/shot_05.jpg" t={t} len={len} dir={1} />
);

export const S6: React.FC<ShotProps> = ({ t, len }) => (
  <KB src="zenn-002-stills/shot_06.jpg" t={t} len={len} dir={-1} />
);

export const S7: React.FC<ShotProps> = ({ t, len }) => (
  <KB src="zenn-002-stills/shot_07.jpg" t={t} len={len} dir={1} />
);

export const S8: React.FC<ShotProps> = ({ t, len }) => (
  <KB src="zenn-002-stills/shot_08.jpg" t={t} len={len} dir={-1} />
);

export const S9: React.FC<ShotProps> = ({ t, len }) => (
  <KB src="zenn-002-stills/shot_09.jpg" t={t} len={len} dir={1} />
);

export const S10: React.FC<ShotProps> = ({ t, len }) => (
  <KB src="zenn-002-stills/shot_10.jpg" t={t} len={len} dir={-1} />
);

export const S11: React.FC<ShotProps> = ({ t, len }) => (
  <KB src="zenn-002-stills/shot_11.jpg" t={t} len={len} dir={1} />
);

export const S12: React.FC<ShotProps> = ({ t, len }) => (
  <KB src="zenn-002-stills/shot_12.jpg" t={t} len={len} dir={-1} />
);

export const S13: React.FC<ShotProps> = ({ t, len }) => (
  <KB src="zenn-002-stills/shot_13.jpg" t={t} len={len} dir={1} />
);

export const S14: React.FC<ShotProps> = ({ t, len }) => (
  <KB src="zenn-002-stills/shot_14.jpg" t={t} len={len} dir={-1} />
);

export const S15: React.FC<ShotProps> = ({ t, len }) => (
  <KB src="zenn-002-stills/shot_15.jpg" t={t} len={len} dir={1} />
);

export const S16: React.FC<ShotProps> = ({ t, len }) => (
  <KB src="zenn-002-stills/shot_16.jpg" t={t} len={len} dir={-1} />
);

export const S17: React.FC<ShotProps> = ({ t, len }) => (
  <KB src="zenn-002-stills/shot_17.jpg" t={t} len={len} dir={1} />
);

export const S18: React.FC<ShotProps> = ({ t, len }) => (
  <KB src="zenn-002-stills/shot_18.jpg" t={t} len={len} dir={-1} />
);

export const S19: React.FC<ShotProps> = ({ t, len }) => (
  <KB src="zenn-002-stills/shot_19.jpg" t={t} len={len} dir={1} />
);

export const S20: React.FC<ShotProps> = ({ t, len }) => (
  <KB src="zenn-002-stills/shot_20.jpg" t={t} len={len} dir={-1} />
);

export const S21: React.FC<ShotProps> = ({ t, len }) => (
  <KB src="zenn-002-stills/shot_21.jpg" t={t} len={len} dir={1} />
);

export const S22: React.FC<ShotProps> = ({ t, len }) => (
  <KB src="zenn-002-stills/shot_22.jpg" t={t} len={len} dir={-1} />
);

export const S23: React.FC<ShotProps> = ({ t, len }) => (
  <KB src="zenn-002-stills/shot_23.jpg" t={t} len={len} dir={1} />
);

export const S24: React.FC<ShotProps> = ({ t, len }) => (
  <KB src="zenn-002-stills/shot_24.jpg" t={t} len={len} dir={-1} />
);

export const S25: React.FC<ShotProps> = ({ t, len }) => (
  <KB src="zenn-002-stills/shot_25.jpg" t={t} len={len} dir={1} />
);

export const S26: React.FC<ShotProps> = ({ t, len }) => (
  <KB src="zenn-002-stills/shot_26.jpg" t={t} len={len} dir={-1} />
);

export const S27: React.FC<ShotProps> = ({ t, len }) => (
  <KB src="zenn-002-stills/shot_27.jpg" t={t} len={len} dir={1} />
);

export const S28: React.FC<ShotProps> = ({ t, len }) => (
  <KB src="zenn-002-stills/shot_28.jpg" t={t} len={len} dir={-1} />
);

export const S29: React.FC<ShotProps> = ({ t, len }) => (
  <KB src="zenn-002-stills/shot_29.jpg" t={t} len={len} dir={1} />
);

export const S30: React.FC<ShotProps> = ({ t, len }) => (
  <KB src="zenn-002-stills/shot_30.jpg" t={t} len={len} dir={-1} />
);

export const S31: React.FC<ShotProps> = ({ t, len }) => (
  <KB src="zenn-002-stills/shot_31.jpg" t={t} len={len} dir={1} />
);

export const S32: React.FC<ShotProps> = ({ t, len }) => (
  <KB src="zenn-002-stills/shot_32.jpg" t={t} len={len} dir={-1} />
);

export const S33: React.FC<ShotProps> = ({ t, len }) => (
  <KB src="zenn-002-stills/shot_33.jpg" t={t} len={len} dir={1} />
);

export const S34: React.FC<ShotProps> = ({ t, len }) => (
  <KB src="zenn-002-stills/shot_34.jpg" t={t} len={len} dir={-1} />
);

export const S35: React.FC<ShotProps> = ({ t, len }) => (
  <KB src="zenn-002-stills/shot_35.jpg" t={t} len={len} dir={1} />
);

export const S36: React.FC<ShotProps> = ({ t, len }) => (
  <KB src="zenn-002-stills/shot_36.jpg" t={t} len={len} dir={-1} />
);

export const S37: React.FC<ShotProps> = ({ t, len }) => (
  <KB src="zenn-002-stills/shot_37.jpg" t={t} len={len} dir={1} />
);

export const S38: React.FC<ShotProps> = ({ t, len }) => (
  <KB src="zenn-002-stills/shot_38.jpg" t={t} len={len} dir={-1} />
);

export const S39: React.FC<ShotProps> = ({ t, len }) => (
  <KB src="zenn-002-stills/shot_39.jpg" t={t} len={len} dir={1} />
);

export const S40: React.FC<ShotProps> = ({ t, len }) => (
  <KB src="zenn-002-stills/shot_40.jpg" t={t} len={len} dir={-1} />
);

export const S41: React.FC<ShotProps> = ({ t, len }) => (
  <KB src="zenn-002-stills/shot_41.jpg" t={t} len={len} dir={0} />
);
