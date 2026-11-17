// "What If You Never Slept Again?" — 2.5D test Short. Custom 1080x1920 Main
// (the episode engine is 1920x1080-locked, so this Short does not use it).
import React from 'react';
import { useCurrentFrame } from 'remotion';
import { KitDefs } from '../../engine';
import { TIMELINE, TOTAL } from './timing';
import { S1, S2, S3, S4, S5, S6, S7, END } from './shots';

export { TOTAL };

export const Main: React.FC = () => {
  const g = useCurrentFrame();
  const scene = TIMELINE.find((s) => g >= s.a && g < s.b) ?? TIMELINE[TIMELINE.length - 1];
  const t = g - scene.a;
  const len = scene.b - scene.a;
  const props = { t, len, g };
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ display: 'block', background: '#0A0E18' }}>
      <KitDefs />
      {scene.scene === 'S1' && <S1 {...props} />}
      {scene.scene === 'S2' && <S2 {...props} />}
      {scene.scene === 'S3' && <S3 {...props} />}
      {scene.scene === 'S4' && <S4 {...props} />}
      {scene.scene === 'S5' && <S5 {...props} />}
      {scene.scene === 'S6' && <S6 {...props} />}
      {scene.scene === 'S7' && <S7 {...props} />}
      {scene.scene === 'END' && <END {...props} />}
    </svg>
  );
};
