import React from 'react';
import {
  Hero, Pose, basePose, poseAt, faceAt, kf, camT, LOOKS, Foreground, HudChip, TitleCard,
  WallCalendar, WallClock, Cell, cellStand, Cave, Antarctic, Lab, Classroom, Exterior, Stage,
  FONT, ShotProps, joints, toWorld, Magnifier, EndCard,
} from '../../engine';

// "You're Trapped for 30 Days — What It Does to Your Brain" — 159 shots, one per scene,
// generated from the verified puppet specs (scenes/zenn_003_v2_specs.json) by
// /tmp/zenn003_gen_shots.py. Every shot is a pure function of its own clock t; each is
// right at its `key` frame first. Review the generated code, then verify on the board.
// DAY X is a HudChip readout (never a caption); scene labels are screen-space hand text.
// S159 is the voiceless end card (EndCard, same as video #2 S182) — appended after the
// specs loop; it has no puppet spec and no edit cue of its own (edit '+131' + end f:15960).

const PINK = '#A9C6FF'; // MOONLIGHT — popup words are moonlight blue (Nov 11); was #E91E63
const CREAM = '#F6EFE3';

const DayChip: React.FC<{ t: number; day: string; x?: number; y?: number }> = ({ t, day, x = 96, y = 112 }) => (
  <HudChip x={x} y={y} f={t} label={day} icon="dot" />
);

const QMark: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <text x={x} y={y} textAnchor="middle" fontFamily={FONT.hand} fontSize={200 * s} fill={PINK}>?</text>
);

const SoundWaves: React.FC<{ x: number; y: number; s?: number; mode?: string }> = ({ x, y, s = 1, mode = 'wavy' }) => (
  <g stroke={CREAM} strokeWidth={7 * s} fill="none" strokeLinecap="round" opacity={0.9}>
    {/* flatline sits 70u below the prop's y: at y it coincides with the Cell set's lamp bar and vanishes into the glow (S56). */}
    {mode === 'flatline' ? (<path d={`M ${x - 50 * s} ${y + 70 * s} H ${x + 50 * s}`} />) : ([0, 1, 2].map((i) => (
      <path key={i} d={`M ${x + (14 + i * 20) * s} ${y - (26 - i * 8) * s} Q ${x + (34 + i * 22) * s} ${y} ${x + (14 + i * 20) * s} ${y + (26 - i * 8) * s}`} />
    )))}
  </g>
);

const Brain: React.FC<{ x: number; y: number; s?: number; t?: number; bpm?: number }> = ({ x, y, s = 1, t = 0, bpm = 0 }) => {
  const beat = bpm > 0 ? 1 + 0.07 * Math.max(0, Math.sin((t / 30) * (bpm / 60) * Math.PI * 2)) : 1;
  return (
    <g transform={`translate(${x} ${y}) scale(${s * beat})`}>
      <path d="M -70 10 Q -78 -52 -20 -58 Q 4 -78 30 -56 Q 74 -52 66 4 Q 62 44 20 48 Q -40 52 -70 10 Z" fill="#E8A0B0" stroke="#161616" strokeWidth={5} />
      <path d="M -40 -30 Q -20 -18 -34 4 M -6 -44 Q 6 -24 -8 0 M 30 -36 Q 44 -16 30 8" stroke="#C97A8C" strokeWidth={5} fill="none" strokeLinecap="round" />
    </g>
  );
};

const MiniIcon: React.FC<{ kind: string; x: number; y: number }> = ({ kind, x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    {kind === 'clock' ? (<g><circle r={26} fill="#F2EAD8" stroke="#161616" strokeWidth={4} /><path d="M 0 0 L 0 -14 M 0 0 L 10 6" stroke="#161616" strokeWidth={4} strokeLinecap="round" /></g>) : kind === 'bed' ? (<g><rect x={-26} y={-6} width={52} height={16} rx={4} fill="#608EAA" stroke="#161616" strokeWidth={4} /><rect x={-26} y={-18} width={20} height={12} rx={4} fill="#F2EAD8" stroke="#161616" strokeWidth={3} /></g>) : kind === 'voice' ? (<g stroke="#F6EFE3" strokeWidth={5} fill="none" strokeLinecap="round"><path d="M -14 -12 Q -4 0 -14 12 M 0 -18 Q 12 0 0 18 M 14 -12 Q 24 0 14 12" /></g>) : (<circle r={14} fill="#E8C86A" stroke="#161616" strokeWidth={4} />)}
  </g>
);

const Prop: React.FC<{ kind: string; x: number; y: number; s?: number; t?: number; extra?: Record<string, unknown> }> = ({ kind, x, y, s = 1, t = 0, extra = {} }) => {
  const dX = ((extra.drift_x as number) || 0) * Math.sin(t / 45);
  switch (kind) {
    case 'question_mark': return <QMark x={x} y={y} s={s} />;
    case 'brain': return <Brain x={x} y={y} s={s} t={t} bpm={(extra.bpm as number) || 0} />;
    case 'calendar': return <WallCalendar x={x} y={y - 170 * s} w={260 * s} crossed={(extra.crossed as number) || 0} />;
    case 'wall_clock': return <WallClock x={x} y={y} r={44 * s} t={t} />;
    case 'sound_waves': return <SoundWaves x={x} y={y} s={s} mode={(extra.mode as string) || 'wavy'} />;
    case 'lightbulb': return (<g transform={`translate(${x} ${y}) scale(${s})`}><circle cx={0} cy={-30} r={34} fill="#FFE2B0" stroke="#161616" strokeWidth={5} /><path d="M -14 4 L 14 4 L 8 34 L -8 34 Z" fill="#8A7A5A" stroke="#161616" strokeWidth={4} />{[0, 1, 2, 3, 4, 5].map((i) => { const a = (i * 60 * Math.PI) / 180; return <path key={i} d={`M ${Math.cos(a) * 48} ${-30 + Math.sin(a) * 48} L ${Math.cos(a) * 64} ${-30 + Math.sin(a) * 64}`} stroke="#FFE2B0" strokeWidth={5} strokeLinecap="round" />; })}</g>);
    case 'checklist': return (<g transform={`translate(${x} ${y}) scale(${s})`}><rect x={-70} y={-90} width={140} height={180} fill="#F2EAD8" stroke="#161616" strokeWidth={4} />{[0, 1, 2, 3].map((i) => (<g key={i}><path d={`M -52 ${-58 + i * 38} L -40 ${-46 + i * 38} L -24 ${-66 + i * 38}`} stroke="#2A7A4A" strokeWidth={5} fill="none" strokeLinecap="round" /><path d={`M -12 ${-52 + i * 38} L 52 ${-52 + i * 38}`} stroke="#4A4438" strokeWidth={4} strokeLinecap="round" /></g>))}</g>);
    case 'sign': return (<g transform={`translate(${x} ${y}) scale(${s})`}>{(() => { const lns = ((extra.text as string) || '').split('\n'); const mw = Math.max(0, ...lns.map((l) => l.length)); const w = Math.max(260, mw * 19 + 48); const h = 28 + lns.length * 44; return (<g><rect x={-w / 2} y={-h / 2} width={w} height={h} rx={10} fill="#F2EAD8" stroke="#161616" strokeWidth={5} />{lns.map((ln, i) => (<text key={i} x={0} y={-h / 2 + 32 + i * 44} textAnchor="middle" fontFamily={FONT.hand} fontSize={36} fill="#161616">{ln}</text>))}</g>); })()}</g>);
    case 'door': return (<g transform={`translate(${x} ${y}) scale(${s})`}>{extra.open_ ? (<g>{/* Nov 12 v14 (Javion: "look at the door it's glitched"): the old open_ was a translucent warm wash over the closed slab — a flat tan board that hid the padlock, cut the picture and sat on the bowl. Now a real OPEN doorway: sunlit opening inset in the frame, the door swung open toward the viewer hinged on the right jamb (foreshortened panel, two recessed panels + knob), sunlight spilling on the floor. */}<rect x={-110} y={-180} width={220} height={360} fill="#3A3340" stroke="#1E1824" strokeWidth={6} /><rect x={-98} y={-168} width={196} height={336} fill="#FFE9BE" /><rect x={-78} y={-148} width={156} height={296} fill="#FFF6DC" opacity={0.85} /><polygon points="-98,168 98,168 170,330 -170,330" fill="#FFE2B0" opacity={0.28} /><polygon points="-70,168 70,168 120,320 -120,320" fill="#FFE2B0" opacity={0.3} /><rect x={98} y={-168} width={68} height={336} fill="#453C4C" stroke="#1E1824" strokeWidth={5} /><rect x={108} y={-148} width={48} height={130} fill="none" stroke="#332C3A" strokeWidth={3} /><rect x={108} y={8} width={48} height={130} fill="none" stroke="#332C3A" strokeWidth={3} /><circle cx={156} cy={20} r={10} fill="#8A7A5A" stroke="#1E1824" strokeWidth={4} /></g>) : (<g><rect x={-110} y={-180} width={220} height={360} fill="#453C4C" stroke="#1E1824" strokeWidth={6} /><circle cx={88} cy={20} r={12} fill="#8A7A5A" stroke="#1E1824" strokeWidth={4} /></g>)}</g>);
    case 'accordion': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><rect x={-70} y={-45} width={140} height={90} rx={8} fill="#D96A5F" stroke="#161616" strokeWidth={5} /><path d="M -35 -45 V 45 M 0 -45 V 45 M 35 -45 V 45" stroke="#161616" strokeWidth={3} /><rect x={-84} y={-30} width={14} height={60} rx={5} fill="#F2EAD8" stroke="#161616" strokeWidth={4} /><rect x={70} y={-30} width={14} height={60} rx={5} fill="#F2EAD8" stroke="#161616" strokeWidth={4} /></g>);
    case 'alarm_bell': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><path d="M -52 28 Q -52 -42 0 -42 Q 52 -42 52 28 Z" fill="#E8C86A" stroke="#161616" strokeWidth={5} /><rect x={-58} y={28} width={116} height={10} rx={5} fill="#8A7A5A" stroke="#161616" strokeWidth={4} /><circle cx={0} cy={48} r={9} fill="#161616" /><path d="M -52 -30 L -72 -52 M 52 -30 L 72 -52" stroke="#161616" strokeWidth={5} strokeLinecap="round" /></g>);
    case 'balance_scale': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><path d="M 0 -70 V 62 M -28 62 H 28" stroke="#161616" strokeWidth={6} strokeLinecap="round" /><g transform={`rotate(${(extra.tilt as number) || 0})`}><path d="M -85 -52 H 85" stroke="#161616" strokeWidth={6} strokeLinecap="round" /><path d="M -85 -52 L -105 -18 M -85 -52 L -65 -18 M 85 -52 L 65 -18 M 85 -52 L 105 -18" stroke="#161616" strokeWidth={4} /><path d="M -108 -18 Q -85 16 -62 -18 Z" fill="#C97A8C" stroke="#161616" strokeWidth={4} /><path d="M 62 -18 Q 85 16 108 -18 Z" fill="#C97A8C" stroke="#161616" strokeWidth={4} /></g>{((extra.left as string) || '').split('\n').map((ln, i) => (<text key={i} x={-85} y={82 + i * 26} textAnchor="middle" fontFamily={FONT.hand} fontSize={24} fill="#F6EFE3">{ln}</text>))}{((extra.right as string) || '').split('\n').map((ln, i) => (<text key={i} x={85} y={82 + i * 26} textAnchor="middle" fontFamily={FONT.hand} fontSize={24} fill="#F6EFE3">{ln}</text>))}</g>);
    case 'ball_game': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><circle cx={-10} cy={0} r={46} fill="#D96A5F" stroke="#161616" strokeWidth={5} /><path d="M -52 -10 Q -10 10 32 -10 M -40 34 Q -10 12 28 34" stroke="#161616" strokeWidth={4} fill="none" /><path d="M -78 -40 Q -92 -10 -78 20 M -92 -52 Q -108 -14 -92 26" stroke="#F6EFE3" strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.7} /><path d="M 62 -52 V 10" stroke="#161616" strokeWidth={5} /><ellipse cx={78} cy={12} rx={26} ry={8} fill="none" stroke="#E8C86A" strokeWidth={5} /></g>);
    case 'bdnf': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><path d="M -50 -18 L 40 -28 M -50 -18 L 0 34 M 40 -28 L 0 34" stroke="#F6EFE3" strokeWidth={4} /><circle cx={-50} cy={-18} r={18} fill="#7FA97A" stroke="#161616" strokeWidth={4} /><circle cx={40} cy={-28} r={14} fill="#E8C86A" stroke="#161616" strokeWidth={4} /><circle cx={0} cy={34} r={16} fill="#608EAA" stroke="#161616" strokeWidth={4} /><circle cx={-50} cy={-18} r={5} fill="#161616" /><circle cx={40} cy={-28} r={4} fill="#161616" /><circle cx={0} cy={34} r={5} fill="#161616" /></g>);
    case 'bed': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><rect x={-95} y={-6} width={190} height={22} rx={4} fill="#8A7A5A" stroke="#161616" strokeWidth={4} /><rect x={-95} y={-28} width={190} height={24} rx={6} fill="#F2EAD8" stroke="#161616" strokeWidth={4} /><rect x={-88} y={-50} width={52} height={24} rx={8} fill="#FFFFFF" stroke="#161616" strokeWidth={4} /><rect x={-10} y={-28} width={105} height={24} fill="#608EAA" stroke="#161616" strokeWidth={4} /><rect x={-88} y={16} width={8} height={22} fill="#161616" /><rect x={80} y={16} width={8} height={22} fill="#161616" /></g>);
    case 'bench': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><rect x={-90} y={-58} width={180} height={14} rx={4} fill="#8A7A5A" stroke="#161616" strokeWidth={4} /><rect x={-90} y={-14} width={180} height={16} rx={4} fill="#8A7A5A" stroke="#161616" strokeWidth={4} /><rect x={-82} y={-44} width={10} height={30} fill="#161616" /><rect x={72} y={-44} width={10} height={30} fill="#161616" /><rect x={-82} y={2} width={10} height={52} fill="#161616" /><rect x={72} y={2} width={10} height={52} fill="#161616" /></g>);
    case 'book': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><path d="M -90 -40 Q -45 -58 0 -40 L 0 40 Q -45 22 -90 40 Z" fill="#F2EAD8" stroke="#161616" strokeWidth={4} /><path d="M 90 -40 Q 45 -58 0 -40 L 0 40 Q 45 22 90 40 Z" fill="#F2EAD8" stroke="#161616" strokeWidth={4} /><path d="M -72 -24 H -16 M -72 -6 H -16 M -72 12 H -16 M 16 -24 H 72 M 16 -6 H 72 M 16 12 H 72" stroke="#4A4438" strokeWidth={3} strokeLinecap="round" /></g>);
    case 'brain_pair': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><Brain x={-58} y={0} s={0.62} t={t} /><Brain x={58} y={0} s={0.32} t={t} /></g>); {/* v38 (Javion: "is this picture suppose to have 2 brains??"): YES — it's the before/after from the script ("scanned their brains before and after... had shrunk about seven percent"). But the two brains were too close in size (0.62 vs 0.45) so they read as duplicates. The "after" brain is now clearly smaller (0.32) so the before/after reads. */}
    case 'brain_scan': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><path d="M -62 62 L -62 -10 Q -62 -62 0 -62 Q 62 -62 62 -10 L 62 62" fill="none" stroke="#F6EFE3" strokeWidth={5} /><Brain x={0} y={-8} s={0.55} t={t} /><path d="M -62 -62 H 62 M -62 -30 H 62 M -62 2 H 62" stroke="#E91E63" strokeWidth={3} opacity={0.55} /></g>);
    case 'breathalyzer': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><rect x={-45} y={-20} width={90} height={55} rx={10} fill="#3E8C86" stroke="#161616" strokeWidth={4} /><rect x={-30} y={-8} width={34} height={20} rx={4} fill="#161616" /><text x={-13} y={8} fontFamily={FONT.hand} fontSize={18} fill="#9BEFB0">0.00</text><path d="M 45 -12 L 78 -34" stroke="#161616" strokeWidth={6} strokeLinecap="round" /><circle cx={82} cy={-38} r={8} fill="#F2EAD8" stroke="#161616" strokeWidth={4} /></g>);
    case 'brick_wall': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><rect x={-110} y={-70} width={220} height={140} rx={6} fill="#7A4A42" stroke="#161616" strokeWidth={5} /><path d="M -110 -24 H 110 M -110 24 H 110 M -55 -70 V -24 M 0 -24 V 24 M 55 -70 V -24 M -55 24 V 70" stroke="#5A322C" strokeWidth={4} /></g>);
    case 'car': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><path d="M -95 30 L -95 0 Q -95 -14 -78 -16 L -58 -16 L -40 -44 Q -36 -52 -24 -52 L 30 -52 Q 42 -52 48 -42 L 62 -16 L 82 -16 Q 95 -16 95 0 L 95 30 Z" fill="#D96A5F" stroke="#161616" strokeWidth={5} /><rect x={-30} y={-44} width={62} height={28} rx={4} fill="#BFE3F0" stroke="#161616" strokeWidth={4} /><circle cx={-52} cy={30} r={16} fill="#161616" /><circle cx={52} cy={30} r={16} fill="#161616" /><circle cx={-52} cy={30} r={7} fill="#8A8EA6" /><circle cx={52} cy={30} r={7} fill="#8A8EA6" /></g>);
    case 'chalkboard': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}>{((extra.lines as string[]) || []).map((ln, i) => (<text key={i} x={0} y={-10 + i * 52} textAnchor="middle" fontFamily={FONT.hand} fontSize={52} fill="#EDEFE6">{ln}</text>))}</g>);
    case 'cigarette': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><g transform="rotate(-24)"><rect x={-70} y={-8} width={120} height={16} rx={8} fill="#F2EAD8" stroke="#161616" strokeWidth={4} /><rect x={34} y={-8} width={16} height={16} fill="#E8862E" stroke="#161616" strokeWidth={4} /><path d="M 58 -10 Q 74 -34 58 -52 Q 84 -30 66 -58" stroke="#F6EFE3" strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.8} /></g></g>);
    case 'coffee_cup': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><rect x={-42} y={-30} width={84} height={66} rx={10} fill="#F2EAD8" stroke="#161616" strokeWidth={5} /><path d="M 42 -16 Q 66 -16 66 2 Q 66 20 42 20" fill="none" stroke="#161616" strokeWidth={5} /><path d="M -20 -46 Q -28 -62 -18 -74 M 0 -46 Q -8 -64 2 -78 M 20 -46 Q 12 -62 22 -74" stroke="#F6EFE3" strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.8} /><rect x={-42} y={-6} width={84} height={14} fill="#7A4A42" /></g>);
    case 'comment_box': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><rect x={-100} y={-58} width={200} height={104} rx={14} fill="#F2EAD8" stroke="#161616" strokeWidth={5} /><path d="M -60 46 L -40 78 L -28 46 Z" fill="#F2EAD8" stroke="#161616" strokeWidth={4} /><circle cx={-68} cy={-28} r={14} fill="#608EAA" stroke="#161616" strokeWidth={4} /><path d="M -40 -34 H 70 M -40 -14 H 70 M -40 6 H 40" stroke="#4A4438" strokeWidth={4} strokeLinecap="round" /></g>);
    case 'cubicles': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><rect x={-105} y={-50} width={60} height={110} fill="#453C4C" stroke="#161616" strokeWidth={4} /><rect x={-30} y={-50} width={60} height={110} fill="#3A3340" stroke="#161616" strokeWidth={4} /><rect x={45} y={-50} width={60} height={110} fill="#453C4C" stroke="#161616" strokeWidth={4} /><rect x={-105} y={20} width={210} height={10} fill="#8A7A5A" stroke="#161616" strokeWidth={3} /></g>);
    case 'door_row': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><g transform="translate(-58 0) scale(0.55)"><rect x={-110} y={-180} width={220} height={360} fill="#453C4C" stroke="#1E1824" strokeWidth={6} /><circle cx={88} cy={20} r={12} fill="#8A7A5A" stroke="#1E1824" strokeWidth={4} /></g><g transform="translate(58 0) scale(0.55)"><rect x={-110} y={-180} width={220} height={360} fill="#453C4C" stroke="#1E1824" strokeWidth={6} /><circle cx={88} cy={20} r={12} fill="#8A7A5A" stroke="#1E1824" strokeWidth={4} /></g></g>);
    case 'dots': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><circle cx={-52} cy={0} r={13} fill="#F6EFE3" /><circle cx={0} cy={0} r={13} fill="#F6EFE3" /><circle cx={52} cy={0} r={13} fill="#F6EFE3" /></g>);
    case 'ear': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><path d="M -30 -52 Q 52 -58 46 6 Q 42 58 -14 52 Q -52 46 -46 4 Q -42 -28 -10 -30 Q 12 -28 12 -4 Q 12 18 -8 16" fill="#E8C8A0" stroke="#161616" strokeWidth={5} strokeLinecap="round" /></g>);
    case 'food_tray': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><ellipse cx={0} cy={34} rx={100} ry={16} fill="#8A8EA6" stroke="#161616" strokeWidth={4} /><path d="M -62 34 Q -62 -38 0 -38 Q 62 -38 62 34 Z" fill="#C9CDD6" stroke="#161616" strokeWidth={5} /><circle cx={0} cy={-46} r={8} fill="#161616" /><circle cx={-68} cy={34} r={12} fill="#D96A5F" stroke="#161616" strokeWidth={4} /><circle cx={68} cy={34} r={12} fill="#7FA97A" stroke="#161616" strokeWidth={4} /></g>);
    case 'globe': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><circle cx={0} cy={-8} r={56} fill="#608EAA" stroke="#161616" strokeWidth={5} /><ellipse cx={0} cy={-8} rx={56} ry={22} fill="none" stroke="#161616" strokeWidth={3} /><ellipse cx={0} cy={-8} rx={22} ry={56} fill="none" stroke="#161616" strokeWidth={3} /><path d="M -48 -40 Q 0 -8 48 -40" stroke="#7FA97A" strokeWidth={8} fill="none" strokeLinecap="round" /><path d="M 0 48 V 66 M -26 66 H 26" stroke="#161616" strokeWidth={5} strokeLinecap="round" /></g>);
    case 'graph': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><path d="M -90 60 H 95 M -90 60 V -60" stroke="#F6EFE3" strokeWidth={5} strokeLinecap="round" /><path d="M -80 30 L -40 10 L 0 22 L 40 -18 L 80 -42" stroke="#E91E63" strokeWidth={5} fill="none" strokeLinecap="round" /><circle cx={-40} cy={10} r={7} fill="#F6EFE3" stroke="#161616" strokeWidth={3} /><circle cx={40} cy={-18} r={7} fill="#F6EFE3" stroke="#161616" strokeWidth={3} /><circle cx={80} cy={-42} r={7} fill="#F6EFE3" stroke="#161616" strokeWidth={3} /><text x={0} y={92} textAnchor="middle" fontFamily={FONT.hand} fontSize={26} fill="#F6EFE3">{(extra.label as string) || ''}</text></g>);
    case 'heart': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><g transform={`scale(${1 + 0.06 * Math.max(0, Math.sin((t / 30) * (((extra.bpm as number) || 60) / 60) * Math.PI * 2))})`}><path d="M 0 52 Q -78 -6 -52 -52 Q -28 -78 0 -48 Q 28 -78 52 -52 Q 78 -6 0 52 Z" fill="#E91E63" stroke="#161616" strokeWidth={5} /></g></g>);
    case 'house': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><rect x={-62} y={-12} width={124} height={76} fill="#D96A5F" stroke="#161616" strokeWidth={5} /><path d="M -78 -12 L 0 -62 L 78 -12 Z" fill="#8A7A5A" stroke="#161616" strokeWidth={5} /><rect x={-16} y={18} width={32} height={46} fill="#453C4C" stroke="#161616" strokeWidth={4} /><rect x={-48} y={4} width={24} height={24} fill="#FFE2B0" stroke="#161616" strokeWidth={4} /></g>);
    case 'icons_row': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}>{((extra.kinds as string[]) || []).map((k, i) => (<MiniIcon key={i} kind={k} x={(i - 1) * 74} y={0} />))}</g>);
    case 'key': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><circle cx={-58} cy={0} r={24} fill="#E8C86A" stroke="#161616" strokeWidth={5} /><circle cx={-58} cy={0} r={10} fill="none" stroke="#161616" strokeWidth={4} /><path d="M -34 0 H 78 M 62 0 V 22 M 78 0 V 14" stroke="#161616" strokeWidth={7} strokeLinecap="round" /></g>);
    case 'magnifier': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><circle cx={-8} cy={-12} r={52} fill="#FFFFFF" opacity={0.16} stroke="#161616" strokeWidth={6} /><text x={-8} y={-2} textAnchor="middle" fontFamily={FONT.hand} fontSize={30} fill="#161616">{(extra.word as string) || ''}</text><path d="M 28 26 L 66 62" stroke="#161616" strokeWidth={10} strokeLinecap="round" /></g>);
    case 'maze': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><rect x={-90} y={-60} width={180} height={120} rx={6} fill="#2A2530" stroke="#161616" strokeWidth={5} /><path d="M -60 -60 V 0 H -10 V -30 H 40 V 10 H 70 M -60 30 H 0 V 60 M 30 -60 V -10" stroke="#F6EFE3" strokeWidth={4} fill="none" /></g>);
    case 'memory_door': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><rect x={-70} y={-80} width={140} height={160} rx={6} fill="#453C4C" stroke="#E91E63" strokeWidth={5} /><rect x={-44} y={-52} width={52} height={40} fill="#F2EAD8" stroke="#161616" strokeWidth={3} /><circle cx={44} cy={0} r={8} fill="#E8C86A" stroke="#161616" strokeWidth={3} /></g>); {/* v38 (Javion: "its glitching with the light over head"): removed the thin #FFE2B0 highlight line across the door's top edge — under the pendant lamp it read as a stray glitch line, not a highlight. */}
    case 'mirror': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><rect x={-62} y={-70} width={124} height={140} rx={40} fill="#BFE3F0" stroke="#161616" strokeWidth={5} /><path d="M -40 -70 L 10 70 M -10 -70 L 40 70" stroke="#FFFFFF" strokeWidth={10} opacity={0.5} /><rect x={-8} y={70} width={16} height={16} fill="#161616" /></g>);
    case 'mouth': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><path d="M -72 0 Q 0 -34 72 0 Q 0 44 -72 0 Z" fill="#8A4A42" stroke="#161616" strokeWidth={5} /><ellipse cx={0} cy={8} rx={50} ry={20} fill="#3A0E0A" /><path d="M -50 -8 Q 0 -18 50 -8 L 50 2 Q 0 -8 -50 2 Z" fill="#F6EFE3" stroke="#161616" strokeWidth={3} /><ellipse cx={0} cy={20} rx={24} ry={9} fill="#C96A6A" /></g>); {/* v38 (Javion: "are the brains suppose to be like this??"): the old mouth was an almond outline + one dark oval in the middle — it read as a giant EYE (or a brain), not a mouth. Redrawn as an open talking mouth: dark interior + a white teeth band across the top + a pink tongue at the bottom. Teeth + tongue = unmistakably a mouth. */}
    case 'note': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><rect x={-80} y={-70} width={160} height={140} rx={4} fill="#F2EAD8" stroke="#161616" strokeWidth={4} /><rect x={-80} y={-70} width={160} height={22} fill="#E91E63" opacity={0.85} />{((extra.lines as string[]) || []).map((ln, i) => (<text key={i} x={-64} y={-6 + i * 34} fontFamily={FONT.hand} fontSize={24} fill="#161616">{ln}</text>))}</g>);
    case 'number_card': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><rect x={-80} y={-70} width={160} height={140} rx={10} fill="#F2EAD8" stroke="#161616" strokeWidth={5} /><text x={0} y={28} textAnchor="middle" fontFamily={FONT.hand} fontSize={96} fill="#161616">{(extra.text as string) || ''}</text></g>);
    case 'numbers': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><text x={0} y={20} textAnchor="middle" fontFamily={FONT.hand} fontSize={72} fill="#F6EFE3">7  14  21</text></g>);
    case 'paper_stacks': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><rect x={-84} y={-52} width={150} height={104} rx={4} fill="#D8D2C0" stroke="#161616" strokeWidth={4} /><rect x={-66} y={-34} width={150} height={104} rx={4} fill="#E8E2CE" stroke="#161616" strokeWidth={4} /><rect x={-48} y={-16} width={150} height={104} rx={4} fill="#F2EAD8" stroke="#161616" strokeWidth={4} /><path d="M -28 8 H 82 M -28 30 H 82 M -28 52 H 52" stroke="#4A4438" strokeWidth={4} strokeLinecap="round" /></g>);
    case 'photos': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><g transform="rotate(-8)"><rect x={-96} y={-62} width={120} height={104} fill="#F2EAD8" stroke="#161616" strokeWidth={4} /><path d="M -88 18 L -58 -22 L -34 6 L -12 -18 L 16 18 Z" fill="#608EAA" /><circle cx={-4} cy={-44} r={10} fill="#E8C86A" /></g><g transform="rotate(7)" opacity={extra.fade ? 0.55 : 1}><rect x={-16} y={-46} width={120} height={104} fill="#F2EAD8" stroke="#161616" strokeWidth={4} /><path d="M -8 34 L 22 -10 L 46 18 L 68 -6 L 96 34 Z" fill="#7FA97A" /><circle cx={76} cy={-28} r={10} fill="#E8C86A" /></g></g>);
    case 'picture_frames': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><rect x={-100} y={-60} width={84} height={100} fill="#F2EAD8" stroke="#161616" strokeWidth={4} /><circle cx={-58} cy={-22} r={14} fill="#E8C86A" /><path d="M -96 22 L -72 -8 L -52 14 L -32 -4 L -20 22 Z" fill="#608EAA" /><rect x={16} y={-60} width={84} height={100} fill="#F2EAD8" stroke="#161616" strokeWidth={4} /><circle cx={58} cy={-22} r={14} fill="#D96A5F" /><path d="M 24 22 L 50 -8 L 72 14 L 92 22 Z" fill="#7FA97A" /></g>); {/* Nov 14 (Javion: "That lil mountain corner is sticking out") — the left mountain's last point was x=-8, 8 units past the frame's right edge (-16). Rescaled the mountain to span -96 to -20 so it sits fully inside the frame. */}
    case 'pocket_watch': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><circle cx={0} cy={6} r={54} fill="#F2EAD8" stroke="#161616" strokeWidth={5} /><path d="M -6 -48 Q 0 -78 26 -72" fill="none" stroke="#161616" strokeWidth={5} strokeLinecap="round" /><circle cx={28} cy={-70} r={7} fill="#E8C86A" stroke="#161616" strokeWidth={3} /><path d="M 0 6 L 0 -26 M 0 6 L 22 18" stroke="#161616" strokeWidth={5} strokeLinecap="round" /><circle cx={0} cy={6} r={5} fill="#161616" /></g>);
    case 'radio_dial': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><rect x={-95} y={-48} width={190} height={96} rx={10} fill="#8A5A3A" stroke="#161616" strokeWidth={5} /><circle cx={-58} cy={0} r={26} fill="#2A2530" stroke="#161616" strokeWidth={4} /><circle cx={-58} cy={0} r={10} fill="#E8C86A" /><rect x={10} y={-28} width={64} height={18} rx={4} fill="#FFE2B0" stroke="#161616" strokeWidth={3} /><path d="M 74 -48 L 96 -78" stroke="#161616" strokeWidth={4} strokeLinecap="round" /><text x={0} y={78} textAnchor="middle" fontFamily={FONT.hand} fontSize={26} fill="#F6EFE3">{(extra.label as string) || ''}</text></g>);
    case 'recap_board': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><rect x={-105} y={-70} width={210} height={140} rx={8} fill="#2A2530" stroke="#4A4438" strokeWidth={4} />{[0, 1, 2].map((i) => (<g key={i}><path d={`M -88 ${-40 + i * 40} L -76 ${-28 + i * 40} L -60 ${-48 + i * 40}`} stroke="#E91E63" strokeWidth={5} fill="none" strokeLinecap="round" /><path d={`M -44 ${-34 + i * 40} L 88 ${-34 + i * 40}`} stroke="#EFE2CC" strokeWidth={4} strokeLinecap="round" /></g>))}</g>);
    case 'recovery_road': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><path d="M -110 70 L -28 -60 H 28 L 110 70 Z" fill="#453C4C" stroke="#161616" strokeWidth={5} /><path d="M -8 60 L -3 -44 M 3 -44 L 8 60" stroke="#FFE2B0" strokeWidth={5} strokeDasharray="14 12" /><circle cx={72} cy={-52} r={20} fill="#FFE2B0" stroke="#161616" strokeWidth={4} /></g>);
    case 'road_sign': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><path d="M 0 -10 V 383" stroke="#161616" strokeWidth={8} strokeLinecap="round" /><rect x={-95} y={-72} width={190} height={64} rx={10} fill="#608EAA" stroke="#161616" strokeWidth={5} />{((extra.text as string) || '').split('\n').map((ln, i) => (<text key={i} x={0} y={-44 + i * 26} textAnchor="middle" fontFamily={FONT.hand} fontSize={24} fill="#F6EFE3">{ln}</text>))}</g>);
    case 'rope': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><path d="M -60 20 Q -60 -60 0 -60 Q 60 -60 60 20 Q 60 60 0 60 Q -60 60 -60 20" fill="none" stroke="#C9A86A" strokeWidth={10} /><path d="M -36 20 Q -36 -36 0 -36 Q 36 -36 36 20 Q 36 36 0 36 Q -36 36 -36 20" fill="none" stroke="#C9A86A" strokeWidth={10} /><path d="M -12 20 Q -12 -12 0 -12 Q 12 -12 12 20" fill="none" stroke="#C9A86A" strokeWidth={10} /></g>);
    case 'scanner': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><rect x={-100} y={-40} width={200} height={80} rx={8} fill="#8A8EA6" stroke="#161616" strokeWidth={5} /><rect x={-88} y={-28} width={176} height={44} rx={4} fill="#BFE3F0" stroke="#161616" strokeWidth={3} /><rect x={-88} y={-12} width={176} height={8} fill="#E91E63" opacity={0.85} /><circle cx={78} cy={-56} r={8} fill="#9BEFB0" stroke="#161616" strokeWidth={3} /></g>);
    case 'scissors': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><path d="M -70 -40 L 70 40 M -70 40 L 70 -40" stroke="#C9CDD6" strokeWidth={10} strokeLinecap="round" /><circle cx={-78} cy={-46} r={16} fill="none" stroke="#161616" strokeWidth={6} /><circle cx={-78} cy={46} r={16} fill="none" stroke="#161616" strokeWidth={6} /><circle cx={0} cy={0} r={7} fill="#161616" /></g>);
    case 'speech_bubble': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><rect x={-130} y={-70} width={260} height={100} rx={40} fill="#F2EAD8" stroke="#161616" strokeWidth={5} /><path d="M -40 30 L -58 66 L -12 30 Z" fill="#F2EAD8" stroke="#161616" strokeWidth={4} />{((extra.lines as string[]) || []).map((ln, i) => (<text key={i} x={0} y={-28 + i * 36} textAnchor="middle" fontFamily={FONT.hand} fontSize={30} fill="#161616">{ln}</text>))}</g>);
    case 'stamp': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><rect x={-70} y={-50} width={140} height={100} rx={6} fill="#F2EAD8" stroke="#161616" strokeWidth={4} /><rect x={-54} y={-34} width={108} height={68} fill="#608EAA" stroke="#161616" strokeWidth={3} /><circle cx={0} cy={0} r={26} fill="none" stroke="#E91E63" strokeWidth={4} /><text x={0} y={8} textAnchor="middle" fontFamily={FONT.hand} fontSize={22} fill="#E91E63">INKL</text></g>);
    case 'stopwatch': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><circle cx={0} cy={8} r={52} fill="#F2EAD8" stroke="#161616" strokeWidth={5} /><rect x={-8} y={-58} width={16} height={14} rx={4} fill="#161616" /><path d="M 0 8 L 0 -24 M 0 8 L 24 22" stroke="#161616" strokeWidth={5} strokeLinecap="round" /><circle cx={0} cy={8} r={5} fill="#161616" />{[0, 1, 2, 3].map((i) => { const a = (i * 90 * Math.PI) / 180; return (<line key={i} x1={Math.cos(a) * 42} y1={8 + Math.sin(a) * 42} x2={Math.cos(a) * 48} y2={8 + Math.sin(a) * 48} stroke="#161616" strokeWidth={4} strokeLinecap="round" />); })}</g>);
    case 'street_sign': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><path d="M 0 -6 V 367" stroke="#161616" strokeWidth={8} strokeLinecap="round" /><rect x={-85} y={-64} width={170} height={58} rx={10} fill="#3E8C86" stroke="#161616" strokeWidth={5} />{extra.face ? (<g><circle cx={-28} cy={-38} r={6} fill="#161616" /><circle cx={28} cy={-38} r={6} fill="#161616" /><path d="M -20 -18 Q 0 -6 20 -18" stroke="#161616" strokeWidth={4} fill="none" strokeLinecap="round" /></g>) : (<g><path d="M -60 -46 H 60 M -60 -28 H 60" stroke="#F6EFE3" strokeWidth={4} strokeLinecap="round" /></g>)}</g>);
    case 'sun': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><circle cx={0} cy={0} r={40} fill="#FFE2B0" stroke="#161616" strokeWidth={5} />{[0, 1, 2, 3, 4, 5, 6, 7].map((i) => { const a = (i * 45 * Math.PI) / 180; return (<line key={i} x1={Math.cos(a) * 52} y1={Math.sin(a) * 52} x2={Math.cos(a) * 70} y2={Math.sin(a) * 70} stroke="#FFE2B0" strokeWidth={6} strokeLinecap="round" />); })}</g>);
    case 'sun_moon': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}>{((extra.mode as string) || 'both') === 'crossed' ? (<g><circle cx={0} cy={0} r={40} fill="#FFE2B0" stroke="#161616" strokeWidth={5} /><path d="M -34 -34 L 34 34 M 34 -34 L -34 34" stroke="#E91E63" strokeWidth={8} strokeLinecap="round" /></g>) : (<g><circle cx={-42} cy={0} r={30} fill="#FFE2B0" stroke="#161616" strokeWidth={5} /><path d="M 52 -34 Q 18 0 52 34 Q 84 0 52 -34 Z" fill="#F2EAD8" stroke="#161616" strokeWidth={4} /></g>)}</g>);
    case 'tally': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><path d="M -72 -30 V 30 M -40 -30 V 30 M -8 -30 V 30 M 24 -30 V 30 M -84 -26 L 36 26" stroke="#F6EFE3" strokeWidth={6} strokeLinecap="round" /><text x={0} y={66} textAnchor="middle" fontFamily={FONT.hand} fontSize={26} fill="#F6EFE3">{(extra.label as string) || ''}</text></g>);
    case 'test_paper': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><rect x={-70} y={-70} width={140} height={140} rx={4} fill="#F2EAD8" stroke="#161616" strokeWidth={4} /><path d="M -50 -44 H 50 M -50 -22 H 50 M -50 0 H 50 M -50 22 H 20" stroke="#4A4438" strokeWidth={4} strokeLinecap="round" /><path d="M 28 8 L 48 28 M 48 8 L 28 28" stroke="#E91E63" strokeWidth={6} strokeLinecap="round" /><path d="M -50 44 L -40 54 L -24 36" stroke="#2A7A4A" strokeWidth={5} fill="none" strokeLinecap="round" /><circle cx={0} cy={-70} r={7} fill="#C0392B" stroke="#161616" strokeWidth={3} /></g>);
    case 'whisper_walls': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><rect x={-105} y={-60} width={210} height={120} rx={6} fill="#453C4C" stroke="#161616" strokeWidth={5} /><g stroke="#F6EFE3" strokeWidth={5} fill="none" strokeLinecap="round"><path d="M -30 -20 Q -12 0 -30 20 M -8 -30 Q 14 0 -8 30 M 16 -20 Q 34 0 16 20" /></g></g>); {/* v38 (Javion: "whats that object thas popping up behind his head"): the prop had a plain beige circle (r=16) at the panel's top-right — it read as a random ball popping up behind the hero's head. Removed; the dark panel + the three wavy whisper lines already carry the "walls whisper" beat. */}
    case 'zzz': return (<g transform={`translate(${x + dX} ${y}) scale(${s})`}><text x={-60} y={30} fontFamily={FONT.hand} fontSize={52} fill="#F6EFE3">Z</text><text x={-6} y={-2} fontFamily={FONT.hand} fontSize={40} fill="#F6EFE3">z</text><text x={38} y={-30} fontFamily={FONT.hand} fontSize={30} fill="#F6EFE3">z</text></g>);
    default: return (<g transform={`translate(${x} ${y}) scale(${s})`} opacity={0.9}><rect x={-110} y={-70} width={220} height={140} rx={8} fill="#2A2530" stroke="#4A4438" strokeWidth={3} />{[0, 1, 2].map((i) => (<path key={i} d={`M -88 ${-34 + i * 34} L ${88 - (i % 2) * 40} ${-34 + i * 34}`} stroke="#EFE2CC" strokeWidth={3} strokeLinecap="round" opacity={0.8} />))}</g>);
  }
};

// ---------- S1: wide, cell (door) — Day One: The Door Locks (DAY 1) ----------
export const S1: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 900, y: 736, scale: 1, tilt: 6, headTilt: 0, look: 0, armL: { a: 118, b: 22 }, armR: { a: 20, b: 8 }, legL: { a: 12, b: -15 }, legR: { a: -8, b: -3 } } },
    { f: 14, p: { x: 940, y: 732, scale: 1, tilt: 6, headTilt: 0, look: 0, armL: { a: 118, b: 22 }, armR: { a: -20, b: 8 }, legL: { a: -8, b: -3 }, legR: { a: 12, b: -15 } } },
    { f: 28, p: { x: 980, y: 736, scale: 1, tilt: 6, headTilt: 0, look: 0, armL: { a: 118, b: 22 }, armR: { a: 20, b: 8 }, legL: { a: 12, b: -15 }, legR: { a: -8, b: -3 } } },
    { f: 41, p: { x: 1020, y: 732, scale: 1, tilt: 6, headTilt: 0, look: 0, armL: { a: 118, b: 22 }, armR: { a: -20, b: 8 }, legL: { a: -8, b: -3 }, legR: { a: 12, b: -15 } } },
    { f: 60, p: { x: 1020, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 10, armL: { a: 118, b: 22 }, armR: { a: 90, b: 60 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 83, p: { x: 1020, y: 736, scale: 1, tilt: 0, headTilt: 6, look: 10, armL: { a: 118, b: 22 }, armR: { a: 120, b: 25 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'puzzled']]);
  const hero0 = <Hero look={LOOKS.detective} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const mg = toWorld(p0, joints(p0).armR.end);
  const camX = kf(t, [[0, 960], [len, 960]]);
  const camY = kf(t, [[0, 560], [len, 560]]);
  const zoom = kf(t, [[0, 1.0], [len, 1.06]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 40} id="s1" veil={0.28} door day={1} />
        <Prop kind="question_mark" x={960} y={300} s={1} t={t} extra={{}} />
        {hero0}
        <Magnifier x={mg.x} y={mg.y} s={1} />
      </g>
      <DayChip t={t} day="DAY 1" />
      <text x={960} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#F6EFE3">TRAPPED 30 DAYS?</text>
    </g>
  );
};

// ---------- S2: macro insert, cell (wall) — Day One: The Door Locks (DAY 1) ----------
export const S2: React.FC<ShotProps> = ({ t, len }) => {
  const camX = kf(t, [[0, 960], [len, 960]]);
  const camY = kf(t, [[0, 357.5], [len, 357.5]]);
  const zoom = kf(t, [[0, 1.7550274223034734], [len, 1.8550274223034735]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 77} id="s2" veil={0.44} day={1} />
        <Prop kind="brain" x={960} y={510} s={1.1} t={t} extra={{"variant": "beating", "bpm": 120, "drift_x": 35}} />
        <Prop kind="question_mark" x={960} y={190.4} s={0.6} t={t} extra={{"drift_x": 30}} />
      </g>
      <DayChip t={t} day="DAY 1" />
      <text x={960} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#F6EFE3">WHAT DOES IT DO?</text>
    </g>
  );
};

// ---------- S3: two-shot, antarctic — Day One: The Door Locks (DAY 1) ----------
export const S3: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 330, y: 808, scale: 0.4, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 21, p: { x: 336, y: 808, scale: 0.4, tilt: 0, headTilt: 5, look: 10, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 42, p: { x: 324, y: 804, scale: 0.4, tilt: 0, headTilt: 6, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 59, p: { x: 336, y: 808, scale: 0.4, tilt: 0, headTilt: 5, look: 8, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 74, p: { x: 324, y: 804, scale: 0.4, tilt: 0, headTilt: 6, look: -6, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 85, p: { x: 336, y: 808, scale: 0.4, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'worried']]);
  const hero0 = <Hero look={LOOKS.researcher} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const p1 = poseAt(t, [
    { f: 0, p: { x: 487.5, y: 808, scale: 0.392, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 21, p: { x: 493.5, y: 808, scale: 0.392, tilt: 0, headTilt: 10, look: 10, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 42, p: { x: 481.5, y: 804, scale: 0.392, tilt: 0, headTilt: 11, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 63, p: { x: 493.5, y: 808, scale: 0.392, tilt: 0, headTilt: 10, look: 10, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 85, p: { x: 481.5, y: 804, scale: 0.392, tilt: 0, headTilt: 11, look: -8, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f1 = faceAt(t, [[0, 'worried']]);
  const hero1 = <Hero look={{...LOOKS.researcher, hair: 'crop', hairC: '#2A1E14', jacket: '#3E8C86', jacketShade: '#2F6E69', accent: '#2F6E69'}} pose={{ ...p1, ...f1, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const p2 = poseAt(t, [
    { f: 0, p: { x: 645, y: 808, scale: 0.408, tilt: 0, headTilt: -5, look: 0, armL: { a: 30, b: 15 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 21, p: { x: 651, y: 808, scale: 0.408, tilt: 0, headTilt: 0, look: 10, armL: { a: 30, b: 15 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 42, p: { x: 639, y: 804, scale: 0.408, tilt: 0, headTilt: 1, look: 0, armL: { a: 30, b: 15 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 59, p: { x: 651, y: 808, scale: 0.408, tilt: 0, headTilt: 0, look: 8, armL: { a: 30, b: 15 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 74, p: { x: 639, y: 804, scale: 0.408, tilt: 0, headTilt: 1, look: -6, armL: { a: 30, b: 15 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 85, p: { x: 651, y: 808, scale: 0.408, tilt: 0, headTilt: 0, look: 0, armL: { a: 30, b: 15 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f2 = faceAt(t, [[0, 'worried']]);
  const hero2 = <Hero look={{...LOOKS.researcher, hair: 'sidepart', hairC: '#5A3A28', jacket: '#D9A441', jacketShade: '#AD8334', accent: '#AD8334'}} pose={{ ...p2, ...f2, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const p3 = poseAt(t, [
    { f: 0, p: { x: 802.5, y: 808, scale: 0.396, tilt: 0, headTilt: 8, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 21, p: { x: 808.5, y: 808, scale: 0.396, tilt: 0, headTilt: 12, look: 10, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 42, p: { x: 796.5, y: 804, scale: 0.396, tilt: 0, headTilt: 12, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 63, p: { x: 808.5, y: 808, scale: 0.396, tilt: 0, headTilt: 12, look: 10, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 85, p: { x: 796.5, y: 804, scale: 0.396, tilt: 0, headTilt: 12, look: -8, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f3 = faceAt(t, [[0, 'worried']]);
  const hero3 = <Hero look={{...LOOKS.researcher, hair: 'afro', hairC: '#241A12', jacket: '#9B7BB8', jacketShade: '#7C6394', accent: '#7C6394'}} pose={{ ...p3, ...f3, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const p4 = poseAt(t, [
    { f: 0, p: { x: 960, y: 808, scale: 0.404, tilt: 0, headTilt: -8, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 21, p: { x: 966, y: 808, scale: 0.404, tilt: 0, headTilt: -3, look: 10, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 42, p: { x: 954, y: 804, scale: 0.404, tilt: 0, headTilt: -2, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 59, p: { x: 966, y: 808, scale: 0.404, tilt: 0, headTilt: -3, look: 8, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 74, p: { x: 954, y: 804, scale: 0.404, tilt: 0, headTilt: -2, look: -6, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 85, p: { x: 966, y: 808, scale: 0.404, tilt: 0, headTilt: -3, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f4 = faceAt(t, [[0, 'worried']]);
  const hero4 = <Hero look={{...LOOKS.researcher, hair: 'ponytail', hairC: '#6A4A2E', jacket: '#4A7AA0', jacketShade: '#3A5E80', accent: '#3A5E80'}} pose={{ ...p4, ...f4, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const p5 = poseAt(t, [
    { f: 0, p: { x: 1117.5, y: 808, scale: 0.392, tilt: 0, headTilt: 3, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 21, p: { x: 1123.5, y: 808, scale: 0.392, tilt: 0, headTilt: 8, look: 10, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 42, p: { x: 1111.5, y: 804, scale: 0.392, tilt: 0, headTilt: 9, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 63, p: { x: 1123.5, y: 808, scale: 0.392, tilt: 0, headTilt: 8, look: 10, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 85, p: { x: 1111.5, y: 804, scale: 0.392, tilt: 0, headTilt: 9, look: -8, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f5 = faceAt(t, [[0, 'worried']]);
  const hero5 = <Hero look={{...LOOKS.researcher, hair: 'curly', hairC: '#3A2420', jacket: '#6A9A5A', jacketShade: '#527A46', accent: '#527A46'}} pose={{ ...p5, ...f5, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const p6 = poseAt(t, [
    { f: 0, p: { x: 1275, y: 808, scale: 0.408, tilt: 0, headTilt: -3, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 21, p: { x: 1281, y: 808, scale: 0.408, tilt: 0, headTilt: 2, look: 10, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 42, p: { x: 1269, y: 804, scale: 0.408, tilt: 0, headTilt: 3, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 59, p: { x: 1281, y: 808, scale: 0.408, tilt: 0, headTilt: 2, look: 8, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 74, p: { x: 1269, y: 804, scale: 0.408, tilt: 0, headTilt: 3, look: -6, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 85, p: { x: 1281, y: 808, scale: 0.408, tilt: 0, headTilt: 2, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f6 = faceAt(t, [[0, 'worried']]);
  const hero6 = <Hero look={{...LOOKS.researcher, hair: 'bun', hairC: '#8A5A3A', jacket: '#D98A3A', jacketShade: '#AD6E2E', accent: '#AD6E2E'}} pose={{ ...p6, ...f6, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const p7 = poseAt(t, [
    { f: 0, p: { x: 1432.5, y: 808, scale: 0.396, tilt: 0, headTilt: 6, look: 0, armL: { a: 20, b: 10 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 21, p: { x: 1438.5, y: 808, scale: 0.396, tilt: 0, headTilt: 11, look: 10, armL: { a: 20, b: 10 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 42, p: { x: 1426.5, y: 804, scale: 0.396, tilt: 0, headTilt: 12, look: 0, armL: { a: 20, b: 10 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 63, p: { x: 1438.5, y: 808, scale: 0.396, tilt: 0, headTilt: 11, look: 10, armL: { a: 20, b: 10 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 85, p: { x: 1426.5, y: 804, scale: 0.396, tilt: 0, headTilt: 12, look: -8, armL: { a: 20, b: 10 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f7 = faceAt(t, [[0, 'worried']]);
  const hero7 = <Hero look={{...LOOKS.researcher, hair: 'crop', hairC: '#3A2A1A', jacket: '#3A4A6A', jacketShade: '#2E3A54', accent: '#2E3A54'}} pose={{ ...p7, ...f7, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const p8 = poseAt(t, [
    { f: 0, p: { x: 1590, y: 808, scale: 0.404, tilt: 0, headTilt: -6, look: 0, armL: { a: 4, b: 8 }, armR: { a: 30, b: 10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 21, p: { x: 1596, y: 808, scale: 0.404, tilt: 0, headTilt: -1, look: 10, armL: { a: 4, b: 8 }, armR: { a: 30, b: 10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 42, p: { x: 1584, y: 804, scale: 0.404, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 30, b: 10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 59, p: { x: 1596, y: 808, scale: 0.404, tilt: 0, headTilt: -1, look: 8, armL: { a: 4, b: 8 }, armR: { a: 30, b: 10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 74, p: { x: 1584, y: 804, scale: 0.404, tilt: 0, headTilt: 0, look: -6, armL: { a: 4, b: 8 }, armR: { a: 30, b: 10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 85, p: { x: 1596, y: 808, scale: 0.404, tilt: 0, headTilt: -1, look: 0, armL: { a: 4, b: 8 }, armR: { a: 30, b: 10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f8 = faceAt(t, [[0, 'worried']]);
  const hero8 = <Hero look={{...LOOKS.researcher, hair: 'ponytail', hairC: '#2A1E14', jacket: '#8A8A4A', jacketShade: '#6E6E3A', accent: '#6E6E3A'}} pose={{ ...p8, ...f8, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 954], [len, 954]]);
  const camY = kf(t, [[0, 580], [len, 580]]);
  const zoom = kf(t, [[0, 1.35], [len, 1.4]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Antarctic t={t + 114} id="s3" />
        {hero0}
        {hero1}
        {hero2}
        {hero3}
        {hero4}
        {hero5}
        {hero6}
        {hero7}
        {hero8}
      </g>
      <DayChip t={t} day="DAY 1" />
      <text x={960} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#F6EFE3">14 MONTHS CUT OFF</text>
    </g>
  );
};

// ---------- S4: macro insert, cell (wall) — Day One: The Door Locks (DAY 1) ----------
export const S4: React.FC<ShotProps> = ({ t, len }) => {
  const camX = kf(t, [[0, 961.5], [len, 961.5]]);
  const camY = kf(t, [[0, 480], [len, 480]]);
  const zoom = kf(t, [[0, 2.269861286254729], [len, 2.369861286254729]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 151} id="s4" veil={0.44} day={1} />
        <Prop kind="brain" x={737.4} y={480} s={0.9} t={t} extra={{"variant": "beating", "bpm": 120, "drift_x": 30}} />
        <Prop kind="brain" x={1242.6} y={480} s={0.7} t={t} extra={{"variant": "shrinking"}} />
      </g>
      <DayChip t={t} day="DAY 1" />
      <text x={960} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#A9C6FF">7% SMALLER</text>
    </g>
  );
};

// ---------- S5: wide, cell (window) — Day One: The Door Locks (DAY 1) ----------
export const S5: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 960, y: 736, scale: 1, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 35, p: { x: 966, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 10, armL: { a: 4, b: 8 }, armR: { a: 90, b: 60 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 69, p: { x: 954, y: 732, scale: 1, tilt: 0, headTilt: 6, look: -10, armL: { a: 4, b: 8 }, armR: { a: 120, b: 25 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 104, p: { x: 966, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral'], [69, 'worried']]);
  const hero0 = <Hero look={LOOKS.hero} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 960], [len, 960]]);
  const camY = kf(t, [[0, 560], [len, 560]]);
  const zoom = kf(t, [[0, 1.0], [len, 1.06]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 188} id="s5" veil={0.28} window day={1} />
        <Prop kind="calendar" x={1170} y={520} s={0.38} t={t} extra={{"label": "DAY 1"}} />
        {hero0}
      </g>
      <DayChip t={t} day={t < 52 ? 'DAY 1' : 'DAY 3'} />
      <text x={960} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#F6EFE3">{t < 52 ? "DAY 1, YOU'RE FINE" : 'DAY 3, YOU LOSE TIME'}</text>
    </g>
  );
};

// ---------- S6: two-shot, cell — Day One: The Door Locks (DAY 7) ----------
export const S6: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 960, y: 736, scale: 1, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 15, p: { x: 966, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 12, armL: { a: 4, b: 8 }, armR: { a: 90, b: 60 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 32, p: { x: 954, y: 732, scale: 1, tilt: 0, headTilt: 8, look: -15, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 44, p: { x: 966, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 15, armL: { a: 4, b: 8 }, armR: { a: -4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 55, p: { x: 954, y: 732, scale: 1, tilt: 0, headTilt: 8, look: -12, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 64, p: { x: 966, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 10, armL: { a: 4, b: 8 }, armR: { a: -4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'worried']]);
  const hero0 = <Hero look={LOOKS.hero} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 954], [len, 954]]);
  const camY = kf(t, [[0, 580], [len, 580]]);
  const zoom = kf(t, [[0, 1.35], [len, 1.4]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 225} id="s6" veil={0.44} day={7} />
        <Prop kind="sound_waves" x={1420} y={420} s={1} t={t} extra={{}} />
        {hero0}
      </g>
      <DayChip t={t} day="DAY 7" />
    </g>
  );
};

// ---------- S7: medium, cell — Day One: The Door Locks (DAY 14) ----------
export const S7: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 960, y: 736, scale: 1, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 21, p: { x: 966, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 8, armL: { a: 4, b: 8 }, armR: { a: 90, b: 60 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 39, p: { x: 954, y: 732, scale: 1, tilt: 0, headTilt: 6, look: -6, armL: { a: 4, b: 8 }, armR: { a: 120, b: 25 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 52, p: { x: 966, y: 736, scale: 1, tilt: 0, headTilt: 7, look: 0, armL: { a: 4, b: 8 }, armR: { a: 140, b: 20 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 76, p: { x: 954, y: 732, scale: 1, tilt: 0, headTilt: -8, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 104, p: { x: 966, y: 736, scale: 1, tilt: 0, headTilt: 7, look: 0, armL: { a: 4, b: 8 }, armR: { a: 140, b: 20 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'scared']]);
  const hero0 = <Hero look={LOOKS.hero} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const p1 = poseAt(t, [
    { f: 0, p: { x: 1140, y: 736, scale: 1, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 21, p: { x: 1146, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 8, armL: { a: 4, b: 8 }, armR: { a: 90, b: 60 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 39, p: { x: 1134, y: 732, scale: 1, tilt: 0, headTilt: 6, look: -6, armL: { a: 4, b: 8 }, armR: { a: 120, b: 25 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 52, p: { x: 1146, y: 736, scale: 1, tilt: 0, headTilt: 7, look: 0, armL: { a: 4, b: 8 }, armR: { a: 140, b: 20 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 78, p: { x: 1134, y: 732, scale: 1, tilt: 0, headTilt: -8, look: 10, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 104, p: { x: 1146, y: 736, scale: 1, tilt: 0, headTilt: 7, look: -8, armL: { a: 4, b: 8 }, armR: { a: 140, b: 20 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f1 = faceAt(t, [[0, 'scared']]);
  const hero1 = <Hero look={LOOKS.hero} pose={{ ...p1, ...f1, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const hero1G = <g opacity={0.35}>{hero1}</g>;
  const camX = kf(t, [[0, 966], [len, 966]]);
  const camY = kf(t, [[0, 676], [len, 676]]);
  const zoom = kf(t, [[0, 1.8], [len, 1.9]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 262} id="s7" veil={0.44} day={14} />
        {hero0}
        {hero1G}
      </g>
      <DayChip t={t} day="DAY 14" />
    </g>
  );
};

// ---------- S8: macro insert, cell (wall) — Day One: The Door Locks (DAY 30) ----------
export const S8: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 620, y: 736, scale: 1, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 23, p: { x: 626, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 90, b: 60 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 51, p: { x: 614, y: 732, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 76, p: { x: 626, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: -4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 102, p: { x: 614, y: 732, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'scared']]);
  const hero0 = <Hero look={LOOKS.hero} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 967], [len, 967]]);
  const camY = kf(t, [[0, 518], [len, 518]]);
  const zoom = kf(t, [[0, 1.8633540372670807], [len, 1.9633540372670808]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 299} id="s8" veil={0.44} day={30} />
        <Prop kind="brain" x={1290} y={480} s={1} t={t} extra={{"variant": "crack"}} />
        {hero0}
      </g>
      <DayChip t={t} day="DAY 30" />
    </g>
  );
};

// ---------- S9: high angle, cell (bed) — Day One: The Door Locks (DAY 1) ----------
export const S9: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 470, y: 750, scale: 0.9, tilt: 0, headTilt: 10, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 19, p: { x: 470, y: 750, scale: 0.9, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 90, b: 60 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 42, p: { x: 470, y: 750, scale: 0.9, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 63, p: { x: 470, y: 750, scale: 0.9, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: -4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 84, p: { x: 470, y: 750, scale: 0.9, tilt: 0, headTilt: 5, look: -8, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'puzzled']]);
  const hero0 = <Hero look={LOOKS.hero} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 960], [len, 960]]);
  const camY = kf(t, [[0, 560], [len, 560]]);
  const zoom = kf(t, [[0, 1.25], [len, 1.3]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 336} id="s9" veil={0.44} bed day={1} />
        {hero0}
      </g>
      <DayChip t={t} day="DAY 1" />
    </g>
  );
};

// ---------- S10: medium, cell (door) — Day One: The Door Locks (DAY 1) ----------
export const S10: React.FC<ShotProps> = ({ t, len }) => {
  const camX = kf(t, [[0, 960], [len, 960]]);
  const camY = kf(t, [[0, 560], [len, 560]]);
  const zoom = kf(t, [[0, 1.8], [len, 1.9]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 373} id="s10" veil={0.44} door day={1} />
        {/* v39 (Nov 14, Javion: "a floating light bulb for no reason"): lightbulb prop REMOVED — it floated mid-room with a swing, detached from anything. The Cell's own hanging ceiling lamp is the "ONE LIGHT." */}
      </g>
      <DayChip t={t} day="DAY 1" />
      <text x={960} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#F6EFE3">ONE DOOR. ONE LIGHT.</text>
    </g>
  );
};

// ---------- S11: close-up, cell (door) — Day One: The Door Locks (DAY 1) ----------
export const S11: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 620, y: 736, scale: 1, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 26, p: { x: 620, y: 736, scale: 1, tilt: 8, headTilt: 4, look: 0, armL: { a: 4, b: 8 }, armR: { a: 80, b: 10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 58, p: { x: 620, y: 736, scale: 1, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 85, p: { x: 620, y: 736, scale: 1, tilt: 0, headTilt: 6, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 117, p: { x: 620, y: 736, scale: 1, tilt: 0, headTilt: 6, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral']]);
  const hero0 = <Hero look={LOOKS.hero} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 620], [len, 620]]);
  const camY = kf(t, [[0, 560], [len, 560]]);
  const zoom = kf(t, [[0, 3.2], [len, 3.35]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 410} id="s11" veil={0.44} door day={1} />
        {/* v38 (Javion: "random floating ufo thing"): food_tray REMOVED — it floated ~300 units above the floor at chest height in a zoom-3.2 close-up and its dome + plate + red/green balls read as a UFO. The Cell already draws its own tray on the floor by the door; a floor tray is out of frame at this zoom. */}
        {hero0}
      </g>
      <DayChip t={t} day="DAY 1" />
      <text x={350} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#F6EFE3">TWICE A DAY</text>
    </g>
  );
};

// ---------- S12: low angle, cell — Day One: The Door Locks (DAY 1) ----------
export const S12: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 1410, y: 736, scale: 1, tilt: 6, headTilt: 0, look: 0, armL: { a: 20, b: 8 }, armR: { a: 20, b: 8 }, legL: { a: 12, b: -15 }, legR: { a: -8, b: -3 } } },
    { f: 16, p: { x: 1370, y: 732, scale: 1, tilt: -6, headTilt: 0, look: 0, armL: { a: -20, b: 8 }, armR: { a: -20, b: 8 }, legL: { a: -8, b: -3 }, legR: { a: 12, b: -15 } } },
    { f: 33, p: { x: 1330, y: 736, scale: 1, tilt: -6, headTilt: 0, look: 0, armL: { a: 20, b: 8 }, armR: { a: 20, b: 8 }, legL: { a: 12, b: -15 }, legR: { a: -8, b: -3 } } },
    { f: 50, p: { x: 1290, y: 732, scale: 1, tilt: -6, headTilt: 0, look: 0, armL: { a: -20, b: 8 }, armR: { a: -20, b: 8 }, legL: { a: -8, b: -3 }, legR: { a: 12, b: -15 } } },
    { f: 74, p: { x: 1290, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 10, armL: { a: 4, b: 8 }, armR: { a: 90, b: 60 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 99, p: { x: 1290, y: 736, scale: 1, tilt: 0, headTilt: 5, look: -8, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral']]);
  const hero0 = <Hero look={LOOKS.hero} pose={{ ...p0, ...f0, facing: -1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 1330], [len, 1330]]);
  const camY = kf(t, [[0, 676], [len, 676]]);
  const zoom = kf(t, [[0, 1.6], [len, 1.68]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 447} id="s12" veil={0.44} day={1} />
        <Prop kind="note" x={928.6} y={640} s={1.1} t={t} extra={{"lines": ["30 DAYS.", "GOOD LUCK."]}} />
        {hero0}
      </g>
      <DayChip t={t} day="DAY 1" />
    </g>
  );
};

// ---------- S13: medium, cell — Day One: The Door Locks (DAY 1) ----------
export const S13: React.FC<ShotProps> = ({ t, len }) => {
  // Nov 14 (Javion: "fix everything wrong" — narration says he "scratches his head" but his arms hung at his sides): right arm raises to the head at f=26 and HOLDS (0 reversals — a deliberate gesture, passes the idle-flap guard). armR {a:114, b:102} puts the mitten at the head's right edge at temple height (~(65,-180) local, just outside the head circle r=62: elbow out, forearm folded up to the temple). v1 of this fix used {a:140, b:95} — the hand landed INSIDE the head circle (~(34,-189)) and was hidden behind the head. The "?" prop was already there.
  const p0 = poseAt(t, [
    { f: 0, p: { x: 900, y: 725, scale: 1, tilt: 10, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 26, p: { x: 900, y: 725, scale: 1, tilt: 10, headTilt: 6, look: 0, armL: { a: 4, b: 8 }, armR: { a: 114, b: 102 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 51, p: { x: 900, y: 736, scale: 1, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 114, b: 102 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 74, p: { x: 900, y: 736, scale: 1, tilt: 0, headTilt: -8, look: 0, armL: { a: 4, b: 8 }, armR: { a: 114, b: 102 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 103, p: { x: 900, y: 736, scale: 1, tilt: 0, headTilt: -8, look: 0, armL: { a: 4, b: 8 }, armR: { a: 114, b: 102 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'puzzled']]);
  const hero0 = <Hero look={LOOKS.detective} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 700], [len, 700]]);
  const camY = kf(t, [[0, 676], [len, 676]]);
  const zoom = kf(t, [[0, 1.8], [len, 1.9]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 484} id="s13" veil={0.44} day={1} />
        <Prop kind="question_mark" x={1114.3} y={587.8} s={1} t={t} extra={{}} />
        {hero0}
      </g>
      <DayChip t={t} day="DAY 1" />
    </g>
  );
};

// ---------- S14: wide, cell (door) — Day One: The Door Locks (DAY 1) ----------
export const S14: React.FC<ShotProps> = ({ t, len }) => {
  // Nov 14 (same head-scratch fix as S13 — the line continues here, "under a giant question mark"): the scratch HOLDS from S13 through f=44, then the arm lowers over f=44-67 as the line ends (0 reversals — deliberate gesture). Also kills the baked-in flap (was armR 4→60→-4→60, 3 reversals) and the eye dart (was look 0→10→-10→0, 2 reversals) — look is 0 throughout now.
  const p0 = poseAt(t, [
    { f: 0, p: { x: 900, y: 736, scale: 1, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 114, b: 102 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 22, p: { x: 900, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 114, b: 102 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 44, p: { x: 900, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 114, b: 102 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 67, p: { x: 900, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'puzzled']]);
  const hero0 = <Hero look={LOOKS.detective} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 960], [len, 960]]);
  const camY = kf(t, [[0, 560], [len, 560]]);
  const zoom = kf(t, [[0, 1.0], [len, 1.06]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 521} id="s14" veil={0.28} door day={1} />
        <Prop kind="question_mark" x={1250} y={300} s={0.9} t={t} extra={{}} />
        {hero0}
      </g>
      <DayChip t={t} day="DAY 1" />
    </g>
  );
};

// ---------- S15: over-the-shoulder, cell — Day One: The Door Locks (DAY 1) ----------
export const S15: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 960, y: 736, scale: 1, tilt: 12, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 28, p: { x: 966, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 8, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 56, p: { x: 954, y: 732, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: -4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 79, p: { x: 966, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 8, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 98, p: { x: 954, y: 732, scale: 1, tilt: 0, headTilt: 5, look: -6, armL: { a: 4, b: 8 }, armR: { a: -4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 112, p: { x: 966, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'puzzled']]);
  const hero0 = <Hero look={LOOKS.detective} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 954], [len, 954]]);
  const camY = kf(t, [[0, 672], [len, 672]]);
  const zoom = kf(t, [[0, 1.8], [len, 1.9]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 558} id="s15" veil={0.44} day={1} />
        {hero0}
        <Prop kind="sign" x={660.5} y={540} s={1} t={t} extra={{"text": "THE ROOM IS\nTHE EASY PART"}} />
      </g>
      <DayChip t={t} day="DAY 1" />
    </g>
  );
};

// ---------- S16: medium, stage — Day One: The Door Locks (DAY 1) ----------
export const S16: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 620, y: 736, scale: 1, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 28, p: { x: 626, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 10, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 55, p: { x: 614, y: 732, scale: 1, tilt: 0, headTilt: 5, look: -10, armL: { a: 4, b: 8 }, armR: { a: -4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 83, p: { x: 626, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'determined']]);
  const hero0 = <Hero look={LOOKS.hero} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 626], [len, 626]]);
  const camY = kf(t, [[0, 676], [len, 676]]);
  const zoom = kf(t, [[0, 1.8], [len, 1.9]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Stage t={t + 595} id="s16" />
        <Prop kind="brain" x={980.3} y={506.8} s={0.9} t={t} extra={{}} />
        {hero0}
      </g>
      <DayChip t={t} day="DAY 1" />
      <text x={480} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#F6EFE3">FICTION</text>
      <text x={1440} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#A9C6FF">REAL SCIENCE</text>
    </g>
  );
};

// ---------- S17: wide, lab — Day One: The Door Locks (DAY 1) ----------
export const S17: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 620, y: 756, scale: 1, tilt: 0, headTilt: 8, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 29, p: { x: 626, y: 756, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 57, p: { x: 614, y: 752, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: -4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 83, p: { x: 626, y: 756, scale: 1, tilt: 0, headTilt: 5, look: 10, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 114, p: { x: 614, y: 752, scale: 1, tilt: 0, headTilt: 5, look: 10, armL: { a: 4, b: 8 }, armR: { a: -4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'determined']]);
  const hero0 = <Hero look={LOOKS.scientist} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const p1 = poseAt(t, [
    { f: 0, p: { x: 1300, y: 736, scale: 1, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 29, p: { x: 1306, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 10, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 57, p: { x: 1294, y: 732, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: -4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 83, p: { x: 1306, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 12, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 114, p: { x: 1294, y: 732, scale: 1, tilt: 0, headTilt: 5, look: 12, armL: { a: 4, b: 8 }, armR: { a: -4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f1 = faceAt(t, [[0, 'determined']]);
  const hero1 = <Hero look={LOOKS.hero} pose={{ ...p1, ...f1, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 960], [len, 960]]);
  const camY = kf(t, [[0, 560], [len, 560]]);
  const zoom = kf(t, [[0, 1.0], [len, 1.06]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Lab t={t + 632} id="s17" />
        <Prop kind="checklist" x={960} y={420} s={0.8} t={t} extra={{}} />
        {hero0}
        {hero1}
      </g>
      <DayChip t={t} day="DAY 1" />
      <text x={960} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#F6EFE3">MEASURED IN REAL PEOPLE</text>
    </g>
  );
};

// ---------- S18: macro insert, cell (wall) — Problem One: The Clock Breaks (DAY 3) ----------
export const S18: React.FC<ShotProps> = ({ t, len }) => {
  const camX = kf(t, [[0, 960], [len, 960]]);
  const camY = kf(t, [[0, 520], [len, 520]]);
  const zoom = kf(t, [[0, 2.4], [len, 2.5]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 669} id="s18" veil={0.44} day={3} />
        <Prop kind="wall_clock" x={960} y={520} s={1.2} t={t} extra={{"breaking": true, "drift_x": 35}} />
        <TitleCard t={t} lines={['PROBLEM ONE', 'THE CLOCK BREAKS']} y={400} size={40} /> {/* Nov 14 (Javion: "fix everything wrong" — the chapter titles were NEVER visible in v41: TitleCard's default y=175 sits above the frame in these zoomed macro shots (camY 520, zoom 2.4-3.3). y=400 puts it in the visible band; size=40 so the words fit the 600-unit visible width at zoom 3.2. Same fix on S37/S57/S79/S95. */}
      </g>
      <DayChip t={t} day="DAY 3" />
    </g>
  );
};

// ---------- S19: close-up, cell — Problem One: The Clock Breaks (DAY 3) ----------
export const S19: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 620, y: 736, scale: 1, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 32, p: { x: 626, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 10, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 64, p: { x: 614, y: 732, scale: 1, tilt: 0, headTilt: 5, look: -10, armL: { a: 4, b: 8 }, armR: { a: -4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 96, p: { x: 626, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 12, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'puzzled']]);
  const hero0 = <Hero look={LOOKS.hero} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 626], [len, 626]]);
  const camY = kf(t, [[0, 560], [len, 560]]);
  const zoom = kf(t, [[0, 3.2], [len, 3.35]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 706} id="s19" veil={0.44} day={3} />
        {/* Nov 14 full-audit: sun_moon REMOVED — same floating-circle error as S20 (Javion flagged 1:02). */}
        {hero0}
      </g>
      <DayChip t={t} day="DAY 3" />
    </g>
  );
};

// ---------- S20: medium, cell (window) — Problem One: The Clock Breaks (DAY 3) ----------
export const S20: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 900, y: 736, scale: 1, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 39, p: { x: 906, y: 736, scale: 1, tilt: 0, headTilt: 6, look: 10, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 78, p: { x: 894, y: 732, scale: 1, tilt: 0, headTilt: 5, look: -10, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 117, p: { x: 906, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: -4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'worried']]);
  const hero0 = <Hero look={LOOKS.hero} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 626], [len, 626]]);
  const camY = kf(t, [[0, 676], [len, 676]]);
  const zoom = kf(t, [[0, 1.8], [len, 1.9]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 743} id="s20" veil={0.44} window day={3} />
        {/* v39 (Nov 14, Javion: "a random circle and something else floating in the sky"): sun_moon prop REMOVED — it sat outside the window, floating in the upper-right as a stray circle + leaf shape. The window itself already shows the sun/sky. */}
        {hero0}
      </g>
      <DayChip t={t} day="DAY 3" />
    </g>
  );
};

// ---------- S21: wide, cell (window) — Problem One: The Clock Breaks (DAY 3) ----------
export const S21: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 900, y: 736, scale: 1, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 27, p: { x: 906, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 60, p: { x: 894, y: 732, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: -4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 86, p: { x: 906, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 12, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 119, p: { x: 894, y: 732, scale: 1, tilt: 0, headTilt: 5, look: 12, armL: { a: 4, b: 8 }, armR: { a: -4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral']]);
  const hero0 = <Hero look={LOOKS.hero} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 960], [len, 960]]);
  const camY = kf(t, [[0, 560], [len, 560]]);
  const zoom = kf(t, [[0, 1.0], [len, 1.06]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 780} id="s21" veil={0.28} window day={3} />
        <Prop kind="wall_clock" x={1280} y={460} s={1} t={t} extra={{"melting": true}} />
        {hero0}
      </g>
      <DayChip t={t} day="DAY 3" />
      <text x={960} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#F6EFE3">CAVE TIME</text>
    </g>
  );
};

// ---------- S22: two-shot, cave — Problem One: The Clock Breaks (DAY 3) ----------
export const S22: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 640, y: 736, scale: 1, tilt: 6, headTilt: 0, look: 0, armL: { a: 20, b: 8 }, armR: { a: 20, b: 8 }, legL: { a: 12, b: -15 }, legR: { a: -8, b: -3 } } },
    { f: 14, p: { x: 670, y: 732, scale: 1, tilt: 6, headTilt: 0, look: 0, armL: { a: -20, b: 8 }, armR: { a: -20, b: 8 }, legL: { a: -8, b: -3 }, legR: { a: 12, b: -15 } } },
    { f: 28, p: { x: 700, y: 736, scale: 1, tilt: 6, headTilt: 0, look: 0, armL: { a: 20, b: 8 }, armR: { a: 20, b: 8 }, legL: { a: 12, b: -15 }, legR: { a: -8, b: -3 } } },
    { f: 42, p: { x: 730, y: 732, scale: 1, tilt: 6, headTilt: 0, look: 0, armL: { a: -20, b: 8 }, armR: { a: -20, b: 8 }, legL: { a: -8, b: -3 }, legR: { a: 12, b: -15 } } },
    { f: 57, p: { x: 760, y: 736, scale: 1, tilt: 6, headTilt: 0, look: 0, armL: { a: 20, b: 8 }, armR: { a: 20, b: 8 }, legL: { a: 12, b: -15 }, legR: { a: -8, b: -3 } } },
    { f: 82, p: { x: 760, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 15, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 113, p: { x: 760, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 15, armL: { a: 4, b: 8 }, armR: { a: -4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral']]);
  const hero0 = <Hero look={LOOKS.hero} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 730], [len, 730]]);
  const camY = kf(t, [[0, 580], [len, 580]]);
  const zoom = kf(t, [[0, 1.35], [len, 1.4]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cave t={t + 817} id="s22" />
        <Prop kind="rope" x={1259.7} y={839.7} s={1} t={t} extra={{}} />
        {hero0}
      </g>
      <DayChip t={t} day="DAY 3" />
      <text x={960} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#F6EFE3">1962 · MICHEL SIFFRE</text>
    </g>
  );
};

// ---------- S23: medium, cave — Problem One: The Clock Breaks (DAY 3) ----------
export const S23: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 900, y: 736, scale: 1, tilt: 6, headTilt: 0, look: 0, armL: { a: 20, b: 8 }, armR: { a: 20, b: 8 }, legL: { a: 12, b: -15 }, legR: { a: -8, b: -3 } } },
    { f: 14, p: { x: 930, y: 732, scale: 1, tilt: 6, headTilt: 0, look: 0, armL: { a: -20, b: 8 }, armR: { a: -20, b: 8 }, legL: { a: -8, b: -3 }, legR: { a: 12, b: -15 } } },
    { f: 28, p: { x: 960, y: 736, scale: 1, tilt: 6, headTilt: 0, look: 0, armL: { a: 20, b: 8 }, armR: { a: 20, b: 8 }, legL: { a: 12, b: -15 }, legR: { a: -8, b: -3 } } },
    { f: 43, p: { x: 990, y: 732, scale: 1, tilt: 6, headTilt: 0, look: 0, armL: { a: -20, b: 8 }, armR: { a: -20, b: 8 }, legL: { a: -8, b: -3 }, legR: { a: 12, b: -15 } } },
    { f: 57, p: { x: 1020, y: 736, scale: 1, tilt: 6, headTilt: 0, look: 0, armL: { a: 20, b: 8 }, armR: { a: 20, b: 8 }, legL: { a: 12, b: -15 }, legR: { a: -8, b: -3 } } },
    { f: 82, p: { x: 1020, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 15, armL: { a: 4, b: 8 }, armR: { a: 90, b: 60 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 114, p: { x: 1020, y: 736, scale: 1, tilt: 0, headTilt: 6, look: 15, armL: { a: 4, b: 8 }, armR: { a: 120, b: 25 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral']]);
  const hero0 = <Hero look={LOOKS.hero} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 1020], [len, 1020]]);
  const camY = kf(t, [[0, 676], [len, 676]]);
  const zoom = kf(t, [[0, 1.8], [len, 1.9]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cave t={t + 854} id="s23" />
        <Prop kind="calendar" x={1330} y={757} s={0.42} t={t} extra={{"label": "DAY 1"}} /> {/* v38 (Javion: "cave calendars on a string"): calendar now sits on the cave floor (bottom at CAVE_GROUND 830) instead of hanging from the removed rope line. */}
        {hero0}
      </g>
      <DayChip t={t} day="DAY 3" />
      <text x={960} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#F6EFE3">SEPT 14!</text>
    </g>
  );
};

// ---------- S24: macro insert, cave — Problem One: The Clock Breaks (DAY 3) ----------
export const S24: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 700, y: 736, scale: 1, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 35, p: { x: 706, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 10, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 71, p: { x: 694, y: 732, scale: 1, tilt: 0, headTilt: 5, look: -10, armL: { a: 4, b: 8 }, armR: { a: -4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 106, p: { x: 706, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 12, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'worried']]);
  const hero0 = <Hero look={LOOKS.hero} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 1009.5], [len, 1009.5]]);
  const camY = kf(t, [[0, 580], [len, 580]]);
  const zoom = kf(t, [[0, 1.55], [len, 1.65]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cave t={t + 891} id="s24" />
        <Prop kind="calendar" x={1330} y={750} s={0.46} t={t} extra={{"label": "AUG 20", "crossed": 20, "drift_x": 20}} /> {/* v38 (Javion: "cave calendars on a string"): calendar now sits on the cave floor (bottom at CAVE_GROUND 830) instead of hanging from the removed rope line. */}
        {hero0}
      </g>
      <DayChip t={t} day="DAY 3" />
      <text x={960} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#A9C6FF">AUG 20</text>
    </g>
  );
};

// ---------- S25: high angle, cell — Problem One: The Clock Breaks (DAY 3) ----------
export const S25: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 900, y: 736, scale: 1, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 21, p: { x: 906, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 10, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 41, p: { x: 894, y: 732, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: -4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 60, p: { x: 906, y: 736, scale: 1, tilt: 0, headTilt: 5, look: -15, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 82, p: { x: 894, y: 732, scale: 1, tilt: 0, headTilt: 5, look: -15, armL: { a: 4, b: 8 }, armR: { a: -4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'worried']]);
  const hero0 = <Hero look={LOOKS.hero} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 960], [len, 960]]);
  const camY = kf(t, [[0, 560], [len, 560]]);
  const zoom = kf(t, [[0, 1.25], [len, 1.3]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 928} id="s25" veil={0.44} day={3} />
        <Prop kind="calendar" x={1170} y={520} s={0.42} t={t} extra={{"label": "AUG 20"}} />
        {hero0}
      </g>
      <DayChip t={t} day="DAY 3" />
      <text x={960} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#A9C6FF">25 DAYS LOST</text>
    </g>
  );
};

// ---------- S26: medium, cell — Problem One: The Clock Breaks (DAY 3) ----------
export const S26: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 900, y: 736, scale: 1, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 21, p: { x: 900, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 10, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 41, p: { x: 900, y: 736, scale: 1, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 60, p: { x: 900, y: 736, scale: 1, tilt: -4, headTilt: -8, look: -15, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 82, p: { x: 900, y: 736, scale: 1, tilt: -4, headTilt: -8, look: -15, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'worried']]);
  const hero0 = <Hero look={LOOKS.hero} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 620], [len, 620]]);
  const camY = kf(t, [[0, 676], [len, 676]]);
  const zoom = kf(t, [[0, 1.8], [len, 1.9]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 965} id="s26" veil={0.44} day={3} />
        <Prop kind="calendar" x={1170} y={520} s={0.42} t={t} extra={{"label": "AUG 20"}} />
        {hero0}
      </g>
      <DayChip t={t} day="DAY 3" />
      <text x={960} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#A9C6FF">25 DAYS LOST</text>
    </g>
  );
};

// ---------- S27: close-up, cell — Problem One: The Clock Breaks (DAY 3) ----------
export const S27: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 960, y: 736, scale: 1, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 26, p: { x: 966, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 10, armL: { a: 4, b: 8 }, armR: { a: 90, b: 60 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 52, p: { x: 954, y: 732, scale: 1, tilt: 0, headTilt: 6, look: -10, armL: { a: 4, b: 8 }, armR: { a: 120, b: 25 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 79, p: { x: 966, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 12, armL: { a: 4, b: 8 }, armR: { a: 90, b: 60 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'worried']]);
  const hero0 = <Hero look={LOOKS.hero} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 966], [len, 966]]);
  const camY = kf(t, [[0, 560], [len, 560]]);
  const zoom = kf(t, [[0, 3.2], [len, 3.35]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 1002} id="s27" veil={0.44} day={3} />
        {/* Nov 14 (defect hunt: stopwatch floated unsupported ~0.7s before the grab): it now appears only once the hand is up and reaching for it (t>=45), instead of hanging in mid-air from the first frame. */}
        {t >= 45 && (<Prop kind="stopwatch" x={1096.6} y={524.8} s={1} t={t} extra={{}} />)}
        {hero0}
      </g>
      <DayChip t={t} day="DAY 3" />
      <text x={350} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#F6EFE3">SHOULD BE 2</text>
    </g>
  );
};

// ---------- S28: low angle, cell — Problem One: The Clock Breaks (DAY 3) ----------
export const S28: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 960, y: 725, scale: 1, tilt: 0, headTilt: 10, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 16, p: { x: 966, y: 725, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 90, b: 60 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 36, p: { x: 954, y: 725, scale: 1, tilt: 0, headTilt: 6, look: 0, armL: { a: 4, b: 8 }, armR: { a: 120, b: 25 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 54, p: { x: 966, y: 725, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 90, b: 60 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 72, p: { x: 954, y: 725, scale: 1, tilt: 0, headTilt: 6, look: 0, armL: { a: 4, b: 8 }, armR: { a: 120, b: 25 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 88, p: { x: 966, y: 725, scale: 1, tilt: 0, headTilt: 5, look: 12, armL: { a: 4, b: 8 }, armR: { a: 90, b: 60 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 107, p: { x: 954, y: 725, scale: 1, tilt: 0, headTilt: 6, look: 12, armL: { a: 4, b: 8 }, armR: { a: 120, b: 25 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'worried']]);
  const hero0 = <Hero look={LOOKS.hero} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 954], [len, 954]]);
  const camY = kf(t, [[0, 665], [len, 665]]);
  const zoom = kf(t, [[0, 1.6], [len, 1.68]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 1039} id="s28" veil={0.44} day={3} />
        <Prop kind="stopwatch" x={1300} y={469.6} s={1} t={t} extra={{}} />
        {hero0}
      </g>
      <DayChip t={t} day="DAY 3" />
      <text x={960} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#F6EFE3">STRETCHING SECONDS</text>
    </g>
  );
};

// ---------- S29: two-shot, cell (wall) — Problem One: The Clock Breaks (DAY 3) ----------
export const S29: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 900, y: 736, scale: 1, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 40, p: { x: 906, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 10, armL: { a: 4, b: 8 }, armR: { a: 90, b: 60 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 79, p: { x: 894, y: 732, scale: 1, tilt: 0, headTilt: 6, look: -10, armL: { a: 4, b: 8 }, armR: { a: 120, b: 25 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 119, p: { x: 906, y: 736, scale: 1, tilt: 0, headTilt: 5, look: -8, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'stressed']]);
  const hero0 = <Hero look={LOOKS.hero} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const p1 = poseAt(t, [
    { f: 0, p: { x: 1420, y: 736, scale: 0.98, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 45, b: 20 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 40, p: { x: 1426, y: 736, scale: 0.98, tilt: 0, headTilt: 10, look: -10, armL: { a: 4, b: 8 }, armR: { a: 45, b: 20 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 79, p: { x: 1414, y: 732, scale: 0.98, tilt: 0, headTilt: 11, look: 10, armL: { a: 4, b: 8 }, armR: { a: 45, b: 20 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 119, p: { x: 1426, y: 736, scale: 0.98, tilt: 0, headTilt: 10, look: 12, armL: { a: 4, b: 8 }, armR: { a: 45, b: 20 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f1 = faceAt(t, [[0, 'stressed']]);
  // Nov 12 v21 (Javion: "duplication"): MINUS was LOOKS.hero, identical to PLUS —
  // same blue shirt, same head, a copy-paste twin. MINUS now wears a warm taupe
  // shirt so the two read as two different versions, not a duplicated figure.
  const hero1 = <Hero look={{ ...LOOKS.hero, jacket: '#8A7A6A', jacketShade: '#6A5A4A', accent: '#6A5A4A' }} pose={{ ...p1, ...f1, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 966], [len, 966]]);
  const camY = kf(t, [[0, 580], [len, 580]]);
  const zoom = kf(t, [[0, 1.35], [len, 1.4]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 1076} id="s29" veil={0.44} day={3} />
        <Prop kind="wall_clock" x={960} y={400} s={0.8} t={t} extra={{}} />
        {hero0}
        {hero1}
      </g>
      <DayChip t={t} day="DAY 3" />
      <text x={900} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#F6EFE3">PLUS</text>
      <text x={1440} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#A9C6FF">MINUS</text>
    </g>
  );
};

// ---------- S30: wide, cell (bed) — Problem One: The Clock Breaks (DAY 3) ----------
export const S30: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 470, y: 736, scale: 0.9, tilt: 0, headTilt: 12, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 27, p: { x: 470, y: 732, scale: 0.9, tilt: 0, headTilt: 5, look: 10, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 55, p: { x: 470, y: 736, scale: 0.9, tilt: 0, headTilt: 5, look: -8, armL: { a: 4, b: 8 }, armR: { a: -4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 82, p: { x: 470, y: 732, scale: 0.9, tilt: 0, headTilt: 5, look: -8, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'happy']]);
  const hero0 = <Hero look={LOOKS.hero} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 960], [len, 960]]);
  const camY = kf(t, [[0, 560], [len, 560]]);
  const zoom = kf(t, [[0, 1.0], [len, 1.06]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 1113} id="s30" veil={0.28} bed day={3} />
        {/* v34: the zzz floated above an EMPTY platform bed — the hero stands beside it, awake and happy, so nobody is asleep. The Z's were a leftover from when he lay on the bed (pre-v20). Removed. */}
        {hero0}
      </g>
      <DayChip t={t} day="DAY 3" />
    </g>
  );
};

// ---------- S31: over-the-shoulder, cell — Problem One: The Clock Breaks (DAY 3) ----------
export const S31: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 900, y: 736, scale: 1, tilt: 6, headTilt: 0, look: 0, armL: { a: 20, b: 8 }, armR: { a: 20, b: 8 }, legL: { a: 12, b: -15 }, legR: { a: -8, b: -3 } } },
    { f: 15, p: { x: 930, y: 732, scale: 1, tilt: 6, headTilt: 0, look: 0, armL: { a: -20, b: 8 }, armR: { a: -20, b: 8 }, legL: { a: -8, b: -3 }, legR: { a: 12, b: -15 } } },
    { f: 29, p: { x: 960, y: 736, scale: 1, tilt: 6, headTilt: 0, look: 0, armL: { a: 20, b: 8 }, armR: { a: 20, b: 8 }, legL: { a: 12, b: -15 }, legR: { a: -8, b: -3 } } },
    { f: 44, p: { x: 990, y: 732, scale: 1, tilt: 6, headTilt: 0, look: 0, armL: { a: -20, b: 8 }, armR: { a: -20, b: 8 }, legL: { a: -8, b: -3 }, legR: { a: 12, b: -15 } } },
    { f: 59, p: { x: 1020, y: 736, scale: 1, tilt: 6, headTilt: 0, look: 0, armL: { a: 20, b: 8 }, armR: { a: 20, b: 8 }, legL: { a: 12, b: -15 }, legR: { a: -8, b: -3 } } },
    { f: 88, p: { x: 1020, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 10, armL: { a: 4, b: 8 }, armR: { a: 90, b: 60 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 118, p: { x: 1020, y: 736, scale: 1, tilt: 0, headTilt: 6, look: -8, armL: { a: 4, b: 8 }, armR: { a: 120, b: 25 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'worried']]);
  const hero0 = <Hero look={LOOKS.hero} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 1020], [len, 1020]]);
  const camY = kf(t, [[0, 676], [len, 676]]);
  const zoom = kf(t, [[0, 1.8], [len, 1.9]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 1150} id="s31" veil={0.44} day={3} />
        <Prop kind="calendar" x={1170} y={520} s={0.42} t={t} extra={{"label": "DAY 3"}} />
        {hero0}
      </g>
      <DayChip t={t} day="DAY 3" />
      <text x={960} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#A9C6FF">30 MIN LATER</text>
    </g>
  );
};

// ---------- S32: medium, cell (window) — Problem One: The Clock Breaks (DAY 3) ----------
export const S32: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 900, y: 736, scale: 1, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 31, p: { x: 906, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 10, armL: { a: 4, b: 8 }, armR: { a: 90, b: 60 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 63, p: { x: 894, y: 732, scale: 1, tilt: 0, headTilt: 6, look: -10, armL: { a: 4, b: 8 }, armR: { a: 120, b: 25 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 94, p: { x: 906, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 12, armL: { a: 4, b: 8 }, armR: { a: 90, b: 60 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'worried']]);
  const hero0 = <Hero look={LOOKS.hero} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 626], [len, 626]]);
  const camY = kf(t, [[0, 676], [len, 676]]);
  const zoom = kf(t, [[0, 1.8], [len, 1.9]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 1187} id="s32" veil={0.44} window day={3} />
        <Prop kind="wall_clock" x={975.3} y={517.8} s={1} t={t} extra={{"hour": 7, "minute": 0, "ticking": true}} />
        {hero0}
      </g>
      <DayChip t={t} day="DAY 3" />
      <text x={960} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#A9C6FF">15 HOURS OF DRIFT</text>
    </g>
  );
};

// ---------- S33: wide, cell (window) — Problem One: The Clock Breaks (DAY 3) ----------
export const S33: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 960, y: 736, scale: 1, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 40, p: { x: 966, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 10, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 80, p: { x: 954, y: 732, scale: 1, tilt: 0, headTilt: 5, look: -10, armL: { a: 4, b: 8 }, armR: { a: -4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 119, p: { x: 966, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 12, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'sad']]);
  const hero0 = <Hero look={LOOKS.hero} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 960], [len, 960]]);
  const camY = kf(t, [[0, 560], [len, 560]]);
  const zoom = kf(t, [[0, 1.0], [len, 1.06]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 1224} id="s33" veil={0.28} window day={3} />
        <Prop kind="wall_clock" x={1280} y={460} s={1} t={t} extra={{"ticking": true}} />
        {hero0}
      </g>
      <DayChip t={t} day="DAY 3" />
    </g>
  );
};

// ---------- S34: macro insert, cell (wall) — Problem One: The Clock Breaks (DAY 3) ----------
export const S34: React.FC<ShotProps> = ({ t, len }) => {
  const camX = kf(t, [[0, 1171], [len, 1171]]);
  const camY = kf(t, [[0, 629], [len, 629]]);
  const zoom = kf(t, [[0, 1.8532818532818534], [len, 1.9532818532818534]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 1261} id="s34" veil={0.44} day={3} />
        <Prop kind="brain" x={960} y={554} s={1} t={t} extra={{"variant": "beating", "bpm": 120, "drift_x": 30}} />
        <Prop kind="pocket_watch" x={1420} y={500} s={0.8} t={t} extra={{"drift_x": 25}} />
      </g>
      <DayChip t={t} day="DAY 3" />
      <text x={960} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#F6EFE3">CAVE TIME</text>
    </g>
  );
};

// ---------- S35: close-up, cell (door) — Problem One: The Clock Breaks (DAY 3) ----------
export const S35: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 640, y: 736, scale: 1, tilt: 6, headTilt: 0, look: 0, armL: { a: 20, b: 8 }, armR: { a: 20, b: 8 }, legL: { a: 12, b: -15 }, legR: { a: -8, b: -3 } } },
    { f: 15, p: { x: 670, y: 732, scale: 1, tilt: 6, headTilt: 0, look: 0, armL: { a: -20, b: 8 }, armR: { a: -20, b: 8 }, legL: { a: -8, b: -3 }, legR: { a: 12, b: -15 } } },
    { f: 30, p: { x: 700, y: 736, scale: 1, tilt: 6, headTilt: 0, look: 0, armL: { a: 20, b: 8 }, armR: { a: 20, b: 8 }, legL: { a: 12, b: -15 }, legR: { a: -8, b: -3 } } },
    { f: 44, p: { x: 730, y: 732, scale: 1, tilt: 6, headTilt: 0, look: 0, armL: { a: -20, b: 8 }, armR: { a: -20, b: 8 }, legL: { a: -8, b: -3 }, legR: { a: 12, b: -15 } } },
    { f: 59, p: { x: 760, y: 736, scale: 1, tilt: 6, headTilt: 0, look: 0, armL: { a: 20, b: 8 }, armR: { a: 20, b: 8 }, legL: { a: 12, b: -15 }, legR: { a: -8, b: -3 } } },
    { f: 89, p: { x: 760, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 118, p: { x: 760, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: -4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral'], [44, 'worried']]);
  const hero0 = <Hero look={LOOKS.hero} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 760], [len, 760]]);
  const camY = kf(t, [[0, 560], [len, 560]]);
  const zoom = kf(t, [[0, 3.2], [len, 3.35]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 1298} id="s35" veil={0.44} door day={3} />
        <Prop kind="sign" x={913.6} y={447.2} s={0.9} t={t} extra={{"text": "TONIGHT"}} />
        {hero0}
      </g>
      <DayChip t={t} day="DAY 3" />
    </g>
  );
};

// ---------- S36: medium, cell (bed) — Problem One: The Clock Breaks (DAY 3) ----------
export const S36: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 470, y: 622, scale: 0.9, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 36, p: { x: 470, y: 614, scale: 0.9, tilt: 0, headTilt: 5, look: 10, armL: { a: 4, b: 8 }, armR: { a: 90, b: 60 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 71, p: { x: 470, y: 626, scale: 0.9, tilt: 0, headTilt: 6, look: -8, armL: { a: 4, b: 8 }, armR: { a: 120, b: 25 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 107, p: { x: 470, y: 614, scale: 0.9, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 90, b: 60 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'puzzled']]);
  const hero0 = <Hero look={LOOKS.hero} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 470], [len, 470]]);
  const camY = kf(t, [[0, 554], [len, 554]]);
  const zoom = kf(t, [[0, 1.8], [len, 1.9]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 1335} id="s36" veil={0.44} bed day={3} />
        <Prop kind="question_mark" x={861.8} y={447.8} s={0.9} t={t} extra={{"drift_x": 30}} />
        {hero0}
      </g>
      <DayChip t={t} day="DAY 3" />
      <text x={960} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#F6EFE3">WHAT BREAKS FIRST?</text>
    </g>
  );
};

// ---------- S37: close-up, cell (wall) — Problem Two: Sleep Stops Working (DAY 5) ----------
export const S37: React.FC<ShotProps> = ({ t, len }) => {
  const camX = kf(t, [[0, 960], [len, 960]]);
  const camY = kf(t, [[0, 520], [len, 520]]);
  const zoom = kf(t, [[0, 3.083532934131737], [len, 3.2335329341317367]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 1372} id="s37" veil={0.44} day={5} />
        {/* Nov 14 full-audit: lightbulb REMOVED — floating bulb mid-room, same error as S10 (Javion flagged 28s). v38 had only shrunk it. */}
        <Prop kind="wall_clock" x={1180} y={520} s={0.6} t={t} extra={{"ticking": true, "drift_x": 20}} /> {/* v38: was x=1094.9, s=0.9 (~230px) floating mid-wall. Now x=1180, s=0.6 (~150px) — two smaller icons flanking the title card. */}
        <TitleCard t={t} lines={['PROBLEM TWO', 'SLEEP STOPS WORKING']} y={400} size={40} /> {/* Nov 14 — same invisible-title-card fix as S18 (default y=175 is above the frame at this zoom). */}
      </g>
      <DayChip t={t} day="DAY 5" />
    </g>
  );
};

// ---------- S38: two-shot, cell (bed) — Problem Two: Sleep Stops Working (DAY 5) ----------
export const S38: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 960, y: 736, scale: 1, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 31, p: { x: 966, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 10, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 62, p: { x: 954, y: 732, scale: 1, tilt: 0, headTilt: 5, look: -10, armL: { a: 4, b: 8 }, armR: { a: -4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 94, p: { x: 966, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'stressed']]);
  const hero0 = <Hero look={LOOKS.hero} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 966], [len, 966]]);
  const camY = kf(t, [[0, 580], [len, 580]]);
  const zoom = kf(t, [[0, 1.35], [len, 1.4]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 1409} id="s38" veil={0.44} bed day={5} />
        {/* Nov 14 full-audit: lightbulb REMOVED — floating bulb above the lamp, same error as S10 (Javion flagged 28s). */}
        {hero0}
      </g>
      <DayChip t={t} day="DAY 5" />
    </g>
  );
};

// ---------- S39: medium, cell — Problem Two: Sleep Stops Working (DAY 5) ----------
export const S39: React.FC<ShotProps> = ({ t, len }) => {
  const camX = kf(t, [[0, 960], [len, 960]]);
  const camY = kf(t, [[0, 560], [len, 560]]);
  const zoom = kf(t, [[0, 1.8], [len, 1.9]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        {/* Nov 12 v7 (Javion: "still reads as two beds"): the Cell's floor mattress at bottom
            left read as a second bed next to the centre bed Prop. mattress={false} hides it —
            the centre bed Prop (with zzz) is the only bed in the frame now. */}
        <Cell t={t + 1446} id="s39" veil={0.44} day={5} mattress={false} />
        {/* Nov 12 v6 (Javion: duplicate items — one bed, not three): the two side beds
            (x=547.7, x=1372.3) were identical copies of the centre bed. Removed. The single
            centre bed (with zzz) is the focus; the "20 MIN" / "1 HOUR" captions are a time
            comparison for falling asleep, not tied to separate beds. */}
        <Prop kind="bed" x={960} y={730} s={1.6} t={t} extra={{"zzz": true, "drift_x": 15}} /> {/* v38 (Javion: "day 5 the bed with the Zs is too small"): was s=0.6 (~200px toy bed). Now s=1.6 (~560px) — a real bed. y 767.7→730 keeps the legs on the floor (legs bottom = y+38·s = 790.5 in both). */}
        <Prop kind="zzz" x={960} y={489.8} s={1.8} t={t} extra={{"drift_x": 25}} />
      </g>
      <DayChip t={t} day="DAY 5" />
      <text x={480} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#F6EFE3">20 MIN</text>
      <text x={1440} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#F6EFE3">1 HOUR</text>
    </g>
  );
};

// ---------- S40: macro insert, cell — Problem Two: Sleep Stops Working (DAY 5) ----------
export const S40: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 960, y: 736, scale: 1, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 40, p: { x: 966, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 10, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 79, p: { x: 954, y: 732, scale: 1, tilt: 0, headTilt: 5, look: -10, armL: { a: 4, b: 8 }, armR: { a: -4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 119, p: { x: 966, y: 736, scale: 1, tilt: 0, headTilt: 5, look: -8, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral']]);
  const hero0 = <Hero look={LOOKS.hero} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 1143], [len, 1143]]);
  const camY = kf(t, [[0, 520], [len, 520]]);
  const zoom = kf(t, [[0, 2.4], [len, 2.5]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 1483} id="s40" veil={0.44} day={5} />
        <Prop kind="brain" x={1300} y={480} s={1} t={t} extra={{"variant": "battery", "drift_x": 30}} />
        {hero0}
      </g>
      <DayChip t={t} day="DAY 5" />
      <text x={960} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#F6EFE3">LOW BATTERY</text>
    </g>
  );
};

// ---------- S41: high angle, lab — Problem Two: Sleep Stops Working (DAY 5) ----------
export const S41: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 620, y: 756, scale: 1, tilt: 0, headTilt: 8, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 32, p: { x: 626, y: 756, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 64, p: { x: 614, y: 752, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: -4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 92, p: { x: 626, y: 756, scale: 1, tilt: 0, headTilt: 5, look: 10, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 128, p: { x: 614, y: 752, scale: 1, tilt: 0, headTilt: 5, look: 10, armL: { a: 4, b: 8 }, armR: { a: -4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral']]);
  const hero0 = <Hero look={LOOKS.scientist} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const p1 = poseAt(t, [
    { f: 0, p: { x: 1300, y: 736, scale: 1, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 32, p: { x: 1306, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 10, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 64, p: { x: 1294, y: 732, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: -4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 92, p: { x: 1306, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 12, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 128, p: { x: 1294, y: 732, scale: 1, tilt: 0, headTilt: 5, look: 12, armL: { a: 4, b: 8 }, armR: { a: -4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f1 = faceAt(t, [[0, 'neutral']]);
  const hero1 = <Hero look={LOOKS.hero} pose={{ ...p1, ...f1, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 960], [len, 960]]);
  const camY = kf(t, [[0, 560], [len, 560]]);
  const zoom = kf(t, [[0, 1.25], [len, 1.3]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Lab t={t + 1520} id="s41" />
        <Prop kind="checklist" x={1000} y={480} s={0.9} t={t} extra={{}} /> {/* v38 (Javion: "the checklist is behind his head for the alcohol scene"): was x=1300 — the hero stands at world x≈1322, so the checklist sat directly behind his head with its lower checks hidden. Now x=1000, on the wall between the scientist (x≈640) and the hero. */}
        {hero0}
        {hero1}
      </g>
      <DayChip t={t} day="DAY 5" />
      <text x={960} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#F6EFE3">ALCOHOL</text>
    </g>
  );
};

// ---------- S42: macro insert, cell (wall) — Problem Two: Sleep Stops Working (DAY 5) ----------
export const S42: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 500, y: 736, scale: 1, tilt: -6, headTilt: 8, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 26, p: { x: 506, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 52, p: { x: 494, y: 732, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: -4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 78, p: { x: 506, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 104, p: { x: 494, y: 732, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: -4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'worried']]);
  const hero0 = <Hero look={LOOKS.hero} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 872.2], [len, 872.2]]);
  const camY = kf(t, [[0, 543.5], [len, 543.5]]);
  const zoom = kf(t, [[0, 1.7707820954254796], [len, 1.8707820954254797]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 1557} id="s42" veil={0.44} day={5} />
        <Prop kind="balance_scale" x={1238.9} y={520} s={0.9} t={t} extra={{"left": "17-19 HOURS\nAWAKE", "right": "0.05", "tilt": 0}} />
        {hero0}
      </g>
      <DayChip t={t} day="DAY 5" />
    </g>
  );
};

// ---------- S43: medium, cell (wall) — Problem Two: Sleep Stops Working (DAY 5) ----------
export const S43: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 300, y: 736, scale: 1, tilt: -6, headTilt: 8, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 12, p: { x: 306, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 90, b: 60 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 24, p: { x: 294, y: 732, scale: 1, tilt: 0, headTilt: 6, look: 0, armL: { a: 4, b: 8 }, armR: { a: 120, b: 25 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 36, p: { x: 306, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 90, b: 60 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 48, p: { x: 294, y: 732, scale: 1, tilt: 0, headTilt: 6, look: 0, armL: { a: 4, b: 8 }, armR: { a: 120, b: 25 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 59, p: { x: 306, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 12, armL: { a: 4, b: 8 }, armR: { a: 90, b: 60 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 72, p: { x: 294, y: 732, scale: 1, tilt: 0, headTilt: 6, look: 12, armL: { a: 4, b: 8 }, armR: { a: 120, b: 25 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'worried']]);
  const hero0 = <Hero look={LOOKS.hero} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 506], [len, 506]]);
  const camY = kf(t, [[0, 676], [len, 676]]);
  const zoom = kf(t, [[0, 1.8], [len, 1.9]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 1594} id="s43" veil={0.44} day={5} />
        <Prop kind="balance_scale" x={864.8} y={520} s={0.9} t={t} extra={{"left": "17-19 HOURS\nAWAKE", "right": "0.05", "tilt": 14}} />
        {hero0}
      </g>
      <DayChip t={t} day="DAY 5" />
      <text x={960} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#A9C6FF">0.05%</text>
    </g>
  );
};

// ---------- S44: low angle, outside — Problem Two: Sleep Stops Working (DAY 5) ----------
export const S44: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 700, y: 740.5, scale: 0.9, tilt: 0, headTilt: 4, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 25, p: { x: 706, y: 740.5, scale: 0.9, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 90, b: 60 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 51, p: { x: 694, y: 740.5, scale: 0.9, tilt: 0, headTilt: 6, look: 0, armL: { a: 4, b: 8 }, armR: { a: 120, b: 25 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 76, p: { x: 706, y: 740.5, scale: 0.9, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 90, b: 60 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 101, p: { x: 694, y: 740.5, scale: 0.9, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'worried']]);
  const hero0 = <Hero look={LOOKS.hero} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 706], [len, 706]]);
  const camY = kf(t, [[0, 680.5], [len, 680.5]]);
  const zoom = kf(t, [[0, 1.6], [len, 1.68]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Exterior t={t + 1631} id="s44" doorOpen={false} />
        <Prop kind="car" x={960} y={820} s={0.6} t={t} extra={{}} />
        {hero0}
      </g>
      <DayChip t={t} day="DAY 5" />
    </g>
  );
};

// ---------- S45: medium, cell — Problem Two: Sleep Stops Working (DAY 5) ----------
export const S45: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 960, y: 736, scale: 1, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 37, p: { x: 966, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 10, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 74, p: { x: 954, y: 732, scale: 1, tilt: 0, headTilt: 5, look: -10, armL: { a: 4, b: 8 }, armR: { a: -4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 110, p: { x: 966, y: 736, scale: 1, tilt: 0, headTilt: 5, look: -8, armL: { a: 4, b: 8 }, armR: { a: 90, b: 60 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'stressed']]);
  const hero0 = <Hero look={LOOKS.hero} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 966], [len, 966]]);
  const camY = kf(t, [[0, 676], [len, 676]]);
  const zoom = kf(t, [[0, 1.8], [len, 1.9]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 1668} id="s45" veil={0.44} day={5} />
        {/* v36: the breathalyzer was floating high on the wall (x=1295, y=518, s=1) with a drift — a handheld device, head-sized, nothing holding it, reading like a wall-mounted TV. Grounded now: sitting on the bed at s=0.6, no drift. The 0.00 reading stays. */}
        <Prop kind="breathalyzer" x={700} y={762} s={0.6} t={t} />
        {hero0}
      </g>
      <DayChip t={t} day="DAY 5" />
      <text x={960} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#F6EFE3">NO ALCOHOL</text>
    </g>
  );
};

// ---------- S46: wide, cell — Problem Two: Sleep Stops Working (DAY 6) ----------
export const S46: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 960, y: 752, scale: 1, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 25, p: { x: 966, y: 752, scale: 1, tilt: 0, headTilt: 5, look: 10, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 50, p: { x: 954, y: 748, scale: 1, tilt: 0, headTilt: 5, look: -10, armL: { a: 4, b: 8 }, armR: { a: -4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 76, p: { x: 966, y: 752, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'puzzled']]);
  const hero0 = <Hero look={LOOKS.teenager} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 960], [len, 960]]);
  const camY = kf(t, [[0, 560], [len, 560]]);
  const zoom = kf(t, [[0, 1.0], [len, 1.06]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 1705} id="s46" veil={0.28} day={6} />
        <Prop kind="calendar" x={1170} y={520} s={0.42} t={t} extra={{"label": "1964"}} />
        {hero0}
      </g>
      <DayChip t={t} day="DAY 6" />
    </g>
  );
};

// ---------- S47: close-up, cell (wall) — Problem Two: Sleep Stops Working (DAY 6) ----------
export const S47: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 620, y: 752, scale: 1, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 34, p: { x: 626, y: 752, scale: 1, tilt: 0, headTilt: 5, look: 10, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 69, p: { x: 614, y: 748, scale: 1, tilt: 0, headTilt: 5, look: -10, armL: { a: 4, b: 8 }, armR: { a: -4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 104, p: { x: 626, y: 752, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral']]);
  const hero0 = <Hero look={LOOKS.teenager} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 626], [len, 626]]);
  const camY = kf(t, [[0, 576], [len, 576]]);
  const zoom = kf(t, [[0, 3.2], [len, 3.35]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 1742} id="s47" veil={0.44} day={6} />
        <Prop kind="tally" x={766.6} y={520.8} s={1} t={t} extra={{"label": "144 HOURS", "drift_x": 20}} />
        {hero0}
      </g>
      <DayChip t={t} day="DAY 6" />
    </g>
  );
};

// ---------- S48: macro insert, cell (wall) — Problem Two: Sleep Stops Working (DAY 6) ----------
export const S48: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 620, y: 752, scale: 1, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 26, p: { x: 620, y: 752, scale: 1, tilt: 0, headTilt: 5, look: 4, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 52, p: { x: 620, y: 752, scale: 1, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 75, p: { x: 620, y: 752, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 90, b: 60 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 104, p: { x: 620, y: 752, scale: 1, tilt: 0, headTilt: -3, look: 0, armL: { a: 4, b: 8 }, armR: { a: 90, b: 60 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral']]);
  const hero0 = <Hero look={LOOKS.teenager} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 925], [len, 925]]);
  const camY = kf(t, [[0, 538], [len, 538]]);
  const zoom = kf(t, [[0, 2.0689655172413794], [len, 2.1689655172413795]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 1779} id="s48" veil={0.44} day={6} />
        <Prop kind="tally" x={1241.6} y={480} s={1} t={t} extra={{"label": "144 HOURS"}} />
        {hero0}
      </g>
      <DayChip t={t} day="DAY 6" />
    </g>
  );
};

// ---------- S49: wide, cell — Problem Two: Sleep Stops Working (DAY 6) ----------
export const S49: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 960, y: 736, scale: 1, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 26, p: { x: 966, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 10, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 52, p: { x: 954, y: 732, scale: 1, tilt: 0, headTilt: 5, look: -10, armL: { a: 4, b: 8 }, armR: { a: -4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 78, p: { x: 966, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral']]);
  const hero0 = <Hero look={LOOKS.hero} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 960], [len, 960]]);
  const camY = kf(t, [[0, 560], [len, 560]]);
  const zoom = kf(t, [[0, 1.0], [len, 1.06]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 1816} id="s49" veil={0.28} day={6} />
        <Prop kind="coffee_cup" x={1300} y={480} s={1} t={t} extra={{}} />
        {hero0}
      </g>
      <DayChip t={t} day="DAY 6" />
      <text x={960} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#F6EFE3">NO STIMULANTS</text>
    </g>
  );
};

// ---------- S50: medium, cell — Problem Two: Sleep Stops Working (DAY 6) ----------
export const S50: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 620, y: 752, scale: 1, tilt: -6, headTilt: 8, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 28, p: { x: 626, y: 752, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 55, p: { x: 614, y: 748, scale: 1, tilt: 0, headTilt: 5, look: -2, armL: { a: 4, b: 8 }, armR: { a: -4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 75, p: { x: 626, y: 752, scale: 1, tilt: 0, headTilt: 5, look: 2, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 94, p: { x: 614, y: 748, scale: 1, tilt: 0, headTilt: 5, look: -2, armL: { a: 4, b: 8 }, armR: { a: -4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 110, p: { x: 626, y: 752, scale: 1, tilt: 0, headTilt: 5, look: 2, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'worried']]);
  const hero0 = <Hero look={LOOKS.teenager} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 614], [len, 614]]);
  const camY = kf(t, [[0, 688], [len, 688]]);
  const zoom = kf(t, [[0, 1.8], [len, 1.9]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 1853} id="s50" veil={0.44} day={6} />
        <Prop kind="street_sign" x={977.3} y={518.8} s={0.9} t={t} extra={{}} /> {/* v38 (Javion: "a rondom item with a smiley face on it"): was extra={{"face": true}} — two dot eyes + a smile on the teal sign. Face off; the def's else branch draws two plain text lines. */}
        {hero0}
      </g>
      <DayChip t={t} day="DAY 6" />
    </g>
  );
};

// ---------- S51: close-up, cell — Problem Two: Sleep Stops Working (DAY 6) ----------
export const S51: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 620, y: 752, scale: 1, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 25, p: { x: 626, y: 752, scale: 1, tilt: 0, headTilt: 5, look: 2, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 50, p: { x: 614, y: 748, scale: 1, tilt: 0, headTilt: 5, look: -2, armL: { a: 4, b: 8 }, armR: { a: -4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 75, p: { x: 626, y: 752, scale: 1, tilt: 0, headTilt: 5, look: 2, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'scared']]);
  const hero0 = <Hero look={LOOKS.teenager} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 626], [len, 626]]);
  const camY = kf(t, [[0, 576], [len, 576]]);
  const zoom = kf(t, [[0, 3.2], [len, 3.35]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 1890} id="s51" veil={0.44} day={6} />
        <Prop kind="street_sign" x={770.6} y={529.8} s={0.9} t={t} extra={{}} /> {/* v38: same smiley-face bug as S50 (found by grep — the only other face:true besides S50). Face off. */}
        {hero0}
      </g>
      <DayChip t={t} day="DAY 6" />
      <text x={350} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#F6EFE3">HELLO?</text>
    </g>
  );
};

// ---------- S52: medium, classroom — Problem Two: Sleep Stops Working (DAY 6) ----------
export const S52: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 620, y: 752, scale: 1, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 30, p: { x: 626, y: 752, scale: 1, tilt: 0, headTilt: 5, look: 12, armL: { a: 4, b: 8 }, armR: { a: 90, b: 60 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 66, p: { x: 614, y: 748, scale: 1, tilt: 0, headTilt: 6, look: 0, armL: { a: 4, b: 8 }, armR: { a: 120, b: 25 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 96, p: { x: 626, y: 752, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 90, b: 60 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 133, p: { x: 614, y: 748, scale: 1, tilt: 0, headTilt: 6, look: 0, armL: { a: 4, b: 8 }, armR: { a: 120, b: 25 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'stressed']]);
  const hero0 = <Hero look={LOOKS.teenager} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const p1 = poseAt(t, [
    { f: 0, p: { x: 1350, y: 756, scale: 1, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 33, p: { x: 1356, y: 756, scale: 1, tilt: 0, headTilt: 5, look: 10, armL: { a: 4, b: 8 }, armR: { a: 90, b: 60 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 66, p: { x: 1344, y: 752, scale: 1, tilt: 0, headTilt: 6, look: 0, armL: { a: 4, b: 8 }, armR: { a: 120, b: 25 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 96, p: { x: 1356, y: 756, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 90, b: 60 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 133, p: { x: 1344, y: 752, scale: 1, tilt: 0, headTilt: 6, look: 0, armL: { a: 4, b: 8 }, armR: { a: 120, b: 25 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f1 = faceAt(t, [[0, 'stressed']]);
  const hero1 = <Hero look={LOOKS.teacher} pose={{ ...p1, ...f1, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 614], [len, 614]]);
  const camY = kf(t, [[0, 688], [len, 688]]);
  const zoom = kf(t, [[0, 1.8], [len, 1.9]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Classroom t={t + 1927} id="s52" board={(<g><text x={740} y={455} textAnchor="middle" fontFamily={FONT.hand} fontSize={54.09473684210527} fill="#EDEFE6" opacity={0.92}>100 - 7 = ?</text></g>)} />
        {hero0}
        {hero1}
      </g>
      <DayChip t={t} day="DAY 6" />
    </g>
  );
};

// ---------- S53: wide, cell (bed) — Problem Two: Sleep Stops Working (DAY 6) ----------
export const S53: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 470, y: 706, scale: 0.9, tilt: 0, headTilt: 12, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 45, p: { x: 470, y: 698, scale: 0.9, tilt: 0, headTilt: 5, look: 10, armL: { a: 4, b: 8 }, armR: { a: 90, b: 60 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 90, p: { x: 470, y: 710, scale: 0.9, tilt: 0, headTilt: 6, look: -8, armL: { a: 4, b: 8 }, armR: { a: 120, b: 25 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 135, p: { x: 470, y: 698, scale: 0.9, tilt: 0, headTilt: 5, look: -8, armL: { a: 4, b: 8 }, armR: { a: 90, b: 60 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]); {/* Nov 14 (Javion: "he's literally levitating" at 2:53): the v38 +20 fix undershot — feet still ~50px above the floorboards. y +50 more on every key (total +70 from the original) so his feet sit on the floor. */} {/* v38 (Javion: "yellow hoodie character is floating next to a deformed bed"): the teenager's pose y was +20 too high on all 4 keys, so his feet hovered above the floorboards. y +20 on every key so his feet sit on the floor, clear of the bed. (The bed itself was already fixed by the v38 platform pillow.) */}
  const f0 = faceAt(t, [[0, 'stressed'], [90, 'happy']]);
  const hero0 = <Hero look={LOOKS.teenager} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 960], [len, 960]]);
  const camY = kf(t, [[0, 560], [len, 560]]);
  const zoom = kf(t, [[0, 1.0], [len, 1.06]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 1964} id="s53" veil={0.28} bed day={6} />
        <Prop kind="wall_clock" x={1280} y={460} s={0.9} t={t} extra={{"hour": 2, "minute": 40, "ticking": true}} />
        {hero0}
      </g>
      <DayChip t={t} day="DAY 6" />
      <text x={960} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#F6EFE3">14 HOURS 40 MIN</text>
    </g>
  );
};

// ---------- S54: two-shot, cell — Problem Two: Sleep Stops Working (DAY 6) ----------
export const S54: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 960, y: 736, scale: 1, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 23, p: { x: 966, y: 736, scale: 1, tilt: 0, headTilt: 7, look: 0, armL: { a: 4, b: 8 }, armR: { a: 140, b: 20 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 52, p: { x: 954, y: 732, scale: 1, tilt: 0, headTilt: -8, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 72, p: { x: 966, y: 736, scale: 1, tilt: 0, headTilt: 7, look: 8, armL: { a: 4, b: 8 }, armR: { a: 140, b: 20 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 90, p: { x: 954, y: 732, scale: 1, tilt: 0, headTilt: -8, look: -6, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 103, p: { x: 966, y: 736, scale: 1, tilt: 0, headTilt: 7, look: 0, armL: { a: 4, b: 8 }, armR: { a: 140, b: 20 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'puzzled']]);
  const hero0 = <Hero look={LOOKS.hero} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 966], [len, 966]]);
  const camY = kf(t, [[0, 580], [len, 580]]);
  const zoom = kf(t, [[0, 1.35], [len, 1.4]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 2001} id="s54" veil={0.44} day={6} />
        {hero0}
      </g>
      <DayChip t={t} day="DAY 6" />
      <text x={960} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#A9C6FF">PAUSE AND GUESS</text>
    </g>
  );
};

// ---------- S55: close-up, cell (wall) — Problem Two: Sleep Stops Working (DAY 6) ----------
export const S55: React.FC<ShotProps> = ({ t, len }) => {
  const camX = kf(t, [[0, 960], [len, 960]]);
  const camY = kf(t, [[0, 520], [len, 520]]);
  const zoom = kf(t, [[0, 3.2], [len, 3.3000000000000003]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 2038} id="s55" veil={0.44} day={6} />
        <Prop kind="brain" x={960} y={520} s={0.8} t={t} extra={{"variant": "beating", "bpm": 120, "drift_x": 35}} /> {/* v38 (Javion: "a brain and a light bulb just floating"): brain was s=1 (~440px) with the bulb planted in its top. Brain s→0.8. */}
        {/* Nov 14 full-audit: lightbulb REMOVED — floating bulb, same error as S10 (Javion flagged 28s). v38 had only moved it. */}
        <Prop kind="question_mark" x={1152.4} y={498.4} s={0.6} t={t} extra={{"drift_x": 30}} /> {/* v38: s 0.7→0.6. */}
      </g>
      <DayChip t={t} day="DAY 6" />
      <text x={960} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#A9C6FF">HOW MANY HOURS?</text>
    </g>
  );
};

// ---------- S56: macro insert, cell — Problem Two: Sleep Stops Working (DAY 6) ----------
export const S56: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 960, y: 736, scale: 1, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 37, p: { x: 966, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 10, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 73, p: { x: 954, y: 732, scale: 1, tilt: 0, headTilt: 5, look: -10, armL: { a: 4, b: 8 }, armR: { a: -4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 110, p: { x: 966, y: 736, scale: 1, tilt: 0, headTilt: 8, look: 12, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'worried']]);
  const hero0 = <Hero look={LOOKS.hero} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 960], [len, 960]]);
  const camY = kf(t, [[0, 470], [len, 470]]);
  const zoom = kf(t, [[0, 2.4], [len, 2.5]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 2075} id="s56" veil={0.44} day={6} />
        {/* v38 (Javion: "white horizontal bar above his head"): the flatline sound_waves REMOVED — a flat white bar floating above his head read as a glitch, not as silence. The "SHHH" caption carries the silence beat on its own. */}
        {hero0}
      </g>
      <DayChip t={t} day="DAY 6" />
      <text x={350} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#A9C6FF">SHHH</text>
    </g>
  );
};

// ---------- S57: close-up, cell (wall) — Problem Three: The Silence Gets Loud (DAY 7) ----------
export const S57: React.FC<ShotProps> = ({ t, len }) => {
  const camX = kf(t, [[0, 960], [len, 960]]);
  const camY = kf(t, [[0, 520], [len, 520]]);
  const zoom = kf(t, [[0, 3.2], [len, 3.3000000000000003]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 2112} id="s57" veil={0.44} day={7} />
        {/* Nov 14 (Javion: "fix everything wrong" — the ear was flagged twice: v38 "a shell is there floating for no reason", then again as "stuff floating in mid air". Shrinking it didn't fix it — the problem is a disembodied body part floating in the beam, not its size. Ear + sound waves REMOVED. The empty cell + TitleCard carry the beat: the silence IS the visual. */}
        <TitleCard t={t} lines={['PROBLEM THREE', 'THE SILENCE GETS LOUD']} y={400} size={40} /> {/* Nov 14 — same invisible-title-card fix as S18 (default y=175 is above the frame at this zoom). */}
      </g>
      <DayChip t={t} day="DAY 7" />
    </g>
  );
};

// ---------- S58: medium, cell — Problem Three: The Silence Gets Loud (DAY 7) ----------
export const S58: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 960, y: 736, scale: 1, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 34, p: { x: 966, y: 736, scale: 1, tilt: 0, headTilt: 8, look: 10, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 69, p: { x: 954, y: 732, scale: 1, tilt: 0, headTilt: 5, look: -10, armL: { a: 4, b: 8 }, armR: { a: -4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 104, p: { x: 966, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 12, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'worried']]);
  const hero0 = <Hero look={LOOKS.hero} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 966], [len, 966]]);
  const camY = kf(t, [[0, 676], [len, 676]]);
  const zoom = kf(t, [[0, 1.8], [len, 1.9]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 2149} id="s58" veil={0.44} day={7} />
        {hero0}
        <Prop kind="speech_bubble" x={1300} y={477.8} s={1} t={t} extra={{"lines": ["HELLO?", "...HELLO?"]}} />
      </g>
      <DayChip t={t} day="DAY 7" />
    </g>
  );
};

// ---------- S59: close-up, cell — Problem Three: The Silence Gets Loud (DAY 7) ----------
export const S59: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 960, y: 736, scale: 1, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 20, p: { x: 966, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 8, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 38, p: { x: 954, y: 732, scale: 1, tilt: 0, headTilt: 5, look: -6, armL: { a: 4, b: 8 }, armR: { a: -4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 51, p: { x: 966, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 74, p: { x: 954, y: 732, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: -4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 101, p: { x: 966, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'scared']]);
  const hero0 = <Hero look={LOOKS.hero} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 954], [len, 954]]);
  const camY = kf(t, [[0, 556], [len, 556]]);
  const zoom = kf(t, [[0, 3.2], [len, 3.35]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 2186} id="s59" veil={0.44} day={7} />
        {hero0}
        <Prop kind="speech_bubble" x={800.4} y={473.8} s={0.9} t={t} extra={{"lines": ["DID I SAY THAT?"]}} />
        <Prop kind="speech_bubble" x={1107.6} y={473.8} s={0.9} t={t} extra={{"lines": ["YES, YOU DID."]}} />
      </g>
      <DayChip t={t} day="DAY 7" x={96} y={968} />
    </g>
  );
};

// ---------- S60: low angle, lab — Problem Three: The Silence Gets Loud (DAY 7) ----------
export const S60: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 330, y: 818, scale: 0.5, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 24, p: { x: 336, y: 818, scale: 0.5, tilt: 0, headTilt: 5, look: 10, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 48, p: { x: 324, y: 814, scale: 0.5, tilt: 0, headTilt: 6, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 67, p: { x: 336, y: 818, scale: 0.5, tilt: 0, headTilt: 5, look: 8, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 83, p: { x: 324, y: 814, scale: 0.5, tilt: 0, headTilt: 6, look: -6, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 95, p: { x: 336, y: 818, scale: 0.5, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral']]);
  const hero0 = <Hero look={LOOKS.student} pose={{ ...p0, y: p0.y - 72 * p0.scale, scale: p0.scale * 1.4, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />; {/* v38 (Javion: "the group of ppl look tiny"): group heroes were scale ~0.5 (half-size adults). Scaled ×1.4 at the hero level (pose keys left as-is); y −72·scale keeps the feet on the floor (feet = y + 180·scale). */}
  const p1 = poseAt(t, [
    { f: 0, p: { x: 582, y: 818, scale: 0.49, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 30, b: 15 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 24, p: { x: 588, y: 818, scale: 0.49, tilt: 0, headTilt: 10, look: 10, armL: { a: 4, b: 8 }, armR: { a: 30, b: 15 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 48, p: { x: 576, y: 814, scale: 0.49, tilt: 0, headTilt: 11, look: 0, armL: { a: 4, b: 8 }, armR: { a: 30, b: 15 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 71, p: { x: 588, y: 818, scale: 0.49, tilt: 0, headTilt: 10, look: 10, armL: { a: 4, b: 8 }, armR: { a: 30, b: 15 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 95, p: { x: 576, y: 814, scale: 0.49, tilt: 0, headTilt: 11, look: -8, armL: { a: 4, b: 8 }, armR: { a: 30, b: 15 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f1 = faceAt(t, [[0, 'neutral']]);
  const hero1 = <Hero look={{...LOOKS.student, hair: 'crop', hairC: '#3A2420', jacket: '#4A7AA0', jacketShade: '#3A5E80', accent: '#3A5E80'}} pose={{ ...p1, y: p1.y - 72 * p1.scale, scale: p1.scale * 1.4, ...f1, facing: 1 }} rimId="rimBlue" shadow={1} />; {/* v38: group ×1.4, feet stay on floor. */}
  const p2 = poseAt(t, [
    { f: 0, p: { x: 834, y: 818, scale: 0.51, tilt: 0, headTilt: -5, look: 0, armL: { a: 30, b: 15 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 24, p: { x: 840, y: 818, scale: 0.51, tilt: 0, headTilt: 0, look: 10, armL: { a: 30, b: 15 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 48, p: { x: 828, y: 814, scale: 0.51, tilt: 0, headTilt: 1, look: 0, armL: { a: 30, b: 15 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 67, p: { x: 840, y: 818, scale: 0.51, tilt: 0, headTilt: 0, look: 8, armL: { a: 30, b: 15 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 83, p: { x: 828, y: 814, scale: 0.51, tilt: 0, headTilt: 1, look: -6, armL: { a: 30, b: 15 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 95, p: { x: 840, y: 818, scale: 0.51, tilt: 0, headTilt: 0, look: 0, armL: { a: 30, b: 15 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f2 = faceAt(t, [[0, 'neutral']]);
  const hero2 = <Hero look={{...LOOKS.student, hair: 'curly', hairC: '#2A1E14', jacket: '#C85A46', jacketShade: '#9E4636', accent: '#9E4636'}} pose={{ ...p2, y: p2.y - 72 * p2.scale, scale: p2.scale * 1.4, ...f2, facing: 1 }} rimId="rimBlue" shadow={1} />; {/* v38: group ×1.4, feet stay on floor. */}
  const p3 = poseAt(t, [
    { f: 0, p: { x: 1086, y: 818, scale: 0.495, tilt: 0, headTilt: 8, look: 0, armL: { a: 4, b: 8 }, armR: { a: 20, b: 10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 24, p: { x: 1092, y: 818, scale: 0.495, tilt: 0, headTilt: 12, look: 10, armL: { a: 4, b: 8 }, armR: { a: 20, b: 10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 48, p: { x: 1080, y: 814, scale: 0.495, tilt: 0, headTilt: 12, look: 0, armL: { a: 4, b: 8 }, armR: { a: 20, b: 10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 71, p: { x: 1092, y: 818, scale: 0.495, tilt: 0, headTilt: 12, look: 10, armL: { a: 4, b: 8 }, armR: { a: 20, b: 10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 95, p: { x: 1080, y: 814, scale: 0.495, tilt: 0, headTilt: 12, look: -8, armL: { a: 4, b: 8 }, armR: { a: 20, b: 10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f3 = faceAt(t, [[0, 'neutral']]);
  const hero3 = <Hero look={{...LOOKS.student, hair: 'bun', hairC: '#5A3A28', jacket: '#D9C441', jacketShade: '#AD9C34', accent: '#AD9C34'}} pose={{ ...p3, y: p3.y - 72 * p3.scale, scale: p3.scale * 1.4, ...f3, facing: 1 }} rimId="rimBlue" shadow={1} />; {/* v38: group ×1.4, feet stay on floor. */}
  const p4 = poseAt(t, [
    { f: 0, p: { x: 1338, y: 818, scale: 0.505, tilt: 0, headTilt: -8, look: 0, armL: { a: 20, b: 10 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 24, p: { x: 1344, y: 818, scale: 0.505, tilt: 0, headTilt: -3, look: 10, armL: { a: 20, b: 10 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 48, p: { x: 1332, y: 814, scale: 0.505, tilt: 0, headTilt: -2, look: 0, armL: { a: 20, b: 10 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 67, p: { x: 1344, y: 818, scale: 0.505, tilt: 0, headTilt: -3, look: 8, armL: { a: 20, b: 10 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 83, p: { x: 1332, y: 814, scale: 0.505, tilt: 0, headTilt: -2, look: -6, armL: { a: 20, b: 10 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 95, p: { x: 1344, y: 818, scale: 0.505, tilt: 0, headTilt: -3, look: 0, armL: { a: 20, b: 10 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f4 = faceAt(t, [[0, 'neutral']]);
  const hero4 = <Hero look={{...LOOKS.student, hair: 'sidepart', hairC: '#4A3226', jacket: '#9B7BB8', jacketShade: '#7C6394', accent: '#7C6394'}} pose={{ ...p4, y: p4.y - 72 * p4.scale, scale: p4.scale * 1.4, ...f4, facing: 1 }} rimId="rimBlue" shadow={1} />; {/* v38: group ×1.4, feet stay on floor. */}
  const p5 = poseAt(t, [
    { f: 0, p: { x: 1590, y: 818, scale: 0.49, tilt: 0, headTilt: 3, look: 0, armL: { a: 15, b: 8 }, armR: { a: 25, b: 12 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 24, p: { x: 1596, y: 818, scale: 0.49, tilt: 0, headTilt: 8, look: 10, armL: { a: 15, b: 8 }, armR: { a: 25, b: 12 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 48, p: { x: 1584, y: 814, scale: 0.49, tilt: 0, headTilt: 9, look: 0, armL: { a: 15, b: 8 }, armR: { a: 25, b: 12 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 71, p: { x: 1596, y: 818, scale: 0.49, tilt: 0, headTilt: 8, look: 10, armL: { a: 15, b: 8 }, armR: { a: 25, b: 12 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 95, p: { x: 1584, y: 814, scale: 0.49, tilt: 0, headTilt: 9, look: -8, armL: { a: 15, b: 8 }, armR: { a: 25, b: 12 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f5 = faceAt(t, [[0, 'neutral']]);
  const hero5 = <Hero look={{...LOOKS.student, hair: 'afro', hairC: '#241A12', jacket: '#D98A3A', jacketShade: '#AD6E2E', accent: '#AD6E2E'}} pose={{ ...p5, y: p5.y - 72 * p5.scale, scale: p5.scale * 1.4, ...f5, facing: 1 }} rimId="rimBlue" shadow={1} />; {/* v38: group ×1.4, feet stay on floor. */}
  const p6 = poseAt(t, [
    { f: 0, p: { x: 1760, y: 800, scale: 0.7, tilt: 0, headTilt: 8, look: 0, armL: { a: 25, b: 12 }, armR: { a: 25, b: 12 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 24, p: { x: 1766, y: 800, scale: 0.7, tilt: 0, headTilt: 5, look: 0, armL: { a: 25, b: 12 }, armR: { a: 25, b: 12 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 48, p: { x: 1754, y: 796, scale: 0.7, tilt: 0, headTilt: 6, look: 0, armL: { a: 25, b: 12 }, armR: { a: 25, b: 12 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 69, p: { x: 1766, y: 800, scale: 0.7, tilt: 0, headTilt: 5, look: 10, armL: { a: 25, b: 12 }, armR: { a: 25, b: 12 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 95, p: { x: 1754, y: 796, scale: 0.7, tilt: 0, headTilt: 6, look: 10, armL: { a: 25, b: 12 }, armR: { a: 25, b: 12 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f6 = faceAt(t, [[0, 'neutral']]);
  const hero6 = <Hero look={LOOKS.scientist} pose={{ ...p6, ...f6, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 336], [len, 336]]);
  const camY = kf(t, [[0, 758], [len, 758]]);
  const zoom = kf(t, [[0, 1.6], [len, 1.68]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Lab t={t + 2223} id="s60" />
        <Prop kind="cubicles" x={765.4} y={551.6} s={0.9} t={t} extra={{}} />
        {hero0}
        {hero1}
        {hero2}
        {hero3}
        {hero4}
        {hero5}
        {hero6}
      </g>
      <DayChip t={t} day="DAY 7" />
      <text x={960} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#F6EFE3">1954 · McGILL</text>
    </g>
  );
};

// ---------- S61: close-up, cell (wall) — Problem Three: The Silence Gets Loud (DAY 7) ----------
export const S61: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 960, y: 732, scale: 1.2, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 37, p: { x: 966, y: 732, scale: 1.2, tilt: 0, headTilt: 5, look: 10, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 74, p: { x: 954, y: 728, scale: 1.2, tilt: 0, headTilt: 5, look: -10, armL: { a: 4, b: 8 }, armR: { a: -4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 112, p: { x: 966, y: 732, scale: 1.2, tilt: 0, headTilt: 5, look: 12, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral']]);
  const hero0 = <Hero look={LOOKS.student} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 966], [len, 966]]);
  const camY = kf(t, [[0, 520.8], [len, 520.8]]);
  const zoom = kf(t, [[0, 3.2], [len, 3.35]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 2260} id="s61" veil={0.44} day={7} />
        {hero0}
      </g>
      <DayChip t={t} day="DAY 7" />
    </g>
  );
};

// ---------- S62: wide, cell — Problem Three: The Silence Gets Loud (DAY 7) ----------
export const S62: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 330, y: 806, scale: 0.6, tilt: 6, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 24, p: { x: 336, y: 806, scale: 0.6, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 48, p: { x: 324, y: 802, scale: 0.6, tilt: 0, headTilt: 6, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 73, p: { x: 336, y: 806, scale: 0.6, tilt: 0, headTilt: 5, look: 10, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 97, p: { x: 324, y: 802, scale: 0.6, tilt: 0, headTilt: 6, look: -8, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral']]);
  const hero0 = <Hero look={LOOKS.student} pose={{ ...p0, y: p0.y - 72 * p0.scale, scale: p0.scale * 1.4, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />; {/* v38: group ×1.4, feet stay on floor. */}
  const p1 = poseAt(t, [
    { f: 0, p: { x: 960, y: 806, scale: 0.588, tilt: 6, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 30, b: 15 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 24, p: { x: 966, y: 806, scale: 0.588, tilt: 0, headTilt: 10, look: 0, armL: { a: 4, b: 8 }, armR: { a: 30, b: 15 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 48, p: { x: 954, y: 802, scale: 0.588, tilt: 0, headTilt: 11, look: 0, armL: { a: 4, b: 8 }, armR: { a: 30, b: 15 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 73, p: { x: 966, y: 806, scale: 0.588, tilt: 0, headTilt: 10, look: 10, armL: { a: 4, b: 8 }, armR: { a: 30, b: 15 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 97, p: { x: 954, y: 802, scale: 0.588, tilt: 0, headTilt: 11, look: -8, armL: { a: 4, b: 8 }, armR: { a: 30, b: 15 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f1 = faceAt(t, [[0, 'neutral']]);
  const hero1 = <Hero look={{...LOOKS.student, hair: 'crop', hairC: '#3A2420', jacket: '#4A7AA0', jacketShade: '#3A5E80', accent: '#3A5E80'}} pose={{ ...p1, y: p1.y - 72 * p1.scale, scale: p1.scale * 1.4, ...f1, facing: 1 }} rimId="rimBlue" shadow={1} />; {/* v38: group ×1.4, feet stay on floor. */}
  const p2 = poseAt(t, [
    { f: 0, p: { x: 1590, y: 806, scale: 0.612, tilt: 6, headTilt: -5, look: 0, armL: { a: 30, b: 15 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 24, p: { x: 1596, y: 806, scale: 0.612, tilt: 0, headTilt: 0, look: 0, armL: { a: 30, b: 15 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 48, p: { x: 1584, y: 802, scale: 0.612, tilt: 0, headTilt: 1, look: 0, armL: { a: 30, b: 15 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 73, p: { x: 1596, y: 806, scale: 0.612, tilt: 0, headTilt: 0, look: 10, armL: { a: 30, b: 15 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 97, p: { x: 1584, y: 802, scale: 0.612, tilt: 0, headTilt: 1, look: -8, armL: { a: 30, b: 15 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f2 = faceAt(t, [[0, 'neutral']]);
  const hero2 = <Hero look={{...LOOKS.student, hair: 'curly', hairC: '#2A1E14', jacket: '#C85A46', jacketShade: '#9E4636', accent: '#9E4636'}} pose={{ ...p2, y: p2.y - 72 * p2.scale, scale: p2.scale * 1.4, ...f2, facing: 1 }} rimId="rimBlue" shadow={1} />; {/* v38: group ×1.4, feet stay on floor. */}
  const camX = kf(t, [[0, 960], [len, 960]]);
  const camY = kf(t, [[0, 560], [len, 560]]);
  const zoom = kf(t, [[0, 1.0], [len, 1.06]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 2297} id="s62" veil={0.28} day={7} mattress={false} /> {/* v38 (Javion: "they are phasing on the bed"): the left researcher stood at x=330, inside the floor mattress's footprint (u=0.06–0.40), so the mattress top cut him at the waist and he read as standing IN the bed. Same fix as S121/S122 (v35): hide the mattress for a lineup shot — the bed isn't the subject here. */}
        {hero0}
        {hero1}
        {hero2}
      </g>
      <DayChip t={t} day="DAY 7" />
      <text x={960} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#A9C6FF">QUIT IN 2-3 DAYS</text>
    </g>
  );
};

// ---------- S63: over-the-shoulder, cell — Problem Three: The Silence Gets Loud (DAY 7) ----------
export const S63: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 960, y: 736, scale: 1, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 22, p: { x: 966, y: 736, scale: 1, tilt: 0, headTilt: 8, look: 2, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 44, p: { x: 954, y: 732, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: -4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 64, p: { x: 966, y: 736, scale: 1, tilt: 0, headTilt: 5, look: -2, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 88, p: { x: 954, y: 732, scale: 1, tilt: 0, headTilt: 5, look: -2, armL: { a: 4, b: 8 }, armR: { a: -4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'scared']]);
  const hero0 = <Hero look={LOOKS.hero} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 954], [len, 954]]);
  const camY = kf(t, [[0, 672], [len, 672]]);
  const zoom = kf(t, [[0, 1.8], [len, 1.9]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 2334} id="s63" veil={0.44} day={7} />
        {/* v34 (full-board review): the dots sat at y=513.8, 15px below the top of the hero's head — the middle dot hid behind the head and the two outer dots poked out at the top corners like white ears/horns. Raised to y=440, clear above the head (top 498) and clear of the lamp shade above. */}
        <Prop kind="dots" x={960} y={440} s={1} t={t} extra={{}} />
        {hero0}
      </g>
      <DayChip t={t} day="DAY 7" />
      <text x={960} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#A9C6FF">MORE THAN HALF</text>
    </g>
  );
};

// ---------- S64: medium, cell — Problem Three: The Silence Gets Loud (DAY 7) ----------
export const S64: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 960, y: 736, scale: 1, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 16, p: { x: 966, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 90, b: 60 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 36, p: { x: 954, y: 732, scale: 1, tilt: 0, headTilt: 6, look: 0, armL: { a: 4, b: 8 }, armR: { a: 120, b: 25 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 52, p: { x: 966, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 12, armL: { a: 4, b: 8 }, armR: { a: 90, b: 60 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 72, p: { x: 954, y: 732, scale: 1, tilt: 0, headTilt: 6, look: 12, armL: { a: 4, b: 8 }, armR: { a: 120, b: 25 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'stressed']]);
  const hero0 = <Hero look={LOOKS.hero} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 954], [len, 954]]);
  const camY = kf(t, [[0, 672], [len, 672]]);
  const zoom = kf(t, [[0, 1.8], [len, 1.9]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 2371} id="s64" veil={0.44} day={7} />
        <Prop kind="numbers" x={1300} y={513.8} s={1} t={t} extra={{}} />
        {hero0}
      </g>
      <DayChip t={t} day="DAY 7" />
    </g>
  );
};

// ---------- S65: wide, cell — Problem Three: The Silence Gets Loud (DAY 7) ----------
export const S65: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 900, y: 736, scale: 1, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 25, p: { x: 906, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 10, armL: { a: 4, b: 8 }, armR: { a: 90, b: 60 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 50, p: { x: 894, y: 732, scale: 1, tilt: 0, headTilt: 6, look: 0, armL: { a: 4, b: 8 }, armR: { a: 120, b: 25 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 70, p: { x: 906, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 8, armL: { a: 4, b: 8 }, armR: { a: 90, b: 60 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 87, p: { x: 894, y: 732, scale: 1, tilt: 0, headTilt: 6, look: -6, armL: { a: 4, b: 8 }, armR: { a: 120, b: 25 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 99, p: { x: 906, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'scared']]);
  const hero0 = <Hero look={LOOKS.hero} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const p1 = poseAt(t, [
    { f: 0, p: { x: 1300, y: 736, scale: 1, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 25, p: { x: 1306, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 10, armL: { a: 4, b: 8 }, armR: { a: 90, b: 60 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 50, p: { x: 1294, y: 732, scale: 1, tilt: 0, headTilt: 6, look: 0, armL: { a: 4, b: 8 }, armR: { a: 120, b: 25 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 72, p: { x: 1306, y: 736, scale: 1, tilt: 0, headTilt: 5, look: -15, armL: { a: 4, b: 8 }, armR: { a: 90, b: 60 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 99, p: { x: 1294, y: 732, scale: 1, tilt: 0, headTilt: 6, look: -15, armL: { a: 4, b: 8 }, armR: { a: 120, b: 25 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f1 = faceAt(t, [[0, 'scared']]);
  const hero1 = <Hero look={LOOKS.hero} pose={{ ...p1, ...f1, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const hero1G = <g opacity={0.35}>{hero1}</g>;
  const camX = kf(t, [[0, 960], [len, 960]]);
  const camY = kf(t, [[0, 560], [len, 560]]);
  const zoom = kf(t, [[0, 1.0], [len, 1.06]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 2408} id="s65" veil={0.28} day={7} />
        {hero0}
        {hero1G}
      </g>
      <DayChip t={t} day="DAY 7" />
      <text x={960} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#A9C6FF">WHICH ONE IS REAL?</text>
    </g>
  );
};

// ---------- S66: macro insert, cell (wall) — Problem Three: The Silence Gets Loud (DAY 7) ----------
export const S66: React.FC<ShotProps> = ({ t, len }) => {
  const camX = kf(t, [[0, 960], [len, 960]]);
  const camY = kf(t, [[0, 500], [len, 500]]);
  const zoom = kf(t, [[0, 2.4], [len, 2.5]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 2445} id="s66" veil={0.44} day={7} />
        <Prop kind="brain" x={960} y={500} s={1.1} t={t} extra={{"variant": "radio", "drift_x": 35}} />
      </g>
      <DayChip t={t} day="DAY 7" />
      <text x={960} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#F6EFE3">OWN STATION</text>
    </g>
  );
};

// ---------- S67: close-up, cell (wall) — Problem Three: The Silence Gets Loud (DAY 7) ----------
export const S67: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 1450, y: 758, scale: 0.8, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 27, p: { x: 1450, y: 758, scale: 0.8, tilt: 0, headTilt: 8, look: 12, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 60, p: { x: 1450, y: 758, scale: 0.8, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 84, p: { x: 1450, y: 758, scale: 0.8, tilt: 0, headTilt: 5, look: 8, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 105, p: { x: 1450, y: 758, scale: 0.8, tilt: 0, headTilt: -4, look: -6, armL: { a: 4, b: 8 }, armR: { a: 45, b: 40 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 120, p: { x: 1450, y: 758, scale: 0.8, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'worried']]);
  const hero0 = <Hero look={LOOKS.hero} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 1450], [len, 1450]]);
  const camY = kf(t, [[0, 608.4], [len, 608.4]]);
  const zoom = kf(t, [[0, 3.2], [len, 3.35]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 2482} id="s67" veil={0.44} day={7} />
        <Prop kind="brain" x={1280} y={622} s={0.7} t={t} extra={{"variant": "radio"}} /> {/* v38 fix 2 (S67 still wrong on the re-render — brain shrunk but still crossing the left frame edge ~25-30% off): was x=1200 — at this shot's 3.2x zoom (camX 1450, visible world x 1150-1750) the brain's centre sat too close to the left edge. Moved right to x=1280 so the whole brain is in frame with margin, still clear of the hero's head. (The hero is the "you" of the video, not Jake — Jake isn't in video #3.) */}
        <Prop kind="sound_waves" x={1330} y={562.2} s={0.9} t={t} extra={{}} /> {/* v38 fix 2: moved right with the brain (was x=1250) so the waves still read as coming from the brain. */}
        {hero0}
      </g>
      <DayChip t={t} day="DAY 7" />
      <text x={350} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#F6EFE3">OWN STATION</text>
    </g>
  );
};

// ---------- S68: medium, cell — Problem Three: The Silence Gets Loud (DAY 7) ----------
export const S68: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 960, y: 736, scale: 1, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 14, p: { x: 966, y: 736, scale: 1, tilt: 0, headTilt: 8, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 32, p: { x: 954, y: 732, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: -4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 48, p: { x: 966, y: 736, scale: 1, tilt: 0, headTilt: 8, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 64, p: { x: 954, y: 732, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: -4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'worried']]);
  const hero0 = <Hero look={LOOKS.hero} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 954], [len, 954]]);
  const camY = kf(t, [[0, 672], [len, 672]]);
  const zoom = kf(t, [[0, 1.8], [len, 1.9]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 2519} id="s68" veil={0.44} day={7} />
        {hero0}
      </g>
      <DayChip t={t} day="DAY 7" />
      <text x={960} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#A9C6FF">WHY DOES IT HURT?</text>
    </g>
  );
};

// ---------- S69: wide, lab — Problem Three: The Silence Gets Loud (DAY 7) ----------
export const S69: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 330, y: 818, scale: 0.5, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 25, p: { x: 336, y: 818, scale: 0.5, tilt: 0, headTilt: 5, look: 10, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 50, p: { x: 324, y: 814, scale: 0.5, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: -4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 69, p: { x: 336, y: 818, scale: 0.5, tilt: 0, headTilt: 5, look: 8, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 87, p: { x: 324, y: 814, scale: 0.5, tilt: 0, headTilt: 5, look: -6, armL: { a: 4, b: 8 }, armR: { a: -4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 99, p: { x: 336, y: 818, scale: 0.5, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral']]);
  const hero0 = <Hero look={LOOKS.student} pose={{ ...p0, y: p0.y - 72 * p0.scale, scale: p0.scale * 1.4, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />; {/* v38 (Javion: "the group of ppl look tiny"): S69 group hero, scale ~0.5 → ×1.4; y −72·scale keeps the feet on the floor. */}
  const p1 = poseAt(t, [
    { f: 0, p: { x: 582, y: 818, scale: 0.49, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 30, b: 15 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 25, p: { x: 588, y: 818, scale: 0.49, tilt: 0, headTilt: 10, look: 10, armL: { a: 4, b: 8 }, armR: { a: 30, b: 15 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 50, p: { x: 576, y: 814, scale: 0.49, tilt: 0, headTilt: 10, look: 0, armL: { a: 4, b: 8 }, armR: { a: 30, b: 15 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 74, p: { x: 588, y: 818, scale: 0.49, tilt: 0, headTilt: 10, look: 10, armL: { a: 4, b: 8 }, armR: { a: 30, b: 15 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 99, p: { x: 576, y: 814, scale: 0.49, tilt: 0, headTilt: 10, look: -8, armL: { a: 4, b: 8 }, armR: { a: 30, b: 15 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f1 = faceAt(t, [[0, 'neutral']]);
  const hero1 = <Hero look={{...LOOKS.student, hair: 'crop', hairC: '#3A2420', jacket: '#4A7AA0', jacketShade: '#3A5E80', accent: '#3A5E80'}} pose={{ ...p1, y: p1.y - 72 * p1.scale, scale: p1.scale * 1.4, ...f1, facing: 1 }} rimId="rimBlue" shadow={1} />; {/* v38: group ×1.4, feet stay on floor. */}
  const p2 = poseAt(t, [
    { f: 0, p: { x: 834, y: 818, scale: 0.51, tilt: 0, headTilt: -5, look: 0, armL: { a: 30, b: 15 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 25, p: { x: 840, y: 818, scale: 0.51, tilt: 0, headTilt: 0, look: 10, armL: { a: 30, b: 15 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 50, p: { x: 828, y: 814, scale: 0.51, tilt: 0, headTilt: 0, look: 0, armL: { a: 30, b: 15 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 69, p: { x: 840, y: 818, scale: 0.51, tilt: 0, headTilt: 0, look: 8, armL: { a: 30, b: 15 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 87, p: { x: 828, y: 814, scale: 0.51, tilt: 0, headTilt: 0, look: -6, armL: { a: 30, b: 15 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 99, p: { x: 840, y: 818, scale: 0.51, tilt: 0, headTilt: 0, look: 0, armL: { a: 30, b: 15 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f2 = faceAt(t, [[0, 'neutral']]);
  const hero2 = <Hero look={{...LOOKS.student, hair: 'curly', hairC: '#2A1E14', jacket: '#C85A46', jacketShade: '#9E4636', accent: '#9E4636'}} pose={{ ...p2, y: p2.y - 72 * p2.scale, scale: p2.scale * 1.4, ...f2, facing: 1 }} rimId="rimBlue" shadow={1} />; {/* v38: group ×1.4, feet stay on floor. */}
  const p3 = poseAt(t, [
    { f: 0, p: { x: 1086, y: 818, scale: 0.495, tilt: 0, headTilt: 8, look: 0, armL: { a: 4, b: 8 }, armR: { a: 20, b: 10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 25, p: { x: 1092, y: 818, scale: 0.495, tilt: 0, headTilt: 12, look: 10, armL: { a: 4, b: 8 }, armR: { a: 20, b: 10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 50, p: { x: 1080, y: 814, scale: 0.495, tilt: 0, headTilt: 12, look: 0, armL: { a: 4, b: 8 }, armR: { a: 20, b: 10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 74, p: { x: 1092, y: 818, scale: 0.495, tilt: 0, headTilt: 12, look: 10, armL: { a: 4, b: 8 }, armR: { a: 20, b: 10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 99, p: { x: 1080, y: 814, scale: 0.495, tilt: 0, headTilt: 12, look: -8, armL: { a: 4, b: 8 }, armR: { a: 20, b: 10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f3 = faceAt(t, [[0, 'neutral']]);
  const hero3 = <Hero look={{...LOOKS.student, hair: 'bun', hairC: '#5A3A28', jacket: '#D9C441', jacketShade: '#AD9C34', accent: '#AD9C34'}} pose={{ ...p3, y: p3.y - 72 * p3.scale, scale: p3.scale * 1.4, ...f3, facing: 1 }} rimId="rimBlue" shadow={1} />; {/* v38: group ×1.4, feet stay on floor. */}
  const p4 = poseAt(t, [
    { f: 0, p: { x: 1338, y: 818, scale: 0.505, tilt: 0, headTilt: -8, look: 0, armL: { a: 20, b: 10 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 25, p: { x: 1344, y: 818, scale: 0.505, tilt: 0, headTilt: -3, look: 10, armL: { a: 20, b: 10 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 50, p: { x: 1332, y: 814, scale: 0.505, tilt: 0, headTilt: -3, look: 0, armL: { a: 20, b: 10 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 69, p: { x: 1344, y: 818, scale: 0.505, tilt: 0, headTilt: -3, look: 8, armL: { a: 20, b: 10 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 87, p: { x: 1332, y: 814, scale: 0.505, tilt: 0, headTilt: -3, look: -6, armL: { a: 20, b: 10 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 99, p: { x: 1344, y: 818, scale: 0.505, tilt: 0, headTilt: -3, look: 0, armL: { a: 20, b: 10 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f4 = faceAt(t, [[0, 'neutral']]);
  const hero4 = <Hero look={{...LOOKS.student, hair: 'sidepart', hairC: '#4A3226', jacket: '#9B7BB8', jacketShade: '#7C6394', accent: '#7C6394'}} pose={{ ...p4, y: p4.y - 72 * p4.scale, scale: p4.scale * 1.4, ...f4, facing: 1 }} rimId="rimBlue" shadow={1} />; {/* v38: group ×1.4, feet stay on floor. */}
  const p5 = poseAt(t, [
    { f: 0, p: { x: 1590, y: 818, scale: 0.49, tilt: 0, headTilt: 3, look: 0, armL: { a: 15, b: 8 }, armR: { a: 25, b: 12 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 25, p: { x: 1596, y: 818, scale: 0.49, tilt: 0, headTilt: 8, look: 10, armL: { a: 15, b: 8 }, armR: { a: 25, b: 12 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 50, p: { x: 1584, y: 814, scale: 0.49, tilt: 0, headTilt: 8, look: 0, armL: { a: 15, b: 8 }, armR: { a: 25, b: 12 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 74, p: { x: 1596, y: 818, scale: 0.49, tilt: 0, headTilt: 8, look: 10, armL: { a: 15, b: 8 }, armR: { a: 25, b: 12 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 99, p: { x: 1584, y: 814, scale: 0.49, tilt: 0, headTilt: 8, look: -8, armL: { a: 15, b: 8 }, armR: { a: 25, b: 12 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f5 = faceAt(t, [[0, 'neutral']]);
  const hero5 = <Hero look={{...LOOKS.student, hair: 'afro', hairC: '#241A12', jacket: '#D98A3A', jacketShade: '#AD6E2E', accent: '#AD6E2E'}} pose={{ ...p5, y: p5.y - 72 * p5.scale, scale: p5.scale * 1.4, ...f5, facing: 1 }} rimId="rimBlue" shadow={1} />; {/* v38: group ×1.4, feet stay on floor. */}
  const camX = kf(t, [[0, 960], [len, 960]]);
  const camY = kf(t, [[0, 560], [len, 560]]);
  const zoom = kf(t, [[0, 1.0], [len, 1.06]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Lab t={t + 2556} id="s69" />
        <Prop kind="scanner" x={960} y={450} s={1} t={t} extra={{}} />
        {hero0}
        {hero1}
        {hero2}
        {hero3}
        {hero4}
        {hero5}
      </g>
      <DayChip t={t} day="DAY 7" />
      <text x={960} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#F6EFE3">2003 · UCLA</text>
    </g>
  );
};

// ---------- S70: two-shot, cell — Problem Three: The Silence Gets Loud (DAY 7) ----------
export const S70: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 960, y: 736, scale: 1, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 22, p: { x: 966, y: 736, scale: 1, tilt: 0, headTilt: 7, look: 10, armL: { a: 4, b: 8 }, armR: { a: 140, b: 20 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 45, p: { x: 954, y: 732, scale: 1, tilt: 0, headTilt: -8, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 63, p: { x: 966, y: 736, scale: 1, tilt: 0, headTilt: 7, look: 8, armL: { a: 4, b: 8 }, armR: { a: 140, b: 20 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 78, p: { x: 954, y: 732, scale: 1, tilt: 0, headTilt: -8, look: -6, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 90, p: { x: 966, y: 736, scale: 1, tilt: 0, headTilt: 7, look: 0, armL: { a: 4, b: 8 }, armR: { a: 140, b: 20 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral']]);
  const hero0 = <Hero look={LOOKS.hero} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 954], [len, 954]]);
  const camY = kf(t, [[0, 580], [len, 580]]);
  const zoom = kf(t, [[0, 1.35], [len, 1.4]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 2593} id="s70" veil={0.44} day={7} />
        <Prop kind="ball_game" x={1250} y={500} s={1} t={t} extra={{}} />
        {hero0}
      </g>
      <DayChip t={t} day="DAY 7" />
    </g>
  );
};

// ---------- S71: medium, cell — Problem Three: The Silence Gets Loud (DAY 7) ----------
export const S71: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 900, y: 736, scale: 1, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 36, p: { x: 906, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 10, armL: { a: 4, b: 8 }, armR: { a: 90, b: 60 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 72, p: { x: 894, y: 732, scale: 1, tilt: 0, headTilt: 6, look: -10, armL: { a: 4, b: 8 }, armR: { a: 120, b: 25 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 108, p: { x: 906, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 12, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral']]);
  const hero0 = <Hero look={LOOKS.hero} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 626], [len, 626]]);
  const camY = kf(t, [[0, 676], [len, 676]]);
  const zoom = kf(t, [[0, 1.8], [len, 1.9]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 2630} id="s71" veil={0.44} day={7} />
        <Prop kind="ball_game" x={700} y={517.8} s={1} t={t} extra={{}} /> {/* v38 (Javion: "basket ball with a ring behind his head for reason"): was x=960 — the ball sat directly behind the hero's head, half-hidden by it. Now x=700, on the wall clear of him. (The ball IS supposed to be there — it's the UCLA 2003 virtual ball-tossing game from the script: "two players stopped throwing to the third." S70 shows the same game.) */}
        {hero0}
      </g>
      <DayChip t={t} day="DAY 7" />
    </g>
  );
};

// ---------- S72: macro insert, cell (wall) — Problem Three: The Silence Gets Loud (DAY 7) ----------
export const S72: React.FC<ShotProps> = ({ t, len }) => {
  const camX = kf(t, [[0, 960], [len, 960]]);
  const camY = kf(t, [[0, 500], [len, 500]]);
  const zoom = kf(t, [[0, 2.4], [len, 2.5]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 2667} id="s72" veil={0.44} day={7} />
        <Prop kind="brain_scan" x={960} y={500} s={1.1} t={t} extra={{"drift_x": 30}} />
      </g>
      <DayChip t={t} day="DAY 7" />
      <text x={960} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#A9C6FF">SAME AS PHYSICAL PAIN</text>
    </g>
  );
};

// ---------- S73: close-up, cell (wall) — Problem Three: The Silence Gets Loud (DAY 7) ----------
export const S73: React.FC<ShotProps> = ({ t, len }) => {
  const camX = kf(t, [[0, 960], [len, 960]]);
  const camY = kf(t, [[0, 480], [len, 480]]);
  const zoom = kf(t, [[0, 3.2], [len, 3.3000000000000003]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 2704} id="s73" veil={0.44} day={7} />
        <Prop kind="brain" x={960} y={492} s={1.1} t={t} extra={{"drift_x": 35}} />
        <Prop kind="alarm_bell" x={1122.9} y={420.4} s={0.8} t={t} extra={{}} />
      </g>
      <DayChip t={t} day="DAY 7" />
      <text x={960} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#A9C6FF">ANTERIOR CINGULATE</text>
    </g>
  );
};

// ---------- S74: macro insert, cell (wall) — Problem Three: The Silence Gets Loud (DAY 7) ----------
export const S74: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 960, y: 736, scale: 1, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 42, p: { x: 966, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 10, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 83, p: { x: 954, y: 732, scale: 1, tilt: 0, headTilt: 5, look: -10, armL: { a: 4, b: 8 }, armR: { a: -4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 125, p: { x: 966, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral']]);
  const hero0 = <Hero look={LOOKS.hero} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 1143], [len, 1143]]);
  const camY = kf(t, [[0, 520], [len, 520]]);
  const zoom = kf(t, [[0, 2.4], [len, 2.5]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 2741} id="s74" veil={0.44} day={7} />
        <Prop kind="brain" x={1300} y={480} s={1} t={t} extra={{"variant": "plain"}} />
        {hero0}
      </g>
      <DayChip t={t} day="DAY 7" />
      <text x={960} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#F6EFE3">SAME SPOT</text>
    </g>
  );
};

// ---------- S75: close-up, cell (wall) — Problem Three: The Silence Gets Loud (DAY 7) ----------
export const S75: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 960, y: 736, scale: 1, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 28, p: { x: 966, y: 736, scale: 1, tilt: 0, headTilt: 8, look: 10, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 57, p: { x: 954, y: 732, scale: 1, tilt: 0, headTilt: 5, look: -10, armL: { a: 4, b: 8 }, armR: { a: -4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 85, p: { x: 966, y: 736, scale: 1, tilt: 0, headTilt: 8, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'happy']]);
  const hero0 = <Hero look={LOOKS.hero} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 966], [len, 966]]);
  const camY = kf(t, [[0, 560], [len, 560]]);
  const zoom = kf(t, [[0, 3.2], [len, 3.35]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 2778} id="s75" veil={0.44} day={7} />
        {hero0}
      </g>
      <DayChip t={t} day="DAY 7" />
      <text x={480} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#F6EFE3">PLUS</text>
      <text x={1440} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#F6EFE3">MINUS</text>
    </g>
  );
};

// ---------- S76: low angle, cell — Problem Three: The Silence Gets Loud (DAY 7) ----------
export const S76: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 960, y: 736, scale: 1, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 26, p: { x: 966, y: 736, scale: 1, tilt: 0, headTilt: 8, look: 10, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 51, p: { x: 954, y: 732, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: -4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 72, p: { x: 966, y: 736, scale: 1, tilt: 0, headTilt: 8, look: 8, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 90, p: { x: 954, y: 732, scale: 1, tilt: 0, headTilt: 5, look: -6, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 103, p: { x: 966, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: -4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'scared']]);
  const hero0 = <Hero look={LOOKS.hero} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 954], [len, 954]]);
  const camY = kf(t, [[0, 672], [len, 672]]);
  const zoom = kf(t, [[0, 1.6], [len, 1.68]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 2815} id="s76" veil={0.44} day={7} />
        <Prop kind="sound_waves" x={1300} y={476.6} s={1} t={t} extra={{}} />
        {hero0}
      </g>
      <DayChip t={t} day="DAY 7" />
      <text x={960} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#F6EFE3">EVERYTHING ELSE TOO</text>
    </g>
  );
};

// ---------- S77: medium, cell — Problem Three: The Silence Gets Loud (DAY 7) ----------
export const S77: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 960, y: 736, scale: 1, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 22, p: { x: 966, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 49, p: { x: 954, y: 732, scale: 1, tilt: 0, headTilt: 7, look: 0, armL: { a: 4, b: 8 }, armR: { a: 140, b: 20 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 70, p: { x: 966, y: 736, scale: 1, tilt: 0, headTilt: -8, look: 12, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 97, p: { x: 954, y: 732, scale: 1, tilt: 0, headTilt: 7, look: 12, armL: { a: 4, b: 8 }, armR: { a: 140, b: 20 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'worried']]);
  const hero0 = <Hero look={LOOKS.hero} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 966], [len, 966]]);
  const camY = kf(t, [[0, 676], [len, 676]]);
  const zoom = kf(t, [[0, 1.8], [len, 1.9]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 2852} id="s77" veil={0.44} day={7} />
        <Prop kind="whisper_walls" x={960} y={517.8} s={1} t={t} extra={{}} />
        {hero0}
      </g>
      <DayChip t={t} day="DAY 7" />
    </g>
  );
};

// ---------- S78: macro insert, cell (wall) — Problem Three: The Silence Gets Loud (DAY 7) ----------
export const S78: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 620, y: 736, scale: 1, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 41, p: { x: 626, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 10, armL: { a: 4, b: 8 }, armR: { a: 90, b: 60 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 83, p: { x: 614, y: 732, scale: 1, tilt: 0, headTilt: 6, look: -10, armL: { a: 4, b: 8 }, armR: { a: 120, b: 25 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 124, p: { x: 626, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 10, armL: { a: 4, b: 8 }, armR: { a: 90, b: 60 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'scared']]);
  const hero0 = <Hero look={LOOKS.hero} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 961], [len, 961]]);
  const camY = kf(t, [[0, 525.5], [len, 525.5]]);
  const zoom = kf(t, [[0, 1.935483870967742], [len, 2.035483870967742]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 2889} id="s78" veil={0.44} day={7} />
        <Prop kind="radio_dial" x={1290.6} y={480} s={0.9} t={t} extra={{"label": "PROBLEM 4"}} />
        {hero0}
      </g>
      <DayChip t={t} day="DAY 7" />
    </g>
  );
};

// ---------- S79: close-up, cell (wall) — Problem Four: The Voices Move In (DAY 14) ----------
export const S79: React.FC<ShotProps> = ({ t, len }) => {
  const camX = kf(t, [[0, 960], [len, 960]]);
  const camY = kf(t, [[0, 520], [len, 520]]);
  const zoom = kf(t, [[0, 3.2], [len, 3.3000000000000003]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 2926} id="s79" veil={0.44} day={14} />
        {/* Nov 14 (Javion: "fix everything wrong" — same as S57: a disembodied body part floating in the beam reads as a glitch, not a diagram. Mouth + sound waves REMOVED. The empty cell + TitleCard carry the beat. The same floating mouth in S149 is removed too. */}
        <TitleCard t={t} lines={['PROBLEM FOUR', 'THE VOICES MOVE IN']} y={400} size={40} /> {/* Nov 14 — same invisible-title-card fix as S18 (default y=175 is above the frame at this zoom). */}
      </g>
      <DayChip t={t} day="DAY 14" />
    </g>
  );
};

// ---------- S80: medium, cell — Problem Four: The Voices Move In (DAY 14) ----------
export const S80: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    // v34 (full-board review): he stood at x=620, directly in front of the bed — his feet landed on the bed's front face and he read as standing ON the bed, floating above the floor. Moved right to x=900, clear of the bed's right edge (world ~865), same as the S134 hero move (v21). Camera follows him. Look also clamped ±2 (was ±10 — same floating-eyes bug as S50/S83/S86).
    { f: 0, p: { x: 900, y: 736, scale: 1, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 38, p: { x: 906, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 2, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 76, p: { x: 894, y: 732, scale: 1, tilt: 0, headTilt: 5, look: -2, armL: { a: 4, b: 8 }, armR: { a: -4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 115, p: { x: 906, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 2, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'smug']]);
  const hero0 = <Hero look={LOOKS.detective} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 900], [len, 900]]);
  const camY = kf(t, [[0, 676], [len, 676]]);
  const zoom = kf(t, [[0, 1.8], [len, 1.9]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 2963} id="s80" veil={0.44} day={14} />
        <Prop kind="sign" x={998.3} y={440.2} s={0.9} t={t} extra={{"text": "TWIST"}} />
        {hero0}
      </g>
      <DayChip t={t} day="DAY 14" />
    </g>
  );
};

// ---------- S81: close-up, cell (wall) — Problem Four: The Voices Move In (DAY 14) ----------
export const S81: React.FC<ShotProps> = ({ t, len }) => {
  const camX = kf(t, [[0, 960], [len, 960]]);
  const camY = kf(t, [[0, 500], [len, 500]]);
  const zoom = kf(t, [[0, 3.2], [len, 3.3000000000000003]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 3000} id="s81" veil={0.44} day={14} />
        <Prop kind="brain" x={983} y={500} s={1.2} t={t} extra={{"variant": "crown", "bpm": 50}} />
      </g>
      <DayChip t={t} day="DAY 14" />
      <text x={960} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#F6EFE3"><tspan x={960} dy={0}>YOUR BRAIN IS</tspan><tspan x={960} dy={58}>THE DANGER</tspan></text>
    </g>
  );
};

// ---------- S82: medium, cell (prison) — Problem Four: The Voices Move In (DAY 14) ----------
export const S82: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 330, y: 818, scale: 0.5, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 31, p: { x: 336, y: 818, scale: 0.5, tilt: 0, headTilt: 5, look: 10, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 62, p: { x: 324, y: 814, scale: 0.5, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: -4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 87, p: { x: 336, y: 818, scale: 0.5, tilt: 0, headTilt: 5, look: 8, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 109, p: { x: 324, y: 814, scale: 0.5, tilt: 0, headTilt: 5, look: -6, armL: { a: 4, b: 8 }, armR: { a: -4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 125, p: { x: 336, y: 818, scale: 0.5, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral']]);
  const hero0 = <Hero look={LOOKS.prisoner} pose={{ ...p0, y: p0.y - 72 * p0.scale, scale: p0.scale * 1.4, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />; {/* v38 (Javion: "they are tiny and also phasing through the bed"): S82 group hero, scale ~0.5 → ×1.4; y −72·scale keeps the feet on the floor. */}
  const p1 = poseAt(t, [
    { f: 0, p: { x: 645, y: 818, scale: 0.49, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 30, b: 15 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 31, p: { x: 651, y: 818, scale: 0.49, tilt: 0, headTilt: 10, look: 10, armL: { a: 4, b: 8 }, armR: { a: 30, b: 15 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 62, p: { x: 639, y: 814, scale: 0.49, tilt: 0, headTilt: 10, look: 0, armL: { a: 4, b: 8 }, armR: { a: 30, b: 15 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 94, p: { x: 651, y: 818, scale: 0.49, tilt: 0, headTilt: 10, look: 10, armL: { a: 4, b: 8 }, armR: { a: 30, b: 15 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 125, p: { x: 639, y: 814, scale: 0.49, tilt: 0, headTilt: 10, look: -8, armL: { a: 4, b: 8 }, armR: { a: 30, b: 15 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f1 = faceAt(t, [[0, 'neutral']]);
  const hero1 = <Hero look={{...LOOKS.prisoner, hair: 'crop', hairC: '#3A2420', jacket: '#7A8A9A', jacketShade: '#5E6E7C', accent: '#5E6E7C'}} pose={{ ...p1, y: p1.y - 72 * p1.scale, scale: p1.scale * 1.4, ...f1, facing: 1 }} rimId="rimBlue" shadow={1} />; {/* v38: group ×1.4, feet stay on floor. */}
  const p2 = poseAt(t, [
    { f: 0, p: { x: 960, y: 818, scale: 0.51, tilt: 0, headTilt: -5, look: 0, armL: { a: 30, b: 15 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 31, p: { x: 966, y: 818, scale: 0.51, tilt: 0, headTilt: 0, look: 10, armL: { a: 30, b: 15 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 62, p: { x: 954, y: 814, scale: 0.51, tilt: 0, headTilt: 0, look: 0, armL: { a: 30, b: 15 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 87, p: { x: 966, y: 818, scale: 0.51, tilt: 0, headTilt: 0, look: 8, armL: { a: 30, b: 15 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 109, p: { x: 954, y: 814, scale: 0.51, tilt: 0, headTilt: 0, look: -6, armL: { a: 30, b: 15 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 125, p: { x: 966, y: 818, scale: 0.51, tilt: 0, headTilt: 0, look: 0, armL: { a: 30, b: 15 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f2 = faceAt(t, [[0, 'neutral']]);
  const hero2 = <Hero look={{...LOOKS.prisoner, hair: 'curly', hairC: '#2A1E14', jacket: '#B09A6A', jacketShade: '#8C7A54', accent: '#8C7A54'}} pose={{ ...p2, y: p2.y - 72 * p2.scale, scale: p2.scale * 1.4, ...f2, facing: 1 }} rimId="rimBlue" shadow={1} />; {/* v38: group ×1.4, feet stay on floor. */}
  const p3 = poseAt(t, [
    { f: 0, p: { x: 1275, y: 818, scale: 0.495, tilt: 0, headTilt: 8, look: 0, armL: { a: 4, b: 8 }, armR: { a: 20, b: 10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 31, p: { x: 1281, y: 818, scale: 0.495, tilt: 0, headTilt: 12, look: 10, armL: { a: 4, b: 8 }, armR: { a: 20, b: 10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 62, p: { x: 1269, y: 814, scale: 0.495, tilt: 0, headTilt: 12, look: 0, armL: { a: 4, b: 8 }, armR: { a: 20, b: 10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 94, p: { x: 1281, y: 818, scale: 0.495, tilt: 0, headTilt: 12, look: 10, armL: { a: 4, b: 8 }, armR: { a: 20, b: 10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 125, p: { x: 1269, y: 814, scale: 0.495, tilt: 0, headTilt: 12, look: -8, armL: { a: 4, b: 8 }, armR: { a: 20, b: 10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f3 = faceAt(t, [[0, 'neutral']]);
  const hero3 = <Hero look={{...LOOKS.prisoner, hair: 'sidepart', hairC: '#5A3A28', jacket: '#6A6A6A', jacketShade: '#545454', accent: '#545454'}} pose={{ ...p3, y: p3.y - 72 * p3.scale, scale: p3.scale * 1.4, ...f3, facing: 1 }} rimId="rimBlue" shadow={1} />; {/* v38: group ×1.4, feet stay on floor. */}
  const p4 = poseAt(t, [
    { f: 0, p: { x: 1590, y: 818, scale: 0.505, tilt: 0, headTilt: -8, look: 0, armL: { a: 20, b: 10 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 31, p: { x: 1596, y: 818, scale: 0.505, tilt: 0, headTilt: -3, look: 10, armL: { a: 20, b: 10 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 62, p: { x: 1584, y: 814, scale: 0.505, tilt: 0, headTilt: -3, look: 0, armL: { a: 20, b: 10 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 87, p: { x: 1596, y: 818, scale: 0.505, tilt: 0, headTilt: -3, look: 8, armL: { a: 20, b: 10 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 109, p: { x: 1584, y: 814, scale: 0.505, tilt: 0, headTilt: -3, look: -6, armL: { a: 20, b: 10 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 125, p: { x: 1596, y: 818, scale: 0.505, tilt: 0, headTilt: -3, look: 0, armL: { a: 20, b: 10 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f4 = faceAt(t, [[0, 'neutral']]);
  const hero4 = <Hero look={{...LOOKS.prisoner, hair: 'bun', hairC: '#4A3226', jacket: '#8AA0B0', jacketShade: '#6E8090', accent: '#6E8090'}} pose={{ ...p4, y: p4.y - 72 * p4.scale, scale: p4.scale * 1.4, ...f4, facing: 1 }} rimId="rimBlue" shadow={1} />; {/* v38: group ×1.4, feet stay on floor. */}
  const p5 = poseAt(t, [
    { f: 0, p: { x: 1760, y: 800, scale: 0.7, tilt: 0, headTilt: 8, look: 0, armL: { a: 15, b: 8 }, armR: { a: 25, b: 12 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 31, p: { x: 1766, y: 800, scale: 0.7, tilt: 0, headTilt: 5, look: 0, armL: { a: 15, b: 8 }, armR: { a: 25, b: 12 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 62, p: { x: 1754, y: 796, scale: 0.7, tilt: 0, headTilt: 5, look: 0, armL: { a: 15, b: 8 }, armR: { a: 17, b: 12 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 90, p: { x: 1766, y: 800, scale: 0.7, tilt: 0, headTilt: 5, look: 10, armL: { a: 15, b: 8 }, armR: { a: 25, b: 12 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 125, p: { x: 1754, y: 796, scale: 0.7, tilt: 0, headTilt: 5, look: 10, armL: { a: 15, b: 8 }, armR: { a: 17, b: 12 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f5 = faceAt(t, [[0, 'neutral']]);
  const hero5 = <Hero look={LOOKS.scientist} pose={{ ...p5, ...f5, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 324], [len, 324]]);
  const camY = kf(t, [[0, 754], [len, 754]]);
  const zoom = kf(t, [[0, 1.8], [len, 1.9]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 3037} id="s82" veil={0.44} prison day={14} mattress={false} /> {/* v38 (Javion: "they are tiny and also phasing through the bed"): both figures stood at x=330 and x=645, inside the floor mattress's footprint — the mattress top cut them at the waist and they read as standing IN the bed. Same fix as S62/S121/S122: hide the mattress for a lineup shot. */}
        {hero0}
        {hero1}
        {hero2}
        {hero3}
        {hero4}
        {hero5}
      </g>
      <DayChip t={t} day="DAY 14" />
      {/* v34: was "1983 · 15 PRISONERS" — the script fact is 15 prisoners, but only 6 are drawn (2 visible in this framing). The voiceover still states the real number; the caption now names the study instead of claiming a count the frame can't show. */}
      <text x={960} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#F6EFE3">GRASSIAN, 1983</text>
    </g>
  );
};

// ---------- S83: close-up, cell (prison) — Problem Four: The Voices Move In (DAY 14) ----------
export const S83: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    // v34 (full-board review): look was ±15 / -12 / 10 — Face ex = look*7, so the eyes slid up to 105px off the face and floated beside the head like white ears, leaving the face eyeless. Same bug class as S50/S51 (v21). Clamped to ±2.
    { f: 0, p: { x: 960, y: 756, scale: 1, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 27, p: { x: 966, y: 756, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 90, b: 60 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 61, p: { x: 954, y: 752, scale: 1, tilt: 0, headTilt: 6, look: -2, armL: { a: 4, b: 8 }, armR: { a: 120, b: 25 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 82, p: { x: 966, y: 756, scale: 1, tilt: 0, headTilt: 5, look: 2, armL: { a: 4, b: 8 }, armR: { a: 90, b: 60 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 104, p: { x: 954, y: 752, scale: 1, tilt: 0, headTilt: 6, look: -2, armL: { a: 4, b: 8 }, armR: { a: 120, b: 25 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 122, p: { x: 966, y: 756, scale: 1, tilt: 0, headTilt: 5, look: 2, armL: { a: 4, b: 8 }, armR: { a: 90, b: 60 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'worried']]);
  const hero0 = <Hero look={LOOKS.prisoner} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 954], [len, 954]]);
  const camY = kf(t, [[0, 576], [len, 576]]);
  const zoom = kf(t, [[0, 3.2], [len, 3.35]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 3074} id="s83" veil={0.44} prison day={14} />
        <Prop kind="sound_waves" x={1084.6} y={540.8} s={1} t={t} extra={{}} />
        {hero0}
      </g>
      <DayChip t={t} day="DAY 14" />
      <text x={350} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#A9C6FF">HYPERSENSITIVE</text>
    </g>
  );
};

// ---------- S84: medium, cell (prison) — Problem Four: The Voices Move In (DAY 14) ----------
export const S84: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 960, y: 756, scale: 1, tilt: 0, headTilt: 0, look: -15, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 23, p: { x: 966, y: 756, scale: 1, tilt: 0, headTilt: 5, look: 15, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 47, p: { x: 954, y: 752, scale: 1, tilt: 0, headTilt: 5, look: -12, armL: { a: 4, b: 8 }, armR: { a: -4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 67, p: { x: 966, y: 756, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 97, p: { x: 954, y: 752, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: -4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 134, p: { x: 966, y: 756, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'scared']]);
  const hero0 = <Hero look={LOOKS.prisoner} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 966], [len, 966]]);
  const camY = kf(t, [[0, 696], [len, 696]]);
  const zoom = kf(t, [[0, 1.8], [len, 1.9]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 3111} id="s84" veil={0.44} prison day={14} />
        <Prop kind="dots" x={960} y={526.8} s={0.9} t={t} extra={{}} />
        {hero0}
      </g>
      <DayChip t={t} day="DAY 14" />
      <text x={960} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#A9C6FF">ABOUT HALF</text>
    </g>
  );
};

// ---------- S85: wide, cell (prison) — Problem Four: The Voices Move In (DAY 14) ----------
export const S85: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 960, y: 736, scale: 1, tilt: 0, headTilt: 8, look: 0, armL: { a: 40, b: 80 }, armR: { a: 40, b: 80 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 24, p: { x: 960, y: 736, scale: 1, tilt: 0, headTilt: 10, look: 0, armL: { a: 40, b: 80 }, armR: { a: 40, b: 80 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 49, p: { x: 960, y: 736, scale: 1, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 71, p: { x: 960, y: 736, scale: 1, tilt: 0, headTilt: 7, look: 12, armL: { a: 4, b: 8 }, armR: { a: 140, b: 20 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 98, p: { x: 960, y: 736, scale: 1, tilt: 0, headTilt: 7, look: 12, armL: { a: 4, b: 8 }, armR: { a: 140, b: 20 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'stressed']]);
  const hero0 = <Hero look={LOOKS.hero} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 960], [len, 960]]);
  const camY = kf(t, [[0, 560], [len, 560]]);
  const zoom = kf(t, [[0, 1.0], [len, 1.06]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 3148} id="s85" veil={0.28} prison day={14} />
        <Prop kind="book" x={1300} y={480} s={1} t={t} extra={{}} />
        {hero0}
      </g>
      <DayChip t={t} day="DAY 14" />
      <text x={960} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#F6EFE3">CAN'T CONCENTRATE</text>
    </g>
  );
};

// ---------- S86: two-shot, cell (prison) — Problem Four: The Voices Move In (DAY 14) ----------
export const S86: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    // v34 (full-board review): look was ±15 / -12 / 10 — same floating-eyes bug as S83 (Face ex = look*7). Clamped to ±2.
    { f: 0, p: { x: 960, y: 756, scale: 1, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 29, p: { x: 966, y: 756, scale: 1, tilt: 0, headTilt: 5, look: 2, armL: { a: 4, b: 8 }, armR: { a: 90, b: 60 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 64, p: { x: 954, y: 752, scale: 1, tilt: 0, headTilt: 6, look: -2, armL: { a: 4, b: 8 }, armR: { a: 120, b: 25 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 87, p: { x: 966, y: 756, scale: 1, tilt: 0, headTilt: 5, look: 2, armL: { a: 4, b: 8 }, armR: { a: 90, b: 60 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 109, p: { x: 954, y: 752, scale: 1, tilt: 0, headTilt: 6, look: -2, armL: { a: 4, b: 8 }, armR: { a: 120, b: 25 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 129, p: { x: 966, y: 756, scale: 1, tilt: 0, headTilt: 5, look: 2, armL: { a: 4, b: 8 }, armR: { a: 90, b: 60 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'scared']]);
  const hero0 = <Hero look={LOOKS.prisoner} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 954], [len, 954]]);
  const camY = kf(t, [[0, 580], [len, 580]]);
  const zoom = kf(t, [[0, 1.35], [len, 1.4]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 3185} id="s86" veil={0.44} prison day={14} />
        {hero0}
      </g>
      <DayChip t={t} day="DAY 14" />
      <text x={960} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#A9C6FF">PARANOID</text>
    </g>
  );
};

// ---------- S87: medium, cell (prison) — Problem Four: The Voices Move In (DAY 14) ----------
export const S87: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 330, y: 806, scale: 0.6, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 28, p: { x: 336, y: 806, scale: 0.6, tilt: 0, headTilt: 5, look: 10, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 55, p: { x: 324, y: 802, scale: 0.6, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: -4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 83, p: { x: 336, y: 806, scale: 0.6, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 110, p: { x: 324, y: 802, scale: 0.6, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: -4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'scared']]);
  const hero0 = <Hero look={LOOKS.prisoner} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const p1 = poseAt(t, [
    { f: 0, p: { x: 960, y: 806, scale: 0.588, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 28, p: { x: 966, y: 806, scale: 0.588, tilt: 0, headTilt: 10, look: 10, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 55, p: { x: 954, y: 802, scale: 0.588, tilt: 0, headTilt: 10, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 83, p: { x: 966, y: 806, scale: 0.588, tilt: 0, headTilt: 10, look: 10, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 110, p: { x: 954, y: 802, scale: 0.588, tilt: 0, headTilt: 10, look: -8, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f1 = faceAt(t, [[0, 'scared']]);
  const hero1 = <Hero look={{...LOOKS.prisoner, hair: 'crop', hairC: '#3A2420', jacket: '#7A8A9A', jacketShade: '#5E6E7C', accent: '#5E6E7C'}} pose={{ ...p1, ...f1, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const p2 = poseAt(t, [
    { f: 0, p: { x: 1590, y: 806, scale: 0.612, tilt: 0, headTilt: -5, look: 0, armL: { a: 30, b: 15 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 28, p: { x: 1596, y: 806, scale: 0.612, tilt: 0, headTilt: 0, look: 10, armL: { a: 30, b: 15 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 55, p: { x: 1584, y: 802, scale: 0.612, tilt: 0, headTilt: 0, look: 0, armL: { a: 30, b: 15 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 83, p: { x: 1596, y: 806, scale: 0.612, tilt: 0, headTilt: 0, look: 0, armL: { a: 30, b: 15 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 110, p: { x: 1584, y: 802, scale: 0.612, tilt: 0, headTilt: 0, look: 0, armL: { a: 30, b: 15 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f2 = faceAt(t, [[0, 'scared']]);
  const hero2 = <Hero look={{...LOOKS.prisoner, hair: 'curly', hairC: '#2A1E14', jacket: '#B09A6A', jacketShade: '#8C7A54', accent: '#8C7A54'}} pose={{ ...p2, ...f2, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 324], [len, 324]]);
  const camY = kf(t, [[0, 742], [len, 742]]);
  const zoom = kf(t, [[0, 1.8], [len, 1.9]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 3222} id="s87" veil={0.44} prison day={14} />
        {hero0}
        {hero1}
        {hero2}
      </g>
      <DayChip t={t} day="DAY 14" />
      <text x={960} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#A9C6FF">3 OF 15</text>
    </g>
  );
};

// ---------- S88: macro insert, cell — Problem Four: The Voices Move In (DAY 14) ----------
export const S88: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 960, y: 736, scale: 1, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 33, p: { x: 966, y: 736, scale: 1, tilt: -8, headTilt: -6, look: 10, armL: { a: 35, b: 45 }, armR: { a: 35, b: 45 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 66, p: { x: 954, y: 732, scale: 1, tilt: -4, headTilt: 8, look: -10, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 99, p: { x: 966, y: 736, scale: 1, tilt: -8, headTilt: -6, look: 0, armL: { a: 35, b: 45 }, armR: { a: 35, b: 45 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'sad']]);
  const hero0 = <Hero look={LOOKS.hero} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 1143], [len, 1143]]);
  const camY = kf(t, [[0, 520], [len, 520]]);
  const zoom = kf(t, [[0, 2.4], [len, 2.5]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 3259} id="s88" veil={0.44} day={14} />
        <Prop kind="brain" x={1300} y={480} s={1} t={t} extra={{"variant": "plain"}} />
        {hero0}
      </g>
      <DayChip t={t} day="DAY 14" />
      <text x={960} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#F6EFE3">THE SCARY PART</text>
    </g>
  );
};

// ---------- S89: high angle, cell — Problem Four: The Voices Move In (DAY 14) ----------
export const S89: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 960, y: 756, scale: 1, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 22, p: { x: 966, y: 756, scale: 1, tilt: 0, headTilt: 7, look: 0, armL: { a: 4, b: 8 }, armR: { a: 140, b: 20 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 49, p: { x: 954, y: 752, scale: 1, tilt: 0, headTilt: -8, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 74, p: { x: 966, y: 756, scale: 1, tilt: 0, headTilt: 7, look: 0, armL: { a: 4, b: 8 }, armR: { a: 140, b: 20 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 98, p: { x: 954, y: 752, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'sad']]);
  const hero0 = <Hero look={LOOKS.prisoner} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 960], [len, 960]]);
  const camY = kf(t, [[0, 560], [len, 560]]);
  const zoom = kf(t, [[0, 1.25], [len, 1.3]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 3296} id="s89" veil={0.44} day={14} />
        {hero0}
      </g>
      <DayChip t={t} day="DAY 14" />
      <text x={960} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#A9C6FF">CRAVING TO FEARING</text>
    </g>
  );
};

// ---------- S90: macro insert, cell (wall) — Problem Four: The Voices Move In (DAY 14) ----------
export const S90: React.FC<ShotProps> = ({ t, len }) => {
  const camX = kf(t, [[0, 960], [len, 960]]);
  const camY = kf(t, [[0, 500], [len, 500]]);
  const zoom = kf(t, [[0, 2.4], [len, 2.5]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 3333} id="s90" veil={0.44} day={14} />
        {/* v38 (Javion: "is that brick suppose to show up like that??"): brick_wall REMOVED — a 220×140 brick rectangle floating on the wall read as a brick poster pasted on, not a wall. It was the only use of the prop in the file (not a motif). The "THE NEW NORMAL" caption carries the beat on its own. */}
      </g>
      <DayChip t={t} day="DAY 14" />
      <text x={960} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#F6EFE3">THE NEW NORMAL</text>
    </g>
  );
};

// ---------- S91: close-up, cell (door) — Problem Four: The Voices Move In (DAY 14) ----------
export const S91: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 620, y: 736, scale: 1, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 28, p: { x: 626, y: 736, scale: 1, tilt: -3, headTilt: -10, look: 12, armL: { a: 50, b: 70 }, armR: { a: 50, b: 70 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 63, p: { x: 614, y: 732, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 91, p: { x: 626, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 90, b: 60 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 125, p: { x: 614, y: 732, scale: 1, tilt: 0, headTilt: 6, look: 0, armL: { a: 4, b: 8 }, armR: { a: 120, b: 25 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'puzzled']]);
  const hero0 = <Hero look={LOOKS.hero} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 626], [len, 626]]);
  const camY = kf(t, [[0, 560], [len, 560]]);
  const zoom = kf(t, [[0, 3.2], [len, 3.35]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 3370} id="s91" veil={0.44} door day={14} />
        {/* v38 (Javion: "literally 2 doors also blocking the wall with the days on it"): door_row REMOVED — the Cell already has its own door (door prop), so the extra door_row put a second double-door cabinet on the wall right over the day tallies. One door is enough. */}
        {hero0}
      </g>
      <DayChip t={t} day="DAY 14" />
      <text x={350} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={44} fill="#A9C6FF">WHICH DAY WOULD BREAK YOU?</text>
    </g>
  );
};

// ---------- S92: low angle, cell — Problem Four: The Voices Move In (DAY 14) ----------
export const S92: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 960, y: 736, scale: 1, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 23, p: { x: 966, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 52, p: { x: 954, y: 732, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 90, b: 60 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 77, p: { x: 966, y: 736, scale: 1, tilt: 0, headTilt: 6, look: 0, armL: { a: 4, b: 8 }, armR: { a: 120, b: 25 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 103, p: { x: 954, y: 732, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 90, b: 60 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'worried']]);
  const hero0 = <Hero look={LOOKS.hero} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 966], [len, 966]]);
  const camY = kf(t, [[0, 676], [len, 676]]);
  const zoom = kf(t, [[0, 1.6], [len, 1.68]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 3407} id="s92" veil={0.44} day={14} />
        <Prop kind="number_card" x={1300} y={480.6} s={1} t={t} extra={{"text": "14"}} />
        {hero0}
      </g>
      <DayChip t={t} day="DAY 14" />
      <text x={960} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#F6EFE3">HOLD THAT NUMBER</text>
    </g>
  );
};

// ---------- S93: close-up, cell (wall) — Problem Four: The Voices Move In (DAY 14) ----------
export const S93: React.FC<ShotProps> = ({ t, len }) => {
  const camX = kf(t, [[0, 960], [len, 960]]);
  const camY = kf(t, [[0, 500], [len, 500]]);
  const zoom = kf(t, [[0, 3.2], [len, 3.3000000000000003]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 3444} id="s93" veil={0.44} day={14} />
        <Prop kind="icons_row" x={960} y={500} s={1} t={t} extra={{"kinds": ["clock", "bed", "voice"], "drift_x": 30}} />
      </g>
      <DayChip t={t} day="DAY 14" />
      <text x={960} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#A9C6FF">JUST THE WARM-UP</text>
    </g>
  );
};

// ---------- S94: wide, cell — Problem Four: The Voices Move In (DAY 14) ----------
export const S94: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 960, y: 736, scale: 1, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 38, p: { x: 966, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 10, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 75, p: { x: 954, y: 732, scale: 1, tilt: 0, headTilt: 5, look: -10, armL: { a: 4, b: 8 }, armR: { a: -4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 112, p: { x: 966, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'worried']]);
  const hero0 = <Hero look={LOOKS.hero} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 960], [len, 960]]);
  const camY = kf(t, [[0, 560], [len, 560]]);
  const zoom = kf(t, [[0, 1.0], [len, 1.06]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 3481} id="s94" veil={0.28} day={14} />
        <Prop kind="brain" x={1300} y={480} s={1} t={t} extra={{"variant": "crack"}} />
        {hero0}
      </g>
      <DayChip t={t} day="DAY 14" />
      <text x={960} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#F6EFE3">THE REAL DAMAGE IS QUIETER</text>
    </g>
  );
};

// ---------- S95: close-up, cell (wall) — Problem Five: Your Brain Shrinks (DAY 21) ----------
export const S95: React.FC<ShotProps> = ({ t, len }) => {
  const camX = kf(t, [[0, 960], [len, 960]]);
  const camY = kf(t, [[0, 520], [len, 520]]);
  const zoom = kf(t, [[0, 3.2], [len, 3.3000000000000003]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 3518} id="s95" veil={0.44} day={21} />
        <Prop kind="brain" x={960} y={520} s={1} t={t} extra={{"variant": "shrinking", "drift_x": 30}} />
        <TitleCard t={t} lines={['PROBLEM FIVE', 'YOUR BRAIN SHRINKS']} y={400} size={40} /> {/* Nov 14 — same invisible-title-card fix as S18 (default y=175 is above the frame at this zoom). */}
      </g>
      <DayChip t={t} day="DAY 21" />
    </g>
  );
};

// ---------- S96: medium, antarctic — Problem Five: Your Brain Shrinks (DAY 21) ----------
export const S96: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 330, y: 808, scale: 0.4, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 22, p: { x: 336, y: 808, scale: 0.4, tilt: -3, headTilt: -10, look: 10, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 43, p: { x: 324, y: 804, scale: 0.4, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 60, p: { x: 336, y: 808, scale: 0.4, tilt: -3, headTilt: -10, look: 8, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 76, p: { x: 324, y: 804, scale: 0.4, tilt: 0, headTilt: 5, look: -6, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 86, p: { x: 336, y: 808, scale: 0.4, tilt: -3, headTilt: -10, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'puzzled']]);
  const hero0 = <Hero look={LOOKS.researcher} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const p1 = poseAt(t, [
    { f: 0, p: { x: 487.5, y: 808, scale: 0.392, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 22, p: { x: 493.5, y: 808, scale: 0.392, tilt: -3, headTilt: -5, look: 10, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 43, p: { x: 481.5, y: 804, scale: 0.392, tilt: 0, headTilt: 10, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 65, p: { x: 493.5, y: 808, scale: 0.392, tilt: -3, headTilt: -5, look: 10, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 86, p: { x: 481.5, y: 804, scale: 0.392, tilt: 0, headTilt: 10, look: -8, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f1 = faceAt(t, [[0, 'puzzled']]);
  const hero1 = <Hero look={{...LOOKS.researcher, hair: 'crop', hairC: '#2A1E14', jacket: '#3E8C86', jacketShade: '#2F6E69', accent: '#2F6E69'}} pose={{ ...p1, ...f1, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const p2 = poseAt(t, [
    { f: 0, p: { x: 645, y: 808, scale: 0.408, tilt: 0, headTilt: -5, look: 0, armL: { a: 30, b: 15 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 22, p: { x: 651, y: 808, scale: 0.408, tilt: -3, headTilt: -12, look: 10, armL: { a: 30, b: 15 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 43, p: { x: 639, y: 804, scale: 0.408, tilt: 0, headTilt: 0, look: 0, armL: { a: 30, b: 15 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 60, p: { x: 651, y: 808, scale: 0.408, tilt: -3, headTilt: -12, look: 8, armL: { a: 30, b: 15 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 76, p: { x: 639, y: 804, scale: 0.408, tilt: 0, headTilt: 0, look: -6, armL: { a: 30, b: 15 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 86, p: { x: 651, y: 808, scale: 0.408, tilt: -3, headTilt: -12, look: 0, armL: { a: 30, b: 15 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f2 = faceAt(t, [[0, 'puzzled']]);
  const hero2 = <Hero look={{...LOOKS.researcher, hair: 'sidepart', hairC: '#5A3A28', jacket: '#D9A441', jacketShade: '#AD8334', accent: '#AD8334'}} pose={{ ...p2, ...f2, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const p3 = poseAt(t, [
    { f: 0, p: { x: 802.5, y: 808, scale: 0.396, tilt: 0, headTilt: 8, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 22, p: { x: 808.5, y: 808, scale: 0.396, tilt: -3, headTilt: -2, look: 10, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 43, p: { x: 796.5, y: 804, scale: 0.396, tilt: 0, headTilt: 12, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 65, p: { x: 808.5, y: 808, scale: 0.396, tilt: -3, headTilt: -2, look: 10, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 86, p: { x: 796.5, y: 804, scale: 0.396, tilt: 0, headTilt: 12, look: -8, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f3 = faceAt(t, [[0, 'puzzled']]);
  const hero3 = <Hero look={{...LOOKS.researcher, hair: 'afro', hairC: '#241A12', jacket: '#9B7BB8', jacketShade: '#7C6394', accent: '#7C6394'}} pose={{ ...p3, ...f3, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const p4 = poseAt(t, [
    { f: 0, p: { x: 960, y: 808, scale: 0.404, tilt: 0, headTilt: -8, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 22, p: { x: 966, y: 808, scale: 0.404, tilt: -3, headTilt: -12, look: 10, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 43, p: { x: 954, y: 804, scale: 0.404, tilt: 0, headTilt: -3, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 60, p: { x: 966, y: 808, scale: 0.404, tilt: -3, headTilt: -12, look: 8, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 76, p: { x: 954, y: 804, scale: 0.404, tilt: 0, headTilt: -3, look: -6, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 86, p: { x: 966, y: 808, scale: 0.404, tilt: -3, headTilt: -12, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f4 = faceAt(t, [[0, 'puzzled']]);
  const hero4 = <Hero look={{...LOOKS.researcher, hair: 'ponytail', hairC: '#6A4A2E', jacket: '#4A7AA0', jacketShade: '#3A5E80', accent: '#3A5E80'}} pose={{ ...p4, ...f4, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const p5 = poseAt(t, [
    { f: 0, p: { x: 1117.5, y: 808, scale: 0.392, tilt: 0, headTilt: 3, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 22, p: { x: 1123.5, y: 808, scale: 0.392, tilt: -3, headTilt: -7, look: 10, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 43, p: { x: 1111.5, y: 804, scale: 0.392, tilt: 0, headTilt: 8, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 65, p: { x: 1123.5, y: 808, scale: 0.392, tilt: -3, headTilt: -7, look: 10, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 86, p: { x: 1111.5, y: 804, scale: 0.392, tilt: 0, headTilt: 8, look: -8, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f5 = faceAt(t, [[0, 'puzzled']]);
  const hero5 = <Hero look={{...LOOKS.researcher, hair: 'curly', hairC: '#3A2420', jacket: '#6A9A5A', jacketShade: '#527A46', accent: '#527A46'}} pose={{ ...p5, ...f5, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const p6 = poseAt(t, [
    { f: 0, p: { x: 1275, y: 808, scale: 0.408, tilt: 0, headTilt: -3, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 22, p: { x: 1281, y: 808, scale: 0.408, tilt: -3, headTilt: -12, look: 10, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 43, p: { x: 1269, y: 804, scale: 0.408, tilt: 0, headTilt: 2, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 60, p: { x: 1281, y: 808, scale: 0.408, tilt: -3, headTilt: -12, look: 8, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 76, p: { x: 1269, y: 804, scale: 0.408, tilt: 0, headTilt: 2, look: -6, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 86, p: { x: 1281, y: 808, scale: 0.408, tilt: -3, headTilt: -12, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f6 = faceAt(t, [[0, 'puzzled']]);
  const hero6 = <Hero look={{...LOOKS.researcher, hair: 'bun', hairC: '#8A5A3A', jacket: '#D98A3A', jacketShade: '#AD6E2E', accent: '#AD6E2E'}} pose={{ ...p6, ...f6, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const p7 = poseAt(t, [
    { f: 0, p: { x: 1432.5, y: 808, scale: 0.396, tilt: 0, headTilt: 6, look: 0, armL: { a: 20, b: 10 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 22, p: { x: 1438.5, y: 808, scale: 0.396, tilt: -3, headTilt: -4, look: 10, armL: { a: 20, b: 10 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 43, p: { x: 1426.5, y: 804, scale: 0.396, tilt: 0, headTilt: 11, look: 0, armL: { a: 20, b: 10 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 65, p: { x: 1438.5, y: 808, scale: 0.396, tilt: -3, headTilt: -4, look: 10, armL: { a: 20, b: 10 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 86, p: { x: 1426.5, y: 804, scale: 0.396, tilt: 0, headTilt: 11, look: -8, armL: { a: 20, b: 10 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f7 = faceAt(t, [[0, 'puzzled']]);
  const hero7 = <Hero look={{...LOOKS.researcher, hair: 'crop', hairC: '#3A2A1A', jacket: '#3A4A6A', jacketShade: '#2E3A54', accent: '#2E3A54'}} pose={{ ...p7, ...f7, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const p8 = poseAt(t, [
    { f: 0, p: { x: 1590, y: 808, scale: 0.404, tilt: 0, headTilt: -6, look: 0, armL: { a: 4, b: 8 }, armR: { a: 30, b: 10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 22, p: { x: 1596, y: 808, scale: 0.404, tilt: -3, headTilt: -12, look: 10, armL: { a: 4, b: 8 }, armR: { a: 30, b: 10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 43, p: { x: 1584, y: 804, scale: 0.404, tilt: 0, headTilt: -1, look: 0, armL: { a: 4, b: 8 }, armR: { a: 30, b: 10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 60, p: { x: 1596, y: 808, scale: 0.404, tilt: -3, headTilt: -12, look: 8, armL: { a: 4, b: 8 }, armR: { a: 30, b: 10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 76, p: { x: 1584, y: 804, scale: 0.404, tilt: 0, headTilt: -1, look: -6, armL: { a: 4, b: 8 }, armR: { a: 30, b: 10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 86, p: { x: 1596, y: 808, scale: 0.404, tilt: -3, headTilt: -12, look: 0, armL: { a: 4, b: 8 }, armR: { a: 30, b: 10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f8 = faceAt(t, [[0, 'puzzled']]);
  const hero8 = <Hero look={{...LOOKS.researcher, hair: 'ponytail', hairC: '#2A1E14', jacket: '#8A8A4A', jacketShade: '#6E6E3A', accent: '#6E6E3A'}} pose={{ ...p8, ...f8, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 954], [len, 954]]);
  const camY = kf(t, [[0, 580], [len, 580]]);
  const zoom = kf(t, [[0, 1.35], [len, 1.4]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Antarctic t={t + 3555} id="s96" />
        <Prop kind="brain_scan" x={650} y={240} s={0.6} t={t} extra={{}} /> {/* v38 (Javion: "brain-scan position"): moved into clear orange sky, upper-left, away from the mountain face, the snow cap, the antenna and the station roof — it read as a brain in a doorway sitting ON the roof. v16 spot (1050, 450) sat on the mountain face just below the ridgeline. */}
        {hero0}
        {hero1}
        {hero2}
        {hero3}
        {hero4}
        {hero5}
        {hero6}
        {hero7}
        {hero8}
      </g>
      <DayChip t={t} day="DAY 21" />
    </g>
  );
};

// ---------- S97: wide, lab — Problem Five: Your Brain Shrinks (DAY 21) ----------
export const S97: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 500, y: 756, scale: 1, tilt: 0, headTilt: 8, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 25, p: { x: 506, y: 756, scale: 1, tilt: 0, headTilt: 7, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 50, p: { x: 494, y: 752, scale: 1, tilt: 0, headTilt: -8, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 72, p: { x: 506, y: 756, scale: 1, tilt: 0, headTilt: 7, look: 10, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 100, p: { x: 494, y: 752, scale: 1, tilt: 0, headTilt: -8, look: 10, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral']]);
  const hero0 = <Hero look={LOOKS.scientist} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const p1 = poseAt(t, [
    { f: 0, p: { x: 1420, y: 756, scale: 0.98, tilt: 0, headTilt: 12, look: 0, armL: { a: 4, b: 8 }, armR: { a: 30, b: 15 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 25, p: { x: 1426, y: 756, scale: 0.98, tilt: 0, headTilt: 12, look: 0, armL: { a: 4, b: 8 }, armR: { a: 30, b: 15 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 50, p: { x: 1414, y: 752, scale: 0.98, tilt: 0, headTilt: -3, look: 0, armL: { a: 4, b: 8 }, armR: { a: 30, b: 15 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 72, p: { x: 1426, y: 756, scale: 0.98, tilt: 0, headTilt: 12, look: 12, armL: { a: 4, b: 8 }, armR: { a: 30, b: 15 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 100, p: { x: 1414, y: 752, scale: 0.98, tilt: 0, headTilt: -3, look: 12, armL: { a: 4, b: 8 }, armR: { a: 30, b: 15 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f1 = faceAt(t, [[0, 'neutral']]);
  const hero1 = <Hero look={{...LOOKS.scientist, hair: 'afro', hairC: '#241A12', jacket: '#7FA8C8', jacketShade: '#5F88A8', accent: '#5F88A8'}} pose={{ ...p1, ...f1, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 960], [len, 960]]);
  const camY = kf(t, [[0, 560], [len, 560]]);
  const zoom = kf(t, [[0, 1.0], [len, 1.06]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Lab t={t + 3592} id="s97" />
        <Prop kind="brain_pair" x={960} y={500} s={1} t={t} extra={{}} />
        {hero0}
        {hero1}
      </g>
      <DayChip t={t} day="DAY 21" />
    </g>
  );
};

// ---------- S98: macro insert, cell (wall) — Problem Five: Your Brain Shrinks (DAY 21) ----------
export const S98: React.FC<ShotProps> = ({ t, len }) => {
  const camX = kf(t, [[0, 960], [len, 960]]);
  const camY = kf(t, [[0, 500], [len, 500]]);
  const zoom = kf(t, [[0, 2.4], [len, 2.5]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 3629} id="s98" veil={0.44} day={21} />
        <Prop kind="brain" x={960} y={500} s={1} t={t} extra={{"variant": "beating", "bpm": 50, "drift_x": 35}} />
      </g>
      <DayChip t={t} day="DAY 21" />
      <text x={960} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#A9C6FF">DENTATE GYRUS</text>
    </g>
  );
};

// ---------- S99: close-up, cell (wall) — Problem Five: Your Brain Shrinks (DAY 21) ----------
export const S99: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 560, y: 736, scale: 1, tilt: 0, headTilt: 0, look: 0, armL: { a: 20, b: 8 }, armR: { a: 20, b: 8 }, legL: { a: 12, b: -15 }, legR: { a: -8, b: -3 } } },
    { f: 15, p: { x: 600, y: 732, scale: 1, tilt: 6, headTilt: 7, look: 12, armL: { a: -20, b: 8 }, armR: { a: -20, b: 8 }, legL: { a: -8, b: -3 }, legR: { a: 12, b: -15 } } },
    { f: 29, p: { x: 640, y: 736, scale: 1, tilt: 6, headTilt: 7, look: 12, armL: { a: 20, b: 8 }, armR: { a: 20, b: 8 }, legL: { a: 12, b: -15 }, legR: { a: -8, b: -3 } } },
    { f: 44, p: { x: 680, y: 732, scale: 1, tilt: 6, headTilt: 0, look: 0, armL: { a: -20, b: 8 }, armR: { a: -20, b: 8 }, legL: { a: -8, b: -3 }, legR: { a: 12, b: -15 } } },
    { f: 66, p: { x: 680, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 88, p: { x: 680, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: -4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'sad']]);
  const hero0 = <Hero look={LOOKS.hero} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 680], [len, 680]]);
  const camY = kf(t, [[0, 556], [len, 556]]);
  const zoom = kf(t, [[0, 3.2], [len, 3.35]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 3666} id="s99" veil={0.44} day={21} />
        <Prop kind="maze" x={824.6} y={509.8} s={0.9} t={t} extra={{}} />
        {hero0}
      </g>
      <DayChip t={t} day="DAY 21" />
      <text x={350} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#F6EFE3">FINDING YOUR WAY</text>
    </g>
  );
};

// ---------- S100: medium, cell — Problem Five: Your Brain Shrinks (DAY 21) ----------
export const S100: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 900, y: 736, scale: 1, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 22, p: { x: 906, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 10, armL: { a: 4, b: 8 }, armR: { a: 90, b: 60 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 44, p: { x: 894, y: 732, scale: 1, tilt: 0, headTilt: 6, look: -10, armL: { a: 4, b: 8 }, armR: { a: 120, b: 25 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 66, p: { x: 906, y: 736, scale: 1, tilt: 0, headTilt: 5, look: -8, armL: { a: 4, b: 8 }, armR: { a: 90, b: 60 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'sad']]);
  const hero0 = <Hero look={LOOKS.hero} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 626], [len, 626]]);
  const camY = kf(t, [[0, 676], [len, 676]]);
  const zoom = kf(t, [[0, 1.8], [len, 1.9]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 3703} id="s100" veil={0.44} day={21} />
        <Prop kind="brain" x={720} y={506.8} s={0.9} t={t} extra={{"variant": "shrinking"}} /> {/* v38 (Javion: "a brain with pictures is behind his head floating for no reason"): was x=900 — right behind the hero's head. Now x=720, on the wall clear of him. */}
        <Prop kind="photos" x={840} y={495.8} s={0.8} t={t} extra={{}} /> {/* v38: was x=1003.3 — also behind his head. Now x=840, beside the brain (the shrunken brain + fading memories, together on the wall). */}
        {hero0}
      </g>
      <DayChip t={t} day="DAY 21" />
      <text x={960} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#A9C6FF">7% SMALLER</text>
    </g>
  );
};

// ---------- S101: close-up, cell (wall) — Problem Five: Your Brain Shrinks (DAY 21) ----------
export const S101: React.FC<ShotProps> = ({ t, len }) => {
  const camX = kf(t, [[0, 960], [len, 960]]);
  const camY = kf(t, [[0, 500], [len, 500]]);
  const zoom = kf(t, [[0, 3.2], [len, 3.3000000000000003]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 3740} id="s101" veil={0.44} day={21} />
        <Prop kind="bdnf" x={960} y={500} s={1} t={t} extra={{"drift_x": 35}} />
      </g>
      <DayChip t={t} day="DAY 21" />
      <text x={960} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#A9C6FF">DROPPED IN 3 MONTHS</text>
    </g>
  );
};

// ---------- S102: macro insert, cell (wall) — Problem Five: Your Brain Shrinks (DAY 21) ----------
export const S102: React.FC<ShotProps> = ({ t, len }) => {
  const camX = kf(t, [[0, 1016], [len, 1016]]);
  const camY = kf(t, [[0, 500], [len, 500]]);
  const zoom = kf(t, [[0, 2.0179372197309418], [len, 2.117937219730942]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 3777} id="s102" veil={0.44} day={21} />
        {/* v34: crossed was `true` (a boolean) — WallCalendar treats it as a number, so `true` coerced to 1 and only day 1 got an X on day 21. Now 21: days 1–21 crossed, matching S24 (crossed: 20 on day 20). */}
        <Prop kind="calendar" x={1170} y={520} s={0.42} t={t} extra={{"label": "3 MONTHS", "crossed": 21, "drift_x": 25}} />
        <Prop kind="graph" x={1316.3} y={500} s={0.8} t={t} extra={{"label": "STILL NOT BACK", "drift_x": 25}} />
      </g>
      <DayChip t={t} day="DAY 21" />
    </g>
  );
};

// ---------- S103: medium, cell — Problem Five: Your Brain Shrinks (DAY 21) ----------
export const S103: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 960, y: 736, scale: 1, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 24, p: { x: 966, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 10, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 48, p: { x: 954, y: 732, scale: 1, tilt: 0, headTilt: 5, look: -10, armL: { a: 4, b: 8 }, armR: { a: -4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 72, p: { x: 966, y: 736, scale: 1, tilt: 0, headTilt: 5, look: -8, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'sad']]);
  const hero0 = <Hero look={LOOKS.hero} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 966], [len, 966]]);
  const camY = kf(t, [[0, 676], [len, 676]]);
  const zoom = kf(t, [[0, 1.8], [len, 1.9]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 3814} id="s103" veil={0.44} day={21} />
        <Prop kind="calendar" x={1170} y={520} s={0.38} t={t} extra={{"label": "1.5 MONTHS"}} />
        {hero0}
      </g>
      <DayChip t={t} day="DAY 21" />
    </g>
  );
};

// ---------- S104: macro insert, cell — Problem Five: Your Brain Shrinks (DAY 21) ----------
export const S104: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 620, y: 736, scale: 1, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 35, p: { x: 626, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 10, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 70, p: { x: 614, y: 732, scale: 1, tilt: 0, headTilt: 5, look: -10, armL: { a: 4, b: 8 }, armR: { a: -4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 105, p: { x: 626, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'stressed']]);
  const hero0 = <Hero look={LOOKS.hero} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 961], [len, 961]]);
  const camY = kf(t, [[0, 525.5], [len, 525.5]]);
  const zoom = kf(t, [[0, 1.935483870967742], [len, 2.035483870967742]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 3851} id="s104" veil={0.44} day={21} />
        <Prop kind="test_paper" x={1290.6} y={480} s={0.9} t={t} extra={{}} />
        {hero0}
      </g>
      <DayChip t={t} day="DAY 21" />
      <text x={960} y={930} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#A9C6FF">WORST</text>
    </g>
  );
};

// ---------- S105: high angle, cell — Problem Five: Your Brain Shrinks (DAY 21) ----------
export const S105: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 960, y: 736, scale: 1, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 28, p: { x: 966, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 10, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 56, p: { x: 954, y: 732, scale: 1, tilt: 0, headTilt: 5, look: -10, armL: { a: 4, b: 8 }, armR: { a: -4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 83, p: { x: 966, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral']]);
  const hero0 = <Hero look={LOOKS.hero} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 960], [len, 960]]);
  const camY = kf(t, [[0, 560], [len, 560]]);
  const zoom = kf(t, [[0, 1.25], [len, 1.3]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 3888} id="s105" veil={0.44} day={21} />
        <Prop kind="test_paper" x={1300} y={480} s={0.9} t={t} extra={{}} />
        {hero0}
      </g>
      <DayChip t={t} day="DAY 21" />
    </g>
  );
};

// ---------- S106: macro insert, cell (wall) — Problem Five: Your Brain Shrinks (DAY 21) ----------
export const S106: React.FC<ShotProps> = ({ t, len }) => {
  const camX = kf(t, [[0, 960], [len, 960]]);
  const camY = kf(t, [[0, 500], [len, 500]]);
  const zoom = kf(t, [[0, 2.4], [len, 2.5]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 3925} id="s106" veil={0.44} day={21} />
        <Prop kind="globe" x={960} y={500} s={1} t={t} extra={{"drift_x": 35}} />
      </g>
      <DayChip t={t} day="DAY 21" />
      <text x={960} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#A9C6FF">70 STUDIES</text>
    </g>
  );
};

// ---------- S107: close-up, cell — Problem Five: Your Brain Shrinks (DAY 21) ----------
export const S107: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 620, y: 736, scale: 1, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 38, p: { x: 626, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 10, armL: { a: 4, b: 8 }, armR: { a: 90, b: 60 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 76, p: { x: 614, y: 732, scale: 1, tilt: 0, headTilt: 6, look: -10, armL: { a: 4, b: 8 }, armR: { a: 120, b: 25 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 114, p: { x: 626, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 10, armL: { a: 4, b: 8 }, armR: { a: 90, b: 60 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'worried']]);
  const hero0 = <Hero look={LOOKS.hero} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 626], [len, 626]]);
  const camY = kf(t, [[0, 560], [len, 560]]);
  const zoom = kf(t, [[0, 3.2], [len, 3.35]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 3962} id="s107" veil={0.44} day={21} />
        <Prop kind="paper_stacks" x={770.6} y={606.2} s={0.9} t={t} extra={{}} />
        {hero0}
      </g>
      <DayChip t={t} day="DAY 21" />
      <text x={350} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#A9C6FF">3.4 MILLION PEOPLE</text>
    </g>
  );
};

// ---------- S108: low angle, cell — Problem Five: Your Brain Shrinks (DAY 21) ----------
export const S108: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 620, y: 812, scale: 1, tilt: 16, headTilt: 10, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 40, p: { x: 620, y: 804, scale: 1, tilt: 0, headTilt: 5, look: 12, armL: { a: 4, b: 8 }, armR: { a: 90, b: 60 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 80, p: { x: 620, y: 816, scale: 1, tilt: 0, headTilt: 6, look: -6, armL: { a: 4, b: 8 }, armR: { a: 120, b: 25 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 119, p: { x: 620, y: 804, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 90, b: 60 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'sad']]);
  const hero0 = <Hero look={LOOKS.hero} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 620], [len, 620]]);
  const camY = kf(t, [[0, 744], [len, 744]]);
  const zoom = kf(t, [[0, 1.6], [len, 1.68]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 3999} id="s108" veil={0.44} day={21} />
        <Prop kind="heart" x={1035.4} y={548.6} s={1} t={t} extra={{"bpm": 72}} />
        <Prop kind="bench" x={1150} y={720} s={1} t={t} extra={{}} />
        {hero0}
      </g>
      <DayChip t={t} day="DAY 21" />
      <text x={960} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#A9C6FF">+26%</text>
    </g>
  );
};

// ---------- S109: medium, cell — Problem Five: Your Brain Shrinks (DAY 21) ----------
export const S109: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 960, y: 725, scale: 1, tilt: 10, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 17, p: { x: 966, y: 725, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 34, p: { x: 954, y: 725, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: -4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 51, p: { x: 966, y: 725, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 68, p: { x: 954, y: 725, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: -4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'sad']]);
  const hero0 = <Hero look={LOOKS.hero} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 954], [len, 954]]);
  const camY = kf(t, [[0, 665], [len, 665]]);
  const zoom = kf(t, [[0, 1.8], [len, 1.9]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 4036} id="s109" veil={0.44} day={21} />
        <Prop kind="house" x={1300} y={520} s={0.9} t={t} extra={{}} />
        {hero0}
      </g>
      <DayChip t={t} day="DAY 21" />
      <text x={960} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#A9C6FF">ISOLATION +29%</text>
    </g>
  );
};

// ---------- S110: wide, cell — Problem Five: Your Brain Shrinks (DAY 21) ----------
export const S110: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 960, y: 725, scale: 1, tilt: 10, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 11, p: { x: 966, y: 725, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 23, p: { x: 954, y: 725, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: -4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 34, p: { x: 966, y: 725, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 46, p: { x: 954, y: 725, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: -4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 56, p: { x: 966, y: 725, scale: 1, tilt: 0, headTilt: 5, look: 12, armL: { a: 4, b: 8 }, armR: { a: 90, b: 60 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 68, p: { x: 954, y: 725, scale: 1, tilt: 0, headTilt: 6, look: 12, armL: { a: 4, b: 8 }, armR: { a: 120, b: 25 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'sad']]);
  const hero0 = <Hero look={LOOKS.hero} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 960], [len, 960]]);
  const camY = kf(t, [[0, 560], [len, 560]]);
  const zoom = kf(t, [[0, 1.0], [len, 1.06]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 4073} id="s110" veil={0.28} day={21} />
        <Prop kind="house" x={1300} y={520} s={0.9} t={t} extra={{}} />
        {hero0}
      </g>
      <DayChip t={t} day="DAY 21" />
      <text x={960} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#A9C6FF">LIVING ALONE +32%</text>
    </g>
  );
};

// ---------- S111: close-up, cell (wall) — Problem Five: Your Brain Shrinks (DAY 21) ----------
export const S111: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 620, y: 736, scale: 1, tilt: -8, headTilt: -10, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 28, p: { x: 626, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 56, p: { x: 614, y: 732, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: -4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 80, p: { x: 626, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 12, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 111, p: { x: 614, y: 732, scale: 1, tilt: -3, headTilt: -10, look: 12, armL: { a: 50, b: 70 }, armR: { a: 50, b: 70 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'happy']]);
  const hero0 = <Hero look={LOOKS.hero} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 626], [len, 626]]);
  const camY = kf(t, [[0, 560], [len, 560]]);
  const zoom = kf(t, [[0, 3.2], [len, 3.35]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 4110} id="s111" veil={0.44} day={21} />
        {/* Nov 12 v21: the cigarette Prop is REMOVED — it was a leftover that floated
            beside the hero's head (v20 moved it to (643,564) "to the Detective's mouth",
            but there is no Detective in this shot; the hero is not a smoker and the
            cigarette read as a stray floating object). S111 is a hero close-up; no
            cigarette belongs here. */}
        {hero0}
      </g>
      <DayChip t={t} day="DAY 21" />
      <text x={350} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#A9C6FF">ABOUT THE SAME</text>
    </g>
  );
};

// ---------- S112: macro insert, cell (wall) — Problem Five: Your Brain Shrinks (DAY 21) ----------
export const S112: React.FC<ShotProps> = ({ t, len }) => {
  const camX = kf(t, [[0, 960], [len, 960]]);
  const camY = kf(t, [[0, 500], [len, 500]]);
  const zoom = kf(t, [[0, 2.4], [len, 2.5]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 4147} id="s112" veil={0.44} day={21} />
        <Prop kind="brain" x={960} y={500} s={1} t={t} extra={{"variant": "beating", "bpm": 50, "drift_x": 35}} />
      </g>
      <DayChip t={t} day="DAY 21" />
      <text x={960} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#A9C6FF">PLASTIC</text>
    </g>
  );
};

// ---------- S113: wide, cell — Problem Five: Your Brain Shrinks (DAY 21) ----------
export const S113: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 960, y: 736, scale: 1, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 34, p: { x: 966, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 10, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 68, p: { x: 954, y: 732, scale: 1, tilt: -3, headTilt: -10, look: -10, armL: { a: 50, b: 70 }, armR: { a: 50, b: 70 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 102, p: { x: 966, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'sad']]);
  const hero0 = <Hero look={LOOKS.hero} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 960], [len, 960]]);
  const camY = kf(t, [[0, 560], [len, 560]]);
  const zoom = kf(t, [[0, 1.0], [len, 1.06]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 4184} id="s113" veil={0.28} day={21} />
        <Prop kind="brain" x={1300} y={480} s={1} t={t} extra={{"variant": "plain"}} />
        {hero0}
      </g>
      <DayChip t={t} day="DAY 21" />
      <text x={960} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#F6EFE3">WHATEVER WORLD YOU GIVE IT</text>
    </g>
  );
};

// ---------- S114: macro insert, cell (wall) — Problem Five: Your Brain Shrinks (DAY 21) ----------
export const S114: React.FC<ShotProps> = ({ t, len }) => {
  const camX = kf(t, [[0, 1027.5], [len, 1027.5]]);
  const camY = kf(t, [[0, 484.5], [len, 484.5]]);
  const zoom = kf(t, [[0, 1.945945945945946], [len, 2.045945945945946]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 4221} id="s114" veil={0.44} day={21} />
        <Prop kind="brain" x={739.3} y={500} s={0.9} t={t} extra={{"drift_x": 30}} />
        <Prop kind="scissors" x={1315.7} y={480} s={1} t={t} extra={{"drift_x": 25}} />
      </g>
      <DayChip t={t} day="DAY 21" />
      <text x={960} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#A9C6FF">PRUNING</text>
    </g>
  );
};

// ---------- S115: close-up, cell — Problem Five: Your Brain Shrinks (DAY 21) ----------
export const S115: React.FC<ShotProps> = ({ t, len }) => {
  const camX = kf(t, [[0, 960], [len, 960]]);
  const camY = kf(t, [[0, 420], [len, 420]]);
  const zoom = kf(t, [[0, 3.2], [len, 3.3000000000000003]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 4258} id="s115" veil={0.44} day={21} />
        <Prop kind="picture_frames" x={1115} y={540} s={1} t={t} extra={{}} /> {/* Nov 15 (Javion: "It's actually drifting to the side") — the old drift_x: 35 was a sine sway (dX = 35*sin(t/45)) that slid the frames ~112px right across the shot; a picture hung on a wall must NOT move. Removed the drift, set the static x to 1115 (the position the drift was pushing toward; right frame's right edge 1215, inside the 1256 visible edge). Nov 14: frames moved right to x=1080, against the wall and out of the beam, so they read as hung pictures, not floating. */}
      </g>
      <DayChip t={t} day="DAY 21" />
    </g>
  );
};

// ---------- S116: macro insert, cell (wall) — Problem Five: Your Brain Shrinks (DAY 21) ----------
export const S116: React.FC<ShotProps> = ({ t, len }) => {
  const camX = kf(t, [[0, 960], [len, 960]]);
  const camY = kf(t, [[0, 500], [len, 500]]);
  const zoom = kf(t, [[0, 2.4], [len, 2.5]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 4295} id="s116" veil={0.44} day={21} />
        <Prop kind="memory_door" x={960} y={540} s={1} t={t} extra={{"drift_x": 30}} /> {/* v38 (Javion: "its glitching with the light over head"): was y=500 — the door's top edge sat right under the pendant lamp and the light cone washed over it. Now y=540, clear of the lamp, and the highlight line is gone from the def. */}
      </g>
      <DayChip t={t} day="DAY 21" />
      <text x={960} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#A9C6FF">USE IT OR LOSE IT</text>
    </g>
  );
};

// ---------- S117: wide, cell — Problem Five: Your Brain Shrinks (DAY 21) ----------
export const S117: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 900, y: 752, scale: 0.9, tilt: 6, headTilt: 0, look: 0, armL: { a: 20, b: 8 }, armR: { a: 20, b: 8 }, legL: { a: 12, b: -15 }, legR: { a: -8, b: -3 } } },
    { f: 17, p: { x: 940, y: 748, scale: 0.9, tilt: 6, headTilt: 0, look: 0, armL: { a: -20, b: 8 }, armR: { a: -20, b: 8 }, legL: { a: -8, b: -3 }, legR: { a: 12, b: -15 } } },
    { f: 34, p: { x: 980, y: 752, scale: 0.9, tilt: 6, headTilt: 0, look: 0, armL: { a: 20, b: 8 }, armR: { a: 20, b: 8 }, legL: { a: 12, b: -15 }, legR: { a: -8, b: -3 } } },
    { f: 51, p: { x: 1020, y: 748, scale: 0.9, tilt: 6, headTilt: 0, look: 0, armL: { a: -20, b: 8 }, armR: { a: -20, b: 8 }, legL: { a: -8, b: -3 }, legR: { a: 12, b: -15 } } },
    { f: 75, p: { x: 1020, y: 752, scale: 0.9, tilt: 0, headTilt: 5, look: -15, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 103, p: { x: 1020, y: 752, scale: 0.9, tilt: 0, headTilt: 5, look: -15, armL: { a: 4, b: 8 }, armR: { a: -4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'worried']]);
  const hero0 = <Hero look={LOOKS.hero} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 960], [len, 960]]);
  const camY = kf(t, [[0, 560], [len, 560]]);
  const zoom = kf(t, [[0, 1.0], [len, 1.06]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 4332} id="s117" veil={0.28} day={21} />
        {/* v38 (Javion: "are these suppose to float like this"): memory_door REMOVED from S117 — a small pink-outlined door floating on the wall of a wide shot, overlapping the vent. The door already gets its big moment in S116 ("USE IT OR LOSE IT"); the wide shot doesn't need a second floating one. */}
        {hero0}
      </g>
      <DayChip t={t} day="DAY 21" />
    </g>
  );
};

// ---------- S118: two-shot, cell — The Honest Part (DAY 25) ----------
export const S118: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 960, y: 736, scale: 1, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 17, p: { x: 966, y: 736, scale: 1, tilt: -8, headTilt: -6, look: 0, armL: { a: 50, b: 70 }, armR: { a: 50, b: 70 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 39, p: { x: 954, y: 732, scale: 1, tilt: -4, headTilt: 8, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 54, p: { x: 966, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 8, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 67, p: { x: 954, y: 732, scale: 1, tilt: 0, headTilt: 5, look: -6, armL: { a: 4, b: 8 }, armR: { a: -4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 77, p: { x: 966, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral']]);
  const hero0 = <Hero look={LOOKS.hero} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 966], [len, 966]]);
  const camY = kf(t, [[0, 580], [len, 580]]);
  const zoom = kf(t, [[0, 1.35], [len, 1.4]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 4369} id="s118" veil={0.44} day={25} />
        {hero0}
      </g>
      <DayChip t={t} day="DAY 25" />
      <text x={960} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#A9C6FF">BUT BEFORE YOU PANIC</text>
    </g>
  );
};

// ---------- S119: medium, cell — The Honest Part (DAY 25) ----------
export const S119: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 300, y: 756, scale: 1, tilt: 0, headTilt: 8, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 24, p: { x: 306, y: 756, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 49, p: { x: 294, y: 752, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: -4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 71, p: { x: 306, y: 756, scale: 1, tilt: 0, headTilt: 5, look: 10, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 98, p: { x: 294, y: 752, scale: 1, tilt: 0, headTilt: 5, look: 10, armL: { a: 4, b: 8 }, armR: { a: -4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral']]);
  const hero0 = <Hero look={LOOKS.scientist} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const p1 = poseAt(t, [
    { f: 0, p: { x: 1300, y: 736, scale: 1, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 24, p: { x: 1306, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 10, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 49, p: { x: 1294, y: 732, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: -4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 71, p: { x: 1306, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 12, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 98, p: { x: 1294, y: 732, scale: 1, tilt: 0, headTilt: 5, look: 12, armL: { a: 4, b: 8 }, armR: { a: -4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f1 = faceAt(t, [[0, 'neutral']]);
  const hero1 = <Hero look={LOOKS.hero} pose={{ ...p1, ...f1, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 614], [len, 614]]);
  const camY = kf(t, [[0, 692], [len, 692]]);
  const zoom = kf(t, [[0, 1.8], [len, 1.9]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 4406} id="s119" veil={0.44} day={25} />
        <Prop kind="magnifier" x={960} y={533.8} s={1} t={t} extra={{"word": "LIMITS"}} />
        {hero0}
        {hero1}
      </g>
      <DayChip t={t} day="DAY 25" />
      <text x={1440} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#F6EFE3">THE SCIENCE HAS LIMITS</text>
    </g>
  );
};

// ---------- S120: two-shot, antarctic — The Honest Part (DAY 25) ----------
export const S120: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 330, y: 808, scale: 0.4, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 29, p: { x: 336, y: 808, scale: 0.4, tilt: 0, headTilt: 5, look: 10, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 57, p: { x: 324, y: 804, scale: 0.4, tilt: 0, headTilt: 5, look: -10, armL: { a: 4, b: 8 }, armR: { a: -4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 86, p: { x: 336, y: 808, scale: 0.4, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'sad']]);
  const hero0 = <Hero look={LOOKS.researcher} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const p1 = poseAt(t, [
    { f: 0, p: { x: 487.5, y: 808, scale: 0.392, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 29, p: { x: 493.5, y: 808, scale: 0.392, tilt: 0, headTilt: 10, look: -10, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 57, p: { x: 481.5, y: 804, scale: 0.392, tilt: 0, headTilt: 10, look: 10, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 86, p: { x: 493.5, y: 808, scale: 0.392, tilt: 0, headTilt: 10, look: -8, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f1 = faceAt(t, [[0, 'sad']]);
  const hero1 = <Hero look={{...LOOKS.researcher, hair: 'crop', hairC: '#2A1E14', jacket: '#3E8C86', jacketShade: '#2F6E69', accent: '#2F6E69'}} pose={{ ...p1, ...f1, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const p2 = poseAt(t, [
    { f: 0, p: { x: 645, y: 808, scale: 0.408, tilt: 0, headTilt: -5, look: 0, armL: { a: 30, b: 15 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 29, p: { x: 651, y: 808, scale: 0.408, tilt: 0, headTilt: 0, look: 10, armL: { a: 30, b: 15 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 57, p: { x: 639, y: 804, scale: 0.408, tilt: 0, headTilt: 0, look: -10, armL: { a: 30, b: 15 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 86, p: { x: 651, y: 808, scale: 0.408, tilt: 0, headTilt: 0, look: 0, armL: { a: 30, b: 15 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f2 = faceAt(t, [[0, 'sad']]);
  const hero2 = <Hero look={{...LOOKS.researcher, hair: 'sidepart', hairC: '#5A3A28', jacket: '#D9A441', jacketShade: '#AD8334', accent: '#AD8334'}} pose={{ ...p2, ...f2, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const p3 = poseAt(t, [
    { f: 0, p: { x: 802.5, y: 808, scale: 0.396, tilt: 0, headTilt: 8, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 29, p: { x: 808.5, y: 808, scale: 0.396, tilt: 0, headTilt: 12, look: -10, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 57, p: { x: 796.5, y: 804, scale: 0.396, tilt: 0, headTilt: 12, look: 10, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 86, p: { x: 808.5, y: 808, scale: 0.396, tilt: 0, headTilt: 12, look: -8, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f3 = faceAt(t, [[0, 'sad']]);
  const hero3 = <Hero look={{...LOOKS.researcher, hair: 'afro', hairC: '#241A12', jacket: '#9B7BB8', jacketShade: '#7C6394', accent: '#7C6394'}} pose={{ ...p3, ...f3, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const p4 = poseAt(t, [
    { f: 0, p: { x: 960, y: 808, scale: 0.404, tilt: 0, headTilt: -8, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 29, p: { x: 966, y: 808, scale: 0.404, tilt: 0, headTilt: -3, look: 10, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 57, p: { x: 954, y: 804, scale: 0.404, tilt: 0, headTilt: -3, look: -10, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 86, p: { x: 966, y: 808, scale: 0.404, tilt: 0, headTilt: -3, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f4 = faceAt(t, [[0, 'sad']]);
  const hero4 = <Hero look={{...LOOKS.researcher, hair: 'ponytail', hairC: '#6A4A2E', jacket: '#4A7AA0', jacketShade: '#3A5E80', accent: '#3A5E80'}} pose={{ ...p4, ...f4, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const p5 = poseAt(t, [
    { f: 0, p: { x: 1117.5, y: 808, scale: 0.392, tilt: 0, headTilt: 3, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 29, p: { x: 1123.5, y: 808, scale: 0.392, tilt: 0, headTilt: 8, look: -10, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 57, p: { x: 1111.5, y: 804, scale: 0.392, tilt: 0, headTilt: 8, look: 10, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 86, p: { x: 1123.5, y: 808, scale: 0.392, tilt: 0, headTilt: 8, look: -8, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f5 = faceAt(t, [[0, 'sad']]);
  const hero5 = <Hero look={{...LOOKS.researcher, hair: 'curly', hairC: '#3A2420', jacket: '#6A9A5A', jacketShade: '#527A46', accent: '#527A46'}} pose={{ ...p5, ...f5, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const p6 = poseAt(t, [
    { f: 0, p: { x: 1275, y: 808, scale: 0.408, tilt: 0, headTilt: -3, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 29, p: { x: 1281, y: 808, scale: 0.408, tilt: 0, headTilt: 2, look: 10, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 57, p: { x: 1269, y: 804, scale: 0.408, tilt: 0, headTilt: 2, look: -10, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 86, p: { x: 1281, y: 808, scale: 0.408, tilt: 0, headTilt: 2, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f6 = faceAt(t, [[0, 'sad']]);
  const hero6 = <Hero look={{...LOOKS.researcher, hair: 'bun', hairC: '#8A5A3A', jacket: '#D98A3A', jacketShade: '#AD6E2E', accent: '#AD6E2E'}} pose={{ ...p6, ...f6, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const p7 = poseAt(t, [
    { f: 0, p: { x: 1432.5, y: 808, scale: 0.396, tilt: 0, headTilt: 6, look: 0, armL: { a: 20, b: 10 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 29, p: { x: 1438.5, y: 808, scale: 0.396, tilt: 0, headTilt: 11, look: -10, armL: { a: 20, b: 10 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 57, p: { x: 1426.5, y: 804, scale: 0.396, tilt: 0, headTilt: 11, look: 10, armL: { a: 20, b: 10 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 86, p: { x: 1438.5, y: 808, scale: 0.396, tilt: 0, headTilt: 11, look: -8, armL: { a: 20, b: 10 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f7 = faceAt(t, [[0, 'sad']]);
  const hero7 = <Hero look={{...LOOKS.researcher, hair: 'crop', hairC: '#3A2A1A', jacket: '#3A4A6A', jacketShade: '#2E3A54', accent: '#2E3A54'}} pose={{ ...p7, ...f7, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const p8 = poseAt(t, [
    { f: 0, p: { x: 1590, y: 808, scale: 0.404, tilt: 0, headTilt: -6, look: 0, armL: { a: 4, b: 8 }, armR: { a: 30, b: 10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 29, p: { x: 1596, y: 808, scale: 0.404, tilt: 0, headTilt: -1, look: 10, armL: { a: 4, b: 8 }, armR: { a: 30, b: 10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 57, p: { x: 1584, y: 804, scale: 0.404, tilt: 0, headTilt: -1, look: -10, armL: { a: 4, b: 8 }, armR: { a: 30, b: 10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 86, p: { x: 1596, y: 808, scale: 0.404, tilt: 0, headTilt: -1, look: 0, armL: { a: 4, b: 8 }, armR: { a: 30, b: 10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f8 = faceAt(t, [[0, 'sad']]);
  const hero8 = <Hero look={{...LOOKS.researcher, hair: 'ponytail', hairC: '#2A1E14', jacket: '#8A8A4A', jacketShade: '#6E6E3A', accent: '#6E6E3A'}} pose={{ ...p8, ...f8, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 966], [len, 966]]);
  const camY = kf(t, [[0, 580], [len, 580]]);
  const zoom = kf(t, [[0, 1.35], [len, 1.4]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Antarctic t={t + 4443} id="s120" />
        {hero0}
        {hero1}
        {hero2}
        {hero3}
        {hero4}
        {hero5}
        {hero6}
        {hero7}
        {hero8}
      </g>
      <DayChip t={t} day="DAY 25" />
      <text x={960} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#A9C6FF">9 PEOPLE</text>
    </g>
  );
};

// ---------- S121: high angle, cell (prison) — The Honest Part (DAY 25) ----------
export const S121: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 330, y: 826, scale: 0.5, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 26, p: { x: 336, y: 826, scale: 0.5, tilt: 0, headTilt: 5, look: 10, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 53, p: { x: 324, y: 822, scale: 0.5, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 74, p: { x: 336, y: 826, scale: 0.5, tilt: 0, headTilt: 6, look: 8, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 92, p: { x: 324, y: 822, scale: 0.5, tilt: 0, headTilt: 5, look: -6, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 105, p: { x: 336, y: 826, scale: 0.5, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'sad']]);
  const hero0 = <Hero look={LOOKS.prisoner} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const p1 = poseAt(t, [
    { f: 0, p: { x: 510, y: 826, scale: 0.49, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 30, b: 15 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 26, p: { x: 516, y: 826, scale: 0.49, tilt: 0, headTilt: 10, look: 10, armL: { a: 4, b: 8 }, armR: { a: 30, b: 15 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 53, p: { x: 504, y: 822, scale: 0.49, tilt: 0, headTilt: 10, look: 0, armL: { a: 4, b: 8 }, armR: { a: 30, b: 15 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 79, p: { x: 516, y: 826, scale: 0.49, tilt: 0, headTilt: 11, look: 10, armL: { a: 4, b: 8 }, armR: { a: 30, b: 15 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 105, p: { x: 504, y: 822, scale: 0.49, tilt: 0, headTilt: 10, look: -8, armL: { a: 4, b: 8 }, armR: { a: 30, b: 15 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f1 = faceAt(t, [[0, 'sad']]);
  const hero1 = <Hero look={{...LOOKS.prisoner, hair: 'crop', hairC: '#3A2420', jacket: '#7A8A9A', jacketShade: '#5E6E7C', accent: '#5E6E7C'}} pose={{ ...p1, ...f1, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const p2 = poseAt(t, [
    { f: 0, p: { x: 690, y: 826, scale: 0.51, tilt: 0, headTilt: -5, look: 0, armL: { a: 30, b: 15 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 26, p: { x: 696, y: 826, scale: 0.51, tilt: 0, headTilt: 0, look: 10, armL: { a: 30, b: 15 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 53, p: { x: 684, y: 822, scale: 0.51, tilt: 0, headTilt: 0, look: 0, armL: { a: 30, b: 15 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 74, p: { x: 696, y: 826, scale: 0.51, tilt: 0, headTilt: 1, look: 8, armL: { a: 30, b: 15 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 92, p: { x: 684, y: 822, scale: 0.51, tilt: 0, headTilt: 0, look: -6, armL: { a: 30, b: 15 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 105, p: { x: 696, y: 826, scale: 0.51, tilt: 0, headTilt: 0, look: 0, armL: { a: 30, b: 15 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f2 = faceAt(t, [[0, 'sad']]);
  const hero2 = <Hero look={{...LOOKS.prisoner, hair: 'curly', hairC: '#2A1E14', jacket: '#B09A6A', jacketShade: '#8C7A54', accent: '#8C7A54'}} pose={{ ...p2, ...f2, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const p3 = poseAt(t, [
    { f: 0, p: { x: 870, y: 826, scale: 0.495, tilt: 0, headTilt: 8, look: 0, armL: { a: 4, b: 8 }, armR: { a: 20, b: 10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 26, p: { x: 876, y: 826, scale: 0.495, tilt: 0, headTilt: 12, look: 10, armL: { a: 4, b: 8 }, armR: { a: 20, b: 10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 53, p: { x: 864, y: 822, scale: 0.495, tilt: 0, headTilt: 12, look: 0, armL: { a: 4, b: 8 }, armR: { a: 20, b: 10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 79, p: { x: 876, y: 826, scale: 0.495, tilt: 0, headTilt: 12, look: 10, armL: { a: 4, b: 8 }, armR: { a: 20, b: 10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 105, p: { x: 864, y: 822, scale: 0.495, tilt: 0, headTilt: 12, look: -8, armL: { a: 4, b: 8 }, armR: { a: 20, b: 10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f3 = faceAt(t, [[0, 'sad']]);
  const hero3 = <Hero look={{...LOOKS.prisoner, hair: 'sidepart', hairC: '#5A3A28', jacket: '#6A6A6A', jacketShade: '#545454', accent: '#545454'}} pose={{ ...p3, ...f3, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const p4 = poseAt(t, [
    { f: 0, p: { x: 1050, y: 826, scale: 0.505, tilt: 0, headTilt: -8, look: 0, armL: { a: 20, b: 10 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 26, p: { x: 1056, y: 826, scale: 0.505, tilt: 0, headTilt: -3, look: 10, armL: { a: 20, b: 10 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 53, p: { x: 1044, y: 822, scale: 0.505, tilt: 0, headTilt: -3, look: 0, armL: { a: 20, b: 10 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 74, p: { x: 1056, y: 826, scale: 0.505, tilt: 0, headTilt: -2, look: 8, armL: { a: 20, b: 10 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 92, p: { x: 1044, y: 822, scale: 0.505, tilt: 0, headTilt: -3, look: -6, armL: { a: 20, b: 10 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 105, p: { x: 1056, y: 826, scale: 0.505, tilt: 0, headTilt: -3, look: 0, armL: { a: 20, b: 10 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f4 = faceAt(t, [[0, 'sad']]);
  const hero4 = <Hero look={{...LOOKS.prisoner, hair: 'bun', hairC: '#4A3226', jacket: '#8AA0B0', jacketShade: '#6E8090', accent: '#6E8090'}} pose={{ ...p4, ...f4, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const p5 = poseAt(t, [
    { f: 0, p: { x: 1230, y: 826, scale: 0.49, tilt: 0, headTilt: 3, look: 0, armL: { a: 15, b: 8 }, armR: { a: 25, b: 12 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 26, p: { x: 1236, y: 826, scale: 0.49, tilt: 0, headTilt: 8, look: 10, armL: { a: 15, b: 8 }, armR: { a: 25, b: 12 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 53, p: { x: 1224, y: 822, scale: 0.49, tilt: 0, headTilt: 8, look: 0, armL: { a: 15, b: 8 }, armR: { a: 25, b: 12 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 79, p: { x: 1236, y: 826, scale: 0.49, tilt: 0, headTilt: 9, look: 10, armL: { a: 15, b: 8 }, armR: { a: 25, b: 12 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 105, p: { x: 1224, y: 822, scale: 0.49, tilt: 0, headTilt: 8, look: -8, armL: { a: 15, b: 8 }, armR: { a: 25, b: 12 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f5 = faceAt(t, [[0, 'sad']]);
  const hero5 = <Hero look={{...LOOKS.prisoner, hair: 'ponytail', hairC: '#6A4A2E', jacket: '#A8A8A8', jacketShade: '#868686', accent: '#868686'}} pose={{ ...p5, ...f5, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const p6 = poseAt(t, [
    { f: 0, p: { x: 1410, y: 826, scale: 0.51, tilt: 0, headTilt: -3, look: 0, armL: { a: 25, b: 12 }, armR: { a: 25, b: 12 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 26, p: { x: 1416, y: 826, scale: 0.51, tilt: 0, headTilt: 2, look: 10, armL: { a: 25, b: 12 }, armR: { a: 25, b: 12 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 53, p: { x: 1404, y: 822, scale: 0.51, tilt: 0, headTilt: 2, look: 0, armL: { a: 25, b: 12 }, armR: { a: 25, b: 12 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 74, p: { x: 1416, y: 826, scale: 0.51, tilt: 0, headTilt: 3, look: 8, armL: { a: 25, b: 12 }, armR: { a: 25, b: 12 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 92, p: { x: 1404, y: 822, scale: 0.51, tilt: 0, headTilt: 2, look: -6, armL: { a: 25, b: 12 }, armR: { a: 25, b: 12 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 105, p: { x: 1416, y: 826, scale: 0.51, tilt: 0, headTilt: 2, look: 0, armL: { a: 25, b: 12 }, armR: { a: 25, b: 12 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f6 = faceAt(t, [[0, 'sad']]);
  const hero6 = <Hero look={{...LOOKS.prisoner, hair: 'crop', hairC: '#8A5A3A', jacket: '#979797', jacketShade: '#787878', accent: '#787878'}} pose={{ ...p6, ...f6, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const p7 = poseAt(t, [
    { f: 0, p: { x: 1590, y: 826, scale: 0.495, tilt: 0, headTilt: 6, look: 0, armL: { a: 35, b: 18 }, armR: { a: 10, b: 6 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 26, p: { x: 1596, y: 826, scale: 0.495, tilt: 0, headTilt: 11, look: 10, armL: { a: 35, b: 18 }, armR: { a: 10, b: 6 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 53, p: { x: 1584, y: 822, scale: 0.495, tilt: 0, headTilt: 11, look: 0, armL: { a: 35, b: 18 }, armR: { a: 10, b: 6 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 79, p: { x: 1596, y: 826, scale: 0.495, tilt: 0, headTilt: 12, look: 10, armL: { a: 35, b: 18 }, armR: { a: 10, b: 6 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 105, p: { x: 1584, y: 822, scale: 0.495, tilt: 0, headTilt: 11, look: -8, armL: { a: 35, b: 18 }, armR: { a: 10, b: 6 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f7 = faceAt(t, [[0, 'sad']]);
  const hero7 = <Hero look={{...LOOKS.prisoner, hair: 'curly', hairC: '#3A2A1A', jacket: '#B5B5B5', jacketShade: '#909090', accent: '#909090'}} pose={{ ...p7, ...f7, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 960], [len, 960]]);
  const camY = kf(t, [[0, 560], [len, 560]]);
  const zoom = kf(t, [[0, 1.25], [len, 1.3]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        {/* v35: the 8 prisoners stand at scale 0.5 in a row across the cell — the floor mattress is full-size at their depth, so its top landed at their waists and their legs sank into its front face (they read as phasing through the bed). The bed is not the subject here; hide it so the lineup stands on open floor. Same fix as S39 (mattress={false}). */}
        <Cell t={t + 4480} id="s121" veil={0.44} prison day={25} mattress={false} />
        {hero0}
        {hero1}
        {hero2}
        {hero3}
        {hero4}
        {hero5}
        {hero6}
        {hero7}
      </g>
      <DayChip t={t} day="DAY 25" />
      {/* v34: was "15 PEOPLE" — the script fact is fifteen prisoners, but only 8 are drawn. The voiceover still states the real number; the caption now labels what's on screen instead of claiming a count the frame can't show. */}
      <text x={960} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#A9C6FF">PRISONERS</text>
    </g>
  );
};

// ---------- S122: medium, cell — The Honest Part (DAY 25) ----------
export const S122: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 330, y: 826, scale: 0.5, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 23, p: { x: 336, y: 826, scale: 0.5, tilt: 0, headTilt: 5, look: 10, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 47, p: { x: 324, y: 822, scale: 0.5, tilt: 0, headTilt: 5, look: -10, armL: { a: 4, b: 8 }, armR: { a: -4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 70, p: { x: 336, y: 826, scale: 0.5, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'sad']]);
  const hero0 = <Hero look={LOOKS.student} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const p1 = poseAt(t, [
    { f: 0, p: { x: 540, y: 826, scale: 0.49, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 30, b: 15 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 23, p: { x: 546, y: 826, scale: 0.49, tilt: 0, headTilt: 10, look: -10, armL: { a: 4, b: 8 }, armR: { a: 30, b: 15 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 47, p: { x: 534, y: 822, scale: 0.49, tilt: 0, headTilt: 10, look: 10, armL: { a: 4, b: 8 }, armR: { a: 30, b: 15 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 70, p: { x: 546, y: 826, scale: 0.49, tilt: 0, headTilt: 10, look: -8, armL: { a: 4, b: 8 }, armR: { a: 30, b: 15 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f1 = faceAt(t, [[0, 'sad']]);
  const hero1 = <Hero look={{...LOOKS.student, hair: 'crop', hairC: '#3A2420', jacket: '#4A7AA0', jacketShade: '#3A5E80', accent: '#3A5E80'}} pose={{ ...p1, ...f1, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const p2 = poseAt(t, [
    { f: 0, p: { x: 750, y: 826, scale: 0.51, tilt: 0, headTilt: -5, look: 0, armL: { a: 30, b: 15 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 23, p: { x: 756, y: 826, scale: 0.51, tilt: 0, headTilt: 0, look: 10, armL: { a: 30, b: 15 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 47, p: { x: 744, y: 822, scale: 0.51, tilt: 0, headTilt: 0, look: -10, armL: { a: 30, b: 15 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 70, p: { x: 756, y: 826, scale: 0.51, tilt: 0, headTilt: 0, look: 0, armL: { a: 30, b: 15 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f2 = faceAt(t, [[0, 'sad']]);
  const hero2 = <Hero look={{...LOOKS.student, hair: 'curly', hairC: '#2A1E14', jacket: '#C85A46', jacketShade: '#9E4636', accent: '#9E4636'}} pose={{ ...p2, ...f2, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const p3 = poseAt(t, [
    { f: 0, p: { x: 960, y: 826, scale: 0.495, tilt: 0, headTilt: 8, look: 0, armL: { a: 4, b: 8 }, armR: { a: 20, b: 10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 23, p: { x: 966, y: 826, scale: 0.495, tilt: 0, headTilt: 12, look: -10, armL: { a: 4, b: 8 }, armR: { a: 20, b: 10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 47, p: { x: 954, y: 822, scale: 0.495, tilt: 0, headTilt: 12, look: 10, armL: { a: 4, b: 8 }, armR: { a: 20, b: 10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 70, p: { x: 966, y: 826, scale: 0.495, tilt: 0, headTilt: 12, look: -8, armL: { a: 4, b: 8 }, armR: { a: 20, b: 10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f3 = faceAt(t, [[0, 'sad']]);
  const hero3 = <Hero look={{...LOOKS.student, hair: 'bun', hairC: '#5A3A28', jacket: '#D9C441', jacketShade: '#AD9C34', accent: '#AD9C34'}} pose={{ ...p3, ...f3, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const p4 = poseAt(t, [
    { f: 0, p: { x: 1170, y: 826, scale: 0.505, tilt: 0, headTilt: -8, look: 0, armL: { a: 20, b: 10 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 23, p: { x: 1176, y: 826, scale: 0.505, tilt: 0, headTilt: -3, look: 10, armL: { a: 20, b: 10 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 47, p: { x: 1164, y: 822, scale: 0.505, tilt: 0, headTilt: -3, look: -10, armL: { a: 20, b: 10 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 70, p: { x: 1176, y: 826, scale: 0.505, tilt: 0, headTilt: -3, look: 0, armL: { a: 20, b: 10 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f4 = faceAt(t, [[0, 'sad']]);
  const hero4 = <Hero look={{...LOOKS.student, hair: 'sidepart', hairC: '#4A3226', jacket: '#9B7BB8', jacketShade: '#7C6394', accent: '#7C6394'}} pose={{ ...p4, ...f4, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const p5 = poseAt(t, [
    { f: 0, p: { x: 1380, y: 826, scale: 0.49, tilt: 0, headTilt: 3, look: 0, armL: { a: 15, b: 8 }, armR: { a: 25, b: 12 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 23, p: { x: 1386, y: 826, scale: 0.49, tilt: 0, headTilt: 8, look: -10, armL: { a: 15, b: 8 }, armR: { a: 25, b: 12 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 47, p: { x: 1374, y: 822, scale: 0.49, tilt: 0, headTilt: 8, look: 10, armL: { a: 15, b: 8 }, armR: { a: 25, b: 12 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 70, p: { x: 1386, y: 826, scale: 0.49, tilt: 0, headTilt: 8, look: -8, armL: { a: 15, b: 8 }, armR: { a: 25, b: 12 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f5 = faceAt(t, [[0, 'sad']]);
  const hero5 = <Hero look={{...LOOKS.student, hair: 'afro', hairC: '#241A12', jacket: '#D98A3A', jacketShade: '#AD6E2E', accent: '#AD6E2E'}} pose={{ ...p5, ...f5, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const p6 = poseAt(t, [
    { f: 0, p: { x: 1590, y: 826, scale: 0.51, tilt: 0, headTilt: -3, look: 0, armL: { a: 25, b: 12 }, armR: { a: 25, b: 12 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 23, p: { x: 1596, y: 826, scale: 0.51, tilt: 0, headTilt: 2, look: 10, armL: { a: 25, b: 12 }, armR: { a: 25, b: 12 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 47, p: { x: 1584, y: 822, scale: 0.51, tilt: 0, headTilt: 2, look: -10, armL: { a: 25, b: 12 }, armR: { a: 25, b: 12 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 70, p: { x: 1596, y: 826, scale: 0.51, tilt: 0, headTilt: 2, look: 0, armL: { a: 25, b: 12 }, armR: { a: 25, b: 12 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f6 = faceAt(t, [[0, 'sad']]);
  const hero6 = <Hero look={{...LOOKS.student, hair: 'ponytail', hairC: '#8A5A3A', jacket: '#6B9463', jacketShade: '#54744E', accent: '#54744E'}} pose={{ ...p6, ...f6, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 336], [len, 336]]);
  const camY = kf(t, [[0, 766], [len, 766]]);
  const zoom = kf(t, [[0, 1.8], [len, 1.9]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        {/* v35: the 3 students stand at scale 0.5 in front of the bed — same phasing as S121 (the full-size mattress top landed at their waists, legs sank into its front face). The bed is not the subject; hide it so they stand on open floor. */}
        <Cell t={t + 4517} id="s122" veil={0.44} day={25} mattress={false} />
        <Prop kind="cubicles" x={727.3} y={574.8} s={0.7} t={t} extra={{}} />
        {hero0}
        {hero1}
        {hero2}
        {hero3}
        {hero4}
        {hero5}
        {hero6}
      </g>
      <DayChip t={t} day="DAY 25" />
      {/* v34: was "14 PEOPLE" — the script fact is fourteen students, but only 7 are drawn and the framing shows 3. The voiceover still states the real number; the caption now labels what's on screen instead of claiming a count the frame can't show. */}
      <text x={960} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#A9C6FF">STUDENTS</text>
    </g>
  );
};

// ---------- S123: macro insert, cell (wall) — The Honest Part (DAY 25) ----------
export const S123: React.FC<ShotProps> = ({ t, len }) => {
  const camX = kf(t, [[0, 1044.5], [len, 1044.5]]);
  const camY = kf(t, [[0, 500], [len, 500]]);
  const zoom = kf(t, [[0, 1.8967334035827186], [len, 1.9967334035827187]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 4554} id="s123" veil={0.44} day={25} />
        {/* Nov 12 v6 (Javion: 2 calendars — remove the duplicate, exactly ONE calendar): the "14 MONTHS"
            calendar is removed. The single "30 DAYS" calendar is centred on the camera (x=1044.5) so the
            macro insert frames it. Caption changed from "NOT THE SAME" (which needed the comparison) to
            "KNOW THE LIMITS" — the script beat ("The science has limits, and you should know them"). */}
        <Prop kind="calendar" x={1044.5} y={500} s={0.42} t={t} extra={{"label": "30 DAYS"}} />
      </g>
      <DayChip t={t} day="DAY 25" />
      <text x={960} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#A9C6FF">KNOW THE LIMITS</text>
    </g>
  );
};

// ---------- S124: low angle, antarctic — The Honest Part (DAY 25) ----------
export const S124: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 330, y: 808, scale: 0.4, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 31, p: { x: 336, y: 808, scale: 0.4, tilt: 0, headTilt: 5, look: 10, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 62, p: { x: 324, y: 804, scale: 0.4, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: -4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 86, p: { x: 336, y: 808, scale: 0.4, tilt: 0, headTilt: 5, look: 8, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 108, p: { x: 324, y: 804, scale: 0.4, tilt: 0, headTilt: 6, look: -6, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 123, p: { x: 336, y: 808, scale: 0.4, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral']]);
  const hero0 = <Hero look={LOOKS.researcher} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const p1 = poseAt(t, [
    { f: 0, p: { x: 487.5, y: 808, scale: 0.392, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 31, p: { x: 493.5, y: 808, scale: 0.392, tilt: 0, headTilt: 10, look: 10, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 62, p: { x: 481.5, y: 804, scale: 0.392, tilt: 0, headTilt: 10, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 92, p: { x: 493.5, y: 808, scale: 0.392, tilt: 0, headTilt: 10, look: 10, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 123, p: { x: 481.5, y: 804, scale: 0.392, tilt: 0, headTilt: 11, look: -8, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f1 = faceAt(t, [[0, 'neutral']]);
  const hero1 = <Hero look={{...LOOKS.researcher, hair: 'crop', hairC: '#2A1E14', jacket: '#3E8C86', jacketShade: '#2F6E69', accent: '#2F6E69'}} pose={{ ...p1, ...f1, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const p2 = poseAt(t, [
    { f: 0, p: { x: 645, y: 808, scale: 0.408, tilt: 0, headTilt: -5, look: 0, armL: { a: 30, b: 15 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 31, p: { x: 651, y: 808, scale: 0.408, tilt: 0, headTilt: 0, look: 10, armL: { a: 30, b: 15 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 62, p: { x: 639, y: 804, scale: 0.408, tilt: 0, headTilt: 0, look: 0, armL: { a: 30, b: 15 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 86, p: { x: 651, y: 808, scale: 0.408, tilt: 0, headTilt: 0, look: 8, armL: { a: 30, b: 15 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 108, p: { x: 639, y: 804, scale: 0.408, tilt: 0, headTilt: 1, look: -6, armL: { a: 30, b: 15 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 123, p: { x: 651, y: 808, scale: 0.408, tilt: 0, headTilt: 0, look: 0, armL: { a: 30, b: 15 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f2 = faceAt(t, [[0, 'neutral']]);
  const hero2 = <Hero look={{...LOOKS.researcher, hair: 'sidepart', hairC: '#5A3A28', jacket: '#D9A441', jacketShade: '#AD8334', accent: '#AD8334'}} pose={{ ...p2, ...f2, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const p3 = poseAt(t, [
    { f: 0, p: { x: 802.5, y: 808, scale: 0.396, tilt: 0, headTilt: 8, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 31, p: { x: 808.5, y: 808, scale: 0.396, tilt: 0, headTilt: 12, look: 10, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 62, p: { x: 796.5, y: 804, scale: 0.396, tilt: 0, headTilt: 12, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 92, p: { x: 808.5, y: 808, scale: 0.396, tilt: 0, headTilt: 12, look: 10, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 123, p: { x: 796.5, y: 804, scale: 0.396, tilt: 0, headTilt: 12, look: -8, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f3 = faceAt(t, [[0, 'neutral']]);
  const hero3 = <Hero look={{...LOOKS.researcher, hair: 'afro', hairC: '#241A12', jacket: '#9B7BB8', jacketShade: '#7C6394', accent: '#7C6394'}} pose={{ ...p3, ...f3, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const p4 = poseAt(t, [
    { f: 0, p: { x: 960, y: 808, scale: 0.404, tilt: 0, headTilt: -8, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 31, p: { x: 966, y: 808, scale: 0.404, tilt: 0, headTilt: -3, look: 10, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 62, p: { x: 954, y: 804, scale: 0.404, tilt: 0, headTilt: -3, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 86, p: { x: 966, y: 808, scale: 0.404, tilt: 0, headTilt: -3, look: 8, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 108, p: { x: 954, y: 804, scale: 0.404, tilt: 0, headTilt: -2, look: -6, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 123, p: { x: 966, y: 808, scale: 0.404, tilt: 0, headTilt: -3, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f4 = faceAt(t, [[0, 'neutral']]);
  const hero4 = <Hero look={{...LOOKS.researcher, hair: 'ponytail', hairC: '#6A4A2E', jacket: '#4A7AA0', jacketShade: '#3A5E80', accent: '#3A5E80'}} pose={{ ...p4, ...f4, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const p5 = poseAt(t, [
    { f: 0, p: { x: 1117.5, y: 808, scale: 0.392, tilt: 0, headTilt: 3, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 31, p: { x: 1123.5, y: 808, scale: 0.392, tilt: 0, headTilt: 8, look: 10, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 62, p: { x: 1111.5, y: 804, scale: 0.392, tilt: 0, headTilt: 8, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 92, p: { x: 1123.5, y: 808, scale: 0.392, tilt: 0, headTilt: 8, look: 10, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 123, p: { x: 1111.5, y: 804, scale: 0.392, tilt: 0, headTilt: 9, look: -8, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f5 = faceAt(t, [[0, 'neutral']]);
  const hero5 = <Hero look={{...LOOKS.researcher, hair: 'curly', hairC: '#3A2420', jacket: '#6A9A5A', jacketShade: '#527A46', accent: '#527A46'}} pose={{ ...p5, ...f5, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const p6 = poseAt(t, [
    { f: 0, p: { x: 1275, y: 808, scale: 0.408, tilt: 0, headTilt: -3, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 31, p: { x: 1281, y: 808, scale: 0.408, tilt: 0, headTilt: 2, look: 10, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 62, p: { x: 1269, y: 804, scale: 0.408, tilt: 0, headTilt: 2, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 86, p: { x: 1281, y: 808, scale: 0.408, tilt: 0, headTilt: 2, look: 8, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 108, p: { x: 1269, y: 804, scale: 0.408, tilt: 0, headTilt: 3, look: -6, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 123, p: { x: 1281, y: 808, scale: 0.408, tilt: 0, headTilt: 2, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f6 = faceAt(t, [[0, 'neutral']]);
  const hero6 = <Hero look={{...LOOKS.researcher, hair: 'bun', hairC: '#8A5A3A', jacket: '#D98A3A', jacketShade: '#AD6E2E', accent: '#AD6E2E'}} pose={{ ...p6, ...f6, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const p7 = poseAt(t, [
    { f: 0, p: { x: 1432.5, y: 808, scale: 0.396, tilt: 0, headTilt: 6, look: 0, armL: { a: 20, b: 10 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 31, p: { x: 1438.5, y: 808, scale: 0.396, tilt: 0, headTilt: 11, look: 10, armL: { a: 20, b: 10 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 62, p: { x: 1426.5, y: 804, scale: 0.396, tilt: 0, headTilt: 11, look: 0, armL: { a: 20, b: 10 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 92, p: { x: 1438.5, y: 808, scale: 0.396, tilt: 0, headTilt: 11, look: 10, armL: { a: 20, b: 10 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 123, p: { x: 1426.5, y: 804, scale: 0.396, tilt: 0, headTilt: 12, look: -8, armL: { a: 20, b: 10 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f7 = faceAt(t, [[0, 'neutral']]);
  const hero7 = <Hero look={{...LOOKS.researcher, hair: 'crop', hairC: '#3A2A1A', jacket: '#3A4A6A', jacketShade: '#2E3A54', accent: '#2E3A54'}} pose={{ ...p7, ...f7, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const p8 = poseAt(t, [
    { f: 0, p: { x: 1590, y: 808, scale: 0.404, tilt: 0, headTilt: -6, look: 0, armL: { a: 4, b: 8 }, armR: { a: 30, b: 10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 31, p: { x: 1596, y: 808, scale: 0.404, tilt: 0, headTilt: -1, look: 10, armL: { a: 4, b: 8 }, armR: { a: 30, b: 10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 62, p: { x: 1584, y: 804, scale: 0.404, tilt: 0, headTilt: -1, look: 0, armL: { a: 4, b: 8 }, armR: { a: 30, b: 10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 86, p: { x: 1596, y: 808, scale: 0.404, tilt: 0, headTilt: -1, look: 8, armL: { a: 4, b: 8 }, armR: { a: 30, b: 10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 108, p: { x: 1584, y: 804, scale: 0.404, tilt: 0, headTilt: 0, look: -6, armL: { a: 4, b: 8 }, armR: { a: 30, b: 10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 123, p: { x: 1596, y: 808, scale: 0.404, tilt: 0, headTilt: -1, look: 0, armL: { a: 4, b: 8 }, armR: { a: 30, b: 10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f8 = faceAt(t, [[0, 'neutral']]);
  const hero8 = <Hero look={{...LOOKS.researcher, hair: 'ponytail', hairC: '#2A1E14', jacket: '#8A8A4A', jacketShade: '#6E6E3A', accent: '#6E6E3A'}} pose={{ ...p8, ...f8, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 336], [len, 336]]);
  const camY = kf(t, [[0, 748], [len, 748]]);
  const zoom = kf(t, [[0, 1.6], [len, 1.68]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Antarctic t={t + 4591} id="s124" />
        {hero0}
        {hero1}
        {hero2}
        {hero3}
        {hero4}
        {hero5}
        {hero6}
        {hero7}
        {hero8}
      </g>
      <DayChip t={t} day="DAY 25" />
      <text x={960} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#F6EFE3">THEY HAD EACH OTHER</text>
    </g>
  );
};

// ---------- S125: medium, cell — The Honest Part (DAY 25) ----------
export const S125: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 900, y: 736, scale: 1, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 23, p: { x: 906, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 10, armL: { a: 4, b: 8 }, armR: { a: 90, b: 60 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 45, p: { x: 894, y: 732, scale: 1, tilt: 0, headTilt: 6, look: -10, armL: { a: 4, b: 8 }, armR: { a: 120, b: 25 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 68, p: { x: 906, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 12, armL: { a: 4, b: 8 }, armR: { a: 90, b: 60 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral']]);
  const hero0 = <Hero look={LOOKS.hero} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 706], [len, 706]]);
  const camY = kf(t, [[0, 676], [len, 676]]);
  const zoom = kf(t, [[0, 1.8], [len, 1.9]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 4628} id="s125" veil={0.44} day={25} />
        <Prop kind="photos" x={1072.3} y={484.8} s={0.7} t={t} extra={{"drift_x": 25}} />
        {hero0}
      </g>
      <DayChip t={t} day="DAY 25" />
      <text x={960} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#F6EFE3">ONE PERSON, ONE ROOM</text>
    </g>
  );
};

// ---------- S126: wide, stage — The Honest Part (DAY 25) ----------
export const S126: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 620, y: 736, scale: 1, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 32, p: { x: 626, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 10, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 65, p: { x: 614, y: 732, scale: 1, tilt: 0, headTilt: 5, look: -10, armL: { a: 4, b: 8 }, armR: { a: -4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 97, p: { x: 626, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'determined']]);
  const hero0 = <Hero look={LOOKS.hero} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 960], [len, 960]]);
  const camY = kf(t, [[0, 560], [len, 560]]);
  const zoom = kf(t, [[0, 1.0], [len, 1.06]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Stage t={t + 4665} id="s126" />
        {/* v38 (Javion: "floating brain"): the brain REMOVED — a lone pink brain floating in empty dark space on the REAL side read as a glitch, not as a graphic. The "REAL" caption carries the beat on its own. */}
        {hero0}
      </g>
      <DayChip t={t} day="DAY 25" />
      <text x={480} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#F6EFE3">FICTION</text>
      <text x={1440} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#A9C6FF">REAL</text>
    </g>
  );
};

// ---------- S127: over-the-shoulder, outside — The Honest Part (DAY 25) ----------
export const S127: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 560, y: 736, scale: 1, tilt: 6, headTilt: 0, look: 0, armL: { a: 20, b: 8 }, armR: { a: 20, b: 8 }, legL: { a: 12, b: -15 }, legR: { a: -8, b: -3 } } },
    { f: 17, p: { x: 600, y: 732, scale: 1, tilt: 6, headTilt: 0, look: 0, armL: { a: -20, b: 8 }, armR: { a: -20, b: 8 }, legL: { a: -8, b: -3 }, legR: { a: 12, b: -15 } } },
    { f: 34, p: { x: 640, y: 736, scale: 1, tilt: 6, headTilt: 0, look: 0, armL: { a: 20, b: 8 }, armR: { a: 20, b: 8 }, legL: { a: 12, b: -15 }, legR: { a: -8, b: -3 } } },
    { f: 51, p: { x: 680, y: 732, scale: 1, tilt: 6, headTilt: 0, look: 0, armL: { a: -20, b: 8 }, armR: { a: -20, b: 8 }, legL: { a: -8, b: -3 }, legR: { a: 12, b: -15 } } },
    { f: 74, p: { x: 680, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 12, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 102, p: { x: 680, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 12, armL: { a: 4, b: 8 }, armR: { a: -4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'neutral'], [51, 'happy']]);
  const hero0 = <Hero look={LOOKS.hero} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 680], [len, 680]]);
  const camY = kf(t, [[0, 672], [len, 672]]);
  const zoom = kf(t, [[0, 1.8], [len, 1.9]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Exterior t={t + 4702} id="s127" doorOpen={false} />
        <Prop kind="road_sign" x={1028.3} y={502.8} s={0.9} t={t} extra={{"text": "THE DIRECTION\nIS REAL", "drift_x": 15}} />
        {hero0}
      </g>
      <DayChip t={t} day="DAY 25" />
    </g>
  );
};

// ---------- S128: medium, cell — The Honest Part (DAY 25) ----------
export const S128: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 960, y: 736, scale: 1, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 26, p: { x: 966, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 10, armL: { a: 4, b: 8 }, armR: { a: 90, b: 60 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 53, p: { x: 954, y: 732, scale: 1, tilt: 0, headTilt: 6, look: 0, armL: { a: 4, b: 8 }, armR: { a: 120, b: 25 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 74, p: { x: 966, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 8, armL: { a: 4, b: 8 }, armR: { a: 90, b: 60 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 92, p: { x: 954, y: 732, scale: 1, tilt: 0, headTilt: 6, look: -6, armL: { a: 4, b: 8 }, armR: { a: 120, b: 25 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 106, p: { x: 966, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 90, b: 60 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'happy']]);
  const hero0 = <Hero look={LOOKS.hero} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 954], [len, 954]]);
  const camY = kf(t, [[0, 672], [len, 672]]);
  const zoom = kf(t, [[0, 1.8], [len, 1.9]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 4739} id="s128" veil={0.44} day={25} />
        <Prop kind="accordion" x={1200} y={513.8} s={1} t={t} extra={{}} />
        {hero0}
      </g>
      <DayChip t={t} day="DAY 25" />
      <text x={960} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#F6EFE3">COMPRESSED</text>
    </g>
  );
};

// ---------- S129: wide, cell (bed) — The Honest Part (DAY 25) ----------
export const S129: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 470, y: 706, scale: 0.9, tilt: 0, headTilt: 10, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 22, p: { x: 470, y: 698, scale: 0.9, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 50, p: { x: 470, y: 710, scale: 0.9, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: -4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 75, p: { x: 470, y: 698, scale: 0.9, tilt: 0, headTilt: 7, look: 0, armL: { a: 4, b: 8 }, armR: { a: 140, b: 20 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 100, p: { x: 470, y: 710, scale: 0.9, tilt: 0, headTilt: -8, look: -8, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]); {/* Nov 14 (Javion: "he's literally levitating" at 2:53, S53): same as S53 — the v38 +20 fix undershot, feet still ~50px above the floorboards. y +50 more on every key so his feet sit on the floor. */} {/* v38 (Javion: "the dude is visibly floating for no reason"): same as S53 — the hero's pose y was ~20 too high on all keys, so his feet hovered above the floorboards. y +20 on every key so his feet sit on the floor. */}
  const f0 = faceAt(t, [[0, 'happy']]);
  const hero0 = <Hero look={LOOKS.teenager} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 960], [len, 960]]);
  const camY = kf(t, [[0, 560], [len, 560]]);
  const zoom = kf(t, [[0, 1.0], [len, 1.06]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 4776} id="s129" veil={0.28} bed day={25} />
        <Prop kind="wall_clock" x={1180} y={520} s={0.9} t={t} extra={{"hour": 2, "minute": 40}} /> {/* v38 (Javion: "a floating clock"): was x=1280, y=480 — it overlapped the wall vent at the top-right and floated high on the wall. Now x=1180, y=520 — clear of the vent, lower on the wall. (The clock shows 2:40 = the "14 HOURS 40 MIN" of the caption.) */}
        {/* v38 (Javion: "a sun showing on the roof"): sun REMOVED — it's an indoor cell, there is no sky. A sun on the ceiling reads as a mistake, not a time-of-day cue. The wall clock (2:40) + the "14 HOURS 40 MIN" caption already carry the time. */}
        {hero0}
      </g>
      <DayChip t={t} day="DAY 25" />
      <text x={960} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#F6EFE3">14 HOURS 40 MIN</text>
    </g>
  );
};

// ---------- S130: medium, cell — The Honest Part (DAY 25) ----------
export const S130: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 960, y: 736, scale: 1, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 38, p: { x: 966, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 10, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 77, p: { x: 954, y: 732, scale: 1, tilt: 0, headTilt: 5, look: -10, armL: { a: 4, b: 8 }, armR: { a: -4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 115, p: { x: 966, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'determined']]);
  const hero0 = <Hero look={LOOKS.hero} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 966], [len, 966]]);
  const camY = kf(t, [[0, 676], [len, 676]]);
  const zoom = kf(t, [[0, 1.8], [len, 1.9]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 4813} id="s130" veil={0.44} day={25} />
        <Prop kind="brain" x={1280.3} y={517.8} s={1} t={t} extra={{"variant": "sprout", "drift_x": 25}} />
        {hero0}
      </g>
      <DayChip t={t} day="DAY 25" />
      <text x={960} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#F6EFE3">THE BRAIN RECOVERS</text>
    </g>
  );
};

// ---------- S131: close-up, outside — The Honest Part (DAY 25) ----------
export const S131: React.FC<ShotProps> = ({ t, len }) => {
  const camX = kf(t, [[0, 960], [len, 960]]);
  const camY = kf(t, [[0, 560], [len, 560]]);
  const zoom = kf(t, [[0, 3.2], [len, 3.3000000000000003]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Exterior t={t + 4850} id="s131" doorOpen={false} />
        <Prop kind="recovery_road" x={960} y={560} s={1} t={t} extra={{"drift_x": 20}} />
        <Prop kind="wall_clock" x={1136.9} y={489.4} s={0.7} t={t} extra={{"hour": 3, "minute": 0, "ticking": true}} />
      </g>
      <DayChip t={t} day="DAY 25" />
      <text x={960} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#A9C6FF">NOT ON YOUR SCHEDULE</text>
    </g>
  );
};

// ---------- S132: medium, cell (door) — The Honest Part (DAY 30) ----------
export const S132: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 900, y: 736, scale: 1, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 23, p: { x: 906, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 90, b: 60 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 51, p: { x: 894, y: 732, scale: 1, tilt: 0, headTilt: 6, look: 0, armL: { a: 4, b: 8 }, armR: { a: 120, b: 25 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 73, p: { x: 906, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 12, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 101, p: { x: 894, y: 732, scale: 1, tilt: 0, headTilt: 5, look: 12, armL: { a: 4, b: 8 }, armR: { a: -4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'determined'], [51, 'happy']]);
  const hero0 = <Hero look={LOOKS.hero} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 626], [len, 626]]);
  const camY = kf(t, [[0, 676], [len, 676]]);
  const zoom = kf(t, [[0, 1.8], [len, 1.9]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 4887} id="s132" veil={0.44} door day={30} />
        <Prop kind="key" x={975.3} y={517.8} s={1} t={t} extra={{}} />
        {hero0}
      </g>
      <DayChip t={t} day="DAY 30" />
    </g>
  );
};

// ---------- S133: wide, cell (door) — Day Thirty: The Door Opens (DAY 30) ----------
export const S133: React.FC<ShotProps> = ({ t, len }) => {
  // Nov 12 v14 (Javion: the hero stood ON the bed mat in S133): the hero was at x≈700,
  // on the floor mattress (mattress spans x≈380..830 on screen — measured from the S133
  // still). Moved to x≈900, on the bare floor between the mattress and the door, clear
  // of the tallies (end x≈830) and the note (x=985+), still facing/gesturing at the door.
  const p0 = poseAt(t, [
    { f: 0, p: { x: 900, y: 736, scale: 1, tilt: 6, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 33, p: { x: 906, y: 736, scale: 1, tilt: 0, headTilt: 6, look: 0, armL: { a: 4, b: 8 }, armR: { a: 120, b: 25 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 65, p: { x: 894, y: 732, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 94, p: { x: 906, y: 736, scale: 1, tilt: -6, headTilt: -6, look: -15, armL: { a: 50, b: 50 }, armR: { a: 50, b: 50 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 130, p: { x: 894, y: 732, scale: 1, tilt: 0, headTilt: 5, look: -15, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'happy'], [65, 'worried']]);
  const hero0 = <Hero look={LOOKS.hero} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 960], [len, 960]]);
  const camY = kf(t, [[0, 560], [len, 560]]);
  const zoom = kf(t, [[0, 1.0], [len, 1.06]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 4924} id="s133" veil={0.28} door day={30} />
        <Prop kind="door" x={1175} y={560} s={1} t={t} extra={{"open_": true}} />
        {hero0}
      </g>
      <DayChip t={t} day="DAY 30" />
      <text x={960} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#F6EFE3">SUNLIGHT</text>
    </g>
  );
};

// ---------- S134: two-shot, cell (door) — Day Thirty: The Door Opens (DAY 30) ----------
export const S134: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 900, y: 736, scale: 1, tilt: 6, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 16, p: { x: 906, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 32, p: { x: 894, y: 732, scale: 1, tilt: 0, headTilt: 7, look: 0, armL: { a: 4, b: 8 }, armR: { a: 140, b: 20 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 48, p: { x: 906, y: 736, scale: 1, tilt: 0, headTilt: -8, look: 10, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 64, p: { x: 894, y: 732, scale: 1, tilt: 0, headTilt: 7, look: 0, armL: { a: 4, b: 8 }, armR: { a: 140, b: 20 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 78, p: { x: 906, y: 736, scale: 1, tilt: 0, headTilt: -8, look: 12, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 96, p: { x: 894, y: 732, scale: 1, tilt: 0, headTilt: 7, look: 12, armL: { a: 4, b: 8 }, armR: { a: 140, b: 20 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'angry']]);
  const hero0 = <Hero look={LOOKS.hero} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 706], [len, 706]]);
  const camY = kf(t, [[0, 580], [len, 580]]);
  const zoom = kf(t, [[0, 1.35], [len, 1.4]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 4961} id="s134" veil={0.44} door day={30} />
        <Prop kind="door" x={1175} y={560} s={1} t={t} extra={{"open_": true}} />
        {hero0}
      </g>
      <DayChip t={t} day="DAY 30" />
      <text x={960} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#A9C6FF">AND YOU HESITATE</text>
    </g>
  );
};

// ---------- S135: medium, cell — Day Thirty: The Door Opens (DAY 30) ----------
export const S135: React.FC<ShotProps> = ({ t, len }) => {
  const camX = kf(t, [[0, 960], [len, 960]]);
  const camY = kf(t, [[0, 560], [len, 560]]);
  const zoom = kf(t, [[0, 1.8], [len, 1.9]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 4998} id="s135" veil={0.44} day={30} />
        <Prop kind="brain" x={960} y={480} s={1.1} t={t} extra={{"variant": "crown", "drift_x": 30, "bpm": 50, "grow": true}} />
      </g>
      <DayChip t={t} day="DAY 30" />
      <text x={960} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#A9C6FF"><tspan x={960} dy={0}>YOUR OWN MIND</tspan><tspan x={960} dy={58}>BECAME THE CAPTOR</tspan></text>
    </g>
  );
};

// ---------- S136: two-shot, cell (door) — Day Thirty: The Door Opens (DAY 30) ----------
export const S136: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 640, y: 736, scale: 1, tilt: 6, headTilt: 0, look: 0, armL: { a: 20, b: 8 }, armR: { a: 20, b: 8 }, legL: { a: 12, b: -15 }, legR: { a: -8, b: -3 } } },
    { f: 18, p: { x: 700, y: 732, scale: 1, tilt: 6, headTilt: 0, look: 0, armL: { a: -20, b: 8 }, armR: { a: -20, b: 8 }, legL: { a: -8, b: -3 }, legR: { a: 12, b: -15 } } },
    { f: 37, p: { x: 760, y: 736, scale: 1, tilt: 6, headTilt: 0, look: 0, armL: { a: 20, b: 8 }, armR: { a: 20, b: 8 }, legL: { a: 12, b: -15 }, legR: { a: -8, b: -3 } } },
    { f: 54, p: { x: 760, y: 736, scale: 1, tilt: 0, headTilt: 5, look: -15, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 74, p: { x: 760, y: 736, scale: 1, tilt: 0, headTilt: 5, look: -15, armL: { a: 4, b: 8 }, armR: { a: -4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'sad']]);
  const hero0 = <Hero look={LOOKS.hero} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const p1 = poseAt(t, [
    { f: 0, p: { x: 1300, y: 736, scale: 1, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 15, p: { x: 1306, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 26, p: { x: 1294, y: 732, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: -4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 37, p: { x: 1306, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 54, p: { x: 1294, y: 732, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: -4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 74, p: { x: 1306, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f1 = faceAt(t, [[0, 'sad']]);
  const hero1 = <Hero look={LOOKS.hero} pose={{ ...p1, ...f1, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const hero1G = <g opacity={0.35}>{hero1}</g>;
  const camX = kf(t, [[0, 1033], [len, 1033]]);
  const camY = kf(t, [[0, 580], [len, 580]]);
  const zoom = kf(t, [[0, 1.35], [len, 1.4]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 5035} id="s136" veil={0.44} door day={30} mattress={false} /> {/* v38 (Javion: "character is phasing on the bed you have to fix that"): the solid hero stands at x=640–760, inside the floor mattress's footprint (u=0.06–0.40), so the mattress top cut him at the waist and he read as standing IN the bed. Same fix as S62/S82/S121/S122: hide the mattress — the bed isn't the subject here, the hero + his ghost double at the door are. */}
        <Prop kind="door" x={1175} y={578} s={0.9} t={t} extra={{"open_": true}} />
        {hero0}
        {hero1G}
      </g>
      <DayChip t={t} day="DAY 30" />
      <text x={960} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#F6EFE3">THE ROOM DIDN'T BREAK YOU</text>
    </g>
  );
};

// ---------- S137: high angle, outside — Day Thirty: The Door Opens (DAY 30) ----------
export const S137: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 960, y: 736, scale: 1, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 34, p: { x: 966, y: 736, scale: 1, tilt: -8, headTilt: -6, look: 10, armL: { a: 50, b: 70 }, armR: { a: 50, b: 70 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 69, p: { x: 954, y: 732, scale: 1, tilt: -4, headTilt: 8, look: -10, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 103, p: { x: 966, y: 736, scale: 1, tilt: -8, headTilt: -6, look: 0, armL: { a: 50, b: 70 }, armR: { a: 50, b: 70 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'sad']]);
  const hero0 = <Hero look={LOOKS.hero} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 960], [len, 960]]);
  const camY = kf(t, [[0, 560], [len, 560]]);
  const zoom = kf(t, [[0, 1.25], [len, 1.3]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Exterior t={t + 5072} id="s137" doorOpen={true} />
        {hero0}
      </g>
      <DayChip t={t} day="DAY 30" />
    </g>
  );
};

// ---------- S138: medium, outside — Day Thirty: The Door Opens (DAY 30) ----------
export const S138: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 960, y: 756, scale: 1, tilt: 8, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 28, p: { x: 966, y: 756, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 90, b: 60 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 55, p: { x: 954, y: 752, scale: 1, tilt: 0, headTilt: 6, look: 0, armL: { a: 4, b: 8 }, armR: { a: 120, b: 25 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 80, p: { x: 966, y: 756, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 90, b: 60 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 111, p: { x: 954, y: 752, scale: 1, tilt: 0, headTilt: 6, look: 0, armL: { a: 4, b: 8 }, armR: { a: 120, b: 25 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'sad']]);
  const hero0 = <Hero look={LOOKS.prisoner} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 954], [len, 954]]);
  const camY = kf(t, [[0, 692], [len, 692]]);
  const zoom = kf(t, [[0, 1.8], [len, 1.9]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Exterior t={t + 5109} id="s138" doorOpen={true} />
        {hero0}
      </g>
      <DayChip t={t} day="DAY 30" />
      <text x={960} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#A9C6FF">FEARED CONTACT</text>
    </g>
  );
};

// ---------- S139: close-up, cave — Day Thirty: The Door Opens (DAY 30) ----------
export const S139: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 640, y: 736, scale: 1, tilt: 6, headTilt: 0, look: 0, armL: { a: 20, b: 8 }, armR: { a: 20, b: 8 }, legL: { a: 12, b: -15 }, legR: { a: -8, b: -3 } } },
    { f: 14, p: { x: 680, y: 732, scale: 1, tilt: 6, headTilt: 0, look: 0, armL: { a: -20, b: 8 }, armR: { a: -20, b: 8 }, legL: { a: -8, b: -3 }, legR: { a: 12, b: -15 } } },
    { f: 28, p: { x: 720, y: 736, scale: 1, tilt: 6, headTilt: 0, look: 0, armL: { a: 20, b: 8 }, armR: { a: 20, b: 8 }, legL: { a: 12, b: -15 }, legR: { a: -8, b: -3 } } },
    { f: 42, p: { x: 760, y: 732, scale: 1, tilt: 6, headTilt: 0, look: 0, armL: { a: -20, b: 8 }, armR: { a: -20, b: 8 }, legL: { a: -8, b: -3 }, legR: { a: 12, b: -15 } } },
    { f: 60, p: { x: 760, y: 736, scale: 1, tilt: 0, headTilt: 5, look: -15, armL: { a: 4, b: 8 }, armR: { a: 90, b: 60 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 83, p: { x: 760, y: 736, scale: 1, tilt: 0, headTilt: 6, look: -15, armL: { a: 4, b: 8 }, armR: { a: 120, b: 25 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'determined']]);
  const hero0 = <Hero look={LOOKS.hero} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 720], [len, 720]]);
  const camY = kf(t, [[0, 560], [len, 560]]);
  const zoom = kf(t, [[0, 2.6335051546391752], [len, 2.783505154639175]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cave t={t + 5146} id="s139" />
        <Prop kind="calendar" x={918.9} y={552} s={1} t={t} extra={{"label": "25 DAYS"}} />
        {hero0}
      </g>
      <DayChip t={t} day="DAY 30" />
      <text x={350} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#A9C6FF">25 DAYS LOST</text>
    </g>
  );
};

// ---------- S140: low angle, cell — Day Thirty: The Door Opens (DAY 30) ----------
export const S140: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 900, y: 736, scale: 1, tilt: 6, headTilt: 0, look: 0, armL: { a: 20, b: 8 }, armR: { a: 20, b: 8 }, legL: { a: 12, b: -15 }, legR: { a: -8, b: -3 } } },
    { f: 16, p: { x: 940, y: 732, scale: 1, tilt: 6, headTilt: 0, look: 0, armL: { a: -20, b: 8 }, armR: { a: -20, b: 8 }, legL: { a: -8, b: -3 }, legR: { a: 12, b: -15 } } },
    { f: 33, p: { x: 980, y: 736, scale: 1, tilt: 6, headTilt: 0, look: 0, armL: { a: 20, b: 8 }, armR: { a: 20, b: 8 }, legL: { a: 12, b: -15 }, legR: { a: -8, b: -3 } } },
    { f: 50, p: { x: 1020, y: 732, scale: 1, tilt: 6, headTilt: 0, look: 0, armL: { a: -20, b: 8 }, armR: { a: -20, b: 8 }, legL: { a: -8, b: -3 }, legR: { a: 12, b: -15 } } },
    { f: 74, p: { x: 1020, y: 736, scale: 1, tilt: 0, headTilt: 7, look: 10, armL: { a: 4, b: 8 }, armR: { a: 140, b: 20 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 99, p: { x: 1020, y: 736, scale: 1, tilt: 0, headTilt: 5, look: -8, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'determined']]);
  const hero0 = <Hero look={LOOKS.hero} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 980], [len, 980]]);
  const camY = kf(t, [[0, 676], [len, 676]]);
  const zoom = kf(t, [[0, 1.6], [len, 1.68]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 5183} id="s140" veil={0.44} day={30} />
        {hero0}
      </g>
      <DayChip t={t} day="DAY 30" />
      <text x={960} y={150} textAnchor="middle" fontFamily={FONT.hand} fontSize={44} fill="#F6EFE3">WEEK 1 · WEEK 2</text>
      <text x={1500} y={650} textAnchor="middle" fontFamily={FONT.hand} fontSize={44} fill="#F6EFE3">WEEK 3 · WEEK 4</text>
      <text x={960} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#F6EFE3">A MONTH OF FOUR WALLS</text>
    </g>
  );
};

// ---------- S141: medium, cell — Day Thirty: The Door Opens (DAY 30) ----------
export const S141: React.FC<ShotProps> = ({ t, len }) => {
  // Nov 14 (same head-scratch fix as S13 — the line repeats here, "same as day one"): right arm raises to the head at f=26 and HOLDS (0 reversals). Same angles as S13.
  const p0 = poseAt(t, [
    { f: 0, p: { x: 900, y: 725, scale: 1, tilt: 10, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 26, p: { x: 900, y: 725, scale: 1, tilt: 10, headTilt: 6, look: 0, armL: { a: 4, b: 8 }, armR: { a: 114, b: 102 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 51, p: { x: 900, y: 736, scale: 1, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 114, b: 102 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 75, p: { x: 900, y: 736, scale: 1, tilt: 0, headTilt: -8, look: 0, armL: { a: 4, b: 8 }, armR: { a: 114, b: 102 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 103, p: { x: 900, y: 736, scale: 1, tilt: 0, headTilt: -8, look: 0, armL: { a: 4, b: 8 }, armR: { a: 114, b: 102 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'puzzled']]);
  const hero0 = <Hero look={LOOKS.detective} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 700], [len, 700]]);
  const camY = kf(t, [[0, 676], [len, 676]]);
  const zoom = kf(t, [[0, 1.8], [len, 1.9]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 5220} id="s141" veil={0.44} day={30} />
        <Prop kind="question_mark" x={1114.3} y={587.8} s={1} t={t} extra={{}} />
        {hero0}
      </g>
      <DayChip t={t} day="DAY 30" />
      <text x={960} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#F6EFE3">SAME AS DAY ONE</text>
    </g>
  );
};

// ---------- S142: wide, cell — Day Thirty: The Door Opens (DAY 30) ----------
export const S142: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 960, y: 736, scale: 1, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 17, p: { x: 960, y: 736, scale: 1, tilt: 0, headTilt: 6, look: 10, armL: { a: 4, b: 8 }, armR: { a: 120, b: 25 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 38, p: { x: 960, y: 736, scale: 1, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 54, p: { x: 960, y: 736, scale: 1, tilt: 10, headTilt: 4, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 75, p: { x: 960, y: 736, scale: 1, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 92, p: { x: 960, y: 736, scale: 1, tilt: 0, headTilt: 7, look: 12, armL: { a: 4, b: 8 }, armR: { a: 140, b: 20 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 112, p: { x: 960, y: 736, scale: 1, tilt: 0, headTilt: 7, look: 12, armL: { a: 4, b: 8 }, armR: { a: 140, b: 20 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'puzzled']]);
  const hero0 = <Hero look={LOOKS.detective} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 960], [len, 960]]);
  const camY = kf(t, [[0, 560], [len, 560]]);
  const zoom = kf(t, [[0, 1.0], [len, 1.06]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 5257} id="s142" veil={0.28} day={30} />
        <Prop kind="question_mark" x={960} y={260} s={0.9} t={t} extra={{}} />
        {hero0}
      </g>
      <DayChip t={t} day="DAY 30" />
    </g>
  );
};

// ---------- S143: over-the-shoulder, cell (door) — Day Thirty: The Door Opens (DAY 30) ----------
export const S143: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 900, y: 736, scale: 1, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 25, p: { x: 906, y: 736, scale: 1, tilt: 0, headTilt: 5, look: -15, armL: { a: 4, b: 8 }, armR: { a: 90, b: 60 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 56, p: { x: 894, y: 732, scale: 1, tilt: 0, headTilt: 6, look: 0, armL: { a: 4, b: 8 }, armR: { a: 120, b: 25 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 85, p: { x: 906, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 10, armL: { a: 4, b: 8 }, armR: { a: 90, b: 60 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 113, p: { x: 894, y: 732, scale: 1, tilt: 0, headTilt: 6, look: -8, armL: { a: 4, b: 8 }, armR: { a: 120, b: 25 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'puzzled']]);
  const hero0 = <Hero look={LOOKS.hero} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 694], [len, 694]]);
  const camY = kf(t, [[0, 672], [len, 672]]);
  const zoom = kf(t, [[0, 1.8], [len, 1.9]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 5294} id="s143" veil={0.44} door day={30} />
        <Prop kind="door" x={1175} y={560} s={1} t={t} extra={{}} />
        {hero0}
      </g>
      <DayChip t={t} day="DAY 30" />
      <text x={960} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#A9C6FF"><tspan x={960} dy={0}>PART OF YOU WANTS</tspan><tspan x={960} dy={58}>TO GO BACK IN</tspan></text>
    </g>
  );
};

// ---------- S144: medium, cell — Day Thirty: The Door Opens (DAY 30) ----------
export const S144: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 900, y: 736, scale: 1, tilt: 6, headTilt: 0, look: 0, armL: { a: 20, b: 8 }, armR: { a: 20, b: 8 }, legL: { a: 12, b: -15 }, legR: { a: -8, b: -3 } } },
    { f: 14, p: { x: 930, y: 732, scale: 1, tilt: 6, headTilt: 0, look: 0, armL: { a: -20, b: 8 }, armR: { a: -20, b: 8 }, legL: { a: -8, b: -3 }, legR: { a: 12, b: -15 } } },
    { f: 28, p: { x: 960, y: 736, scale: 1, tilt: 6, headTilt: -6, look: 0, armL: { a: 20, b: 8 }, armR: { a: 20, b: 8 }, legL: { a: 12, b: -15 }, legR: { a: -8, b: -3 } } },
    { f: 41, p: { x: 990, y: 732, scale: 1, tilt: 6, headTilt: -6, look: 0, armL: { a: -20, b: 8 }, armR: { a: -20, b: 8 }, legL: { a: -8, b: -3 }, legR: { a: 12, b: -15 } } },
    { f: 55, p: { x: 1020, y: 736, scale: 1, tilt: 6, headTilt: 0, look: 0, armL: { a: 20, b: 8 }, armR: { a: 20, b: 8 }, legL: { a: 12, b: -15 }, legR: { a: -8, b: -3 } } },
    { f: 83, p: { x: 1020, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 110, p: { x: 1020, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: -4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'puzzled'], [55, 'smug']]);
  const hero0 = <Hero look={LOOKS.hero} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 760], [len, 760]]);
  const camY = kf(t, [[0, 676], [len, 676]]);
  const zoom = kf(t, [[0, 1.8], [len, 1.9]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 5331} id="s144" veil={0.44} day={30} />
        <Prop kind="door" x={1175} y={560} s={1} t={t} extra={{"ajar": true}} />
        {hero0}
      </g>
      <DayChip t={t} day="DAY 30" />
      <text x={960} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#A9C6FF">THE STRANGEST PART</text>
    </g>
  );
};

// ---------- S145: close-up, cell (wall) — What 30 Days Really Does (DAY 30) ----------
export const S145: React.FC<ShotProps> = ({ t, len }) => {
  const camX = kf(t, [[0, 960], [len, 960]]);
  const camY = kf(t, [[0, 480], [len, 480]]);
  const zoom = kf(t, [[0, 3.2], [len, 3.3000000000000003]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 5368} id="s145" veil={0.44} day={30} />
        <Prop kind="recap_board" x={960} y={480} s={1} t={t} extra={{"drift_x": 30}} />
      </g>
      <DayChip t={t} day="DAY 30" />
      <text x={960} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#A9C6FF">WHAT DID 30 DAYS DO?</text>
    </g>
  );
};

// ---------- S146: macro insert, cell (wall) — What 30 Days Really Does (DAY 30) ----------
export const S146: React.FC<ShotProps> = ({ t, len }) => {
  const camX = kf(t, [[0, 960], [len, 960]]);
  const camY = kf(t, [[0, 480], [len, 480]]);
  const zoom = kf(t, [[0, 2.4], [len, 2.5]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 5405} id="s146" veil={0.44} day={30} />
        <Prop kind="wall_clock" x={960} y={480} s={1.1} t={t} extra={{"broken": true, "drift_x": 20}} />
      </g>
      <DayChip t={t} day="DAY 30" />
      <text x={960} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#A9C6FF">THE CLOCK BROKE</text>
    </g>
  );
};

// ---------- S147: close-up, cell (bed) — What 30 Days Really Does (DAY 30) ----------
export const S147: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 470, y: 622, scale: 0.9, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 17, p: { x: 470, y: 614, scale: 0.9, tilt: 0, headTilt: -6, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 33, p: { x: 470, y: 626, scale: 0.9, tilt: 0, headTilt: 8, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 50, p: { x: 470, y: 614, scale: 0.9, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: -4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 67, p: { x: 470, y: 626, scale: 0.9, tilt: 0, headTilt: 8, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 82, p: { x: 470, y: 614, scale: 0.9, tilt: 0, headTilt: 7, look: 12, armL: { a: 4, b: 8 }, armR: { a: 140, b: 20 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 100, p: { x: 470, y: 626, scale: 0.9, tilt: 0, headTilt: -8, look: 12, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'sad']]);
  const hero0 = <Hero look={LOOKS.hero} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 470], [len, 470]]);
  const camY = kf(t, [[0, 455.6], [len, 455.6]]);
  const zoom = kf(t, [[0, 3.2], [len, 3.35]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 5442} id="s147" veil={0.44} bed day={30} />
        {hero0}
      </g>
      <DayChip t={t} day="DAY 30" />
      <text x={350} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#A9C6FF">SLEEP BROKE</text>
    </g>
  );
};

// ---------- S148: medium, cell — What 30 Days Really Does (DAY 30) ----------
export const S148: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 960, y: 736, scale: 1, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 15, p: { x: 966, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 33, p: { x: 954, y: 732, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: -4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 48, p: { x: 966, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 12, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 67, p: { x: 954, y: 732, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: -4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 82, p: { x: 966, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 12, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 100, p: { x: 954, y: 732, scale: 1, tilt: 0, headTilt: 5, look: 12, armL: { a: 4, b: 8 }, armR: { a: -4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'sad']]);
  const hero0 = <Hero look={LOOKS.hero} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 966], [len, 966]]);
  const camY = kf(t, [[0, 676], [len, 676]]);
  const zoom = kf(t, [[0, 1.8], [len, 1.9]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 5479} id="s148" veil={0.44} day={30} />
        <Prop kind="sound_waves" x={960} y={517.8} s={1} t={t} extra={{}} />
        {hero0}
      </g>
      <DayChip t={t} day="DAY 30" />
      <text x={960} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#A9C6FF">THE SILENCE GOT LOUD</text>
    </g>
  );
};

// ---------- S149: close-up, cell (wall) — What 30 Days Really Does (DAY 30) ----------
export const S149: React.FC<ShotProps> = ({ t, len }) => {
  const camX = kf(t, [[0, 960], [len, 960]]);
  const camY = kf(t, [[0, 500], [len, 500]]);
  const zoom = kf(t, [[0, 3.2], [len, 3.3000000000000003]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 5516} id="s149" veil={0.44} day={30} />
        {/* Nov 14 (Javion: "fix everything wrong" — same floating-mouth defect as S79, a callback shot the defect hunt didn't list. Mouth + sound waves REMOVED. The caption "THE VOICES MOVED IN" carries the beat. */}
      </g>
      <DayChip t={t} day="DAY 30" />
      <text x={960} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#A9C6FF">THE VOICES MOVED IN</text>
    </g>
  );
};

// ---------- S150: macro insert, cell (wall) — What 30 Days Really Does (DAY 30) ----------
export const S150: React.FC<ShotProps> = ({ t, len }) => {
  const camX = kf(t, [[0, 1154], [len, 1154]]);
  const camY = kf(t, [[0, 500], [len, 500]]);
  const zoom = kf(t, [[0, 2.4], [len, 2.5]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 5553} id="s150" veil={0.44} day={30} />
        <Prop kind="brain" x={961} y={500} s={1} t={t} extra={{"variant": "shrinking", "drift_x": -25}} />
        <Prop kind="photos" x={1230} y={520} s={0.7} t={t} extra={{"fade": true}} />
      </g>
      <DayChip t={t} day="DAY 30" />
      <text x={960} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#A9C6FF">THE BRAIN SHRANK</text>
    </g>
  );
};

// ---------- S151: close-up, cell (wall) — What 30 Days Really Does (DAY 30) ----------
export const S151: React.FC<ShotProps> = ({ t, len }) => {
  const camX = kf(t, [[0, 960], [len, 960]]);
  const camY = kf(t, [[0, 500], [len, 500]]);
  const zoom = kf(t, [[0, 3.2], [len, 3.3000000000000003]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 5590} id="s151" veil={0.44} day={30} />
        <Prop kind="brain" x={960} y={500} s={1} t={t} extra={{"variant": "shrinking"}} />
      </g>
      <DayChip t={t} day="DAY 30" />
      <text x={960} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#A9C6FF">THE BRAIN SHRANK</text>
    </g>
  );
};

// ---------- S152: two-shot, antarctic — What 30 Days Really Does (DAY 30) ----------
export const S152: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 330, y: 808, scale: 0.4, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 11, p: { x: 336, y: 808, scale: 0.4, tilt: 0, headTilt: 7, look: 10, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 22, p: { x: 324, y: 804, scale: 0.4, tilt: 0, headTilt: -8, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 30, p: { x: 336, y: 808, scale: 0.4, tilt: 0, headTilt: 7, look: 8, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 38, p: { x: 324, y: 804, scale: 0.4, tilt: 0, headTilt: -8, look: -6, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 43, p: { x: 336, y: 808, scale: 0.4, tilt: 0, headTilt: 7, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 53, p: { x: 324, y: 804, scale: 0.4, tilt: 0, headTilt: -8, look: 12, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 64, p: { x: 336, y: 808, scale: 0.4, tilt: 0, headTilt: 7, look: 12, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'sad']]);
  const hero0 = <Hero look={LOOKS.researcher} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const p1 = poseAt(t, [
    { f: 0, p: { x: 487.5, y: 808, scale: 0.392, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 11, p: { x: 493.5, y: 808, scale: 0.392, tilt: 0, headTilt: 12, look: 10, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 22, p: { x: 481.5, y: 804, scale: 0.392, tilt: 0, headTilt: -3, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 32, p: { x: 493.5, y: 808, scale: 0.392, tilt: 0, headTilt: 12, look: 10, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 43, p: { x: 481.5, y: 804, scale: 0.392, tilt: 0, headTilt: -3, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 53, p: { x: 493.5, y: 808, scale: 0.392, tilt: 0, headTilt: 12, look: 12, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 64, p: { x: 481.5, y: 804, scale: 0.392, tilt: 0, headTilt: -3, look: 12, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f1 = faceAt(t, [[0, 'sad']]);
  const hero1 = <Hero look={{...LOOKS.researcher, hair: 'crop', hairC: '#2A1E14', jacket: '#3E8C86', jacketShade: '#2F6E69', accent: '#2F6E69'}} pose={{ ...p1, ...f1, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const p2 = poseAt(t, [
    { f: 0, p: { x: 645, y: 808, scale: 0.408, tilt: 0, headTilt: -5, look: 0, armL: { a: 30, b: 15 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 11, p: { x: 651, y: 808, scale: 0.408, tilt: 0, headTilt: 2, look: 10, armL: { a: 30, b: 15 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 22, p: { x: 639, y: 804, scale: 0.408, tilt: 0, headTilt: -12, look: 0, armL: { a: 30, b: 15 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 30, p: { x: 651, y: 808, scale: 0.408, tilt: 0, headTilt: 2, look: 8, armL: { a: 30, b: 15 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 38, p: { x: 639, y: 804, scale: 0.408, tilt: 0, headTilt: -12, look: -6, armL: { a: 30, b: 15 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 43, p: { x: 651, y: 808, scale: 0.408, tilt: 0, headTilt: 2, look: 0, armL: { a: 30, b: 15 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 53, p: { x: 639, y: 804, scale: 0.408, tilt: 0, headTilt: -12, look: 12, armL: { a: 30, b: 15 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 64, p: { x: 651, y: 808, scale: 0.408, tilt: 0, headTilt: 2, look: 12, armL: { a: 30, b: 15 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f2 = faceAt(t, [[0, 'sad']]);
  const hero2 = <Hero look={{...LOOKS.researcher, hair: 'sidepart', hairC: '#5A3A28', jacket: '#D9A441', jacketShade: '#AD8334', accent: '#AD8334'}} pose={{ ...p2, ...f2, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const p3 = poseAt(t, [
    { f: 0, p: { x: 802.5, y: 808, scale: 0.396, tilt: 0, headTilt: 8, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 11, p: { x: 808.5, y: 808, scale: 0.396, tilt: 0, headTilt: 12, look: 10, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 22, p: { x: 796.5, y: 804, scale: 0.396, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 32, p: { x: 808.5, y: 808, scale: 0.396, tilt: 0, headTilt: 12, look: 10, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 43, p: { x: 796.5, y: 804, scale: 0.396, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 53, p: { x: 808.5, y: 808, scale: 0.396, tilt: 0, headTilt: 12, look: 12, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 64, p: { x: 796.5, y: 804, scale: 0.396, tilt: 0, headTilt: 0, look: 12, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f3 = faceAt(t, [[0, 'sad']]);
  const hero3 = <Hero look={{...LOOKS.researcher, hair: 'afro', hairC: '#241A12', jacket: '#9B7BB8', jacketShade: '#7C6394', accent: '#7C6394'}} pose={{ ...p3, ...f3, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const p4 = poseAt(t, [
    { f: 0, p: { x: 960, y: 808, scale: 0.404, tilt: 0, headTilt: -8, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 11, p: { x: 966, y: 808, scale: 0.404, tilt: 0, headTilt: -1, look: 10, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 22, p: { x: 954, y: 804, scale: 0.404, tilt: 0, headTilt: -12, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 30, p: { x: 966, y: 808, scale: 0.404, tilt: 0, headTilt: -1, look: 8, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 38, p: { x: 954, y: 804, scale: 0.404, tilt: 0, headTilt: -12, look: -6, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 43, p: { x: 966, y: 808, scale: 0.404, tilt: 0, headTilt: -1, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 53, p: { x: 954, y: 804, scale: 0.404, tilt: 0, headTilt: -12, look: 12, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 64, p: { x: 966, y: 808, scale: 0.404, tilt: 0, headTilt: -1, look: 12, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f4 = faceAt(t, [[0, 'sad']]);
  const hero4 = <Hero look={{...LOOKS.researcher, hair: 'ponytail', hairC: '#6A4A2E', jacket: '#4A7AA0', jacketShade: '#3A5E80', accent: '#3A5E80'}} pose={{ ...p4, ...f4, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const p5 = poseAt(t, [
    { f: 0, p: { x: 1117.5, y: 808, scale: 0.392, tilt: 0, headTilt: 3, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 11, p: { x: 1123.5, y: 808, scale: 0.392, tilt: 0, headTilt: 10, look: 10, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 22, p: { x: 1111.5, y: 804, scale: 0.392, tilt: 0, headTilt: -5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 32, p: { x: 1123.5, y: 808, scale: 0.392, tilt: 0, headTilt: 10, look: 10, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 43, p: { x: 1111.5, y: 804, scale: 0.392, tilt: 0, headTilt: -5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 53, p: { x: 1123.5, y: 808, scale: 0.392, tilt: 0, headTilt: 10, look: 12, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 64, p: { x: 1111.5, y: 804, scale: 0.392, tilt: 0, headTilt: -5, look: 12, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f5 = faceAt(t, [[0, 'sad']]);
  const hero5 = <Hero look={{...LOOKS.researcher, hair: 'curly', hairC: '#3A2420', jacket: '#6A9A5A', jacketShade: '#527A46', accent: '#527A46'}} pose={{ ...p5, ...f5, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const p6 = poseAt(t, [
    { f: 0, p: { x: 1275, y: 808, scale: 0.408, tilt: 0, headTilt: -3, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 11, p: { x: 1281, y: 808, scale: 0.408, tilt: 0, headTilt: 4, look: 10, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 22, p: { x: 1269, y: 804, scale: 0.408, tilt: 0, headTilt: -11, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 30, p: { x: 1281, y: 808, scale: 0.408, tilt: 0, headTilt: 4, look: 8, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 38, p: { x: 1269, y: 804, scale: 0.408, tilt: 0, headTilt: -11, look: -6, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 43, p: { x: 1281, y: 808, scale: 0.408, tilt: 0, headTilt: 4, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 53, p: { x: 1269, y: 804, scale: 0.408, tilt: 0, headTilt: -11, look: 12, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 64, p: { x: 1281, y: 808, scale: 0.408, tilt: 0, headTilt: 4, look: 12, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f6 = faceAt(t, [[0, 'sad']]);
  const hero6 = <Hero look={{...LOOKS.researcher, hair: 'bun', hairC: '#8A5A3A', jacket: '#D98A3A', jacketShade: '#AD6E2E', accent: '#AD6E2E'}} pose={{ ...p6, ...f6, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const p7 = poseAt(t, [
    { f: 0, p: { x: 1432.5, y: 808, scale: 0.396, tilt: 0, headTilt: 6, look: 0, armL: { a: 20, b: 10 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 11, p: { x: 1438.5, y: 808, scale: 0.396, tilt: 0, headTilt: 12, look: 10, armL: { a: 20, b: 10 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 22, p: { x: 1426.5, y: 804, scale: 0.396, tilt: 0, headTilt: -2, look: 0, armL: { a: 20, b: 10 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 32, p: { x: 1438.5, y: 808, scale: 0.396, tilt: 0, headTilt: 12, look: 10, armL: { a: 20, b: 10 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 43, p: { x: 1426.5, y: 804, scale: 0.396, tilt: 0, headTilt: -2, look: 0, armL: { a: 20, b: 10 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 53, p: { x: 1438.5, y: 808, scale: 0.396, tilt: 0, headTilt: 12, look: 12, armL: { a: 20, b: 10 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 64, p: { x: 1426.5, y: 804, scale: 0.396, tilt: 0, headTilt: -2, look: 12, armL: { a: 20, b: 10 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f7 = faceAt(t, [[0, 'sad']]);
  const hero7 = <Hero look={{...LOOKS.researcher, hair: 'crop', hairC: '#3A2A1A', jacket: '#3A4A6A', jacketShade: '#2E3A54', accent: '#2E3A54'}} pose={{ ...p7, ...f7, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const p8 = poseAt(t, [
    { f: 0, p: { x: 1590, y: 808, scale: 0.404, tilt: 0, headTilt: -6, look: 0, armL: { a: 4, b: 8 }, armR: { a: 30, b: 10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 11, p: { x: 1596, y: 808, scale: 0.404, tilt: 0, headTilt: 1, look: 10, armL: { a: 4, b: 8 }, armR: { a: 30, b: 10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 22, p: { x: 1584, y: 804, scale: 0.404, tilt: 0, headTilt: -12, look: 0, armL: { a: 4, b: 8 }, armR: { a: 30, b: 10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 30, p: { x: 1596, y: 808, scale: 0.404, tilt: 0, headTilt: 1, look: 8, armL: { a: 4, b: 8 }, armR: { a: 30, b: 10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 38, p: { x: 1584, y: 804, scale: 0.404, tilt: 0, headTilt: -12, look: -6, armL: { a: 4, b: 8 }, armR: { a: 30, b: 10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 43, p: { x: 1596, y: 808, scale: 0.404, tilt: 0, headTilt: 1, look: 0, armL: { a: 4, b: 8 }, armR: { a: 30, b: 10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 53, p: { x: 1584, y: 804, scale: 0.404, tilt: 0, headTilt: -12, look: 12, armL: { a: 4, b: 8 }, armR: { a: 30, b: 10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 64, p: { x: 1596, y: 808, scale: 0.404, tilt: 0, headTilt: 1, look: 12, armL: { a: 4, b: 8 }, armR: { a: 30, b: 10 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f8 = faceAt(t, [[0, 'sad']]);
  const hero8 = <Hero look={{...LOOKS.researcher, hair: 'ponytail', hairC: '#2A1E14', jacket: '#8A8A4A', jacketShade: '#6E6E3A', accent: '#6E6E3A'}} pose={{ ...p8, ...f8, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 966], [len, 966]]);
  const camY = kf(t, [[0, 580], [len, 580]]);
  const zoom = kf(t, [[0, 1.35], [len, 1.4]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Antarctic t={t + 5627} id="s152" />
        <Prop kind="brain" x={1350} y={320} s={0.6} t={t} extra={{"variant": "shrinking"}} />
        {hero0}
        {hero1}
        {hero2}
        {hero3}
        {hero4}
        {hero5}
        {hero6}
        {hero7}
        {hero8}
      </g>
      <DayChip t={t} day="DAY 30" />
      <text x={960} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#A9C6FF">NINE PEOPLE</text>
    </g>
  );
};

// ---------- S153: high angle, cell — What 30 Days Really Does (DAY 30) ----------
export const S153: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 900, y: 736, scale: 1, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 28, p: { x: 906, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 10, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 55, p: { x: 894, y: 732, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: -4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 83, p: { x: 906, y: 736, scale: 1, tilt: -3, headTilt: -10, look: 8, armL: { a: 50, b: 70 }, armR: { a: 50, b: 70 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 110, p: { x: 894, y: 732, scale: 1, tilt: 0, headTilt: 5, look: -6, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'smug']]);
  const hero0 = <Hero look={LOOKS.detective} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const p1 = poseAt(t, [
    { f: 0, p: { x: 1250, y: 736, scale: 1, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 28, p: { x: 1256, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 10, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 55, p: { x: 1244, y: 732, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: -4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 80, p: { x: 1256, y: 736, scale: 1, tilt: -3, headTilt: -10, look: 12, armL: { a: 50, b: 70 }, armR: { a: 50, b: 70 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 110, p: { x: 1244, y: 732, scale: 1, tilt: 0, headTilt: 5, look: 12, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f1 = faceAt(t, [[0, 'puzzled']]);
  const hero1 = <Hero look={LOOKS.hero} pose={{ ...p1, ...f1, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 960], [len, 960]]);
  const camY = kf(t, [[0, 560], [len, 560]]);
  const zoom = kf(t, [[0, 1.25], [len, 1.3]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 5664} id="s153" veil={0.44} day={30} />
        {hero0}
        {hero1}
      </g>
      <DayChip t={t} day="DAY 30" />
      <text x={960} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#F6EFE3"><tspan x={960} dy={0}>YOU HAD A DETECTIVE</tspan><tspan x={960} dy={58}>AND A WALL</tspan></text>
    </g>
  );
};

// ---------- S154: medium, cell (door) — What 30 Days Really Does (DAY 30) ----------
export const S154: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 900, y: 736, scale: 1, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 18, p: { x: 906, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 90, b: 60 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 39, p: { x: 894, y: 732, scale: 1, tilt: 0, headTilt: 6, look: 0, armL: { a: 4, b: 8 }, armR: { a: 120, b: 25 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 57, p: { x: 906, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 12, armL: { a: 4, b: 8 }, armR: { a: 90, b: 60 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 78, p: { x: 894, y: 732, scale: 1, tilt: 0, headTilt: 6, look: 12, armL: { a: 4, b: 8 }, armR: { a: 120, b: 25 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'puzzled']]);
  const hero0 = <Hero look={LOOKS.hero} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 614], [len, 614]]);
  const camY = kf(t, [[0, 672], [len, 672]]);
  const zoom = kf(t, [[0, 1.8], [len, 1.9]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 5701} id="s154" veil={0.44} door day={30} />
        {hero0}
      </g>
      <DayChip t={t} day="DAY 30" />
      <text x={960} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#A9C6FF">WHICH DAY WOULD BREAK YOU?</text>
    </g>
  );
};

// ---------- S155: close-up, cell (wall) — What 30 Days Really Does (DAY 30) ----------
export const S155: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 620, y: 736, scale: 1, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 33, p: { x: 626, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 10, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 66, p: { x: 614, y: 732, scale: 1, tilt: 0, headTilt: 7, look: -10, armL: { a: 4, b: 8 }, armR: { a: 140, b: 20 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 98, p: { x: 626, y: 736, scale: 1, tilt: 0, headTilt: -8, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'puzzled']]);
  const hero0 = <Hero look={LOOKS.hero} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 626], [len, 626]]);
  const camY = kf(t, [[0, 560], [len, 560]]);
  const zoom = kf(t, [[0, 3.2], [len, 3.35]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 5738} id="s155" veil={0.44} day={30} />
        <Prop kind="comment_box" x={750.6} y={513.8} s={0.9} t={t} extra={{"drift_x": 20}} />
        {hero0}
      </g>
      <DayChip t={t} day="DAY 30" />
      <text x={350} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={48} fill="#A9C6FF">TELL ME IN THE COMMENTS</text>
    </g>
  );
};

// ---------- S156: low angle, classroom — What 30 Days Really Does (DAY 30) ----------
export const S156: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 1300, y: 756, scale: 1, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 35, p: { x: 1306, y: 756, scale: 1, tilt: 0, headTilt: 5, look: 10, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 70, p: { x: 1294, y: 752, scale: 1, tilt: 0, headTilt: 5, look: -10, armL: { a: 4, b: 8 }, armR: { a: -4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 106, p: { x: 1306, y: 756, scale: 1, tilt: 0, headTilt: 5, look: 10, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'puzzled'], [70, 'smug']]);
  const hero0 = <Hero look={LOOKS.teacher} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 1306], [len, 1306]]);
  const camY = kf(t, [[0, 696], [len, 696]]);
  const zoom = kf(t, [[0, 1.6], [len, 1.68]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Classroom t={t + 5775} id="s156" />
        <Prop kind="door" x={1434} y={612} s={0.6} t={t} extra={{"open_": true}} />
        {hero0}
      </g>
      <DayChip t={t} day="DAY 30" />
      <text x={960} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#A9C6FF">NEXT WEDNESDAY IS STRANGER</text>
    </g>
  );
};

// ---------- S157: medium, classroom — What 30 Days Really Does (DAY 30) ----------
export const S157: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 620, y: 756, scale: 1, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 27, p: { x: 626, y: 756, scale: 1, tilt: 0, headTilt: 7, look: 10, armL: { a: 4, b: 8 }, armR: { a: 140, b: 20 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 61, p: { x: 614, y: 752, scale: 1, tilt: 0, headTilt: -8, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 89, p: { x: 626, y: 756, scale: 1, tilt: 0, headTilt: 7, look: 10, armL: { a: 4, b: 8 }, armR: { a: 140, b: 20 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 122, p: { x: 614, y: 752, scale: 1, tilt: 0, headTilt: -8, look: 10, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'smug']]);
  const hero0 = <Hero look={LOOKS.teacher} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const p1 = poseAt(t, [
    { f: 0, p: { x: 1350, y: 766, scale: 0.8, tilt: -8, headTilt: -10, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 31, p: { x: 1356, y: 766, scale: 0.8, tilt: 0, headTilt: 7, look: 0, armL: { a: 4, b: 8 }, armR: { a: 140, b: 20 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 61, p: { x: 1344, y: 762, scale: 0.8, tilt: 0, headTilt: -8, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 89, p: { x: 1356, y: 766, scale: 0.8, tilt: 0, headTilt: 7, look: 12, armL: { a: 4, b: 8 }, armR: { a: 140, b: 20 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 122, p: { x: 1344, y: 762, scale: 0.8, tilt: 0, headTilt: -8, look: 12, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f1 = faceAt(t, [[0, 'smug']]);
  const hero1 = <Hero look={LOOKS.hero} pose={{ ...p1, ...f1, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const camX = kf(t, [[0, 614], [len, 614]]);
  const camY = kf(t, [[0, 692], [len, 692]]);
  const zoom = kf(t, [[0, 1.8], [len, 1.9]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Classroom t={t + 5812} id="s157" />
        <Prop kind="stamp" x={960} y={522.8} s={0.9} t={t} extra={{}} />
        {hero0}
        {hero1}
      </g>
      <DayChip t={t} day="DAY 30" />
      <text x={960} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#A9C6FF"><tspan x={960} dy={0}>YOUR TEACHER</tspan><tspan x={960} dy={58}>ALREADY DECIDED</tspan></text>
    </g>
  );
};

// ---------- S158: wide, cell — What 30 Days Really Does (DAY 30) ----------
export const S158: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: { x: 200, y: 736, scale: 1, tilt: 6, headTilt: 0, look: 0, armL: { a: 20, b: 8 }, armR: { a: 20, b: 8 }, legL: { a: 12, b: -15 }, legR: { a: -8, b: -3 } } },
    { f: 17, p: { x: 240, y: 732, scale: 1, tilt: 6, headTilt: 0, look: 0, armL: { a: -20, b: 8 }, armR: { a: -20, b: 8 }, legL: { a: -8, b: -3 }, legR: { a: 12, b: -15 } } },
    { f: 34, p: { x: 280, y: 736, scale: 1, tilt: 6, headTilt: 0, look: 0, armL: { a: 20, b: 8 }, armR: { a: 20, b: 8 }, legL: { a: 12, b: -15 }, legR: { a: -8, b: -3 } } },
    { f: 51, p: { x: 320, y: 732, scale: 1, tilt: 6, headTilt: 0, look: 0, armL: { a: -20, b: 8 }, armR: { a: -20, b: 8 }, legL: { a: -8, b: -3 }, legR: { a: 12, b: -15 } } },
    { f: 74, p: { x: 320, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 102, p: { x: 320, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 0, armL: { a: 4, b: 8 }, armR: { a: -4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f0 = faceAt(t, [[0, 'smug']]);
  const hero0 = <Hero look={LOOKS.hero} pose={{ ...p0, ...f0, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const p1 = poseAt(t, [
    { f: 0, p: { x: 960, y: 736, scale: 1, tilt: 0, headTilt: 0, look: 0, armL: { a: 4, b: 8 }, armR: { a: 4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 34, p: { x: 966, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 10, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 68, p: { x: 954, y: 732, scale: 1, tilt: 0, headTilt: 5, look: -10, armL: { a: 4, b: 8 }, armR: { a: -4, b: 8 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
    { f: 102, p: { x: 966, y: 736, scale: 1, tilt: 0, headTilt: 5, look: 10, armL: { a: 4, b: 8 }, armR: { a: 60, b: 30 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 } } },
  ]);
  const f1 = faceAt(t, [[0, 'smug']]);
  const hero1 = <Hero look={LOOKS.detective} pose={{ ...p1, ...f1, facing: 1 }} rimId="rimBlue" shadow={1} />;
  const mg = toWorld(p1, joints(p1).armR.end);
  const camX = kf(t, [[0, 960], [len, 960]]);
  const camY = kf(t, [[0, 560], [len, 560]]);
  const zoom = kf(t, [[0, 1.0], [len, 1.06]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <Cell t={t + 5849} id="s158" veil={0.28} door day={30} mattress={false} />
        {hero0}
        {hero1}
        <Magnifier x={mg.x} y={mg.y} s={1} />
      </g>
      <DayChip t={t} day="DAY 30" />
      <text x={960} y={985} textAnchor="middle" fontFamily={FONT.hand} fontSize={56} fill="#F6EFE3">LINKED ON SCREEN</text>
    </g>
  );
};

// ---------- S159: wide, endcard — Ch9 What 30 Days Really Does ----------
export const S159: React.FC<ShotProps> = ({ t, len }) => {
  const camX = kf(t, [[0, 960], [len, 960]]);
  const camY = kf(t, [[0, 540], [len, 540]]);
  const zoom = kf(t, [[0, 1.0], [len, 1.06]]);
  return (
    <g>
      <g transform={camT(camX, camY, zoom)}>
        <EndCard />
      </g>
    </g>
  );
};
