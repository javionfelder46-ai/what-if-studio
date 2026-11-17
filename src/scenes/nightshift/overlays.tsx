// overlays.tsx — keyword overlays + HUD for the Night Shift.
// Pure refactor: moved verbatim out of NightShift2D.tsx. No visual or timing changes.
//
// KEYWORD OVERLAYS + HUD — lighthouse technique (approved by Javion Nov 14).
// Big bold white ALL-CAPS keywords, 2-4 words per beat, synced to the v2
// narration — muted scrollers read these. S3 is SKIPPED (the paper already
// carries the rules text). Times are absolute frames at 24fps from the v2
// alignment (voice_liam_v2, 75.94s). The HUD is a diegetic counter, top-left:
// "ROOMS: 100 / OCCUPIED: 1" from S2 start, plus the bleak gag
// "PREVIOUS CLERKS: 0 STAYED" from the "last clerk left" beat (f288).

import React from 'react';
import { clamp, easeOut, FONT } from '../../engine';

export const KEYWORDS: { text: string; startF: number; endF: number }[] = [
  // S1 (cold open)
  { text: 'FLOOR 13', startF: 30, endF: 59 },
  { text: 'ONLY 12 FLOORS', startF: 72, endF: 109 },
  { text: 'JOB NO ONE WANTED', startF: 118, endF: 151 },
  // S2 (the lobby / the rules setup)
  { text: 'NIGHT CLERK', startF: 156, endF: 180 },
  { text: 'THE GRAND MARLOW', startF: 180, endF: 213 },
  { text: '100 ROOMS', startF: 213, endF: 251 },
  { text: 'ONE OCCUPIED', startF: 251, endF: 288 },
  { text: 'LAST CLERK LEFT', startF: 288, endF: 343 },
  { text: 'NO GOODBYE. NO JACKET.', startF: 343, endF: 396 },
  { text: 'FOUR RULES', startF: 396, endF: 436 },
  // S3 skipped — the paper carries the rules.
  // S4 (no 13th floor)
  { text: 'NO 13TH FLOOR', startF: 876, endF: 931 },
  { text: 'NOT BY NAME', startF: 931, endF: 961 },
  { text: 'STILL THERE', startF: 961, endF: 998 },
  { text: "DON'T PUT THE NUMBER", startF: 998, endF: 1039 },
  // S5 (2:59 AM)
  { text: '2:59 AM', startF: 1047, endF: 1084 },
  { text: 'ELEVATOR DINGS', startF: 1117, endF: 1153 },
  { text: "NOBODY'S INSIDE", startF: 1190, endF: 1230 },
  { text: 'STACK OF CASH', startF: 1257, endF: 1291 },
  { text: 'STILL WARM', startF: 1291, endF: 1324 },
  { text: 'YOU STEP IN', startF: 1324, endF: 1350 },
  { text: 'IT STOPS', startF: 1416, endF: 1443 },
  { text: 'DOORS OPEN', startF: 1443, endF: 1469 },
  // S6 (the hallway)
  { text: 'DARK HALLWAY', startF: 1473, endF: 1505 },
  { text: 'DOOR AT THE END', startF: 1505, endF: 1538 },
  { text: 'ELEVATOR IS WAITING', startF: 1538, endF: 1585 },
  { text: "FLOOR 13 DOESN'T EXIST", startF: 1585, endF: 1643 },
  { text: 'GET OUT OR STAY IN?', startF: 1643, endF: 1695 },
];

export const KeywordOverlay: React.FC<{ f: number }> = ({ f }) => {
  const kw = KEYWORDS.find((k) => f >= k.startF && f < k.endF);
  if (!kw) return null;
  const into = f - kw.startF;
  const out = kw.endF - f;
  // pop in over the first 5 frames, fade out over the last 5
  const pop = into < 5 ? easeOut(clamp(into / 5)) : 1;
  const fade = out < 5 ? clamp(out / 5) : 1;
  const opacity = pop * fade;
  const scale = 0.85 + 0.15 * pop;
  return (
    <g opacity={opacity} transform={`translate(540 560) scale(${scale})`}>
      {/* Bricolage Grotesque 800 — the heavy display face. Fragment Mono has no
          bold weight loaded (400 only), so a 700 keyword fell back to thin
          regular and read as an outline. The display face at 800 is the big
          bold lighthouse look. No stroke — solid white reads clean. */}
      <text
        x={0}
        y={0}
        textAnchor="middle"
        fontFamily={FONT.title}
        fontWeight={800}
        fontSize={76}
        fill="#FFFFFF"
      >
        {kw.text}
      </text>
    </g>
  );
};

export const Hud: React.FC<{ f: number }> = ({ f }) => {
  // from S2 start (f151) through the end
  if (f < 151) return null;
  const gag = f >= 288;
  return (
    <g fontFamily={FONT.ui} fontSize={28} fill="#FFFFFF" opacity={0.85}>
      <text x={40} y={64}>ROOMS: 100 / OCCUPIED: 1</text>
      {gag ? <text x={40} y={104}>PREVIOUS CLERKS: 0 STAYED</text> : null}
    </g>
  );
};
